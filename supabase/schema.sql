-- Miora — схема базы данных, RLS-политики, триггеры и сиды каталога.
-- Выполнить целиком в Supabase Dashboard → SQL Editor → New query → Run.
-- Безопасно перезапускать: все объекты создаются с if not exists / on conflict.

-- ============================================================
-- 1. ENUM-типы
-- ============================================================
do $$ begin
  create type service_category as enum (
    'Маникюр', 'Брови и ресницы', 'Визаж', 'Стрижки и укладки', 'Косметология'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type user_role as enum ('client', 'master');
exception when duplicate_object then null; end $$;

do $$ begin
  create type booking_status as enum ('pending', 'confirmed', 'cancelled');
exception when duplicate_object then null; end $$;

-- ============================================================
-- 2. Таблицы
-- ============================================================

-- Профиль поверх auth.users. Для реальных пользователей id = auth.uid().
-- Для демо-мастеров (сиды) id — произвольный uuid, не привязанный к auth.users
-- (такие профили видны всем, но не редактируемы, пока не пройдёт регистрация).
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  role user_role not null default 'client',
  full_name text not null default '',
  phone text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists master_profiles (
  id uuid primary key references profiles(id) on delete cascade,
  specialization text not null default '',
  city text not null default '',
  district text not null default '',
  bio text not null default '',
  price_from int not null default 0,
  is_verified boolean not null default false,
  member_since text not null default to_char(now(), 'YYYY'),
  hue int not null default 340,
  cover_url text
);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  master_id uuid not null references master_profiles(id) on delete cascade,
  category service_category not null,
  title text not null,
  price int not null,
  duration_min int not null,
  online_booking boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists portfolio_items (
  id uuid primary key default gen_random_uuid(),
  master_id uuid not null references master_profiles(id) on delete cascade,
  category service_category,
  caption text not null default '',
  hue int not null default 340,
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  master_id uuid not null references master_profiles(id) on delete cascade,
  client_id uuid references profiles(id) on delete set null,
  author_name text not null,
  rating smallint not null check (rating between 1 and 5),
  text text not null default '',
  master_reply text,
  created_at timestamptz not null default now()
);

-- client_id может быть NULL: мастер вправе завести запись клиента без аккаунта
-- (пришёл по телефону) — тогда имя/телефон хранятся в client_name/client_phone.
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references profiles(id) on delete cascade,
  master_id uuid not null references master_profiles(id) on delete cascade,
  service_id uuid references services(id) on delete set null,
  service_title text not null,
  client_name text,
  client_phone text,
  price int not null,
  duration_min int not null,
  scheduled_at timestamptz not null,
  status booking_status not null default 'confirmed',
  comment text,
  created_at timestamptz not null default now()
);

create table if not exists client_notes (
  master_id uuid not null references master_profiles(id) on delete cascade,
  client_id uuid not null references profiles(id) on delete cascade,
  preferences text not null default '',
  notes text not null default '',
  updated_at timestamptz not null default now(),
  primary key (master_id, client_id)
);

create table if not exists favorites (
  client_id uuid not null references profiles(id) on delete cascade,
  master_id uuid not null references master_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (client_id, master_id)
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  master_id uuid not null references master_profiles(id) on delete cascade,
  label text not null,
  amount int not null,
  occurred_on date not null default current_date
);

-- Публичная витрина мастера с рейтингом, посчитанным из отзывов —
-- чтобы не хранить rating/reviews_count денормализованно.
create or replace view master_public
with (security_invoker = true) as
select
  mp.id,
  p.full_name as name,
  p.avatar_url,
  mp.cover_url,
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
group by mp.id, p.full_name, p.avatar_url, mp.cover_url, mp.specialization, mp.city, mp.district, mp.bio, mp.price_from, mp.is_verified, mp.member_since, mp.hue;

-- ============================================================
-- 3. Триггер: создаём profiles-строку при регистрации в auth.users
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'client'),
    new.raw_user_meta_data->>'phone'
  );

  if coalesce(new.raw_user_meta_data->>'role', 'client') = 'master' then
    insert into public.master_profiles (id, specialization, city, district)
    values (new.id, coalesce(new.raw_user_meta_data->>'specialization', ''), '', '');
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 4. Row Level Security
-- ============================================================
alter table profiles enable row level security;
alter table master_profiles enable row level security;
alter table services enable row level security;
alter table portfolio_items enable row level security;
alter table reviews enable row level security;
alter table bookings enable row level security;
alter table client_notes enable row level security;
alter table favorites enable row level security;
alter table expenses enable row level security;

drop policy if exists "profiles_select_own" on profiles;
create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
drop policy if exists "profiles_select_masters" on profiles;
create policy "profiles_select_masters" on profiles for select using (role = 'master');
drop policy if exists "profiles_select_via_booking" on profiles;
create policy "profiles_select_via_booking" on profiles for select using (
  exists (select 1 from bookings b where b.client_id = profiles.id and b.master_id = auth.uid())
);
drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

drop policy if exists "master_profiles_select_all" on master_profiles;
create policy "master_profiles_select_all" on master_profiles for select using (true);
drop policy if exists "master_profiles_update_own" on master_profiles;
create policy "master_profiles_update_own" on master_profiles for update using (auth.uid() = id);

drop policy if exists "services_select_all" on services;
create policy "services_select_all" on services for select using (true);
drop policy if exists "services_write_own" on services;
create policy "services_write_own" on services for all
  using (auth.uid() = master_id) with check (auth.uid() = master_id);

drop policy if exists "portfolio_select_all" on portfolio_items;
create policy "portfolio_select_all" on portfolio_items for select using (true);
drop policy if exists "portfolio_write_own" on portfolio_items;
create policy "portfolio_write_own" on portfolio_items for all
  using (auth.uid() = master_id) with check (auth.uid() = master_id);

drop policy if exists "reviews_select_all" on reviews;
create policy "reviews_select_all" on reviews for select using (true);
drop policy if exists "reviews_insert_client" on reviews;
create policy "reviews_insert_client" on reviews for insert with check (auth.uid() = client_id);
drop policy if exists "reviews_update_master_reply" on reviews;
create policy "reviews_update_master_reply" on reviews for update
  using (auth.uid() = master_id) with check (auth.uid() = master_id);

drop policy if exists "bookings_select_involved" on bookings;
create policy "bookings_select_involved" on bookings for select
  using (auth.uid() = client_id or auth.uid() = master_id);
drop policy if exists "bookings_insert_client" on bookings;
create policy "bookings_insert_client" on bookings for insert with check (auth.uid() = client_id);
drop policy if exists "bookings_insert_master" on bookings;
create policy "bookings_insert_master" on bookings for insert with check (auth.uid() = master_id);
drop policy if exists "bookings_update_involved" on bookings;
create policy "bookings_update_involved" on bookings for update
  using (auth.uid() = client_id or auth.uid() = master_id);
drop policy if exists "bookings_delete_involved" on bookings;
create policy "bookings_delete_involved" on bookings for delete
  using (auth.uid() = client_id or auth.uid() = master_id);

drop policy if exists "client_notes_master_only" on client_notes;
create policy "client_notes_master_only" on client_notes for all
  using (auth.uid() = master_id) with check (auth.uid() = master_id);

drop policy if exists "favorites_owner_only" on favorites;
create policy "favorites_owner_only" on favorites for all
  using (auth.uid() = client_id) with check (auth.uid() = client_id);

drop policy if exists "expenses_master_only" on expenses;
create policy "expenses_master_only" on expenses for all
  using (auth.uid() = master_id) with check (auth.uid() = master_id);

-- ============================================================
-- 5. Storage: бакет для портфолио
-- ============================================================
insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do nothing;

drop policy if exists "portfolio_public_read" on storage.objects;
create policy "portfolio_public_read" on storage.objects for select
  using (bucket_id = 'portfolio');

drop policy if exists "portfolio_owner_insert" on storage.objects;
create policy "portfolio_owner_insert" on storage.objects for insert
  with check (bucket_id = 'portfolio' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "portfolio_owner_update" on storage.objects;
create policy "portfolio_owner_update" on storage.objects for update
  using (bucket_id = 'portfolio' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'portfolio' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "portfolio_owner_delete" on storage.objects;
create policy "portfolio_owner_delete" on storage.objects for delete
  using (bucket_id = 'portfolio' and (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================================
-- 6. Сиды каталога (демо-мастера — публичные, не привязаны к auth.users)
-- ============================================================
insert into profiles (id, role, full_name) values
  ('11111111-1111-1111-1111-111111111101', 'master', 'Алина Ковалёва'),
  ('11111111-1111-1111-1111-111111111102', 'master', 'Диана Су'),
  ('11111111-1111-1111-1111-111111111103', 'master', 'Марго Реут'),
  ('11111111-1111-1111-1111-111111111104', 'master', 'Тимур Ахметов'),
  ('11111111-1111-1111-1111-111111111105', 'master', 'Ева Соснина'),
  ('11111111-1111-1111-1111-111111111106', 'master', 'Полина Гриц'),
  ('11111111-1111-1111-1111-111111111107', 'master', 'Сабина Юсупова'),
  ('11111111-1111-1111-1111-111111111108', 'master', 'Настя Орлова')
on conflict (id) do nothing;

insert into master_profiles (id, specialization, city, district, bio, price_from, is_verified, member_since, hue) values
  ('11111111-1111-1111-1111-111111111101', 'Мастер маникюра и педикюра', 'Москва', 'Пресня', 'Работаю с покрытием и укреплением ногтей 6 лет. Аккуратно, без спешки.', 2400, true, '2023', 350),
  ('11111111-1111-1111-1111-111111111102', 'Бровист, ламинирование бровей', 'Москва', 'Хамовники', 'Коррекция формы и ламинирование — подбираю форму под черты лица.', 1800, true, '2022', 28),
  ('11111111-1111-1111-1111-111111111103', 'Визажист', 'Санкт-Петербург', 'Петроградка', 'Дневной и вечерний макияж, съёмки.', 3500, true, '2024', 340),
  ('11111111-1111-1111-1111-111111111104', 'Барбер, мужские стрижки', 'Москва', 'Арбат', 'Классические и фейд-стрижки, оформление бороды.', 2000, true, '2021', 40),
  ('11111111-1111-1111-1111-111111111105', 'Косметолог, чистки и уходы', 'Москва', 'Сокол', 'Комбинированные чистки, уходовые протоколы под тип кожи.', 3200, true, '2023', 150),
  ('11111111-1111-1111-1111-111111111106', 'Мастер маникюра, nail-art', 'Москва', 'Бутово', 'Дизайн ногтей любой сложности.', 2100, false, '2025', 350),
  ('11111111-1111-1111-1111-111111111107', 'Стилист-парикмахер', 'Казань', 'Центр', 'Стрижки, окрашивание, укладки на любое событие.', 2800, true, '2022', 40),
  ('11111111-1111-1111-1111-111111111108', 'Лешмейкер, наращивание ресниц', 'Москва', 'Сокольники', 'Классика и объёмы, лёгкие материалы без утяжеления.', 2200, true, '2023', 28)
on conflict (id) do nothing;

insert into services (master_id, category, title, price, duration_min) values
  ('11111111-1111-1111-1111-111111111101', 'Маникюр', 'Маникюр с покрытием гель-лак', 2400, 90),
  ('11111111-1111-1111-1111-111111111101', 'Маникюр', 'Педикюр с покрытием', 3200, 100),
  ('11111111-1111-1111-1111-111111111101', 'Маникюр', 'Укрепление ногтей биогелем', 2800, 80),
  ('11111111-1111-1111-1111-111111111102', 'Брови и ресницы', 'Коррекция и окрашивание бровей', 1800, 40),
  ('11111111-1111-1111-1111-111111111102', 'Брови и ресницы', 'Ламинирование бровей', 2500, 60),
  ('11111111-1111-1111-1111-111111111103', 'Визаж', 'Дневной макияж', 3500, 60),
  ('11111111-1111-1111-1111-111111111103', 'Визаж', 'Вечерний макияж', 4800, 75),
  ('11111111-1111-1111-1111-111111111103', 'Визаж', 'Макияж для фотосъёмки', 5500, 90),
  ('11111111-1111-1111-1111-111111111104', 'Стрижки и укладки', 'Мужская стрижка', 2000, 45),
  ('11111111-1111-1111-1111-111111111104', 'Стрижки и укладки', 'Стрижка и борода', 2900, 70),
  ('11111111-1111-1111-1111-111111111105', 'Косметология', 'Комбинированная чистка лица', 3200, 90),
  ('11111111-1111-1111-1111-111111111105', 'Косметология', 'Уходовый протокол под тип кожи', 4100, 60),
  ('11111111-1111-1111-1111-111111111106', 'Маникюр', 'Маникюр с дизайном', 2100, 100),
  ('11111111-1111-1111-1111-111111111106', 'Маникюр', 'Наращивание ногтей', 3400, 130),
  ('11111111-1111-1111-1111-111111111107', 'Стрижки и укладки', 'Стрижка и укладка', 2800, 60),
  ('11111111-1111-1111-1111-111111111107', 'Стрижки и укладки', 'Окрашивание в один тон', 4500, 120),
  ('11111111-1111-1111-1111-111111111108', 'Брови и ресницы', 'Наращивание ресниц классика', 2200, 100),
  ('11111111-1111-1111-1111-111111111108', 'Брови и ресницы', 'Наращивание ресниц 2D объём', 2900, 120)
on conflict do nothing;

insert into portfolio_items (master_id, category, caption, hue) values
  ('11111111-1111-1111-1111-111111111101', 'Маникюр', 'Нюдовое покрытие', 350),
  ('11111111-1111-1111-1111-111111111101', 'Маникюр', 'Френч на удлинённой форме', 4),
  ('11111111-1111-1111-1111-111111111101', 'Маникюр', 'Минимализм с акцентом', 18),
  ('11111111-1111-1111-1111-111111111101', 'Маникюр', 'Ручная роспись', 32),
  ('11111111-1111-1111-1111-111111111102', 'Брови и ресницы', 'Естественный изгиб', 28),
  ('11111111-1111-1111-1111-111111111102', 'Брови и ресницы', 'Ламинирование', 42),
  ('11111111-1111-1111-1111-111111111102', 'Брови и ресницы', 'Объём 2D', 56),
  ('11111111-1111-1111-1111-111111111102', 'Брови и ресницы', 'Коррекция формы', 70),
  ('11111111-1111-1111-1111-111111111103', 'Визаж', 'Дневной образ', 340),
  ('11111111-1111-1111-1111-111111111103', 'Визаж', 'Вечерний макияж', 354),
  ('11111111-1111-1111-1111-111111111103', 'Визаж', 'Съёмочный образ', 8),
  ('11111111-1111-1111-1111-111111111103', 'Визаж', 'Свадебный визаж', 22),
  ('11111111-1111-1111-1111-111111111104', 'Стрижки и укладки', 'Фактурная стрижка', 40),
  ('11111111-1111-1111-1111-111111111104', 'Стрижки и укладки', 'Укладка на события', 54),
  ('11111111-1111-1111-1111-111111111104', 'Стрижки и укладки', 'Окрашивание балаяж', 68),
  ('11111111-1111-1111-1111-111111111104', 'Стрижки и укладки', 'Мужской фейд', 82),
  ('11111111-1111-1111-1111-111111111105', 'Косметология', 'До и после чистки', 150),
  ('11111111-1111-1111-1111-111111111105', 'Косметология', 'Уходовый протокол', 164),
  ('11111111-1111-1111-1111-111111111105', 'Косметология', 'Результат курса', 178),
  ('11111111-1111-1111-1111-111111111105', 'Косметология', 'Подготовка кожи', 192)
on conflict do nothing;

insert into reviews (master_id, author_name, rating, text, master_reply, created_at) values
  ('11111111-1111-1111-1111-111111111101', 'Марина', 5, 'Хожу третий месяц подряд — покрытие держится без сколов даже с моей работой руками.', null, now() - interval '9 days'),
  ('11111111-1111-1111-1111-111111111101', 'Оля', 5, 'Очень аккуратно и без боли обработала кутикулу.', 'Оля, спасибо! Жду вас на педикюр 🤍', now() - interval '19 days'),
  ('11111111-1111-1111-1111-111111111101', 'Настя К.', 4, 'Всё понравилось, единственное — задержалась запись на 15 минут.', null, now() - interval '31 days'),
  ('11111111-1111-1111-1111-111111111102', 'Валерия', 5, 'Впервые форма бровей идеально подошла под лицо.', null, now() - interval '6 days'),
  ('11111111-1111-1111-1111-111111111102', 'Ира', 5, 'Ламинирование держится ровно месяц, как и обещала.', null, now() - interval '20 days'),
  ('11111111-1111-1111-1111-111111111103', 'Соня', 5, 'Макияж продержался всю съёмку под софитами без правок.', null, now() - interval '3 days'),
  ('11111111-1111-1111-1111-111111111104', 'Игорь', 5, 'Лучший фейд в городе, хожу два года без замены мастера.', null, now() - interval '2 days'),
  ('11111111-1111-1111-1111-111111111105', 'Катя', 5, 'После курса чисток кожа реально стала ровнее.', null, now() - interval '7 days'),
  ('11111111-1111-1111-1111-111111111108', 'Аружан', 5, 'Объём держится почти три недели, ресницы не путаются.', null, now() - interval '4 days')
on conflict do nothing;

-- Add "Прочее" to service_category enum
do $$ begin
  alter type service_category add value 'Прочее';
exception when duplicate_object then null; end $$;
