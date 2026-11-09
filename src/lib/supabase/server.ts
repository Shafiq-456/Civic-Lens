// Server-side Supabase client for CIVIC LENZ Route Handlers and Server Actions.
// Uses server-side environment variables. Never exposes SUPABASE_SERVICE_ROLE_KEY to the client.

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

let serverClient: SupabaseClient<Database> | null = null
let adminClient: SupabaseClient<Database> | null = null

export function getSupabaseServerClient(): SupabaseClient<Database> | null {
  if (serverClient) return serverClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  if (!url || !key || !url.startsWith('http')) {
    return null
  }

  serverClient = createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  return serverClient
}

export function getSupabaseAdminClient(): SupabaseClient<Database> | null {
  if (adminClient) return adminClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey || !url.startsWith('http')) {
    return null
  }

  adminClient = createClient<Database>(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  return adminClient
}

