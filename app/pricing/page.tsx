'use client'

import Link from 'next/link'
import { CheckCircle, AlertTriangle, Lock } from 'lucide-react'

const TIERS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Practice trading with virtual capital. No card or payment needed.',
    features: [
      '$100,000 virtual paper-trading balance',
      '20 tradeable assets (BTC, ETH, SOL + 17 more)',
      'Leaderboard (opt-in)',
      'Achievements and daily challenges',
      'Full trade history',
    ],
    cta: 'Start Trading Free',
    ctaHref: '/onboarding',
    highlight: true,
    available: true,
  },
  {
    id: 'challenge',
    name: 'Challenge Taker',
    price: '$199',
    period: 'per challenge (2-Phase $25K)',
    description: 'A planned paid challenge using two-phase prop-firm rules. Not on sale.',
    features: [
      'Everything in Free',
      'Prop-firm challenge account ($25K to $500K virtual)',
      'Real-time rule monitoring (drawdown, daily loss)',
      '2-Phase challenge structure',
      'Phase progression tracking',
      'Planned profit split of 80% to 95% on pass',
    ],
    note: 'Planned figures only. They may change. No challenge can be bought today and no payment is accepted.',
    cta: 'Not available yet',
    ctaHref: '/pricing',
    highlight: false,
    available: false,
  },
  {
    id: 'funded',
    name: 'Funded Trader',
    price: 'Profit split',
    period: 'after passing both phases',
    description: 'A planned stage after passing both challenge phases. Not offered today.',
    features: [
      'Everything in Challenge Taker',
      'Funded account ($25K to $500K)',
      'Profit split structure (80% to 95%)',
      'Bi-weekly payout requests',
      'Scaling ladder (up to $500K)',
      'Priority support',
    ],
    note: 'Planned only. Shahin does not offer funded accounts or pay out profits today.',
    cta: 'Not available yet',
    ctaHref: '/challenge',
    highlight: false,
    available: false,
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-16 max-w-5xl">

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Pricing</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Paper trading is free. Paid challenges are not available yet. The figures below show the planned format and may change.
          </p>
        </div>

        {/* Pre-launch banner */}
        <div className="mb-12 p-5 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex gap-4">
          <AlertTriangle className="h-6 w-6 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-400/90">
            <p className="font-semibold mb-1">Pre-launch: paper trading only</p>
            <p>
              Shahin is currently in paper-trading mode. Challenge fees and profit splits shown are planned
              figures only and may change. No payment is accepted or processed, and no profits are paid out.
              Crypto markets are volatile. This is not financial advice.
            </p>
          </div>
        </div>

        {/* Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`rounded-2xl border p-6 flex flex-col ${
                tier.highlight
                  ? 'border-yellow-500/50 bg-yellow-500/5'
                  : 'border-gray-700 bg-gray-900/50'
              }`}
            >
              <h2 className="text-xl font-bold mb-1">{tier.name}</h2>
              <div className="mb-2">
                <span className="text-3xl font-bold text-yellow-400">{tier.price}</span>
                <span className="text-sm text-gray-500 ml-2">{tier.period}</span>
              </div>
              <p className="text-sm text-gray-400 mb-6">{tier.description}</p>
              <ul className="space-y-2 mb-6 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{f}</span>
                  </li>
                ))}
              </ul>
              {tier.note && (
                <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-gray-500">{tier.note}</p>
                </div>
              )}
              {tier.available ? (
                <Link
                  href={tier.ctaHref}
                  className={`w-full py-3 rounded-lg font-semibold text-center transition ${
                    tier.highlight
                      ? 'bg-yellow-500 hover:bg-yellow-400 text-black'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  {tier.cta}
                </Link>
              ) : (
                <button
                  disabled
                  className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 bg-gray-800 text-gray-500 cursor-not-allowed"
                >
                  <Lock className="h-4 w-4" />
                  {tier.cta}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Challenge fee table */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Planned challenge fees (not on sale)</h2>
          <p className="text-gray-400 text-sm text-center mb-6">
            Planned fees for 2-Phase challenges. These may change and no payment is accepted today.
          </p>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left">Account Size</th>
                  <th className="px-6 py-4 text-right">2-Phase Fee</th>
                  <th className="px-6 py-4 text-right">Profit Split</th>
                  <th className="px-6 py-4 text-right">Phase 1 Target</th>
                  <th className="px-6 py-4 text-right">Phase 2 Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {[
                  { size: '$25,000', fee: '$199', split: '80%', p1: '8%', p2: '5%' },
                  { size: '$50,000', fee: '$349', split: '85%', p1: '8%', p2: '5%' },
                  { size: '$100,000', fee: '$549', split: '85%', p1: '8%', p2: '5%' },
                  { size: '$200,000', fee: '$999', split: '90%', p1: '8%', p2: '5%' },
                  { size: '$500,000', fee: '$1,999', split: '95%', p1: '8%', p2: '5%' },
                ].map((row) => (
                  <tr key={row.size} className="hover:bg-gray-800/30">
                    <td className="px-6 py-4 font-semibold">{row.size}</td>
                    <td className="px-6 py-4 text-right text-yellow-400 font-semibold">{row.fee}</td>
                    <td className="px-6 py-4 text-right text-green-400">{row.split}</td>
                    <td className="px-6 py-4 text-right text-gray-400">{row.p1}</td>
                    <td className="px-6 py-4 text-right text-gray-400">{row.p2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-600 mt-3 text-center">
            Max drawdown: 10% | Daily loss limit: 5% | Min trading days: 5 per phase
          </p>
        </div>

        {/* Compliance footer */}
        <div className="p-6 bg-gray-900/50 border border-gray-700 rounded-xl text-center space-y-2">
          <p className="text-sm text-gray-400">
            Shahin is currently in paper-trading mode. No real money is accepted, traded or paid out.
          </p>
          <p className="text-sm text-gray-400">
            Crypto markets are highly volatile. Past performance does not predict future returns.
            This is not financial advice.
          </p>
          <div className="flex justify-center gap-6 mt-4 text-xs text-gray-600">
            <Link href="/challenge" className="hover:text-gray-400 transition">Challenge Dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
