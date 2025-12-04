import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  // Support both new publishable key (preferred) and legacy anon key
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    // Return a dummy client during build time
    if (typeof window === 'undefined') {
      throw new Error(
        'Supabase URL and Key are required. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) in your environment variables.'
      )
    }
    throw new Error(
      'Supabase configuration is missing. Please check your environment variables.'
    )
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}
