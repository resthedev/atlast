import { createContext, useContext, useState, type ReactNode } from 'react'
import { useVisitedCountries } from '@/hooks/useVisitedCountries'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'
import type { User } from '@supabase/supabase-js'

interface TravelLogContextType {
  // Auth
  user: User | null
  authLoading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  // Visited countries
  visitedSet: Set<string>
  toggleVisit: (numericCode: string) => Promise<void>
  visitedCount: number
  visitedLoading: boolean
  leaderboardRefreshKey: number
  // Toast
  toastMessage: string
  toastVisible: boolean
  showToast: (msg: string) => void
  hideToast: () => void
}

const TravelLogContext = createContext<TravelLogContextType | null>(null)

export function TravelLogProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading, signInWithGoogle, signOut } = useAuth()
  const toast = useToast()
  const [leaderboardRefreshKey, setLeaderboardRefreshKey] = useState(0)
  const visited = useVisitedCountries(toast.showToast, () =>
    setLeaderboardRefreshKey((key) => key + 1)
  )

  return (
    <TravelLogContext.Provider
      value={{
        user,
        authLoading,
        signInWithGoogle,
        signOut,
        visitedSet: visited.visitedSet,
        toggleVisit: visited.toggleVisit,
        visitedCount: visited.visitedCount,
        visitedLoading: visited.loading,
        leaderboardRefreshKey,
        toastMessage: toast.message,
        toastVisible: toast.visible,
        showToast: toast.showToast,
        hideToast: toast.hideToast,
      }}
    >
      {children}
    </TravelLogContext.Provider>
  )
}

export function useTravelLog() {
  const ctx = useContext(TravelLogContext)
  if (!ctx) throw new Error('useTravelLog must be used within TravelLogProvider')
  return ctx
}
