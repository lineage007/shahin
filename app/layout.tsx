import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { Navigation } from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Shahin - Crypto Prop Trading Challenge',
  description:
    'Paper-trade the top cryptocurrencies against live market data. Practice two-phase prop-firm challenge rules with real drawdown, daily-loss, and profit targets — no real money required.',
  metadataBase: new URL('https://shahin.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Shahin — Crypto Prop Trading Challenge',
    description:
      'Trade the top 20 cryptocurrencies with live prices and real prop-firm rules. Paper only. No capital at risk.',
    url: 'https://shahin.app',
    siteName: 'Shahin',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Shahin crypto prop trading platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shahin — Crypto Prop Trading Challenge',
    description:
      'Trade top cryptos with live prices and prop-firm rules. Paper mode only.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-950 text-white`}>
        <AuthProvider>
          <Navigation />
          {/* Persistent compliance banner — spec requirement */}
          <div className="w-full bg-yellow-900/20 border-b border-yellow-700/30 px-4 py-2 text-center text-xs text-yellow-400/80">
            Paper trading only. ADGM FSP application in progress. Crypto markets are volatile. This is not financial advice.
            Past performance does not predict future returns.
          </div>
          <main className="min-h-screen">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}
