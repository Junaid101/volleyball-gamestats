import { PlayerForm, type PlayerFormValues } from './AddPlayerForm'
import type { Player } from '../../types'

type EditPlayerFormProps = {
  player: Player
  onSave: (player: PlayerFormValues) => void | Promise<void>
  onCancel: () => void
}

export default function EditPlayerForm({ player, onSave, onCancel }: EditPlayerFormProps) {
  return (
    <PlayerForm
      key={player.id}
      initialValues={{
        name: player.name,
        positions: player.positions,
        primaryPosition: player.primaryPosition,
      }}
      onCancel={onCancel}
      onSave={onSave}
      submitLabel="Save Changes"
      title="Edit Player"
    />
  )
}
