-- Add wallet_balance column to profiles table if not present
alter table public.profiles add column if not exists wallet_balance numeric not null default 500.00;

-- Update handle_new_user trigger function to set wallet_balance and save user metadata correctly
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  requested text := coalesce(new.raw_user_meta_data->>'role','student');
  granted public.app_role;
  admin_exists boolean;
begin
  insert into public.profiles (id, full_name, email, student_id, department, year, phone, wallet_balance)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    new.email,
    new.raw_user_meta_data->>'student_id',
    new.raw_user_meta_data->>'department',
    new.raw_user_meta_data->>'year',
    new.raw_user_meta_data->>'phone',
    500.00
  ) on conflict (id) do update set
    full_name = coalesce(excluded.full_name, profiles.full_name),
    email = coalesce(excluded.email, profiles.email);

  select exists(select 1 from public.user_roles where role = 'admin') into admin_exists;

  if requested = 'admin' and not admin_exists then
    granted := 'admin';
  elsif requested = 'kitchen' then
    granted := 'kitchen';
  else
    granted := 'student';
  end if;

  insert into public.user_roles (user_id, role) values (new.id, granted)
  on conflict do nothing;
  return new;
end; $$;
