-- AquaTracker server-side push notification schema
-- Safe to run inside an existing Supabase project because everything lives in the aquatracker schema.
-- Run with: supabase db push

create schema if not exists aquatracker;
grant usage on schema aquatracker to anon, authenticated, service_role;

create extension if not exists pgcrypto;

create table if not exists aquatracker.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  timezone text not null default 'UTC',
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists aquatracker.filters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  legacy_local_id text,
  name text not null,
  location text,
  stage text,
  filter_type text not null,
  brand text,
  model text,
  installed_date date not null,
  expected_lifetime_days integer not null check (expected_lifetime_days > 0),
  replacement_interval_months integer check (replacement_interval_months > 0),
  expected_replacement_date date not null,
  purchase_reminder_lead_days integer not null default 14 check (purchase_reminder_lead_days >= 0),
  replacement_status text not null default 'active' check (replacement_status in ('active', 'purchased', 'replaced', 'disabled')),
  purchased_at timestamptz,
  last_replaced_date date,
  cost numeric(10,2) default 0,
  notes text,
  reminders_enabled boolean not null default true,
  notification_settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, legacy_local_id)
);

create table if not exists aquatracker.filter_replacement_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  filter_id uuid references aquatracker.filters(id) on delete set null,
  legacy_local_id text,
  replaced_on date not null,
  cost numeric(10,2) default 0,
  notes text,
  log_type text not null default 'replacement',
  created_at timestamptz not null default now(),
  unique (user_id, legacy_local_id)
);

create table if not exists aquatracker.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  push_enabled boolean not null default true,
  email_enabled boolean not null default false,
  sms_enabled boolean not null default false,
  due_soon_days integer not null default 7 check (due_soon_days >= 0),
  overdue_cooldown_hours integer not null default 24 check (overdue_cooldown_hours >= 1),
  purchase_cooldown_hours integer not null default 168 check (purchase_cooldown_hours >= 1),
  quiet_hours_start time,
  quiet_hours_end time,
  fallback_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists aquatracker.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  is_active boolean not null default true,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, endpoint)
);

create table if not exists aquatracker.notification_delivery_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  filter_id uuid references aquatracker.filters(id) on delete cascade,
  push_subscription_id uuid references aquatracker.push_subscriptions(id) on delete set null,
  notification_type text not null check (notification_type in ('purchase-needed', 'due-soon', 'due-today', 'overdue')),
  target_date date not null,
  cycle_key text not null,
  dedupe_key text not null unique,
  title text not null,
  body text not null,
  channel text not null default 'web_push',
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed', 'skipped')),
  provider_response jsonb,
  error text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists aquatracker_filters_user_active_due_idx on aquatracker.filters (user_id, expected_replacement_date) where replacement_status in ('active', 'purchased');
create index if not exists aquatracker_push_subscriptions_user_active_idx on aquatracker.push_subscriptions (user_id) where is_active;
create index if not exists aquatracker_notification_delivery_lookup_idx on aquatracker.notification_delivery_log (user_id, filter_id, notification_type, target_date, status);

create or replace function aquatracker.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on aquatracker.profiles;
create trigger profiles_touch_updated_at before update on aquatracker.profiles
for each row execute function aquatracker.touch_updated_at();

drop trigger if exists filters_touch_updated_at on aquatracker.filters;
create trigger filters_touch_updated_at before update on aquatracker.filters
for each row execute function aquatracker.touch_updated_at();

drop trigger if exists notification_preferences_touch_updated_at on aquatracker.notification_preferences;
create trigger notification_preferences_touch_updated_at before update on aquatracker.notification_preferences
for each row execute function aquatracker.touch_updated_at();

create or replace function aquatracker.mark_filter_replaced(
  p_filter_id uuid,
  p_replaced_on date default current_date,
  p_cost numeric default 0,
  p_notes text default null
)
returns aquatracker.filters
language plpgsql
security definer
set search_path = aquatracker, public
as $$
declare
  updated_filter aquatracker.filters;
begin
  update aquatracker.filters
  set installed_date = p_replaced_on,
      last_replaced_date = p_replaced_on,
      expected_replacement_date = p_replaced_on + expected_lifetime_days,
      replacement_status = 'active',
      purchased_at = null,
      updated_at = now()
  where id = p_filter_id
    and user_id = auth.uid()
  returning * into updated_filter;

  if updated_filter.id is null then
    raise exception 'Filter not found or access denied';
  end if;

  insert into aquatracker.filter_replacement_logs (user_id, filter_id, replaced_on, cost, notes, log_type)
  values (auth.uid(), p_filter_id, p_replaced_on, coalesce(p_cost, 0), p_notes, 'replacement');

  return updated_filter;
end;
$$;

alter table aquatracker.profiles enable row level security;
alter table aquatracker.filters enable row level security;
alter table aquatracker.filter_replacement_logs enable row level security;
alter table aquatracker.notification_preferences enable row level security;
alter table aquatracker.push_subscriptions enable row level security;
alter table aquatracker.notification_delivery_log enable row level security;

drop policy if exists "profiles are user owned" on aquatracker.profiles;
create policy "profiles are user owned" on aquatracker.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "filters are user owned" on aquatracker.filters;
create policy "filters are user owned" on aquatracker.filters
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "replacement logs are user owned" on aquatracker.filter_replacement_logs;
create policy "replacement logs are user owned" on aquatracker.filter_replacement_logs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "preferences are user owned" on aquatracker.notification_preferences;
create policy "preferences are user owned" on aquatracker.notification_preferences
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "push subscriptions are user owned" on aquatracker.push_subscriptions;
create policy "push subscriptions are user owned" on aquatracker.push_subscriptions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "users can read notification history" on aquatracker.notification_delivery_log;
create policy "users can read notification history" on aquatracker.notification_delivery_log
  for select using (user_id = auth.uid());

grant select, insert, update, delete on all tables in schema aquatracker to authenticated;
grant usage, select on all sequences in schema aquatracker to authenticated;
