const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../auth');
const database = require('../database');
const openaiService = require('../openaiService');

// Get user settings
router.get('/', authenticateUser, async (req, res) => {
    try {
        const settings = await database.getUserSettings(req.userId);
        
        // Don't return the actual API key for security
        const safeSettings = {
            ...settings,
            openai_api_key: settings?.openai_api_key ? '***HIDDEN***' : null,
            has_openai_key: !!settings?.openai_api_key
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
        const { openai_api_key } = req.body;
        
        // Validate API key if provided
        if (openai_api_key && !openaiService.validateApiKey(openai_api_key)) {
            return res.status(400).json({ 
                error: 'Invalid OpenAI API key format. API keys should start with "sk-".' 
            });
        }

        // Prepare settings update
        const settingsUpdate = {};
        
        if (openai_api_key !== undefined) {
            // If empty string or null, remove the API key
            settingsUpdate.openai_api_key = openai_api_key || null;
        }

        // Update settings in database
        const updatedSettings = await database.upsertUserSettings(req.userId, settingsUpdate);
        
        // Return safe version without exposing the actual API key
        const safeSettings = {
            ...updatedSettings,
            openai_api_key: updatedSettings?.openai_api_key ? '***HIDDEN***' : null,
            has_openai_key: !!updatedSettings?.openai_api_key
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
            console.error('API key test failed:', apiError);
            
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
        console.error('Error testing API key:', error);
        res.status(500).json({ error: 'Failed to test API key' });
    }
});

// Delete user settings (remove API key)
router.delete('/openai-key', authenticateUser, async (req, res) => {
    try {
        await database.upsertUserSettings(req.userId, { openai_api_key: null });
        
        res.json({ 
            message: 'OpenAI API key removed successfully',
            has_openai_key: false
        });
    } catch (error) {
        console.error('Error removing API key:', error);
        res.status(500).json({ error: 'Failed to remove API key' });
    }
});

// Get API key status (without exposing the key)
router.get('/openai-key-status', authenticateUser, async (req, res) => {
    try {
        const settings = await database.getUserSettings(req.userId);
        
        res.json({
            has_openai_key: !!settings?.openai_api_key,
            key_length: settings?.openai_api_key ? settings.openai_api_key.length : 0,
            key_prefix: settings?.openai_api_key ? settings.openai_api_key.substring(0, 7) + '...' : null
        });
    } catch (error) {
        console.error('Error checking API key status:', error);
        res.status(500).json({ error: 'Failed to check API key status' });
    }
});

module.exports = router;

