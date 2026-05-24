import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { StorageProvider } from '../context/StorageContext'
import type { Player, Team } from '../types'
import { createMockStorage } from '../test/mockStorage'
import { useRoster } from './useRoster'

const team: Team = {
  id: 'team-1',
  name: 'Sharks',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
}

const existingPlayer: Player = {
  id: 'player-1',
  teamId: 'team-1',
  name: 'Avery Lee',
  position: 'outside',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
}

describe('useRoster', () => {
  it('returns empty array initially', async () => {
    const mockStorage = createMockStorage()
    const wrapper = ({ children }: { children: ReactNode }) => (
      <StorageProvider service={mockStorage}>{children}</StorageProvider>
    )

    const { result } = renderHook(() => useRoster(), { wrapper })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.players).toEqual([])
  })

  it('addPlayer adds to list and persists', async () => {
    const players: Player[] = []
    const mockStorage = createMockStorage({
      getTeam: vi.fn().mockResolvedValue(team),
      getPlayers: vi.fn().mockImplementation(async () => [...players]),
      savePlayer: vi.fn().mockImplementation(async (player: Player) => {
        players.push(player)
      }),
    })
    const wrapper = ({ children }: { children: ReactNode }) => (
      <StorageProvider service={mockStorage}>{children}</StorageProvider>
    )

    const { result } = renderHook(() => useRoster(), { wrapper })

    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.addPlayer({ name: 'Jordan Kim', position: 'setter' })
    })

    await waitFor(() => expect(result.current.players).toHaveLength(1))
    expect(result.current.players[0]).toMatchObject({ name: 'Jordan Kim', position: 'setter', teamId: 'team-1' })
    expect(mockStorage.savePlayer).toHaveBeenCalledTimes(1)
  })

  it('removePlayer removes from list', async () => {
    const players: Player[] = [existingPlayer]
    const mockStorage = createMockStorage({
      getPlayers: vi.fn().mockImplementation(async () => [...players]),
      deletePlayer: vi.fn().mockImplementation(async (id: string) => {
        const index = players.findIndex((player) => player.id === id)
        if (index >= 0) {
          players.splice(index, 1)
        }
      }),
    })
    const wrapper = ({ children }: { children: ReactNode }) => (
      <StorageProvider service={mockStorage}>{children}</StorageProvider>
    )

    const { result } = renderHook(() => useRoster(), { wrapper })

    await waitFor(() => expect(result.current.players).toHaveLength(1))

    await act(async () => {
      await result.current.removePlayer(existingPlayer.id)
    })

    await waitFor(() => expect(result.current.players).toEqual([]))
    expect(mockStorage.deletePlayer).toHaveBeenCalledWith(existingPlayer.id)
  })
})
