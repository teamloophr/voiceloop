# Teamloop Dashboard Developer Guide
## Voice-Enabled AI Assistant Integration

### Overview
This guide provides step-by-step instructions for building an enhanced Teamloop dashboard with voice command functionality using OpenAI Whisper and ElevenLabs for an interactive assistant experience.

## Prerequisites

### Required Tools
- Node.js 18+ and npm 9+
- Modern browser with microphone support
- Code editor (VS Code recommended)
- Git for version control

### API Keys Required
- **OpenAI API Key** - For GPT chat and Whisper speech-to-text
- **ElevenLabs API Key** - For natural text-to-speech responses
- **Optional**: Supabase credentials for backend data storage

## Project Setup

### 1. Clone and Setup Base Project
```bash
# Clone the existing Teamloop repository
git clone https://github.com/mcpmessenger/human-light-mode.git
cd human-light-mode

# Install dependencies
npm install

# Copy environment template
cp env.example .env.local
```

### 2. Environment Configuration
Create `.env.local` with the following variables:
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3001

# OpenAI Configuration
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_OPENAI_MODEL=gpt-4

# Whisper Configuration (for voice-to-text)
VITE_WHISPER_MODEL=whisper-1

# ElevenLabs Configuration
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
VITE_ELEVENLABS_VOICE_ID=your_preferred_voice_id
VITE_ELEVENLABS_MODEL=eleven_monolingual_v1

# Dashboard Configuration
VITE_VOICE_WAKE_WORD=hey teamloop
VITE_VOICE_TIMEOUT=5000
VITE_VOICE_CONFIDENCE_THRESHOLD=0.8
```

### 3. Install Additional Dependencies
```bash
# Voice processing libraries
npm install @types/dom-speech-recognition
npm install recordrtc
npm install lamejs

# Audio visualization
npm install wavesurfer.js
npm install @types/wavesurfer.js

# Chart libraries for dashboard
npm install recharts
npm install chart.js react-chartjs-2

# Utility libraries
npm install axios
npm install date-fns
npm install clsx
npm install tailwind-merge
```

## Dashboard Architecture

### Component Structure
```
src/
├── components/
│   ├── dashboard/
│   │   ├── DashboardLayout.tsx          # Main dashboard container
│   │   ├── MetricsPanel.tsx             # Employee metrics display
│   │   ├── ActivityFeed.tsx             # Recent activities
│   │   ├── AnalyticsCharts.tsx          # Performance charts
│   │   └── QuickActions.tsx             # Action buttons
│   ├── voice/
│   │   ├── VoiceCommandBar.tsx          # Voice input interface
│   │   ├── VoiceRecorder.tsx            # Audio recording component
│   │   ├── VoiceVisualizer.tsx          # Audio waveform display
│   │   ├── SpeechToText.tsx             # Whisper integration
│   │   └── TextToSpeech.tsx             # ElevenLabs integration
│   ├── assistant/
│   │   ├── AssistantInterface.tsx       # AI chat interface
│   │   ├── ConversationHistory.tsx      # Chat history
│   │   ├── VoiceCommands.tsx            # Command processor
│   │   └── AssistantAvatar.tsx          # Visual assistant
│   └── ui/
│       ├── button.tsx                   # shadcn/ui button
│       ├── card.tsx                     # shadcn/ui card
│       ├── input.tsx                    # shadcn/ui input
│       └── ...                          # Other UI components
├── hooks/
│   ├── useVoiceRecognition.ts           # Voice recognition hook
│   ├── useTextToSpeech.ts               # TTS hook
│   ├── useAssistant.ts                  # AI assistant hook
│   └── useDashboardData.ts              # Dashboard data hook
├── lib/
│   ├── openai.ts                        # OpenAI API client
│   ├── elevenlabs.ts                    # ElevenLabs API client
│   ├── voiceCommands.ts                 # Voice command definitions
│   └── utils.ts                         # Utility functions
└── types/
    ├── dashboard.ts                     # Dashboard type definitions
    ├── voice.ts                         # Voice-related types
    └── assistant.ts                     # Assistant types
```

## Implementation Steps

### Step 1: Create Dashboard Layout Component

Create `src/components/dashboard/DashboardLayout.tsx`:
```typescript
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VoiceCommandBar } from '@/components/voice/VoiceCommandBar';
import { MetricsPanel } from './MetricsPanel';
import { ActivityFeed } from './ActivityFeed';
import { AnalyticsCharts } from './AnalyticsCharts';
import { AssistantInterface } from '@/components/assistant/AssistantInterface';

export const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with Voice Command Bar */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Teamloop Dashboard
            </h1>
            <VoiceCommandBar />
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Metrics Panel */}
          <div className="lg:col-span-3">
            <MetricsPanel />
            <div className="mt-6">
              <AnalyticsCharts />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <ActivityFeed />
            <AssistantInterface />
          </div>
        </div>
      </main>
    </div>
  );
};
```

### Step 2: Implement Voice Recognition Hook

Create `src/hooks/useVoiceRecognition.ts`:
```typescript
import { useState, useEffect, useCallback } from 'react';

interface VoiceRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
}

export const useVoiceRecognition = (options: VoiceRecognitionOptions = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = options.continuous ?? true;
      recognitionInstance.interimResults = options.interimResults ?? true;
      recognitionInstance.lang = options.language ?? 'en-US';

      recognitionInstance.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const fullTranscript = finalTranscript || interimTranscript;
        setTranscript(fullTranscript);
        options.onResult?.(fullTranscript, !!finalTranscript);
      };

      recognitionInstance.onerror = (event) => {
        const errorMessage = `Speech recognition error: ${event.error}`;
        setError(errorMessage);
        options.onError?.(errorMessage);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    } else {
      setError('Speech recognition not supported in this browser');
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      setError(null);
      setTranscript('');
      recognition.start();
      setIsListening(true);
    }
  }, [recognition, isListening]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition, isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
    browserSupportsSpeechRecognition: !!recognition,
  };
};
```

### Step 3: Create OpenAI Whisper Integration

Create `src/lib/openai.ts`:
```typescript
import axios from 'axios';

const OPENAI_API_BASE = 'https://api.openai.com/v1';

export class OpenAIClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async transcribeAudio(audioBlob: Blob): Promise<string> {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');

    try {
      const response = await axios.post(
        `${OPENAI_API_BASE}/audio/transcriptions`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data.text;
    } catch (error) {
      console.error('Whisper transcription error:', error);
      throw new Error('Failed to transcribe audio');
    }
  }

  async generateChatResponse(messages: Array<{role: string, content: string}>): Promise<string> {
    try {
      const response = await axios.post(
        `${OPENAI_API_BASE}/chat/completions`,
        {
          model: 'gpt-4',
          messages,
          max_tokens: 500,
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI chat error:', error);
      throw new Error('Failed to generate response');
    }
  }
}

export const openaiClient = new OpenAIClient(
  import.meta.env.VITE_OPENAI_API_KEY || ''
);
```

### Step 4: Create ElevenLabs Text-to-Speech Integration

Create `src/lib/elevenlabs.ts`:
```typescript
import axios from 'axios';

const ELEVENLABS_API_BASE = 'https://api.elevenlabs.io/v1';

export class ElevenLabsClient {
  private apiKey: string;
  private voiceId: string;

  constructor(apiKey: string, voiceId: string) {
    this.apiKey = apiKey;
    this.voiceId = voiceId;
  }

  async generateSpeech(text: string): Promise<ArrayBuffer> {
    try {
      const response = await axios.post(
        `${ELEVENLABS_API_BASE}/text-to-speech/${this.voiceId}`,
        {
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey,
          },
          responseType: 'arraybuffer',
        }
      );

      return response.data;
    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      throw new Error('Failed to generate speech');
    }
  }

  async playAudio(audioBuffer: ArrayBuffer): Promise<void> {
    const audioContext = new AudioContext();
    const audioData = await audioContext.decodeAudioData(audioBuffer);
    const source = audioContext.createBufferSource();
    source.buffer = audioData;
    source.connect(audioContext.destination);
    source.start();
  }
}

export const elevenLabsClient = new ElevenLabsClient(
  import.meta.env.VITE_ELEVENLABS_API_KEY || '',
  import.meta.env.VITE_ELEVENLABS_VOICE_ID || ''
);
```

### Step 5: Implement Voice Command Bar Component

Create `src/components/voice/VoiceCommandBar.tsx`:
```typescript
import React, { useState, useCallback } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useAssistant } from '@/hooks/useAssistant';
import { VoiceVisualizer } from './VoiceVisualizer';

export const VoiceCommandBar: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { processCommand, isThinking } = useAssistant();
  const { speak, isSpeaking } = useTextToSpeech();

  const handleVoiceResult = useCallback(async (transcript: string, isFinal: boolean) => {
    if (isFinal && transcript.trim()) {
      setIsProcessing(true);
      try {
        const response = await processCommand(transcript);
        if (response) {
          await speak(response);
        }
      } catch (error) {
        console.error('Voice command error:', error);
        await speak('Sorry, I encountered an error processing your command.');
      } finally {
        setIsProcessing(false);
      }
    }
  }, [processCommand, speak]);

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    browserSupportsSpeechRecognition,
  } = useVoiceRecognition({
    onResult: handleVoiceResult,
    continuous: false,
    interimResults: true,
  });

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="text-sm text-gray-500">
        Voice commands not supported in this browser
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      {/* Voice Status Indicator */}
      {(isListening || isProcessing || isSpeaking) && (
        <div className="flex items-center space-x-2">
          <VoiceVisualizer isActive={isListening} />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {isListening && 'Listening...'}
            {isProcessing && 'Processing...'}
            {isSpeaking && 'Speaking...'}
          </span>
        </div>
      )}

      {/* Transcript Display */}
      {transcript && (
        <div className="max-w-xs truncate text-sm text-gray-700 dark:text-gray-200">
          "{transcript}"
        </div>
      )}

      {/* Voice Control Button */}
      <Button
        variant={isListening ? "destructive" : "default"}
        size="sm"
        onClick={isListening ? stopListening : startListening}
        disabled={isProcessing || isSpeaking}
        className="flex items-center space-x-2"
      >
        {isListening ? (
          <>
            <MicOff className="h-4 w-4" />
            <span>Stop</span>
          </>
        ) : (
          <>
            <Mic className="h-4 w-4" />
            <span>Voice</span>
          </>
        )}
      </Button>

      {/* Speaking Indicator */}
      {isSpeaking && (
        <Volume2 className="h-4 w-4 text-blue-500 animate-pulse" />
      )}
    </div>
  );
};
```

### Step 6: Create Voice Command Processor

Create `src/lib/voiceCommands.ts`:
```typescript
export interface VoiceCommand {
  patterns: string[];
  action: string;
  description: string;
  category: 'navigation' | 'query' | 'action' | 'assistant';
}

export const voiceCommands: VoiceCommand[] = [
  // Navigation Commands
  {
    patterns: ['show dashboard', 'go to dashboard', 'dashboard'],
    action: 'navigate_dashboard',
    description: 'Navigate to the main dashboard',
    category: 'navigation',
  },
  {
    patterns: ['show analytics', 'go to analytics', 'analytics'],
    action: 'navigate_analytics',
    description: 'Navigate to analytics section',
    category: 'navigation',
  },
  {
    patterns: ['show employees', 'employee list', 'employees'],
    action: 'navigate_employees',
    description: 'Navigate to employee list',
    category: 'navigation',
  },

  // Query Commands
  {
    patterns: ['how many employees', 'employee count', 'total employees'],
    action: 'query_employee_count',
    description: 'Get total employee count',
    category: 'query',
  },
  {
    patterns: ['hiring rate', 'recruitment stats', 'hiring statistics'],
    action: 'query_hiring_stats',
    description: 'Get hiring statistics',
    category: 'query',
  },
  {
    patterns: ['employee satisfaction', 'satisfaction score', 'satisfaction rate'],
    action: 'query_satisfaction',
    description: 'Get employee satisfaction metrics',
    category: 'query',
  },

  // Action Commands
  {
    patterns: ['add employee', 'new employee', 'create employee'],
    action: 'action_add_employee',
    description: 'Add a new employee',
    category: 'action',
  },
  {
    patterns: ['schedule review', 'performance review', 'schedule meeting'],
    action: 'action_schedule_review',
    description: 'Schedule a performance review',
    category: 'action',
  },
  {
    patterns: ['generate report', 'create report', 'export report'],
    action: 'action_generate_report',
    description: 'Generate a report',
    category: 'action',
  },

  // Assistant Commands
  {
    patterns: ['help', 'what can you do', 'commands'],
    action: 'assistant_help',
    description: 'Show available commands',
    category: 'assistant',
  },
  {
    patterns: ['explain', 'what is', 'tell me about'],
    action: 'assistant_explain',
    description: 'Explain a concept or feature',
    category: 'assistant',
  },
];

export function matchVoiceCommand(transcript: string): VoiceCommand | null {
  const normalizedTranscript = transcript.toLowerCase().trim();
  
  for (const command of voiceCommands) {
    for (const pattern of command.patterns) {
      if (normalizedTranscript.includes(pattern.toLowerCase())) {
        return command;
      }
    }
  }
  
  return null;
}

export function extractCommandParameters(transcript: string, command: VoiceCommand): Record<string, string> {
  const params: Record<string, string> = {};
  
  // Extract common parameters based on command type
  if (command.action.includes('employee')) {
    const nameMatch = transcript.match(/(?:for|about|employee)\s+([a-zA-Z\s]+)/i);
    if (nameMatch) {
      params.employeeName = nameMatch[1].trim();
    }
  }
  
  if (command.action.includes('report')) {
    const typeMatch = transcript.match(/(?:generate|create)\s+([a-zA-Z\s]+)\s+report/i);
    if (typeMatch) {
      params.reportType = typeMatch[1].trim();
    }
  }
  
  return params;
}
```

### Step 7: Create Assistant Hook

Create `src/hooks/useAssistant.ts`:
```typescript
import { useState, useCallback } from 'react';
import { openaiClient } from '@/lib/openai';
import { matchVoiceCommand, extractCommandParameters } from '@/lib/voiceCommands';
import { useDashboardData } from './useDashboardData';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const useAssistant = () => {
  const [isThinking, setIsThinking] = useState(false);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const { dashboardData, executeAction } = useDashboardData();

  const processCommand = useCallback(async (transcript: string): Promise<string> => {
    setIsThinking(true);
    
    try {
      // Add user message to conversation
      const userMessage: ConversationMessage = {
        role: 'user',
        content: transcript,
        timestamp: new Date(),
      };
      setConversation(prev => [...prev, userMessage]);

      // Try to match with predefined voice commands
      const matchedCommand = matchVoiceCommand(transcript);
      
      if (matchedCommand) {
        const parameters = extractCommandParameters(transcript, matchedCommand);
        const result = await executeAction(matchedCommand.action, parameters);
        
        if (result) {
          const assistantMessage: ConversationMessage = {
            role: 'assistant',
            content: result,
            timestamp: new Date(),
          };
          setConversation(prev => [...prev, assistantMessage]);
          return result;
        }
      }

      // Fallback to OpenAI for general queries
      const systemPrompt = `You are Teamloop, an AI assistant for an employee management platform. \n      You help with HR tasks, employee queries, and dashboard navigation. \n      Current dashboard data: ${JSON.stringify(dashboardData, null, 2)}\n      \n      Respond conversationally and helpfully. Keep responses concise but informative.`;

      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversation.slice(-5), // Keep last 5 messages for context
        { role: 'user', content: transcript },
      ];

      const response = await openaiClient.generateChatResponse(messages);
      
      const assistantMessage: ConversationMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setConversation(prev => [...prev, assistantMessage]);
      
      return response;
    } catch (error) {
      console.error('Assistant processing error:', error);
      return 'I apologize, but I encountered an error processing your request. Please try again.';
    } finally {
      setIsThinking(false);
    }
  }, [conversation, dashboardData, executeAction]);

  const clearConversation = useCallback(() => {
    setConversation([]);
  }, []);

  return {
    isThinking,
    conversation,
    processCommand,
    clearConversation,
  };
};
```

### Step 8: Create Text-to-Speech Hook

Create `src/hooks/useTextToSpeech.ts`:
```typescript
import { useState, useCallback } from 'react';
import { elevenLabsClient } from '@/lib/elevenlabs';

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const speak = useCallback(async (text: string): Promise<void> => {
    if (isSpeaking) return;

    setIsSpeaking(true);
    setError(null);

    try {
      // Try ElevenLabs first
      if (import.meta.env.VITE_ELEVENLABS_API_KEY) {
        const audioBuffer = await elevenLabsClient.generateSpeech(text);
        await elevenLabsClient.playAudio(audioBuffer);
      } else {
        // Fallback to browser's built-in speech synthesis
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        
        return new Promise((resolve) => {
          utterance.onend = () => resolve();
          speechSynthesis.speak(utterance);
        });
      }
    } catch (error) {
      console.error('Text-to-speech error:', error);
      setError('Failed to generate speech');
      
      // Fallback to browser speech synthesis
      const utterance = new SpeechSynthesisUtterance(text);
      return new Promise((resolve) => {
        utterance.onend = () => resolve();
        speechSynthesis.speak(utterance);
      });
    } finally {
      setIsSpeaking(false);
    }
  }, [isSpeaking]);

  const stopSpeaking = useCallback(() => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return {
    isSpeaking,
    error,
    speak,
    stopSpeaking,
  };
};
```

## Testing and Deployment

### Local Testing
```bash
# Start development server
npm run dev

# Test voice functionality
# 1. Open browser and allow microphone access
# 2. Click the voice button and test commands:
#    - "Show me the dashboard"
#    - "How many employees do we have?"
#    - "Help me with navigation"

# Test in different browsers
# - Chrome (recommended)
# - Firefox
# - Safari
# - Edge
```

### Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to S3 (if using AWS)
aws s3 sync dist/ s3://your-bucket-name --delete
```

### Voice Feature Testing Checklist
- [ ] Microphone permission granted
- [ ] Voice recognition starts/stops correctly
- [ ] Commands are processed accurately
- [ ] Text-to-speech responses work
- [ ] Visual feedback during voice interactions
- [ ] Error handling for unsupported browsers
- [ ] Fallback to text input when voice fails
- [ ] Performance with continuous voice input

## Troubleshooting

### Common Issues

1. **Microphone not working**
   - Check browser permissions
   - Ensure HTTPS in production
   - Test with different browsers

2. **Voice recognition accuracy**
   - Speak clearly and slowly
   - Reduce background noise
   - Check microphone quality

3. **API errors**
   - Verify API keys are correct
   - Check API rate limits
   - Monitor network connectivity

4. **Performance issues**
   - Optimize audio processing
   - Implement proper cleanup
   - Use Web Workers for heavy processing

### Browser Compatibility
- Chrome: Full support
- Firefox: Limited speech recognition
- Safari: Basic support
- Edge: Good support
- Mobile browsers: Limited support

## Next Steps

1. **Enhanced Voice Commands**: Add more specific HR-related commands
2. **Multi-language Support**: Support for different languages
3. **Voice Biometrics**: User identification through voice
4. **Offline Capabilities**: Local speech processing
5. **Advanced Analytics**: Voice interaction analytics
6. **Custom Wake Words**: Personalized activation phrases

This guide provides a complete foundation for building a voice-enabled Teamloop dashboard. Follow the steps sequentially and test each component thoroughly before moving to the next phase.

