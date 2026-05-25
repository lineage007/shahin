'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { getChallengesByUser } from '@/lib/challenge/store'
import { evaluateChallenge } from '@/lib/challenge/engine'
import { CHALLENGE_TIERS } from '@/lib/challenge/types'
import type { Challenge, RuleEvaluationResult } from '@/lib/challenge/types'
import {
  Target, TrendingUp, TrendingDown, Clock, AlertTriangle, CheckCircle, XCircle
} from 'lucide-react'

function MetricBar({
  label,
  current,
  limit,
  inverse = false,    // inverse: higher is worse (drawdown)
}: {
  label: string
  current: number
  limit: number
  inverse?: boolean
}) {
  const pct = Math.min(100, Math.abs(current / limit) * 100)
  const danger = pct > 80

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className={danger ? 'text-red-400 font-semibold' : 'text-gray-300'}>
          {current.toFixed(2)}% / {limit}%
        </span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            danger ? 'bg-red-500' : inverse ? 'bg-orange-500' : 'bg-green-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: Challenge['status'] }) {
  const map: Record<string, { label: string; color: string }> = {
    ACTIVE: { label: 'Active', color: 'text-green-400 bg-green-400/10 border-green-400/30' },
    PASSED: { label: 'Passed', color: 'text-blue-400 bg-blue-400/10 border-blue-400/30' },
    FAILED: { label: 'Failed', color: 'text-red-400 bg-red-400/10 border-red-400/30' },
    FUNDED: { label: 'Funded', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' },
    PAUSED: { label: 'Paused', color: 'text-orange-400 bg-orange-400/10 border-orange-400/30' },
    CANCELLED: { label: 'Cancelled', color: 'text-gray-500 bg-gray-500/10 border-gray-500/30' },
    CLOSED: { label: 'Closed', color: 'text-gray-500 bg-gray-500/10 border-gray-500/30' },
  }
  const s = map[status] ?? map.CANCELLED
  return (
    <span className={`px-2 py-0.5 rounded border text-xs font-semibold ${s.color}`}>
      {s.label}
    </span>
  )
}

export function ChallengeDashboard() {
  const { user } = useAuth()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getChallengesByUser(user.id)
      .then(setChallenges)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  if (loading) return null

  const active = challenges.find((c) => c.status === 'ACTIVE')
  const history = challenges.filter((c) => c.status !== 'ACTIVE')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Prop Challenge</h1>
        <p className="text-gray-400">
          Paper-mode only. ADGM FSP application in progress — no real-money trading until authorisation.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-yellow-400/90">
          <p className="font-semibold mb-1">Simulated funded accounts only</p>
          <p>
            All challenge trading is paper (virtual) capital. Profit splits shown are indicative — they
            become real only after ADGM authorisation. Crypto markets are highly volatile and this is not
            financial advice.
          </p>
        </div>
      </div>

      {/* Active challenge */}
      {active ? (
        <ActiveChallengeCard challenge={active} />
      ) : (
        <TierSelector />
      )}

      {/* Challenge history */}
      {history.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Challenge History</h2>
          <div className="space-y-3">
            {history.map((c) => (
              <div
                key={c.id}
                className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={c.status} />
                    <span className="text-sm font-semibold">Phase {c.phase}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Started {new Date(c.startDate).toLocaleDateString()} — Account $
                    {c.initialBalance.toLocaleString()}
                  </p>
                  {c.failureReason && (
                    <p className="text-xs text-red-400 mt-1">Reason: {c.failureReason.replace(/_/g, ' ')}</p>
                  )}
                </div>
                <div className="text-right">
                  <p
                    className={`text-lg font-bold ${
                      c.currentEquity >= c.initialBalance ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {(((c.currentEquity - c.initialBalance) / c.initialBalance) * 100).toFixed(2)}%
                  </p>
                  <p className="text-xs text-gray-500">Final P&L</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ActiveChallengeCard({ challenge }: { challenge: Challenge }) {
  // Compute a live evaluation with current stored values
  const evaluation: RuleEvaluationResult = evaluateChallenge(
    challenge,
    challenge.currentEquity,
    challenge.tradingDaysCount,
    challenge.dailyStartEquity,
    challenge.peakEquity
  )

  const rules = challenge.rules
  const m = evaluation.metrics

  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-5 w-5 text-yellow-400" />
            <h2 className="text-xl font-bold">Phase {challenge.phase} Challenge</h2>
            <StatusBadge status={challenge.status} />
          </div>
          <p className="text-gray-400 text-sm">
            Account: ${challenge.initialBalance.toLocaleString()} virtual · Equity: $
            {challenge.currentEquity.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="text-right">
          <p className={`text-3xl font-bold ${m.profitPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {m.profitPercent >= 0 ? '+' : ''}
            {m.profitPercent.toFixed(2)}%
          </p>
          <p className="text-xs text-gray-500">vs {rules.profitTargetPercent}% target</p>
        </div>
      </div>

      {/* Progress bars */}
      <div className="space-y-3">
        <MetricBar
          label="Daily Loss"
          current={Math.abs(Math.min(0, m.dailyPnLPercent))}
          limit={rules.dailyLossLimitPercent}
          inverse
        />
        <MetricBar
          label="Max Drawdown"
          current={m.drawdownFromPeak}
          limit={rules.maxDrawdownPercent}
          inverse
        />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-gray-800/50 rounded-lg">
          <p className="text-2xl font-bold">{m.tradingDays}</p>
          <p className="text-xs text-gray-500">Trading days</p>
          <p className="text-xs text-gray-600">Min: {rules.minTradingDays}</p>
        </div>
        <div className="text-center p-3 bg-gray-800/50 rounded-lg">
          <p className="text-2xl font-bold">{m.daysRemaining}</p>
          <p className="text-xs text-gray-500">Days remaining</p>
          <p className="text-xs text-gray-600">Expires {new Date(challenge.expiryDate).toLocaleDateString()}</p>
        </div>
        <div className="text-center p-3 bg-gray-800/50 rounded-lg">
          <p className="text-2xl font-bold">{rules.profitTargetPercent}%</p>
          <p className="text-xs text-gray-500">Profit target</p>
          <p className="text-xs text-gray-600">{(m.profitPercent / rules.profitTargetPercent * 100).toFixed(0)}% there</p>
        </div>
      </div>

      {/* Rule violations warning */}
      {evaluation.action !== 'CONTINUE' && evaluation.action !== 'PASS_CHALLENGE' && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex gap-3">
          <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <div>
            <p className="text-red-400 font-semibold">Rule breach detected</p>
            <p className="text-sm text-red-400/80 mt-1">{evaluation.reason.replace(/_/g, ' ')}</p>
          </div>
        </div>
      )}

      {evaluation.action === 'PASS_CHALLENGE' && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex gap-3">
          <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
          <div>
            <p className="text-green-400 font-semibold">Challenge conditions met!</p>
            <p className="text-sm text-green-400/80 mt-1">
              You have hit your profit target over the minimum required trading days.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function TierSelector() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Choose a Challenge Tier</h2>
      <p className="text-sm text-gray-400">
        Fees shown are indicative for when ADGM authorisation is in place. All trading is currently
        paper (virtual) only and no payment is required or accepted.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CHALLENGE_TIERS.map((tier) => (
          <div
            key={tier.id}
            className="bg-gray-900/50 border border-gray-700 rounded-xl p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">{tier.name}</h3>
              <span className="text-yellow-400 font-bold">${tier.baseFeeUsd.toLocaleString()}</span>
            </div>
            <div className="space-y-1 text-sm text-gray-400">
              <p>Phase 1: {tier.phase1Rules.profitTargetPercent}% profit in {tier.phase1Rules.maxCalendarDays} days</p>
              {tier.phase2Rules && (
                <p>Phase 2: {tier.phase2Rules.profitTargetPercent}% profit in {tier.phase2Rules.maxCalendarDays} days</p>
              )}
              <p>Max drawdown: {tier.phase1Rules.maxDrawdownPercent}%</p>
              <p>Daily loss limit: {tier.phase1Rules.dailyLossLimitPercent}%</p>
              <p>Profit split: {tier.profitSplit}% to trader</p>
            </div>
            <div className="pt-2">
              <button
                disabled
                className="w-full py-2 bg-gray-700 text-gray-400 rounded-lg text-sm font-semibold cursor-not-allowed"
                title="Available after ADGM authorisation"
              >
                Available after ADGM authorisation
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
