-- =====================================================
-- Migration 008: idempotency keys
-- =====================================================
-- Server-side dedupe for write endpoints that accept an
-- Idempotency-Key header (promotions.run, alumni.request).
--
-- Replay protection: first request writes (key, response); any retry
-- with the same key within TTL short-circuits with the stored response.
-- Entries past expires_at are swept by the daily cron (future).
--
-- Safe to re-run.

create table if not exists public.idempotency_keys (
  key          text primary key,
  route        text not null,
  status_code  int  not null,
  body         jsonb not null,
  created_at   timestamptz not null default now(),
  expires_at   timestamptz not null
);

create index if not exists idx_idempotency_expires
  on public.idempotency_keys (expires_at);

-- Admin access only; no RLS policies needed since the table is reached
-- exclusively through the service-role admin client.
alter table public.idempotency_keys enable row level security;
