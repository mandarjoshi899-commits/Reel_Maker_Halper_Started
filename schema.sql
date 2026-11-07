-- Run this in Supabase SQL Editor.
create table if not exists public.saved_scripts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text not null,
  scenes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.saved_scripts enable row level security;
create policy "Users can read their own scripts" on public.saved_scripts
  for select using (auth.uid() = user_id);
create policy "Users can insert their own scripts" on public.saved_scripts
  for insert with check (auth.uid() = user_id);
create policy "Users can delete their own scripts" on public.saved_scripts
  for delete using (auth.uid() = user_id);
