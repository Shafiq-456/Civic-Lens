# CIVIC LENZ — Staging Setup Guide

## Why Staging?

The migration creates tables, views, RLS policies, and triggers that cannot be tested without a live PostgreSQL connection. The Supabase SQL Editor in a **staging project** lets you:

1. Apply the schema without touching production.
2. Run the security test cases in `supabase/tests/security-test-cases.sql`.
3. Confirm all 27 tables are created correctly.
4. Confirm the view, trigger, and policies behave as designed.
5. Collect live test evidence before authorising the production migration.

---

## Step 1 — Create the Staging Supabase Project

1. Go to: https://supabase.com/dashboard/new/project
2. Organisation: your existing org
3. Project name: `civic-lenz-staging`
4. Database password: generate a strong one and save it
5. Region: same as production (e.g., `ap-south-1`)
6. Plan: Free tier is sufficient for schema testing
7. Click **Create new project** and wait for it to provision (~2 minutes)

---

## Step 2 — Collect Staging Credentials

After provisioning, go to:  
**Project Settings → API**

Copy:
- **Project URL** — `https://<staging-id>.supabase.co`
- **Publishable (anon) key** — starts with `sb_publishable_`
- **Service role (secret) key** — starts with `sb_secret_`

Do NOT use production credentials for staging.

---

## Step 3 — Create a Staging Environment File

In the project root, create `.env.staging` (do not commit to git):

```
NEXT_PUBLIC_SUPABASE_URL=https://<staging-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_<staging-anon-key>
SUPABASE_SERVICE_ROLE_KEY=sb_secret_<staging-service-key>
```

Add `.env.staging` to `.gitignore` if not already ignored.

---

## Step 4 — Apply the Migration to Staging

1. Open the **Supabase SQL Editor** for the staging project:  
   `https://supabase.com/dashboard/project/<staging-id>/sql`

2. Click **New query**

3. Open the migration file:  
   `supabase/migrations/20261107000000_civic_lenz_core_schema.sql`

4. Copy the entire contents (735+ lines) and paste into the SQL Editor

5. Click **Run**

6. Expected result: `Success. No rows returned.`

7. If any error appears, note the exact error message and line number. Do not proceed to production.

---

## Step 5 — Verify the Schema Applied

In the SQL Editor, run each query from **Section 0** of `supabase/tests/security-test-cases.sql`:

```sql
-- Confirm 27 tables + 1 view
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected: 27 tables + 1 view row for `anonymized_public_complaints`.

```sql
-- Confirm column-level grants for anon (14 safe columns only)
SELECT grantee, table_name, column_name, privilege_type
FROM information_schema.column_privileges
WHERE table_schema = 'public'
  AND table_name   = 'complaints'
  AND grantee      = 'anon'
ORDER BY column_name;
```

Expected: 14 rows. `citizen_id`, `evidence_urls`, `assigned_officer_id`, `resolution_notes` must NOT appear.

```sql
-- Confirm security_invoker and security_barrier on view
SELECT viewname, definition
FROM pg_views
WHERE schemaname = 'public' AND viewname = 'anonymized_public_complaints';
```

Expected: definition includes `security_invoker=true` and `security_barrier=true`.

---

## Step 6 — Create Test Users in Staging Auth

Go to: **Authentication → Users → Add user**

Create the following test users (use dummy emails):

| Email | Password | Purpose |
|---|---|---|
| `citizen-a@test.local` | `Test1234!` | Regular citizen (complainant) |
| `citizen-b@test.local` | `Test1234!` | Different citizen (non-complainant) |
| `officer-highways@test.local` | `Test1234!` | Officer in Highways dept |
| `officer-water@test.local` | `Test1234!` | Officer in Water Board dept |
| `officer-dvac@test.local` | `Test1234!` | Vigilance officer (is_vigilance_officer = true) |
| `auditor@test.local` | `Test1234!` | Certified auditor |
| `admin@test.local` | `Test1234!` | System administrator |

After creating users, note their UUIDs from the Users list.

---

## Step 7 — Seed Test User Profiles

In the SQL Editor, run (replace UUIDs with actual values from Step 6):

```sql
-- Insert user profiles for test users
INSERT INTO public.user_profiles (id, email, full_name, role, department_id, is_vigilance_officer) VALUES
  ('<citizen-a-uuid>',  'citizen-a@test.local',       'Citizen A',          'citizen', NULL,            FALSE),
  ('<citizen-b-uuid>',  'citizen-b@test.local',       'Citizen B',          'citizen', NULL,            FALSE),
  ('<off-hw-uuid>',     'officer-highways@test.local', 'Officer Highways',  'officer', 'dept-highways', FALSE),
  ('<off-wb-uuid>',     'officer-water@test.local',    'Officer Water',     'officer', 'dept-water',    FALSE),
  ('<off-dvac-uuid>',   'officer-dvac@test.local',     'Officer DVAC',      'officer', 'dept-dvac',     TRUE),
  ('<auditor-uuid>',    'auditor@test.local',           'Auditor One',       'auditor', NULL,            FALSE),
  ('<admin-uuid>',      'admin@test.local',             'Admin One',         'admin',   NULL,            FALSE);
```

---

## Step 8 — Seed Test Complaints

```sql
-- A highways complaint from Citizen A (non-sensitive, acknowledged)
INSERT INTO public.complaints
  (id, ticket_number, citizen_id, department_id, category, title, description, status, priority)
VALUES
  ('complaint-hw-1', 'CL-2024-000001', '<citizen-a-uuid>', 'dept-highways', 'Roads',
   'Pothole on NH-44', 'Large pothole near bus stop', 'Acknowledged', 'High'),

-- A submitted complaint (should NOT appear in public view)
  ('complaint-hw-2', 'CL-2024-000002', '<citizen-a-uuid>', 'dept-highways', 'Roads',
   'Broken railing', 'Bridge railing missing', 'Submitted', 'Medium'),

-- A corruption complaint (must NEVER appear in public view)
  ('complaint-cor-1', 'CL-2024-000003', '<citizen-b-uuid>', 'dept-highways', 'CORRUPTION',
   'Bribe demanded', 'Officer demanded Rs 500 for signature', 'Submitted', 'High'),

-- A water board complaint from Citizen B
  ('complaint-wb-1', 'CL-2024-000004', '<citizen-b-uuid>', 'dept-water', 'Water',
   'No water supply', 'Street has no water for 3 days', 'In progress', 'High');
```

---

## Step 9 — Run Security Test Cases

Using the Supabase SQL Editor (authenticated as `postgres` via service role), run each section of `supabase/tests/security-test-cases.sql`.

For tests requiring a specific user role, use:
- **Supabase Client with anon key** to test anonymous access
- **Supabase Client with user JWT** (obtained via `signInWithPassword`) to test citizen/officer/admin

Document each test result as PASS or FAIL in the evidence table below.

---

## Step 10 — Evidence Table (fill in after testing)

| Test | Description | Expected | Actual | PASS/FAIL |
|------|-------------|----------|--------|-----------|
| 1-A | Anon SELECT base complaints | ERROR 42501 | | |
| 1-B | Anon SELECT citizen_id | ERROR 42501 | | |
| 1-C | Anon SELECT Submitted via direct query | 0 rows | | |
| 1-D | Anon query through view | Safe rows only | | |
| 1-E | Anon query CORRUPTION through view | 0 rows | | |
| 1-F | Anon SELECT complaint_updates | ERROR 42501 | | |
| 1-G | Anon SELECT public reference tables | Returns data | | |
| 2-A | Citizen reads own complaints | Returns own | | |
| 2-B | Citizen reads other citizen's complaints | 0 rows | | |
| 2-C | Citizen reads own complaint_updates | Returns timeline | | |
| 2-D | Citizen inserts CITIZEN_COMMENT | Succeeds | | |
| 2-E | Citizen inserts OFFICIAL_STATUS_CHANGE | Denied | | |
| 2-F | Citizen reads audit_logs | 0 rows | | |
| 3-A | Officer reads own dept complaints | Returns dept data | | |
| 3-B | Officer reads other dept complaints | 0 rows | | |
| 3-C | Officer reads CORRUPTION complaint | 0 rows | | |
| 3-D | Officer reads cross-dept via assignment | 0 rows | | |
| 3-E | Officer posts OFFICIAL_STATUS_CHANGE (own dept) | Succeeds | | |
| 3-F | Officer posts OFFICIAL_STATUS_CHANGE (other dept) | Denied | | |
| 4-A | Vigilance reads CORRUPTION cross-dept | Returns all | | |
| 4-B | Vigilance reads CORRUPTION from other dept | Returns rows | | |
| 4-C | Vigilance updates own-dept CORRUPTION | Succeeds | | |
| 4-D | Vigilance updates other-dept CORRUPTION | Denied | | |
| 5-A | Auditor reads all complaints | Returns all | | |
| 5-B | Auditor reads audit_logs | Returns records | | |
| 6-A | Admin reads CORRUPTION complaints | Returns all | | |
| 6-B | Admin reads audit_logs | Returns records | | |
| 6-C | Admin deletes audit log | Trigger exception | | |
| 6-D | Admin updates audit log | Trigger exception | | |

**All tests must PASS before authorising the production migration.**

---

## Notes

- The staging database can be reset at any time by running the rollback script then the migration again.
- Do not use real citizen data in staging.
- The staging project can be deleted after production migration is authorised and completed.

