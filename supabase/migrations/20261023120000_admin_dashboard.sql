-- ARDADAGCI admin dashboard: admins, site settings, per-car overrides and bookings.
-- Security model: everything is protected by Row Level Security. The public site may only
-- read settings/overrides and create new booking requests; every change requires is_admin().

create extension if not exists pgcrypto with schema extensions;

-- Admins ---------------------------------------------------------------------------------
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
drop policy if exists "admin reads own row" on public.admin_users;
create policy "admin reads own row" on public.admin_users for select to authenticated using (user_id = auth.uid());

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

-- One-time setup code (only its SHA-256 hash is stored). The first account that presents the
-- code becomes admin; afterwards the code is deleted and setup is closed.
create table if not exists public.admin_setup (
  id smallint primary key default 1 check (id = 1),
  code_sha256 text not null,
  expires_at timestamptz not null
);
alter table public.admin_setup enable row level security; -- no policies: not readable via the API

create or replace function public.admin_setup_open() returns boolean
language sql stable security definer set search_path = public as $$
  select not exists (select 1 from public.admin_users)
     and exists (select 1 from public.admin_setup where expires_at > now());
$$;

create or replace function public.claim_admin(setup_code text) returns boolean
language plpgsql security definer set search_path = public, extensions as $$
begin
  if auth.uid() is null then
    return false;
  end if;
  lock table public.admin_users in exclusive mode;
  if exists (select 1 from public.admin_users) then
    return exists (select 1 from public.admin_users where user_id = auth.uid());
  end if;
  if not exists (
    select 1 from public.admin_setup
    where expires_at > now()
      and code_sha256 = encode(extensions.digest(regexp_replace(upper(coalesce(setup_code, '')), '[^A-Z0-9]', '', 'g'), 'sha256'), 'hex')
  ) then
    return false;
  end if;
  insert into public.admin_users (user_id) values (auth.uid());
  delete from public.admin_setup where id = 1;
  return true;
end;
$$;

revoke all on function public.claim_admin(text) from public, anon;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.admin_setup_open() to anon, authenticated;
grant execute on function public.claim_admin(text) to authenticated;

create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Site settings (single row) -------------------------------------------------------------
create table if not exists public.site_settings (
  id smallint primary key default 1 check (id = 1),
  markup_percent numeric(6, 2) not null default 75 check (markup_percent between 0 and 500),
  aed_per_eur numeric(6, 3) not null default 4.25 check (aed_per_eur between 1 and 10),
  whatsapp_number text not null default '491726023003' check (whatsapp_number ~ '^[0-9]{6,15}$'),
  phone_number text not null default '+491726023003' check (phone_number ~ '^\+?[0-9 ]{6,20}$'),
  email text not null default '' check (email = '' or email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  tiktok_url text not null default 'https://www.tiktok.com/@ardaadagcii' check (tiktok_url = '' or tiktok_url ~ '^https://'),
  updated_at timestamptz not null default now()
);
insert into public.site_settings (id) values (1) on conflict (id) do nothing;
alter table public.site_settings enable row level security;
drop policy if exists "settings are public" on public.site_settings;
create policy "settings are public" on public.site_settings for select to anon, authenticated using (true);
drop policy if exists "admins update settings" on public.site_settings;
create policy "admins update settings" on public.site_settings for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop trigger if exists site_settings_touch on public.site_settings;
create trigger site_settings_touch before update on public.site_settings for each row execute function public.touch_updated_at();

-- Per-car overrides (null = use the imported MKR value) ----------------------------------
create table if not exists public.car_overrides (
  slug text primary key check (slug ~ '^[a-z0-9-]{1,80}$'),
  hidden boolean not null default false,
  available boolean not null default true,
  featured boolean,
  price_eur integer check (price_eur between 1 and 100000),
  name text check (char_length(name) between 1 and 80),
  category text check (category in ('Luxury', 'Sports', 'SUV', 'Exotic', 'Convertible', 'Economy')),
  mileage_limit_km integer check (mileage_limit_km between 0 and 10000),
  description_de text check (char_length(description_de) <= 8000),
  description_en text check (char_length(description_en) <= 8000),
  updated_at timestamptz not null default now()
);
alter table public.car_overrides enable row level security;
drop policy if exists "overrides are public" on public.car_overrides;
create policy "overrides are public" on public.car_overrides for select to anon, authenticated using (true);
drop policy if exists "admins manage overrides" on public.car_overrides;
create policy "admins manage overrides" on public.car_overrides for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop trigger if exists car_overrides_touch on public.car_overrides;
create trigger car_overrides_touch before update on public.car_overrides for each row execute function public.touch_updated_at();

-- Bookings -------------------------------------------------------------------------------
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'neu' check (status in ('neu', 'bestaetigt', 'abgeschlossen', 'storniert')),
  source text not null default 'website' check (source in ('website', 'admin')),
  car_slug text check (char_length(car_slug) <= 80),
  car_label text check (char_length(car_label) <= 160),
  start_date date,
  end_date date,
  customer_name text not null check (char_length(customer_name) between 1 and 120),
  customer_phone text not null check (char_length(customer_phone) between 3 and 40),
  location text check (char_length(location) <= 200),
  notes text check (char_length(notes) <= 2000),
  price_per_day_eur integer check (price_per_day_eur between 0 and 100000),
  total_eur integer check (total_eur between 0 and 10000000),
  admin_notes text check (char_length(admin_notes) <= 4000),
  language text check (language in ('de', 'en')),
  check (end_date is null or start_date is null or end_date >= start_date)
);
create index if not exists bookings_created_at_idx on public.bookings (created_at desc);
alter table public.bookings enable row level security;
drop policy if exists "anyone can request a booking" on public.bookings;
create policy "anyone can request a booking" on public.bookings for insert to anon, authenticated
  with check (status = 'neu' and source = 'website' and admin_notes is null);
drop policy if exists "admins read bookings" on public.bookings;
create policy "admins read bookings" on public.bookings for select to authenticated using (public.is_admin());
drop policy if exists "admins create bookings" on public.bookings;
create policy "admins create bookings" on public.bookings for insert to authenticated with check (public.is_admin());
drop policy if exists "admins update bookings" on public.bookings;
create policy "admins update bookings" on public.bookings for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins delete bookings" on public.bookings;
create policy "admins delete bookings" on public.bookings for delete to authenticated using (public.is_admin());
drop trigger if exists bookings_touch on public.bookings;
create trigger bookings_touch before update on public.bookings for each row execute function public.touch_updated_at();

-- Flood protection for the public booking form: at most 30 website requests per 10 minutes.
create or replace function public.limit_website_bookings() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.source = 'website' and (
    select count(*) from public.bookings where source = 'website' and created_at > now() - interval '10 minutes'
  ) >= 30 then
    raise exception 'Too many booking requests – please try again later' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
drop trigger if exists bookings_rate_limit on public.bookings;
create trigger bookings_rate_limit before insert on public.bookings for each row execute function public.limit_website_bookings();
revoke all on function public.limit_website_bookings() from public, anon, authenticated;

grant select on public.site_settings, public.car_overrides to anon, authenticated;
grant update on public.site_settings to authenticated;
grant insert, update, delete on public.car_overrides to authenticated;
grant insert on public.bookings to anon, authenticated;
grant select, update, delete on public.bookings to authenticated;
grant select on public.admin_users to authenticated;

-- The one-time setup code hash is inserted separately (never committed):
-- insert into public.admin_setup (code_sha256, expires_at) values ('<sha256 of code>', now() + interval '14 days');
