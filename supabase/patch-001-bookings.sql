-- Патч поверх уже применённого supabase/schema.sql — выполнить один раз в SQL Editor.

alter table bookings alter column client_id drop not null;
alter table bookings add column if not exists client_name text;
alter table bookings add column if not exists client_phone text;

drop policy if exists "profiles_select_via_booking" on profiles;
create policy "profiles_select_via_booking" on profiles for select using (
  exists (select 1 from bookings b where b.client_id = profiles.id and b.master_id = auth.uid())
);

drop policy if exists "bookings_insert_master" on bookings;
create policy "bookings_insert_master" on bookings for insert with check (auth.uid() = master_id);
