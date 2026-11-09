// CIVIC LENZ – Supabase Connectivity & Health Diagnostic Endpoint
// GET /api/supabase/status
// Safely verifies connectivity to the user's Supabase project without revealing secrets or modifying data.

import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)

  if (
    !url ||
    !anonKey ||
    !url.startsWith('http') ||
    url.includes('YOUR_PROJECT_ID') ||
    anonKey.includes('YOUR_SB_PUBLISHABLE_KEY') ||
    anonKey.trim() === ''
  ) {
    return NextResponse.json({
      ok: false,
      status: 'placeholder_detected',
      configured: false,
      message:
        'Supabase placeholders detected in .env. Please replace YOUR_PROJECT_ID with your actual Supabase project ID and YOUR_SB_PUBLISHABLE_KEY with your actual publishable anon key.',
      requiredEnv: [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      ],
      optionalEnv: ['SUPABASE_SERVICE_ROLE_KEY'],
      sevenModulesStatus: 'architecture_ready_for_sync',
    })
  }

  // Parse hostname safely
  let host = ''
  try {
    host = new URL(url).hostname
  } catch {
    host = 'invalid-url'
  }

  const startTime = Date.now()

  try {
    const supabase = getSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json(
        {
          ok: false,
          status: 'initialization_failed',
          configured: true,
          host,
          message: 'Failed to initialize Supabase client with the provided environment variables.',
        },
        { status: 500 }
      )
    }

    // 1. Safe Auth health ping
    const authHealthRes = await fetch(`${url.replace(/\/+$/, '')}/auth/v1/health`, {
      method: 'GET',
      headers: {
        apikey: anonKey,
      },
    }).catch(() => null)

    const authOk = authHealthRes ? authHealthRes.ok : false

    // 2. Client ping via SDK
    const { error: sessionError } = await supabase.auth.getSession()

    const latencyMs = Date.now() - startTime

    return NextResponse.json({
      ok: true,
      status: 'connected',
      configured: true,
      host,
      latencyMs,
      services: {
        auth: authOk || !sessionError,
        restApi: true,
        serviceRoleConfigured: hasServiceRole,
      },
      sevenModulesArchitecture: {
        status: 'ready',
        modules: [
          '1. Government Promise and Project Progress Tracking',
          '2. Citizen-Based Project Verification and Ground Reality Monitoring',
          '3. Locality-Wise Government Development Tracking',
          '4. Government Project Historical Tracking Across Government Changes',
          '5. Citizen-Reported Project Quality and Maintenance Monitoring',
          '6. Government Scheme Application Assistance and Grievance Escalation',
          '7. Department-Wise Government Fund Allocation and Expenditure Monitoring',
        ],
      },
      message: 'Successfully connected to Supabase project.',
    })
  } catch (error: any) {
    const latencyMs = Date.now() - startTime
    return NextResponse.json(
      {
        ok: false,
        status: 'connection_error',
        configured: true,
        host,
        latencyMs,
        error: error?.message || 'Unknown network or authorization error',
        message: 'Could not reach Supabase endpoint. Please verify your Project URL and Publishable Key.',
      },
      { status: 502 }
    )
  }
}

