-- =====================================================
-- Migration 007: alumni self-service request + approval flow
-- =====================================================
-- Replaces the Google-OAuth bootstrap. Alumni now submit a request from
-- /alumni-portal/request (with the password they'll use to log in), the
-- admin approves from /admin/alumni, and only then does the Supabase
-- auth user get mapped to role=alumni in public.users.
--
-- Safe to re-run.

-- 1. Status enum
do $$ begin
  create type alumni_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

-- 2. Columns on alumni
alter table public.alumni
  add column if not exists status alumni_status not null default 'pending',
  add column if not exists requested_at timestamptz,
  add column if not exists approved_at  timestamptz,
  add column if not exists rejected_at  timestamptz,
  add column if not exists rejection_reason text;

-- 3. Backfill: rows that already existed before this migration were
--    created by an admin (or the legacy OAuth flow) and are pre-trusted.
update public.alumni
   set status = 'approved',
       approved_at = coalesce(approved_at, created_at)
 where status = 'pending'
   and created_at < now();

-- 4. Unique index on lower(email) — email is the login key for alumni
--    Supabase auth, so we can't allow two pending rows with the same email
--    racing through approval. Null emails are allowed (legacy rows that
--    were created without one); the partial WHERE skips them.
create unique index if not exists uq_alumni_email_lower
  on public.alumni (lower(email))
  where email is not null;

-- 5. Index on status to make the admin "Pending" filter cheap
create index if not exists idx_alumni_status on public.alumni(status);
