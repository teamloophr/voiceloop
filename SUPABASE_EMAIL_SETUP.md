# Supabase Email Redirect & Template Customization Guide

This guide will help you fix the redirect error and customize your Supabase confirmation email with the VoiceLoop branding.

## 🔧 **Step 1: Update Supabase Dashboard Settings**

### **Site URL Configuration:**
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your VoiceLoop project
3. Navigate to **Settings** → **General**
4. Update the **Site URL** to: `http://localhost:5173` (for development)
5. Click **Save**

### **Redirect URLs Configuration:**
1. Navigate to **Settings** → **Authentication**
2. Scroll down to **URL Configuration**
3. Add these **Redirect URLs**:
   - `http://localhost:5173/auth`
   - `http://localhost:5173/profile`
   - `http://localhost:5173`
4. Click **Save**

## 📧 **Step 2: Customize Email Template**

### **Confirm Signup Email Template:**
1. Go to **Settings** → **Authentication** → **Email Templates**
2. Click on **Confirm signup** template
3. Replace the content with this custom HTML:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to VoiceLoop!</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .logo-container {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            width: 120px;
            height: auto;
            border-radius: 8px;
        }
        h1 {
            color: #1e40af;
            text-align: center;
            margin-bottom: 10px;
            font-size: 28px;
        }
        .subtitle {
            text-align: center;
            color: #6b7280;
            margin-bottom: 30px;
            font-size: 16px;
        }
        .button {
            display: inline-block;
            background: #1e40af;
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
        }
        .info-box {
            background: #f1f5f9;
            border-left: 4px solid #1e40af;
            padding: 20px;
            margin: 30px 0;
            border-radius: 0 8px 8px 0;
        }
        .steps {
            background: #f8fafc;
            padding: 25px;
            border-radius: 8px;
            margin: 25px 0;
        }
        .step {
            margin: 15px 0;
            padding-left: 20px;
            position: relative;
        }
        .step:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #059669;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo-container">
            <img src="your_supabase_storage_logo_url_here"
                 alt="VoiceLoop Logo"
                 class="logo">
        </div>
        
        <h1>🎉 Welcome to VoiceLoop!</h1>
        <p class="subtitle">AI-Powered HR Management with Voice Commands</p>
        
        <p>Hi there! 👋</p>
        
        <p>Thank you for joining VoiceLoop! We're excited to have you on board. You're just one step away from experiencing the future of HR management.</p>
        
        <div class="info-box">
            <strong>What is VoiceLoop?</strong><br>
            VoiceLoop is an intelligent HR platform that combines AI-powered document analysis, voice commands, and smart automation to streamline your HR processes.
        </div>
        
        <div style="text-align: center;">
            <a href="{{ .ConfirmationURL }}" class="button">Confirm Your Email Address</a>
        </div>
        
        <div class="steps">
            <h3>What happens next?</h3>
            <div class="step">Click the confirmation button above</div>
            <div class="step">You'll be redirected to VoiceLoop</div>
            <div class="step">Sign in with your email and password</div>
            <div class="step">Configure your API keys for AI features</div>
            <div class="step">Start uploading and analyzing documents!</div>
        </div>
        
        <p><strong>Key Features You'll Unlock:</strong></p>
        <ul>
            <li>🤖 AI-powered document analysis and summarization</li>
            <li>📁 Smart file upload with intelligent RAG recommendations</li>
            <li>🎤 Voice commands for hands-free operation</li>
            <li>🔐 Secure user authentication and API key management</li>
            <li>📊 Intelligent HR analytics and insights</li>
        </ul>
        
        <div class="info-box">
            <strong>Need Help?</strong><br>
            If you have any questions or need assistance, don't hesitate to reach out to our support team.
        </div>
        
        <div class="footer">
            <p>© 2024 VoiceLoop. All rights reserved.</p>
            <p>This email was sent to {{ .Email }}. If you didn't create this account, you can safely ignore this email.</p>
        </div>
    </div>
</body>
</html>
```

4. Click **Save** to update the template

## 🔄 **Step 3: Update Environment Variables**

### **Frontend Environment (.env.local):**
```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_SUPABASE_REDIRECT_URL=http://localhost:5173/auth
VITE_SUPABASE_SITE_URL=http://localhost:5173
```

### **Backend Environment (.env):**
```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 🧪 **Step 4: Test the Setup**

### **Test Email Confirmation:**
1. **Sign up** with a new email address
2. **Check your email** for the confirmation link
3. **Click the confirmation link**
4. **Verify** you're redirected to the auth page
5. **Sign in** with your credentials

### **Expected Behavior:**
- ✅ Email received with VoiceLoop branding
- ✅ Confirmation link works correctly
- ✅ Redirects to `/auth` page after confirmation
- ✅ User can sign in successfully

## 🚨 **Troubleshooting**

### **Common Issues:**

#### **1. Redirect Still Not Working:**
- Double-check redirect URLs in Supabase dashboard
- Ensure no trailing slashes in URLs
- Clear browser cache and cookies

#### **2. Email Template Not Updating:**
- Wait a few minutes for changes to propagate
- Check if you're editing the correct template
- Verify HTML syntax is valid

#### **3. Environment Variables Not Loading:**
- Restart your development server
- Check `.env` file syntax
- Verify variable names match exactly

#### **4. Logo Not Displaying:**
- Check the logo URL in the email template
- Ensure the logo is publicly accessible
- Verify Supabase storage permissions

## 🔒 **Security Notes:**

- ✅ **Never commit** `.env` files to version control
- ✅ **Use environment variables** for all sensitive data
- ✅ **Check .gitignore** to ensure proper exclusions
- ✅ **Rotate API keys** regularly for security

## 📚 **Additional Resources:**

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Supabase Redirect URLs](https://supabase.com/docs/guides/auth/auth-redirects)

---

**Next Steps:**
1. Update your Supabase dashboard settings
2. Customize the email template
3. Test the confirmation flow
4. Deploy with proper environment variables

Let me know if you encounter any issues during setup!
