# Resident, Goal And Incident Depth Design

## Goal

Finish the first three known gameplay gaps before adding larger new systems:

- resident bonuses must affect real mechanics, not only UI text;
- goal reward kinds must apply real effects;
- station incidents must use varied, non-credit-heavy consequences.

The change should deepen the current game loop without adding new currencies,
dialogue trees, inventory, or new runtime dependencies.

## Scope

This pass is domain-first. UI changes should stay small and use existing panels.
The work should improve the meaning of existing player actions rather than add a
new screen.

## Resident Bonuses

Residents become passive station roles:

- `sleepy_engineer`: +5% income for `tenant_capsule`.
- `mist_cook`: +10% income for `cosmo_kitchen`.
- `vacuum_gardener`: grants +5 comfort once when unlocked.
- `sock_master`: +10% income for `zero_g_laundry`.
- `teleport_courier`: +5% global income.
- `retired_cosmonaut`: +10% income when at least one renovation has happened.
- `three_eyed_housekeeper`: first purchase of each room costs 8% less.
- `vip_astroteenant`: remains a rewarded/timed income role, with permanent
  collection unlock already handled by the ad flow.

Resident income bonuses stack multiplicatively after room base income and
milestone multipliers, before comfort, reputation, timed bonuses and condition.
Comfort unlock bonuses must be applied once and recorded by existing resident
unlock state; no new currency or secondary progression track is introduced.

## Goal Rewards

`GoalRewardKind` should describe actual domain behavior:

- `comfort`: add `rewardComfort`.
- `visual_detail`: unlock one or more stable visual placeholder ids.
- `temporary_boost`: add a short timed income bonus.
- `prestige_hint`: no economy reward; it only marks cycle progress.

Goal rewards must still apply once. Completed goals remain hidden from the
active visible goal list.

The first content pass should convert several goals away from pure comfort so
the player sees varied outcomes:

- resident goals can unlock visual details;
- earning goals can grant short boosts;
- room-opening goals can grant visual placeholders.

## Station Incidents

Incidents should avoid becoming another comfort-for-click list. Active incidents
may apply comfort, condition repair, timed bonuses and visual placeholders.
Credit rewards should be rare and never dominate the active slice.

The active incident slice expands from 10 to 15 enabled incidents by promoting
five existing backlog ids. The unresolved cap remains 3 and queue generation
still adds at most 1 new incident per state update.

Promoted incidents should use triggers that already exist:

- room opened;
- resident unlocked;
- renovation completed;
- room combo available;
- condition threshold;
- scene interaction.

## Architecture

Keep domain logic in `src/game`:

- add resident bonus helpers in `src/game/residents.ts`;
- apply resident income and first-room discount hooks from `src/game/economy.ts`;
- extend `GoalDefinition` with optional effect fields rather than inventing a
  generic reward engine;
- keep station incident effect application in `src/game/stationIncidents.ts`.

React components should keep reading derived state and translated labels. They
should not own reward math or bonus rules.

## Testing

Use TDD:

- resident bonus tests first, including income and one-time comfort unlock;
- goal reward tests for visual detail and temporary boost;
- incident content/effect tests for expanded active count and non-credit-heavy
  consequences;
- full suite after implementation.

## Documentation

Update game-design markdown after code changes:

- `docs/game-design/01-core-loop.md`
- `docs/game-design/02-economy-balance.md`
- `docs/game-design/03-content-progression.md`
