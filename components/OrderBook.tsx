'use client'

import type { OrderBookData } from '@/lib/api'

interface OrderBookProps {
  data: OrderBookData
}

export function OrderBook({ data }: OrderBookProps) {
  const maxBidVolume = Math.max(...data.bids.map(([_, qty]) => parseFloat(qty)))
  const maxAskVolume = Math.max(...data.asks.map(([_, qty]) => parseFloat(qty)))

  return (
    <div className="bg-gray-950 border border-gray-800 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-800">
        <h3 className="font-semibold">Order Book</h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Asks (Sell Orders) */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Price (USDT)</span>
            <span>Amount</span>
          </div>
          <div className="space-y-1">
            {data.asks.slice(0, 10).reverse().map(([price, qty], i) => {
              const volume = parseFloat(qty)
              const percentage = (volume / maxAskVolume) * 100
              return (
                <div key={i} className="relative">
                  <div
                    className="absolute inset-0 bg-red-500/10"
                    style={{ width: `${percentage}%` }}
                  />
                  <div className="relative flex justify-between text-sm py-1 px-2">
                    <span className="text-red-500 font-mono">
                      {parseFloat(price).toFixed(2)}
                    </span>
                    <span className="text-gray-400 font-mono">
                      {parseFloat(qty).toFixed(4)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Spread */}
        <div className="py-2 text-center border-y border-gray-800">
          <p className="text-xs text-gray-500">Spread</p>
          <p className="text-sm font-semibold">
            {(parseFloat(data.asks[0][0]) - parseFloat(data.bids[0][0])).toFixed(2)}
          </p>
        </div>

        {/* Bids (Buy Orders) */}
        <div>
          <div className="space-y-1">
            {data.bids.slice(0, 10).map(([price, qty], i) => {
              const volume = parseFloat(qty)
              const percentage = (volume / maxBidVolume) * 100
              return (
                <div key={i} className="relative">
                  <div
                    className="absolute inset-0 bg-green-500/10"
                    style={{ width: `${percentage}%` }}
                  />
                  <div className="relative flex justify-between text-sm py-1 px-2">
                    <span className="text-green-500 font-mono">
                      {parseFloat(price).toFixed(2)}
                    </span>
                    <span className="text-gray-400 font-mono">
                      {parseFloat(qty).toFixed(4)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
