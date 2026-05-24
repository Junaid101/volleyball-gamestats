import { render, screen } from '@testing-library/react'
import { LocalStorageService } from '../storage/localStorage'
import { StorageProvider, useStorage } from './StorageContext'

function TestConsumer() {
  const storage = useStorage()
  return <div>{storage ? 'has-storage' : 'no-storage'}</div>
}

describe('StorageContext', () => {
  it('provides storage service to children', () => {
    render(
      <StorageProvider service={new LocalStorageService()}>
        <TestConsumer />
      </StorageProvider>,
    )

    expect(screen.getByText('has-storage')).toBeInTheDocument()
  })

  it('throws when used outside provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => render(<TestConsumer />)).toThrow('useStorage must be used within StorageProvider')

    spy.mockRestore()
  })
})
