# Volleyball GameStats data model

## TypeScript data model

### Team
- `id: string` — UUID-style identifier
- `name: string` — permanent team name for the single Phase 1 team
- `createdAt: string` — ISO timestamp
- `updatedAt: string` — ISO timestamp

### Player
- `id: string` — UUID-style identifier
- `teamId: string` — owning team identifier
- `name: string` — player name
- `position: 'outside' | 'opposite' | 'middle' | 'setter' | 'libero' | 'defensive'`
- `createdAt: string` — ISO timestamp
- `updatedAt: string` — ISO timestamp

### Match
- `id: string` — UUID-style identifier
- `teamId: string` — team that owns the match record
- `date: string` — ISO timestamp for the match date/time
- `opponentName: string` — opponent team name
- `location: string` — venue or gym name
- `format: 'best-of-3' | 'best-of-5'`
- `setsPlayed: number` — number of sets actually played
- `winner: 'team' | 'opponent'`
- `createdAt: string` — ISO timestamp
- `updatedAt: string` — ISO timestamp

### MatchSet
- `id: string` — UUID-style identifier
- `matchId: string` — parent match identifier
- `setNumber: number` — 1-based set sequence within the match
- `ourScore: number`
- `opponentScore: number`
- `winner: 'team' | 'opponent'`
- `createdAt: string` — ISO timestamp
- `updatedAt: string` — ISO timestamp

### PlayerSetStats
- `id: string` — UUID-style identifier
- `playerId: string` — player that the stat line belongs to
- `setId: string` — set that the stat line belongs to
- `kills: number`
- `attackErrors: number`
- `attackAttempts: number`
- `assists: number`
- `aces: number`
- `serviceErrors: number`
- `digs: number`
- `blocksSolo: number`
- `blocksAssisted: number`
- `receptionErrors: number`
- `createdAt: string` — ISO timestamp
- `updatedAt: string` — ISO timestamp

### MatchSummary (computed view)
- `match: Match`
- `sets: MatchSet[]`
- `playerStats: PlayerSetStats[]`

### PlayerSeasonStats (computed aggregate)
- `playerId: string`
- `matchesPlayed: number`
- `setsPlayed: number`
- aggregated totals for every tracked stat counter
- `hittingEfficiency: number` using `(kills - attackErrors) / attackAttempts`, returning `0` when `attackAttempts === 0`

## localStorage structure

Phase 1 stores JSON values under a small, fixed set of keys:

- `vgs_team` → `Team`
- `vgs_players` → `Player[]`
- `vgs_matches` → `Match[]`
- `vgs_sets` → `MatchSet[]`
- `vgs_player_stats` → `PlayerSetStats[]`

The `LocalStorageService` is the only layer that reads or writes these keys. All other app code should depend on the async `StorageService` interface.

## Phase 2 SQL schema (PostgreSQL)

```sql
CREATE TABLE teams (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE players (
    id UUID PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    position TEXT NOT NULL CHECK (
        position IN ('outside', 'opposite', 'middle', 'setter', 'libero', 'defensive')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE matches (
    id UUID PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    match_date TIMESTAMPTZ NOT NULL,
    opponent_name TEXT NOT NULL,
    location TEXT NOT NULL,
    format TEXT NOT NULL CHECK (format IN ('best-of-3', 'best-of-5')),
    sets_played SMALLINT NOT NULL CHECK (sets_played BETWEEN 1 AND 5),
    winner TEXT NOT NULL CHECK (winner IN ('team', 'opponent')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE match_sets (
    id UUID PRIMARY KEY,
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    set_number SMALLINT NOT NULL CHECK (set_number BETWEEN 1 AND 5),
    our_score SMALLINT NOT NULL CHECK (our_score >= 0),
    opponent_score SMALLINT NOT NULL CHECK (opponent_score >= 0),
    winner TEXT NOT NULL CHECK (winner IN ('team', 'opponent')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (match_id, set_number)
);

CREATE TABLE player_set_stats (
    id UUID PRIMARY KEY,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    set_id UUID NOT NULL REFERENCES match_sets(id) ON DELETE CASCADE,
    kills INTEGER NOT NULL DEFAULT 0 CHECK (kills >= 0),
    attack_errors INTEGER NOT NULL DEFAULT 0 CHECK (attack_errors >= 0),
    attack_attempts INTEGER NOT NULL DEFAULT 0 CHECK (attack_attempts >= 0),
    assists INTEGER NOT NULL DEFAULT 0 CHECK (assists >= 0),
    aces INTEGER NOT NULL DEFAULT 0 CHECK (aces >= 0),
    service_errors INTEGER NOT NULL DEFAULT 0 CHECK (service_errors >= 0),
    digs INTEGER NOT NULL DEFAULT 0 CHECK (digs >= 0),
    blocks_solo INTEGER NOT NULL DEFAULT 0 CHECK (blocks_solo >= 0),
    blocks_assisted INTEGER NOT NULL DEFAULT 0 CHECK (blocks_assisted >= 0),
    reception_errors INTEGER NOT NULL DEFAULT 0 CHECK (reception_errors >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (player_id, set_id)
);

CREATE INDEX idx_players_team_id ON players(team_id);
CREATE INDEX idx_matches_team_id_match_date ON matches(team_id, match_date DESC);
CREATE INDEX idx_match_sets_match_id_set_number ON match_sets(match_id, set_number);
CREATE INDEX idx_player_set_stats_player_id ON player_set_stats(player_id);
CREATE INDEX idx_player_set_stats_set_id ON player_set_stats(set_id);
```

## Design decisions

- **Normalized stats model:** `Match`, `MatchSet`, and `PlayerSetStats` are separate entities so per-set performance can be aggregated cleanly into match and season summaries.
- **Async storage contract:** every storage method returns a `Promise`, allowing a Phase 2 REST-backed implementation without changing React call sites.
- **UUID-style string IDs everywhere:** consistent with client-side ID generation now and API/database IDs later.
- **Cascade cleanup in Phase 1:** deleting a player removes their stat lines, and deleting a match removes its sets and stat rows to avoid orphaned records.
- **No derived values persisted:** hitting efficiency is computed on read, which keeps stored data canonical and avoids stale derived fields.
