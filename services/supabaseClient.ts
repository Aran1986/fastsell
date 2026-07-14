
import { createClient } from '@supabase/supabase-js';

// Get environment variables - try multiple sources
// Fallback to correct production values if env vars not set
const supabaseUrl = 
  ((import.meta as any).env?.VITE_SUPABASE_URL as string) || 
  ((import.meta as any).env?.NEXT_PUBLIC_SUPABASE_URL as string) ||
  (typeof window !== 'undefined' && (window as any).SUPABASE_URL) ||
  'https://ctepgaxzrhnlsz1klkpdo.supabase.co'; // Production URL

const supabaseAnonKey = 
  ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string) || 
  ((import.meta as any).env?.NEXT_PUBLIC_SUPABASE_ANON_KEY as string) ||
  (typeof window !== 'undefined' && (window as any).SUPABASE_ANON_KEY) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0ZXBnYXh6cmhubHN6MWtsa3BkbyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzIwOTczMDMwLCJleHAiOjE3NTI1MDkwMzB9.i0L4U2ifx7IU1T4PIzp5H7ioS2pM0Jv2n6lLvVJEm0'; // Production Anon Key

// Check if we have valid configuration (not just placeholders)
export const isSupabaseConfigured = 
  Boolean(supabaseUrl) && 
  Boolean(supabaseAnonKey) && 
  supabaseUrl.length > 10 &&
  supabaseAnonKey.length > 10 &&
  !supabaseUrl.includes('placeholder') && 
  !supabaseAnonKey.includes('placeholder');

if (!isSupabaseConfigured) {
  console.warn('[v0] Supabase not configured - using localStorage fallback mode');
} else {
  console.log('[v0] Supabase configured - using cloud mode');
}

// Initialize client with fallback - even if not configured, create client to prevent crashes
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
