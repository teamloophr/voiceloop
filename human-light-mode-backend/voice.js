const express = require('express');
const multer = require('multer');
const router = express.Router();
const { authenticateUser } = require('../auth');
const database = require('../database');
const openaiService = require('../openaiService');

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

// Generate speech from text (Text-to-Speech)
router.post('/generate-speech', authenticateUser, async (req, res) => {
    try {
        const { text, voice = 'alloy', speed = 1.0 } = req.body;

        if (!text || text.trim().length === 0) {
            return res.status(400).json({ error: 'Text is required' });
        }

        if (text.length > 4096) {
            return res.status(400).json({ error: 'Text is too long. Maximum 4096 characters.' });
        }

        // Get user's OpenAI API key
        const userSettings = await database.getUserSettings(req.userId);
        const userApiKey = userSettings?.openai_api_key;

        const options = {
            voice: voice,
            speed: speed,
            responseFormat: 'mp3'
        };

        try {
            // Generate speech
            const audioResponse = await openaiService.generateSpeech(text, userApiKey, options);
            
            // Set appropriate headers for audio response
            res.set({
                'Content-Type': 'audio/mpeg',
                'Content-Disposition': 'attachment; filename="speech.mp3"'
            });

            // Stream the audio response
            audioResponse.body.pipe(res);

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
router.get('/voices', (req, res) => {
    const supportedVoices = [
        { id: 'alloy', name: 'Alloy', description: 'Neutral, balanced voice' },
        { id: 'echo', name: 'Echo', description: 'Clear, professional voice' },
        { id: 'fable', name: 'Fable', description: 'Warm, storytelling voice' },
        { id: 'onyx', name: 'Onyx', description: 'Deep, authoritative voice' },
        { id: 'nova', name: 'Nova', description: 'Bright, energetic voice' },
        { id: 'shimmer', name: 'Shimmer', description: 'Gentle, soothing voice' }
    ];

    res.json({ voices: supportedVoices });
});

module.exports = router;

