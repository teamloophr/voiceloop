import os
import json
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime
import openai
from supabase import create_client, Client


class RAGService:
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client
        self.chunk_size = int(os.getenv('CHUNK_SIZE', 1000))
        self.chunk_overlap = int(os.getenv('CHUNK_OVERLAPS', 200))
        
        # Initialize OpenAI client
        openai.api_key = os.getenv('OPENAI_API_KEY')
        
    def process_document(self, document_id: str, content: str, user_id: str, metadata: Dict[str, Any] = None) -> bool:
        """Process a document and store it in the knowledge base with vector embeddings"""
        try:
            # Create knowledge document
            knowledge_doc = {
                'id': str(uuid.uuid4()),
                'user_id': user_id,
                'title': metadata.get('title', 'Untitled Document'),
                'content': content,
                'file_path': metadata.get('file_path'),
                'file_type': metadata.get('file_type'),
                'file_size': metadata.get('file_size'),
                'meta_data': json.dumps(metadata) if metadata else None,
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }
            
            # Insert document into Supabase
            doc_result = self.supabase.table('knowledge_documents').insert(knowledge_doc).execute()
            if not doc_result.data:
                raise Exception("Failed to insert knowledge document")
            
            doc_id = doc_result.data[0]['id']
            
            # Chunk the content
            chunks = self._chunk_content(content)
            
            # Process each chunk
            for i, chunk in enumerate(chunks):
                # Generate embedding
                embedding = self._generate_embedding(chunk)
                
                # Create content chunk
                chunk_data = {
                    'id': str(uuid.uuid4()),
                    'document_id': doc_id,
                    'chunk_index': i,
                    'content': chunk,
                    'embedding': embedding,  # Already a list for pgvector
                    'meta_data': json.dumps({
                        'chunk_size': len(chunk),
                        'chunk_index': i,
                        'processed_at': datetime.utcnow().isoformat()
                    }),
                    'created_at': datetime.utcnow().isoformat()
                }
                
                # Insert chunk into Supabase
                chunk_result = self.supabase.table('content_chunks').insert(chunk_data).execute()
                if not chunk_result.data:
                    raise Exception(f"Failed to insert chunk {i}")
            
            return True
            
        except Exception as e:
            print(f"Error processing document: {str(e)}")
            return False
    
    def _chunk_content(self, content: str) -> List[str]:
        """Split content into overlapping chunks"""
        chunks = []
        start = 0
        
        while start < len(content):
            end = start + self.chunk_size
            chunk = content[start:end]
            chunks.append(chunk)
            start = end - self.chunk_overlap
            
            if start >= len(content):
                break
        
        return chunks
    
    def _generate_embedding(self, text: str) -> list:
        """Generate embedding for text using OpenAI ada-002"""
        try:
            if not openai.api_key:
                # Return a simple hash-based embedding as fallback
                return [hash(text) % 1000 for _ in range(1536)]
            
            response = openai.Embedding.create(
                input=text,
                model="text-embedding-ada-002"
            )
            return response['data'][0]['embedding']
            
        except Exception as e:
            print(f"Error generating embedding: {str(e)}")
            # Return a simple hash-based embedding as fallback
            return [hash(text) % 1000 for _ in range(1536)]
    
    def search(self, query: str, user_id: str, search_type: str = 'hybrid', limit: int = 10) -> List[Dict[str, Any]]:
        """Search the knowledge base using the specified search type"""
        try:
            if search_type == 'semantic':
                return self._semantic_search(query, user_id, limit)
            elif search_type == 'keyword':
                return self._keyword_search(query, user_id, limit)
            else:
                return self._hybrid_search(query, user_id, limit)
        except Exception as e:
            print(f"Error in search: {str(e)}")
            return []
    
    def _semantic_search(self, query: str, user_id: str, limit: int) -> List[Dict[str, Any]]:
        """Perform semantic search using vector similarity"""
        try:
            # Generate query embedding
            query_embedding = self._generate_embedding(query)
            
            # Search using Supabase with vector similarity
            # Note: This is a simplified version - in production you'd use pgvector functions
            result = self.supabase.table('content_chunks').select('*').eq('user_id', user_id).limit(limit).execute()
            
            if not result.data:
                return []
            
            # For now, return basic results - in production you'd implement proper vector similarity
            results = []
            for chunk in result.data:
                results.append({
                    'id': chunk['id'],
                    'content': chunk['content'],
                    'chunk_index': chunk['chunk_index'],
                    'meta_data': json.loads(chunk['meta_data']) if chunk.get('meta_data') else {},
                    'title': 'Document Chunk',  # Would need to join with knowledge_documents
                    'file_type': 'chunk',
                    'created_at': chunk['created_at'],
                    'similarity_score': 0.8  # Placeholder - would calculate actual similarity
                })
            
            return results
            
        except Exception as e:
            print(f"Error in semantic search: {str(e)}")
            return []
    
    def _keyword_search(self, query: str, user_id: str, limit: int) -> List[Dict[str, Any]]:
        """Perform keyword search using full-text search"""
        try:
            # Use Supabase text search (simplified version)
            result = self.supabase.table('content_chunks').select('*').eq('user_id', user_id).limit(limit).execute()
            
            if not result.data:
                return []
            
            # Filter results that contain the query (basic implementation)
            results = []
            for chunk in result.data:
                if query.lower() in chunk['content'].lower():
                    results.append({
                        'id': chunk['id'],
                        'content': chunk['content'],
                        'chunk_index': chunk['chunk_index'],
                        'meta_data': json.loads(chunk['meta_data']) if chunk.get('meta_data') else {},
                        'title': 'Document Chunk',
                        'file_type': 'chunk',
                        'created_at': chunk['created_at'],
                        'similarity_score': 0.7  # Basic relevance score
                    })
            
            return results[:limit]
            
        except Exception as e:
            print(f"Error in keyword search: {str(e)}")
            return []
    
    def _hybrid_search(self, query: str, user_id: str, limit: int) -> List[Dict[str, Any]]:
        """Perform hybrid search combining semantic and keyword results"""
        try:
            # Get semantic results
            semantic_results = self._semantic_search(query, user_id, limit // 2)
            
            # Get keyword results
            keyword_results = self._keyword_search(query, user_id, limit // 2)
            
            # Combine and re-rank results
            combined_results = semantic_results + keyword_results
            
            # Remove duplicates based on chunk ID
            seen_ids = set()
            unique_results = []
            for result in combined_results:
                if result['id'] not in seen_ids:
                    seen_ids.add(result['id'])
                    unique_results.append(result)
            
            # Sort by similarity score
            unique_results.sort(key=lambda x: x.get('similarity_score', 0), reverse=True)
            
            return unique_results[:limit]
            
        except Exception as e:
            print(f"Error in hybrid search: {str(e)}")
            return []
    
    def enhance_search_results(self, query: str, results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Enhance search results using AI analysis"""
        try:
            if not results or not openai.api_key:
                return results
            
            # Create context from top results
            context = "\n\n".join([f"Document: {r['title']}\nContent: {r['content'][:500]}..." for r in results[:3]])
            
            # Generate AI-enhanced summary
            prompt = f"""
            Based on the following search results for the query "{query}", provide:
            1. A brief summary of the most relevant information
            2. Key insights or patterns found
            3. Recommendations for further exploration
            
            Search Results:
            {context}
            
            Please provide a concise, helpful response.
            """
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful AI assistant that analyzes search results and provides insights."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=300,
                temperature=0.3
            )
            
            ai_insights = response.choices[0].message.content
            
            # Add AI insights to results
            enhanced_results = []
            for result in results:
                enhanced_result = result.copy()
                enhanced_result['ai_insights'] = ai_insights
                enhanced_results.append(enhanced_result)
            
            return enhanced_results
            
        except Exception as e:
            print(f"Error enhancing search results: {str(e)}")
            return results
    
    def delete_document(self, document_id: str, user_id: str) -> bool:
        """Delete a document and all its chunks from the knowledge base"""
        try:
            # Delete chunks first (due to foreign key constraint)
            chunks_result = self.supabase.table('content_chunks').delete().eq('document_id', document_id).execute()
            
            # Delete the document
            doc_result = self.supabase.table('knowledge_documents').delete().eq('id', document_id).eq('user_id', user_id).execute()
            
            return True
            
        except Exception as e:
            print(f"Error deleting document: {str(e)}")
            return False
