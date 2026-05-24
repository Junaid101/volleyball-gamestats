import { useMemo, useState } from 'react'
import type { Player, PlayerPosition } from '../../types'
import { POSITION_OPTIONS } from './constants'

export type PlayerFormValues = Pick<Player, 'name' | 'positions' | 'primaryPosition'>

type PlayerFormProps = {
  title?: string
  submitLabel?: string
  initialValues?: Partial<PlayerFormValues>
  onSave: (player: PlayerFormValues) => void | Promise<void>
  onCancel: () => void
}

export function PlayerForm({
  title = 'Add Player',
  submitLabel = 'Save Player',
  initialValues,
  onSave,
  onCancel,
}: PlayerFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '')
  const [positions, setPositions] = useState<PlayerPosition[]>(initialValues?.positions ?? [])

  const isValid = useMemo(() => name.trim().length > 0 && positions.length > 0, [name, positions])

  const togglePosition = (option: PlayerPosition) => {
    setPositions((current) => {
      if (current.includes(option)) {
        return current.filter((value) => value !== option)
      }

      return [...current, option]
    })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!isValid || positions.length === 0) {
      return
    }

    await onSave({
      name: name.trim(),
      positions,
      primaryPosition: positions[0],
    })
  }

  return (
    <form className="rounded-2xl bg-gray-800 p-4 shadow-lg" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <p className="mt-1 text-sm text-gray-400">Add the player name and choose one or more positions.</p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white" htmlFor="player-name-input">
            Name
          </label>
          <input
            id="player-name-input"
            className="bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 w-full"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter player name"
          />
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-white">Positions</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {POSITION_OPTIONS.map((option) => {
              const selected = positions.includes(option)

              return (
                <label
                  key={option}
                  className={`min-h-[56px] cursor-pointer rounded-lg border px-3 py-3 text-center text-sm font-medium capitalize transition ${
                    selected
                      ? 'border-indigo-500 bg-indigo-600 text-white'
                      : 'border-gray-600 bg-gray-700 text-gray-200 hover:border-indigo-400'
                  }`}
                >
                  <input
                    checked={selected}
                    className="sr-only"
                    name="player-positions"
                    onChange={() => togglePosition(option)}
                    type="checkbox"
                    value={option}
                  />
                  <span>{option}</span>
                </label>
              )
            })}
          </div>
          {positions.length > 0 ? (
            <p className="mt-2 text-xs text-gray-400">Primary position: {positions[0]}</p>
          ) : null}
        </fieldset>

        <div className="flex gap-3">
          <button
            className="min-h-[56px] flex-1 rounded-lg border border-gray-600 px-4 py-3 text-white transition hover:border-gray-500"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="min-h-[56px] flex-1 rounded-lg bg-indigo-600 px-4 py-3 text-white transition enabled:hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!isValid}
            type="submit"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </form>
  )
}

export default function AddPlayerForm({
  onSave,
  onCancel,
}: {
  onSave: (player: PlayerFormValues) => void | Promise<void>
  onCancel: () => void
}) {
  return <PlayerForm onCancel={onCancel} onSave={onSave} />
}
