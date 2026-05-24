import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import type { Match, MatchSet, Player, PlayerSetStats, StatTotals } from '../types'
import { useStorage } from './useStorage'

export type StatKeys = Pick<
  PlayerSetStats,
  | 'kills'
  | 'attackErrors'
  | 'attackAttempts'
  | 'assists'
  | 'aces'
  | 'serviceErrors'
  | 'digs'
  | 'blocksSolo'
  | 'blocksAssisted'
  | 'receptionErrors'
>

export type LiveAction =
  | { type: 'INCREMENT_STAT'; playerId: string; setId: string; statKey: keyof StatKeys; prevValue: number }
  | { type: 'SET_OUR_SCORE'; setId: string; prevScore: number }
  | { type: 'SET_OPP_SCORE'; setId: string; prevScore: number }

const createId = () => globalThis.crypto?.randomUUID?.() ?? uuidv4()

const emptyTotals = (): StatTotals => ({
  kills: 0,
  attackErrors: 0,
  attackAttempts: 0,
  assists: 0,
  aces: 0,
  serviceErrors: 0,
  digs: 0,
  blocksSolo: 0,
  blocksAssisted: 0,
  receptionErrors: 0,
})

const scoreEffectByStat: Partial<Record<keyof StatKeys, 'team' | 'opponent'>> = {
  kills: 'team',
  aces: 'team',
  attackErrors: 'opponent',
  serviceErrors: 'opponent',
}

function createEmptyPlayerSetStats(playerId: string, setId: string, timestamp: string): PlayerSetStats {
  return {
    id: createId(),
    playerId,
    setId,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...emptyTotals(),
  }
}

function upsertSet(sets: MatchSet[], nextSet: MatchSet) {
  return [...sets.filter((set) => set.id !== nextSet.id), nextSet].sort((left, right) => left.setNumber - right.setNumber)
}

function buildPlayerStats(players: Player[], setId: string, savedStats: PlayerSetStats[]) {
  const savedByPlayerId = new Map(savedStats.map((stats) => [stats.playerId, stats]))
  const timestamp = new Date().toISOString()

  return players.reduce<Record<string, PlayerSetStats>>((accumulator, player) => {
    accumulator[player.id] = savedByPlayerId.get(player.id) ?? createEmptyPlayerSetStats(player.id, setId, timestamp)
    return accumulator
  }, {})
}

function getPlayersForMatch(match: Match, roster: Player[]) {
  const participantIds = match.participatingPlayerIds ?? []

  if (participantIds.length === 0) {
    return roster
  }

  const participants = new Set(participantIds)
  return roster.filter((player) => participants.has(player.id))
}

function getWinsNeeded(format: Match['format']) {
  return format === 'best_of_5' ? 3 : 2
}

function countSetWins(sets: MatchSet[]) {
  return sets.reduce(
    (totals, set) => {
      if (set.ourScore > set.opponentScore) {
        totals.team += 1
      }

      if (set.opponentScore > set.ourScore) {
        totals.opponent += 1
      }

      return totals
    },
    { team: 0, opponent: 0 },
  )
}

export function useLiveMatch(matchId: string) {
  const storage = useStorage()
  const navigate = useNavigate()
  const [match, setMatch] = useState<Match | null>(null)
  const [currentSet, setCurrentSet] = useState<MatchSet | null>(null)
  const [playerStats, setPlayerStats] = useState<Record<string, PlayerSetStats>>({})
  const [players, setPlayers] = useState<Player[]>([])
  const [actionStack, setActionStack] = useState<LiveAction[]>([])
  const [loading, setLoading] = useState(true)

  const matchRef = useRef<Match | null>(null)
  const currentSetRef = useRef<MatchSet | null>(null)
  const playerStatsRef = useRef<Record<string, PlayerSetStats>>({})
  const playersRef = useRef<Player[]>([])
  const actionStackRef = useRef<LiveAction[]>([])

  useEffect(() => {
    matchRef.current = match
  }, [match])

  useEffect(() => {
    currentSetRef.current = currentSet
  }, [currentSet])

  useEffect(() => {
    playerStatsRef.current = playerStats
  }, [playerStats])

  useEffect(() => {
    playersRef.current = players
  }, [players])

  useEffect(() => {
    actionStackRef.current = actionStack
  }, [actionStack])

  useEffect(() => {
    let active = true

    const loadMatch = async () => {
      setLoading(true)

      try {
        const [storedMatch, storedSets, roster] = await Promise.all([
          storage.getMatch(matchId),
          storage.getSetsForMatch(matchId),
          storage.getPlayers(),
        ])

        if (!active) {
          return
        }

        if (!storedMatch) {
          setMatch(null)
          matchRef.current = null
          setCurrentSet(null)
          currentSetRef.current = null
          setPlayers([])
          playersRef.current = []
          setPlayerStats({})
          playerStatsRef.current = {}
          setActionStack([])
          actionStackRef.current = []
          return
        }

        const current =
          storedSets.find((set) => set.status === 'in_progress') ?? storedSets[storedSets.length - 1] ?? null
        const nextPlayers = getPlayersForMatch(storedMatch, roster)
        const savedStats = current ? await storage.getStatsForSet(current.id) : []

        if (!active) {
          return
        }

        const nextMatch = { ...storedMatch, sets: storedSets }
        const nextPlayerStats = current ? buildPlayerStats(nextPlayers, current.id, savedStats) : {}

        setPlayers(nextPlayers)
        playersRef.current = nextPlayers
        setMatch(nextMatch)
        matchRef.current = nextMatch
        setCurrentSet(current)
        currentSetRef.current = current
        setPlayerStats(nextPlayerStats)
        playerStatsRef.current = nextPlayerStats
        setActionStack([])
        actionStackRef.current = []
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadMatch()

    return () => {
      active = false
    }
  }, [matchId, storage])

  const updateCurrentSet = useCallback(
    async (updater: (set: MatchSet) => MatchSet, action?: LiveAction) => {
      const activeSet = currentSetRef.current
      const activeMatch = matchRef.current

      if (!activeSet || !activeMatch) {
        return
      }

      const nextSet = updater(activeSet)
      const nextSets = upsertSet(activeMatch.sets ?? [], nextSet)
      const nextMatch = { ...activeMatch, sets: nextSets }

      setCurrentSet(nextSet)
      currentSetRef.current = nextSet
      setMatch(nextMatch)
      matchRef.current = nextMatch

      if (action) {
        const nextActionStack = [...actionStackRef.current, action]
        actionStackRef.current = nextActionStack
        setActionStack(nextActionStack)
      }

      await storage.saveSet(nextSet)
    },
    [storage],
  )

  const incrementStat = useCallback(
    async (playerId: string, statKey: keyof StatKeys) => {
      const activeSet = currentSetRef.current
      const currentPlayerStats = playerStatsRef.current[playerId]

      if (!activeSet || !currentPlayerStats) {
        return
      }

      const timestamp = new Date().toISOString()
      const nextPlayerStats = {
        ...currentPlayerStats,
        [statKey]: currentPlayerStats[statKey] + 1,
        updatedAt: timestamp,
      }

      setPlayerStats((previous) => ({
        ...previous,
        [playerId]: nextPlayerStats,
      }))
      playerStatsRef.current = {
        ...playerStatsRef.current,
        [playerId]: nextPlayerStats,
      }
      const nextAction: LiveAction = {
        type: 'INCREMENT_STAT',
        playerId,
        setId: activeSet.id,
        statKey,
        prevValue: currentPlayerStats[statKey],
      }
      const nextActionStack = [...actionStackRef.current, nextAction]
      actionStackRef.current = nextActionStack
      setActionStack(nextActionStack)

      await storage.savePlayerSetStats(nextPlayerStats)

      const scoreEffect = scoreEffectByStat[statKey]

      if (scoreEffect === 'team') {
        await updateCurrentSet(
          (set) => ({
            ...set,
            ourScore: set.ourScore + 1,
            updatedAt: timestamp,
          }),
        )
      }

      if (scoreEffect === 'opponent') {
        await updateCurrentSet(
          (set) => ({
            ...set,
            opponentScore: set.opponentScore + 1,
            updatedAt: timestamp,
          }),
        )
      }
    },
    [storage, updateCurrentSet],
  )

  const incrementOurScore = useCallback(() => {
    void updateCurrentSet(
      (set) => ({
        ...set,
        ourScore: set.ourScore + 1,
        updatedAt: new Date().toISOString(),
      }),
      currentSetRef.current
        ? {
            type: 'SET_OUR_SCORE',
            setId: currentSetRef.current.id,
            prevScore: currentSetRef.current.ourScore,
          }
        : undefined,
    )
  }, [updateCurrentSet])

  const incrementOppScore = useCallback(() => {
    void updateCurrentSet(
      (set) => ({
        ...set,
        opponentScore: set.opponentScore + 1,
        updatedAt: new Date().toISOString(),
      }),
      currentSetRef.current
        ? {
            type: 'SET_OPP_SCORE',
            setId: currentSetRef.current.id,
            prevScore: currentSetRef.current.opponentScore,
          }
        : undefined,
    )
  }, [updateCurrentSet])

  const undo = useCallback(async () => {
    const activeSet = currentSetRef.current
    const lastAction = actionStackRef.current[actionStackRef.current.length - 1]

    if (!activeSet || !lastAction) {
      return
    }

    setActionStack((previous) => previous.slice(0, -1))
    actionStackRef.current = actionStackRef.current.slice(0, -1)

    if (lastAction.type === 'INCREMENT_STAT') {
      const currentPlayerStats = playerStatsRef.current[lastAction.playerId]

      if (!currentPlayerStats) {
        return
      }

      const timestamp = new Date().toISOString()
      const revertedStats = {
        ...currentPlayerStats,
        [lastAction.statKey]: lastAction.prevValue,
        updatedAt: timestamp,
      }

      setPlayerStats((previous) => ({
        ...previous,
        [lastAction.playerId]: revertedStats,
      }))
      playerStatsRef.current = {
        ...playerStatsRef.current,
        [lastAction.playerId]: revertedStats,
      }

      await storage.savePlayerSetStats(revertedStats)

      const scoreEffect = scoreEffectByStat[lastAction.statKey as keyof StatKeys]

      if (scoreEffect === 'team') {
        await updateCurrentSet((set) => ({
          ...set,
          ourScore: Math.max(0, set.ourScore - 1),
          updatedAt: timestamp,
        }))
      }

      if (scoreEffect === 'opponent') {
        await updateCurrentSet((set) => ({
          ...set,
          opponentScore: Math.max(0, set.opponentScore - 1),
          updatedAt: timestamp,
        }))
      }

      return
    }

    if (lastAction.type === 'SET_OUR_SCORE') {
      await updateCurrentSet((set) => ({
        ...set,
        ourScore: lastAction.prevScore,
        updatedAt: new Date().toISOString(),
      }))
      return
    }

    await updateCurrentSet((set) => ({
      ...set,
      opponentScore: lastAction.prevScore,
      updatedAt: new Date().toISOString(),
    }))
  }, [storage, updateCurrentSet])

  const endSet = useCallback(async () => {
    const activeMatch = matchRef.current
    const activeSet = currentSetRef.current

    if (!activeMatch || !activeSet) {
      return
    }

    const timestamp = new Date().toISOString()
    const completedSet: MatchSet = {
      ...activeSet,
      status: 'completed',
      winner: activeSet.ourScore > activeSet.opponentScore ? 'team' : activeSet.opponentScore > activeSet.ourScore ? 'opponent' : undefined,
      updatedAt: timestamp,
    }
    const completedSets = upsertSet(activeMatch.sets ?? [], completedSet)
    const setWins = countSetWins(completedSets)
    const winsNeeded = getWinsNeeded(activeMatch.format)

    await storage.saveSet(completedSet)

    if (setWins.team >= winsNeeded || setWins.opponent >= winsNeeded) {
      const completedMatch: Match = {
        ...activeMatch,
        status: 'completed',
        winner: setWins.team > setWins.opponent ? 'team' : 'opponent',
        sets: completedSets,
        updatedAt: timestamp,
      }

      setCurrentSet(completedSet)
      currentSetRef.current = completedSet
      setMatch(completedMatch)
      matchRef.current = completedMatch
      setActionStack([])
      actionStackRef.current = []

      await storage.saveMatch(completedMatch)
      navigate(`/history/${activeMatch.id}/summary`, { replace: true })
      return
    }

    const nextSet: MatchSet = {
      id: createId(),
      matchId: activeMatch.id,
      setNumber: completedSet.setNumber + 1,
      ourScore: 0,
      opponentScore: 0,
      status: 'in_progress',
      createdAt: timestamp,
      updatedAt: timestamp,
    }
    const nextSets = [...completedSets, nextSet].sort((left, right) => left.setNumber - right.setNumber)
    const nextMatch: Match = {
      ...activeMatch,
      sets: nextSets,
      updatedAt: timestamp,
    }

    setCurrentSet(nextSet)
    currentSetRef.current = nextSet
    setMatch(nextMatch)
    matchRef.current = nextMatch
    const nextPlayerStats = buildPlayerStats(playersRef.current, nextSet.id, [])

    setPlayerStats(nextPlayerStats)
    playerStatsRef.current = nextPlayerStats
    setActionStack([])
    actionStackRef.current = []

    await Promise.all([storage.saveSet(nextSet), storage.saveMatch(nextMatch)])
    navigate(`/match/${activeMatch.id}/between-sets`, { replace: true })
  }, [navigate, storage])

  const canUndo = useMemo(() => actionStack.length > 0, [actionStack])

  return {
    match,
    currentSet,
    playerStats,
    players,
    actionStack,
    incrementStat,
    incrementOurScore,
    incrementOppScore,
    undo,
    canUndo,
    endSet,
    loading,
  }
}
