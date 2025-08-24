import axios from 'axios'
import { supabase } from './supabase'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
})

// Add auth token to requests (temporarily disabled for PM decision)
api.interceptors.request.use(async (config) => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`
    }
  } catch (error) {
    // Database not configured yet - continue without auth
    console.log('Database not configured - waiting for PM decision')
  }
  return config
})

// API functions for chat
export const chatApi = {
  getConversations: () => api.get('/api/chat/conversations'),
  createConversation: (title?: string) => api.post('/api/chat/conversations', { title }),
  getMessages: (conversationId: string) => api.get(`/api/chat/conversations/${conversationId}/messages`),
  sendMessage: (conversationId: string, content: string, messageType = 'text') => 
    api.post(`/api/chat/conversations/${conversationId}/messages`, { content, messageType }),
  updateConversation: (conversationId: string, title: string) => 
    api.put(`/api/chat/conversations/${conversationId}`, { title }),
  deleteConversation: (conversationId: string) => 
    api.delete(`/api/chat/conversations/${conversationId}`),
}

// API functions for voice
export const voiceApi = {
  transcribe: (audioFile: File, language?: string) => {
    const formData = new FormData()
    formData.append('audio', audioFile)
    if (language) formData.append('language', language)
    return api.post('/api/voice/transcribe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  transcribeAndSend: (conversationId: string, audioFile: File, language?: string) => {
    const formData = new FormData()
    formData.append('audio', audioFile)
    if (language) formData.append('language', language)
    return api.post(`/api/voice/transcribe-and-send/${conversationId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  generateSpeech: (text: string, voice = 'alloy', speed = 1.0) =>
    api.post('/api/voice/generate-speech', { text, voice, speed }, {
      responseType: 'blob'
    }),
  getLanguages: () => api.get('/api/voice/languages'),
  getVoices: () => api.get('/api/voice/voices'),
}

// API functions for settings
export const settingsApi = {
  getSettings: () => api.get('/api/settings'),
  updateSettings: (settings: { openai_api_key?: string }) => 
    api.put('/api/settings', settings),
  testOpenAIKey: (apiKey: string) => 
    api.post('/api/settings/test-openai-key', { api_key: apiKey }),
  deleteOpenAIKey: () => api.delete('/api/settings/openai-key'),
  getKeyStatus: () => api.get('/api/settings/openai-key-status'),
}

export default api

