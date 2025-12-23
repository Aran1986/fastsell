
import { createClient } from '@supabase/supabase-js';

// In Vite, environment variables are accessed via import.meta.env
// We also keep process.env as a fallback for specific environments
// Fixed: Cast import.meta to any to resolve TS error when env is not natively defined on ImportMeta
const supabaseUrl = ((import.meta as any).env?.VITE_SUPABASE_URL as string) || (process.env?.VITE_SUPABASE_URL as string) || '';
const supabaseAnonKey = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string) || (process.env?.VITE_SUPABASE_ANON_KEY as string) || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase URL or Anon Key is missing. Check your .env file or Vercel Environment Variables.");
}

// We provide a fallback string to prevent the 'required' error, 
// though the actual requests will fail until keys are provided.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-replace-me.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);
