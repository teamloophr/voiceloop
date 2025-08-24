class ElevenLabsService {
  private apiKey: string | null = null;

  constructor() {
    // Try to get API key from localStorage
    this.apiKey = localStorage.getItem('elevenlabs_api_key');
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    localStorage.setItem('elevenlabs_api_key', apiKey);
  }

  getApiKey(): string | null {
    return this.apiKey;
  }

  // Generate speech from text using ElevenLabs
  async generateSpeech(text: string, voiceId: string = '21m00Tcm4TlvDq8ikWAM'): Promise<Blob> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key is required. Please set your API key in settings.');
    }

    if (text.length > 5000) {
      throw new Error('Text is too long. Maximum 5000 characters for ElevenLabs.');
    }

    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
            style: 0.0,
            use_speaker_boost: true
          }
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail?.message || 'Speech generation failed');
      }

      return await response.blob();
    } catch (error) {
      console.error('ElevenLabs speech generation error:', error);
      throw error;
    }
  }

  // Get available voices from ElevenLabs
  async getVoices(): Promise<Array<{ id: string; name: string; description?: string }>> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key is required. Please set your API key in settings.');
    }

    try {
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail?.message || 'Failed to fetch voices');
      }

      const result = await response.json();
      return result.voices.map((voice: any) => ({
        id: voice.voice_id,
        name: voice.name,
        description: voice.labels?.description || voice.name,
      }));
    } catch (error) {
      console.error('ElevenLabs voices fetch error:', error);
      throw error;
    }
  }

  // Play audio blob
  async playAudio(audioBlob: Blob): Promise<void> {
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    return new Promise((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        reject(new Error('Audio playback failed'));
      };
      audio.play().catch(reject);
    });
  }
}

export const elevenLabsService = new ElevenLabsService();
