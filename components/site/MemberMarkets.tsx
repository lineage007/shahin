'use client'

import { Suspense } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { AuthGuard } from '@/components/AuthGuard'
import { MarketDashboard } from '@/components/MarketDashboard'

// Signed-in traders get the live market desk under the introduction. Visitors see the introduction only.
export function MemberMarkets() {
  const { user } = useAuth()
  if (!user) return null
  return (
    <section className="wrap section" aria-label="Markets">
      <AuthGuard>
        <Suspense fallback={<p className="muted">Loading markets</p>}>
          <MarketDashboard />
        </Suspense>
      </AuthGuard>
    </section>
  )
}
