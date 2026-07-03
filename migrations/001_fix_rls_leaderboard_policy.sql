-- Migration 001 — Fix RLS policy conflict on portfolios table
-- Date: 2026-07-03
-- Author: Portfolio audit fix wave
--
-- Problem:
--   Two permissive SELECT policies on portfolios are OR-ed by Postgres.
--   The "Anyone can view leaderboard" policy uses USING (true), which means
--   any caller with the anon key can read ALL portfolio rows regardless of
--   leaderboard_opt_in. This exposes balance, P&L, win rate for every user.
--
-- Fix:
--   Replace USING (true) with USING (leaderboard_opt_in = true) so only
--   explicitly opted-in rows are publicly readable.
--
-- Apply in Supabase SQL Editor for the shahin project.
-- VERIFY: SELECT * FROM portfolios WHERE leaderboard_opt_in = false LIMIT 1
--   → should return 0 rows when called with the anon key (not authenticated).

-- Drop the overly-permissive policy
DROP POLICY IF EXISTS "Anyone can view leaderboard" ON portfolios;

-- Re-create it scoped to opted-in rows only
CREATE POLICY "Anyone can view leaderboard"
  ON portfolios FOR SELECT
  USING (leaderboard_opt_in = true);

-- Verification query (run as anon / unauthenticated to confirm):
-- SELECT count(*) FROM portfolios WHERE leaderboard_opt_in = false;
-- Expected result: 0 (anon key can no longer see private portfolios)
