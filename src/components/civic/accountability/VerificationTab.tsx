'use client'

import { useState } from 'react'
import { ArrowRight, ClipboardList, FileCheck2, Gavel, Lock, ShieldCheck, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { GenericChip } from '@/components/civic/VerificationBadge'
import { SectionTitle } from '@/components/civic/ui-bits'
import { apiSend } from '@/lib/civic/api'
import { formatDateTime } from '@/lib/civic/format'
import type { CitizenVerificationRequest } from '@/lib/civic/types'
import { CopyButton } from './shared'

const REQUEST_TYPES: Array<{ value: string; label: string }> = [
  { value: 'RESIDENCE', label: 'Proof of residence' },
  { value: 'INCOME', label: 'Income certificate' },
  { value: 'BPL', label: 'BPL ration status' },
  { value: 'SCHEME_ENROLLMENT', label: 'Scheme enrollment' },
  { value: 'OTHER', label: 'Other certificate' },
]

const PROCESS_STEPS = [
  {
    icon: ClipboardList,
    title: 'Submission',
    body: 'You submit the request with masked document references and receive a request number (e.g. CV-2025-000421) instantly.',
  },
  {
    icon: UserRound,
    title: 'Officer review',
    body: 'An officer at the administration office reviews the request against the demonstration records.',
  },
  {
    icon: Gavel,
    title: 'Decision with remarks',
    body: 'The request is approved or rejected with remarks explaining the decision, visible in the Administration Portal.',
  },
  {
    icon: FileCheck2,
    title: 'Audit-logged',
    body: 'Every action on the request is written to the immutable audit trail — actor, role, timestamp and summary.',
  },
]

type FieldErrors = Partial<Record<'name' | 'requestType', string>>

/** Tab 6 — submit demo citizen verification requests and learn how they are processed. */
export default function VerificationTab() {
  const [name, setName] = useState('')
  const [requestType, setRequestType] = useState('')
  const [documentRef, setDocumentRef] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [created, setCreated] = useState<CitizenVerificationRequest | null>(null)

  function resetForm() {
    setName('')
    setRequestType('')
    setDocumentRef('')
    setErrors({})
    setFormError(null)
    setCreated(null)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const errs: FieldErrors = {}
    if (!name.trim()) errs.name = 'Full name is required.'
    if (!requestType) errs.requestType = 'Select the type of verification request.'
    setErrors(errs)
    if (Object.keys(errs).length > 0) {
      toast.error('Please fix the highlighted fields before submitting.')
      return
    }
    setSubmitting(true)
    setFormError(null)
    try {
      const res = await apiSend<{ request: CitizenVerificationRequest }>('/api/verification-requests', 'POST', {
        citizenName: name.trim(),
        requestType,
        documentMasked: documentRef.trim() || undefined,
      })
      setCreated(res.request)
      toast.success(`Verification request submitted — ${res.request.requestNo}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to submit the request. Please try again.'
      setFormError(msg)
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* What is citizen verification */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6" aria-label="About citizen verification">
        <SectionTitle
          icon={ShieldCheck}
          title="Citizen verification in Civic Lenz"
          subtitle="Certificate and enrollment status checks route through this portal for accountability tracking."
        />
        <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
          <p>
            Citizens can raise verification requests for residence, income, BPL ration status and scheme enrollment. In this
            build, requests are <strong>demonstration submissions</strong> — they flow through the same review and audit
            pipeline as production requests, but no real identity data is collected.
          </p>
          <p>
            Document references must be <strong>masked before submission</strong> (e.g. Aadhaar XXXX-XXXX-4821). Storage is
            masked by design, and processing appears in the Government Administration Portal where officers act on the queue.
          </p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Request form — 3 of 5 columns */}
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-3" aria-label="Submit a verification request">
          <SectionTitle
            icon={FileCheck2}
            title="Submit a verification request"
            subtitle="Demo submission — the response includes a request number you can quote at the administration office."
          />

          {created ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6" role="status">
              <div className="text-center">
                <ShieldCheck className="mx-auto h-10 w-10 text-emerald-600" aria-hidden />
                <h3 className="mt-3 text-lg font-semibold text-emerald-900">Request submitted</h3>
                <p className="mt-1 text-sm text-emerald-800">Quote this request number for any follow-up.</p>
              </div>
              <div className="mt-4 flex flex-col items-center gap-3">
                <p className="rounded-lg border border-emerald-200 bg-white px-4 py-2 font-mono text-2xl font-bold tracking-wide text-teal-800">
                  {created.requestNo}
                </p>
                <CopyButton value={created.requestNo} label="Copy request no." />
              </div>
              <dl className="mx-auto mt-5 grid max-w-md gap-2 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-slate-500">Status</dt>
                  <dd>
                    <GenericChip tone="amber">{created.status}</GenericChip>
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-slate-500">Request type</dt>
                  <dd className="font-medium text-slate-800">
                    {REQUEST_TYPES.find((t) => t.value === created.requestType)?.label ?? created.requestType}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-slate-500">Submitted at</dt>
                  <dd className="font-medium text-slate-800">{formatDateTime(created.submittedAt)}</dd>
                </div>
              </dl>
              <p className="mx-auto mt-4 max-w-md rounded-lg border border-teal-200 bg-teal-50 p-3 text-xs leading-relaxed text-teal-800">
                Track via the administration office; processing appears in the Government Administration Portal.
              </p>
              <div className="mt-5 flex justify-center">
                <Button variant="outline" onClick={resetForm}>
                  Submit another request
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {formError && (
                <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
                  {formError}
                </p>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="cv-name">
                  Full name
                  <span className="ml-0.5 text-rose-600" aria-hidden>
                    *
                  </span>
                </Label>
                <Input
                  id="cv-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Lakshmi Narayanan"
                  autoComplete="name"
                  aria-invalid={!!errors.name}
                />
                {errors.name && (
                  <p className="text-xs font-medium text-rose-600" role="alert">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cv-type">
                  Request type
                  <span className="ml-0.5 text-rose-600" aria-hidden>
                    *
                  </span>
                </Label>
                <Select value={requestType} onValueChange={setRequestType}>
                  <SelectTrigger id="cv-type" className="w-full" aria-invalid={!!errors.requestType}>
                    <SelectValue placeholder="Select request type" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {REQUEST_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.requestType && (
                  <p className="text-xs font-medium text-rose-600" role="alert">
                    {errors.requestType}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cv-doc">Document reference (optional)</Label>
                <Input
                  id="cv-doc"
                  value={documentRef}
                  onChange={(e) => setDocumentRef(e.target.value)}
                  placeholder="e.g. Aadhaar XXXX-XXXX-4821"
                  className="font-mono"
                />
                <p className="text-xs text-slate-500">Mask before submitting, e.g. Aadhaar XXXX-XXXX-4821 — never enter full numbers.</p>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="gap-1.5 bg-teal-700 text-white hover:bg-teal-800 disabled:opacity-60"
                >
                  {submitting ? 'Submitting…' : 'Submit request'}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              </div>
            </form>
          )}
        </section>

        {/* Process + privacy — 2 of 5 columns */}
        <aside className="space-y-4 lg:col-span-2" aria-label="How requests are processed">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">How requests are processed</h3>
            <ol className="mt-3 space-y-4">
              {PROCESS_STEPS.map((step, i) => (
                <li key={step.title} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-teal-700">
                      {i + 1}
                    </span>
                    {i < PROCESS_STEPS.length - 1 && <span className="mt-1 w-px flex-1 bg-slate-200" aria-hidden />}
                  </div>
                  <div className="pb-1">
                    <p className="flex items-center gap-1.5 text-sm font-medium text-slate-800">
                      <step.icon className="h-3.5 w-3.5 text-teal-700" aria-hidden />
                      {step.title}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-900">
              <Lock className="h-4 w-4" aria-hidden />
              Privacy &amp; data minimisation
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-amber-800">
              Only the minimum data needed is collected, document references are stored masked, and records are retained per
              the retention policy published on the Trust portal. Full identity documents are never requested on this surface.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
