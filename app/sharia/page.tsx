import Link from 'next/link'
import { AlertTriangle, BookOpen, CheckCircle, Clock, XCircle } from 'lucide-react'

export const metadata = {
  title: 'Sharia Framework | Shahin',
  description: 'Shahin\'s approach to Sharia-compatible crypto trading — honest, scholar-pending disclosure.',
}

export default function ShariaPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-16 max-w-3xl space-y-12">

        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-yellow-400 text-sm font-semibold mb-6">
            <Clock className="h-4 w-4" />
            Sharia Framework — Pending Scholar Review
          </div>
          <h1 className="text-4xl font-bold mb-4">Our Sharia Approach</h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Shahin is designed with Islamic finance principles as a priority. We are building a
            comprehensive Sharia framework but have not yet received a formal fatwa from a qualified
            Islamic finance scholar. This page documents our current approach honestly.
          </p>
        </div>

        {/* Status banner */}
        <div className="p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex gap-4">
          <AlertTriangle className="h-6 w-6 text-yellow-400 flex-shrink-0 mt-1" />
          <div>
            <p className="font-bold text-yellow-400 text-lg mb-2">Not yet certified</p>
            <p className="text-yellow-400/80 leading-relaxed">
              We previously displayed "Sharia Certified" on our landing page. This was incorrect.
              We removed it. We will not display certification claims until a qualified scholar
              has reviewed and issued a formal opinion. This page replaces that claim with an
              honest account of where we are.
            </p>
          </div>
        </div>

        {/* What we believe is permissible */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            Assets we believe are generally permissible
          </h2>
          <p className="text-gray-400 mb-4 text-sm">
            Based on our reading of available scholarly literature, the following asset types are
            generally considered permissible under the mainstream Sharia view on crypto (though
            specific fatwas vary by scholar and jurisdiction):
          </p>
          <div className="space-y-3">
            {[
              {
                asset: 'Bitcoin (BTC)',
                notes:
                  'Widely discussed; most contemporary scholars who have issued opinions consider BTC permissible as a medium of exchange or store of value, provided it is spot-traded without interest.',
              },
              {
                asset: 'Ethereum (ETH)',
                notes:
                  'Generally considered permissible for spot trading. Staking ETH raises questions around whether staking rewards constitute riba (interest) — this is an open scholarly debate.',
              },
              {
                asset: 'Layer-1 spot assets (SOL, AVAX, ADA, DOT, etc.)',
                notes:
                  'Spot ownership of blockchain infrastructure tokens is generally considered permissible. Governance participation through these tokens may require additional review.',
              },
            ].map((item) => (
              <div key={item.asset} className="p-4 bg-gray-900/50 border border-gray-800 rounded-lg">
                <p className="font-semibold text-green-400 mb-1">{item.asset}</p>
                <p className="text-sm text-gray-400">{item.notes}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Complicated or prohibited */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <XCircle className="h-6 w-6 text-red-500" />
            Areas requiring caution or potentially impermissible
          </h2>
          <div className="space-y-3">
            {[
              {
                area: 'Leverage and margin trading',
                notes:
                  'Interest-bearing leverage (paying or receiving riba on margin) is prohibited under Sharia. Shahin\'s paper trading mode does not use real leverage but we flag this for when real trading launches.',
              },
              {
                area: 'Staking and yield farming',
                notes:
                  'Whether staking rewards constitute riba is actively debated. Some scholars permit it as a return on work/validation; others class it with interest. We will not offer staking-linked products without a formal opinion.',
              },
              {
                area: 'Derivatives and futures',
                notes:
                  'Most scholars consider conventional futures and options impermissible due to gharar (excessive uncertainty) and speculative elements.',
              },
              {
                area: 'Highly speculative meme tokens',
                notes:
                  'Tokens with no underlying utility or business purpose raise questions around maysir (gambling). We exclude meme coins from our tradeable asset list.',
              },
            ].map((item) => (
              <div key={item.area} className="p-4 bg-gray-900/50 border border-gray-800 rounded-lg">
                <p className="font-semibold text-red-400 mb-1">{item.area}</p>
                <p className="text-sm text-gray-400">{item.notes}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scholar contacts */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-400" />
            Scholars and institutions we are engaging
          </h2>
          <p className="text-gray-400 mb-4 text-sm">
            We are researching which scholar or institution is best placed to review our specific
            product structure. The following are recognised authorities in Islamic finance and
            crypto/fintech:
          </p>
          <div className="space-y-3">
            {[
              {
                name: 'Mufti Faraz Adam',
                org: 'Amanah Finance Consultancy / Hasan Foundation',
                notes:
                  'Among the most prolific Islamic finance scholars actively engaging with crypto. Has issued opinions on Bitcoin, NFTs, and DeFi. Based in UK.',
              },
              {
                name: 'Sheikh Yusuf DeLorenzo',
                org: 'Former Dow Jones Islamic Market Indices Sharia board',
                notes:
                  'Long-standing authority on Islamic capital markets. Has addressed digital assets.',
              },
              {
                name: 'Dr Hussain Hamed Hassan',
                org: 'Former chairman, AAOIFI Sharia Board',
                notes:
                  'Chairman of multiple Sharia supervisory boards across MENA. AAOIFI sets the global standard for Islamic finance accounting and governance.',
              },
              {
                name: 'AMINA Bank (formerly SEBA Bank)',
                org: 'Switzerland',
                notes:
                  'Pioneered Sharia-compliant digital asset banking in partnership with Islamic finance scholars. Could serve as a precedent-setting reference.',
              },
            ].map((s) => (
              <div key={s.name} className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                <p className="font-semibold text-white">{s.name}</p>
                <p className="text-xs text-gray-500 mb-2">{s.org}</p>
                <p className="text-sm text-gray-400">{s.notes}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-4">
            Mentioning these scholars is informational only. None of them have reviewed or endorsed
            Shahin at this time. We are not affiliated with any of the institutions listed.
          </p>
        </div>

        {/* Our principles */}
        <div className="p-6 bg-gray-900/50 border border-gray-700 rounded-xl">
          <h2 className="text-xl font-bold mb-4">Our principles while we wait for a fatwa</h2>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 font-bold">1.</span>
              Spot-only trading — no leveraged positions in the real product until scholar review.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 font-bold">2.</span>
              No overnight swap fees — accounts will be swap-free.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 font-bold">3.</span>
              Meme coins and purely speculative tokens excluded from the tradeable list.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 font-bold">4.</span>
              No derivatives or futures until formal guidance obtained.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 font-bold">5.</span>
              Transparent disclosure: we will publish the full scholar opinion when obtained.
            </li>
          </ul>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="text-yellow-400 hover:text-yellow-300 text-sm transition"
          >
            Back to trading
          </Link>
        </div>
      </div>
    </div>
  )
}
