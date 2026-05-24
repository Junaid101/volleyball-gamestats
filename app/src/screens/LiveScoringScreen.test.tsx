import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { StorageProvider } from '../context/StorageContext'
import { createMockStorage } from '../test/mockStorage'
import type { Match, MatchSet, Player, PlayerSetStats } from '../types'
import LiveScoringScreen from './LiveScoringScreen'

const players: Player[] = [
  {
    id: 'player-1',
    teamId: 'team-1',
    name: 'Alice',
    position: 'setter',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
]

const match: Match = {
  id: 'match-1',
  teamId: 'team-1',
  opponent: 'Falcons',
  date: '2025-01-10T00:00:00.000Z',
  format: 'best_of_3',
  status: 'in_progress',
  sets: [],
  participatingPlayerIds: ['player-1'],
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

function createScreenStorage() {
  const sets = [currentSet]
  const stats: PlayerSetStats[] = []

  return createMockStorage({
    getMatch: vi.fn().mockResolvedValue(match),
    getSetsForMatch: vi.fn().mockImplementation(async () => sets),
    getPlayers: vi.fn().mockResolvedValue(players),
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
      sets[0] = nextSet
    }),
    saveMatch: vi.fn().mockResolvedValue(undefined),
  })
}

function renderScreen() {
  const storage = createScreenStorage()

  render(
    <StorageProvider service={storage}>
      <MemoryRouter initialEntries={['/match/match-1/live']}>
        <Routes>
          <Route element={<LiveScoringScreen />} path="/match/:matchId/live" />
          <Route element={<div>Between sets</div>} path="/match/:matchId/between-sets" />
          <Route element={<div>Summary</div>} path="/history/:matchId/summary" />
        </Routes>
      </MemoryRouter>
    </StorageProvider>,
  )
}

describe('LiveScoringScreen', () => {
  it('renders set score display', async () => {
    renderScreen()

    expect(await screen.findByRole('button', { name: /increment us score/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /increment them score/i })).toBeInTheDocument()
  })

  it('renders stat buttons for selected player', async () => {
    renderScreen()

    expect(await screen.findByRole('button', { name: /kill \+ 0/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /dig \+ 0/i })).toBeInTheDocument()
  })

  it('renders undo button', async () => {
    renderScreen()

    expect(await screen.findByRole('button', { name: /undo/i })).toBeInTheDocument()
  })

  it('undo button is disabled initially', async () => {
    renderScreen()

    expect(await screen.findByRole('button', { name: /undo/i })).toBeDisabled()
  })

  it('clicking a stat button increments that stat', async () => {
    const user = userEvent.setup()
    renderScreen()

    await user.click(await screen.findByRole('button', { name: /kill \+ 0/i }))

    expect(await screen.findByRole('button', { name: /kill \+ 1/i })).toBeInTheDocument()
  })

  it('undo button enabled after stat change', async () => {
    const user = userEvent.setup()
    renderScreen()

    await user.click(await screen.findByRole('button', { name: /kill \+ 0/i }))

    await waitFor(() => expect(screen.getByRole('button', { name: /undo/i })).toBeEnabled())
  })

  it('clicking undo reverts last change', async () => {
    const user = userEvent.setup()
    renderScreen()

    await user.click(await screen.findByRole('button', { name: /kill \+ 0/i }))
    await user.click(screen.getByRole('button', { name: /undo/i }))

    await waitFor(() => expect(screen.getByRole('button', { name: /kill \+ 0/i })).toBeInTheDocument())
    await waitFor(() => expect(screen.getByRole('button', { name: /undo/i })).toBeDisabled())
  })
})
