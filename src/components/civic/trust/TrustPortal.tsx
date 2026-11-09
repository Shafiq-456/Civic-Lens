'use client'

// Trust, Data Governance & Deployment portal — the documentation and assurance
// layer of Civic Lenz. Five tabs: architecture, data governance, map accuracy,
// security assessment and the deployment roadmap. Entirely static content.

import { Layers, Map, Rocket, ShieldAlert, ShieldCheck, ScrollText } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SectionTitle, StatCard } from '@/components/civic/ui-bits'
import ArchitectureTab from './ArchitectureTab'
import GovernanceTab from './GovernanceTab'
import MapAccuracyTab from './MapAccuracyTab'
import RoadmapTab from './RoadmapTab'
import SecurityTab from './SecurityTab'

const TABS = [
  { value: 'architecture', label: 'Platform Architecture', icon: Layers },
  { value: 'governance', label: 'Data Governance', icon: ScrollText },
  { value: 'maps', label: 'Map Accuracy', icon: Map },
  { value: 'security', label: 'Security Assessment', icon: ShieldAlert },
  { value: 'roadmap', label: 'Deployment Roadmap', icon: Rocket },
] as const

const SCROLLBAR_X =
  '[&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300'

function OverviewStats() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard label="Portals documented" value={3} icon={Layers} sub="Information · Accountability · Administration" />
      <StatCard label="Geo layers audited" value={4} icon={Map} sub="States · Districts · ACs · PCs" />
      <StatCard label="Security controls required" value={8} icon={ShieldAlert} sub="None complete in the prototype" tone="amber" />
      <StatCard label="Deployment phases" value={4} icon={Rocket} sub="Prototype → handover" />
    </div>
  )
}

export default function TrustPortal() {
  return (
    <div className="space-y-6">
      <SectionTitle
        icon={ShieldCheck}
        title="Trust, Data Governance & Deployment"
        subtitle="How Civic Lenz is built, how political data stays current, where the map is accurate and where it is not, what security work remains — and how an authorised deployment would proceed."
      />

      <OverviewStats />

      <Tabs defaultValue="architecture" className="gap-6">
        <div className={`-mx-1 overflow-x-auto px-1 pb-1 ${SCROLLBAR_X}`}>
          <TabsList className="h-auto min-w-max">
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value} className="gap-1.5 px-3 py-1.5">
                <t.icon className="h-4 w-4" aria-hidden />
                <span className="whitespace-nowrap">{t.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="architecture">
          <ArchitectureTab />
        </TabsContent>
        <TabsContent value="governance">
          <GovernanceTab />
        </TabsContent>
        <TabsContent value="maps">
          <MapAccuracyTab />
        </TabsContent>
        <TabsContent value="security">
          <SecurityTab />
        </TabsContent>
        <TabsContent value="roadmap">
          <RoadmapTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
