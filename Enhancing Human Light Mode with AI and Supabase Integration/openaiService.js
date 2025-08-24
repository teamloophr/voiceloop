const OpenAI = require('openai');

class OpenAIService {
    constructor() {
        this.defaultClient = null;
        
        // Initialize default client if API key is available in environment
        if (process.env.OPENAI_API_KEY) {
            this.defaultClient = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY
            });
        }
    }

    // Create OpenAI client with user's API key
    createClient(apiKey) {
        if (!apiKey) {
            throw new Error('OpenAI API key is required');
        }
        
        return new OpenAI({
            apiKey: apiKey
        });
    }

    // Get client (user's key takes precedence over default)
    getClient(userApiKey = null) {
        if (userApiKey) {
            return this.createClient(userApiKey);
        }
        
        if (this.defaultClient) {
            return this.defaultClient;
        }
        
        throw new Error('No OpenAI API key available. Please provide your API key in settings.');
    }

    // Generate AI assistant response
    async generateResponse(messages, userApiKey = null, options = {}) {
        try {
            const client = this.getClient(userApiKey);
            
            const completion = await client.chat.completions.create({
                model: options.model || 'gpt-3.5-turbo',
                messages: messages,
                max_tokens: options.maxTokens || 1000,
                temperature: options.temperature || 0.7,
                stream: options.stream || false,
                ...options
            });

            return completion;
        } catch (error) {
            console.error('Error generating AI response:', error);
            
            // Handle specific OpenAI errors
            if (error.status === 401) {
                throw new Error('Invalid OpenAI API key. Please check your API key in settings.');
            } else if (error.status === 429) {
                throw new Error('OpenAI API rate limit exceeded. Please try again later.');
            } else if (error.status === 402) {
                throw new Error('OpenAI API quota exceeded. Please check your billing.');
            }
            
            throw new Error(`OpenAI API error: ${error.message}`);
        }
    }

    // Generate streaming response
    async generateStreamingResponse(messages, userApiKey = null, options = {}) {
        try {
            const client = this.getClient(userApiKey);
            
            const stream = await client.chat.completions.create({
                model: options.model || 'gpt-3.5-turbo',
                messages: messages,
                max_tokens: options.maxTokens || 1000,
                temperature: options.temperature || 0.7,
                stream: true,
                ...options
            });

            return stream;
        } catch (error) {
            console.error('Error generating streaming AI response:', error);
            throw error;
        }
    }

    // Transcribe audio using Whisper
    async transcribeAudio(audioBuffer, userApiKey = null, options = {}) {
        try {
            const client = this.getClient(userApiKey);
            
            // Create a File object from the buffer
            const audioFile = new File([audioBuffer], 'audio.wav', { 
                type: 'audio/wav' 
            });
            
            const transcription = await client.audio.transcriptions.create({
                file: audioFile,
                model: options.model || 'whisper-1',
                language: options.language || undefined, // Auto-detect if not specified
                response_format: options.responseFormat || 'text',
                temperature: options.temperature || 0,
                ...options
            });

            return transcription;
        } catch (error) {
            console.error('Error transcribing audio:', error);
            
            if (error.status === 401) {
                throw new Error('Invalid OpenAI API key for Whisper. Please check your API key in settings.');
            } else if (error.status === 413) {
                throw new Error('Audio file too large. Please use a smaller file.');
            }
            
            throw new Error(`Whisper API error: ${error.message}`);
        }
    }

    // Generate text-to-speech
    async generateSpeech(text, userApiKey = null, options = {}) {
        try {
            const client = this.getClient(userApiKey);
            
            const response = await client.audio.speech.create({
                model: options.model || 'tts-1',
                voice: options.voice || 'alloy',
                input: text,
                response_format: options.responseFormat || 'mp3',
                speed: options.speed || 1.0,
                ...options
            });

            return response;
        } catch (error) {
            console.error('Error generating speech:', error);
            throw new Error(`Text-to-speech API error: ${error.message}`);
        }
    }

    // Format messages for OpenAI API
    formatMessagesForAPI(messages) {
        return messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content
        }));
    }

    // Create system message for AI assistant
    createSystemMessage(customInstructions = null) {
        const defaultInstructions = `You are a helpful AI assistant integrated into the Human Light Mode messaging application. 
        You should be conversational, helpful, and concise in your responses. 
        You can help with various tasks including answering questions, providing information, and assisting with productivity.
        Keep your responses engaging but not overly verbose unless specifically asked for detailed information.`;

        return {
            role: 'system',
            content: customInstructions || defaultInstructions
        };
    }

    // Validate API key format
    validateApiKey(apiKey) {
        if (!apiKey || typeof apiKey !== 'string') {
            return false;
        }
        
        // OpenAI API keys typically start with 'sk-' and are 51 characters long
        return apiKey.startsWith('sk-') && apiKey.length >= 20;
    }
}

module.exports = new OpenAIService();

