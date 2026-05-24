import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Match, MatchSet } from '../../types'
import MatchResultCard from './MatchResultCard'

const match: Match = {
  id: 'match-1',
  teamId: 'team-1',
  opponent: 'Falcons',
  date: '2025-01-10T00:00:00.000Z',
  format: 'best_of_3',
  status: 'completed',
  sets: [],
  winner: 'team',
  createdAt: '2025-01-10T00:00:00.000Z',
  updatedAt: '2025-01-10T00:00:00.000Z',
}

const winningSets: MatchSet[] = [
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
]

const losingSets: MatchSet[] = [
  {
    id: 'set-1',
    matchId: 'match-1',
    setNumber: 1,
    ourScore: 21,
    opponentScore: 25,
    status: 'completed',
  },
  {
    id: 'set-2',
    matchId: 'match-1',
    setNumber: 2,
    ourScore: 18,
    opponentScore: 25,
    status: 'completed',
  },
]

describe('MatchResultCard', () => {
  it('renders opponent name', () => {
    render(<MatchResultCard match={match} onClick={() => undefined} sets={winningSets} />)

    expect(screen.getByText('Falcons')).toBeInTheDocument()
  })

  it('renders formatted date', () => {
    render(<MatchResultCard match={match} onClick={() => undefined} sets={winningSets} />)

    expect(screen.getByText('Jan 10, 2025')).toBeInTheDocument()
  })

  it('renders set scores', () => {
    render(<MatchResultCard match={match} onClick={() => undefined} sets={winningSets} />)

    expect(screen.getByText('25-20, 25-18')).toBeInTheDocument()
  })

  it('shows W badge for won match (ourScore > oppScore in more sets)', () => {
    render(<MatchResultCard match={match} onClick={() => undefined} sets={winningSets} />)

    expect(screen.getByText('W')).toBeInTheDocument()
  })

  it('shows L badge for lost match', () => {
    render(<MatchResultCard match={match} onClick={() => undefined} sets={losingSets} />)

    expect(screen.getByText('L')).toBeInTheDocument()
  })

  it('calls onClick when card tapped', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(<MatchResultCard match={match} onClick={onClick} sets={winningSets} />)

    await user.click(screen.getByRole('button', { name: /falcons/i }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('applies green border for win', () => {
    render(<MatchResultCard match={match} onClick={() => undefined} sets={winningSets} />)

    expect(screen.getByRole('button', { name: /falcons/i })).toHaveClass('border-green-500')
  })

  it('applies red border for loss', () => {
    render(<MatchResultCard match={match} onClick={() => undefined} sets={losingSets} />)

    expect(screen.getByRole('button', { name: /falcons/i })).toHaveClass('border-red-500')
  })
})
