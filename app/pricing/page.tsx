import Link from 'next/link'
import { AccountsStatus } from '@/components/site/AccountsStatus'
import { ACCOUNT_SIZES, ASSETS, FREE_BALANCE, PHASE1, PHASE2, usd } from '@/lib/rules'

const WORDS: Record<number, string> = { 3: 'Three', 4: 'Four', 5: 'Five', 6: 'Six' }

const included = [
  `${usd(FREE_BALANCE)} virtual USDT balance`,
  `${ASSETS.length} tradeable coins at live market prices`,
  'TradingView charts and the Binance order book',
  'Opt-in paper leaderboard',
  'Achievements and daily challenges',
  'Full trade history',
]

export default function PricingPage() {
  return (
    <>
      <section className="wrap page-head">
        <p className="eyebrow mono">Pricing</p>
        <h1>Free. Every account is paper.</h1>
        <p className="lede">
          Shahin has one plan and it costs nothing. There is nothing to buy: no challenge fees, no subscriptions and
          no payouts. You trade virtual money against real prices.
        </p>
      </section>

      <section className="wrap section plan-grid">
        <article className="plan">
          <div className="plan-top">
            <h2>Shahin</h2>
            <p className="plan-price">
              <span className="mono">$0</span>
              <span className="muted">always</span>
            </p>
            <p className="muted">No card, no deposit, no fee at any stage.</p>
          </div>
          <ul className="ticks">
            {included.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </article>

        <article className="plan plan-quiet">
          <h2>What paper means here</h2>
          <ul className="plain-list">
            <li><b>Money in:</b> none. There is nowhere to deposit.</li>
            <li><b>Money out:</b> none. Shahin does not fund accounts, share profits or pay prizes.</li>
            <li><b>Orders:</b> filled in the simulator at the quoted price, never sent to an exchange.</li>
            <li><b>Advice:</b> none. Crypto is volatile and past results do not predict future returns.</li>
          </ul>
        </article>
      </section>

      <section className="wrap section">
        <div className="section-head">
          <p className="eyebrow mono">Challenge account sizes</p>
          <h2>{WORDS[ACCOUNT_SIZES.length] ?? ACCOUNT_SIZES.length} virtual sizes, one rulebook.</h2>
          <p className="muted">Every size is virtual and free. The rules scale with the balance.</p>
        </div>
        <div className="table-wrap">
          <table className="rules">
            <thead>
              <tr>
                <th scope="col">Virtual balance</th>
                <th scope="col">Phase 1 target</th>
                <th scope="col">Phase 2 target</th>
                <th scope="col">Daily loss limit</th>
                <th scope="col">Drawdown floor</th>
              </tr>
            </thead>
            <tbody>
              {ACCOUNT_SIZES.map((size) => (
                <tr key={size}>
                  <th scope="row" className="mono">{usd(size)}</th>
                  <td className="mono">+{usd((size * PHASE1.profitTargetPercent) / 100)}</td>
                  <td className="mono">+{usd((size * PHASE2.profitTargetPercent) / 100)}</td>
                  <td className="mono">{usd((size * PHASE1.dailyLossLimitPercent) / 100)}</td>
                  <td className="mono">{usd(size - (size * PHASE1.maxDrawdownPercent) / 100)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted small">
          Targets are +{PHASE1.profitTargetPercent}% in Phase 1 ({PHASE1.maxCalendarDays} days) and +{PHASE2.profitTargetPercent}% in Phase 2 ({PHASE2.maxCalendarDays} days), with at least {PHASE1.minTradingDays} trading days in each. The daily loss limit is shown at the starting balance and moves with each day&apos;s opening equity.{' '}
          <Link href="/#rules">See the full rulebook</Link>.
        </p>
      </section>

      <section className="wrap section">
        <AccountsStatus />
      </section>
    </>
  )
}
