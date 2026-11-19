import Link from 'next/link'
import { AccountsStatus } from '@/components/site/AccountsStatus'
import { MemberMarkets } from '@/components/site/MemberMarkets'
import { RuleScale } from '@/components/site/RuleScale'
import { ACCOUNT_SIZES, ASSETS, FREE_BALANCE, PHASE1, PHASE2, usd, usdShort } from '@/lib/rules'
import { SITE_URL } from '@/lib/seo'


const minSize = Math.min(...ACCOUNT_SIZES)
const maxSize = Math.max(...ACCOUNT_SIZES)

const steps = [
  {
    n: '01',
    title: 'Start with virtual funds',
    body: `The free account opens with ${usd(FREE_BALANCE)} in virtual USDT. Challenge accounts run from ${usdShort(minSize)} to ${usdShort(maxSize)}, all virtual.`,
  },
  {
    n: '02',
    title: 'Trade at live prices',
    body: `Buy and sell ${ASSETS.length} major coins at CoinGecko market prices, with a TradingView chart and the Binance order book beside every trade.`,
  },
  {
    n: '03',
    title: 'Trade to the rules',
    body: `Aim for +${PHASE1.profitTargetPercent}% in Phase 1 and +${PHASE2.profitTargetPercent}% in Phase 2 without breaking the ${PHASE1.dailyLossLimitPercent}% daily loss limit or the ${PHASE1.maxDrawdownPercent}% drawdown floor. In a real evaluation, one broken rule ends the attempt.`,
  },
]

const ruleRows: { label: string; p1: string; p2: string }[] = [
  { label: 'Profit target', p1: `+${PHASE1.profitTargetPercent}%`, p2: `+${PHASE2.profitTargetPercent}%` },
  { label: 'Time limit', p1: `${PHASE1.maxCalendarDays} days`, p2: `${PHASE2.maxCalendarDays} days` },
  { label: 'Minimum trading days', p1: `${PHASE1.minTradingDays}`, p2: `${PHASE2.minTradingDays}` },
  { label: 'Daily loss limit', p1: `${PHASE1.dailyLossLimitPercent}% of the day's opening equity`, p2: `${PHASE2.dailyLossLimitPercent}% of the day's opening equity` },
  {
    label: 'Maximum drawdown',
    p1: `${PHASE1.maxDrawdownPercent}% ${PHASE1.maxDrawdownType === 'trailing' ? 'from peak equity' : 'from the starting balance'}`,
    p2: `${PHASE2.maxDrawdownPercent}% ${PHASE2.maxDrawdownType === 'trailing' ? 'from peak equity' : 'from the starting balance'}`,
  },
  { label: 'Largest single position', p1: `${PHASE1.maxPositionSizePercent}% of equity`, p2: `${PHASE2.maxPositionSizePercent}% of equity` },
  { label: 'Holding over the weekend', p1: PHASE1.allowWeekendHolding ? 'Allowed' : 'Not allowed', p2: PHASE2.allowWeekendHolding ? 'Allowed' : 'Not allowed' },
]

const paper = [
  { title: 'No deposits', body: 'There is nowhere to send money. Every balance is virtual USDT.' },
  { title: 'No fees', body: 'Shahin has one plan, and it costs nothing.' },
  { title: 'No payouts', body: 'Shahin does not fund accounts, share profits or pay prizes. Results stay on paper.' },
  { title: 'No exchange orders', body: 'Trades are filled in the simulator at the quoted price. Nothing is sent to an exchange.' },
]

const faqs = [
  {
    q: 'Is Shahin real money?',
    a: 'No. Shahin is paper trading only. Every balance is virtual USDT, and you cannot deposit, withdraw or win money.',
  },
  { q: 'What does it cost?', a: 'Nothing. Shahin has one plan and it is free.' },
  {
    q: 'Where do the prices come from?',
    a: 'Market prices come from CoinGecko, and the order book beside each trade comes from Binance. Simulated trades fill at the quoted price.',
  },
  {
    q: 'What happens if I break a rule?',
    a: `In the challenge format, going past the ${PHASE1.dailyLossLimitPercent}% daily loss limit or the ${PHASE1.maxDrawdownPercent}% drawdown floor ends the attempt, exactly as a prop-firm evaluation would. On paper, the only cost is the lesson.`,
  },
  {
    q: 'Does passing lead to a funded account?',
    a: 'No. Shahin does not fund accounts, share profits or pay out anything. Every result stays on paper.',
  },
  { q: 'Is anything here financial advice?', a: 'No. Shahin is a practice tool. Crypto markets are volatile and past results do not predict future returns.' },
]

const ld = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      '@id': `${SITE_URL}/#app`,
      name: 'Shahin',
      url: SITE_URL,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Any',
      description:
        'A crypto paper-trading simulator with two-phase prop challenge rules, live market prices and $100,000 in virtual USDT. No real money.',
      offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ],
}

export default function HomePage() {
  return (
    <>
      <section className="wrap hero">
        <div className="hero-copy">
          <p className="eyebrow mono">Crypto paper trading</p>
          <h1>Trade the prop challenge on paper.</h1>
          <p className="lede">
            Shahin gives you {usd(FREE_BALANCE)} in virtual USDT, live prices on {ASSETS.length} major coins and the rules
            prop firms grade traders on: a profit target, a daily loss limit and a drawdown floor. Every trade is
            simulated. No money goes in and none comes out.
          </p>
          <div className="cta-row">
            <Link className="btn btn-gold" href="#rules">Read the rules</Link>
            <Link className="btn btn-line" href="/pricing">Pricing: free</Link>
          </div>
        </div>
        <RuleScale />
      </section>

      <MemberMarkets />

      <section id="how" className="wrap section">
        <div className="section-head">
          <p className="eyebrow mono">How it works</p>
          <h2>Train the way you will be judged.</h2>
        </div>
        <ol className="steps">
          {steps.map((s) => (
            <li key={s.n}>
              <span className="mono step-n">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="rules" className="wrap section">
        <div className="section-head">
          <p className="eyebrow mono">Challenge rules</p>
          <h2>The whole rulebook, on one page.</h2>
          <p className="muted">
            The same rules apply to every account size from {usdShort(minSize)} to {usdShort(maxSize)}. These are the
            figures built into Shahin&apos;s challenge engine.
          </p>
        </div>
        <div className="table-wrap">
          <table className="rules rules-3">
            <thead>
              <tr>
                <th scope="col">Rule</th>
                <th scope="col">Phase 1</th>
                <th scope="col">Phase 2</th>
              </tr>
            </thead>
            <tbody>
              {ruleRows.map((r) => (
                <tr key={r.label}>
                  <th scope="row">{r.label}</th>
                  <td className="mono">{r.p1}</td>
                  <td className="mono">{r.p2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="wrap section">
        <div className="section-head">
          <p className="eyebrow mono">Paper, start to finish</p>
          <h2>Real prices. Virtual money. Nothing else.</h2>
        </div>
        <ul className="paper">
          {paper.map((p) => (
            <li key={p.title}>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="wrap section">
        <div className="section-head">
          <p className="eyebrow mono">Markets</p>
          <h2>{ASSETS.length} coins, quoted live.</h2>
        </div>
        <ul className="tickers" aria-label="Tradeable coins">
          {ASSETS.map((a) => (
            <li key={a.id}>
              <span className="mono">{a.symbol.toUpperCase()}</span>
              <span className="tk-name">{a.name}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="wrap section">
        <AccountsStatus />
      </section>

      <section id="faq" className="wrap section">
        <div className="section-head">
          <p className="eyebrow mono">Questions</p>
          <h2>Straight answers.</h2>
        </div>
        <div className="faq">
          {faqs.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
    </>
  )
}
