import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Pricing | Shahin',
  description:
    'Paper trading on Shahin is free. Paid prop challenges are not on sale; see the planned challenge format, rules and fees.',
  alternates: { canonical: '/pricing' },
  openGraph: { url: 'https://shahin.app/pricing' },
}

export default function PricingLayout({ children }: { children: ReactNode }) {
  return children
}
