'use client'

import { useState } from 'react'
import {
  Building2,
  ChevronsUpDown,
  Copy,
  ExternalLink,
  FolderKanban,
  HardHat,
  IndianRupee,
  Landmark,
  Mail,
  MapPin,
  Megaphone,
  MessageSquareWarning,
  Phone,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { toast } from 'sonner'
import { useApi } from '@/lib/civic/api'
import type { Department } from '@/lib/civic/types'
import { formatCr } from '@/lib/civic/format'
import { EmptyState, ErrorState, Loading, SectionTitle } from '@/components/civic/ui-bits'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { CARD } from './shared'

/* ------------------------------------------------------------------ */

interface DepartmentsResponse {
  departments: Department[]
}

async function copyText(value: string, label: string) {
  try {
    await navigator.clipboard.writeText(value)
    toast.success(`${label} copied to clipboard`)
  } catch {
    toast.error(`Could not copy ${label.toLowerCase()}`)
  }
}

/* ------------------------------------------------------------------ */

export default function DepartmentsPanel() {
  const { data, loading, error } = useApi<DepartmentsResponse>('/api/departments')
  const departments = data?.departments ?? []

  return (
    <section aria-label="Government departments" className="space-y-4">
      <SectionTitle
        icon={Landmark}
        title="Departments"
        subtitle="Ministry-level directory with budgets, portfolio counts and officer contacts."
        right={
          !loading && !error && departments.length > 0 ? (
            <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
              {departments.length} department{departments.length === 1 ? '' : 's'}
            </span>
          ) : undefined
        }
      />

      {loading ? (
        <Loading label="Loading departments…" />
      ) : error ? (
        <ErrorState message={`Could not load departments: ${error}`} />
      ) : departments.length === 0 ? (
        <EmptyState title="No departments listed" hint="Department profiles will appear here once the directory is populated." />
      ) : (
        <ul className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
          {departments.map((d) => (
            <DepartmentCard key={d.id} department={d} />
          ))}
        </ul>
      )}
    </section>
  )
}

/* ------------------------------------------------------------------ */

function DepartmentCard({ department: d }: { department: Department }) {
  const [open, setOpen] = useState(false)

  return (
    <li className={`${CARD} flex flex-col`}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold leading-snug text-slate-900">{d.name}</h3>
        {d.shortName && (
          <span className="shrink-0 rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-[11px] font-semibold text-teal-700">
            {d.shortName}
          </span>
        )}
      </div>

      <p className="mt-1.5 line-clamp-3 flex-1 text-xs leading-relaxed text-slate-600">{d.description}</p>

      <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-2.5 text-xs text-slate-600">
        {d.ministerName && (
          <p className="flex items-center gap-1.5">
            <UserRound className="h-3.5 w-3.5 shrink-0 text-teal-700" aria-hidden />
            Minister: <span className="font-medium text-slate-800">{d.ministerName}</span>
          </p>
        )}
        <p className="flex items-center gap-1.5">
          <IndianRupee className="h-3.5 w-3.5 shrink-0 text-teal-700" aria-hidden />
          Budget: <span className="font-semibold text-teal-800">{formatCr(d.budgetInrCr)}</span>
        </p>
        {d.verificationStatus === 'VERIFIED' && d.lastVerifiedAt ? (
          <p className="flex items-center gap-1.5 text-[11px] text-teal-700">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Minister verified against official source
          </p>
        ) : (
          <p className="text-[11px] text-amber-700">Verification pending</p>
        )}
        {d.verificationNote && (
          <p className="rounded-md bg-amber-50 px-2 py-1.5 text-[11px] leading-relaxed text-amber-800">
            {d.verificationNote}
          </p>
        )}
        {d.website && (
          <a
            href={d.website}
            target="_blank"
            rel="noreferrer"
            className="inline-flex max-w-full items-center gap-1 truncate text-[11px] font-medium text-teal-700 hover:underline"
            aria-label={`Open official website for ${d.shortName ?? d.name}`}
          >
            <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
            <span className="truncate">Official website</span>
          </a>
        )}
      </div>

      {/* Portfolio counts */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <CountPill icon={FolderKanban} label={`${d._count.schemes} schemes`} />
        <CountPill icon={HardHat} label={`${d._count.projects} projects`} />
        <CountPill icon={MessageSquareWarning} label={`${d._count.complaints} complaints`} />
        <CountPill icon={Megaphone} label={`${d._count.announcements} announcements`} />
      </div>

      {/* Contacts (masked values) */}
      <div className="mt-3 space-y-1">
        {d.contactEmail && (
          <div className="flex items-center justify-between gap-2">
            <p className="flex min-w-0 items-center gap-1.5 text-xs text-slate-600">
              <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
              <span className="truncate">{d.contactEmail}</span>
            </p>
            <button
              type="button"
              onClick={() => copyText(d.contactEmail!, 'Email')}
              className="rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-teal-700"
              aria-label={`Copy email address for ${d.shortName ?? d.name}`}
            >
              <Copy className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>
        )}
        {d.contactPhone && (
          <div className="flex items-center justify-between gap-2">
            <p className="flex min-w-0 items-center gap-1.5 text-xs text-slate-600">
              <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
              <span className="truncate">{d.contactPhone}</span>
            </p>
            <button
              type="button"
              onClick={() => copyText(d.contactPhone!, 'Phone number')}
              className="rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-teal-700"
              aria-label={`Copy phone number for ${d.shortName ?? d.name}`}
            >
              <Copy className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>
        )}
      </div>

      {/* Expandable: address + secretary */}
      {(d.address || d.secretaryName) && (
        <Collapsible open={open} onOpenChange={setOpen} className="mt-3">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-full justify-between border border-slate-200 px-3 text-xs text-slate-600 hover:text-teal-700">
              Address & secretary
              <ChevronsUpDown className="h-3.5 w-3.5" aria-hidden />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2 space-y-1.5 rounded-lg bg-slate-50 px-3 py-2.5 text-xs text-slate-600">
              {d.secretaryName && (
                <p className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 shrink-0 text-teal-700" aria-hidden />
                  Secretary: <span className="font-medium text-slate-800">{d.secretaryName}</span>
                </p>
              )}
              {d.address && (
                <p className="flex items-start gap-1.5">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                  <span>{d.address}</span>
                </p>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </li>
  )
}

function CountPill({ icon: Icon, label }: { icon: typeof FolderKanban; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-500">
      <Icon className="h-3 w-3 shrink-0 text-slate-400" aria-hidden />
      {label}
    </span>
  )
}
