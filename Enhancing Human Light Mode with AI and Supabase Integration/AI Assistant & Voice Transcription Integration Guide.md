# AI Assistant & Voice Transcription Integration Guide

## Overview

This guide provides step-by-step instructions for integrating the AI assistant and voice transcription features into your Human Light Mode application. The integration includes:

- AI-powered chat assistant using OpenAI GPT
- Voice-to-text transcription using OpenAI Whisper
- Text-to-speech functionality
- User API key management
- Supabase database integration for conversation history
- Secure authentication and data storage

## Prerequisites

Before starting the integration, ensure you have:

1. A Supabase project set up
2. Node.js and npm installed
3. Your existing Human Light Mode codebase
4. OpenAI API access (users will provide their own keys)

## Backend Setup

### 1. Install Backend Dependencies

Create a new backend directory and install the required packages:

```bash
mkdir human-light-mode-backend
cd human-light-mode-backend
npm init -y
npm install express dotenv @supabase/supabase-js openai multer cors
```

### 2. Environment Configuration

Create a `.env` file in your backend directory:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=optional_default_openai_key
PORT=3001
```

### 3. Database Setup

Run the SQL commands from `database.sql` in your Supabase SQL editor to create the required tables:

- `user_settings` - Stores user API keys and preferences
- `conversations` - Stores chat conversations
- `messages` - Stores individual messages
- Row Level Security policies for data protection

### 4. Backend Server Setup

Create your main server file (`server.js`):

```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const chatRoutes = require('./routes/chat');
const voiceRoutes = require('./routes/voice');
const settingsRoutes = require('./routes/settings');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Frontend Setup

### 1. Install Frontend Dependencies

In your existing Human Light Mode project:

```bash
npm install @supabase/supabase-js axios
```

### 2. Environment Configuration

Create or update your `.env` file in the frontend:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:3001
```

### 3. Add New Routes

Update your `App.tsx` to include new routes for the AI assistant:

```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ChatPage from "./pages/ChatPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

// Add these routes to your existing Routes component
<Routes>
  <Route path="/" element={<Index />} />
  <Route path="/chat" element={<ChatPage />} />
  <Route path="/settings" element={<SettingsPage />} />
  <Route path="*" element={<NotFound />} />
</Routes>
```

## Component Integration Suggestions

### 1. Settings Panel Component

Create a settings component that allows users to manage their OpenAI API key:

```tsx
// src/components/SettingsPanel.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { settingsApi } from '@/lib/api';

export const SettingsPanel = () => {
  const [apiKey, setApiKey] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [testing, setTesting] = useState(false);

  // Implementation for API key management
  // Include validation, testing, and secure storage
};
```

### 2. Chat Interface Component

Create a modern chat interface with voice input capabilities:

```tsx
// src/components/ChatInterface.tsx
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, Send, Square } from 'lucide-react';
import { chatApi, voiceApi } from '@/lib/api';

export const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  
  // Implementation for chat functionality
  // Include voice recording, transcription, and AI responses
};
```

### 3. Voice Recording Hook

Create a custom hook for voice recording functionality:

```tsx
// src/hooks/useVoiceRecording.ts
import { useState, useRef, useCallback } from 'react';

export const useVoiceRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Implementation for voice recording
  // Include start/stop recording, audio processing
};
```

## Integration Steps

### Step 1: Authentication Integration

1. Integrate Supabase authentication with your existing auth system
2. Ensure JWT tokens are properly passed to backend API calls
3. Implement user session management

### Step 2: UI Integration

1. Add navigation links to chat and settings pages
2. Integrate the chat interface into your existing design system
3. Ensure responsive design for mobile devices
4. Apply your existing theme (light/dark mode support)

### Step 3: Voice Features Integration

1. Add microphone permissions handling
2. Implement audio recording UI components
3. Add visual feedback for recording state
4. Integrate with existing notification system

### Step 4: Settings Integration

1. Add API key management to your settings page
2. Implement secure key storage and validation
3. Add user onboarding for API key setup
4. Include usage guidelines and help documentation

## Recommended File Structure

```
human-light-mode/
├── src/
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── VoiceRecorder.tsx
│   │   │   └── ConversationList.tsx
│   │   ├── settings/
│   │   │   ├── SettingsPanel.tsx
│   │   │   ├── APIKeyManager.tsx
│   │   │   └── VoiceSettings.tsx
│   │   └── ui/ (existing components)
│   ├── hooks/
│   │   ├── useVoiceRecording.ts
│   │   ├── useChat.ts
│   │   └── useSettings.ts
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── api.ts
│   │   └── utils.ts
│   ├── pages/
│   │   ├── ChatPage.tsx
│   │   ├── SettingsPage.tsx
│   │   └── Index.tsx (existing)
│   └── types/
│       ├── chat.ts
│       ├── voice.ts
│       └── settings.ts

human-light-mode-backend/
├── routes/
│   ├── chat.js
│   ├── voice.js
│   └── settings.js
├── supabaseClient.js
├── database.js
├── openaiService.js
├── auth.js
├── server.js
└── .env
```

## Security Considerations

1. **API Key Storage**: User API keys are encrypted and stored securely in Supabase
2. **Authentication**: All endpoints require valid JWT tokens
3. **Row Level Security**: Database policies ensure users can only access their own data
4. **Input Validation**: All user inputs are validated and sanitized
5. **Rate Limiting**: Consider implementing rate limiting for API calls

## Testing Recommendations

1. **Unit Tests**: Test individual components and API functions
2. **Integration Tests**: Test the complete chat and voice workflows
3. **Security Tests**: Verify authentication and authorization
4. **Performance Tests**: Test with large conversation histories
5. **Cross-browser Tests**: Ensure voice recording works across browsers

## Deployment Considerations

1. **Environment Variables**: Ensure all environment variables are properly set
2. **CORS Configuration**: Configure CORS for your production domain
3. **SSL/HTTPS**: Required for microphone access in browsers
4. **Database Migration**: Run database setup scripts in production
5. **API Rate Limits**: Monitor OpenAI API usage and implement user quotas

## User Experience Enhancements

1. **Onboarding**: Guide users through API key setup
2. **Error Handling**: Provide clear error messages and recovery options
3. **Loading States**: Show progress indicators for AI responses
4. **Keyboard Shortcuts**: Add shortcuts for common actions
5. **Accessibility**: Ensure screen reader compatibility

## Monitoring and Analytics

1. **Error Tracking**: Monitor API failures and user errors
2. **Usage Analytics**: Track feature adoption and usage patterns
3. **Performance Monitoring**: Monitor response times and system health
4. **User Feedback**: Collect feedback on AI response quality

## Next Steps

1. Start with the backend setup and database configuration
2. Implement basic authentication and API key management
3. Create the chat interface with text-only functionality
4. Add voice recording and transcription features
5. Implement text-to-speech for AI responses
6. Add advanced features like conversation management
7. Optimize performance and add monitoring
8. Deploy to production with proper security measures

## Support and Troubleshooting

Common issues and solutions:

- **Microphone not working**: Check browser permissions and HTTPS requirement
- **API key errors**: Validate key format and test with OpenAI directly
- **Database connection issues**: Verify Supabase credentials and network access
- **CORS errors**: Check backend CORS configuration for your domain

For additional support, refer to the documentation for:
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)

