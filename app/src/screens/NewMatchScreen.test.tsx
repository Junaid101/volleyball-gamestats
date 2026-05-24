import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { StorageProvider } from '../context/StorageContext'
import { createMockStorage } from '../test/mockStorage'
import type { Player } from '../types'
import NewMatchScreen from './NewMatchScreen'

const { createMatchMock } = vi.hoisted(() => ({
  createMatchMock: vi.fn(),
}))

vi.mock('../hooks/useMatchCreation', () => ({
  useMatchCreation: () => ({
    createMatch: createMatchMock,
    loading: false,
    error: null,
  }),
}))

const players: Player[] = [
  {
    id: 'player-1',
    teamId: 'team-1',
    name: 'Avery Lee',
    positions: ['outside'],
    primaryPosition: 'outside',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'player-2',
    teamId: 'team-1',
    name: 'Jordan Kim',
    positions: ['setter'],
    primaryPosition: 'setter',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
]

function renderScreen() {
  const mockStorage = createMockStorage({
    getPlayers: vi.fn().mockResolvedValue(players),
  })

  return render(
    <StorageProvider service={mockStorage}>
      <MemoryRouter initialEntries={['/match/new']}>
        <Routes>
          <Route path="/match/new" element={<NewMatchScreen />} />
          <Route path="/match/:matchId/live" element={<div>Live match screen</div>} />
        </Routes>
      </MemoryRouter>
    </StorageProvider>,
  )
}

describe('NewMatchScreen', () => {
  beforeEach(() => {
    createMatchMock.mockReset()
    createMatchMock.mockResolvedValue('match-123')
  })

  it('renders opponent name input', async () => {
    renderScreen()

    expect(await screen.findByLabelText(/opponent name/i)).toBeInTheDocument()
  })

  it('renders format selector with both options', async () => {
    renderScreen()

    expect(await screen.findByRole('button', { name: 'Best of 3' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Best of 5' })).toBeInTheDocument()
  })

  it('renders player checklist populated from roster', async () => {
    renderScreen()

    expect(await screen.findByRole('checkbox', { name: 'Avery Lee' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Jordan Kim' })).toBeInTheDocument()
  })

  it('all players are checked by default', async () => {
    renderScreen()

    expect(await screen.findByRole('checkbox', { name: 'Avery Lee' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Jordan Kim' })).toBeChecked()
  })

  it('Start Match button is disabled when opponent name is empty', async () => {
    renderScreen()

    expect(await screen.findByRole('button', { name: 'Start Match' })).toBeDisabled()
  })

  it('Start Match button is enabled when opponent name is filled', async () => {
    const user = userEvent.setup()

    renderScreen()

    await user.type(await screen.findByLabelText(/opponent name/i), 'Falcons')

    expect(screen.getByRole('button', { name: 'Start Match' })).toBeEnabled()
  })

  it('submitting form calls createMatch with correct data', async () => {
    const user = userEvent.setup()

    renderScreen()

    await user.type(await screen.findByLabelText(/opponent name/i), 'Falcons')
    await user.click(screen.getByRole('button', { name: 'Best of 5' }))
    await user.click(screen.getByRole('checkbox', { name: 'Jordan Kim' }))
    await user.click(screen.getByRole('button', { name: 'Start Match' }))

    await waitFor(() => {
      expect(createMatchMock).toHaveBeenCalledWith({
        opponent: 'Falcons',
        format: 'best_of_5',
        participatingPlayerIds: ['player-1'],
      })
    })
  })

  it('submitting form navigates to /match/:matchId/live', async () => {
    const user = userEvent.setup()

    renderScreen()

    await user.type(await screen.findByLabelText(/opponent name/i), 'Falcons')
    await user.click(screen.getByRole('button', { name: 'Start Match' }))

    expect(await screen.findByText('Live match screen')).toBeInTheDocument()
  })

  it('can uncheck a player', async () => {
    const user = userEvent.setup()

    renderScreen()

    const playerCheckbox = await screen.findByRole('checkbox', { name: 'Jordan Kim' })
    await user.click(playerCheckbox)

    expect(playerCheckbox).not.toBeChecked()
  })

  it('validation: shows error if no players selected', async () => {
    const user = userEvent.setup()

    renderScreen()

    await user.type(await screen.findByLabelText(/opponent name/i), 'Falcons')
    await user.click(screen.getByRole('checkbox', { name: 'Avery Lee' }))
    await user.click(screen.getByRole('checkbox', { name: 'Jordan Kim' }))
    await user.click(screen.getByRole('button', { name: 'Start Match' }))

    expect(await screen.findByText('Select at least one player.')).toBeInTheDocument()
    expect(createMatchMock).not.toHaveBeenCalled()
  })
})
