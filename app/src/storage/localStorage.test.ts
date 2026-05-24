import { describe, expect, it } from 'vitest'
import type { Match, MatchSet, Player, PlayerSetStats, Team } from '../types'
import { LocalStorageService } from './localStorage'

const timestamp = '2025-01-01T00:00:00.000Z'

function createTeam(overrides: Partial<Team> = {}): Team {
  return {
    id: 'team-1',
    name: 'Test Team',
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  }
}

function createPlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'player-1',
    teamId: 'team-1',
    name: 'Alice',
    position: 'setter',
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  }
}

function createMatch(overrides: Partial<Match> = {}): Match {
  return {
    id: 'match-1',
    teamId: 'team-1',
    date: '2025-09-01',
    opponent: 'Rivals',
    format: 'best_of_3',
    status: 'completed',
    sets: [],
    winner: 'team',
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  }
}

function createSet(overrides: Partial<MatchSet> = {}): MatchSet {
  return {
    id: 'set-1',
    matchId: 'match-1',
    setNumber: 1,
    ourScore: 25,
    opponentScore: 20,
    status: 'completed',
    winner: 'team',
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  }
}

function createStats(overrides: Partial<PlayerSetStats> = {}): PlayerSetStats {
  const playerId = overrides.playerId ?? 'player-1'
  const setId = overrides.setId ?? 'set-1'

  return {
    id: `${playerId}-${setId}`,
    playerId,
    setId,
    kills: 0,
    attackErrors: 0,
    attackAttempts: 0,
    assists: 0,
    aces: 0,
    serviceErrors: 0,
    digs: 0,
    blocksSolo: 0,
    blocksAssisted: 0,
    receptionErrors: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  }
}

describe('LocalStorageService', () => {
  describe('Team operations', () => {
    it('getTeam returns null when empty', async () => {
      const svc = new LocalStorageService()

      expect(await svc.getTeam()).toBeNull()
    })

    it('saveTeam persists and getTeam returns it', async () => {
      const svc = new LocalStorageService()
      const team = createTeam()

      await svc.saveTeam(team)

      expect(await svc.getTeam()).toEqual(team)
    })

    it('saveTeam overwrites previous team', async () => {
      const svc = new LocalStorageService()
      const originalTeam = createTeam()
      const updatedTeam = createTeam({ id: 'team-2', name: 'Updated Team' })

      await svc.saveTeam(originalTeam)
      await svc.saveTeam(updatedTeam)

      expect(await svc.getTeam()).toEqual(updatedTeam)
    })
  })

  describe('Player operations', () => {
    it('getPlayers returns [] when empty', async () => {
      const svc = new LocalStorageService()

      expect(await svc.getPlayers()).toEqual([])
    })

    it('savePlayer adds to list', async () => {
      const svc = new LocalStorageService()
      const player = createPlayer()

      await svc.savePlayer(player)

      expect(await svc.getPlayers()).toEqual([player])
    })

    it('savePlayer updates existing player (same id)', async () => {
      const svc = new LocalStorageService()
      const player = createPlayer()
      const updatedPlayer = createPlayer({ name: 'Updated Alice', position: 'outside' })

      await svc.savePlayer(player)
      await svc.savePlayer(updatedPlayer)

      expect(await svc.getPlayers()).toEqual([updatedPlayer])
    })

    it('deletePlayer removes by id', async () => {
      const svc = new LocalStorageService()
      const player = createPlayer()
      const otherPlayer = createPlayer({ id: 'player-2', name: 'Bob' })

      await svc.savePlayer(player)
      await svc.savePlayer(otherPlayer)
      await svc.deletePlayer(player.id)

      expect(await svc.getPlayers()).toEqual([otherPlayer])
    })

    it('deletePlayer also removes all PlayerSetStats for that player (cascade)', async () => {
      const svc = new LocalStorageService()
      const player = createPlayer()
      const otherPlayer = createPlayer({ id: 'player-2', name: 'Bob' })
      const set = createSet()
      const playerStats = createStats({ playerId: player.id, setId: set.id, kills: 3 })
      const otherPlayerStats = createStats({ playerId: otherPlayer.id, setId: set.id, kills: 5 })

      await svc.savePlayer(player)
      await svc.savePlayer(otherPlayer)
      await svc.saveSet(set)
      await svc.savePlayerSetStats(playerStats)
      await svc.savePlayerSetStats(otherPlayerStats)
      await svc.deletePlayer(player.id)

      expect(await svc.getStatsForSet(set.id)).toEqual([otherPlayerStats])
    })

    it('deletePlayer is a no-op for non-existent id', async () => {
      const svc = new LocalStorageService()
      const player = createPlayer()
      const set = createSet()
      const stats = createStats({ playerId: player.id, setId: set.id, kills: 4 })

      await svc.savePlayer(player)
      await svc.saveSet(set)
      await svc.savePlayerSetStats(stats)
      await svc.deletePlayer('missing-player')

      expect(await svc.getPlayers()).toEqual([player])
      expect(await svc.getStatsForSet(set.id)).toEqual([stats])
    })
  })

  describe('Match operations', () => {
    it('getMatches returns [] when empty', async () => {
      const svc = new LocalStorageService()

      expect(await svc.getMatches()).toEqual([])
    })

    it('saveMatch adds to list', async () => {
      const svc = new LocalStorageService()
      const match = createMatch()

      await svc.saveMatch(match)

      expect(await svc.getMatches()).toEqual([match])
    })

    it('saveMatch updates existing match (same id)', async () => {
      const svc = new LocalStorageService()
      const match = createMatch()
      const updatedMatch = createMatch({ opponent: 'Updated Rivals' })

      await svc.saveMatch(match)
      await svc.saveMatch(updatedMatch)

      expect(await svc.getMatches()).toEqual([updatedMatch])
    })

    it('getMatch returns match by id', async () => {
      const svc = new LocalStorageService()
      const match = createMatch()

      await svc.saveMatch(match)

      expect(await svc.getMatch(match.id)).toEqual(match)
    })

    it('getMatch returns null for unknown id', async () => {
      const svc = new LocalStorageService()

      expect(await svc.getMatch('missing-match')).toBeNull()
    })

    it('deleteMatch removes match by id', async () => {
      const svc = new LocalStorageService()
      const match = createMatch()
      const otherMatch = createMatch({ id: 'match-2', opponent: 'Other Team' })

      await svc.saveMatch(match)
      await svc.saveMatch(otherMatch)
      await svc.deleteMatch(match.id)

      expect(await svc.getMatches()).toEqual([otherMatch])
    })

    it('deleteMatch cascades: also deletes all MatchSets for that match', async () => {
      const svc = new LocalStorageService()
      const match = createMatch()
      const otherMatch = createMatch({ id: 'match-2' })
      const firstSet = createSet({ id: 'set-1', matchId: match.id, setNumber: 1 })
      const secondSet = createSet({ id: 'set-2', matchId: match.id, setNumber: 2 })
      const otherMatchSet = createSet({ id: 'set-3', matchId: otherMatch.id, setNumber: 1 })

      await svc.saveMatch(match)
      await svc.saveMatch(otherMatch)
      await svc.saveSet(firstSet)
      await svc.saveSet(secondSet)
      await svc.saveSet(otherMatchSet)
      await svc.deleteMatch(match.id)

      expect(await svc.getSetsForMatch(match.id)).toEqual([])
      expect(await svc.getSetsForMatch(otherMatch.id)).toEqual([otherMatchSet])
    })

    it('deleteMatch cascades: also deletes all PlayerSetStats for sets of that match', async () => {
      const svc = new LocalStorageService()
      const match = createMatch()
      const otherMatch = createMatch({ id: 'match-2' })
      const firstSet = createSet({ id: 'set-1', matchId: match.id, setNumber: 1 })
      const otherMatchSet = createSet({ id: 'set-2', matchId: otherMatch.id, setNumber: 1 })
      const deletedStats = createStats({ playerId: 'player-1', setId: firstSet.id, kills: 3 })
      const remainingStats = createStats({ playerId: 'player-2', setId: otherMatchSet.id, kills: 6 })

      await svc.saveMatch(match)
      await svc.saveMatch(otherMatch)
      await svc.saveSet(firstSet)
      await svc.saveSet(otherMatchSet)
      await svc.savePlayerSetStats(deletedStats)
      await svc.savePlayerSetStats(remainingStats)
      await svc.deleteMatch(match.id)

      expect(await svc.getStatsForSet(firstSet.id)).toEqual([])
      expect(await svc.getStatsForSet(otherMatchSet.id)).toEqual([remainingStats])
    })
  })

  describe('MatchSet operations', () => {
    it('getSetsForMatch returns [] when none', async () => {
      const svc = new LocalStorageService()

      expect(await svc.getSetsForMatch('match-1')).toEqual([])
    })

    it('saveSet adds a set', async () => {
      const svc = new LocalStorageService()
      const set = createSet()

      await svc.saveSet(set)

      expect(await svc.getSetsForMatch(set.matchId)).toEqual([set])
    })

    it('saveSet updates existing set (same id)', async () => {
      const svc = new LocalStorageService()
      const set = createSet()
      const updatedSet = createSet({ ourScore: 27, opponentScore: 25 })

      await svc.saveSet(set)
      await svc.saveSet(updatedSet)

      expect(await svc.getSetsForMatch(set.matchId)).toEqual([updatedSet])
    })

    it('getSetsForMatch filters correctly by matchId', async () => {
      const svc = new LocalStorageService()
      const firstSet = createSet({ id: 'set-1', matchId: 'match-1', setNumber: 2 })
      const secondSet = createSet({ id: 'set-2', matchId: 'match-1', setNumber: 1 })
      const otherSet = createSet({ id: 'set-3', matchId: 'match-2', setNumber: 1 })

      await svc.saveSet(firstSet)
      await svc.saveSet(secondSet)
      await svc.saveSet(otherSet)

      expect(await svc.getSetsForMatch('match-1')).toEqual([secondSet, firstSet])
    })
  })

  describe('PlayerSetStats operations', () => {
    it('getStatsForSet returns [] when none', async () => {
      const svc = new LocalStorageService()

      expect(await svc.getStatsForSet('set-1')).toEqual([])
    })

    it('savePlayerSetStats adds stats', async () => {
      const svc = new LocalStorageService()
      const stats = createStats({ kills: 8 })

      await svc.savePlayerSetStats(stats)

      expect(await svc.getStatsForSet(stats.setId)).toEqual([stats])
    })

    it('savePlayerSetStats updates existing (same playerId + setId)', async () => {
      const svc = new LocalStorageService()
      const originalStats = createStats({ id: 'stats-1', playerId: 'player-1', setId: 'set-1', kills: 2 })
      const updatedStats = createStats({ id: 'stats-2', playerId: 'player-1', setId: 'set-1', kills: 7, attackAttempts: 10 })

      await svc.savePlayerSetStats(originalStats)
      await svc.savePlayerSetStats(updatedStats)

      expect(await svc.getStatsForSet('set-1')).toEqual([updatedStats])
    })

    it('getStatsForSet filters by setId', async () => {
      const svc = new LocalStorageService()
      const stats = createStats({ playerId: 'player-1', setId: 'set-1', kills: 4 })
      const otherStats = createStats({ playerId: 'player-2', setId: 'set-2', kills: 5 })

      await svc.savePlayerSetStats(stats)
      await svc.savePlayerSetStats(otherStats)

      expect(await svc.getStatsForSet('set-1')).toEqual([stats])
    })

    it('getStatsForMatch returns all stats for all sets of a match', async () => {
      const svc = new LocalStorageService()
      const match = createMatch({ id: 'match-1' })
      const otherMatch = createMatch({ id: 'match-2' })
      const firstSet = createSet({ id: 'set-1', matchId: match.id, setNumber: 1 })
      const secondSet = createSet({ id: 'set-2', matchId: match.id, setNumber: 2 })
      const otherMatchSet = createSet({ id: 'set-3', matchId: otherMatch.id, setNumber: 1 })
      const firstStats = createStats({ playerId: 'player-1', setId: firstSet.id, kills: 1 })
      const secondStats = createStats({ playerId: 'player-2', setId: secondSet.id, kills: 2 })
      const otherStats = createStats({ playerId: 'player-3', setId: otherMatchSet.id, kills: 3 })

      await svc.saveMatch(match)
      await svc.saveMatch(otherMatch)
      await svc.saveSet(firstSet)
      await svc.saveSet(secondSet)
      await svc.saveSet(otherMatchSet)
      await svc.savePlayerSetStats(firstStats)
      await svc.savePlayerSetStats(secondStats)
      await svc.savePlayerSetStats(otherStats)

      expect(await svc.getStatsForMatch(match.id)).toEqual([firstStats, secondStats])
    })
  })

  describe('Computed operations', () => {
    it('getPlayerSeasonStats returns zeros for player with no matches', async () => {
      const svc = new LocalStorageService()

      expect(await svc.getPlayerSeasonStats('missing-player')).toEqual({
        playerId: 'missing-player',
        matchesPlayed: 0,
        setsPlayed: 0,
        hittingEfficiency: 0,
        kills: 0,
        attackErrors: 0,
        attackAttempts: 0,
        assists: 0,
        aces: 0,
        serviceErrors: 0,
        digs: 0,
        blocksSolo: 0,
        blocksAssisted: 0,
        receptionErrors: 0,
      })
    })

    it('getPlayerSeasonStats aggregates kills across multiple sets correctly', async () => {
      const svc = new LocalStorageService()
      const firstSet = createSet({ id: 'set-1', matchId: 'match-1', setNumber: 1 })
      const secondSet = createSet({ id: 'set-2', matchId: 'match-1', setNumber: 2 })

      await svc.saveSet(firstSet)
      await svc.saveSet(secondSet)
      await svc.savePlayerSetStats(createStats({ playerId: 'player-1', setId: firstSet.id, kills: 4 }))
      await svc.savePlayerSetStats(createStats({ playerId: 'player-1', setId: secondSet.id, kills: 7 }))

      expect((await svc.getPlayerSeasonStats('player-1')).kills).toBe(11)
    })

    it('getPlayerSeasonStats aggregates all stat types', async () => {
      const svc = new LocalStorageService()
      const matchOne = createMatch({ id: 'match-1' })
      const matchTwo = createMatch({ id: 'match-2' })
      const firstSet = createSet({ id: 'set-1', matchId: matchOne.id, setNumber: 1 })
      const secondSet = createSet({ id: 'set-2', matchId: matchTwo.id, setNumber: 1 })

      await svc.saveMatch(matchOne)
      await svc.saveMatch(matchTwo)
      await svc.saveSet(firstSet)
      await svc.saveSet(secondSet)
      await svc.savePlayerSetStats(
        createStats({
          playerId: 'player-1',
          setId: firstSet.id,
          kills: 3,
          attackErrors: 1,
          attackAttempts: 8,
          assists: 4,
          aces: 1,
          serviceErrors: 2,
          digs: 5,
          blocksSolo: 1,
          blocksAssisted: 2,
          receptionErrors: 1,
        }),
      )
      await svc.savePlayerSetStats(
        createStats({
          playerId: 'player-1',
          setId: secondSet.id,
          kills: 6,
          attackErrors: 2,
          attackAttempts: 12,
          assists: 7,
          aces: 3,
          serviceErrors: 1,
          digs: 4,
          blocksSolo: 2,
          blocksAssisted: 1,
          receptionErrors: 0,
        }),
      )

      expect(await svc.getPlayerSeasonStats('player-1')).toEqual({
        playerId: 'player-1',
        matchesPlayed: 2,
        setsPlayed: 2,
        hittingEfficiency: 0.3,
        kills: 9,
        attackErrors: 3,
        attackAttempts: 20,
        assists: 11,
        aces: 4,
        serviceErrors: 3,
        digs: 9,
        blocksSolo: 3,
        blocksAssisted: 3,
        receptionErrors: 1,
      })
    })

    it('getPlayerSeasonStats hitting efficiency: 0 when attempts=0', async () => {
      const svc = new LocalStorageService()
      const set = createSet()

      await svc.saveSet(set)
      await svc.savePlayerSetStats(
        createStats({ playerId: 'player-1', setId: set.id, kills: 4, attackErrors: 2, attackAttempts: 0 }),
      )

      expect((await svc.getPlayerSeasonStats('player-1')).hittingEfficiency).toBe(0)
    })

    it('getPlayerSeasonStats hitting efficiency: (kills - errors) / attempts', async () => {
      const svc = new LocalStorageService()
      const set = createSet()

      await svc.saveSet(set)
      await svc.savePlayerSetStats(
        createStats({ playerId: 'player-1', setId: set.id, kills: 9, attackErrors: 3, attackAttempts: 15 }),
      )

      expect((await svc.getPlayerSeasonStats('player-1')).hittingEfficiency).toBe(0.4)
    })

    it('getMatchSummary returns match with sets and player stats', async () => {
      const svc = new LocalStorageService()
      const match = createMatch()
      const secondSet = createSet({ id: 'set-2', matchId: match.id, setNumber: 2 })
      const firstSet = createSet({ id: 'set-1', matchId: match.id, setNumber: 1 })
      const firstStats = createStats({ playerId: 'player-1', setId: firstSet.id, kills: 3 })
      const secondStats = createStats({ playerId: 'player-2', setId: secondSet.id, kills: 5 })

      await svc.saveMatch(match)
      await svc.saveSet(secondSet)
      await svc.saveSet(firstSet)
      await svc.savePlayerSetStats(firstStats)
      await svc.savePlayerSetStats(secondStats)

      expect(await svc.getMatchSummary(match.id)).toEqual({
        match,
        sets: [firstSet, secondSet],
        playerStats: [
          { ...firstStats, hittingEfficiency: 0 },
          { ...secondStats, hittingEfficiency: 0 },
        ],
      })
    })

    it('getMatchSummary includes hitting efficiency per player per set', async () => {
      const svc = new LocalStorageService()
      const match = createMatch()
      const set = createSet({ id: 'set-1', matchId: match.id, setNumber: 1 })
      const stats = createStats({
        playerId: 'player-1',
        setId: set.id,
        kills: 7,
        attackErrors: 2,
        attackAttempts: 10,
      })

      await svc.saveMatch(match)
      await svc.saveSet(set)
      await svc.savePlayerSetStats(stats)

      const summary = await svc.getMatchSummary(match.id)

      expect(summary.playerStats).toEqual([
        expect.objectContaining({
          playerId: 'player-1',
          setId: set.id,
          hittingEfficiency: 0.5,
        }),
      ])
    })
  })
})
