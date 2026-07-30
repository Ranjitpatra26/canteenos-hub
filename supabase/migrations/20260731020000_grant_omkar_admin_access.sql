-- GRANT ADMIN ACCESS TO OMKAR CHOR (omkar.narsale24@sakec.ac.in)

-- 1. Update handle_new_user trigger function to grant admin role on signup for omkar.narsale24@sakec.ac.in
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  requested text := coalesce(new.raw_user_meta_data->>'role','student');
  granted public.app_role;
  admin_exists boolean;
begin
  insert into public.profiles (id, full_name, email, student_id, department, year)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', case when new.email = 'omkar.narsale24@sakec.ac.in' then 'Omkar Chor' else split_part(new.email,'@',1) end),
    new.email,
    new.raw_user_meta_data->>'student_id',
    new.raw_user_meta_data->>'department',
    new.raw_user_meta_data->>'year'
  ) on conflict (id) do update set
    full_name = coalesce(public.profiles.full_name, 'Omkar Chor'),
    email = EXCLUDED.email;

  select exists(select 1 from public.user_roles where role = 'admin') into admin_exists;

  if new.email = 'omkar.narsale24@sakec.ac.in' or (requested = 'admin' and not admin_exists) then
    granted := 'admin';
  elsif requested = 'kitchen' then
    granted := 'kitchen';
  else
    granted := 'student';
  end if;

  insert into public.user_roles (user_id, role) values (new.id, granted)
  on conflict do nothing;

  -- Ensure omkar.narsale24@sakec.ac.in also gets admin role if created as student initially
  if new.email = 'omkar.narsale24@sakec.ac.in' then
    insert into public.user_roles (user_id, role) values (new.id, 'admin')
    on conflict do nothing;
  end if;

  return new;
end; $$;

-- 2. Grant admin access for any existing user with email omkar.narsale24@sakec.ac.in in auth.users
do $$
declare
  target_user_id uuid;
begin
  select id into target_user_id from auth.users where email = 'omkar.narsale24@sakec.ac.in' limit 1;
  
  if target_user_id is not null then
    -- Update profile name
    update public.profiles set full_name = 'Omkar Chor' where id = target_user_id;

    -- Grant admin role
    insert into public.user_roles (user_id, role) values (target_user_id, 'admin')
    on conflict do nothing;
  end if;
end; $$;
