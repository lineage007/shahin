import { describe, expect, it } from 'vitest'
import { evaluateChallenge } from '../engine'
import { CHALLENGE_TIERS, type Challenge } from '../types'

const tier = CHALLENGE_TIERS[0]

function makeChallenge(overrides: Partial<Challenge> = {}): Challenge {
  const start = new Date()
  const expiry = new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000)
  return {
    id: 'c1',
    userId: 'u1',
    tierId: tier.id,
    phase: 1,
    status: 'ACTIVE',
    initialBalance: tier.accountSize,
    currentEquity: tier.accountSize,
    peakEquity: tier.accountSize,
    dailyStartEquity: tier.accountSize,
    tradingDaysCount: 0,
    startDate: start.toISOString(),
    expiryDate: expiry.toISOString(),
    failureReason: null,
    passedAt: null,
    failedAt: null,
    rules: tier.phase1Rules,
    ...overrides,
  }
}

describe('evaluateChallenge', () => {
  const size = tier.accountSize

  it('continues when no rule is breached', () => {
    const r = evaluateChallenge(makeChallenge(), size * 1.01, 1, size, size)
    expect(r.action).toBe('CONTINUE')
    expect(r.reason).toBe('ONGOING')
  })

  it('fails on the daily loss limit', () => {
    const r = evaluateChallenge(makeChallenge(), size * 0.95, 1, size, size)
    expect(r.passed).toBe(false)
    expect(r.reason).toBe('DAILY_LOSS_LIMIT')
    expect(r.action).toBe('CLOSE_ALL_AND_FAIL')
  })

  it('fails on max drawdown even when the daily loss is small', () => {
    // Equity drifted down over several days; today only -1%.
    const dayStart = size * 0.91
    const r = evaluateChallenge(makeChallenge(), size * 0.9, 3, dayStart, size)
    expect(r.reason).toBe('MAX_DRAWDOWN')
  })

  it('does not pass on profit target before the minimum trading days', () => {
    const equity = size * 1.09
    const early = evaluateChallenge(makeChallenge(), equity, tier.phase1Rules.minTradingDays - 1, equity, equity)
    expect(early.action).toBe('CONTINUE')

    const done = evaluateChallenge(makeChallenge(), equity, tier.phase1Rules.minTradingDays, equity, equity)
    expect(done.action).toBe('PASS_CHALLENGE')
    expect(done.reason).toBe('PROFIT_TARGET_MET')
  })

  it('fails on timeout once the expiry date has passed', () => {
    const past = new Date(Date.now() - 1000).toISOString()
    const r = evaluateChallenge(makeChallenge({ expiryDate: past }), size, 2, size, size)
    expect(r.reason).toBe('TIMEOUT')
    expect(r.action).toBe('FAIL_CHALLENGE')
  })
})

describe('CHALLENGE_TIERS', () => {
  it('has unique ids and sane rule values', () => {
    const ids = CHALLENGE_TIERS.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const t of CHALLENGE_TIERS) {
      expect(t.accountSize).toBeGreaterThan(0)
      expect(t.profitSplit).toBeGreaterThan(0)
      expect(t.profitSplit).toBeLessThanOrEqual(100)
      expect(t.phase1Rules.dailyLossLimitPercent).toBeLessThan(t.phase1Rules.maxDrawdownPercent)
    }
  })
})
