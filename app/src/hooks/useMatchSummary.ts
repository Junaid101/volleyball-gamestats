import { useEffect, useState } from 'react'
import type { Match, MatchSet, Player, PlayerSetStats } from '../types'
import { getMatchResult } from '../utils/matchUtils'
import { buildShareText, getTopPerformers, type TopPerformers } from '../utils/summaryUtils'
import { useStorage } from './useStorage'

export function useMatchSummary(matchId: string): {
  match: Match | null
  sets: MatchSet[]
  allStats: PlayerSetStats[]
  players: Player[]
  performers: TopPerformers | null
  shareText: string
  loading: boolean
} {
  const storage = useStorage()
  const [match, setMatch] = useState<Match | null>(null)
  const [sets, setSets] = useState<MatchSet[]>([])
  const [allStats, setAllStats] = useState<PlayerSetStats[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [performers, setPerformers] = useState<TopPerformers | null>(null)
  const [shareText, setShareText] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const load = async () => {
      if (!matchId) {
        setMatch(null)
        setSets([])
        setAllStats([])
        setPlayers([])
        setPerformers(null)
        setShareText('')
        setLoading(false)
        return
      }

      setLoading(true)

      try {
        const [nextMatch, nextSets, nextAllStats, allPlayers] = await Promise.all([
          storage.getMatch(matchId),
          storage.getSetsForMatch(matchId),
          storage.getStatsForMatch(matchId),
          storage.getPlayers(),
        ])

        const nextPlayers = nextMatch?.participatingPlayerIds?.length
          ? allPlayers.filter((player) => nextMatch.participatingPlayerIds?.includes(player.id))
          : allPlayers
        const nextPerformers = nextMatch ? getTopPerformers(nextPlayers, nextAllStats) : null
        const nextShareText = nextMatch
          ? buildShareText(
              nextMatch.opponent,
              nextMatch.date,
              getMatchResult(nextSets),
              nextSets,
              nextPerformers ?? getTopPerformers([], []),
            )
          : ''

        if (active) {
          setMatch(nextMatch)
          setSets(nextSets)
          setAllStats(nextAllStats)
          setPlayers(nextPlayers)
          setPerformers(nextPerformers)
          setShareText(nextShareText)
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
    match,
    sets,
    allStats,
    players,
    performers,
    shareText,
    loading,
  }
}
