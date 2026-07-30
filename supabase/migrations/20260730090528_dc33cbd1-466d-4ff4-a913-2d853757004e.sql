alter table public.orders
  add constraint orders_user_id_profiles_fkey
  foreign key (user_id) references public.profiles(id) on delete cascade;