import { Suspense } from 'react'
import { PortfolioDashboard } from '@/components/PortfolioDashboard'
import { AuthGuard } from '@/components/AuthGuard'

export const dynamic = 'force-dynamic'

export default function PortfolioPage() {
  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<div className="text-center py-20">Loading portfolio...</div>}>
          <PortfolioDashboard />
        </Suspense>
      </div>
    </AuthGuard>
  )
}
