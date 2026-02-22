import { createClient, SupabaseClient } from '@supabase/supabase-js';

console.log('📦 supabase.ts module is loading...');

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Ensure singleton - only create once
let supabaseInstance: SupabaseClient | null = null;

const getSupabaseClient = () => {
  if (!supabaseInstance) {
    console.log('🔧 Creating NEW Supabase client instance');
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } else {
    console.log('♻️ Reusing existing Supabase client instance');
  }
  return supabaseInstance;
};

export const supabase = getSupabaseClient();
