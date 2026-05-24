# Volleyball GameStats TDD work packages

These work packages are strictly ordered. Do not begin the next package until the current package is green and its acceptance criteria are satisfied. The plan aligns the schema model, the Phase 1 mobile-first UI, and the async `StorageService` contract.

## Delivery sequence rules

1. Follow classic TDD inside each package: write failing tests first, implement the minimum code to pass, then refactor.
2. Keep package scope closed: later packages may use earlier abstractions, but must not backfill unfinished work from earlier packages.
3. Prefer small vertical slices: test one user-visible behavior at a time, then expand.
4. Any routing, provider, or hook introduced in one package must remain stable for later packages.

## Shared architecture for all packages

**React context/provider needed:** `StorageContext` provides a single `StorageService` instance, created from `new LocalStorageService()` in production and injected test doubles in component tests.

**How components should access it:** expose a `useStorage()` hook that reads the context and throws a clear error if used outside `StorageProvider`. Higher-level hooks such as `useRoster()` and `useMatch()` should depend on `useStorage()`, not on `localStorage` directly.

**File structure:**
```text
app/src/
  components/
    roster/
    match/
    live/
    history/
    summary/
  screens/
    HomeScreen.tsx
    RosterScreen.tsx
    NewMatchScreen.tsx
    LiveScoringScreen.tsx
    HistoryScreen.tsx
    MatchDetailScreen.tsx
    PlayerStatsScreen.tsx
    MatchSummaryScreen.tsx
  context/
    StorageContext.tsx
  hooks/
    useStorage.ts
    useMatch.ts
    useRoster.ts
  storage/
    types.ts
    localStorage.ts
    localStorage.test.ts
  types/
    index.ts
  test/
    setup.ts
```

**Routing (React Router v6):**
- `/` → `HomeScreen`
- `/roster` → `RosterScreen`
- `/match/new` → `NewMatchScreen`
- `/match/:matchId/live` → `LiveScoringScreen`
- `/history` → `HistoryScreen`
- `/history/:matchId` → `MatchDetailScreen`
- `/history/:matchId/summary` → `MatchSummaryScreen`
- `/players` → `PlayerStatsScreen`

**Cross-package design rules:**
- First launch checks `storage.getTeam()` before rendering normal app routes; if no team exists, redirect to onboarding.
- Hitting efficiency is derived only on read; never persist it.
- Display hitting efficiency as `—` when `attackAttempts === 0`; otherwise format to three decimals like `.000`.
- Live scoring undo uses a typed action stack, e.g. `{ type: 'INCREMENT_STAT', playerId, statKey, setId, previousValue }` and `{ type: 'INCREMENT_SCORE', side, setId, previousScore }`.
- The live route is simplified to `/match/:matchId/live`; current set number and between-set transitions are handled inside `useMatch()` state even though the UI design doc sketches deeper live sub-routes.

## WP1: Storage Layer

**Goal:** Deliver a fully tested `LocalStorageService` that satisfies `StorageService` and enforces the schema rules for CRUD, aggregates, and cascade cleanup.
**React context/provider needed:** None required for the first red/green loop, but define the `StorageContext` contract now so later packages can consume the same `StorageService` shape.
**Files to create/modify:** `app/src/storage/localStorage.ts`, `app/src/storage/localStorage.test.ts`, `app/src/storage/types.ts`, `app/src/test/setup.ts`
**Tests to write first (RED phase):**
- test: saves and retrieves the single `Team` record from `vgs_team`
- test: saves, updates, lists, and deletes `Player` records from `vgs_players`
- test: saves, retrieves, and deletes `Match` records from `vgs_matches`
- test: saves and returns `MatchSet[]` sorted by `setNumber`
- test: saves and returns `PlayerSetStats` for one set and for all sets in a match
- test: deleting a player removes only that player and their related `PlayerSetStats`
- test: deleting a match removes the match, its sets, and all child stat rows
- test: `getPlayerSeasonStats` aggregates totals across all sets and returns hitting efficiency `(kills - attackErrors) / attackAttempts`
- test: `getPlayerSeasonStats` returns hitting efficiency `0` when `attackAttempts` is `0`
- test: `getMatchSummary` returns match, ordered sets, and all stats for those sets, and throws if the match does not exist
- test: all storage tests run against the mocked `localStorage` installed in `app/src/test/setup.ts`
**Implementation (GREEN phase):**
- Implement JSON read/write helpers for all fixed storage keys.
- Implement id-based upsert helpers for players, matches, sets, and player stats.
- Implement cascade delete rules for `deletePlayer` and `deleteMatch`.
- Implement read-time season aggregate calculation and match summary assembly.
- Export a production singleton `localStorageService` typed as `StorageService`.
**Acceptance criteria:**
- [ ] All tests pass
- [ ] `LocalStorageService` satisfies the async `StorageService` interface without UI-specific coupling
- [ ] Cascade delete leaves no orphaned sets or player stat rows
- [ ] Hitting efficiency is computed correctly and never persisted as stored data

## WP2: Team & Roster Management

**Goal:** Build roster management UI that reads and mutates player data only through injected storage services.
**React context/provider needed:** Create `StorageContext.tsx` and `useStorage.ts`; wrap the app in `StorageProvider` so roster components can call the injected `StorageService` without importing `localStorageService` directly.
**Files to create/modify:** `app/src/context/StorageContext.tsx`, `app/src/hooks/useStorage.ts`, `app/src/hooks/useRoster.ts`, `app/src/components/roster/PlayerCard.tsx`, `app/src/components/roster/AddPlayerForm.tsx`, `app/src/components/roster/EditPlayerForm.tsx`, `app/src/screens/RosterScreen.tsx`, roster component test files under `app/src/components/roster/` or `app/src/screens/`
**Tests to write first (RED phase):**
- test: `RosterScreen` renders an empty state when `getPlayers()` returns no players
- test: submitting `AddPlayerForm` calls `savePlayer` and the new player appears in the roster list
- test: editing a player updates the displayed name and position
- test: deleting a player removes the card from the list after storage deletion resolves
- test: each `PlayerCard` shows the correct position label/badge text
- test: components consume the storage instance from `StorageContext`, allowing tests to inject a fake `StorageService`
**Implementation (GREEN phase):**
- Build `StorageProvider` and `useStorage()` with a defensive missing-provider error.
- Build `useRoster()` to load players, expose add/edit/delete handlers, and refresh the list after writes.
- Implement `RosterScreen` with empty state, stacked `PlayerCard` list, and add/edit/delete flows.
- Implement `AddPlayerForm` and `EditPlayerForm` as reusable controlled forms.
- Render position badges using the existing `PlayerPosition` union values from `types/index.ts`.
**Acceptance criteria:**
- [ ] All tests pass
- [ ] Roster CRUD works end-to-end through `StorageService` injection
- [ ] Empty roster and populated roster states both render correctly
- [ ] Position text displayed in the UI always matches the stored `PlayerPosition` value

## WP3: Match Creation

**Goal:** Enable users to create a match, choose format, confirm participants, and enter live scoring with an initialized first set.
**React context/provider needed:** Reuse `StorageContext` and `useStorage()`; introduce `useRoster()` reuse in match setup so the player checklist comes from the same roster source.
**Files to create/modify:** `app/src/components/match/MatchSetupForm.tsx`, `app/src/screens/NewMatchScreen.tsx`, routing setup in the app shell/router, optional `app/src/hooks/useMatch.ts` scaffold, tests for `NewMatchScreen` and `MatchSetupForm`
**Tests to write first (RED phase):**
- test: `MatchSetupForm` renders opponent input and both format options (`best-of-3`, `best-of-5`)
- test: opponent name is required and prevents submit when blank
- test: rostered players are loaded from storage and displayed in the participation checklist
- test: submitting a valid form saves a `Match`, creates the initial `MatchSet`, and navigates to `/match/:matchId/live`
- test: selected players for the match are preserved in component state for live scoring startup
**Implementation (GREEN phase):**
- Build `MatchSetupForm` with opponent field, format segmented control, and player selection list.
- Default match format to `best-of-3` and allow switching to `best-of-5`.
- On submit, create a `Match` record and an initial `MatchSet` with `setNumber: 1`.
- Establish the route transition into `LiveScoringScreen` after successful creation.
- Decide how participating players are passed forward for Phase 1 (router state, match hook state, or match-scoped storage helper) and keep the API explicit.
**Acceptance criteria:**
- [ ] All tests pass
- [ ] Match setup blocks blank opponent names but does not block fewer-than-6 player selections
- [ ] Match creation writes both the parent match and first set before navigation
- [ ] Live scoring receives enough initial context to start set 1 without extra manual setup

## WP4: Live Scoring

**Goal:** Implement the match-time scoring workflow with fast per-player stat entry, score tracking, undo, and set/match completion.
**React context/provider needed:** Keep storage access in `useStorage()` and add `useMatch()` as the live orchestration hook for current set, selected player, scoreboard, stat updates, and undo stack state.
**Files to create/modify:** `app/src/hooks/useMatch.ts`, `app/src/components/live/SetScoreDisplay.tsx`, `app/src/components/live/PlayerStatPad.tsx`, `app/src/components/live/StatButton.tsx`, `app/src/components/live/UndoButton.tsx` or `UndoBar.tsx`, `app/src/screens/LiveScoringScreen.tsx`, related live component tests
**Tests to write first (RED phase):**
- test: tapping a stat button increments the correct stat field for the selected player
- test: kill and ace actions increment both the player stat and the team score
- test: opponent score can be incremented manually without mutating player stats
- test: undo reverses the latest stat increment and restores the previous score/state
- test: undo button is disabled when the action stack is empty
- test: ending a set persists the final `MatchSet` record with the correct score and winner
- test: after a non-final set, ending the set creates the next set and keeps the match open
- test: after the deciding set, ending the set updates the `Match` winner/setsPlayed and leaves no extra set open
- test: all eight tracked Phase 1 stat types can be incremented through the live entry path
**Implementation (GREEN phase):**
- Build typed live actions and an undo stack in `useMatch()`.
- Implement player selection, per-player current set totals, and stat pad actions.
- Wire scoring rules: team score increments on kill/ace, opponent score increments manually.
- Persist player set stats incrementally through `StorageService` so refreshes do not lose progress.
- Implement set completion logic that either creates the next set or finalizes the match.
- Keep the live screen layout mobile-first with large score controls, visible selected player state, and a persistent undo affordance.
**Acceptance criteria:**
- [ ] All tests pass
- [ ] Undo reliably restores the exact prior state for score and stats
- [ ] Set transitions save data before moving to the next phase of the match
- [ ] Final set completion saves the match result and prevents accidental continuation

## WP5: Match History & Player Stats

**Goal:** Provide read-only review screens for past matches and season-to-date player totals built from stored match data.
**React context/provider needed:** Reuse `StorageContext`/`useStorage()` and use selector-style hooks or screen-local loaders for history queries; no screen should read `localStorage` directly.
**Files to create/modify:** `app/src/components/history/MatchResultCard.tsx`, `app/src/screens/HistoryScreen.tsx`, `app/src/screens/MatchDetailScreen.tsx`, `app/src/screens/PlayerStatsScreen.tsx`, any table/card helpers for set scores and player stats, related component/screen tests
**Tests to write first (RED phase):**
- test: `HistoryScreen` shows an empty state when there are no stored matches
- test: matches are sorted by date descending and a newly created match appears in history
- test: opening match detail shows the correct set-by-set scores for the selected match
- test: match detail shows player stats totals and a hitting efficiency column
- test: hitting efficiency displays `—` when a player has zero attack attempts
- test: `PlayerStatsScreen` shows correct aggregated season totals across multiple matches
- test: season hitting efficiency is calculated correctly and shows `0` only in the underlying aggregate, while the UI renders `—` for zero attempts
**Implementation (GREEN phase):**
- Build `HistoryScreen` with reverse-chronological `MatchResultCard` rows and empty state CTA.
- Build `MatchDetailScreen` using `getMatchSummary()` plus derived player rollups for the full match.
- Build `PlayerStatsScreen` using `getPlayers()` and `getPlayerSeasonStats()` for each player.
- Add a shared hitting efficiency formatter for detail and season views.
- Keep detail UI mobile-first: stacked cards on small screens, table-like layout when space allows.
**Acceptance criteria:**
- [ ] All tests pass
- [ ] History always shows newest matches first
- [ ] Match detail exposes set scores and player stat totals accurately
- [ ] Player season stats aggregate across all stored matches without duplicating or dropping sets

## WP6: Match Summary & Share

**Goal:** Ship a screenshot-ready match summary screen with computed top performers and a robust share fallback.
**React context/provider needed:** Reuse `StorageContext`/`useStorage()`; the summary screen should load a match summary by route param and compute presentation data locally or through a pure helper.
**Files to create/modify:** `app/src/screens/MatchSummaryScreen.tsx`, `app/src/components/summary/ShareSummaryCard.tsx`, `app/src/components/summary/TopPerformerBadge.tsx`, share helper utilities/tests, router entry for `/history/:matchId/summary`
**Tests to write first (RED phase):**
- test: summary screen renders the final match result, set scores, and match metadata correctly
- test: top performer calculation identifies the player with most kills
- test: top performer calculation identifies the player with most aces
- test: top performer calculation identifies the player with best hitting efficiency and ignores players with zero attempts for the badge
- test: clicking Share uses the Web Share API when available
- test: when Web Share API is unavailable, Share copies a text summary to the clipboard
- test: clipboard fallback text includes opponent, final score, set scores, and top performers
**Implementation (GREEN phase):**
- Build a screenshot-first summary layout with large final score, set score list, and performer badges.
- Implement pure helpers that compute top performers from the match summary payload.
- Add a share handler that prefers `navigator.share()` and falls back to `navigator.clipboard.writeText()`.
- Generate a concise text summary suitable for chat sharing when clipboard fallback is used.
- Route to the summary screen from match detail and keep the layout readable for screenshots.
**Acceptance criteria:**
- [ ] All tests pass
- [ ] Summary output matches stored match data and computed performer rankings
- [ ] Share works in browsers with Web Share API and in browsers without it via clipboard fallback
- [ ] Screenshot-ready layout remains usable without requiring extra export infrastructure

## Important design decisions to carry through implementation

1. **Storage provider wiring:** `App` should wrap the router tree with `StorageProvider`, passing a `LocalStorageService` instance by default and allowing tests to inject an alternate `StorageService`.
2. **Undo model:** represent each reversible live event as a typed action with enough previous-state data to roll back deterministically; do not infer rollback from current UI state alone.
3. **Hitting efficiency presentation:** storage and aggregates return numeric efficiency, but UI formatters render `—` for zero attempts and `.000`-style decimals otherwise.
4. **First-launch behavior:** a team-existence gate runs before normal navigation; if `getTeam()` returns `null`, redirect to onboarding instead of rendering Home/Roster/Match routes.
5. **Route simplification choice:** use the requested `/match/:matchId/live` and `/history/:matchId/summary` routes for Phase 1 even though the design doc proposes deeper match/share paths.
6. **Participant scope choice:** selected match participants should be captured at match creation and made available to live scoring without relying on transient uncontrolled component state.

## Human review flags

- The UI design doc proposes `/match/live/:matchId/set/:setNumber` and `/match/:matchId/share`, but this work package plan follows the requested simplified routes. Confirm whether the product owner wants the simplified route contract or the more explicit screen-specific route structure.
Not simplified, use the origianl routes.

- The schema has no dedicated persisted table for match participants. Confirm whether Phase 1 should infer participants from recorded stats only, or add an explicit participation model later if lineup tracking becomes important.
If not, how would you add participant members on the UI? There could be 100 players in a club but onr 10 participate in that match. The club list could be used for autocomplete and selecting the list of players. Would that be an intermediate UI state? 

- The UI design doc includes onboarding and Home flows not listed as separate work packages. Confirm whether onboarding is a prerequisite implementation task outside this six-package sequence or should be folded into WP2/WP3 before routing is wired.
Onboarding is not required. Home woudl be good, but barebones for now.



