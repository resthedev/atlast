import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import type { LeaderboardEntry } from '@/types'

const LEADERBOARD_LIMIT = 10
const REFRESH_INTERVAL_MS = 60_000

export function useLeaderboard(refreshKey?: number) {
  const { user } = useAuth()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLeaderboard = useCallback(async () => {
    const { data, error } = await supabase.rpc('get_leaderboard', {
      result_limit: LEADERBOARD_LIMIT,
    })

    if (error) {
      console.error('Failed to fetch leaderboard:', error)
      return
    }

    setEntries(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!user) {
      setEntries([])
      setLoading(false)
      return
    }

    fetchLeaderboard()

    const interval = setInterval(fetchLeaderboard, REFRESH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [user, fetchLeaderboard, refreshKey])

  return { entries, loading }
}
