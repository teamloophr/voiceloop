# 🚀 Supabase RAG System Setup Guide

## ✨ What This Solves

The "Failed to fetch" error was occurring because your RAG system was only processing files in memory without persistent storage. This Supabase integration provides:

- **Persistent Document Storage** - Documents and embeddings are saved permanently
- **Vector Search Capabilities** - Fast similarity search across all documents
- **Employee Association** - Link documents to specific employees
- **Scalable Architecture** - PostgreSQL database with real-time capabilities

## 🏗️ Architecture Overview

```
Frontend (React) → Flask Backend → Supabase (PostgreSQL + pgvector)
     ↓                    ↓                    ↓
File Upload    →  Text Processing  →  Document Storage
     ↓                    ↓                    ↓
RAG Queries    →  Vector Search    →  AI Responses
```

## 🔧 Prerequisites

### 1. **Supabase Account**
- Sign up at [supabase.com](https://supabase.com)
- Create a new project
- Note your project URL and API keys

### 2. **OpenAI API Key**
- Get your API key from [platform.openai.com](https://platform.openai.com)
- Ensure you have credits for embeddings and GPT

### 3. **Python Environment**
- Python 3.8+ installed
- pip package manager

## 🚀 Setup Steps

### Step 1: Install Dependencies

```bash
cd "File Uploads and Intelligent Processing"
pip install -r requirements.txt
```

### Step 2: Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
# Copy the template
cp env.example .env

# Edit with your actual values
nano .env
```

Fill in your actual values:

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-your-actual-openai-key

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key
SUPABASE_ANON_KEY=your-actual-anon-key

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your-secret-key-here
```

### Step 3: Enable pgvector Extension in Supabase

1. **Go to your Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Run this command:**

```sql
-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify it's enabled
SELECT * FROM pg_extension WHERE extname = 'vector';
```

### Step 4: Create Database Tables

In the Supabase SQL Editor, run:

```sql
-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    employee_id TEXT,
    employee_name TEXT,
    metadata JSONB,
    total_chunks INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create document_chunks table
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    text_content TEXT NOT NULL,
    embedding_vector VECTOR(1536), -- OpenAI ada-002 dimension
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_employee_id ON documents(employee_id);
CREATE INDEX IF NOT EXISTS idx_documents_file_type ON documents(file_type);
CREATE INDEX IF NOT EXISTS idx_documents_upload_date ON documents(upload_date);
CREATE INDEX IF NOT EXISTS idx_chunks_document_id ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_chunks_chunk_index ON document_chunks(chunk_index);
```

### Step 5: Test the Setup

```bash
# Start the Flask backend
python main.py
```

The server should start without errors. Check the console for any initialization messages.

## 🔍 Testing the RAG System

### 1. **Upload a Document**
- Use the frontend file upload interface
- Check the Flask console for processing logs
- Verify the document appears in Supabase dashboard

### 2. **Query the System**
- Ask a question about your uploaded document
- The system should return relevant chunks and AI-generated answers

### 3. **Check Database**
- Go to Supabase Dashboard → Table Editor
- Verify documents and chunks are being stored

## 📊 New API Endpoints

Your RAG system now includes these endpoints:

### **File Upload & Processing**
- `POST /api/files/upload` - Upload and process documents
- `POST /api/files/query` - Query documents with AI

### **Document Management**
- `GET /api/files/documents` - List all documents
- `GET /api/files/documents?employee_id=X` - Get employee documents
- `GET /api/files/documents/<id>` - Get specific document
- `DELETE /api/files/documents/<id>` - Delete document
- `GET /api/files/stats` - Get system statistics

## 🔧 Troubleshooting

### **Common Issues**

1. **"pgvector extension not enabled"**
   - Run the SQL command to enable pgvector in Supabase

2. **"Failed to fetch" still occurring**
   - Check that Flask backend is running
   - Verify environment variables are set correctly
   - Check Supabase connection

3. **"OpenAI API error"**
   - Verify your OpenAI API key is correct
   - Check your OpenAI account has credits

4. **"Supabase connection failed"**
   - Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
   - Check your Supabase project is active

### **Debug Mode**

Enable detailed logging in Flask:

```python
# In main.py
app.run(host='0.0.0.0', port=5000, debug=True, log_level='DEBUG')
```

## 🎯 Benefits of This Setup

### **Immediate Improvements**
- ✅ Documents persist between server restarts
- ✅ Fast vector similarity search
- ✅ Employee document association
- ✅ Scalable database architecture

### **Long-term Advantages**
- 🚀 Real-time document updates
- 🚀 Advanced analytics and reporting
- 🚀 Multi-user document access
- 🚀 Backup and recovery capabilities

## 🔮 Next Steps

### **Advanced Features to Add**
1. **Document Versioning** - Track document changes over time
2. **Access Control** - User permissions for documents
3. **Batch Processing** - Handle multiple files simultaneously
4. **Export Capabilities** - Download processed documents
5. **Analytics Dashboard** - Document usage insights

### **Performance Optimization**
1. **Embedding Caching** - Cache frequently used embeddings
2. **Batch Embedding** - Process multiple chunks together
3. **Async Processing** - Background document processing
4. **CDN Integration** - Fast file delivery

## 🎉 You're Ready!

Your RAG system now has enterprise-grade capabilities with:
- **Persistent storage** in Supabase
- **Vector similarity search** with pgvector
- **Employee document management**
- **Scalable architecture** for growth

**Next Steps**: Test the system, upload some documents, and start asking questions! The "Failed to fetch" error should be completely resolved.

---

## 📞 Need Help?

- Check the Flask console for error messages
- Verify your environment variables
- Ensure Supabase tables are created correctly
- Test with a simple PDF document first
