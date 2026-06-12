import { Suspense } from 'react'
import { MarketDashboard } from '@/components/MarketDashboard'
import { AuthGuard } from '@/components/AuthGuard'
import { BarChart3, ShieldCheck, Trophy } from 'lucide-react'

export const dynamic = 'force-dynamic'

const features = [
  {
    title: 'Two-phase prop challenges',
    description:
      'Practice against clear drawdown, profit target, and minimum trading-day rules before moving toward funded-style evaluation.',
    icon: Trophy,
  },
  {
    title: 'Live crypto market data',
    description:
      'Track major digital assets, top gainers, highest-volume coins, and sentiment indicators from one focused dashboard.',
    icon: BarChart3,
  },
  {
    title: 'Paper-first risk controls',
    description:
      'Trade in simulation mode while Shahin develops the compliance pathway required for regulated real-money activity.',
    icon: ShieldCheck,
  },
]

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mx-auto mb-10 max-w-5xl">
        <div className="mb-8 max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-blue-400">
            Paper trading platform
          </p>
          <h1 className="mb-5 text-4xl font-bold tracking-tight md:text-5xl">
            Crypto Prop Trading Challenge
          </h1>
          <p className="text-lg leading-8 text-gray-300">
            Shahin is a crypto prop trading challenge platform built for traders who want a realistic,
            rules-based environment before committing real capital. The app combines live cryptocurrency
            market data, paper trading tools, leaderboard mechanics, and challenge-style risk limits so users
            can test discipline under conditions that mirror funded account evaluations. Traders can monitor
            major coins, review sentiment, place simulated trades, and work toward structured targets without
            financial exposure. Shahin is currently paper trading only while the ADGM FSP application is in
            progress; challenge fees, payouts, and account upgrades are indicative until authorisation is in
            place. Join the waitlist or sign in to follow markets, practice execution, and prepare for the
            next phase of crypto prop trading.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {features.map(({ title, description, icon: Icon }) => (
            <article key={title} className="rounded-lg border border-gray-800 bg-gray-900/50 p-5">
              <Icon className="mb-4 h-6 w-6 text-blue-400" aria-hidden="true" />
              <h2 className="mb-2 text-lg font-semibold">{title}</h2>
              <p className="text-sm leading-6 text-gray-400">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <AuthGuard>
        <Suspense fallback={<div className="text-center py-20">Loading markets...</div>}>
          <MarketDashboard />
        </Suspense>
      </AuthGuard>
    </div>
  )
}
