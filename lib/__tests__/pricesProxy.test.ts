import { describe, expect, it } from 'vitest'
import { buildUpstreamUrl } from '../pricesProxy'

const q = (s: string) => new URLSearchParams(s)

describe('buildUpstreamUrl', () => {
  it('builds the simple/price URL used by the app', () => {
    const r = buildUpstreamUrl(q('endpoint=simple%2Fprice&ids=bitcoin,ethereum&vs_currencies=usd'))
    expect(r).toEqual({
      url: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin%2Cethereum&vs_currencies=usd',
    })
  })

  it('defaults to simple/price', () => {
    const r = buildUpstreamUrl(q('ids=bitcoin&vs_currencies=usd'))
    expect('url' in r && r.url.startsWith('https://api.coingecko.com/api/v3/simple/price?')).toBe(true)
  })

  it.each([
    'coins/markets/../../coins/list',
    'coins/markets/../../global',
    'coins/marketsX',
    'coins/list',
    '../simple/price',
    'constructor',
    '__proto__',
    'toString',
  ])('rejects endpoint %s', (endpoint) => {
    const r = buildUpstreamUrl(q(`endpoint=${encodeURIComponent(endpoint)}&ids=bitcoin`))
    expect(r).toEqual({ error: 'Endpoint not allowed' })
  })

  it('requires ids from the tradeable list', () => {
    expect(buildUpstreamUrl(q('vs_currencies=usd'))).toEqual({ error: 'Missing ids' })
    expect(buildUpstreamUrl(q('ids=bitcoin,dogwifhat'))).toEqual({ error: 'Invalid coin IDs: dogwifhat' })
  })

  it('drops unknown query params', () => {
    const r = buildUpstreamUrl(q('ids=bitcoin&vs_currencies=usd&x_cg_pro_api_key=abc&endpoint=simple/price'))
    expect('url' in r && r.url).toBe('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
  })
})
