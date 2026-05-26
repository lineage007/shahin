'use client'

import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { LogOut, TrendingUp, Target } from 'lucide-react'

export function Navigation() {
  const { user, signOut } = useAuth()

  return (
    <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <TrendingUp className="h-6 w-6 text-blue-500" />
            <span>Shahin</span>
          </Link>

          {user && (
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="text-gray-300 hover:text-white transition"
              >
                Markets
              </Link>
              <Link
                href="/portfolio"
                className="text-gray-300 hover:text-white transition"
              >
                Portfolio
              </Link>
              <Link
                href="/leaderboard"
                className="text-gray-300 hover:text-white transition"
              >
                Leaderboard
              </Link>
              <Link
                href="/challenge"
                className="flex items-center gap-1 text-gray-300 hover:text-white transition"
              >
                <Target className="h-4 w-4" />
                Challenge
              </Link>
              <Link
                href="/pricing"
                className="text-gray-300 hover:text-white transition"
              >
                Pricing
              </Link>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
