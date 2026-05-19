-- =====================================================
-- St. Joseph's School — Initial Schema
-- =====================================================
-- Run via Supabase Dashboard → SQL Editor, or:
--   supabase db push
-- =====================================================

create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================
do $$ begin
  create type user_role as enum ('admin', 'parent', 'alumni', 'student');
exception when duplicate_object then null; end $$;

do $$ begin
  create type attendance_status as enum ('present', 'absent', 'late', 'excused');
exception when duplicate_object then null; end $$;

do $$ begin
  create type student_status as enum ('active', 'promoted', 'retained', 'graduated', 'transferred');
exception when duplicate_object then null; end $$;

do $$ begin
  create type notice_audience as enum ('all', 'parents', 'students', 'alumni', 'staff');
exception when duplicate_object then null; end $$;

do $$ begin
  create type notice_category as enum ('general', 'academic', 'event', 'urgent', 'holiday');
exception when duplicate_object then null; end $$;

do $$ begin
  create type result_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null; end $$;

-- =====================================================
-- USERS (mirrors Clerk users by clerk_id)
-- =====================================================
create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  clerk_id text unique not null,
  email text unique not null,
  full_name text,
  avatar_url text,
  role user_role not null default 'parent',
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_users_clerk_id on public.users(clerk_id);
create index if not exists idx_users_role on public.users(role);

-- =====================================================
-- ACADEMIC YEARS
-- =====================================================
create table if not exists public.academic_years (
  id uuid primary key default uuid_generate_v4(),
  year_label text unique not null,             -- e.g. "2026-27"
  start_date date not null,
  end_date date not null,
  is_current boolean not null default false,
  created_at timestamptz not null default now()
);

-- =====================================================
-- CLASSES (Grade + Section)
-- =====================================================
create table if not exists public.classes (
  id uuid primary key default uuid_generate_v4(),
  grade text not null,                          -- e.g. "10"
  section text not null,                        -- e.g. "A"
  academic_year_id uuid references public.academic_years(id) on delete restrict,
  class_teacher_id uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(grade, section, academic_year_id)
);
create index if not exists idx_classes_year on public.classes(academic_year_id);

-- =====================================================
-- SUBJECTS
-- =====================================================
create table if not exists public.subjects (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  code text unique,
  grade text,
  max_marks int not null default 100,
  created_at timestamptz not null default now()
);

-- =====================================================
-- PARENTS
-- =====================================================
create table if not exists public.parents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique references public.users(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  occupation text,
  address text,
  created_at timestamptz not null default now()
);
create index if not exists idx_parents_user on public.parents(user_id);

-- =====================================================
-- STUDENTS
-- =====================================================
create table if not exists public.students (
  id uuid primary key default uuid_generate_v4(),
  admission_number text unique not null,        -- SJR-2026-0001
  roll_number text,
  full_name text not null,
  date_of_birth date not null,
  gender text check (gender in ('male','female','other')),
  class_id uuid references public.classes(id) on delete set null,
  parent_id uuid references public.parents(id) on delete set null,
  status student_status not null default 'active',
  admission_date date not null default current_date,
  photo_url text,
  blood_group text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_students_admission on public.students(admission_number);
create index if not exists idx_students_class on public.students(class_id);
create index if not exists idx_students_parent on public.students(parent_id);
create index if not exists idx_students_status on public.students(status);

-- =====================================================
-- ATTENDANCE
-- =====================================================
create table if not exists public.attendance (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references public.students(id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  date date not null,
  status attendance_status not null,
  marked_by uuid references public.users(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  unique(student_id, date)
);
create index if not exists idx_attendance_student_date on public.attendance(student_id, date desc);
create index if not exists idx_attendance_class_date on public.attendance(class_id, date desc);

-- =====================================================
-- EXAMS
-- =====================================================
create table if not exists public.exams (
  id uuid primary key default uuid_generate_v4(),
  name text not null,                           -- "Mid-Term 2026"
  academic_year_id uuid references public.academic_years(id) on delete cascade,
  start_date date,
  end_date date,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

-- =====================================================
-- RESULTS
-- =====================================================
create table if not exists public.results (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references public.students(id) on delete cascade,
  exam_id uuid not null references public.exams(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  marks_obtained numeric(6,2) not null,
  max_marks numeric(6,2) not null default 100,
  grade text,
  remarks text,
  status result_status not null default 'draft',
  pdf_url text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(student_id, exam_id, subject_id)
);
create index if not exists idx_results_student on public.results(student_id);
create index if not exists idx_results_exam on public.results(exam_id);
create index if not exists idx_results_status on public.results(status);

-- =====================================================
-- NOTICES
-- =====================================================
create table if not exists public.notices (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  body text,
  category notice_category not null default 'general',
  audience notice_audience not null default 'all',
  pdf_url text,
  published_at timestamptz not null default now(),
  expires_at timestamptz,
  archived_at timestamptz,
  is_pinned boolean not null default false,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists idx_notices_audience on public.notices(audience);
create index if not exists idx_notices_published on public.notices(published_at desc);
create index if not exists idx_notices_expires on public.notices(expires_at);
create index if not exists idx_notices_archived on public.notices(archived_at);

-- =====================================================
-- GALLERY
-- =====================================================
create table if not exists public.gallery_albums (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  description text,
  cover_url text,
  event_date date,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.gallery_media (
  id uuid primary key default uuid_generate_v4(),
  album_id uuid not null references public.gallery_albums(id) on delete cascade,
  cloudinary_url text not null,
  cloudinary_public_id text,
  width int,
  height int,
  caption text,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_gallery_media_album on public.gallery_media(album_id, display_order);

-- =====================================================
-- ALUMNI
-- =====================================================
-- Note: `current_role` would conflict with the SQL standard reserved
-- function name CURRENT_ROLE. We use `current_position` instead.
create table if not exists public.alumni (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique references public.users(id) on delete set null,
  student_id uuid references public.students(id) on delete set null,
  full_name text not null,
  graduation_year int not null,
  current_position text,
  current_company text,
  bio text,
  photo_url text,
  linkedin_url text,
  email text,
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_alumni_grad_year on public.alumni(graduation_year);

-- Idempotent rename for anyone who ran an earlier draft of this migration
-- that had a `current_role` column (which conflicts with the reserved keyword).
do $$ begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'alumni' and column_name = 'current_role'
  ) then
    alter table public.alumni rename column current_role to current_position;
  end if;
end $$;

-- =====================================================
-- EVENTS
-- =====================================================
create table if not exists public.events (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text,
  cover_url text,
  audience notice_audience not null default 'all',
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_events_starts on public.events(starts_at);

-- =====================================================
-- WEBSITE CONTENT (CMS)
-- =====================================================
create table if not exists public.website_content (
  id uuid primary key default uuid_generate_v4(),
  section_key text unique not null,             -- "hero_headline", "principal_message", etc.
  title text,
  body text,
  image_url text,
  meta jsonb default '{}'::jsonb,
  updated_by uuid references public.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

-- =====================================================
-- AUDIT LOGS
-- =====================================================
create table if not exists public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid references public.users(id) on delete set null,
  action text not null,                         -- "student.create", "result.publish"
  entity_type text,
  entity_id uuid,
  metadata jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);
create index if not exists idx_audit_actor on public.audit_logs(actor_id, created_at desc);
create index if not exists idx_audit_entity on public.audit_logs(entity_type, entity_id);

-- =====================================================
-- ADMISSION NUMBER SEQUENCE
-- =====================================================
create sequence if not exists admission_number_seq start 1;

create or replace function public.generate_admission_number(prefix text default 'SJR')
returns text language plpgsql as $$
declare
  yr int := extract(year from current_date)::int;
  nxt int;
begin
  nxt := nextval('admission_number_seq');
  return prefix || '-' || yr || '-' || lpad(nxt::text, 4, '0');
end $$;

-- =====================================================
-- UPDATED_AT TRIGGER
-- =====================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

do $$ begin
  create trigger trg_users_updated_at before update on public.users
    for each row execute function public.set_updated_at();
exception when duplicate_object then null; end $$;

do $$ begin
  create trigger trg_students_updated_at before update on public.students
    for each row execute function public.set_updated_at();
exception when duplicate_object then null; end $$;

do $$ begin
  create trigger trg_results_updated_at before update on public.results
    for each row execute function public.set_updated_at();
exception when duplicate_object then null; end $$;

-- =====================================================
-- ROW-LEVEL SECURITY
-- =====================================================
alter table public.users           enable row level security;
alter table public.students        enable row level security;
alter table public.parents         enable row level security;
alter table public.attendance      enable row level security;
alter table public.results         enable row level security;
alter table public.notices         enable row level security;
alter table public.gallery_albums  enable row level security;
alter table public.gallery_media   enable row level security;
alter table public.alumni          enable row level security;
alter table public.events          enable row level security;
alter table public.website_content enable row level security;
alter table public.audit_logs      enable row level security;

-- Helper: extract Clerk id from JWT
create or replace function public.current_clerk_id()
returns text language sql stable as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    nullif((current_setting('request.jwt.claims', true)::jsonb ->> 'sub'), '')
  )
$$;

create or replace function public.current_user_role()
returns user_role language sql stable as $$
  select role from public.users where clerk_id = public.current_clerk_id() limit 1
$$;

-- Public reads (server-side rendered pages still hit these)
drop policy if exists "public read notices" on public.notices;
create policy "public read notices" on public.notices
  for select using (archived_at is null and (expires_at is null or expires_at > now()));

drop policy if exists "public read gallery albums" on public.gallery_albums;
create policy "public read gallery albums" on public.gallery_albums
  for select using (is_published = true);

drop policy if exists "public read gallery media" on public.gallery_media;
create policy "public read gallery media" on public.gallery_media
  for select using (
    exists (select 1 from public.gallery_albums a where a.id = album_id and a.is_published)
  );

drop policy if exists "public read events" on public.events;
create policy "public read events" on public.events
  for select using (is_published = true);

drop policy if exists "public read website content" on public.website_content;
create policy "public read website content" on public.website_content
  for select using (true);

drop policy if exists "public read alumni" on public.alumni;
create policy "public read alumni" on public.alumni
  for select using (is_public = true);

-- Users: self read
drop policy if exists "users self read" on public.users;
create policy "users self read" on public.users
  for select using (clerk_id = public.current_clerk_id() or public.current_user_role() = 'admin');

-- Admin full access (write paths use service role; this allows admin user JWTs too)
drop policy if exists "admin all students" on public.students;
create policy "admin all students" on public.students
  for all using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

drop policy if exists "admin all attendance" on public.attendance;
create policy "admin all attendance" on public.attendance
  for all using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

drop policy if exists "admin all results" on public.results;
create policy "admin all results" on public.results
  for all using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

-- Parent: read own children's records
drop policy if exists "parent read own children" on public.students;
create policy "parent read own children" on public.students
  for select using (
    parent_id in (
      select p.id from public.parents p
      join public.users u on u.id = p.user_id
      where u.clerk_id = public.current_clerk_id()
    )
  );

drop policy if exists "parent read child attendance" on public.attendance;
create policy "parent read child attendance" on public.attendance
  for select using (
    student_id in (
      select s.id from public.students s
      join public.parents p on p.id = s.parent_id
      join public.users u on u.id = p.user_id
      where u.clerk_id = public.current_clerk_id()
    )
  );

drop policy if exists "parent read child results" on public.results;
create policy "parent read child results" on public.results
  for select using (
    status = 'published' and student_id in (
      select s.id from public.students s
      join public.parents p on p.id = s.parent_id
      join public.users u on u.id = p.user_id
      where u.clerk_id = public.current_clerk_id()
    )
  );

-- =====================================================
-- SEED: minimum bootstrap content
-- =====================================================
insert into public.academic_years (year_label, start_date, end_date, is_current)
values ('2026-27', '2026-04-01', '2027-03-31', true)
on conflict (year_label) do nothing;

insert into public.website_content (section_key, title, body) values
  ('hero_headline', 'Where Tradition Meets Tomorrow',
   'St. Joseph''s School has nurtured generations of curious, compassionate, and capable young people.'),
  ('principal_message', 'A Message from the Principal',
   'Education is not the filling of a pail, but the lighting of a fire. At St. Joseph''s we strive every day to ignite curiosity, build character, and prepare our students for the world ahead.'),
  ('about_intro', 'Our Story',
   'Founded in 1965, St. Joseph''s School has served the community for six decades with a commitment to academic rigor and holistic development.')
on conflict (section_key) do nothing;
