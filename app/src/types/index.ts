export type PlayerPosition =
  | 'outside'
  | 'opposite'
  | 'middle'
  | 'setter'
  | 'libero'
  | 'defensive';

export type MatchFormat = 'best_of_3' | 'best_of_5';

export type MatchWinner = 'team' | 'opponent';
export type MatchStatus = 'in_progress' | 'completed';
export type MatchSetStatus = 'in_progress' | 'completed';

export interface Team {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Player {
  id: string;
  teamId: string;
  name: string;
  positions: PlayerPosition[];
  primaryPosition: PlayerPosition;
  createdAt: string;
  updatedAt: string;
}

export interface Match {
  id: string;
  teamId: string;
  date: string;
  opponent: string;
  format: MatchFormat;
  status: MatchStatus;
  sets: MatchSet[];
  participatingPlayerIds?: string[];
  winner?: MatchWinner;
  createdAt?: string;
  updatedAt?: string;
}

export interface MatchSet {
  id: string;
  matchId: string;
  setNumber: number;
  ourScore: number;
  opponentScore: number;
  status: MatchSetStatus;
  winner?: MatchWinner;
  createdAt?: string;
  updatedAt?: string;
}

export interface StatTotals {
  kills: number;
  attackErrors: number;
  attackAttempts: number;
  assists: number;
  aces: number;
  serviceErrors: number;
  digs: number;
  blocksSolo: number;
  blocksAssisted: number;
  receptionErrors: number;
}

export interface PlayerSetStats extends StatTotals {
  id: string;
  playerId: string;
  setId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlayerSetStatsSummary extends PlayerSetStats {
  hittingEfficiency: number;
}

export interface MatchSummary {
  match: Match;
  sets: MatchSet[];
  playerStats: PlayerSetStatsSummary[];
}

export interface PlayerSeasonStats extends StatTotals {
  playerId: string;
  matchesPlayed: number;
  setsPlayed: number;
  hittingEfficiency: number;
}
