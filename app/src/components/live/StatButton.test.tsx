import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StatButton from './StatButton'

describe('StatButton', () => {
  it('renders label and value', () => {
    render(<StatButton label="Kill +" onPress={() => undefined} value={3} />)

    expect(screen.getByText('Kill +')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('calls onPress when clicked', async () => {
    const user = userEvent.setup()
    const onPress = vi.fn()

    render(<StatButton label="Ace +" onPress={onPress} value={1} />)

    await user.click(screen.getByRole('button', { name: /ace \+ 1/i }))

    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('disabled state prevents click and shows disabled style', async () => {
    const user = userEvent.setup()
    const onPress = vi.fn()

    render(<StatButton disabled label="Dig +" onPress={onPress} value={0} />)

    const button = screen.getByRole('button', { name: /dig \+ 0/i })
    await user.click(button)

    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:bg-gray-800')
    expect(onPress).not.toHaveBeenCalled()
  })
})
