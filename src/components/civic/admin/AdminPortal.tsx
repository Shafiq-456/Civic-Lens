'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { LayoutDashboard, Landmark, LogOut, MessageSquareWarning, ScrollText, ShieldCheck, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GenericChip } from '@/components/civic/VerificationBadge'
import { Loading } from '@/components/civic/ui-bits'
import type { DemoUser } from '@/lib/civic/types'
import { AdminLogin } from './AdminLogin'
import { AuditTrailTab } from './AuditTrailTab'
import { CitizenRequestsTab } from './CitizenRequestsTab'
import { ComplaintsTab } from './ComplaintsTab'
import { DashboardTab } from './DashboardTab'
import { MonitoringTab } from './MonitoringTab'
import { RecordsVerificationTab } from './RecordsVerificationTab'
import { ROLE_TONE, roleLabel, type AdminTab } from './admin-shared'

const STORAGE_KEY = 'civic-lenz-user'

function isValidDemoUser(value: unknown): value is DemoUser {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.username === 'string' &&
    typeof v.name === 'string' &&
    (v.role === 'ADMIN' || v.role === 'DEPT_OFFICER' || v.role === 'AUDITOR')
  )
}

function homeTabFor(user: DemoUser): AdminTab {
  return user.role === 'DEPT_OFFICER' ? 'complaints' : 'dashboard'
}

export default function AdminPortal() {
  const [user, setUser] = useState<DemoUser | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [tab, setTab] = useState<AdminTab>('dashboard')

  // Restore the demo session after mount to avoid hydration mismatches.
  // The restore runs in a timeout callback (not synchronously in the effect body)
  // because localStorage is an external system read once after hydration.
  useEffect(() => {
    let cancelled = false
    const restore = () => {
      if (cancelled) return
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        if (raw) {
          const parsed: unknown = JSON.parse(raw)
          if (isValidDemoUser(parsed)) {
            setUser(parsed)
            setTab(homeTabFor(parsed))
          } else {
            window.localStorage.removeItem(STORAGE_KEY)
          }
        }
      } catch {
        // Corrupt storage — ignore and show the login screen.
        window.localStorage.removeItem(STORAGE_KEY)
      }
      setHydrated(true)
    }
    const timer = window.setTimeout(restore, 0)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [])

  const handleLogin = useCallback((u: DemoUser) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    } catch {
      // Storage unavailable (private mode) — session still works in-memory.
    }
    setUser(u)
    setTab(homeTabFor(u))
  }, [])

  const handleLogout = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY)
    setUser(null)
    setTab('dashboard')
    toast.info('Signed out of the administration portal.')
  }, [])

  if (!hydrated) return <Loading label="Restoring session…" />
  if (!user) return <AdminLogin onLogin={handleLogin} />

  const canEdit = user.role !== 'AUDITOR'

  return (
    <section className="space-y-4" aria-label="Government administration portal">
      {/* Header row */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white" aria-hidden>
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-teal-700">Civic Lenz</p>
            <h1 className="text-lg font-semibold leading-tight tracking-tight text-slate-900">
              Government Administration Portal
            </h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="hidden text-xs text-slate-500 sm:inline">Signed in as</span>
          <GenericChip tone={ROLE_TONE[user.role] ?? 'slate'}>
            {user.name} ({roleLabel(user.role)})
          </GenericChip>
          {user.department && (
            <span className="hidden text-xs text-slate-400 md:inline">{user.department}</span>
          )}
          <Button variant="outline" size="sm" onClick={handleLogout} aria-label="Sign out of the administration portal">
            <LogOut className="h-3.5 w-3.5" aria-hidden />
            Sign out
          </Button>
        </div>
      </header>

      {!canEdit && (
        <p
          className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800"
          role="note"
        >
          <strong>Read-only session.</strong> You are signed in as an auditor — mutating actions are disabled across
          all modules.
        </p>
      )}

      <Tabs value={tab} onValueChange={(v) => setTab(v as AdminTab)} className="gap-4">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 p-1 sm:w-fit">
          <TabsTrigger value="dashboard" className="flex-none px-3 py-1.5 text-xs sm:text-sm">
            <LayoutDashboard className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden sm:inline">Dashboard</span>
            <span className="sm:hidden">Home</span>
          </TabsTrigger>
          <TabsTrigger value="complaints" className="flex-none px-3 py-1.5 text-xs sm:text-sm">
            <MessageSquareWarning className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden sm:inline">Complaint Workflow</span>
            <span className="sm:hidden">Complaints</span>
          </TabsTrigger>
          <TabsTrigger value="records" className="flex-none px-3 py-1.5 text-xs sm:text-sm">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden md:inline">Political Data Verification</span>
            <span className="hidden sm:inline md:hidden">Verify</span>
            <span className="sm:hidden">Verify</span>
          </TabsTrigger>
          <TabsTrigger value="citizen" className="flex-none px-3 py-1.5 text-xs sm:text-sm">
            <UserCheck className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden sm:inline">Citizen Verification</span>
            <span className="sm:hidden">Citizens</span>
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex-none px-3 py-1.5 text-xs sm:text-sm">
            <Landmark className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden lg:inline">Representative Monitoring</span>
            <span className="hidden sm:inline lg:hidden">Monitoring</span>
            <span className="sm:hidden">Monitor</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex-none px-3 py-1.5 text-xs sm:text-sm">
            <ScrollText className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden sm:inline">Audit Trail</span>
            <span className="sm:hidden">Audit</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <DashboardTab onNavigate={setTab} />
        </TabsContent>
        <TabsContent value="complaints">
          <ComplaintsTab user={user} canEdit={canEdit} />
        </TabsContent>
        <TabsContent value="records">
          <RecordsVerificationTab user={user} canEdit={canEdit} />
        </TabsContent>
        <TabsContent value="citizen">
          <CitizenRequestsTab user={user} canEdit={canEdit} />
        </TabsContent>
        <TabsContent value="monitoring">
          <MonitoringTab />
        </TabsContent>
        <TabsContent value="audit">
          <AuditTrailTab />
        </TabsContent>
      </Tabs>
    </section>
  )
}
