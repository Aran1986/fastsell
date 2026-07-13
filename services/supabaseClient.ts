
import { createClient } from '@supabase/supabase-js';

// Get environment variables - try multiple sources
const supabaseUrl = 
  ((import.meta as any).env?.VITE_SUPABASE_URL as string) || 
  ((import.meta as any).env?.NEXT_PUBLIC_SUPABASE_URL as string) ||
  (typeof window !== 'undefined' && (window as any).SUPABASE_URL) ||
  '';

const supabaseAnonKey = 
  ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string) || 
  ((import.meta as any).env?.NEXT_PUBLIC_SUPABASE_ANON_KEY as string) ||
  (typeof window !== 'undefined' && (window as any).SUPABASE_ANON_KEY) ||
  '';

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
