'use client'

import { useEffect, useState } from 'react'
import { fetchTopCoins, fetchFearGreedIndex, type CoinData, type FearGreedData } from '@/lib/api'
import { CoinCard } from './CoinCard'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'

export function MarketDashboard() {
  const [coins, setCoins] = useState<CoinData[]>([])
  const [fearGreed, setFearGreed] = useState<FearGreedData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const [coinsData, fgData] = await Promise.all([
        fetchTopCoins(50),
        fetchFearGreedIndex(),
      ])
      setCoins(coinsData)
      setFearGreed(fgData)
      setLoading(false)
    }

    loadData()

    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const topGainers = [...coins].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h).slice(0, 5)
  const topLosers = [...coins].sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h).slice(0, 5)
  const highestVolume = [...coins].sort((a, b) => b.total_volume - a.total_volume).slice(0, 5)

  const getFearGreedColor = (value: string) => {
    const num = parseInt(value)
    if (num < 25) return 'text-red-500'
    if (num < 45) return 'text-orange-500'
    if (num < 55) return 'text-yellow-500'
    if (num < 75) return 'text-green-400'
    return 'text-green-500'
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Live Markets</h1>
          <p className="text-gray-400">Real-time cryptocurrency data</p>
        </div>

        {fearGreed && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-400">Fear & Greed Index</p>
                <p className={`text-2xl font-bold ${getFearGreedColor(fearGreed.value)}`}>
                  {fearGreed.value}
                </p>
                <p className="text-xs text-gray-500">{fearGreed.value_classification}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <h2 className="text-lg font-semibold">Top Gainers (24h)</h2>
          </div>
          <div className="space-y-3">
            {topGainers.map((coin) => (
              <div key={coin.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={coin.image} alt={coin.name} className="w-6 h-6" />
                  <span className="font-medium">{coin.symbol.toUpperCase()}</span>
                </div>
                <span className="text-green-500 font-semibold">
                  +{coin.price_change_percentage_24h.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="h-5 w-5 text-red-500" />
            <h2 className="text-lg font-semibold">Top Losers (24h)</h2>
          </div>
          <div className="space-y-3">
            {topLosers.map((coin) => (
              <div key={coin.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={coin.image} alt={coin.name} className="w-6 h-6" />
                  <span className="font-medium">{coin.symbol.toUpperCase()}</span>
                </div>
                <span className="text-red-500 font-semibold">
                  {coin.price_change_percentage_24h.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold">Highest Volume</h2>
          </div>
          <div className="space-y-3">
            {highestVolume.map((coin) => (
              <div key={coin.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={coin.image} alt={coin.name} className="w-6 h-6" />
                  <span className="font-medium">{coin.symbol.toUpperCase()}</span>
                </div>
                <span className="text-gray-400 text-sm">
                  ${(coin.total_volume / 1e9).toFixed(2)}B
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All Coins */}
      <div>
        <h2 className="text-2xl font-bold mb-4">All Cryptocurrencies</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {coins.map((coin) => (
            <CoinCard key={coin.id} coin={coin} />
          ))}
        </div>
      </div>
    </div>
  )
}
