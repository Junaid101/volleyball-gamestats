import type {
  Match,
  MatchSet,
  MatchSummary,
  Player,
  PlayerPosition,
  PlayerSeasonStats,
  PlayerSetStats,
  PlayerSetStatsSummary,
  StatTotals,
  Team,
} from '../types';
import type { StorageService } from './types';

const STORAGE_KEYS = {
  team: 'vgs_team',
  players: 'vgs_players',
  matches: 'vgs_matches',
  sets: 'vgs_sets',
  playerStats: 'vgs_player_stats',
} as const;

type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

type StoredPlayer = Player & {
  position?: PlayerPosition;
};

const createEmptyTotals = (): StatTotals => ({
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
});

const calculateHittingEfficiency = (
  kills: number,
  attackErrors: number,
  attackAttempts: number,
): number => {
  if (attackAttempts === 0) {
    return 0;
  }

  return (kills - attackErrors) / attackAttempts;
};

const normalizePlayerPositions = (
  positions: PlayerPosition[] | undefined,
  fallbackPosition?: PlayerPosition,
): PlayerPosition[] => {
  const source = positions ?? (fallbackPosition ? [fallbackPosition] : []);
  const deduped = Array.from(new Set(source));

  if (deduped.length > 0) {
    return deduped;
  }

  return ['outside'];
};

export class LocalStorageService implements StorageService {
  private getStorage(): Storage {
    if (typeof globalThis.localStorage === 'undefined') {
      throw new Error('localStorage is not available in this environment.');
    }

    return globalThis.localStorage;
  }

  private readValue<T>(key: StorageKey, fallback: T): T {
    const rawValue = this.getStorage().getItem(key);

    if (rawValue === null) {
      return fallback;
    }

    try {
      return JSON.parse(rawValue) as T;
    } catch {
      return fallback;
    }
  }

  private writeValue<T>(key: StorageKey, value: T): void {
    this.getStorage().setItem(key, JSON.stringify(value));
  }

  private upsertById<T extends { id: string }>(items: T[], item: T): T[] {
    const existingIndex = items.findIndex((existingItem) => existingItem.id === item.id);

    if (existingIndex === -1) {
      return [...items, item];
    }

    const nextItems = [...items];
    nextItems[existingIndex] = item;

    return nextItems;
  }

  private upsertPlayerSetStats(items: PlayerSetStats[], item: PlayerSetStats): PlayerSetStats[] {
    const existingIndex = items.findIndex(
      (existingItem) =>
        existingItem.playerId === item.playerId && existingItem.setId === item.setId,
    );

    if (existingIndex === -1) {
      return [...items, item];
    }

    const nextItems = [...items];
    nextItems[existingIndex] = item;

    return nextItems;
  }

  private withHittingEfficiency(stats: PlayerSetStats): PlayerSetStatsSummary {
    return {
      ...stats,
      hittingEfficiency: calculateHittingEfficiency(
        stats.kills,
        stats.attackErrors,
        stats.attackAttempts,
      ),
    };
  }

  private normalizePlayer(player: StoredPlayer): Player {
    const positions = normalizePlayerPositions(player.positions, player.position);
    const primaryPosition = positions.includes(player.primaryPosition)
      ? player.primaryPosition
      : positions[0];

    return {
      ...player,
      positions,
      primaryPosition,
    };
  }

  private getAllSets(): MatchSet[] {
    return this.readValue<MatchSet[]>(STORAGE_KEYS.sets, []);
  }

  private getAllPlayerStats(): PlayerSetStats[] {
    return this.readValue<PlayerSetStats[]>(STORAGE_KEYS.playerStats, []);
  }

  async getTeam(): Promise<Team | null> {
    return this.readValue<Team | null>(STORAGE_KEYS.team, null);
  }

  async saveTeam(team: Team): Promise<void> {
    this.writeValue(STORAGE_KEYS.team, team);
  }

  async getPlayers(): Promise<Player[]> {
    const players = this.readValue<StoredPlayer[]>(STORAGE_KEYS.players, []);
    return players.map((player) => this.normalizePlayer(player));
  }

  async savePlayer(player: Player): Promise<void> {
    const players = await this.getPlayers();
    this.writeValue(STORAGE_KEYS.players, this.upsertById(players, this.normalizePlayer(player)));
  }

  async deletePlayer(id: string): Promise<void> {
    const players = await this.getPlayers();
    const playerStats = this.getAllPlayerStats();

    this.writeValue(
      STORAGE_KEYS.players,
      players.filter((player) => player.id !== id),
    );
    this.writeValue(
      STORAGE_KEYS.playerStats,
      playerStats.filter((stats) => stats.playerId !== id),
    );
  }

  async getMatches(): Promise<Match[]> {
    return this.readValue<Match[]>(STORAGE_KEYS.matches, []);
  }

  async getMatch(id: string): Promise<Match | null> {
    const matches = await this.getMatches();
    return matches.find((match) => match.id === id) ?? null;
  }

  async saveMatch(match: Match): Promise<void> {
    const matches = await this.getMatches();
    this.writeValue(STORAGE_KEYS.matches, this.upsertById(matches, match));
  }

  async deleteMatch(id: string): Promise<void> {
    const matches = await this.getMatches();
    const sets = this.getAllSets();
    const removedSetIds = new Set(
      sets.filter((set) => set.matchId === id).map((set) => set.id),
    );
    const playerStats = this.getAllPlayerStats();

    this.writeValue(
      STORAGE_KEYS.playerStats,
      playerStats.filter((stats) => !removedSetIds.has(stats.setId)),
    );
    this.writeValue(
      STORAGE_KEYS.sets,
      sets.filter((set) => set.matchId !== id),
    );
    this.writeValue(
      STORAGE_KEYS.matches,
      matches.filter((match) => match.id !== id),
    );
  }

  async getSetsForMatch(matchId: string): Promise<MatchSet[]> {
    return this.getAllSets()
      .filter((set) => set.matchId === matchId)
      .sort((left, right) => left.setNumber - right.setNumber);
  }

  async saveSet(set: MatchSet): Promise<void> {
    const sets = this.getAllSets();
    this.writeValue(STORAGE_KEYS.sets, this.upsertById(sets, set));
  }

  async getStatsForSet(setId: string): Promise<PlayerSetStats[]> {
    return this.getAllPlayerStats().filter((stats) => stats.setId === setId);
  }

  async getStatsForMatch(matchId: string): Promise<PlayerSetStats[]> {
    const setIds = new Set((await this.getSetsForMatch(matchId)).map((set) => set.id));

    return this.getAllPlayerStats().filter((stats) => setIds.has(stats.setId));
  }

  async savePlayerSetStats(stats: PlayerSetStats): Promise<void> {
    const playerStats = this.getAllPlayerStats();
    this.writeValue(STORAGE_KEYS.playerStats, this.upsertPlayerSetStats(playerStats, stats));
  }

  async getPlayerSeasonStats(playerId: string): Promise<PlayerSeasonStats> {
    const playerStats = this.getAllPlayerStats().filter((stats) => stats.playerId === playerId);
    const totals = playerStats.reduce<StatTotals>((seasonTotals, stats) => {
      seasonTotals.kills += stats.kills;
      seasonTotals.attackErrors += stats.attackErrors;
      seasonTotals.attackAttempts += stats.attackAttempts;
      seasonTotals.assists += stats.assists;
      seasonTotals.aces += stats.aces;
      seasonTotals.serviceErrors += stats.serviceErrors;
      seasonTotals.digs += stats.digs;
      seasonTotals.blocksSolo += stats.blocksSolo;
      seasonTotals.blocksAssisted += stats.blocksAssisted;
      seasonTotals.receptionErrors += stats.receptionErrors;
      return seasonTotals;
    }, createEmptyTotals());
    const playerSetIds = new Set(playerStats.map((stats) => stats.setId));
    const matchIds = new Set(
      this.getAllSets()
        .filter((set) => playerSetIds.has(set.id))
        .map((set) => set.matchId),
    );

    return {
      playerId,
      matchesPlayed: matchIds.size,
      setsPlayed: playerSetIds.size,
      hittingEfficiency: calculateHittingEfficiency(
        totals.kills,
        totals.attackErrors,
        totals.attackAttempts,
      ),
      ...totals,
    };
  }

  async getMatchSummary(matchId: string): Promise<MatchSummary> {
    const match = await this.getMatch(matchId);

    if (match === null) {
      throw new Error(`Match ${matchId} was not found.`);
    }

    const sets = await this.getSetsForMatch(matchId);
    const setIds = new Set(sets.map((set) => set.id));
    const playerStats = this.getAllPlayerStats()
      .filter((stats) => setIds.has(stats.setId))
      .map((stats) => this.withHittingEfficiency(stats));

    return {
      match,
      sets,
      playerStats,
    };
  }
}

export const localStorageService: StorageService = new LocalStorageService();
