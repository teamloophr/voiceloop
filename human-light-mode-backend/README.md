# Human Light Mode AI Assistant Backend

This is the backend API for the Human Light Mode AI Assistant integration, providing chat, voice transcription, and settings management.

## Features

- 🤖 AI-powered chat assistant using OpenAI GPT
- 🎤 Voice-to-text transcription using OpenAI Whisper
- 🔊 Text-to-speech functionality
- 🔐 Secure API key management
- 💾 Conversation history storage
- 🔒 JWT authentication with Supabase
- 📊 Row Level Security for data protection

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the environment example and configure your variables:

```bash
cp env.example .env
```

Edit `.env` with your credentials:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=optional_default_openai_key
PORT=3001
NODE_ENV=development
```

### 3. Database Setup

1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `database.sql`
4. Run the SQL commands to create tables and policies

### 4. Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:3001`

## API Endpoints

### Health Check
- `GET /health` - Server status

### Chat API
- `GET /api/chat/conversations` - Get user conversations
- `POST /api/chat/conversations` - Create new conversation
- `GET /api/chat/conversations/:id/messages` - Get conversation messages
- `POST /api/chat/conversations/:id/messages` - Send message
- `PUT /api/chat/conversations/:id` - Update conversation title
- `DELETE /api/chat/conversations/:id` - Delete conversation

### Voice API
- `POST /api/voice/transcribe` - Transcribe audio file
- `POST /api/voice/transcribe-and-send/:id` - Transcribe and send to conversation
- `POST /api/voice/generate-speech` - Generate speech from text
- `GET /api/voice/languages` - Get supported languages
- `GET /api/voice/voices` - Get supported voices

### Settings API
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update user settings
- `POST /api/settings/test-openai-key` - Test OpenAI API key
- `DELETE /api/settings/openai-key` - Remove OpenAI API key
- `GET /api/settings/openai-key-status` - Check API key status

## Security Features

- **JWT Authentication**: All endpoints require valid Supabase JWT tokens
- **Row Level Security**: Database policies ensure users can only access their own data
- **API Key Encryption**: User API keys are encrypted in the database
- **Input Validation**: All user inputs are validated and sanitized
- **CORS Protection**: Configured for secure cross-origin requests

## File Structure

```
human-light-mode-backend/
├── routes/
│   ├── chat.js          # Chat API endpoints
│   ├── voice.js         # Voice transcription endpoints
│   └── settings.js      # Settings management
├── server.js            # Main server file
├── auth.js              # Authentication middleware
├── database.js          # Database operations
├── openaiService.js     # OpenAI API integration
├── supabaseClient.js    # Supabase client
├── database.sql         # Database schema
├── package.json         # Dependencies
└── README.md           # This file
```

## Development

### Running in Development Mode

```bash
npm run dev
```

This uses nodemon for auto-reload on file changes.

### Testing the API

```bash
# Health check
curl http://localhost:3001/health

# Expected response:
# {"status":"OK","timestamp":"2024-01-01T00:00:00.000Z","version":"1.0.0"}
```

## Production Deployment

### Environment Variables

Update your production `.env` file:

```env
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
```

### Security Considerations

1. **HTTPS Required**: Voice features need HTTPS in production
2. **Rate Limiting**: Consider implementing rate limits for production
3. **CORS Configuration**: Update CORS origin for your production domain
4. **API Monitoring**: Monitor OpenAI API usage and implement user quotas

## Troubleshooting

### Common Issues

1. **Database Connection**: Verify Supabase credentials and network access
2. **CORS Errors**: Check backend CORS configuration for your domain
3. **API Key Errors**: Validate key format and test with OpenAI directly
4. **Microphone Issues**: Check browser permissions and HTTPS requirement

### Logs

Check the console output for detailed error messages and API call logs.

## Support

For additional support, refer to:
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Express.js Documentation](https://expressjs.com/)

## License

MIT License - see package.json for details.
