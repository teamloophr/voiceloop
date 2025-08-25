import os
import json
import numpy as np
from supabase import create_client, Client
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class SupabaseRAG:
    def __init__(self):
        # Initialize Supabase client
        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        
        if not supabase_url or not supabase_key:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables")
        
        self.supabase: Client = create_client(supabase_url, supabase_key)
        self.setup_database()
    
    def setup_database(self):
        """Create necessary tables if they don't exist"""
        try:
            # Create documents table
            self.supabase.table('documents').select('id').limit(1).execute()
        except Exception:
            # Table doesn't exist, create it
            self.create_documents_table()
        
        try:
            # Create document_chunks table
            self.supabase.table('document_chunks').select('id').limit(1).execute()
        except Exception:
            # Table doesn't exist, create it
            self.create_chunks_table()
    
    def create_documents_table(self):
        """Create documents table"""
        # This would typically be done via Supabase migrations
        # For now, we'll create it manually
        sql = """
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
        
        CREATE INDEX IF NOT EXISTS idx_documents_employee_id ON documents(employee_id);
        CREATE INDEX IF NOT EXISTS idx_documents_file_type ON documents(file_type);
        CREATE INDEX IF NOT EXISTS idx_documents_upload_date ON documents(upload_date);
        """
        
        try:
            self.supabase.rpc('exec_sql', {'sql': sql}).execute()
        except Exception as e:
            print(f"Note: Table creation via RPC may not work. Use Supabase dashboard to create tables: {e}")
    
    def create_chunks_table(self):
        """Create document_chunks table"""
        sql = """
        CREATE TABLE IF NOT EXISTS document_chunks (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
            chunk_index INTEGER NOT NULL,
            text_content TEXT NOT NULL,
            embedding_vector VECTOR(1536), -- OpenAI ada-002 embedding dimension
            metadata JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_chunks_document_id ON document_chunks(document_id);
        CREATE INDEX IF NOT EXISTS idx_chunks_chunk_index ON document_chunks(chunk_index);
        """
        
        try:
            self.supabase.rpc('exec_sql', {'sql': sql}).execute()
        except Exception as e:
            print(f"Note: Table creation via RPC may not work. Use Supabase dashboard to create tables: {e}")
    
    def store_document(self, filename: str, file_type: str, file_size: int, 
                      employee_id: Optional[str] = None, employee_name: Optional[str] = None,
                      metadata: Optional[Dict] = None) -> str:
        """Store document metadata and return document ID"""
        try:
            document_data = {
                'filename': filename,
                'file_type': file_type,
                'file_size': file_size,
                'employee_id': employee_id,
                'employee_name': employee_name,
                'metadata': metadata or {}
            }
            
            result = self.supabase.table('documents').insert(document_data).execute()
            document_id = result.data[0]['id']
            return document_id
        except Exception as e:
            print(f"Error storing document: {e}")
            raise
    
    def store_chunks(self, document_id: str, chunks: List[Dict[str, Any]], 
                    embeddings: List[List[float]]) -> bool:
        """Store document chunks with their embeddings"""
        try:
            chunk_data = []
            for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
                chunk_data.append({
                    'document_id': document_id,
                    'chunk_index': i,
                    'text_content': chunk['text'],
                    'embedding_vector': embedding,
                    'metadata': {
                        'start_char': chunk.get('start_char', 0),
                        'end_char': chunk.get('end_char', 0),
                        'length': len(chunk['text'])
                    }
                })
            
            # Insert chunks in batches
            batch_size = 100
            for i in range(0, len(chunk_data), batch_size):
                batch = chunk_data[i:i + batch_size]
                self.supabase.table('document_chunks').insert(batch).execute()
            
            # Update document with total chunks count
            self.supabase.table('documents').update({
                'total_chunks': len(chunks),
                'updated_at': datetime.utcnow().isoformat()
            }).eq('id', document_id).execute()
            
            return True
        except Exception as e:
            print(f"Error storing chunks: {e}")
            raise
    
    def search_similar_chunks(self, query_embedding: List[float], 
                            document_id: Optional[str] = None,
                            limit: int = 5) -> List[Dict[str, Any]]:
        """Search for similar chunks using vector similarity"""
        try:
            # Convert embedding to proper format for Supabase
            query_vector = f"[{','.join(map(str, query_embedding))}]"
            
            # Build the query
            query = self.supabase.table('document_chunks').select(
                'id, chunk_index, text_content, metadata, documents(filename, file_type, employee_name)'
            )
            
            if document_id:
                query = query.eq('document_id', document_id)
            
            # Use vector similarity search (requires pgvector extension)
            # Note: This requires the pgvector extension to be enabled in Supabase
            result = query.order(
                f'embedding_vector <-> {query_vector}'
            ).limit(limit).execute()
            
            return result.data
        except Exception as e:
            print(f"Error searching chunks: {e}")
            # Fallback to simple text search if vector search fails
            return self.fallback_text_search(query_embedding, document_id, limit)
    
    def fallback_text_search(self, query_embedding: List[float], 
                           document_id: Optional[str] = None, 
                           limit: int = 5) -> List[Dict[str, Any]]:
        """Fallback text search if vector search is not available"""
        try:
            query = self.supabase.table('document_chunks').select(
                'id, chunk_index, text_content, metadata, documents(filename, file_type, employee_name)'
            )
            
            if document_id:
                query = query.eq('document_id', document_id)
            
            result = query.limit(limit).execute()
            return result.data
        except Exception as e:
            print(f"Error in fallback search: {e}")
            return []
    
    def get_document(self, document_id: str) -> Optional[Dict[str, Any]]:
        """Get document by ID"""
        try:
            result = self.supabase.table('documents').select('*').eq('id', document_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error getting document: {e}")
            return None
    
    def get_document_chunks(self, document_id: str) -> List[Dict[str, Any]]:
        """Get all chunks for a document"""
        try:
            result = self.supabase.table('document_chunks').select(
                'chunk_index, text_content, metadata'
            ).eq('document_id', document_id).order('chunk_index').execute()
            
            return result.data
        except Exception as e:
            print(f"Error getting document chunks: {e}")
            return []
    
    def get_employee_documents(self, employee_id: str) -> List[Dict[str, Any]]:
        """Get all documents for an employee"""
        try:
            result = self.supabase.table('documents').select('*').eq('employee_id', employee_id).execute()
            return result.data
        except Exception as e:
            print(f"Error getting employee documents: {e}")
            return []
    
    def delete_document(self, document_id: str) -> bool:
        """Delete document and all its chunks"""
        try:
            # Delete chunks first (due to foreign key constraint)
            self.supabase.table('document_chunks').delete().eq('document_id', document_id).execute()
            
            # Delete document
            self.supabase.table('documents').delete().eq('id', document_id).execute()
            
            return True
        except Exception as e:
            print(f"Error deleting document: {e}")
            return False
    
    def get_document_stats(self) -> Dict[str, Any]:
        """Get overall document statistics"""
        try:
            # Count total documents
            docs_result = self.supabase.table('documents').select('id', count='exact').execute()
            total_documents = docs_result.count if docs_result.count is not None else 0
            
            # Count total chunks
            chunks_result = self.supabase.table('document_chunks').select('id', count='exact').execute()
            total_chunks = chunks_result.count if chunks_result.count is not None else 0
            
            # Get file type distribution
            file_types_result = self.supabase.table('documents').select('file_type').execute()
            file_types = {}
            for doc in file_types_result.data:
                file_type = doc['file_type']
                file_types[file_type] = file_types.get(file_type, 0) + 1
            
            return {
                'total_documents': total_documents,
                'total_chunks': total_chunks,
                'file_type_distribution': file_types,
                'average_chunks_per_document': total_chunks / total_documents if total_documents > 0 else 0
            }
        except Exception as e:
            print(f"Error getting document stats: {e}")
            return {
                'total_documents': 0,
                'total_chunks': 0,
                'file_type_distribution': {},
                'average_chunks_per_document': 0
            }

# Initialize the RAG system
rag_system = SupabaseRAG()
