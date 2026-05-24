import type { Player, PlayerSeasonStats } from '../../types'
import { formatHittingEfficiency, getEfficiencyColorClass } from '../../utils/matchUtils'

function formatPosition(position: Player['position']) {
  return position.replace('_', ' ')
}

export default function PlayerSeasonStatsCard({ player, stats }: { player: Player; stats: PlayerSeasonStats }) {
  const blocks = stats.blocksSolo + stats.blocksAssisted
  const efficiencyText = formatHittingEfficiency(stats.kills, stats.attackErrors, stats.attackAttempts)
  const efficiencyColor = getEfficiencyColorClass(stats.hittingEfficiency, stats.attackAttempts)

  return (
    <article className="rounded-2xl bg-gray-800 p-4 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">{player.name}</h2>
          <p className="mt-3 text-xs uppercase tracking-[0.3em] text-gray-400">Season efficiency</p>
          <p className={`mt-1 text-2xl font-bold ${efficiencyColor}`}>{efficiencyText}</p>
        </div>
        <span className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
          {formatPosition(player.position)}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-gray-700 p-3">
          <dt className="text-gray-400">Matches</dt>
          <dd className="mt-1 text-lg font-semibold text-white">{stats.matchesPlayed}</dd>
        </div>
        <div className="rounded-xl bg-gray-700 p-3">
          <dt className="text-gray-400">Kills / Errors / Att</dt>
          <dd className="mt-1 text-lg font-semibold text-white">
            {stats.kills}/{stats.attackErrors}/{stats.attackAttempts}
          </dd>
        </div>
        <div className="rounded-xl bg-gray-700 p-3">
          <dt className="text-gray-400">Aces</dt>
          <dd className="mt-1 text-lg font-semibold text-white">{stats.aces}</dd>
        </div>
        <div className="rounded-xl bg-gray-700 p-3">
          <dt className="text-gray-400">Digs</dt>
          <dd className="mt-1 text-lg font-semibold text-white">{stats.digs}</dd>
        </div>
        <div className="rounded-xl bg-gray-700 p-3">
          <dt className="text-gray-400">Blocks</dt>
          <dd className="mt-1 text-lg font-semibold text-white">{blocks}</dd>
        </div>
        <div className="rounded-xl bg-gray-700 p-3">
          <dt className="text-gray-400">Sets played</dt>
          <dd className="mt-1 text-lg font-semibold text-white">{stats.setsPlayed}</dd>
        </div>
      </dl>
    </article>
  )
}
