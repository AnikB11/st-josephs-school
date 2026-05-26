-- =====================================================
-- Migration 002 — Teachers, Assignments
-- =====================================================
-- Adds: teachers, teacher_assignments, assignments,
--       assignment_submissions.
-- Extends user_role enum with 'teacher'.
-- =====================================================

-- Extend user_role with 'teacher'
alter type user_role add value if not exists 'teacher';

-- =====================================================
-- TEACHERS
-- =====================================================
create table if not exists public.teachers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique references public.users(id) on delete set null,
  invited_email text unique,
  full_name text not null,
  employee_code text unique,
  phone text,
  qualification text,
  date_of_joining date not null default current_date,
  is_active boolean not null default true,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_teachers_user on public.teachers(user_id);
create index if not exists idx_teachers_email on public.teachers(invited_email);

-- TEACHER ↔ CLASS ↔ SUBJECT assignment
create table if not exists public.teacher_assignments (
  id uuid primary key default uuid_generate_v4(),
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete cascade,
  is_class_teacher boolean not null default false,
  created_at timestamptz not null default now(),
  unique (teacher_id, class_id, subject_id)
);
create index if not exists idx_ta_teacher on public.teacher_assignments(teacher_id);
create index if not exists idx_ta_class on public.teacher_assignments(class_id);

-- =====================================================
-- ASSIGNMENTS
-- =====================================================
create table if not exists public.assignments (
  id uuid primary key default uuid_generate_v4(),
  class_id uuid not null references public.classes(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  teacher_id uuid references public.teachers(id) on delete set null,
  title text not null,
  description text,
  pdf_url text,
  due_date date,
  max_marks integer,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_assign_class on public.assignments(class_id);
create index if not exists idx_assign_teacher on public.assignments(teacher_id);

create table if not exists public.assignment_submissions (
  id uuid primary key default uuid_generate_v4(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  pdf_url text,
  remarks text,
  marks_obtained integer,
  status text not null default 'submitted',
  submitted_at timestamptz not null default now(),
  graded_at timestamptz,
  unique (assignment_id, student_id)
);
create index if not exists idx_sub_assign on public.assignment_submissions(assignment_id);
create index if not exists idx_sub_student on public.assignment_submissions(student_id);

-- =====================================================
-- RLS (enabled but admin client bypasses)
-- =====================================================
alter table public.teachers              enable row level security;
alter table public.teacher_assignments   enable row level security;
alter table public.assignments           enable row level security;
alter table public.assignment_submissions enable row level security;
