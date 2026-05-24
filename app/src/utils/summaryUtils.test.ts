import type { MatchSet, Player, PlayerSetStats } from '../types'
import { buildShareText, getTopPerformers } from './summaryUtils'

const players: Player[] = [
  {
    id: 'player-1',
    teamId: 'team-1',
    name: 'Alice',
    position: 'outside',
    createdAt: '2026-05-24T00:00:00.000Z',
    updatedAt: '2026-05-24T00:00:00.000Z',
  },
  {
    id: 'player-2',
    teamId: 'team-1',
    name: 'Bob',
    position: 'setter',
    createdAt: '2026-05-24T00:00:00.000Z',
    updatedAt: '2026-05-24T00:00:00.000Z',
  },
  {
    id: 'player-3',
    teamId: 'team-1',
    name: 'Carol',
    position: 'middle',
    createdAt: '2026-05-24T00:00:00.000Z',
    updatedAt: '2026-05-24T00:00:00.000Z',
  },
  {
    id: 'player-4',
    teamId: 'team-1',
    name: 'Dana',
    position: 'libero',
    createdAt: '2026-05-24T00:00:00.000Z',
    updatedAt: '2026-05-24T00:00:00.000Z',
  },
]

const sets: MatchSet[] = [
  {
    id: 'set-1',
    matchId: 'match-1',
    setNumber: 1,
    ourScore: 25,
    opponentScore: 20,
    status: 'completed',
  },
  {
    id: 'set-2',
    matchId: 'match-1',
    setNumber: 2,
    ourScore: 22,
    opponentScore: 25,
    status: 'completed',
  },
  {
    id: 'set-3',
    matchId: 'match-1',
    setNumber: 3,
    ourScore: 25,
    opponentScore: 18,
    status: 'completed',
  },
  {
    id: 'set-4',
    matchId: 'match-1',
    setNumber: 4,
    ourScore: 25,
    opponentScore: 21,
    status: 'completed',
  },
]

function createStats(overrides: Partial<PlayerSetStats>): PlayerSetStats {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    playerId: overrides.playerId ?? 'player-1',
    setId: overrides.setId ?? 'set-1',
    kills: overrides.kills ?? 0,
    attackErrors: overrides.attackErrors ?? 0,
    attackAttempts: overrides.attackAttempts ?? 0,
    assists: overrides.assists ?? 0,
    aces: overrides.aces ?? 0,
    serviceErrors: overrides.serviceErrors ?? 0,
    digs: overrides.digs ?? 0,
    blocksSolo: overrides.blocksSolo ?? 0,
    blocksAssisted: overrides.blocksAssisted ?? 0,
    receptionErrors: overrides.receptionErrors ?? 0,
    createdAt: overrides.createdAt ?? '2026-05-24T00:00:00.000Z',
    updatedAt: overrides.updatedAt ?? '2026-05-24T00:00:00.000Z',
  }
}

describe('getTopPerformers', () => {
  it('returns null for each category when no stats', () => {
    expect(getTopPerformers(players, [])).toEqual({
      mostKills: null,
      bestEfficiency: null,
      mostAces: null,
      mostDigs: null,
    })
  })

  it('finds player with most kills', () => {
    const stats = [
      createStats({ playerId: 'player-1', kills: 4 }),
      createStats({ playerId: 'player-2', kills: 7 }),
    ]

    expect(getTopPerformers(players, stats).mostKills).toEqual({
      player: players[1],
      value: 7,
    })
  })

  it('finds player with best efficiency and ignores players with 0 attempts', () => {
    const stats = [
      createStats({ playerId: 'player-1', kills: 5, attackErrors: 1, attackAttempts: 10 }),
      createStats({ playerId: 'player-2', kills: 3, attackErrors: 0, attackAttempts: 4 }),
      createStats({ playerId: 'player-3', kills: 9, attackErrors: 0, attackAttempts: 0 }),
    ]

    expect(getTopPerformers(players, stats).bestEfficiency).toEqual({
      player: players[1],
      value: 0.75,
    })
  })

  it('finds player with most aces', () => {
    const stats = [
      createStats({ playerId: 'player-1', aces: 1 }),
      createStats({ playerId: 'player-3', aces: 3 }),
    ]

    expect(getTopPerformers(players, stats).mostAces).toEqual({
      player: players[2],
      value: 3,
    })
  })

  it('finds player with most digs', () => {
    const stats = [
      createStats({ playerId: 'player-1', digs: 2 }),
      createStats({ playerId: 'player-4', digs: 8 }),
    ]

    expect(getTopPerformers(players, stats).mostDigs).toEqual({
      player: players[3],
      value: 8,
    })
  })

  it('returns null for efficiency if all players have 0 attempts', () => {
    const stats = [
      createStats({ playerId: 'player-1', attackAttempts: 0, kills: 5 }),
      createStats({ playerId: 'player-2', attackAttempts: 0, kills: 3 }),
    ]

    expect(getTopPerformers(players, stats).bestEfficiency).toBeNull()
  })

  it('aggregates stats across multiple sets for same player', () => {
    const stats = [
      createStats({ id: 'stats-1', playerId: 'player-1', setId: 'set-1', kills: 5, aces: 1 }),
      createStats({ id: 'stats-2', playerId: 'player-1', setId: 'set-2', kills: 7, aces: 2 }),
      createStats({ id: 'stats-3', playerId: 'player-2', setId: 'set-1', kills: 8, aces: 1 }),
    ]

    const performers = getTopPerformers(players, stats)

    expect(performers.mostKills).toEqual({
      player: players[0],
      value: 12,
    })
    expect(performers.mostAces).toEqual({
      player: players[0],
      value: 3,
    })
  })
})

describe('buildShareText', () => {
  const performers = {
    mostKills: { player: players[0], value: 12 },
    bestEfficiency: { player: players[1], value: 0.523 },
    mostAces: { player: players[2], value: 3 },
    mostDigs: { player: players[3], value: 8 },
  }

  it('formats win result correctly', () => {
    expect(buildShareText('Falcons', '2026-05-24T00:00:00.000Z', 'win', sets, performers)).toContain(
      'vs Falcons – WIN 3-1',
    )
  })

  it('formats loss result correctly', () => {
    expect(buildShareText('Falcons', '2026-05-24T00:00:00.000Z', 'loss', sets, performers)).toContain(
      'vs Falcons – LOSS 3-1',
    )
  })

  it('includes set scores', () => {
    expect(buildShareText('Falcons', '2026-05-24T00:00:00.000Z', 'win', sets, performers)).toContain(
      'Set scores: 25-20, 22-25, 25-18, 25-21',
    )
  })

  it('includes top performers', () => {
    expect(buildShareText('Falcons', '2026-05-24T00:00:00.000Z', 'win', sets, performers)).toContain(
      '⭐ Top: Alice 12K | Bob .523 Ef | Carol 3 Ace | Dana 8 Dig',
    )
  })

  it('handles null performers gracefully', () => {
    expect(
      buildShareText('Falcons', '2026-05-24T00:00:00.000Z', 'win', sets, {
        mostKills: null,
        bestEfficiency: null,
        mostAces: null,
        mostDigs: null,
      }),
    ).toContain('⭐ Top: No standout stats recorded')
  })
})
