# VoiceLoop RAG Enhancement - Development Instructions

## Overview

This document provides comprehensive instructions for setting up and developing the enhanced VoiceLoop HR platform with PDF/DOCX/CSV file upload capabilities and Retrieval Augmented Generation (RAG) functionality.

## Prerequisites

### System Requirements
- **Node.js**: 18+ with npm
- **Python**: 3.11+ with pip
- **Git**: For version control
- **OpenAI API Key**: For embeddings and chat completions
- **ElevenLabs API Key**: For text-to-speech (existing feature)

### Development Environment
- **Operating System**: Ubuntu 22.04 (recommended) or compatible Linux/macOS
- **IDE**: VS Code, PyCharm, or similar
- **Browser**: Chrome/Firefox for testing

## Project Structure

```
voiceloop-project/
├── human-light-mode/          # Frontend React application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── voiceloop-backend/         # Backend Flask application
│   ├── src/
│   │   ├── routes/
│   │   │   ├── user.py
│   │   │   └── file_upload.py
│   │   ├── models/
│   │   ├── static/
│   │   └── main.py
│   ├── venv/
│   ├── requirements.txt
│   └── ...
└── DEVELOPMENT_INSTRUCTIONS.md
```

## Backend Setup

### 1. Clone and Setup Backend

```bash
# Navigate to your project directory
cd /path/to/your/project

# Backend is already created using manus-create-flask-app
cd voiceloop-backend

# Activate virtual environment
source venv/bin/activate

# Install additional dependencies (already done)
pip install PyPDF2 python-docx pandas openai flask-cors numpy

# Update requirements.txt
pip freeze > requirements.txt
```

### 2. Environment Variables

Create a `.env` file in the backend root:

```bash
# voiceloop-backend/.env
OPENAI_API_KEY=your_openai_api_key_here
FLASK_ENV=development
FLASK_DEBUG=True
```

### 3. Backend Configuration

The main Flask application (`src/main.py`) needs to be updated to include CORS and the file upload blueprint:

```python
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.user import db
from src.routes.user import user_bp
from src.routes.file_upload import file_upload_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

# Enable CORS for all routes
CORS(app)

# Register blueprints
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(file_upload_bp, url_prefix='/api/files')

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    db.create_all()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
```

### 4. Start Backend Server

```bash
# From voiceloop-backend directory with venv activated
python src/main.py
```

The backend will be available at `http://localhost:5000`

## Frontend Setup

### 1. Setup Frontend

```bash
# Navigate to the frontend directory
cd human-light-mode

# Install dependencies
npm install

# Install additional dependencies for file upload
npm install axios react-dropzone

# Set up environment variables
cp env.example .env.local
```

### 2. Environment Variables

Update `.env.local` with your API keys:

```bash
# OpenAI API Key (required for Whisper)
VITE_OPENAI_API_KEY=your_openai_key_here

# ElevenLabs API Key (required for TTS)
VITE_ELEVENLABS_API_KEY=your_elevenlabs_key_here

# Backend API URL
VITE_API_BASE_URL=http://localhost:5000
```

### 3. Start Frontend Development Server

```bash
# From human-light-mode directory
npm run dev
```

The frontend will be available at `http://localhost:5173`

## API Endpoints

### File Upload Endpoints

#### 1. Upload File
- **URL**: `POST /api/files/upload`
- **Content-Type**: `multipart/form-data`
- **Body**: Form data with `file` field
- **Supported formats**: PDF, DOCX, CSV
- **Response**: 
  ```json
  {
    "success": true,
    "message": "File processed successfully",
    "data": {
      "type": "pdf|docx|csv",
      "filename": "example.pdf",
      "text_length": 1500,
      "chunks_count": 3,
      "embeddings_count": 3,
      "preview": "First 500 characters...",
      "embeddings": [...]
    }
  }
  ```

#### 2. Query RAG System
- **URL**: `POST /api/files/query`
- **Content-Type**: `application/json`
- **Body**:
  ```json
  {
    "query": "What is the main topic of the document?",
    "embeddings": [...] // Embeddings from upload response
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "query": "What is the main topic of the document?",
    "answer": "Based on the document...",
    "relevant_chunks": [...],
    "context_used": "..."
  }
  ```

## Frontend Integration

### 1. Create File Upload Component

Create `src/components/FileUpload.tsx`:

```typescript
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

interface FileUploadProps {
  onUploadSuccess: (data: any) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setUploadStatus('Uploading and processing file...');

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/files/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        setUploadStatus('File processed successfully!');
        onUploadSuccess(response.data.data);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('Error uploading file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/csv': ['.csv'],
    },
    multiple: false,
  });

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="text-blue-600">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p>Processing file...</p>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">
              {isDragActive
                ? 'Drop the file here...'
                : 'Drag & drop a file here, or click to select'}
            </p>
            <p className="text-sm text-gray-400">
              Supports PDF, DOCX, and CSV files
            </p>
          </div>
        )}
      </div>
      {uploadStatus && (
        <p className={`mt-2 text-sm ${uploadStatus.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
          {uploadStatus}
        </p>
      )}
    </div>
  );
};

export default FileUpload;
```

### 2. Create RAG Query Component

Create `src/components/RAGQuery.tsx`:

```typescript
import React, { useState } from 'react';
import axios from 'axios';

interface RAGQueryProps {
  embeddings: any[];
  filename: string;
}

const RAGQuery: React.FC<RAGQueryProps> = ({ embeddings, filename }) => {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleQuery = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/files/query`,
        {
          query,
          embeddings,
        }
      );

      if (response.data.success) {
        setAnswer(response.data.answer);
      }
    } catch (error) {
      console.error('Query error:', error);
      setAnswer('Error processing query. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-6">
      <h3 className="text-lg font-semibold mb-4">
        Query Document: {filename}
      </h3>
      
      <div className="space-y-4">
        <div>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question about the uploaded document..."
            className="w-full p-3 border border-gray-300 rounded-lg resize-none"
            rows={3}
          />
        </div>
        
        <button
          onClick={handleQuery}
          disabled={loading || !query.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Ask Question'}
        </button>
        
        {answer && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Answer:</h4>
            <p className="text-gray-700 whitespace-pre-wrap">{answer}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RAGQuery;
```

## Development Workflow

### 1. Daily Development Setup

```bash
# Terminal 1: Start Backend
cd voiceloop-backend
source venv/bin/activate
python src/main.py

# Terminal 2: Start Frontend
cd human-light-mode
npm run dev
```

### 2. Testing File Upload

1. Navigate to `http://localhost:5173`
2. Use the file upload component to upload a PDF, DOCX, or CSV file
3. Verify the file is processed and embeddings are generated
4. Test the RAG query functionality with questions about the uploaded content

### 3. API Testing with curl

```bash
# Test file upload
curl -X POST \
  http://localhost:5000/api/files/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/your/document.pdf"

# Test RAG query (replace embeddings with actual data from upload response)
curl -X POST \
  http://localhost:5000/api/files/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is this document about?",
    "embeddings": [...]
  }'
```

## Deployment

### 1. Build Frontend

```bash
cd human-light-mode
npm run build
```

### 2. Copy Frontend Build to Backend

```bash
# Copy built frontend to Flask static directory
cp -r human-light-mode/dist/* voiceloop-backend/src/static/
```

### 3. Deploy Backend

```bash
cd voiceloop-backend
source venv/bin/activate
pip freeze > requirements.txt

# Deploy using your preferred method (e.g., service_deploy_backend tool)
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure `flask-cors` is installed and CORS is enabled in the Flask app
2. **File Upload Errors**: Check file size limits and ensure proper file types
3. **OpenAI API Errors**: Verify API key is set correctly in environment variables
4. **Embedding Generation Fails**: Check OpenAI API quota and rate limits

### Debug Mode

Enable debug logging in Flask:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Environment Variables Check

```bash
# Backend
echo $OPENAI_API_KEY

# Frontend
echo $VITE_OPENAI_API_KEY
echo $VITE_API_BASE_URL
```

## Next Steps

1. **Persistent Storage**: Implement database storage for embeddings and file metadata
2. **Vector Database**: Integrate with Pinecone, Weaviate, or PGVector for better similarity search
3. **User Authentication**: Add user-specific file storage and access control
4. **File Management**: Add file listing, deletion, and organization features
5. **Advanced RAG**: Implement more sophisticated chunking and retrieval strategies
6. **Performance Optimization**: Add caching and optimize embedding generation

## Security Considerations

1. **File Validation**: Implement thorough file type and content validation
2. **Size Limits**: Set appropriate file size limits
3. **API Rate Limiting**: Implement rate limiting for API endpoints
4. **Data Encryption**: Encrypt sensitive data at rest and in transit
5. **Access Control**: Implement proper authentication and authorization

---

For additional support or questions, refer to the project documentation or contact the development team.

