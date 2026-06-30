# Station Director Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a compact Station Director layer that tells the player the next useful action without forcing a quest chain.

**Architecture:** A pure `src/game/stationDirector.ts` module derives guidance from `GameState`, current income and UI-owned daily reward state. React renders that guidance through a small `StationTaskPanel` component in both desktop and mobile layouts. The hook keeps owning actions and selected-room state; the Director only recommends.

**Tech Stack:** TypeScript, React 19, Vitest, Testing Library, existing CSS in `src/styles/global.css`.

## Global Constraints

- Implement Pass 1 only: Station Director / next action guidance.
- Do not implement resident stories in this plan.
- Do not implement room condition or repair mechanics in this plan.
- Do not add new currencies.
- Do not add new monetization placements.
- Keep PixiJS free of readable UI text and buttons.
- Keep recommendation rules outside `src/ui/useGameState.ts`.
- Desktop and mobile must use the same Station Director data.
- Guidance must never block manual play.

---

## File Structure

- Create `src/game/stationDirector.ts`: pure guidance derivation, progress helpers and recommendation priority.
- Create `src/test/station-director.test.ts`: domain tests for guidance priority, wait time and room targets.
- Create `src/ui/components/StationTaskPanel.tsx`: presentational React component for guidance.
- Create `src/test/station-task-panel.test.tsx`: UI tests for copy, progress and room selection action.
- Modify `src/platform/i18n.ts`: add localized Station Director labels and copy.
- Modify `src/ui/layouts/DesktopLayout.tsx`: compute guidance and render the panel in the desktop main loop.
- Modify `src/ui/layouts/MobileLayout.tsx`: compute guidance and render the panel above the mobile room scene.
- Modify `src/styles/global.css`: add compact panel styles that do not resize the canvas.
- Modify `src/test/components.test.tsx`: include the new panel in the component smoke test.
- Modify `src/test/responsive.test.tsx`: verify Station Director appears in both desktop and mobile active layouts.
- Modify `docs/game-design/01-core-loop.md`: document that next-action guidance is now part of the first pass.
- Modify `docs/game-design/11-mvp-verification.md`: add verification checks for the guidance panel.

---

### Task 1: Pure Station Director Domain Module

**Files:**
- Create: `src/game/stationDirector.ts`
- Create: `src/test/station-director.test.ts`

**Interfaces:**
- Consumes: `GameState`, `ModuleId`, `GoalId`, `calculateModuleCost`, `calculatePrestigeReward`, `modules`, `getVisibleGoals`.
- Produces:
  - `StationGuidance`
  - `StationGuidanceCopyKey`
  - `StationGuidanceInput`
  - `getStationGuidance(input: StationGuidanceInput): StationGuidance`

- [ ] **Step 1: Write the failing domain tests**

Create `src/test/station-director.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createInitialState } from '../game/economy';
import { getStationGuidance } from '../game/stationDirector';
import type { GameState } from '../game/types';

function withCapsuleLevel(level: number): GameState {
  const base = createInitialState(1_000);

  return {
    ...base,
    moduleLevels: {
      ...base.moduleLevels,
      tenant_capsule: level
    }
  };
}

describe('station director guidance', () => {
  it('prioritizes an affordable visitor over normal module upgrades', () => {
    const state: GameState = {
      ...createInitialState(1_000),
      credits: 250,
      activeVisitor: {
        id: 'visitor-1',
        name: 'Visitor',
        flavor: 'Needs a room',
        cost: 100,
        rewardComfort: 2,
        expiresAt: 120_000,
        template: 'mechanic'
      }
    };

    const guidance = getStationGuidance({ state, incomePerSecond: 1 });

    expect(guidance.kind).toBe('visitor');
    expect(guidance.priority).toBe(100);
    expect(guidance.canActNow).toBe(true);
  });

  it('prioritizes a close goal before a generic module upgrade', () => {
    const state = {
      ...withCapsuleLevel(9),
      credits: 1_000
    };

    const guidance = getStationGuidance({ state, incomePerSecond: 5 });

    expect(guidance.kind).toBe('goal');
    expect(guidance.goalId).toBe('buy_capsule_10');
    expect(guidance.targetRoomId).toBe('tenant_capsule');
    expect(guidance.progressCurrent).toBe(9);
    expect(guidance.progressTarget).toBe(10);
  });

  it('recommends an affordable room upgrade with a room target', () => {
    const state = {
      ...createInitialState(1_000),
      credits: 15
    };

    const guidance = getStationGuidance({ state, incomePerSecond: 0 });

    expect(guidance.kind).toBe('module');
    expect(guidance.moduleId).toBe('tenant_capsule');
    expect(guidance.targetRoomId).toBe('tenant_capsule');
    expect(guidance.canAfford).toBe(true);
    expect(guidance.waitSeconds).toBe(0);
  });

  it('includes a finite wait time for unaffordable unlocked upgrades when income is positive', () => {
    const state = {
      ...createInitialState(1_000),
      credits: 10
    };

    const guidance = getStationGuidance({ state, incomePerSecond: 2 });

    expect(guidance.kind).toBe('module');
    expect(guidance.canAfford).toBe(false);
    expect(guidance.waitSeconds).toBeGreaterThan(0);
    expect(Number.isFinite(guidance.waitSeconds)).toBe(true);
  });

  it('does not produce an invalid wait time when income is zero', () => {
    const state = {
      ...createInitialState(1_000),
      credits: 0
    };

    const guidance = getStationGuidance({ state, incomePerSecond: 0 });

    expect(guidance.kind).toBe('module');
    expect(guidance.canAfford).toBe(false);
    expect(guidance.waitSeconds).toBeNull();
  });

  it('shows prestige guidance when renovation can produce reputation', () => {
    const state = {
      ...createInitialState(1_000),
      totalEarnedCredits: 100_000
    };

    const guidance = getStationGuidance({ state, incomePerSecond: 10 });

    expect(guidance.kind).toBe('prestige');
    expect(guidance.canRenovate).toBe(true);
    expect(guidance.expectedReputation).toBe(1);
  });

  it('can surface a pending daily reward above normal purchases', () => {
    const guidance = getStationGuidance({
      state: createInitialState(1_000),
      incomePerSecond: 0,
      hasPendingDailyReward: true
    });

    expect(guidance.kind).toBe('daily');
    expect(guidance.priority).toBe(90);
  });
});
```

- [ ] **Step 2: Run the failing domain tests**

Run:

```bash
npm test -- src/test/station-director.test.ts
```

Expected: FAIL because `src/game/stationDirector.ts` does not exist.

- [ ] **Step 3: Implement the pure guidance module**

Create `src/game/stationDirector.ts`:

```ts
import { modules } from './content/modules';
import { calculateModuleCost, calculatePrestigeReward } from './economy';
import { getVisibleGoals } from './goals';
import type { GameState, GoalId, ModuleId } from './types';

export type StationGuidanceCopyKey =
  | 'visitor'
  | 'daily'
  | 'goal'
  | 'module_buy'
  | 'module_wait'
  | 'module_unlock'
  | 'prestige';

interface StationGuidanceBase {
  kind: 'visitor' | 'daily' | 'goal' | 'module' | 'prestige';
  priority: number;
  copyKey: StationGuidanceCopyKey;
  targetRoomId?: ModuleId;
  canActNow: boolean;
}

export interface VisitorGuidance extends StationGuidanceBase {
  kind: 'visitor';
  visitorCost: number;
  visitorRewardComfort: number;
}

export interface DailyGuidance extends StationGuidanceBase {
  kind: 'daily';
}

export interface GoalGuidance extends StationGuidanceBase {
  kind: 'goal';
  goalId: GoalId;
  progressCurrent: number;
  progressTarget: number;
}

export interface ModuleGuidance extends StationGuidanceBase {
  kind: 'module';
  moduleId: ModuleId;
  canAfford: boolean;
  cost: number;
  waitSeconds: number | null;
}

export interface PrestigeGuidance extends StationGuidanceBase {
  kind: 'prestige';
  canRenovate: boolean;
  expectedReputation: number;
}

export type StationGuidance =
  | VisitorGuidance
  | DailyGuidance
  | GoalGuidance
  | ModuleGuidance
  | PrestigeGuidance;

export interface StationGuidanceInput {
  state: GameState;
  incomePerSecond: number;
  hasPendingDailyReward?: boolean;
}

interface GoalProgress {
  goalId: GoalId;
  current: number;
  target: number;
  targetRoomId?: ModuleId;
}

function clampProgress(current: number, target: number): GoalProgress['current'] {
  return Math.max(0, Math.min(current, target));
}

function getGoalProgress(goalId: GoalId, state: GameState): GoalProgress {
  switch (goalId) {
    case 'buy_capsule_10':
      return {
        goalId,
        current: clampProgress(state.moduleLevels.tenant_capsule, 10),
        target: 10,
        targetRoomId: 'tenant_capsule'
      };
    case 'unlock_kitchen':
      return {
        goalId,
        current: state.moduleLevels.cosmo_kitchen > 0 ? 1 : 0,
        target: 1,
        targetRoomId: 'cosmo_kitchen'
      };
    case 'reach_comfort_25':
      return {
        goalId,
        current: clampProgress(state.comfort, 25),
        target: 25
      };
    case 'earn_credits_10000':
      return {
        goalId,
        current: clampProgress(Math.floor(state.totalEarnedCredits), 10_000),
        target: 10_000
      };
    case 'unlock_three_residents':
      return {
        goalId,
        current: clampProgress(state.unlockedResidents.length, 3),
        target: 3
      };
    case 'unlock_panorama_dome':
      return {
        goalId,
        current: state.moduleLevels.panorama_dome > 0 ? 1 : 0,
        target: 1,
        targetRoomId: 'panorama_dome'
      };
    case 'first_renovation':
      return {
        goalId,
        current: state.reputation > 0 ? 1 : 0,
        target: 1
      };
  }
}

function getCloseGoalGuidance(state: GameState): GoalGuidance | null {
  const visibleGoals = getVisibleGoals(state, 4);

  for (const goal of visibleGoals) {
    const progress = getGoalProgress(goal.id, state);
    const ratio = progress.target === 0 ? 0 : progress.current / progress.target;

    if (ratio < 0.7 || progress.current >= progress.target) {
      continue;
    }

    return {
      kind: 'goal',
      priority: 80,
      copyKey: 'goal',
      canActNow: false,
      goalId: goal.id,
      targetRoomId: progress.targetRoomId,
      progressCurrent: progress.current,
      progressTarget: progress.target
    };
  }

  return null;
}

function getNextModuleGuidance(state: GameState, incomePerSecond: number): ModuleGuidance {
  const unlockedModules = modules.filter((module) => state.totalEarnedCredits >= module.unlockAtCredits);
  const nextLockedModule = modules.find((module) => state.totalEarnedCredits < module.unlockAtCredits);
  const affordable = unlockedModules.find((module) => state.credits >= calculateModuleCost(module.id, state));
  const targetModule = affordable ?? unlockedModules[0] ?? modules[0];
  const cost = calculateModuleCost(targetModule.id, state);
  const missingCredits = Math.max(0, cost - state.credits);
  const waitSeconds = missingCredits === 0
    ? 0
    : incomePerSecond > 0
      ? Math.ceil(missingCredits / incomePerSecond)
      : null;

  if (!affordable && nextLockedModule && state.totalEarnedCredits < targetModule.unlockAtCredits) {
    return {
      kind: 'module',
      priority: 50,
      copyKey: 'module_unlock',
      canActNow: false,
      moduleId: nextLockedModule.id,
      targetRoomId: nextLockedModule.id,
      canAfford: false,
      cost: nextLockedModule.unlockAtCredits,
      waitSeconds: null
    };
  }

  return {
    kind: 'module',
    priority: affordable ? 70 : 60,
    copyKey: affordable ? 'module_buy' : 'module_wait',
    canActNow: Boolean(affordable),
    moduleId: targetModule.id,
    targetRoomId: targetModule.id,
    canAfford: Boolean(affordable),
    cost,
    waitSeconds
  };
}

export function getStationGuidance({
  state,
  incomePerSecond,
  hasPendingDailyReward = false
}: StationGuidanceInput): StationGuidance {
  if (state.activeVisitor && state.credits >= state.activeVisitor.cost) {
    return {
      kind: 'visitor',
      priority: 100,
      copyKey: 'visitor',
      canActNow: true,
      visitorCost: state.activeVisitor.cost,
      visitorRewardComfort: state.activeVisitor.rewardComfort
    };
  }

  if (hasPendingDailyReward) {
    return {
      kind: 'daily',
      priority: 90,
      copyKey: 'daily',
      canActNow: true
    };
  }

  const closeGoal = getCloseGoalGuidance(state);

  if (closeGoal) {
    return closeGoal;
  }

  const prestigeReward = calculatePrestigeReward(state);

  if (prestigeReward > 0) {
    return {
      kind: 'prestige',
      priority: 75,
      copyKey: 'prestige',
      canActNow: true,
      canRenovate: true,
      expectedReputation: prestigeReward
    };
  }

  return getNextModuleGuidance(state, incomePerSecond);
}
```

- [ ] **Step 4: Run the domain tests**

Run:

```bash
npm test -- src/test/station-director.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit Task 1**

Run:

```bash
git add -- src/game/stationDirector.ts src/test/station-director.test.ts
git commit -m "feat: add station director guidance"
```

---

### Task 2: Station Task Panel Component

**Files:**
- Create: `src/ui/components/StationTaskPanel.tsx`
- Create: `src/test/station-task-panel.test.tsx`
- Modify: `src/platform/i18n.ts`

**Interfaces:**
- Consumes: `StationGuidance`, `ModuleId`, `Translation`, `formatCredits`, `formatDuration`.
- Produces: `StationTaskPanel({ guidance, onSelectRoom, onRenovate, t })`.

- [ ] **Step 1: Extend translation types and copy**

Modify `src/platform/i18n.ts` `Translation` with these fields near the panel labels:

```ts
  currentTask: string;
  taskVisitorTitle: string;
  taskVisitorBody: string;
  taskDailyTitle: string;
  taskDailyBody: string;
  taskGoalTitle: string;
  taskGoalBody: string;
  taskModuleBuyTitle: string;
  taskModuleBuyBody: string;
  taskModuleWaitTitle: string;
  taskModuleWaitBody: string;
  taskModuleUnlockTitle: string;
  taskModuleUnlockBody: string;
  taskPrestigeTitle: string;
  taskPrestigeBody: string;
  taskSelectRoom: string;
  taskRenovate: string;
  taskCost: string;
  taskWait: string;
  taskProgress: string;
```

Add Russian values to `const ru: Translation = { ... }`:

```ts
  currentTask: 'РўРµРєСѓС‰Р°СЏ Р·Р°РґР°С‡Р°',
  taskVisitorTitle: 'РџСЂРёРЅСЏС‚СЊ РіРѕСЃС‚СЏ СЃС‚Р°РЅС†РёРё',
  taskVisitorBody: 'Р“РѕСЃС‚СЊ РґР°СЃС‚ РєРѕРјС„РѕСЂС‚, РµСЃР»Рё СЃРµР№С‡Р°СЃ РµРіРѕ РїСЂРёРЅСЏС‚СЊ.',
  taskDailyTitle: 'Р—Р°Р±СЂР°С‚СЊ РµР¶РµРґРЅРµРІРЅСѓСЋ РЅР°РіСЂР°РґСѓ',
  taskDailyBody: 'Р­С‚Рѕ Р±С‹СЃС‚СЂС‹Р№ СЃС‚Р°СЂС‚ РґР»СЏ СЃР»РµРґСѓСЋС‰РµР№ РїРѕРєСѓРїРєРё.',
  taskGoalTitle: 'Р”РѕР¶Р°С‚СЊ Р±Р»РёР·РєСѓСЋ С†РµР»СЊ',
  taskGoalBody: 'Р¦РµР»СЊ СѓР¶Рµ РїРѕС‡С‚Рё РіРѕС‚РѕРІР°, Рё РѕРЅР° РїРѕРјРѕР¶РµС‚ СЃС‚Р°РЅС†РёРё СЂР°СЃС‚Рё.',
  taskModuleBuyTitle: 'РљСѓРїРёС‚СЊ СѓР»СѓС‡С€РµРЅРёРµ РєРѕРјРЅР°С‚С‹',
  taskModuleBuyBody: 'Р­С‚Рѕ СЃР°РјС‹Р№ РїРѕР»РµР·РЅС‹Р№ С€Р°Рі РґР»СЏ СЂРѕСЃС‚Р° РґРѕС…РѕРґР°.',
  taskModuleWaitTitle: 'РќР°РєРѕРїРёС‚СЊ РЅР° СЃР»РµРґСѓСЋС‰РµРµ СѓР»СѓС‡С€РµРЅРёРµ',
  taskModuleWaitBody: 'Р”РѕС…РѕРґ СѓР¶Рµ РёРґРµС‚, РѕСЃС‚Р°Р»РѕСЃСЊ РґРѕР¶РґР°С‚СЊСЃСЏ РїРѕРєСѓРїРєРё.',
  taskModuleUnlockTitle: 'РћС‚РєСЂС‹С‚СЊ СЃР»РµРґСѓСЋС‰СѓСЋ РєРѕРјРЅР°С‚Сѓ',
  taskModuleUnlockBody: 'РљРѕРјРЅР°С‚Р° СЃС‚Р°РЅРµС‚ РґРѕСЃС‚СѓРїРЅР° РїРѕСЃР»Рµ РґРѕСЃС‚Р°С‚РѕС‡РЅРѕРіРѕ РѕР±С‰РµРіРѕ Р·Р°СЂР°Р±РѕС‚РєР°.',
  taskPrestigeTitle: 'РџРѕРґРіРѕС‚РѕРІРёС‚СЊ СЂРµРЅРѕРІР°С†РёСЋ',
  taskPrestigeBody: 'Р РµРЅРѕРІР°С†РёСЏ РґР°СЃС‚ СЂРµРїСѓС‚Р°С†РёСЋ Рё СѓСЃРёР»РёС‚ СЃР»РµРґСѓСЋС‰РёР№ С†РёРєР».',
  taskSelectRoom: 'РџРѕРєР°Р·Р°С‚СЊ РєРѕРјРЅР°С‚Сѓ',
  taskRenovate: 'Рљ СЂРµРЅРѕРІР°С†РёРё',
  taskCost: 'Р¦РµРЅР°',
  taskWait: 'Р–РґР°С‚СЊ',
  taskProgress: 'РџСЂРѕРіСЂРµСЃСЃ',
```

Add English values to `const en: Translation = { ... }`:

```ts
  currentTask: 'Current task',
  taskVisitorTitle: 'Welcome a station visitor',
  taskVisitorBody: 'The visitor adds comfort if you accept the request now.',
  taskDailyTitle: 'Collect the daily reward',
  taskDailyBody: 'This gives a quick start toward the next purchase.',
  taskGoalTitle: 'Finish a close goal',
  taskGoalBody: 'This goal is almost done and will help the station grow.',
  taskModuleBuyTitle: 'Buy a room upgrade',
  taskModuleBuyBody: 'This is the most useful next step for income growth.',
  taskModuleWaitTitle: 'Save for the next upgrade',
  taskModuleWaitBody: 'Income is already running; wait until the room can be upgraded.',
  taskModuleUnlockTitle: 'Unlock the next room',
  taskModuleUnlockBody: 'The room opens after enough lifetime earnings.',
  taskPrestigeTitle: 'Prepare an orbit renovation',
  taskPrestigeBody: 'Renovation grants reputation and strengthens the next cycle.',
  taskSelectRoom: 'Show room',
  taskRenovate: 'Go to renovation',
  taskCost: 'Cost',
  taskWait: 'Wait',
  taskProgress: 'Progress',
```

- [ ] **Step 2: Write the failing component tests**

Create `src/test/station-task-panel.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { StationGuidance } from '../game/stationDirector';
import { translations } from '../platform/i18n';
import { StationTaskPanel } from '../ui/components/StationTaskPanel';

const t = translations.en;

describe('StationTaskPanel', () => {
  it('renders module guidance with translated copy and cost', () => {
    const guidance: StationGuidance = {
      kind: 'module',
      priority: 70,
      copyKey: 'module_buy',
      canActNow: true,
      moduleId: 'tenant_capsule',
      targetRoomId: 'tenant_capsule',
      canAfford: true,
      cost: 15,
      waitSeconds: 0
    };

    render(<StationTaskPanel guidance={guidance} onSelectRoom={vi.fn()} t={t} />);

    expect(screen.getByRole('heading', { name: t.currentTask })).toBeInTheDocument();
    expect(screen.getByText(t.taskModuleBuyTitle)).toBeInTheDocument();
    expect(screen.getByText(t.taskModuleBuyBody)).toBeInTheDocument();
    expect(screen.getByText(/15/)).toBeInTheDocument();
  });

  it('calls onSelectRoom when room-focused guidance action is clicked', async () => {
    const user = userEvent.setup();
    const onSelectRoom = vi.fn();
    const guidance: StationGuidance = {
      kind: 'goal',
      priority: 80,
      copyKey: 'goal',
      canActNow: false,
      goalId: 'buy_capsule_10',
      targetRoomId: 'tenant_capsule',
      progressCurrent: 9,
      progressTarget: 10
    };

    render(<StationTaskPanel guidance={guidance} onSelectRoom={onSelectRoom} t={t} />);

    await user.click(screen.getByRole('button', { name: t.taskSelectRoom }));

    expect(onSelectRoom).toHaveBeenCalledWith('tenant_capsule');
    expect(screen.getByText('9/10')).toBeInTheDocument();
  });

  it('calls onRenovate when prestige guidance action is clicked', async () => {
    const user = userEvent.setup();
    const onRenovate = vi.fn();
    const guidance: StationGuidance = {
      kind: 'prestige',
      priority: 85,
      copyKey: 'prestige',
      canActNow: true,
      canRenovate: true,
      expectedReputation: 1
    };

    render(<StationTaskPanel guidance={guidance} onRenovate={onRenovate} t={t} />);

    await user.click(screen.getByRole('button', { name: t.taskRenovate }));

    expect(onRenovate).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 3: Run the failing component tests**

Run:

```bash
npm test -- src/test/station-task-panel.test.tsx
```

Expected: FAIL because `StationTaskPanel` does not exist.

- [ ] **Step 4: Implement the component**

Create `src/ui/components/StationTaskPanel.tsx`:

```tsx
'use client';

import { ClipboardList, DoorOpen, RotateCcw } from 'lucide-react';
import { formatCredits, formatDuration } from '../../game/format';
import type { StationGuidance, StationGuidanceCopyKey } from '../../game/stationDirector';
import type { ModuleId } from '../../game/types';
import type { Translation } from '../../platform/i18n';

interface StationTaskPanelProps {
  guidance: StationGuidance;
  onSelectRoom?(moduleId: ModuleId): void;
  onRenovate?(): void;
  t: Translation;
}

function getTitle(copyKey: StationGuidanceCopyKey, t: Translation): string {
  switch (copyKey) {
    case 'visitor':
      return t.taskVisitorTitle;
    case 'daily':
      return t.taskDailyTitle;
    case 'goal':
      return t.taskGoalTitle;
    case 'module_buy':
      return t.taskModuleBuyTitle;
    case 'module_wait':
      return t.taskModuleWaitTitle;
    case 'module_unlock':
      return t.taskModuleUnlockTitle;
    case 'prestige':
      return t.taskPrestigeTitle;
  }
}

function getBody(copyKey: StationGuidanceCopyKey, t: Translation): string {
  switch (copyKey) {
    case 'visitor':
      return t.taskVisitorBody;
    case 'daily':
      return t.taskDailyBody;
    case 'goal':
      return t.taskGoalBody;
    case 'module_buy':
      return t.taskModuleBuyBody;
    case 'module_wait':
      return t.taskModuleWaitBody;
    case 'module_unlock':
      return t.taskModuleUnlockBody;
    case 'prestige':
      return t.taskPrestigeBody;
  }
}

function GuidanceMeta({ guidance, t }: { guidance: StationGuidance; t: Translation }) {
  if (guidance.kind === 'module') {
    return (
      <dl className="station-task-meta">
        <div>
          <dt>{t.taskCost}</dt>
          <dd>{formatCredits(guidance.cost)}</dd>
        </div>
        <div>
          <dt>{t.taskWait}</dt>
          <dd>{guidance.waitSeconds === null ? '-' : formatDuration(guidance.waitSeconds)}</dd>
        </div>
      </dl>
    );
  }

  if (guidance.kind === 'goal') {
    return (
      <dl className="station-task-meta">
        <div>
          <dt>{t.taskProgress}</dt>
          <dd>{guidance.progressCurrent}/{guidance.progressTarget}</dd>
        </div>
      </dl>
    );
  }

  if (guidance.kind === 'prestige') {
    return (
      <dl className="station-task-meta">
        <div>
          <dt>{t.reputation}</dt>
          <dd>+{guidance.expectedReputation}</dd>
        </div>
      </dl>
    );
  }

  if (guidance.kind === 'visitor') {
    return (
      <dl className="station-task-meta">
        <div>
          <dt>{t.taskCost}</dt>
          <dd>{formatCredits(guidance.visitorCost)}</dd>
        </div>
        <div>
          <dt>{t.reward}</dt>
          <dd>+{guidance.visitorRewardComfort} {t.comfortWord}</dd>
        </div>
      </dl>
    );
  }

  return null;
}

export function StationTaskPanel({ guidance, onSelectRoom, onRenovate, t }: StationTaskPanelProps) {
  const title = getTitle(guidance.copyKey, t);
  const body = getBody(guidance.copyKey, t);
  const canSelectRoom = Boolean(guidance.targetRoomId && onSelectRoom);
  const canRenovate = guidance.kind === 'prestige' && guidance.canRenovate && onRenovate;

  return (
    <section className="panel station-task-panel" aria-labelledby="station-task-title">
      <div className="station-task-heading">
        <ClipboardList aria-hidden="true" size={17} />
        <h2 id="station-task-title">{t.currentTask}</h2>
      </div>
      <div className="station-task-body">
        <div>
          <strong>{title}</strong>
          <p>{body}</p>
          <GuidanceMeta guidance={guidance} t={t} />
        </div>
        <div className="station-task-actions">
          {canSelectRoom && (
            <button type="button" onClick={() => onSelectRoom?.(guidance.targetRoomId!)}>
              <DoorOpen aria-hidden="true" size={16} />
              {t.taskSelectRoom}
            </button>
          )}
          {canRenovate && (
            <button type="button" onClick={onRenovate}>
              <RotateCcw aria-hidden="true" size={16} />
              {t.taskRenovate}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Run the component tests**

Run:

```bash
npm test -- src/test/station-task-panel.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit Task 2**

Run:

```bash
git add -- src/platform/i18n.ts src/ui/components/StationTaskPanel.tsx src/test/station-task-panel.test.tsx
git commit -m "feat: render station director task panel"
```

---

### Task 3: Desktop And Mobile Integration

**Files:**
- Modify: `src/ui/layouts/DesktopLayout.tsx`
- Modify: `src/ui/layouts/MobileLayout.tsx`
- Modify: `src/styles/global.css`
- Modify: `src/test/components.test.tsx`
- Modify: `src/test/responsive.test.tsx`

**Interfaces:**
- Consumes: `getStationGuidance({ state, incomePerSecond, hasPendingDailyReward })`.
- Produces: one Station Task panel per active layout.

- [ ] **Step 1: Update desktop layout**

Modify imports in `src/ui/layouts/DesktopLayout.tsx`:

```ts
import { getStationGuidance } from '../../game/stationDirector';
import { StationTaskPanel } from '../components/StationTaskPanel';
```

Inside `DesktopLayout`, before `return`, add:

```ts
  const stationGuidance = getStationGuidance({
    state: game.gameState,
    incomePerSecond: game.incomePerSecond,
    hasPendingDailyReward: Boolean(game.dailyReward)
  });
```

Render the panel inside `.station-stack`, before `RoomSelector`:

```tsx
        <StationTaskPanel
          guidance={stationGuidance}
          onSelectRoom={game.selectRoom}
          onRenovate={game.renovateOrbit}
          t={t}
        />
```

- [ ] **Step 2: Update mobile layout**

Modify imports in `src/ui/layouts/MobileLayout.tsx`:

```ts
import { getStationGuidance } from '../../game/stationDirector';
import { StationTaskPanel } from '../components/StationTaskPanel';
```

Inside `MobileLayout`, before `return`, add:

```ts
  const stationGuidance = getStationGuidance({
    state: game.gameState,
    incomePerSecond: game.incomePerSecond,
    hasPendingDailyReward: Boolean(game.dailyReward)
  });
```

Render the panel after `TopBar` and before `RoomSelector`:

```tsx
      <StationTaskPanel
        guidance={stationGuidance}
        onSelectRoom={game.selectRoom}
        onRenovate={game.renovateOrbit}
        t={t}
      />
```

- [ ] **Step 3: Add compact styles**

Append near other panel styles in `src/styles/global.css`:

```css
.station-task-panel {
  display: grid;
  gap: 10px;
}

.station-task-heading {
  display: flex;
  align-items: center;
  gap: 8px;
}

.station-task-heading h2 {
  margin: 0;
  font-size: 1rem;
}

.station-task-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
}

.station-task-body strong,
.station-task-body p {
  margin: 0 0 6px;
}

.station-task-body p {
  color: var(--color-utility-blue);
  font-size: 0.86rem;
  font-weight: 700;
  line-height: 1.35;
}

.station-task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
}

.station-task-meta div {
  display: inline-flex;
  gap: 4px;
  align-items: baseline;
}

.station-task-meta dt,
.station-task-meta dd {
  margin: 0;
  font-size: 0.8rem;
}

.station-task-meta dt {
  color: var(--color-utility-blue);
  font-weight: 700;
}

.station-task-meta dd {
  color: var(--color-ink);
  font-weight: 800;
}

.station-task-actions {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 640px) {
  .station-task-body {
    grid-template-columns: 1fr;
  }

  .station-task-actions {
    justify-content: stretch;
  }

  .station-task-actions button {
    width: 100%;
  }
}
```

- [ ] **Step 4: Update component smoke test**

Modify `src/test/components.test.tsx` imports:

```ts
import { getStationGuidance } from '../game/stationDirector';
import { StationTaskPanel } from '../ui/components/StationTaskPanel';
```

Inside the first test, after `gameState` is created:

```ts
    const guidance = getStationGuidance({
      state: gameState,
      incomePerSecond: calculateIncomePerSecond(gameState)
    });
```

Render `StationTaskPanel` after `TopBar`:

```tsx
        <StationTaskPanel guidance={guidance} onSelectRoom={vi.fn()} onRenovate={vi.fn()} t={t} />
```

Add an assertion:

```ts
    expect(screen.getByRole('heading', { name: t.currentTask })).toBeInTheDocument();
```

- [ ] **Step 5: Update responsive tests**

In `src/test/responsive.test.tsx`, add this test before the bottom-tabs test:

```tsx
  it('renders station director guidance in the active responsive layout', async () => {
    setViewportWidth(390);
    render(<App />);

    await screen.findAllByText(t.content.modules.tenant_capsule.name);

    expect(screen.getAllByRole('heading', { name: t.currentTask })).toHaveLength(1);
  });
```

- [ ] **Step 6: Run UI and responsive tests**

Run:

```bash
npm test -- src/test/components.test.tsx src/test/responsive.test.tsx src/test/station-task-panel.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit Task 3**

Run:

```bash
git add -- src/ui/layouts/DesktopLayout.tsx src/ui/layouts/MobileLayout.tsx src/styles/global.css src/test/components.test.tsx src/test/responsive.test.tsx
git commit -m "feat: integrate station director layouts"
```

---

### Task 4: Documentation And Full Verification

**Files:**
- Modify: `docs/game-design/01-core-loop.md`
- Modify: `docs/game-design/11-mvp-verification.md`

**Interfaces:**
- Consumes: implemented Station Director behavior.
- Produces: updated design docs that match the new first-pass direction.

- [ ] **Step 1: Update core loop documentation**

In `docs/game-design/01-core-loop.md`, add this paragraph after the core loop description:

```md
Station Director guidance is the first-pass answer to "what should I do next?".
It derives one current task from game state, income, goals, visitors and
prestige readiness. It does not force the player into a quest chain; it simply
keeps the next useful action visible on both desktop and mobile.
```

- [ ] **Step 2: Update MVP verification documentation**

In `docs/game-design/11-mvp-verification.md`, add these checks under the UI or gameplay verification section:

```md
- Station Director panel is visible in the active desktop layout.
- Station Director panel is visible in the active mobile layout.
- The panel shows one current task derived from state, not a hardcoded tutorial.
- A room-focused task can focus the relevant room without buying anything.
- Prestige guidance appears only when renovation can grant reputation.
```

- [ ] **Step 3: Run focused tests**

Run:

```bash
npm test -- src/test/station-director.test.ts src/test/station-task-panel.test.tsx src/test/components.test.tsx src/test/responsive.test.tsx
```

Expected: PASS.

- [ ] **Step 4: Run the full test suite**

Run:

```bash
npm test
```

Expected: PASS.

- [ ] **Step 5: Run production build**

Run:

```bash
npm run build
```

Expected: TypeScript compile succeeds and Vite build completes.

- [ ] **Step 6: Check git diff hygiene**

Run:

```bash
git diff --check
git status -sb
```

Expected: `git diff --check` prints nothing. `git status -sb` shows only intentional modified files before the final commit.

- [ ] **Step 7: Commit Task 4**

Run:

```bash
git add -- docs/game-design/01-core-loop.md docs/game-design/11-mvp-verification.md
git commit -m "docs: document station director guidance"
```

---

## Self-Review Checklist

- Pass 1 is implemented without resident stories.
- Pass 1 is implemented without room-condition mechanics.
- `useGameState.ts` does not contain recommendation rules.
- Station Director tests cover visitor, daily, close goal, module, zero-income wait and prestige guidance.
- Both layouts render exactly one Station Task panel in the active responsive layout.
- All new visible text comes from `src/platform/i18n.ts`.
- Full `npm test` passes.
- `npm run build` passes.
