// Server-side CoinGecko price proxy
// F10 fix: CoinGecko API key is accessed here using the server-only
// COINGECKO_API_KEY env var (no NEXT_PUBLIC_ prefix), so it is never
// bundled into the browser. All client-side price fetches should call
// /api/prices instead of CoinGecko directly.

import { NextRequest, NextResponse } from 'next/server'
import { buildUpstreamUrl } from '@/lib/pricesProxy'

export async function GET(req: NextRequest) {
  const target = buildUpstreamUrl(new URL(req.url).searchParams)
  if ('error' in target) {
    return NextResponse.json({ error: target.error }, { status: 400 })
  }

  const headers: Record<string, string> = {}
  const apiKey = process.env.COINGECKO_API_KEY // server-only
  if (apiKey) headers['x-cg-demo-api-key'] = apiKey

  try {
    const res = await fetch(target.url, { headers, cache: 'no-store' })
    const data = await res.json()

    return NextResponse.json(data, {
      status: res.ok ? 200 : res.status,
      headers: {
        'Cache-Control': 'public, max-age=15, stale-while-revalidate=30',
      },
    })
  } catch (err) {
    console.error('[api/prices] CoinGecko fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch prices' }, { status: 503 })
  }
}
