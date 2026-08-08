-- ============================================================
-- EcoReward — Supabase schema (Stage 2)
-- Run this in: Supabase Dashboard -> SQL Editor -> New query -> Run
-- ============================================================

-- 1. Profiles table (linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  phone text,
  email text,
  address text,
  lat double precision,
  lng double precision,
  user_type text default 'household',
  eco_points integer not null default 0,
  avatar_url text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select to authenticated using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id);

-- 2. Auto-create a profile row on signup (from signup metadata)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, phone, email, address, lat, lng, user_type)
  values (
    new.id,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'phone',
    new.email,
    new.raw_user_meta_data->>'address',
    nullif(new.raw_user_meta_data->>'lat', '')::double precision,
    nullif(new.raw_user_meta_data->>'lng', '')::double precision,
    coalesce(new.raw_user_meta_data->>'user_type', 'household')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Pickups table (used by pickup request/tracking stages)
create table if not exists public.pickups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  waste_types text[] not null default '{}',
  approx_weight_kg numeric,
  final_weight_kg numeric,
  pickup_date date,
  pickup_time text,
  photo_url text,
  lat double precision,
  lng double precision,
  address text,
  instructions text,
  status text not null default 'requested',
  -- requested | accepted | on_the_way | arrived | collected | processing | completed | cancelled
  points_earned integer default 0,
  collector_name text,
  vehicle_number text,
  created_at timestamptz default now()
);

alter table public.pickups enable row level security;

drop policy if exists "pickups_select_own" on public.pickups;
create policy "pickups_select_own" on public.pickups
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "pickups_insert_own" on public.pickups;
create policy "pickups_insert_own" on public.pickups
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "pickups_update_own" on public.pickups;
create policy "pickups_update_own" on public.pickups
  for update to authenticated using (auth.uid() = user_id);

-- ============================================================
-- TRANSACTIONS (eco wallet — Stage 5)
-- ============================================================
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null, -- earn | redeem
  points integer not null, -- positive for earn, negative for redeem
  title text not null,
  subtitle text,
  coupon_code text,
  created_at timestamptz default now()
);

alter table public.transactions enable row level security;

drop policy if exists "transactions_select_own" on public.transactions;
create policy "transactions_select_own" on public.transactions
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "transactions_insert_own" on public.transactions;
create policy "transactions_insert_own" on public.transactions
  for insert to authenticated with check (auth.uid() = user_id);

-- ============================================================
-- FEEDBACK (Stage 7)
-- ============================================================
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category text,
  rating integer,
  message text,
  created_at timestamptz default now()
);

alter table public.feedback enable row level security;

drop policy if exists "feedback_select_own" on public.feedback;
create policy "feedback_select_own" on public.feedback
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "feedback_insert_own" on public.feedback;
create policy "feedback_insert_own" on public.feedback
  for insert to authenticated with check (auth.uid() = user_id);
