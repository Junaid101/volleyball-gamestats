import { useState } from 'react'
import AddPlayerForm, { type PlayerFormValues } from '../components/roster/AddPlayerForm'
import EditPlayerForm from '../components/roster/EditPlayerForm'
import PlayerCard from '../components/roster/PlayerCard'
import { useRoster } from '../hooks/useRoster'
import type { Player } from '../types'

export default function RosterScreen() {
  const { players, addPlayer, updatePlayer, removePlayer, loading } = useRoster()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)

  const handleAddPlayer = async (player: PlayerFormValues) => {
    await addPlayer(player)
    setShowAddForm(false)
  }

  const handleUpdatePlayer = async (values: PlayerFormValues) => {
    if (!editingPlayer) {
      return
    }

    await updatePlayer({
      ...editingPlayer,
      ...values,
    })
    setEditingPlayer(null)
  }

  const handleDeletePlayer = async (id: string) => {
    await removePlayer(id)

    if (editingPlayer?.id === id) {
      setEditingPlayer(null)
    }
  }

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Team roster</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Roster</h1>
        </div>
        <button
          className="min-h-[56px] rounded-lg bg-indigo-600 px-4 py-3 text-white transition hover:bg-indigo-700"
          onClick={() => {
            setEditingPlayer(null)
            setShowAddForm(true)
          }}
          type="button"
        >
          Add Player
        </button>
      </header>

      {showAddForm ? <AddPlayerForm onCancel={() => setShowAddForm(false)} onSave={handleAddPlayer} /> : null}
      {editingPlayer ? (
        <EditPlayerForm
          onCancel={() => setEditingPlayer(null)}
          onSave={handleUpdatePlayer}
          player={editingPlayer}
        />
      ) : null}

      {loading ? <p className="text-gray-400">Loading roster...</p> : null}

      {!loading && players.length === 0 ? (
        <div className="rounded-2xl bg-gray-800 p-6 text-center shadow-lg">
          <p className="text-lg font-medium text-white">No players yet. Add your first player.</p>
        </div>
      ) : null}

      {players.length > 0 ? (
        <div className="max-h-[60vh] space-y-3 overflow-y-auto pb-2">
          {players.map((player) => (
            <PlayerCard
              key={player.id}
              onDelete={() => void handleDeletePlayer(player.id)}
              onEdit={() => {
                setShowAddForm(false)
                setEditingPlayer(player)
              }}
              player={player}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}
