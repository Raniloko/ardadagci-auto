-- Auth e-mails (account confirmation, password reset) are sent by the app through Resend.
-- This log only exists for rate limiting; it stores a hash of the address, never the address itself.
create table if not exists public.auth_email_log (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('signup', 'recovery', 'test')),
  email_sha256 text not null,
  created_at timestamptz not null default now()
);
create index if not exists auth_email_log_lookup on public.auth_email_log (email_sha256, created_at desc);
alter table public.auth_email_log enable row level security; -- no policies: server (service role) only
