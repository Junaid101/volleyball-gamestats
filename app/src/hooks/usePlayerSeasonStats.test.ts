import { renderHook, waitFor } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { StorageProvider } from '../context/StorageContext'
import { createMockStorage } from '../test/mockStorage'
import type { Player, PlayerSeasonStats } from '../types'
import { usePlayerSeasonStats } from './usePlayerSeasonStats'

const players: Player[] = [
  {
    id: 'player-1',
    teamId: 'team-1',
    name: 'Jordan Kim',
    position: 'outside',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'player-2',
    teamId: 'team-1',
    name: 'Avery Lee',
    position: 'setter',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
]

function createWrapper(storage: ReturnType<typeof createMockStorage>) {
  return ({ children }: { children: ReactNode }) => createElement(StorageProvider, { service: storage, children })
}

describe('usePlayerSeasonStats', () => {
  it('returns empty when no players', async () => {
    const storage = createMockStorage({
      getPlayers: vi.fn().mockResolvedValue([]),
    })

    const { result } = renderHook(() => usePlayerSeasonStats(), {
      wrapper: createWrapper(storage),
    })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.players).toEqual([])
    expect(result.current.stats).toEqual({})
  })

  it('returns stats for each player', async () => {
    const storage = createMockStorage({
      getPlayers: vi.fn().mockResolvedValue(players),
      getPlayerSeasonStats: vi.fn().mockImplementation(async (playerId: string) => ({
        playerId,
        kills: playerId === 'player-1' ? 5 : 2,
        attackErrors: 1,
        attackAttempts: 10,
        assists: playerId === 'player-2' ? 8 : 1,
        aces: 2,
        serviceErrors: 1,
        digs: 4,
        blocksSolo: 1,
        blocksAssisted: 1,
        receptionErrors: 0,
        hittingEfficiency: 0.4,
        matchesPlayed: 3,
        setsPlayed: 6,
      })),
    })

    const { result } = renderHook(() => usePlayerSeasonStats(), {
      wrapper: createWrapper(storage),
    })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.players).toEqual(players)
    expect(result.current.stats['player-1']).toEqual(expect.objectContaining({ playerId: 'player-1', kills: 5 }))
    expect(result.current.stats['player-2']).toEqual(expect.objectContaining({ playerId: 'player-2', assists: 8 }))
  })

  it('aggregates correctly (test with known values)', async () => {
    const knownStats: Record<string, PlayerSeasonStats> = {
      'player-1': {
        playerId: 'player-1',
        kills: 8,
        attackErrors: 2,
        attackAttempts: 15,
        assists: 3,
        aces: 4,
        serviceErrors: 1,
        digs: 7,
        blocksSolo: 2,
        blocksAssisted: 3,
        receptionErrors: 0,
        hittingEfficiency: 0.4,
        matchesPlayed: 2,
        setsPlayed: 5,
      },
      'player-2': {
        playerId: 'player-2',
        kills: 1,
        attackErrors: 0,
        attackAttempts: 2,
        assists: 14,
        aces: 1,
        serviceErrors: 0,
        digs: 5,
        blocksSolo: 0,
        blocksAssisted: 1,
        receptionErrors: 1,
        hittingEfficiency: 0.5,
        matchesPlayed: 2,
        setsPlayed: 5,
      },
    }
    const storage = createMockStorage({
      getPlayers: vi.fn().mockResolvedValue(players),
      getPlayerSeasonStats: vi.fn().mockImplementation(async (playerId: string) => knownStats[playerId]),
    })

    const { result } = renderHook(() => usePlayerSeasonStats(), {
      wrapper: createWrapper(storage),
    })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.stats['player-1']).toEqual(knownStats['player-1'])
    expect(result.current.stats['player-2']).toEqual(knownStats['player-2'])
  })
})
