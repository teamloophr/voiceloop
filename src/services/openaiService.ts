class OpenAIService {
  private apiKey: string | null = null;

  constructor() {
    // Try to get API key from localStorage
    this.apiKey = localStorage.getItem('openai_api_key');
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    localStorage.setItem('openai_api_key', apiKey);
  }

  getApiKey(): string | null {
    return this.apiKey;
  }

  // Transcribe audio using Whisper
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is required. Please set your API key in settings.');
    }

    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');
    formData.append('model', 'whisper-1');

    try {
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Transcription failed');
      }

      const result = await response.json();
      return result.text;
    } catch (error) {
      console.error('Whisper transcription error:', error);
      throw error;
    }
  }

  // Generate AI response using GPT
  async generateResponse(messages: Array<{ role: string; content: string }>): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is required. Please set your API key in settings.');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are VoiceLoop, an AI-powered HR assistant. You help with employee management, 
              performance reviews, PTO requests, and general HR queries. Be helpful, professional, and concise. 
              Always respond in a friendly, supportive tone.`
            },
            ...messages
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'AI response generation failed');
      }

      const result = await response.json();
      return result.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    } catch (error) {
      console.error('GPT response generation error:', error);
      throw error;
    }
  }
}

export const openaiService = new OpenAIService();
