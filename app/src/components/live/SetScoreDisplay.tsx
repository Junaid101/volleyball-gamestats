type SetScoreDisplayProps = {
  ourScore: number
  oppScore: number
  onOurScorePress: () => void
  onOppScorePress: () => void
}

function ScoreButton({
  label,
  score,
  onPress,
}: {
  label: string
  score: number
  onPress: () => void
}) {
  return (
    <button
      aria-label={`Increment ${label} score`}
      className="flex min-h-[80px] min-w-[120px] flex-col items-center justify-center rounded-xl bg-gray-800 px-6 py-4 text-white transition active:bg-gray-700"
      onClick={onPress}
      type="button"
    >
      <span className="text-sm font-semibold tracking-[0.3em] text-gray-400">{label}</span>
      <span className="text-6xl font-bold leading-none">{score}</span>
    </button>
  )
}

export default function SetScoreDisplay({
  ourScore,
  oppScore,
  onOurScorePress,
  onOppScorePress,
}: SetScoreDisplayProps) {
  return (
    <section className="flex items-center justify-center gap-3 px-4 py-4 text-center">
      <ScoreButton label="US" onPress={onOurScorePress} score={ourScore} />
      <span className="text-4xl font-bold text-gray-500">:</span>
      <ScoreButton label="THEM" onPress={onOppScorePress} score={oppScore} />
    </section>
  )
}
