# 🎯 VoiceLoop Backend

A powerful AI-powered backend system that provides smart RAG (Retrieval-Augmented Generation) capabilities and MCP (Model Context Protocol) calendar integration for the VoiceLoop application.

## ✨ Features

### 🧠 **Smart RAG System**
- **Multi-format Document Processing**: PDF, DOCX, TXT, MD, CSV
- **Audio Transcription**: OpenAI Whisper integration
- **Intelligent Chunking**: Context-aware text segmentation
- **Vector Embeddings**: ChromaDB integration with sentence transformers
- **Hybrid Search**: Semantic + keyword search with AI enhancement
- **Smart Relevance Scoring**: Multi-factor result ranking

### 📅 **MCP Calendar Integration**
- **Natural Language Processing**: AI-powered command parsing
- **Calendar Operations**: Create, read, update, delete events
- **Time Expression Parsing**: "tomorrow at 3pm", "next Monday morning"
- **External Calendar Sync**: Google, Outlook integration ready
- **Smart Scheduling**: Free time slot detection and optimization

### 🔐 **Security & Authentication**
- **JWT-based Authentication**: Secure token management
- **File Validation**: Security checks and virus scanning
- **User Permissions**: Role-based access control
- **Rate Limiting**: API abuse prevention

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- OpenAI API key
- 4GB+ RAM (for vector processing)

### Installation

1. **Clone and navigate to the backend directory**
```bash
cd backend/voiceloop-backend
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Set up environment variables**
```bash
cp env.template .env
# Edit .env with your API keys
```

4. **Start the server**
```bash
python start.py
```

The server will be available at `http://localhost:5000`

## 🏗️ Architecture

### Core Services

```
VoiceLoop Backend
├── File Processing Service
│   ├── Document extraction (PDF, DOCX, TXT)
│   ├── Audio transcription (Whisper)
│   └── AI content analysis
├── RAG Service
│   ├── ChromaDB vector store
│   ├── Sentence transformers
│   ├── Smart chunking
│   └── Hybrid search
├── MCP Calendar Service
│   ├── Natural language parsing
│   ├── Calendar operations
│   └── Time expression handling
└── Authentication Service
    ├── JWT management
    └── User permissions
```

### Database Models

- **UploadedFile**: File metadata and processing status
- **DocumentAnalysis**: AI analysis results
- **KnowledgeDocument**: RAG document management
- **ContentChunk**: Text chunks with embeddings
- **CalendarEvent**: Calendar event data
- **MCPCommand**: Natural language command logs

## 📚 API Endpoints

### File Processing
- `POST /api/upload` - Upload and process files
- `GET /api/documents` - Get user documents
- `GET /api/documents/{id}` - Get specific document

### RAG Search
- `POST /api/rag/search` - Search knowledge base
- `GET /api/rag/stats` - Get knowledge base statistics

### Calendar Management
- `GET /api/calendar/events` - Get calendar events
- `POST /api/calendar/events` - Create calendar event
- `POST /api/calendar/natural-language` - Process natural language commands

### Voice & Audio
- `POST /api/voice/transcribe` - Transcribe audio files

## 🔧 Configuration

### Environment Variables

```bash
# OpenAI Configuration
OPENAI_API_KEY=your-api-key
OPENAI_API_BASE=https://api.openai.com/v1

# Database
DATABASE_URL=sqlite:///database/voiceloop.db

# JWT Security
JWT_SECRET_KEY=your-secret-key

# File Upload
MAX_FILE_SIZE=100MB
UPLOAD_FOLDER=uploads

# RAG Configuration
CHROMA_DB_PATH=database/chroma
EMBEDDING_MODEL=all-MiniLM-L6-v2
```

### File Size Limits

- **Documents**: 100MB max
- **Audio**: 100MB max
- **Supported Formats**: PDF, DOCX, TXT, MD, CSV, WAV, MP3, M4A, WEBM, OGG

## 🧪 Testing

### Health Check
```bash
curl http://localhost:5000/api/health
```

### File Upload Test
```bash
curl -X POST -F "file=@test.pdf" -F "user_id=test-user" \
  http://localhost:5000/api/upload
```

### RAG Search Test
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"query": "project timeline", "user_id": "test-user"}' \
  http://localhost:5000/api/rag/search
```

### Natural Language Calendar Test
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"user_id": "test-user", "command": "schedule meeting with John tomorrow at 3pm"}' \
  http://localhost:5000/api/calendar/natural-language
```

## 🔍 Monitoring & Logs

### Log Files
- Application logs: `logs/voiceloop.log`
- Database: `database/voiceloop.db`
- Vector store: `database/chroma/`

### Health Metrics
- API response times
- File processing success rates
- RAG search performance
- Calendar operation statistics

## 🚀 Deployment

### Production Considerations

1. **Use a production WSGI server** (Gunicorn, uWSGI)
2. **Set up proper logging and monitoring**
3. **Configure environment variables securely**
4. **Set up database backups**
5. **Enable rate limiting and security headers**

### Docker Deployment

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5000

CMD ["python", "start.py"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the API documentation at `/api/health`
- Review the logs in the `logs/` directory
- Open an issue in the repository

## 🔮 Roadmap

- [ ] Real-time collaboration features
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Enhanced security features
- [ ] Performance optimizations
- [ ] Mobile app integration
