-- Run this once in Supabase SQL editor (Dashboard → SQL Editor → New query)

create table if not exists public.premium_users (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  purchase_token text,
  product_id  text,
  is_active   boolean not null default false,
  expires_at  timestamptz,
  updated_at  timestamptz not null default now()
);

alter table public.premium_users enable row level security;

-- Users may only read their own row (the app calls this via anon key)
create policy "users_read_own_premium"
  on public.premium_users for select
  using (auth.uid() = user_id);

-- Inserts and updates go through the Edge Function which uses the service role key,
-- so no policy needed here for write operations.
