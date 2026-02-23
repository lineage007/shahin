'use client'

import { useState } from 'react'
import type { CoinData } from '@/lib/api'
import { TradingModal } from './TradingModal'

interface CoinCardProps {
  coin: CoinData
}

export function CoinCard({ coin }: CoinCardProps) {
  const [showModal, setShowModal] = useState(false)
  const isPositive = coin.price_change_percentage_24h >= 0

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 hover:border-blue-500 transition cursor-pointer"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <img src={coin.image} alt={coin.name} className="w-8 h-8" />
            <div>
              <p className="font-semibold">{coin.symbol.toUpperCase()}</p>
              <p className="text-xs text-gray-500">{coin.name}</p>
            </div>
          </div>
          <div
            className={`px-2 py-1 rounded text-sm font-semibold ${
              isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
            }`}
          >
            {isPositive ? '+' : ''}
            {coin.price_change_percentage_24h.toFixed(2)}%
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <p className="text-2xl font-bold">
              ${coin.current_price.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: coin.current_price < 1 ? 6 : 2,
              })}
            </p>
          </div>

          <div className="flex justify-between text-sm">
            <div>
              <p className="text-gray-500">Market Cap</p>
              <p className="font-semibold">
                ${(coin.market_cap / 1e9).toFixed(2)}B
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-500">Volume</p>
              <p className="font-semibold">
                ${(coin.total_volume / 1e9).toFixed(2)}B
              </p>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <TradingModal coin={coin} onClose={() => setShowModal(false)} />
      )}
    </>
  )
}
