-- Run this in your Supabase SQL Editor

-- Strategies table
create table if not exists strategies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null,
  api_key text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Alerts history table
create table if not exists alerts (
  id uuid primary key default gen_random_uuid(),
  symbol text not null,
  price numeric,
  signal text,
  reason text,
  timeframe text,
  api_key text,
  strategy_id uuid references strategies(id) on delete set null,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_strategies_api_key on strategies(api_key);
create index if not exists idx_alerts_api_key on alerts(api_key);
create index if not exists idx_alerts_created_at on alerts(created_at desc);
create index if not exists idx_alerts_signal on alerts(signal);
