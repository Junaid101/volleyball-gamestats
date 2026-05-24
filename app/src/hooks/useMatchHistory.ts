import { useCallback, useEffect, useState } from 'react'
import type { Match } from '../types'
import { useStorage } from './useStorage'

function sortMatchesByDate(matches: Match[]) {
  return [...matches].sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
}

export function useMatchHistory() {
  const storage = useStorage()
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)

    try {
      const storedMatches = await storage.getMatches()
      const matchesWithSets = await Promise.all(
        storedMatches.map(async (match) => ({
          ...match,
          sets: await storage.getSetsForMatch(match.id),
        })),
      )

      setMatches(sortMatchesByDate(matchesWithSets))
    } finally {
      setLoading(false)
    }
  }, [storage])

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)

      try {
        const storedMatches = await storage.getMatches()
        const matchesWithSets = await Promise.all(
          storedMatches.map(async (match) => ({
            ...match,
            sets: await storage.getSetsForMatch(match.id),
          })),
        )

        if (active) {
          setMatches(sortMatchesByDate(matchesWithSets))
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [storage])

  return {
    matches,
    loading,
    refresh,
  }
}
