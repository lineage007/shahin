import { PHASE1, PHASE2 } from '@/lib/rules'

// A drawn scorecard of the Phase 1 rules: where the target sits, and the two floors that end a challenge.
export function RuleScale() {
  const top = PHASE1.profitTargetPercent
  const floor = -PHASE1.maxDrawdownPercent
  const H = 280
  const pad = 16
  const y = (v: number) => pad + ((top - v) / (top - floor)) * (H - pad * 2)
  const marks = [
    { v: top, label: `+${top}%`, name: 'Profit target', tone: 'var(--gold)' },
    { v: 0, label: '0%', name: 'Starting balance', tone: 'var(--text)' },
    { v: -PHASE1.dailyLossLimitPercent, label: `-${PHASE1.dailyLossLimitPercent}%`, name: 'Daily loss limit', tone: 'var(--warn)' },
    { v: floor, label: `${floor}%`, name: 'Maximum drawdown', tone: 'var(--down)' },
  ]
  return (
    <figure className="scorecard" aria-label="Phase 1 challenge rules">
      <figcaption className="sc-head">
        <span className="mono sc-kicker">Phase 1 scorecard</span>
        <span className="mono">$100,000 virtual</span>
      </figcaption>
      <svg className="sc-svg" viewBox={`0 0 360 ${H}`} role="img" aria-label={marks.map((m) => `${m.name} ${m.label}`).join(', ')}>
        <defs>
          <linearGradient id="sc-up" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e9a23b" />
            <stop offset="1" stopColor="#e9a23b" stopOpacity="0.12" />
          </linearGradient>
          <linearGradient id="sc-down" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e5534b" stopOpacity="0.12" />
            <stop offset="1" stopColor="#e5534b" />
          </linearGradient>
        </defs>
        <rect x="10" y={y(top)} width="6" height={y(0) - y(top)} rx="3" fill="url(#sc-up)" />
        <rect x="10" y={y(0)} width="6" height={y(floor) - y(0)} rx="3" fill="url(#sc-down)" />
        {marks.map((m) => (
          <g key={m.name} transform={`translate(0 ${y(m.v)})`}>
            <line x1="28" x2="360" y1="0" y2="0" stroke="var(--line-2)" strokeDasharray="3 4" />
            <circle cx="13" cy="0" r="5" fill="var(--ink)" stroke={m.tone} strokeWidth="2" />
            <text x="34" y="-8" className="sc-val" fill={m.tone}>{m.label}</text>
            <text x="120" y="-8" className="sc-name">{m.name}</text>
          </g>
        ))}
      </svg>
      <dl className="sc-foot">
        <div><dt>Time limit</dt><dd className="mono">{PHASE1.maxCalendarDays} days</dd></div>
        <div><dt>Trading days</dt><dd className="mono">{PHASE1.minTradingDays} minimum</dd></div>
        <div><dt>Then Phase 2</dt><dd className="mono">+{PHASE2.profitTargetPercent}% in {PHASE2.maxCalendarDays} days</dd></div>
      </dl>
    </figure>
  )
}
