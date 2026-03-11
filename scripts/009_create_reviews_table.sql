-- ==============================================================================
-- 009_create_reviews_table.sql
-- Creates the reviews table for equipment ratings and associated RLS policies
-- ==============================================================================

-- 1. Create the reviews table
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade unique,
  equipment_id uuid not null references public.equipment(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default now()
);

-- 2. Create indexes for common queries
create index reviews_equipment_id_idx on public.reviews(equipment_id);
create index reviews_reviewer_id_idx on public.reviews(reviewer_id);

-- 3. Enable RLS
alter table public.reviews enable row level security;

-- 4. Create Policies
-- Anyone can view reviews
create policy "reviews_select_public" 
  on public.reviews 
  for select 
  using (true);

-- Only authenticated renters with a paid booking can insert a review
create policy "reviews_insert_farmer" 
  on public.reviews 
  for insert 
  with check (
    auth.uid() = reviewer_id and
    exists (
      select 1 from public.bookings
      where id = booking_id 
        and renter_id = auth.uid()
        and payment_status = 'paid'
    )
  );

-- ==============================================================================
-- END OF SCRIPT
-- ==============================================================================
