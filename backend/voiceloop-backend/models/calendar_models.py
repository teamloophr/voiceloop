from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid
import json

db = SQLAlchemy()

class CalendarEvent(db.Model):
    __tablename__ = 'calendar_events'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    all_day = db.Column(db.Boolean, default=False)
    location = db.Column(db.String(500), nullable=True)
    event_type = db.Column(db.String(100), default='meeting')  # meeting, reminder, task, event
    priority = db.Column(db.String(20), default='medium')  # low, medium, high, urgent
    status = db.Column(db.String(20), default='scheduled')  # scheduled, confirmed, cancelled, completed
    created_timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    updated_timestamp = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    metadata = db.Column(db.Text, nullable=True)  # JSON string for additional data
    external_id = db.Column(db.String(255), nullable=True)  # For external calendar sync
    source = db.Column(db.String(100), default='voiceloop')  # voiceloop, google, outlook, etc.
    
    # Relationships
    attendees = db.relationship('EventAttendee', backref='event', cascade='all, delete-orphan')
    reminders = db.relationship('EventReminder', backref='event', cascade='all, delete-orphan')
    
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
            'user_id': self.user_id,
            'title': self.title,
            'description': self.description,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'all_day': self.all_day,
            'location': self.location,
            'event_type': self.event_type,
            'priority': self.priority,
            'status': self.status,
            'created_timestamp': self.created_timestamp.isoformat() if self.created_timestamp else None,
            'updated_timestamp': self.updated_timestamp.isoformat() if self.updated_timestamp else None,
            'metadata': self.get_metadata(),
            'external_id': self.external_id,
            'source': self.source,
            'attendee_count': len(self.attendees),
            'reminder_count': len(self.reminders)
        }

class EventAttendee(db.Model):
    __tablename__ = 'event_attendees'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id = db.Column(db.String(36), db.ForeignKey('calendar_events.id'), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(255), nullable=True)
    response_status = db.Column(db.String(20), default='pending')  # pending, accepted, declined, tentative
    response_timestamp = db.Column(db.DateTime, nullable=True)
    is_organizer = db.Column(db.Boolean, default=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'event_id': self.event_id,
            'email': self.email,
            'name': self.name,
            'response_status': self.response_status,
            'response_timestamp': self.response_timestamp.isoformat() if self.response_timestamp else None,
            'is_organizer': self.is_organizer
        }

class EventReminder(db.Model):
    __tablename__ = 'event_reminders'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id = db.Column(db.String(36), db.ForeignKey('calendar_events.id'), nullable=False)
    reminder_time = db.Column(db.DateTime, nullable=False)
    reminder_type = db.Column(db.String(50), default='notification')  # notification, email, sms
    message = db.Column(db.Text, nullable=True)
    is_sent = db.Column(db.Boolean, default=False)
    sent_timestamp = db.Column(db.DateTime, nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'event_id': self.event_id,
            'reminder_time': self.reminder_time.isoformat() if self.reminder_time else None,
            'reminder_type': self.reminder_type,
            'message': self.message,
            'is_sent': self.is_sent,
            'sent_timestamp': self.sent_timestamp.isoformat() if self.sent_timestamp else None
        }

class CalendarIntegration(db.Model):
    __tablename__ = 'calendar_integrations'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), nullable=False)
    provider = db.Column(db.String(100), nullable=False)  # google, outlook, apple, etc.
    integration_type = db.Column(db.String(50), default='oauth')  # oauth, api_key, webhook
    credentials = db.Column(db.Text, nullable=True)  # Encrypted credentials
    is_active = db.Column(db.Boolean, default=True)
    last_sync_timestamp = db.Column(db.DateTime, nullable=True)
    sync_frequency = db.Column(db.Integer, default=15)  # minutes
    created_timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    updated_timestamp = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    metadata = db.Column(db.Text, nullable=True)  # JSON string for additional config
    
    def get_credentials(self):
        """Return credentials as a dictionary"""
        try:
            return json.loads(self.credentials) if self.credentials else {}
        except json.JSONDecodeError:
            return {}
    
    def set_credentials(self, credentials_dict):
        """Set credentials from a dictionary"""
        self.credentials = json.dumps(credentials_dict)
    
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
            'user_id': self.user_id,
            'provider': self.provider,
            'integration_type': self.integration_type,
            'is_active': self.is_active,
            'last_sync_timestamp': self.last_sync_timestamp.isoformat() if self.last_sync_timestamp else None,
            'sync_frequency': self.sync_frequency,
            'created_timestamp': self.created_timestamp.isoformat() if self.created_timestamp else None,
            'updated_timestamp': self.updated_timestamp.isoformat() if self.updated_timestamp else None,
            'metadata': self.get_metadata()
        }

class MCPCommand(db.Model):
    __tablename__ = 'mcp_commands'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), nullable=False)
    command_text = db.Column(db.Text, nullable=False)
    command_type = db.Column(db.String(50), nullable=False)  # calendar, document, search, etc.
    parsed_intent = db.Column(db.Text, nullable=True)  # JSON string
    execution_result = db.Column(db.Text, nullable=True)  # JSON string
    success = db.Column(db.Boolean, default=False)
    execution_time_ms = db.Column(db.Integer, default=0)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    error_message = db.Column(db.Text, nullable=True)
    
    def get_parsed_intent(self):
        """Return parsed intent as a dictionary"""
        try:
            return json.loads(self.parsed_intent) if self.parsed_intent else {}
        except json.JSONDecodeError:
            return {}
    
    def set_parsed_intent(self, intent_dict):
        """Set parsed intent from a dictionary"""
        self.parsed_intent = json.dumps(intent_dict)
    
    def get_execution_result(self):
        """Return execution result as a dictionary"""
        try:
            return json.loads(self.execution_result) if self.execution_result else {}
        except json.JSONDecodeError:
            return {}
    
    def set_execution_result(self, result_dict):
        """Set execution result from a dictionary"""
        self.execution_result = json.dumps(result_dict)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'command_text': self.command_text,
            'command_type': self.command_type,
            'parsed_intent': self.get_parsed_intent(),
            'execution_result': self.get_execution_result(),
            'success': self.success,
            'execution_time_ms': self.execution_time_ms,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'error_message': self.error_message
        }
