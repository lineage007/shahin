# Deployment Guide for Shahin

## Prerequisites

Before deploying, ensure you have:
1. ✅ GitHub repository (created at: https://github.com/lineage007/shahin)
2. ⚠️ CoinGecko API key (get from https://www.coingecko.com/en/api)
3. ⚠️ Supabase project (create at https://supabase.com)
4. ⚠️ Domain configured on Cloudflare (shahin.app)

## Step 1: Set Up Supabase

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Enter project name: "shahin"
4. Set database password (save it!)
5. Choose region (closest to your users)
6. Wait for project to be ready (~2 minutes)

### 1.2 Run Database Schema
1. In your Supabase project, go to "SQL Editor"
2. Copy the contents of `supabase-schema.sql`
3. Paste and click "Run"
4. Verify tables were created in "Table Editor"

### 1.3 Enable Google OAuth
1. Go to "Authentication" > "Providers"
2. Enable "Google" provider
3. Follow instructions to create OAuth credentials in Google Cloud Console:
   - Go to https://console.cloud.google.com
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret to Supabase

### 1.4 Get Supabase Credentials
1. Go to "Settings" > "API"
2. Copy:
   - Project URL (e.g., https://xxxxx.supabase.co)
   - Anon/Public Key (starts with eyJh...)

## Step 2: Get CoinGecko API Key

1. Go to https://www.coingecko.com/en/api
2. Sign up for free tier (50 calls/minute)
3. Verify your email
4. Get your API key from the dashboard

## Step 3: Deploy to Vercel

### 3.1 Connect GitHub Repository
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" > "Project"
3. Import `lineage007/shahin` from GitHub
4. Configure project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: (leave default)
   - Output Directory: (leave default)

### 3.2 Set Environment Variables
In Vercel project settings, add:

```
NEXT_PUBLIC_COINGECKO_API_KEY=your_coingecko_api_key_here
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...your_key_here
```

### 3.3 Deploy
1. Click "Deploy"
2. Wait for build to complete (~2-3 minutes)
3. Test the deployment URL (e.g., shahin.vercel.app)

## Step 4: Configure Custom Domain

### 4.1 In Vercel
1. Go to project "Settings" > "Domains"
2. Add domain: `shahin.app`
3. Copy the DNS target provided by Vercel

### 4.2 In Cloudflare
1. Go to Cloudflare DNS settings for `shahin.app`
2. Add/update CNAME record:
   - Type: `CNAME`
   - Name: `@`
   - Target: `cname.vercel-dns.com` (or the target Vercel provided)
   - Proxy status: Proxied (orange cloud)
3. Wait for DNS propagation (~5-10 minutes)

### 4.3 Update Supabase Redirect URLs
1. In Supabase, go to "Authentication" > "URL Configuration"
2. Add to "Site URL": `https://shahin.app`
3. Add to "Redirect URLs":
   - `https://shahin.app/auth/callback`
   - `https://shahin.vercel.app/auth/callback` (keep the Vercel one too)

## Step 5: Test the Deployment

### 5.1 Smoke Test
1. Visit https://shahin.app
2. Click "Sign Up" and create a test account
3. Verify you receive email confirmation (if enabled)
4. Sign in with the test account
5. Check that markets load with live prices
6. Click on a coin to open trading modal
7. Verify TradingView chart loads
8. Verify order book shows data
9. Place a test buy order (e.g., 0.001 BTC)
10. Check portfolio dashboard shows the holding
11. Place a test sell order
12. Verify P&L calculation
13. Check leaderboard shows your account

### 5.2 Mobile Test
1. Open https://shahin.app on mobile browser
2. Verify responsive layout works
3. Test trading flow on mobile

## Step 6: Verification Checklist

- [ ] Markets page loads with 50+ coins
- [ ] Prices update automatically (refresh after 30s)
- [ ] Fear & Greed Index displays
- [ ] Top gainers/losers/volume sections show data
- [ ] Click coin opens trading modal
- [ ] TradingView chart displays and works
- [ ] Order book shows bid/ask spread
- [ ] Can buy crypto with virtual USDT
- [ ] Can sell crypto holdings
- [ ] Portfolio shows holdings with current prices
- [ ] P&L calculations are correct
- [ ] Trade history shows all transactions
- [ ] Leaderboard ranks traders by P&L%
- [ ] Google OAuth sign-in works
- [ ] Email sign-up/sign-in works
- [ ] Navigation works between pages
- [ ] Dark theme displays correctly
- [ ] Mobile responsive layout works

## Troubleshooting

### Issue: Markets not loading
- Check CoinGecko API key is correct
- Check browser console for errors
- Verify API rate limit not exceeded (50 calls/min)

### Issue: Authentication not working
- Verify Supabase URL and key are correct
- Check redirect URLs are configured in Supabase
- Verify Google OAuth credentials are active

### Issue: Orders not executing
- Check browser console for errors
- Verify Supabase RLS policies are enabled
- Check database tables exist

### Issue: Domain not working
- Verify DNS settings in Cloudflare
- Check CNAME target is correct
- Wait for DNS propagation (can take up to 24h)
- Try clearing browser cache

### Issue: Build failing on Vercel
- Check environment variables are set
- Verify all dependencies are in package.json
- Check Vercel build logs for specific errors

## Monitoring

### Check Application Health
- Supabase Dashboard > Database > Query Performance
- Vercel Dashboard > Analytics
- Check error logs in Vercel Functions tab

### API Usage
- CoinGecko: Monitor API usage in dashboard
- Binance: Public API, no auth needed
- Supabase: Check database usage in project dashboard

## Security Notes

- Never commit `.env.local` to git
- Rotate API keys periodically
- Monitor Supabase auth logs for suspicious activity
- Enable Supabase RLS (Row Level Security) - already done in schema
- Use environment variables for all secrets

## Cost Estimate

| Service | Plan | Cost |
|---------|------|------|
| Vercel | Hobby | Free (then $20/month) |
| Supabase | Free | $0 (up to 500MB database) |
| CoinGecko | Free | $0 (up to 50 calls/min) |
| Cloudflare | Free | $0 |
| **Total** | | **$0-20/month** |

## Next Steps After Deployment

1. **Marketing**: Share the platform on crypto communities
2. **Analytics**: Set up Google Analytics or Plausible
3. **Feedback**: Create feedback form for users
4. **Improvements**: Monitor user behavior and iterate
5. **Scaling**: Upgrade plans as user base grows

---

**Need help?** Check the main README.md or open an issue on GitHub.
