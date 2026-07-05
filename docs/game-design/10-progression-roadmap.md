# Progression Roadmap

## Purpose

This document describes long-term progression arcs without expanding MVP implementation. It exists so economy formulas, save schema, Pixi station hardpoints and UI navigation do not block future growth.

## MVP Progression

MVP targets the first 30-60 minutes:

- first purchase in 10-20 seconds;
- first new module in 45-90 seconds;
- first visible station upgrade within 2 minutes;
- first meaningful rewarded bonus around 10 minutes;
- late rooms should stretch progression instead of all unlocking in the first 2-3 minutes;
- saucer dock target unlock is 60-90 minutes without mandatory ads;
- first prestige goal becomes understandable around 30 minutes;
- first prestige is reachable around 60 minutes without mandatory ads.

MVP ends when the player understands "Реновация орбиты" and sees that restarting makes the station stronger.

## Day 1 Arc

Goal: prove the loop and create first return intent.

Player should experience:

- quick early purchases;
- 3-4 visible station changes;
- at least 2 residents;
- one offline reward;
- clear path to first prestige.

Design requirement:

- do not hide basic progression behind ads;
- do not introduce more than one new system at a time;
- keep UI focused on modules, goals, bonuses and prestige.

## Day 2-3 Arc

Goal: make prestige feel useful, not punitive.

Add later:

- more prestige upgrades that shorten early rebuild;
- resident bonuses that survive prestige;
- new goals for faster second-cycle growth;
- cosmetic station changes after renovation;
- higher offline cap as a prestige upgrade.

Expected player feeling:

```text
I rebuilt faster, opened familiar rooms earlier, and saw a new station detail.
```

## Day 4-7 Arc

Goal: introduce midgame without bloating first session.

Possible systems:

- resident sets;
- station wings;
- prestige tiers;
- cosmetic goals;
- weekly repair board;
- soft live events.

Do not add all systems at once. Each release should add one retention reason and one visible station reward.

## Prestige Tiers

### Tier 1: First Renovation

Scope: MVP.

Rewards:

- reputation currency;
- one permanent upgrade purchase slot per completed renovation, presented as 3 tier-specific choices;
- starting kopeks, starting comfort, preserved residents, first-room discount, capsule head start, visitor comfort bonus, reputation income scaling, or higher offline cap.

Current upgrade list:

- `warm_start_credits`: new cycles start with 100 kopeks;
- `residents_survive`: residents survive renovation;
- `first_room_discount`: first purchase of each room is 10% cheaper;
- `starting_comfort`: new cycles start with +5 comfort;
- `capsule_head_start`: tenant capsule starts at level 5 after renovation;
- `visitor_comfort_bonus`: accepted visitors give +1 comfort;
- `reputation_income`: reputation gives a stronger income multiplier;
- `offline_cap_16h`: offline cap increases to 16 hours;
- `maintenance_drones`: new rooms start in better condition.

### Tier 2: Better Neighbors

Scope: post-MVP.

Rewards:

- residents survive renovation;
- new resident slots;
- higher comfort scaling.

### Tier 3: Station Wings

Scope: post-MVP.

Rewards:

- unlock upper/lower station arcs;
- new module families;
- visual ring expansion.

### Tier 4: Famous Communalka

Scope: later roadmap.

Rewards:

- special visitors;
- weekly events;
- rare cosmetics;
- advanced prestige upgrades.

## Economy Expansion Rules

When extending progression:

- preserve the first 10 minutes unless deliberately rebalance-tested;
- add new multipliers through named systems, not hidden formula changes;
- keep offline reward readable;
- do not let old content become irrelevant immediately;
- update save schema intentionally and document migration.

## UI Expansion Rules

Future progression should fit the existing navigation:

- `Комнаты` for modules;
- `Цели` for guided tasks;
- `Бонусы` for voluntary boosts;
- `Реновация` for prestige and permanent upgrades.

Add a new tab only if a system cannot fit these categories without clutter.

## Pixi Progression Rules

Station growth should be staged:

1. single module;
2. living section;
3. service block;
4. orbit ring;
5. renovated station;
6. expanded wings;
7. famous orbital home.

Each stage needs a silhouette change, not just more small details.

## Future Roadmap Backlog

Post-MVP candidates:

- prestige upgrade tree;
- resident collection book;
- station cosmetics;
- weekly repair event;
- visitor requests;
- module skins;
- second station wing;
- daily login calendar;
- soft achievements;
- leaderboard only if it does not distort idle balance.

## Scope Guardrail

The first implementation plan must not implement Day 2-7 systems. It should only keep code extensible enough that these systems can be added later without rewriting domain state, Pixi hardpoints or navigation.
