import os
import json
import hashlib
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
import openai
from openai import OpenAI
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import re

class RAGService:
    def __init__(self):
        self.client = OpenAI()
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        self.chroma_client = None
        self.collection = None
        self.initialize_chroma()
        
    def initialize_chroma(self):
        """Initialize ChromaDB client and collection"""
        try:
            # Create ChromaDB client with persistent storage
            db_path = os.path.join(os.path.dirname(__file__), '..', 'database', 'chroma')
            os.makedirs(db_path, exist_ok=True)
            
            self.chroma_client = chromadb.PersistentClient(
                path=db_path,
                settings=Settings(
                    anonymized_telemetry=False,
                    allow_reset=True
                )
            )
            
            # Get or create collection
            self.collection = self.chroma_client.get_or_create_collection(
                name="voiceloop_knowledge",
                metadata={"hnsw:space": "cosine"}
            )
            
        except Exception as e:
            print(f"Failed to initialize ChromaDB: {e}")
            self.chroma_client = None
            self.collection = None
    
    def process_document(self, document_text: str, metadata: Dict[str, Any], user_id: str) -> str:
        """Process a document and add it to the knowledge base"""
        try:
            # Generate document ID
            doc_id = str(uuid.uuid4())
            
            # Chunk the document
            chunks = self.chunk_text(document_text, metadata)
            
            # Generate embeddings for each chunk
            chunk_ids = []
            chunk_texts = []
            chunk_metadatas = []
            
            for i, chunk in enumerate(chunks):
                chunk_id = f"{doc_id}_chunk_{i}"
                chunk_ids.append(chunk_id)
                chunk_texts.append(chunk['text'])
                
                # Enhanced metadata for each chunk
                chunk_metadata = {
                    'document_id': doc_id,
                    'user_id': user_id,
                    'chunk_index': i,
                    'start_position': chunk['start'],
                    'end_position': chunk['end'],
                    'chunk_type': chunk['type'],
                    'document_title': metadata.get('title', 'Unknown'),
                    'document_type': metadata.get('type', 'unknown'),
                    'category': metadata.get('category', 'general'),
                    'tags': metadata.get('tags', []),
                    'created_timestamp': datetime.utcnow().isoformat()
                }
                chunk_metadatas.append(chunk_metadata)
            
            # Add to ChromaDB
            if self.collection:
                self.collection.add(
                    ids=chunk_ids,
                    documents=chunk_texts,
                    metadatas=chunk_metadatas
                )
            
            return doc_id
            
        except Exception as e:
            raise Exception(f"Failed to process document: {str(e)}")
    
    def chunk_text(self, text: str, metadata: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Intelligently chunk text based on content structure"""
        chunks = []
        
        # Split by paragraphs first
        paragraphs = text.split('\n\n')
        
        current_position = 0
        chunk_index = 0
        
        for paragraph in paragraphs:
            paragraph = paragraph.strip()
            if not paragraph:
                current_position += len(paragraph) + 2  # +2 for \n\n
                continue
            
            # If paragraph is too long, split by sentences
            if len(paragraph) > 1000:
                sentences = re.split(r'[.!?]+', paragraph)
                sentence_start = current_position
                
                for sentence in sentences:
                    sentence = sentence.strip()
                    if not sentence:
                        sentence_start += len(sentence) + 1
                        continue
                    
                    if len(sentence) > 100:  # Only add substantial sentences
                        chunks.append({
                            'text': sentence,
                            'start': sentence_start,
                            'end': sentence_start + len(sentence),
                            'type': 'sentence'
                        })
                        chunk_index += 1
                    
                    sentence_start += len(sentence) + 1
                
                current_position += len(paragraph) + 2
            else:
                # Add paragraph as chunk
                chunks.append({
                    'text': paragraph,
                    'start': current_position,
                    'end': current_position + len(paragraph),
                    'type': 'paragraph'
                })
                chunk_index += 1
                current_position += len(paragraph) + 2
        
        return chunks
    
    def search(self, query: str, user_id: str, filters: Optional[Dict[str, Any]] = None, 
               top_k: int = 10, search_type: str = 'hybrid') -> List[Dict[str, Any]]:
        """Search knowledge base using various strategies"""
        try:
            if not self.collection:
                return []
            
            # Generate query embedding
            query_embedding = self.embedding_model.encode([query])[0]
            
            # Build search filters
            search_filters = {"user_id": user_id}
            if filters:
                search_filters.update(filters)
            
            # Perform search based on type
            if search_type == 'semantic':
                results = self._semantic_search(query_embedding, search_filters, top_k)
            elif search_type == 'keyword':
                results = self._keyword_search(query, search_filters, top_k)
            elif search_type == 'hybrid':
                results = self._hybrid_search(query, query_embedding, search_filters, top_k)
            else:
                results = self._semantic_search(query_embedding, search_filters, top_k)
            
            # Enhance results with AI analysis
            enhanced_results = self._enhance_search_results(query, results)
            
            return enhanced_results
            
        except Exception as e:
            print(f"Search failed: {e}")
            return []
    
    def _semantic_search(self, query_embedding: np.ndarray, filters: Dict[str, Any], top_k: int) -> List[Dict[str, Any]]:
        """Perform semantic search using embeddings"""
        try:
            results = self.collection.query(
                query_embeddings=[query_embedding.tolist()],
                n_results=top_k,
                where=filters
            )
            
            return self._format_chroma_results(results)
            
        except Exception as e:
            print(f"Semantic search failed: {e}")
            return []
    
    def _keyword_search(self, query: str, filters: Dict[str, Any], top_k: int) -> List[Dict[str, Any]]:
        """Perform keyword-based search"""
        try:
            # Extract key terms from query
            key_terms = self._extract_key_terms(query)
            
            # Search for documents containing these terms
            results = self.collection.query(
                query_texts=key_terms,
                n_results=top_k,
                where=filters
            )
            
            return self._format_chroma_results(results)
            
        except Exception as e:
            print(f"Keyword search failed: {e}")
            return []
    
    def _hybrid_search(self, query: str, query_embedding: np.ndarray, filters: Dict[str, Any], top_k: int) -> List[Dict[str, Any]]:
        """Perform hybrid search combining semantic and keyword approaches"""
        try:
            # Get semantic results
            semantic_results = self._semantic_search(query_embedding, filters, top_k // 2)
            
            # Get keyword results
            keyword_results = self._keyword_search(query, filters, top_k // 2)
            
            # Combine and re-rank results
            combined_results = semantic_results + keyword_results
            
            # Remove duplicates and re-rank by relevance
            unique_results = self._deduplicate_results(combined_results)
            reranked_results = self._rerank_results(query, unique_results)
            
            return reranked_results[:top_k]
            
        except Exception as e:
            print(f"Hybrid search failed: {e}")
            return []
    
    def _extract_key_terms(self, query: str) -> List[str]:
        """Extract key terms from query for keyword search"""
        # Simple term extraction - in production, use NLP libraries
        terms = re.findall(r'\b\w+\b', query.lower())
        # Filter out common stop words
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'}
        key_terms = [term for term in terms if term not in stop_words and len(term) > 2]
        return key_terms[:5]  # Limit to top 5 terms
    
    def _format_chroma_results(self, chroma_results: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Format ChromaDB results into standard format"""
        formatted_results = []
        
        if not chroma_results or 'documents' not in chroma_results:
            return formatted_results
        
        documents = chroma_results['documents'][0] if chroma_results['documents'] else []
        metadatas = chroma_results['metadatas'][0] if chroma_results['metadatas'] else []
        distances = chroma_results['distances'][0] if chroma_results['distances'] else []
        
        for i, (doc, metadata, distance) in enumerate(zip(documents, metadatas, distances)):
            formatted_results.append({
                'id': metadata.get('document_id', f'chunk_{i}'),
                'text': doc,
                'metadata': metadata,
                'relevance_score': 1.0 - distance if distance else 0.5,
                'chunk_index': metadata.get('chunk_index', i),
                'document_title': metadata.get('document_title', 'Unknown'),
                'document_type': metadata.get('document_type', 'unknown'),
                'category': metadata.get('category', 'general'),
                'tags': metadata.get('tags', [])
            })
        
        return formatted_results
    
    def _deduplicate_results(self, results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Remove duplicate results based on document ID"""
        seen_ids = set()
        unique_results = []
        
        for result in results:
            doc_id = result.get('id')
            if doc_id not in seen_ids:
                seen_ids.add(doc_id)
                unique_results.append(result)
        
        return unique_results
    
    def _rerank_results(self, query: str, results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Re-rank results using multiple factors"""
        for result in results:
            score = 0.0
            
            # Base relevance score
            score += result.get('relevance_score', 0.0) * 0.4
            
            # Text length bonus (prefer substantial chunks)
            text_length = len(result.get('text', ''))
            if text_length > 100:
                score += min(0.2, text_length / 1000)
            
            # Recency bonus
            metadata = result.get('metadata', {})
            created_time = metadata.get('created_timestamp')
            if created_time:
                try:
                    created_dt = datetime.fromisoformat(created_time.replace('Z', '+00:00'))
                    days_old = (datetime.now(created_dt.tzinfo) - created_dt).days
                    if days_old < 30:
                        score += 0.1
                except:
                    pass
            
            # Category relevance bonus
            query_lower = query.lower()
            category = metadata.get('category', '').lower()
            if category in query_lower:
                score += 0.1
            
            # Update score
            result['final_score'] = score
        
        # Sort by final score
        results.sort(key=lambda x: x.get('final_score', 0), reverse=True)
        return results
    
    def _enhance_search_results(self, query: str, results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Enhance search results using AI analysis"""
        try:
            if not results:
                return results
            
            # Create context for AI enhancement
            context = f"Query: {query}\n\nTop results:\n"
            for i, result in enumerate(results[:3]):  # Top 3 results
                context += f"{i+1}. {result.get('text', '')[:200]}...\n"
            
            # AI prompt for result enhancement
            prompt = f"""Analyze the search results for the query: "{query}"

Context:
{context}

Provide insights on:
1. How well the results answer the query
2. Any gaps in the information
3. Suggested follow-up questions
4. Overall relevance assessment

Format as JSON with keys: analysis, gaps, follow_up_questions, relevance_score"""

            # Get AI enhancement
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an AI search analyst. Provide concise, helpful analysis of search results."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=300,
                temperature=0.3
            )
            
            ai_analysis = response.choices[0].message.content
            
            # Try to parse AI response
            try:
                analysis_data = json.loads(ai_analysis)
                # Add AI insights to results
                for result in results:
                    result['ai_analysis'] = analysis_data
            except:
                # If parsing fails, add raw AI response
                for result in results:
                    result['ai_analysis'] = {'raw_response': ai_analysis}
            
        except Exception as e:
            print(f"AI enhancement failed: {e}")
            # Continue without AI enhancement
        
        return results
    
    def delete_document(self, document_id: str, user_id: str) -> bool:
        """Delete a document and all its chunks from the knowledge base"""
        try:
            if not self.collection:
                return False
            
            # Find all chunks for this document
            results = self.collection.query(
                query_texts=[""],
                n_results=1000,
                where={"document_id": document_id, "user_id": user_id}
            )
            
            if results and 'ids' in results and results['ids']:
                # Delete all chunks
                self.collection.delete(ids=results['ids'][0])
                return True
            
            return False
            
        except Exception as e:
            print(f"Failed to delete document: {e}")
            return False
    
    def get_knowledge_stats(self, user_id: str) -> Dict[str, Any]:
        """Get statistics about the knowledge base"""
        try:
            if not self.collection:
                return {}
            
            # Get collection info
            collection_info = self.collection.get()
            
            # Count documents by user
            user_docs = self.collection.query(
                query_texts=[""],
                n_results=1000,
                where={"user_id": user_id}
            )
            
            doc_count = len(user_docs['ids'][0]) if user_docs and 'ids' in user_docs else 0
            
            # Analyze document types
            doc_types = {}
            if user_docs and 'metadatas' in user_docs:
                for metadata in user_docs['metadatas'][0]:
                    doc_type = metadata.get('document_type', 'unknown')
                    doc_types[doc_type] = doc_types.get(doc_type, 0) + 1
            
            return {
                'total_chunks': doc_count,
                'document_types': doc_types,
                'collection_size': len(collection_info['ids']) if collection_info else 0,
                'last_updated': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            print(f"Failed to get knowledge stats: {e}")
            return {}
