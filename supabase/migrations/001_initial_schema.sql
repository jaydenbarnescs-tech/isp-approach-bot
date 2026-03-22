-- ISP Approach Bot — Initial Schema
-- Migration: 001_initial_schema
-- Date: 2026-03-22

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- Table: users (営業担当者)
-- ============================================================
create table public.users (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text unique not null,
  role text not null default 'rep' check (role in ('rep', 'manager', 'admin')),
  slack_user_id text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.users is '営業担当者マスター';

-- ============================================================
-- Table: customers (顧客マスター — MVP: ダミーデータ50件)
-- ============================================================
create table public.customers (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  address text not null,
  phone text not null,
  email text,
  current_isp text not null,
  contract_speed text not null,
  contract_end_date date,
  monthly_cost integer not null default 0,
  building_type text not null default 'マンション' check (building_type in ('マンション', '戸建て', 'アパート', 'ビル')),
  approach_status text not null default '未着手' check (approach_status in ('未着手', '架電済', '商談中', '成約', '見送り')),
  priority_score integer not null default 0 check (priority_score between 0 and 100),
  last_contacted timestamptz,
  notes text,
  assigned_rep_id uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.customers is '顧客マスター（ISPアプローチ対象）';

create index idx_customers_status on public.customers(approach_status);
create index idx_customers_priority on public.customers(priority_score desc);
create index idx_customers_contract_end on public.customers(contract_end_date);
create index idx_customers_assigned_rep on public.customers(assigned_rep_id);

-- ============================================================
-- Table: call_logs (通話記録)
-- ============================================================
create table public.call_logs (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  rep_id uuid references public.users(id),
  channel text not null default 'phone' check (channel in ('phone', 'web', 'line', 'slack', 'whatsapp', 'other')),
  called_at timestamptz not null default now(),
  duration_seconds integer default 0,
  result text not null default '不在' check (result in ('成約', '検討中', '不在', '断り', '再架電', 'その他')),
  transcript text,
  audio_url text,
  summary text,
  next_action text,
  next_action_date date,
  created_at timestamptz not null default now()
);

comment on table public.call_logs is '通話記録・アプローチ履歴';

create index idx_call_logs_customer on public.call_logs(customer_id);
create index idx_call_logs_rep on public.call_logs(rep_id);
create index idx_call_logs_called_at on public.call_logs(called_at desc);

-- ============================================================
-- Table: scripts (生成済み営業スクリプト)
-- ============================================================
create table public.scripts (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  voice_id text not null default 'T7yYq3WpB94yAuOXraRi',
  voice_name text not null default 'Konoha',
  content text not null,
  audio_url text,
  status text not null default 'generated' check (status in ('generating', 'generated', 'approved', 'archived')),
  created_at timestamptz not null default now()
);

comment on table public.scripts is 'AI生成済み営業スクリプト';

create index idx_scripts_customer on public.scripts(customer_id);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
alter table public.users enable row level security;
alter table public.customers enable row level security;
alter table public.call_logs enable row level security;
alter table public.scripts enable row level security;

create policy "Authenticated users can read users" on public.users
  for select to authenticated using (true);
create policy "Authenticated users can read customers" on public.customers
  for select to authenticated using (true);
create policy "Authenticated users can update customers" on public.customers
  for update to authenticated using (true);
create policy "Authenticated users can read call_logs" on public.call_logs
  for select to authenticated using (true);
create policy "Authenticated users can insert call_logs" on public.call_logs
  for insert to authenticated with check (true);
create policy "Authenticated users can read scripts" on public.scripts
  for select to authenticated using (true);
create policy "Authenticated users can insert scripts" on public.scripts
  for insert to authenticated with check (true);

create policy "Service role full access users" on public.users for all to service_role using (true);
create policy "Service role full access customers" on public.customers for all to service_role using (true);
create policy "Service role full access call_logs" on public.call_logs for all to service_role using (true);
create policy "Service role full access scripts" on public.scripts for all to service_role using (true);

-- ============================================================
-- Updated_at trigger
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on public.users
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.customers
  for each row execute function public.handle_updated_at();
