// CoinGecko API
const COINGECKO_API_KEY = process.env.NEXT_PUBLIC_COINGECKO_API_KEY

// Canonical list of tradeable paper-trading assets
// CoinGecko IDs used for price lookups
export const TRADEABLE_ASSETS: { id: string; symbol: string; name: string }[] = [
  { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'eth', name: 'Ethereum' },
  { id: 'solana', symbol: 'sol', name: 'Solana' },
  { id: 'avalanche-2', symbol: 'avax', name: 'Avalanche' },
  { id: 'matic-network', symbol: 'matic', name: 'Polygon' },
  { id: 'arbitrum', symbol: 'arb', name: 'Arbitrum' },
  { id: 'optimism', symbol: 'op', name: 'Optimism' },
  { id: 'polkadot', symbol: 'dot', name: 'Polkadot' },
  { id: 'cardano', symbol: 'ada', name: 'Cardano' },
  { id: 'chainlink', symbol: 'link', name: 'Chainlink' },
  { id: 'uniswap', symbol: 'uni', name: 'Uniswap' },
  { id: 'aave', symbol: 'aave', name: 'Aave' },
  { id: 'near', symbol: 'near', name: 'NEAR Protocol' },
  { id: 'fantom', symbol: 'ftm', name: 'Fantom' },
  { id: 'cosmos', symbol: 'atom', name: 'Cosmos' },
  { id: 'injective-protocol', symbol: 'inj', name: 'Injective' },
  { id: 'celestia', symbol: 'tia', name: 'Celestia' },
  { id: 'jito-governance-token', symbol: 'jto', name: 'Jito' },
  { id: 'sui', symbol: 'sui', name: 'Sui' },
  { id: 'aptos', symbol: 'apt', name: 'Aptos' },
]

export interface CoinData {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  total_volume: number
  image: string
}

// Fetch real-time prices for the canonical tradeable asset list
// Returns a map of { coingecko-id -> price in USD }
export async function fetchTradeableAssetPrices(): Promise<Record<string, number>> {
  try {
    const ids = TRADEABLE_ASSETS.map((a) => a.id).join(',')
    const headers: HeadersInit = {}
    if (COINGECKO_API_KEY) {
      headers['x-cg-demo-api-key'] = COINGECKO_API_KEY
    }
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
      { headers, cache: 'no-store' }
    )
    if (!response.ok) throw new Error('Failed to fetch tradeable asset prices')
    const data = await response.json()
    const result: Record<string, number> = {}
    for (const asset of TRADEABLE_ASSETS) {
      if (data[asset.id]?.usd) {
        result[asset.id] = data[asset.id].usd
      }
    }
    return result
  } catch (error) {
    console.error('Error fetching tradeable asset prices:', error)
    return {}
  }
}

export async function fetchTopCoins(limit: number = 50): Promise<CoinData[]> {
  try {
    const headers: HeadersInit = {}
    if (COINGECKO_API_KEY) {
      headers['x-cg-demo-api-key'] = COINGECKO_API_KEY
    }

    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h`,
      { headers, next: { revalidate: 30 } }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch coins')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching coins:', error)
    return []
  }
}

export async function fetchCoinPrice(coinId: string): Promise<number | null> {
  try {
    const headers: HeadersInit = {}
    if (COINGECKO_API_KEY) {
      headers['x-cg-demo-api-key'] = COINGECKO_API_KEY
    }

    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`,
      { headers, cache: 'no-store' }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch coin price')
    }

    const data = await response.json()
    return data[coinId]?.usd || null
  } catch (error) {
    console.error('Error fetching coin price:', error)
    return null
  }
}

// Binance API for Order Book
export interface OrderBookData {
  bids: [string, string][]
  asks: [string, string][]
}

export async function fetchOrderBook(symbol: string): Promise<OrderBookData | null> {
  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/depth?symbol=${symbol.toUpperCase()}USDT&limit=20`,
      { cache: 'no-store' }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch order book')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching order book:', error)
    return null
  }
}

// Fear & Greed Index
export interface FearGreedData {
  value: string
  value_classification: string
}

export async function fetchFearGreedIndex(): Promise<FearGreedData | null> {
  try {
    const response = await fetch('https://api.alternative.me/fng/', {
      next: { revalidate: 3600 }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch fear & greed index')
    }

    const data = await response.json()
    return data.data[0]
  } catch (error) {
    console.error('Error fetching fear & greed index:', error)
    return null
  }
}
