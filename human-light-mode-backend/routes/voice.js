const express = require('express');
const multer = require('multer');
const router = express.Router();
const { authenticateUser } = require('../auth');
const database = require('../database');
const openaiService = require('../openaiService');
const elevenLabsService = require('../elevenLabsService');

// Configure multer for audio file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 25 * 1024 * 1024, // 25MB limit (Whisper API limit)
    },
    fileFilter: (req, file, cb) => {
        // Accept audio files
        const allowedMimes = [
            'audio/wav',
            'audio/mpeg',
            'audio/mp3',
            'audio/mp4',
            'audio/m4a',
            'audio/webm',
            'audio/ogg',
            'audio/flac'
        ];
        
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Please upload an audio file.'), false);
        }
    }
});

// Transcribe audio file
router.post('/transcribe', authenticateUser, upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Audio file is required' });
        }

        // Get user's OpenAI API key
        const userSettings = await database.getUserSettings(req.userId);
        const userApiKey = userSettings?.openai_api_key;

        const options = {
            language: req.body.language || undefined, // Auto-detect if not specified
            responseFormat: 'text',
            temperature: 0
        };

        try {
            // Transcribe audio using Whisper
            const transcription = await openaiService.transcribeAudio(
                req.file.buffer, 
                userApiKey, 
                options
            );

            res.json({
                transcription: transcription,
                success: true
            });

        } catch (transcriptionError) {
            console.error('Transcription error:', transcriptionError);
            res.status(400).json({
                error: transcriptionError.message,
                success: false
            });
        }

    } catch (error) {
        console.error('Error in transcription endpoint:', error);
        res.status(500).json({ error: 'Failed to transcribe audio' });
    }
});

// Transcribe and send to conversation (voice message)
router.post('/transcribe-and-send/:conversationId', authenticateUser, upload.single('audio'), async (req, res) => {
    try {
        const { conversationId } = req.params;

        if (!req.file) {
            return res.status(400).json({ error: 'Audio file is required' });
        }

        // Verify user has access to this conversation
        const hasAccess = await database.verifyUserAccess(req.userId, conversationId);
        if (!hasAccess) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Get user's OpenAI API key
        const userSettings = await database.getUserSettings(req.userId);
        const userApiKey = userSettings?.openai_api_key;

        const transcriptionOptions = {
            language: req.body.language || undefined,
            responseFormat: 'text',
            temperature: 0
        };

        try {
            // Transcribe audio using Whisper
            const transcription = await openaiService.transcribeAudio(
                req.file.buffer, 
                userApiKey, 
                transcriptionOptions
            );

            // Save user message (voice type)
            const userMessage = await database.addMessage(
                conversationId, 
                'user', 
                transcription, 
                'voice'
            );

            // Get conversation history for context
            const messages = await database.getConversationMessages(conversationId);
            
            // Format messages for OpenAI API
            const apiMessages = [
                openaiService.createSystemMessage(),
                ...openaiService.formatMessagesForAPI(messages)
            ];

            try {
                // Generate AI response
                const completion = await openaiService.generateResponse(apiMessages, userApiKey);
                const aiResponse = completion.choices[0].message.content;

                // Save AI response
                const aiMessage = await database.addMessage(conversationId, 'ai', aiResponse);

                res.json({
                    transcription: transcription,
                    userMessage,
                    aiMessage,
                    success: true
                });

            } catch (aiError) {
                console.error('AI generation error after transcription:', aiError);
                
                // Save error message as AI response
                const errorMessage = `I transcribed your voice message: "${transcription}"\n\nHowever, I encountered an error generating a response: ${aiError.message}`;
                const aiMessage = await database.addMessage(conversationId, 'ai', errorMessage);

                res.json({
                    transcription: transcription,
                    userMessage,
                    aiMessage,
                    success: false,
                    error: aiError.message
                });
            }

        } catch (transcriptionError) {
            console.error('Transcription error:', transcriptionError);
            res.status(400).json({
                error: transcriptionError.message,
                success: false
            });
        }

    } catch (error) {
        console.error('Error in transcribe-and-send endpoint:', error);
        res.status(500).json({ error: 'Failed to process voice message' });
    }
});

// Generate speech from text using ElevenLabs (Enhanced TTS)
router.post('/generate-speech', authenticateUser, async (req, res) => {
    try {
        const { text, voiceId = '21m00Tcm4TlvDq8ikWAM', useElevenLabs = true } = req.body;

        if (!text || text.trim().length === 0) {
            return res.status(400).json({ error: 'Text is required' });
        }

        if (text.length > 5000) {
            return res.status(400).json({ error: 'Text is too long. Maximum 5000 characters for ElevenLabs.' });
        }

        try {
            let audioResponse;
            
            if (useElevenLabs) {
                // Get user's ElevenLabs API key
                const userSettings = await database.getUserSettings(req.userId);
                const userApiKey = userSettings?.elevenlabs_api_key;

                if (!userApiKey) {
                    return res.status(400).json({ 
                        error: 'ElevenLabs API key not configured. Please add your API key in settings.' 
                    });
                }

                // Generate speech using ElevenLabs
                audioResponse = await elevenLabsService.generateSpeech(text, userApiKey, {
                    voiceId: voiceId
                });

                // Set appropriate headers for audio response
                res.set({
                    'Content-Type': 'audio/mpeg',
                    'Content-Disposition': 'attachment; filename="elevenlabs-speech.mp3"'
                });

                // Send the audio buffer
                res.send(audioResponse);
            } else {
                // Fallback to OpenAI TTS
                const userSettings = await database.getUserSettings(req.userId);
                const userApiKey = userSettings?.openai_api_key;

                if (!userApiKey) {
                    return res.status(400).json({ 
                        error: 'OpenAI API key not configured. Please add your API key in settings.' 
                    });
                }

                const options = {
                    voice: 'alloy',
                    responseFormat: 'mp3'
                };

                audioResponse = await openaiService.generateSpeech(text, userApiKey, options);
                
                // Set appropriate headers for audio response
                res.set({
                    'Content-Type': 'audio/mpeg',
                    'Content-Disposition': 'attachment; filename="openai-speech.mp3"'
                });

                // Stream the audio response
                audioResponse.body.pipe(res);
                return;
            }

        } catch (speechError) {
            console.error('Speech generation error:', speechError);
            res.status(400).json({
                error: speechError.message,
                success: false
            });
        }

    } catch (error) {
        console.error('Error in generate-speech endpoint:', error);
        res.status(500).json({ error: 'Failed to generate speech' });
    }
});

// Get supported languages for transcription
router.get('/languages', (req, res) => {
    const supportedLanguages = [
        { code: 'auto', name: 'Auto-detect' },
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'it', name: 'Italian' },
        { code: 'pt', name: 'Portuguese' },
        { code: 'ru', name: 'Russian' },
        { code: 'ja', name: 'Japanese' },
        { code: 'ko', name: 'Korean' },
        { code: 'zh', name: 'Chinese' },
        { code: 'ar', name: 'Arabic' },
        { code: 'hi', name: 'Hindi' },
        { code: 'nl', name: 'Dutch' },
        { code: 'sv', name: 'Swedish' },
        { code: 'no', name: 'Norwegian' },
        { code: 'da', name: 'Danish' },
        { code: 'fi', name: 'Finnish' },
        { code: 'pl', name: 'Polish' },
        { code: 'tr', name: 'Turkish' }
    ];

    res.json({ languages: supportedLanguages });
});

// Get supported voices for text-to-speech
router.get('/voices', async (req, res) => {
    try {
        // Get user's ElevenLabs API key
        const userSettings = await database.getUserSettings(req.userId);
        const userApiKey = userSettings?.elevenlabs_api_key;

        if (userApiKey) {
            try {
                // Get ElevenLabs voices
                const elevenLabsVoices = await elevenLabsService.getVoices(userApiKey);
                
                // Add OpenAI voices as fallback
                const openaiVoices = [
                    { id: 'alloy', name: 'Alloy (OpenAI)', description: 'Neutral, balanced voice', provider: 'openai' },
                    { id: 'echo', name: 'Echo (OpenAI)', description: 'Clear, professional voice', provider: 'openai' },
                    { id: 'fable', name: 'Fable (OpenAI)', description: 'Warm, storytelling voice', provider: 'openai' },
                    { id: 'onyx', name: 'Onyx (OpenAI)', description: 'Deep, authoritative voice', provider: 'openai' },
                    { id: 'nova', name: 'Nova (OpenAI)', description: 'Bright, energetic voice', provider: 'openai' },
                    { id: 'shimmer', name: 'Shimmer (OpenAI)', description: 'Gentle, soothing voice', provider: 'openai' }
                ];

                // Combine voices, prioritizing ElevenLabs
                const allVoices = [
                    ...elevenLabsVoices.map(v => ({ ...v, provider: 'elevenlabs' })),
                    ...openaiVoices
                ];

                res.json({ 
                    voices: allVoices,
                    primaryProvider: 'elevenlabs',
                    fallbackProvider: 'openai'
                });
            } catch (elevenLabsError) {
                console.error('Error fetching ElevenLabs voices:', elevenLabsError);
                
                // Fallback to OpenAI voices only
                const openaiVoices = [
                    { id: 'alloy', name: 'Alloy', description: 'Neutral, balanced voice', provider: 'openai' },
                    { id: 'echo', name: 'Echo', description: 'Clear, professional voice', provider: 'openai' },
                    { id: 'fable', name: 'Fable', description: 'Warm, storytelling voice', provider: 'openai' },
                    { id: 'onyx', name: 'Onyx', description: 'Deep, authoritative voice', provider: 'openai' },
                    { id: 'nova', name: 'Nova', description: 'Bright, energetic voice', provider: 'openai' },
                    { id: 'shimmer', name: 'Shimmer', description: 'Gentle, soothing voice', provider: 'openai' }
                ];

                res.json({ 
                    voices: openaiVoices,
                    primaryProvider: 'openai',
                    fallbackProvider: null,
                    warning: 'ElevenLabs voices unavailable, using OpenAI fallback'
                });
            }
        } else {
            // No ElevenLabs API key, return OpenAI voices only
            const openaiVoices = [
                { id: 'alloy', name: 'Alloy', description: 'Neutral, balanced voice', provider: 'openai' },
                { id: 'echo', name: 'Echo', description: 'Clear, professional voice', provider: 'openai' },
                { id: 'fable', name: 'Fable', description: 'Warm, storytelling voice', provider: 'openai' },
                { id: 'onyx', name: 'Onyx', description: 'Deep, authoritative voice', provider: 'openai' },
                { id: 'nova', name: 'Nova', description: 'Bright, energetic voice', provider: 'openai' },
                { id: 'shimmer', name: 'Shimmer', description: 'Gentle, soothing voice', provider: 'openai' }
            ];

            res.json({ 
                voices: openaiVoices,
                primaryProvider: 'openai',
                fallbackProvider: null,
                message: 'Configure ElevenLabs API key for enhanced voice options'
            });
        }
    } catch (error) {
        console.error('Error in voices endpoint:', error);
        res.status(500).json({ error: 'Failed to fetch voices' });
    }
});

// Get ElevenLabs voice details
router.get('/voices/:voiceId', authenticateUser, async (req, res) => {
    try {
        const { voiceId } = req.params;
        
        // Get user's ElevenLabs API key
        const userSettings = await database.getUserSettings(req.userId);
        const userApiKey = userSettings?.elevenlabs_api_key;

        if (!userApiKey) {
            return res.status(400).json({ 
                error: 'ElevenLabs API key not configured' 
            });
        }

        const voice = await elevenLabsService.getVoice(voiceId, userApiKey);
        res.json({ voice });
    } catch (error) {
        console.error('Error fetching voice details:', error);
        res.status(500).json({ error: 'Failed to fetch voice details' });
    }
});

// Get user's ElevenLabs subscription info
router.get('/subscription', authenticateUser, async (req, res) => {
    try {
        // Get user's ElevenLabs API key
        const userSettings = await database.getUserSettings(req.userId);
        const userApiKey = userSettings?.elevenlabs_api_key;

        if (!userApiKey) {
            return res.status(400).json({ 
                error: 'ElevenLabs API key not configured' 
            });
        }

        const subscription = await elevenLabsService.getUserSubscription(userApiKey);
        res.json({ subscription });
    } catch (error) {
        console.error('Error fetching subscription:', error);
        res.status(500).json({ error: 'Failed to fetch subscription' });
    }
});

// Clone a voice (if user has permission)
router.post('/voices/clone', authenticateUser, upload.single('audio'), async (req, res) => {
    try {
        const { name } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ error: 'Audio file is required for voice cloning' });
        }

        if (!name || name.trim().length === 0) {
            return res.status(400).json({ error: 'Voice name is required' });
        }

        // Get user's ElevenLabs API key
        const userSettings = await database.getUserSettings(req.userId);
        const userApiKey = userSettings?.elevenlabs_api_key;

        if (!userApiKey) {
            return res.status(400).json({ 
                error: 'ElevenLabs API key not configured' 
            });
        }

        const voice = await elevenLabsService.cloneVoice(name, [req.file.buffer], userApiKey);
        res.json({ voice, success: true });
    } catch (error) {
        console.error('Error cloning voice:', error);
        res.status(500).json({ error: 'Failed to clone voice' });
    }
});

// Delete a cloned voice
router.delete('/voices/:voiceId', authenticateUser, async (req, res) => {
    try {
        const { voiceId } = req.params;
        
        // Get user's ElevenLabs API key
        const userSettings = await database.getUserSettings(req.userId);
        const userApiKey = userSettings?.elevenlabs_api_key;

        if (!userApiKey) {
            return res.status(400).json({ 
                error: 'ElevenLabs API key not configured' 
            });
        }

        const result = await elevenLabsService.deleteVoice(voiceId, userApiKey);
        res.json(result);
    } catch (error) {
        console.error('Error deleting voice:', error);
        res.status(500).json({ error: 'Failed to delete voice' });
    }
});

module.exports = router;

