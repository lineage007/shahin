-- Migration 002 — Add last_trade_date to challenges for per-calendar-day counting
-- Date: 2026-07-03
-- Author: Portfolio audit fix wave
--
-- Problem:
--   trading_days_count is incremented on every paper trade, not once per calendar day.
--   A user can submit 5 trades within seconds and satisfy minTradingDays: 5,
--   bypassing the requirement for 5 distinct trading sessions.
--
-- Fix:
--   Add last_trade_date (DATE) column. The application only increments
--   trading_days_count when CURRENT_DATE != last_trade_date, then updates
--   last_trade_date to CURRENT_DATE.
--
-- Apply in Supabase SQL Editor for the shahin project.

ALTER TABLE challenges ADD COLUMN IF NOT EXISTS last_trade_date DATE;

-- Note: existing active challenges will have last_trade_date = NULL.
-- The application code treats NULL as "no trade yet recorded" and will
-- count the first trade as a new day (safe default).
