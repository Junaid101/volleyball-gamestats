import { useEffect, useState } from 'react'
import type { MatchSummary, Player } from '../types'
import { useStorage } from './useStorage'

export function useMatchDetail(matchId: string) {
  const storage = useStorage()
  const [summary, setSummary] = useState<MatchSummary | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const load = async () => {
      if (!matchId) {
        setSummary(null)
        setPlayers([])
        setLoading(false)
        return
      }

      setLoading(true)

      try {
        const [nextSummary, nextPlayers] = await Promise.all([
          storage.getMatchSummary(matchId),
          storage.getPlayers(),
        ])

        if (active) {
          setSummary(nextSummary)
          setPlayers(nextPlayers)
        }
      } catch {
        if (active) {
          setSummary(null)
          setPlayers([])
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
  }, [matchId, storage])

  return {
    summary,
    players,
    loading,
  }
}
