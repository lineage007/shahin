import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null

export function getSupabase() {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables')
    }
    
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }
  
  return supabaseInstance
}

// For backward compatibility
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabase()[prop as keyof SupabaseClient]
  }
})

export type Profile = {
  id: string
  email: string
  created_at: string
}

export type Portfolio = {
  id: string
  user_id: string
  balance_usdt: number
  total_trades: number
  win_rate: number
  pnl_total: number
  pnl_percent: number
  created_at: string
}

export type Trade = {
  id: string
  user_id: string
  symbol: string
  type: 'buy' | 'sell'
  amount: number
  price: number
  total_usdt: number
  timestamp: string
  status: string
}

export type Holding = {
  id: string
  user_id: string
  symbol: string
  amount: number
  avg_buy_price: number
  created_at: string
}
