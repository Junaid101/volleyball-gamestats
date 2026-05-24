import { createContext, useContext, type ReactNode } from 'react'
import type { StorageService } from '../storage/types'
import { LocalStorageService } from '../storage/localStorage'

const StorageContext = createContext<StorageService | null>(null)

const defaultService = new LocalStorageService()

export function StorageProvider({
  children,
  service = defaultService,
}: {
  children: ReactNode
  service?: StorageService
}) {
  return <StorageContext.Provider value={service}>{children}</StorageContext.Provider>
}

export function useStorage(): StorageService {
  const ctx = useContext(StorageContext)

  if (!ctx) {
    throw new Error('useStorage must be used within StorageProvider')
  }

  return ctx
}
