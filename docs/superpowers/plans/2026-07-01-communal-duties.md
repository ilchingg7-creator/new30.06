# Communal Duties Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first playable Communal Duties loop where residents handle short room situations, repair condition through duties, and create a new soft decision beat.

**Architecture:** Add a pure `src/game/communalDuties.ts` domain module plus static content in `src/game/content/communalDuties.ts`. React only renders and wires actions; `useGameState.ts` delegates generation, assignment, advancement and claiming to domain functions. Condition repair moves out of room clicks and into duty rewards.

**Tech Stack:** TypeScript, React 19, Vite, PixiJS 8, Vitest, Testing Library, existing CSS in `src/styles/global.css`.

## Global Constraints

- Only one communal duty can be active at a time.
- First-pass duty availability cooldown is exactly 4 minutes after the last resolved duty.
- First-pass duty duration is exactly 3 minutes.
- Condition decay is exactly `-1 condition` every 3 minutes.
- Clicking a room must no longer repair condition.
- Duty rewards must not grant direct kopeks.
- No new currencies, inventory, resident fatigue, resident mood, failure states or branching dialogue.
- Missing communal duty save fields must parse safely as no active duty.
- Keep duty generation, assignment, advancement and claiming outside `src/ui/useGameState.ts`.
- Desktop and mobile must both expose the duty loop.

---

## File Structure

- Create `src/game/content/communalDuties.ts`: static first-pass duty definitions, eligible residents, best resident and reward variants.
- Create `src/game/communalDuties.ts`: pure domain functions for generation, assignment, status advancement and claiming.
- Create `src/test/communal-duties.test.ts`: domain tests for duty availability, state transitions and rewards.
- Modify `src/game/types.ts`: add `CommunalDutyId`, `CommunalDutyStatus`, `CommunalDutyState`, `CommunalDutyResult`, reward types and optional `GameState` fields.
- Modify `src/game/save.ts`: validate optional communal duty fields and result fields without breaking old saves.
- Modify `src/test/save.test.ts`: cover parsing old saves and dropping invalid duty state.
- Modify `src/game/roomConditions.ts`: slow `DECAY_INTERVAL_SECONDS` to `180`.
- Modify `src/test/room-conditions.test.ts`: assert the new decay interval.
- Create `src/game/roomClicks.ts`: pure click reward helper that grants kopeks without repairing condition.
- Create `src/test/room-clicks.test.ts`: verify click reward does not change room condition.
- Modify `src/ui/useGameState.ts`: wire duty generation/advance/assign/claim and use the new click helper.
- Create `src/ui/components/CommunalDutyPanel.tsx`: presentational duty panel.
- Create `src/test/communal-duty-panel.test.tsx`: UI tests for available, in-progress and ready-to-claim states.
- Modify `src/platform/i18n.ts`: add duty labels and localized duty content.
- Modify `src/ui/layouts/DesktopLayout.tsx`: render the panel near Station Director.
- Modify `src/ui/layouts/MobileLayout.tsx`: render compact panel in the top mobile loop.
- Modify `src/styles/global.css`: add compact duty panel styles.
- Modify `src/game/stationDirector.ts`: add duty guidance priority.
- Modify `src/test/station-director.test.ts`: cover available and ready-to-claim duty guidance.
- Modify `src/test/components.test.tsx` and `src/test/responsive.test.tsx`: include duty panel coverage in smoke/responsive tests.
- Modify `docs/game-design/01-core-loop.md` and `docs/game-design/02-economy-balance.md`: document duties and the condition click change.

---

### Task 1: Communal Duty Domain Model And Pure Logic

**Files:**
- Create: `src/game/content/communalDuties.ts`
- Create: `src/game/communalDuties.ts`
- Create: `src/test/communal-duties.test.ts`
- Modify: `src/game/types.ts`

**Interfaces:**
- Consumes: `GameState`, `ModuleId`, `ResidentId`, `TimedBonus`, existing `roomConditions`.
- Produces:
  - `COMMUNAL_DUTY_COOLDOWN_MS = 4 * 60 * 1000`
  - `COMMUNAL_DUTY_DURATION_MS = 3 * 60 * 1000`
  - `communalDuties: CommunalDutyDefinition[]`
  - `getEligibleCommunalDutyDefinitions(state: GameState): CommunalDutyDefinition[]`
  - `maybeCreateCommunalDuty(state: GameState, now?: number): GameState`
  - `assignCommunalDuty(state: GameState, residentId: ResidentId, now?: number): GameState`
  - `advanceCommunalDuty(state: GameState, now?: number): GameState`
  - `claimCommunalDuty(state: GameState, now?: number): GameState`

- [ ] **Step 1: Write the failing domain tests**

Create `src/test/communal-duties.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  COMMUNAL_DUTY_COOLDOWN_MS,
  COMMUNAL_DUTY_DURATION_MS,
  assignCommunalDuty,
  claimCommunalDuty,
  getEligibleCommunalDutyDefinitions,
  maybeCreateCommunalDuty,
  advanceCommunalDuty
} from '../game/communalDuties';
import { createInitialState } from '../game/economy';
import type { GameState } from '../game/types';

const NOW = 10_000;

function withCapsuleResident(): GameState {
  const base = createInitialState(NOW);

  return {
    ...base,
    moduleLevels: {
      ...base.moduleLevels,
      tenant_capsule: 10
    },
    unlockedResidents: ['sleepy_engineer'],
    roomConditions: {
      tenant_capsule: 45
    },
    lastCommunalDutyResolvedAt: NOW - COMMUNAL_DUTY_COOLDOWN_MS
  };
}

function withKitchenResident(): GameState {
  const base = withCapsuleResident();

  return {
    ...base,
    moduleLevels: {
      ...base.moduleLevels,
      cosmo_kitchen: 20
    },
    unlockedResidents: ['sleepy_engineer', 'mist_cook'],
    roomConditions: {
      ...base.roomConditions,
      cosmo_kitchen: 40
    }
  };
}

describe('communal duties', () => {
  it('does not generate a duty without unlocked residents', () => {
    const state = {
      ...createInitialState(NOW),
      moduleLevels: {
        ...createInitialState(NOW).moduleLevels,
        tenant_capsule: 10
      },
      lastCommunalDutyResolvedAt: NOW - COMMUNAL_DUTY_COOLDOWN_MS
    };

    expect(getEligibleCommunalDutyDefinitions(state)).toHaveLength(0);
    expect(maybeCreateCommunalDuty(state, NOW)).toBe(state);
  });

  it('does not generate a duty before cooldown expires', () => {
    const state = {
      ...withCapsuleResident(),
      lastCommunalDutyResolvedAt: NOW - COMMUNAL_DUTY_COOLDOWN_MS + 1
    };

    expect(maybeCreateCommunalDuty(state, NOW)).toBe(state);
  });

  it('generates one available duty for an unlocked room and resident', () => {
    const next = maybeCreateCommunalDuty(withCapsuleResident(), NOW);

    expect(next.communalDuty).toMatchObject({
      dutyId: 'capsule_quiet_hours',
      roomId: 'tenant_capsule',
      status: 'available'
    });
  });

  it('assigns an eligible resident and sets completion time', () => {
    const available = maybeCreateCommunalDuty(withCapsuleResident(), NOW);
    const assigned = assignCommunalDuty(available, 'sleepy_engineer', NOW);

    expect(assigned.communalDuty).toMatchObject({
      status: 'in_progress',
      assignedResidentId: 'sleepy_engineer',
      startedAt: NOW,
      completesAt: NOW + COMMUNAL_DUTY_DURATION_MS
    });
  });

  it('rejects an ineligible resident assignment', () => {
    const available = maybeCreateCommunalDuty(withCapsuleResident(), NOW);
    const rejected = assignCommunalDuty(available, 'mist_cook', NOW);

    expect(rejected).toBe(available);
  });

  it('marks an assigned duty ready to claim after completion time', () => {
    const available = maybeCreateCommunalDuty(withCapsuleResident(), NOW);
    const assigned = assignCommunalDuty(available, 'sleepy_engineer', NOW);
    const ready = advanceCommunalDuty(assigned, NOW + COMMUNAL_DUTY_DURATION_MS);

    expect(ready.communalDuty?.status).toBe('ready_to_claim');
  });

  it('claiming applies rewards once and clears the active duty', () => {
    const available = maybeCreateCommunalDuty(withCapsuleResident(), NOW);
    const assigned = assignCommunalDuty(available, 'sleepy_engineer', NOW);
    const ready = advanceCommunalDuty(assigned, NOW + COMMUNAL_DUTY_DURATION_MS);
    const claimed = claimCommunalDuty(ready, NOW + COMMUNAL_DUTY_DURATION_MS);
    const claimedAgain = claimCommunalDuty(claimed, NOW + COMMUNAL_DUTY_DURATION_MS);

    expect(claimed.communalDuty).toBeUndefined();
    expect(claimed.lastCommunalDutyResolvedAt).toBe(NOW + COMMUNAL_DUTY_DURATION_MS);
    expect(claimed.comfort).toBeGreaterThan(ready.comfort);
    expect(claimed.roomConditions?.tenant_capsule).toBeGreaterThan(ready.roomConditions?.tenant_capsule ?? 0);
    expect(claimedAgain).toBe(claimed);
  });

  it('best resident gives stronger comfort reward than alternate resident', () => {
    const state = withKitchenResident();
    const available = {
      ...maybeCreateCommunalDuty(state, NOW),
      communalDuty: {
        id: 'duty-kitchen',
        dutyId: 'kitchen_soup_escape' as const,
        roomId: 'cosmo_kitchen' as const,
        status: 'available' as const,
        createdAt: NOW
      }
    };

    const best = claimCommunalDuty(
      advanceCommunalDuty(assignCommunalDuty(available, 'mist_cook', NOW), NOW + COMMUNAL_DUTY_DURATION_MS),
      NOW + COMMUNAL_DUTY_DURATION_MS
    );
    const alternate = claimCommunalDuty(
      advanceCommunalDuty(assignCommunalDuty(available, 'sleepy_engineer', NOW), NOW + COMMUNAL_DUTY_DURATION_MS),
      NOW + COMMUNAL_DUTY_DURATION_MS
    );

    expect(best.comfort).toBeGreaterThan(alternate.comfort);
  });
});
```

- [ ] **Step 2: Run the failing domain tests**

Run:

```bash
npm.cmd test -- src/test/communal-duties.test.ts
```

Expected: FAIL because `src/game/communalDuties.ts` does not exist.

- [ ] **Step 3: Add types to `src/game/types.ts`**

Add:

```ts
export type CommunalDutyId =
  | 'capsule_quiet_hours'
  | 'kitchen_soup_escape'
  | 'garden_vacuum_sprout'
  | 'laundry_sock_orbit';

export type CommunalDutyStatus = 'available' | 'in_progress' | 'ready_to_claim';

export interface CommunalDutyReward {
  comfortGain?: number;
  conditionRepair?: Partial<Record<ModuleId, number>>;
  timedBonus?: TimedBonus;
}

export interface CommunalDutyResidentOutcome {
  residentId: ResidentId;
  reward: CommunalDutyReward;
  resultKey: string;
}

export interface CommunalDutyDefinition {
  id: CommunalDutyId;
  roomId: ModuleId;
  eligibleResidentIds: ResidentId[];
  bestResidentId: ResidentId;
  durationMs: number;
  outcomes: CommunalDutyResidentOutcome[];
}

export interface CommunalDutyState {
  id: string;
  dutyId: CommunalDutyId;
  roomId: ModuleId;
  status: CommunalDutyStatus;
  createdAt: number;
  assignedResidentId?: ResidentId;
  startedAt?: number;
  completesAt?: number;
}

export interface CommunalDutyResult {
  dutyId: CommunalDutyId;
  residentId: ResidentId;
  roomId: ModuleId;
  comfortGain: number;
  conditionRepair: Partial<Record<ModuleId, number>>;
  resultKey: string;
  claimedAt: number;
}
```

Add optional fields to `GameState`:

```ts
communalDuty?: CommunalDutyState;
lastCommunalDutyResolvedAt?: number;
lastCommunalDutyResult?: CommunalDutyResult;
```

- [ ] **Step 4: Add first-pass duty content**

Create `src/game/content/communalDuties.ts`:

```ts
import type { CommunalDutyDefinition } from '../types';

export const communalDuties: CommunalDutyDefinition[] = [
  {
    id: 'capsule_quiet_hours',
    roomId: 'tenant_capsule',
    eligibleResidentIds: ['sleepy_engineer', 'mist_cook'],
    bestResidentId: 'sleepy_engineer',
    durationMs: 3 * 60 * 1_000,
    outcomes: [
      {
        residentId: 'sleepy_engineer',
        resultKey: 'best',
        reward: {
          comfortGain: 2,
          conditionRepair: { tenant_capsule: 25 }
        }
      },
      {
        residentId: 'mist_cook',
        resultKey: 'alternate',
        reward: {
          comfortGain: 1,
          conditionRepair: { tenant_capsule: 12 }
        }
      }
    ]
  },
  {
    id: 'kitchen_soup_escape',
    roomId: 'cosmo_kitchen',
    eligibleResidentIds: ['mist_cook', 'sleepy_engineer', 'vacuum_gardener'],
    bestResidentId: 'mist_cook',
    durationMs: 3 * 60 * 1_000,
    outcomes: [
      {
        residentId: 'mist_cook',
        resultKey: 'best',
        reward: {
          comfortGain: 3,
          conditionRepair: { cosmo_kitchen: 20 },
          timedBonus: {
            id: 'duty_kitchen_soup_escape',
            incomeMultiplier: 1.2,
            expiresAt: 0
          }
        }
      },
      {
        residentId: 'sleepy_engineer',
        resultKey: 'alternate_engineer',
        reward: {
          conditionRepair: { cosmo_kitchen: 25 }
        }
      },
      {
        residentId: 'vacuum_gardener',
        resultKey: 'alternate_gardener',
        reward: {
          comfortGain: 1,
          conditionRepair: { oxygen_garden: 10 }
        }
      }
    ]
  },
  {
    id: 'garden_vacuum_sprout',
    roomId: 'oxygen_garden',
    eligibleResidentIds: ['vacuum_gardener', 'mist_cook'],
    bestResidentId: 'vacuum_gardener',
    durationMs: 3 * 60 * 1_000,
    outcomes: [
      {
        residentId: 'vacuum_gardener',
        resultKey: 'best',
        reward: {
          comfortGain: 3,
          conditionRepair: { oxygen_garden: 25 }
        }
      },
      {
        residentId: 'mist_cook',
        resultKey: 'alternate',
        reward: {
          comfortGain: 1,
          conditionRepair: { oxygen_garden: 12 }
        }
      }
    ]
  },
  {
    id: 'laundry_sock_orbit',
    roomId: 'zero_g_laundry',
    eligibleResidentIds: ['sock_master', 'sleepy_engineer'],
    bestResidentId: 'sock_master',
    durationMs: 3 * 60 * 1_000,
    outcomes: [
      {
        residentId: 'sock_master',
        resultKey: 'best',
        reward: {
          comfortGain: 4,
          conditionRepair: { zero_g_laundry: 25 }
        }
      },
      {
        residentId: 'sleepy_engineer',
        resultKey: 'alternate',
        reward: {
          conditionRepair: { zero_g_laundry: 18 }
        }
      }
    ]
  }
];
```

- [ ] **Step 5: Implement pure communal duty logic**

Create `src/game/communalDuties.ts`:

```ts
import { communalDuties } from './content/communalDuties';
import type {
  CommunalDutyDefinition,
  CommunalDutyId,
  CommunalDutyReward,
  GameState,
  ResidentId
} from './types';

export const COMMUNAL_DUTY_COOLDOWN_MS = 4 * 60 * 1_000;
export const COMMUNAL_DUTY_DURATION_MS = 3 * 60 * 1_000;
const TIMED_DUTY_BONUS_DURATION_MS = 5 * 60 * 1_000;

function findDuty(dutyId: CommunalDutyId): CommunalDutyDefinition | null {
  return communalDuties.find((duty) => duty.id === dutyId) ?? null;
}

function hasUnlockedRoom(state: GameState, duty: CommunalDutyDefinition): boolean {
  return state.moduleLevels[duty.roomId] > 0;
}

function hasEligibleResident(state: GameState, duty: CommunalDutyDefinition): boolean {
  return duty.eligibleResidentIds.some((residentId) => state.unlockedResidents.includes(residentId));
}

function cooldownReady(state: GameState, now: number): boolean {
  const lastResolvedAt = state.lastCommunalDutyResolvedAt;
  return lastResolvedAt === undefined || now - lastResolvedAt >= COMMUNAL_DUTY_COOLDOWN_MS;
}

function getOutcome(definition: CommunalDutyDefinition, residentId: ResidentId) {
  return definition.outcomes.find((outcome) => outcome.residentId === residentId) ?? null;
}

function applyReward(state: GameState, reward: CommunalDutyReward, now: number): GameState {
  const conditionRepair = reward.conditionRepair ?? {};
  const roomConditions = { ...state.roomConditions };

  for (const [roomId, repair] of Object.entries(conditionRepair)) {
    const current = roomConditions[roomId as keyof typeof roomConditions] ?? 60;
    roomConditions[roomId as keyof typeof roomConditions] = Math.min(100, current + repair);
  }

  const timedBonuses = reward.timedBonus
    ? [
        ...state.timedBonuses,
        {
          ...reward.timedBonus,
          expiresAt: now + TIMED_DUTY_BONUS_DURATION_MS
        }
      ]
    : state.timedBonuses;

  return {
    ...state,
    comfort: state.comfort + (reward.comfortGain ?? 0),
    roomConditions,
    timedBonuses
  };
}

export function getEligibleCommunalDutyDefinitions(state: GameState): CommunalDutyDefinition[] {
  return communalDuties.filter((duty) => hasUnlockedRoom(state, duty) && hasEligibleResident(state, duty));
}

export function maybeCreateCommunalDuty(state: GameState, now = Date.now()): GameState {
  if (state.communalDuty || !cooldownReady(state, now)) {
    return state;
  }

  const duty = getEligibleCommunalDutyDefinitions(state)[0];

  if (!duty) {
    return state;
  }

  return {
    ...state,
    communalDuty: {
      id: `duty-${now}-${duty.id}`,
      dutyId: duty.id,
      roomId: duty.roomId,
      status: 'available',
      createdAt: now
    }
  };
}

export function assignCommunalDuty(state: GameState, residentId: ResidentId, now = Date.now()): GameState {
  const active = state.communalDuty;

  if (!active || active.status !== 'available') {
    return state;
  }

  const definition = findDuty(active.dutyId);

  if (!definition || !state.unlockedResidents.includes(residentId) || !getOutcome(definition, residentId)) {
    return state;
  }

  return {
    ...state,
    communalDuty: {
      ...active,
      status: 'in_progress',
      assignedResidentId: residentId,
      startedAt: now,
      completesAt: now + definition.durationMs
    }
  };
}

export function advanceCommunalDuty(state: GameState, now = Date.now()): GameState {
  const active = state.communalDuty;

  if (!active || active.status !== 'in_progress' || active.completesAt === undefined || now < active.completesAt) {
    return state;
  }

  return {
    ...state,
    communalDuty: {
      ...active,
      status: 'ready_to_claim'
    }
  };
}

export function claimCommunalDuty(state: GameState, now = Date.now()): GameState {
  const active = state.communalDuty;

  if (!active || active.status !== 'ready_to_claim' || !active.assignedResidentId) {
    return state;
  }

  const definition = findDuty(active.dutyId);
  const outcome = definition ? getOutcome(definition, active.assignedResidentId) : null;

  if (!definition || !outcome) {
    return {
      ...state,
      communalDuty: undefined,
      lastCommunalDutyResolvedAt: now
    };
  }

  const rewarded = applyReward(state, outcome.reward, now);

  return {
    ...rewarded,
    communalDuty: undefined,
    lastCommunalDutyResolvedAt: now,
    lastCommunalDutyResult: {
      dutyId: definition.id,
      residentId: active.assignedResidentId,
      roomId: definition.roomId,
      comfortGain: outcome.reward.comfortGain ?? 0,
      conditionRepair: outcome.reward.conditionRepair ?? {},
      resultKey: outcome.resultKey,
      claimedAt: now
    }
  };
}
```

- [ ] **Step 6: Run the domain tests**

Run:

```bash
npm.cmd test -- src/test/communal-duties.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit Task 1**

Run:

```bash
git add -- src/game/types.ts src/game/content/communalDuties.ts src/game/communalDuties.ts src/test/communal-duties.test.ts
git commit -m "feat: add communal duty domain logic"
```

---

### Task 2: Save Parsing For Communal Duties

**Files:**
- Modify: `src/game/save.ts`
- Modify: `src/test/save.test.ts`

**Interfaces:**
- Consumes: `CommunalDutyId`, `ResidentId`, `ModuleId`, `GameState`.
- Produces: save parser that accepts old saves with missing duty fields and valid saves with `communalDuty`, `lastCommunalDutyResolvedAt`, `lastCommunalDutyResult`.

- [ ] **Step 1: Write failing save tests**

Append to `src/test/save.test.ts`:

```ts
import { serializeGameState, parseGameState } from '../game/save';

it('parses saves without communal duty fields as valid legacy-compatible state', () => {
  const state = createInitialState(1_000);
  const raw = JSON.stringify({ ...state, schemaVersion: 2 });

  const parsed = parseGameState(raw);

  expect(parsed).not.toBeNull();
  expect(parsed?.communalDuty).toBeUndefined();
  expect(parsed?.lastCommunalDutyResolvedAt).toBeUndefined();
});

it('round-trips a valid available communal duty', () => {
  const state = {
    ...createInitialState(1_000),
    communalDuty: {
      id: 'duty-1',
      dutyId: 'capsule_quiet_hours' as const,
      roomId: 'tenant_capsule' as const,
      status: 'available' as const,
      createdAt: 1_000
    },
    lastCommunalDutyResolvedAt: 500
  };

  const parsed = parseGameState(serializeGameState(state));

  expect(parsed?.communalDuty?.dutyId).toBe('capsule_quiet_hours');
  expect(parsed?.lastCommunalDutyResolvedAt).toBe(500);
});

it('rejects saves with invalid communal duty ids', () => {
  const state = createInitialState(1_000);
  const raw = JSON.stringify({
    ...state,
    schemaVersion: 2,
    communalDuty: {
      id: 'duty-bad',
      dutyId: 'not_a_duty',
      roomId: 'tenant_capsule',
      status: 'available',
      createdAt: 1_000
    }
  });

  expect(parseGameState(raw)).toBeNull();
});
```

- [ ] **Step 2: Run failing save tests**

Run:

```bash
npm.cmd test -- src/test/save.test.ts
```

Expected: FAIL because `isGameStateShape` does not validate communal duty fields yet.

- [ ] **Step 3: Add validators to `src/game/save.ts`**

Add valid sets:

```ts
const VALID_COMMUNAL_DUTY_IDS = new Set([
  'capsule_quiet_hours',
  'kitchen_soup_escape',
  'garden_vacuum_sprout',
  'laundry_sock_orbit'
]);

const VALID_COMMUNAL_DUTY_STATUSES = new Set(['available', 'in_progress', 'ready_to_claim']);
const VALID_RESIDENT_IDS = new Set([
  'sleepy_engineer',
  'mist_cook',
  'vacuum_gardener',
  'sock_master',
  'teleport_courier',
  'vip_astroteenant',
  'retired_cosmonaut',
  'three_eyed_housekeeper'
]);
```

Add helpers:

```ts
function hasOptionalCommunalDuty(value: unknown): boolean {
  if (value === undefined) {
    return true;
  }

  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.dutyId === 'string' &&
    VALID_COMMUNAL_DUTY_IDS.has(value.dutyId) &&
    typeof value.roomId === 'string' &&
    modules.some((module) => module.id === value.roomId) &&
    typeof value.status === 'string' &&
    VALID_COMMUNAL_DUTY_STATUSES.has(value.status) &&
    isNumber(value.createdAt) &&
    hasOptionalNumber(value.startedAt) &&
    hasOptionalNumber(value.completesAt) &&
    (
      value.assignedResidentId === undefined ||
      (typeof value.assignedResidentId === 'string' && VALID_RESIDENT_IDS.has(value.assignedResidentId))
    )
  );
}

function hasOptionalConditionRepair(value: unknown): boolean {
  if (value === undefined) {
    return true;
  }

  if (!isRecord(value)) {
    return false;
  }

  return Object.entries(value).every(([moduleId, repair]) => {
    return modules.some((module) => module.id === moduleId) && isNumber(repair);
  });
}

function hasOptionalCommunalDutyResult(value: unknown): boolean {
  if (value === undefined) {
    return true;
  }

  return (
    isRecord(value) &&
    typeof value.dutyId === 'string' &&
    VALID_COMMUNAL_DUTY_IDS.has(value.dutyId) &&
    typeof value.residentId === 'string' &&
    VALID_RESIDENT_IDS.has(value.residentId) &&
    typeof value.roomId === 'string' &&
    modules.some((module) => module.id === value.roomId) &&
    isNumber(value.comfortGain) &&
    hasOptionalConditionRepair(value.conditionRepair) &&
    typeof value.resultKey === 'string' &&
    isNumber(value.claimedAt)
  );
}
```

Extend `isGameStateShape`:

```ts
hasOptionalCommunalDuty(value.communalDuty) &&
hasOptionalNumber(value.lastCommunalDutyResolvedAt) &&
hasOptionalCommunalDutyResult(value.lastCommunalDutyResult)
```

- [ ] **Step 4: Run save tests**

Run:

```bash
npm.cmd test -- src/test/save.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit Task 2**

Run:

```bash
git add -- src/game/save.ts src/test/save.test.ts
git commit -m "feat: persist communal duty state"
```

---

### Task 3: Slow Condition Decay And Remove Click Repair

**Files:**
- Modify: `src/game/roomConditions.ts`
- Modify: `src/test/room-conditions.test.ts`
- Create: `src/game/roomClicks.ts`
- Create: `src/test/room-clicks.test.ts`
- Modify: `src/ui/useGameState.ts`
- Modify: `src/platform/i18n.ts`

**Interfaces:**
- Produces:
  - `DECAY_INTERVAL_SECONDS = 180`
  - `applyRoomClickReward(state: GameState): GameState`
- Consumes: `calculateIncomePerSecond(state)`.

- [ ] **Step 1: Write failing condition and click tests**

Add to `src/test/room-conditions.test.ts`:

```ts
import { DECAY_INTERVAL_SECONDS } from '../game/roomConditions';

it('decays room condition on the slower communal-duty rhythm', () => {
  expect(DECAY_INTERVAL_SECONDS).toBe(180);
});
```

Create `src/test/room-clicks.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createInitialState } from '../game/economy';
import { applyRoomClickReward } from '../game/roomClicks';

describe('room click reward', () => {
  it('grants kopeks without repairing room condition', () => {
    const state = {
      ...createInitialState(1_000),
      moduleLevels: {
        ...createInitialState(1_000).moduleLevels,
        tenant_capsule: 10
      },
      roomConditions: {
        tenant_capsule: 25
      }
    };

    const clicked = applyRoomClickReward(state);

    expect(clicked.credits).toBeGreaterThan(state.credits);
    expect(clicked.totalEarnedCredits).toBeGreaterThan(state.totalEarnedCredits);
    expect(clicked.roomConditions?.tenant_capsule).toBe(25);
  });
});
```

- [ ] **Step 2: Run failing tests**

Run:

```bash
npm.cmd test -- src/test/room-conditions.test.ts src/test/room-clicks.test.ts
```

Expected: FAIL because `DECAY_INTERVAL_SECONDS` is still `5` and `roomClicks.ts` does not exist.

- [ ] **Step 3: Slow condition decay**

In `src/game/roomConditions.ts`, change:

```ts
export const DECAY_INTERVAL_SECONDS = 180;
```

Keep `repairRoom` exported for duty rewards; remove it only from click behavior.

- [ ] **Step 4: Add pure click reward helper**

Create `src/game/roomClicks.ts`:

```ts
import { calculateIncomePerSecond } from './economy';
import type { GameState } from './types';

export function applyRoomClickReward(state: GameState): GameState {
  const bonus = 1 + Math.floor(calculateIncomePerSecond(state) * 0.5);

  return {
    ...state,
    credits: state.credits + bonus,
    totalEarnedCredits: state.totalEarnedCredits + bonus
  };
}
```

- [ ] **Step 5: Wire `useGameState.clickRoom` to the helper**

In `src/ui/useGameState.ts`, remove `repairRoom` from the room condition import and add:

```ts
import { applyRoomClickReward } from '../game/roomClicks';
```

Replace the `clickRoom` body with:

```ts
const clickRoom = useCallback(() => {
  setGameState((current) => applyRoomClickReward(current));
  playSound('click');
}, []);
```

- [ ] **Step 6: Update condition copy**

In `src/platform/i18n.ts`, change the English `conditionHint` to:

```ts
conditionHint: 'Assign a resident duty to repair this room.',
```

Set the Russian `conditionHint` to the same ASCII-safe fallback string for this pass:

```ts
conditionHint: 'Assign a resident duty to repair this room.',
```

Do not leave any text saying that clicks repair rooms.

- [ ] **Step 7: Run tests**

Run:

```bash
npm.cmd test -- src/test/room-conditions.test.ts src/test/room-clicks.test.ts
```

Expected: PASS.

- [ ] **Step 8: Commit Task 3**

Run:

```bash
git add -- src/game/roomConditions.ts src/test/room-conditions.test.ts src/game/roomClicks.ts src/test/room-clicks.test.ts src/ui/useGameState.ts src/platform/i18n.ts
git commit -m "fix: move condition repair out of room clicks"
```

---

### Task 4: UI Panel And Localized Copy

**Files:**
- Create: `src/ui/components/CommunalDutyPanel.tsx`
- Create: `src/test/communal-duty-panel.test.tsx`
- Modify: `src/platform/i18n.ts`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: `GameState['communalDuty']`, `communalDuties`, `translations`.
- Produces: `CommunalDutyPanel` with props:

```ts
interface CommunalDutyPanelProps {
  gameState: GameState;
  onAssign(residentId: ResidentId): void;
  onClaim(): void;
  variant?: 'default' | 'compact';
  t: Translation;
}
```

- [ ] **Step 1: Write failing panel tests**

Create `src/test/communal-duty-panel.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { createInitialState } from '../game/economy';
import type { GameState } from '../game/types';
import { translations } from '../platform/i18n';
import { CommunalDutyPanel } from '../ui/components/CommunalDutyPanel';

const t = translations.en;

function availableDutyState(): GameState {
  return {
    ...createInitialState(1_000),
    moduleLevels: {
      ...createInitialState(1_000).moduleLevels,
      tenant_capsule: 10
    },
    unlockedResidents: ['sleepy_engineer'],
    communalDuty: {
      id: 'duty-1',
      dutyId: 'capsule_quiet_hours',
      roomId: 'tenant_capsule',
      status: 'available',
      createdAt: 1_000
    }
  };
}

describe('CommunalDutyPanel', () => {
  it('renders nothing when there is no active duty', () => {
    const { container } = render(
      <CommunalDutyPanel gameState={createInitialState(1_000)} onAssign={vi.fn()} onClaim={vi.fn()} t={t} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders available duty and assigns an eligible resident', async () => {
    const user = userEvent.setup();
    const onAssign = vi.fn();

    render(<CommunalDutyPanel gameState={availableDutyState()} onAssign={onAssign} onClaim={vi.fn()} t={t} />);

    expect(screen.getByRole('heading', { name: t.communalDutyTitle })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Sleepy Engineer/i }));

    expect(onAssign).toHaveBeenCalledWith('sleepy_engineer');
  });

  it('renders ready-to-claim duty with claim action', async () => {
    const user = userEvent.setup();
    const onClaim = vi.fn();
    const state = {
      ...availableDutyState(),
      communalDuty: {
        ...availableDutyState().communalDuty!,
        status: 'ready_to_claim' as const,
        assignedResidentId: 'sleepy_engineer' as const,
        startedAt: 1_000,
        completesAt: 181_000
      }
    };

    render(<CommunalDutyPanel gameState={state} onAssign={vi.fn()} onClaim={onClaim} t={t} />);

    await user.click(screen.getByRole('button', { name: t.communalDutyClaim }));

    expect(onClaim).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run failing panel tests**

Run:

```bash
npm.cmd test -- src/test/communal-duty-panel.test.tsx
```

Expected: FAIL because `CommunalDutyPanel` and translation keys do not exist.

- [ ] **Step 3: Add translation interface fields**

In `src/platform/i18n.ts`, add to `Translation`:

```ts
communalDutyTitle: string;
communalDutyAssign: string;
communalDutyInProgress: string;
communalDutyReady: string;
communalDutyClaim: string;
communalDutyBestMatch: string;
communalDutyNoResidents: string;
communalDuties: Record<string, {
  title: string;
  request: string;
  resultBest: string;
  resultAlternate: string;
}>;
```

Add English values:

```ts
communalDutyTitle: 'Communal duty',
communalDutyAssign: 'Assign',
communalDutyInProgress: 'Resident on duty',
communalDutyReady: 'Duty complete',
communalDutyClaim: 'Claim result',
communalDutyBestMatch: 'Best match',
communalDutyNoResidents: 'No eligible residents yet',
communalDuties: {
  capsule_quiet_hours: {
    title: 'Quiet hours in the capsule',
    request: 'The capsule lamp hums like an old radio. Someone should calm it down.',
    resultBest: 'The capsule is quiet and warm again.',
    resultAlternate: 'The capsule is calmer, though still opinionated.'
  },
  kitchen_soup_escape: {
    title: 'Soup escaped into zero-G',
    request: 'The kitchen soup is orbiting the ceiling and looking proud.',
    resultBest: 'The soup returned to the pot with dignity.',
    resultAlternate: 'The soup was negotiated back toward the table.'
  },
  garden_vacuum_sprout: {
    title: 'Vacuum sprout inspection',
    request: 'A tiny sprout demands proper orbital respect.',
    resultBest: 'The sprout is officially part of the station.',
    resultAlternate: 'The sprout accepts the compromise.'
  },
  laundry_sock_orbit: {
    title: 'Sock orbit cleanup',
    request: 'The laundry socks formed a small independent orbit.',
    resultBest: 'The socks returned to civic order.',
    resultAlternate: 'Most socks returned. The rest are being watched.'
  }
}
```

Add Russian values with the same keys using the same ASCII-safe English fallback strings for this pass. The current file already contains mojibake Cyrillic, so do not add fresh Cyrillic to `src/platform/i18n.ts` in this task.

- [ ] **Step 4: Implement `CommunalDutyPanel`**

Create `src/ui/components/CommunalDutyPanel.tsx`:

```tsx
'use client';

import { ClipboardCheck, UserCheck } from 'lucide-react';
import { communalDuties } from '../../game/content/communalDuties';
import type { GameState, ResidentId } from '../../game/types';
import type { Translation } from '../../platform/i18n';

interface CommunalDutyPanelProps {
  gameState: GameState;
  onAssign(residentId: ResidentId): void;
  onClaim(): void;
  variant?: 'default' | 'compact';
  t: Translation;
}

function getResidentName(residentId: ResidentId, t: Translation): string {
  return t.content.residents[residentId]?.name ?? residentId;
}

export function CommunalDutyPanel({ gameState, onAssign, onClaim, variant = 'default', t }: CommunalDutyPanelProps) {
  const active = gameState.communalDuty;

  if (!active) {
    return null;
  }

  const definition = communalDuties.find((duty) => duty.id === active.dutyId);

  if (!definition) {
    return null;
  }

  const copy = t.communalDuties[definition.id];
  const eligibleResidents = definition.eligibleResidentIds.filter((residentId) => gameState.unlockedResidents.includes(residentId));
  const className = variant === 'compact' ? 'panel communal-duty-panel compact' : 'panel communal-duty-panel';

  return (
    <section className={className} aria-labelledby="communal-duty-title">
      <div className="communal-duty-heading">
        <ClipboardCheck aria-hidden="true" size={17} />
        <h2 id="communal-duty-title">{t.communalDutyTitle}</h2>
      </div>
      <strong>{copy?.title ?? definition.id}</strong>
      {active.status === 'available' && (
        <>
          <p className="panel-copy">{copy?.request ?? definition.id}</p>
          <div className="communal-duty-actions">
            {eligibleResidents.length === 0 && <span>{t.communalDutyNoResidents}</span>}
            {eligibleResidents.map((residentId) => (
              <button type="button" key={residentId} onClick={() => onAssign(residentId)}>
                <UserCheck aria-hidden="true" size={15} />
                {getResidentName(residentId, t)}
                {residentId === definition.bestResidentId ? ` · ${t.communalDutyBestMatch}` : ''}
              </button>
            ))}
          </div>
        </>
      )}
      {active.status === 'in_progress' && (
        <p className="panel-copy">
          {t.communalDutyInProgress}: {active.assignedResidentId ? getResidentName(active.assignedResidentId, t) : ''}
        </p>
      )}
      {active.status === 'ready_to_claim' && (
        <div className="communal-duty-actions">
          <p className="panel-copy">{t.communalDutyReady}</p>
          <button type="button" onClick={onClaim}>
            <ClipboardCheck aria-hidden="true" size={15} />
            {t.communalDutyClaim}
          </button>
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 5: Add CSS**

Append near panel styles in `src/styles/global.css`:

```css
.communal-duty-panel {
  display: grid;
  gap: 10px;
}

.communal-duty-heading {
  display: flex;
  align-items: center;
  gap: 8px;
}

.communal-duty-heading h2 {
  margin: 0;
  font-size: 1rem;
}

.communal-duty-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.communal-duty-panel.compact {
  padding: 8px 10px;
  gap: 6px;
}

.communal-duty-panel.compact .communal-duty-heading h2 {
  font-size: 0.78rem;
}

.communal-duty-panel.compact strong {
  font-size: 0.9rem;
}

.communal-duty-panel.compact .panel-copy {
  margin: 0;
  font-size: 0.72rem;
  line-height: 1.25;
}

.communal-duty-panel.compact button {
  min-height: 32px;
  padding: 0 10px;
  font-size: 0.72rem;
}
```

- [ ] **Step 6: Run panel tests**

Run:

```bash
npm.cmd test -- src/test/communal-duty-panel.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit Task 4**

Run:

```bash
git add -- src/ui/components/CommunalDutyPanel.tsx src/test/communal-duty-panel.test.tsx src/platform/i18n.ts src/styles/global.css
git commit -m "feat: render communal duty panel"
```

---

### Task 5: Game State Wiring And Layout Integration

**Files:**
- Modify: `src/game/economy.ts`
- Modify: `src/ui/useGameState.ts`
- Modify: `src/ui/layouts/DesktopLayout.tsx`
- Modify: `src/ui/layouts/MobileLayout.tsx`
- Modify: `src/test/components.test.tsx`
- Modify: `src/test/responsive.test.tsx`

**Interfaces:**
- Consumes: `maybeCreateCommunalDuty`, `advanceCommunalDuty`, `assignCommunalDuty`, `claimCommunalDuty`.
- Produces in `UseGameStateResult`:

```ts
assignCommunalDuty(residentId: ResidentId): void;
claimCommunalDuty(): void;
```

- [ ] **Step 1: Write failing integration tests**

In `src/test/responsive.test.tsx`, import `MobileLayout`, `UseGameStateResult`, `GameState` and `ResidentId`, then add deterministic mobile layout coverage:

```tsx
import type { GameState, ResidentId } from '../game/types';
import type { UseGameStateResult } from '../ui/useGameState';
import { MobileLayout } from '../ui/layouts/MobileLayout';

function buildDutyGameState(): GameState {
  const base = createInitialState(1_000);

  return {
    ...base,
    moduleLevels: {
      ...base.moduleLevels,
      tenant_capsule: 10
    },
    unlockedResidents: ['sleepy_engineer'],
    roomConditions: {
      tenant_capsule: 45
    },
    communalDuty: {
      id: 'duty-1',
      dutyId: 'capsule_quiet_hours',
      roomId: 'tenant_capsule',
      status: 'available',
      createdAt: 1_000
    }
  };
}

function buildDutyGame(): UseGameStateResult {
  const gameState = buildDutyGameState();

  return {
    gameState,
    incomePerSecond: 1,
    offlineReward: null,
    dailyReward: null,
    ready: true,
    selectedRoomId: 'tenant_capsule',
    adPending: false,
    adsAvailable: false,
    buyLevel: vi.fn(),
    selectRoom: vi.fn(),
    renovateOrbit: vi.fn(),
    dismissOfflineReward: vi.fn(),
    dismissDailyReward: vi.fn(),
    activateIncomeBoost: vi.fn(),
    activateVipResident: vi.fn(),
    doubleOfflineReward: vi.fn(),
    setWindowLightColor: vi.fn(),
    buyPrestigeUpgrade: vi.fn(),
    toggleSound: vi.fn(),
    soundMuted: false,
    acceptVisitor: vi.fn(),
    declineVisitor: vi.fn(),
    resetSave: vi.fn(),
    clickRoom: vi.fn(),
    activeStory: null,
    storyDismissed: false,
    dismissStory: vi.fn(),
    assignCommunalDuty: vi.fn<(residentId: ResidentId) => void>(),
    claimCommunalDuty: vi.fn()
  };
}

it('renders compact communal duty panel when mobile layout has an active duty', () => {
  setViewportWidth(390);
  const { container } = render(<MobileLayout game={buildDutyGame()} t={t} />);

  expect(container.querySelector('.mobile-layout .communal-duty-panel.compact')).not.toBeNull();
});
```

In `src/test/components.test.tsx`, import `CommunalDutyPanel` and render it in the component smoke test:

```tsx
const dutyState = {
  ...gameState,
  unlockedResidents: ['sleepy_engineer'],
  communalDuty: {
    id: 'duty-1',
    dutyId: 'capsule_quiet_hours' as const,
    roomId: 'tenant_capsule' as const,
    status: 'available' as const,
    createdAt: 1_000
  }
};

<CommunalDutyPanel gameState={dutyState} onAssign={vi.fn()} onClaim={vi.fn()} t={t} />
```

- [ ] **Step 2: Run failing integration tests**

Run:

```bash
npm.cmd test -- src/test/components.test.tsx src/test/responsive.test.tsx
```

Expected: FAIL until layouts render the panel and the hook exposes duty actions.

- [ ] **Step 3: Advance duties from economy ticks**

In `src/game/economy.ts`, import:

```ts
import { advanceCommunalDuty } from './communalDuties';
```

In `advanceGame`, wrap the existing post-processing result:

```ts
return advanceCommunalDuty(checkResidentStories(checkResidentUnlocks(checkAchievements(completeEligibleGoals(nextState)))), now);
```

In `performPrestige`, ensure active duties do not survive renovation:

```ts
communalDuty: undefined,
lastCommunalDutyResult: undefined,
lastCommunalDutyResolvedAt: state.lastCommunalDutyResolvedAt,
```

- [ ] **Step 4: Wire hook methods**

In `src/ui/useGameState.ts`, import:

```ts
import {
  assignCommunalDuty as assignCommunalDutyState,
  claimCommunalDuty as claimCommunalDutyState,
  maybeCreateCommunalDuty
} from '../game/communalDuties';
import type { ResidentId } from '../game/types';
```

Extend `UseGameStateResult`:

```ts
assignCommunalDuty(residentId: ResidentId): void;
claimCommunalDuty(): void;
```

In the 1-second interval updater, generate duties after advancing:

```ts
setGameState((current) => maybeCreateCommunalDuty(advanceGame(current, 1)));
```

Add callbacks:

```ts
const assignDuty = useCallback((residentId: ResidentId) => {
  setGameState((current) => assignCommunalDutyState(current, residentId));
  playSound('click');
}, []);

const claimDuty = useCallback(() => {
  setGameState((current) => claimCommunalDutyState(current));
  playSound('reward');
}, []);
```

Return them:

```ts
assignCommunalDuty: assignDuty,
claimCommunalDuty: claimDuty,
```

- [ ] **Step 5: Render panel in layouts**

In `DesktopLayout.tsx`, import `CommunalDutyPanel` and render after `StationTaskPanel`:

```tsx
<CommunalDutyPanel
  gameState={game.gameState}
  onAssign={game.assignCommunalDuty}
  onClaim={game.claimCommunalDuty}
  t={t}
/>
```

In `MobileLayout.tsx`, render after compact `StationTaskPanel`:

```tsx
<CommunalDutyPanel
  gameState={game.gameState}
  onAssign={game.assignCommunalDuty}
  onClaim={game.claimCommunalDuty}
  variant="compact"
  t={t}
/>
```

- [ ] **Step 6: Run integration tests**

Run:

```bash
npm.cmd test -- src/test/components.test.tsx src/test/responsive.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit Task 5**

Run:

```bash
git add -- src/game/economy.ts src/ui/useGameState.ts src/ui/layouts/DesktopLayout.tsx src/ui/layouts/MobileLayout.tsx src/test/components.test.tsx src/test/responsive.test.tsx
git commit -m "feat: integrate communal duties into layouts"
```

---

### Task 6: Station Director Duty Guidance

**Files:**
- Modify: `src/game/stationDirector.ts`
- Modify: `src/test/station-director.test.ts`
- Modify: `src/ui/components/StationTaskPanel.tsx`
- Modify: `src/test/station-task-panel.test.tsx`
- Modify: `src/platform/i18n.ts`

**Interfaces:**
- Extend `StationGuidanceCopyKey` with:

```ts
| 'communal_duty_claim'
| 'communal_duty_assign'
```

- Extend `StationGuidance` with:

```ts
export interface CommunalDutyGuidance extends StationGuidanceBase {
  kind: 'communal_duty';
  dutyId: CommunalDutyId;
}
```

- [ ] **Step 1: Write failing director tests**

Add to `src/test/station-director.test.ts`:

```ts
it('prioritizes a ready communal duty above normal purchases', () => {
  const state: GameState = {
    ...createInitialState(1_000),
    communalDuty: {
      id: 'duty-1',
      dutyId: 'capsule_quiet_hours',
      roomId: 'tenant_capsule',
      status: 'ready_to_claim',
      createdAt: 1_000,
      assignedResidentId: 'sleepy_engineer',
      startedAt: 1_000,
      completesAt: 181_000
    }
  };

  const guidance = getStationGuidance({ state, incomePerSecond: 0 });

  expect(guidance.kind).toBe('communal_duty');
  expect(guidance.priority).toBe(95);
});

it('surfaces an available communal duty before close goals', () => {
  const state: GameState = {
    ...withCapsuleLevel(9),
    communalDuty: {
      id: 'duty-1',
      dutyId: 'capsule_quiet_hours',
      roomId: 'tenant_capsule',
      status: 'available',
      createdAt: 1_000
    }
  };

  const guidance = getStationGuidance({ state, incomePerSecond: 5 });

  expect(guidance.kind).toBe('communal_duty');
  expect(guidance.priority).toBe(85);
});
```

- [ ] **Step 2: Run failing director tests**

Run:

```bash
npm.cmd test -- src/test/station-director.test.ts
```

Expected: FAIL because Station Director does not know communal duty guidance.

- [ ] **Step 3: Implement duty guidance**

In `src/game/stationDirector.ts`, import `CommunalDutyId` and add kind support:

```ts
export type StationGuidanceCopyKey =
  | 'visitor'
  | 'daily'
  | 'communal_duty_claim'
  | 'communal_duty_assign'
  | 'goal'
  | 'module_buy'
  | 'module_wait'
  | 'module_unlock'
  | 'prestige';
```

Add interface:

```ts
export interface CommunalDutyGuidance extends StationGuidanceBase {
  kind: 'communal_duty';
  dutyId: CommunalDutyId;
}
```

Include it in the union.

In `getStationGuidance`, after daily and before close goals:

```ts
if (state.communalDuty?.status === 'ready_to_claim') {
  return {
    kind: 'communal_duty',
    priority: 95,
    copyKey: 'communal_duty_claim',
    canActNow: true,
    dutyId: state.communalDuty.dutyId,
    targetRoomId: state.communalDuty.roomId
  };
}

if (state.communalDuty?.status === 'available') {
  return {
    kind: 'communal_duty',
    priority: 85,
    copyKey: 'communal_duty_assign',
    canActNow: true,
    dutyId: state.communalDuty.dutyId,
    targetRoomId: state.communalDuty.roomId
  };
}
```

- [ ] **Step 4: Add task panel copy mapping**

In `src/platform/i18n.ts`, add:

```ts
taskCommunalDutyClaimTitle: string;
taskCommunalDutyClaimBody: string;
taskCommunalDutyAssignTitle: string;
taskCommunalDutyAssignBody: string;
```

Add English values:

```ts
taskCommunalDutyClaimTitle: 'Claim a communal duty',
taskCommunalDutyClaimBody: 'A resident finished helping the station. Claim the result now.',
taskCommunalDutyAssignTitle: 'Assign a communal duty',
taskCommunalDutyAssignBody: 'A room needs a small favor. Pick a resident and let them handle it.',
```

Update `StationTaskPanel` `getTitle` and `getBody` switch cases for both new copy keys.

- [ ] **Step 5: Run tests**

Run:

```bash
npm.cmd test -- src/test/station-director.test.ts src/test/station-task-panel.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit Task 6**

Run:

```bash
git add -- src/game/stationDirector.ts src/test/station-director.test.ts src/ui/components/StationTaskPanel.tsx src/test/station-task-panel.test.tsx src/platform/i18n.ts
git commit -m "feat: guide communal duty actions"
```

---

### Task 7: Docs, Verification And Final Pass

**Files:**
- Modify: `docs/game-design/01-core-loop.md`
- Modify: `docs/game-design/02-economy-balance.md`
- Modify: `docs/game-design/03-content-progression.md`
- Modify: `docs/game-design/11-mvp-verification.md`

**Interfaces:**
- Consumes: implemented duty behavior and spec.
- Produces: updated design docs that match the shipped gameplay.

- [ ] **Step 1: Update docs**

Add to `docs/game-design/01-core-loop.md`:

```md
## Communal Duties

Communal Duties are the short resident-driven decision beat. One station situation can be active at a time. The player assigns an unlocked resident, waits for the duty to finish, then claims comfort, condition repair or a temporary boost. Duties do not grant direct kopeks and do not replace goals.
```

Add to `docs/game-design/02-economy-balance.md`:

```md
## Condition And Clicks

Room condition decays slowly at `-1` every 3 minutes. Room clicks no longer repair condition; they only grant a small active kopek reward. Condition repair comes primarily from Communal Duties so the resident system carries the repair decision.
```

Add to `docs/game-design/03-content-progression.md`:

```md
## Communal Duty Content

The first duty slice covers tenant capsule, cosmo kitchen, oxygen garden and zero-g laundry. Each duty has 2-3 eligible residents and one best match, but every eligible resident succeeds with a useful result.
```

Add to `docs/game-design/11-mvp-verification.md`:

```md
- Communal duty appears only when a related room and resident are unlocked.
- Assigning a resident starts a 3-minute duty.
- Claiming a completed duty applies reward once.
- Clicking rooms gives kopeks but does not repair condition.
- Condition decays at the 3-minute rhythm.
```

- [ ] **Step 2: Run focused tests**

Run:

```bash
npm.cmd test -- src/test/communal-duties.test.ts src/test/communal-duty-panel.test.tsx src/test/room-clicks.test.ts src/test/room-conditions.test.ts src/test/station-director.test.ts
```

Expected: PASS.

- [ ] **Step 3: Run full tests**

Run:

```bash
npm.cmd test
```

Expected: PASS.

- [ ] **Step 4: Run diff hygiene**

Run:

```bash
git diff --check
git status -sb
```

Expected: `git diff --check` exits 0. Status should show only intended docs if not committed.

- [ ] **Step 5: Build if sandbox allows it**

Run:

```bash
npm.cmd run build
```

Expected: production build exits 0. When the local sandbox rejects Vite/esbuild access, record the exact rejection and do not work around it.

- [ ] **Step 6: Commit docs and any final polish**

Run:

```bash
git add -- docs/game-design/01-core-loop.md docs/game-design/02-economy-balance.md docs/game-design/03-content-progression.md docs/game-design/11-mvp-verification.md
git commit -m "docs: document communal duty loop"
```

Include code files in this commit only when they are directly required by the documentation verification step.
