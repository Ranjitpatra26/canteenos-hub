-- ENUMS
create type public.app_role as enum ('student','kitchen','admin');
create type public.order_status as enum ('placed','preparing','ready','completed','cancelled');
create type public.fulfilment_method as enum ('pickup','delivery');

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default 'Guest',
  email text,
  student_id text,
  department text,
  year text,
  phone text,
  avatar_url text,
  tint text not null default '124 70% 55%',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

-- USER ROLES
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('kitchen','admin'))
$$;

create policy "profiles_select_own_or_staff" on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_staff(auth.uid()));
create policy "profiles_insert_own" on public.profiles for insert to authenticated
  with check (id = auth.uid());
create policy "profiles_update_own_or_admin" on public.profiles for update to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(),'admin'))
  with check (id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "profiles_delete_admin" on public.profiles for delete to authenticated
  using (public.has_role(auth.uid(),'admin'));

create policy "user_roles_select_own_or_staff" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.is_staff(auth.uid()));
create policy "user_roles_admin_write" on public.user_roles for all to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

-- signup handler: profile + role
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
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    new.email,
    new.raw_user_meta_data->>'student_id',
    new.raw_user_meta_data->>'department',
    new.raw_user_meta_data->>'year'
  ) on conflict (id) do nothing;

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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- CATEGORIES
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  emoji text not null default '🍽️',
  tint text not null default '124 70% 55%',
  visible boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.categories to anon;
grant select, insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "categories_public_read" on public.categories for select using (true);
create policy "categories_admin_write" on public.categories for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger categories_updated before update on public.categories
  for each row execute function public.set_updated_at();

-- MENU ITEMS
create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  price numeric(10,2) not null default 0,
  category_id uuid references public.categories(id) on delete set null,
  image_url text,
  rating numeric(2,1) not null default 4.5,
  reviews int not null default 0,
  available boolean not null default true,
  prep_time_mins int not null default 10,
  emoji text not null default '🍽️',
  tint text not null default '124 70% 55%',
  veg boolean not null default true,
  calories int not null default 0,
  tags text[] not null default '{}',
  popularity int not null default 50,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.menu_items to anon;
grant select, insert, update, delete on public.menu_items to authenticated;
grant all on public.menu_items to service_role;
alter table public.menu_items enable row level security;
create policy "menu_public_read" on public.menu_items for select using (true);
create policy "menu_admin_write" on public.menu_items for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger menu_items_updated before update on public.menu_items
  for each row execute function public.set_updated_at();
create index menu_items_category_idx on public.menu_items(category_id);

-- COUPONS
create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text not null default '',
  type text not null default 'percent',
  value numeric(10,2) not null default 0,
  min_order numeric(10,2) not null default 0,
  uses int not null default 0,
  max_uses int not null default 1000,
  expires_at date,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.coupons to authenticated;
grant all on public.coupons to service_role;
alter table public.coupons enable row level security;
create policy "coupons_read_authenticated" on public.coupons for select to authenticated using (true);
create policy "coupons_admin_write" on public.coupons for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger coupons_updated before update on public.coupons
  for each row execute function public.set_updated_at();

-- ORDER CODE SEQUENCE
create sequence public.order_code_seq start 8400;

-- ORDERS
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default ('CO-' || nextval('public.order_code_seq')),
  user_id uuid not null references auth.users(id) on delete cascade,
  status public.order_status not null default 'placed',
  method public.fulfilment_method not null default 'pickup',
  counter text not null default 'Counter 1',
  note text,
  subtotal numeric(10,2) not null default 0,
  gst numeric(10,2) not null default 0,
  fee numeric(10,2) not null default 0,
  packaging numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  eta_mins int not null default 12,
  payment_method text not null default 'Campus Wallet',
  coupon_code text,
  placed_at timestamptz not null default now(),
  ready_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "orders_select_own_or_staff" on public.orders for select to authenticated
  using (user_id = auth.uid() or public.is_staff(auth.uid()));
create policy "orders_insert_own" on public.orders for insert to authenticated
  with check (user_id = auth.uid());
create policy "orders_update_own_or_staff" on public.orders for update to authenticated
  using (user_id = auth.uid() or public.is_staff(auth.uid()))
  with check (user_id = auth.uid() or public.is_staff(auth.uid()));
create policy "orders_delete_admin" on public.orders for delete to authenticated
  using (public.has_role(auth.uid(),'admin'));
create trigger orders_updated before update on public.orders
  for each row execute function public.set_updated_at();
create index orders_user_idx on public.orders(user_id);
create index orders_status_idx on public.orders(status);

-- ORDER ITEMS
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id uuid references public.menu_items(id) on delete set null,
  name text not null,
  emoji text not null default '🍽️',
  qty int not null default 1,
  price numeric(10,2) not null default 0,
  note text,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.order_items to authenticated;
grant all on public.order_items to service_role;
alter table public.order_items enable row level security;
create policy "order_items_select" on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_staff(auth.uid()))));
create policy "order_items_insert_own" on public.order_items for insert to authenticated
  with check (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "order_items_admin_write" on public.order_items for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create index order_items_order_idx on public.order_items(order_id);

-- FAVORITES
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  menu_item_id uuid not null references public.menu_items(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, menu_item_id)
);
grant select, insert, update, delete on public.favorites to authenticated;
grant all on public.favorites to service_role;
alter table public.favorites enable row level security;
create policy "favorites_own" on public.favorites for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ADDRESSES
create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default 'Hostel',
  detail text not null default '',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.addresses to authenticated;
grant all on public.addresses to service_role;
alter table public.addresses enable row level security;
create policy "addresses_own" on public.addresses for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- INVENTORY
create table public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sku text not null unique,
  category text not null default 'General',
  stock numeric(10,2) not null default 0,
  unit text not null default 'kg',
  reorder_at numeric(10,2) not null default 0,
  cost_per_unit numeric(10,2) not null default 0,
  supplier text not null default '',
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.inventory_items to authenticated;
grant all on public.inventory_items to service_role;
alter table public.inventory_items enable row level security;
create policy "inventory_staff_read" on public.inventory_items for select to authenticated
  using (public.is_staff(auth.uid()));
create policy "inventory_admin_write" on public.inventory_items for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger inventory_updated before update on public.inventory_items
  for each row execute function public.set_updated_at();

-- NOTIFICATIONS
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  body text not null default '',
  kind text not null default 'system',
  read boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;
create policy "notifications_select_own_or_broadcast" on public.notifications for select to authenticated
  using (user_id = auth.uid() or user_id is null);
create policy "notifications_update_own" on public.notifications for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "notifications_insert_staff_or_self" on public.notifications for insert to authenticated
  with check (user_id = auth.uid() or public.is_staff(auth.uid()));
create policy "notifications_admin_delete" on public.notifications for delete to authenticated
  using (public.has_role(auth.uid(),'admin'));
create index notifications_user_idx on public.notifications(user_id, created_at desc);

-- order status change -> notify the student
create or replace function public.notify_order_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status then
    insert into public.notifications (user_id, title, body, kind)
    values (
      new.user_id,
      'Order ' || new.code || ' is ' || new.status::text,
      case new.status
        when 'preparing' then 'The kitchen has started cooking your order.'
        when 'ready' then 'Your order is ready — show your QR code at the counter.'
        when 'completed' then 'Order handed over. Enjoy your meal!'
        when 'cancelled' then 'Your order was cancelled.'
        else 'Your order status changed.'
      end,
      'order'
    );
    if new.status = 'ready' then new.ready_at = now(); end if;
    if new.status = 'completed' then new.completed_at = now(); end if;
  end if;
  return new;
end; $$;
create trigger orders_notify_status before update on public.orders
  for each row execute function public.notify_order_status();

-- REALTIME
alter table public.orders replica identity full;
alter table public.order_items replica identity full;
alter table public.notifications replica identity full;
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.order_items;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.menu_items;