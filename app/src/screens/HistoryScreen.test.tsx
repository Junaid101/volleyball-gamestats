import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { StorageProvider } from '../context/StorageContext'
import { createMockStorage } from '../test/mockStorage'
import type { Match, MatchSet } from '../types'
import HistoryScreen from './HistoryScreen'

const matches: Match[] = [
  {
    id: 'match-1',
    teamId: 'team-1',
    opponent: 'Falcons',
    date: '2025-01-10T00:00:00.000Z',
    format: 'best_of_3',
    status: 'completed',
    sets: [],
  },
  {
    id: 'match-2',
    teamId: 'team-1',
    opponent: 'Tigers',
    date: '2025-02-05T00:00:00.000Z',
    format: 'best_of_3',
    status: 'completed',
    sets: [],
  },
]

const setsByMatchId: Record<string, MatchSet[]> = {
  'match-1': [
    {
      id: 'set-1',
      matchId: 'match-1',
      setNumber: 1,
      ourScore: 25,
      opponentScore: 20,
      status: 'completed',
    },
  ],
  'match-2': [
    {
      id: 'set-2',
      matchId: 'match-2',
      setNumber: 1,
      ourScore: 25,
      opponentScore: 21,
      status: 'completed',
    },
  ],
}

function renderScreen(options?: { matches?: Match[]; sets?: Record<string, MatchSet[]> }) {
  const mockStorage = createMockStorage({
    getMatches: vi.fn().mockResolvedValue(options?.matches ?? matches),
    getSetsForMatch: vi.fn().mockImplementation(async (matchId: string) => options?.sets?.[matchId] ?? setsByMatchId[matchId] ?? []),
  })

  render(
    <StorageProvider service={mockStorage}>
      <MemoryRouter initialEntries={['/history']}>
        <Routes>
          <Route path="/history" element={<HistoryScreen />} />
          <Route path="/history/:matchId" element={<div>Match detail screen</div>} />
          <Route path="/match/new" element={<div>New match screen</div>} />
        </Routes>
      </MemoryRouter>
    </StorageProvider>,
  )
}

describe('HistoryScreen', () => {
  it('renders empty state when no matches', async () => {
    renderScreen({ matches: [], sets: {} })

    expect(await screen.findByText('No matches yet. Start your first match!')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /start a new match/i })).toBeInTheDocument()
  })

  it('renders match cards for existing matches', async () => {
    renderScreen()

    expect(await screen.findByRole('button', { name: /falcons/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /tigers/i })).toBeInTheDocument()
  })

  it('navigates to match detail on card click', async () => {
    const user = userEvent.setup()

    renderScreen()

    await user.click(await screen.findByRole('button', { name: /falcons/i }))

    expect(await screen.findByText('Match detail screen')).toBeInTheDocument()
  })

  it('matches sorted by date descending', async () => {
    renderScreen()

    await waitFor(() => {
      const cards = screen.getAllByTestId('match-result-card')
      const opponents = cards.map((card) => within(card).getByRole('heading', { level: 3 }).textContent)
      expect(opponents).toEqual(['Tigers', 'Falcons'])
    })
  })
})
