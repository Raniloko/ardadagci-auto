-- Additional admins: an existing admin creates a one-time invite code (valid 7 days, only its
-- SHA-256 hash is stored). The invited person registers on /admin with that code.

create table if not exists public.admin_invites (
  id uuid primary key default gen_random_uuid(),
  code_sha256 text not null unique,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_by uuid references auth.users (id) on delete set null,
  used_at timestamptz
);
alter table public.admin_invites enable row level security; -- no policies: only via the functions below

create or replace function public.normalize_admin_code(code text) returns text
language sql immutable set search_path = public, extensions as $$
  select encode(extensions.digest(regexp_replace(upper(coalesce(code, '')), '[^A-Z0-9]', '', 'g'), 'sha256'), 'hex');
$$;

-- Creates an invite and returns the plain code once (format XXXX-XXXX-XXXX, no 0/O/1/I).
create or replace function public.create_admin_invite() returns text
language plpgsql security definer set search_path = public, extensions as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  bytes bytea := extensions.gen_random_bytes(12);
  raw text := '';
begin
  if not public.is_admin() then
    raise exception 'not allowed';
  end if;
  if (select count(*) from public.admin_invites where used_at is null and expires_at > now()) >= 5 then
    raise exception 'Zu viele offene Einladungen – bitte zuerst eine widerrufen.';
  end if;
  for i in 0..11 loop
    raw := raw || substr(alphabet, (get_byte(bytes, i) % 32) + 1, 1);
  end loop;
  insert into public.admin_invites (code_sha256, created_by, expires_at)
  values (public.normalize_admin_code(raw), auth.uid(), now() + interval '7 days');
  return substr(raw, 1, 4) || '-' || substr(raw, 5, 4) || '-' || substr(raw, 9, 4);
end;
$$;

-- First admin: setup code while no admin exists. Later admins: an unused, unexpired invite.
create or replace function public.claim_admin(setup_code text) returns boolean
language plpgsql security definer set search_path = public, extensions as $$
declare
  code_hash text := public.normalize_admin_code(setup_code);
  invite_id uuid;
begin
  if auth.uid() is null then
    return false;
  end if;
  lock table public.admin_users in exclusive mode;
  if exists (select 1 from public.admin_users where user_id = auth.uid()) then
    return true;
  end if;
  if not exists (select 1 from public.admin_users) then
    if exists (select 1 from public.admin_setup where expires_at > now() and code_sha256 = code_hash) then
      insert into public.admin_users (user_id) values (auth.uid());
      delete from public.admin_setup where id = 1;
      return true;
    end if;
    return false;
  end if;
  update public.admin_invites set used_by = auth.uid(), used_at = now()
   where code_sha256 = code_hash and used_at is null and expires_at > now()
  returning id into invite_id;
  if invite_id is null then
    return false;
  end if;
  insert into public.admin_users (user_id) values (auth.uid());
  return true;
end;
$$;

create or replace function public.list_admins()
returns table (user_id uuid, email text, created_at timestamptz, is_me boolean)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'not allowed';
  end if;
  return query
    select a.user_id, u.email::text, a.created_at, a.user_id = auth.uid()
      from public.admin_users a join auth.users u on u.id = a.user_id
     order by a.created_at;
end;
$$;

create or replace function public.list_admin_invites()
returns table (id uuid, created_at timestamptz, expires_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'not allowed';
  end if;
  return query
    select i.id, i.created_at, i.expires_at from public.admin_invites i
     where i.used_at is null and i.expires_at > now()
     order by i.created_at desc;
end;
$$;

create or replace function public.revoke_admin_invite(invite_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'not allowed';
  end if;
  delete from public.admin_invites where id = invite_id and used_at is null;
end;
$$;

-- Removes admin rights (the account itself stays). You cannot remove yourself.
create or replace function public.remove_admin(target uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'not allowed';
  end if;
  if target = auth.uid() then
    raise exception 'Du kannst dich nicht selbst entfernen.';
  end if;
  delete from public.admin_users where user_id = target;
end;
$$;

revoke all on function public.normalize_admin_code(text) from public, anon, authenticated;
revoke all on function public.create_admin_invite() from public, anon;
revoke all on function public.claim_admin(text) from public, anon;
revoke all on function public.list_admins() from public, anon;
revoke all on function public.list_admin_invites() from public, anon;
revoke all on function public.revoke_admin_invite(uuid) from public, anon;
revoke all on function public.remove_admin(uuid) from public, anon;
grant execute on function public.create_admin_invite() to authenticated;
grant execute on function public.claim_admin(text) to authenticated;
grant execute on function public.list_admins() to authenticated;
grant execute on function public.list_admin_invites() to authenticated;
grant execute on function public.revoke_admin_invite(uuid) to authenticated;
grant execute on function public.remove_admin(uuid) to authenticated;
