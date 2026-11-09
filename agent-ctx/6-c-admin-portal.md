# Task 6-c — Government Administration Portal UI

## Status: COMPLETE

All files in `src/components/civic/admin/` only. No files outside the folder were touched. `bunx eslint src/components/civic/admin/` → 0 problems; `tsc --noEmit` → 0 errors in admin folder. Remaining project lint/tsc errors are in other agents' in-progress files (`src/app/page.tsx`, `src/lib/civic/api.ts`, `src/components/civic/accountability/VerificationTab` missing) — out of scope.

## Files created (9)
| File | Purpose |
|---|---|
| `admin-shared.tsx` | `AdminTab` type, `ROLE_TONE`, `roleLabel()`, `GuardedButton` (auto-disabled + lock icon + "Read-only session" tooltip, wrapped in span so Radix tooltip still fires on disabled buttons) |
| `AdminLogin.tsx` | Centered max-w-md card: brand header, role explainer, username/password, loading submit, inline 401 error, 3 demo quick-fill buttons (admin/Officer/Auditor), amber NextAuth notice. POST `/api/demo-auth`, toast welcome, calls `onLogin(user)` |
| `AdminPortal.tsx` | `export default`. Session via `useState` + localStorage `civic-lenz-user`, restored in `useEffect` inside `setTimeout` callback (satisfies `react-hooks/set-state-in-effect`; validates stored shape). Header: brand + "Signed in as name (role)" chip + department + Sign out. Controlled shadcn Tabs (6 tabs), `canEdit = role !== 'AUDITOR'`, auditor read-only banner, DEPT_OFFICER lands on `complaints` |
| `DashboardTab.tsx` | 6 StatCards from `/api/stats` (verificationQueue, verifiedPct, pendingCitizenRequests, complaintsOpen, auditCount, onHold), quick-action cards that `onNavigate(tab)`, department budgets table in `max-h-96 overflow-y-auto`, retry on error |
| `ComplaintsTab.tsx` | Left: status/category Selects + 300ms-debounced search + queue table (mono ticketNo, status/priority chips, district, age), row click/Enter selects (`aria-selected`, keyboard accessible). Right: detail facts grid, SLA overdue flag, resolution note, updates timeline; action bar (6 actions, note required for RESOLVE/REJECT with amber hint, assignedTo, department Select from `/api/departments`) → PATCH, toast + `detail.refresh()` + `list.refresh()` |
| `RecordsVerificationTab.tsx` | Continuous-verification DataBanner + stale/never counters; status Select, freshness quick-toggle buttons (All/FRESH/STALE/NEVER_VERIFIED, client-side filter), office Select, debounced search. Table with Verify / Set status / Source / History per row. `RecordActionDialog`: VERIFY prefills sourceUrl from `officialSource`; STATUS shows transition old→new; SOURCE requires URL. `VerificationHistoryDialog`: GET `/api/records/[id]`, sorted desc timeline (action chip, prev→new status, verifiedBy, source link, note, timestamp), "append-only audit-grade" note |
| `CitizenRequestsTab.tsx` | Table (requestNo mono, masked doc, status chip amber/green/slate, dates, remarks truncated w/ title), Approve/Reject only on PENDING rows via GuardedButtons → remarks dialog → PATCH `/api/verification-requests` with actor, privacy DataBanner |
| `MonitoringTab.tsx` | Fetches all `/api/records` once; `useMemo` aggregates: 6 StatCards (incl. coverage % = records with lastVerifiedAt), party + office distribution CSS bar cards, district representation table with share bars, verification watchlist (NEVER_VERIFIED first, then STALE by oldest) |
| `AuditTrailTab.tsx` | actorRole Select (6 roles) → server param; entity/action/id client-side filter; table (time, actor+role chip, mono action, entity+id, truncated summary/details with title tooltips incl. IP); amber audit-policy note (hash chaining / retention) |

## Key UI decisions
- Denser back-office look, same tokens: white `rounded-xl border-slate-200 shadow-sm p-4` cards, teal-700 primary, amber accents, rose only for errors/overdue/high-priority. No indigo/blue.
- All mutations: toast success/failure, `refresh()` after PATCH; every fetch surface has Loading → ErrorState(+Retry) → EmptyState.
- Strict TS, no `any`; verification logs use only `VerificationLog` fields (`sourceName` intentionally not rendered — not in the type).
- Mobile-first: tables in overflow containers, tab labels collapse to short words on small screens.

## Caveats for integrators
- `AdminPortal` is `default export`, no props — mount anywhere (page.tsx shell owns header/footer).
- Expects API routes per the shared contract (POST `/api/demo-auth`, `/api/records` PATCH actions VERIFY/STATUS/SOURCE, `/api/complaints/[ticketNo]` PATCH actions, `/api/verification-requests` PATCH, `/api/audit-logs`, `/api/stats`, `/api/departments`).
- Freshness filtering (Tab 3 quick filter) is client-side since the records API has no freshness query param.
- `sonner` Toaster already mounted in `layout.tsx`.
