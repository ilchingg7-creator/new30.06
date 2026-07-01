# Sequenced Gameplay Direction Design

## Context

The current game is no longer blocked by missing systems. It already has room
scenes, goals, residents, visitors, achievements, daily rewards, prestige
upgrades, cosmetics and an active room-click action.

The design problem is that these systems do not yet form one clear player
rhythm. The player can buy rooms and watch numbers grow, but the game does not
consistently answer three questions:

- What should I do next?
- Why does that action matter?
- How will the station visibly or socially change after I do it?

This spec fixes the direction by developing the game in three deliberate
passes. Each pass must be useful on its own and must not require the next pass
to feel complete.

## Chosen Sequence

Build the next design layer in this order:

1. Station Director / next action guidance.
2. Resident stories and room-linked events.
3. Room condition and repair detail loop.

The first pass is required before the other two. Residents and room detail can
add charm, but without clear next-action guidance they would increase content
volume without fixing the player's main uncertainty.

## Pass 1: Station Director

Goal: make the player always understand the next useful action.

The Station Director is a pure game-domain guidance layer derived from
`GameState`. It does not mutate the economy. It selects one current focus and
turns existing state into readable guidance for the UI.

It should answer:

- the best next module to buy or upgrade;
- whether the player can afford it now;
- if not affordable, the approximate wait time at current income;
- the most relevant active goal;
- the room that should be focused visually;
- whether a visitor, daily reward or prestige action should temporarily take
  priority.

Recommended priority order:

1. Time-limited visitor if present and affordable.
2. Claimable daily reward dialog if present.
3. First incomplete goal that is close to completion.
4. Next affordable meaningful room upgrade.
5. Next locked room with clear unlock cost.
6. First prestige education when the player approaches the intended threshold.

The Director should not become a tutorial script. It is an advisor for the
current state, not a forced quest chain.

### UI Result

Desktop and mobile should both show a compact "current station task" area near
the top of the main loop. It should use the same data on both layouts, but can
be placed differently:

- desktop: above or beside the room scene, near the module list;
- mobile: under the top bar and above the room scene or room selector.

The panel should include:

- short action title;
- one sentence of why it matters;
- cost or progress;
- direct action affordance when possible, such as selecting the target room.

It should not replace the goals panel. Goals remain the longer checklist.

## Pass 2: Resident Stories

Goal: make residents feel like station inhabitants rather than unlock badges.

After next-action guidance is stable, residents should become the main source
of cozy-comedy flavor. A resident story is a small state-derived moment tied to
one room, one requirement and one payoff.

Examples:

- Sleepy Engineer asks for a quieter tenant capsule upgrade.
- Mist Cook wants the kitchen to reach a working tier.
- Vacuum Gardener wants the oxygen garden unlocked before a plant can survive.
- Sock Master complains when laundry is not upgraded enough.

Resident stories should be lightweight:

- no branching dialogue trees in the next pass;
- no inventory system;
- no long text in Pixi;
- one clear requirement and one small reward or flavor reveal.

Stories may reuse the visitor dialog pattern, but resident events should be
less random than visitors. They should appear because the player's station
state makes them relevant.

## Pass 3: Room Condition And Repair Detail

Goal: make each room scene show a more specific kind of progress.

Room scenes already have detail tiers. This pass gives those tiers more meaning
by adding condition beats: small visible problems, repairs and cozy upgrades.

Examples:

- tenant capsule: flickering lamp, patched wall, stable warm lamp;
- kitchen: cold kettle, repaired stove, soup pot and clean table;
- oxygen garden: weak sprout, working plant rack, full green dome;
- laundry: loose sock cloud, working washer, tidy floating line.

The room-click action can become an active "help the room" interaction, but it
must remain simple. It should not become a separate action economy before the
main incremental loop is clear.

## Architecture

Pass 1 should introduce a small pure domain module rather than adding more
logic to `useGameState.ts`.

Recommended files:

- `src/game/stationDirector.ts`: derives guidance from `GameState`;
- `src/game/stationDirector.test.ts`: verifies priority and recommendations;
- `src/ui/components/StationTaskPanel.tsx`: renders the current guidance;
- `src/platform/i18n.ts`: adds short localized UI copy;
- `src/ui/layouts/DesktopLayout.tsx`: places the panel for desktop;
- `src/ui/layouts/MobileLayout.tsx`: places the panel for mobile.

`useGameState.ts` should pass state and actions into the new component, but it
should not own the recommendation rules.

Pass 2 will use these implementation boundaries when it becomes active scope:

- `src/game/residentStories.ts`;
- resident story tests;
- a compact resident story panel or dialog.

Pass 3 will use these implementation boundaries when it becomes active scope:

- `src/station/roomScenes.ts`;
- room descriptor tests;
- visual verification for desktop and mobile.

## Data Flow

Pass 1 data flow:

```text
GameState + incomePerSecond -> getStationGuidance(...) -> StationTaskPanel -> optional UI action
```

The guidance object should be serializable and independent of React:

```ts
type StationGuidance =
  | {
      kind: 'visitor';
      priority: number;
      titleKey: string;
      bodyKey: string;
      targetRoomId?: ModuleId;
      canActNow: boolean;
    }
  | {
      kind: 'goal';
      priority: number;
      goalId: GoalId;
      targetRoomId?: ModuleId;
      progressCurrent: number;
      progressTarget: number;
    }
  | {
      kind: 'module';
      priority: number;
      moduleId: ModuleId;
      canAfford: boolean;
      cost: number;
      waitSeconds: number;
    }
  | {
      kind: 'prestige';
      priority: number;
      canRenovate: boolean;
      expectedReputation: number;
    };
```

The implementation plan may choose a smaller exact TypeScript shape, but it
must preserve this responsibility split: derive guidance in the domain layer
and perform actions only from UI callbacks.

## UX Rules

- Guidance must never block manual play.
- The player can still buy any available module.
- The panel should be short enough for mobile.
- It must not duplicate the full module card or full goal panel.
- It should select/focus a room before asking the player to upgrade that room.
- It should avoid credit rewards for goals; goals should guide progression and
  give comfort, visual detail, temporary boost or prestige education.

## Testing

Pass 1 needs domain tests before UI work:

- visitor guidance outranks normal upgrades when active and affordable;
- near-complete goals outrank generic module upgrades;
- unaffordable module guidance includes a finite wait time when income is
  positive;
- zero income does not produce invalid wait time;
- selected target room is stable for room-related guidance.

UI tests should verify:

- desktop renders the guidance panel;
- mobile renders the guidance panel without replacing bottom tabs;
- clicking a room-focused guidance action selects the correct room;
- guidance copy uses translations rather than hardcoded visible strings.

## Out Of Scope

- Full quest chains.
- Inventory items.
- Dialogue trees.
- Additional currencies.
- New monetization placements.
- Rebalancing all module costs before the guidance layer is visible.
- Adding room-condition mechanics before Pass 1 is implemented and tested.

## Implementation Boundary

Implementation should begin with Pass 1 only. Pass 2 and Pass 3 are sequenced
direction, not immediate implementation scope.
