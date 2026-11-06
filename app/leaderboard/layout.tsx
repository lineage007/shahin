import type { ReactNode } from 'react'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata(
  '/leaderboard',
  'Leaderboard | Shahin',
  'Paper trading leaderboard for Shahin traders who opt in to public rankings.'
)

export default function LeaderboardLayout({ children }: { children: ReactNode }) {
  return children
}
