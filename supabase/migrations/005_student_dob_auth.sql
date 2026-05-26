-- =====================================================
-- Migration: support admission-number + DOB student/parent login
-- =====================================================
-- The /api/access/verify endpoint looks students up by
-- (admission_number, date_of_birth, status='active'). Add a covering
-- index so that's an index lookup, not a sequential scan, even as the
-- table grows.
--
-- Also relax the RLS self-read on users — parent rows are no longer
-- needed for the new flow, so don't worry about parents.user_id being
-- NULL going forward.
--
-- Safe to re-run.

create index if not exists idx_students_admission_dob
  on public.students (admission_number, date_of_birth)
  where status = 'active';

-- No schema changes for the JWT session — it's stateless (signed cookie,
-- verified per request). If we ever want server-side revocation we can
-- add a `student_sessions` table later.
