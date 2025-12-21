import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hbufjpxdzmygjnbfsniu.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY

if (!supabaseKey) {
  throw new Error('Missing Supabase key. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_KEY environment variable.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// For server-side usage (if needed)
export function createServerClient() {
  const serverUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hbufjpxdzmygjnbfsniu.supabase.co'
  const serverKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY

  if (!serverKey) {
    throw new Error('Missing Supabase server key. Please set SUPABASE_SERVICE_ROLE_KEY or SUPABASE_KEY environment variable.')
  }

  return createClient(serverUrl, serverKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

