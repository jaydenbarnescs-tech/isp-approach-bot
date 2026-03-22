-- ISP Approach Bot — Initial Schema
-- See docs/PRD.md for full data design

create extension if not exists "uuid-ossp";

create table public.users (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text unique not null,
  role text not null default 'rep',
  slack_user_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
  building_type text not null default 'mansion',
  approach_status text not null default 'new',
  priority_score integer not null default 50,
  last_contacted timestamptz,
  notes text,
  assigned_rep_id uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.call_logs (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  channel text not null default 'phone',
  called_at timestamptz not null default now(),
  duration_seconds integer default 0,
  result text not null default 'no_answer',
  transcript text,
  audio_url text,
  next_action text,
  next_action_date date,
  rep_id uuid references public.users(id),
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;
alter table public.customers enable row level security;
alter table public.call_logs enable row level security;
