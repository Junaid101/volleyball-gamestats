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

### Phase 1 — Web Prototype

A browser-based web app with **no backend**. All data is stored locally in the browser (`localStorage` or `IndexedDB`). No user accounts, no sync.

**Goals:**
- Validate the live scoring UX — does it actually work courtside?
- Prove out the data model (Match, Set, Team, Player, per-set stats)
- Clarify what a backend would actually need to do
- Build something you can take to a real match and test

**Scope:**
- Set up a team roster with player names and positions
- Start a match, record set scores and per-player stats live
- View match history and player stat summaries
- Basic shareable match summary (screenshot-ready layout)
- Single-user only — one device, one team

---

### Phase 2 — Cross-Platform Mobile App

A production mobile app for Android and iOS, built on what was learned in Phase 1.

**Goals:**
- Ship a polished, native-feeling mobile experience
- Support a team: one person records, everyone can view
- Offline-first with background sync

**Scope:**
- Everything from Phase 1, rebuilt for mobile
- Team accounts: one team, multiple members
- One designated recorder per match; other team members can view in real time
- Offline-first; sync when connection is restored
- CSV export for coaches

---

## Architecture

- **Phase 1:** Frontend only. No backend. Browser storage.
- **Phase 2:** Separate frontend (mobile) and backend (API + database).
  - Backend: likely a simple REST API
  - Database: relational (matches, sets, players, stats) — schema to be defined
  - Auth: team-code or invite-based (no heavy account system needed)
  - Sync: offline-first with background sync on reconnect

---

## Phase 1 → Phase 2 Continuity

### Option A — Evolve the Phase 1 codebase

Continue with the same stack. If Phase 1 is in React, use React Native for Phase 2, sharing business logic (data model, stat calculations, storage layer).

**Pros:** Code reuse, shared data model, faster ramp-up
**Cons:** Web and native UX paradigms are genuinely different. A UI built for browser will need significant rework to feel native. Risk of a mediocre experience on both.

### Option B — Rebuild for Phase 2

Treat Phase 1 as a throwaway prototype. Carry over the data model and UX learnings but rewrite from scratch using a mobile-first stack (Flutter, or React Native as a greenfield project).

**Pros:** Clean slate, purpose-built for mobile, no accumulated web debt
**Cons:** More upfront effort, some duplication

### Current lean

The most important output of Phase 1 is the **data model** and the **UX validation** — not the code itself. If Phase 1 is in React, a React Native rebuild is low friction. If the Phase 1 UI turns out to be substantially wrong for mobile (which is likely), Option B is probably correct anyway.

The data model should be defined and documented independently of Phase 1 code, so it can survive a rebuild.

---

## Open Product Questions

- **Indoor vs beach volleyball?** Beach is 2-player, no setter role, no libero, sets to 21, completely different stats profile. Should the app support both formats, or start indoor-only? *(Lean: indoor only for Phase 1)*
- **What ruleset / league?** FIVB standard is 6 subs per set; many recreational leagues use unlimited subs or custom rules. Does the app enforce rules, or just record stats? *(Lean: record-only, no rule enforcement)*
- **Roster setup flow:** How does a user set up their team before their first match? Manual entry of player names and positions? Does position affect which stats are shown per player? *(This is the first UX flow to design)*
- **Opponent tracking:** At minimum, the opponent's team name is needed for match history. Do we ever track opponent stats? *(Lean: name only)*
- **Attack attempts (for hitting efficiency):** Efficiency requires recording every attack attempt — kill, error, or "in play" (neither kill nor error). Is it realistic to track all three outcomes live during a fast match, or should we simplify to kills and errors only?
- **Season / competition structure:** Do matches belong to a season or tournament, or are they standalone records? *(Lean: standalone for Phase 1, seasons in Phase 2)*
- **Who is the stat keeper?** Is it always one designated person per match, or can anyone open the app and record? In Phase 2 with multi-user: can two people co-track the same match simultaneously?
- **Libero rule handling:** The libero has special restrictions (no attacks above net, no serving in most rules, automatic substitution). Does the app need to model libero-specific behaviour, or just let any player record any stat?
- **Data loss risk in Phase 1:** If Phase 1 stores everything in browser local storage, clearing the browser wipes all match history. Is there a minimum export or backup mechanism needed, or is that acceptable for a prototype?

---

## Open Technical Questions

- **Phase 1 stack:** React with `localStorage` for persistent local storage. Build as a PWA so it can be added to the phone home screen — this brings Phase 1 much closer to a real mobile experience and is a useful test before committing to a native Phase 2.
- **Phase 1 → Phase 2 continuity:** Rebuild (Option B). The most important carry-over is the data model and UX learnings, not the code.
- **Mobile framework for Phase 2:** React Native or Flutter — to be decided after Phase 1 learnings. Both are viable.
- **Backend:** Phase 2 only. However, Phase 1 should use a clean abstraction layer — all data reads/writes go through a storage service module. In Phase 1 that module uses `localStorage`; in Phase 2 it can be swapped for API calls without touching the rest of the app.
- **Auth:** Email + password + 2FA for account creation. Team joining via a team code (regeneratable). No OAuth for now — keep it simple.
- **Data model:** Must be defined and documented before Phase 1 development starts. Core entities: `Match`, `Set`, `Team`, `Player`, `PlayerSetStats`. This spec should survive the Phase 2 rebuild.
- **State management:** Local state is fine for Phase 1. Phase 2 will use standard optimistic update patterns with conflict resolution on sync.
- **Hosting for Phase 1:** GitHub Pages — static assets only, all state lives locally in the browser. Works well with the PWA approach.
- **PWA scope:** If Phase 1 is a PWA installable on a phone home screen, how much of the mobile UX should it replicate? Does this affect how much Phase 2 actually needs to be a native app, or could a polished PWA be sufficient?
- **Storage abstraction design:** What does the storage service interface look like? Needs to be designed early so it doesn't leak `localStorage` specifics into the rest of the app.

