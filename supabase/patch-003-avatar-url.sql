-- Патч: добавляет avatar_url в публичную вьюху master_public.
-- Выполнить один раз в SQL Editor.

drop view if exists master_public;

create view master_public
with (security_invoker = true) as
select
  mp.id,
  p.full_name as name,
  p.avatar_url,
  mp.specialization,
  mp.city,
  mp.district,
  mp.bio,
  mp.price_from,
  mp.is_verified,
  mp.member_since,
  mp.hue,
  coalesce(avg(r.rating), 0)::numeric(2,1) as rating,
  count(r.id) as reviews_count,
  (select count(*) from bookings b where b.master_id = mp.id) as bookings_count
from master_profiles mp
join profiles p on p.id = mp.id
left join reviews r on r.master_id = mp.id
group by mp.id, p.full_name, p.avatar_url, mp.specialization, mp.city, mp.district, mp.bio, mp.price_from, mp.is_verified, mp.member_since, mp.hue;
