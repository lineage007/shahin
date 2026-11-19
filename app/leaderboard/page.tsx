import { Suspense } from 'react'
import { LeaderboardView } from '@/components/LeaderboardView'
import { AuthGuard } from '@/components/AuthGuard'

export const dynamic = 'force-dynamic'

export default function LeaderboardPage() {
  return (
    <>
      <section className="wrap page-head">
        <p className="eyebrow mono">Leaderboard</p>
        <h1>Ranked on paper.</h1>
        <p className="lede">
          Traders who opt in are ranked by the return on their virtual balance. Everyone starts from the same
          $100,000 in virtual USDT, so the table shows skill and discipline, not account size. There are no prizes and
          no payouts.
        </p>
      </section>
      <section className="wrap section">
        <AuthGuard>
          <Suspense fallback={<p className="muted">Loading leaderboard</p>}>
            <LeaderboardView />
          </Suspense>
        </AuthGuard>
      </section>
    </>
  )
}
