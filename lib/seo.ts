import type { Metadata } from 'next'

export const SITE_URL = 'https://shahin.app'

// Next.js replaces (does not merge) openGraph/twitter objects set in a child
// segment, so pages that override them must spread these shared fields.
export const baseOpenGraph: NonNullable<Metadata['openGraph']> = {
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
}

export const baseTwitter: NonNullable<Metadata['twitter']> = {
  card: 'summary_large_image',
  images: ['/og-image.png'],
}

export function pageMetadata(path: string, title: string, description: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { ...baseOpenGraph, title, description, url: `${SITE_URL}${path}` },
    twitter: { ...baseTwitter, title, description },
  }
}
