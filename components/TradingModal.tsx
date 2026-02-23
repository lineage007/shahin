'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import type { CoinData } from '@/lib/api'
import { fetchOrderBook, type OrderBookData } from '@/lib/api'
import { TradingViewChart } from './TradingViewChart'
import { OrderBook } from './OrderBook'
import { TradeForm } from './TradeForm'
import { useAuth } from './AuthProvider'

interface TradingModalProps {
  coin: CoinData
  onClose: () => void
}

export function TradingModal({ coin, onClose }: TradingModalProps) {
  const { user } = useAuth()
  const [orderBook, setOrderBook] = useState<OrderBookData | null>(null)

  useEffect(() => {
    const loadOrderBook = async () => {
      const data = await fetchOrderBook(coin.symbol)
      setOrderBook(data)
    }

    loadOrderBook()
    const interval = setInterval(loadOrderBook, 5000)
    return () => clearInterval(interval)
  }, [coin.symbol])

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-7xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <img src={coin.image} alt={coin.name} className="w-10 h-10" />
            <div>
              <h2 className="text-2xl font-bold">{coin.name}</h2>
              <p className="text-gray-400">{coin.symbol.toUpperCase()}/USDT</p>
            </div>
            <div className="ml-4">
              <p className="text-3xl font-bold">
                ${coin.current_price.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: coin.current_price < 1 ? 6 : 2,
                })}
              </p>
              <p
                className={`text-sm font-semibold ${
                  coin.price_change_percentage_24h >= 0
                    ? 'text-green-500'
                    : 'text-red-500'
                }`}
              >
                {coin.price_change_percentage_24h >= 0 ? '+' : ''}
                {coin.price_change_percentage_24h.toFixed(2)}% (24h)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Left: Chart */}
          <div className="lg:col-span-2 space-y-6">
            <TradingViewChart symbol={coin.symbol} />
          </div>

          {/* Right: Order Book & Trading */}
          <div className="space-y-6">
            {orderBook && <OrderBook data={orderBook} />}
            {user && <TradeForm coin={coin} />}
          </div>
        </div>
      </div>
    </div>
  )
}
