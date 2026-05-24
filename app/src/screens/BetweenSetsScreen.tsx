import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useStorage } from '../hooks/useStorage'
import type { MatchSet, Player, PlayerSetStats } from '../types'

type SetLeader = {
  playerId: string
  name: string
  kills: number
  aces: number
  digs: number
}

export default function BetweenSetsScreen() {
  const { matchId } = useParams()
  const navigate = useNavigate()
  const storage = useStorage()
  const [loading, setLoading] = useState(true)
  const [lastCompletedSet, setLastCompletedSet] = useState<MatchSet | null>(null)
  const [nextSet, setNextSet] = useState<MatchSet | null>(null)
  const [leaders, setLeaders] = useState<SetLeader[]>([])

  useEffect(() => {
    let active = true

    const load = async () => {
      if (!matchId) {
        setLoading(false)
        return
      }

      setLoading(true)

      try {
        const [sets, players] = await Promise.all([storage.getSetsForMatch(matchId), storage.getPlayers()])
        const completedSet = [...sets]
          .filter((set) => set.status === 'completed')
          .sort((left, right) => right.setNumber - left.setNumber)[0] ?? null
        const inProgressSet = sets.find((set) => set.status === 'in_progress') ?? null
        const stats = completedSet ? await storage.getStatsForSet(completedSet.id) : []

        if (!active) {
          return
        }

        setLastCompletedSet(completedSet)
        setNextSet(inProgressSet)
        setLeaders(buildLeaders(stats, players))
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [matchId, storage])

  if (loading) {
    return <div className="min-h-screen bg-gray-900 p-4 text-white">Loading set break...</div>
  }

  if (!matchId || !lastCompletedSet || !nextSet) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 text-white">
        <p>Set transition unavailable.</p>
        <Link className="mt-4 inline-flex text-indigo-400" to="/">
          Back home
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-6 text-white">
      <div className="mx-auto max-w-screen-sm space-y-6">
        <header className="space-y-2 rounded-2xl bg-gray-800 p-5">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Set break</p>
          <h1 className="text-3xl font-bold">Set {lastCompletedSet.setNumber} complete</h1>
          <p className="text-xl text-gray-200">
            {lastCompletedSet.ourScore}:{lastCompletedSet.opponentScore}
          </p>
        </header>

        <section className="rounded-2xl bg-gray-800 p-5">
          <h2 className="text-lg font-semibold">Top contributors</h2>
          {leaders.length > 0 ? (
            <ul className="mt-3 space-y-3">
              {leaders.map((leader) => (
                <li className="rounded-xl bg-gray-700 p-3" key={leader.playerId}>
                  <p className="font-semibold">{leader.name}</p>
                  <p className="mt-1 text-sm text-gray-300">
                    K:{leader.kills} A:{leader.aces} D:{leader.digs}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-gray-400">No player stats recorded for the finished set.</p>
          )}
        </section>

        <button
          className="w-full rounded-2xl bg-indigo-600 px-4 py-4 text-lg font-semibold text-white transition active:bg-indigo-500"
          onClick={() => navigate(`/match/${matchId}/live`, { replace: true })}
          type="button"
        >
          Start Set {nextSet.setNumber}
        </button>
      </div>
    </div>
  )
}

function buildLeaders(stats: PlayerSetStats[], players: Player[]) {
  const playersById = new Map(players.map((player) => [player.id, player]))

  return [...stats]
    .sort((left, right) => {
      const rightScore = right.kills * 100 + right.aces * 10 + right.digs
      const leftScore = left.kills * 100 + left.aces * 10 + left.digs
      return rightScore - leftScore
    })
    .slice(0, 3)
    .map((statLine) => ({
      playerId: statLine.playerId,
      name: playersById.get(statLine.playerId)?.name ?? 'Unknown player',
      kills: statLine.kills,
      aces: statLine.aces,
      digs: statLine.digs,
    }))
}
