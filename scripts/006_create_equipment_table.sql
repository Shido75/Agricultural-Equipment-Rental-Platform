-- ==============================================================================
-- 006_create_equipment_table.sql
-- Creates the equipment table and associated RLS policies
-- ==============================================================================

-- 1. Create the equipment table
create table public.equipment (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  category text not null,
  price_per_day numeric(10, 2) not null,
  location text not null,
  image_url text,
  is_available boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. Create indexes for common queries
create index equipment_owner_id_idx on public.equipment(owner_id);
create index equipment_category_idx on public.equipment(category);
create index equipment_is_available_idx on public.equipment(is_available);

-- 3. Enable RLS
alter table public.equipment enable row level security;

-- 4. Create Policies
-- Anyone can view available equipment
create policy "equipment_select_public" 
  on public.equipment 
  for select 
  using (true);

-- Only authenticated users who are owners can insert their own equipment
create policy "equipment_insert_owner" 
  on public.equipment 
  for insert 
  with check (
    auth.uid() = owner_id and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'owner'
    )
  );

-- Only the owner of the equipment can update it
create policy "equipment_update_owner" 
  on public.equipment 
  for update 
  using (auth.uid() = owner_id);

-- Only the owner of the equipment can delete it
create policy "equipment_delete_owner" 
  on public.equipment 
  for delete 
  using (auth.uid() = owner_id);

-- 5. Add trigger for updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_equipment_updated_at
  before update on public.equipment
  for each row
  execute function public.set_updated_at();

-- ==============================================================================
-- END OF SCRIPT
-- ==============================================================================
