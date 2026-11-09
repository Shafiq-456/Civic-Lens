# Task 6-b — Public Accountability Portal UI (Civic Lenz)

**Agent:** 6-b (accountability-portal-ui)
**Scope:** `src/components/civic/accountability/` only — no files outside this folder were created or modified.

## Files created (8)

| File | Purpose |
|---|---|
| `AccountabilityPortal.tsx` | Default export `AccountabilityPortal()` — hero header, controlled shadcn `Tabs` (6 tabs, `defaultValue` handled via controlled `value` starting at `"overview"`), lifted `handleTrackTicket()` that switches to the Track tab with a `{ ticket, nonce }` prefill payload. |
| `shared.tsx` | Shared infra: response types (`DistrictsResponse`, `ComplaintsResponse`, `ProjectsResponse`, `TrackPrefill`), `TONE_BAR`/`TONE_DOT` solid tone maps, `PriorityChip`, `ComplaintStatusChip`, `ProjectStatusChip`, `StatusBarList` (proportional CSS bars driven by a meta map), `useDistricts()` (`/api/districts?stateCode=TN`), `CopyButton` (clipboard + sonner toasts, with insecure-context fallback). |
| `OverviewTab.tsx` | Tab 1 — accountability-specific `DataBanner`, 4 `StatCard`s (open complaints, resolution rate, active projects, budget utilisation), "Complaints by status" + "Projects by status" bar cards, "Recent public complaints" top-5 list with per-row "Track this" → `onTrackTicket(ticketNo)`. |
| `FileComplaintTab.tsx` | Tab 2 — 3/2 two-column layout. Full form (name, contact, district Select, category Select, priority Select with SLA hint, ward, title, description ≥ 20 chars) with inline validation errors + `aria-invalid`; `apiSend` POST `/api/complaints`; success panel with large mono ticket no., copy button, SLA due, "Track this complaint"; guidance card (4-step what-happens-next, corruption/identity-protection note, not-for-emergencies disclaimer). |
| `TrackComplaintsTab.tsx` | Tab 3 — ticket search card (mono input, GET `/api/complaints/[ticketNo]`, friendly 404 message), detail header (status/priority chips, meta dl, overdue SLA highlight, resolution note, satisfaction stars), vertical update timeline (tone-colored dots, chronological, `max-h-96 overflow-y-auto`), and a filterable "Recent public complaints" table (status/category Selects server-side, text search client-side; rows clickable + keyboard accessible, `max-h-96` scroll). Consumes `prefill` prop with a nonce so repeated "Track this" clicks re-trigger the lookup. |
| `ProjectsTab.tsx` | Tab 4 — filter bar (status/category/district Selects + name/code search + counts), "Completed projects" quick-filter toggle button, 2-col project card grid (code, status chip, dept/district, `ProgressBar`, budget/spent/pct, milestones count, target vs green "Completed on" date), completed-history horizontal strip (own `/api/projects?status=COMPLETED` fetch, hidden when the main filter is COMPLETED), and a detail `Dialog` per project (financial mini-table, funded-by/contractor, dates, milestone vertical timeline with DONE/IN_PROGRESS/DELAYED/PENDING chips and `amountReleasedCr`). |
| `FinancialTab.tsx` | Tab 5 — 4 financial `StatCard`s, Recharts `BarChart` (h-72, ResponsiveContainer) top-8 by sanctioned with Sanctioned (teal `#0f766e`) vs Spent (amber `#f59e0b`), donut `PieChart` + legend for spend share by category (client-side aggregation), full financial register table (`max-h-96` scroll, spent-% `ProgressBar`, sticky header), demonstration-data note, and an "independent audits should verify" card. |
| `VerificationTab.tsx` | Tab 6 — info card (what citizen verification is; masked refs), request form (name + type Select + optional masked document ref) POSTing `/api/verification-requests`, success panel with mono `requestNo` + copy + "Track via the administration office…" note, and a right-hand numbered processing pipeline (submission → officer review → decision with remarks → audit-logged) plus privacy/data-minimisation card. |

## Key UI decisions
- All fetches use the shared `useApi`/`apiSend` from `@/lib/civic/api` with relative paths; `useApi(null)`-style gating used for the project detail dialog (path is `null` when dialog closed).
- Cross-tab coordination is lifted into the portal root: `prefill = { ticket, nonce }` state; nonce guarantees a repeat "Track this" on the same ticket re-runs the lookup even after tab unmount/remount (Radix Tabs unmount inactive content).
- Tone system: chips reuse `TONE_CLASS` via `GenericChip`; bars/timeline dots use new solid-fill maps (`bg-teal-600`, `bg-emerald-500`, `bg-amber-500`, `bg-rose-500`, `bg-slate-400`) — teal/amber/emerald/rose/slate only, no indigo/blue anywhere.
- Cards follow the mandated recipe (`rounded-xl border border-slate-200 bg-white shadow-sm p-4`, hero `p-6`); long lists (timelines, tables) capped at `max-h-96 overflow-y-auto`.
- Primary CTAs explicitly `bg-teal-700 text-white hover:bg-teal-800`; CRITICAL priority chip is solid rose for salience.
- Loading → ErrorState → EmptyState in every async region (stats, lists, timelines, dialog, register); toasts on submit success/failure/copy.
- Recharts icons vs components naming clash resolved by aliasing `PieChart as RechartsPieChart`.
- Accessibility: semantic `section`/`aside`/`dl`/`ol`, `aria-label`s on all interactive regions, keyboard-activatable table rows (`tabIndex` + Enter/Space), `sr-only` dialog header, stars announced via `role="img"` + label.
- Mobile-first: filter/search rows collapse to 1 col, tabs wrap (`flex-wrap` TabsList), responsive column hiding in tables (`hidden sm:table-cell` etc.).

## Verification
- `bun run lint`: 0 errors in `src/components/civic/accountability/` (2 remaining project errors are in `src/app/page.tsx` and `src/lib/civic/api.ts` — outside my scope, per task instructions).
- `bunx tsc --noEmit`: 0 errors in the accountability folder.
- Dev server compile of `/` (which mounts this portal): `GET / → 200`, "✓ Compiled".

## Caveats / notes for next agents
- The portal assumes the shell mounts `<Toaster />` (it does — `src/app/layout.tsx` mounts sonner `Toaster` at top-center).
- `page.tsx` (owned by another agent) must render `<AccountabilityPortal />`; at time of writing it already imports and renders it.
- Text-search on the Track tab is client-side over the loaded register (status/category go to the server as query params) to avoid refetch-per-keystroke; the API `q` param remains available if server-side search is preferred later.
- Chart X axis shows project codes (top-8); project names are visible in the register table below.
- Financial figures, complaint data etc. are the demonstration dataset served by the existing API routes — no schema or API changes were made by this task.
