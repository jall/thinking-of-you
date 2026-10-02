create table public.friends (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 200),
  ord integer,
  photo text check (photo is null or char_length(photo) < 300000),
  last_at bigint,
  created_at bigint,
  inserted_at timestamptz not null default now()
);
create table public.moments (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  friend_id text not null,
  at bigint not null,
  note text check (note is null or char_length(note) < 5000),
  inserted_at timestamptz not null default now()
);
create index friends_user_idx on public.friends(user_id);
create index moments_user_at_idx on public.moments(user_id, at desc);

alter table public.friends enable row level security;
alter table public.moments enable row level security;

create policy "own friends" on public.friends for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own moments" on public.moments for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

alter publication supabase_realtime add table public.friends, public.moments;
