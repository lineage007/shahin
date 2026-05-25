'use client'

import { useEffect, useState } from 'react'
import { useAuth } from './AuthProvider'
import { getTrades, getHoldings } from '@/lib/trading'
import { ACHIEVEMENTS, computeEarnedAchievements } from '@/lib/achievements'

export function AchievementsPanel() {
  const { user } = useAuth()
  const [earnedIds, setEarnedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      try {
        const [trades, holdings] = await Promise.all([getTrades(user.id), getHoldings(user.id)])
        const avgBuyPrices: Record<string, number> = {}
        for (const h of holdings) {
          avgBuyPrices[h.symbol] = h.avg_buy_price
        }
        setEarnedIds(computeEarnedAchievements(trades, avgBuyPrices))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  if (loading) return null

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Achievements</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ACHIEVEMENTS.map((a) => {
          const earned = earnedIds.has(a.id)
          return (
            <div
              key={a.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition ${
                earned
                  ? 'border-yellow-500/40 bg-yellow-500/5'
                  : 'border-gray-700 opacity-40'
              }`}
            >
              <span className="text-2xl leading-none">{a.icon}</span>
              <div>
                <p className={`font-semibold text-sm ${earned ? 'text-yellow-400' : 'text-gray-400'}`}>
                  {a.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{a.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
