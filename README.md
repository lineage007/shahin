# Shahin - Crypto Prop Trading Platform

A paper trading platform for cryptocurrency markets with live market data, TradingView charts, order books, and a competitive leaderboard.

## Features

### Phase 1: Live Market Data
- ✅ Real-time cryptocurrency prices (top 50 coins)
- ✅ TradingView chart integration with multiple timeframes
- ✅ Live order book from Binance
- ✅ Market stats dashboard (top gainers/losers, volume leaders)
- ✅ Fear & Greed Index

### Phase 2: Paper Trading
- ✅ User authentication (Google OAuth + Email)
- ✅ Virtual portfolio system ($100,000 starting balance)
- ✅ Buy/sell execution at market prices
- ✅ Portfolio dashboard with holdings and P&L tracking
- ✅ Trade history
- ✅ Leaderboard with rankings

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL + Auth)
- **APIs**: CoinGecko (market data), Binance (order book), TradingView (charts)
- **Deployment**: Vercel

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd shahin
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the SQL Editor, run the contents of `supabase-schema.sql`
3. Enable Google OAuth in Authentication > Providers
4. Copy your project URL and anon key

### 3. Get API Keys

#### CoinGecko API (Free Tier)
1. Sign up at [coingecko.com/en/api](https://www.coingecko.com/en/api)
2. Get your free API key (50 calls/min limit)

### 4. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # server only, used by /api/trade
COINGECKO_API_KEY=...           # server only, optional (public rate limits apply without it)
```

Do not use `NEXT_PUBLIC_COINGECKO_API_KEY`: a `NEXT_PUBLIC_` prefix ships the key to the browser.

Without the two `NEXT_PUBLIC_SUPABASE_*` values the app still builds and runs, but sign-in is replaced by an "Accounts are not open yet" notice. The same variables must be set in the Vercel project for production sign-in to work.

### Database migrations

Run `supabase-schema.sql`, then the files in `migrations/` in order (RLS leaderboard fix, `last_trade_date`, atomic trade RPCs). `/api/trade` falls back to a non-atomic path if migration 003 is missing.

### 5. Run Development Server

```bash
npm run dev
```

### Checks

```bash
npm run lint
npm run typecheck
npm test        # vitest
npm run build
```

The same checks run in GitHub Actions on every pull request and on `main`.

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

The Vercel project `shahin-app` deploys `main` from GitHub automatically (production at https://shahin.app). Ship changes through pull requests to `main`. Avoid `vercel deploy` from a local copy: it bypasses CI and can roll production back to older code.

### Configure Domain (Cloudflare)

1. Go to Cloudflare DNS settings for `shahin.app`
2. Add CNAME record:
   - Type: `CNAME`
   - Name: `@` (or `www`)
   - Target: Your Vercel deployment URL (e.g., `shahin.vercel.app`)
3. Update Vercel to use custom domain

## Usage

### For Traders

1. **Sign up** with Google or Email
2. You start with **$100,000 virtual USDT**
3. **Browse markets** on the home page
4. **Click on any coin** to open the trading modal
5. **Buy or sell** using the trade form
6. **Track performance** in your portfolio dashboard
7. **Compete** on the leaderboard

### Testing Checklist

- [ ] Create a test account
- [ ] Place 5 paper trades:
  - [ ] Buy 0.01 BTC
  - [ ] Sell 0.005 BTC
  - [ ] Buy 1 ETH
  - [ ] Buy 100 XRP
  - [ ] Sell 50 XRP
- [ ] Verify P&L calculations in portfolio
- [ ] Check leaderboard updates
- [ ] Test on mobile viewport

## Database Schema

### portfolios
- `id`: UUID (primary key)
- `user_id`: UUID (references auth.users)
- `balance_usdt`: DECIMAL (starting at 100000)
- `total_trades`: INT
- `win_rate`: DECIMAL (percentage)
- `pnl_total`: DECIMAL (total profit/loss in USDT)
- `pnl_percent`: DECIMAL (P&L percentage)
- `created_at`: TIMESTAMP

### trades
- `id`: UUID (primary key)
- `user_id`: UUID (references auth.users)
- `symbol`: TEXT (coin ID from CoinGecko)
- `type`: TEXT ('buy' or 'sell')
- `amount`: DECIMAL (quantity of coin)
- `price`: DECIMAL (execution price in USDT)
- `total_usdt`: DECIMAL (total transaction value)
- `timestamp`: TIMESTAMP
- `status`: TEXT ('completed')

### holdings
- `id`: UUID (primary key)
- `user_id`: UUID (references auth.users)
- `symbol`: TEXT (coin ID)
- `amount`: DECIMAL (quantity held)
- `avg_buy_price`: DECIMAL (average purchase price)
- `created_at`: TIMESTAMP

## Features Roadmap

### Future Enhancements
- [ ] Limit orders (execute when price hits target)
- [ ] Stop-loss orders
- [ ] Historical P&L chart
- [ ] Social features (follow traders, copy trades)
- [ ] Trading competitions
- [ ] Mobile app (React Native)
- [ ] Advanced analytics (Sharpe ratio, max drawdown)
- [ ] Paper money reset option
- [ ] Export trade history as CSV

## API Rate Limits

- **CoinGecko Free**: 50 calls/minute
- **Binance Public API**: No auth required, rate limits apply
- **TradingView**: Free widget, no API key needed

## Support

For issues or questions:
- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)
- Email: support@shahin.app

## License

MIT License - feel free to use this for learning or commercial projects.

---

**Built with ❤️ for the crypto trading community**
