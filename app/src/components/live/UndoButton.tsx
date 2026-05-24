type UndoButtonProps = {
  onUndo: () => void
  disabled: boolean
}

export default function UndoButton({ onUndo, disabled }: UndoButtonProps) {
  return (
    <button
      className="mx-4 w-[calc(100%-2rem)] rounded-xl bg-amber-600 px-4 py-3 font-semibold text-white transition active:bg-amber-500 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-500"
      disabled={disabled}
      onClick={onUndo}
      type="button"
    >
      ↩ Undo
    </button>
  )
}
