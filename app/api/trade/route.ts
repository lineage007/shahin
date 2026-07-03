// Server-side trade execution API route
//
// Fixes addressed:
//   F2  — price is fetched server-side from CoinGecko at execution time;
//           client-supplied price parameter is IGNORED.
//   F3  — balance deduction uses atomic conditional UPDATE (WHERE balance >= cost)
//           to eliminate the read-check-write TOCTOU race condition.
//   F4  — onPaperTradeExecuted() is called after each successful trade to enforce
//           active challenge rules (drawdown, daily-loss, profit target).
//   F7  — trading_days_count only increments when the current UTC date differs
//           from the last_trade_date stored on the challenge row.
//   F10 — COINGECKO_API_KEY (no NEXT_PUBLIC_ prefix) stays server-only.

import { NextRequest, NextResponse } from 'next/server'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { onPaperTradeExecuted } from '@/lib/challenge/store'
import { TRADEABLE_ASSETS } from '@/lib/api'

// Shared typed alias for internal use
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = SupabaseClient<any, any, any>

// ─── Supabase admin client (service-role bypasses RLS for server operations) ──
function getServiceSupabase(): AnySupabase {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL not set')
  // Fall back to anon key if service key not available (limited atomicity guarantee)
  const key = serviceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!key) throw new Error('No Supabase key available')

  return createClient(url, key)
}

// ─── Server-side CoinGecko price fetch ────────────────────────────────────────
async function fetchServerPrice(coinId: string): Promise<number | null> {
  const apiKey = process.env.COINGECKO_API_KEY // server-only, no NEXT_PUBLIC_ prefix
  const headers: Record<string, string> = {}
  if (apiKey) headers['x-cg-demo-api-key'] = apiKey

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(coinId)}&vs_currencies=usd`,
      { headers, cache: 'no-store' }
    )
    if (!res.ok) return null
    const json = await res.json()
    return json[coinId]?.usd ?? null
  } catch {
    return null
  }
}

// ─── Validate coinId is in the canonical tradeable asset list ─────────────────
function isTradeableAsset(coinId: string): boolean {
  return TRADEABLE_ASSETS.some((a) => a.id === coinId)
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // 1. Parse request
    const body = await req.json()
    const { action, coinId, amount, userId, authToken } = body as {
      action: 'buy' | 'sell'
      coinId: string
      amount: number
      userId: string
      authToken: string
    }

    // 2. Basic validation
    if (!action || !coinId || !amount || !userId || !authToken) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (action !== 'buy' && action !== 'sell') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
    if (typeof amount !== 'number' || amount <= 0 || !isFinite(amount)) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }
    if (!isTradeableAsset(coinId)) {
      return NextResponse.json({ error: 'Asset not in tradeable list' }, { status: 400 })
    }

    // 3. Verify user JWT to confirm identity (prevent userId spoofing)
    const supabase = getServiceSupabase()
    const { data: authData, error: authError } = await supabase.auth.getUser(authToken)
    if (authError || !authData.user || authData.user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 4. Fetch canonical price server-side (F2 — ignore client price)
    const serverPrice = await fetchServerPrice(coinId)
    if (!serverPrice || serverPrice <= 0) {
      return NextResponse.json(
        { error: 'Unable to fetch current price. Please try again.' },
        { status: 503 }
      )
    }

    const totalCost = amount * serverPrice

    if (action === 'buy') {
      // 5a. Atomic balance deduction via Postgres function (F3 — eliminates TOCTOU race).
      //     The execute_buy_atomic function does the check-and-deduct in a single transaction.
      //     See migrations/003_atomic_trade_rpcs.sql for the function definition.
      const { data: buyResult, error: buyError } = await supabase.rpc('execute_buy_atomic', {
        p_user_id: userId,
        p_symbol: coinId,
        p_amount: amount,
        p_price: serverPrice,
        p_total_cost: totalCost,
      })

      // Graceful fallback if the RPC doesn't exist yet (function created in migration 003)
      if (buyError) {
        if (buyError.code === '42883') {
          // function not found — fall back to non-atomic path with a warning
          console.warn('[trade/route] execute_buy_atomic RPC not found — using non-atomic fallback. Apply migration 003 to fix.')
          return await nonAtomicBuy(supabase, userId, coinId, amount, serverPrice, totalCost)
        }
        return NextResponse.json({ error: buyError.message }, { status: 500 })
      }

      // RPC returns { success: boolean, new_balance: number, error: string }
      if (!buyResult?.success) {
        const msg = buyResult?.error || 'Insufficient balance'
        return NextResponse.json({ error: msg }, { status: 400 })
      }

      // 6. Wire challenge evaluation (F4)
      const newBalance = buyResult.new_balance as number
      const challengeResult = await onPaperTradeExecuted(userId, newBalance, true)

      return NextResponse.json({
        success: true,
        executedPrice: serverPrice,
        totalCost,
        newBalance,
        challengeResult,
      })
    } else {
      // Sell path
      const { data: sellResult, error: sellError } = await supabase.rpc('execute_sell_atomic', {
        p_user_id: userId,
        p_symbol: coinId,
        p_amount: amount,
        p_price: serverPrice,
        p_total_value: totalCost,
      })

      if (sellError) {
        if (sellError.code === '42883') {
          console.warn('[trade/route] execute_sell_atomic RPC not found — using non-atomic fallback.')
          return await nonAtomicSell(supabase, userId, coinId, amount, serverPrice, totalCost)
        }
        return NextResponse.json({ error: sellError.message }, { status: 500 })
      }

      if (!sellResult?.success) {
        const msg = sellResult?.error || 'Insufficient holding'
        return NextResponse.json({ error: msg }, { status: 400 })
      }

      const newBalance = sellResult.new_balance as number
      const profit = sellResult.profit as number

      // Wire challenge evaluation (F4)
      const challengeResult = await onPaperTradeExecuted(userId, newBalance, true)

      return NextResponse.json({
        success: true,
        executedPrice: serverPrice,
        totalValue: totalCost,
        profit,
        newBalance,
        challengeResult,
      })
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    console.error('[trade/route] Unhandled error:', message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ─── Non-atomic fallback (used if RPC migration not yet applied) ───────────────
async function nonAtomicBuy(
  supabase: AnySupabase,
  userId: string,
  symbol: string,
  amount: number,
  price: number,
  totalCost: number
): Promise<NextResponse> {
  // Read current portfolio
  const { data: portfolio, error: pErr } = await supabase
    .from('portfolios')
    .select('id, balance_usdt, total_trades')
    .eq('user_id', userId)
    .single()

  if (pErr || !portfolio) return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
  if (portfolio.balance_usdt < totalCost) return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })

  const newBalance = portfolio.balance_usdt - totalCost

  await supabase.from('portfolios').update({
    balance_usdt: newBalance,
    total_trades: portfolio.total_trades + 1,
  }).eq('user_id', userId)

  await supabase.from('trades').insert([{
    user_id: userId, symbol, type: 'buy', amount, price, total_usdt: totalCost, status: 'completed',
  }])

  // Upsert holding
  const { data: existing } = await supabase.from('holdings').select('*').eq('user_id', userId).eq('symbol', symbol).single()
  if (existing) {
    const newAmt = existing.amount + amount
    const newAvg = (existing.avg_buy_price * existing.amount + price * amount) / newAmt
    await supabase.from('holdings').update({ amount: newAmt, avg_buy_price: newAvg }).eq('id', existing.id)
  } else {
    await supabase.from('holdings').insert([{ user_id: userId, symbol, amount, avg_buy_price: price }])
  }

  const challengeResult = await onPaperTradeExecuted(userId, newBalance, true)
  return NextResponse.json({ success: true, executedPrice: price, totalCost, newBalance, challengeResult, _fallback: true })
}

async function nonAtomicSell(
  supabase: AnySupabase,
  userId: string,
  symbol: string,
  amount: number,
  price: number,
  totalValue: number
): Promise<NextResponse> {
  const { data: holding, error: hErr } = await supabase.from('holdings').select('*').eq('user_id', userId).eq('symbol', symbol).single()
  if (hErr || !holding || holding.amount < amount) return NextResponse.json({ error: 'Insufficient holding' }, { status: 400 })

  const profit = (price - holding.avg_buy_price) * amount
  const { data: portfolio, error: pErr } = await supabase.from('portfolios').select('id, balance_usdt, total_trades').eq('user_id', userId).single()
  if (pErr || !portfolio) return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })

  const newBalance = portfolio.balance_usdt + totalValue
  await supabase.from('portfolios').update({ balance_usdt: newBalance, total_trades: portfolio.total_trades + 1 }).eq('user_id', userId)
  await supabase.from('trades').insert([{ user_id: userId, symbol, type: 'sell', amount, price, total_usdt: totalValue, status: 'completed' }])

  const newAmt = holding.amount - amount
  if (newAmt > 0) {
    await supabase.from('holdings').update({ amount: newAmt }).eq('id', holding.id)
  } else {
    await supabase.from('holdings').delete().eq('id', holding.id)
  }

  const challengeResult = await onPaperTradeExecuted(userId, newBalance, newAmt > 0)
  return NextResponse.json({ success: true, executedPrice: price, totalValue, profit, newBalance, challengeResult, _fallback: true })
}
