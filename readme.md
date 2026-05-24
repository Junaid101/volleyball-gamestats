# Volleyball GameStats

A courtside tool for tracking volleyball match statistics — set scores, player performance, and season history — built for recreational and club-level teams.

---

## Target User

**Primary:** A player, team captain, or bench player in a recreational or semi-competitive club team. They want to track their team's performance across a season without using a complex platform. They will be running the app courtside, probably one-handed, during a live match.

**Secondary:** A coach who wants to review match results and individual player contributions after the game.

Not the target: professional teams (they use dedicated software), or pure casuals (they don't care about stats).

---

## Core Use Case

**Live scoring during a match.** Volleyball is fast — post-match stat entry from memory is unreliable, especially for stats like digs and blocks. The primary flow is: open the app before the match, tap stats as they happen, review the summary after the final set.

Post-match entry is supported as a fallback (e.g. for matches not tracked live), but it is not the primary UX.

---

## What Gets Tracked

### Match structure

Volleyball matches are best-of-3 or best-of-5 sets. Sets go to 25 points (win by 2), except the deciding set which goes to 15. Every set score is recorded.

### Player stats

The standard stats that matter to players and coaches:

| Stat | Who it applies to |
|---|---|
| Kills / attack errors / attempts | Hitters (outside, opposite, middle) |
| **Hitting efficiency** = (kills − errors) / attempts | Hitters |
| Assists | Setter |
| Aces / service errors | Everyone |
| Digs | Libero, defenders |
| Blocks (solo + assisted) | Hitters, middles |
| Reception errors | Passers |

**Hitting efficiency is first-class.** It is the single most meaningful attacking stat in volleyball and should always be displayed alongside raw kill counts.

### Explicitly out of scope (for now)

- Points per rally / rally-by-rally breakdown — too granular, too complex to enter live
- Opponent individual player stats — we track our team, not theirs
- Substitution details — sub counts may be noted but tracking which player went in/out is low priority
- Timeouts — low priority

---

## UX Principles

These follow directly from the live scoring use case:

- **Courtside-first:** large tap targets, minimal confirmation dialogs, operable one-handed with one eye on the game
- **Fast undo:** mistakes happen during live entry; undo must be immediate and obvious
- **Offline-first (Phase 2):** sports halls and recreational venues have poor connectivity; the app must work fully without a network connection
- **Lightweight sharing:** after the match, share a summary (screenshot or link) to the team group chat — no social feed needed

---

## Phases

### Phase 1 — Web Prototype (React PWA)

A React app with no backend, hosted on GitHub Pages. All data is stored in `localStorage`. Built as a PWA so it can be installed on a phone home screen — this makes it usable courtside and provides a real mobile test before committing to a native app.

**Stack:**
- React (UI)
- `localStorage` for persistence, accessed only through a storage abstraction layer
- PWA manifest + service worker for home screen install
- GitHub Pages for hosting

**Goals:**
- Validate the live scoring UX — does it actually work courtside?
- Prove out the data model (Match, Set, Team, Player, per-set stats)
- Build something you can take to a real match and test

**Scope:**
- Set up a team roster with player names and positions
- Start a match, record set scores and per-player stats live
- View match history and player stat summaries
- Basic shareable match summary (screenshot-ready layout)
- Indoor format only; no rule enforcement — record stats freely
- Single-user only — one device, one team

---

### Phase 2 — Cross-Platform Mobile App (Rebuild)

A production mobile app for Android and iOS, rebuilt from scratch using a mobile-first stack. Phase 1 code is not carried over — only the data model and UX learnings are.

**Goals:**
- Ship a polished, native-feeling mobile experience
- Support a team: one person records, everyone can view
- Offline-first with background sync

**Stack:**
- React Native or Flutter (to be decided after Phase 1)
- REST API backend
- Relational database (schema derived from the Phase 1 data model)

**Scope:**
- Everything from Phase 1, rebuilt for mobile
- Team accounts: email + password + 2FA login; join a team via a regeneratable team code
- One designated recorder per match; other team members can view in real time
- Offline-first; data syncs in the background when connection is restored
- Optimistic updates with server-side conflict resolution
- CSV export for coaches

---

## Architecture

### Phase 1

```
Browser (React PWA)
  └── UI Components
  └── Storage Service  ← abstraction layer; swappable in Phase 2
        └── localStorage
```

The storage service is the only place that touches `localStorage`. Everything else in the app calls the service. This makes the Phase 2 migration to an API-backed service a localised change.

### Phase 2

```
Mobile App (React Native or Flutter)
  └── UI Components
  └── Storage Service  ← same interface, now backed by API + local cache
        └── Local cache (offline-first)
        └── REST API  ←→  Backend
                           └── Database (relational)
```

**Auth:** Email + password + 2FA. Users join a team via a team code (regeneratable by the team owner). No OAuth.

---

## Phase 1 → Phase 2 Continuity

**Decision: Option B — Rebuild.**

Phase 1 is a throwaway prototype. The Phase 2 mobile app is built from scratch with a mobile-first stack. What carries over:

- The **data model** (`Match`, `Set`, `Team`, `Player`, `PlayerSetStats`) — defined before Phase 1 development starts and treated as a stable contract
- UX patterns validated in Phase 1 (which flows worked, what was awkward courtside)
- The **storage service interface** — Phase 2 implements the same interface against an API instead of `localStorage`

What does not carry over: React components, routing, styling, or any browser-specific code.

---

## Future Product Features

Ideas worth noting for after Phase 2 ships — not in scope now, but they inform design decisions:

- **Beach volleyball format** — 2-player teams, sets to 21, no libero/setter roles; a separate recording mode, not a configuration option
- **Season and tournament management** — group matches into a season or bracket; season standings, win/loss record, aggregate player stats over a season
- **Opponent scouting** — build a profile of recurring opponents across matches; track their tendencies over time
- **Rotation tracking** — know which serve rotation the team is in during a set; useful for post-match tactical review
- **Serve receive heatmap** — visualise which zones on the court are targeted and how reception performs by zone
- **Set-by-set momentum charts** — show point run data within a set to identify turning points
- **Match video linking** — attach a recording URL to a match and timestamp key events to the video
- **Coaching notes** — free-text notes per match or per set, visible only to the coach/captain
- **Push notifications** (Phase 2+) — notify teammates when a match starts or when they're on deck to serve
- **Wearable companion** — Apple Watch or equivalent for single-tap stat entry, removing the need to look at the phone
- **Public team pages** — opt-in shareable page showing a team's season stats; useful for club websites

---

## Open Product Questions

- **Indoor vs beach volleyball?** Beach is 2-player, no setter role, no libero, sets to 21, completely different stats profile. Should the app support both formats, or start indoor-only? *(Lean: indoor only for Phase 1)*
ANS: only Indoor
 
- **What ruleset / league?** FIVB standard is 6 subs per set; many recreational leagues use unlimited subs or custom rules. Does the app enforce rules, or just record stats? *(Lean: record-only, no rule enforcement)*
ANS: just record stats

- **Roster setup flow:** How does a user set up their team before their first match? Manual entry of player names and positions? Does position affect which stats are shown per player? *(This is the first UX flow to design)*
manually input player's name before the match

- **Opponent tracking:** At minimum, the opponent's team name is needed for match history. Do we ever track opponent stats? *(Lean: name only)*
ANS: NO need the opponents stats 

- **Attack attempts (for hitting efficiency):** Efficiency requires recording every attack attempt — kill, error, or "in play" (neither kill nor error). Is it realistic to track all three outcomes live during a fast match, or should we simplify to kills and errors only?
ANS: It is ideal to have in play stats too but difficult to track all plays.  simplify to kills and errors only would be sufficient 

- **Season / competition structure:** Do matches belong to a season or tournament, or are they standalone records? *(Lean: standalone for Phase 1, seasons in Phase 2)*
standalone record

- **Who is the stat keeper?** Is it always one designated person per match, or can anyone open the app and record? In Phase 2 with multi-user: can two people co-track the same match simultaneously?
someone outside the coat, can be team mate, friends.....etc

- **Libero rule handling:** The libero has special restrictions (no attacks above net, no serving in most rules, automatic substitution). Does the app need to model libero-specific behaviour, or just let any player record any stat?
no libero system require for now

- **Data loss risk in Phase 1:** If Phase 1 stores everything in browser local storage, clearing the browser wipes all match history. Is there a minimum export or backup mechanism needed, or is that acceptable for a prototype?
good to have CSV like minum export 

---

## Open Technical Questions

- **Mobile framework for Phase 2:** React Native or Flutter? Both are viable. Decision deferred until Phase 1 UX is validated — the choice matters less than getting the data model right first.
- **PWA ceiling:** Phase 1 is a PWA installable on a phone home screen. If the PWA experience turns out to be good enough, does Phase 2 still need to be a native app? Define the threshold (e.g. push notifications, background sync, app store distribution) that would trigger a native build.
- **Storage abstraction interface:** The service interface needs to be designed before Phase 1 coding starts. It should be async-first (so the Phase 2 API implementation doesn't require changing call sites) and should not expose any `localStorage`-specific concepts.
- **Conflict resolution strategy for Phase 2:** If a match is edited on two devices while offline, how is the conflict resolved on sync? Last-write-wins is simplest; event-log / CRDT approach is more correct but significantly more complex.


