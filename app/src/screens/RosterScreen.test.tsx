import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { StorageProvider } from '../context/StorageContext'
import type { StorageService } from '../storage/types'
import type { Player, Team } from '../types'
import { createMockStorage } from '../test/mockStorage'
import RosterScreen from './RosterScreen'

const team: Team = {
  id: 'team-1',
  name: 'Sharks',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
}

const playerOne: Player = {
  id: 'player-1',
  teamId: 'team-1',
  name: 'Avery Lee',
  positions: ['outside'],
    primaryPosition: 'outside',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
}

const playerTwo: Player = {
  id: 'player-2',
  teamId: 'team-1',
  name: 'Jordan Kim',
  positions: ['setter'],
    primaryPosition: 'setter',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
}

function renderScreen(mockStorage: StorageService) {
  return render(
    <StorageProvider service={mockStorage}>
      <MemoryRouter>
        <RosterScreen />
      </MemoryRouter>
    </StorageProvider>,
  )
}

describe('RosterScreen', () => {
  it('renders empty state when no players', async () => {
    const mockStorage = createMockStorage()

    renderScreen(mockStorage)

    expect(await screen.findByText('No players yet. Add your first player.')).toBeInTheDocument()
  })

  it('renders player list when players exist', async () => {
    const mockStorage = createMockStorage({
      getPlayers: vi.fn().mockResolvedValue([playerOne, playerTwo]),
    })

    renderScreen(mockStorage)

    expect(await screen.findByText('Avery Lee')).toBeInTheDocument()
    expect(screen.getByText('Jordan Kim')).toBeInTheDocument()
  })

  it('Add Player button opens the add form', async () => {
    const user = userEvent.setup()
    const mockStorage = createMockStorage()

    renderScreen(mockStorage)

    await user.click(await screen.findByRole('button', { name: /add player/i }))

    expect(screen.getByRole('heading', { name: /add player/i })).toBeInTheDocument()
  })

  it('submitting add form adds player to list', async () => {
    const user = userEvent.setup()
    const players: Player[] = []
    const mockStorage = createMockStorage({
      getTeam: vi.fn().mockResolvedValue(team),
      getPlayers: vi.fn().mockImplementation(async () => [...players]),
      savePlayer: vi.fn().mockImplementation(async (player: Player) => {
        players.push(player)
      }),
    })

    renderScreen(mockStorage)

    await user.click(await screen.findByRole('button', { name: /add player/i }))
    await user.type(screen.getByLabelText(/name/i), 'Casey Reed')
    await user.click(screen.getByRole('checkbox', { name: 'middle' }))
    await user.click(screen.getByRole('button', { name: /save player/i }))

    expect(await screen.findByText('Casey Reed')).toBeInTheDocument()
  })

  it('clicking edit shows edit form pre-populated', async () => {
    const user = userEvent.setup()
    const mockStorage = createMockStorage({
      getPlayers: vi.fn().mockResolvedValue([playerOne]),
    })

    renderScreen(mockStorage)

    await user.click(await screen.findByRole('button', { name: /edit avery lee/i }))

    expect(screen.getByDisplayValue('Avery Lee')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'outside' })).toBeChecked()
  })

  it('submitting edit form updates player in list', async () => {
    const user = userEvent.setup()
    const players: Player[] = [playerOne]
    const mockStorage = createMockStorage({
      getPlayers: vi.fn().mockImplementation(async () => [...players]),
      savePlayer: vi.fn().mockImplementation(async (player: Player) => {
        const index = players.findIndex((item) => item.id === player.id)
        players[index] = player
      }),
    })

    renderScreen(mockStorage)

    await user.click(await screen.findByRole('button', { name: /edit avery lee/i }))
    await user.clear(screen.getByLabelText(/name/i))
    await user.type(screen.getByLabelText(/name/i), 'Avery Stone')
    await user.click(screen.getByRole('checkbox', { name: 'outside' }))
    await user.click(screen.getByRole('checkbox', { name: 'libero' }))
    await user.click(screen.getByRole('button', { name: /save changes/i }))

    expect(await screen.findByText('Avery Stone')).toBeInTheDocument()
    expect(screen.getByText('libero')).toBeInTheDocument()
  })

  it('clicking delete removes player from list', async () => {
    const user = userEvent.setup()
    const players: Player[] = [playerOne]
    const mockStorage = createMockStorage({
      getPlayers: vi.fn().mockImplementation(async () => [...players]),
      deletePlayer: vi.fn().mockImplementation(async (id: string) => {
        const index = players.findIndex((player) => player.id === id)
        if (index >= 0) {
          players.splice(index, 1)
        }
      }),
    })

    renderScreen(mockStorage)

    await user.click(await screen.findByRole('button', { name: /delete avery lee/i }))

    await waitFor(() => {
      expect(screen.queryByText('Avery Lee')).not.toBeInTheDocument()
    })
  })

  it('delete calls storage.deletePlayer with correct id', async () => {
    const user = userEvent.setup()
    const mockStorage = createMockStorage({
      getPlayers: vi.fn().mockResolvedValue([playerOne]),
    })

    renderScreen(mockStorage)

    await user.click(await screen.findByRole('button', { name: /delete avery lee/i }))

    await waitFor(() => {
      expect(mockStorage.deletePlayer).toHaveBeenCalledWith('player-1')
    })
  })
})
