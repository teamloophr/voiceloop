from flask import Blueprint, request, jsonify
import os
import PyPDF2
from docx import Document
import pandas as pd
from openai import OpenAI
import tempfile
import json
from werkzeug.utils import secure_filename
from supabase_rag import rag_system

file_upload_bp = Blueprint('file_upload', __name__)

# Initialize OpenAI client
client = OpenAI()

ALLOWED_EXTENSIONS = {'pdf', 'docx', 'csv'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(file_path):
    """Extract text from PDF file"""
    text = ""
    try:
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
    return text

def extract_text_from_docx(file_path):
    """Extract text from DOCX file"""
    text = ""
    try:
        doc = Document(file_path)
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
    except Exception as e:
        print(f"Error extracting text from DOCX: {e}")
    return text

def process_csv(file_path):
    """Process CSV file and extract structured data"""
    try:
        df = pd.read_csv(file_path)
        
        # Convert DataFrame to JSON for easier processing
        data = df.to_dict('records')
        
        # Generate a summary of the CSV structure
        summary = {
            'columns': list(df.columns),
            'row_count': len(df),
            'sample_data': data[:5] if len(data) > 5 else data,
            'data_types': df.dtypes.to_dict()
        }
        
        return data, summary
    except Exception as e:
        print(f"Error processing CSV: {e}")
        return None, None

def chunk_text(text, chunk_size=1000, overlap=200):
    """Split text into overlapping chunks"""
    chunks = []
    start = 0
    
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        
        # Try to break at sentence boundaries
        if end < len(text):
            last_period = chunk.rfind('.')
            last_newline = chunk.rfind('\n')
            break_point = max(last_period, last_newline)
            
            if break_point > start + chunk_size // 2:
                chunk = text[start:break_point + 1]
                end = break_point + 1
        
        chunks.append(chunk.strip())
        start = end - overlap
        
        if start >= len(text):
            break
    
    return chunks

def generate_embeddings(text_chunks):
    """Generate embeddings for text chunks using OpenAI"""
    embeddings = []
    
    try:
        for chunk in text_chunks:
            if chunk.strip():  # Only process non-empty chunks
                response = client.embeddings.create(
                    model="text-embedding-ada-002",
                    input=chunk
                )
                embeddings.append({
                    'text': chunk,
                    'embedding': response.data[0].embedding
                })
    except Exception as e:
        print(f"Error generating embeddings: {e}")
        return []
    
    return embeddings

@file_upload_bp.route('/upload', methods=['POST'])
def upload_file():
    """Handle file upload and processing"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(filename)[1]) as temp_file:
            file.save(temp_file.name)
            temp_file_path = temp_file.name
        
        try:
            file_extension = filename.rsplit('.', 1)[1].lower()
            
            if file_extension == 'pdf':
                # Process PDF
                text = extract_text_from_pdf(temp_file_path)
                chunks = chunk_text(text)
                embeddings = generate_embeddings(chunks)
                
                # Store in Supabase
                document_id = rag_system.store_document(
                    filename=filename,
                    file_type='pdf',
                    file_size=len(text),
                    metadata={'text_length': len(text), 'chunks_count': len(chunks)}
                )
                
                # Store chunks with embeddings
                chunk_data = [{'text': chunk} for chunk in chunks]
                embedding_vectors = [emb['embedding'] for emb in embeddings]
                rag_system.store_chunks(document_id, chunk_data, embedding_vectors)
                
                result = {
                    'id': document_id,
                    'type': 'pdf',
                    'filename': filename,
                    'text_length': len(text),
                    'chunks_count': len(chunks),
                    'embeddings_count': len(embeddings),
                    'preview': text[:500] + '...' if len(text) > 500 else text,
                    'embeddings': embeddings
                }
                
            elif file_extension == 'docx':
                # Process DOCX
                text = extract_text_from_docx(temp_file_path)
                chunks = chunk_text(text)
                embeddings = generate_embeddings(chunks)
                
                # Store in Supabase
                document_id = rag_system.store_document(
                    filename=filename,
                    file_type='docx',
                    file_size=len(text),
                    metadata={'text_length': len(text), 'chunks_count': len(chunks)}
                )
                
                # Store chunks with embeddings
                chunk_data = [{'text': chunk} for chunk in chunks]
                embedding_vectors = [emb['embedding'] for emb in embeddings]
                rag_system.store_chunks(document_id, chunk_data, embedding_vectors)
                
                result = {
                    'id': document_id,
                    'type': 'docx',
                    'filename': filename,
                    'text_length': len(text),
                    'chunks_count': len(chunks),
                    'embeddings_count': len(embeddings),
                    'preview': text[:500] + '...' if len(text) > 500 else text,
                    'embeddings': embeddings
                }
                
            elif file_extension == 'csv':
                # Process CSV
                data, summary = process_csv(temp_file_path)
                
                if data is None:
                    return jsonify({'error': 'Failed to process CSV file'}), 500
                
                # Generate embeddings for CSV rows (convert each row to text)
                csv_texts = []
                for row in data:
                    row_text = ' '.join([f"{k}: {v}" for k, v in row.items() if pd.notna(v)])
                    csv_texts.append(row_text)
                
                embeddings = generate_embeddings(csv_texts)
                
                # Store in Supabase
                document_id = rag_system.store_document(
                    filename=filename,
                    file_type='csv',
                    file_size=len(csv_texts),
                    metadata={'summary': summary, 'row_count': len(data)}
                )
                
                # Store chunks with embeddings
                chunk_data = [{'text': text} for text in csv_texts]
                embedding_vectors = [emb['embedding'] for emb in embeddings]
                rag_system.store_chunks(document_id, chunk_data, embedding_vectors)
                
                result = {
                    'id': document_id,
                    'type': 'csv',
                    'filename': filename,
                    'summary': summary,
                    'embeddings_count': len(embeddings),
                    'embeddings': embeddings
                }
            
            # Clean up temporary file
            os.unlink(temp_file_path)
            
            return jsonify({
                'success': True,
                'message': 'File processed successfully',
                'data': result
            })
            
        except Exception as e:
            # Clean up temporary file in case of error
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
            
            return jsonify({'error': f'Error processing file: {str(e)}'}), 500
    
    return jsonify({'error': 'Invalid file type. Allowed types: PDF, DOCX, CSV'}), 400

@file_upload_bp.route('/query', methods=['POST'])
def query_rag():
    """Query the RAG system with stored document embeddings"""
    data = request.get_json()
    
    if not data or 'query' not in data:
        return jsonify({'error': 'Query is required'}), 400
    
    query = data['query']
    document_id = data.get('document_id')  # Optional: search specific document
    
    try:
        # Generate embedding for the query
        query_response = client.embeddings.create(
            model="text-embedding-ada-002",
            input=query
        )
        query_embedding = query_response.data[0].embedding
        
        # Search for similar chunks using Supabase RAG system
        similar_chunks = rag_system.search_similar_chunks(
            query_embedding=query_embedding,
            document_id=document_id,
            limit=5
        )
        
        if not similar_chunks:
            return jsonify({'error': 'No relevant documents found'}), 404
        
        # Extract text content and metadata
        relevant_chunks = []
        for chunk in similar_chunks:
            relevant_chunks.append({
                'text': chunk['text_content'],
                'chunk_index': chunk['chunk_index'],
                'metadata': chunk['metadata'],
                'document_info': chunk.get('documents', {})
            })
        
        # Create context from top results
        context = '\n\n'.join([chunk['text'] for chunk in relevant_chunks])
        
        # Generate response using OpenAI
        chat_response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant that answers questions based on the provided context. Use only the information from the context to answer questions."
                },
                {
                    "role": "user",
                    "content": f"Context:\n{context}\n\nQuestion: {query}"
                }
            ]
        )
        
        return jsonify({
            'success': True,
            'query': query,
            'answer': chat_response.choices[0].message.content,
            'relevant_chunks': relevant_chunks,
            'context_used': context
        })
        
    except Exception as e:
        return jsonify({'error': f'Error processing query: {str(e)}'}), 500

@file_upload_bp.route('/documents', methods=['GET'])
def get_documents():
    """Get all documents or documents for a specific employee"""
    employee_id = request.args.get('employee_id')
    
    try:
        if employee_id:
            documents = rag_system.get_employee_documents(employee_id)
        else:
            # Get all documents (you might want to add pagination here)
            documents = rag_system.supabase.table('documents').select('*').order('upload_date', desc=True).execute().data
        
        return jsonify({
            'success': True,
            'documents': documents
        })
    except Exception as e:
        return jsonify({'error': f'Error retrieving documents: {str(e)}'}), 500

@file_upload_bp.route('/documents/<document_id>', methods=['GET'])
def get_document(document_id):
    """Get a specific document by ID"""
    try:
        document = rag_system.get_document(document_id)
        if not document:
            return jsonify({'error': 'Document not found'}), 404
        
        # Get chunks for this document
        chunks = rag_system.get_document_chunks(document_id)
        
        return jsonify({
            'success': True,
            'document': document,
            'chunks': chunks
        })
    except Exception as e:
        return jsonify({'error': f'Error retrieving document: {str(e)}'}), 500

@file_upload_bp.route('/documents/<document_id>', methods=['DELETE'])
def delete_document(document_id):
    """Delete a document and all its chunks"""
    try:
        success = rag_system.delete_document(document_id)
        if not success:
            return jsonify({'error': 'Failed to delete document'}), 500
        
        return jsonify({
            'success': True,
            'message': 'Document deleted successfully'
        })
    except Exception as e:
        return jsonify({'error': f'Error deleting document: {str(e)}'}), 500

@file_upload_bp.route('/stats', methods=['GET'])
def get_stats():
    """Get document statistics"""
    try:
        stats = rag_system.get_document_stats()
        return jsonify({
            'success': True,
            'stats': stats
        })
    except Exception as e:
        return jsonify({'error': f'Error retrieving stats: {str(e)}'}), 500

