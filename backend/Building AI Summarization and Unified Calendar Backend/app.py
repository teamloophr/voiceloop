import os
import sys
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from datetime import datetime
import uuid
import json
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'voiceloop-secret-key-2024')
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024
CORS(app, origins=["http://localhost:5173", "http://localhost:3000", "*"])

# Initialize Supabase client
supabase_url = os.getenv('SUPABASE_URL')
supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
if supabase_url and supabase_key:
    supabase: Client = create_client(supabase_url, supabase_key)
else:
    supabase = None
    print("Warning: Supabase not configured. Some features may not work.")

from services.file_processor import FileProcessingService
from services.rag_service import RAGService
from services.mcp_calendar import MCPCalendarService
from services.auth_service import AuthService

file_processor = FileProcessingService()
rag_service = RAGService(supabase) if supabase else None
mcp_calendar = MCPCalendarService()
auth_service = AuthService()

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy', 
        'service': 'VoiceLoop Backend', 
        'timestamp': datetime.utcnow().isoformat(), 
        'version': '1.0.0',
        'supabase_configured': supabase is not None
    })

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Upload and process a file"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Get user ID from request (implement your auth logic here)
        user_id = request.headers.get('X-User-ID', str(uuid.uuid4()))
        
        # Process the file with AI summary
        result = file_processor.process_file_with_summary(file, user_id)
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': 'File processed successfully with AI summary',
                'data': result
            })
        else:
            return jsonify({
                'success': False,
                'error': result.get('error', 'Unknown error')
            }), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/upload/decision', methods=['POST'])
def upload_decision():
    """User decides whether to save document for RAG or discard"""
    try:
        data = request.get_json()
        decision = data.get('decision')  # 'save' or 'discard'
        file_data = data.get('file_data')
        user_id = data.get('user_id', request.headers.get('X-User-ID'))
        
        if not decision or not file_data or not user_id:
            return jsonify({'error': 'Decision, file data, and user ID required'}), 400
        
        if decision == 'save':
            # Store in knowledge base if RAG is available
            if rag_service and file_data.get('content'):
                metadata = {
                    'title': file_data.get('filename', 'Unknown'),
                    'file_path': file_data.get('file_path'),
                    'file_type': file_data.get('file_type'),
                    'file_size': file_data.get('file_size'),
                    'ai_summary': file_data.get('ai_summary'),
                    'summary_model': file_data.get('summary_model')
                }
                
                try:
                    rag_service.process_document(
                        str(uuid.uuid4()),
                        file_data['content'],
                        user_id,
                        metadata
                    )
                    
                    return jsonify({
                        'success': True,
                        'message': 'Document saved to knowledge base for RAG search',
                        'document_id': str(uuid.uuid4())
                    })
                except Exception as e:
                    return jsonify({
                        'success': False,
                        'error': f'Failed to save to knowledge base: {str(e)}'
                    }), 500
            else:
                return jsonify({
                    'success': False,
                    'error': 'RAG service not available'
                }), 503
                
        elif decision == 'discard':
            # Clean up uploaded file
            try:
                if file_data.get('file_path') and os.path.exists(file_data['file_path']):
                    os.remove(file_data['file_path'])
            except Exception as e:
                print(f"Warning: Could not remove discarded file: {str(e)}")
            
            return jsonify({
                'success': True,
                'message': 'Document discarded successfully'
            })
            
        else:
            return jsonify({
                'success': False,
                'error': 'Invalid decision. Must be "save" or "discard"'
            }), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/documents', methods=['GET'])
def get_documents():
    """Get all documents for a user"""
    try:
        user_id = request.args.get('user_id', request.headers.get('X-User-ID'))
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400
        
        # Get documents from Supabase
        if not supabase:
            return jsonify({'error': 'Supabase not configured'}), 503
        
        result = supabase.table('knowledge_documents').select('*').eq('user_id', user_id).execute()
        documents = result.data if result.data else []
        
        return jsonify({'documents': documents})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/documents/<file_id>', methods=['GET'])
def get_document(file_id):
    """Get a specific document by ID"""
    try:
        user_id = request.args.get('user_id', request.headers.get('X-User-ID'))
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400
        
        # Get document from Supabase
        if not supabase:
            return jsonify({'error': 'Supabase not configured'}), 503
        
        result = supabase.table('knowledge_documents').select('*').eq('id', file_id).eq('user_id', user_id).execute()
        document = result.data[0] if result.data else None
        
        if not document:
            return jsonify({'error': 'Document not found'}), 404
        
        return jsonify({'document': document})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/rag/search', methods=['POST'])
def search_knowledge_base():
    """Search the knowledge base using RAG"""
    try:
        if not rag_service:
            return jsonify({'error': 'RAG service not available'}), 503
        
        data = request.get_json()
        query = data.get('query')
        user_id = data.get('user_id', request.headers.get('X-User-ID'))
        search_type = data.get('search_type', 'hybrid')
        limit = data.get('limit', 10)
        
        if not query or not user_id:
            return jsonify({'error': 'Query and user ID required'}), 400
        
        # Perform search
        results = rag_service.search(query, user_id, search_type, limit)
        
        # Enhance results with AI if requested
        if data.get('enhance_results', False):
            results = rag_service.enhance_search_results(query, results)
        
        return jsonify({
            'success': True,
            'results': results,
            'query': query,
            'search_type': search_type,
            'total_results': len(results)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/calendar/events', methods=['GET'])
def get_calendar_events():
    """Get calendar events for a user"""
    try:
        user_id = request.args.get('user_id', request.headers.get('X-User-ID'))
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400
        
        # Get events from Supabase
        if not supabase:
            return jsonify({'error': 'Supabase not configured'}), 503
        
        result = supabase.table('calendar_events').select('*').eq('user_id', user_id).execute()
        events = result.data if result.data else []
        
        return jsonify({'events': events})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/calendar/events', methods=['POST'])
def create_calendar_event():
    """Create a new calendar event"""
    try:
        data = request.get_json()
        user_id = data.get('user_id', request.headers.get('X-User-ID'))
        
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400
        
        # Create event using MCP calendar service
        result = mcp_calendar.create_event(data, user_id)
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': 'Event created successfully',
                'event': result['event']
            })
        else:
            return jsonify({
                'success': False,
                'error': result.get('error', 'Unknown error')
            }), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/calendar/natural-language', methods=['POST'])
def process_natural_language():
    """Process natural language calendar commands"""
    try:
        data = request.get_json()
        command = data.get('command')
        user_id = data.get('user_id', request.headers.get('X-User-ID'))
        
        if not command or not user_id:
            return jsonify({'error': 'Command and user ID required'}), 400
        
        # Process command using MCP calendar service
        result = mcp_calendar.process_command(command, user_id)
        
        return jsonify({
            'success': True,
            'result': result
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/voice/transcribe', methods=['POST'])
def transcribe_audio():
    """Transcribe audio file using Whisper"""
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        audio_file = request.files['audio']
        if audio_file.filename == '':
            return jsonify({'error': 'No audio file selected'}), 400
        
        # Transcribe using file processor
        result = file_processor.transcribe_audio(audio_file)
        
        if result['success']:
            return jsonify({
                'success': True,
                'transcription': result['transcription'],
                'language': result.get('language', 'en')
            })
        else:
            return jsonify({
                'success': False,
                'error': result.get('error', 'Unknown error')
            }), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/smart-search', methods=['POST'])
def smart_search():
    """Perform smart search across all data sources"""
    try:
        data = request.get_json()
        query = data.get('query')
        user_id = data.get('user_id', request.headers.get('X-User-ID'))
        search_type = data.get('search_type', 'hybrid')
        
        if not query or not user_id:
            return jsonify({'error': 'Query and user ID required'}), 400
        
        # Perform RAG search
        rag_results = []
        if rag_service:
            rag_results = rag_service.search(query, user_id, search_type, 5)
        
        # Perform calendar search
        calendar_results = []
        if supabase:
            calendar_result = supabase.table('calendar_events').select('*').eq('user_id', user_id).textSearch('title', query).execute()
            calendar_results = calendar_result.data if calendar_result.data else []
        
        # Combine and rank results
        all_results = {
            'rag_results': rag_results,
            'calendar_results': calendar_results,
            'total_results': len(rag_results) + len(calendar_results)
        }
        
        return jsonify({
            'success': True,
            'results': all_results,
            'query': query
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500



if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)
