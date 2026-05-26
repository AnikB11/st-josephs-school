-- =====================================================
-- Migration 003 — RLS Hardening
-- =====================================================
-- Purpose: production-grade Row Level Security across every table.
-- Replaces the permissive starter policies from 001 and adds full
-- coverage for the new teacher/assignment tables from 002.
--
-- This migration is idempotent: it drops every policy it creates before
-- re-creating it, so re-running on an existing database is safe.
--
-- Architecture notes
-- ------------------
-- * Auth provider is Clerk; the user's Clerk ID arrives as JWT `sub`.
--   We map it to `public.users.id` (and from there to teacher/parent rows).
-- * Server API routes use the SERVICE ROLE client, which bypasses RLS
--   entirely. Role checks in those routes (`requireRole`, `getTeacherContext`)
--   are the primary access boundary. RLS is defense-in-depth for any code
--   path that uses the ANON key — currently the SSR notice pages.
-- * Helper functions are `SECURITY DEFINER` so policy evaluation does NOT
--   recursively trigger RLS on the auth lookups. `set search_path = public,
--   pg_temp` guards against search_path attacks.
--
-- Audit findings addressed by this migration
-- ------------------------------------------
--   [F1] `users.role` was self-mutable in absence of an UPDATE policy
--        once one was added → now: only admin can UPDATE the table at all,
--        plus a BEFORE UPDATE trigger blocks role changes by non-admins.
--   [F2] `parents`, `teachers`, `teacher_assignments`, `audit_logs`
--        had RLS enabled but ZERO policies → anyone using anon was
--        locked out, but service-role still wrote freely (silent
--        failures for SSR pages). Now have explicit policies.
--   [F3] `academic_years`, `classes`, `subjects`, `exams` had NO RLS
--        at all → anon could read/write. Now RLS-enabled + scoped.
--   [F4] `notices` public read leaked drafts with future `published_at`
--        and notices targeted at restricted audiences (`staff`).
--        Tightened to `published_at <= now()` + audience filter.
--   [F5] `assignments` / `assignment_submissions` had no policies → no
--        student/teacher/parent visibility through anon. Added.
--   [F6] `attendance.marked_by` could be spoofed if writes were ever
--        opened to authenticated → enforced via WITH CHECK that
--        marked_by equals current user.
--   [F7] Joins inside policy expressions used raw subqueries against
--        RLS-protected tables → switched to SECURITY DEFINER helpers
--        to prevent infinite RLS recursion and ensure the planner
--        caches per statement.
--   [F8] `assignment_submissions` write path allowed any student_id →
--        WITH CHECK now ensures the submitting parent owns the
--        student_id, and only the assignment's author teacher (or
--        admin) can grade.
-- =====================================================

-- =====================================================
-- 0. Make sure every relevant table has RLS enabled
-- =====================================================
alter table public.users                 enable row level security;
alter table public.academic_years        enable row level security;
alter table public.classes               enable row level security;
alter table public.subjects              enable row level security;
alter table public.parents               enable row level security;
alter table public.students              enable row level security;
alter table public.attendance            enable row level security;
alter table public.exams                 enable row level security;
alter table public.results               enable row level security;
alter table public.notices               enable row level security;
alter table public.gallery_albums        enable row level security;
alter table public.gallery_media         enable row level security;
alter table public.alumni                enable row level security;
alter table public.events                enable row level security;
alter table public.website_content       enable row level security;
alter table public.audit_logs            enable row level security;
alter table public.teachers              enable row level security;
alter table public.teacher_assignments   enable row level security;
alter table public.assignments           enable row level security;
alter table public.assignment_submissions enable row level security;

-- =====================================================
-- 1. Helper functions (SECURITY DEFINER, search-path guarded)
-- =====================================================
create or replace function public.current_clerk_id()
returns text
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    nullif((current_setting('request.jwt.claims', true)::jsonb ->> 'sub'), '')
  )
$$;

create or replace function public.current_user_id()
returns uuid
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select id from public.users
  where clerk_id = public.current_clerk_id()
  limit 1
$$;

create or replace function public.current_user_role()
returns user_role
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select role from public.users
  where clerk_id = public.current_clerk_id()
  limit 1
$$;

create or replace function public.is_admin() returns boolean
language sql stable as $$ select public.current_user_role() = 'admin' $$;

create or replace function public.is_teacher() returns boolean
language sql stable as $$ select public.current_user_role() = 'teacher' $$;

create or replace function public.is_parent() returns boolean
language sql stable as $$ select public.current_user_role() = 'parent' $$;

create or replace function public.is_alumni() returns boolean
language sql stable as $$ select public.current_user_role() = 'alumni' $$;

create or replace function public.is_student() returns boolean
language sql stable as $$ select public.current_user_role() = 'student' $$;

create or replace function public.current_parent_id()
returns uuid
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select p.id from public.parents p
  where p.user_id = public.current_user_id()
  limit 1
$$;

create or replace function public.current_teacher_id()
returns uuid
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select t.id from public.teachers t
  where t.user_id = public.current_user_id()
  limit 1
$$;

create or replace function public.parent_owns_student(p_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.students s
    where s.id = p_student_id
      and s.parent_id = public.current_parent_id()
  )
$$;

create or replace function public.parent_student_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select s.id from public.students s
  where s.parent_id = public.current_parent_id()
$$;

create or replace function public.teacher_teaches_class(p_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.teacher_assignments ta
    where ta.teacher_id = public.current_teacher_id()
      and ta.class_id = p_class_id
  )
$$;

create or replace function public.teacher_teaches_subject(p_class_id uuid, p_subject_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.teacher_assignments ta
    where ta.teacher_id = public.current_teacher_id()
      and ta.class_id = p_class_id
      and (p_subject_id is null or ta.subject_id = p_subject_id)
  )
$$;

create or replace function public.teacher_is_class_teacher(p_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.teacher_assignments ta
    where ta.teacher_id = public.current_teacher_id()
      and ta.class_id = p_class_id
      and ta.is_class_teacher
  )
$$;

create or replace function public.teacher_teaches_student(p_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.students s
    join public.teacher_assignments ta on ta.class_id = s.class_id
    where s.id = p_student_id
      and ta.teacher_id = public.current_teacher_id()
  )
$$;

-- =====================================================
-- 2. Drop every policy this migration owns (idempotent re-run)
-- =====================================================
-- 2a. Also drop the original permissive policies from 001
drop policy if exists "public read notices"          on public.notices;
drop policy if exists "public read gallery albums"   on public.gallery_albums;
drop policy if exists "public read gallery media"    on public.gallery_media;
drop policy if exists "public read events"           on public.events;
drop policy if exists "public read website content"  on public.website_content;
drop policy if exists "public read alumni"           on public.alumni;
drop policy if exists "users self read"              on public.users;
drop policy if exists "admin all students"           on public.students;
drop policy if exists "admin all attendance"         on public.attendance;
drop policy if exists "admin all results"            on public.results;
drop policy if exists "parent read own children"     on public.students;
drop policy if exists "parent read child attendance" on public.attendance;
drop policy if exists "parent read child results"    on public.results;

-- 2b. Drop the new policies in case migration is being re-run
drop policy if exists users_select_self_or_admin    on public.users;
drop policy if exists users_update_admin            on public.users;
drop policy if exists users_delete_admin            on public.users;

drop policy if exists ay_select_authenticated       on public.academic_years;
drop policy if exists ay_write_admin                on public.academic_years;

drop policy if exists classes_select_authenticated  on public.classes;
drop policy if exists classes_write_admin           on public.classes;

drop policy if exists subjects_select_authenticated on public.subjects;
drop policy if exists subjects_write_admin          on public.subjects;

drop policy if exists parents_select_self_admin     on public.parents;
drop policy if exists parents_update_admin          on public.parents;
drop policy if exists parents_write_admin_other     on public.parents;
drop policy if exists parents_delete_admin          on public.parents;

drop policy if exists students_select_admin         on public.students;
drop policy if exists students_select_parent_own    on public.students;
drop policy if exists students_select_teacher_class on public.students;
drop policy if exists students_write_admin          on public.students;

drop policy if exists teachers_select_self_admin    on public.teachers;
drop policy if exists teachers_write_admin          on public.teachers;

drop policy if exists ta_select_admin               on public.teacher_assignments;
drop policy if exists ta_select_self                on public.teacher_assignments;
drop policy if exists ta_write_admin                on public.teacher_assignments;

drop policy if exists attendance_select_admin               on public.attendance;
drop policy if exists attendance_select_parent              on public.attendance;
drop policy if exists attendance_select_teacher             on public.attendance;
drop policy if exists attendance_insert_class_teacher       on public.attendance;
drop policy if exists attendance_update_class_teacher       on public.attendance;
drop policy if exists attendance_delete_admin               on public.attendance;

drop policy if exists exams_select_published        on public.exams;
drop policy if exists exams_select_staff            on public.exams;
drop policy if exists exams_write_admin             on public.exams;

drop policy if exists results_select_admin            on public.results;
drop policy if exists results_select_parent_published on public.results;
drop policy if exists results_select_teacher_assigned on public.results;
drop policy if exists results_insert_teacher          on public.results;
drop policy if exists results_update_teacher          on public.results;
drop policy if exists results_delete_admin            on public.results;

drop policy if exists notices_select_public    on public.notices;
drop policy if exists notices_select_parents   on public.notices;
drop policy if exists notices_select_students  on public.notices;
drop policy if exists notices_select_alumni    on public.notices;
drop policy if exists notices_select_teacher   on public.notices;
drop policy if exists notices_select_admin     on public.notices;
drop policy if exists notices_write_admin      on public.notices;

drop policy if exists ga_select_public on public.gallery_albums;
drop policy if exists ga_select_admin  on public.gallery_albums;
drop policy if exists ga_write_admin   on public.gallery_albums;

drop policy if exists gm_select_public on public.gallery_media;
drop policy if exists gm_select_admin  on public.gallery_media;
drop policy if exists gm_write_admin   on public.gallery_media;

drop policy if exists alumni_select_public        on public.alumni;
drop policy if exists alumni_select_self          on public.alumni;
drop policy if exists alumni_select_admin         on public.alumni;
drop policy if exists alumni_insert_self_admin    on public.alumni;
drop policy if exists alumni_update_self_admin    on public.alumni;
drop policy if exists alumni_delete_admin         on public.alumni;

drop policy if exists events_select_public on public.events;
drop policy if exists events_select_admin  on public.events;
drop policy if exists events_write_admin   on public.events;

drop policy if exists wc_select_public on public.website_content;
drop policy if exists wc_write_admin   on public.website_content;

drop policy if exists audit_select_admin on public.audit_logs;

drop policy if exists assignments_select_admin          on public.assignments;
drop policy if exists assignments_select_author_teacher on public.assignments;
drop policy if exists assignments_select_class_teacher  on public.assignments;
drop policy if exists assignments_select_parent         on public.assignments;
drop policy if exists assignments_insert_teacher        on public.assignments;
drop policy if exists assignments_update_author         on public.assignments;
drop policy if exists assignments_delete_author         on public.assignments;

drop policy if exists subs_select_admin              on public.assignment_submissions;
drop policy if exists subs_select_parent             on public.assignment_submissions;
drop policy if exists subs_select_assignment_teacher on public.assignment_submissions;
drop policy if exists subs_insert_parent             on public.assignment_submissions;
drop policy if exists subs_update_parent_resubmit    on public.assignment_submissions;
drop policy if exists subs_update_teacher_grade      on public.assignment_submissions;
drop policy if exists subs_delete_admin              on public.assignment_submissions;

-- =====================================================
-- 3. users
-- =====================================================
create policy users_select_self_or_admin on public.users
  for select to authenticated
  using (clerk_id = public.current_clerk_id() or public.is_admin());

create policy users_update_admin on public.users
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy users_delete_admin on public.users
  for delete to authenticated using (public.is_admin());

-- Privilege escalation guard [F1]
create or replace function public.guard_user_role_change()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Only admins can change user role' using errcode = '42501';
  end if;
  return new;
end $$;

drop trigger if exists trg_users_guard_role on public.users;
create trigger trg_users_guard_role
  before update on public.users
  for each row execute function public.guard_user_role_change();

-- =====================================================
-- 4. academic_years
-- =====================================================
create policy ay_select_authenticated on public.academic_years
  for select to authenticated using (true);
create policy ay_write_admin on public.academic_years
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- =====================================================
-- 5. classes
-- =====================================================
create policy classes_select_authenticated on public.classes
  for select to authenticated using (true);
create policy classes_write_admin on public.classes
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- =====================================================
-- 6. subjects
-- =====================================================
create policy subjects_select_authenticated on public.subjects
  for select to authenticated using (true);
create policy subjects_write_admin on public.subjects
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- =====================================================
-- 7. parents
-- =====================================================
create policy parents_select_self_admin on public.parents
  for select to authenticated
  using (
    user_id = public.current_user_id()
    or public.is_admin()
    or (
      public.is_teacher()
      and exists (
        select 1 from public.students s
        where s.parent_id = parents.id
          and public.teacher_teaches_class(s.class_id)
      )
    )
  );

create policy parents_update_admin on public.parents
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy parents_write_admin_other on public.parents
  for insert to authenticated with check (public.is_admin());

create policy parents_delete_admin on public.parents
  for delete to authenticated using (public.is_admin());

-- =====================================================
-- 8. students
-- =====================================================
create policy students_select_admin on public.students
  for select to authenticated using (public.is_admin());

create policy students_select_parent_own on public.students
  for select to authenticated using (parent_id = public.current_parent_id());

create policy students_select_teacher_class on public.students
  for select to authenticated
  using (public.is_teacher() and public.teacher_teaches_class(class_id));

create policy students_write_admin on public.students
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- =====================================================
-- 9. teachers
-- =====================================================
create policy teachers_select_self_admin on public.teachers
  for select to authenticated
  using (user_id = public.current_user_id() or public.is_admin());

create policy teachers_write_admin on public.teachers
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- =====================================================
-- 10. teacher_assignments
-- =====================================================
create policy ta_select_admin on public.teacher_assignments
  for select to authenticated using (public.is_admin());

create policy ta_select_self on public.teacher_assignments
  for select to authenticated
  using (teacher_id = public.current_teacher_id());

create policy ta_write_admin on public.teacher_assignments
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- =====================================================
-- 11. attendance
-- =====================================================
create policy attendance_select_admin on public.attendance
  for select to authenticated using (public.is_admin());

create policy attendance_select_parent on public.attendance
  for select to authenticated using (public.parent_owns_student(student_id));

create policy attendance_select_teacher on public.attendance
  for select to authenticated
  using (public.is_teacher() and public.teacher_teaches_student(student_id));

create policy attendance_insert_class_teacher on public.attendance
  for insert to authenticated
  with check (
    public.is_admin()
    or (
      public.is_teacher()
      and public.teacher_is_class_teacher(class_id)
      and (marked_by is null or marked_by = public.current_user_id())
    )
  );

create policy attendance_update_class_teacher on public.attendance
  for update to authenticated
  using (
    public.is_admin()
    or (public.is_teacher() and public.teacher_is_class_teacher(class_id))
  )
  with check (
    public.is_admin()
    or (
      public.is_teacher()
      and public.teacher_is_class_teacher(class_id)
      and (marked_by is null or marked_by = public.current_user_id())
    )
  );

create policy attendance_delete_admin on public.attendance
  for delete to authenticated using (public.is_admin());

-- =====================================================
-- 12. exams
-- =====================================================
create policy exams_select_published on public.exams
  for select to anon, authenticated using (is_published = true);

create policy exams_select_staff on public.exams
  for select to authenticated
  using (public.is_admin() or public.is_teacher());

create policy exams_write_admin on public.exams
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- =====================================================
-- 13. results
-- =====================================================
create policy results_select_admin on public.results
  for select to authenticated using (public.is_admin());

create policy results_select_parent_published on public.results
  for select to authenticated
  using (status = 'published' and public.parent_owns_student(student_id));

create policy results_select_teacher_assigned on public.results
  for select to authenticated
  using (
    public.is_teacher()
    and exists (
      select 1 from public.students s
      where s.id = results.student_id
        and public.teacher_teaches_subject(s.class_id, results.subject_id)
    )
  );

create policy results_insert_teacher on public.results
  for insert to authenticated
  with check (
    public.is_admin()
    or (
      public.is_teacher()
      and exists (
        select 1 from public.students s
        where s.id = results.student_id
          and public.teacher_teaches_subject(s.class_id, results.subject_id)
      )
    )
  );

create policy results_update_teacher on public.results
  for update to authenticated
  using (
    public.is_admin()
    or (
      public.is_teacher()
      and exists (
        select 1 from public.students s
        where s.id = results.student_id
          and public.teacher_teaches_subject(s.class_id, results.subject_id)
      )
    )
  )
  with check (
    public.is_admin()
    or (
      public.is_teacher()
      and exists (
        select 1 from public.students s
        where s.id = results.student_id
          and public.teacher_teaches_subject(s.class_id, results.subject_id)
      )
    )
  );

create policy results_delete_admin on public.results
  for delete to authenticated using (public.is_admin());

-- =====================================================
-- 14. notices
-- =====================================================
create policy notices_select_public on public.notices
  for select to anon, authenticated
  using (
    audience = 'all'
    and archived_at is null
    and published_at <= now()
    and (expires_at is null or expires_at > now())
  );

create policy notices_select_parents on public.notices
  for select to authenticated
  using (
    public.is_parent()
    and audience in ('all', 'parents')
    and archived_at is null
    and published_at <= now()
    and (expires_at is null or expires_at > now())
  );

create policy notices_select_students on public.notices
  for select to authenticated
  using (
    public.is_student()
    and audience in ('all', 'students')
    and archived_at is null
    and published_at <= now()
    and (expires_at is null or expires_at > now())
  );

create policy notices_select_alumni on public.notices
  for select to authenticated
  using (
    public.is_alumni()
    and audience in ('all', 'alumni')
    and archived_at is null
    and published_at <= now()
    and (expires_at is null or expires_at > now())
  );

create policy notices_select_teacher on public.notices
  for select to authenticated
  using (
    public.is_teacher()
    and audience in ('all', 'staff', 'parents', 'students')
    and archived_at is null
    and published_at <= now()
    and (expires_at is null or expires_at > now())
  );

create policy notices_select_admin on public.notices
  for select to authenticated using (public.is_admin());

create policy notices_write_admin on public.notices
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- =====================================================
-- 15. gallery_albums
-- =====================================================
create policy ga_select_public on public.gallery_albums
  for select to anon, authenticated using (is_published = true);
create policy ga_select_admin on public.gallery_albums
  for select to authenticated using (public.is_admin());
create policy ga_write_admin on public.gallery_albums
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- =====================================================
-- 16. gallery_media
-- =====================================================
create policy gm_select_public on public.gallery_media
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.gallery_albums a
      where a.id = album_id and a.is_published
    )
  );
create policy gm_select_admin on public.gallery_media
  for select to authenticated using (public.is_admin());
create policy gm_write_admin on public.gallery_media
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- =====================================================
-- 17. alumni
-- =====================================================
create policy alumni_select_public on public.alumni
  for select to anon, authenticated using (is_public = true);
create policy alumni_select_self on public.alumni
  for select to authenticated using (user_id = public.current_user_id());
create policy alumni_select_admin on public.alumni
  for select to authenticated using (public.is_admin());

create policy alumni_insert_self_admin on public.alumni
  for insert to authenticated
  with check (
    public.is_admin()
    or (public.is_alumni() and user_id = public.current_user_id())
  );

create policy alumni_update_self_admin on public.alumni
  for update to authenticated
  using (user_id = public.current_user_id() or public.is_admin())
  with check (user_id = public.current_user_id() or public.is_admin());

create policy alumni_delete_admin on public.alumni
  for delete to authenticated using (public.is_admin());

-- =====================================================
-- 18. events
-- =====================================================
create policy events_select_public on public.events
  for select to anon, authenticated using (is_published = true);
create policy events_select_admin on public.events
  for select to authenticated using (public.is_admin());
create policy events_write_admin on public.events
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- =====================================================
-- 19. website_content
-- =====================================================
create policy wc_select_public on public.website_content
  for select to anon, authenticated using (true);
create policy wc_write_admin on public.website_content
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- =====================================================
-- 20. audit_logs
-- =====================================================
create policy audit_select_admin on public.audit_logs
  for select to authenticated using (public.is_admin());
-- Writes/updates/deletes intentionally have NO policies → only service role.

-- =====================================================
-- 21. assignments
-- =====================================================
create policy assignments_select_admin on public.assignments
  for select to authenticated using (public.is_admin());

create policy assignments_select_author_teacher on public.assignments
  for select to authenticated
  using (teacher_id = public.current_teacher_id());

create policy assignments_select_class_teacher on public.assignments
  for select to authenticated
  using (
    is_published
    and public.is_teacher()
    and public.teacher_teaches_class(class_id)
  );

create policy assignments_select_parent on public.assignments
  for select to authenticated
  using (
    is_published
    and exists (
      select 1 from public.students s
      where s.parent_id = public.current_parent_id()
        and s.class_id = assignments.class_id
    )
  );

create policy assignments_insert_teacher on public.assignments
  for insert to authenticated
  with check (
    public.is_admin()
    or (
      public.is_teacher()
      and teacher_id = public.current_teacher_id()
      and public.teacher_teaches_subject(class_id, subject_id)
    )
  );

create policy assignments_update_author on public.assignments
  for update to authenticated
  using (public.is_admin() or teacher_id = public.current_teacher_id())
  with check (public.is_admin() or teacher_id = public.current_teacher_id());

create policy assignments_delete_author on public.assignments
  for delete to authenticated
  using (public.is_admin() or teacher_id = public.current_teacher_id());

-- =====================================================
-- 22. assignment_submissions
-- =====================================================
create policy subs_select_admin on public.assignment_submissions
  for select to authenticated using (public.is_admin());

create policy subs_select_parent on public.assignment_submissions
  for select to authenticated using (public.parent_owns_student(student_id));

create policy subs_select_assignment_teacher on public.assignment_submissions
  for select to authenticated
  using (
    public.is_teacher()
    and exists (
      select 1 from public.assignments a
      where a.id = assignment_id
        and a.teacher_id = public.current_teacher_id()
    )
  );

create policy subs_insert_parent on public.assignment_submissions
  for insert to authenticated
  with check (
    public.is_admin()
    or (
      public.parent_owns_student(student_id)
      and exists (
        select 1 from public.assignments a
        join public.students s on s.id = assignment_submissions.student_id
        where a.id = assignment_id
          and a.class_id = s.class_id
          and a.is_published
      )
    )
  );

create policy subs_update_parent_resubmit on public.assignment_submissions
  for update to authenticated
  using (public.parent_owns_student(student_id))
  with check (public.parent_owns_student(student_id) and status = 'submitted');

create policy subs_update_teacher_grade on public.assignment_submissions
  for update to authenticated
  using (
    public.is_admin()
    or (
      public.is_teacher()
      and exists (
        select 1 from public.assignments a
        where a.id = assignment_id
          and a.teacher_id = public.current_teacher_id()
      )
    )
  )
  with check (
    public.is_admin()
    or (
      public.is_teacher()
      and exists (
        select 1 from public.assignments a
        where a.id = assignment_id
          and a.teacher_id = public.current_teacher_id()
      )
    )
  );

create policy subs_delete_admin on public.assignment_submissions
  for delete to authenticated using (public.is_admin());

-- =====================================================
-- 23. GRANTs (idempotent; service role always bypasses RLS)
-- =====================================================
-- Public-readable tables
grant select on public.notices, public.gallery_albums, public.gallery_media,
                public.events, public.website_content, public.alumni,
                public.exams
  to anon, authenticated;

-- All readable-by-authenticated tables
grant select on public.academic_years, public.classes, public.subjects,
                public.students, public.parents, public.teachers,
                public.teacher_assignments, public.attendance, public.results,
                public.assignments, public.assignment_submissions,
                public.users, public.audit_logs
  to authenticated;

-- Writes that authenticated users may do (RLS narrows further per row)
grant insert, update, delete on public.attendance, public.results,
                                public.assignments, public.assignment_submissions,
                                public.alumni
  to authenticated;

grant update, delete on public.users, public.students, public.parents,
                         public.teachers, public.teacher_assignments,
                         public.gallery_albums, public.gallery_media,
                         public.events, public.website_content,
                         public.classes, public.subjects, public.exams,
                         public.academic_years, public.notices
  to authenticated;

grant insert on public.students, public.parents, public.teachers,
                public.teacher_assignments, public.gallery_albums,
                public.gallery_media, public.events, public.website_content,
                public.classes, public.subjects, public.exams,
                public.academic_years, public.notices
  to authenticated;

-- =====================================================
-- 24. Function execution grants
-- =====================================================
grant execute on function public.current_clerk_id(),
                          public.current_user_id(),
                          public.current_user_role(),
                          public.is_admin(),
                          public.is_teacher(),
                          public.is_parent(),
                          public.is_alumni(),
                          public.is_student(),
                          public.current_parent_id(),
                          public.current_teacher_id(),
                          public.parent_owns_student(uuid),
                          public.parent_student_ids(),
                          public.teacher_teaches_class(uuid),
                          public.teacher_teaches_subject(uuid, uuid),
                          public.teacher_is_class_teacher(uuid),
                          public.teacher_teaches_student(uuid)
  to anon, authenticated;

-- =====================================================
-- DONE.
-- After applying: ensure your Clerk → Supabase JWT template exposes the
-- Clerk user id under the standard `sub` claim and uses role `authenticated`.
-- =====================================================
