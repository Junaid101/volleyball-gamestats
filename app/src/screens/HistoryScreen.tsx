import { Link, useNavigate } from 'react-router-dom'
import MatchResultCard from '../components/history/MatchResultCard'
import { useMatchHistory } from '../hooks/useMatchHistory'

export default function HistoryScreen() {
  const navigate = useNavigate()
  const { matches, loading } = useMatchHistory()

  return (
    <section className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Match history</p>
        <h1 className="mt-2 text-3xl font-bold text-white">History</h1>
      </header>

      {loading ? <p className="text-gray-400">Loading matches...</p> : null}

      {!loading && matches.length === 0 ? (
        <div className="rounded-2xl bg-gray-800 p-6 text-center shadow-lg">
          <p className="text-lg font-medium text-white">No matches yet. Start your first match!</p>
          <Link className="mt-4 inline-flex font-semibold text-indigo-400 hover:text-indigo-300" to="/match/new">
            Start a new match
          </Link>
        </div>
      ) : null}

      {matches.length > 0 ? (
        <div className="space-y-3">
          {matches.map((match) => (
            <MatchResultCard
              key={match.id}
              match={match}
              onClick={() => navigate(`/history/${match.id}`)}
              sets={match.sets}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}
