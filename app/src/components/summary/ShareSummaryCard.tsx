import { Link } from 'react-router-dom'
import type { Match, MatchSet } from '../../types'
import { getMatchResult, getSetWinTotals } from '../../utils/matchUtils'
import { formatSummaryEfficiency, type TopPerformers } from '../../utils/summaryUtils'
import TopPerformerBadge from './TopPerformerBadge'

const summaryDateFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

export default function ShareSummaryCard({
  match,
  sets,
  performers,
  onShare,
  sharePending = false,
}: {
  match: Match
  sets: MatchSet[]
  performers: TopPerformers | null
  onShare: () => void | Promise<void>
  sharePending?: boolean
}) {
  const orderedSets = [...sets].sort((left, right) => left.setNumber - right.setNumber)
  const result = getMatchResult(orderedSets)
  const { ourSetsWon, opponentSetsWon } = getSetWinTotals(orderedSets)
  const badgeClass =
    result === 'win'
      ? 'bg-green-500 text-white'
      : result === 'loss'
        ? 'bg-red-500 text-white'
        : 'bg-gray-500 text-white'
  const badgeLabel = result === 'win' ? 'WIN' : result === 'loss' ? 'LOSS' : 'LIVE'

  return (
    <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 text-gray-900 shadow-2xl">
      <div className="space-y-6">
        <header className="space-y-3">
          <p className="text-sm text-gray-500">🏐 Volleyball GameStats</p>
          <div>
            <p className="text-2xl font-bold">{match.opponent}</p>
            <p className="text-sm text-gray-500">{summaryDateFormatter.format(new Date(match.date))}</p>
          </div>
          <div className="space-y-3 text-center">
            <div className="flex justify-center">
              <span className={`rounded-full px-3 py-1 text-sm font-bold ${badgeClass}`}>{badgeLabel}</span>
            </div>
            <p className="text-5xl font-black">{ourSetsWon} – {opponentSetsWon}</p>
          </div>
        </header>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-500">Set scores:</h2>
          <div className="space-y-1 text-sm text-gray-900">
            {orderedSets.map((set) => {
              const wonSet = set.ourScore > set.opponentScore

              return (
                <p className="text-sm text-gray-900" key={set.id}>
                  {`Set ${set.setNumber}: ${set.ourScore}–${set.opponentScore} `}
                  <span className={wonSet ? 'text-green-600' : 'text-red-500'}>{wonSet ? '✓' : '✗'}</span>
                </p>
              )
            })}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">⭐ Top Performers</h2>
          <div className="space-y-2">
            <TopPerformerBadge label="Most Kills" performer={performers?.mostKills ?? null} value={`${performers?.mostKills?.value ?? 0}`} />
            <TopPerformerBadge
              label="Best Eff"
              performer={performers?.bestEfficiency ?? null}
              value={performers?.bestEfficiency ? formatSummaryEfficiency(performers.bestEfficiency.value) : '—'}
            />
            <TopPerformerBadge label="Most Aces" performer={performers?.mostAces ?? null} value={`${performers?.mostAces?.value ?? 0}`} />
            <TopPerformerBadge label="Most Digs" performer={performers?.mostDigs ?? null} value={`${performers?.mostDigs?.value ?? 0}`} />
          </div>
        </section>

        <div className="flex flex-col gap-3">
          <button
            className="min-h-[48px] w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => {
              void onShare()
            }}
            type="button"
          >
            {sharePending ? 'Sharing...' : 'Share'}
          </button>
          <Link
            className="flex min-h-[48px] w-full items-center justify-center rounded-xl bg-gray-100 px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-200"
            to={`/history/${match.id}`}
          >
            View Full Stats
          </Link>
        </div>
      </div>
    </div>
  )
}
