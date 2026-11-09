'use client'

// Tab 2 — Data Governance: the political-records lifecycle, the required fields that
// keep every record verifiable, and the workflow that keeps them current.

import { ListChecks, Quote, RefreshCcw, ScrollText, ShieldCheck, Users } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { SectionTitle } from '@/components/civic/ui-bits'
import { GenericChip } from '@/components/civic/VerificationBadge'
import {
  GOVERNANCE_PRINCIPLE,
  LIFECYCLE_STATES,
  QUALITY_RULES,
  REQUIRED_FIELDS,
  STALENESS_TRIGGERS,
  VERIFICATION_WORKFLOW,
} from './content'
import { Chip, Mono, NumberedStep, Panel, PanelHead, ScrollBox } from './primitives'

function PrincipleCard() {
  return (
    <Panel>
      <PanelHead
        icon={RefreshCcw}
        title="Core principle — political information is a living dataset"
        desc="Directories decay; governance is what keeps them true."
      />
      <figure className="border-l-2 border-teal-600 pl-3">
        <Quote className="h-3.5 w-3.5 text-teal-600" aria-hidden />
        <blockquote className="mt-1 text-sm leading-relaxed text-slate-700">{GOVERNANCE_PRINCIPLE}</blockquote>
      </figure>
      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-medium text-slate-500">Records go stale after:</span>
        {STALENESS_TRIGGERS.map((t) => (
          <Chip key={t} tone="amber">
            {t}
          </Chip>
        ))}
      </div>
    </Panel>
  )
}

function RequiredFields() {
  return (
    <Panel>
      <PanelHead
        icon={ListChecks}
        title="Required fields per political record"
        desc="Every political record carries this metadata; a record missing a field is treated as unverified."
      />
      <ScrollBox>
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="w-1/4">Field</TableHead>
              <TableHead className="w-[45%]">Purpose</TableHead>
              <TableHead>Where it appears in the UI</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {REQUIRED_FIELDS.map((f) => (
              <TableRow key={f.field}>
                <TableCell className="whitespace-normal align-top text-xs font-semibold text-slate-800">{f.field}</TableCell>
                <TableCell className="whitespace-normal align-top text-xs leading-relaxed text-slate-600">{f.purpose}</TableCell>
                <TableCell className="whitespace-normal align-top text-xs text-slate-500">{f.ui}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollBox>
    </Panel>
  )
}

function LifecycleStates() {
  return (
    <Panel>
      <PanelHead
        icon={Users}
        title="Lifecycle states"
        desc="Four states cover the whole life of a political record — including the awkward ones."
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {LIFECYCLE_STATES.map((s) => (
          <article key={s.status} className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
            <GenericChip tone={s.tone}>{s.label}</GenericChip>
            <p className="mt-2 text-xs font-semibold text-slate-800">{s.meaning}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              <span className="font-medium text-slate-600">e.g. </span>
              {s.example}
            </p>
            <Mono className="mt-2 inline-block">{s.status}</Mono>
          </article>
        ))}
      </div>
    </Panel>
  )
}

function VerificationWorkflow() {
  return (
    <Panel>
      <PanelHead
        icon={ShieldCheck}
        title="Verification workflow"
        desc="How a claim about who holds office becomes a verified record — and stays one."
      />
      <ol className="ml-1">
        {VERIFICATION_WORKFLOW.map((step, i) => (
          <NumberedStep key={step.title} n={i + 1} title={step.title} detail={step.detail} last={i === VERIFICATION_WORKFLOW.length - 1} />
        ))}
      </ol>
      <div className="mt-2 flex items-start gap-2 rounded-lg border border-teal-100 bg-teal-50/60 p-3">
        <ScrollText className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" aria-hidden />
        <p className="text-xs leading-relaxed text-teal-900">
          <strong>Two logs, two jobs.</strong> <Mono>VerificationLog</Mono> answers “what was checked, when, by
          whom”. <Mono>AuditLog</Mono> answers “who changed what, and when”. Together they make the trail
          tamper-visible: edits cannot hide the record of the edit.
        </p>
      </div>
    </Panel>
  )
}

function QualityRules() {
  return (
    <Panel>
      <PanelHead icon={ShieldCheck} title="Data quality rules" desc="Non-negotiable rules that hold for every record, including demonstration data." />
      <ul className="space-y-3">
        {QUALITY_RULES.map((r) => (
          <li key={r.rule} className="flex items-start gap-2.5 rounded-lg border border-slate-100 bg-slate-50/60 p-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-700 text-white">
              <ShieldCheck className="h-3 w-3" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-800">{r.rule}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{r.detail}</p>
              {r.chips && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {r.chips.map((c) => (
                    <Chip key={c} tone="teal">
                      {c}
                    </Chip>
                  ))}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  )
}

export default function GovernanceTab() {
  return (
    <div className="space-y-6">
      <SectionTitle
        icon={ScrollText}
        title="Data governance — political records lifecycle"
        subtitle="Who holds office changes constantly; these rules are how the directory stays trustworthy anyway."
      />
      <PrincipleCard />
      <RequiredFields />
      <LifecycleStates />
      <VerificationWorkflow />
      <QualityRules />
    </div>
  )
}
