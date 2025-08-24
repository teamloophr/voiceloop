const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../auth');
const database = require('../database');
const openaiService = require('../openaiService');
const elevenLabsService = require('../elevenLabsService');

// Get user settings
router.get('/', authenticateUser, async (req, res) => {
    try {
        const settings = await database.getUserSettings(req.userId);
        
        // Don't return the actual API keys for security
        const safeSettings = {
            ...settings,
            openai_api_key: settings?.openai_api_key ? '***HIDDEN***' : null,
            elevenlabs_api_key: settings?.elevenlabs_api_key ? '***HIDDEN***' : null,
            has_openai_key: !!settings?.openai_api_key,
            has_elevenlabs_key: !!settings?.elevenlabs_api_key
        };

        res.json({ settings: safeSettings });
    } catch (error) {
        console.error('Error fetching user settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// Update user settings
router.put('/', authenticateUser, async (req, res) => {
    try {
        const { openai_api_key, elevenlabs_api_key } = req.body;
        
        // Validate OpenAI API key if provided
        if (openai_api_key && !openaiService.validateApiKey(openai_api_key)) {
            return res.status(400).json({ 
                error: 'Invalid OpenAI API key format. API keys should start with "sk-".' 
            });
        }

        // Validate ElevenLabs API key if provided
        if (elevenlabs_api_key && !elevenLabsService.validateApiKey(elevenlabs_api_key)) {
            return res.status(400).json({ 
                error: 'Invalid ElevenLabs API key format. API keys should be alphanumeric and at least 32 characters.' 
            });
        }

        // Prepare settings update
        const settingsUpdate = {};
        
        if (openai_api_key !== undefined) {
            // If empty string or null, remove the API key
            settingsUpdate.openai_api_key = openai_api_key || null;
        }

        if (elevenlabs_api_key !== undefined) {
            // If empty string or null, remove the API key
            settingsUpdate.elevenlabs_api_key = elevenlabs_api_key || null;
        }

        // Update settings in database
        const updatedSettings = await database.upsertUserSettings(req.userId, settingsUpdate);
        
        // Return safe version without exposing the actual API keys
        const safeSettings = {
            ...updatedSettings,
            openai_api_key: updatedSettings?.openai_api_key ? '***HIDDEN***' : null,
            elevenlabs_api_key: updatedSettings?.elevenlabs_api_key ? '***HIDDEN***' : null,
            has_openai_key: !!updatedSettings?.openai_api_key,
            has_elevenlabs_key: !!updatedSettings?.elevenlabs_api_key
        };

        res.json({ 
            settings: safeSettings,
            message: 'Settings updated successfully'
        });
    } catch (error) {
        console.error('Error updating user settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// Test OpenAI API key
router.post('/test-openai-key', authenticateUser, async (req, res) => {
    try {
        const { api_key } = req.body;
        
        if (!api_key) {
            return res.status(400).json({ error: 'API key is required for testing' });
        }

        // Validate API key format
        if (!openaiService.validateApiKey(api_key)) {
            return res.status(400).json({ 
                error: 'Invalid API key format. API keys should start with "sk-".',
                valid: false
            });
        }

        try {
            // Test the API key with a simple completion request
            const testMessages = [
                { role: 'user', content: 'Hello, this is a test. Please respond with just "API key is working".' }
            ];

            const completion = await openaiService.generateResponse(
                testMessages, 
                api_key, 
                { max_tokens: 10, temperature: 0 }
            );

            res.json({
                valid: true,
                message: 'API key is valid and working',
                test_response: completion.choices[0].message.content
            });

        } catch (apiError) {
            console.error('OpenAI API key test failed:', apiError);
            
            let errorMessage = 'API key test failed';
            if (apiError.message.includes('401')) {
                errorMessage = 'Invalid API key. Please check your OpenAI API key.';
            } else if (apiError.message.includes('429')) {
                errorMessage = 'API rate limit exceeded. Your key is valid but you\'ve hit the rate limit.';
            } else if (apiError.message.includes('402')) {
                errorMessage = 'API quota exceeded. Please check your OpenAI billing.';
            }

            res.json({
                valid: false,
                error: errorMessage
            });
        }

    } catch (error) {
        console.error('Error testing OpenAI API key:', error);
        res.status(500).json({ error: 'Failed to test OpenAI API key' });
    }
});

// Test ElevenLabs API key
router.post('/test-elevenlabs-key', authenticateUser, async (req, res) => {
    try {
        const { api_key } = req.body;
        
        if (!api_key) {
            return res.status(400).json({ error: 'API key is required for testing' });
        }

        // Validate API key format
        if (!elevenLabsService.validateApiKey(api_key)) {
            return res.json({ 
                error: 'Invalid API key format. API keys should be alphanumeric and at least 32 characters.',
                valid: false
            });
        }

        try {
            // Test the API key by fetching available voices
            const voices = await elevenLabsService.getVoices(api_key);
            
            res.json({
                valid: true,
                message: 'ElevenLabs API key is valid and working',
                available_voices: voices.length,
                voices_sample: voices.slice(0, 3).map(v => ({ id: v.id, name: v.name }))
            });

        } catch (apiError) {
            console.error('ElevenLabs API key test failed:', apiError);
            
            let errorMessage = 'API key test failed';
            if (apiError.message.includes('401')) {
                errorMessage = 'Invalid API key. Please check your ElevenLabs API key.';
            } else if (apiError.message.includes('429')) {
                errorMessage = 'API rate limit exceeded. Your key is valid but you\'ve hit the rate limit.';
            } else if (apiError.message.includes('400')) {
                errorMessage = 'Invalid request. Please check your API key format.';
            }

            res.json({
                valid: false,
                error: errorMessage
            });
        }

    } catch (error) {
        console.error('Error testing ElevenLabs API key:', error);
        res.status(500).json({ error: 'Failed to test ElevenLabs API key' });
    }
});

// Delete OpenAI API key
router.delete('/openai-key', authenticateUser, async (req, res) => {
    try {
        await database.upsertUserSettings(req.userId, { openai_api_key: null });
        
        res.json({ 
            message: 'OpenAI API key removed successfully',
            has_openai_key: false
        });
    } catch (error) {
        console.error('Error removing OpenAI API key:', error);
        res.status(500).json({ error: 'Failed to remove OpenAI API key' });
    }
});

// Delete ElevenLabs API key
router.delete('/elevenlabs-key', authenticateUser, async (req, res) => {
    try {
        await database.upsertUserSettings(req.userId, { elevenlabs_api_key: null });
        
        res.json({ 
            message: 'ElevenLabs API key removed successfully',
            has_elevenlabs_key: false
        });
    } catch (error) {
        console.error('Error removing ElevenLabs API key:', error);
        res.status(500).json({ error: 'Failed to remove ElevenLabs API key' });
    }
});

// Get OpenAI API key status (without exposing the key)
router.get('/openai-key-status', authenticateUser, async (req, res) => {
    try {
        const settings = await database.getUserSettings(req.userId);
        
        res.json({
            has_openai_key: !!settings?.openai_api_key,
            key_length: settings?.openai_api_key ? settings.openai_api_key.length : 0,
            key_prefix: settings?.openai_api_key ? settings.openai_api_key.substring(0, 7) + '...' : null
        });
    } catch (error) {
        console.error('Error checking OpenAI API key status:', error);
        res.status(500).json({ error: 'Failed to check OpenAI API key status' });
    }
});

// Get ElevenLabs API key status (without exposing the key)
router.get('/elevenlabs-key-status', authenticateUser, async (req, res) => {
    try {
        const settings = await database.getUserSettings(req.userId);
        
        res.json({
            has_elevenlabs_key: !!settings?.elevenlabs_api_key,
            key_length: settings?.elevenlabs_api_key ? settings.elevenlabs_api_key.length : 0,
            key_prefix: settings?.elevenlabs_api_key ? settings.elevenlabs_api_key.substring(0, 7) + '...' : null
        });
    } catch (error) {
        console.error('Error checking ElevenLabs API key status:', error);
        res.status(500).json({ error: 'Failed to check ElevenLabs API key status' });
    }
});

module.exports = router;

