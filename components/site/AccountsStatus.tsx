import Link from 'next/link'
import { isSupabaseConfigured } from '@/lib/supabase'

// One honest status block, shared by the home, pricing and leaderboard pages.
export function AccountsStatus({ compact = false }: { compact?: boolean }) {
  const open = isSupabaseConfigured()
  return (
    <div className={`status ${compact ? 'status-compact' : ''}`}>
      <span className={`dot ${open ? 'dot-on' : ''}`} aria-hidden="true" />
      <div>
        <p className="status-title">{open ? 'Accounts are open' : 'New accounts are paused'}</p>
        <p className="status-body">
          {open
            ? 'Create a free account and start with $100,000 in virtual USDT.'
            : 'The trading desk and leaderboard are for members, and sign-up is closed for now. The full challenge rules are public.'}
        </p>
      </div>
      {open ? (
        <Link className="btn btn-gold" href="/portfolio">Start trading free</Link>
      ) : (
        <Link className="btn btn-line" href="/#rules">Read the rules</Link>
      )}
    </div>
  )
}
