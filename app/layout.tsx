import type { Metadata, Viewport } from 'next'
import { Schibsted_Grotesk, Fragment_Mono } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/site/Footer'
import { baseOpenGraph, baseTwitter } from '@/lib/seo'

const sans = Schibsted_Grotesk({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })
const mono = Fragment_Mono({ subsets: ['latin'], weight: '400', variable: '--font-mono', display: 'swap' })

const title = 'Shahin: crypto paper trading with prop challenge rules'
const description =
  'Paper-trade 20 major cryptocurrencies at live prices with $100,000 in virtual USDT, under two-phase prop challenge rules. Free. No deposits, no fees, no payouts.'

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL('https://shahin.app'),
  applicationName: 'Shahin',
  alternates: { canonical: '/' },
  openGraph: { ...baseOpenGraph, title, description, url: 'https://shahin.app' },
  twitter: { ...baseTwitter, title, description },
}

export const viewport: Viewport = { themeColor: '#0b0e13', colorScheme: 'dark' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${sans.variable} ${mono.variable}`}>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <AuthProvider>
          <Navigation />
          <p className="paper-strip">
            <span className="mono">PAPER ONLY</span> No real money is deposited, traded or paid out.
          </p>
          <main id="main">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
