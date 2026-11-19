import { CHALLENGE_TIERS } from '@/lib/challenge/types'
import { TRADEABLE_ASSETS } from '@/lib/api'

// Public copy reads its numbers from the same tiers the challenge engine grades against,
// so the marketing pages cannot drift from the rules in the app.
const base = CHALLENGE_TIERS.find((t) => t.phase2Rules) ?? CHALLENGE_TIERS[0]

export const PHASE1 = base.phase1Rules
export const PHASE2 = base.phase2Rules ?? base.phase1Rules
export const ACCOUNT_SIZES = CHALLENGE_TIERS.filter((t) => t.challengeType === '2-PHASE').map((t) => t.accountSize)
export const FREE_BALANCE = 100000
export const ASSETS = TRADEABLE_ASSETS

export const usd = (n: number) => `$${n.toLocaleString('en-US')}`
export const usdShort = (n: number) => (n >= 1000 ? `$${n / 1000}K` : usd(n))
