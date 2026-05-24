import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStorage } from '../hooks/useStorage'
import type { Match, Team } from '../types'

export default function HomeScreen() {
  const storage = useStorage()
  const [team, setTeam] = useState<Team | null>(null)
  const [matches, setMatches] = useState<Match[]>([])

  useEffect(() => {
    let active = true

    const run = async () => {
      const [nextTeam, nextMatches] = await Promise.all([storage.getTeam(), storage.getMatches()])

      if (active) {
        setTeam(nextTeam)
        setMatches(nextMatches)
      }
    }

    void run()

    return () => {
      active = false
    }
  }, [storage])

  const lastMatch = useMemo(
    () => [...matches].sort((left, right) => right.date.localeCompare(left.date))[0] ?? null,
    [matches],
  )

  const lastMatchLabel = lastMatch
    ? `${lastMatch.status === 'in_progress' ? 'In progress' : lastMatch.winner === 'team' ? 'Won' : 'Completed'} vs ${lastMatch.opponent}`
    : 'No matches recorded yet'

  return (
    <section className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Dashboard</p>
        <h1 className="mt-2 text-3xl font-bold text-white">{team?.name ?? 'Volleyball GameStats'}</h1>
        <p className="mt-2 text-sm text-gray-400">Track your roster and jump into match day quickly.</p>
      </header>

      <div className="rounded-2xl bg-gray-800 p-5 shadow-lg">
        <p className="text-sm text-gray-400">Last match</p>
        <p className="mt-2 text-xl font-semibold text-white">{lastMatchLabel}</p>
      </div>

      <div className="grid gap-3">
        <Link
          className="min-h-[56px] rounded-lg bg-indigo-600 px-4 py-4 text-center font-semibold text-white transition hover:bg-indigo-700"
          to="/match/new"
        >
          Start New Match
        </Link>
        <Link
          className="min-h-[56px] rounded-lg border border-gray-600 px-4 py-4 text-center font-semibold text-white transition hover:border-gray-500"
          to="/history"
        >
          View History
        </Link>
      </div>

      <div className="rounded-2xl bg-gray-800 p-5 shadow-lg">
        <p className="text-sm text-gray-400">Roster</p>
        <p className="mt-2 text-white">Manage player roles and keep your squad match ready.</p>
        <Link className="mt-4 inline-flex text-sm font-semibold text-indigo-400 hover:text-indigo-300" to="/roster">
          Go to roster
        </Link>
      </div>
    </section>
  )
}
