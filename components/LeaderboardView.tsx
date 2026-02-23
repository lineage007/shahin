'use client'

import { useEffect, useState } from 'react'
import { getLeaderboard } from '@/lib/trading'
import { Trophy, TrendingUp, Award } from 'lucide-react'

interface LeaderboardEntry {
  id: string
  user_id: string
  balance_usdt: number
  total_trades: number
  win_rate: number
  pnl_total: number
  pnl_percent: number
  user: {
    email: string
  }
}

export function LeaderboardView() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()

    // Refresh every 5 minutes
    const interval = setInterval(loadLeaderboard, 300000)
    return () => clearInterval(interval)
  }, [])

  const loadLeaderboard = async () => {
    try {
      const data = await getLeaderboard()
      setLeaderboard(data as any)
    } catch (err) {
      console.error('Error loading leaderboard:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-400" />
    if (rank === 2) return <Award className="h-6 w-6 text-gray-400" />
    if (rank === 3) return <Award className="h-6 w-6 text-amber-600" />
    return <span className="text-gray-500 font-bold">{rank}</span>
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="h-8 w-8 text-yellow-400" />
          <h1 className="text-3xl font-bold">Leaderboard</h1>
        </div>
        <p className="text-gray-400">Top traders ranked by performance</p>
      </div>

      {leaderboard.length === 0 ? (
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-400">No traders yet. Be the first!</p>
        </div>
      ) : (
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Trader</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Total P&L</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">P&L %</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Win Rate</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Total Trades</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {leaderboard.map((entry, index) => {
                  const rank = index + 1
                  const totalValue = entry.balance_usdt // Simplified for now
                  
                  return (
                    <tr
                      key={entry.id}
                      className={`hover:bg-gray-800/30 ${
                        rank <= 3 ? 'bg-gray-800/20' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center w-8">
                          {getRankIcon(rank)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                            {entry.user.email[0].toUpperCase()}
                          </div>
                          <span className="font-semibold">
                            {entry.user.email.split('@')[0]}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`font-semibold ${
                            entry.pnl_total >= 0 ? 'text-green-500' : 'text-red-500'
                          }`}
                        >
                          {entry.pnl_total >= 0 ? '+' : ''}$
                          {entry.pnl_total.toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {entry.pnl_percent >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
                          )}
                          <span
                            className={`font-semibold ${
                              entry.pnl_percent >= 0 ? 'text-green-500' : 'text-red-500'
                            }`}
                          >
                            {entry.pnl_percent >= 0 ? '+' : ''}
                            {entry.pnl_percent.toFixed(2)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-semibold">
                          {entry.win_rate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-gray-400">{entry.total_trades}</span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-semibold">
                        ${totalValue.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
        <p className="text-sm text-blue-400">
          💡 <strong>Tip:</strong> Leaderboard updates every 5 minutes. Keep trading to climb the ranks!
        </p>
      </div>
    </div>
  )
}
