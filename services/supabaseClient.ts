
import { createClient } from '@supabase/supabase-js';

// Detect environment variables
const supabaseUrl = ((import.meta as any).env?.VITE_SUPABASE_URL as string) || (process.env?.VITE_SUPABASE_URL as string) || '';
const supabaseAnonKey = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string) || (process.env?.VITE_SUPABASE_ANON_KEY as string) || '';

// Check if we are using actual keys or just placeholders
export const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder') && 
  !supabaseAnonKey.includes('placeholder');

if (!isSupabaseConfigured) {
  console.warn("Supabase is not configured. Falling back to local/mock data mode.");
}

// Initialize client with fallback to avoid crashes during instantiation
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-replace-me.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);
