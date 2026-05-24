import { render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { StorageProvider } from '../context/StorageContext'
import { createMockStorage } from '../test/mockStorage'
import type { MatchSummary, Player } from '../types'
import MatchDetailScreen from './MatchDetailScreen'

const players: Player[] = [
  {
    id: 'player-1',
    teamId: 'team-1',
    name: 'Jordan Kim',
    positions: ['outside'],
    primaryPosition: 'outside',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'player-2',
    teamId: 'team-1',
    name: 'Avery Lee',
    positions: ['setter'],
    primaryPosition: 'setter',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'player-3',
    teamId: 'team-1',
    name: 'Sam Park',
    positions: ['libero'],
    primaryPosition: 'libero',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
]

const summary: MatchSummary = {
  match: {
    id: 'match-1',
    teamId: 'team-1',
    opponent: 'Falcons',
    date: '2025-01-10T00:00:00.000Z',
    format: 'best_of_3',
    status: 'completed',
    winner: 'team',
    sets: [],
  },
  sets: [
    {
      id: 'set-1',
      matchId: 'match-1',
      setNumber: 1,
      ourScore: 25,
      opponentScore: 20,
      status: 'completed',
    },
    {
      id: 'set-2',
      matchId: 'match-1',
      setNumber: 2,
      ourScore: 25,
      opponentScore: 18,
      status: 'completed',
    },
  ],
  playerStats: [
    {
      id: 'stats-1',
      playerId: 'player-1',
      setId: 'set-1',
      kills: 2,
      attackErrors: 0,
      attackAttempts: 3,
      assists: 1,
      aces: 1,
      serviceErrors: 0,
      digs: 2,
      blocksSolo: 1,
      blocksAssisted: 0,
      receptionErrors: 0,
      createdAt: '2025-01-10T00:00:00.000Z',
      updatedAt: '2025-01-10T00:00:00.000Z',
      hittingEfficiency: 0.667,
    },
    {
      id: 'stats-2',
      playerId: 'player-1',
      setId: 'set-2',
      kills: 1,
      attackErrors: 1,
      attackAttempts: 3,
      assists: 0,
      aces: 0,
      serviceErrors: 1,
      digs: 1,
      blocksSolo: 0,
      blocksAssisted: 1,
      receptionErrors: 0,
      createdAt: '2025-01-10T00:00:00.000Z',
      updatedAt: '2025-01-10T00:00:00.000Z',
      hittingEfficiency: 0,
    },
    {
      id: 'stats-3',
      playerId: 'player-2',
      setId: 'set-1',
      kills: 1,
      attackErrors: 0,
      attackAttempts: 1,
      assists: 6,
      aces: 0,
      serviceErrors: 0,
      digs: 1,
      blocksSolo: 0,
      blocksAssisted: 0,
      receptionErrors: 0,
      createdAt: '2025-01-10T00:00:00.000Z',
      updatedAt: '2025-01-10T00:00:00.000Z',
      hittingEfficiency: 1,
    },
    {
      id: 'stats-4',
      playerId: 'player-3',
      setId: 'set-1',
      kills: 0,
      attackErrors: 0,
      attackAttempts: 0,
      assists: 0,
      aces: 0,
      serviceErrors: 0,
      digs: 4,
      blocksSolo: 0,
      blocksAssisted: 0,
      receptionErrors: 1,
      createdAt: '2025-01-10T00:00:00.000Z',
      updatedAt: '2025-01-10T00:00:00.000Z',
      hittingEfficiency: 0,
    },
  ],
}

function renderScreen() {
  const storage = createMockStorage({
    getMatchSummary: vi.fn().mockResolvedValue(summary),
    getPlayers: vi.fn().mockResolvedValue(players),
  })

  render(
    <StorageProvider service={storage}>
      <MemoryRouter initialEntries={['/history/match-1']}>
        <Routes>
          <Route path="/history" element={<div>History screen</div>} />
          <Route path="/history/:matchId" element={<MatchDetailScreen />} />
        </Routes>
      </MemoryRouter>
    </StorageProvider>,
  )
}

describe('MatchDetailScreen', () => {
  it('renders opponent name and date', async () => {
    renderScreen()

    expect(await screen.findByText('Falcons')).toBeInTheDocument()
    expect(screen.getByText('Jan 10, 2025')).toBeInTheDocument()
  })

  it('renders set scores table with correct values', async () => {
    renderScreen()

    await waitFor(() => {
      const rows = screen.getAllByTestId('set-row')
      expect(within(rows[0]).getByText('1')).toBeInTheDocument()
      expect(within(rows[0]).getByText('25')).toBeInTheDocument()
      expect(within(rows[0]).getByText('20')).toBeInTheDocument()
      expect(within(rows[0]).getByText('Us')).toBeInTheDocument()
      expect(within(rows[1]).getByText('2')).toBeInTheDocument()
      expect(within(rows[1]).getByText('18')).toBeInTheDocument()
    })
  })

  it('renders player stats table', async () => {
    renderScreen()

    expect(await screen.findByRole('columnheader', { name: 'Player' })).toBeInTheDocument()
    expect(screen.getByText('Jordan Kim')).toBeInTheDocument()
    expect(screen.getByText('Avery Lee')).toBeInTheDocument()
    expect(screen.getByText('Sam Park')).toBeInTheDocument()
  })

  it('hitting efficiency shows "—" when attempts = 0', async () => {
    renderScreen()

    await waitFor(() => {
      const samRow = screen
        .getAllByTestId('player-row')
        .find((row) => within(row).getByTestId('player-name').textContent === 'Sam Park')

      expect(samRow).toBeDefined()
      expect(within(samRow as HTMLElement).getByText('—')).toBeInTheDocument()
    })
  })

  it('hitting efficiency formatted to 3 decimal places', async () => {
    renderScreen()

    expect(await screen.findByText('.333')).toBeInTheDocument()
  })

  it('players sorted by kills descending', async () => {
    renderScreen()

    await waitFor(() => {
      const rows = screen.getAllByTestId('player-row')
      const names = rows.map((row) => within(row).getByTestId('player-name').textContent)
      expect(names).toEqual(['Jordan Kim', 'Avery Lee', 'Sam Park'])
    })
  })
})
