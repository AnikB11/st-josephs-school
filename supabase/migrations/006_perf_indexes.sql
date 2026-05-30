-- =====================================================
-- Migration 006: performance indexes for hot read paths
-- =====================================================
-- Adds two partial indexes that exactly match the most-trafficked queries
-- in the app. Both are partial (filtered) so they stay small in memory and
-- are picked over the broader single-column indexes by the planner.
--
-- Safe to re-run.

-- 1. Result viewer hot path
--
-- Every student/parent/public result viewer runs:
--   select pdf_url, published_at, exams(...)
--   from results
--   where student_id = ? and status = 'published' and pdf_url is not null
--   order by published_at desc;
--
-- Today we rely on idx_results_student (single column) + a filter. With
-- this partial composite, the planner can do a single index-only scan
-- limited to the rows that actually back the public results page.
create index if not exists idx_results_student_published_pdf
  on public.results (student_id, published_at desc)
  where status = 'published' and pdf_url is not null;

-- 2. Dashboard "upcoming events" path
--
-- Student/parent/alumni dashboards all do:
--   select ... from events
--   where is_published = true and starts_at >= now()
--   order by starts_at asc limit N;
--
-- The existing idx_events_starts is single-column; the planner has to
-- filter is_published after the scan. A partial keeps only the rows we
-- ever query and orders them naturally.
create index if not exists idx_events_published_starts
  on public.events (starts_at)
  where is_published = true;
