// Server-side CoinGecko price proxy
// F10 fix: CoinGecko API key is accessed here using the server-only
// COINGECKO_API_KEY env var (no NEXT_PUBLIC_ prefix), so it is never
// bundled into the browser. All client-side price fetches should call
// /api/prices instead of CoinGecko directly.

import { NextRequest, NextResponse } from 'next/server'
import { TRADEABLE_ASSETS } from '@/lib/api'

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const ids = searchParams.get('ids')
  const endpoint = searchParams.get('endpoint') || 'simple/price'

  const headers: Record<string, string> = {}
  const apiKey = process.env.COINGECKO_API_KEY // server-only
  if (apiKey) headers['x-cg-demo-api-key'] = apiKey

  // Allow only the canonical asset list IDs (no arbitrary proxy)
  if (ids) {
    const requested = ids.split(',')
    const validIds = TRADEABLE_ASSETS.map((a) => a.id)
    const invalid = requested.filter((id) => !validIds.includes(id))
    if (invalid.length > 0) {
      return NextResponse.json(
        { error: `Invalid coin IDs: ${invalid.join(', ')}` },
        { status: 400 }
      )
    }
  }

  // Only proxy safe CoinGecko endpoints
  const allowedEndpoints = ['simple/price', 'coins/markets']
  if (!allowedEndpoints.some((e) => endpoint.startsWith(e))) {
    return NextResponse.json({ error: 'Endpoint not allowed' }, { status: 400 })
  }

  const upstreamUrl = new URL(`${COINGECKO_BASE}/${endpoint}`)
  // Forward all non-endpoint query params to CoinGecko
  searchParams.forEach((value, key) => {
    if (key !== 'endpoint') upstreamUrl.searchParams.set(key, value)
  })

  try {
    const res = await fetch(upstreamUrl.toString(), { headers, cache: 'no-store' })
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
