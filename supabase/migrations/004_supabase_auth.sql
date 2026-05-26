-- =====================================================
-- Migration: swap Clerk auth for native Supabase Auth
-- =====================================================
-- Adds an `auth_user_id` column on public.users that links to auth.users.
-- Rewrites the small set of helper functions that RLS depends on so the
-- entire existing policy graph keeps working unchanged — only the lookup
-- key changes (clerk_id → auth.uid()).
--
-- Safe to re-run.

-- ---------------------------------------------------------------
-- 1. Schema change on public.users
-- ---------------------------------------------------------------

alter table public.users
  add column if not exists auth_user_id uuid unique references auth.users(id) on delete cascade;

create index if not exists idx_users_auth_user_id on public.users(auth_user_id);

-- Old Clerk linkage is no longer required. Keep the column so existing
-- code paths don't break mid-migration, but allow NULL.
alter table public.users alter column clerk_id drop not null;

-- ---------------------------------------------------------------
-- 2. Replace the auth-identity helper functions
-- ---------------------------------------------------------------
-- current_clerk_id() is kept (returns null now) only so any leftover
-- references compile. RLS reads through current_user_id() which is
-- redefined to use auth.uid().

create or replace function public.current_clerk_id()
returns text
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select null::text
$$;

create or replace function public.current_user_id()
returns uuid
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select id from public.users
  where auth_user_id = auth.uid()
  limit 1
$$;

-- current_user_role(), is_admin(), is_teacher(), is_parent(),
-- current_parent_id(), current_teacher_id(), parent_owns_student(),
-- teacher_teaches_class(), teacher_teaches_subject() all build on
-- current_user_id() and need no changes.

-- ---------------------------------------------------------------
-- 3. Update the self-read RLS policy on users
-- ---------------------------------------------------------------
-- The original policy was `clerk_id = current_clerk_id()`; switch it
-- to the auth.uid() check so a freshly signed-in user can read their
-- own row before any other lookups run.

drop policy if exists users_read_self on public.users;
create policy users_read_self on public.users
  for select using (
    auth_user_id = auth.uid() or public.is_admin()
  );

-- ---------------------------------------------------------------
-- 4. Convenience: allow service_role to upsert into users on bootstrap
-- ---------------------------------------------------------------
-- (service_role bypasses RLS already; this comment is a reminder that
-- first-login provisioning happens through the admin client in
-- lib/auth.ts, which uses the service_role key.)
