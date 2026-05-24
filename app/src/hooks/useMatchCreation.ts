import { useCallback, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Match, MatchSet } from '../types'
import type { MatchSetupData } from '../components/match/MatchSetupForm'
import { useStorage } from './useStorage'

const createId = () => globalThis.crypto?.randomUUID?.() ?? uuidv4()

export function useMatchCreation() {
  const storage = useStorage()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createMatch = useCallback(
    async (data: MatchSetupData): Promise<string> => {
      setLoading(true)
      setError(null)

      try {
        const team = await storage.getTeam()

        if (!team) {
          throw new Error('Team must exist before creating a match.')
        }

        const timestamp = new Date().toISOString()
        const matchId = createId()
        const firstSetId = createId()
        const match: Match = {
          id: matchId,
          teamId: team.id,
          opponent: data.opponent,
          format: data.format,
          date: timestamp,
          status: 'in_progress',
          sets: [],
          participatingPlayerIds: data.participatingPlayerIds,
          createdAt: timestamp,
          updatedAt: timestamp,
        }
        const firstSet: MatchSet = {
          id: firstSetId,
          matchId,
          setNumber: 1,
          ourScore: 0,
          opponentScore: 0,
          status: 'in_progress',
          createdAt: timestamp,
          updatedAt: timestamp,
        }

        await Promise.all([storage.saveMatch(match), storage.saveSet(firstSet)])

        return matchId
      } catch (nextError) {
        const message = nextError instanceof Error ? nextError.message : 'Unable to create match.'
        setError(message)
        throw nextError
      } finally {
        setLoading(false)
      }
    },
    [storage],
  )

  return {
    createMatch,
    loading,
    error,
  }
}
