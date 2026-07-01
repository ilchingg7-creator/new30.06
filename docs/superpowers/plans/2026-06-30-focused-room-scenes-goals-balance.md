# Focused Room Scenes Goals Balance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the wide station overview with selectable focused room scenes, make goals complete and disappear, remove credit goal rewards, and slow late-room unlock pacing.

**Architecture:** The game domain remains pure TypeScript with no React or Pixi dependency. React owns selected-room UI state and passes `gameState + selectedRoomId` into Pixi. Pixi renders one focused room scene from pure descriptors and never mutates economy or goals.

**Tech Stack:** Vite, React, PixiJS, TypeScript, Vitest, Testing Library, CSS/global tokens.

## Global Constraints

- Update relevant markdown before changing mechanics, economy, visual style or architecture.
- Existing docs for this change are already updated in `docs/superpowers/specs/2026-06-30-room-scenes-and-goals-design.md`.
- Keep React responsible for UI, buttons, readable labels and room selector controls.
- Keep Pixi responsible only for focused room scene visuals, props, lights and ambient motion.
- `selectedRoomId` is UI state and must not affect economy.
- Buying a module level automatically focuses that room.
- The player can manually select any unlocked room.
- Locked rooms are visible as disabled selector items and do not open detailed scenes.
- Completed goals are stored in `completedGoals`, applied once and removed from visible active goals.
- Goals must not grant credits in MVP.
- Target unlock pacing without mandatory rewarded ads: `cosmo_kitchen` 45-90 seconds, `oxygen_garden` 4-7 minutes, `zero_g_laundry` 9-14 minutes, `teleport_entry` 18-28 minutes, `antigrav_gym` 30-45 minutes, `panorama_dome` 45-65 minutes, `saucer_dock` 60-90 minutes.
- If balance numbers change during implementation, update `docs/game-design/02-economy-balance.md` and `docs/game-design/10-progression-roadmap.md` first.
- Run `npm test` after each task. Run `npm run build` after tasks touching Pixi, React layout, save schema or TypeScript public types.
- In this workspace, `npm run build` may need sandbox escalation because Vite config loading has failed under sandbox before.

---

## File Structure

Create:

```text
src/game/goals.ts
src/station/roomScenes.ts
src/ui/components/RoomSelector.tsx
src/test/goals.test.ts
src/test/balance-simulation.test.ts
src/test/room-scenes.test.ts
```

Modify:

```text
src/game/types.ts
src/game/content/goals.ts
src/game/content/modules.ts
src/game/economy.ts
src/game/save.ts
src/station/stationScene.ts
src/ui/useGameState.ts
src/ui/components/GoalPanel.tsx
src/ui/components/PixiStationScene.tsx
src/ui/layouts/DesktopLayout.tsx
src/ui/layouts/MobileLayout.tsx
src/styles/global.css
src/test/economy.test.ts
src/test/game-content.test.ts
src/test/save.test.ts
src/test/station-scene.test.ts
src/test/components.test.tsx
src/test/app-smoke.test.tsx
docs/game-design/02-economy-balance.md
docs/game-design/10-progression-roadmap.md
docs/game-design/11-mvp-verification.md
```

Responsibilities:

- `src/game/goals.ts`: pure goal eligibility, completion, visible-goal helpers and non-credit reward application.
- `src/station/roomScenes.ts`: pure selected-room descriptors, detail-tier mapping and focused room Pixi container construction.
- `src/ui/components/RoomSelector.tsx`: DOM controls for selecting unlocked rooms and showing locked rooms disabled.
- `src/ui/useGameState.ts`: game state lifecycle, selected room state, purchase focus behavior and automatic goal completion.
- `src/ui/components/PixiStationScene.tsx`: Pixi lifecycle that renders focused room containers.

---

### Task 1: Balance Pacing Guardrail

**Files:**
- Create: `src/test/balance-simulation.test.ts`
- Modify: `src/game/content/modules.ts`
- Modify: `src/game/economy.ts`
- Modify: `src/test/economy.test.ts`
- Modify: `docs/game-design/02-economy-balance.md` only if final numeric table differs from the docs
- Modify: `docs/game-design/10-progression-roadmap.md` only if final numeric table differs from the docs

**Interfaces:**
- Consumes: `modules`, `createInitialState`, `buyModuleLevel`, `advanceGame`, `calculateModuleCost`.
- Produces: slower MVP economy numbers and regression tests for room unlock windows.

- [ ] **Step 1: Write the failing balance simulation test**

Create `src/test/balance-simulation.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { modules } from '../game/content/modules';
import { advanceGame, buyModuleLevel, calculateIncomePerSecond, calculateModuleCost, createInitialState } from '../game/economy';
import type { GameState, ModuleId } from '../game/types';

const unlockTargets: Record<ModuleId, { minSeconds: number; maxSeconds: number }> = {
  tenant_capsule: { minSeconds: 0, maxSeconds: 0 },
  cosmo_kitchen: { minSeconds: 45, maxSeconds: 90 },
  oxygen_garden: { minSeconds: 4 * 60, maxSeconds: 7 * 60 },
  zero_g_laundry: { minSeconds: 9 * 60, maxSeconds: 14 * 60 },
  teleport_entry: { minSeconds: 18 * 60, maxSeconds: 28 * 60 },
  antigrav_gym: { minSeconds: 30 * 60, maxSeconds: 45 * 60 },
  panorama_dome: { minSeconds: 45 * 60, maxSeconds: 65 * 60 },
  saucer_dock: { minSeconds: 60 * 60, maxSeconds: 90 * 60 }
};

function getUnlockedModuleIds(state: GameState): ModuleId[] {
  return modules.filter((module) => state.credits >= module.unlockAtCredits).map((module) => module.id);
}

function chooseAffordablePurchase(state: GameState): ModuleId | null {
  const nextLocked = modules.find((module) => state.credits < module.unlockAtCredits);
  const reserveCredits = nextLocked ? nextLocked.unlockAtCredits * 0.6 : 0;
  const currentIncome = calculateIncomePerSecond(state);
  let best: { moduleId: ModuleId; score: number; cost: number } | null = null;

  for (const module of modules) {
    if (state.credits < module.unlockAtCredits) {
      continue;
    }

    const cost = calculateModuleCost(module.id, state);

    if (state.credits < cost) {
      continue;
    }

    if (nextLocked && currentIncome > 0 && state.credits - cost < reserveCredits) {
      continue;
    }

    const nextState = buyModuleLevel(state, module.id);
    const incomeGain = calculateIncomePerSecond(nextState) - currentIncome;
    const score = incomeGain / cost;

    if (!best || score > best.score || (score === best.score && cost < best.cost)) {
      best = { moduleId: module.id, score, cost };
    }
  }

  return best?.moduleId ?? null;
}

function simulateUnlocks(maxSeconds: number): Partial<Record<ModuleId, number>> {
  let state = createInitialState(1_000);
  const unlockTimes: Partial<Record<ModuleId, number>> = {};

  for (let second = 0; second <= maxSeconds; second += 1) {
    for (const moduleId of getUnlockedModuleIds(state)) {
      unlockTimes[moduleId] ??= second;
    }

    let purchase = chooseAffordablePurchase(state);

    while (purchase) {
      state = buyModuleLevel(state, purchase);
      purchase = chooseAffordablePurchase(state);
    }

    state = advanceGame(state, 1, 1_000 + second * 1_000);
  }

  return unlockTimes;
}

describe('MVP room unlock pacing', () => {
  it('does not unlock late rooms during the first short session', () => {
    const unlockTimes = simulateUnlocks(3 * 60);

    expect(unlockTimes.teleport_entry).toBeUndefined();
    expect(unlockTimes.antigrav_gym).toBeUndefined();
    expect(unlockTimes.panorama_dome).toBeUndefined();
    expect(unlockTimes.saucer_dock).toBeUndefined();
  });

  it('keeps room unlocks inside target windows', () => {
    const unlockTimes = simulateUnlocks(90 * 60);

    for (const module of modules) {
      const target = unlockTargets[module.id];
      const actual = unlockTimes[module.id];

      expect(actual, `${module.id} should unlock`).toBeDefined();
      expect(actual!, `${module.id} min`).toBeGreaterThanOrEqual(target.minSeconds);
      expect(actual!, `${module.id} max`).toBeLessThanOrEqual(target.maxSeconds);
    }
  });
});
```

- [ ] **Step 2: Run the new test to verify current balance fails**

Run:

```bash
npm test -- src/test/balance-simulation.test.ts
```

Expected: FAIL because current content can unlock too much too early or misses the new target windows.

- [ ] **Step 3: Rebalance module content and cost growth**

In `src/game/economy.ts`, start with:

```ts
export const LEVEL_COST_GROWTH = 1.18;
```

In `src/game/content/modules.ts`, replace the numeric `baseCost`, `baseIncomePerSecond` and `unlockAtCredits` values with this first target table while keeping existing ids, names, roles and visual keys:

```ts
const balance = {
  tenant_capsule: { baseCost: 15, baseIncomePerSecond: 1, unlockAtCredits: 0 },
  cosmo_kitchen: { baseCost: 140, baseIncomePerSecond: 4, unlockAtCredits: 80 },
  oxygen_garden: { baseCost: 2_500, baseIncomePerSecond: 16, unlockAtCredits: 1_800 },
  zero_g_laundry: { baseCost: 25_000, baseIncomePerSecond: 80, unlockAtCredits: 18_000 },
  teleport_entry: { baseCost: 180_000, baseIncomePerSecond: 350, unlockAtCredits: 130_000 },
  antigrav_gym: { baseCost: 1_100_000, baseIncomePerSecond: 1_500, unlockAtCredits: 850_000 },
  panorama_dome: { baseCost: 2_800_000, baseIncomePerSecond: 4_800, unlockAtCredits: 2_200_000 },
  saucer_dock: { baseCost: 9_500_000, baseIncomePerSecond: 14_000, unlockAtCredits: 7_500_000 }
} as const;
```

Apply each row directly inside the existing `modules` array. If the test misses a window, adjust only these fields and `LEVEL_COST_GROWTH`, then update the docs to the final values in the same task.

- [ ] **Step 4: Update existing economy assertions**

In `src/test/economy.test.ts`, keep the first capsule assertions unchanged and update any expectations affected by `LEVEL_COST_GROWTH` only if the changed test references later module costs.

Expected unchanged checks:

```ts
expect(state.credits).toBe(15);
expect(calculateModuleCost('tenant_capsule', state)).toBe(15);
expect(calculateIncomePerSecond(bought)).toBe(1);
```

- [ ] **Step 5: Run balance and economy tests**

Run:

```bash
npm test -- src/test/balance-simulation.test.ts src/test/economy.test.ts src/test/game-content.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/game/content/modules.ts src/game/economy.ts src/test/balance-simulation.test.ts src/test/economy.test.ts src/test/game-content.test.ts docs/game-design/02-economy-balance.md docs/game-design/10-progression-roadmap.md
git commit -m "fix: slow room unlock pacing"
```

---

### Task 2: Goal Completion And Non-Credit Rewards

**Files:**
- Create: `src/game/goals.ts`
- Create: `src/test/goals.test.ts`
- Modify: `src/game/types.ts`
- Modify: `src/game/content/goals.ts`
- Modify: `src/game/economy.ts`
- Modify: `src/ui/useGameState.ts`
- Modify: `src/ui/components/GoalPanel.tsx`
- Modify: `src/test/components.test.tsx`
- Modify: `src/test/save.test.ts`

**Interfaces:**
- Consumes: `GameState`, `goals`.
- Produces:
  - `isGoalEligible(goalId: GoalId, state: GameState): boolean`
  - `completeEligibleGoals(state: GameState): GameState`
  - `getVisibleGoals(state: GameState, limit?: number): GoalDefinition[]`

- [ ] **Step 1: Update goal reward types**

In `src/game/types.ts`, replace `GoalDefinition` with:

```ts
export type GoalRewardKind = 'comfort' | 'visual_detail' | 'temporary_boost' | 'prestige_hint';

export interface GoalDefinition {
  id: GoalId;
  title: string;
  rewardComfort: number;
  rewardKind: GoalRewardKind;
  rewardLabel: string;
}
```

- [ ] **Step 2: Update goal content**

In `src/game/content/goals.ts`, remove every `rewardCredits` field and give every goal a non-credit reward label:

```ts
{
  id: 'buy_capsule_10',
  title: 'Поднять капсулу до 10 уровня',
  rewardComfort: 1,
  rewardKind: 'visual_detail',
  rewardLabel: '+1 комфорт, новые детали капсулы'
}
```

Use these reward kinds:

```ts
buy_capsule_10: 'visual_detail'
unlock_kitchen: 'visual_detail'
reach_comfort_25: 'temporary_boost'
earn_credits_10000: 'prestige_hint'
unlock_three_residents: 'visual_detail'
unlock_panorama_dome: 'visual_detail'
first_renovation: 'prestige_hint'
```

- [ ] **Step 3: Write failing goal tests**

Create `src/test/goals.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { buyModuleLevel, createInitialState } from '../game/economy';
import { completeEligibleGoals, getVisibleGoals, isGoalEligible } from '../game/goals';

function buyLevels(count: number) {
  let state = { ...createInitialState(1_000), credits: 1_000_000 };

  for (let index = 0; index < count; index += 1) {
    state = buyModuleLevel(state, 'tenant_capsule');
  }

  return state;
}

describe('goal completion', () => {
  it('detects eligible goals from game state', () => {
    const state = buyLevels(10);

    expect(isGoalEligible('buy_capsule_10', state)).toBe(true);
    expect(isGoalEligible('unlock_kitchen', state)).toBe(true);
  });

  it('completes eligible goals once without adding credits', () => {
    const eligible = buyLevels(10);
    const completed = completeEligibleGoals(eligible);
    const completedAgain = completeEligibleGoals(completed);

    expect(completed.completedGoals).toContain('buy_capsule_10');
    expect(completed.credits).toBe(eligible.credits);
    expect(completed.comfort).toBe(eligible.comfort + 1);
    expect(completedAgain.completedGoals).toEqual(completed.completedGoals);
    expect(completedAgain.comfort).toBe(completed.comfort);
  });

  it('excludes completed goals from the visible active list', () => {
    const completed = completeEligibleGoals(buyLevels(10));
    const visible = getVisibleGoals(completed, 4).map((goal) => goal.id);

    expect(visible).not.toContain('buy_capsule_10');
    expect(visible).toHaveLength(4);
  });
});
```

- [ ] **Step 4: Run goal tests to verify they fail**

Run:

```bash
npm test -- src/test/goals.test.ts
```

Expected: FAIL because `src/game/goals.ts` does not exist.

- [ ] **Step 5: Implement pure goal logic**

Create `src/game/goals.ts`:

```ts
import { goals } from './content/goals';
import type { GameState, GoalDefinition, GoalId } from './types';

export function isGoalEligible(goalId: GoalId, state: GameState): boolean {
  switch (goalId) {
    case 'buy_capsule_10':
      return state.moduleLevels.tenant_capsule >= 10;
    case 'unlock_kitchen':
      return state.moduleLevels.cosmo_kitchen > 0 || state.credits >= 80;
    case 'reach_comfort_25':
      return state.comfort >= 25;
    case 'earn_credits_10000':
      return state.totalEarnedCredits >= 10_000;
    case 'unlock_three_residents':
      return state.unlockedResidents.length >= 3;
    case 'unlock_panorama_dome':
      return state.moduleLevels.panorama_dome > 0;
    case 'first_renovation':
      return state.reputation > 0;
  }
}

export function completeEligibleGoals(state: GameState): GameState {
  return goals.reduce((current, goal) => {
    if (current.completedGoals.includes(goal.id) || !isGoalEligible(goal.id, current)) {
      return current;
    }

    return {
      ...current,
      comfort: current.comfort + goal.rewardComfort,
      completedGoals: [...current.completedGoals, goal.id]
    };
  }, state);
}

export function getVisibleGoals(state: GameState, limit = 4): GoalDefinition[] {
  return goals.filter((goal) => !state.completedGoals.includes(goal.id)).slice(0, limit);
}
```

- [ ] **Step 6: Wire automatic completion into economy actions**

In `src/game/economy.ts`, import `completeEligibleGoals` and wrap state-producing functions:

```ts
import { completeEligibleGoals } from './goals';
```

At the end of `buyModuleLevel`, return `completeEligibleGoals(nextState)` where `nextState` is the current returned object. At the end of `advanceGame`, return `completeEligibleGoals(nextState)`. At the end of `performPrestige`, return `completeEligibleGoals(nextState)`.

- [ ] **Step 7: Update `GoalPanel`**

In `src/ui/components/GoalPanel.tsx`, replace `goals.slice(0, 4)` and completed text with:

```tsx
const visibleGoals = getVisibleGoals(gameState, 4);
```

Render:

```tsx
<span>{goal.rewardLabel}</span>
```

If `visibleGoals.length === 0`, render one compact card with:

```tsx
<strong>Все ближайшие цели выполнены</strong>
<span>Продолжайте улучшать комнаты</span>
```

- [ ] **Step 8: Run focused tests**

Run:

```bash
npm test -- src/test/goals.test.ts src/test/components.test.tsx src/test/save.test.ts
```

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/game/types.ts src/game/content/goals.ts src/game/goals.ts src/game/economy.ts src/ui/useGameState.ts src/ui/components/GoalPanel.tsx src/test/goals.test.ts src/test/components.test.tsx src/test/save.test.ts
git commit -m "feat: complete goals without credit rewards"
```

---

### Task 3: Focused Room Descriptors

**Files:**
- Create: `src/station/roomScenes.ts`
- Create: `src/test/room-scenes.test.ts`
- Modify: `src/test/station-scene.test.ts`

**Interfaces:**
- Consumes: `GameState`, `ModuleId`, `modules`, `stationTheme`.
- Produces:
  - `RoomDetailTier = 'locked' | 'basic' | 'working' | 'cozy' | 'busy' | 'complete'`
  - `getRoomDetailTier(level: number): RoomDetailTier`
  - `createRoomSelectorItems(gameState: GameState): RoomSelectorItem[]`
  - `resolveSelectedRoomId(gameState: GameState, selectedRoomId: ModuleId | null): ModuleId`
  - `createRoomSceneDescriptor(gameState: GameState, selectedRoomId: ModuleId): RoomSceneDescriptor`

- [ ] **Step 1: Write room descriptor tests**

Create `src/test/room-scenes.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { buyModuleLevel, createInitialState } from '../game/economy';
import { modules } from '../game/content/modules';
import {
  createRoomSceneDescriptor,
  createRoomSelectorItems,
  getRoomDetailTier,
  resolveSelectedRoomId
} from '../station/roomScenes';

function buyLevels(count: number) {
  let state = { ...createInitialState(1_000), credits: 100_000_000 };

  for (let index = 0; index < count; index += 1) {
    state = buyModuleLevel(state, 'tenant_capsule');
  }

  return state;
}

describe('focused room scene descriptors', () => {
  it('maps module levels to detail tiers', () => {
    expect(getRoomDetailTier(0)).toBe('locked');
    expect(getRoomDetailTier(1)).toBe('basic');
    expect(getRoomDetailTier(10)).toBe('working');
    expect(getRoomDetailTier(25)).toBe('cozy');
    expect(getRoomDetailTier(50)).toBe('busy');
    expect(getRoomDetailTier(100)).toBe('complete');
  });

  it('creates one selector item per module with locked state', () => {
    const state = createInitialState(1_000);
    const items = createRoomSelectorItems(state);

    expect(items).toHaveLength(modules.length);
    expect(items[0]).toMatchObject({ moduleId: 'tenant_capsule', unlocked: false, level: 0 });
  });

  it('resolves invalid selected room to first unlocked room and then capsule', () => {
    const empty = createInitialState(1_000);
    const bought = buyModuleLevel(empty, 'tenant_capsule');

    expect(resolveSelectedRoomId(empty, 'saucer_dock')).toBe('tenant_capsule');
    expect(resolveSelectedRoomId(bought, 'saucer_dock')).toBe('tenant_capsule');
  });

  it('describes selected room detail and visual props', () => {
    const state = buyLevels(25);
    const descriptor = createRoomSceneDescriptor(state, 'tenant_capsule');

    expect(descriptor.moduleId).toBe('tenant_capsule');
    expect(descriptor.tier).toBe('cozy');
    expect(descriptor.props.length).toBeGreaterThan(3);
    expect(descriptor.ambientLights.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run room descriptor tests to verify they fail**

Run:

```bash
npm test -- src/test/room-scenes.test.ts
```

Expected: FAIL because `src/station/roomScenes.ts` does not exist.

- [ ] **Step 3: Implement descriptor types and pure helpers**

Create `src/station/roomScenes.ts` with:

```ts
import { Container, Graphics } from 'pixi.js';
import { modules } from '../game/content/modules';
import type { GameState, ModuleId } from '../game/types';
import { stationTheme } from './stationTheme';

export type RoomDetailTier = 'locked' | 'basic' | 'working' | 'cozy' | 'busy' | 'complete';

export interface RoomSelectorItem {
  moduleId: ModuleId;
  name: string;
  level: number;
  unlocked: boolean;
  tier: RoomDetailTier;
}

export interface RoomSceneProp {
  kind: 'bed' | 'kettle' | 'plant' | 'washer' | 'teleport' | 'gym_ring' | 'window_seat' | 'dock_clamp' | 'lamp' | 'patch';
  x: number;
  y: number;
  color: number;
}

export interface RoomSceneDescriptor {
  moduleId: ModuleId;
  name: string;
  level: number;
  tier: RoomDetailTier;
  accentColor: number;
  props: RoomSceneProp[];
  ambientLights: Array<{ x: number; y: number; radius: number; color: number }>;
}

export const ROOM_SCENE_WIDTH = 840;
export const ROOM_SCENE_HEIGHT = 480;

const roomAccentColors: Record<ModuleId, number> = {
  tenant_capsule: stationTheme.lampAmber,
  cosmo_kitchen: stationTheme.lampAmber,
  oxygen_garden: stationTheme.enamelGreen,
  zero_g_laundry: stationTheme.softWhite,
  teleport_entry: stationTheme.utilityBlue,
  antigrav_gym: stationTheme.signalRed,
  panorama_dome: stationTheme.lampAmber,
  saucer_dock: stationTheme.utilityBlue
};
```

Add `getRoomDetailTier`, `createRoomSelectorItems`, `resolveSelectedRoomId` and `createRoomSceneDescriptor`. Use level thresholds exactly from the spec.

- [ ] **Step 4: Implement room-specific prop selection**

Inside `roomScenes.ts`, add:

```ts
function createBaseProps(moduleId: ModuleId, accentColor: number): RoomSceneProp[] {
  const lamp: RoomSceneProp = { kind: 'lamp', x: 660, y: 132, color: stationTheme.lampAmber };
  const patch: RoomSceneProp = { kind: 'patch', x: 184, y: 306, color: stationTheme.enamelGreen };

  switch (moduleId) {
    case 'tenant_capsule':
      return [lamp, patch, { kind: 'bed', x: 328, y: 292, color: accentColor }];
    case 'cosmo_kitchen':
      return [lamp, patch, { kind: 'kettle', x: 398, y: 260, color: accentColor }];
    case 'oxygen_garden':
      return [lamp, patch, { kind: 'plant', x: 420, y: 260, color: accentColor }];
    case 'zero_g_laundry':
      return [lamp, patch, { kind: 'washer', x: 420, y: 260, color: accentColor }];
    case 'teleport_entry':
      return [lamp, patch, { kind: 'teleport', x: 420, y: 252, color: accentColor }];
    case 'antigrav_gym':
      return [lamp, patch, { kind: 'gym_ring', x: 420, y: 246, color: accentColor }];
    case 'panorama_dome':
      return [lamp, patch, { kind: 'window_seat', x: 420, y: 292, color: accentColor }];
    case 'saucer_dock':
      return [lamp, patch, { kind: 'dock_clamp', x: 420, y: 268, color: accentColor }];
  }
}
```

For tiers `working`, `cozy`, `busy` and `complete`, append one extra `patch`, `lamp` or module-specific prop per tier so `props.length` increases with level.

- [ ] **Step 5: Keep old station tests compiling**

Update `src/test/station-scene.test.ts` to stop asserting the old full-map descriptor positions once Task 5 replaces rendering. Keep fit tests or move them to `room-scenes.test.ts` if `calculateStationSceneFit` is renamed.

- [ ] **Step 6: Run room tests**

Run:

```bash
npm test -- src/test/room-scenes.test.ts src/test/station-scene.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/station/roomScenes.ts src/test/room-scenes.test.ts src/test/station-scene.test.ts
git commit -m "feat: describe focused room scenes"
```

---

### Task 4: Selected Room State And Selector UI

**Files:**
- Create: `src/ui/components/RoomSelector.tsx`
- Modify: `src/ui/useGameState.ts`
- Modify: `src/ui/layouts/DesktopLayout.tsx`
- Modify: `src/ui/layouts/MobileLayout.tsx`
- Modify: `src/styles/global.css`
- Modify: `src/test/components.test.tsx`
- Modify: `src/test/app-smoke.test.tsx`

**Interfaces:**
- Consumes: `createRoomSelectorItems`, `resolveSelectedRoomId`, `ModuleId`.
- Produces:
  - `selectedRoomId: ModuleId`
  - `selectRoom(moduleId: ModuleId): void`
  - `RoomSelector` component.

- [ ] **Step 1: Extend hook return type**

In `src/ui/useGameState.ts`, add to `UseGameStateResult`:

```ts
selectedRoomId: ModuleId;
selectRoom(moduleId: ModuleId): void;
```

Add state:

```ts
const [selectedRoomId, setSelectedRoomId] = useState<ModuleId>('tenant_capsule');
```

- [ ] **Step 2: Focus purchased room after successful buy**

Replace `buyLevel` callback body with:

```ts
const buyLevel = useCallback((moduleId: ModuleId) => {
  setGameState((current) => {
    const next = buyModuleLevel(current, moduleId);

    if (next !== current) {
      setSelectedRoomId(moduleId);
    }

    return next;
  });
}, []);
```

- [ ] **Step 3: Keep selected room valid after state changes**

Import:

```ts
import { resolveSelectedRoomId } from '../station/roomScenes';
```

Add effect:

```ts
useEffect(() => {
  setSelectedRoomId((current) => resolveSelectedRoomId(gameState, current));
}, [gameState]);
```

Add manual selection:

```ts
const selectRoom = useCallback(
  (moduleId: ModuleId) => {
    setSelectedRoomId(resolveSelectedRoomId(gameState, moduleId));
  },
  [gameState]
);
```

- [ ] **Step 4: Create `RoomSelector`**

Create `src/ui/components/RoomSelector.tsx`:

```tsx
import { DoorOpen } from 'lucide-react';
import { createRoomSelectorItems } from '../../station/roomScenes';
import type { GameState, ModuleId } from '../../game/types';

interface RoomSelectorProps {
  gameState: GameState;
  selectedRoomId: ModuleId;
  onSelectRoom(moduleId: ModuleId): void;
}

export function RoomSelector({ gameState, selectedRoomId, onSelectRoom }: RoomSelectorProps) {
  const items = createRoomSelectorItems(gameState);

  return (
    <nav className="room-selector" aria-label="Комнаты станции">
      {items.map((item) => (
        <button
          type="button"
          key={item.moduleId}
          className={selectedRoomId === item.moduleId ? 'active' : undefined}
          disabled={!item.unlocked}
          onClick={() => onSelectRoom(item.moduleId)}
        >
          <DoorOpen aria-hidden="true" size={16} />
          <span>{item.name}</span>
          <small>{item.unlocked ? `ур. ${item.level}` : 'закрыто'}</small>
        </button>
      ))}
    </nav>
  );
}
```

- [ ] **Step 5: Mount selector in layouts**

In `DesktopLayout`, render:

```tsx
<div className="station-stack">
  <RoomSelector
    gameState={game.gameState}
    selectedRoomId={game.selectedRoomId}
    onSelectRoom={game.selectRoom}
  />
  <PixiStationScene gameState={game.gameState} selectedRoomId={game.selectedRoomId} />
</div>
```

In `MobileLayout`, render the same `RoomSelector` directly above `PixiStationScene`.

- [ ] **Step 6: Add selector CSS**

Add to `src/styles/global.css`:

```css
.station-stack {
  min-width: 0;
  display: grid;
  gap: 10px;
}

.room-selector {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(116px, 1fr);
  gap: 8px;
  overflow-x: auto;
}

.room-selector button {
  min-height: 50px;
  border: 1px solid color-mix(in srgb, var(--color-utility-blue), transparent 38%);
  border-radius: var(--radius-control);
  background: color-mix(in srgb, var(--color-ink), var(--color-space-navy) 22%);
  color: var(--color-soft-white);
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 4px 6px;
  text-align: left;
}

.room-selector button small {
  grid-column: 2;
  color: var(--color-warm-panel);
}

.room-selector button.active {
  border-color: var(--color-lamp-amber);
  box-shadow: inset 0 0 0 1px var(--color-lamp-amber);
}

.room-selector button:disabled {
  opacity: 0.48;
}
```

- [ ] **Step 7: Update component tests**

In `src/test/components.test.tsx`, pass `selectedRoomId`:

```tsx
<PixiStationScene gameState={gameState} selectedRoomId="tenant_capsule" />
```

Render `RoomSelector` and assert:

```ts
expect(screen.getByRole('navigation', { name: 'Комнаты станции' })).toBeInTheDocument();
```

- [ ] **Step 8: Run UI tests**

Run:

```bash
npm test -- src/test/components.test.tsx src/test/app-smoke.test.tsx
```

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/ui/useGameState.ts src/ui/components/RoomSelector.tsx src/ui/layouts/DesktopLayout.tsx src/ui/layouts/MobileLayout.tsx src/styles/global.css src/test/components.test.tsx src/test/app-smoke.test.tsx
git commit -m "feat: add room selector state"
```

---

### Task 5: Pixi Focused Room Rendering

**Files:**
- Modify: `src/station/roomScenes.ts`
- Modify: `src/station/stationScene.ts`
- Modify: `src/ui/components/PixiStationScene.tsx`
- Modify: `src/test/room-scenes.test.ts`
- Modify: `src/test/station-scene.test.ts`
- Modify: `src/test/components.test.tsx`

**Interfaces:**
- Consumes: `createRoomSceneDescriptor(gameState, selectedRoomId)`.
- Produces: `buildRoomContainer(gameState: GameState, selectedRoomId: ModuleId): Container`.

- [ ] **Step 1: Add room container test**

In `src/test/room-scenes.test.ts`, add:

```ts
import { buildRoomContainer } from '../station/roomScenes';

it('builds a Pixi container for the selected focused room', () => {
  const state = buyModuleLevel(createInitialState(1_000), 'tenant_capsule');
  const container = buildRoomContainer(state, 'tenant_capsule');

  expect(container.children.length).toBeGreaterThan(4);
});
```

- [ ] **Step 2: Run room tests to verify container API fails**

Run:

```bash
npm test -- src/test/room-scenes.test.ts
```

Expected: FAIL because `buildRoomContainer` is not exported.

- [ ] **Step 3: Implement focused room drawing**

In `src/station/roomScenes.ts`, add `buildRoomContainer`:

```ts
export function buildRoomContainer(gameState: GameState, selectedRoomId: ModuleId): Container {
  const descriptor = createRoomSceneDescriptor(gameState, selectedRoomId);
  const container = new Container();

  container.addChild(createRoomBackground(descriptor));
  container.addChild(createRoomShell(descriptor));
  descriptor.props.forEach((prop) => container.addChild(createRoomProp(prop)));
  descriptor.ambientLights.forEach((light) => container.addChild(markAmbientLight(createAmbientLight(light))));

  return container;
}
```

Implement helper functions in the same file:

```ts
function createRoomBackground(descriptor: RoomSceneDescriptor): Graphics {
  const graphics = new Graphics();
  graphics.rect(0, 0, ROOM_SCENE_WIDTH, ROOM_SCENE_HEIGHT).fill(stationTheme.spaceNavy);
  graphics.roundRect(110, 76, 620, 330, 28).fill(stationTheme.ink);
  graphics.roundRect(132, 98, 576, 286, 22).fill(stationTheme.warmPanel);
  graphics.circle(690, 118, 34).fill(descriptor.accentColor);
  return graphics;
}

function createRoomShell(descriptor: RoomSceneDescriptor): Graphics {
  const graphics = new Graphics();
  graphics.roundRect(168, 138, 504, 212, 18).stroke({ color: descriptor.accentColor, width: 5, alpha: 0.9 });
  graphics.roundRect(194, 168, 452, 150, 10).fill(stationTheme.softWhite);
  graphics.alpha = descriptor.tier === 'locked' ? 0.45 : 1;
  return graphics;
}
```

For `createRoomProp`, draw each prop with simple readable shapes. Mark ambient light graphics with `(graphics as Graphics & { label?: string }).label = 'ambient-light'`.

- [ ] **Step 4: Replace Pixi scene construction**

In `src/ui/components/PixiStationScene.tsx`, update props:

```ts
interface PixiStationSceneProps {
  gameState: GameState;
  selectedRoomId: ModuleId;
}
```

Replace `buildStationContainer(gameState)` with:

```ts
buildRoomContainer(gameState, selectedRoomId)
```

Keep the resize fit function. Rename imports from `stationScene` to `roomScenes` if `calculateStationSceneFit` moves.

- [ ] **Step 5: Retire old station overview tests**

In `src/test/station-scene.test.ts`, remove assertions for old module hardpoint positions and active window counts. Keep a test that `calculateStationSceneFit(390, 260)` fits `ROOM_SCENE_WIDTH` and `ROOM_SCENE_HEIGHT`.

- [ ] **Step 6: Run Pixi and component tests**

Run:

```bash
npm test -- src/test/room-scenes.test.ts src/test/station-scene.test.ts src/test/components.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Run build**

Run:

```bash
npm run build
```

Expected: PASS. If sandbox blocks Vite config loading, rerun the same command with sandbox escalation.

- [ ] **Step 8: Commit**

```bash
git add src/station/roomScenes.ts src/station/stationScene.ts src/ui/components/PixiStationScene.tsx src/test/room-scenes.test.ts src/test/station-scene.test.ts src/test/components.test.tsx
git commit -m "feat: render focused pixi room scenes"
```

---

### Task 6: Final Verification And MVP Checklist Update

**Files:**
- Modify: `docs/game-design/11-mvp-verification.md`
- Modify: `docs/game-design/02-economy-balance.md` if final tuned numbers differ from Task 1
- Modify: `docs/game-design/10-progression-roadmap.md` if final tuned numbers differ from Task 1

**Interfaces:**
- Consumes: all previous tasks.
- Produces: verified room scene, goals and balance checklist.

- [ ] **Step 1: Update verification checklist**

In `docs/game-design/11-mvp-verification.md`, add:

```md
## Focused Room Scenes

- Room selector is visible on desktop and mobile.
- Locked rooms are disabled in the selector.
- Buying a module level focuses that room.
- Manual room selection works for unlocked rooms.
- Room detail visibly changes at levels 1, 10, 25, 50 and 100.

## Goals

- Completed goals disappear from the active goal list.
- Goal completion does not add credits.
- Goal rewards use comfort, visual detail, temporary boost or prestige hint labels.

## Balance Pacing

- `npm test -- src/test/balance-simulation.test.ts` passes.
- The last room does not unlock during the first 2-3 minutes of normal simulation.
- `saucer_dock` target unlock remains in the 60-90 minute window without mandatory ads.
```

- [ ] **Step 2: Run all automated tests**

Run:

```bash
npm test
```

Expected: PASS.

- [ ] **Step 3: Run production build**

Run:

```bash
npm run build
```

Expected: PASS. If sandbox blocks Vite config loading, rerun the same command with sandbox escalation.

- [ ] **Step 4: Start dev server**

Run:

```bash
npm run dev
```

Expected: Vite reports a localhost URL, usually `http://127.0.0.1:5173/`.

- [ ] **Step 5: Visual verify desktop**

Open `http://127.0.0.1:5173/` at `1366x768`.

Check:

- canvas is nonblank;
- focused room scene is framed;
- room selector does not overlap side panels;
- buying a level switches to the purchased room;
- goals panel removes completed goals.

- [ ] **Step 6: Visual verify mobile**

Open `http://127.0.0.1:5173/` at `390x844`.

Check:

- selector is horizontally usable;
- station canvas keeps stable height;
- bottom tabs do not cover selector or purchase buttons;
- text does not overflow selector buttons;
- completed goals disappear from active goals tab.

- [ ] **Step 7: Stop dev server**

Stop the running Vite process before ending the task.

- [ ] **Step 8: Commit**

```bash
git add docs/game-design/11-mvp-verification.md docs/game-design/02-economy-balance.md docs/game-design/10-progression-roadmap.md
git commit -m "docs: verify focused room scene loop"
```

---

## Self-Review

Spec coverage:

- Focused selectable room scenes: Tasks 3, 4 and 5.
- Automatic focus after upgrade: Task 4.
- Locked rooms disabled in selector: Tasks 3 and 4.
- Detail tiers at levels `1`, `10`, `25`, `50`, `100`: Task 3.
- Completed goals disappear: Task 2.
- No credit goal rewards: Task 2.
- Slower late-room pacing and regression test: Task 1.
- Desktop/mobile verification: Task 6.

Completeness scan:

- No unfinished implementation markers are intended in this plan.
- Each new function named in later tasks is introduced in an earlier task.

Type consistency:

- `ModuleId`, `GoalId`, `GameState` remain in `src/game/types.ts`.
- `selectedRoomId` is always a `ModuleId`.
- `RoomSelectorItem.moduleId` is a `ModuleId`.
- `PixiStationScene` consumes `gameState` and `selectedRoomId`.
- `buildRoomContainer` consumes `GameState` and `ModuleId` and returns a Pixi `Container`.
