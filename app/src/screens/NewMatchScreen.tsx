import { Link, useNavigate } from 'react-router-dom'
import MatchSetupForm, { type MatchSetupData } from '../components/match/MatchSetupForm'
import { useMatchCreation } from '../hooks/useMatchCreation'
import { useRoster } from '../hooks/useRoster'

export default function NewMatchScreen() {
  const navigate = useNavigate()
  const { players, loading: playersLoading } = useRoster()
  const { createMatch, error, loading } = useMatchCreation()

  const handleSubmit = async (data: MatchSetupData) => {
    try {
      const matchId = await createMatch(data)
      navigate(`/match/${matchId}/live`, {
        state: { participatingPlayerIds: data.participatingPlayerIds },
      })
    } catch {
      // Hook state exposes the error for rendering.
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="mx-auto max-w-screen-sm space-y-6 px-4 py-6">
        <header className="flex items-center gap-3">
          <Link
            className="min-h-[56px] rounded-lg border border-gray-700 px-4 py-3 text-white transition hover:border-gray-500"
            to="/"
          >
            Back
          </Link>
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Match setup</p>
            <h1 className="mt-2 text-3xl font-bold text-white">New Match</h1>
          </div>
        </header>

        {playersLoading ? <p className="text-gray-400">Loading players...</p> : null}

        {!playersLoading && players.length === 0 ? (
          <section className="rounded-2xl bg-gray-800 p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-white">Add players first</h2>
            <p className="mt-2 text-gray-400">You need a roster before you can start a match.</p>
            <Link className="mt-4 inline-flex font-semibold text-indigo-400 hover:text-indigo-300" to="/roster">
              Go to roster
            </Link>
          </section>
        ) : null}

        {!playersLoading && players.length > 0 ? <MatchSetupForm onSubmit={handleSubmit} players={players} /> : null}

        {loading ? <p className="text-sm text-gray-400">Creating match...</p> : null}
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
      </div>
    </div>
  )
}
