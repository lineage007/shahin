import { ImageResponse } from 'next/og'

// Served at /og-image.png, which the root metadata references for
// Open Graph and Twitter cards. The file did not exist before (404).
export const dynamic = 'force-static'

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: '#030712',
          color: '#ffffff',
        }}
      >
        <div style={{ fontSize: 36, color: '#60a5fa', letterSpacing: 4, textTransform: 'uppercase' }}>
          Shahin
        </div>
        <div style={{ fontSize: 76, fontWeight: 700, marginTop: 24, lineHeight: 1.1 }}>
          Crypto Prop Trading Challenge
        </div>
        <div style={{ fontSize: 34, color: '#9ca3af', marginTop: 32 }}>
          Paper trading with live market data. No real money.
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
