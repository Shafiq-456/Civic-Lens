'use client'

import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Eye, KeyRound, Loader2, ShieldCheck, UserCog, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiSend } from '@/lib/civic/api'
import type { DemoUser } from '@/lib/civic/types'

const DEMO_ACCOUNTS = [
  { username: 'admin', password: 'Admin@123', label: 'Administrator', description: 'Full access to every module' },
  { username: 'officer', password: 'Officer@123', label: 'Department officer', description: 'Complaint workflow focus' },
  { username: 'auditor', password: 'Auditor@123', label: 'Auditor', description: 'Read-only oversight session' },
] as const

export function AdminLogin({ onLogin }: { onLogin: (user: DemoUser) => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function fill(account: (typeof DEMO_ACCOUNTS)[number]) {
    setUsername(account.username)
    setPassword(account.password)
    setError(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await apiSend<{ user: DemoUser; notice: string }>('/api/demo-auth', 'POST', {
        username: username.trim(),
        password,
      })
      toast.success(`Welcome, ${res.user.name}`, { description: res.notice })
      onLogin(res.user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {/* Brand header */}
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white" aria-hidden>
              <ShieldCheck className="h-6 w-6" />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-teal-700">Civic Lenz</p>
              <h1 className="text-lg font-semibold leading-tight tracking-tight text-slate-900">
                Government Administration Portal
              </h1>
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Sign in to verify political records against official sources, triage citizen complaints and inspect the
            audit trail.
          </p>

          {/* Role explainer */}
          <ul className="mt-4 space-y-2 rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600" aria-label="Role permissions">
            <li className="flex items-center gap-2">
              <UserCog className="h-3.5 w-3.5 shrink-0 text-teal-700" aria-hidden />
              <span><strong className="font-semibold text-slate-800">Administrator</strong> — full access across every module</span>
            </li>
            <li className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden />
              <span><strong className="font-semibold text-slate-800">Department officer</strong> — complaint workflow first, other modules viewable</span>
            </li>
            <li className="flex items-center gap-2">
              <Eye className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden />
              <span><strong className="font-semibold text-slate-800">Auditor</strong> — fully read-only oversight session</span>
            </li>
          </ul>

          {/* Credentials form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="admin-username">Username</Label>
              <Input
                id="admin-username"
                name="username"
                autoComplete="username"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700" role="alert">
                {error}
              </p>
            )}
            <Button
              type="submit"
              className="w-full bg-teal-700 text-white hover:bg-teal-800"
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <KeyRound className="h-4 w-4" aria-hidden />
              )}
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          {/* Demo credential quick-fill */}
          <div className="mt-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Demo credentials — click to fill
            </p>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.username}
                  type="button"
                  onClick={() => fill(account)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs transition hover:border-teal-300 hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-teal-700"
                  aria-label={`Fill credentials for ${account.label}`}
                >
                  <span className="block font-mono font-semibold text-slate-800">{account.username}</span>
                  <span className="block text-slate-500">{account.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Security notice */}
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <strong>Demonstration authentication only</strong> — production requires NextAuth with hashed credentials,
            MFA for privileged roles and session management (see Trust &amp; Docs portal).
          </div>
        </div>
      </div>
    </div>
  )
}
