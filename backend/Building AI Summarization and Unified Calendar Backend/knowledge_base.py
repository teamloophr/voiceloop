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
    
    # Vector embedding will be stored in ChromaDB, referenced by chunk ID
    
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
            'created_timestamp': self.created_timestamp.isoformat() if self.created_timestamp else None
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
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'query_text': self.query_text,
            'query_type': self.query_type,
            'results_count': self.results_count,
            'execution_time_ms': self.execution_time_ms,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }

