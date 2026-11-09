import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { audit, handleError, ok, bad } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

/**
 * DEMO authentication for the administration portal.
 * Production must replace this with NextAuth (hashed credentials, MFA for
 * privileged roles, session management) — see the Trust & Documentation portal.
 */
export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()
    if (!username || !password) return bad('Username and password required')

    const user = await db.demoUser.findUnique({ where: { username }, include: { department: { select: { name: true } } } })
    if (!user || user.password !== password) {
      await audit({ actor: username, actorRole: 'UNKNOWN', action: 'LOGIN_FAILED', entity: 'DEMO_USER', entityId: username, summary: 'Failed demonstration login attempt.' })
      return bad('Invalid credentials', 401)
    }
    await audit({
      actor: user.username, actorRole: user.role, action: 'LOGIN', entity: 'DEMO_USER', entityId: user.username,
      summary: `${user.name} signed in to the administration portal (demo).`,
    })
    return ok({
      user: { username: user.username, name: user.name, role: user.role, department: user.department?.name ?? null },
      notice: 'Demonstration authentication — production must use NextAuth with hashed credentials and MFA.',
    })
  } catch (e) {
    return handleError(e, 'POST /api/demo-auth')
  }
}
