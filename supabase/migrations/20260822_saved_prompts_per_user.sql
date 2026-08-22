-- ShortStories: account-isolated prompt history & favorites
-- Run this once in Supabase SQL Editor for project ppxckqbpuetulzmvusvg.

create extension if not exists pgcrypto;

create table if not exists public.saved_prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('history','favorite')),
  title text not null default '',
  prompt text not null,
  created_at timestamptz not null default now()
);

create index if not exists saved_prompts_user_kind_created_idx
  on public.saved_prompts (user_id, kind, created_at desc);

-- A user can save the same prompt as history more than once, but the same
-- prompt is only stored once in that user's favorites.
create unique index if not exists saved_prompts_favorite_unique_idx
  on public.saved_prompts (user_id, md5(prompt))
  where kind = 'favorite';

alter table public.saved_prompts enable row level security;
alter table public.saved_prompts force row level security;

drop policy if exists "saved_prompts_select_own" on public.saved_prompts;
drop policy if exists "saved_prompts_insert_own" on public.saved_prompts;
drop policy if exists "saved_prompts_delete_own" on public.saved_prompts;

create policy "saved_prompts_select_own"
  on public.saved_prompts
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "saved_prompts_insert_own"
  on public.saved_prompts
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "saved_prompts_delete_own"
  on public.saved_prompts
  for delete
  to authenticated
  using (auth.uid() = user_id);

grant select, insert, delete on public.saved_prompts to authenticated;
revoke all on public.saved_prompts from anon;

comment on table public.saved_prompts is
  'ShortStories prompt history/favorites; rows are isolated by authenticated Supabase user via RLS.';
