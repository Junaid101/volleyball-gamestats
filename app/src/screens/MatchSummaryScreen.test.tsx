import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { StorageProvider } from '../context/StorageContext'
import { createMockStorage } from '../test/mockStorage'
import type { Match, MatchSet, Player, PlayerSetStats } from '../types'
import MatchSummaryScreen from './MatchSummaryScreen'

const players: Player[] = [
  {
    id: 'player-1',
    teamId: 'team-1',
    name: 'Alice',
    position: 'outside',
    createdAt: '2026-05-24T00:00:00.000Z',
    updatedAt: '2026-05-24T00:00:00.000Z',
  },
  {
    id: 'player-2',
    teamId: 'team-1',
    name: 'Bob',
    position: 'setter',
    createdAt: '2026-05-24T00:00:00.000Z',
    updatedAt: '2026-05-24T00:00:00.000Z',
  },
  {
    id: 'player-3',
    teamId: 'team-1',
    name: 'Carol',
    position: 'middle',
    createdAt: '2026-05-24T00:00:00.000Z',
    updatedAt: '2026-05-24T00:00:00.000Z',
  },
  {
    id: 'player-4',
    teamId: 'team-1',
    name: 'Dana',
    position: 'libero',
    createdAt: '2026-05-24T00:00:00.000Z',
    updatedAt: '2026-05-24T00:00:00.000Z',
  },
]

const match: Match = {
  id: 'match-1',
  teamId: 'team-1',
  opponent: 'Falcons',
  date: '2026-05-24T00:00:00.000Z',
  format: 'best_of_5',
  status: 'completed',
  winner: 'team',
  participatingPlayerIds: players.map((player) => player.id),
  sets: [],
}

const sets: MatchSet[] = [
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
    ourScore: 22,
    opponentScore: 25,
    status: 'completed',
  },
  {
    id: 'set-3',
    matchId: 'match-1',
    setNumber: 3,
    ourScore: 25,
    opponentScore: 18,
    status: 'completed',
  },
  {
    id: 'set-4',
    matchId: 'match-1',
    setNumber: 4,
    ourScore: 25,
    opponentScore: 21,
    status: 'completed',
  },
]

const stats: PlayerSetStats[] = [
  {
    id: 'stats-1',
    playerId: 'player-1',
    setId: 'set-1',
    kills: 5,
    attackErrors: 2,
    attackAttempts: 12,
    assists: 0,
    aces: 0,
    serviceErrors: 0,
    digs: 2,
    blocksSolo: 0,
    blocksAssisted: 0,
    receptionErrors: 0,
    createdAt: '2026-05-24T00:00:00.000Z',
    updatedAt: '2026-05-24T00:00:00.000Z',
  },
  {
    id: 'stats-2',
    playerId: 'player-1',
    setId: 'set-3',
    kills: 7,
    attackErrors: 1,
    attackAttempts: 11,
    assists: 0,
    aces: 0,
    serviceErrors: 0,
    digs: 1,
    blocksSolo: 0,
    blocksAssisted: 0,
    receptionErrors: 0,
    createdAt: '2026-05-24T00:00:00.000Z',
    updatedAt: '2026-05-24T00:00:00.000Z',
  },
  {
    id: 'stats-3',
    playerId: 'player-2',
    setId: 'set-1',
    kills: 4,
    attackErrors: 1,
    attackAttempts: 6,
    assists: 12,
    aces: 0,
    serviceErrors: 0,
    digs: 1,
    blocksSolo: 0,
    blocksAssisted: 0,
    receptionErrors: 0,
    createdAt: '2026-05-24T00:00:00.000Z',
    updatedAt: '2026-05-24T00:00:00.000Z',
  },
  {
    id: 'stats-4',
    playerId: 'player-3',
    setId: 'set-2',
    kills: 2,
    attackErrors: 1,
    attackAttempts: 8,
    assists: 0,
    aces: 3,
    serviceErrors: 1,
    digs: 1,
    blocksSolo: 1,
    blocksAssisted: 0,
    receptionErrors: 0,
    createdAt: '2026-05-24T00:00:00.000Z',
    updatedAt: '2026-05-24T00:00:00.000Z',
  },
  {
    id: 'stats-5',
    playerId: 'player-4',
    setId: 'set-4',
    kills: 0,
    attackErrors: 0,
    attackAttempts: 0,
    assists: 0,
    aces: 0,
    serviceErrors: 0,
    digs: 8,
    blocksSolo: 0,
    blocksAssisted: 0,
    receptionErrors: 1,
    createdAt: '2026-05-24T00:00:00.000Z',
    updatedAt: '2026-05-24T00:00:00.000Z',
  },
]

function renderScreen() {
  const storage = createMockStorage({
    getMatch: vi.fn().mockResolvedValue(match),
    getSetsForMatch: vi.fn().mockResolvedValue(sets),
    getStatsForMatch: vi.fn().mockResolvedValue(stats),
    getPlayers: vi.fn().mockResolvedValue(players),
  })

  render(
    <StorageProvider service={storage}>
      <MemoryRouter initialEntries={['/history/match-1/summary']}>
        <Routes>
          <Route path="/history/:matchId/summary" element={<MatchSummaryScreen />} />
          <Route path="/history/:matchId" element={<div>Match detail page</div>} />
        </Routes>
      </MemoryRouter>
    </StorageProvider>,
  )
}

describe('MatchSummaryScreen', () => {
  it('renders opponent name', async () => {
    renderScreen()

    expect(await screen.findByText('Falcons')).toBeInTheDocument()
  })

  it('renders match result (WIN/LOSS)', async () => {
    renderScreen()

    expect(await screen.findByText('WIN')).toBeInTheDocument()
    expect(screen.getByText('3 – 1')).toBeInTheDocument()
  })

  it('renders set scores', async () => {
    renderScreen()

    expect(
      await screen.findByText((_, element) => element?.textContent === 'Set 1: 25–20 ✓'),
    ).toBeInTheDocument()
    expect(screen.getByText((_, element) => element?.textContent === 'Set 2: 22–25 ✗')).toBeInTheDocument()
  })

  it('renders top performers section', async () => {
    renderScreen()

    expect(await screen.findByText('⭐ Top Performers')).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('.500')).toBeInTheDocument()
    expect(screen.getByText('Carol')).toBeInTheDocument()
    expect(screen.getByText('Dana')).toBeInTheDocument()
  })

  it('Share button present', async () => {
    renderScreen()

    expect(await screen.findByRole('button', { name: 'Share' })).toBeInTheDocument()
  })

  it('clicking Share calls navigator.share when available', async () => {
    const user = userEvent.setup()
    const share = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'share', {
      value: share,
      configurable: true,
    })

    renderScreen()
    await user.click(await screen.findByRole('button', { name: 'Share' }))

    expect(share).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.stringContaining('vs Falcons – WIN 3-1'),
      }),
    )
  })

  it('clicking Share copies to clipboard when navigator.share unavailable', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)

    Object.defineProperty(navigator, 'share', {
      value: undefined,
      configurable: true,
    })
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })

    renderScreen()
    await user.click(await screen.findByRole('button', { name: 'Share' }))

    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('Set scores: 25-20, 22-25, 25-18, 25-21'))
  })

  it('View Full Stats link navigates to match detail', async () => {
    const user = userEvent.setup()
    renderScreen()

    await user.click(await screen.findByRole('link', { name: 'View Full Stats' }))

    await waitFor(() => expect(screen.getByText('Match detail page')).toBeInTheDocument())
  })
})
