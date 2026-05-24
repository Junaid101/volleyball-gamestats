import PlayerSeasonStatsCard from '../components/history/PlayerSeasonStatsCard'
import { usePlayerSeasonStats } from '../hooks/usePlayerSeasonStats'

export default function PlayerStatsScreen() {
  const { players, stats, loading } = usePlayerSeasonStats()

  return (
    <section className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Season totals</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Players</h1>
      </header>

      {loading ? <p className="text-gray-400">Loading player stats...</p> : null}

      {!loading && players.length === 0 ? (
        <div className="rounded-2xl bg-gray-800 p-6 text-center shadow-lg">
          <p className="text-lg font-medium text-white">Add players to your roster to see stats</p>
        </div>
      ) : null}

      {players.length > 0 ? (
        <div className="space-y-3">
          {players.map((player) => {
            const playerStats = stats[player.id]

            if (!playerStats) {
              return null
            }

            return <PlayerSeasonStatsCard key={player.id} player={player} stats={playerStats} />
          })}
        </div>
      ) : null}
    </section>
  )
}
