import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN", // SAMEORIGIN allows TradingView widget iframes from same origin
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    // CSP report-only first — TradingView widgets require relaxed frame-src.
    // switch to Content-Security-Policy (non-report-only) after verifying no violations.
    key: "Content-Security-Policy-Report-Only",
    value: [
      "default-src 'self'",
      // Next.js inline scripts / React hydration
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://s3.tradingview.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      // TradingView chart widget is embedded via iframe
      "frame-src 'self' https://s.tradingview.com https://www.tradingview.com",
      // CoinGecko / Binance / alternative.me API calls from browser
      "connect-src 'self' https://api.coingecko.com https://api.binance.com https://api.alternative.me https://*.supabase.co wss://*.supabase.co",
      "img-src 'self' data: https://coin-images.coingecko.com https://assets.coingecko.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
