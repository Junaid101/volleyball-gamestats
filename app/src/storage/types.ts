import type {
  Match,
  MatchSet,
  MatchSummary,
  Player,
  PlayerSeasonStats,
  PlayerSetStats,
  Team,
} from '../types';

export interface StorageService {
  getTeam(): Promise<Team | null>;
  saveTeam(team: Team): Promise<void>;

  getPlayers(): Promise<Player[]>;
  savePlayer(player: Player): Promise<void>;
  deletePlayer(id: string): Promise<void>;

  getMatches(): Promise<Match[]>;
  getMatch(id: string): Promise<Match | null>;
  saveMatch(match: Match): Promise<void>;
  deleteMatch(id: string): Promise<void>;

  getSetsForMatch(matchId: string): Promise<MatchSet[]>;
  saveSet(set: MatchSet): Promise<void>;

  getStatsForSet(setId: string): Promise<PlayerSetStats[]>;
  getStatsForMatch(matchId: string): Promise<PlayerSetStats[]>;
  savePlayerSetStats(stats: PlayerSetStats): Promise<void>;

  getPlayerSeasonStats(playerId: string): Promise<PlayerSeasonStats>;
  getMatchSummary(matchId: string): Promise<MatchSummary>;
}
