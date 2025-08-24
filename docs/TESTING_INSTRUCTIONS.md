# Testing Instructions for Teamloop Dashboard

## 🚀 Quick Start Testing

Your API key has been configured for immediate testing! Here's how to get started:

### 1. **API Key Status** ✅
- **OpenAI API Key**: Hardcoded in `src/config/api.ts`
- **ElevenLabs API Key**: Hardcoded in `src/config/api.ts`
- **Environment**: Template available in `env.dashboard`
- **Real API Mode**: Enabled for production-quality voice synthesis

### 2. **Start the Dashboard**
```bash
# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

### 3. **Access the Dashboard**
- Open: `http://localhost:5173/dashboard`
- Or click "Dashboard" in the header navigation

## 🎯 What to Test

### **Voice Commands** (Click the "Voice" button in header)
Try these commands:
- "How many employees do we have?"
- "Show me training progress"
- "What's our hiring rate?"
- "Help"

### **AI Assistant** (Right sidebar)
- Type questions in the chat input
- Click command suggestions
- Test voice responses

### **Dashboard Features**
- View employee metrics
- Check activity feed
- Explore analytics charts
- Test responsive design

## 🔧 Configuration Options

### **Switch Between Mock and Real APIs**
Edit `src/config/api.ts`:
```typescript
export const API_CONFIG = {
  USE_MOCK_API: false, // Currently set to false for real APIs
  // ... other settings
};
```

### **Environment Variables**
Create `.env.local` from `env.dashboard`:
```bash
cp env.dashboard .env.local
```

### **API Key Management**
- **Development**: Hardcoded in `src/config/api.ts`
- **Production**: Use environment variables
- **Testing**: Mock mode with simulated responses

## 🐛 Troubleshooting

### **Voice Not Working?**
- Check browser permissions (microphone access)
- Try Chrome or Edge (best voice support)
- Check browser console for errors

### **API Errors?**
- Verify API key is correct in `src/config/api.ts`
- Check if mock mode is enabled
- Review browser console for error messages

### **Dashboard Not Loading?**
- Ensure all dependencies are installed
- Check for TypeScript compilation errors
- Verify component imports are correct

## 📱 Browser Compatibility

- **Chrome**: Full voice support ✅
- **Edge**: Good voice support ✅
- **Firefox**: Limited voice support ⚠️
- **Safari**: Basic voice support ⚠️

## 🎉 Success Indicators

When everything is working correctly, you should see:
- ✅ Dashboard loads with metrics and charts
- ✅ Voice button responds to clicks
- ✅ AI Assistant accepts text input
- ✅ Voice commands are processed
- ✅ Browser speech synthesis works
- ✅ No console errors

## 🔄 Next Steps After Testing

1. **Customize Voice Commands**: Edit `src/lib/voiceCommands.ts`
2. **Modify Dashboard Data**: Update `src/hooks/useDashboardData.ts`
3. **Add Real API Integration**: Set `USE_MOCK_API: false`
4. **Deploy to Production**: Build with `npm run build`

## 🆘 Need Help?

If you encounter issues:
1. Check the browser console for error messages
2. Verify all files are properly created
3. Ensure dependencies are installed
4. Test with different browsers
5. Review the component structure

Your dashboard is now ready for testing with the hardcoded API key! 🎯
