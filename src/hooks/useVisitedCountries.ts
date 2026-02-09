import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { getAlpha3, numericCodeFromAlpha3, getCountryName } from '@/lib/countries'
import { useAuth } from './useAuth'

export function useVisitedCountries(
  showToast?: (msg: string) => void,
  onVisitPersisted?: () => void
) {
  const { user } = useAuth()
  const [visitedSet, setVisitedSet] = useState<Set<string>>(new Set()) // stores numeric codes
  const [loading, setLoading] = useState(true)

  // Fetch visited countries from Supabase when user is authenticated
  useEffect(() => {
    if (!user) {
      setVisitedSet(new Set())
      setLoading(false)
      return
    }

    const fetchVisited = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('visited_countries')
        .select('country_code')
        .eq('user_id', user.id)

      if (error) {
        console.error('Failed to fetch visited countries:', error)
        setLoading(false)
        return
      }

      // Convert alpha-3 codes back to numeric codes for the Set
      const numericCodes = new Set(
        data
          .map((row) => numericCodeFromAlpha3(row.country_code))
          .filter((code): code is string => code !== undefined)
      )

      setVisitedSet(numericCodes)
      setLoading(false)
    }

    fetchVisited()
  }, [user])

  const toggleVisit = useCallback(
    async (numericCode: string) => {
      if (!user) return

      const alpha3 = getAlpha3(numericCode)
      if (!alpha3) return

      const isCurrentlyVisited = visitedSet.has(numericCode)
      const countryName = getCountryName(numericCode)

      // Optimistic update
      setVisitedSet((prev) => {
        const next = new Set(prev)
        if (isCurrentlyVisited) {
          next.delete(numericCode)
        } else {
          next.add(numericCode)
        }
        return next
      })

      // Show toast
      if (showToast) {
        showToast(isCurrentlyVisited ? `Removed ${countryName}` : `Visited ${countryName}!`)
      }

      // Persist to Supabase
      if (isCurrentlyVisited) {
        const { error } = await supabase
          .from('visited_countries')
          .delete()
          .match({ user_id: user.id, country_code: alpha3 })

        if (error) {
          console.error('Failed to remove visit:', error)
          // Revert optimistic update
          setVisitedSet((prev) => {
            const reverted = new Set(prev)
            reverted.add(numericCode)
            return reverted
          })
          if (showToast) showToast('Failed to save. Please try again.')
        } else {
          onVisitPersisted?.()
        }
      } else {
        const { error } = await supabase.from('visited_countries').insert({
          user_id: user.id,
          country_code: alpha3,
          visited_at: new Date().toISOString(),
        })

        if (error) {
          console.error('Failed to add visit:', error)
          // Revert optimistic update
          setVisitedSet((prev) => {
            const reverted = new Set(prev)
            reverted.delete(numericCode)
            return reverted
          })
          if (showToast) showToast('Failed to save. Please try again.')
        } else {
          onVisitPersisted?.()
        }
      }
    },
    [user, visitedSet, showToast, onVisitPersisted]
  )

  return {
    visitedSet,
    toggleVisit,
    visitedCount: visitedSet.size,
    loading,
  }
}
