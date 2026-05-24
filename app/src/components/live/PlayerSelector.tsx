import { useMemo, useState } from 'react'
import type { Player } from '../../types'

type PlayerSelectorProps = {
  players: Player[]
  selectedId: string
  onChange: (id: string) => void
}

function positionLabel(position: Player['position']) {
  return position.replace('_', ' ')
}

export default function PlayerSelector({ players, selectedId, onChange }: PlayerSelectorProps) {
  const [open, setOpen] = useState(false)
  const selectedPlayer = useMemo(
    () => players.find((player) => player.id === selectedId) ?? players[0] ?? null,
    [players, selectedId],
  )

  if (!selectedPlayer) {
    return null
  }

  return (
    <>
      <button
        className="flex min-h-[56px] w-full items-center justify-between border-y border-gray-800 bg-gray-900 px-4 py-3 text-left text-white transition active:bg-gray-800"
        onClick={() => setOpen(true)}
        type="button"
      >
        <span className="flex items-center gap-3">
          <span className="text-lg font-semibold">{selectedPlayer.name}</span>
          <span className="rounded-full bg-indigo-500/20 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-200">
            {positionLabel(selectedPlayer.position)}
          </span>
        </span>
        <span aria-hidden="true" className="text-gray-400">
          ▾
        </span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-20 flex items-end bg-black/60" onClick={() => setOpen(false)}>
          <div className="w-full rounded-t-3xl bg-gray-800 p-4" onClick={(event) => event.stopPropagation()}>
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-600" />
            <h2 className="mb-3 text-lg font-semibold text-white">Choose player</h2>
            <div className="space-y-2">
              {players.map((player) => (
                <button
                  className={`flex min-h-[56px] w-full items-center justify-between rounded-xl px-4 py-3 text-left transition ${
                    player.id === selectedPlayer.id ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-white active:bg-gray-600'
                  }`}
                  key={player.id}
                  onClick={() => {
                    onChange(player.id)
                    setOpen(false)
                  }}
                  type="button"
                >
                  <span className="font-medium">{player.name}</span>
                  <span className="rounded-full bg-black/20 px-2 py-1 text-xs uppercase tracking-wide">
                    {positionLabel(player.position)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
