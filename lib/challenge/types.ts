// Challenge Engine — Types
// Implements the 2-phase prop-firm structure from CHALLENGE-ENGINE-SPEC.md
// ALL trading in PAPER MODE — no real-money execution until ADGM authorisation

export type ChallengeType = '2-PHASE' | '1-PHASE' | 'INSTANT'

export type ChallengeStatus =
  | 'PENDING_PAYMENT'
  | 'PENDING_ACCOUNT'
  | 'ACTIVE'
  | 'PASSED'
  | 'FAILED'
  | 'PAUSED'
  | 'CANCELLED'
  | 'FUNDED'
  | 'CLOSED'
  | 'UPGRADED'

export type FailureReason =
  | 'DAILY_LOSS_LIMIT'
  | 'MAX_DRAWDOWN'
  | 'TIMEOUT'
  | 'RULE_VIOLATION'
  | 'POSITION_SIZE'
  | 'TOTAL_EXPOSURE'

export type MaxDrawdownType = 'static' | 'trailing'

export interface ChallengeRules {
  profitTargetPercent: number         // e.g. 8 for Phase 1, 5 for Phase 2
  minTradingDays: number              // minimum days before target counts
  dailyLossLimitPercent: number       // e.g. 5
  maxDrawdownPercent: number          // e.g. 10
  maxDrawdownType: MaxDrawdownType
  maxPositionSizePercent: number      // e.g. 5
  maxTotalExposurePercent: number     // e.g. 100
  allowWeekendHolding: boolean
  maxCalendarDays: number
  noOvernightSwaps: boolean
  spotOnly: boolean
}

export interface ChallengeTier {
  id: string
  name: string
  accountSize: number                 // USD virtual capital
  challengeType: ChallengeType
  baseFeeUsd: number
  phase1Rules: ChallengeRules
  phase2Rules: ChallengeRules | null  // null for 1-PHASE and INSTANT
  profitSplit: number                 // percentage to trader, e.g. 85
  maxLeverage: number
}

export interface Challenge {
  id: string
  userId: string
  tierId: string
  phase: 1 | 2
  status: ChallengeStatus
  initialBalance: number
  currentEquity: number
  peakEquity: number                  // for trailing drawdown
  dailyStartEquity: number            // reset each calendar day
  tradingDaysCount: number            // days with at least 1 trade
  startDate: string                   // ISO date
  expiryDate: string                  // ISO date
  failureReason: FailureReason | null
  passedAt: string | null
  failedAt: string | null
  rules: ChallengeRules
}

export interface RuleEvaluationResult {
  passed: boolean
  reason: string
  action: 'CONTINUE' | 'PASS_CHALLENGE' | 'FAIL_CHALLENGE' | 'CLOSE_ALL_AND_FAIL'
  metrics: {
    profitPercent: number
    dailyPnLPercent: number
    drawdownFromPeak: number
    tradingDays: number
    daysRemaining: number
  }
}

// The 5 standard challenge tiers (paper mode only)
export const CHALLENGE_TIERS: ChallengeTier[] = [
  {
    id: 'phase2-25k',
    name: '2-Phase $25K',
    accountSize: 25000,
    challengeType: '2-PHASE',
    baseFeeUsd: 199,
    profitSplit: 80,
    maxLeverage: 20,
  
    phase1Rules: {
      profitTargetPercent: 8,
      minTradingDays: 5,
      dailyLossLimitPercent: 5,
      maxDrawdownPercent: 10,
      maxDrawdownType: 'static',
      maxPositionSizePercent: 5,
      maxTotalExposurePercent: 100,
      allowWeekendHolding: false,
      maxCalendarDays: 30,

      noOvernightSwaps: false,
      spotOnly: false,
    },
    phase2Rules: {
      profitTargetPercent: 5,
      minTradingDays: 5,
      dailyLossLimitPercent: 5,
      maxDrawdownPercent: 10,
      maxDrawdownType: 'static',
      maxPositionSizePercent: 5,
      maxTotalExposurePercent: 100,
      allowWeekendHolding: false,
      maxCalendarDays: 60,

      noOvernightSwaps: false,
      spotOnly: false,
    },
  },
  {
    id: 'phase2-50k',
    name: '2-Phase $50K',
    accountSize: 50000,
    challengeType: '2-PHASE',
    baseFeeUsd: 349,
    profitSplit: 85,
    maxLeverage: 20,
  
    phase1Rules: {
      profitTargetPercent: 8,
      minTradingDays: 5,
      dailyLossLimitPercent: 5,
      maxDrawdownPercent: 10,
      maxDrawdownType: 'static',
      maxPositionSizePercent: 5,
      maxTotalExposurePercent: 100,
      allowWeekendHolding: false,
      maxCalendarDays: 30,

      noOvernightSwaps: false,
      spotOnly: false,
    },
    phase2Rules: {
      profitTargetPercent: 5,
      minTradingDays: 5,
      dailyLossLimitPercent: 5,
      maxDrawdownPercent: 10,
      maxDrawdownType: 'static',
      maxPositionSizePercent: 5,
      maxTotalExposurePercent: 100,
      allowWeekendHolding: false,
      maxCalendarDays: 60,

      noOvernightSwaps: false,
      spotOnly: false,
    },
  },
  {
    id: 'phase2-100k',
    name: '2-Phase $100K',
    accountSize: 100000,
    challengeType: '2-PHASE',
    baseFeeUsd: 549,
    profitSplit: 85,
    maxLeverage: 10,
  
    phase1Rules: {
      profitTargetPercent: 8,
      minTradingDays: 5,
      dailyLossLimitPercent: 5,
      maxDrawdownPercent: 10,
      maxDrawdownType: 'static',
      maxPositionSizePercent: 5,
      maxTotalExposurePercent: 100,
      allowWeekendHolding: false,
      maxCalendarDays: 30,

      noOvernightSwaps: false,
      spotOnly: false,
    },
    phase2Rules: {
      profitTargetPercent: 5,
      minTradingDays: 5,
      dailyLossLimitPercent: 5,
      maxDrawdownPercent: 10,
      maxDrawdownType: 'static',
      maxPositionSizePercent: 5,
      maxTotalExposurePercent: 100,
      allowWeekendHolding: false,
      maxCalendarDays: 60,

      noOvernightSwaps: false,
      spotOnly: false,
    },
  },
  {
    id: 'phase2-200k',
    name: '2-Phase $200K',
    accountSize: 200000,
    challengeType: '2-PHASE',
    baseFeeUsd: 999,
    profitSplit: 90,
    maxLeverage: 10,
  
    phase1Rules: {
      profitTargetPercent: 8,
      minTradingDays: 5,
      dailyLossLimitPercent: 5,
      maxDrawdownPercent: 10,
      maxDrawdownType: 'static',
      maxPositionSizePercent: 5,
      maxTotalExposurePercent: 100,
      allowWeekendHolding: false,
      maxCalendarDays: 30,

      noOvernightSwaps: false,
      spotOnly: false,
    },
    phase2Rules: {
      profitTargetPercent: 5,
      minTradingDays: 5,
      dailyLossLimitPercent: 5,
      maxDrawdownPercent: 10,
      maxDrawdownType: 'static',
      maxPositionSizePercent: 5,
      maxTotalExposurePercent: 100,
      allowWeekendHolding: false,
      maxCalendarDays: 60,

      noOvernightSwaps: false,
      spotOnly: false,
    },
  },
]
