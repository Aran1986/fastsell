
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
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0ZXBnYXh6cmhubHN6bGtscGRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5ODAzODUsImV4cCI6MjA5OTU1NjM4NX0.tb6eB-SMK5xl98TroKTDb2yAyLZwyagp8Isivm0alB0'; // Production Anon Key

// Check if we have valid configuration (not just placeholders)
// TEMPORARILY DISABLED due to CORS restrictions - browser REST API calls are blocked
// Using localStorage fallback mode until backend API routes are implemented
export const isSupabaseConfigured = false;

if (!isSupabaseConfigured) {
  console.warn('[v0] Supabase temporarily disabled - using localStorage fallback mode (CORS blocked). Backend API routes needed for production.');
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
