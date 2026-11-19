import type { ReactNode } from 'react'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata(
  '/pricing',
  'Pricing: free paper trading | Shahin',
  'Shahin is free. One plan, $0, with $100,000 in virtual USDT, live crypto prices and five virtual prop challenge sizes. No deposits, no fees, no payouts.'
)

export default function PricingLayout({ children }: { children: ReactNode }) {
  return children
}
