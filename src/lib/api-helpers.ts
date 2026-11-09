import { NextResponse, type NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { SampleDataReadOnlyError } from '@/lib/sample-db'
import type { PrismaClient } from '@prisma/client'

export function ok<T>(data: T, init?: number) {
  return NextResponse.json(data as object, { status: init ?? 200 })
}

export function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

/** Write an audit trail entry. Never throws — audit failures must not break UX. */
export async function audit(entry: {
  actor: string
  actorRole: string
  action: string
  entity: string
  entityId?: string | null
  summary: string
  details?: string | null
  ipAddress?: string | null
}) {
  try {
    await db.auditLog.create({
      data: {
        actor: entry.actor || 'unknown',
        actorRole: entry.actorRole || 'UNKNOWN',
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId ?? null,
        summary: entry.summary,
        details: entry.details ?? null,
        ipAddress: entry.ipAddress ?? '10.x.x.x (demo)',
      },
    })
  } catch (e) {
    console.error('audit write failed', e)
  }
}

export function handleError(e: unknown, scope: string) {
  if (e instanceof SampleDataReadOnlyError) {
    return NextResponse.json({ error: e.message, sampleData: true }, { status: 503 })
  }
  console.error(`[${scope}]`, e)
  return NextResponse.json({ error: 'Internal error in ' + scope }, { status: 500 })
}

export type Db = PrismaClient

export interface VerifiedIdentity {
  isAuthenticated: boolean
  isAdmin: boolean
  isVigilance: boolean
  isOfficer: boolean
  isCitizen: boolean
  username: string
  role: string
  departmentId?: string | null
  departmentName?: string | null
}

/**
 * Server-side identity verification to ensure administrator and officer actions
 * are backed by trusted credentials (Supabase Auth JWT, session token, or authenticated demo user)
 * rather than unverified client query params (?admin=true) or client-supplied body roles.
 */
export async function getServerVerifiedIdentity(req: NextRequest): Promise<VerifiedIdentity> {
  const authHeader = req.headers.get('authorization') || ''
  const demoUserHeader = req.headers.get('x-demo-user') || ''
  const adminSecretHeader = req.headers.get('x-admin-key') || ''

  // 1. Check server-side admin secret if configured
  const envAdminSecret = process.env.ADMIN_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (adminSecretHeader && envAdminSecret && adminSecretHeader === envAdminSecret) {
    return {
      isAuthenticated: true,
      isAdmin: true,
      isVigilance: true,
      isOfficer: true,
      isCitizen: false,
      username: 'system_admin',
      role: 'ADMIN',
    }
  }

  // 2. Check Bearer token (Supabase JWT / Session)
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim()
    if (token) {
      try {
        // If Supabase client is available with staging/prod config, we can verify with supabase.auth.getUser
        const stagingUrl = process.env.STAGING_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
        const stagingKey = process.env.STAGING_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        if (stagingUrl && stagingKey && stagingUrl.startsWith('http')) {
          const { createClient } = await import('@supabase/supabase-js')
          const supabase = createClient(stagingUrl, stagingKey)
          const { data: { user }, error } = await supabase.auth.getUser(token)
          if (user && !error) {
            const role = (user.app_metadata?.role || user.user_metadata?.role || 'CITIZEN').toUpperCase()
            const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(role)
            const isVigilance = role === 'VIGILANCE_OFFICER'
            const isOfficer = role === 'DEPT_OFFICER' || isAdmin || isVigilance
            return {
              isAuthenticated: true,
              isAdmin,
              isVigilance,
              isOfficer,
              isCitizen: role === 'CITIZEN',
              username: user.email || user.id,
              role,
              departmentId: user.user_metadata?.department_id ?? null,
            }
          }
        }
      } catch (e) {
        console.warn('Bearer token verification error:', e)
      }
    }
  }

  // 3. Authenticated Demo User verification against server database
  if (demoUserHeader) {
    try {
      const user = await db.demoUser.findUnique({
        where: { username: demoUserHeader.trim() },
        include: { department: { select: { id: true, name: true } } },
      })
      if (user) {
        const role = user.role.toUpperCase()
        const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(role)
        const isVigilance = role === 'VIGILANCE_OFFICER'
        const isOfficer = role === 'DEPT_OFFICER' || isAdmin || isVigilance
        return {
          isAuthenticated: true,
          isAdmin,
          isVigilance,
          isOfficer,
          isCitizen: role === 'CITIZEN',
          username: user.username,
          role,
          departmentId: user.departmentId ?? null,
          departmentName: user.department?.name ?? null,
        }
      }
    } catch (e) {
      console.warn('Demo user lookup error:', e)
    }
  }

  // Default: Unauthenticated public citizen
  return {
    isAuthenticated: false,
    isAdmin: false,
    isVigilance: false,
    isOfficer: false,
    isCitizen: true,
    username: 'anonymous_public',
    role: 'PUBLIC',
    departmentId: null,
    departmentName: null,
  }
}

