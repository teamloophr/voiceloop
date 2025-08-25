from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid
import json

db = SQLAlchemy()

class UploadedFile(db.Model):
    __tablename__ = 'uploaded_files'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    file_size = db.Column(db.BigInteger, nullable=False)
    mime_type = db.Column(db.String(100), nullable=False)
    file_hash = db.Column(db.String(64), nullable=False)
    user_id = db.Column(db.String(36), nullable=False)
    upload_timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    processing_status = db.Column(db.String(50), default='pending')  # pending, processing, completed, failed
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    analysis = db.relationship('DocumentAnalysis', backref='file', uselist=False, cascade='all, delete-orphan')
    processing_jobs = db.relationship('ProcessingJob', backref='file', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'filename': self.filename,
            'original_filename': self.original_filename,
            'file_size': self.file_size,
            'mime_type': self.mime_type,
            'user_id': self.user_id,
            'upload_timestamp': self.upload_timestamp.isoformat() if self.upload_timestamp else None,
            'processing_status': self.processing_status,
            'is_active': self.is_active,
            'has_analysis': self.analysis is not None
        }

class DocumentAnalysis(db.Model):
    __tablename__ = 'document_analyses'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    file_id = db.Column(db.String(36), db.ForeignKey('uploaded_files.id'), nullable=False)
    extracted_text = db.Column(db.Text, nullable=True)
    summary = db.Column(db.Text, nullable=True)
    key_points = db.Column(db.Text, nullable=True)  # JSON string
    document_type = db.Column(db.String(100), nullable=True)
    word_count = db.Column(db.Integer, nullable=True)
    sentence_count = db.Column(db.Integer, nullable=True)
    paragraph_count = db.Column(db.Integer, nullable=True)
    tags = db.Column(db.Text, nullable=True)  # JSON string
    category = db.Column(db.String(100), nullable=True)
    relevance_score = db.Column(db.Float, nullable=True)
    confidence_score = db.Column(db.Float, nullable=True)
    analysis_timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    ai_model_used = db.Column(db.String(100), nullable=True)
    
    def get_key_points(self):
        """Return key points as a list"""
        try:
            return json.loads(self.key_points) if self.key_points else []
        except json.JSONDecodeError:
            return []
    
    def set_key_points(self, points_list):
        """Set key points from a list"""
        self.key_points = json.dumps(points_list)
    
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
            'file_id': self.file_id,
            'extracted_text': self.extracted_text,
            'summary': self.summary,
            'key_points': self.get_key_points(),
            'document_type': self.document_type,
            'word_count': self.word_count,
            'sentence_count': self.sentence_count,
            'paragraph_count': self.paragraph_count,
            'tags': self.get_tags(),
            'category': self.category,
            'relevance_score': self.relevance_score,
            'confidence_score': self.confidence_score,
            'analysis_timestamp': self.analysis_timestamp.isoformat() if self.analysis_timestamp else None,
            'ai_model_used': self.ai_model_used
        }

class ProcessingJob(db.Model):
    __tablename__ = 'processing_jobs'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    file_id = db.Column(db.String(36), db.ForeignKey('uploaded_files.id'), nullable=False)
    job_type = db.Column(db.String(100), nullable=False)  # text_extraction, ai_analysis, embedding_generation
    status = db.Column(db.String(50), default='queued')  # queued, running, completed, failed
    priority = db.Column(db.Integer, default=1)  # 1=low, 5=high
    created_timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    started_timestamp = db.Column(db.DateTime, nullable=True)
    completed_timestamp = db.Column(db.DateTime, nullable=True)
    error_message = db.Column(db.Text, nullable=True)
    progress_percentage = db.Column(db.Integer, default=0)
    metadata = db.Column(db.Text, nullable=True)  # JSON string
    
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
            'file_id': self.file_id,
            'job_type': self.job_type,
            'status': self.status,
            'priority': self.priority,
            'created_timestamp': self.created_timestamp.isoformat() if self.created_timestamp else None,
            'started_timestamp': self.started_timestamp.isoformat() if self.started_timestamp else None,
            'completed_timestamp': self.completed_timestamp.isoformat() if self.completed_timestamp else None,
            'error_message': self.error_message,
            'progress_percentage': self.progress_percentage,
            'metadata': self.get_metadata()
        }
