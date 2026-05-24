import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AddPlayerForm from './AddPlayerForm'

const positions = ['outside', 'opposite', 'middle', 'setter', 'libero', 'defensive']

describe('AddPlayerForm', () => {
  it('renders all position options', () => {
    render(<AddPlayerForm onSave={vi.fn()} onCancel={vi.fn()} />)

    positions.forEach((position) => {
      expect(screen.getByRole('radio', { name: position })).toBeInTheDocument()
    })
  })

  it('submit button disabled when name is empty', () => {
    render(<AddPlayerForm onSave={vi.fn()} onCancel={vi.fn()} />)

    expect(screen.getByRole('button', { name: /save player/i })).toBeDisabled()
  })

  it('calls onSave with correct data on submit', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()

    render(<AddPlayerForm onSave={onSave} onCancel={vi.fn()} />)

    await user.type(screen.getByLabelText(/name/i), 'Jordan Kim')
    await user.click(screen.getByRole('radio', { name: 'libero' }))
    await user.click(screen.getByRole('button', { name: /save player/i }))

    expect(onSave).toHaveBeenCalledWith({ name: 'Jordan Kim', position: 'libero' })
  })

  it('calls onCancel when cancel is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()

    render(<AddPlayerForm onSave={vi.fn()} onCancel={onCancel} />)

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})
