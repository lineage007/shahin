-- Migration 003 — Atomic trade execution Postgres functions
-- Date: 2026-07-03
-- Author: Portfolio audit fix wave
--
-- Problem (F3):
--   Client-side trade execution reads balance, checks it, then writes separately.
--   Concurrent requests can both pass the balance check before either update commits,
--   allowing virtual balance to go below zero.
--
-- Fix:
--   Two SECURITY DEFINER functions that do check-and-update atomically in a
--   single SQL statement. Called via supabase.rpc() from the server-side route.
--
-- Apply in Supabase SQL Editor for the shahin project (not Ledgable production).
-- NEVER apply to project ref dcemanhmabsjmkitskil.

-- ─── execute_buy_atomic ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.execute_buy_atomic(
  p_user_id   UUID,
  p_symbol    TEXT,
  p_amount    NUMERIC,
  p_price     NUMERIC,
  p_total_cost NUMERIC
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_portfolio  portfolios%ROWTYPE;
  v_holding    holdings%ROWTYPE;
  v_new_amount NUMERIC;
  v_new_avg    NUMERIC;
BEGIN
  -- Atomic balance deduction: only succeeds if balance sufficient
  UPDATE portfolios
  SET
    balance_usdt = balance_usdt - p_total_cost,
    total_trades = total_trades + 1
  WHERE user_id = p_user_id
    AND balance_usdt >= p_total_cost
  RETURNING * INTO v_portfolio;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient balance');
  END IF;

  -- Insert trade record
  INSERT INTO trades (user_id, symbol, type, amount, price, total_usdt, status)
  VALUES (p_user_id, p_symbol, 'buy', p_amount, p_price, p_total_cost, 'completed');

  -- Upsert holding
  SELECT * INTO v_holding
  FROM holdings
  WHERE user_id = p_user_id AND symbol = p_symbol;

  IF FOUND THEN
    v_new_amount := v_holding.amount + p_amount;
    v_new_avg    := (v_holding.avg_buy_price * v_holding.amount + p_price * p_amount) / v_new_amount;

    UPDATE holdings
    SET amount = v_new_amount, avg_buy_price = v_new_avg
    WHERE id = v_holding.id;
  ELSE
    INSERT INTO holdings (user_id, symbol, amount, avg_buy_price)
    VALUES (p_user_id, p_symbol, p_amount, p_price);
  END IF;

  RETURN json_build_object(
    'success',      true,
    'new_balance',  v_portfolio.balance_usdt,
    'total_trades', v_portfolio.total_trades
  );
END;
$$;

-- ─── execute_sell_atomic ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.execute_sell_atomic(
  p_user_id    UUID,
  p_symbol     TEXT,
  p_amount     NUMERIC,
  p_price      NUMERIC,
  p_total_value NUMERIC
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_holding   holdings%ROWTYPE;
  v_portfolio portfolios%ROWTYPE;
  v_profit    NUMERIC;
  v_new_amt   NUMERIC;
BEGIN
  -- Check holding exists and is sufficient (lock the row)
  SELECT * INTO v_holding
  FROM holdings
  WHERE user_id = p_user_id AND symbol = p_symbol
  FOR UPDATE;

  IF NOT FOUND OR v_holding.amount < p_amount THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient holding');
  END IF;

  v_profit  := (p_price - v_holding.avg_buy_price) * p_amount;
  v_new_amt := v_holding.amount - p_amount;

  -- Update or delete holding
  IF v_new_amt > 0 THEN
    UPDATE holdings SET amount = v_new_amt WHERE id = v_holding.id;
  ELSE
    DELETE FROM holdings WHERE id = v_holding.id;
  END IF;

  -- Atomic balance credit
  UPDATE portfolios
  SET
    balance_usdt = balance_usdt + p_total_value,
    total_trades = total_trades + 1
  WHERE user_id = p_user_id
  RETURNING * INTO v_portfolio;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Portfolio not found');
  END IF;

  -- Insert trade record
  INSERT INTO trades (user_id, symbol, type, amount, price, total_usdt, status)
  VALUES (p_user_id, p_symbol, 'sell', p_amount, p_price, p_total_value, 'completed');

  RETURN json_build_object(
    'success',      true,
    'new_balance',  v_portfolio.balance_usdt,
    'total_trades', v_portfolio.total_trades,
    'profit',       v_profit
  );
END;
$$;

-- Grant execute to authenticated and service roles
GRANT EXECUTE ON FUNCTION public.execute_buy_atomic TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.execute_sell_atomic TO authenticated, service_role;
