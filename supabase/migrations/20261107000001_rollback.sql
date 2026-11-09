-- ==============================================================================
-- CIVIC LENZ – Safe Rollback Script  v2  (Phase 2E)
-- Target: Supabase PostgreSQL (jxeekzpbmnpxpiakbdiz)
-- Reverts ONLY the public-schema objects created in migration 20261107000000.
--
-- Safety guarantees:
--   1. Every DROP uses IF NOT EXISTS – silent if object absent.
--   2. No CASCADE – if an unexpected external dependency exists the DROP fails
--      with an error message rather than silently deleting unrelated objects.
--   3. A guard block runs FIRST and aborts the entire script if any foreign-key
--      from an EXTERNAL table (not in our migration) references our tables.
--   4. auth.*, storage.*, realtime.*, vault.* schemas are NEVER touched.
--   5. Tables are dropped in strict reverse FK-dependency order so that every
--      DROP succeeds without CASCADE.
-- ==============================================================================

-- ── Dependency Guard ──────────────────────────────────────────────────────────
-- Abort the rollback if any table OUTSIDE our migration references our tables.
-- This prevents accidental destruction of objects we did not create.
DO $$
DECLARE
    _our_tables TEXT[] := ARRAY[
        'states','districts','departments','user_profiles',
        'constituencies_ac','constituencies_pc','localities_wards',
        'manifesto_promises','projects','project_milestones',
        'citizen_verifications','verification_evidence',
        'political_regimes','project_regime_history',
        'complaints','complaint_updates','quality_audits',
        'schemes','scheme_applications','grievance_escalations',
        'department_budgets','expenditure_vouchers',
        'political_records','news_articles','announcements',
        'data_sources','audit_logs'
    ];
    _unexpected_count INT;
    _unexpected_list  TEXT;
BEGIN
    SELECT
        COUNT(*),
        STRING_AGG(tc.table_name || '.' || kcu.column_name || ' → ' || ccu.table_name, ', ')
    INTO _unexpected_count, _unexpected_list
    FROM information_schema.table_constraints  tc
    JOIN information_schema.key_column_usage   kcu
        ON kcu.constraint_name = tc.constraint_name
        AND kcu.table_schema   = tc.table_schema
    JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema    = 'public'
      -- The referencing table must NOT be one of ours
      AND tc.table_name      != ALL(_our_tables)
      -- The referenced table (target of the FK) MUST be one of ours
      AND ccu.table_name      = ANY(_our_tables)
      AND ccu.table_schema   = 'public';

    IF _unexpected_count > 0 THEN
        RAISE EXCEPTION
            E'Rollback aborted.\n'
            '% unexpected foreign-key constraint(s) from tables outside this migration '
            'reference CIVIC LENZ tables:\n  %\n'
            'Remove or migrate those constraints before running this rollback.',
            _unexpected_count, _unexpected_list;
    END IF;
END $$;

-- ── Revoke column-level grants added in Phase 2E ──────────────────────────────
-- (Harmless if already revoked or if the table was never created.)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'complaints'
    ) THEN
        REVOKE SELECT (
            id, ticket_number, department_id, district_id, constituency_ac_no,
            category, title, description, status, priority, citizen_feedback_rating,
            created_at, resolved_at
        ) ON public.complaints FROM anon;
    END IF;
END $$;

-- ── Drop views ────────────────────────────────────────────────────────────────
DROP VIEW IF EXISTS public.anonymized_public_complaints;

-- ── Drop triggers & functions ─────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_audit_logs_immutable ON public.audit_logs;
DROP FUNCTION IF EXISTS public.prevent_audit_log_mutation();

-- ── Drop tables in strict reverse FK-dependency order ─────────────────────────
-- No CASCADE is used. Each table must be free of dependents before its DROP.
-- If a DROP fails, it means an unexpected dependency exists; fix it and retry.

-- Leaf tables (nothing else references them)
DROP TABLE IF EXISTS public.audit_logs;
DROP TABLE IF EXISTS public.data_sources;
DROP TABLE IF EXISTS public.announcements;
DROP TABLE IF EXISTS public.news_articles;
DROP TABLE IF EXISTS public.political_records;
DROP TABLE IF EXISTS public.expenditure_vouchers;
DROP TABLE IF EXISTS public.department_budgets;

-- Grievance / scheme layer (FK → complaints, schemes, auth.users)
DROP TABLE IF EXISTS public.grievance_escalations;
DROP TABLE IF EXISTS public.quality_audits;
DROP TABLE IF EXISTS public.complaint_updates;

-- Complaints base (now safe: all referencing tables dropped above)
DROP TABLE IF EXISTS public.complaints;

-- Scheme layer
DROP TABLE IF EXISTS public.scheme_applications;
DROP TABLE IF EXISTS public.schemes;

-- Historical tracking layer
DROP TABLE IF EXISTS public.project_regime_history;
DROP TABLE IF EXISTS public.political_regimes;

-- Citizen verification layer
DROP TABLE IF EXISTS public.verification_evidence;
DROP TABLE IF EXISTS public.citizen_verifications;

-- Project layer (now safe: milestones, verifications, histories all dropped)
DROP TABLE IF EXISTS public.project_milestones;
DROP TABLE IF EXISTS public.projects;
DROP TABLE IF EXISTS public.manifesto_promises;

-- Locality / constituency layer
DROP TABLE IF EXISTS public.localities_wards;
DROP TABLE IF EXISTS public.constituencies_pc;
DROP TABLE IF EXISTS public.constituencies_ac;

-- Shared / root tables (now safe: all dependent tables dropped above)
DROP TABLE IF EXISTS public.user_profiles;
DROP TABLE IF EXISTS public.departments;
DROP TABLE IF EXISTS public.districts;
DROP TABLE IF EXISTS public.states;
