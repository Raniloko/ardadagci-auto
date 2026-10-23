-- Prices are now kept in AED (MKR's currency). The customer price is the MKR price plus a fixed
-- AED markup that depends on the price class; EUR is only a display conversion on the website.

-- Markup per price class: the last tier whose "fromAed" is <= the MKR daily price applies.
alter table public.site_settings
  add column markup_tiers jsonb not null default
    '[{"fromAed":0,"addAed":500},{"fromAed":1000,"addAed":650},{"fromAed":3000,"addAed":850},{"fromAed":6000,"addAed":1000}]'::jsonb
    check (jsonb_typeof(markup_tiers) = 'array' and jsonb_array_length(markup_tiers) between 1 and 10);

-- Fixed customer price per car in AED (replaces price_eur).
alter table public.car_overrides
  add column price_aed integer check (price_aed between 1 and 1000000);

-- Booking amounts in AED (replace price_per_day_eur / total_eur).
alter table public.bookings
  add column price_per_day_aed integer check (price_per_day_aed between 0 and 1000000),
  add column total_aed integer check (total_aed between 0 and 100000000);

-- Old EUR columns, removed once the AED version of the site is live.
alter table public.site_settings drop column markup_percent;
alter table public.car_overrides drop column price_eur;
alter table public.bookings drop column price_per_day_eur, drop column total_eur;
