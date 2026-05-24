import { act, renderHook } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { StorageProvider } from '../context/StorageContext'
import { createMockStorage } from '../test/mockStorage'
import type { Team } from '../types'
import { useMatchCreation } from './useMatchCreation'

const team: Team = {
  id: 'team-1',
  name: 'Sharks',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
}

function createWrapper(mockStorage: ReturnType<typeof createMockStorage>) {
  return ({ children }: { children: ReactNode }) =>
    createElement(StorageProvider, { service: mockStorage, children })
}

describe('useMatchCreation', () => {
  it('createMatch saves a Match record via storage', async () => {
    const mockStorage = createMockStorage({
      getTeam: vi.fn().mockResolvedValue(team),
    })
    const { result } = renderHook(() => useMatchCreation(), {
      wrapper: createWrapper(mockStorage),
    })

    await act(async () => {
      await result.current.createMatch({
        opponent: 'Falcons',
        format: 'best_of_3',
        participatingPlayerIds: ['player-1', 'player-2'],
      })
    })

    expect(mockStorage.saveMatch).toHaveBeenCalledWith(
      expect.objectContaining({
        teamId: 'team-1',
        opponent: 'Falcons',
        format: 'best_of_3',
        status: 'in_progress',
        sets: [],
        participatingPlayerIds: ['player-1', 'player-2'],
      }),
    )
  })

  it('createMatch saves first MatchSet (setNumber: 1) via storage', async () => {
    const mockStorage = createMockStorage({
      getTeam: vi.fn().mockResolvedValue(team),
    })
    const { result } = renderHook(() => useMatchCreation(), {
      wrapper: createWrapper(mockStorage),
    })

    await act(async () => {
      await result.current.createMatch({
        opponent: 'Falcons',
        format: 'best_of_3',
        participatingPlayerIds: ['player-1'],
      })
    })

    const savedMatch = vi.mocked(mockStorage.saveMatch).mock.calls[0][0]

    expect(mockStorage.saveSet).toHaveBeenCalledWith(
      expect.objectContaining({
        matchId: savedMatch.id,
        setNumber: 1,
        ourScore: 0,
        opponentScore: 0,
      }),
    )
  })

  it('createMatch returns the new match id', async () => {
    const mockStorage = createMockStorage({
      getTeam: vi.fn().mockResolvedValue(team),
    })
    const { result } = renderHook(() => useMatchCreation(), {
      wrapper: createWrapper(mockStorage),
    })

    let matchId = ''

    await act(async () => {
      matchId = await result.current.createMatch({
        opponent: 'Falcons',
        format: 'best_of_5',
        participatingPlayerIds: ['player-1'],
      })
    })

    const savedMatch = vi.mocked(mockStorage.saveMatch).mock.calls[0][0]

    expect(matchId).toBe(savedMatch.id)
  })

  it("createMatch sets match status to 'in_progress'", async () => {
    const mockStorage = createMockStorage({
      getTeam: vi.fn().mockResolvedValue(team),
    })
    const { result } = renderHook(() => useMatchCreation(), {
      wrapper: createWrapper(mockStorage),
    })

    await act(async () => {
      await result.current.createMatch({
        opponent: 'Falcons',
        format: 'best_of_3',
        participatingPlayerIds: ['player-1'],
      })
    })

    expect(mockStorage.saveMatch).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'in_progress',
      }),
    )
  })

  it("createMatch sets set status to 'in_progress'", async () => {
    const mockStorage = createMockStorage({
      getTeam: vi.fn().mockResolvedValue(team),
    })
    const { result } = renderHook(() => useMatchCreation(), {
      wrapper: createWrapper(mockStorage),
    })

    await act(async () => {
      await result.current.createMatch({
        opponent: 'Falcons',
        format: 'best_of_3',
        participatingPlayerIds: ['player-1'],
      })
    })

    expect(mockStorage.saveSet).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'in_progress',
      }),
    )
  })
})
