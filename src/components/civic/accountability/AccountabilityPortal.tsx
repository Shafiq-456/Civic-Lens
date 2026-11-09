'use client'

import { useCallback, useRef, useState } from 'react'
import { FilePlus2, FolderKanban, IndianRupee, LayoutDashboard, Radar, ShieldCheck } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { TrackPrefill } from './shared'
import OverviewTab from './OverviewTab'
import FileComplaintTab from './FileComplaintTab'
import TrackComplaintsTab from './TrackComplaintsTab'
import ProjectsTab from './ProjectsTab'
import FinancialTab from './FinancialTab'
import VerificationTab from './VerificationTab'

/**
 * Public Accountability Portal — complaints, project delivery, financial
 * transparency and citizen verification, in one tabbed surface.
 */
export default function AccountabilityPortal() {
  const [tab, setTab] = useState('overview')
  const [prefill, setPrefill] = useState<TrackPrefill>(null)
  const nonce = useRef(0)

  /** Switch to the tracking tab with a ticket number prefilled (used by Overview + File flows). */
  const handleTrackTicket = useCallback((ticket: string) => {
    nonce.current += 1
    setPrefill({ ticket, nonce: nonce.current })
    setTab('complaint-track')
  }, [])

  return (
    <div className="space-y-4">
      <header className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-teal-700">
          <Radar className="h-3.5 w-3.5" aria-hidden />
          Civic Lenz · Accountability
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Public Accountability Portal</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-500">
          File and track civic complaints, follow project delivery and spending, and request citizen verification — every
          action on this portal is logged and reconcilable against the audit trail.
        </p>
      </header>

      <Tabs value={tab} onValueChange={setTab} className="gap-4">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 p-1" aria-label="Accountability sections">
          <TabsTrigger value="overview">
            <LayoutDashboard aria-hidden />
            Overview
          </TabsTrigger>
          <TabsTrigger value="file-complaint">
            <FilePlus2 aria-hidden />
            File a Complaint
          </TabsTrigger>
          <TabsTrigger value="complaint-track">
            <Radar aria-hidden />
            Track Complaints
          </TabsTrigger>
          <TabsTrigger value="projects">
            <FolderKanban aria-hidden />
            Projects &amp; History
          </TabsTrigger>
          <TabsTrigger value="finance">
            <IndianRupee aria-hidden />
            Financial Transparency
          </TabsTrigger>
          <TabsTrigger value="verification">
            <ShieldCheck aria-hidden />
            Citizen Verification
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab onTrackTicket={handleTrackTicket} />
        </TabsContent>
        <TabsContent value="file-complaint">
          <FileComplaintTab onTrackTicket={handleTrackTicket} />
        </TabsContent>
        <TabsContent value="complaint-track">
          <TrackComplaintsTab prefill={prefill} />
        </TabsContent>
        <TabsContent value="projects">
          <ProjectsTab />
        </TabsContent>
        <TabsContent value="finance">
          <FinancialTab />
        </TabsContent>
        <TabsContent value="verification">
          <VerificationTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
