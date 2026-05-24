import type { MatchSet } from '../types'

const matchDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})

export function getMatchResult(sets: MatchSet[]): 'win' | 'loss' | 'in_progress' {
  const ourSetsWon = sets.filter((set) => set.ourScore > set.opponentScore && set.status === 'completed').length
  const oppSetsWon = sets.filter((set) => set.opponentScore > set.ourScore && set.status === 'completed').length

  if (ourSetsWon > oppSetsWon) {
    return 'win'
  }

  if (oppSetsWon > ourSetsWon) {
    return 'loss'
  }

  return 'in_progress'
}

export function getSetWinTotals(sets: MatchSet[]) {
  return sets.reduce(
    (totals, set) => {
      if (set.status !== 'completed') {
        return totals
      }

      if (set.ourScore > set.opponentScore) {
        totals.ourSetsWon += 1
      }

      if (set.opponentScore > set.ourScore) {
        totals.opponentSetsWon += 1
      }

      return totals
    },
    { ourSetsWon: 0, opponentSetsWon: 0 },
  )
}

export function formatMatchDate(date: string) {
  return matchDateFormatter.format(new Date(date))
}

export function summarizeSetScores(sets: MatchSet[]) {
  const summary = [...sets]
    .sort((left, right) => left.setNumber - right.setNumber)
    .map((set) => `${set.ourScore}-${set.opponentScore}`)
    .join(', ')

  return summary || 'No sets recorded'
}

export function formatHittingEfficiency(kills: number, attackErrors: number, attackAttempts: number) {
  if (attackAttempts === 0) {
    return '—'
  }

  return ((kills - attackErrors) / attackAttempts).toFixed(3).replace(/^(-?)0(?=\.)/, '$1')
}

export function getEfficiencyColorClass(hittingEfficiency: number, attackAttempts: number) {
  if (attackAttempts === 0 || hittingEfficiency === 0) {
    return 'text-gray-400'
  }

  if (hittingEfficiency > 0.3) {
    return 'text-green-400'
  }

  if (hittingEfficiency < 0) {
    return 'text-red-400'
  }

  return 'text-gray-400'
}
