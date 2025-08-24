const { ElevenLabs } = require('@elevenlabs/elevenlabs-js');

class ElevenLabsService {
    constructor() {
        this.defaultClient = null;
        
        // Initialize default client if API key is available in environment
        if (process.env.ELEVENLABS_API_KEY) {
            this.defaultClient = new ElevenLabs({
                apiKey: process.env.ELEVENLABS_API_KEY
            });
        }
    }

    // Create ElevenLabs client with user's API key
    createClient(apiKey) {
        if (!apiKey) {
            throw new Error('ElevenLabs API key is required');
        }
        
        return new ElevenLabs({
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
        
        throw new Error('No ElevenLabs API key available. Please provide your API key in settings.');
    }

    // Generate speech from text using ElevenLabs
    async generateSpeech(text, userApiKey = null, options = {}) {
        try {
            const client = this.getClient(userApiKey);
            
            const {
                voiceId = '21m00Tcm4TlvDq8ikWAM', // Rachel voice (default)
                modelId = 'eleven_monolingual_v1',
                voiceSettings = {
                    stability: 0.5,
                    similarityBoost: 0.5,
                    style: 0.0,
                    use_speaker_boost: true
                }
            } = options;

            // Validate text length (ElevenLabs has a limit)
            if (text.length > 5000) {
                throw new Error('Text is too long. Maximum 5000 characters for ElevenLabs.');
            }

            const response = await client.textToSpeech({
                text: text,
                voice_id: voiceId,
                model_id: modelId,
                voice_settings: voiceSettings
            });

            return response;
        } catch (error) {
            console.error('Error generating ElevenLabs speech:', error);
            
            // Handle specific ElevenLabs errors
            if (error.status === 401) {
                throw new Error('Invalid ElevenLabs API key. Please check your API key in settings.');
            } else if (error.status === 429) {
                throw new Error('ElevenLabs API rate limit exceeded. Please try again later.');
            } else if (error.status === 400) {
                throw new Error('Invalid request to ElevenLabs API. Please check your parameters.');
            }
            
            throw new Error(`ElevenLabs API error: ${error.message}`);
        }
    }

    // Get available voices from ElevenLabs
    async getVoices(userApiKey = null) {
        try {
            const client = this.getClient(userApiKey);
            const voices = await client.voices.getAll();
            
            // Format voices for frontend consumption
            return voices.map(voice => ({
                id: voice.voice_id,
                name: voice.name,
                description: voice.labels?.description || voice.name,
                category: voice.category || 'general',
                language: voice.labels?.language || 'en',
                accent: voice.labels?.accent || 'neutral',
                gender: voice.labels?.gender || 'neutral',
                age: voice.labels?.age || 'adult'
            }));
        } catch (error) {
            console.error('Error fetching ElevenLabs voices:', error);
            throw new Error(`Failed to fetch voices: ${error.message}`);
        }
    }

    // Get specific voice details
    async getVoice(voiceId, userApiKey = null) {
        try {
            const client = this.getClient(userApiKey);
            const voice = await client.voices.get(voiceId);
            
            return {
                id: voice.voice_id,
                name: voice.name,
                description: voice.labels?.description || voice.name,
                category: voice.category || 'general',
                language: voice.labels?.language || 'en',
                accent: voice.labels?.accent || 'neutral',
                gender: voice.labels?.gender || 'neutral',
                age: voice.labels?.age || 'adult',
                samples: voice.samples || [],
                settings: voice.settings || {}
            };
        } catch (error) {
            console.error('Error fetching voice details:', error);
            throw new Error(`Failed to fetch voice: ${error.message}`);
        }
    }

    // Clone a voice (if user has permission)
    async cloneVoice(name, files, userApiKey = null) {
        try {
            const client = this.getClient(userApiKey);
            
            const voice = await client.voices.clone({
                name: name,
                files: files
            });
            
            return voice;
        } catch (error) {
            console.error('Error cloning voice:', error);
            throw new Error(`Failed to clone voice: ${error.message}`);
        }
    }

    // Delete a cloned voice
    async deleteVoice(voiceId, userApiKey = null) {
        try {
            const client = this.getClient(userApiKey);
            await client.voices.delete(voiceId);
            
            return { success: true, message: 'Voice deleted successfully' };
        } catch (error) {
            console.error('Error deleting voice:', error);
            throw new Error(`Failed to delete voice: ${error.message}`);
        }
    }

    // Validate API key format
    validateApiKey(apiKey) {
        if (!apiKey || typeof apiKey !== 'string') {
            return false;
        }
        
        // ElevenLabs API keys are typically alphanumeric and 32+ characters
        return apiKey.length >= 32 && /^[a-zA-Z0-9]+$/.test(apiKey);
    }

    // Get user's subscription info
    async getUserSubscription(userApiKey = null) {
        try {
            const client = this.getClient(userApiKey);
            const subscription = await client.user.subscription();
            
            return {
                tier: subscription.tier,
                characterCount: subscription.character_count,
                characterLimit: subscription.character_limit,
                canExtendCharacterLimit: subscription.can_extend_character_limit,
                allowedToExtendCharacterLimit: subscription.allowed_to_extend_character_limit,
                nextCharacterCountResetUnix: subscription.next_character_count_reset_unix,
                voiceLimit: subscription.voice_limit,
                availableVoiceLimit: subscription.available_voice_limit,
                canExtendVoiceLimit: subscription.can_extend_voice_limit,
                canUseInstantVoiceCloning: subscription.can_use_instant_voice_cloning,
                canUseProfessionalVoiceLimit: subscription.can_use_professional_voice_limit
            };
        } catch (error) {
            console.error('Error fetching user subscription:', error);
            throw new Error(`Failed to fetch subscription: ${error.message}`);
        }
    }
}

module.exports = new ElevenLabsService();
