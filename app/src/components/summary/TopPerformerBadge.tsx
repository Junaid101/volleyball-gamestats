import type { Player } from '../../types'

type Performer = { player: Player; value: number } | null

export default function TopPerformerBadge({
  label,
  performer,
  value,
}: {
  label: string
  performer: Performer
  value: string
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="text-gray-500">{label}:</span>
      <span className="text-right font-medium text-gray-900">
        {performer ? (
          <>
            <span className="font-bold">{performer.player.name}</span> (
            <span>{value}</span>)
          </>
        ) : (
          '—'
        )}
      </span>
    </div>
  )
}
