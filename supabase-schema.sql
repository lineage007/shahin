-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  balance_usdt DECIMAL DEFAULT 100000,
  total_trades INT DEFAULT 0,
  win_rate DECIMAL DEFAULT 0,
  pnl_total DECIMAL DEFAULT 0,
  pnl_percent DECIMAL DEFAULT 0,
  leaderboard_opt_in BOOLEAN DEFAULT FALSE,   -- user must explicitly opt in
  display_name TEXT,                           -- optional pseudonym for leaderboard
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Migration: add leaderboard_opt_in and display_name if upgrading existing schema
ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS leaderboard_opt_in BOOLEAN DEFAULT FALSE;
ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Trades table
CREATE TABLE IF NOT EXISTS trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('buy', 'sell')),
  amount DECIMAL NOT NULL CHECK (amount > 0),
  price DECIMAL NOT NULL CHECK (price > 0),
  total_usdt DECIMAL NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'completed'
);

-- Holdings table
CREATE TABLE IF NOT EXISTS holdings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  amount DECIMAL NOT NULL CHECK (amount >= 0),
  avg_buy_price DECIMAL NOT NULL CHECK (avg_buy_price > 0),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, symbol)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_timestamp ON trades(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_holdings_user_id ON holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_pnl_percent ON portfolios(pnl_percent DESC);

-- Enable Row Level Security
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;

-- Portfolios policies
CREATE POLICY "Users can view their own portfolio"
  ON portfolios FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own portfolio"
  ON portfolios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolio"
  ON portfolios FOR UPDATE
  USING (auth.uid() = user_id);

-- Trades policies
CREATE POLICY "Users can view their own trades"
  ON trades FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trades"
  ON trades FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Holdings policies
CREATE POLICY "Users can view their own holdings"
  ON holdings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own holdings"
  ON holdings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own holdings"
  ON holdings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own holdings"
  ON holdings FOR DELETE
  USING (auth.uid() = user_id);

-- Public leaderboard view — only opted-in rows are readable by anon/public callers.
-- CRITICAL FIX (2026-07-03): changed USING (true) → USING (leaderboard_opt_in = true)
-- to prevent all portfolio rows being exposed to unauthenticated callers.
-- See migrations/001_fix_rls_leaderboard_policy.sql for the incremental migration.
CREATE POLICY "Anyone can view leaderboard"
  ON portfolios FOR SELECT
  USING (leaderboard_opt_in = true);

-- ============================================================================
-- PROP CHALLENGE ENGINE (paper mode only)
-- ============================================================================

CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tier_id TEXT NOT NULL,
  phase SMALLINT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('PENDING_PAYMENT','PENDING_ACCOUNT','ACTIVE','PASSED','FAILED','PAUSED','CANCELLED','FUNDED','CLOSED','UPGRADED')),

  -- Financial state
  initial_balance DECIMAL NOT NULL,
  current_equity DECIMAL NOT NULL,
  peak_equity DECIMAL NOT NULL,
  daily_start_equity DECIMAL NOT NULL,

  -- Progress
  trading_days_count INT NOT NULL DEFAULT 0,
  last_trade_date DATE,  -- tracks last calendar day a trade was placed; NULL = no trade yet
  start_date TIMESTAMP NOT NULL DEFAULT NOW(),
  expiry_date TIMESTAMP NOT NULL,

  -- Outcome
  failure_reason TEXT,
  passed_at TIMESTAMP,
  failed_at TIMESTAMP,

  -- Rules snapshot (frozen at challenge start)
  rules JSONB NOT NULL,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_challenges_user_id ON challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);

-- Row Level Security for challenges
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own challenges"
  ON challenges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own challenges"
  ON challenges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenges"
  ON challenges FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Function to automatically create portfolio on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.portfolios (user_id, balance_usdt, total_trades, win_rate, pnl_total, pnl_percent)
  VALUES (NEW.id, 100000, 0, 0, 0, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create portfolio on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
