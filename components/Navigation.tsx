'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from './AuthProvider'
import { LogOut, Menu, TrendingUp, Target, X, type LucideIcon } from 'lucide-react'

type NavLink = { href: string; label: string; icon?: LucideIcon }

const MEMBER_LINKS: NavLink[] = [
  { href: '/', label: 'Markets' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/challenge', label: 'Challenge', icon: Target },
  { href: '/pricing', label: 'Pricing' },
]

const PUBLIC_LINKS: NavLink[] = [{ href: '/pricing', label: 'Pricing' }]

export function Navigation() {
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const links = user ? MEMBER_LINKS : PUBLIC_LINKS

  const linkClass = (href: string) =>
    `flex items-center gap-1 transition hover:text-white ${
      pathname === href ? 'text-white' : 'text-gray-300'
    }`

  return (
    <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur" aria-label="Main">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <TrendingUp className="h-6 w-6 text-blue-500" aria-hidden="true" />
            <span>Shahin</span>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={linkClass(href)}
                aria-current={pathname === href ? 'page' : undefined}
              >
                {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
                {label}
              </Link>
            ))}
            {user && (
              <button
                type="button"
                onClick={() => signOut()}
                className="flex items-center gap-2 text-gray-300 transition hover:text-white"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign Out
              </button>
            )}
          </div>

          <button
            type="button"
            className="p-2 text-gray-300 hover:text-white md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </button>
        </div>

        {open && (
          <div id="mobile-menu" className="flex flex-col gap-1 border-t border-gray-800 py-3 md:hidden">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`${linkClass(href)} rounded px-2 py-3`}
                aria-current={pathname === href ? 'page' : undefined}
              >
                {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
                {label}
              </Link>
            ))}
            {user && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  signOut()
                }}
                className="flex items-center gap-2 rounded px-2 py-3 text-left text-gray-300 transition hover:text-white"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign Out
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
