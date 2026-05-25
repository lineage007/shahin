'use client'

import { X } from 'lucide-react'

interface TradeEducationOverlayProps {
  action: 'buy' | 'sell'
  symbol: string
  amount: number
  price: number
  profit?: number    // defined on sells
  onDismiss: () => void
}

function getBuyExplanation(symbol: string, amount: number, price: number): string {
  const total = (amount * price).toLocaleString(undefined, { maximumFractionDigits: 2 })
  return `You bought ${amount} ${symbol.toUpperCase()} at $${price.toLocaleString(undefined, { maximumFractionDigits: 4 })} — paying $${total} USDT. ` +
    `Your position profits when ${symbol.toUpperCase()} price rises above your entry. ` +
    `This is a "long" position — you are betting on upward price movement.`
}

function getSellExplanation(symbol: string, amount: number, price: number, profit: number): string {
  const profitStr = profit >= 0
    ? `+$${profit.toLocaleString(undefined, { maximumFractionDigits: 2 })} profit`
    : `-$${Math.abs(profit).toLocaleString(undefined, { maximumFractionDigits: 2 })} loss`
  const direction = profit >= 0 ? 'above' : 'below'
  return `You sold ${amount} ${symbol.toUpperCase()} at $${price.toLocaleString(undefined, { maximumFractionDigits: 4 })}, ` +
    `closing your position for ${profitStr}. ` +
    `You sold ${direction} your average buy price, which ${profit >= 0 ? 'realised a gain' : 'realised a loss'}. ` +
    `${profit < 0 ? 'Losses are part of trading — what matters is your risk management and overall win rate over time.' : 'Well-timed exits lock in gains and free capital for the next trade.'}`
}

export function TradeEducationOverlay({
  action,
  symbol,
  amount,
  price,
  profit = 0,
  onDismiss,
}: TradeEducationOverlayProps) {
  const explanation =
    action === 'buy'
      ? getBuyExplanation(symbol, amount, price)
      : getSellExplanation(symbol, amount, price, profit)

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end justify-center p-4 sm:items-center">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
              What just happened
            </p>
            <h3 className="text-lg font-bold">
              {action === 'buy' ? 'You went long' : profit >= 0 ? 'Profitable exit' : 'Loss taken'}
            </h3>
          </div>
          <button
            onClick={onDismiss}
            className="p-1 hover:bg-gray-800 rounded-lg ml-4"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <p className="text-sm text-gray-300 leading-relaxed mb-6">{explanation}</p>

        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-4">
          <p className="text-xs text-blue-400 font-medium">
            This is paper trading — no real money is involved. Use this to practice strategy before real markets.
          </p>
        </div>

        <div className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg mb-4">
          <p className="text-xs text-yellow-500/80">
            Crypto markets are highly volatile. Past performance does not predict future returns.
            This is not financial advice. ADGM FSP application in progress.
          </p>
        </div>

        <button
          onClick={onDismiss}
          className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-semibold transition"
        >
          Got it
        </button>
      </div>
    </div>
  )
}
