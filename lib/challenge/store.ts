// Challenge Engine — Supabase persistence layer
// Paper mode only — challenges stored locally in Supabase, no TradeLocker calls

import { supabase } from '@/lib/supabase'
import type { Challenge, ChallengeStatus } from './types'
import { evaluateChallenge, isWeekendHoldingViolation } from './engine'

// ────────────────────────────────────────────────────────────
// CRUD
// ────────────────────────────────────────────────────────────

// Map Supabase snake_case row → camelCase Challenge object
function rowToChallenge(row: Record<string, unknown>): Challenge & { lastTradeDate?: string | null } {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    tierId: row.tier_id as string,
    phase: row.phase as 1 | 2,
    status: row.status as ChallengeStatus,
    initialBalance: row.initial_balance as number,
    currentEquity: row.current_equity as number,
    peakEquity: row.peak_equity as number,
    dailyStartEquity: row.daily_start_equity as number,
    tradingDaysCount: row.trading_days_count as number,
    lastTradeDate: (row.last_trade_date as string | null) ?? null,  // F7: per-day counting
    startDate: row.start_date as string,
    expiryDate: row.expiry_date as string,
    failureReason: row.failure_reason as Challenge['failureReason'],
    passedAt: row.passed_at as string | null,
    failedAt: row.failed_at as string | null,
    rules: row.rules as Challenge['rules'],
  }
}

export async function createChallenge(challenge: Omit<Challenge, 'id'>): Promise<Challenge> {
  const { data, error } = await supabase
    .from('challenges')
    .insert([{
      user_id: challenge.userId,
      tier_id: challenge.tierId,
      phase: challenge.phase,
      status: challenge.status,
      initial_balance: challenge.initialBalance,
      current_equity: challenge.currentEquity,
      peak_equity: challenge.peakEquity,
      daily_start_equity: challenge.dailyStartEquity,
      trading_days_count: challenge.tradingDaysCount,
      start_date: challenge.startDate,
      expiry_date: challenge.expiryDate,
      failure_reason: challenge.failureReason,
      passed_at: challenge.passedAt,
      failed_at: challenge.failedAt,
      rules: challenge.rules,
    }])
    .select()
    .single()
  if (error) throw error
  return rowToChallenge(data as Record<string, unknown>)
}

export async function getChallengesByUser(userId: string): Promise<Challenge[]> {
  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: false })
  if (error) throw error
  return (data || []).map((row: Record<string, unknown>) => rowToChallenge(row))
}

export async function getActiveChallenge(userId: string): Promise<Challenge | null> {
  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'ACTIVE')
    .order('start_date', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  return rowToChallenge(data as Record<string, unknown>)
}

export async function updateChallengeEquity(
  challengeId: string,
  currentEquity: number,
  peakEquity: number,
  tradingDaysCount: number,
  lastTradeDate?: string | null
): Promise<void> {
  const { error } = await supabase
    .from('challenges')
    .update({
      current_equity: currentEquity,
      peak_equity: Math.max(peakEquity, currentEquity),
      trading_days_count: tradingDaysCount,
      ...(lastTradeDate !== undefined ? { last_trade_date: lastTradeDate } : {}),
    })
    .eq('id', challengeId)
  if (error) throw error
}

export async function failChallenge(challengeId: string, reason: string): Promise<void> {
  const { error } = await supabase
    .from('challenges')
    .update({
      status: 'FAILED' as ChallengeStatus,
      failure_reason: reason,
      failed_at: new Date().toISOString(),
    })
    .eq('id', challengeId)
  if (error) throw error
}

export async function passChallenge(challengeId: string): Promise<void> {
  const { error } = await supabase
    .from('challenges')
    .update({
      status: 'PASSED' as ChallengeStatus,
      passed_at: new Date().toISOString(),
    })
    .eq('id', challengeId)
  if (error) throw error
}

// ────────────────────────────────────────────────────────────
// Trade hook: run rule evaluation after each paper trade
// ────────────────────────────────────────────────────────────

export async function onPaperTradeExecuted(
  userId: string,
  newEquity: number,
  hasOpenPositions: boolean
): Promise<{ action: string; reason?: string }> {
  const challenge = await getActiveChallenge(userId) as (Challenge & { lastTradeDate?: string | null }) | null
  if (!challenge) return { action: 'NO_CHALLENGE' }

  // F7 — increment trading_days_count only when today is a new calendar day
  const todayUtc = new Date().toISOString().slice(0, 10) // "YYYY-MM-DD"
  const isNewDay = !challenge.lastTradeDate || challenge.lastTradeDate !== todayUtc
  const newTradingDaysCount = challenge.tradingDaysCount + (isNewDay ? 1 : 0)
  const newLastTradeDate = isNewDay ? todayUtc : challenge.lastTradeDate

  const evaluation = evaluateChallenge(
    challenge,
    newEquity,
    newTradingDaysCount,
    challenge.dailyStartEquity,
    challenge.peakEquity
  )

  // Weekend holding check
  if (isWeekendHoldingViolation(challenge.rules, hasOpenPositions)) {
    await failChallenge(challenge.id, 'WEEKEND_HOLDING_VIOLATION')
    return { action: 'FAIL', reason: 'WEEKEND_HOLDING_VIOLATION' }
  }

  await updateChallengeEquity(
    challenge.id,
    newEquity,
    Math.max(challenge.peakEquity, newEquity),
    newTradingDaysCount,
    newLastTradeDate
  )

  if (evaluation.action === 'PASS_CHALLENGE') {
    await passChallenge(challenge.id)
    return { action: 'PASS', reason: evaluation.reason }
  }

  if (evaluation.action === 'FAIL_CHALLENGE' || evaluation.action === 'CLOSE_ALL_AND_FAIL') {
    await failChallenge(challenge.id, evaluation.reason)
    return { action: 'FAIL', reason: evaluation.reason }
  }

  return { action: 'CONTINUE', reason: evaluation.reason }
}
