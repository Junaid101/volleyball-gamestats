import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SetScoreEditor from '../components/history/SetScoreEditor'
import { useMatchDetail } from '../hooks/useMatchDetail'
import type { MatchSet, PlayerSetStatsSummary, StatTotals } from '../types'
import {
  formatHittingEfficiency,
  formatMatchDate,
  getEfficiencyColorClass,
  getMatchResult,
} from '../utils/matchUtils'
import { useStorage } from '../hooks/useStorage'

type PlayerMatchStatsRow = StatTotals & {
  playerId: string
  name: string
  hittingEfficiency: number
}

const emptyTotals = (): StatTotals => ({
  kills: 0,
  attackErrors: 0,
  attackAttempts: 0,
  assists: 0,
  aces: 0,
  serviceErrors: 0,
  digs: 0,
  blocksSolo: 0,
  blocksAssisted: 0,
  receptionErrors: 0,
})

function aggregatePlayerStats(stats: PlayerSetStatsSummary[], playersById: Map<string, string>) {
  const totalsByPlayer = stats.reduce<Map<string, PlayerMatchStatsRow>>((accumulator, statLine) => {
    const current =
      accumulator.get(statLine.playerId) ?? {
        playerId: statLine.playerId,
        name: playersById.get(statLine.playerId) ?? 'Unknown player',
        hittingEfficiency: 0,
        ...emptyTotals(),
      }

    current.kills += statLine.kills
    current.attackErrors += statLine.attackErrors
    current.attackAttempts += statLine.attackAttempts
    current.assists += statLine.assists
    current.aces += statLine.aces
    current.serviceErrors += statLine.serviceErrors
    current.digs += statLine.digs
    current.blocksSolo += statLine.blocksSolo
    current.blocksAssisted += statLine.blocksAssisted
    current.receptionErrors += statLine.receptionErrors
    current.hittingEfficiency =
      current.attackAttempts === 0 ? 0 : (current.kills - current.attackErrors) / current.attackAttempts

    accumulator.set(statLine.playerId, current)
    return accumulator
  }, new Map())

  return [...totalsByPlayer.values()].sort(
    (left, right) => right.kills - left.kills || left.name.localeCompare(right.name),
  )
}

export default function MatchDetailScreen() {
  const { matchId = '' } = useParams()
  const storage = useStorage()
  const { summary, players, loading, refresh } = useMatchDetail(matchId)
  const [editingSetId, setEditingSetId] = useState<string | null>(null)

  const playersById = useMemo(() => new Map(players.map((player) => [player.id, player.name])), [players])
  const playerRows = useMemo(
    () => (summary ? aggregatePlayerStats(summary.playerStats, playersById) : []),
    [playersById, summary],
  )

  if (loading) {
    return <div className="min-h-screen bg-gray-900 p-4 text-white">Loading match detail...</div>
  }

  if (!summary) {
    return <div className="min-h-screen bg-gray-900 p-4 text-white">Match detail unavailable.</div>
  }

  const result = getMatchResult(summary.sets)
  const badgeClass = result === 'win' ? 'bg-green-600 text-white' : result === 'loss' ? 'bg-red-600 text-white' : 'bg-gray-700 text-white'
  const badgeLabel = result === 'win' ? 'W' : result === 'loss' ? 'L' : 'IP'

  const handleSaveSet = async (updated: MatchSet) => {
    await storage.saveSet(updated)
    setEditingSetId(null)
    refresh()
  }

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-6 text-white">
      <div className="mx-auto max-w-screen-sm space-y-6">
        <header className="space-y-4 rounded-2xl bg-gray-800 p-5 shadow-lg">
          <div className="flex flex-wrap gap-3">
            <Link className="inline-flex min-h-[56px] items-center rounded-lg border border-gray-700 px-4 py-3 text-white transition hover:border-gray-500" to="/history">
              Back to History
            </Link>
            <Link
              className="inline-flex min-h-[56px] items-center rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-500"
              to={`/history/${summary.match.id}/summary`}
            >
              Share Summary
            </Link>
          </div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Match detail</p>
              <h1 className="mt-2 text-3xl font-bold">{summary.match.opponent}</h1>
              <p className="mt-2 text-sm text-gray-300">{formatMatchDate(summary.match.date)}</p>
            </div>
            <span className={`rounded px-2 py-0.5 text-xs font-semibold ${badgeClass}`}>{badgeLabel}</span>
          </div>
        </header>

        <section className="rounded-2xl bg-gray-800 p-5 shadow-lg">
          <h2 className="text-lg font-semibold text-white">Set scores</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-gray-400">
                  <th className="pb-3 pr-4">Set</th>
                  <th className="pb-3 pr-4">Us</th>
                  <th className="pb-3 pr-4">Them</th>
                  <th className="pb-3">Winner</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody>
                {summary.sets.map((set) => (
                  <tr className="border-t border-gray-700" data-testid="set-row" key={set.id}>
                    {editingSetId === set.id ? (
                      <SetScoreEditor
                        set={set}
                        onSave={handleSaveSet}
                        onCancel={() => setEditingSetId(null)}
                      />
                    ) : (
                      <>
                        <td className="py-3 pr-4">{set.setNumber}</td>
                        <td className="py-3 pr-4">{set.ourScore}</td>
                        <td className="py-3 pr-4">{set.opponentScore}</td>
                        <td className="py-3">{set.ourScore > set.opponentScore ? 'Us' : set.opponentScore > set.ourScore ? 'Them' : '—'}</td>
                        <td className="py-3 pl-4">
                          <button
                            aria-label={`Edit set ${set.setNumber}`}
                            className="rounded px-2 py-1 text-xs text-gray-400 transition hover:text-white"
                            onClick={() => setEditingSetId(set.id)}
                            type="button"
                          >
                            Edit
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl bg-gray-800 p-5 shadow-lg">
          <h2 className="text-lg font-semibold text-white">Player stats</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-gray-400">
                  <th className="pb-3 pr-4">Player</th>
                  <th className="pb-3 pr-4">K</th>
                  <th className="pb-3 pr-4">E</th>
                  <th className="pb-3 pr-4">Att</th>
                  <th className="pb-3 pr-4">Ef</th>
                  <th className="pb-3 pr-4">Ast</th>
                  <th className="pb-3 pr-4">Ace</th>
                  <th className="pb-3 pr-4">Dig</th>
                  <th className="pb-3 pr-4">Blk</th>
                  <th className="pb-3 pr-4">SvcE</th>
                  <th className="pb-3">RcvE</th>
                </tr>
              </thead>
              <tbody>
                {playerRows.map((row) => (
                  <tr className="border-t border-gray-700" data-testid="player-row" key={row.playerId}>
                    <td className="py-3 pr-4 font-medium text-white" data-testid="player-name">
                      {row.name}
                    </td>
                    <td className="py-3 pr-4">{row.kills}</td>
                    <td className="py-3 pr-4">{row.attackErrors}</td>
                    <td className="py-3 pr-4">{row.attackAttempts}</td>
                    <td className={`py-3 pr-4 font-bold ${getEfficiencyColorClass(row.hittingEfficiency, row.attackAttempts)}`}>
                      {formatHittingEfficiency(row.kills, row.attackErrors, row.attackAttempts)}
                    </td>
                    <td className="py-3 pr-4">{row.assists}</td>
                    <td className="py-3 pr-4">{row.aces}</td>
                    <td className="py-3 pr-4">{row.digs}</td>
                    <td className="py-3 pr-4">{row.blocksSolo + row.blocksAssisted}</td>
                    <td className="py-3 pr-4">{row.serviceErrors}</td>
                    <td className="py-3">{row.receptionErrors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
