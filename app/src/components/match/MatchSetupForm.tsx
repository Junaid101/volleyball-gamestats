import { useEffect, useMemo, useState } from 'react'
import type { MatchFormat, Player } from '../../types'

export type MatchSetupData = {
  opponent: string
  format: MatchFormat
  participatingPlayerIds: string[]
}

export default function MatchSetupForm({
  players,
  onSubmit,
}: {
  players: Player[]
  onSubmit: (data: MatchSetupData) => void | Promise<void>
}) {
  const [opponent, setOpponent] = useState('')
  const [format, setFormat] = useState<MatchFormat>('best_of_3')
  const [participatingPlayerIds, setParticipatingPlayerIds] = useState<string[]>(() =>
    players.map((player) => player.id),
  )
  const [playerError, setPlayerError] = useState<string | null>(null)
  const [opponentError, setOpponentError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setParticipatingPlayerIds(players.map((player) => player.id))
  }, [players])

  const orderedPlayers = useMemo(
    () =>
      [...players].sort((left, right) => {
        const leftSelected = participatingPlayerIds.includes(left.id)
        const rightSelected = participatingPlayerIds.includes(right.id)

        if (leftSelected === rightSelected) {
          return left.name.localeCompare(right.name)
        }

        return leftSelected ? -1 : 1
      }),
    [players, participatingPlayerIds],
  )

  const handleTogglePlayer = (playerId: string) => {
    setParticipatingPlayerIds((currentIds) => {
      const nextIds = currentIds.includes(playerId)
        ? currentIds.filter((id) => id !== playerId)
        : [...currentIds, playerId]

      if (nextIds.length > 0) {
        setPlayerError(null)
      }

      return nextIds
    })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedOpponent = opponent.trim()

    if (trimmedOpponent.length === 0) {
      setOpponentError('Opponent name is required.')
      return
    }

    setOpponentError(null)

    if (participatingPlayerIds.length === 0) {
      setPlayerError('Select at least one player.')
      return
    }

    setPlayerError(null)
    setSubmitting(true)

    try {
      await onSubmit({
        opponent: trimmedOpponent,
        format,
        participatingPlayerIds,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <section>
        <h2 className="mb-2 text-sm uppercase tracking-wide text-gray-400">Opponent name</h2>
        <label className="sr-only" htmlFor="opponent-name-input">
          Opponent name
        </label>
        <input
          id="opponent-name-input"
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder:text-gray-500"
          onChange={(event) => {
            setOpponent(event.target.value)
            if (event.target.value.trim().length > 0) {
              setOpponentError(null)
            }
          }}
          placeholder="Enter opponent name"
          value={opponent}
        />
        {opponentError ? <p className="mt-2 text-sm text-red-400">{opponentError}</p> : null}
      </section>

      <section>
        <h2 className="mb-2 text-sm uppercase tracking-wide text-gray-400">Match format</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Best of 3', value: 'best_of_3' },
            { label: 'Best of 5', value: 'best_of_5' },
          ].map((option) => {
            const selected = option.value === format

            return (
              <button
                key={option.value}
                className={`min-h-[56px] rounded-lg px-4 py-3 font-medium transition ${
                  selected ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'
                }`}
                onClick={() => setFormat(option.value as MatchFormat)}
                type="button"
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 className="text-sm uppercase tracking-wide text-gray-400">Who’s playing today?</h2>
          <span className="text-sm text-gray-400">{participatingPlayerIds.length} selected</span>
        </div>
        <div className="space-y-3">
          {orderedPlayers.map((player) => {
            const checked = participatingPlayerIds.includes(player.id)

            return (
              <label
                key={player.id}
                className="flex min-h-[56px] cursor-pointer items-center gap-3 rounded-lg bg-gray-800 p-3"
              >
                <input
                  aria-label={player.name}
                  checked={checked}
                  className="h-6 w-6"
                  onChange={() => handleTogglePlayer(player.id)}
                  type="checkbox"
                />
                <span className="flex-1 text-white">{player.name}</span>
                <span className="text-sm capitalize text-gray-400">{player.position}</span>
              </label>
            )
          })}
        </div>
        {playerError ? <p className="mt-2 text-sm text-red-400">{playerError}</p> : null}
      </section>

      <button
        className="w-full rounded-lg bg-indigo-600 px-4 py-4 font-semibold text-white transition enabled:hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={opponent.trim().length === 0 || submitting}
        type="submit"
      >
        {submitting ? 'Starting…' : 'Start Match'}
      </button>
    </form>
  )
}
