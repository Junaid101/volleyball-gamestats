import { act, renderHook, waitFor } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { StorageProvider } from '../context/StorageContext'
import type { StorageService } from '../storage/types'
import { createMockStorage } from '../test/mockStorage'
import type { Match, MatchSet, Player, PlayerSetStats } from '../types'
import { useLiveMatch } from './useLiveMatch'

const players: Player[] = [
  {
    id: 'player-1',
    teamId: 'team-1',
    name: 'Alice',
    positions: ['setter'],
    primaryPosition: 'setter',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'player-2',
    teamId: 'team-1',
    name: 'Bailey',
    positions: ['outside'],
    primaryPosition: 'outside',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
]

const baseMatch: Match = {
  id: 'match-1',
  teamId: 'team-1',
  opponent: 'Falcons',
  date: '2025-01-10T00:00:00.000Z',
  format: 'best_of_3',
  status: 'in_progress',
  sets: [],
  participatingPlayerIds: players.map((player) => player.id),
  createdAt: '2025-01-10T00:00:00.000Z',
  updatedAt: '2025-01-10T00:00:00.000Z',
}

const currentSet: MatchSet = {
  id: 'set-1',
  matchId: 'match-1',
  setNumber: 1,
  ourScore: 0,
  opponentScore: 0,
  status: 'in_progress',
  createdAt: '2025-01-10T00:00:00.000Z',
  updatedAt: '2025-01-10T00:00:00.000Z',
}

function createStorageFixture(options?: {
  match?: Match
  sets?: MatchSet[]
  players?: Player[]
  stats?: PlayerSetStats[]
}) {
  const matches = [options?.match ?? baseMatch]
  const sets = [...(options?.sets ?? [currentSet])]
  const stats = [...(options?.stats ?? [])]
  const roster = [...(options?.players ?? players)]

  const storage = createMockStorage({
    getMatch: vi.fn().mockImplementation(async (id: string) => matches.find((match) => match.id === id) ?? null),
    getSetsForMatch: vi.fn().mockImplementation(async (matchId: string) =>
      sets.filter((set) => set.matchId === matchId).sort((left, right) => left.setNumber - right.setNumber),
    ),
    getPlayers: vi.fn().mockResolvedValue(roster),
    getStatsForSet: vi.fn().mockImplementation(async (setId: string) => stats.filter((item) => item.setId === setId)),
    savePlayerSetStats: vi.fn().mockImplementation(async (nextStats: PlayerSetStats) => {
      const index = stats.findIndex(
        (item) => item.playerId === nextStats.playerId && item.setId === nextStats.setId,
      )

      if (index >= 0) {
        stats[index] = nextStats
      } else {
        stats.push(nextStats)
      }
    }),
    saveSet: vi.fn().mockImplementation(async (nextSet: MatchSet) => {
      const index = sets.findIndex((item) => item.id === nextSet.id)

      if (index >= 0) {
        sets[index] = nextSet
      } else {
        sets.push(nextSet)
      }
    }),
    saveMatch: vi.fn().mockImplementation(async (nextMatch: Match) => {
      const index = matches.findIndex((item) => item.id === nextMatch.id)

      if (index >= 0) {
        matches[index] = nextMatch
      } else {
        matches.push(nextMatch)
      }
    }),
  })

  return { storage, matches, sets, stats, roster }
}

function createWrapper(storage: StorageService) {
  return ({ children }: { children: ReactNode }) =>
    createElement(MemoryRouter, {
      initialEntries: ['/match/match-1/live'],
      children: createElement(StorageProvider, { service: storage, children }),
    })
}

describe('useLiveMatch', () => {
  it('initialises with match data and players from storage', async () => {
    const { storage } = createStorageFixture()
    const { result } = renderHook(() => useLiveMatch('match-1'), {
      wrapper: createWrapper(storage),
    })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.match?.id).toBe('match-1')
    expect(result.current.currentSet?.id).toBe('set-1')
    expect(result.current.players.map((player) => player.name)).toEqual(['Alice', 'Bailey'])
    expect(result.current.playerStats['player-1']).toBeDefined()
  })

  it('incrementStat increments the correct stat', async () => {
    const { storage } = createStorageFixture()
    const { result } = renderHook(() => useLiveMatch('match-1'), {
      wrapper: createWrapper(storage),
    })

    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.incrementStat('player-1', 'digs')
    })

    expect(result.current.playerStats['player-1'].digs).toBe(1)
  })

  it("incrementStat 'kills' also increments ourScore", async () => {
    const { storage } = createStorageFixture()
    const { result } = renderHook(() => useLiveMatch('match-1'), {
      wrapper: createWrapper(storage),
    })

    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.incrementStat('player-1', 'kills')
    })

    expect(result.current.currentSet?.ourScore).toBe(1)
  })

  it("incrementStat 'aces' also increments ourScore", async () => {
    const { storage } = createStorageFixture()
    const { result } = renderHook(() => useLiveMatch('match-1'), {
      wrapper: createWrapper(storage),
    })

    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.incrementStat('player-1', 'aces')
    })

    expect(result.current.currentSet?.ourScore).toBe(1)
  })

  it("incrementStat 'attackErrors' also increments oppScore", async () => {
    const { storage } = createStorageFixture()
    const { result } = renderHook(() => useLiveMatch('match-1'), {
      wrapper: createWrapper(storage),
    })

    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.incrementStat('player-1', 'attackErrors')
    })

    expect(result.current.currentSet?.opponentScore).toBe(1)
  })

  it("incrementStat 'serviceErrors' also increments oppScore", async () => {
    const { storage } = createStorageFixture()
    const { result } = renderHook(() => useLiveMatch('match-1'), {
      wrapper: createWrapper(storage),
    })

    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.incrementStat('player-1', 'serviceErrors')
    })

    expect(result.current.currentSet?.opponentScore).toBe(1)
  })

  it("incrementStat 'digs' does NOT change score", async () => {
    const { storage } = createStorageFixture()
    const { result } = renderHook(() => useLiveMatch('match-1'), {
      wrapper: createWrapper(storage),
    })

    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.incrementStat('player-1', 'digs')
    })

    expect(result.current.currentSet?.ourScore).toBe(0)
    expect(result.current.currentSet?.opponentScore).toBe(0)
  })

  it('incrementStat persists stats to storage', async () => {
    const { storage } = createStorageFixture()
    const { result } = renderHook(() => useLiveMatch('match-1'), {
      wrapper: createWrapper(storage),
    })

    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.incrementStat('player-1', 'assists')
    })

    expect(storage.savePlayerSetStats).toHaveBeenCalledWith(
      expect.objectContaining({
        playerId: 'player-1',
        setId: 'set-1',
        assists: 1,
      }),
    )
  })

  it('undo reverses last stat increment', async () => {
    const { storage } = createStorageFixture()
    const { result } = renderHook(() => useLiveMatch('match-1'), {
      wrapper: createWrapper(storage),
    })

    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.incrementStat('player-1', 'digs')
      await result.current.undo()
    })

    expect(result.current.playerStats['player-1'].digs).toBe(0)
  })

  it('undo reverses score change from kill', async () => {
    const { storage } = createStorageFixture()
    const { result } = renderHook(() => useLiveMatch('match-1'), {
      wrapper: createWrapper(storage),
    })

    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.incrementStat('player-1', 'kills')
      await result.current.undo()
    })

    expect(result.current.currentSet?.ourScore).toBe(0)
    expect(result.current.playerStats['player-1'].kills).toBe(0)
  })

  it('canUndo is false when stack is empty', async () => {
    const { storage } = createStorageFixture()
    const { result } = renderHook(() => useLiveMatch('match-1'), {
      wrapper: createWrapper(storage),
    })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.canUndo).toBe(false)
  })

  it('canUndo is true after an action', async () => {
    const { storage } = createStorageFixture()
    const { result } = renderHook(() => useLiveMatch('match-1'), {
      wrapper: createWrapper(storage),
    })

    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.incrementStat('player-1', 'digs')
    })

    expect(result.current.canUndo).toBe(true)
  })

  it('undo does nothing when stack empty', async () => {
    const { storage } = createStorageFixture()
    const { result } = renderHook(() => useLiveMatch('match-1'), {
      wrapper: createWrapper(storage),
    })

    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.undo()
    })

    expect(result.current.currentSet?.ourScore).toBe(0)
    expect(storage.savePlayerSetStats).not.toHaveBeenCalled()
  })

  it('incrementOurScore increments ourScore', async () => {
    const { storage } = createStorageFixture()
    const { result } = renderHook(() => useLiveMatch('match-1'), {
      wrapper: createWrapper(storage),
    })

    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      result.current.incrementOurScore()
    })

    await waitFor(() => expect(result.current.currentSet?.ourScore).toBe(1))
  })

  it('incrementOppScore increments oppScore', async () => {
    const { storage } = createStorageFixture()
    const { result } = renderHook(() => useLiveMatch('match-1'), {
      wrapper: createWrapper(storage),
    })

    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      result.current.incrementOppScore()
    })

    await waitFor(() => expect(result.current.currentSet?.opponentScore).toBe(1))
  })

  it('endSet marks current set complete', async () => {
    const setToFinish: MatchSet = { ...currentSet, ourScore: 25, opponentScore: 22 }
    const { storage, sets } = createStorageFixture({ sets: [setToFinish] })
    const { result } = renderHook(() => useLiveMatch('match-1'), {
      wrapper: createWrapper(storage),
    })

    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.endSet()
    })

    expect(sets.find((set) => set.id === 'set-1')?.status).toBe('completed')
  })

  it('endSet creates next set when match continues', async () => {
    const setToFinish: MatchSet = { ...currentSet, ourScore: 25, opponentScore: 22 }
    const { storage, sets } = createStorageFixture({ sets: [setToFinish] })
    const { result } = renderHook(() => useLiveMatch('match-1'), {
      wrapper: createWrapper(storage),
    })

    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.endSet()
    })

    expect(sets).toHaveLength(2)
    expect(sets.find((set) => set.status === 'in_progress')?.setNumber).toBe(2)
    expect(result.current.currentSet?.setNumber).toBe(2)
  })

  it('endSet marks match complete when format won', async () => {
    const firstWonSet: MatchSet = {
      id: 'set-0',
      matchId: 'match-1',
      setNumber: 1,
      ourScore: 25,
      opponentScore: 20,
      status: 'completed',
      winner: 'team',
      createdAt: '2025-01-09T00:00:00.000Z',
      updatedAt: '2025-01-09T00:00:00.000Z',
    }
    const decidingSet: MatchSet = {
      ...currentSet,
      id: 'set-2',
      setNumber: 2,
      ourScore: 25,
      opponentScore: 18,
    }
    const { storage, matches, sets } = createStorageFixture({ sets: [firstWonSet, decidingSet] })
    const { result } = renderHook(() => useLiveMatch('match-1'), {
      wrapper: createWrapper(storage),
    })

    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.endSet()
    })

    expect(matches[0].status).toBe('completed')
    expect(matches[0].winner).toBe('team')
    expect(sets).toHaveLength(2)
  })
})
