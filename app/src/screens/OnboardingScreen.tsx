import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { useStorage } from '../hooks/useStorage'

const createId = () => globalThis.crypto?.randomUUID?.() ?? uuidv4()

export default function OnboardingScreen() {
  const storage = useStorage()
  const navigate = useNavigate()
  const [teamName, setTeamName] = useState('')
  const isDisabled = teamName.trim().length === 0

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isDisabled) {
      return
    }

    const timestamp = new Date().toISOString()
    await storage.saveTeam({
      id: createId(),
      name: teamName.trim(),
      createdAt: timestamp,
      updatedAt: timestamp,
    })

    navigate('/roster', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-10 text-white">
      <div className="mx-auto max-w-screen-sm">
        <div className="rounded-3xl bg-gray-800 p-6 shadow-xl">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Volleyball GameStats</p>
          <h1 className="mt-3 text-3xl font-bold">Create your team</h1>
          <p className="mt-3 text-sm text-gray-400">Set up your team name to start managing your roster.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-white" htmlFor="team-name">
                Team Name
              </label>
              <input
                autoFocus
                className="bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 w-full"
                id="team-name"
                onChange={(event) => setTeamName(event.target.value)}
                placeholder="Enter team name"
                value={teamName}
              />
            </div>
            <button
              className="min-h-[56px] w-full rounded-lg bg-indigo-600 px-4 py-3 text-white transition enabled:hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isDisabled}
              type="submit"
            >
              Get Started
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
