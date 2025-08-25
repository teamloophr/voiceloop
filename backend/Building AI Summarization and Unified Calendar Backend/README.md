# VoiceLoop Backend - AI Summarization and Unified Calendar Backend

A powerful Flask-based backend that provides AI-powered document processing, smart RAG (Retrieval-Augmented Generation) using Supabase with pgvector, and MCP (Model Context Protocol) calendar management.

## 🚀 Features

### **AI Document Processing**
- **Multi-format Support**: PDF, DOCX, TXT, MD, CSV files
- **Audio Transcription**: WAV, MP3, M4A, WEBM, OGG using OpenAI Whisper
- **Intelligent Analysis**: AI-powered content summarization and key point extraction
- **Smart Chunking**: Intelligent document segmentation for optimal RAG performance

### **Smart RAG System with Supabase**
- **Vector Embeddings**: OpenAI ada-002 embeddings stored in Supabase pgvector
- **Hybrid Search**: Combines semantic (vector similarity) and keyword (full-text) search
- **Intelligent Chunking**: Overlapping chunks with metadata preservation
- **AI-Enhanced Results**: GPT-powered search result analysis and insights
- **Real-time Updates**: Live document indexing and search

### **MCP Calendar Management**
- **Natural Language Processing**: AI-powered calendar command interpretation
- **Smart Scheduling**: Intelligent time expression parsing and event creation
- **Event Management**: Create, read, update, delete calendar events
- **Integration Ready**: External calendar service connections (Google, Outlook, iCal)
- **Reminder System**: Configurable notifications and alerts

### **Security & Authentication**
- **JWT-based Security**: Secure token management with refresh capabilities
- **Row Level Security**: Supabase RLS policies for data isolation
- **User Management**: Multi-user support with isolated data access
- **API Key Management**: Secure storage of user-specific API keys

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Flask API     │    │   Supabase      │    │   AI Services   │
│   (Python)      │◄──►│   (PostgreSQL)  │◄──►│   (OpenAI API)  │
│                 │    │   + pgvector    │    │                 │
│ • File Upload   │    │ • Vector Store  │    │ • GPT-4 Chat    │
│ • RAG Search    │    │ • RLS Security  │    │ • Whisper STT   │
│ • Calendar MCP  │    │ • Real-time     │    │ • Embeddings    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Technology Stack

### **Backend Framework**
- **Flask 3.0** - Modern Python web framework
- **SQLAlchemy** - Database ORM and management
- **Flask-CORS** - Cross-origin resource sharing

### **Database & Vector Storage**
- **Supabase** - PostgreSQL database with real-time features
- **pgvector** - Vector similarity search extension
- **Row Level Security** - Data isolation and access control

### **AI & Machine Learning**
- **OpenAI API** - GPT-4 for analysis, Whisper for transcription
- **Sentence Transformers** - Local embedding generation fallback
- **Vector Similarity** - Cosine similarity for semantic search

### **File Processing**
- **PyPDF2** - PDF text extraction
- **python-docx** - DOCX document processing
- **OpenAI Whisper** - Audio transcription

## 📋 Prerequisites

- **Python 3.8+** with pip
- **Supabase Account** with PostgreSQL project
- **OpenAI API Key** for AI features
- **Redis** (optional, for background tasks)

## 🚀 Quick Start

### 1. **Clone and Setup**
```bash
# Navigate to the backend directory
cd "Building AI Summarization and Unified Calendar Backend"

# Install Python dependencies
pip install -r requirements.txt
```

### 2. **Environment Configuration**
```bash
# Copy environment template
cp env.template .env

# Edit .env with your credentials
nano .env
```

**Required Environment Variables:**
```env
# Supabase Configuration (Required)
SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-ROLE-KEY]

# Database Configuration
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here

# Flask Configuration
SECRET_KEY=your-secret-key-here
FLASK_ENV=development
PORT=5000
```

### 3. **Database Setup**
1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `supabase_schema.sql`
4. Run the SQL commands to create tables and enable pgvector

### 4. **Start the Server**
```bash
# Development mode
python app.py

# Or use the start script
python start.py
```

The server will run on `http://localhost:5000`

## 📚 API Endpoints

### **Health Check**
- `GET /api/health` - Server status and configuration

### **File Management**
- `POST /api/upload` - Upload and process documents
- `GET /api/documents` - Get user documents
- `GET /api/documents/<file_id>` - Get specific document

### **RAG Search**
- `POST /api/rag/search` - Search knowledge base
  - `search_type`: 'semantic', 'keyword', 'hybrid'
  - `enhance_results`: true/false for AI enhancement

### **Calendar Management**
- `GET /api/calendar/events` - Get user events
- `POST /api/calendar/events` - Create new event
- `POST /api/calendar/natural-language` - Process natural language commands

### **Voice & Audio**
- `POST /api/voice/transcribe` - Transcribe audio files

### **Smart Search**
- `POST /api/smart-search` - Cross-platform search across all data

## 🔧 Configuration

### **RAG Settings**
```env
CHUNK_SIZE=1000          # Document chunk size in characters
CHUNK_OVERLAP=200        # Overlap between chunks
EMBEDDING_MODEL=text-embedding-ada-002
```

### **File Upload Limits**
```env
MAX_FILE_SIZE=100MB      # Maximum file size
ALLOWED_EXTENSIONS=pdf,docx,txt,md,csv,wav,mp3,m4a,webm,ogg
```

### **CORS Configuration**
```env
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

## 🧪 Testing

### **Health Check**
```bash
curl http://localhost:5000/api/health
```

### **File Upload Test**
```bash
curl -X POST -F "file=@test_document.txt" http://localhost:5000/api/upload
```

### **RAG Search Test**
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"query": "test query", "user_id": "test-user", "search_type": "hybrid"}' \
  http://localhost:5000/api/rag/search
```

## 🚀 Deployment

### **Production Considerations**
1. **Environment Variables**: Secure all sensitive configuration
2. **Database**: Use production Supabase instance
3. **File Storage**: Configure secure file upload directory
4. **CORS**: Restrict origins to production domains
5. **SSL**: Enable HTTPS for production

### **Docker Deployment**
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5000

CMD ["python", "app.py"]
```

## 📊 Performance Optimization

### **Vector Search Optimization**
- **IVFFlat Indexes**: Optimized for similarity search
- **Batch Processing**: Efficient document chunking
- **Caching**: Redis-based result caching

### **Database Optimization**
- **Connection Pooling**: Efficient database connections
- **Indexing**: Strategic database indexes
- **Query Optimization**: Optimized SQL queries

## 🔒 Security Features

### **Data Protection**
- **Row Level Security**: User data isolation
- **JWT Authentication**: Secure token management
- **Input Validation**: Comprehensive request validation
- **File Type Validation**: Secure file upload restrictions

### **API Security**
- **Rate Limiting**: Prevent abuse
- **CORS Protection**: Cross-origin security
- **Input Sanitization**: XSS and injection protection

## 🛠️ Development

### **Project Structure**
```
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── env.template          # Environment configuration template
├── supabase_schema.sql   # Database schema
├── models/               # SQLAlchemy models
│   ├── document_models.py
│   ├── knowledge_models.py
│   └── calendar_models.py
├── services/             # Business logic services
│   ├── file_processor.py
│   ├── rag_service.py
│   ├── mcp_calendar.py
│   └── auth_service.py
└── start.py              # Server startup script
```

### **Adding New Features**
1. **Models**: Define new SQLAlchemy models
2. **Services**: Implement business logic
3. **API Routes**: Add new endpoints
4. **Database**: Update schema and migrations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests and documentation
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs and feature requests via GitHub issues
- **Community**: Join our development community

## 🗺️ Roadmap

### **Phase 1: Core Features** ✅
- [x] Document processing and analysis
- [x] RAG system with Supabase
- [x] Basic calendar management
- [x] Authentication and security

### **Phase 2: Advanced Features** 🚧
- [ ] Real-time collaboration
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Advanced calendar integrations

### **Phase 3: Enterprise Features** 📋
- [ ] Team management and permissions
- [ ] Advanced workflow automation
- [ ] Compliance and audit logging
- [ ] Enterprise SSO integration

---

**Built with ❤️ by the VoiceLoop Team**

Transform your document workflow with AI-powered intelligence and smart calendar management!
