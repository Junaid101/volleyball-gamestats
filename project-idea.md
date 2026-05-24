# Product Idea

## Overview

Volleyball GameStats is a courtside-first stats tracker for recreational and club volleyball teams. The product is designed for the person actually sitting on the bench or standing on the sideline during a live match, trying to record useful stats quickly without missing the next rally.

The goal is not to build a feature-heavy volleyball management platform. The goal is to make live match tracking simple, fast, and reliable enough that a real team would use it during actual matches.

## Product vision

Build a lightweight stats tool that helps a team:

- record live match stats quickly on a phone
- correct mistakes immediately with undo
- review match results after the game
- track player performance across multiple matches
- eventually share data across a team without adding admin-heavy workflows

## Target users

### Primary user

A player, captain, or bench teammate tracking stats live during a recreational or semi-competitive indoor volleyball match.

### Secondary user

A coach or teammate reviewing match results, trends, and player contribution after the match is over.

### Not the target for now

- professional teams using dedicated scouting tools
- casual players who do not care about stats
- beach volleyball teams with a fundamentally different match and role structure

## Core product principles

- courtside first: large tap targets, low-friction flows, minimal confirmation screens
- live scoring first: post-match entry can exist, but the main workflow is in-match entry
- fast recovery from mistakes: undo must be obvious and quick
- meaningful stats only: track the stats that players and coaches actually use
- local-first prototype: Phase 1 should work without backend complexity

## What the product tracks

### Match structure

- best-of-3 and best-of-5 match formats
- per-set scores
- match winner
- opponent name
- basic match metadata such as date and location

### Player stats

- kills
- attack errors
- attack attempts
- assists
- aces
- service errors
- digs
- solo blocks
- assisted blocks
- reception errors

### Important derived stat

Hitting efficiency is a first-class stat and should always be easy to understand and surface:

$$
\\text{hitting efficiency} = \\frac{\\text{kills} - \\text{attack errors}}{\\text{attack attempts}}
$$

## What is out of scope right now

- rally-by-rally breakdowns
- opponent player stat tracking
- detailed substitution modeling
- timeout tracking
- league rule enforcement
- social features or feed-style product ideas

## Questions already answered

These are the product and technical questions that are currently settled enough to guide the project.

### Product decisions made

- indoor volleyball only for Phase 1
- the app records stats; it does not enforce league or federation rules
- opponent tracking is name-only for now
- live scoring is the primary use case
- Phase 1 is single-user and single-device
- the most important output of Phase 1 is validated UX and a durable data model

### Technical decisions made

- Phase 1 is a React web app
- Phase 1 stores data locally in the browser
- the prototype should behave like an installable PWA
- the app should be hosted as static assets on GitHub Pages
- storage access should go through a clean service abstraction rather than leaking browser-storage details throughout the app
- the long-term direction is to preserve product and data-model learnings even if the Phase 2 app is rebuilt

## Current assumptions

These assumptions are shaping product design today and should be revisited after real usage.

- one person records stats during a match
- speed matters more than perfect completeness
- a team is willing to trade some analytical depth for faster live input
- browser-local persistence is acceptable for the prototype stage
- per-set data is worth the added complexity because volleyball is inherently set-structured

## Open questions

These questions still matter and should guide future product discovery.

### Live stat entry realism

- is recording all attack attempts realistic during a fast live match, or should the workflow simplify attacking stats further?
- which stat buttons are truly essential in the first visible row for each player role?
- how much detail can one person capture reliably without missing rallies?

### Team and match workflow

- does position meaningfully change the recommended stat-entry layout, or should the UI stay role-agnostic?
- should post-match editing be lightweight and common, or treated as a fallback repair path only?
- should matches stay standalone in Phase 1, or is a season or tournament grouping already needed sooner?

### Multi-user future

- in Phase 2, can more than one person co-track the same match or should there be one designated recorder?
- what conflict model should apply if two devices edit the same match data offline?
- what is the minimum collaboration feature set that creates real team value without overcomplicating the product?

### Data and retention

- is browser-only local storage an acceptable risk for real users, or is export or backup required even in Phase 1?
- what export format matters most first: screenshot-friendly summary, CSV, or structured data export?
- which historical stats matter most to coaches versus players?

### Platform direction

- after Phase 1 learning, should Phase 2 be React Native or Flutter?
- will a polished PWA cover enough real-world use cases that native apps become lower priority?

## Future improvements

These are reasonable next improvements once the core live-scoring loop is validated.

### Product improvements

- richer match summary and shareable post-match views
- export options for coaches and team admins
- better player trend views across a season
- lineup-aware match setup flows
- role-aware stat-entry layouts
- backup and restore flows

### UX improvements

- faster between-set transitions
- smarter default player selection during live entry
- more obvious score-correction flow
- better error prevention during rapid tapping
- stronger empty states and first-run guidance

### Technical improvements

- IndexedDB or a more resilient local persistence option if needed
- sync-capable backend for team sharing
- auth and team membership model
- conflict-aware offline synchronization
- analytics or telemetry for validating real usage patterns

## Phase 1 success criteria

The prototype is successful if it proves the following:

- a real user can run it courtside during a match
- live stat entry is fast enough to be practical
- the tracked stat model is useful after the match
- the current data model can support future sharing and mobile expansion
- the product direction becomes clearer through actual usage rather than speculation

## Relationship to the repository

This document is the product companion to the repository README.

- `README.md` explains the current repository, setup, hosting, and implementation reality
- `project-idea.md` explains the product intent, decisions, open questions, and future direction
- `docs/` holds deeper design and data-model references


