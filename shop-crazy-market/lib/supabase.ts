import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client (uses service role key for admin operations)
export function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  // Validate JWT format (basic check - should start with eyJ and have 3 parts)
  const trimmedKey = supabaseServiceKey.trim();
  const jwtParts = trimmedKey.split('.');
  
  if (jwtParts.length !== 3) {
    throw new Error(`Invalid Supabase API key format. Expected JWT with 3 parts, got ${jwtParts.length}. Please check SUPABASE_SERVICE_ROLE_KEY in Vercel.`);
  }

  if (!trimmedKey.startsWith('eyJ')) {
    throw new Error('Invalid Supabase API key format. JWT should start with "eyJ". Please check SUPABASE_SERVICE_ROLE_KEY in Vercel.');
  }

  return createClient(supabaseUrl, trimmedKey);
}

// Client-side Supabase client (uses anon key)
export function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}
