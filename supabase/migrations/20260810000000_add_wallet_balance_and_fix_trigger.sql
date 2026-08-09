-- Add wallet_balance, referral_code, and referred_by columns to profiles table
alter table public.profiles add column if not exists wallet_balance numeric not null default 100.00;
alter table public.profiles add column if not exists referral_code text;
alter table public.profiles add column if not exists referred_by text;

-- Update handle_new_user trigger function to set wallet_balance to 100, generate referral_code, and save metadata
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  requested text := coalesce(new.raw_user_meta_data->>'role','student');
  granted public.app_role;
  admin_exists boolean;
  gen_code text := 'CAMPUS-' || upper(substr(md5(random()::text), 1, 6));
begin
  insert into public.profiles (id, full_name, email, student_id, department, year, phone, wallet_balance, referral_code, referred_by)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    new.email,
    new.raw_user_meta_data->>'student_id',
    new.raw_user_meta_data->>'department',
    new.raw_user_meta_data->>'year',
    new.raw_user_meta_data->>'phone',
    100.00,
    gen_code,
    new.raw_user_meta_data->>'referred_by'
  ) on conflict (id) do update set
    full_name = coalesce(excluded.full_name, profiles.full_name),
    email = coalesce(excluded.email, profiles.email),
    referral_code = coalesce(profiles.referral_code, excluded.referral_code);

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

-- Create table to track claimed rewards in database per user so tasks cannot be repeated
create table if not exists public.claimed_rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id text not null,
  reward_amount numeric not null,
  claimed_at timestamptz not null default now(),
  unique (user_id, task_id)
);

grant select, insert on public.claimed_rewards to authenticated;
grant all on public.claimed_rewards to service_role;
alter table public.claimed_rewards enable row level security;

drop policy if exists "users_select_own_claimed_rewards" on public.claimed_rewards;
create policy "users_select_own_claimed_rewards" on public.claimed_rewards
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "users_insert_own_claimed_rewards" on public.claimed_rewards;
create policy "users_insert_own_claimed_rewards" on public.claimed_rewards
  for insert to authenticated with check (auth.uid() = user_id);

-- Create referrals table to track friend referrals and bonus payouts
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references auth.users(id) on delete cascade,
  referee_id uuid references auth.users(id) on delete cascade,
  referee_name text,
  referee_email text,
  code text not null,
  reward_amount numeric not null default 50.00,
  status text not null default 'completed',
  created_at timestamptz not null default now()
);

grant select, insert on public.referrals to authenticated;
grant all on public.referrals to service_role;
alter table public.referrals enable row level security;

drop policy if exists "users_select_own_referrals" on public.referrals;
create policy "users_select_own_referrals" on public.referrals
  for select to authenticated using (auth.uid() = referrer_id or auth.uid() = referee_id);

drop policy if exists "users_insert_own_referrals" on public.referrals;
create policy "users_insert_own_referrals" on public.referrals
  for insert to authenticated with check (auth.uid() = referrer_id or auth.uid() = referee_id);

-- Atomic RPC function to claim a bonus task reward securely without duplicates
create or replace function public.claim_bonus_reward(p_task_id text, p_amount numeric)
returns numeric language plpgsql security definer set search_path = public as $$
declare
  v_user_id uuid := auth.uid();
  v_new numeric;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Check if reward has already been claimed in database
  if exists (select 1 from public.claimed_rewards where user_id = v_user_id and task_id = p_task_id) then
    raise exception 'Reward already claimed';
  end if;

  -- Ensure profile row exists
  insert into public.profiles (id, wallet_balance)
  values (v_user_id, 100.00)
  on conflict (id) do nothing;

  -- Record claim in database
  insert into public.claimed_rewards (user_id, task_id, reward_amount)
  values (v_user_id, p_task_id, p_amount);

  -- Credit reward to wallet_balance
  update public.profiles
  set wallet_balance = coalesce(wallet_balance, 100.00) + p_amount
  where id = v_user_id
  returning wallet_balance into v_new;

  return v_new;
end; $$;

grant execute on function public.claim_bonus_reward(text, numeric) to authenticated;
