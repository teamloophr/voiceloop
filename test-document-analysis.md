# 🧪 Document Analysis Test Guide

## Quick Test Setup

### 1. Start Both Services

**Terminal 1 - Backend:**
```bash
cd "File Uploads and Intelligent Processing"
python main.py
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 2. Test the Feature

1. **Navigate to Document Analysis**
   - Go to `http://localhost:5173/documents`
   - Or click "Document Analysis" in the header

2. **Test File Upload**
   - Try uploading a small PDF, DOCX, or CSV file
   - Watch the progress bar and status updates
   - Verify the document info displays correctly

3. **Test RAG Query**
   - Ask a simple question like "What is this document about?"
   - Check if you get an AI-generated response
   - Verify the relevant chunks are displayed

## 🎯 Test Scenarios

### Scenario 1: PDF Document
- **File**: Any small PDF (1-2 pages)
- **Test**: Upload and ask "Summarize the main points"
- **Expected**: AI response with document summary

### Scenario 2: CSV Data
- **File**: Simple CSV with employee data
- **Test**: Upload and ask "How many columns are there?"
- **Expected**: Accurate column count and data structure

### Scenario 3: Word Document
- **File**: DOCX file with text content
- **Test**: Upload and ask "What are the key topics?"
- **Expected**: AI-generated topic analysis

## 🔍 Troubleshooting Checklist

### Backend Issues
- [ ] Flask server running on port 5000
- [ ] OpenAI API key set correctly
- [ ] Required Python packages installed
- [ ] No CORS errors in browser console

### Frontend Issues
- [ ] React dev server running on port 5173
- [ ] No TypeScript compilation errors
- [ ] Components rendering correctly
- [ ] API calls reaching backend

### Common Error Messages
- **"Failed to fetch"**: Backend not running or CORS issue
- **"OpenAI API error"**: Check API key and quota
- **"File too large"**: File exceeds 10MB limit
- **"Invalid file type"**: File format not supported

## 🚀 Performance Testing

### File Size Limits
- **Small**: < 1MB (should process quickly)
- **Medium**: 1-5MB (moderate processing time)
- **Large**: 5-10MB (longer processing, test timeout handling)

### Response Time
- **Upload**: Should complete within 30 seconds for most files
- **Query**: Should respond within 10 seconds
- **Progress**: Should show real-time updates

## 📊 Success Metrics

### ✅ Working Correctly If:
- Files upload without errors
- Progress bars complete successfully
- Document metadata displays correctly
- AI queries return relevant answers
- UI is responsive and intuitive

### ❌ Needs Fixing If:
- Uploads fail or hang
- No progress indication
- Errors in browser console
- AI responses are generic or irrelevant
- UI is slow or unresponsive

## 🔧 Debug Commands

### Check Backend Status
```bash
curl http://localhost:5000/api/files/upload
```

### Check Frontend Build
```bash
npm run build
npm run preview
```

### Monitor Logs
```bash
# Backend logs will show in the Flask terminal
# Frontend logs will show in browser dev tools
```

## 🎉 Ready to Deploy!

Once all tests pass:
1. ✅ Backend processing works correctly
2. ✅ Frontend components render properly
3. ✅ File upload and RAG queries function
4. ✅ Error handling works as expected
5. ✅ Performance is acceptable

Your Document Analysis feature is ready for production use!

---

**Need Help?** Check the `DOCUMENT_ANALYSIS_SETUP.md` file for detailed setup instructions.

