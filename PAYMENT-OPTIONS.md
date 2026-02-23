# Shahin Payment Options (Phase 3)

**Goal:** Accept crypto payments for prop challenge fees with zero setup, no company registration, instant settlement.

---

## Option 1: NOWPayments ⭐ RECOMMENDED

**Pros:**
- No KYC for merchants (just email + wallet)
- Accepts 200+ cryptocurrencies
- Auto-convert to stablecoin (USDT)
- API + embeddable checkout
- 0.5% fee (lowest in market)
- Setup time: 5 minutes

**Cons:**
- Need to provide payout wallet (use Gary's Binance USDT address)

**Integration:**
- Drop-in checkout widget
- API for custom UI
- WebSocket for payment status
- No need for business license

**Cost:**
- Challenge fee: $100-500
- NOWPayments fee: $0.50-2.50
- Net: $97.50-497.50

---

## Option 2: CoinPayments

**Pros:**
- Established (2013)
- Supports 2000+ coins
- Shopping cart plugins
- Merchant tools

**Cons:**
- 0.5% fee PLUS 0.5% withdrawal fee = 1% total
- More complex setup
- KYC required for higher volumes

---

## Option 3: Binance Pay (Direct)

**Pros:**
- Zero fees (Binance subsidizes)
- Direct to Gary's Binance account
- Instant settlement
- QR code payment

**Cons:**
- Users MUST have Binance account (friction)
- Binance Pay merchant approval needed (2-3 days)
- Less crypto variety (only top 50 coins)

---

## Option 4: Manual Wallet Payments (Simplest for MVP)

**How it works:**
1. User selects challenge ($100, $250, $500)
2. Show payment address (Gary's Binance USDT deposit address)
3. Show QR code
4. User sends crypto
5. We manually verify payment via Binance transaction history
6. Activate challenge manually

**Pros:**
- Zero setup
- Zero fees (direct wallet-to-wallet)
- No third party
- Start TODAY

**Cons:**
- Manual verification (not instant)
- Requires trust (but can show TX on blockchain)
- Doesn't scale beyond 50 users/month

---

## RECOMMENDATION FOR WEEK 1

**Use Manual Wallet + NOWPayments hybrid:**

**Week 1-2 (MVP):** Manual payments
- Show Binance wallet QR code
- User pays USDT directly
- We verify on Binance, activate challenge
- Good for first 10-20 users (validate product)

**Week 3+ (Scale):** NOWPayments
- 5-minute integration
- Auto-verify payments via API
- Scales to 1000+ users
- Still no company/license needed

---

## Gary's Binance Receiving Address

**For USDT (TRC20 - cheapest):**
- Get from Gary's Binance account → Deposit → USDT → TRC20 network
- Copy address (starts with T...)
- This is what we show users for manual payment

**For BTC:**
- Binance → Deposit → BTC → Copy address
- Higher fees, slower (15-30 min confirmation)

**For ETH/USDC:**
- Binance → Deposit → ETH/USDC → Copy address
- Medium fees

---

## Implementation Plan (Phase 3)

**Step 1:** Get Binance addresses from Gary (USDT TRC20, BTC, ETH)

**Step 2:** Build payment page:
- User selects challenge tier
- Shows price in USD + crypto equivalent
- Displays QR code + wallet address
- "Payment sent? Click here" button
- We manually check Binance

**Step 3:** Once validated (10-20 successful payments), integrate NOWPayments API for auto-verification

**Step 4:** Scale

---

**Written:** Feb 23, 2026, 23:10 GST  
**Status:** Ready for Phase 3 implementation (later this week)
