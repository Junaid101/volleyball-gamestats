import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PlayerSelector from '../components/live/PlayerSelector'
import SetScoreDisplay from '../components/live/SetScoreDisplay'
import StatButton from '../components/live/StatButton'
import UndoButton from '../components/live/UndoButton'
import { type StatKeys, useLiveMatch } from '../hooks/useLiveMatch'
import type { PlayerSetStats } from '../types'

type StatConfig = {
  key: keyof StatKeys
  label: string
}

const statButtons: StatConfig[] = [
  { key: 'kills', label: 'Kill +' },
  { key: 'aces', label: 'Ace +' },
  { key: 'digs', label: 'Dig +' },
  { key: 'blocksSolo', label: 'Block +' },
  { key: 'blocksAssisted', label: 'Blk Ast +' },
  { key: 'attackErrors', label: 'Err +' },
  { key: 'serviceErrors', label: 'Svc Err +' },
  { key: 'assists', label: 'Assist +' },
  { key: 'attackAttempts', label: 'Att +' },
  { key: 'receptionErrors', label: 'Rcv Err +' },
]

export default function LiveScoringScreen() {
  const { matchId = '' } = useParams()
  const navigate = useNavigate()
  const {
    match,
    currentSet,
    playerStats,
    players,
    incrementStat,
    incrementOurScore,
    incrementOppScore,
    undo,
    canUndo,
    endSet,
    loading,
  } = useLiveMatch(matchId)
  const [selectedPlayerId, setSelectedPlayerId] = useState('')

  useEffect(() => {
    if (players.length === 0) {
      setSelectedPlayerId('')
      return
    }

    if (!players.some((player) => player.id === selectedPlayerId)) {
      setSelectedPlayerId(players[0].id)
    }
  }, [players, selectedPlayerId])

  const selectedPlayer = useMemo(
    () => players.find((player) => player.id === selectedPlayerId) ?? players[0] ?? null,
    [players, selectedPlayerId],
  )
  const selectedStats = selectedPlayer ? playerStats[selectedPlayer.id] : null

  if (loading) {
    return <div className="min-h-screen bg-gray-900 p-4 text-white">Loading live match...</div>
  }

  if (!match || !currentSet) {
    return <div className="min-h-screen bg-gray-900 p-4 text-white">Live match unavailable.</div>
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="flex items-center justify-between bg-gray-800 px-4 py-3">
        <button className="rounded-lg px-2 py-2 text-sm font-semibold text-white" onClick={() => navigate(-1)} type="button">
          Back
        </button>
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{match.opponent}</p>
          <h1 className="text-xl font-bold">Set {currentSet.setNumber}</h1>
        </div>
        <button
          className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition active:bg-indigo-500"
          onClick={async () => {
            if (currentSet.ourScore === currentSet.opponentScore) {
              const confirmed = window.confirm('Scores are tied. End the set anyway?')

              if (!confirmed) {
                return
              }
            }

            await endSet()
          }}
          type="button"
        >
          End Set
        </button>
      </header>

      <SetScoreDisplay
        onOppScorePress={incrementOppScore}
        onOurScorePress={incrementOurScore}
        oppScore={currentSet.opponentScore}
        ourScore={currentSet.ourScore}
      />

      <div className="py-2">
        <UndoButton disabled={!canUndo} onUndo={() => void undo()} />
      </div>

      <PlayerSelector
        onChange={setSelectedPlayerId}
        players={players}
        selectedId={selectedPlayer?.id ?? ''}
      />

      <section className="grid grid-cols-3 gap-2 p-4">
        {statButtons.map((stat) => (
          <StatButton
            disabled={!selectedPlayer || !selectedStats}
            key={stat.key}
            label={stat.label}
            onPress={() => {
              if (!selectedPlayer) {
                return
              }

              void incrementStat(selectedPlayer.id, stat.key)
            }}
            value={selectedStats?.[stat.key] ?? 0}
          />
        ))}
      </section>

      {selectedPlayer && selectedStats ? (
        <p className="px-4 pb-2 text-sm text-gray-400">
          {selectedPlayer.name}: K:{selectedStats.kills} E:{selectedStats.attackErrors} A:{selectedStats.aces} Ef:
          {formatEfficiency(selectedStats)}
        </p>
      ) : null}
    </div>
  )
}

function formatEfficiency(stats: PlayerSetStats) {
  if (stats.attackAttempts === 0) {
    return '—'
  }

  const value = ((stats.kills - stats.attackErrors) / stats.attackAttempts).toFixed(3)
  return value.replace(/^0/, '')
}
