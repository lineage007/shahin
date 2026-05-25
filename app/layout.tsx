import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { Navigation } from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Shahin - Crypto Prop Trading',
  description: 'Paper trading platform for cryptocurrency markets',
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
