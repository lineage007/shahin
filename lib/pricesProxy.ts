// Validation for the /api/prices CoinGecko proxy.
// Only exact endpoint names and known query params are forwarded, so the
// server-side API key cannot be used to reach any other CoinGecko endpoint
// (e.g. via "coins/markets/../../coins/list" path traversal).

import { TRADEABLE_ASSETS } from './api'

export const COINGECKO_BASE = 'https://api.coingecko.com/api/v3'

const ALLOWED_PARAMS: Record<string, string[]> = {
  'simple/price': ['ids', 'vs_currencies', 'include_24hr_change'],
  'coins/markets': ['ids', 'vs_currency', 'order', 'per_page', 'page', 'sparkline', 'price_change_percentage'],
}

const VALID_IDS = new Set(TRADEABLE_ASSETS.map((a) => a.id))

export type ProxyTarget = { url: string } | { error: string }

export function buildUpstreamUrl(searchParams: URLSearchParams): ProxyTarget {
  const endpoint = searchParams.get('endpoint') || 'simple/price'
  const allowedParams = ALLOWED_PARAMS[endpoint]
  if (!allowedParams) return { error: 'Endpoint not allowed' }

  const ids = searchParams.get('ids')
  if (!ids) return { error: 'Missing ids' }
  const invalid = ids.split(',').filter((id) => !VALID_IDS.has(id))
  if (invalid.length > 0) return { error: `Invalid coin IDs: ${invalid.join(', ')}` }

  const url = new URL(`${COINGECKO_BASE}/${endpoint}`)
  for (const key of allowedParams) {
    const value = searchParams.get(key)
    if (value !== null) url.searchParams.set(key, value)
  }
  return { url: url.toString() }
}
