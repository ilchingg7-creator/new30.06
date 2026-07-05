# Station Incidents Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Replace blocking resident story popups with a non-blocking station incident journal, backed by a larger cozy-comedy event catalog and visual placeholder unlocks.

**Architecture:** Add pure incident content and state helpers under `src/game`, persist incident fields through the save schema, then expose journal actions from `useGameState`. React components render a journal on desktop/mobile without auto-opening modal dialogs. Room visual placeholder rewards are stored as stable ids and rendered through existing scene primitives.

**Tech Stack:** TypeScript, React, Vitest, Testing Library, PixiJS room scene primitives, existing local/Yandex save pipeline.

## Global Constraints

- Do not revert unrelated dirty files in the workspace.
- Use TDD for every code task: write failing tests, run them red, implement, run green.
- Incidents must not open themselves as modal dialogs.
- Bulk room upgrades must not be interrupted.
- Maximum active unresolved incidents: `3`.
- Maximum newly queued incidents per state update: `1`.
- Active MVP incident definitions: first `10` incidents from `2026-07-05-station-incidents-design.md`.
- Extended event catalog size: `40` incident ids total. Incidents `11-40` are defined as disabled backlog content for now.
- Visual rewards use stable placeholder ids and must persist in save data.
- Legacy `completedStories` saves must continue to parse.

---

## File Structure

- Create `src/game/content/stationIncidents.ts`: incident definitions, first 10 active, remaining 30 disabled backlog.
- Create `src/game/stationIncidents.ts`: pure queue, resolve, selector, and placeholder helpers.
- Modify `src/game/types.ts`: incident ids, categories, triggers, effects, active incident state, `GameState` fields.
- Modify `src/game/save.ts`: schema v3 migration and validation for incident fields while preserving `completedStories`.
- Modify `src/platform/i18n.ts`: journal UI strings and incident localized copy.
- Modify `src/ui/useGameState.ts`: remove active story exposure, queue incidents after state changes, expose `resolveIncident`, `markIncidentsSeen`, `triggerCatIncident`.
- Modify `src/App.tsx`: remove `ResidentStoryDialog` rendering and import.
- Create `src/ui/components/StationIncidentJournal.tsx`: non-blocking journal UI with choices.
- Modify `src/ui/layouts/DesktopLayout.tsx`: render journal in side panel.
- Modify `src/ui/layouts/MobileLayout.tsx`: add compact journal entry point in goals tab.
- Modify `src/ui/components/PixiStationScene.tsx`: notify game state when strange cat is clicked.
- Modify `src/station/roomScenes.ts`: render simple visual placeholders from unlocked incident visual ids.
- Update docs:
  - `docs/game-design/01-core-loop.md`
  - `docs/game-design/03-content-progression.md`
  - `docs/game-design/08-technical-architecture.md`
- Tests:
  - Create `src/test/station-incidents.test.ts`
  - Modify `src/test/save.test.ts`
  - Modify `src/test/components.test.tsx`
  - Modify `src/test/responsive.test.tsx`
  - Modify `src/test/room-scenes.test.ts`

---

### Task 1: Incident Types And Content Catalog

**Files:**
- Modify: `src/game/types.ts`
- Create: `src/game/content/stationIncidents.ts`
- Create: `src/test/station-incidents.test.ts`

**Interfaces:**
- Produces: `StationIncidentId`, `VisualPlaceholderId`, `StationIncidentDefinition`, `StationIncidentChoice`, `StationIncidentEffect`, `ActiveStationIncident`.
- Produces: `stationIncidents: StationIncidentDefinition[]`.
- Produces: `activeStationIncidents: StationIncidentDefinition[]`.

- [x] **Step 1: Write the failing content test**

Add `src/test/station-incidents.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { activeStationIncidents, stationIncidents } from '../game/content/stationIncidents';

describe('station incidents content', () => {
  it('defines a large incident catalog with a focused active MVP slice', () => {
    expect(stationIncidents).toHaveLength(40);
    expect(activeStationIncidents).toHaveLength(10);
  });

  it('gives active incidents at least two choices', () => {
    for (const incident of activeStationIncidents) {
      expect(incident.choices.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('uses stable placeholders for active visual rewards', () => {
    const visualEffects = activeStationIncidents.flatMap((incident) =>
      incident.choices.flatMap((choice) => choice.effects.visualPlaceholderIds ?? [])
    );

    expect(visualEffects).toContain('kitchen_mist_patch_01');
    expect(visualEffects).toContain('cat_saucer_01');
    expect(new Set(visualEffects).size).toBe(visualEffects.length);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npm.cmd test -- src/test/station-incidents.test.ts`

Expected: FAIL because `../game/content/stationIncidents` does not exist.

- [x] **Step 3: Add incident types**

Modify `src/game/types.ts` after `ActiveResidentStory`:

```ts
export type StationIncidentId =
  | 'kitchen_borscht_fog'
  | 'capsule_snore_echo'
  | 'laundry_sock_orbit'
  | 'garden_first_sprout_vote'
  | 'teleport_wrong_parcel'
  | 'renovation_cold_floor'
  | 'condition_warning_light'
  | 'cat_found_warm_pipe'
  | 'kitchen_garden_soup'
  | 'high_income_low_comfort_meeting'
  | 'capsule_window_frost'
  | 'kitchen_spoon_union'
  | 'garden_plant_listens_radio'
  | 'laundry_static_storm'
  | 'teleport_neighbor_duplicate'
  | 'panorama_star_argument'
  | 'meteorite_pantry_label_mystery'
  | 'maintenance_drones_form_committee'
  | 'retired_cosmonaut_mug_missing'
  | 'mist_cook_recipe_too_large'
  | 'vacuum_gardener_seed_escape'
  | 'sock_master_invents_calendar'
  | 'courier_delivers_future_notice'
  | 'vip_resident_wants_red_carpet'
  | 'cat_sleeps_on_button'
  | 'cat_brings_space_dust'
  | 'post_renovation_old_wallpaper'
  | 'second_cycle_resident_reunion'
  | 'offline_return_station_smells_like_soup'
  | 'condition_pristine_housewarming'
  | 'comfort_60_station_song'
  | 'teleport_garden_cross_pollination'
  | 'laundry_kitchen_steam_problem'
  | 'capsule_panorama_stargazing'
  | 'economy_kopeks_under_sofa'
  | 'renovation_upgrade_installation_day'
  | 'five_residents_table_argument'
  | 'first_reputation_review'
  | 'panorama_dome_first_date'
  | 'garden_laundry_moss_socks';

export type VisualPlaceholderId =
  | 'kitchen_mist_patch_01'
  | 'capsule_padding_01'
  | 'laundry_sock_cluster_01'
  | 'garden_sprout_label_01'
  | 'teleport_parcel_01'
  | 'capsule_rug_01'
  | 'warning_bulb_01'
  | 'cat_saucer_01'
  | 'kitchen_soup_pot_01'
  | 'capsule_frost_01'
  | 'kitchen_spoon_bundle_01'
  | 'garden_radio_plant_01'
  | 'laundry_static_socks_01'
  | 'teleport_duplicate_mug_01'
  | 'panorama_star_labels_01'
  | 'pantry_labels_01'
  | 'drone_schedule_board_01'
  | 'cosmonaut_mug_01'
  | 'kitchen_recipe_scroll_01'
  | 'garden_seed_trail_01'
  | 'laundry_sock_calendar_01'
  | 'teleport_future_notice_01'
  | 'vip_towel_carpet_01'
  | 'cat_button_label_01'
  | 'cat_dust_jar_01'
  | 'old_wallpaper_patch_01'
  | 'resident_reunion_table_01'
  | 'soup_smell_note_01'
  | 'housewarming_lamp_01'
  | 'station_song_poster_01'
  | 'teleport_pollen_pot_01'
  | 'steam_towel_hook_01'
  | 'stargazing_blanket_01'
  | 'kopeks_jar_01'
  | 'upgrade_labels_01'
  | 'table_schedule_01'
  | 'reputation_review_frame_01'
  | 'panorama_reserved_sign_01'
  | 'moss_sock_01';

export type StationIncidentCategory =
  | 'resident'
  | 'room'
  | 'combo'
  | 'renovation'
  | 'condition'
  | 'cat'
  | 'economy';

export type StationIncidentTrigger =
  | { kind: 'roomOpened'; roomId: ModuleId }
  | { kind: 'residentUnlocked'; residentId: ResidentId }
  | { kind: 'renovationCompleted'; minPrestigeCount: number }
  | { kind: 'roomConditionBelow'; roomId?: ModuleId; threshold: number }
  | { kind: 'roomComboAvailable'; roomIds: ModuleId[] }
  | { kind: 'comfortIncomeMismatch'; minIncomePerSecond: number; maxComfort: number }
  | { kind: 'sceneInteraction'; interactionId: 'strange_cat' }
  | { kind: 'idleReturn'; minSeconds: number };

export interface StationIncidentEffect {
  comfortDelta?: number;
  creditsDelta?: number;
  conditionRepair?: Partial<Record<ModuleId, number>>;
  timedBonus?: TimedBonus;
  visualPlaceholderIds?: VisualPlaceholderId[];
}

export interface StationIncidentChoice {
  id: string;
  effects: StationIncidentEffect;
}

export interface StationIncidentDefinition {
  id: StationIncidentId;
  category: StationIncidentCategory;
  priority: number;
  enabled: boolean;
  repeatable: boolean;
  trigger: StationIncidentTrigger;
  choices: StationIncidentChoice[];
}

export interface ActiveStationIncident {
  id: StationIncidentId;
  queuedAt: number;
  isNew: boolean;
}
```

Extend `GameState` near `completedStories`:

```ts
  /** Active non-blocking station incidents shown in the journal. */
  activeIncidents?: ActiveStationIncident[];
  /** Completed non-repeatable station incident IDs. */
  completedIncidents?: StationIncidentId[];
  /** Stable visual placeholder rewards unlocked by incident choices. */
  unlockedIncidentVisuals?: VisualPlaceholderId[];
```

- [x] **Step 4: Add content definitions**

Create `src/game/content/stationIncidents.ts`:

```ts
import type { StationIncidentDefinition } from '../types';

const disabledBacklog = [
  ['capsule_window_frost', 'capsule_frost_01'],
  ['kitchen_spoon_union', 'kitchen_spoon_bundle_01'],
  ['garden_plant_listens_radio', 'garden_radio_plant_01'],
  ['laundry_static_storm', 'laundry_static_socks_01'],
  ['teleport_neighbor_duplicate', 'teleport_duplicate_mug_01'],
  ['panorama_star_argument', 'panorama_star_labels_01'],
  ['meteorite_pantry_label_mystery', 'pantry_labels_01'],
  ['maintenance_drones_form_committee', 'drone_schedule_board_01'],
  ['retired_cosmonaut_mug_missing', 'cosmonaut_mug_01'],
  ['mist_cook_recipe_too_large', 'kitchen_recipe_scroll_01'],
  ['vacuum_gardener_seed_escape', 'garden_seed_trail_01'],
  ['sock_master_invents_calendar', 'laundry_sock_calendar_01'],
  ['courier_delivers_future_notice', 'teleport_future_notice_01'],
  ['vip_resident_wants_red_carpet', 'vip_towel_carpet_01'],
  ['cat_sleeps_on_button', 'cat_button_label_01'],
  ['cat_brings_space_dust', 'cat_dust_jar_01'],
  ['post_renovation_old_wallpaper', 'old_wallpaper_patch_01'],
  ['second_cycle_resident_reunion', 'resident_reunion_table_01'],
  ['offline_return_station_smells_like_soup', 'soup_smell_note_01'],
  ['condition_pristine_housewarming', 'housewarming_lamp_01'],
  ['comfort_60_station_song', 'station_song_poster_01'],
  ['teleport_garden_cross_pollination', 'teleport_pollen_pot_01'],
  ['laundry_kitchen_steam_problem', 'steam_towel_hook_01'],
  ['capsule_panorama_stargazing', 'stargazing_blanket_01'],
  ['economy_kopeks_under_sofa', 'kopeks_jar_01'],
  ['renovation_upgrade_installation_day', 'upgrade_labels_01'],
  ['five_residents_table_argument', 'table_schedule_01'],
  ['first_reputation_review', 'reputation_review_frame_01'],
  ['panorama_dome_first_date', 'panorama_reserved_sign_01'],
  ['garden_laundry_moss_socks', 'moss_sock_01']
] as const;

export const stationIncidents: StationIncidentDefinition[] = [
  {
    id: 'kitchen_borscht_fog',
    category: 'room',
    priority: 80,
    enabled: true,
    repeatable: false,
    trigger: { kind: 'roomOpened', roomId: 'cosmo_kitchen' },
    choices: [
      { id: 'vent_fog', effects: { conditionRepair: { cosmo_kitchen: 8 }, visualPlaceholderIds: ['kitchen_mist_patch_01'] } },
      { id: 'keep_aroma', effects: { comfortDelta: 2 } }
    ]
  },
  {
    id: 'capsule_snore_echo',
    category: 'condition',
    priority: 75,
    enabled: true,
    repeatable: false,
    trigger: { kind: 'roomConditionBelow', roomId: 'tenant_capsule', threshold: 60 },
    choices: [
      { id: 'install_padding', effects: { creditsDelta: -120, conditionRepair: { tenant_capsule: 10 }, visualPlaceholderIds: ['capsule_padding_01'] } },
      { id: 'quiet_hours', effects: { comfortDelta: 2 } }
    ]
  },
  {
    id: 'laundry_sock_orbit',
    category: 'room',
    priority: 72,
    enabled: true,
    repeatable: false,
    trigger: { kind: 'roomOpened', roomId: 'zero_g_laundry' },
    choices: [
      { id: 'catch_socks', effects: { comfortDelta: 2, visualPlaceholderIds: ['laundry_sock_cluster_01'] } },
      { id: 'ask_sock_master', effects: { conditionRepair: { zero_g_laundry: 8 } } }
    ]
  },
  {
    id: 'garden_first_sprout_vote',
    category: 'room',
    priority: 70,
    enabled: true,
    repeatable: false,
    trigger: { kind: 'roomOpened', roomId: 'oxygen_garden' },
    choices: [
      { id: 'name_sprout', effects: { comfortDelta: 2 } },
      { id: 'build_lamp', effects: { conditionRepair: { oxygen_garden: 8 }, visualPlaceholderIds: ['garden_sprout_label_01'] } }
    ]
  },
  {
    id: 'teleport_wrong_parcel',
    category: 'room',
    priority: 68,
    enabled: true,
    repeatable: false,
    trigger: { kind: 'roomOpened', roomId: 'teleport_entry' },
    choices: [
      { id: 'return_parcel', effects: { comfortDelta: 1, visualPlaceholderIds: ['teleport_parcel_01'] } },
      { id: 'open_parcel', effects: { creditsDelta: 250 } }
    ]
  },
  {
    id: 'renovation_cold_floor',
    category: 'renovation',
    priority: 95,
    enabled: true,
    repeatable: false,
    trigger: { kind: 'renovationCompleted', minPrestigeCount: 1 },
    choices: [
      { id: 'insulate_floor', effects: { comfortDelta: 2, visualPlaceholderIds: ['capsule_rug_01'] } },
      { id: 'save_materials', effects: { creditsDelta: 150 } }
    ]
  },
  {
    id: 'condition_warning_light',
    category: 'condition',
    priority: 85,
    enabled: true,
    repeatable: false,
    trigger: { kind: 'roomConditionBelow', threshold: 40 },
    choices: [
      { id: 'repair_now', effects: { creditsDelta: -180, conditionRepair: { tenant_capsule: 8 }, visualPlaceholderIds: ['warning_bulb_01'] } },
      { id: 'label_switch', effects: { comfortDelta: 1 } }
    ]
  },
  {
    id: 'cat_found_warm_pipe',
    category: 'cat',
    priority: 60,
    enabled: true,
    repeatable: false,
    trigger: { kind: 'sceneInteraction', interactionId: 'strange_cat' },
    choices: [
      { id: 'leave_saucer', effects: { comfortDelta: 1, visualPlaceholderIds: ['cat_saucer_01'] } },
      { id: 'mark_pipe', effects: { conditionRepair: { tenant_capsule: 4 } } }
    ]
  },
  {
    id: 'kitchen_garden_soup',
    category: 'combo',
    priority: 66,
    enabled: true,
    repeatable: false,
    trigger: { kind: 'roomComboAvailable', roomIds: ['cosmo_kitchen', 'oxygen_garden'] },
    choices: [
      { id: 'communal_soup', effects: { comfortDelta: 3, visualPlaceholderIds: ['kitchen_soup_pot_01'] } },
      { id: 'sell_recipe', effects: { creditsDelta: 300 } }
    ]
  },
  {
    id: 'high_income_low_comfort_meeting',
    category: 'economy',
    priority: 50,
    enabled: true,
    repeatable: false,
    trigger: { kind: 'comfortIncomeMismatch', minIncomePerSecond: 25, maxComfort: 20 },
    choices: [
      { id: 'fund_tea_break', effects: { creditsDelta: -200, comfortDelta: 3 } },
      { id: 'take_minutes', effects: {} }
    ]
  },
  ...disabledBacklog.map(([id, visualPlaceholderId], index) => ({
    id,
    category: 'room',
    priority: 10 - index,
    enabled: false,
    repeatable: false,
    trigger: { kind: 'roomOpened', roomId: 'tenant_capsule' },
    choices: [
      { id: 'cozy_solution', effects: { comfortDelta: 1, visualPlaceholderIds: [visualPlaceholderId] } },
      { id: 'practical_solution', effects: { conditionRepair: { tenant_capsule: 2 } } }
    ]
  } satisfies StationIncidentDefinition))
];

export const activeStationIncidents = stationIncidents.filter((incident) => incident.enabled);
```

- [x] **Step 5: Run test to verify it passes**

Run: `npm.cmd test -- src/test/station-incidents.test.ts`

Expected: PASS.

- [x] **Step 6: Commit**

```bash
git add -- src/game/types.ts src/game/content/stationIncidents.ts src/test/station-incidents.test.ts
git commit -m "feat: add station incident content catalog"
```

---

### Task 2: Pure Incident Queue And Resolve Logic

**Files:**
- Modify: `src/game/stationIncidents.ts`
- Modify: `src/test/station-incidents.test.ts`

**Interfaces:**
- Consumes: `activeStationIncidents`, `GameState`, `StationIncidentId`.
- Produces: `queueEligibleIncidents(state: GameState, context?: StationIncidentQueueContext): GameState`.
- Produces: `resolveStationIncident(state: GameState, incidentId: StationIncidentId, choiceId: string): GameState`.
- Produces: `markStationIncidentsSeen(state: GameState): GameState`.
- Produces: `getActiveStationIncidents(state: GameState): ActiveStationIncident[]`.
- Produces: `getNewStationIncidentCount(state: GameState): number`.

- [x] **Step 1: Write failing queue tests**

Append to `src/test/station-incidents.test.ts`:

```ts
import {
  getActiveStationIncidents,
  getNewStationIncidentCount,
  markStationIncidentsSeen,
  queueEligibleIncidents,
  resolveStationIncident
} from '../game/stationIncidents';
import { createInitialState } from '../game/economy';
import type { GameState } from '../game/types';

describe('station incident state', () => {
  it('queues at most one eligible incident per state update', () => {
    const base = createInitialState(1_000);
    const state: GameState = {
      ...base,
      moduleLevels: {
        ...base.moduleLevels,
        cosmo_kitchen: 1,
        oxygen_garden: 1,
        zero_g_laundry: 1
      }
    };

    const queued = queueEligibleIncidents(state, { now: 10_000 });

    expect(getActiveStationIncidents(queued)).toHaveLength(1);
    expect(getNewStationIncidentCount(queued)).toBe(1);
  });

  it('respects the unresolved incident cap', () => {
    const base = createInitialState(1_000);
    const state: GameState = {
      ...base,
      activeIncidents: [
        { id: 'kitchen_borscht_fog', queuedAt: 1, isNew: true },
        { id: 'laundry_sock_orbit', queuedAt: 2, isNew: true },
        { id: 'garden_first_sprout_vote', queuedAt: 3, isNew: true }
      ],
      moduleLevels: {
        ...base.moduleLevels,
        teleport_entry: 1
      }
    };

    const queued = queueEligibleIncidents(state, { now: 10_000 });

    expect(getActiveStationIncidents(queued)).toHaveLength(3);
  });

  it('resolves an incident choice once and persists visual placeholder rewards', () => {
    const base = createInitialState(1_000);
    const state: GameState = {
      ...base,
      activeIncidents: [{ id: 'kitchen_borscht_fog', queuedAt: 10_000, isNew: true }],
      roomConditions: { cosmo_kitchen: 60 }
    };

    const resolved = resolveStationIncident(state, 'kitchen_borscht_fog', 'vent_fog');

    expect(resolved.activeIncidents).toEqual([]);
    expect(resolved.completedIncidents).toContain('kitchen_borscht_fog');
    expect(resolved.unlockedIncidentVisuals).toContain('kitchen_mist_patch_01');
    expect(resolved.roomConditions?.cosmo_kitchen).toBe(68);
  });

  it('does not return completed non-repeatable incidents', () => {
    const base = createInitialState(1_000);
    const state: GameState = {
      ...base,
      completedIncidents: ['kitchen_borscht_fog'],
      moduleLevels: {
        ...base.moduleLevels,
        cosmo_kitchen: 1
      }
    };

    const queued = queueEligibleIncidents(state, { now: 10_000 });

    expect(getActiveStationIncidents(queued)).toHaveLength(0);
  });

  it('marks new incidents as seen', () => {
    const base = createInitialState(1_000);
    const state: GameState = {
      ...base,
      activeIncidents: [{ id: 'cat_found_warm_pipe', queuedAt: 10_000, isNew: true }]
    };

    const seen = markStationIncidentsSeen(state);

    expect(getNewStationIncidentCount(seen)).toBe(0);
    expect(seen.activeIncidents?.[0]?.isNew).toBe(false);
  });

  it('queues cat incident only from scene interaction context', () => {
    const base = createInitialState(1_000);

    expect(getActiveStationIncidents(queueEligibleIncidents(base, { now: 10_000 }))).toHaveLength(0);

    const queued = queueEligibleIncidents(base, {
      now: 10_000,
      sceneInteractionId: 'strange_cat'
    });

    expect(getActiveStationIncidents(queued)[0]?.id).toBe('cat_found_warm_pipe');
  });
});
```

- [x] **Step 2: Run tests to verify they fail**

Run: `npm.cmd test -- src/test/station-incidents.test.ts`

Expected: FAIL because `../game/stationIncidents` does not exist.

- [x] **Step 3: Implement pure helpers**

Create `src/game/stationIncidents.ts`:

```ts
import { activeStationIncidents } from './content/stationIncidents';
import { calculateIncomePerSecond } from './economy';
import type {
  ActiveStationIncident,
  GameState,
  ModuleId,
  StationIncidentDefinition,
  StationIncidentId
} from './types';

const MAX_ACTIVE_INCIDENTS = 3;
const MAX_NEW_PER_UPDATE = 1;

export interface StationIncidentQueueContext {
  now?: number;
  sceneInteractionId?: 'strange_cat';
}

export function getActiveStationIncidents(state: GameState): ActiveStationIncident[] {
  return state.activeIncidents ?? [];
}

export function getNewStationIncidentCount(state: GameState): number {
  return getActiveStationIncidents(state).filter((incident) => incident.isNew).length;
}

export function markStationIncidentsSeen(state: GameState): GameState {
  const active = getActiveStationIncidents(state);

  if (active.every((incident) => !incident.isNew)) {
    return state;
  }

  return {
    ...state,
    activeIncidents: active.map((incident) => ({ ...incident, isNew: false }))
  };
}

function isRoomOwned(state: GameState, roomId: ModuleId): boolean {
  return (state.moduleLevels[roomId] ?? 0) > 0;
}

function isIncidentAlreadyPresent(state: GameState, definition: StationIncidentDefinition): boolean {
  return getActiveStationIncidents(state).some((incident) => incident.id === definition.id);
}

function isIncidentCompleted(state: GameState, definition: StationIncidentDefinition): boolean {
  return !definition.repeatable && (state.completedIncidents ?? []).includes(definition.id);
}

function hasRoomConditionBelow(state: GameState, roomId: ModuleId | undefined, threshold: number): boolean {
  const entries = Object.entries(state.roomConditions ?? {}) as Array<[ModuleId, number]>;

  if (roomId) {
    return isRoomOwned(state, roomId) && (state.roomConditions?.[roomId] ?? 100) < threshold;
  }

  return entries.some(([id, condition]) => isRoomOwned(state, id) && condition < threshold);
}

function isTriggerMet(
  state: GameState,
  definition: StationIncidentDefinition,
  context: StationIncidentQueueContext
): boolean {
  const trigger = definition.trigger;

  switch (trigger.kind) {
    case 'roomOpened':
      return isRoomOwned(state, trigger.roomId);
    case 'residentUnlocked':
      return state.unlockedResidents.includes(trigger.residentId);
    case 'renovationCompleted':
      return (state.prestigeCount ?? 0) >= trigger.minPrestigeCount;
    case 'roomConditionBelow':
      return hasRoomConditionBelow(state, trigger.roomId, trigger.threshold);
    case 'roomComboAvailable':
      return trigger.roomIds.every((roomId) => isRoomOwned(state, roomId));
    case 'comfortIncomeMismatch':
      return state.comfort <= trigger.maxComfort && calculateIncomePerSecond(state) >= trigger.minIncomePerSecond;
    case 'sceneInteraction':
      return context.sceneInteractionId === trigger.interactionId;
    case 'idleReturn':
      return false;
  }
}

export function queueEligibleIncidents(state: GameState, context: StationIncidentQueueContext = {}): GameState {
  const active = getActiveStationIncidents(state);

  if (active.length >= MAX_ACTIVE_INCIDENTS) {
    return state;
  }

  const now = context.now ?? Date.now();
  const slots = Math.min(MAX_NEW_PER_UPDATE, MAX_ACTIVE_INCIDENTS - active.length);
  const eligible = activeStationIncidents
    .filter((definition) => !isIncidentAlreadyPresent(state, definition))
    .filter((definition) => !isIncidentCompleted(state, definition))
    .filter((definition) => isTriggerMet(state, definition, context))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, slots);

  if (eligible.length === 0) {
    return state;
  }

  return {
    ...state,
    activeIncidents: [
      ...active,
      ...eligible.map((definition) => ({
        id: definition.id,
        queuedAt: now,
        isNew: true
      }))
    ]
  };
}

function findDefinition(incidentId: StationIncidentId): StationIncidentDefinition | undefined {
  return activeStationIncidents.find((definition) => definition.id === incidentId);
}

function addUnique<T extends string>(current: T[] | undefined, next: T[]): T[] {
  return Array.from(new Set([...(current ?? []), ...next]));
}

export function resolveStationIncident(
  state: GameState,
  incidentId: StationIncidentId,
  choiceId: string
): GameState {
  const active = getActiveStationIncidents(state);

  if (!active.some((incident) => incident.id === incidentId)) {
    return state;
  }

  const definition = findDefinition(incidentId);
  const choice = definition?.choices.find((candidate) => candidate.id === choiceId);

  if (!definition || !choice) {
    return state;
  }

  const effect = choice.effects;
  const nextRoomConditions = { ...(state.roomConditions ?? {}) };

  for (const [roomId, repair] of Object.entries(effect.conditionRepair ?? {}) as Array<[ModuleId, number]>) {
    nextRoomConditions[roomId] = Math.min(100, (nextRoomConditions[roomId] ?? 60) + repair);
  }

  return {
    ...state,
    credits: Math.max(0, state.credits + (effect.creditsDelta ?? 0)),
    comfort: Math.max(0, state.comfort + (effect.comfortDelta ?? 0)),
    roomConditions: Object.keys(nextRoomConditions).length > 0 ? nextRoomConditions : state.roomConditions,
    activeIncidents: active.filter((incident) => incident.id !== incidentId),
    completedIncidents: addUnique(state.completedIncidents, [incidentId]),
    unlockedIncidentVisuals: addUnique(state.unlockedIncidentVisuals, effect.visualPlaceholderIds ?? []),
    timedBonuses: effect.timedBonus ? [...state.timedBonuses, effect.timedBonus] : state.timedBonuses
  };
}
```

- [x] **Step 4: Run tests to verify they pass**

Run: `npm.cmd test -- src/test/station-incidents.test.ts`

Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add -- src/game/stationIncidents.ts src/test/station-incidents.test.ts
git commit -m "feat: add station incident state engine"
```

---

### Task 3: Save Schema V3 For Incident State

**Files:**
- Modify: `src/game/save.ts`
- Modify: `src/test/save.test.ts`

**Interfaces:**
- Consumes: `StationIncidentId`, `VisualPlaceholderId`, `ActiveStationIncident`.
- Produces: parse/serialize support for `activeIncidents`, `completedIncidents`, `unlockedIncidentVisuals`.
- Preserves: legacy `completedStories` validation.

- [x] **Step 1: Write failing save tests**

Append to `src/test/save.test.ts`:

```ts
it('round-trips station incident state', () => {
  const state = {
    ...createInitialState(1_000),
    activeIncidents: [{ id: 'kitchen_borscht_fog' as const, queuedAt: 123, isNew: true }],
    completedIncidents: ['cat_found_warm_pipe' as const],
    unlockedIncidentVisuals: ['cat_saucer_01' as const]
  };

  const parsed = parseGameState(serializeGameState(state));

  expect(parsed?.activeIncidents).toEqual(state.activeIncidents);
  expect(parsed?.completedIncidents).toEqual(state.completedIncidents);
  expect(parsed?.unlockedIncidentVisuals).toEqual(state.unlockedIncidentVisuals);
});

it('keeps legacy completedStories saves valid when migrating to incident schema', () => {
  const legacy = {
    ...createInitialState(1_000),
    schemaVersion: 2,
    completedStories: ['engineer_quiet_capsule']
  };

  const parsed = parseGameState(JSON.stringify(legacy));

  expect(parsed?.completedStories).toEqual(['engineer_quiet_capsule']);
  expect(parsed?.activeIncidents).toEqual([]);
  expect(parsed?.completedIncidents).toEqual([]);
  expect(parsed?.unlockedIncidentVisuals).toEqual([]);
});
```

- [x] **Step 2: Run tests to verify they fail**

Run: `npm.cmd test -- src/test/save.test.ts`

Expected: FAIL because v2 migration does not backfill incident fields and validation does not accept them.

- [x] **Step 3: Update save validation and migration**

Modify `src/game/save.ts`:

```ts
export const CURRENT_SCHEMA_VERSION = 3;
```

Add valid sets:

```ts
const VALID_STATION_INCIDENT_IDS = new Set([
  'kitchen_borscht_fog',
  'capsule_snore_echo',
  'laundry_sock_orbit',
  'garden_first_sprout_vote',
  'teleport_wrong_parcel',
  'renovation_cold_floor',
  'condition_warning_light',
  'cat_found_warm_pipe',
  'kitchen_garden_soup',
  'high_income_low_comfort_meeting',
  'capsule_window_frost',
  'kitchen_spoon_union',
  'garden_plant_listens_radio',
  'laundry_static_storm',
  'teleport_neighbor_duplicate',
  'panorama_star_argument',
  'meteorite_pantry_label_mystery',
  'maintenance_drones_form_committee',
  'retired_cosmonaut_mug_missing',
  'mist_cook_recipe_too_large',
  'vacuum_gardener_seed_escape',
  'sock_master_invents_calendar',
  'courier_delivers_future_notice',
  'vip_resident_wants_red_carpet',
  'cat_sleeps_on_button',
  'cat_brings_space_dust',
  'post_renovation_old_wallpaper',
  'second_cycle_resident_reunion',
  'offline_return_station_smells_like_soup',
  'condition_pristine_housewarming',
  'comfort_60_station_song',
  'teleport_garden_cross_pollination',
  'laundry_kitchen_steam_problem',
  'capsule_panorama_stargazing',
  'economy_kopeks_under_sofa',
  'renovation_upgrade_installation_day',
  'five_residents_table_argument',
  'first_reputation_review',
  'panorama_dome_first_date',
  'garden_laundry_moss_socks'
]);

const VALID_INCIDENT_VISUAL_PLACEHOLDER_IDS = new Set([
  'kitchen_mist_patch_01',
  'capsule_padding_01',
  'laundry_sock_cluster_01',
  'garden_sprout_label_01',
  'teleport_parcel_01',
  'capsule_rug_01',
  'warning_bulb_01',
  'cat_saucer_01',
  'kitchen_soup_pot_01',
  'capsule_frost_01',
  'kitchen_spoon_bundle_01',
  'garden_radio_plant_01',
  'laundry_static_socks_01',
  'teleport_duplicate_mug_01',
  'panorama_star_labels_01',
  'pantry_labels_01',
  'drone_schedule_board_01',
  'cosmonaut_mug_01',
  'kitchen_recipe_scroll_01',
  'garden_seed_trail_01',
  'laundry_sock_calendar_01',
  'teleport_future_notice_01',
  'vip_towel_carpet_01',
  'cat_button_label_01',
  'cat_dust_jar_01',
  'old_wallpaper_patch_01',
  'resident_reunion_table_01',
  'soup_smell_note_01',
  'housewarming_lamp_01',
  'station_song_poster_01',
  'teleport_pollen_pot_01',
  'steam_towel_hook_01',
  'stargazing_blanket_01',
  'kopeks_jar_01',
  'upgrade_labels_01',
  'table_schedule_01',
  'reputation_review_frame_01',
  'panorama_reserved_sign_01',
  'moss_sock_01'
]);
```

Add validators:

```ts
function hasOptionalActiveIncidents(value: unknown): boolean {
  if (value === undefined) {
    return true;
  }

  return (
    Array.isArray(value) &&
    value.every((incident) => {
      return (
        isRecord(incident) &&
        typeof incident.id === 'string' &&
        VALID_STATION_INCIDENT_IDS.has(incident.id) &&
        isNumber(incident.queuedAt) &&
        typeof incident.isNew === 'boolean'
      );
    })
  );
}

function hasOptionalIncidentIds(value: unknown): boolean {
  if (value === undefined) {
    return true;
  }

  return isStringArray(value) && value.every((id) => VALID_STATION_INCIDENT_IDS.has(id));
}

function hasOptionalIncidentVisuals(value: unknown): boolean {
  if (value === undefined) {
    return true;
  }

  return isStringArray(value) && value.every((id) => VALID_INCIDENT_VISUAL_PLACEHOLDER_IDS.has(id));
}
```

Add migration:

```ts
function migrateV2ToV3(value: UnknownRecord): UnknownRecord {
  return {
    ...value,
    schemaVersion: 3,
    activeIncidents: value.activeIncidents ?? [],
    completedIncidents: value.completedIncidents ?? [],
    unlockedIncidentVisuals: value.unlockedIncidentVisuals ?? []
  };
}
```

Update `migrateGameState`:

```ts
  if (startVersion < 3) {
    current = migrateV2ToV3(current);
  }
```

Update `isGameStateShape`:

```ts
    hasOptionalActiveIncidents(value.activeIncidents) &&
    hasOptionalIncidentIds(value.completedIncidents) &&
    hasOptionalIncidentVisuals(value.unlockedIncidentVisuals) &&
```

- [x] **Step 4: Run save tests**

Run: `npm.cmd test -- src/test/save.test.ts`

Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add -- src/game/save.ts src/test/save.test.ts
git commit -m "feat: persist station incidents"
```

---

### Task 4: Hook Integration Without Story Modals

**Files:**
- Modify: `src/ui/useGameState.ts`
- Modify: `src/App.tsx`
- Modify: `src/test/components.test.tsx`

**Interfaces:**
- Consumes: `queueEligibleIncidents`, `resolveStationIncident`, `markStationIncidentsSeen`.
- Produces in `UseGameStateResult`:
  - `resolveIncident(incidentId: StationIncidentId, choiceId: string): void`
  - `markIncidentsSeen(): void`
  - `triggerCatIncident(): void`
  - `newIncidentCount: number`
- Removes normal app usage of `activeStory`, `storyDismissed`, `dismissStory`.

- [x] **Step 1: Write failing UI/hook boundary test**

In `src/test/components.test.tsx`, add a smoke assertion to the existing app/component area after rendering layouts with `PrestigePanel`:

```ts
expect(screen.queryByRole('dialog', { name: t.storyTitle })).toBeNull();
```

Add a focused test for the journal once Task 5 creates the component. For this task, the red check is TypeScript: `UseGameStateResult` still exposes story fields and `App` still renders `ResidentStoryDialog`.

- [x] **Step 2: Run typecheck to verify current app still has story flow**

Run: `npx.cmd tsc --noEmit`

Expected before edits: PASS, but `rg -n "ResidentStoryDialog|activeStory|storyDismissed|dismissStory" src` shows the old flow remains.

- [x] **Step 3: Integrate incident queueing**

Modify `src/ui/useGameState.ts` imports:

```ts
import type { GameState, ModuleId, PrestigeUpgradeId, ResidentId, StationIncidentId, WindowLightColor } from '../game/types';
import {
  getNewStationIncidentCount,
  markStationIncidentsSeen,
  queueEligibleIncidents,
  resolveStationIncident
} from '../game/stationIncidents';
```

Remove:

```ts
import type { ActiveResidentStory } from '../game/types';
import { getActiveResidentStory } from '../game/residentStories';
```

Update `UseGameStateResult`:

```ts
  resolveIncident(incidentId: StationIncidentId, choiceId: string): void;
  markIncidentsSeen(): void;
  triggerCatIncident(): void;
  newIncidentCount: number;
```

Remove:

```ts
  activeStory: ActiveResidentStory | null;
  storyDismissed: boolean;
  dismissStory(): void;
```

Remove local state:

```ts
const [storyDismissed, setStoryDismissed] = useState(false);
```

Replace the story reset effect with only selected-room resolution:

```ts
  useEffect(() => {
    setSelectedRoomId((current) => resolveSelectedRoomId(gameState, current));
  }, [gameState]);
```

Wrap state changes that can produce incidents:

```ts
function withQueuedIncidents(state: GameState): GameState {
  return queueEligibleIncidents(state);
}
```

Use it in major update paths:

```ts
const next = withQueuedIncidents(buyModuleLevel(current, moduleId));
```

```ts
return withQueuedIncidents(maybeCreateCommunalDuty(advanceGame(current, 1)));
```

```ts
return withQueuedIncidents(decayRoomConditions(current));
```

```ts
const next = withQueuedIncidents(performPrestige(current));
```

Add actions:

```ts
const resolveIncident = useCallback((incidentId: StationIncidentId, choiceId: string) => {
  setGameState((current) => queueEligibleIncidents(resolveStationIncident(current, incidentId, choiceId)));
  playSound('reward');
}, []);

const markIncidentsSeen = useCallback(() => {
  setGameState((current) => markStationIncidentsSeen(current));
}, []);

const triggerCatIncident = useCallback(() => {
  setGameState((current) => queueEligibleIncidents(current, {
    sceneInteractionId: 'strange_cat'
  }));
}, []);
```

Return:

```ts
    resolveIncident,
    markIncidentsSeen,
    triggerCatIncident,
    newIncidentCount: getNewStationIncidentCount(gameState)
```

- [x] **Step 4: Remove story modal rendering from app**

Modify `src/App.tsx`:

Remove import:

```ts
import { ResidentStoryDialog } from './ui/screens/ResidentStoryDialog';
```

Remove the render block:

```tsx
      {game.activeStory && (
        <ResidentStoryDialog
          story={game.activeStory}
          t={t}
          onGotoRoom={() => {
            game.selectRoom(game.activeStory!.roomId);
            game.dismissStory();
          }}
          onDismiss={game.dismissStory}
        />
      )}
```

- [x] **Step 5: Run verification**

Run:

```bash
npx.cmd tsc --noEmit
npm.cmd test -- src/test/station-incidents.test.ts src/test/components.test.tsx
```

Expected: PASS.

- [x] **Step 6: Commit**

```bash
git add -- src/ui/useGameState.ts src/App.tsx src/test/components.test.tsx
git commit -m "feat: queue station incidents in game state"
```

---

### Task 5: Non-Blocking Incident Journal UI

**Files:**
- Create: `src/ui/components/StationIncidentJournal.tsx`
- Modify: `src/platform/i18n.ts`
- Modify: `src/ui/layouts/DesktopLayout.tsx`
- Modify: `src/ui/layouts/MobileLayout.tsx`
- Modify: `src/test/components.test.tsx`
- Modify: `src/test/responsive.test.tsx`

**Interfaces:**
- Consumes: `game.gameState.activeIncidents`, `game.resolveIncident`, `game.markIncidentsSeen`, `game.newIncidentCount`.
- Produces: journal UI with no modal role and explicit choice buttons.

- [x] **Step 1: Write failing component tests**

Append to `src/test/components.test.tsx`:

```tsx
import { StationIncidentJournal } from '../ui/components/StationIncidentJournal';

it('renders station incidents as a non-blocking journal with choices', () => {
  const onResolve = vi.fn();
  const onSeen = vi.fn();
  const gameState: GameState = {
    ...createInitialState(1_000),
    activeIncidents: [{ id: 'kitchen_borscht_fog', queuedAt: 10_000, isNew: true }]
  };

  render(
    <StationIncidentJournal
      gameState={gameState}
      newIncidentCount={1}
      onResolve={onResolve}
      onMarkSeen={onSeen}
      t={t}
    />
  );

  expect(screen.getByText(t.incidentJournalTitle)).toBeInTheDocument();
  expect(screen.getByText(t.incidents.kitchen_borscht_fog.title)).toBeInTheDocument();
  expect(screen.queryByRole('dialog')).toBeNull();

  fireEvent.click(screen.getByRole('button', { name: t.incidents.kitchen_borscht_fog.choices.vent_fog.label }));

  expect(onResolve).toHaveBeenCalledWith('kitchen_borscht_fog', 'vent_fog');
});
```

- [x] **Step 2: Run component test to verify it fails**

Run: `npm.cmd test -- src/test/components.test.tsx`

Expected: FAIL because `StationIncidentJournal` and translation fields do not exist.

- [x] **Step 3: Add translations**

Modify `Translation` in `src/platform/i18n.ts`:

```ts
  incidentJournalTitle: string;
  incidentJournalNew: string;
  incidentJournalEmpty: string;
  incidentJournalCompleted: string;
  incidentVisualReward: string;
  incidents: Record<string, {
    title: string;
    body: string;
    choices: Record<string, { label: string; description: string }>;
  }>;
```

Add Russian strings:

```ts
  incidentJournalTitle: 'Журнал происшествий',
  incidentJournalNew: 'Новые',
  incidentJournalEmpty: 'На станции тихо. Подозрительно тихо.',
  incidentJournalCompleted: 'Решено',
  incidentVisualReward: 'Визуальная деталь',
  incidents: {
    kitchen_borscht_fog: {
      title: 'В кухне завёлся борщевой туман',
      body: 'Туман пахнет обедом и слегка спорит с вентиляцией.',
      choices: {
        vent_fog: { label: 'Проветрить через шлюз', description: '+состояние кухни, деталь тумана' },
        keep_aroma: { label: 'Оставить для аромата', description: '+комфорт' }
      }
    }
  }
```

Use this complete `ru.incidents` value:

```ts
  incidents: {
    kitchen_borscht_fog: {
      title: 'В кухне завёлся борщевой туман',
      body: 'Туман пахнет обедом и слегка спорит с вентиляцией.',
      choices: {
        vent_fog: { label: 'Проветрить через шлюз', description: '+состояние кухни, деталь тумана' },
        keep_aroma: { label: 'Оставить для аромата', description: '+комфорт' }
      }
    },
    capsule_snore_echo: {
      title: 'Капсула поймала храп эхом',
      body: 'Сонный инженер уверяет, что это не он, а акустика.',
      choices: {
        install_padding: { label: 'Поставить мягкие панели', description: '-копейки, +состояние капсулы, деталь' },
        quiet_hours: { label: 'Объявить тихий час', description: '+комфорт' }
      }
    },
    laundry_sock_orbit: {
      title: 'Носки вышли на орбиту',
      body: 'Прачечная выглядит как маленькая планетная система.',
      choices: {
        catch_socks: { label: 'Поймать носки сачком', description: '+комфорт, деталь' },
        ask_sock_master: { label: 'Позвать мастера носков', description: '+состояние прачечной' }
      }
    },
    garden_first_sprout_vote: {
      title: 'Первый росток требует имени',
      body: 'Жильцы спорят, можно ли назвать растение Борисом.',
      choices: {
        name_sprout: { label: 'Устроить голосование', description: '+комфорт' },
        build_lamp: { label: 'Поставить лампу роста', description: '+состояние сада, деталь' }
      }
    },
    teleport_wrong_parcel: {
      title: 'Телепорт принёс чужую посылку',
      body: 'На коробке написано: "Если это не вам, значит почти вам".',
      choices: {
        return_parcel: { label: 'Вернуть отправителю', description: '+комфорт, деталь' },
        open_parcel: { label: 'Открыть осторожно', description: '+копейки' }
      }
    },
    renovation_cold_floor: {
      title: 'После реновации пол снова холодный',
      body: 'Станция новая, а тапочки опять улетели.',
      choices: {
        insulate_floor: { label: 'Утеплить капсулу', description: '+комфорт, деталь' },
        save_materials: { label: 'Сохранить материалы', description: '+копейки' }
      }
    },
    condition_warning_light: {
      title: 'Лампочка тревоги моргает слишком уверенно',
      body: 'Никто не помнит, что она означает, но все ходят тише.',
      choices: {
        repair_now: { label: 'Починить сейчас', description: '-копейки, +состояние, деталь' },
        label_switch: { label: 'Подписать выключатель', description: '+комфорт' }
      }
    },
    cat_found_warm_pipe: {
      title: 'Странный кот нашёл тёплую трубу',
      body: 'Кот делает вид, что это его инженерное решение.',
      choices: {
        leave_saucer: { label: 'Оставить блюдце', description: '+комфорт, деталь' },
        mark_pipe: { label: 'Пометить трубу как важную', description: '+состояние капсулы' }
      }
    },
    kitchen_garden_soup: {
      title: 'Кухня и сад изобрели суп',
      body: 'Никто не уверен, кто начал, но пахнет убедительно.',
      choices: {
        communal_soup: { label: 'Сварить общий суп', description: '+комфорт, деталь' },
        sell_recipe: { label: 'Продать рецепт соседям', description: '+копейки' }
      }
    },
    high_income_low_comfort_meeting: {
      title: 'Доход растёт, а чайник грустит',
      body: 'Жильцы намекают, что станция стала эффективной, но не уютной.',
      choices: {
        fund_tea_break: { label: 'Профинансировать чай', description: '-копейки, +комфорт' },
        take_minutes: { label: 'Записать протокол', description: 'память журнала' }
      }
    }
  },
```

Use this complete `en.incidents` value:

```ts
  incidents: {
    kitchen_borscht_fog: {
      title: 'Borscht fog moved into the kitchen',
      body: 'The fog smells like lunch and lightly disagrees with ventilation.',
      choices: {
        vent_fog: { label: 'Vent it through the airlock', description: '+kitchen condition, visual detail' },
        keep_aroma: { label: 'Keep it for aroma', description: '+comfort' }
      }
    },
    capsule_snore_echo: {
      title: 'The capsule caught a snore echo',
      body: 'The Sleepy Engineer insists it is acoustics, not him.',
      choices: {
        install_padding: { label: 'Install soft panels', description: '-kopeks, +capsule condition, detail' },
        quiet_hours: { label: 'Declare quiet hours', description: '+comfort' }
      }
    },
    laundry_sock_orbit: {
      title: 'Socks entered orbit',
      body: 'The laundry now resembles a small planetary system.',
      choices: {
        catch_socks: { label: 'Catch socks with a net', description: '+comfort, detail' },
        ask_sock_master: { label: 'Call the Sock Master', description: '+laundry condition' }
      }
    },
    garden_first_sprout_vote: {
      title: 'The first sprout needs a name',
      body: 'Residents debate whether the plant can be called Boris.',
      choices: {
        name_sprout: { label: 'Hold a vote', description: '+comfort' },
        build_lamp: { label: 'Build a grow lamp', description: '+garden condition, detail' }
      }
    },
    teleport_wrong_parcel: {
      title: 'The teleport brought a wrong parcel',
      body: 'The box says: "If this is not yours, it is almost yours."',
      choices: {
        return_parcel: { label: 'Return to sender', description: '+comfort, detail' },
        open_parcel: { label: 'Open carefully', description: '+kopeks' }
      }
    },
    renovation_cold_floor: {
      title: 'The floor is cold after renovation',
      body: 'The station is new again, but the slippers escaped again.',
      choices: {
        insulate_floor: { label: 'Insulate the capsule', description: '+comfort, detail' },
        save_materials: { label: 'Save materials', description: '+kopeks' }
      }
    },
    condition_warning_light: {
      title: 'The warning light blinks with confidence',
      body: 'Nobody remembers what it means, but everyone walks softer.',
      choices: {
        repair_now: { label: 'Repair now', description: '-kopeks, +condition, detail' },
        label_switch: { label: 'Label the switch', description: '+comfort' }
      }
    },
    cat_found_warm_pipe: {
      title: 'The strange cat found a warm pipe',
      body: 'The cat pretends this was an engineering decision.',
      choices: {
        leave_saucer: { label: 'Leave a saucer', description: '+comfort, detail' },
        mark_pipe: { label: 'Mark pipe as important', description: '+capsule condition' }
      }
    },
    kitchen_garden_soup: {
      title: 'The kitchen and garden invented soup',
      body: 'Nobody knows who started it, but the smell is convincing.',
      choices: {
        communal_soup: { label: 'Cook communal soup', description: '+comfort, detail' },
        sell_recipe: { label: 'Sell the recipe', description: '+kopeks' }
      }
    },
    high_income_low_comfort_meeting: {
      title: 'Income is rising and the kettle is sad',
      body: 'Residents imply the station became efficient, not cozy.',
      choices: {
        fund_tea_break: { label: 'Fund a tea break', description: '-kopeks, +comfort' },
        take_minutes: { label: 'Take meeting notes', description: 'journal memory' }
      }
    }
  },
```

- [x] **Step 4: Add journal component**

Create `src/ui/components/StationIncidentJournal.tsx`:

```tsx
import { BookOpen, Sparkles } from 'lucide-react';
import { activeStationIncidents } from '../../game/content/stationIncidents';
import type { GameState, StationIncidentId } from '../../game/types';
import type { Translation } from '../../platform/i18n';

interface StationIncidentJournalProps {
  gameState: GameState;
  newIncidentCount: number;
  onResolve(incidentId: StationIncidentId, choiceId: string): void;
  onMarkSeen(): void;
  t: Translation;
  variant?: 'default' | 'compact';
}

export function StationIncidentJournal({
  gameState,
  newIncidentCount,
  onResolve,
  onMarkSeen,
  t,
  variant = 'default'
}: StationIncidentJournalProps) {
  const active = gameState.activeIncidents ?? [];

  return (
    <section className={variant === 'compact' ? 'panel incident-journal compact' : 'panel incident-journal'}>
      <header className="panel-header">
        <h2>
          <BookOpen aria-hidden="true" size={18} /> {t.incidentJournalTitle}
        </h2>
        {newIncidentCount > 0 ? (
          <button type="button" className="pill-button" onClick={onMarkSeen}>
            <Sparkles aria-hidden="true" size={14} /> {t.incidentJournalNew}: {newIncidentCount}
          </button>
        ) : null}
      </header>

      {active.length === 0 ? <p className="panel-copy">{t.incidentJournalEmpty}</p> : null}

      <div className="incident-list">
        {active.map((incident) => {
          const definition = activeStationIncidents.find((item) => item.id === incident.id);
          const copy = t.incidents[incident.id];

          if (!definition || !copy) {
            return null;
          }

          return (
            <article className="incident-card" key={incident.id}>
              <strong>{copy.title}</strong>
              <p className="panel-copy">{copy.body}</p>
              <div className="incident-choice-list">
                {definition.choices.map((choice) => {
                  const choiceCopy = copy.choices[choice.id];

                  return (
                    <button
                      type="button"
                      key={choice.id}
                      className="dialog-double"
                      onClick={() => onResolve(incident.id, choice.id)}
                    >
                      <span>{choiceCopy?.label ?? choice.id}</span>
                      <small>{choiceCopy?.description ?? t.reward}</small>
                    </button>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
```

Add CSS in `src/styles/global.css`:

```css
.incident-journal .panel-header {
  align-items: center;
}

.incident-list {
  display: grid;
  gap: 10px;
}

.incident-card {
  display: grid;
  gap: 8px;
  padding: 10px;
  border: 1px solid rgba(194, 230, 218, 0.2);
  border-radius: 8px;
  background: rgba(10, 22, 38, 0.34);
}

.incident-choice-list {
  display: grid;
  gap: 8px;
}

.incident-choice-list button {
  justify-content: space-between;
  text-align: left;
}

.incident-choice-list small {
  color: var(--muted-text);
}
```

- [x] **Step 5: Integrate in layouts**

Modify `src/ui/layouts/DesktopLayout.tsx` imports:

```ts
import { StationIncidentJournal } from '../components/StationIncidentJournal';
```

Render after `GoalPanel`:

```tsx
        <StationIncidentJournal
          gameState={game.gameState}
          newIncidentCount={game.newIncidentCount}
          onResolve={game.resolveIncident}
          onMarkSeen={game.markIncidentsSeen}
          t={t}
        />
```

Modify `src/ui/layouts/MobileLayout.tsx`: import `StationIncidentJournal`, then render in `goals` tab immediately after `GoalPanel`:

```tsx
            <StationIncidentJournal
              gameState={game.gameState}
              newIncidentCount={game.newIncidentCount}
              onResolve={game.resolveIncident}
              onMarkSeen={game.markIncidentsSeen}
              variant="compact"
              t={t}
            />
```

- [x] **Step 6: Run tests**

Run:

```bash
npm.cmd test -- src/test/components.test.tsx src/test/responsive.test.tsx
npx.cmd tsc --noEmit
```

Expected: PASS.

- [x] **Step 7: Commit**

```bash
git add -- src/platform/i18n.ts src/ui/components/StationIncidentJournal.tsx src/ui/layouts/DesktopLayout.tsx src/ui/layouts/MobileLayout.tsx src/styles/global.css src/test/components.test.tsx src/test/responsive.test.tsx
git commit -m "feat: add station incident journal UI"
```

---

### Task 6: Scene Interaction And Visual Placeholders

**Files:**
- Modify: `src/ui/components/PixiStationScene.tsx`
- Modify: `src/station/roomScenes.ts`
- Modify: `src/test/components.test.tsx`
- Modify: `src/test/room-scenes.test.ts`

**Interfaces:**
- Consumes: `game.triggerCatIncident`.
- Produces: `onTenantCatClick?: () => void` prop on `PixiStationScene`.
- Produces: `getIncidentVisualPlaceholdersForRoom(state: GameState, roomId: ModuleId): VisualPlaceholderId[]`.

- [x] **Step 1: Write failing cat interaction test**

Modify existing cat test in `src/test/components.test.tsx`:

```tsx
const onTenantCatClick = vi.fn();
render(
  <PixiStationScene
    gameState={gameState}
    selectedRoomId="tenant_capsule"
    ariaLabel={t.stationView}
    onTenantCatClick={onTenantCatClick}
  />
);

fireEvent.click(screen.getByRole('button', { name: 'strange-cat' }));

expect(onTenantCatClick).toHaveBeenCalledTimes(1);
```

Run: `npm.cmd test -- src/test/components.test.tsx`

Expected: FAIL because prop does not exist or is not called.

- [x] **Step 2: Wire cat click into incident queue**

Modify `PixiStationSceneProps`:

```ts
  onTenantCatClick?: () => void;
```

Modify function signature:

```ts
export function PixiStationScene({ gameState, selectedRoomId, onRoomClick, onTenantCatClick, ariaLabel }: PixiStationSceneProps) {
```

Call inside `handleTenantCatClick` after cooldown starts:

```ts
    onTenantCatClick?.();
```

Pass from layouts:

```tsx
<PixiStationScene
  gameState={game.gameState}
  selectedRoomId={game.selectedRoomId}
  onRoomClick={game.clickRoom}
  onTenantCatClick={game.triggerCatIncident}
  ariaLabel={t.stationView}
/>
```

- [x] **Step 3: Write failing placeholder helper test**

Append to `src/test/room-scenes.test.ts`:

```ts
import { getIncidentVisualPlaceholdersForRoom } from '../station/roomScenes';

it('maps unlocked incident visual placeholders to the selected room', () => {
  const state = {
    ...createInitialState(1_000),
    unlockedIncidentVisuals: ['cat_saucer_01', 'kitchen_mist_patch_01'] as const
  };

  expect(getIncidentVisualPlaceholdersForRoom(state, 'tenant_capsule')).toContain('cat_saucer_01');
  expect(getIncidentVisualPlaceholdersForRoom(state, 'tenant_capsule')).not.toContain('kitchen_mist_patch_01');
  expect(getIncidentVisualPlaceholdersForRoom(state, 'cosmo_kitchen')).toContain('kitchen_mist_patch_01');
});
```

Run: `npm.cmd test -- src/test/room-scenes.test.ts`

Expected: FAIL because helper does not exist.

- [x] **Step 4: Add placeholder mapping and simple rendering**

Modify `src/station/roomScenes.ts`:

```ts
import type { GameState, ModuleId, VisualPlaceholderId } from '../game/types';
```

Add mapping near room constants:

```ts
const INCIDENT_VISUAL_ROOM_MAP: Record<VisualPlaceholderId, ModuleId> = {
  kitchen_mist_patch_01: 'cosmo_kitchen',
  capsule_padding_01: 'tenant_capsule',
  laundry_sock_cluster_01: 'zero_g_laundry',
  garden_sprout_label_01: 'oxygen_garden',
  teleport_parcel_01: 'teleport_entry',
  capsule_rug_01: 'tenant_capsule',
  warning_bulb_01: 'tenant_capsule',
  cat_saucer_01: 'tenant_capsule',
  kitchen_soup_pot_01: 'cosmo_kitchen',
  capsule_frost_01: 'tenant_capsule',
  kitchen_spoon_bundle_01: 'cosmo_kitchen',
  garden_radio_plant_01: 'oxygen_garden',
  laundry_static_socks_01: 'zero_g_laundry',
  teleport_duplicate_mug_01: 'teleport_entry',
  panorama_star_labels_01: 'panorama_dome',
  pantry_labels_01: 'meteorite_pantry',
  drone_schedule_board_01: 'tenant_capsule',
  cosmonaut_mug_01: 'tenant_capsule',
  kitchen_recipe_scroll_01: 'cosmo_kitchen',
  garden_seed_trail_01: 'oxygen_garden',
  laundry_sock_calendar_01: 'zero_g_laundry',
  teleport_future_notice_01: 'teleport_entry',
  vip_towel_carpet_01: 'tenant_capsule',
  cat_button_label_01: 'tenant_capsule',
  cat_dust_jar_01: 'tenant_capsule',
  old_wallpaper_patch_01: 'tenant_capsule',
  resident_reunion_table_01: 'cosmo_kitchen',
  soup_smell_note_01: 'cosmo_kitchen',
  housewarming_lamp_01: 'tenant_capsule',
  station_song_poster_01: 'tenant_capsule',
  teleport_pollen_pot_01: 'oxygen_garden',
  steam_towel_hook_01: 'zero_g_laundry',
  stargazing_blanket_01: 'panorama_dome',
  kopeks_jar_01: 'tenant_capsule',
  upgrade_labels_01: 'tenant_capsule',
  table_schedule_01: 'cosmo_kitchen',
  reputation_review_frame_01: 'tenant_capsule',
  panorama_reserved_sign_01: 'panorama_dome',
  moss_sock_01: 'zero_g_laundry'
};

export function getIncidentVisualPlaceholdersForRoom(state: GameState, roomId: ModuleId): VisualPlaceholderId[] {
  return (state.unlockedIncidentVisuals ?? []).filter((placeholderId) => {
    return INCIDENT_VISUAL_ROOM_MAP[placeholderId] === roomId;
  });
}
```

Add this helper above `buildRoomContainer`:

```ts
function addIncidentVisualPlaceholders(
  container: Container,
  gameState: GameState,
  selectedRoomId: ModuleId
): void {
  const placeholders = getIncidentVisualPlaceholdersForRoom(gameState, selectedRoomId);

  placeholders.forEach((placeholderId, index) => {
    const marker = new Graphics();

    marker.label = `incident-placeholder-${placeholderId}`;
    marker
      .roundRect(132 + index * 34, 318, 24, 18, 5)
      .fill(stationTheme.lampAmber)
      .stroke({ color: stationTheme.softWhite, width: 2, alpha: 0.8 });
    container.addChild(marker);
  });
}
```

Update `buildRoomContainer`:

```ts
export function buildRoomContainer(gameState: GameState, selectedRoomId: ModuleId): Container {
  const descriptor = createRoomSceneDescriptor(gameState, selectedRoomId);
  const container = new Container();
  const spriteAsset = getRoomSpriteAssetDefinition(descriptor.moduleId, getRoomDetailLevel(descriptor.level));

  if (spriteAsset) {
    container.addChild(createRoomSprite(spriteAsset));
    addIncidentVisualPlaceholders(container, gameState, selectedRoomId);

    return container;
  }

  container.addChild(createRoomBackground());
  descriptor.ambientLights.forEach((light) => {
    container.addChild(createAmbientLight(light));
  });
  container.addChild(createRoomShell(descriptor));
  container.addChild(createRoomPlate(descriptor));
  descriptor.props.forEach((prop) => {
    container.addChild(createRoomProp(prop));
  });
  addIncidentVisualPlaceholders(container, gameState, selectedRoomId);

  return container;
}
```

- [x] **Step 5: Run scene tests**

Run:

```bash
npm.cmd test -- src/test/components.test.tsx src/test/room-scenes.test.ts
npx.cmd tsc --noEmit
```

Expected: PASS.

- [x] **Step 6: Commit**

```bash
git add -- src/ui/components/PixiStationScene.tsx src/ui/layouts/DesktopLayout.tsx src/ui/layouts/MobileLayout.tsx src/station/roomScenes.ts src/test/components.test.tsx src/test/room-scenes.test.ts
git commit -m "feat: add incident visual placeholders"
```

---

### Task 7: Legacy Story Cleanup And Docs

**Files:**
- Modify: `src/game/economy.ts`
- Modify: `src/test/resident-stories.test.ts`
- Modify: `docs/game-design/01-core-loop.md`
- Modify: `docs/game-design/03-content-progression.md`
- Modify: `docs/game-design/08-technical-architecture.md`

**Interfaces:**
- Removes active use of `checkResidentStories` from economy mutators.
- Keeps `src/game/residentStories.ts` and `completedStories` for legacy save compatibility.
- Documents incidents as the narrative/event system.

- [x] **Step 1: Write failing regression test for no auto-completed story reward**

Modify `src/test/resident-stories.test.ts`:

```ts
it('does not auto-complete old resident stories through room upgrades after incident migration', () => {
  let state: GameState = {
    ...createInitialState(1_000),
    credits: 1_000_000_000,
    unlockedResidents: ['sleepy_engineer' as const]
  };

  for (let i = 0; i < 15; i += 1) {
    state = buyModuleLevel(state, 'tenant_capsule');
  }

  expect(state.completedStories ?? []).not.toContain('engineer_quiet_capsule');
});
```

Run: `npm.cmd test -- src/test/resident-stories.test.ts`

Expected: FAIL because `buyModuleLevel` still calls `checkResidentStories`.

- [x] **Step 2: Remove economy dependency on old story completion**

Modify `src/game/economy.ts`:

Remove:

```ts
import { checkResidentStories } from './residentStories';
```

Replace these exact return expressions:

```ts
return checkResidentStories(checkResidentUnlocks(checkAchievements(completeEligibleGoals(withCondition))));
```

with:

```ts
return checkResidentUnlocks(checkAchievements(completeEligibleGoals(withCondition)));
```

Replace:

```ts
return advanceCommunalDuty(checkResidentStories(checkResidentUnlocks(checkAchievements(completeEligibleGoals(nextState)))), now);
```

with:

```ts
return advanceCommunalDuty(checkResidentUnlocks(checkAchievements(completeEligibleGoals(nextState))), now);
```

Replace:

```ts
return checkResidentStories(checkResidentUnlocks(checkAchievements(completeEligibleGoals(withCondition))));
```

inside `performPrestige` with:

```ts
return checkResidentUnlocks(checkAchievements(completeEligibleGoals(withCondition)));
```

Replace:

```ts
return checkResidentStories(checkResidentUnlocks(checkAchievements({
  ...state,
  reputation: state.reputation - upgrade.reputationCost,
  purchasedPrestigeUpgrades: [...owned, upgradeId]
})));
```

with:

```ts
return checkResidentUnlocks(checkAchievements({
  ...state,
  reputation: state.reputation - upgrade.reputationCost,
  purchasedPrestigeUpgrades: [...owned, upgradeId]
}));
```

Replace the daily login returned state:

```ts
state: checkResidentStories(checkResidentUnlocks(checkAchievements(completeEligibleGoals(nextState)))),
```

with:

```ts
state: checkResidentUnlocks(checkAchievements(completeEligibleGoals(nextState))),
```

Do not delete `src/game/residentStories.ts`; save parsing still knows legacy ids.

- [x] **Step 3: Update docs**

Add to `docs/game-design/01-core-loop.md`:

```md
## Station Incidents

Narrative events are non-blocking station incidents. They appear in a journal
and never interrupt bulk room upgrades with modal popups. Room level can be a
supporting condition, but the main triggers are room openings, residents,
renovations, condition, room combos, offline return and scene interactions.
```

Add to `docs/game-design/03-content-progression.md`:

```md
Station incident content starts with 40 ids. The first 10 are active MVP
incidents; the remaining 30 are disabled backlog entries with stable ids and
visual placeholder ids.
```

Add to `docs/game-design/08-technical-architecture.md`:

```md
`src/game/stationIncidents.ts` owns pure incident queueing and resolving.
`src/game/content/stationIncidents.ts` owns definitions. React only renders
the journal and dispatches choices; it does not decide incident eligibility.
```

- [x] **Step 4: Run focused tests**

Run:

```bash
npm.cmd test -- src/test/resident-stories.test.ts src/test/station-incidents.test.ts
npx.cmd tsc --noEmit
```

Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add -- src/game/economy.ts src/test/resident-stories.test.ts docs/game-design/01-core-loop.md docs/game-design/03-content-progression.md docs/game-design/08-technical-architecture.md
git commit -m "refactor: retire blocking resident story flow"
```

---

### Task 8: Final Verification

**Files:**
- No code files unless verification exposes a concrete bug.

**Interfaces:**
- Verifies the complete incident journal implementation.

- [x] **Step 1: Run full tests**

Run: `npm.cmd test`

Expected: all tests pass.

- [x] **Step 2: Run TypeScript**

Run: `npx.cmd tsc --noEmit`

Expected: no output and exit code 0.

- [x] **Step 3: Run diff check**

Run: `git diff --check`

Expected: no whitespace errors. CRLF warnings are acceptable in this repository.

- [x] **Step 4: Inspect old story references**

Run: `rg -n "ResidentStoryDialog|activeStory|storyDismissed|dismissStory|getActiveResidentStory|checkResidentStories" src`

Expected: only legacy `src/game/residentStories.ts` and tests that explicitly cover legacy behavior remain. No `App` or `useGameState` references remain.

- [x] **Step 5: Inspect incident references**

Run: `rg -n "StationIncident|stationIncidents|activeIncidents|completedIncidents|unlockedIncidentVisuals" src docs`

Expected: types, content, engine, save, hook, UI, tests and docs all reference the new system.

- [x] **Step 6: Record final status**

Run: `git status --short`

Expected: only intentionally completed implementation files are modified or the working tree is clean after task commits. Do not create an empty verification commit.

---

## Self-Review

- Spec coverage: plan covers non-blocking journal, 40 ids, 10 active MVP incidents, disabled backlog entries, visual placeholder persistence, save migration, desktop/mobile UI, cat interaction, legacy story compatibility and docs.
- Placeholder scan: no task asks for unspecified "appropriate" code. Backlog incidents are intentionally disabled content with explicit ids and placeholder ids.
- Type consistency: `StationIncidentId`, `VisualPlaceholderId`, `ActiveStationIncident`, `queueEligibleIncidents`, `resolveStationIncident`, `markStationIncidentsSeen`, `getNewStationIncidentCount`, `activeIncidents`, `completedIncidents` and `unlockedIncidentVisuals` are used consistently across tasks.
