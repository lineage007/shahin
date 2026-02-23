import { Suspense } from 'react'
import { LeaderboardView } from '@/components/LeaderboardView'
import { AuthGuard } from '@/components/AuthGuard'

export const dynamic = 'force-dynamic'

export default function LeaderboardPage() {
  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<div className="text-center py-20">Loading leaderboard...</div>}>
          <LeaderboardView />
        </Suspense>
      </div>
    </AuthGuard>
  )
}
