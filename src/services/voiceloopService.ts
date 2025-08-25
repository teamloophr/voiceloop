import axios from 'axios';
import { API_CONFIG } from '@/config/api';

// VoiceLoop Backend API Configuration
const VOICELOOP_API_BASE = 'https://main.d1fx10pzvtm51o.amplifyapp.com/api';

// Types for VoiceLoop API
export interface VoiceLoopDocument {
  id: string;
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  user_id: string;
  upload_timestamp: string;
  processing_status: string;
  has_analysis: boolean;
}

export interface DocumentAnalysis {
  id: string;
  file_id: string;
  extracted_text: string;
  summary: string;
  key_points: string[];
  document_type: string;
  word_count: number;
  sentence_count: number;
  paragraph_count: number;
  tags: string[];
  category: string;
  relevance_score: number;
  confidence_score: number;
  analysis_timestamp: string;
  ai_model_used: string;
}

export interface RAGSearchResult {
  id: string;
  text: string;
  metadata: any;
  relevance_score: number;
  chunk_index: number;
  document_title: string;
  document_type: string;
  category: string;
  tags: string[];
  ai_analysis?: any;
}

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  location?: string;
  event_type: string;
  priority: string;
  status: string;
  source: string;
  created_timestamp: string;
}

export interface MCPCommandResult {
  success: boolean;
  intent: any;
  result: any;
  command: string;
  error?: string;
}

export interface FileUploadResult {
  success: boolean;
  file_id: string;
  analysis: DocumentAnalysis;
  message: string;
}

export interface RAGSearchParams {
  query: string;
  user_id: string;
  filters?: any;
  top_k?: number;
  search_type?: 'semantic' | 'keyword' | 'hybrid';
}

class VoiceLoopService {
  private apiClient: any;

  constructor() {
    this.apiClient = axios.create({
      baseURL: VOICELOOP_API_BASE,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for authentication
    this.apiClient.interceptors.request.use(
      (config: any) => {
        const token = localStorage.getItem('voiceloop_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: any) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.apiClient.interceptors.response.use(
      (response: any) => response,
      (error: any) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          localStorage.removeItem('voiceloop_token');
        }
        return Promise.reject(error);
      }
    );
  }

  // Health check
  async healthCheck(): Promise<any> {
    try {
      const response = await this.apiClient.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  // File upload and processing
  async uploadFile(file: File, userId: string): Promise<FileUploadResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_id', userId);

      const response = await this.apiClient.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }

  // Get user documents
  async getDocuments(userId: string): Promise<VoiceLoopDocument[]> {
    try {
      const response = await this.apiClient.get('/documents', {
        params: { user_id: userId },
      });
      return response.data.documents;
    } catch (error) {
      console.error('Failed to get documents:', error);
      throw error;
    }
  }

  // Get specific document
  async getDocument(fileId: string): Promise<VoiceLoopDocument> {
    try {
      const response = await this.apiClient.get(`/documents/${fileId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get document:', error);
      throw error;
    }
  }

  // RAG search
  async searchKnowledgeBase(params: RAGSearchParams): Promise<RAGSearchResult[]> {
    try {
      const response = await this.apiClient.post('/rag/search', params);
      return response.data.results;
    } catch (error) {
      console.error('RAG search failed:', error);
      throw error;
    }
  }

  // Calendar operations
  async getCalendarEvents(userId: string, startDate?: string, endDate?: string): Promise<CalendarEvent[]> {
    try {
      const params: any = { user_id: userId };
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await this.apiClient.get('/calendar/events', { params });
      return response.data.events;
    } catch (error) {
      console.error('Failed to get calendar events:', error);
      throw error;
    }
  }

  async createCalendarEvent(userId: string, eventData: any): Promise<any> {
    try {
      const response = await this.apiClient.post('/calendar/events', {
        user_id: userId,
        event: eventData,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create calendar event:', error);
      throw error;
    }
  }

  // MCP natural language processing
  async processNaturalLanguage(userId: string, command: string): Promise<MCPCommandResult> {
    try {
      const response = await this.apiClient.post('/calendar/natural-language', {
        user_id: userId,
        command: command,
      });
      return response.data;
    } catch (error) {
      console.error('Natural language processing failed:', error);
      throw error;
    }
  }

  // Voice transcription
  async transcribeAudio(audioFile: File, userId: string): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('audio', audioFile);
      formData.append('user_id', userId);

      const response = await this.apiClient.post('/voice/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Audio transcription failed:', error);
      throw error;
    }
  }

  // Smart RAG operations
  async smartSearch(query: string, userId: string, context?: any): Promise<RAGSearchResult[]> {
    try {
      // Enhanced search with context
      const searchParams: RAGSearchParams = {
        query,
        user_id: userId,
        search_type: 'hybrid',
        top_k: 15,
        filters: context?.filters || {},
      };

      const results = await this.searchKnowledgeBase(searchParams);

      // Post-process results for better relevance
      return this.enhanceSearchResults(results, query, context);
    } catch (error) {
      console.error('Smart search failed:', error);
      throw error;
    }
  }

  private enhanceSearchResults(results: RAGSearchResult[], query: string, context?: any): RAGSearchResult[] {
    // Apply additional relevance scoring based on context
    return results.map(result => {
      let enhancedScore = result.relevance_score;

      // Boost score for recent documents
      if (result.metadata?.created_timestamp) {
        const daysOld = (Date.now() - new Date(result.metadata.created_timestamp).getTime()) / (1000 * 60 * 60 * 24);
        if (daysOld < 7) enhancedScore += 0.1;
        if (daysOld < 30) enhancedScore += 0.05;
      }

      // Boost score for matching categories
      if (context?.category && result.category === context.category) {
        enhancedScore += 0.15;
      }

      // Boost score for matching tags
      if (context?.tags && result.tags) {
        const matchingTags = context.tags.filter((tag: string) => 
          result.tags.includes(tag)
        ).length;
        enhancedScore += matchingTags * 0.05;
      }

      return {
        ...result,
        enhanced_score: Math.min(enhancedScore, 1.0),
      };
    }).sort((a, b) => (b.enhanced_score || 0) - (a.enhanced_score || 0));
  }

  // Batch operations
  async batchProcessFiles(files: File[], userId: string): Promise<FileUploadResult[]> {
    try {
      const results: FileUploadResult[] = [];
      
      for (const file of files) {
        try {
          const result = await this.uploadFile(file, userId);
          results.push(result);
        } catch (error) {
          console.error(`Failed to process file ${file.name}:`, error);
          results.push({
            success: false,
            file_id: '',
            analysis: {} as DocumentAnalysis,
            message: `Failed to process ${file.name}: ${error}`,
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Batch processing failed:', error);
      throw error;
    }
  }

  // Analytics and insights
  async getKnowledgeInsights(userId: string): Promise<any> {
    try {
      // This would call a backend endpoint for analytics
      // For now, return mock data
      return {
        total_documents: 0,
        document_types: {},
        recent_uploads: [],
        search_patterns: [],
        knowledge_gaps: [],
      };
    } catch (error) {
      console.error('Failed to get knowledge insights:', error);
      throw error;
    }
  }

  // Utility methods
  isBackendAvailable(): boolean {
    // Check if backend is reachable
    return true; // In production, implement actual health check
  }

  getBackendUrl(): string {
    return VOICELOOP_API_BASE;
  }
}

// Export singleton instance
export const voiceloopService = new VoiceLoopService();
export default voiceloopService;
