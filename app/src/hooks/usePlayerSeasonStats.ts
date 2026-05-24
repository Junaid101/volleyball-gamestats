import { useEffect, useState } from 'react'
import type { Player, PlayerSeasonStats } from '../types'
import { useStorage } from './useStorage'

export function usePlayerSeasonStats() {
  const storage = useStorage()
  const [players, setPlayers] = useState<Player[]>([])
  const [stats, setStats] = useState<Record<string, PlayerSeasonStats>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)

      try {
        const roster = await storage.getPlayers()

        if (!active) {
          return
        }

        setPlayers(roster)

        if (roster.length === 0) {
          setStats({})
          return
        }

        const seasonStats = await Promise.all(roster.map((player) => storage.getPlayerSeasonStats(player.id)))

        if (!active) {
          return
        }

        setStats(
          seasonStats.reduce<Record<string, PlayerSeasonStats>>((accumulator, playerStats) => {
            accumulator[playerStats.playerId] = playerStats
            return accumulator
          }, {}),
        )
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
    players,
    stats,
    loading,
  }
}
