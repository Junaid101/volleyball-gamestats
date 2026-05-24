import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SetScoreDisplay from './SetScoreDisplay'

describe('SetScoreDisplay', () => {
  it('renders both scores', () => {
    render(
      <SetScoreDisplay onOppScorePress={() => undefined} onOurScorePress={() => undefined} oppScore={22} ourScore={24} />,
    )

    expect(screen.getByText('24')).toBeInTheDocument()
    expect(screen.getByText('22')).toBeInTheDocument()
  })

  it('calls onOurScorePress when our score tapped', async () => {
    const user = userEvent.setup()
    const onOurScorePress = vi.fn()

    render(
      <SetScoreDisplay onOppScorePress={() => undefined} onOurScorePress={onOurScorePress} oppScore={8} ourScore={10} />,
    )

    await user.click(screen.getByRole('button', { name: /increment us score/i }))

    expect(onOurScorePress).toHaveBeenCalledTimes(1)
  })

  it('calls onOppScorePress when opponent score tapped', async () => {
    const user = userEvent.setup()
    const onOppScorePress = vi.fn()

    render(
      <SetScoreDisplay onOppScorePress={onOppScorePress} onOurScorePress={() => undefined} oppScore={11} ourScore={9} />,
    )

    await user.click(screen.getByRole('button', { name: /increment them score/i }))

    expect(onOppScorePress).toHaveBeenCalledTimes(1)
  })
})
