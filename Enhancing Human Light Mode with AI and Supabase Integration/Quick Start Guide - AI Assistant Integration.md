# Quick Start Guide - AI Assistant Integration

## 🚀 Get Started in 5 Minutes

### 1. Backend Setup (2 minutes)

```bash
# Navigate to the backend directory
cd human-light-mode-backend

# Install dependencies (already done)
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Start the backend server
npm start
```

The backend will run on `http://localhost:3001`

### 2. Database Setup (1 minute)

1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `database.sql`
4. Run the SQL commands to create tables and policies

### 3. Frontend Integration (2 minutes)

```bash
# In your existing Human Light Mode project
npm install @supabase/supabase-js axios

# Create environment file
echo "VITE_SUPABASE_URL=your_supabase_url" >> .env
echo "VITE_SUPABASE_ANON_KEY=your_supabase_anon_key" >> .env
echo "VITE_API_BASE_URL=http://localhost:3001" >> .env

# Copy the lib files
cp ../lib/supabase.ts src/lib/
cp ../lib/api.ts src/lib/
```

## 🧪 Test the Integration

### Test Backend API

```bash
# Health check
curl http://localhost:3001/health

# Expected response:
# {"status":"OK","timestamp":"2024-01-01T00:00:00.000Z","version":"1.0.0"}
```

### Test with Frontend

1. Add a simple chat component to test the connection
2. Implement user authentication with Supabase
3. Test API key management in settings
4. Test voice recording (requires HTTPS in production)

## 📋 Integration Checklist

- [ ] Backend server running on port 3001
- [ ] Supabase database tables created
- [ ] Environment variables configured
- [ ] Frontend dependencies installed
- [ ] API client configured
- [ ] Authentication working
- [ ] Basic chat functionality
- [ ] Settings panel for API keys
- [ ] Voice recording (optional for initial testing)

## 🔧 Key Files to Integrate

### Backend Files (Ready to Use)
- `server.js` - Main server file
- `routes/chat.js` - Chat API endpoints
- `routes/voice.js` - Voice transcription endpoints
- `routes/settings.js` - Settings management
- `database.js` - Database operations
- `openaiService.js` - OpenAI API integration
- `auth.js` - Authentication middleware

### Frontend Files (Copy to your project)
- `src/lib/supabase.ts` - Supabase client
- `src/lib/api.ts` - API client for backend

### Database
- `database.sql` - Database schema and policies

## 🎯 Next Steps

1. **Start Simple**: Begin with text-only chat functionality
2. **Add Authentication**: Integrate with your existing auth system
3. **Settings Panel**: Allow users to manage their OpenAI API keys
4. **Voice Features**: Add voice recording and transcription
5. **UI Polish**: Style components to match your design system
6. **Testing**: Test all features thoroughly
7. **Deployment**: Deploy both frontend and backend

## 💡 Pro Tips

- **Development**: Use `npm run dev` for backend development
- **HTTPS Required**: Voice features need HTTPS in production
- **API Keys**: Users provide their own OpenAI keys for security
- **Rate Limiting**: Consider implementing rate limits for production
- **Error Handling**: The backend includes comprehensive error handling
- **Security**: All endpoints require authentication
- **Scalability**: Database uses Row Level Security for multi-tenant data

## 🆘 Need Help?

Check the full `integration_instructions.md` for detailed implementation guidance, including:
- Complete component examples
- Security best practices
- Deployment instructions
- Troubleshooting guide

## 🔐 Security Notes

- API keys are encrypted in the database
- All endpoints require JWT authentication
- Row Level Security prevents data leaks
- CORS is configured for development (update for production)
- File uploads are limited to 25MB
- Input validation on all endpoints

