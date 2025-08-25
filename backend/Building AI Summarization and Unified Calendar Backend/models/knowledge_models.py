from sqlalchemy import Column, String, Text, DateTime, Integer, Float, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID, VECTOR
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

Base = declarative_base()

class KnowledgeDocument(Base):
    __tablename__ = 'knowledge_documents'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    file_path = Column(String(500))
    file_type = Column(String(50))
    file_size = Column(Integer)
    meta_data = Column(Text)  # JSON string for additional metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship to content chunks
    chunks = relationship("ContentChunk", back_populates="document", cascade="all, delete-orphan")
    
    # Indexes for better performance
    __table_args__ = (
        Index('idx_knowledge_docs_user_id', 'user_id'),
        Index('idx_knowledge_docs_created_at', 'created_at'),
        Index('idx_knowledge_docs_title', 'title'),
    )

class ContentChunk(Base):
    __tablename__ = 'content_chunks'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey('knowledge_documents.id'), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    embedding = Column(VECTOR(1536))  # OpenAI ada-002 embedding dimension
    metadata = Column(Text)  # JSON string for chunk metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship to parent document
    document = relationship("KnowledgeDocument", back_populates="chunks")
    
    # Indexes for better performance
    __table_args__ = (
        Index('idx_content_chunks_document_id', 'document_id'),
        Index('idx_content_chunks_chunk_index', 'chunk_index'),
        Index('idx_content_chunks_embedding', 'embedding', postgresql_using='ivfflat'),
    )

class SearchQuery(Base):
    __tablename__ = 'search_queries'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    query_text = Column(Text, nullable=False)
    query_embedding = Column(VECTOR(1536))  # OpenAI ada-002 embedding dimension
    search_results = Column(Text)  # JSON string of search results
    search_type = Column(String(50))  # 'semantic', 'keyword', 'hybrid'
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Indexes for better performance
    __table_args__ = (
        Index('idx_search_queries_user_id', 'user_id'),
        Index('idx_search_queries_created_at', 'created_at'),
        Index('idx_search_queries_query_embedding', 'query_embedding', postgresql_using='ivfflat'),
    )

class VectorEmbedding(Base):
    __tablename__ = 'vector_embeddings'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chunk_id = Column(UUID(as_uuid=True), ForeignKey('content_chunks.id'), nullable=False)
    embedding = Column(VECTOR(1536), nullable=False)  # OpenAI ada-002 embedding dimension
    model_name = Column(String(100), default='text-embedding-ada-002')
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Indexes for better performance
    __table_args__ = (
        Index('idx_vector_embeddings_chunk_id', 'chunk_id'),
        Index('idx_vector_embeddings_embedding', 'embedding', postgresql_using='ivfflat'),
        Index('idx_vector_embeddings_model_name', 'model_name'),
    )
