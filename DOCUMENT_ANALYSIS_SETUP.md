# Document Analysis Setup Guide

## 🚀 New Feature: AI-Powered Document Analysis

Your VoiceLoop HR platform now includes advanced document analysis capabilities with Retrieval Augmented Generation (RAG)!

## ✨ What's New

- **File Upload**: Support for PDF, DOCX, and CSV files
- **AI Processing**: Automatic text extraction and vector embedding generation
- **RAG System**: Ask questions about your documents and get AI-powered answers
- **Smart Chunking**: Intelligent text segmentation for better analysis
- **Real-time Processing**: Immediate file analysis and insights

## 🏗️ Architecture

### Frontend Components
- `FileUpload.tsx` - Drag & drop file upload with progress tracking
- `RAGQuery.tsx` - AI-powered question answering interface
- `DocumentAnalysis.tsx` - Main component combining upload and query
- `DocumentAnalysisPage.tsx` - Page wrapper with header/footer

### Backend Integration
- **Flask Backend**: Already implemented in `File Uploads and Intelligent Processing/`
- **API Endpoints**: 
  - `POST /api/files/upload` - File processing and embedding generation
  - `POST /api/files/query` - RAG query system
- **File Types**: PDF, DOCX, CSV with intelligent processing

## 🚀 Quick Start

### 1. Start the Backend

```bash
# Navigate to the backend directory
cd "File Uploads and Intelligent Processing"

# Install Python dependencies (if not already done)
pip install PyPDF2 python-docx pandas openai flask-cors numpy

# Set your OpenAI API key
export OPENAI_API_KEY=your_api_key_here

# Start the Flask server
python main.py
```

The backend will be available at `http://localhost:5000`

### 2. Start the Frontend

```bash
# In a new terminal, from the project root
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 3. Access Document Analysis

- Navigate to `/documents` or click "Document Analysis" in the header
- Upload a PDF, DOCX, or CSV file
- Ask questions about your document using the AI interface

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```bash
OPENAI_API_KEY=your_openai_api_key_here
FLASK_ENV=development
FLASK_DEBUG=True
```

**Frontend (.env.local):**
```bash
VITE_OPENAI_API_KEY=your_openai_key_here
VITE_ELEVENLABS_API_KEY=your_elevenlabs_key_here
```

### API Configuration

The frontend is configured to connect to `http://localhost:5000` for the backend API. If you need to change this, update the fetch URLs in:
- `FileUpload.tsx` (line ~95)
- `RAGQuery.tsx` (line ~45)

## 📁 File Structure

```
src/
├── components/
│   ├── FileUpload.tsx          # File upload component
│   ├── RAGQuery.tsx            # AI query interface
│   ├── DocumentAnalysis.tsx    # Main analysis component
│   └── ...
├── pages/
│   ├── DocumentAnalysisPage.tsx # Analysis page wrapper
│   └── ...
└── App.tsx                     # Updated with /documents route
```

## 🎯 Usage Examples

### Upload a Document
1. Drag & drop or click to select a file
2. Supported formats: PDF, DOCX, CSV (up to 10MB)
3. Watch real-time processing progress
4. View document summary and statistics

### Ask Questions
- "What is the main topic of this document?"
- "Summarize the key findings"
- "What are the main recommendations?"
- "Extract the important data points"

### Document Types

**PDF/DOCX:**
- Text extraction and chunking
- Semantic analysis and insights
- Content summarization

**CSV:**
- Data structure analysis
- Column and row statistics
- Intelligent data interpretation

## 🔍 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure Flask-CORS is installed and enabled
2. **File Upload Fails**: Check file size (10MB limit) and format
3. **OpenAI API Errors**: Verify API key and quota
4. **Backend Connection**: Ensure Flask server is running on port 5000

### Debug Mode

Enable Flask debug logging:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Check API Status

Test backend connectivity:
```bash
curl http://localhost:5000/api/files/upload
```

## 🚀 Next Steps

### Immediate Enhancements
1. **Persistent Storage**: Save document metadata and embeddings
2. **User Authentication**: Secure file access and storage
3. **File Management**: List, organize, and delete uploaded documents

### Advanced Features
1. **Vector Database**: Integrate Pinecone/Weaviate for better search
2. **Batch Processing**: Handle multiple files simultaneously
3. **Custom Chunking**: Advanced text segmentation strategies
4. **Export Results**: Download analysis reports and insights

### Performance Optimization
1. **Caching**: Cache embeddings and query results
2. **Async Processing**: Background file processing
3. **Rate Limiting**: API usage optimization

## 🎉 You're Ready!

Your VoiceLoop platform now has enterprise-grade document analysis capabilities. Upload documents, ask questions, and get AI-powered insights to enhance your HR workflows!

---

**Need Help?** Check the existing documentation in the `File Uploads and Intelligent Processing/` folder for detailed backend implementation details.

