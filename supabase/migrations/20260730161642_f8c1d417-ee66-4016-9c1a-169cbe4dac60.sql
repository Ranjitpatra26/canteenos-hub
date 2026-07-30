drop policy if exists "coupons_read_authenticated" on public.coupons;

create policy "coupons_read_valid_or_admin"
on public.coupons
for select
to authenticated
using (
  (active = true and (expires_at is null or expires_at >= current_date))
  or public.has_role(auth.uid(), 'admin'::app_role)
);