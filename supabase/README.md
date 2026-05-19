# Supabase Setup

## Quick start

1. Create a Supabase project at https://supabase.com
2. Copy your project URL and anon/service keys into `.env.local`
3. Run the migration in **SQL Editor**:

   ```bash
   # Open the file and paste into Supabase SQL Editor:
   supabase/migrations/001_initial_schema.sql
   ```

   Or via CLI:

   ```bash
   supabase link --project-ref <ref>
   supabase db push
   ```

## Storage buckets

In Dashboard → Storage, create:

| Bucket      | Public | Notes                                |
|-------------|--------|--------------------------------------|
| `notices`   | yes    | PDF attachments for public notices   |
| `marksheets`| no     | Student PDF report cards (signed URL)|

## Tables

15 tables: users, academic_years, classes, subjects, parents, students, attendance, exams, results, notices, gallery_albums, gallery_media, alumni, events, website_content, audit_logs.

Row-level security is enabled on all tables with policies for:
- public read on notices/gallery/events/alumni
- admin full access
- parent read on their own children's records

## Admission numbers

```sql
select generate_admission_number('SJR');
-- → SJR-2026-0001
```

## Bootstrapping the first admin

After a user signs up via Clerk, manually promote them:

```sql
update public.users set role = 'admin' where email = 'admin@stjosephs.edu';
```
