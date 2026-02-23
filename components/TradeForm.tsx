'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './AuthProvider'
import { executeBuy, executeSell, getPortfolio, getHoldings } from '@/lib/trading'
import type { CoinData } from '@/lib/api'
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react'

interface TradeFormProps {
  coin: CoinData
}

export function TradeForm({ coin }: TradeFormProps) {
  const { user } = useAuth()
  const [action, setAction] = useState<'buy' | 'sell'>('buy')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [balance, setBalance] = useState(0)
  const [holding, setHolding] = useState(0)

  useEffect(() => {
    loadBalances()
  }, [user, coin.id])

  const loadBalances = async () => {
    if (!user) return

    try {
      const portfolio = await getPortfolio(user.id)
      setBalance(portfolio.balance_usdt)

      const holdings = await getHoldings(user.id)
      const currentHolding = holdings.find((h) => h.symbol === coin.id)
      setHolding(currentHolding?.amount || 0)
    } catch (err) {
      console.error('Error loading balances:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const amountNum = parseFloat(amount)
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Invalid amount')
      }

      if (action === 'buy') {
        await executeBuy(user!.id, coin.id, amountNum, coin.current_price)
        setSuccess(`Successfully bought ${amountNum} ${coin.symbol.toUpperCase()}`)
      } else {
        await executeSell(user!.id, coin.id, amountNum, coin.current_price)
        setSuccess(`Successfully sold ${amountNum} ${coin.symbol.toUpperCase()}`)
      }

      setAmount('')
      await loadBalances()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const totalCost = parseFloat(amount || '0') * coin.current_price

  return (
    <div className="bg-gray-950 border border-gray-800 rounded-lg p-4">
      <div className="mb-4">
        <h3 className="font-semibold mb-4">Place Order</h3>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setAction('buy')}
            className={`flex-1 py-2 rounded-lg font-semibold transition ${
              action === 'buy'
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-400'
            }`}
          >
            <ArrowUpCircle className="inline h-4 w-4 mr-1" />
            Buy
          </button>
          <button
            onClick={() => setAction('sell')}
            className={`flex-1 py-2 rounded-lg font-semibold transition ${
              action === 'sell'
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-gray-400'
            }`}
          >
            <ArrowDownCircle className="inline h-4 w-4 mr-1" />
            Sell
          </button>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Available Balance:</span>
            <span className="font-semibold">${balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Your Holding:</span>
            <span className="font-semibold">
              {holding.toFixed(6)} {coin.symbol.toUpperCase()}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Amount ({coin.symbol.toUpperCase()})
            </label>
            <input
              type="number"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Price (USDT)</label>
            <input
              type="text"
              value={`$${coin.current_price.toLocaleString()}`}
              disabled
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400"
            />
          </div>

          <div className="flex justify-between text-sm p-3 bg-gray-900 rounded-lg">
            <span className="text-gray-400">Total:</span>
            <span className="font-semibold">${totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500 rounded-lg text-green-500 text-sm">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold transition ${
              action === 'buy'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            } disabled:bg-gray-700`}
          >
            {loading ? 'Processing...' : action === 'buy' ? 'Buy' : 'Sell'}{' '}
            {coin.symbol.toUpperCase()}
          </button>
        </form>
      </div>
    </div>
  )
}
