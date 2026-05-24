import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Player } from '../../types'
import PlayerCard from './PlayerCard'

const player: Player = {
  id: 'player-1',
  teamId: 'team-1',
  name: 'Avery Lee',
  positions: ['setter'],
    primaryPosition: 'setter',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
}

describe('PlayerCard', () => {
  it('renders player name and position', () => {
    render(<PlayerCard player={player} onEdit={vi.fn()} onDelete={vi.fn()} />)

    expect(screen.getByText('Avery Lee')).toBeInTheDocument()
    expect(screen.getByText('setter')).toBeInTheDocument()
  })

  it('calls onEdit when edit button clicked', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()

    render(<PlayerCard player={player} onEdit={onEdit} onDelete={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /edit avery lee/i }))

    expect(onEdit).toHaveBeenCalledTimes(1)
  })

  it('calls onDelete when delete button clicked', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()

    render(<PlayerCard player={player} onEdit={vi.fn()} onDelete={onDelete} />)

    await user.click(screen.getByRole('button', { name: /delete avery lee/i }))

    expect(onDelete).toHaveBeenCalledTimes(1)
  })
})
