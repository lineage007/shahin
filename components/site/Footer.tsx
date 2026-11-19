import Link from 'next/link'
import { Mark } from './Mark'

export function Footer() {
  return (
    <footer className="site-foot">
      <div className="wrap foot-grid">
        <div>
          <Link href="/" className="brand" aria-label="Shahin home">
            <Mark size={22} />
            <span>Shahin</span>
          </Link>
          <p className="foot-note">
            Shahin is a crypto paper-trading simulator. Every balance is virtual USDT. No real money is deposited,
            traded or paid out, and no order is sent to an exchange.
          </p>
          <p className="foot-note">
            Crypto markets are volatile and past performance does not predict future returns. Nothing on Shahin is
            financial advice.
          </p>
        </div>
        <nav aria-label="Footer" className="foot-links">
          <Link href="/#how">How it works</Link>
          <Link href="/#rules">Challenge rules</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/leaderboard">Leaderboard</Link>
          <Link href="/#faq">Questions</Link>
        </nav>
      </div>
    </footer>
  )
}
