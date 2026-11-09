'use client'

import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  Landmark,
  Map as MapIcon,
  Megaphone,
  Network,
  Sparkles,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import MapsPanel from './MapsPanel'
import LeadershipPanel from './LeadershipPanel'
import ConstituenciesPanel from './ConstituenciesPanel'
import AnnouncementsPanel from './AnnouncementsPanel'
import CalendarPanel from './CalendarPanel'
import SchemesPanel from './SchemesPanel'
import DepartmentsPanel from './DepartmentsPanel'

export type PortalKey = 'info' | 'accountability' | 'admin' | 'trust'

/**
 * Government Information Portal — the "info" surface of Civic Lenz.
 * Six tabs: maps & geography (flagship), political leadership (verification-first),
 * announcements, official calendar, schemes and departments.
 */
export default function InfoPortal({ onPortalChange }: { onPortalChange?: (p: PortalKey) => void }) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Civic Lenz · Information</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Government Information Portal</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Maps, leadership directory, announcements, calendar, schemes and departments — every fact carries its official source,
            effective date and verification status.
          </p>
        </div>

        {onPortalChange && (
          <nav aria-label="Switch portal" className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPortalChange('accountability')}
              aria-label="Open the accountability portal"
            >
              Accountability
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </Button>
            <Button variant="outline" size="sm" onClick={() => onPortalChange('trust')} aria-label="Open the trust centre portal">
              Trust centre
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </Button>
            <Button variant="outline" size="sm" onClick={() => onPortalChange('admin')} aria-label="Open the admin portal">
              Admin
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </Button>
          </nav>
        )}
      </header>

      <Tabs defaultValue="maps" className="gap-5">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 bg-slate-100 p-1" aria-label="Information portal sections">
          <TabsTrigger value="maps" className="gap-1.5 px-2.5 py-1.5 text-xs sm:text-sm">
            <MapIcon className="h-4 w-4" aria-hidden />
            Maps & Geography
          </TabsTrigger>
          <TabsTrigger value="leadership" className="gap-1.5 px-2.5 py-1.5 text-xs sm:text-sm">
            <Landmark className="h-4 w-4" aria-hidden />
            Political Leadership
          </TabsTrigger>
          <TabsTrigger value="constituencies" className="gap-1.5 px-2.5 py-1.5 text-xs sm:text-sm">
            <Network className="h-4 w-4" aria-hidden />
            Districts & Constituencies
          </TabsTrigger>
          <TabsTrigger value="announcements" className="gap-1.5 px-2.5 py-1.5 text-xs sm:text-sm">
            <Megaphone className="h-4 w-4" aria-hidden />
            Announcements
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-1.5 px-2.5 py-1.5 text-xs sm:text-sm">
            <CalendarDays className="h-4 w-4" aria-hidden />
            Official Calendar
          </TabsTrigger>
          <TabsTrigger value="schemes" className="gap-1.5 px-2.5 py-1.5 text-xs sm:text-sm">
            <Sparkles className="h-4 w-4" aria-hidden />
            Schemes
          </TabsTrigger>
          <TabsTrigger value="departments" className="gap-1.5 px-2.5 py-1.5 text-xs sm:text-sm">
            <Building2 className="h-4 w-4" aria-hidden />
            Departments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="maps">
          <MapsPanel />
        </TabsContent>
        <TabsContent value="leadership">
          <LeadershipPanel />
        </TabsContent>
        <TabsContent value="constituencies">
          <ConstituenciesPanel />
        </TabsContent>
        <TabsContent value="announcements">
          <AnnouncementsPanel />
        </TabsContent>
        <TabsContent value="calendar">
          <CalendarPanel />
        </TabsContent>
        <TabsContent value="schemes">
          <SchemesPanel />
        </TabsContent>
        <TabsContent value="departments">
          <DepartmentsPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}
