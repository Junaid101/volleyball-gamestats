import type { Match, MatchSet } from '../../types'
import { formatMatchDate, getMatchResult, getSetWinTotals, summarizeSetScores } from '../../utils/matchUtils'

export default function MatchResultCard({
  match,
  sets,
  onClick,
}: {
  match: Match
  sets: MatchSet[]
  onClick: () => void
}) {
  const result = getMatchResult(sets)
  const { ourSetsWon, opponentSetsWon } = getSetWinTotals(sets)
  const borderClass =
    result === 'win' ? 'border-l-4 border-green-500' : result === 'loss' ? 'border-l-4 border-red-500' : 'border-l-4 border-gray-600'
  const badgeClass = result === 'win' ? 'bg-green-600 text-white' : result === 'loss' ? 'bg-red-600 text-white' : 'bg-gray-700 text-white'
  const badgeLabel = result === 'win' ? 'W' : result === 'loss' ? 'L' : 'IP'

  return (
    <button
      aria-label={`${match.opponent} match result`}
      className={`min-h-[72px] w-full rounded-xl bg-gray-800 p-4 text-left shadow-lg transition hover:bg-gray-700 ${borderClass}`}
      data-testid="match-result-card"
      onClick={onClick}
      type="button"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{match.opponent}</h3>
          <p className="mt-1 text-sm text-gray-400">{formatMatchDate(match.date)}</p>
        </div>
        <span className={`rounded px-2 py-0.5 text-xs font-semibold ${badgeClass}`}>{badgeLabel}</span>
      </div>

      <div className="mt-3 space-y-1 text-sm text-gray-300">
        <p>{summarizeSetScores(sets)}</p>
        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
          Sets won {ourSetsWon}-{opponentSetsWon}
        </p>
      </div>
    </button>
  )
}
