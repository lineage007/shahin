// Challenge Engine — Core Rule Evaluation
// Implements Section 2 (Challenge Flow) and Section 3 (Rules Engine) from CHALLENGE-ENGINE-SPEC.md
// Paper mode only — no TradeLocker integration until ADGM authorisation

import type { Challenge, ChallengeRules, RuleEvaluationResult } from './types'

// ────────────────────────────────────────────────────────────
// Rule Evaluation
// ────────────────────────────────────────────────────────────

export function evaluateChallenge(
  challenge: Challenge,
  currentEquity: number,
  tradingDaysCount: number,
  dailyStartEquity: number,
  peakEquity: number
): RuleEvaluationResult {
  const rules = challenge.rules
  const initial = challenge.initialBalance

  // 1. Daily loss limit
  const dailyPnL = currentEquity - dailyStartEquity
  const dailyPnLPercent = (dailyPnL / dailyStartEquity) * 100
  if (dailyPnLPercent <= -rules.dailyLossLimitPercent) {
    return {
      passed: false,
      reason: 'DAILY_LOSS_LIMIT',
      action: 'CLOSE_ALL_AND_FAIL',
      metrics: buildMetrics(
        currentEquity,
        initial,
        dailyPnLPercent,
        peakEquity,
        tradingDaysCount,
        challenge.expiryDate
      ),
    }
  }

  // 2. Max drawdown
  const effectivePeak =
    rules.maxDrawdownType === 'trailing' ? peakEquity : initial
  const drawdownFromPeak =
    effectivePeak > 0
      ? ((effectivePeak - currentEquity) / effectivePeak) * 100
      : 0

  if (drawdownFromPeak >= rules.maxDrawdownPercent) {
    return {
      passed: false,
      reason: 'MAX_DRAWDOWN',
      action: 'CLOSE_ALL_AND_FAIL',
      metrics: buildMetrics(
        currentEquity,
        initial,
        dailyPnLPercent,
        peakEquity,
        tradingDaysCount,
        challenge.expiryDate
      ),
    }
  }

  // 3. Profit target + min trading days
  const profitPercent = ((currentEquity - initial) / initial) * 100
  if (
    profitPercent >= rules.profitTargetPercent &&
    tradingDaysCount >= rules.minTradingDays
  ) {
    return {
      passed: true,
      reason: 'PROFIT_TARGET_MET',
      action: 'PASS_CHALLENGE',
      metrics: buildMetrics(
        currentEquity,
        initial,
        dailyPnLPercent,
        peakEquity,
        tradingDaysCount,
        challenge.expiryDate
      ),
    }
  }

  // 4. Time limit
  const now = new Date()
  const expiry = new Date(challenge.expiryDate)
  if (now > expiry) {
    return {
      passed: false,
      reason: 'TIMEOUT',
      action: 'FAIL_CHALLENGE',
      metrics: buildMetrics(
        currentEquity,
        initial,
        dailyPnLPercent,
        peakEquity,
        tradingDaysCount,
        challenge.expiryDate
      ),
    }
  }

  // All checks pass — challenge ongoing
  return {
    passed: true,
    reason: 'ONGOING',
    action: 'CONTINUE',
    metrics: buildMetrics(
      currentEquity,
      initial,
      dailyPnLPercent,
      peakEquity,
      tradingDaysCount,
      challenge.expiryDate
    ),
  }
}

function buildMetrics(
  currentEquity: number,
  initialBalance: number,
  dailyPnLPercent: number,
  peakEquity: number,
  tradingDaysCount: number,
  expiryDate: string
) {
  const profitPercent = ((currentEquity - initialBalance) / initialBalance) * 100
  const drawdownFromPeak =
    peakEquity > 0
      ? ((peakEquity - currentEquity) / peakEquity) * 100
      : 0
  const now = new Date()
  const expiry = new Date(expiryDate)
  const daysRemaining = Math.max(
    0,
    Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  )
  return {
    profitPercent,
    dailyPnLPercent,
    drawdownFromPeak,
    tradingDays: tradingDaysCount,
    daysRemaining,
  }
}

// ────────────────────────────────────────────────────────────
// Position-size gate
// Called before a trade is executed to enforce risk rules
// ────────────────────────────────────────────────────────────

export interface PositionCheckInput {
  tradeValueUsd: number        // USD value of the proposed position
  totalExposureUsd: number     // existing open positions in USD
  accountEquity: number        // current equity
  rules: ChallengeRules
}

export interface PositionCheckResult {
  allowed: boolean
  reason?: string
}

export function checkPositionRules(input: PositionCheckInput): PositionCheckResult {
  const { tradeValueUsd, totalExposureUsd, accountEquity, rules } = input

  const positionPct = (tradeValueUsd / accountEquity) * 100
  if (positionPct > rules.maxPositionSizePercent) {
    return {
      allowed: false,
      reason: `Position size ${positionPct.toFixed(1)}% exceeds limit of ${rules.maxPositionSizePercent}% per trade`,
    }
  }

  const newTotalExposurePct = ((totalExposureUsd + tradeValueUsd) / accountEquity) * 100
  if (newTotalExposurePct > rules.maxTotalExposurePercent) {
    return {
      allowed: false,
      reason: `Total exposure ${newTotalExposurePct.toFixed(1)}% would exceed limit of ${rules.maxTotalExposurePercent}%`,
    }
  }

  return { allowed: true }
}

// ────────────────────────────────────────────────────────────
// Weekend-holding check
// ────────────────────────────────────────────────────────────

export function isWeekendHoldingViolation(
  rules: ChallengeRules,
  hasOpenPositions: boolean
): boolean {
  if (!rules.allowWeekendHolding && hasOpenPositions) {
    const now = new Date()
    const day = now.getUTCDay()
    // Saturday = 6, Sunday = 0
    return day === 6 || day === 0
  }
  return false
}

// ────────────────────────────────────────────────────────────
// Phase progression: Phase 1 pass → auto-create Phase 2
// ────────────────────────────────────────────────────────────

export function buildPhase2Challenge(
  phase1: Challenge,
  phase2Rules: ChallengeRules,
  phase2MaxDays: number
): Omit<Challenge, 'id'> {
  const start = new Date()
  const expiry = new Date(start)
  expiry.setDate(expiry.getDate() + phase2MaxDays)

  return {
    userId: phase1.userId,
    tierId: phase1.tierId,
    phase: 2,
    status: 'ACTIVE',
    initialBalance: phase1.initialBalance,
    currentEquity: phase1.initialBalance,  // reset to initial for Phase 2
    peakEquity: phase1.initialBalance,
    dailyStartEquity: phase1.initialBalance,
    tradingDaysCount: 0,
    startDate: start.toISOString(),
    expiryDate: expiry.toISOString(),
    failureReason: null,
    passedAt: null,
    failedAt: null,
    rules: phase2Rules,
  }
}

// ────────────────────────────────────────────────────────────
// Scaling ladder (Section 6 from spec)
// ────────────────────────────────────────────────────────────

interface ScalingCriteria {
  currentAccountSize: number
  nextAccountSize: number
  requiredProfitPercent: number
  requiredMonths: number
  requiredConsistency: number
}

export const SCALING_LADDER: ScalingCriteria[] = [
  { currentAccountSize: 25000,  nextAccountSize: 50000,  requiredProfitPercent: 10, requiredMonths: 3, requiredConsistency: 0.75 },
  { currentAccountSize: 50000,  nextAccountSize: 100000, requiredProfitPercent: 15, requiredMonths: 3, requiredConsistency: 0.75 },
  { currentAccountSize: 100000, nextAccountSize: 200000, requiredProfitPercent: 20, requiredMonths: 6, requiredConsistency: 0.80 },
  { currentAccountSize: 200000, nextAccountSize: 500000, requiredProfitPercent: 25, requiredMonths: 6, requiredConsistency: 0.80 },
]

export function getNextScalingTier(currentSize: number): ScalingCriteria | null {
  return SCALING_LADDER.find((s) => s.currentAccountSize === currentSize) ?? null
}
