import { vi } from 'vitest'
import type { Match, MatchSet, MatchSummary, PlayerSeasonStats } from '../types'
import type { StorageService } from '../storage/types'

const emptySeasonStats: PlayerSeasonStats = {
  playerId: '',
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
  hittingEfficiency: 0,
  matchesPlayed: 0,
  setsPlayed: 0,
}

const emptyMatchSummary: MatchSummary = {
  match: {} as Match,
  sets: [] as MatchSet[],
  playerStats: [],
}

export function createMockStorage(overrides: Partial<StorageService> = {}): StorageService {
  return {
    getTeam: vi.fn().mockResolvedValue(null),
    saveTeam: vi.fn().mockResolvedValue(undefined),
    getPlayers: vi.fn().mockResolvedValue([]),
    savePlayer: vi.fn().mockResolvedValue(undefined),
    deletePlayer: vi.fn().mockResolvedValue(undefined),
    getMatches: vi.fn().mockResolvedValue([]),
    getMatch: vi.fn().mockResolvedValue(null),
    saveMatch: vi.fn().mockResolvedValue(undefined),
    deleteMatch: vi.fn().mockResolvedValue(undefined),
    getSetsForMatch: vi.fn().mockResolvedValue([]),
    saveSet: vi.fn().mockResolvedValue(undefined),
    getStatsForSet: vi.fn().mockResolvedValue([]),
    getStatsForMatch: vi.fn().mockResolvedValue([]),
    savePlayerSetStats: vi.fn().mockResolvedValue(undefined),
    getPlayerSeasonStats: vi.fn().mockResolvedValue(emptySeasonStats),
    getMatchSummary: vi.fn().mockResolvedValue(emptyMatchSummary),
    ...overrides,
  }
}
