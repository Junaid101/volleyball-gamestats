type StatButtonProps = {
  label: string
  value: number
  onPress: () => void
  disabled?: boolean
}

export default function StatButton({ label, value, onPress, disabled = false }: StatButtonProps) {
  return (
    <button
      aria-label={`${label} ${value}`}
      className="flex min-h-[64px] w-full flex-col items-center justify-center rounded-xl bg-gray-700 px-3 py-3 text-center text-white transition active:bg-gray-600 disabled:cursor-not-allowed disabled:bg-gray-800 disabled:text-gray-500"
      disabled={disabled}
      onClick={onPress}
      type="button"
    >
      <span className="text-sm font-semibold">{label}</span>
      <span className="mt-1 text-xl font-bold">{value}</span>
    </button>
  )
}
