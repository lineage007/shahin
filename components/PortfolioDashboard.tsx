'use client'

import { useEffect, useState } from 'react'
import { useAuth } from './AuthProvider'
import { getPortfolio, getHoldings, getTrades } from '@/lib/trading'
import { fetchTopCoins, type CoinData } from '@/lib/api'
import type { Portfolio, Holding, Trade } from '@/lib/supabase'
import { Wallet, TrendingUp, TrendingDown, Activity } from 'lucide-react'

export function PortfolioDashboard() {
  const { user } = useAuth()
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [trades, setTrades] = useState<Trade[]>([])
  const [coins, setCoins] = useState<Record<string, CoinData>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    if (!user) return

    try {
      const [portfolioData, holdingsData, tradesData, coinsData] = await Promise.all([
        getPortfolio(user.id),
        getHoldings(user.id),
        getTrades(user.id),
        fetchTopCoins(50),
      ])

      setPortfolio(portfolioData)
      setHoldings(holdingsData)
      setTrades(tradesData)

      const coinsMap: Record<string, CoinData> = {}
      coinsData.forEach((coin) => {
        coinsMap[coin.id] = coin
      })
      setCoins(coinsMap)
    } catch (err) {
      console.error('Error loading portfolio:', err)
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

  if (!portfolio) return null

  const holdingsValue = holdings.reduce((sum, holding) => {
    const coin = coins[holding.symbol]
    if (!coin) return sum
    return sum + holding.amount * coin.current_price
  }, 0)

  const totalValue = portfolio.balance_usdt + holdingsValue

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Portfolio</h1>
        <p className="text-gray-400">Track your virtual trading performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="h-5 w-5 text-blue-500" />
            <p className="text-sm text-gray-400">Total Value</p>
          </div>
          <p className="text-3xl font-bold">${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-5 w-5 text-gray-400" />
            <p className="text-sm text-gray-400">Available Balance</p>
          </div>
          <p className="text-3xl font-bold">${portfolio.balance_usdt.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            {portfolio.pnl_percent >= 0 ? (
              <TrendingUp className="h-5 w-5 text-green-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-500" />
            )}
            <p className="text-sm text-gray-400">Total P&L</p>
          </div>
          <p className={`text-3xl font-bold ${portfolio.pnl_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {portfolio.pnl_percent >= 0 ? '+' : ''}
            {portfolio.pnl_percent.toFixed(2)}%
          </p>
          <p className={`text-sm ${portfolio.pnl_total >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            ${portfolio.pnl_total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-5 w-5 text-purple-500" />
            <p className="text-sm text-gray-400">Win Rate</p>
          </div>
          <p className="text-3xl font-bold">{portfolio.win_rate.toFixed(1)}%</p>
          <p className="text-sm text-gray-400">{portfolio.total_trades} trades</p>
        </div>
      </div>

      {/* Holdings */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Current Holdings</h2>
        {holdings.length === 0 ? (
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-400">No holdings yet. Start trading to see your positions here.</p>
          </div>
        ) : (
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Asset</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Amount</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Avg. Buy Price</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Current Price</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Value</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {holdings.map((holding) => {
                    const coin = coins[holding.symbol]
                    if (!coin) return null

                    const currentValue = holding.amount * coin.current_price
                    const costBasis = holding.amount * holding.avg_buy_price
                    const pnl = currentValue - costBasis
                    const pnlPercent = (pnl / costBasis) * 100

                    return (
                      <tr key={holding.id} className="hover:bg-gray-800/30">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={coin.image} alt={coin.name} className="w-8 h-8" />
                            <div>
                              <p className="font-semibold">{coin.symbol.toUpperCase()}</p>
                              <p className="text-sm text-gray-500">{coin.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-mono">
                          {holding.amount.toFixed(6)}
                        </td>
                        <td className="px-6 py-4 text-right font-mono">
                          ${holding.avg_buy_price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-right font-mono">
                          ${coin.current_price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-semibold">
                          ${currentValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className={pnl >= 0 ? 'text-green-500' : 'text-red-500'}>
                            <p className="font-semibold">
                              {pnl >= 0 ? '+' : ''}${pnl.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-sm">
                              {pnl >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                            </p>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Trade History */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Trade History</h2>
        {trades.length === 0 ? (
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-400">No trades yet. Start trading to see your history here.</p>
          </div>
        ) : (
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Asset</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Amount</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Price</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Total</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {trades.slice(0, 50).map((trade) => {
                    const coin = coins[trade.symbol]
                    return (
                      <tr key={trade.id} className="hover:bg-gray-800/30">
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {new Date(trade.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              trade.type === 'buy'
                                ? 'bg-green-500/10 text-green-500'
                                : 'bg-red-500/10 text-red-500'
                            }`}
                          >
                            {trade.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {coin && <img src={coin.image} alt={coin.name} className="w-6 h-6" />}
                            <span className="font-semibold">{trade.symbol.toUpperCase()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-mono">
                          {trade.amount.toFixed(6)}
                        </td>
                        <td className="px-6 py-4 text-right font-mono">
                          ${trade.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-semibold">
                          ${trade.total_usdt.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-400 text-sm capitalize">
                            {trade.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
