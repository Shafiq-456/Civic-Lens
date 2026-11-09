'use client'

import { useState } from 'react'
import { AlertTriangle, ArrowRight, CheckCircle2, FilePlus2, ListOrdered, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ErrorState, SectionTitle } from '@/components/civic/ui-bits'
import { apiSend } from '@/lib/civic/api'
import { COMPLAINT_CATEGORY_META, formatDateTime } from '@/lib/civic/format'
import type { ComplaintSummary } from '@/lib/civic/types'
import { ComplaintStatusChip, CopyButton, PriorityChip, useDistricts } from './shared'

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const
const PRIORITY_LABEL: Record<string, string> = { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High', CRITICAL: 'Critical' }
const PRIORITY_SLA: Record<string, string> = { LOW: 'best effort', MEDIUM: '120 h SLA', HIGH: '72 h SLA', CRITICAL: '48 h SLA' }

type FieldErrors = Partial<Record<'name' | 'districtId' | 'category' | 'priority' | 'title' | 'description', string>>

function Field({
  id,
  label,
  required,
  error,
  hint,
  children,
}: {
  id: string
  label: string
  required?: boolean
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}
        {required && (
          <span className="ml-0.5 text-rose-600" aria-hidden>
            *
          </span>
        )}
      </Label>
      {children}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && (
        <p className="text-xs font-medium text-rose-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

const NEXT_STEPS = [
  { title: 'Registered', body: 'You receive a ticket number instantly — this is your reference for all follow-ups.' },
  { title: 'Acknowledged', body: 'The concerned department acknowledges the complaint within the SLA window for its priority.' },
  { title: 'In progress', body: 'Field officers act on the issue and post dated updates to the public timeline.' },
  { title: 'Resolved', body: 'A resolution note is published and you can rate satisfaction with the outcome.' },
]

/** Tab 2 — file a new civic complaint with inline validation and a confirmation panel. */
export default function FileComplaintTab({ onTrackTicket }: { onTrackTicket: (ticket: string) => void }) {
  const districts = useDistricts()

  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [districtId, setDistrictId] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState('')
  const [ward, setWard] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState<ComplaintSummary | null>(null)

  function resetForm() {
    setName('')
    setContact('')
    setDistrictId('')
    setCategory('')
    setPriority('')
    setWard('')
    setTitle('')
    setDescription('')
    setErrors({})
    setFormError(null)
    setSubmitted(null)
  }

  function validate(): FieldErrors {
    const errs: FieldErrors = {}
    if (!name.trim()) errs.name = 'Full name is required.'
    if (!districtId) errs.districtId = 'Select the district where the issue was observed.'
    if (!category) errs.category = 'Select a category.'
    if (!priority) errs.priority = 'Select a priority.'
    if (!title.trim()) errs.title = 'A short title is required.'
    if (description.trim().length < 20) errs.description = 'Please describe the issue in at least 20 characters.'
    return errs
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) {
      toast.error('Please fix the highlighted fields before submitting.')
      return
    }
    setSubmitting(true)
    setFormError(null)
    try {
      const res = await apiSend<{ complaint: ComplaintSummary }>('/api/complaints', 'POST', {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        districtId,
        citizenName: name.trim(),
        contact: contact.trim() || undefined,
        wardOrArea: ward.trim() || undefined,
      })
      setSubmitted(res.complaint)
      toast.success(`Complaint registered — ${res.complaint.ticketNo}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to file the complaint. Please try again.'
      setFormError(msg)
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Form / confirmation — 3 of 5 columns */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-3" aria-label="File a complaint">
        <SectionTitle
          icon={FilePlus2}
          title="File a civic complaint"
          subtitle="Report roads, water, power, sanitation and other civic issues. You receive a public ticket number instantly."
        />

        {submitted ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6" role="status">
            <div className="text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" aria-hidden />
              <h3 className="mt-3 text-lg font-semibold text-emerald-900">Complaint registered</h3>
              <p className="mt-1 text-sm text-emerald-800">Save this ticket number — it is your public reference for tracking.</p>
            </div>
            <div className="mt-4 flex flex-col items-center gap-3">
              <p className="rounded-lg border border-emerald-200 bg-white px-4 py-2 font-mono text-2xl font-bold tracking-wide text-teal-800">
                {submitted.ticketNo}
              </p>
              <CopyButton value={submitted.ticketNo} label="Copy ticket no." />
            </div>
            <dl className="mx-auto mt-5 grid max-w-md gap-2 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500">Status</dt>
                <dd>
                  <ComplaintStatusChip status={submitted.status} />
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500">Priority</dt>
                <dd>
                  <PriorityChip priority={submitted.priority} />
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500">Filed on</dt>
                <dd className="font-medium text-slate-800">{formatDateTime(submitted.createdAt)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500">SLA due by</dt>
                <dd className="font-medium text-slate-800">{formatDateTime(submitted.slaDueAt)}</dd>
              </div>
            </dl>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Button
                className="gap-1.5 bg-teal-700 text-white hover:bg-teal-800"
                onClick={() => onTrackTicket(submitted.ticketNo)}
              >
                Track this complaint
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
              <Button variant="outline" onClick={resetForm}>
                File another complaint
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {formError && <ErrorState message={formError} />}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="fc-name" label="Full name" required error={errors.name} hint="Shown masked on the public record.">
                <Input
                  id="fc-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Raman"
                  autoComplete="name"
                  aria-invalid={!!errors.name}
                />
              </Field>
              <Field id="fc-contact" label="Contact (optional)" hint="Stored masked in this demo — e.g. +91 XXXXX 8234.">
                <Input
                  id="fc-contact"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Phone or email"
                  autoComplete="tel"
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="fc-district" label="District" required error={errors.districtId}>
                <Select value={districtId} onValueChange={setDistrictId} disabled={districts.loading}>
                  <SelectTrigger id="fc-district" className="w-full" aria-invalid={!!errors.districtId}>
                    <SelectValue placeholder={districts.loading ? 'Loading districts…' : 'Select district'} />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {districts.data?.districts.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field id="fc-ward" label="Ward / area (optional)">
                <Input id="fc-ward" value={ward} onChange={(e) => setWard(e.target.value)} placeholder="e.g. Ward 12, Anna Nagar" />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="fc-category" label="Category" required error={errors.category}>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="fc-category" className="w-full" aria-invalid={!!errors.category}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {Object.entries(COMPLAINT_CATEGORY_META).map(([key, meta]) => (
                      <SelectItem key={key} value={key}>
                        {meta.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field
                id="fc-priority"
                label="Priority"
                required
                error={errors.priority}
                hint="SLA targets — Critical: 48 h · High: 72 h · Medium: 120 h"
              >
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger id="fc-priority" className="w-full" aria-invalid={!!errors.priority}>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {PRIORITY_LABEL[p]} ({PRIORITY_SLA[p]})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field id="fc-title" label="Title" required error={errors.title} hint="One line summarising the issue.">
              <Input
                id="fc-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Unsafe open manhole near bus stop"
                aria-invalid={!!errors.title}
              />
            </Field>

            <Field
              id="fc-description"
              label="Description"
              required
              error={errors.description}
              hint={`${description.trim().length}/20 characters minimum — include landmarks and how long the issue has persisted.`}
            >
              <Textarea
                id="fc-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Describe the issue, exact location details and since when it has been affecting the area…"
                aria-invalid={!!errors.description}
              />
            </Field>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={submitting}
                className="gap-1.5 bg-teal-700 text-white hover:bg-teal-800 disabled:opacity-60"
              >
                {submitting ? 'Submitting…' : 'Submit complaint'}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          </form>
        )}
      </section>

      {/* Guidance — 2 of 5 columns */}
      <aside className="space-y-4 lg:col-span-2" aria-label="Filing guidance">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <ListOrdered className="h-4 w-4 text-teal-700" aria-hidden />
            What happens next
          </h3>
          <ol className="mt-3 space-y-3">
            {NEXT_STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-3">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-teal-700"
                  aria-hidden
                >
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-800">{s.title}</p>
                  <p className="text-xs text-slate-500">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-xl border border-teal-200 bg-teal-50 p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-teal-900">
            <ShieldCheck className="h-4 w-4" aria-hidden />
            Integrity &amp; corruption complaints
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-teal-800">
            Complaints filed under <strong>Grievance / integrity</strong> are handled with identity protection: the filer’s
            personal details are shielded from the public record and the ticket is automatically escalated to the vigilance
            cell for review.
          </p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-900">
            <AlertTriangle className="h-4 w-4" aria-hidden />
            Not for emergencies
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-amber-800">
            This portal is not monitored in real time. For medical, fire, or law-and-order emergencies, contact your local
            emergency services immediately.
          </p>
        </div>
      </aside>
    </div>
  )
}
