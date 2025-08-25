-- VoiceLoop Backend Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- Enable pgvector extension for vector embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Note: JWT secret is managed by Supabase automatically
-- Row Level Security will be enabled below
-- Supabase handles JWT configuration in the dashboard under Settings > API

-- Create user_settings table for storing API keys and preferences
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    openai_api_key TEXT,
    elevenlabs_api_key TEXT,
    preferred_voice VARCHAR(50) DEFAULT 'alloy',
    speech_speed DECIMAL(2,1) DEFAULT 1.0,
    auto_play_responses BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create knowledge_documents table for RAG system
CREATE TABLE IF NOT EXISTS knowledge_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    file_path VARCHAR(500),
    file_type VARCHAR(50),
    file_size INTEGER,
    meta_data TEXT, -- JSON string for additional metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create content_chunks table for document chunks with vector embeddings
CREATE TABLE IF NOT EXISTS content_chunks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID REFERENCES knowledge_documents(id) ON DELETE CASCADE NOT NULL,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(1536), -- OpenAI ada-002 embedding dimension
    meta_data TEXT, -- JSON string for chunk metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create search_queries table for tracking search history
CREATE TABLE IF NOT EXISTS search_queries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    query_text TEXT NOT NULL,
    query_embedding VECTOR(1536), -- OpenAI ada-002 embedding dimension
    search_results TEXT, -- JSON string of search results
    search_type VARCHAR(50), -- 'semantic', 'keyword', 'hybrid'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vector_embeddings table for storing embeddings separately
CREATE TABLE IF NOT EXISTS vector_embeddings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chunk_id UUID REFERENCES content_chunks(id) ON DELETE CASCADE NOT NULL,
    embedding VECTOR(1536) NOT NULL, -- OpenAI ada-002 embedding dimension
    model_name VARCHAR(100) DEFAULT 'text-embedding-ada-002',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create uploaded_files table for file management
CREATE TABLE IF NOT EXISTS uploaded_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INTEGER NOT NULL,
    upload_status VARCHAR(50) DEFAULT 'pending',
    processing_status VARCHAR(50) DEFAULT 'pending',
    meta_data TEXT, -- JSON string for additional metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create document_analysis table for AI analysis results
CREATE TABLE IF NOT EXISTS document_analysis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    file_id UUID REFERENCES uploaded_files(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    analysis_type VARCHAR(50) NOT NULL, -- 'summary', 'key_points', 'categorization'
    content TEXT NOT NULL,
    confidence_score DECIMAL(3,2),
    meta_data TEXT, -- JSON string for additional metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create processing_jobs table for background task tracking
CREATE TABLE IF NOT EXISTS processing_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    job_type VARCHAR(50) NOT NULL, -- 'file_upload', 'document_analysis', 'rag_processing'
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    progress INTEGER DEFAULT 0,
    result_data TEXT, -- JSON string for job results
    error_message TEXT,
    meta_data TEXT, -- JSON string for additional metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create calendar_events table for MCP calendar system
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    all_day BOOLEAN DEFAULT false,
    location VARCHAR(255),
    event_type VARCHAR(50) DEFAULT 'meeting',
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'scheduled',
    meta_data TEXT, -- JSON string for additional metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event_attendees table for calendar event participants
CREATE TABLE IF NOT EXISTS event_attendees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES calendar_events(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    email VARCHAR(255),
    name VARCHAR(255),
    response_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'tentative'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event_reminders table for calendar event notifications
CREATE TABLE IF NOT EXISTS event_reminders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES calendar_events(id) ON DELETE CASCADE NOT NULL,
    reminder_type VARCHAR(20) DEFAULT 'notification', -- 'notification', 'email', 'sms'
    reminder_time TIMESTAMP WITH TIME ZONE NOT NULL,
    message TEXT,
    sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create calendar_integrations table for external calendar connections
CREATE TABLE IF NOT EXISTS calendar_integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    integration_type VARCHAR(50) NOT NULL, -- 'google_calendar', 'outlook', 'ical'
    external_id VARCHAR(255),
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    meta_data TEXT, -- JSON string for additional metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mcp_commands table for tracking MCP calendar commands
CREATE TABLE IF NOT EXISTS mcp_commands (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    command_text TEXT NOT NULL,
    command_type VARCHAR(50) NOT NULL, -- 'create_event', 'find_event', 'update_event', 'delete_event'
    parsed_data TEXT, -- JSON string for parsed command data
    execution_result TEXT, -- JSON string for execution results
    success BOOLEAN DEFAULT false,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_created_at ON user_settings(created_at);

CREATE INDEX IF NOT EXISTS idx_knowledge_docs_user_id ON knowledge_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_created_at ON knowledge_documents(created_at);
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_title ON knowledge_documents(title);

CREATE INDEX IF NOT EXISTS idx_content_chunks_document_id ON content_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_content_chunks_chunk_index ON content_chunks(chunk_index);
CREATE INDEX IF NOT EXISTS idx_content_chunks_embedding ON content_chunks USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_search_queries_user_id ON search_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_search_queries_created_at ON search_queries(created_at);
CREATE INDEX IF NOT EXISTS idx_search_queries_query_embedding ON search_queries USING ivfflat (query_embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_vector_embeddings_chunk_id ON vector_embeddings(chunk_id);
CREATE INDEX IF NOT EXISTS idx_vector_embeddings_embedding ON vector_embeddings USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_vector_embeddings_model_name ON vector_embeddings(model_name);

CREATE INDEX IF NOT EXISTS idx_uploaded_files_user_id ON uploaded_files(user_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_created_at ON uploaded_files(created_at);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_file_type ON uploaded_files(file_type);

CREATE INDEX IF NOT EXISTS idx_document_analysis_file_id ON document_analysis(file_id);
CREATE INDEX IF NOT EXISTS idx_document_analysis_user_id ON document_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_document_analysis_created_at ON document_analysis(created_at);

CREATE INDEX IF NOT EXISTS idx_processing_jobs_user_id ON processing_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_status ON processing_jobs(status);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_created_at ON processing_jobs(created_at);

CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_event_type ON calendar_events(event_type);

CREATE INDEX IF NOT EXISTS idx_event_attendees_event_id ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_user_id ON event_attendees(user_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_response_status ON event_attendees(response_status);

CREATE INDEX IF NOT EXISTS idx_event_reminders_event_id ON event_reminders(event_id);
CREATE INDEX IF NOT EXISTS idx_event_reminders_reminder_time ON event_reminders(reminder_time);
CREATE INDEX IF NOT EXISTS idx_event_reminders_sent ON event_reminders(sent);

CREATE INDEX IF NOT EXISTS idx_calendar_integrations_user_id ON calendar_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_integrations_type ON calendar_integrations(integration_type);
CREATE INDEX IF NOT EXISTS idx_calendar_integrations_active ON calendar_integrations(is_active);

CREATE INDEX IF NOT EXISTS idx_mcp_commands_user_id ON mcp_commands(user_id);
CREATE INDEX IF NOT EXISTS idx_mcp_commands_type ON mcp_commands(command_type);
CREATE INDEX IF NOT EXISTS idx_mcp_commands_created_at ON mcp_commands(created_at);

-- Enable Row Level Security on all tables
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE vector_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE mcp_commands ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_settings
CREATE POLICY "Users can view own settings" ON user_settings
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON user_settings
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own settings" ON user_settings
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for knowledge_documents
CREATE POLICY "Users can view own documents" ON knowledge_documents
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own documents" ON knowledge_documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own documents" ON knowledge_documents
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own documents" ON knowledge_documents
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for content_chunks
CREATE POLICY "Users can view own chunks" ON content_chunks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM knowledge_documents 
            WHERE id = content_chunks.document_id AND user_id = auth.uid()
        )
    );
CREATE POLICY "Users can insert own chunks" ON content_chunks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM knowledge_documents 
            WHERE id = content_chunks.document_id AND user_id = auth.uid()
        )
    );
CREATE POLICY "Users can update own chunks" ON content_chunks
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM knowledge_documents 
            WHERE id = content_chunks.document_id AND user_id = auth.uid()
        )
    );
CREATE POLICY "Users can delete own chunks" ON content_chunks
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM knowledge_documents 
            WHERE id = content_chunks.document_id AND user_id = auth.uid()
        )
    );

-- Create RLS policies for search_queries
CREATE POLICY "Users can view own queries" ON search_queries
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own queries" ON search_queries
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own queries" ON search_queries
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own queries" ON search_queries
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for vector_embeddings
CREATE POLICY "Users can view own embeddings" ON vector_embeddings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM content_chunks cc
            JOIN knowledge_documents kd ON cc.document_id = kd.id
            WHERE cc.id = vector_embeddings.chunk_id AND kd.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can insert own embeddings" ON vector_embeddings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM content_chunks cc
            JOIN knowledge_documents kd ON cc.document_id = kd.id
            WHERE cc.id = vector_embeddings.chunk_id AND kd.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can update own embeddings" ON vector_embeddings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM content_chunks cc
            JOIN knowledge_documents kd ON cc.document_id = kd.id
            WHERE cc.id = vector_embeddings.chunk_id AND kd.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can delete own embeddings" ON vector_embeddings
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM content_chunks cc
            JOIN knowledge_documents kd ON cc.document_id = kd.id
            WHERE cc.id = vector_embeddings.chunk_id AND kd.user_id = auth.uid()
        )
    );

-- Create RLS policies for uploaded_files
CREATE POLICY "Users can view own files" ON uploaded_files
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own files" ON uploaded_files
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own files" ON uploaded_files
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own files" ON uploaded_files
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for document_analysis
CREATE POLICY "Users can view own analysis" ON document_analysis
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analysis" ON document_analysis
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own analysis" ON document_analysis
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own analysis" ON document_analysis
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for processing_jobs
CREATE POLICY "Users can view own jobs" ON processing_jobs
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own jobs" ON processing_jobs
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own jobs" ON processing_jobs
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own jobs" ON processing_jobs
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for calendar_events
CREATE POLICY "Users can view own events" ON calendar_events
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own events" ON calendar_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own events" ON calendar_events
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own events" ON calendar_events
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for event_attendees
CREATE POLICY "Users can view event attendees" ON event_attendees
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM calendar_events 
            WHERE id = event_attendees.event_id AND user_id = auth.uid()
        )
    );
CREATE POLICY "Users can insert event attendees" ON event_attendees
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM calendar_events 
            WHERE id = event_attendees.event_id AND user_id = auth.uid()
        )
    );
CREATE POLICY "Users can update event attendees" ON event_attendees
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM calendar_events 
            WHERE id = event_attendees.event_id AND user_id = auth.uid()
        )
    );
CREATE POLICY "Users can delete event attendees" ON event_attendees
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM calendar_events 
            WHERE id = event_attendees.event_id AND user_id = auth.uid()
        )
    );

-- Create RLS policies for event_reminders
CREATE POLICY "Users can view event reminders" ON event_reminders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM calendar_events 
            WHERE id = event_reminders.event_id AND user_id = auth.uid()
        )
    );
CREATE POLICY "Users can insert event reminders" ON event_reminders
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM calendar_events 
            WHERE id = event_reminders.event_id AND user_id = auth.uid()
        )
    );
CREATE POLICY "Users can update event reminders" ON event_reminders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM calendar_events 
            WHERE id = event_reminders.event_id AND user_id = auth.uid()
        )
    );
CREATE POLICY "Users can delete event reminders" ON event_reminders
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM calendar_events 
            WHERE id = event_reminders.event_id AND user_id = auth.uid()
        )
    );

-- Create RLS policies for calendar_integrations
CREATE POLICY "Users can view own integrations" ON calendar_integrations
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own integrations" ON calendar_integrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own integrations" ON calendar_integrations
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own integrations" ON calendar_integrations
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for mcp_commands
CREATE POLICY "Users can view own commands" ON mcp_commands
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own commands" ON mcp_commands
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own commands" ON mcp_commands
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own commands" ON mcp_commands
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically create user settings on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user settings
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Create a function to search content chunks using vector similarity
CREATE OR REPLACE FUNCTION search_content_chunks(
    query_embedding vector(1536),
    user_id_param uuid,
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 10
)
RETURNS TABLE (
    id uuid,
    content text,
    chunk_index integer,
    metadata text,
    title text,
    file_type varchar,
    created_at timestamptz,
    similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.content,
        c.chunk_index,
        c.metadata,
        kd.title,
        kd.file_type,
        c.created_at,
        1 - (c.embedding <=> query_embedding) as similarity
    FROM content_chunks c
    JOIN knowledge_documents kd ON c.document_id = kd.id
    WHERE kd.user_id = user_id_param
    AND 1 - (c.embedding <=> query_embedding) > match_threshold
    ORDER BY c.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
