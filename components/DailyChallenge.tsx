'use client'

import { useEffect, useState } from 'react'
import { fetchTradeableAssetPrices, TRADEABLE_ASSETS } from '@/lib/api'
import { Target } from 'lucide-react'

interface ChallengeState {
  assetId: string
  assetName: string
  assetSymbol: string
  snapshotPrice: number
  direction: 'up' | 'down' | null
  sizeGuess: 'small' | 'medium' | 'large' | null   // <2%, 2-5%, >5%
  submitted: boolean
  result: 'correct' | 'incorrect' | 'pending' | null
}

// Deterministic daily pick: rotate through assets by day-of-year
function getDailyAssetIndex(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
  return dayOfYear % TRADEABLE_ASSETS.length
}

const STORAGE_KEY = 'shahin_daily_challenge'

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

export function DailyChallenge() {
  const [challenge, setChallenge] = useState<ChallengeState | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const todayKey = getTodayKey()
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.date === todayKey) {
          setChallenge(parsed.state)
          setLoading(false)
          return
        }
      }

      // New challenge for today
      const idx = getDailyAssetIndex()
      const asset = TRADEABLE_ASSETS[idx]
      const prices = await fetchTradeableAssetPrices()
      const price = prices[asset.id] ?? 0

      const state: ChallengeState = {
        assetId: asset.id,
        assetName: asset.name,
        assetSymbol: asset.symbol.toUpperCase(),
        snapshotPrice: price,
        direction: null,
        sizeGuess: null,
        submitted: false,
        result: null,
      }
      setChallenge(state)
      setLoading(false)
    }
    init()
  }, [])

  const persist = (state: ChallengeState) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ date: getTodayKey(), state })
    )
    setChallenge(state)
  }

  const handleSubmit = () => {
    if (!challenge || !challenge.direction || !challenge.sizeGuess) return
    const submitted = { ...challenge, submitted: true, result: 'pending' as const }
    persist(submitted)
  }

  if (loading || !challenge) return null

  return (
    <div className="bg-gray-900/50 border border-yellow-500/20 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Target className="h-5 w-5 text-yellow-400" />
        <h2 className="text-xl font-bold text-yellow-400">Today's Market Mover</h2>
      </div>

      <p className="text-gray-300 mb-4">
        Predict how{' '}
        <span className="font-bold text-white">
          {challenge.assetName} ({challenge.assetSymbol})
        </span>{' '}
        will move in the next 24 hours.
      </p>

      {challenge.snapshotPrice > 0 && (
        <p className="text-sm text-gray-500 mb-4">
          Snapshot price when challenge opened:{' '}
          <span className="text-gray-300 font-mono">
            ${challenge.snapshotPrice.toLocaleString(undefined, { maximumFractionDigits: 4 })}
          </span>
        </p>
      )}

      {!challenge.submitted ? (
        <div className="space-y-4">
          {/* Direction */}
          <div>
            <p className="text-sm text-gray-400 mb-2">Direction</p>
            <div className="flex gap-3">
              {(['up', 'down'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => persist({ ...challenge, direction: d })}
                  className={`flex-1 py-2 rounded-lg font-semibold transition border ${
                    challenge.direction === d
                      ? d === 'up'
                        ? 'bg-green-600 border-green-500 text-white'
                        : 'bg-red-600 border-red-500 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-400'
                  }`}
                >
                  {d === 'up' ? 'Up' : 'Down'}
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div>
            <p className="text-sm text-gray-400 mb-2">Move size</p>
            <div className="flex gap-3">
              {([
                { key: 'small', label: 'Small (<2%)' },
                { key: 'medium', label: 'Medium (2–5%)' },
                { key: 'large', label: 'Large (>5%)' },
              ] as const).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => persist({ ...challenge, sizeGuess: key })}
                  className={`flex-1 py-2 px-1 rounded-lg text-sm font-semibold transition border ${
                    challenge.sizeGuess === key
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!challenge.direction || !challenge.sizeGuess}
            className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 text-black font-bold rounded-lg transition"
          >
            Lock In Prediction
          </button>
        </div>
      ) : (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="font-semibold text-yellow-400">Prediction locked!</p>
          <p className="text-sm text-gray-400 mt-1">
            You predicted{' '}
            <span className="text-white">
              {challenge.direction === 'up' ? 'price goes up' : 'price goes down'}
            </span>{' '}
            with a{' '}
            <span className="text-white">
              {challenge.sizeGuess === 'small' ? 'small (<2%)' : challenge.sizeGuess === 'medium' ? 'medium (2–5%)' : 'large (>5%)'}
            </span>{' '}
            move. Check back tomorrow to see if you were right.
          </p>
        </div>
      )}

      <p className="text-xs text-gray-600 mt-4">
        Resets daily at midnight UTC. Predictions are for educational purposes only — not financial advice.
      </p>
    </div>
  )
}
