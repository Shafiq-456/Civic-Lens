-- ==============================================================================
-- CIVIC LENZ – Staging Security Test Cases
-- Run these queries in the Supabase SQL Editor on the STAGING project ONLY.
-- Each test block identifies: role used, expected result, and pass/fail criteria.
-- ==============================================================================
-- IMPORTANT: These are READ-ONLY diagnostic queries. They do not insert, update,
-- or delete data. All SET ROLE commands are illustrative — run each section
-- after connecting with the appropriate credentials in a fresh SQL session.
-- ==============================================================================


-- ==============================================================================
-- SECTION 0 — Catalog Verification (run as postgres / service role)
-- ==============================================================================
-- 0A. List all application tables in public schema
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
-- EXPECTED: 27 tables + 1 view (anonymized_public_complaints)

-- 0B. List all RLS policies and their role targets
SELECT
    tablename,
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
-- EXPECTED: Policies match migration file; anon_read_approved_public_complaints scoped TO anon

-- 0C. Verify view options (security_invoker, security_barrier)
SELECT
    viewname,
    definition
FROM pg_views
WHERE schemaname = 'public'
  AND viewname = 'anonymized_public_complaints';
-- EXPECTED: definition includes security_invoker=true, security_barrier=true

-- 0D. Verify column-level grants for anon role
SELECT
    grantee,
    table_name,
    column_name,
    privilege_type
FROM information_schema.column_privileges
WHERE table_schema = 'public'
  AND table_name   = 'complaints'
  AND grantee      = 'anon'
ORDER BY column_name;
-- EXPECTED: 14 rows — id, ticket_number, department_id, district_id,
--           constituency_ac_no, category, title, description, status,
--           priority, citizen_feedback_rating, created_at, resolved_at
-- NOT expected: citizen_id, evidence_urls, assigned_officer_id, resolution_notes

-- 0E. Verify immutability trigger on audit_logs
SELECT trigger_name, event_object_table, action_timing, event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name   = 'trg_audit_logs_immutable';
-- EXPECTED: 2 rows — BEFORE UPDATE, BEFORE DELETE


-- ==============================================================================
-- SECTION 1 — Anonymous User Tests
-- Connect via anon key (PostgREST unauthenticated request OR SET ROLE anon)
-- ==============================================================================

-- TEST 1-A: Anonymous direct SELECT on base complaints table — MUST FAIL
-- Expected: permission denied for table complaints
-- (REVOKE ALL FROM anon + no table-level GRANT)
SELECT id FROM public.complaints LIMIT 1;
-- PASS if: ERROR 42501 permission denied for table complaints
-- FAIL if: returns any rows

-- TEST 1-B: Anonymous SELECT on PII column directly — MUST FAIL
-- Expected: permission denied for column citizen_id
SELECT citizen_id FROM public.complaints LIMIT 1;
-- PASS if: ERROR 42501 permission denied for column citizen_id
-- FAIL if: returns any value (even NULL)

-- TEST 1-C: Anonymous SELECT on safe column directly — allowed but RLS applies
-- Expected: returns only non-CORRUPTION/BRIBERY, Acknowledged/In-progress/Resolved rows
SELECT id, category, status FROM public.complaints
WHERE status = 'Submitted';          -- caller filter that RLS overrides
-- PASS if: 0 rows (RLS denies Submitted rows regardless of caller WHERE)
-- FAIL if: any Submitted rows returned

-- TEST 1-D: Anonymous query through the view — ALLOWED (safe columns, safe rows)
SELECT * FROM public.anonymized_public_complaints LIMIT 20;
-- PASS if: returns 0–N rows, all with status IN ('Acknowledged','In progress','Resolved'),
--          no citizen_id column, no CORRUPTION/BRIBERY category
-- FAIL if: citizen_id, evidence_urls, resolution_notes, assigned_officer_id present in result

-- TEST 1-E: Anonymous attempts to find CORRUPTION complaint through view
SELECT * FROM public.anonymized_public_complaints
WHERE category = 'CORRUPTION';
-- PASS if: 0 rows
-- FAIL if: any CORRUPTION complaint returned

-- TEST 1-F: Anonymous attempts to query complaint_updates directly — MUST FAIL
SELECT * FROM public.complaint_updates LIMIT 1;
-- PASS if: ERROR 42501 permission denied for table complaint_updates
-- FAIL if: returns any rows

-- TEST 1-G: Anonymous queries public reference tables — ALLOWED
SELECT COUNT(*) FROM public.states;
SELECT COUNT(*) FROM public.districts;
SELECT COUNT(*) FROM public.departments;
SELECT COUNT(*) FROM public.projects;
SELECT COUNT(*) FROM public.schemes;
-- PASS if: returns counts matching the migrated data
-- FAIL if: permission denied or 0 rows when data exists


-- ==============================================================================
-- SECTION 2 — Authenticated Citizen Tests
-- Connect via citizen JWT (authenticated role, role='citizen' in user_profiles)
-- citizen_id = <citizen-A-uuid>, citizen_b_id = <different-uuid>
-- ==============================================================================

-- TEST 2-A: Citizen reads OWN complaints — ALLOWED
SELECT id, ticket_number, status FROM public.complaints
WHERE citizen_id = auth.uid();
-- PASS if: returns citizen's own complaints
-- FAIL if: permission denied or 0 rows when complaints exist

-- TEST 2-B: Citizen reads ANOTHER citizen's complaints — MUST FAIL (0 rows)
-- (Try a known ticket number belonging to another citizen)
SELECT id, ticket_number FROM public.complaints
WHERE ticket_number = 'CL-2024-000001'  -- known to belong to another citizen
  AND citizen_id != auth.uid();
-- PASS if: 0 rows (RLS hides other citizens' complaints)
-- FAIL if: returns any row

-- TEST 2-C: Citizen queries own complaint_updates — ALLOWED
SELECT * FROM public.complaint_updates cu
JOIN public.complaints c ON c.id = cu.complaint_id
WHERE c.citizen_id = auth.uid();
-- PASS if: returns timeline events for own complaints
-- FAIL if: permission denied

-- TEST 2-D: Citizen attempts to INSERT CITIZEN_COMMENT — ALLOWED
-- (This is a schema check, not actual execution)
-- ALLOWED: update_type='CITIZEN_COMMENT', from_status=NULL, to_status=NULL, complaint owned by citizen
-- INSERT INTO public.complaint_updates (complaint_id, updated_by_user_id, updated_by_role, update_type, note, from_status, to_status)
-- VALUES ('<citizen-complaint-id>', auth.uid(), 'Citizen', 'CITIZEN_COMMENT', 'Site visit evidence added', NULL, NULL);
-- PASS if: insert succeeds

-- TEST 2-E: Citizen attempts to INSERT OFFICIAL_STATUS_CHANGE — MUST FAIL
-- INSERT INTO public.complaint_updates (complaint_id, updated_by_user_id, updated_by_role, update_type, note, from_status, to_status)
-- VALUES ('<complaint-id>', auth.uid(), 'Citizen', 'OFFICIAL_STATUS_CHANGE', 'Marked resolved by me', 'Submitted', 'Resolved');
-- PASS if: ERROR 42501 / RLS check violation — no policy permits citizen to insert OFFICIAL_STATUS_CHANGE
-- FAIL if: insert succeeds

-- TEST 2-F: Citizen queries audit_logs — MUST FAIL (0 rows)
SELECT * FROM public.audit_logs LIMIT 1;
-- PASS if: 0 rows (RLS: only auditor and admin can SELECT audit_logs)
-- FAIL if: any audit log returned to a citizen


-- ==============================================================================
-- SECTION 3 — Department Officer Tests (non-vigilance)
-- officer_dept_id = 'dept-highways', role='officer', is_vigilance_officer=false
-- ==============================================================================

-- TEST 3-A: Officer reads complaints in OWN department — ALLOWED
SELECT id, category, status FROM public.complaints
WHERE department_id = (
    SELECT department_id FROM public.user_profiles WHERE id = auth.uid()
);
-- PASS if: returns non-CORRUPTION/BRIBERY complaints in officer's department

-- TEST 3-B: Officer reads complaints in ANOTHER department — MUST FAIL (0 rows)
-- Attempt to SELECT a complaint known to belong to dept-water while officer is in dept-highways
SELECT id FROM public.complaints
WHERE department_id = 'dept-water';        -- explicitly different department
-- PASS if: 0 rows (RLS denies cross-dept access)
-- FAIL if: any row from another department returned

-- TEST 3-C: Officer reads CORRUPTION complaint — MUST FAIL (0 rows)
SELECT id FROM public.complaints WHERE category = 'CORRUPTION';
-- PASS if: 0 rows (officer does not have is_vigilance_officer = true)
-- FAIL if: any CORRUPTION complaint returned

-- TEST 3-D: Officer reads a complaint via assigned_officer_id outside their dept — MUST FAIL
-- (Complaint belongs to dept-water, officer is in dept-highways, officer is assigned on it)
SELECT id FROM public.complaints
WHERE assigned_officer_id = auth.uid()
  AND department_id != (SELECT department_id FROM public.user_profiles WHERE id = auth.uid());
-- PASS if: 0 rows (assignment does not override department check in RLS)
-- FAIL if: any cross-department complaint returned via assignment

-- TEST 3-E: Officer posts OFFICIAL_STATUS_CHANGE on own dept complaint — ALLOWED
-- (Schema check only; actual INSERT commented out)
-- INSERT INTO public.complaint_updates (complaint_id, updated_by_user_id, updated_by_role, update_type, note, from_status, to_status)
-- VALUES ('<dept-complaint-id>', auth.uid(), 'Department Officer', 'OFFICIAL_STATUS_CHANGE', 'Inspection complete', 'Acknowledged', 'In progress');
-- PASS if: insert succeeds for dept's own complaints

-- TEST 3-F: Officer posts OFFICIAL_STATUS_CHANGE on another dept's complaint — MUST FAIL
-- INSERT INTO public.complaint_updates (complaint_id, ..., update_type, ...)
-- VALUES ('<other-dept-complaint-id>', auth.uid(), ..., 'OFFICIAL_STATUS_CHANGE', ...);
-- PASS if: ERROR — RLS policy "Staff insert official status" denies cross-dept update
-- FAIL if: insert succeeds


-- ==============================================================================
-- SECTION 4 — Vigilance Officer Tests
-- role='officer', is_vigilance_officer=true, department_id='dept-dvac'
-- ==============================================================================

-- TEST 4-A: Vigilance officer reads CORRUPTION complaints from ANY department — ALLOWED
SELECT id, department_id, category FROM public.complaints
WHERE category IN ('CORRUPTION', 'BRIBERY');
-- PASS if: returns corruption/bribery complaints across all departments
-- FAIL if: 0 rows or permission denied

-- TEST 4-B: Vigilance officer reads CORRUPTION complaint from OTHER department — ALLOWED (read only)
SELECT id FROM public.complaints
WHERE category = 'CORRUPTION'
  AND department_id != 'dept-dvac';
-- PASS if: returns rows (cross-dept READ is authorized for vigilance officers)
-- FAIL if: 0 rows

-- TEST 4-C: Vigilance officer UPDATES a CORRUPTION complaint in OWN department — ALLOWED
-- (dept-dvac owns a complaint)
-- UPDATE public.complaints SET status='Under Investigation' WHERE id='<dvac-corruption-complaint-id>';
-- PASS if: update succeeds

-- TEST 4-D: Vigilance officer UPDATES a CORRUPTION complaint in ANOTHER department — MUST FAIL
-- UPDATE public.complaints SET status='Under Investigation' WHERE id='<other-dept-corruption-complaint-id>';
-- PASS if: ERROR / 0 rows updated (UPDATE policy requires department_id match)
-- FAIL if: update succeeds on another department's complaint

-- TEST 4-E: Vigilance officer reads non-corruption complaints in own dept — ALLOWED
SELECT id FROM public.complaints
WHERE department_id = 'dept-dvac'
  AND category NOT IN ('CORRUPTION', 'BRIBERY');
-- PASS if: returns those complaints


-- ==============================================================================
-- SECTION 5 — Auditor Tests
-- role='auditor'
-- ==============================================================================

-- TEST 5-A: Auditor reads complaints — ALLOWED (auditor has broad read)
SELECT COUNT(*) FROM public.complaints;
-- PASS if: returns all complaint count (RLS policy includes role='auditor')

-- TEST 5-B: Auditor reads audit logs — ALLOWED
SELECT * FROM public.audit_logs LIMIT 10;
-- PASS if: returns audit log records (policy includes role='auditor')

-- TEST 5-C: Auditor attempts to INSERT into audit_logs directly — policy gap check
-- INSERT INTO public.audit_logs (action, entity_type, entity_id) VALUES ('TEST','COMPLAINT','test-id');
-- PASS if: insert succeeds OR is blocked depending on policy intent (document result)
-- NOTE: There is currently no INSERT restriction on audit_logs for auditors —
-- if you want auditors to be read-only on audit_logs, add a WITH CHECK (false) INSERT policy.


-- ==============================================================================
-- SECTION 6 — Administrator Tests
-- role='admin'
-- ==============================================================================

-- TEST 6-A: Admin reads ALL complaints including CORRUPTION — ALLOWED
SELECT COUNT(*) FROM public.complaints;
SELECT COUNT(*) FROM public.complaints WHERE category = 'CORRUPTION';
-- PASS if: both return expected counts, including sensitive categories

-- TEST 6-B: Admin reads audit logs — ALLOWED
SELECT * FROM public.audit_logs LIMIT 10;
-- PASS if: returns records

-- TEST 6-C: Admin attempts to DELETE an audit log — MUST FAIL
-- DELETE FROM public.audit_logs WHERE id = '<any-id>';
-- PASS if: ERROR — trigger trg_audit_logs_immutable raises exception
-- FAIL if: delete succeeds (audit logs must be immutable)

-- TEST 6-D: Admin attempts to UPDATE an audit log — MUST FAIL
-- UPDATE public.audit_logs SET action = 'TAMPERED' WHERE id = '<any-id>';
-- PASS if: ERROR — trigger trg_audit_logs_immutable raises exception
-- FAIL if: update succeeds


-- ==============================================================================
-- SECTION 7 — Production Database Catalog Verification Queries
-- Run as postgres (service role) on PRODUCTION before migration.
-- These are READ-ONLY. Do NOT execute without user approval.
-- ==============================================================================

-- 7A. List ALL existing application tables in public schema (before migration)
SELECT table_name, table_type, table_schema
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
-- EXPECTED (pre-migration): 0 rows (no application tables yet)
-- If ANY rows appear: inventory them before proceeding

-- 7B. List ALL existing views in public schema
SELECT viewname, schemaname
FROM pg_views
WHERE schemaname = 'public';
-- EXPECTED (pre-migration): 0 rows

-- 7C. List ALL existing functions in public schema
SELECT routine_name, routine_type, security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;
-- EXPECTED (pre-migration): 0 rows

-- 7D. List ALL existing triggers in public schema
SELECT trigger_name, event_object_table, action_timing, event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY trigger_name;
-- EXPECTED (pre-migration): 0 rows

-- 7E. List ALL existing RLS policies in public schema
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
-- EXPECTED (pre-migration): 0 rows

