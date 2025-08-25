# VoiceLoop Authentication Setup Guide

This guide will help you set up the complete authentication system for VoiceLoop, including user registration, login, and API key management.

## 🚀 **Overview**

VoiceLoop uses **Supabase** for authentication and user management, providing:
- 🔐 Secure user registration and login
- 🔑 API key storage and management
- 🛡️ Row-level security (RLS)
- 📧 Email confirmation workflow
- 🔄 Session management

## 🔧 **Prerequisites**

### **Required Services:**
- [Supabase Account](https://supabase.com) (Free tier works)
- [OpenAI API Key](https://platform.openai.com/api-keys) (Optional)
- [ElevenLabs API Key](https://elevenlabs.io) (Optional)

### **Environment Variables:**
```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_SUPABASE_REDIRECT_URL=http://localhost:5173/auth
VITE_SUPABASE_SITE_URL=http://localhost:5173
```

## 🗄️ **Database Setup**

### **1. Create User Settings Table**

Run this SQL in your Supabase SQL Editor:

```sql
-- Create user_settings table for storing API keys and preferences
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  openai_api_key TEXT,
  elevenlabs_api_key TEXT,
  voice_enabled BOOLEAN DEFAULT true,
  ai_chat_enabled BOOLEAN DEFAULT true,
  rag_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to ensure users can only access their own settings
CREATE POLICY "Users can only access their own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create settings for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### **2. Verify Table Creation**

Check that the table was created successfully:
```sql
SELECT * FROM user_settings LIMIT 5;
```

## 🔐 **Authentication Flow**

### **User Registration:**
1. User visits `/auth` page
2. Clicks "Sign Up" and enters email/password
3. Supabase sends confirmation email
4. User clicks confirmation link
5. Account is activated and user can sign in

### **User Login:**
1. User visits `/auth` page
2. Enters email/password
3. Supabase validates credentials
4. User is redirected to dashboard
5. Session is maintained across app

### **API Key Management:**
1. User signs in and goes to `/profile`
2. Enters OpenAI and/or ElevenLabs API keys
3. Keys are encrypted and stored in `user_settings`
4. Keys are used for AI features based on user preferences

## 🎯 **Feature Access Control**

### **Voice Features:**
- **Requires:** ElevenLabs API key OR OpenAI TTS fallback
- **Fallback:** Browser's built-in speech synthesis
- **User Control:** Can enable/disable in profile

### **AI Chat Features:**
- **Requires:** OpenAI API key
- **Fallback:** Basic chat without AI responses
- **User Control:** Can enable/disable in profile

### **RAG Features:**
- **Requires:** OpenAI API key for embeddings
- **Fallback:** Basic document storage without AI analysis
- **User Control:** Can enable/disable in profile

## 🧪 **Testing the Setup**

### **1. Test User Registration:**
```bash
# Start your app
npm run dev

# Visit http://localhost:5173/auth
# Create a new account
# Check email for confirmation
```

### **2. Test User Login:**
```bash
# Confirm your email
# Sign in with credentials
# Verify you're redirected to dashboard
```

### **3. Test API Key Management:**
```bash
# Go to /profile
# Enter test API keys
# Verify keys are saved
# Test AI features
```

## 🚨 **Troubleshooting**

### **Common Issues:**

#### **1. "Email not confirmed" Error:**
- Check spam folder for confirmation email
- Verify Supabase email settings
- Resend confirmation email if needed

#### **2. API Keys Not Saving:**
- Check browser console for errors
- Verify RLS policies are correct
- Check user authentication status

#### **3. Features Not Working:**
- Verify API keys are valid
- Check feature flags in user settings
- Test API keys independently

#### **4. Redirect Issues:**
- Check Supabase redirect URLs
- Verify environment variables
- Clear browser cache

## 🔒 **Security Features**

### **Data Protection:**
- ✅ **Row Level Security (RLS)** - Users only see their data
- ✅ **Encrypted API Keys** - Sensitive data is protected
- ✅ **Session Management** - Secure authentication tokens
- ✅ **Input Validation** - Prevents injection attacks

### **Best Practices:**
- 🔑 **Never expose API keys** in client-side code
- 🔄 **Rotate API keys** regularly
- 📧 **Use email confirmation** for account verification
- 🛡️ **Enable RLS** on all user tables

## 📚 **API Reference**

### **Authentication Functions:**
```typescript
// Sign up new user
const { data, error } = await signUp(email, password)

// Sign in existing user
const { data, error } = await signIn(email, password)

// Sign out user
const { error } = await signOut()

// Get current user
const { user, error } = await getCurrentUser()

// Get current session
const { session, error } = await getSession()
```

### **User Settings Functions:**
```typescript
// Get user settings
const { data, error } = await supabase
  .from('user_settings')
  .select('*')
  .eq('user_id', user.id)
  .single()

// Update API keys
const { error } = await supabase
  .from('user_settings')
  .update({ 
    openai_api_key: 'sk-...',
    elevenlabs_api_key: '...'
  })
  .eq('user_id', user.id)
```

## 🚀 **Next Steps**

### **Immediate Actions:**
1. ✅ Set up Supabase project
2. ✅ Create database tables
3. ✅ Configure environment variables
4. ✅ Test authentication flow
5. ✅ Test API key management

### **Future Enhancements:**
- 🔐 **Two-factor authentication**
- 📱 **Social login providers**
- 🔄 **Password reset functionality**
- 📊 **User activity logging**
- 🎨 **Custom user profiles**

---

**Need Help?**
- Check the [Supabase Documentation](https://supabase.com/docs)
- Review the [VoiceLoop GitHub Repository](https://github.com/teamloophr/voiceloop)
- Contact the development team

---

**Document Version:** 1.0  
**Last Updated:** December 2024  
**Next Review:** After deployment
