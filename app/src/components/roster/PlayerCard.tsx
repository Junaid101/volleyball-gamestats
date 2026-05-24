import type { Player } from '../../types'
import { POSITION_BADGE_CLASSES } from './constants'

export default function PlayerCard({
  player,
  onEdit,
  onDelete,
}: {
  player: Player
  onEdit: () => void
  onDelete: () => void
}) {
  const secondaryPositions = player.positions.filter((position) => position !== player.primaryPosition)

  return (
    <article className="min-h-[56px] rounded-2xl bg-gray-800 p-4 shadow-lg">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-white">{player.name}</h3>
          <span
            className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize text-white ${POSITION_BADGE_CLASSES[player.primaryPosition]}`}
          >
            {player.primaryPosition}
          </span>
          {secondaryPositions.length > 0 ? (
            <p className="mt-2 text-xs text-gray-400">Also plays: {secondaryPositions.join(', ')}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            aria-label={`Edit ${player.name}`}
            className="min-h-[56px] rounded-lg border border-gray-600 px-3 py-2 text-white transition hover:border-indigo-400"
            onClick={onEdit}
            type="button"
          >
            Edit
          </button>
          <button
            aria-label={`Delete ${player.name}`}
            className="min-h-[56px] rounded-lg bg-red-600 px-3 py-2 text-white transition hover:bg-red-700"
            onClick={onDelete}
            type="button"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  )
}
