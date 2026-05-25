import { supabase } from './supabase'

export async function createPortfolio(userId: string) {
  const { data, error } = await supabase
    .from('portfolios')
    .insert([
      {
        user_id: userId,
        balance_usdt: 100000,
        total_trades: 0,
        win_rate: 0,
        pnl_total: 0,
        pnl_percent: 0,
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getPortfolio(userId: string) {
  const { data, error } = await supabase
    .from('portfolios')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code === 'PGRST116') {
    // Portfolio doesn't exist, create it
    return await createPortfolio(userId)
  }

  if (error) throw error
  return data
}

export async function getHoldings(userId: string) {
  const { data, error } = await supabase
    .from('holdings')
    .select('*')
    .eq('user_id', userId)

  if (error) throw error
  return data || []
}

export async function getTrades(userId: string) {
  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })

  if (error) throw error
  return data || []
}

export async function executeBuy(
  userId: string,
  symbol: string,
  amount: number,
  price: number
) {
  const totalCost = amount * price

  // Get portfolio
  const portfolio = await getPortfolio(userId)

  if (portfolio.balance_usdt < totalCost) {
    throw new Error('Insufficient balance')
  }

  // Deduct balance
  const { error: updateError } = await supabase
    .from('portfolios')
    .update({
      balance_usdt: portfolio.balance_usdt - totalCost,
      total_trades: portfolio.total_trades + 1,
    })
    .eq('user_id', userId)

  if (updateError) throw updateError

  // Record trade
  const { error: tradeError } = await supabase
    .from('trades')
    .insert([
      {
        user_id: userId,
        symbol,
        type: 'buy',
        amount,
        price,
        total_usdt: totalCost,
        status: 'completed',
      },
    ])

  if (tradeError) throw tradeError

  // Update or create holding
  const { data: existingHolding } = await supabase
    .from('holdings')
    .select('*')
    .eq('user_id', userId)
    .eq('symbol', symbol)
    .single()

  if (existingHolding) {
    const newAmount = existingHolding.amount + amount
    const newAvgPrice =
      (existingHolding.avg_buy_price * existingHolding.amount + price * amount) /
      newAmount

    const { error: holdingError } = await supabase
      .from('holdings')
      .update({
        amount: newAmount,
        avg_buy_price: newAvgPrice,
      })
      .eq('id', existingHolding.id)

    if (holdingError) throw holdingError
  } else {
    const { error: holdingError } = await supabase
      .from('holdings')
      .insert([
        {
          user_id: userId,
          symbol,
          amount,
          avg_buy_price: price,
        },
      ])

    if (holdingError) throw holdingError
  }

  return { success: true }
}

export async function executeSell(
  userId: string,
  symbol: string,
  amount: number,
  price: number,
  allCurrentPrices: Record<string, number> = {}
) {
  // Get holding
  const { data: holding } = await supabase
    .from('holdings')
    .select('*')
    .eq('user_id', userId)
    .eq('symbol', symbol)
    .single()

  if (!holding || holding.amount < amount) {
    throw new Error('Insufficient holding')
  }

  const totalValue = amount * price
  const profit = (price - holding.avg_buy_price) * amount

  // Get portfolio
  const portfolio = await getPortfolio(userId)

  // Calculate win rate
  const trades = await getTrades(userId)
  const profitableTrades = trades.filter((t) => {
    if (t.type === 'sell') {
      // Find corresponding buy
      const buyTrades = trades.filter(
        (bt) => bt.type === 'buy' && bt.symbol === t.symbol && bt.timestamp < t.timestamp
      )
      if (buyTrades.length > 0) {
        return t.price > buyTrades[0].price
      }
    }
    return false
  })

  const winRate =
    portfolio.total_trades > 0
      ? ((profitableTrades.length + (profit > 0 ? 1 : 0)) /
          (portfolio.total_trades + 1)) *
        100
      : profit > 0
      ? 100
      : 0

  const newPnlTotal = portfolio.pnl_total + profit
  const initialBalance = 100000
  const currentBalance = portfolio.balance_usdt + totalValue
  // Pass real-time prices for remaining holdings; sold symbol excluded below
  const pricesForRemaining = { ...allCurrentPrices, [symbol]: price }
  const totalValue_portfolio = currentBalance + (await getHoldingsValue(userId, pricesForRemaining, symbol, amount))
  const newPnlPercent = ((totalValue_portfolio - initialBalance) / initialBalance) * 100

  // Update balance and stats
  const { error: updateError } = await supabase
    .from('portfolios')
    .update({
      balance_usdt: portfolio.balance_usdt + totalValue,
      total_trades: portfolio.total_trades + 1,
      win_rate: winRate,
      pnl_total: newPnlTotal,
      pnl_percent: newPnlPercent,
    })
    .eq('user_id', userId)

  if (updateError) throw updateError

  // Record trade
  const { error: tradeError } = await supabase
    .from('trades')
    .insert([
      {
        user_id: userId,
        symbol,
        type: 'sell',
        amount,
        price,
        total_usdt: totalValue,
        status: 'completed',
      },
    ])

  if (tradeError) throw tradeError

  // Update holding
  const newAmount = holding.amount - amount

  if (newAmount > 0) {
    const { error: holdingError } = await supabase
      .from('holdings')
      .update({ amount: newAmount })
      .eq('id', holding.id)

    if (holdingError) throw holdingError
  } else {
    const { error: holdingError } = await supabase
      .from('holdings')
      .delete()
      .eq('id', holding.id)

    if (holdingError) throw holdingError
  }

  return { success: true, profit }
}

// excludeSymbol / excludeAmount: used by executeSell to reflect post-sale state
// before the DB update has committed
async function getHoldingsValue(
  userId: string,
  prices: Record<string, number>,
  excludeSymbol?: string,
  excludeAmount?: number
): Promise<number> {
  const holdings = await getHoldings(userId)
  return holdings.reduce((sum, h) => {
    const currentPrice = prices[h.symbol] || h.avg_buy_price
    let effectiveAmount = h.amount
    if (h.symbol === excludeSymbol && excludeAmount !== undefined) {
      effectiveAmount = Math.max(0, h.amount - excludeAmount)
    }
    return sum + effectiveAmount * currentPrice
  }, 0)
}

export async function getLeaderboard() {
  const { data, error } = await supabase
    .from('portfolios')
    .select(
      `
      *,
      user:user_id (
        email
      )
    `
    )
    .eq('leaderboard_opt_in', true)
    .order('pnl_percent', { ascending: false })
    .limit(100)

  if (error) throw error
  return data || []
}

export async function updateLeaderboardOptIn(
  userId: string,
  optIn: boolean,
  displayName?: string
) {
  const { error } = await supabase
    .from('portfolios')
    .update({
      leaderboard_opt_in: optIn,
      ...(displayName !== undefined ? { display_name: displayName } : {}),
    })
    .eq('user_id', userId)

  if (error) throw error
}
