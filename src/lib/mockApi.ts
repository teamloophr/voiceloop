// Mock API responses for testing when backend isn't available
export const mockApiResponses = {
  // Mock ElevenLabs TTS response
  elevenLabsSpeak: async (text: string): Promise<Response> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return a mock response that simulates successful TTS
    return new Response(JSON.stringify({
      success: true,
      message: `Mock TTS response for: "${text}"`,
      audioUrl: null // No actual audio for mock
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  // Mock OpenAI response
  openaiChat: async (messages: any[]): Promise<Response> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const lastMessage = messages[messages.length - 1]?.content || '';
    
    // Generate a mock response based on the input
    let response = 'I understand you said something, but this is a mock response. ';
    
    if (lastMessage.toLowerCase().includes('employee')) {
      response += 'You currently have 247 employees with 8 open positions.';
    } else if (lastMessage.toLowerCase().includes('training')) {
      response += 'Training progress shows Data Security at 85%, Leadership Development at 62%.';
    } else if (lastMessage.toLowerCase().includes('help')) {
      response += 'I can help with employee queries, training progress, and general HR questions.';
    } else {
      response += 'This is a mock AI response for testing purposes.';
    }
    
    return new Response(JSON.stringify({
      choices: [{
        message: {
          content: response
        }
      }]
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

// Mock fetch function for testing
export const mockFetch = async (url: string, options?: RequestInit): Promise<Response> => {
  if (url.includes('/api/elevenlabs/speak')) {
    const body = options?.body ? JSON.parse(options.body as string) : {};
    return mockApiResponses.elevenLabsSpeak(body.text || '');
  }
  
  if (url.includes('/api/openai/chat')) {
    const body = options?.body ? JSON.parse(options.body as string) : {};
    return mockApiResponses.openaiChat(body.messages || []);
  }
  
  // Default mock response
  return new Response(JSON.stringify({ error: 'Mock API endpoint not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  });
};
