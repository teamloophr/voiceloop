from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid
import json

db = SQLAlchemy()

class KnowledgeDocument(db.Model):
    __tablename__ = 'knowledge_documents'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    source_file_id = db.Column(db.String(36), db.ForeignKey('uploaded_files.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    content_hash = db.Column(db.String(64), nullable=False)
    metadata = db.Column(db.Text, nullable=False)  # JSON string
    created_timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.String(36), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    document_type = db.Column(db.String(100), nullable=True)
    category = db.Column(db.String(100), nullable=True)
    tags = db.Column(db.Text, nullable=True)  # JSON string
    
    # Relationship to chunks
    chunks = db.relationship('ContentChunk', backref='document', cascade='all, delete-orphan')
    
    def get_metadata(self):
        """Return metadata as a dictionary"""
        try:
            return json.loads(self.metadata) if self.metadata else {}
        except json.JSONDecodeError:
            return {}
    
    def set_metadata(self, metadata_dict):
        """Set metadata from a dictionary"""
        self.metadata = json.dumps(metadata_dict)
    
    def get_tags(self):
        """Return tags as a list"""
        try:
            return json.loads(self.tags) if self.tags else []
        except json.JSONDecodeError:
            return []
    
    def set_tags(self, tags_list):
        """Set tags from a list"""
        self.tags = json.dumps(tags_list)
    
    def to_dict(self):
        return {
            'id': self.id,
            'source_file_id': self.source_file_id,
            'title': self.title,
            'content_hash': self.content_hash,
            'metadata': self.get_metadata(),
            'created_timestamp': self.created_timestamp.isoformat() if self.created_timestamp else None,
            'user_id': self.user_id,
            'is_active': self.is_active,
            'document_type': self.document_type,
            'category': self.category,
            'tags': self.get_tags(),
            'chunk_count': len(self.chunks)
        }

class ContentChunk(db.Model):
    __tablename__ = 'content_chunks'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = db.Column(db.String(36), db.ForeignKey('knowledge_documents.id'), nullable=False)
    chunk_text = db.Column(db.Text, nullable=False)
    chunk_index = db.Column(db.Integer, nullable=False)
    start_position = db.Column(db.Integer, default=0)
    end_position = db.Column(db.Integer, default=0)
    chunk_metadata = db.Column(db.Text, nullable=True)  # JSON string
    created_timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    embedding_id = db.Column(db.String(100), nullable=True)  # Reference to vector store
    relevance_score = db.Column(db.Float, nullable=True)
    
    def get_chunk_metadata(self):
        """Return chunk metadata as a dictionary"""
        try:
            return json.loads(self.chunk_metadata) if self.chunk_metadata else {}
        except json.JSONDecodeError:
            return {}
    
    def set_chunk_metadata(self, metadata_dict):
        """Set chunk metadata from a dictionary"""
        self.chunk_metadata = json.dumps(metadata_dict)
    
    def to_dict(self):
        return {
            'id': self.id,
            'document_id': self.document_id,
            'chunk_text': self.chunk_text,
            'chunk_index': self.chunk_index,
            'start_position': self.start_position,
            'end_position': self.end_position,
            'chunk_metadata': self.get_chunk_metadata(),
            'created_timestamp': self.created_timestamp.isoformat() if self.created_timestamp else None,
            'embedding_id': self.embedding_id,
            'relevance_score': self.relevance_score
        }

class SearchQuery(db.Model):
    __tablename__ = 'search_queries'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), nullable=False)
    query_text = db.Column(db.Text, nullable=False)
    query_type = db.Column(db.String(50), default='semantic')  # 'semantic', 'keyword', 'hybrid'
    results_count = db.Column(db.Integer, default=0)
    execution_time_ms = db.Column(db.Integer, default=0)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    filters = db.Column(db.Text, nullable=True)  # JSON string
    ai_enhanced = db.Column(db.Boolean, default=False)
    
    def get_filters(self):
        """Return filters as a dictionary"""
        try:
            return json.loads(self.filters) if self.filters else {}
        except json.JSONDecodeError:
            return {}
    
    def set_filters(self, filters_dict):
        """Set filters from a dictionary"""
        self.filters = json.dumps(filters_dict)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'query_text': self.query_text,
            'query_type': self.query_type,
            'results_count': self.results_count,
            'execution_time_ms': self.execution_time_ms,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'filters': self.get_filters(),
            'ai_enhanced': self.ai_enhanced
        }

class VectorEmbedding(db.Model):
    __tablename__ = 'vector_embeddings'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    chunk_id = db.Column(db.String(36), db.ForeignKey('content_chunks.id'), nullable=False)
    embedding_vector = db.Column(db.Text, nullable=False)  # JSON string of vector
    model_name = db.Column(db.String(100), nullable=False)
    embedding_dimension = db.Column(db.Integer, nullable=False)
    created_timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    def get_embedding_vector(self):
        """Return embedding vector as a list"""
        try:
            return json.loads(self.embedding_vector) if self.embedding_vector else []
        except json.JSONDecodeError:
            return []
    
    def set_embedding_vector(self, vector_list):
        """Set embedding vector from a list"""
        self.embedding_vector = json.dumps(vector_list)
    
    def to_dict(self):
        return {
            'id': self.id,
            'chunk_id': self.chunk_id,
            'embedding_vector': self.get_embedding_vector(),
            'model_name': self.model_name,
            'embedding_dimension': self.embedding_dimension,
            'created_timestamp': self.created_timestamp.isoformat() if self.created_timestamp else None,
            'is_active': self.is_active
        }
