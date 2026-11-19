import type { ReactNode } from 'react'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata(
  '/leaderboard',
  'Paper trading leaderboard | Shahin',
  'Shahin traders who opt in, ranked by the return on the same $100,000 virtual USDT balance. Paper trading only, no prizes and no payouts.'
)

export default function LeaderboardLayout({ children }: { children: ReactNode }) {
  return children
}
