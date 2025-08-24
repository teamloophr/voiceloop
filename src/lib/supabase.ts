// TEMPORARILY DISABLED - Waiting for PM database decision
// import { createClient } from '@supabase/supabase-js'

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

// export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Mock Supabase client for UI testing
export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    signUp: async () => ({ data: null, error: new Error('Database not configured') }),
    signIn: async () => ({ data: null, error: new Error('Database not configured') }),
    signOut: async () => ({ error: null })
  }
}

// Auth helper functions (temporarily disabled)
export const signUp = async (email: string, password: string) => {
  return { data: null, error: new Error('Database not configured - waiting for PM decision') }
}

export const signIn = async (email: string, password: string) => {
  return { data: null, error: new Error('Database not configured - waiting for PM decision') }
}

export const signOut = async () => {
  return { error: null }
}

export const getCurrentUser = async () => {
  return { user: null, error: new Error('Database not configured - waiting for PM decision') }
}

export const getSession = async () => {
  return { session: null, error: new Error('Database not configured - waiting for PM decision') }
}

