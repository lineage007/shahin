'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './AuthProvider'
import { getPortfolio, getHoldings } from '@/lib/trading'
import { getSupabase } from '@/lib/supabase'
import type { CoinData } from '@/lib/api'
import { ArrowUpCircle, ArrowDownCircle, AlertTriangle, CheckCircle } from 'lucide-react'
import { TradeEducationOverlay } from './TradeEducationOverlay'

// F2 / F3 / F4 / F10 fixes:
// All trade execution now goes through the /api/trade server-side route, which:
//   - Fetches the canonical price from CoinGecko server-side (ignores client price)
//   - Uses atomic Postgres RPCs to prevent balance overdraw (TOCTOU race)
//   - Calls onPaperTradeExecuted() to enforce active challenge rules
//   - Never exposes the CoinGecko API key to the browser

interface TradeFormProps {
  coin: CoinData
}

interface ChallengeResult {
  action: string
  reason?: string
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
  const [challengeAlert, setChallengeAlert] = useState<ChallengeResult | null>(null)
  const [overlay, setOverlay] = useState<{
    action: 'buy' | 'sell'
    amount: number
    price: number
    profit?: number
  } | null>(null)

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
    setChallengeAlert(null)
    setLoading(true)

    try {
      const amountNum = parseFloat(amount)
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Invalid amount')
      }

      // Get the current auth token to pass to the server route for identity verification
      const { data: { session } } = await getSupabase().auth.getSession()
      if (!session?.access_token) {
        throw new Error('Session expired — please sign in again')
      }

      // Call server-side trade route (F2 — server fetches canonical price)
      const res = await fetch('/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          coinId: coin.id,
          amount: amountNum,
          userId: user!.id,
          authToken: session.access_token,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Trade failed')
      }

      const executedPrice: number = data.executedPrice

      if (action === 'buy') {
        setSuccess(
          `Bought ${amountNum} ${coin.symbol.toUpperCase()} at $${executedPrice.toLocaleString()} (server price)`
        )
        setOverlay({ action: 'buy', amount: amountNum, price: executedPrice })
      } else {
        const profit: number = data.profit ?? 0
        setSuccess(
          `Sold ${amountNum} ${coin.symbol.toUpperCase()} at $${executedPrice.toLocaleString()} (server price)`
        )
        setOverlay({ action: 'sell', amount: amountNum, price: executedPrice, profit })
      }

      // Surface challenge result (F4)
      if (data.challengeResult && data.challengeResult.action !== 'NO_CHALLENGE') {
        setChallengeAlert(data.challengeResult)
      }

      setAmount('')
      await loadBalances()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  // Show estimated total using the displayed coin price (for UX only; server price is authoritative)
  const estimatedTotal = parseFloat(amount || '0') * coin.current_price

  return (
    <>
    {overlay && (
      <TradeEducationOverlay
        action={overlay.action}
        symbol={coin.symbol}
        amount={overlay.amount}
        price={overlay.price}
        profit={overlay.profit}
        onDismiss={() => setOverlay(null)}
      />
    )}
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
              value={`$${coin.current_price.toLocaleString()} (indicative)`}
              disabled
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400"
            />
            <p className="text-xs text-gray-500 mt-1">
              Execution price is fetched server-side at submission time.
            </p>
          </div>

          <div className="flex justify-between text-sm p-3 bg-gray-900 rounded-lg">
            <span className="text-gray-400">Estimated Total:</span>
            <span className="font-semibold">${estimatedTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500 rounded-lg text-green-500 text-sm">
              <CheckCircle className="inline h-4 w-4 mr-1" />
              {success}
            </div>
          )}

          {/* Challenge rule result banner (F4) */}
          {challengeAlert && challengeAlert.action === 'PASS' && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500 rounded-lg text-yellow-400 text-sm">
              <CheckCircle className="inline h-4 w-4 mr-1" />
              Challenge passed! {challengeAlert.reason}
            </div>
          )}
          {challengeAlert && challengeAlert.action === 'FAIL' && (
            <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-400 text-sm">
              <AlertTriangle className="inline h-4 w-4 mr-1" />
              Challenge failed: {challengeAlert.reason}
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
    </>
  )
}
