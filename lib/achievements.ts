// Shahin Achievement System — Duolingo-style gamification for paper trading

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string           // emoji
  condition: (stats: TradingStats) => boolean
}

export interface TradingStats {
  totalTrades: number
  winCount: number       // trades where sell price > buy price
  lossCount: number      // trades where sell price <= buy price
  uniqueAssets: number   // number of distinct symbols ever traded
  hasSoldAtLeastOnce: boolean
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_trade',
    title: 'First Trade',
    description: 'You placed your first paper trade. Every journey starts here.',
    icon: '🌟',
    condition: (s) => s.totalTrades >= 1,
  },
  {
    id: 'ten_trades',
    title: 'Active Trader',
    description: 'Completed 10 trades. You are learning the rhythm.',
    icon: '🔟',
    condition: (s) => s.totalTrades >= 10,
  },
  {
    id: 'first_win',
    title: 'First Win',
    description: 'Sold at a profit. Risk managed, reward earned.',
    icon: '✅',
    condition: (s) => s.winCount >= 1,
  },
  {
    id: 'first_loss',
    title: 'Learned the Hard Way',
    description: 'Took a loss — and did not quit. That is how professionals are made.',
    icon: '📉',
    condition: (s) => s.lossCount >= 1,
  },
  {
    id: 'diversified',
    title: 'Diversified',
    description: 'Traded 5 different assets. Diversification is the only free lunch.',
    icon: '🌐',
    condition: (s) => s.uniqueAssets >= 5,
  },
]

// Compute which achievements a user has earned given their trade history
export function computeEarnedAchievements(
  trades: Array<{ type: string; symbol: string; price: number }>,
  // Map of symbol -> avg_buy_price used to determine win/loss on sells
  avgBuyPrices: Record<string, number>
): Set<string> {
  let winCount = 0
  let lossCount = 0
  const symbols = new Set<string>()

  for (const t of trades) {
    symbols.add(t.symbol)
    if (t.type === 'sell') {
      const avgBuy = avgBuyPrices[t.symbol]
      if (avgBuy !== undefined) {
        if (t.price > avgBuy) winCount++
        else lossCount++
      }
    }
  }

  const stats: TradingStats = {
    totalTrades: trades.length,
    winCount,
    lossCount,
    uniqueAssets: symbols.size,
    hasSoldAtLeastOnce: trades.some((t) => t.type === 'sell'),
  }

  const earned = new Set<string>()
  for (const achievement of ACHIEVEMENTS) {
    if (achievement.condition(stats)) {
      earned.add(achievement.id)
    }
  }
  return earned
}
