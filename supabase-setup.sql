-- YXNGJU V60.4 database bootstrap for Supabase (PostgreSQL)
-- Run in Supabase SQL Editor. Replace ADMIN_EMAIL with the dedicated admin Gmail.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  nickname text,
  avatar_url text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  is_blocked boolean not null default false
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null default 'owner' check (role in ('owner','admin','moderator')),
  created_at timestamptz not null default now()
);

create table if not exists public.login_events (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  email text,
  event_type text not null check (event_type in ('login','logout','signup','login_failed')),
  created_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  sender_name text not null,
  sender_email text not null,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create or replace function public.is_yxngju_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.admin_users a where a.user_id = auth.uid()); $$;

create or replace function public.handle_new_yxngju_user()
returns trigger language plpgsql security definer set search_path = public
as $$ begin
  insert into public.profiles(id,email,nickname) values(new.id, new.email, coalesce(new.raw_user_meta_data->>'nickname',''))
  on conflict (id) do update set email=excluded.email;
  return new;
end; $$;

drop trigger if exists on_auth_user_created_yxngju on auth.users;
create trigger on_auth_user_created_yxngju after insert or update of email on auth.users
for each row execute procedure public.handle_new_yxngju_user();

alter table public.profiles enable row level security;
alter table public.admin_users enable row level security;
alter table public.login_events enable row level security;
alter table public.contact_messages enable row level security;

drop policy if exists "profile read self or admin" on public.profiles;
create policy "profile read self or admin" on public.profiles for select to authenticated
using (id = auth.uid() or public.is_yxngju_admin());
drop policy if exists "profile update self or admin" on public.profiles;
create policy "profile update self or admin" on public.profiles for update to authenticated
using (id = auth.uid() or public.is_yxngju_admin()) with check (id = auth.uid() or public.is_yxngju_admin());
drop policy if exists "admin read own row" on public.admin_users;
create policy "admin read own row" on public.admin_users for select to authenticated using (user_id = auth.uid());
drop policy if exists "admin read login events" on public.login_events;
create policy "admin read login events" on public.login_events for select to authenticated using (public.is_yxngju_admin());
drop policy if exists "user insert own login events" on public.login_events;
create policy "user insert own login events" on public.login_events for insert to authenticated with check (user_id = auth.uid() and event_type in ('login','logout','signup'));
drop policy if exists "admin read messages" on public.contact_messages;
create policy "admin read messages" on public.contact_messages for select to authenticated using (public.is_yxngju_admin());
drop policy if exists "public submit contact" on public.contact_messages;
create policy "public submit contact" on public.contact_messages for insert to anon, authenticated with check (length(sender_name) between 1 and 100 and length(sender_email) between 5 and 254 and length(subject) between 1 and 160 and length(message) between 1 and 5000);

-- IMPORTANT: create the dedicated admin account through the site's Signup flow first.
-- Then run this INSERT once, replacing the address with that exact admin email.
insert into public.admin_users(user_id,email,role)
select id,email,'owner' from auth.users where lower(email)=lower('ADMIN_EMAIL')
on conflict (user_id) do update set email=excluded.email, role='owner';

-- Admin role changes must be performed from the Supabase SQL editor by the project owner.
-- Never expose the service_role key in browser code or GitHub.
