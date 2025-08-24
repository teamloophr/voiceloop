const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../auth');
const database = require('../database');
const openaiService = require('../openaiService');

// Get user's conversations
router.get('/conversations', authenticateUser, async (req, res) => {
    try {
        const conversations = await database.getUserConversations(req.userId);
        res.json({ conversations });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

// Create new conversation
router.post('/conversations', authenticateUser, async (req, res) => {
    try {
        const { title } = req.body;
        const conversation = await database.createConversation(req.userId, title);
        res.json({ conversation });
    } catch (error) {
        console.error('Error creating conversation:', error);
        res.status(500).json({ error: 'Failed to create conversation' });
    }
});

// Get conversation messages
router.get('/conversations/:id/messages', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verify user has access to this conversation
        const hasAccess = await database.verifyUserAccess(req.userId, id);
        if (!hasAccess) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const messages = await database.getConversationMessages(id);
        res.json({ messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Send message and get AI response
router.post('/conversations/:id/messages', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const { content, messageType = 'text' } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ error: 'Message content is required' });
        }

        // Verify user has access to this conversation
        const hasAccess = await database.verifyUserAccess(req.userId, id);
        if (!hasAccess) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Save user message
        const userMessage = await database.addMessage(id, 'user', content, messageType);

        // Get user's OpenAI API key
        const userSettings = await database.getUserSettings(req.userId);
        const userApiKey = userSettings?.openai_api_key;

        // Get conversation history for context
        const messages = await database.getConversationMessages(id);
        
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
            const aiMessage = await database.addMessage(id, 'ai', aiResponse);

            res.json({
                userMessage,
                aiMessage,
                success: true
            });

        } catch (aiError) {
            console.error('AI generation error:', aiError);
            
            // Save error message as AI response
            const errorMessage = `I apologize, but I encountered an error: ${aiError.message}`;
            const aiMessage = await database.addMessage(id, 'ai', errorMessage);

            res.json({
                userMessage,
                aiMessage,
                success: false,
                error: aiError.message
            });
        }

    } catch (error) {
        console.error('Error processing message:', error);
        res.status(500).json({ error: 'Failed to process message' });
    }
});

// Stream AI response (for real-time chat)
router.post('/conversations/:id/stream', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const { content, messageType = 'text' } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ error: 'Message content is required' });
        }

        // Verify user has access to this conversation
        const hasAccess = await database.verifyUserAccess(req.userId, id);
        if (!hasAccess) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Set up SSE headers
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control'
        });

        // Save user message
        const userMessage = await database.addMessage(id, 'user', content, messageType);

        // Get user's OpenAI API key
        const userSettings = await database.getUserSettings(req.userId);
        const userApiKey = userSettings?.openai_api_key;

        // Get conversation history for context
        const messages = await database.getConversationMessages(id);
        
        // Format messages for OpenAI API
        const apiMessages = [
            openaiService.createSystemMessage(),
            ...openaiService.formatMessagesForAPI(messages)
        ];

        try {
            // Generate streaming AI response
            const stream = await openaiService.generateStreamingResponse(apiMessages, userApiKey);
            
            let fullResponse = '';

            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || '';
                if (content) {
                    fullResponse += content;
                    res.write(`data: ${JSON.stringify({ content, type: 'chunk' })}\n\n`);
                }
            }

            // Save complete AI response
            const aiMessage = await database.addMessage(id, 'ai', fullResponse);
            
            res.write(`data: ${JSON.stringify({ 
                type: 'complete', 
                message: aiMessage,
                userMessage 
            })}\n\n`);
            
        } catch (aiError) {
            console.error('AI streaming error:', aiError);
            res.write(`data: ${JSON.stringify({ 
                type: 'error', 
                error: aiError.message 
            })}\n\n`);
        }

        res.end();

    } catch (error) {
        console.error('Error in streaming endpoint:', error);
        res.status(500).json({ error: 'Failed to process streaming message' });
    }
});

// Update conversation title
router.put('/conversations/:id', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const { title } = req.body;

        if (!title || title.trim().length === 0) {
            return res.status(400).json({ error: 'Title is required' });
        }

        // Verify user has access to this conversation
        const hasAccess = await database.verifyUserAccess(req.userId, id);
        if (!hasAccess) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const conversation = await database.updateConversationTitle(id, title.trim());
        res.json({ conversation });
    } catch (error) {
        console.error('Error updating conversation:', error);
        res.status(500).json({ error: 'Failed to update conversation' });
    }
});

// Delete conversation
router.delete('/conversations/:id', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;

        // Verify user has access to this conversation
        const hasAccess = await database.verifyUserAccess(req.userId, id);
        if (!hasAccess) {
            return res.status(403).json({ error: 'Access denied' });
        }

        await database.deleteConversation(id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting conversation:', error);
        res.status(500).json({ error: 'Failed to delete conversation' });
    }
});

module.exports = router;

