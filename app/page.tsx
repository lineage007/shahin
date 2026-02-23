import { Suspense } from 'react'
import { MarketDashboard } from '@/components/MarketDashboard'
import { AuthGuard } from '@/components/AuthGuard'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<div className="text-center py-20">Loading markets...</div>}>
          <MarketDashboard />
        </Suspense>
      </div>
    </AuthGuard>
  )
}
