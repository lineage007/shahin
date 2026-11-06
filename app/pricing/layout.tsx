import type { ReactNode } from 'react'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata(
  '/pricing',
  'Pricing | Shahin',
  'Paper trading on Shahin is free. Paid prop challenges are not on sale; see the planned challenge format, rules and fees.'
)

export default function PricingLayout({ children }: { children: ReactNode }) {
  return children
}
