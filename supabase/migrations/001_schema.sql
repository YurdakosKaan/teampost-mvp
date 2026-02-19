-- ============================================================
-- Team-Based Social Media MVP — Full Schema
-- ============================================================

-- 1. Teams
create table public.teams (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  handle     text not null unique,
  created_at timestamptz not null default now(),

  constraint teams_handle_format check (handle ~ '^[a-z0-9_-]+$')
);

-- 2. Profiles (links auth.users → teams)
create table public.profiles (
  id         uuid primary key references auth.users on delete cascade,
  team_id    uuid not null references public.teams on delete cascade,
  full_name  text,
  created_at timestamptz not null default now()
);

-- 3. Posts (team-owned content)
create table public.posts (
  id         uuid primary key default gen_random_uuid(),
  team_id    uuid not null references public.teams on delete cascade,
  author_id  uuid references public.profiles on delete set null,
  content    text not null check (char_length(content) between 1 and 500),
  created_at timestamptz not null default now()
);

create index posts_team_id_idx    on public.posts (team_id);
create index posts_created_at_idx on public.posts (created_at desc);

-- 4. Follows (team-to-team, one-directional)
create table public.follows (
  follower_team_id  uuid not null references public.teams on delete cascade,
  following_team_id uuid not null references public.teams on delete cascade,
  created_at        timestamptz not null default now(),

  primary key (follower_team_id, following_team_id),
  constraint no_self_follow check (follower_team_id <> following_team_id)
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.teams    enable row level security;
alter table public.profiles enable row level security;
alter table public.posts    enable row level security;
alter table public.follows  enable row level security;

-- Helper: get the team_id for the current authenticated user
create or replace function public.get_my_team_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select team_id from public.profiles where id = auth.uid();
$$;

-- ---- teams ----
create policy "teams_select" on public.teams
  for select using (true);

create policy "teams_insert" on public.teams
  for insert with check (auth.uid() is not null);

create policy "teams_update" on public.teams
  for update using (id = public.get_my_team_id());

-- ---- profiles ----
create policy "profiles_select" on public.profiles
  for select using (true);

create policy "profiles_insert" on public.profiles
  for insert with check (id = auth.uid());

create policy "profiles_update" on public.profiles
  for update using (id = auth.uid());

-- ---- posts ----
create policy "posts_select" on public.posts
  for select using (true);

create policy "posts_insert" on public.posts
  for insert with check (team_id = public.get_my_team_id());

create policy "posts_delete" on public.posts
  for delete using (team_id = public.get_my_team_id());

-- ---- follows ----
create policy "follows_select" on public.follows
  for select using (true);

create policy "follows_insert" on public.follows
  for insert with check (follower_team_id = public.get_my_team_id());

create policy "follows_delete" on public.follows
  for delete using (follower_team_id = public.get_my_team_id());

-- ============================================================
-- Signup helper: atomically create team + profile
-- Called from the client after Supabase Auth creates the user.
-- ============================================================
create or replace function public.create_team_and_profile(
  _user_id    uuid,
  _team_name  text,
  _team_handle text,
  _full_name  text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  _team_id uuid;
begin
  insert into public.teams (name, handle)
  values (_team_name, _team_handle)
  returning id into _team_id;

  insert into public.profiles (id, team_id, full_name)
  values (_user_id, _team_id, _full_name);

  return _team_id;
end;
$$;

-- Join an existing team
create or replace function public.join_team(
  _user_id   uuid,
  _team_id   uuid,
  _full_name text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (select 1 from public.teams where id = _team_id) then
    raise exception 'Team not found';
  end if;

  insert into public.profiles (id, team_id, full_name)
  values (_user_id, _team_id, _full_name);
end;
$$;
