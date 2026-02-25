-- FINAL Fix for the "infinite recursion" error in profiles RLS policies
-- Sometimes PostgreSQL "inlines" functions written in `language sql`, which strips them of 
-- their security definer context and causes the recursion again!
-- Using `language plpgsql` prevents this. We also check the JWT claim for an instant check!

-- 1. Drop the old recursive policy
drop policy if exists "profiles_select_admin" on public.profiles;

-- 2. Create a robust plpgsql function that cannot be inlined
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Fastest path: Check if they have the admin role in their JWT metadata
  if current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role' = 'admin' then
    return true;
  end if;

  -- Fallback: Check the profiles table safely (bypassing RLS)
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$;

-- 3. Re-create the policy
create policy "profiles_select_admin" on public.profiles 
  for select using (public.is_admin());
