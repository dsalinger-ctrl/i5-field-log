-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ── profiles ──────────────────────────────────────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  role        text not null default 'lead' check (role in ('admin','lead')),
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- All authenticated users can read profiles
create policy "profiles: authenticated read"
  on public.profiles for select
  using (auth.role() = 'authenticated');

-- Users can update their own profile (name only – not role)
create policy "profiles: own update"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Admins can update any profile (including role)
create policy "profiles: admin update"
  on public.profiles for update
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    case when new.email = 'dsalinger@i5design.com' then 'admin' else 'lead' end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── projects ──────────────────────────────────────────────────────────────────
create table public.projects (
  id            uuid primary key default gen_random_uuid(),
  name          text not null unique,
  target_ppmph  numeric not null default 0.65,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

alter table public.projects enable row level security;

-- All authenticated users can read projects
create policy "projects: authenticated read"
  on public.projects for select
  using (auth.role() = 'authenticated');

-- Only admins can insert/update/delete projects
create policy "projects: admin write"
  on public.projects for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ── log_entries ───────────────────────────────────────────────────────────────
create table public.log_entries (
  id              uuid primary key default gen_random_uuid(),
  entry_date      date not null,
  project_id      uuid not null references public.projects(id),
  men             integer not null check (men > 0),
  hours           numeric not null check (hours > 0),
  points          numeric not null check (points >= 0),
  man_hours       numeric generated always as (men * hours) stored,
  ppmph           numeric generated always as (points / nullif(men::numeric * hours, 0)) stored,
  points_per_man  numeric generated always as (points / nullif(men, 0)) stored,
  notes           text,
  logged_by       uuid not null references public.profiles(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.log_entries enable row level security;

-- All authenticated users can read entries
create policy "entries: authenticated read"
  on public.log_entries for select
  using (auth.role() = 'authenticated');

-- Leads and admins can insert (logged_by must be their own id)
create policy "entries: insert own"
  on public.log_entries for insert
  with check (auth.uid() = logged_by);

-- Leads can update/delete only their own entries
create policy "entries: lead own update"
  on public.log_entries for update
  using (
    auth.uid() = logged_by
    and not exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "entries: lead own delete"
  on public.log_entries for delete
  using (
    auth.uid() = logged_by
    and not exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Admins can update/delete any entry
create policy "entries: admin update"
  on public.log_entries for update
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "entries: admin delete"
  on public.log_entries for delete
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger log_entries_updated_at
  before update on public.log_entries
  for each row execute procedure public.set_updated_at();
