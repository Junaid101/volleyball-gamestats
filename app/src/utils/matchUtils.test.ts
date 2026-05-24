import type { MatchSet } from '../types'
import { getMatchResult } from './matchUtils'

const baseSet: Omit<MatchSet, 'id' | 'ourScore' | 'opponentScore' | 'status'> = {
  matchId: 'match-1',
  setNumber: 1,
}

describe('getMatchResult', () => {
  it("returns 'win' when we won more sets", () => {
    const sets: MatchSet[] = [
      { ...baseSet, id: 'set-1', ourScore: 25, opponentScore: 20, status: 'completed' },
      { ...baseSet, id: 'set-2', setNumber: 2, ourScore: 25, opponentScore: 19, status: 'completed' },
    ]

    expect(getMatchResult(sets)).toBe('win')
  })

  it("returns 'loss' when opponent won more sets", () => {
    const sets: MatchSet[] = [
      { ...baseSet, id: 'set-1', ourScore: 20, opponentScore: 25, status: 'completed' },
      { ...baseSet, id: 'set-2', setNumber: 2, ourScore: 18, opponentScore: 25, status: 'completed' },
    ]

    expect(getMatchResult(sets)).toBe('loss')
  })

  it("returns 'in_progress' when sets equal or incomplete", () => {
    const sets: MatchSet[] = [
      { ...baseSet, id: 'set-1', ourScore: 25, opponentScore: 22, status: 'completed' },
      { ...baseSet, id: 'set-2', setNumber: 2, ourScore: 20, opponentScore: 25, status: 'completed' },
      { ...baseSet, id: 'set-3', setNumber: 3, ourScore: 10, opponentScore: 8, status: 'in_progress' },
    ]

    expect(getMatchResult(sets)).toBe('in_progress')
  })
})
