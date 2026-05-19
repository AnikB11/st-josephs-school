# St. Joseph's School — Website & Management Platform

Modern school ecosystem built with Next.js 15, Supabase, Clerk, Cloudinary, and Tailwind.

## What's inside

| Area              | Routes / paths                                          |
|-------------------|---------------------------------------------------------|
| Public website    | `/`, `/about`, `/academics`, `/admissions`, `/gallery`, `/notices`, `/alumni`, `/contact`, `/results`, `/login` |
| Admin dashboard   | `/admin/*` — students, attendance, results, notices, gallery, CMS, alumni, settings |
| Parent portal     | `/parent/*` — attendance, results, notices              |
| Alumni portal     | `/alumni-portal/*` — profile, network                   |
| API               | `/api/students`, `/api/notices`, `/api/upload`, `/api/public-result`, `/api/contact`, `/api/cron/notices-cleanup` |

## Quick start

```bash
# 1. install
npm install

# 2. configure env
cp .env.example .env.local
# fill in Clerk, Supabase, Cloudinary, PostHog, Sentry keys

# 3. set up the database
# Paste supabase/migrations/001_initial_schema.sql into Supabase SQL editor

# 4. promote your first admin
# In SQL editor:
#   update public.users set role = 'admin' where email = '<your email>';
# (Or set ADMIN_BOOTSTRAP_EMAIL in .env.local so the first sign-in promotes you automatically.)

# 5. run dev
npm run dev
```

## Stack

- **Framework**: Next.js 15 (App Router, RSC)
- **Auth**: Clerk (Google OAuth, role-based via Supabase `users.role`)
- **DB**: Supabase Postgres with row-level security
- **Storage**: Cloudinary (images/video) + Supabase Storage (PDFs)
- **Analytics**: PostHog (page + identified events)
- **Errors**: Sentry (client + server + edge)
- **UI**: TailwindCSS, shadcn/ui, Framer Motion, Lucide
- **Hosting**: Vercel (with Cron for notice cleanup)

## Folder structure

```
app/
  (public)/     — homepage and content pages, shared navbar/footer
  admin/        — admin dashboard (role: admin)
  parent/       — parent portal (role: parent | admin)
  alumni-portal/— alumni portal (role: alumni | admin)
  login/        — Clerk-hosted sign in
  api/          — REST endpoints + cron
components/
  ui/           — shadcn primitives (Button, Card, Table, …)
  site/         — public site components (Hero, Stats, Footer, …)
  dashboard/    — dashboard chrome (Sidebar, TopNav, StatCard)
lib/            — Supabase clients, Cloudinary, auth helpers, utils
supabase/       — SQL migrations and storage docs
types/          — hand-authored DB types (regenerate via supabase CLI)
```

## Cron jobs

`vercel.json` registers a daily job at 02:00 UTC that:
1. archives notices whose `expires_at` has passed
2. deletes notices archived more than 60 days ago

The endpoint requires `Authorization: Bearer $CRON_SECRET`.

## Production checklist

- [ ] Run the Supabase migration
- [ ] Create Cloudinary upload preset matching `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
- [ ] Configure Clerk: enable Google OAuth, set sign-in URL to `/login`
- [ ] Set all env vars in Vercel project settings (including `CRON_SECRET`)
- [ ] Promote the first admin user
- [ ] Configure custom domain through Cloudflare DNS

## Security

- All admin/parent/alumni routes are protected by Clerk middleware
- All Supabase tables enable row-level security
- Service-role client (`lib/supabase/admin.ts`) is only imported from server contexts
- API uploads validate type (jpg/png/webp/mp4/webm) and size (≤10MB)
- Static security headers in `next.config.ts`

## License

Proprietary — © St. Joseph's School.
