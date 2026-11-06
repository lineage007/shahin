import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Leaderboard | Shahin',
  description: 'Paper trading leaderboard for Shahin traders who opt in to public rankings.',
  alternates: { canonical: '/leaderboard' },
  openGraph: { url: 'https://shahin.app/leaderboard' },
}

export default function LeaderboardLayout({ children }: { children: ReactNode }) {
  return children
}
