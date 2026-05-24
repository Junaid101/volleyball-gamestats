import { useState } from 'react'
import type { MatchSet } from '../../types'

type Props = {
  set: MatchSet
  onSave: (updated: MatchSet) => Promise<void>
  onCancel: () => void
}

function ScoreStepper({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (next: number) => void
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-gray-400">{label}</span>
      <div className="flex items-center gap-2">
        <button
          aria-label={`Decrease ${label}`}
          className="min-h-[44px] min-w-[44px] rounded-lg bg-gray-700 text-lg font-bold text-white transition enabled:hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={value <= 0}
          onClick={() => onChange(value - 1)}
          type="button"
        >
          −
        </button>
        <span className="w-8 text-center text-lg font-bold text-white">{value}</span>
        <button
          aria-label={`Increase ${label}`}
          className="min-h-[44px] min-w-[44px] rounded-lg bg-gray-700 text-lg font-bold text-white transition hover:bg-gray-600"
          onClick={() => onChange(value + 1)}
          type="button"
        >
          +
        </button>
      </div>
    </div>
  )
}

export default function SetScoreEditor({ set, onSave, onCancel }: Props) {
  const [ourScore, setOurScore] = useState(set.ourScore)
  const [opponentScore, setOpponentScore] = useState(set.opponentScore)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const winner =
      ourScore > opponentScore ? 'team' : opponentScore > ourScore ? 'opponent' : set.winner
    await onSave({ ...set, ourScore, opponentScore, winner })
    setSaving(false)
  }

  return (
    <td className="py-3" colSpan={4}>
      <div className="flex flex-col gap-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Set {set.setNumber}
        </p>
        <div className="flex gap-6">
          <ScoreStepper label="Us" value={ourScore} onChange={setOurScore} />
          <ScoreStepper label="Them" value={opponentScore} onChange={setOpponentScore} />
        </div>
        <div className="flex gap-3">
          <button
            className="min-h-[44px] flex-1 rounded-lg bg-indigo-600 text-sm font-semibold text-white transition enabled:hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={saving}
            onClick={handleSave}
            type="button"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            className="min-h-[44px] flex-1 rounded-lg border border-gray-600 text-sm text-white transition hover:border-gray-500"
            disabled={saving}
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
        </div>
      </div>
    </td>
  )
}
