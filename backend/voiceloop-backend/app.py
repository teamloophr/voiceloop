import os
import sys
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'voiceloop-secret-key-2024')
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max file size

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'DATABASE_URL', 
    f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'voiceloop.db')}"
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Enable CORS
CORS(app, origins=["http://localhost:5173", "http://localhost:3000", "https://main.d1fx10pzvtm51o.amplifyapp.com", "*"])

# Initialize database
db = SQLAlchemy(app)

# Import models and services
from models.document_models import UploadedFile, DocumentAnalysis, ProcessingJob
from models.knowledge_models import KnowledgeDocument, ContentChunk, SearchQuery
from models.calendar_models import CalendarEvent, CalendarIntegration
from services.file_processor import FileProcessingService
from services.rag_service import RAGService
from services.mcp_calendar import MCPCalendarService
from services.auth_service import AuthService

# Initialize services
file_processor = FileProcessingService()
rag_service = RAGService()
mcp_calendar = MCPCalendarService()
auth_service = AuthService()

# Create database tables
with app.app_context():
    db.create_all()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'VoiceLoop Backend',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0'
    })

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Handle file uploads with AI processing"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Get user ID from request (in production, extract from JWT)
        user_id = request.form.get('user_id', str(uuid.uuid4()))
        
        # Process file
        result = file_processor.process_file(file, user_id)
        
        return jsonify({
            'success': True,
            'file_id': result['file_id'],
            'analysis': result['analysis'],
            'message': 'File processed successfully'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/documents', methods=['GET'])
def get_documents():
    """Get all documents for a user"""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400
        
        documents = UploadedFile.query.filter_by(user_id=user_id).all()
        return jsonify({
            'documents': [doc.to_dict() for doc in documents]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/documents/<file_id>', methods=['GET'])
def get_document(file_id):
    """Get specific document details"""
    try:
        document = UploadedFile.query.get(file_id)
        if not document:
            return jsonify({'error': 'Document not found'}), 404
        
        return jsonify(document.to_dict())
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/rag/search', methods=['POST'])
def search_knowledge_base():
    """Search knowledge base using RAG"""
    try:
        data = request.get_json()
        query = data.get('query')
        user_id = data.get('user_id')
        
        if not query or not user_id:
            return jsonify({'error': 'Query and user_id required'}), 400
        
        results = rag_service.search(query, user_id)
        
        return jsonify({
            'results': results,
            'query': query
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/calendar/events', methods=['GET'])
def get_calendar_events():
    """Get calendar events"""
    try:
        user_id = request.args.get('user_id')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        events = mcp_calendar.get_events(user_id, start_date, end_date)
        
        return jsonify({
            'events': events
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/calendar/events', methods=['POST'])
def create_calendar_event():
    """Create calendar event using MCP"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        event_data = data.get('event')
        
        if not user_id or not event_data:
            return jsonify({'error': 'User ID and event data required'}), 400
        
        event = mcp_calendar.create_event(user_id, event_data)
        
        return jsonify({
            'success': True,
            'event': event
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/calendar/natural-language', methods=['POST'])
def process_natural_language():
    """Process natural language calendar commands using MCP"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        command = data.get('command')
        
        if not user_id or not command:
            return jsonify({'error': 'User ID and command required'}), 400
        
        result = mcp_calendar.process_natural_language(user_id, command)
        
        return jsonify({
            'success': True,
            'result': result
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/voice/transcribe', methods=['POST'])
def transcribe_audio():
    """Transcribe audio using OpenAI Whisper"""
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        audio_file = request.files['audio']
        user_id = request.form.get('user_id', str(uuid.uuid4()))
        
        transcription = file_processor.transcribe_audio(audio_file, user_id)
        
        return jsonify({
            'success': True,
            'transcription': transcription,
            'user_id': user_id
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )
