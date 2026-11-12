-- =====================================================
-- Migration 009: rename existing "KG" classes to "UKG"
-- =====================================================
-- The grade ladder was expanded to (Nursery → LKG → UKG → 1..12), matching
-- the public admissions/academics copy which already used LKG/UKG.
--
-- Any existing class rows with grade='KG' become UKG so the hierarchy
-- derived in lib/classes.ts keeps matching the DB. Idempotent — no-op if
-- there were no KG rows.
--
-- LKG rows are NOT created here. Classes are created on-demand by the
-- admin UI (or the promotion runner in /api/promotions/run), so we don't
-- preemptively seed them.
--
-- Safe to re-run.

update public.classes
   set grade = 'UKG'
 where grade = 'KG';
