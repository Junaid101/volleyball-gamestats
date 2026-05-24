import { useCallback, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Player } from '../types'
import { useStorage } from './useStorage'
import type { PlayerFormValues } from '../components/roster/AddPlayerForm'

const createId = () => globalThis.crypto?.randomUUID?.() ?? uuidv4()

export function useRoster() {
  const storage = useStorage()
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  const loadPlayers = useCallback(async () => {
    const nextPlayers = await storage.getPlayers()
    setPlayers(nextPlayers)
  }, [storage])

  useEffect(() => {
    let active = true

    const run = async () => {
      setLoading(true)

      try {
        const nextPlayers = await storage.getPlayers()

        if (active) {
          setPlayers(nextPlayers)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void run()

    return () => {
      active = false
    }
  }, [storage])

  const addPlayer = useCallback(
    async (player: PlayerFormValues) => {
      const team = await storage.getTeam()

      if (!team) {
        throw new Error('Team must exist before adding players')
      }

      const timestamp = new Date().toISOString()
      await storage.savePlayer({
        id: createId(),
        teamId: team.id,
        name: player.name,
        position: player.position,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      await loadPlayers()
    },
    [loadPlayers, storage],
  )

  const updatePlayer = useCallback(
    async (player: Player) => {
      await storage.savePlayer({
        ...player,
        updatedAt: new Date().toISOString(),
      })
      await loadPlayers()
    },
    [loadPlayers, storage],
  )

  const removePlayer = useCallback(
    async (id: string) => {
      await storage.deletePlayer(id)
      await loadPlayers()
    },
    [loadPlayers, storage],
  )

  return {
    players,
    addPlayer,
    updatePlayer,
    removePlayer,
    loading,
  }
}
