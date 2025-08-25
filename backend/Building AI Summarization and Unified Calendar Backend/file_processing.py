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
    file_type = db.Column(db.String(50), nullable=False)
    file_size = db.Column(db.BigInteger, nullable=False)
    upload_timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    processing_status = db.Column(db.String(50), default='uploaded')
    user_id = db.Column(db.String(36), nullable=False)
    storage_path = db.Column(db.String(500), nullable=False)
    
    # Relationship to analysis
    analysis = db.relationship('DocumentAnalysis', backref='file', uselist=False, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'filename': self.filename,
            'original_filename': self.original_filename,
            'file_type': self.file_type,
            'file_size': self.file_size,
            'upload_timestamp': self.upload_timestamp.isoformat() if self.upload_timestamp else None,
            'processing_status': self.processing_status,
            'user_id': self.user_id,
            'storage_path': self.storage_path
        }

class DocumentAnalysis(db.Model):
    __tablename__ = 'document_analyses'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    file_id = db.Column(db.String(36), db.ForeignKey('uploaded_files.id'), nullable=False)
    summary = db.Column(db.Text, nullable=False)
    key_points = db.Column(db.Text, nullable=False)  # JSON string
    extracted_text = db.Column(db.Text, nullable=False)
    confidence_score = db.Column(db.Float, nullable=False)
    tags = db.Column(db.Text, nullable=False)  # JSON string
    category = db.Column(db.String(100), nullable=False)
    analysis_timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    word_count = db.Column(db.Integer, default=0)
    sentence_count = db.Column(db.Integer, default=0)
    paragraph_count = db.Column(db.Integer, default=0)
    relevance_score = db.Column(db.Float, default=0.0)
    
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
            'summary': self.summary,
            'key_points': self.get_key_points(),
            'extracted_text': self.extracted_text,
            'confidence_score': self.confidence_score,
            'tags': self.get_tags(),
            'category': self.category,
            'analysis_timestamp': self.analysis_timestamp.isoformat() if self.analysis_timestamp else None,
            'word_count': self.word_count,
            'sentence_count': self.sentence_count,
            'paragraph_count': self.paragraph_count,
            'relevance_score': self.relevance_score
        }

class ProcessingJob(db.Model):
    __tablename__ = 'processing_jobs'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    file_id = db.Column(db.String(36), db.ForeignKey('uploaded_files.id'), nullable=False)
    job_type = db.Column(db.String(50), nullable=False)  # 'analysis', 'transcription', 'embedding'
    status = db.Column(db.String(50), default='pending')  # 'pending', 'processing', 'completed', 'failed'
    progress = db.Column(db.Integer, default=0)  # 0-100
    error_message = db.Column(db.Text, nullable=True)
    created_timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    started_timestamp = db.Column(db.DateTime, nullable=True)
    completed_timestamp = db.Column(db.DateTime, nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'file_id': self.file_id,
            'job_type': self.job_type,
            'status': self.status,
            'progress': self.progress,
            'error_message': self.error_message,
            'created_timestamp': self.created_timestamp.isoformat() if self.created_timestamp else None,
            'started_timestamp': self.started_timestamp.isoformat() if self.started_timestamp else None,
            'completed_timestamp': self.completed_timestamp.isoformat() if self.completed_timestamp else None
        }

