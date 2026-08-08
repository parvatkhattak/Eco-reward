import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Demo mode: forces the local-storage backend even when Supabase keys exist
// (useful when hitting Supabase email rate limits, or for offline demos)
export const isDemoActive = localStorage.getItem('eco_demo') === '1'

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey) && !isDemoActive

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
