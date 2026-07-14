-- Create scanner_configs table in Supabase
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS scanner_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key TEXT NOT NULL UNIQUE,
  market TEXT DEFAULT 'Nifty 50',
  timeframe TEXT DEFAULT '15min',
  interval INTEGER DEFAULT 60,
  strategy_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE scanner_configs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read/write their own configs
CREATE POLICY "Users can manage their own scanner configs" ON scanner_configs
  FOR ALL
  USING (api_key = current_setting('request.headers')::jsonb->>'x-api-key')
  WITH CHECK (api_key = current_setting('request.headers')::jsonb->>'x-api-key');

-- Create index on api_key for faster lookups
CREATE INDEX idx_scanner_configs_api_key ON scanner_configs(api_key);
CREATE INDEX idx_scanner_configs_updated_at ON scanner_configs(updated_at DESC);
