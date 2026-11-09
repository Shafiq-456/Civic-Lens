// Browser-side Supabase client for CIVIC LENZ
// Uses NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
// Safe for public browser bundles; accesses data subject to Row Level Security (RLS).

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

let browserClient: SupabaseClient<Database> | null = null

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return Boolean(
    url &&
    anonKey &&
    url.startsWith('http') &&
    !url.includes('YOUR_PROJECT_ID') &&
    !anonKey.includes('YOUR_SB_PUBLISHABLE_KEY') &&
    anonKey.length > 20
  )
}

export function getSupabaseBrowserClient(): SupabaseClient<Database> | null {
  if (typeof window === 'undefined') {
    // In server rendering contexts, use createSupabaseServerClient instead.
    return null
  }

  if (browserClient) return browserClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey || !url.startsWith('http')) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[CIVIC LENZ / Supabase] Missing or incomplete NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env. Supabase features will be paused until credentials are provided.'
      )
    }
    return null
  }

  browserClient = createClient<Database>(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })

  return browserClient
}

