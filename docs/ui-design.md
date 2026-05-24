# Volleyball GameStats — Phase 1 UI/UX Design

## 1. Product framing

- **Primary context:** one-handed, courtside, live match recording on a 375px-wide phone.
- **Design goal:** make live stat entry faster than writing on paper while keeping history/review simple.
- **Visual direction:** dark-first, high-contrast utility UI with large score digits, oversized touch targets, and shallow navigation.
- **Interaction model:** bottom navigation for top-level sections, focused full-screen flow for active matches.

## 2. Navigation structure

### Top-level information architecture

- **`/` Home**
- **`/roster` Roster Management**
- **`/history` Match History**
- **`/players` Player Stats**
- **Match flow (modal/focused flow, not bottom-nav destinations):**
  - **`/match/new` New Match Setup**
  - **`/match/live/:matchId/set/:setNumber` Live Scoring — Set View**
  - **`/match/live/:matchId/between-sets` Live Scoring — Between Sets**
  - **`/match/:matchId/complete` Match Complete**
  - **`/match/:matchId/share` Match Summary Share**
- **First launch only:** **`/onboarding`**
- **Detail route:** **`/history/:matchId` Match Detail**

### Navigation rules

- **Bottom nav** appears on Home, Roster, History, and Player Stats.
- **Bottom nav is hidden during onboarding and live match flow** to prevent accidental navigation during play.
- **Back behavior:**
  - Browser/app back returns to the previous screen within the current flow.
  - Leaving live scoring uses an explicit “Exit match” action in the overflow sheet, never an easy-to-mis-tap back arrow alone.
- **Depth stays shallow:**
  - Level 1: Home / Roster / History / Players
  - Level 2: Match setup / Match detail / Onboarding
  - Level 3: Share summary or live-match substate

### Bottom navigation

1. **Home** — dashboard and quick actions
2. **Roster** — manage team players
3. **History** — past matches
4. **Players** — aggregate player summaries

Use icon + label for each item. Active tab uses accent fill + label weight.

## 3. App shell and layout standards

### Base mobile layout

- **Canvas width:** designed from **375px** base width.
- **Screen padding:** `px-4` mobile, `max-w-screen-sm mx-auto` for phone-centered layout.
- **Vertical rhythm:** 8px spacing grid.
- **Safe areas:** reserve top/bottom space for status bar and home indicator.
- **Content padding with bottom nav:** main pages use bottom padding of nav height + safe area.

### Global structure

- **Sticky header** with title, optional back button, and one secondary action.
- **Primary action zone** stays in thumb reach near the lower half of the screen.
- **Cards** use clear section grouping rather than dense tables on mobile.
- **Sheets over modals** for edit, confirm, and quick-entry tasks.

## 4. Screen designs

---

## 4.1 Onboarding / Team Setup

- **Route:** `/onboarding`
- **Purpose:** first launch when no team exists; create team name and initial roster.

### Layout

- Full-screen welcome card stack.
- Top: app name + short value statement.
- Middle: form card with **Team Name** field.
- Below: **Initial Players** list builder.
- Bottom sticky CTA: **Save Team & Continue**.

### Key components and behavior

- **TeamNameField** — text input, autofocus, 56px height.
- **InitialPlayerList** — stacked rows with name + position dropdown.
- **AddPlayerRowButton** — adds another blank player row.
- **PositionSelectSheet** — bottom sheet for choosing one position.
- **Primary CTA** disabled until team name + at least 6 players entered.

### Tap targets

- **Team name field:** opens keyboard.
- **Player name field:** opens keyboard.
- **Position pill:** opens sheet with six positions.
- **Add player:** inserts row and scrolls to it.
- **Delete row:** removes unsaved row with inline undo toast.
- **Save Team & Continue:** stores team, routes to Home.

### Edge cases / empty states

- Empty list starts with **6 blank rows** to match a basic lineup expectation.
- If fewer than 6 players are added, show helper text: “You can save later, but 6+ players makes match setup easier.”
- Validation appears inline, not in modal.

---

## 4.2 Home / Dashboard

- **Route:** `/`
- **Purpose:** landing screen after onboarding; quick access to live match flow and recent results.

### Layout

- Sticky header with team name and small “Edit Team” link.
- Hero card with two large CTAs:
  - **Start Match**
  - **View History**
- Secondary card: current roster count + quick link to roster.
- Recent matches section: last 3 match cards.
- Bottom nav visible.

### Key components and behavior

- **TeamHeaderCard** — team name, player count, setup completeness.
- **QuickActionButton** — full-width, 56–64px height.
- **RecentMatchStrip** — latest results in vertical list.

### Tap targets

- **Start Match:** routes to `/match/new`.
- **View History:** routes to `/history`.
- **Edit Team / Roster link:** routes to `/roster`.
- **Recent match card:** routes to `/history/:matchId`.

### Edge cases / empty states

- No matches yet: show “No matches recorded yet” with **Start Match** CTA.
- Incomplete roster: show warning banner “Add positions before your first match” linking to roster.

---

## 4.3 Roster Management

- **Route:** `/roster`
- **Purpose:** view, add, edit, and delete players.

### Layout

- Header with title and **Add Player** action.
- Search/filter is not needed in Phase 1 unless roster > 12; keep simple.
- Player cards in stacked list.
- Sticky bottom button on small screens: **Add Player**.

### Key components and behavior

- **PlayerCard** — player name, position badge, optional notes like “Added recently”.
- **PlayerEditSheet** — reusable add/edit sheet.
- **DeleteConfirmSheet** — destructive confirm with undo toast after delete.

### Tap targets

- **Player card body:** opens edit sheet.
- **Edit icon/text:** same as above.
- **Delete action:** opens confirmation sheet.
- **Add Player:** opens blank player sheet.

### Edge cases / empty states

- Empty roster: full-height state with “Add your first player”.
- If player is part of active match setup draft, deleting shows warning text.
- Deleted player can be restored for 5 seconds via toast undo.

---

## 4.4 New Match Setup

- **Route:** `/match/new`
- **Purpose:** create a match, choose format, and select which rostered players are available.

### Layout

- Step-style single page, not multiple screens.
- Section 1: opponent name input.
- Section 2: format segmented control (**Best of 3** / **Best of 5**).
- Section 3: roster checklist labeled **Who’s playing today?**
- Bottom sticky CTA: **Start Match**.

### Key components and behavior

- **OpponentField** — required text input.
- **FormatSegmentedControl** — two large segmented buttons.
- **PlayerSelectionList** — checkbox cards; selected players rise to top.
- **SelectedCountBar** — shows `8 selected` and lineup completeness.

### Tap targets

- **Opponent field:** opens keyboard.
- **Format option:** switches format immediately.
- **Player selection card:** toggles selected state.
- **Start Match:** creates match and opens first set view.

### Edge cases / empty states

- If fewer than 6 players selected, helper text warns but still allows starting because Phase 1 does not enforce rules.
- If no opponent entered, CTA disabled.
- If roster is empty, replace form with “Add players first” + link to `/roster`.

---

## 4.5 Live Scoring — Set View

- **Route:** `/match/live/:matchId/set/:setNumber`
- **Purpose:** the core in-match recording screen for score and per-player stats in the active set.

### Layout

- **Sticky match header**
  - Set number
  - Match score chips (sets won)
  - Overflow action
- **Large score card**
  - Our score left, opponent score right
  - Two large `+1` score buttons directly under each score
  - Manual adjust icon opens score correction sheet
- **Selected player rail**
  - Horizontal chips for active players
  - Current player chip highlighted
- **Stat pad for selected player**
  - 2-column or 3-column grid of large stat buttons
  - Buttons prioritized by position
- **Compact set summary list**
  - one PlayerStatRow per player with current counts
- **Sticky thumb-zone action row**
  - Undo last action
  - End Set

### Key components and behavior

- **SetScoreDisplay** — large tabular numerals, live updating.
- **ScoreAdjustButton** — one for team score, one for opponent score.
- **PlayerChipRail** — quick player switching without opening a new screen.
- **PlayerStatPad** — selected player’s primary actions.
- **StatButton** — increments one stat and logs action to undo stack.
- **PlayerStatRow** — compact glanceable row of current set totals.
- **UndoFab / UndoBar** — always visible within thumb reach.

### Stat pad behavior

Default stat buttons change by player position to reduce clutter:

- **Outside / Opposite / Middle:** Kill, Attack Error, Attack Attempt, Block, Ace, Dig
- **Setter:** Assist, Ace, Service Error, Dig, Kill, Block
- **Libero / Defensive Specialist:** Dig, Reception Error, Ace, Service Error, Assist, Attack Attempt

Rules:
- First row shows the **3 most likely** stats for that position.
- “More stats” expands to show the remaining Phase 1 stats.
- Every button displays the current count for this set.
- Buttons are one-tap increment only; corrections happen through Undo or row edit sheet.

### Tap targets

- **Our score +1:** increments team score.
- **Opponent score +1:** increments opponent score.
- **Selected player chip:** switches active player.
- **Stat button:** increments stat for selected player and shows mini confirmation toast.
- **Player row:** opens per-player edit sheet for manual correction of any set stat.
- **Undo:** reverts the latest stat or score action.
- **End Set:** opens confirm sheet with current score prefilled.
- **Overflow:** contains Exit Match, Edit Opponent, and Manual Score Edit.

### Edge cases / empty states

- If no player selected yet, auto-select the first available player.
- If only one player is in match roster, player rail collapses.
- If screen is offline or storage is slow, show unobtrusive autosaved status, never block entry.
- If user taps End Set with tied score, allow it but show note: “No rule enforcement in Phase 1.”

### Error prevention choices

- No decrement buttons beside every stat.
- No tiny inline counters for live entry.
- High-frequency actions are isolated from navigation.
- Last action is always visible as text: `Undo kill · Maya`.

---

## 4.6 Live Scoring — Between Sets

- **Route:** `/match/live/:matchId/between-sets`
- **Purpose:** brief checkpoint after ending a set.

### Layout

- Header: `Set 1 complete`.
- Summary card with set score and updated match score.
- Small player highlights: leaders for kills, digs, assists in that set.
- Two main CTAs:
  - **Start Next Set**
  - **Finish Match**
- Secondary link: **Edit Set Stats**.

### Key components and behavior

- **SetSummaryCard** — final set score + winner state.
- **MiniLeaderRow** — three quick highlights.
- **ActionStack** — vertically stacked primary/secondary CTAs.

### Tap targets

- **Start Next Set:** creates next set and routes to its set view.
- **Finish Match:** ends match early and routes to Match Complete.
- **Edit Set Stats:** returns to previous set in edit mode.

### Edge cases / empty states

- For deciding set already reached, replace “Start Next Set” with “Complete Match”.
- If no stats were recorded, show neutral message rather than empty chart.

---

## 4.7 Match Complete

- **Route:** `/match/:matchId/complete`
- **Purpose:** immediate post-match confirmation and bridge into history/share.

### Layout

- Celebration-style but restrained summary screen.
- Final result card with team/opponent and set count.
- Vertical list of set scores.
- Two big actions:
  - **View Match Detail**
  - **Create Share Summary**
- Secondary action: **Back to Home**.

### Key components and behavior

- **FinalResultHero** — final match score.
- **SetScoreList** — all set results.
- **TopPerformersCard** — top 2–3 performers across the match.

### Tap targets

- **View Match Detail:** `/history/:matchId`
- **Create Share Summary:** `/match/:matchId/share`
- **Back to Home:** `/`

### Edge cases / empty states

- If match ended after one set or mid-match, label result as “Match saved” rather than “Full match complete”.

---

## 4.8 Match History

- **Route:** `/history`
- **Purpose:** browse all past matches quickly.

### Layout

- Header with title.
- Optional lightweight filters:
  - All / Wins / Losses
- Reverse-chronological list of match result cards.
- Bottom nav visible.

### Key components and behavior

- **FilterChipGroup** — optional simple status filter.
- **MatchResultCard** — opponent, date, final result, match format, quick stats.

### Tap targets

- **Filter chip:** filters list locally.
- **Match card:** opens match detail.

### Edge cases / empty states

- No matches: empty state with **Start Match** CTA.
- Long history (50+): lazy-render or virtualize list if needed.

---

## 4.9 Match Detail

- **Route:** `/history/:matchId`
- **Purpose:** full post-match review.

### Layout

- Header with opponent, date, overflow actions.
- Summary block:
  - final result
  - format
  - set-by-set scores
- Player stats section as stacked cards on mobile, table on wider screens.
- Hitting efficiency shown beside attack stats for each eligible player.
- Bottom action row:
  - Share Summary
  - Edit Match (Phase 1 optional future hook; can be disabled)

### Key components and behavior

- **MatchMetaCard** — opponent/date/format.
- **SetScoresTable** — simple rows for each set.
- **PlayerStatsTableCard** — responsive table/card hybrid.
- **HittingEfficiencyBadge** — displays `(kills-errors)/attempts` as decimal or percentage.

### Tap targets

- **Share Summary:** opens screenshot layout.
- **Player stat row/card:** optional drill-in to Player Stats filtered to that player.
- **Overflow:** delete match, duplicate as template, export later placeholder.

### Edge cases / empty states

- If attempts = 0, hitting efficiency shows `—` instead of `0.000`.
- If some players had no recorded stats, show zeroed summary card, not blank space.

---

## 4.10 Player Stats

- **Route:** `/players`
- **Purpose:** aggregate season-to-date player summaries across all matches.

### Layout

- Header with title.
- Optional stat category chips: All / Attack / Serve / Defense / Setting.
- Player summary cards in list.
- Each card shows core totals and derived hitting efficiency when relevant.
- Bottom nav visible.

### Key components and behavior

- **PlayerSeasonCard** — name, position, matches played, top metrics.
- **StatCategoryChips** — changes what secondary metrics are shown.
- **MiniTrendNote** — simple text like “Best match: vs Falcons”.

### Tap targets

- **Category chip:** updates visible metrics.
- **Player card:** expands inline or routes to filtered detail state (same route with query param).

### Edge cases / empty states

- No matches yet: explain that season summaries appear after first recorded match.
- Players with only one match still show totals, not averages only.

---

## 4.11 Match Summary Share

- **Route:** `/match/:matchId/share`
- **Purpose:** screenshot-ready layout for sending to team chat.

### Layout

- Full-screen centered summary card with generous margins.
- Card sections:
  1. Team + opponent
  2. Final match score
  3. Set scores
  4. Top performers
  5. Small footer with date and app name
- Background dimmed; card uses lighter surface for cleaner screenshots.
- Sticky bottom actions:
  - **Save Screenshot Tips** (optional helper)
  - **Back to Match Detail**

### Key components and behavior

- **ShareSummaryCard** — fixed-ratio card optimized for phone screenshot.
- **TopPerformerBadge** — e.g. Most Kills, Most Digs, Best Efficiency.
- **ScreenshotHintSheet** — one-time helper telling user to use native screenshot/share.

### Tap targets

- **Tap card:** no action; avoid accidental movement.
- **Back to Match Detail:** returns to history detail.
- **Optional helper action:** shows instructions, not a mandatory step.

### Edge cases / empty states

- If there are no standout stats, replace top performers with “Team totals” block.
- Long opponent names wrap to two lines max.

## 5. Reusable component inventory

| Component | Purpose | Suggested props |
|---|---|---|
| `AppShell` | Standard page wrapper with header/footer spacing | `title`, `showBack`, `showBottomNav`, `actions`, `children` |
| `BottomNav` | Top-level navigation | `items`, `activePath` |
| `PageHeader` | Sticky title row | `title`, `subtitle`, `backTo`, `action`, `compact` |
| `PrimaryButton` | Main CTA button | `label`, `onClick`, `disabled`, `icon`, `fullWidth` |
| `SecondaryButton` | Secondary CTA | `label`, `onClick`, `variant` |
| `EmptyState` | Reusable empty state with CTA | `title`, `description`, `actionLabel`, `onAction`, `icon` |
| `PlayerCard` | Roster row/card | `player`, `onEdit`, `onDelete`, `isSelected` |
| `PositionBadge` | Position label styling | `position`, `size` |
| `MatchResultCard` | History item summary | `match`, `onOpen`, `compact` |
| `SetScoreDisplay` | Large current/final score display | `teamScore`, `opponentScore`, `teamLabel`, `opponentLabel`, `isLive` |
| `ScoreAdjustButton` | Big +1 scoring control | `side`, `label`, `onIncrement`, `disabled` |
| `PlayerChipRail` | Horizontal player selector | `players`, `selectedPlayerId`, `onSelect` |
| `StatButton` | Large tap target for incrementing a stat | `statKey`, `label`, `count`, `tone`, `onTap`, `isPrimary`, `shortcutHint?` |
| `PlayerStatPad` | Grid of stat buttons for selected player | `player`, `stats`, `layout`, `onIncrement`, `onExpandMore` |
| `PlayerStatRow` | One player’s current set summary | `player`, `setStats`, `activeStatGroup`, `onOpenEditor`, `isSelected` |
| `UndoBar` | Persistent undo affordance | `lastActionLabel`, `onUndo`, `disabled` |
| `SetSummaryCard` | Between-sets recap | `setNumber`, `teamScore`, `opponentScore`, `leaders` |
| `PlayerSeasonCard` | Aggregated player stats | `player`, `totals`, `highlights`, `onOpen` |
| `HittingEfficiencyBadge` | Shows derived efficiency clearly | `kills`, `errors`, `attempts`, `format` |
| `FilterChipGroup` | Small local filters | `options`, `value`, `onChange` |
| `BottomSheet` | Reusable mobile sheet | `title`, `open`, `onClose`, `children`, `snap` |
| `ConfirmSheet` | Destructive/confirm actions | `title`, `description`, `confirmLabel`, `confirmTone`, `onConfirm` |
| `ShareSummaryCard` | Screenshot-ready summary layout | `match`, `topPerformers`, `theme` |
| `Toast` | Temporary feedback/undo prompts | `message`, `tone`, `actionLabel`, `onAction` |

## 6. Color and typography

### Recommended palette (dark-first)

Use semantic tokens rather than raw hex in components.

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#38BDF8` | primary actions, active nav, focus accents |
| `primary-strong` | `#0EA5E9` | pressed/hover state |
| `secondary` | `#1E293B` | secondary surfaces, chips |
| `background` | `#020617` | app background |
| `surface` | `#0F172A` | cards, score panels |
| `surface-alt` | `#111827` | nested surfaces, sheets |
| `success` | `#22C55E` | positive outcomes, saved state |
| `warning` | `#F59E0B` | set/match highlight, caution |
| `danger` | `#EF4444` | delete, service/attack error emphasis |
| `text` | `#F8FAFC` | primary text on dark surfaces |
| `text-muted` | `#94A3B8` | supporting text |
| `border` | `#334155` | outlines/dividers |
| `share-card-bg` | `#F8FAFC` | screenshot-ready card background |
| `share-card-text` | `#0F172A` | screenshot-ready text |

### Position accent colors

Use small badges only; never rely on color alone.

- Outside Hitter — sky
- Opposite Hitter — orange
- Middle Blocker — violet
- Setter — emerald
- Libero — amber
- Defensive Specialist — rose

### Typography

- **Headings / score digits:** `Barlow Semi Condensed` or `Archivo Semi Condensed`
  - Strong, athletic, narrow enough for big score numbers.
- **Body / labels / forms:** `Inter` or system sans stack
  - Highly readable, widely available, good at 16px+.
- **Numeric treatment:** use `tabular-nums` for all scores and stat counts.

### Type scale

- Display score: `text-5xl` to `text-6xl`, `font-semibold`, `tracking-tight`
- Screen title: `text-2xl font-semibold`
- Card title: `text-lg font-semibold`
- Body: `text-base`
- Supporting text: `text-sm`
- Tiny labels: avoid under `text-xs` except stat badges

### Tailwind class patterns

- **App background:** `min-h-dvh bg-slate-950 text-slate-50`
- **Card:** `rounded-2xl border border-slate-700 bg-slate-900`
- **Primary button:** `min-h-14 rounded-2xl bg-sky-400 text-slate-950 font-semibold active:scale-[0.98]`
- **Secondary button:** `min-h-14 rounded-2xl border border-slate-600 bg-slate-800 text-slate-50`
- **Danger button:** `min-h-14 rounded-2xl bg-rose-500 text-white`
- **Stat button:** `min-h-16 rounded-2xl border border-slate-600 bg-slate-800 px-3 py-3 text-left`
- **Bottom nav:** `fixed inset-x-0 bottom-0 border-t border-slate-800 bg-slate-950/95 backdrop-blur`
- **Focus ring:** `focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-400/60`

## 7. Courtside UX decisions

### Tap target size

- Absolute minimum: **44x44px**.
- Preferred for all major buttons: **56px height**.
- Preferred for stat entry buttons: **64px height** with 8px+ gap.
- Player chips: **44px min height**, horizontally scrollable.

### Undo implementation

- Every score and stat increment writes to a simple action log.
- **Undo is persistent and thumb-reachable** in a fixed bottom control bar.
- Undo label includes the last action, e.g. `Undo ace · Jordan`.
- Undo does not require confirmation.
- Destructive roster deletes use **toast undo** after confirm.

### How live scoring minimizes errors

- Only **one selected player** is active at a time.
- Live screen shows **position-prioritized stat buttons**, not the entire stat universe at once.
- Corrections use **Undo first**, manual edit second.
- Navigation is hidden during live entry.
- Score increments are separated from stat entry area.
- Big score numerals and big player selection state reduce ambiguity.
- Use instant press feedback and optional subtle vibration for score/end-set actions.

### What is shown during live scoring

Shown:
- current set number
- current match score (sets won)
- current set score
- selected player
- most relevant stat buttons
- visible undo
- end set
- compact per-player set summary

Hidden or deferred:
- full season summaries
- dense all-player/all-stat tables
- roster editing
- deep settings
- share/history navigation
- low-value confirmations

### Motion and feedback

- Press feedback within 100ms.
- Micro-interactions: 150–200ms.
- Use opacity/scale only, respect `prefers-reduced-motion`.
- Toasts auto-dismiss after 3–4 seconds.

## 8. Responsive behavior

- **Phone portrait (default):** stacked cards and sticky bottom actions.
- **Phone landscape:** score card compresses horizontally; player rail remains scrollable; stat grid becomes 3 columns.
- **Tablet / desktop review:** Home, History, Match Detail, and Player Stats can widen to two-column layouts, but live scoring remains centered to preserve muscle memory.

## 9. Open questions / product decisions to validate in Phase 1

1. **Attack attempts live-entry burden:** is `Attack Attempt` fast enough as a dedicated tap, or should it move into the edit sheet for some positions?
2. **Bench vs playing roster:** should the live player rail include only selected players or also a collapsed bench section for emergency stats?
3. **Post-match edit depth:** does Phase 1 need full match editing from Match Detail, or is read-only history enough initially?
4. **Sharing action:** should the PWA eventually render a generated image, or is screenshot-first sufficient for the prototype?

## 10. Summary of design decisions

- **11 screens** total, with **4 bottom-nav destinations** and a focused live-match flow.
- **Dark-first, high-contrast utility UI** optimized for courtside visibility.
- **Selected-player stat pad** is the core live-entry pattern, not a dense table of tiny buttons.
- **Undo is persistent, immediate, and one-thumb reachable** from every live scoring state.
- **Share summary is screenshot-ready**, not social-feature heavy.
- **Navigation stays shallow** and live scoring intentionally hides nonessential destinations.
