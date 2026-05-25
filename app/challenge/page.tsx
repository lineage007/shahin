import { AuthGuard } from '@/components/AuthGuard'
import { ChallengeDashboard } from '@/components/challenge/ChallengeDashboard'

export const dynamic = 'force-dynamic'

export default function ChallengePage() {
  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <ChallengeDashboard />
      </div>
    </AuthGuard>
  )
}
