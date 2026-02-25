-- ==============================================================================
-- AGRICULTURAL EQUIPMENT RENTAL PLATFORM - COMPLETE DATABASE SETUP
-- ==============================================================================
-- This script safely drops existing conflicting schema and creates tables, functions,
-- policies, triggers, and dummy data for the application in one go.
-- ==============================================================================

-- 1. CLEANUP (Drop existing objects if they exist)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user cascade;
drop table if exists public.bookings cascade;
drop table if exists public.profiles cascade;

-- ==============================================================================

-- 2. CREATE PROFILES TABLE
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  phone text not null,
  role text not null check (role in ('farmer', 'owner', 'admin')),
  farm_name text,
  farm_size_acres numeric(10, 2),
  farm_location text,
  crop_types text,
  business_name text,
  property_address text,
  equipment_count integer,
  service_area text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS for Profiles
alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles 
  for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles 
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles 
  for update using (auth.uid() = id);

-- Helper to avoid infinite recursion when checking admin status in RLS
-- Using plpgsql prevents Postgres from inlining the function and breaking the security definer context
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Best practice: Check the JWT first to avoid database queries entirely if possible
  if current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role' = 'admin' then
    return true;
  end if;

  -- Fallback to database check (with security definer bypassing RLS)
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$;

create policy "profiles_select_admin" on public.profiles 
  for select using (public.is_admin());

create index profiles_role_idx on public.profiles(role);
create index profiles_email_idx on public.profiles(email);

-- ==============================================================================

-- 3. CREATE BOOKINGS TABLE
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  equipment_name text not null,
  equipment_type text not null,
  rental_start_date date not null,
  rental_end_date date not null,
  total_cost numeric(10, 2) not null,
  booking_status text not null default 'confirmed',
  payment_status text not null default 'pending',
  renter_name text not null,
  renter_phone text not null,
  renter_location text not null,
  owner_name text not null,
  owner_phone text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint valid_booking_status check (booking_status in ('confirmed', 'delivered', 'completed', 'cancelled')),
  constraint valid_payment_status check (payment_status in ('pending', 'paid'))
);

-- Enable RLS for Bookings
alter table public.bookings enable row level security;

create policy "bookings_insert_public" on public.bookings for insert with check (true);
create policy "bookings_select_public" on public.bookings for select using (true);
create policy "bookings_update_public" on public.bookings for update using (true);

create index bookings_payment_status_idx on public.bookings(payment_status);
create index bookings_booking_status_idx on public.bookings(booking_status);
create index bookings_created_at_idx on public.bookings(created_at desc);

-- ==============================================================================

-- 4. CREATE USER ACCOUNT TRIGGER
-- This automatically creates a profile row when a new user signs up in auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id, 
    email, 
    full_name, 
    phone, 
    role,
    farm_name,
    farm_size_acres,
    farm_location,
    crop_types,
    business_name,
    property_address,
    equipment_count,
    service_area
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', 'User'),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'role', 'farmer'),
    new.raw_user_meta_data->>'farm_name',
    nullif(new.raw_user_meta_data->>'farm_size_acres', '')::numeric(10,2),
    new.raw_user_meta_data->>'farm_location',
    new.raw_user_meta_data->>'crop_types',
    new.raw_user_meta_data->>'business_name',
    new.raw_user_meta_data->>'property_address',
    nullif(new.raw_user_meta_data->>'equipment_count', '')::integer,
    new.raw_user_meta_data->>'service_area'
  )
  on conflict (id) do nothing;
  
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ==============================================================================

-- 5. SEED TEST BOOKINGS DATA (Optional)
-- Insert some sample bookings for testing the dashboard
insert into public.bookings (
  equipment_name, equipment_type, rental_start_date, rental_end_date, 
  total_cost, booking_status, payment_status, 
  renter_name, renter_phone, renter_location, 
  owner_name, owner_phone
) values 
(
  'John Deere 8R 310 Tractor', 'Tractor', current_date + interval '2 days', current_date + interval '5 days', 
  1200.00, 'confirmed', 'pending', 
  'Green Valley Farm', '+1234567890', 'Iowa, USA', 
  'Smith Equipment Rentals', '+1987654321'
),
(
  'Case IH Axial-Flow 8250', 'Harvester', current_date - interval '5 days', current_date - interval '2 days', 
  3500.00, 'completed', 'paid', 
  'Green Valley Farm', '+1234567890', 'Iowa, USA', 
  'Midwest Ag Supply', '+1122334455'
),
(
  'Kubota M7-172', 'Tractor', current_date + interval '10 days', current_date + interval '14 days', 
  800.00, 'confirmed', 'paid', 
  'Sunrise Acres', '+1555666777', 'Illinois, USA', 
  'Smith Equipment Rentals', '+1987654321'
);

-- ==============================================================================
-- END OF SCRIPT
-- ==============================================================================
