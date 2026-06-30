# Room Scenes And Goals Design

## Context

The current MVP renders one wide exterior station scene. It reads as a station map, but it does not give enough detailed visual reward for upgrading a specific room. Goals are also only displayed as static content: completed goals remain visible, and credit rewards do not add meaningful decisions because credits are already the main income loop.

This design changes the station visual surface into one detailed room scene at a time and turns goals into a lightweight progression guide with non-credit rewards.

## Chosen Approach

Use manual room selection with automatic focus after an upgrade.

- The player may select any unlocked room from a compact room selector.
- Buying a module level automatically switches the Pixi scene to that room.
- Locked rooms remain visible in the selector as unavailable future rooms, but they do not open a detailed scene.
- Desktop and mobile use the same room-selection model with different layout density.

This keeps the visual reward immediate after a purchase while still letting the player inspect favorite or newly unlocked rooms.

## Room Scene Model

PixiJS renders a single focused room scene instead of a full station overview.

Each module has one room scene:

| Module | Room Scene Intent |
|---|---|
| `tenant_capsule` | Small rented capsule with warm lamp, bed niche and repair patches. |
| `cosmo_kitchen` | Communal space kitchen with kettle, soup pot and analog controls. |
| `oxygen_garden` | Compact green dome with plant racks and oxygen bubbles. |
| `zero_g_laundry` | Floating washer room with socks and soft service lighting. |
| `teleport_entry` | Blue entry hall with teleport ring and parcel shelf. |
| `antigrav_gym` | Exercise room with floating rings and padded panels. |
| `panorama_dome` | Warm observation dome with seating and star view. |
| `saucer_dock` | Mini-saucer dock with service clamps and signal lights. |

Room detail is derived from module level:

| Level | Detail Tier | Visual Rule |
|---:|---|---|
| 0 | Locked | Room cannot be opened; selector item is disabled. |
| 1-9 | Basic | Core silhouette, one active light, clear room function. |
| 10-24 | Working | Resident/work props, stronger lighting, one animated detail. |
| 25-49 | Cozy | Comfort decoration, repaired panels, warmer color accents. |
| 50-99 | Busy | Service details, more motion, extra props without clutter. |
| 100+ | Complete | Most detailed version, premium glow, prestige-ready feeling. |

Readable text stays in React. Pixi can use icons, shapes and non-readable signage, but no long labels or buttons.

## UI Behavior

The station area is split into:

- focused Pixi room scene;
- compact room selector;
- existing economy panels.

Desktop can place the selector near the scene as a horizontal strip or side rail. Mobile should keep the selector short and tappable, either above the scene or directly under it. Selector controls must not resize the canvas when the selected room changes.

When `buyLevel(moduleId)` succeeds:

1. Economy updates the module level.
2. UI stores `selectedRoomId = moduleId`.
3. Pixi rebuilds or updates the focused room scene from `gameState` and `selectedRoomId`.

If a selected room becomes invalid after prestige or save migration, the UI falls back to the first unlocked module, then to `tenant_capsule`.

## Goals

Goals are a guide, not a credit faucet.

Rules:

- Completed goals are marked once and removed from the visible active-goal list.
- The goal panel shows the next incomplete goals only.
- Goal rewards no longer grant credits.
- MVP rewards are comfort, visual unlock flags, resident unlock progress or temporary bonuses.
- A completed goal must not be claimable multiple times.

Initial MVP reward direction:

| Goal | Reward Direction |
|---|---|
| `buy_capsule_10` | Comfort + capsule detail unlock. |
| `unlock_kitchen` | Comfort + kitchen detail unlock. |
| `reach_comfort_25` | Temporary income boost or visual comfort detail. |
| `earn_credits_10000` | Reputation hint / prestige education, no direct credits. |
| `unlock_three_residents` | Comfort + resident scene details. |
| `unlock_panorama_dome` | Panorama visual detail unlock. |
| `first_renovation` | Reputation loop acknowledgement. |

## Data And Architecture

Keep the existing boundary:

```text
GameState -> React layout/state -> PixiStationScene props -> station room renderer
```

Recommended additions:

- `src/station/roomScenes.ts` for pure room descriptors and detail tiers.
- `createRoomSceneDescriptor(gameState, selectedRoomId)` or equivalent pure helper.
- `getVisibleGoals(gameState)` and `completeEligibleGoals(gameState)` in domain logic.
- UI-owned selected room state, because room selection is presentation state and should not affect economy.

Economy must not import React or Pixi. Pixi must not mutate goals, credits, comfort or module levels.

## Testing

Add tests before production code:

- room descriptor covers all module ids;
- locked rooms are disabled in selector data;
- detail tiers change at levels `1`, `10`, `25`, `50`, `100`;
- successful module purchase can drive selected room to the purchased module through UI/action tests;
- goal completion marks eligible goals once;
- completed goals are excluded from visible goals;
- goal completion does not add credits.

Visual verification after implementation:

- mobile `390x844`: room scene is nonblank and selector is tappable;
- desktop `1366x768`: room scene is framed and does not overlap side panels;
- buying a level switches to that room;
- completed goals disappear from the active list.

## Out Of Scope

- Full resident animations for every room.
- Multiple simultaneous room canvases.
- Drag/pan station map.
- Complex quest chains.
- Credit rewards from goals.

