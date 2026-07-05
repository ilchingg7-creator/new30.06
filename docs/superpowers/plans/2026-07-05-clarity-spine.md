# Clarity Spine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a thin gameplay-clarity layer that explains what each major action does, why it matters, and what result the player should expect.

**Architecture:** Add pure preview helpers in `src/game/actionPreviews.ts` and render their structured output in existing React panels. Keep Station Director, module cards, duties, incident choices, renovation and last-action feedback on the same preview vocabulary so desktop and mobile stay consistent.

**Tech Stack:** TypeScript, React, Vitest, existing i18n object, existing save schema.

## Global Constraints

- No new runtime dependencies.
- No new tutorial state.
- No new currencies.
- No new progression mechanics.
- No full layout redesign.
- No new room art or visual scenes.
- No balance rebalance beyond clearer reward presentation.
- Preview helpers must not mutate `GameState`.
- React components must render domain-derived clarity data instead of duplicating rules where a domain helper exists.
- Use TDD: write and run failing tests before production code.

---

## File Structure

- `src/game/types.ts`: adds `ActionPreview`, `ActionPreviewTag`, `ActionPreviewTone` and `LastActionFeedback` types.
- `src/game/actionPreviews.ts`: owns module, duty, incident, renovation and last-result preview helpers.
- `src/test/action-previews.test.ts`: domain tests for previews and feedback summaries.
- `src/game/stationDirector.ts`: attaches preview data to guidance entries.
- `src/test/station-director.test.ts`: verifies guidance now carries reason/result preview data.
- `src/ui/components/ActionPreviewLine.tsx`: small shared renderer for preview title, reason/result and tags.
- `src/ui/components/StationTaskPanel.tsx`: renders guidance preview below current task copy.
- `src/ui/components/ModuleList.tsx`: renders purchase/locked preview for each module card.
- `src/ui/components/CommunalDutyPanel.tsx`: renders assignment and claim previews.
- `src/ui/components/StationIncidentJournal.tsx`: renders incident choice previews from the same helper.
- `src/ui/components/PrestigePanel.tsx`: renders renovation reset/reputation preview.
- `src/ui/components/LastActionFeedbackPanel.tsx`: renders latest meaningful non-modal result.
- `src/ui/layouts/DesktopLayout.tsx`: places last-action feedback in the station stack.
- `src/ui/layouts/MobileLayout.tsx`: places last-action feedback above the room selector.
- `src/platform/i18n.ts`: adds short shared labels for preview tags and result copy.
- `src/styles/global.css`: adds compact preview/feedback styling.
- `src/test/components.test.tsx`: component coverage for module, incident, renovation and feedback rendering.
- `src/test/communal-duty-panel.test.tsx`: duty preview component coverage.
- `src/test/station-task-panel.test.tsx`: Station Director preview rendering coverage.
- `docs/game-design/04-desktop-mobile-ux.md`: documents clarity expectations per layout.
- `docs/game-design/08-technical-architecture.md`: documents preview helper ownership.
- `docs/game-design/11-mvp-verification.md`: adds manual action-clarity checks.

### Task 1: Action Preview Domain

**Files:**
- Modify: `src/game/types.ts`
- Create: `src/game/actionPreviews.ts`
- Test: `src/test/action-previews.test.ts`

**Interfaces:**
- Produces: `export type ActionPreviewTag = 'income' | 'comfort' | 'condition' | 'resident' | 'role' | 'visual' | 'renovation' | 'timed_bonus' | 'cost'`
- Produces: `export type ActionPreviewTone = 'neutral' | 'positive' | 'warning'`
- Produces: `export interface ActionPreview { title: string; reason?: string; result: string; tags: ActionPreviewTag[]; tone?: ActionPreviewTone }`
- Produces: `export interface LastActionFeedback { title: string; detail: string; tags: ActionPreviewTag[] }`
- Produces: `getModulePurchasePreview(state: GameState, moduleId: ModuleId): ActionPreview`
- Produces: `getCommunalDutyAssignmentPreview(state: GameState, dutyId: CommunalDutyId, residentId: ResidentId): ActionPreview`
- Produces: `getCommunalDutyClaimPreview(state: GameState): ActionPreview | null`
- Produces: `getStationIncidentChoicePreview(state: GameState, incidentId: StationIncidentId, choiceId: string): ActionPreview | null`
- Produces: `getRenovationPreview(state: GameState): ActionPreview`
- Produces: `getLastActionFeedback(state: GameState): LastActionFeedback | null`

- [x] **Step 1: Write failing action preview tests**

Create `src/test/action-previews.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  getCommunalDutyAssignmentPreview,
  getCommunalDutyClaimPreview,
  getLastActionFeedback,
  getModulePurchasePreview,
  getRenovationPreview,
  getStationIncidentChoicePreview
} from '../game/actionPreviews';
import { createInitialState } from '../game/economy';
import type { GameState } from '../game/types';

describe('action previews', () => {
  it('previews a first room purchase with cost, income and comfort impact', () => {
    const state = createInitialState(1_000);

    const preview = getModulePurchasePreview(state, 'tenant_capsule');

    expect(preview.tags).toEqual(expect.arrayContaining(['cost', 'income']));
    expect(preview.result).toContain('+1.00/sec');
    expect(preview.reason).toContain('first working room');
  });

  it('previews locked modules with unlock progress instead of purchase impact', () => {
    const state = createInitialState(1_000);

    const preview = getModulePurchasePreview(state, 'cosmo_kitchen');

    expect(preview.tone).toBe('warning');
    expect(preview.result).toContain('Unlocks at');
    expect(preview.tags).toContain('cost');
  });

  it('previews a role-matched communal duty assignment reward', () => {
    const state: GameState = {
      ...createInitialState(1_000),
      unlockedResidents: ['sleepy_engineer'],
      roomConditions: { tenant_capsule: 30 }
    };

    const preview = getCommunalDutyAssignmentPreview(state, 'capsule_quiet_hours', 'sleepy_engineer');

    expect(preview.tags).toEqual(expect.arrayContaining(['condition', 'role']));
    expect(preview.reason).toContain('maintenance role matches');
    expect(preview.result).toContain('+35 condition');
  });

  it('previews a ready communal duty claim from last computed reward', () => {
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
      },
      unlockedResidents: ['sleepy_engineer']
    };

    const preview = getCommunalDutyClaimPreview(state);

    expect(preview?.result).toContain('+35 condition');
    expect(preview?.tags).toContain('condition');
  });

  it('previews role-gated incident choices with role reason and reward', () => {
    const state: GameState = {
      ...createInitialState(1_000),
      unlockedResidents: ['mist_cook']
    };

    const preview = getStationIncidentChoicePreview(state, 'kitchen_borscht_fog', 'make_borscht_tradition');

    expect(preview?.reason).toContain('comfort role');
    expect(preview?.result).toContain('+3 comfort');
    expect(preview?.tags).toEqual(expect.arrayContaining(['comfort', 'role', 'visual']));
  });

  it('previews renovation reset impact and reputation gain', () => {
    const base = createInitialState(1_000);
    const state: GameState = {
      ...base,
      totalEarnedCredits: 100_000,
      comfort: 25,
      moduleLevels: {
        ...base.moduleLevels,
        tenant_capsule: 10,
        cosmo_kitchen: 1
      },
      completedGoals: ['buy_capsule_10', 'unlock_kitchen', 'reach_comfort_25', 'earn_credits_10000']
    };

    const preview = getRenovationPreview(state);

    expect(preview.tags).toEqual(expect.arrayContaining(['renovation']));
    expect(preview.result).toContain('+1 reputation');
    expect(preview.reason).toContain('resets rooms and kopeks');
  });

  it('builds last action feedback from a communal duty result', () => {
    const state: GameState = {
      ...createInitialState(1_000),
      lastCommunalDutyResult: {
        dutyId: 'capsule_quiet_hours',
        residentId: 'sleepy_engineer',
        roomId: 'tenant_capsule',
        comfortGain: 2,
        conditionRepair: { tenant_capsule: 35 },
        resultKey: 'best',
        claimedAt: 2_000
      }
    };

    const feedback = getLastActionFeedback(state);

    expect(feedback?.title).toContain('Duty result');
    expect(feedback?.detail).toContain('+35 condition');
    expect(feedback?.tags).toContain('condition');
  });
});
```

- [x] **Step 2: Run tests to verify they fail**

Run: `npm.cmd test -- src/test/action-previews.test.ts`

Expected: FAIL because `src/game/actionPreviews.ts` does not exist.

- [x] **Step 3: Add preview types**

In `src/game/types.ts`, add these exports near other shared UI/domain types:

```ts
export type ActionPreviewTag =
  | 'income'
  | 'comfort'
  | 'condition'
  | 'resident'
  | 'role'
  | 'visual'
  | 'renovation'
  | 'timed_bonus'
  | 'cost';

export type ActionPreviewTone = 'neutral' | 'positive' | 'warning';

export interface ActionPreview {
  title: string;
  reason?: string;
  result: string;
  tags: ActionPreviewTag[];
  tone?: ActionPreviewTone;
}

export interface LastActionFeedback {
  title: string;
  detail: string;
  tags: ActionPreviewTag[];
}
```

- [x] **Step 4: Implement preview helpers**

Create `src/game/actionPreviews.ts`:

```ts
import { communalDuties } from './content/communalDuties';
import { modules } from './content/modules';
import { activeStationIncidents } from './content/stationIncidents';
import {
  calculateModuleCost,
  calculatePrestigeReward,
  canPerformPrestige,
  getAvailablePrestigeUpgrades
} from './economy';
import { formatCredits, formatRate } from './format';
import { hasResidentRole } from './residents';
import type {
  ActionPreview,
  CommunalDutyId,
  CommunalDutyReward,
  GameState,
  LastActionFeedback,
  ModuleId,
  ResidentId,
  StationIncidentEffect,
  StationIncidentId
} from './types';

function formatConditionRepair(repair: Partial<Record<ModuleId, number>> | undefined): string | null {
  const total = Object.values(repair ?? {}).reduce((sum, value) => sum + value, 0);
  return total > 0 ? `+${total} condition` : null;
}

function formatRewardParts(reward: CommunalDutyReward | StationIncidentEffect): string[] {
  const parts: string[] = [];
  const comfort = 'comfortGain' in reward ? reward.comfortGain : reward.comfortDelta;
  const condition = formatConditionRepair(reward.conditionRepair);

  if (comfort && comfort > 0) {
    parts.push(`+${comfort} comfort`);
  }

  if (condition) {
    parts.push(condition);
  }

  if ('creditsDelta' in reward && reward.creditsDelta) {
    parts.push(`${reward.creditsDelta > 0 ? '+' : ''}${formatCredits(reward.creditsDelta)}`);
  }

  if (reward.timedBonus) {
    parts.push('temporary income boost');
  }

  const visuals = 'visualPlaceholderIds' in reward ? reward.visualPlaceholderIds : undefined;
  if (visuals?.length) {
    parts.push('visual detail');
  }

  return parts;
}

function mergeConditionRepair(
  base: Partial<Record<ModuleId, number>>,
  bonus: Partial<Record<ModuleId, number>>
): Partial<Record<ModuleId, number>> {
  const merged = { ...base };

  for (const [roomId, repair] of Object.entries(bonus)) {
    const typedRoomId = roomId as ModuleId;
    merged[typedRoomId] = (merged[typedRoomId] ?? 0) + repair;
  }

  return merged;
}

function mergeDutyRewards(base: CommunalDutyReward, bonus: CommunalDutyReward): CommunalDutyReward {
  return {
    comfortGain: (base.comfortGain ?? 0) + (bonus.comfortGain ?? 0),
    conditionRepair: mergeConditionRepair(base.conditionRepair ?? {}, bonus.conditionRepair ?? {}),
    timedBonus: bonus.timedBonus ?? base.timedBonus
  };
}

function getDutyRewardPreview(state: GameState, dutyId: CommunalDutyId, residentId: ResidentId): {
  reward: CommunalDutyReward;
  roleMatched: boolean;
} | null {
  const definition = communalDuties.find((duty) => duty.id === dutyId);
  const outcome = definition?.outcomes.find((item) => item.residentId === residentId);

  if (!definition || !outcome) {
    return null;
  }

  const roleMatched = Boolean(
    definition.preferredRole &&
    definition.roleBonus &&
    hasResidentRole({ ...state, unlockedResidents: [residentId] }, definition.preferredRole, 1)
  );

  return {
    reward: roleMatched && definition.roleBonus ? mergeDutyRewards(outcome.reward, definition.roleBonus) : outcome.reward,
    roleMatched
  };
}

export function getModulePurchasePreview(state: GameState, moduleId: ModuleId): ActionPreview {
  const definition = modules.find((module) => module.id === moduleId);
  const level = state.moduleLevels[moduleId];
  const cost = calculateModuleCost(moduleId, state);

  if (!definition) {
    return {
      title: 'Unknown room',
      result: 'No preview available',
      tags: [],
      tone: 'warning'
    };
  }

  if (state.totalEarnedCredits < definition.unlockAtCredits) {
    return {
      title: `${definition.name} locked`,
      reason: 'Earn more kopeks to unlock this room.',
      result: `Unlocks at ${formatCredits(definition.unlockAtCredits)} total earned`,
      tags: ['cost'],
      tone: 'warning'
    };
  }

  const nextIncome = definition.baseIncomePerSecond;
  const comfort = level === 0 && definition.comfortBonus > 0 ? `, +${definition.comfortBonus} comfort` : '';
  const title = level === 0 ? `Open ${definition.name}` : `Upgrade ${definition.name}`;

  return {
    title,
    reason: level === 0 ? 'Creates the first working room in this station area.' : 'Raises room level and moves toward the next milestone.',
    result: `Costs ${formatCredits(cost)}, adds ${formatRate(nextIncome, '/sec')}${comfort}`,
    tags: ['cost', 'income', ...(comfort ? ['comfort' as const] : [])],
    tone: state.credits >= cost ? 'positive' : 'neutral'
  };
}

export function getCommunalDutyAssignmentPreview(
  state: GameState,
  dutyId: CommunalDutyId,
  residentId: ResidentId
): ActionPreview {
  const preview = getDutyRewardPreview(state, dutyId, residentId);

  if (!preview) {
    return {
      title: 'Resident cannot take this duty',
      result: 'Choose an eligible resident.',
      tags: [],
      tone: 'warning'
    };
  }

  const rewardText = formatRewardParts(preview.reward).join(', ') || 'station stabilized';

  return {
    title: 'Expected duty result',
    reason: preview.roleMatched ? 'Resident role matches this duty.' : 'Eligible resident can complete this duty.',
    result: rewardText,
    tags: ['condition', ...(preview.roleMatched ? ['role' as const] : [])],
    tone: 'positive'
  };
}

export function getCommunalDutyClaimPreview(state: GameState): ActionPreview | null {
  const active = state.communalDuty;

  if (!active || active.status !== 'ready_to_claim' || !active.assignedResidentId) {
    return null;
  }

  return getCommunalDutyAssignmentPreview(state, active.dutyId, active.assignedResidentId);
}

export function getStationIncidentChoicePreview(
  state: GameState,
  incidentId: StationIncidentId,
  choiceId: string
): ActionPreview | null {
  const definition = activeStationIncidents.find((incident) => incident.id === incidentId);
  const choice = definition?.choices.find((item) => item.id === choiceId);

  if (!choice) {
    return null;
  }

  const rewardText = formatRewardParts(choice.effects).join(', ') || 'journal memory';
  const role = choice.requiresRole?.role;

  return {
    title: role ? 'Role solution' : 'Choice result',
    reason: role ? `${role} role unlocks this option.` : 'Always available incident response.',
    result: rewardText,
    tags: [
      ...(choice.effects.comfortDelta ? ['comfort' as const] : []),
      ...(choice.effects.conditionRepair ? ['condition' as const] : []),
      ...(choice.effects.visualPlaceholderIds?.length ? ['visual' as const] : []),
      ...(choice.effects.timedBonus ? ['timed_bonus' as const] : []),
      ...(role ? ['role' as const] : [])
    ],
    tone: 'positive'
  };
}

export function getRenovationPreview(state: GameState): ActionPreview {
  const reward = calculatePrestigeReward(state);
  const canRenovate = canPerformPrestige(state);
  const upgradeChoices = getAvailablePrestigeUpgrades({
    ...state,
    prestigeCount: (state.prestigeCount ?? 0) + 1
  }).length;

  return {
    title: canRenovate ? 'Renovation ready' : 'Prepare renovation',
    reason: 'Renovation resets rooms and kopeks, but reputation and purchased permanent upgrades stay.',
    result: canRenovate
      ? `Gain +${reward} reputation and unlock ${Math.min(3, upgradeChoices || 3)} upgrade choices`
      : `Build toward +${Math.max(1, reward)} reputation`,
    tags: ['renovation'],
    tone: canRenovate ? 'positive' : 'neutral'
  };
}

export function getLastActionFeedback(state: GameState): LastActionFeedback | null {
  const duty = state.lastCommunalDutyResult;

  if (!duty) {
    return null;
  }

  const condition = formatConditionRepair(duty.conditionRepair);
  const parts = [
    duty.comfortGain > 0 ? `+${duty.comfortGain} comfort` : null,
    condition
  ].filter(Boolean);

  return {
    title: 'Duty result',
    detail: parts.join(', ') || 'Station duty completed',
    tags: [
      ...(duty.comfortGain > 0 ? ['comfort' as const] : []),
      ...(condition ? ['condition' as const] : [])
    ]
  };
}
```

- [x] **Step 5: Run action preview tests**

Run: `npm.cmd test -- src/test/action-previews.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit Task 1**

```powershell
git add -- src/game/types.ts src/game/actionPreviews.ts src/test/action-previews.test.ts
git commit -m "feat: add action preview helpers"
```

### Task 2: Station Director Preview Rendering

**Files:**
- Modify: `src/game/stationDirector.ts`
- Modify: `src/ui/components/StationTaskPanel.tsx`
- Create: `src/ui/components/ActionPreviewLine.tsx`
- Modify: `src/platform/i18n.ts`
- Test: `src/test/station-director.test.ts`
- Test: `src/test/station-task-panel.test.tsx`

**Interfaces:**
- Consumes: `ActionPreview` from `src/game/types.ts`
- Consumes: `getCommunalDutyClaimPreview`, `getCommunalDutyAssignmentPreview`, `getRenovationPreview`
- Produces: `preview?: ActionPreview` on `StationGuidanceBase`
- Produces: `<ActionPreviewLine preview={preview} t={t} />`

- [ ] **Step 1: Write failing Station Director domain test**

Add to `src/test/station-director.test.ts`:

```ts
it('attaches preview reason and result to ready communal duty guidance', () => {
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
    },
    unlockedResidents: ['sleepy_engineer']
  };

  const guidance = getStationGuidance({ state, incomePerSecond: 0 });

  expect(guidance?.preview?.reason).toContain('role');
  expect(guidance?.preview?.result).toContain('condition');
});
```

Run: `npm.cmd test -- src/test/station-director.test.ts`

Expected: FAIL because guidance has no `preview`.

- [ ] **Step 2: Write failing StationTaskPanel component test**

Add to `src/test/station-task-panel.test.tsx`:

```tsx
it('renders guidance preview reason and result', () => {
  const guidance: StationGuidance = {
    kind: 'communal_duty',
    priority: 95,
    copyKey: 'communal_duty_claim',
    canActNow: true,
    dutyId: 'capsule_quiet_hours',
    targetRoomId: 'tenant_capsule',
    preview: {
      title: 'Expected duty result',
      reason: 'Resident role matches this duty.',
      result: '+35 condition',
      tags: ['condition', 'role'],
      tone: 'positive'
    }
  };

  render(<StationTaskPanel guidance={guidance} onSelectRoom={vi.fn()} t={t} />);

  expect(screen.getByText('Resident role matches this duty.')).toBeInTheDocument();
  expect(screen.getByText('+35 condition')).toBeInTheDocument();
});
```

Run: `npm.cmd test -- src/test/station-task-panel.test.tsx`

Expected: FAIL because the component ignores preview.

- [ ] **Step 3: Add shared preview renderer**

Create `src/ui/components/ActionPreviewLine.tsx`:

```tsx
import type { ActionPreview, ActionPreviewTag, LastActionFeedback } from '../../game/types';
import type { Translation } from '../../platform/i18n';

interface ActionPreviewLineProps {
  preview: ActionPreview | LastActionFeedback;
  t: Translation;
  variant?: 'default' | 'compact';
}

function getTagLabel(tag: ActionPreviewTag, t: Translation): string {
  switch (tag) {
    case 'income':
      return t.previewTagIncome;
    case 'comfort':
      return t.previewTagComfort;
    case 'condition':
      return t.previewTagCondition;
    case 'resident':
      return t.previewTagResident;
    case 'role':
      return t.previewTagRole;
    case 'visual':
      return t.previewTagVisual;
    case 'renovation':
      return t.previewTagRenovation;
    case 'timed_bonus':
      return t.previewTagTimedBonus;
    case 'cost':
      return t.previewTagCost;
  }
}

export function ActionPreviewLine({ preview, t, variant = 'default' }: ActionPreviewLineProps) {
  const detail = 'detail' in preview ? preview.detail : preview.result;
  const reason = 'reason' in preview ? preview.reason : undefined;

  return (
    <div className={variant === 'compact' ? 'action-preview compact' : 'action-preview'}>
      <div className="action-preview-text">
        <strong>{preview.title}</strong>
        {reason ? <span>{reason}</span> : null}
        <small>{detail}</small>
      </div>
      {preview.tags.length > 0 ? (
        <div className="action-preview-tags" aria-label={t.previewTags}>
          {preview.tags.map((tag) => (
            <span className={`action-preview-tag tag-${tag}`} key={tag}>
              {getTagLabel(tag, t)}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 4: Add preview translation keys**

In `src/platform/i18n.ts`, add to `Translation`:

```ts
  previewTags: string;
  previewTagIncome: string;
  previewTagComfort: string;
  previewTagCondition: string;
  previewTagResident: string;
  previewTagRole: string;
  previewTagVisual: string;
  previewTagRenovation: string;
  previewTagTimedBonus: string;
  previewTagCost: string;
```

Add to `ru`:

```ts
  previewTags: 'Теги результата',
  previewTagIncome: 'доход',
  previewTagComfort: 'комфорт',
  previewTagCondition: 'состояние',
  previewTagResident: 'жилец',
  previewTagRole: 'роль',
  previewTagVisual: 'деталь',
  previewTagRenovation: 'реновация',
  previewTagTimedBonus: 'буст',
  previewTagCost: 'цена',
```

Add to `en`:

```ts
  previewTags: 'Result tags',
  previewTagIncome: 'income',
  previewTagComfort: 'comfort',
  previewTagCondition: 'condition',
  previewTagResident: 'resident',
  previewTagRole: 'role',
  previewTagVisual: 'detail',
  previewTagRenovation: 'renovation',
  previewTagTimedBonus: 'boost',
  previewTagCost: 'cost',
```

- [ ] **Step 5: Attach previews to Station Director**

In `src/game/stationDirector.ts`:

```ts
import {
  getCommunalDutyAssignmentPreview,
  getCommunalDutyClaimPreview,
  getRenovationPreview
} from './actionPreviews';
import type { ActionPreview, CommunalDutyId, GameState, ModuleId } from './types';
```

Add `preview?: ActionPreview;` to `StationGuidanceBase`.

For ready communal duty guidance:

```ts
preview: getCommunalDutyClaimPreview(state) ?? undefined
```

For available communal duty guidance, pick the first unlocked eligible resident:

```ts
const availableDuty = state.communalDuty?.status === 'available' ? state.communalDuty : null;
if (availableDuty) {
  const definition = communalDuties.find((duty) => duty.id === availableDuty.dutyId);
  const residentId = definition?.eligibleResidentIds.find((id) => state.unlockedResidents.includes(id));
  // existing return object:
  preview: residentId ? getCommunalDutyAssignmentPreview(state, availableDuty.dutyId, residentId) : undefined
}
```

For prestige guidance:

```ts
preview: getRenovationPreview(state)
```

Also import `communalDuties` from `./content/communalDuties`.

- [ ] **Step 6: Render preview in StationTaskPanel**

In `src/ui/components/StationTaskPanel.tsx`, import and render:

```tsx
import { ActionPreviewLine } from './ActionPreviewLine';
```

Inside the body, after `<GuidanceMeta />`:

```tsx
{guidance.preview ? <ActionPreviewLine preview={guidance.preview} t={t} variant={variant} /> : null}
```

- [ ] **Step 7: Add preview styles**

In `src/styles/global.css`, add:

```css
.action-preview {
  display: grid;
  gap: 6px;
  margin-top: 8px;
  padding: 8px;
  border: 1px solid rgb(39 49 63 / 12%);
  border-radius: 8px;
  background: color-mix(in srgb, var(--color-warm-panel), white 22%);
}

.action-preview.compact {
  padding: 6px;
  gap: 5px;
}

.action-preview-text {
  display: grid;
  gap: 2px;
}

.action-preview-text strong {
  font-size: 0.78rem;
}

.action-preview-text span,
.action-preview-text small {
  color: var(--color-utility-blue);
  font-size: 0.72rem;
  line-height: 1.35;
}

.action-preview-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.action-preview-tag {
  border-radius: 999px;
  padding: 2px 6px;
  background: rgb(39 49 63 / 10%);
  color: var(--color-ink);
  font-size: 0.62rem;
  font-weight: 800;
  line-height: 1.2;
}
```

- [ ] **Step 8: Run task tests**

Run: `npm.cmd test -- src/test/station-director.test.ts src/test/station-task-panel.test.tsx`

Expected: PASS.

- [ ] **Step 9: Commit Task 2**

```powershell
git add -- src/game/stationDirector.ts src/ui/components/ActionPreviewLine.tsx src/ui/components/StationTaskPanel.tsx src/platform/i18n.ts src/styles/global.css src/test/station-director.test.ts src/test/station-task-panel.test.tsx
git commit -m "feat: show station guidance previews"
```

### Task 3: Module Card Purchase Previews

**Files:**
- Modify: `src/ui/components/ModuleList.tsx`
- Test: `src/test/components.test.tsx`

**Interfaces:**
- Consumes: `getModulePurchasePreview(state, moduleId): ActionPreview`
- Consumes: `<ActionPreviewLine preview={preview} t={t} />`

- [ ] **Step 1: Write failing module preview tests**

Add to `src/test/components.test.tsx`:

```tsx
it('shows module purchase preview on room cards', () => {
  render(<ModuleList gameState={createInitialState(1_000)} onBuyLevel={vi.fn()} t={t} />);

  expect(screen.getByText(/first working room/i)).toBeInTheDocument();
  expect(screen.getByText(/\+0.10\/sec/i)).toBeInTheDocument();
});

it('shows locked module unlock preview instead of purchase impact', () => {
  render(<ModuleList gameState={createInitialState(1_000)} onBuyLevel={vi.fn()} t={t} />);

  expect(screen.getAllByText(/Unlocks at/i).length).toBeGreaterThan(0);
});
```

Run: `npm.cmd test -- src/test/components.test.tsx`

Expected: FAIL because `ModuleList` does not render action previews.

- [ ] **Step 2: Render previews in ModuleList**

In `src/ui/components/ModuleList.tsx`, add imports:

```tsx
import { getModulePurchasePreview } from '../../game/actionPreviews';
import { ActionPreviewLine } from './ActionPreviewLine';
```

Inside the `modules.map` block, after `canBuy`:

```ts
const preview = getModulePurchasePreview(gameState, module.id);
```

Render after milestone progress:

```tsx
<ActionPreviewLine preview={preview} t={t} />
```

- [ ] **Step 3: Run module/component tests**

Run: `npm.cmd test -- src/test/components.test.tsx`

Expected: PASS.

- [ ] **Step 4: Commit Task 3**

```powershell
git add -- src/ui/components/ModuleList.tsx src/test/components.test.tsx
git commit -m "feat: preview room purchase impact"
```

### Task 4: Duty And Incident Choice Previews

**Files:**
- Modify: `src/ui/components/CommunalDutyPanel.tsx`
- Modify: `src/ui/components/StationIncidentJournal.tsx`
- Test: `src/test/communal-duty-panel.test.tsx`
- Test: `src/test/components.test.tsx`

**Interfaces:**
- Consumes: `getCommunalDutyAssignmentPreview`
- Consumes: `getCommunalDutyClaimPreview`
- Consumes: `getStationIncidentChoicePreview`
- Consumes: `<ActionPreviewLine preview={preview} t={t} variant={variant} />`

- [ ] **Step 1: Write failing duty panel preview test**

Add to `src/test/communal-duty-panel.test.tsx`:

```tsx
it('shows role-matched duty reward before assignment', () => {
  render(<CommunalDutyPanel gameState={availableDutyState()} onAssign={vi.fn()} onClaim={vi.fn()} t={t} />);

  expect(screen.getByText(/Resident role matches this duty/i)).toBeInTheDocument();
  expect(screen.getByText(/\+35 condition/i)).toBeInTheDocument();
});
```

Run: `npm.cmd test -- src/test/communal-duty-panel.test.tsx`

Expected: FAIL because duty panel does not render preview.

- [ ] **Step 2: Write failing incident preview test**

Add to `src/test/components.test.tsx`:

```tsx
it('shows incident choice reward previews', () => {
  const gameState: GameState = {
    ...createInitialState(1_000),
    unlockedResidents: ['mist_cook'],
    activeIncidents: [{ id: 'kitchen_borscht_fog', queuedAt: 10_000, isNew: true }]
  };

  render(
    <StationIncidentJournal
      gameState={gameState}
      newIncidentCount={1}
      onResolve={vi.fn()}
      onMarkSeen={vi.fn()}
      t={t}
    />
  );

  expect(screen.getByText(/comfort role unlocks this option/i)).toBeInTheDocument();
  expect(screen.getByText(/\+3 comfort/i)).toBeInTheDocument();
});
```

Run: `npm.cmd test -- src/test/components.test.tsx`

Expected: FAIL because incident choices only render translation descriptions.

- [ ] **Step 3: Render duty assignment and claim previews**

In `src/ui/components/CommunalDutyPanel.tsx`, add imports:

```tsx
import { getCommunalDutyAssignmentPreview, getCommunalDutyClaimPreview } from '../../game/actionPreviews';
import { ActionPreviewLine } from './ActionPreviewLine';
```

Inside `eligibleResidents.map`, wrap button and preview:

```tsx
{eligibleResidents.map((residentId) => {
  const preview = getCommunalDutyAssignmentPreview(gameState, definition.id, residentId);

  return (
    <div className="communal-duty-choice" key={residentId}>
      <button type="button" onClick={() => onAssign(residentId)}>
        <UserCheck aria-hidden="true" size={15} />
        {getResidentName(residentId, t)}
        {residentId === definition.bestResidentId ? ` · ${t.communalDutyBestMatch}` : ''}
      </button>
      <ActionPreviewLine preview={preview} t={t} variant={variant} />
    </div>
  );
})}
```

For ready-to-claim state, before the claim button:

```tsx
const claimPreview = getCommunalDutyClaimPreview(gameState);
```

Render:

```tsx
{claimPreview ? <ActionPreviewLine preview={claimPreview} t={t} variant={variant} /> : null}
```

- [ ] **Step 4: Render incident choice previews**

In `src/ui/components/StationIncidentJournal.tsx`, import:

```tsx
import { getStationIncidentChoicePreview } from '../../game/actionPreviews';
import { ActionPreviewLine } from './ActionPreviewLine';
```

Inside `choices.map`:

```tsx
const preview = getStationIncidentChoicePreview(gameState, incident.id, choice.id);
```

Render inside the button after `<small>`:

```tsx
{preview ? <ActionPreviewLine preview={preview} t={t} variant="compact" /> : null}
```

- [ ] **Step 5: Add duty choice styling**

In `src/styles/global.css`, add:

```css
.communal-duty-choice {
  display: grid;
  gap: 6px;
}

.incident-choice-list .action-preview {
  width: 100%;
  text-align: left;
}
```

- [ ] **Step 6: Run duty and component tests**

Run: `npm.cmd test -- src/test/communal-duty-panel.test.tsx src/test/components.test.tsx`

Expected: PASS.

- [ ] **Step 7: Commit Task 4**

```powershell
git add -- src/ui/components/CommunalDutyPanel.tsx src/ui/components/StationIncidentJournal.tsx src/styles/global.css src/test/communal-duty-panel.test.tsx src/test/components.test.tsx
git commit -m "feat: preview duty and incident outcomes"
```

### Task 5: Renovation Preview And Last-Action Feedback

**Files:**
- Modify: `src/ui/components/PrestigePanel.tsx`
- Create: `src/ui/components/LastActionFeedbackPanel.tsx`
- Modify: `src/ui/layouts/DesktopLayout.tsx`
- Modify: `src/ui/layouts/MobileLayout.tsx`
- Test: `src/test/components.test.tsx`
- Test: `src/test/responsive.test.tsx`

**Interfaces:**
- Consumes: `getRenovationPreview(state): ActionPreview`
- Consumes: `getLastActionFeedback(state): LastActionFeedback | null`
- Consumes: `<ActionPreviewLine preview={preview} t={t} />`
- Produces: `<LastActionFeedbackPanel gameState={gameState} t={t} />`

- [ ] **Step 1: Write failing renovation preview test**

Add to `src/test/components.test.tsx`:

```tsx
it('shows renovation preview with reset impact and reputation gain', () => {
  const base = createInitialState(1_000);
  const gameState: GameState = {
    ...base,
    totalEarnedCredits: 100_000,
    comfort: 25,
    moduleLevels: {
      ...base.moduleLevels,
      tenant_capsule: 10,
      cosmo_kitchen: 1
    },
    completedGoals: ['buy_capsule_10', 'unlock_kitchen', 'reach_comfort_25', 'earn_credits_10000']
  };

  render(<PrestigePanel gameState={gameState} onRenovate={vi.fn()} t={t} />);

  expect(screen.getByText(/resets rooms and kopeks/i)).toBeInTheDocument();
  expect(screen.getByText(/\+1 reputation/i)).toBeInTheDocument();
});
```

Run: `npm.cmd test -- src/test/components.test.tsx`

Expected: FAIL because `PrestigePanel` does not render renovation preview.

- [ ] **Step 2: Write failing last-action feedback test**

Add to `src/test/components.test.tsx`:

```tsx
import { LastActionFeedbackPanel } from '../ui/components/LastActionFeedbackPanel';
```

Then add:

```tsx
it('shows non-modal feedback for the latest duty result', () => {
  const gameState: GameState = {
    ...createInitialState(1_000),
    lastCommunalDutyResult: {
      dutyId: 'capsule_quiet_hours',
      residentId: 'sleepy_engineer',
      roomId: 'tenant_capsule',
      comfortGain: 2,
      conditionRepair: { tenant_capsule: 35 },
      resultKey: 'best',
      claimedAt: 2_000
    }
  };

  render(<LastActionFeedbackPanel gameState={gameState} t={t} />);

  expect(screen.getByText(/Duty result/i)).toBeInTheDocument();
  expect(screen.getByText(/\+35 condition/i)).toBeInTheDocument();
});
```

Run: `npm.cmd test -- src/test/components.test.tsx`

Expected: FAIL because `LastActionFeedbackPanel` does not exist.

- [ ] **Step 3: Render renovation preview**

In `src/ui/components/PrestigePanel.tsx`, import:

```tsx
import { getRenovationPreview } from '../../game/actionPreviews';
import { ActionPreviewLine } from './ActionPreviewLine';
```

Inside `PrestigePanel`, after `cycle`:

```ts
const preview = getRenovationPreview(gameState);
```

Render before the renovate button:

```tsx
<ActionPreviewLine preview={preview} t={t} />
```

- [ ] **Step 4: Create LastActionFeedbackPanel**

Create `src/ui/components/LastActionFeedbackPanel.tsx`:

```tsx
import { getLastActionFeedback } from '../../game/actionPreviews';
import type { GameState } from '../../game/types';
import type { Translation } from '../../platform/i18n';
import { ActionPreviewLine } from './ActionPreviewLine';

interface LastActionFeedbackPanelProps {
  gameState: GameState;
  t: Translation;
  variant?: 'default' | 'compact';
}

export function LastActionFeedbackPanel({ gameState, t, variant = 'default' }: LastActionFeedbackPanelProps) {
  const feedback = getLastActionFeedback(gameState);

  if (!feedback) {
    return null;
  }

  return (
    <section className={variant === 'compact' ? 'last-action-feedback compact' : 'last-action-feedback'} aria-live="polite">
      <ActionPreviewLine preview={feedback} t={t} variant={variant} />
    </section>
  );
}
```

- [ ] **Step 5: Place feedback in desktop and mobile layouts**

In `src/ui/layouts/DesktopLayout.tsx`, import:

```tsx
import { LastActionFeedbackPanel } from '../components/LastActionFeedbackPanel';
```

Place after `StationTaskPanel` block and before `CommunalDutyPanel`:

```tsx
<LastActionFeedbackPanel gameState={game.gameState} t={t} />
```

In `src/ui/layouts/MobileLayout.tsx`, import the same component and place after `StationTaskPanel`:

```tsx
<LastActionFeedbackPanel gameState={game.gameState} t={t} variant="compact" />
```

- [ ] **Step 6: Add feedback styling**

In `src/styles/global.css`, add:

```css
.last-action-feedback {
  display: block;
}

.last-action-feedback .action-preview {
  border-color: color-mix(in srgb, var(--color-enamel-green), transparent 40%);
}
```

- [ ] **Step 7: Run component and responsive tests**

Run: `npm.cmd test -- src/test/components.test.tsx src/test/responsive.test.tsx`

Expected: PASS.

- [ ] **Step 8: Commit Task 5**

```powershell
git add -- src/ui/components/PrestigePanel.tsx src/ui/components/LastActionFeedbackPanel.tsx src/ui/layouts/DesktopLayout.tsx src/ui/layouts/MobileLayout.tsx src/styles/global.css src/test/components.test.tsx src/test/responsive.test.tsx
git commit -m "feat: show renovation and last action feedback"
```

### Task 6: Docs And Verification

**Files:**
- Modify: `docs/game-design/04-desktop-mobile-ux.md`
- Modify: `docs/game-design/08-technical-architecture.md`
- Modify: `docs/game-design/11-mvp-verification.md`
- Modify: `docs/superpowers/plans/2026-07-05-clarity-spine.md`

**Interfaces:**
- No code interfaces.

- [ ] **Step 1: Update UX docs**

Append to `docs/game-design/04-desktop-mobile-ux.md`:

```md
## Clarity Spine

Every major action surface should answer four questions in one compact place:

- what matters now;
- why it matters;
- what changes after the action;
- where the result is visible.

Desktop can show a short reason line and tags. Mobile should keep the same
preview data but render it as compact tags plus one result line.
```

- [ ] **Step 2: Update architecture docs**

Append to `docs/game-design/08-technical-architecture.md`:

```md
## Action Previews

`src/game/actionPreviews.ts` owns pure preview helpers for purchase, duty,
incident, renovation and last-result summaries. React components render these
previews through `ActionPreviewLine` and should not duplicate reward rules when
a preview helper exists.

Preview helpers do not mutate `GameState` and do not write save data.
```

- [ ] **Step 3: Update MVP verification docs**

Append to `docs/game-design/11-mvp-verification.md`:

```md
## Clarity Spine Manual Checks

- Current Task explains why the suggested action matters.
- Room cards show cost and expected purchase impact.
- Communal Duty shows best match, role match and expected reward before assignment.
- Incident choices show reward summaries, and role-gated choices explain the role reason.
- Renovation panel states reset impact and reputation gain before the button.
- Last-action feedback appears after a duty claim without blocking play.
```

- [ ] **Step 4: Run focused tests**

Run:

```powershell
npm.cmd test -- src/test/action-previews.test.ts src/test/station-director.test.ts src/test/station-task-panel.test.tsx src/test/communal-duty-panel.test.tsx src/test/components.test.tsx src/test/responsive.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Run full verification**

Run:

```powershell
npm.cmd test
npx.cmd tsc --noEmit
git diff --check
git status --short
```

Expected:

- all Vitest files pass;
- TypeScript exits 0;
- `git diff --check` reports no whitespace errors;
- status shows only files intentionally changed by this plan if not yet committed.

- [ ] **Step 6: Commit docs and final plan state**

```powershell
git add -- docs/game-design/04-desktop-mobile-ux.md docs/game-design/08-technical-architecture.md docs/game-design/11-mvp-verification.md docs/superpowers/plans/2026-07-05-clarity-spine.md
git commit -m "docs: document clarity spine verification"
```
