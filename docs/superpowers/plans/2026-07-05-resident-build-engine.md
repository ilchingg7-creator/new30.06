# Resident Build Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add resident roles as a build engine that changes communal duties, station incidents and resident UI without adding new currencies or a new management screen.

**Architecture:** Resident role data is pure domain logic in `src/game/residents.ts` and shared through `src/game/types.ts`. Communal duties consume role metadata from content definitions and merge role bonuses during claim. Station incidents gain optional role-gated choices, with domain rejection and UI filtering. Resident panels render compact role tags from the same role helper functions.

**Tech Stack:** TypeScript, React, Vitest, existing save schema.

## Global Constraints

- No new runtime dependencies.
- No save schema change for role totals; they are derived from `unlockedResidents`.
- No new full-screen build planner.
- Role-gated incident choices must never be required to resolve an incident.
- Every incident with role-gated choices keeps at least one always-available choice.
- Communal duties keep no-fail outcomes; the role bonus only improves a valid assignment.
- Renovation-specific role upgrades are out of scope for this slice.
- Use TDD: write and run failing tests before production code.

---

## File Structure

- `src/game/types.ts`: adds `ResidentRole`, `ResidentRoleProfile`, `ResidentRoleTotals`, `requiresRole` on incident choices, and optional role metadata on duties.
- `src/game/residents.ts`: owns role profiles, totals and role checks.
- `src/game/content/communalDuties.ts`: assigns preferred roles and role bonuses to existing duties.
- `src/game/communalDuties.ts`: merges role bonus rewards when claiming a duty.
- `src/game/content/stationIncidents.ts`: adds role-gated choices to selected active incidents.
- `src/game/stationIncidents.ts`: exposes available incident choices and rejects locked choices at resolve time.
- `src/ui/components/StationIncidentJournal.tsx`: renders only choices available to the current station role totals.
- `src/ui/components/ResidentsPanel.tsx`: renders resident role tags.
- `src/ui/components/ResidentCollectionBook.tsx`: renders resident role tags in the collection view.
- `src/platform/i18n.ts`: adds role label copy.
- `docs/game-design/03-content-progression.md`: documents resident roles as the first build-engine slice.

### Task 1: Resident Role Domain

**Files:**
- Modify: `src/game/types.ts`
- Modify: `src/game/residents.ts`
- Test: `src/test/residents.test.ts`

**Interfaces:**
- Produces: `export type ResidentRole = 'income' | 'comfort' | 'maintenance' | 'visitor' | 'renovation'`
- Produces: `export interface ResidentRoleProfile { primary: ResidentRole; secondary?: ResidentRole }`
- Produces: `export type ResidentRoleTotals = Record<ResidentRole, number>`
- Produces: `getResidentRoleProfile(residentId: ResidentId): ResidentRoleProfile`
- Produces: `getResidentRoleTotals(state: GameState): ResidentRoleTotals`
- Produces: `hasResidentRole(state: GameState, role: ResidentRole, points?: number): boolean`

- [ ] **Step 1: Write failing resident role tests**

Add these tests to `src/test/residents.test.ts`:

```ts
import { residents } from '../game/content/residents';
import {
  getResidentRoleProfile,
  getResidentRoleTotals,
  hasResidentRole
} from '../game/residents';

it('defines a role profile for every resident', () => {
  for (const resident of residents) {
    expect(getResidentRoleProfile(resident.id).primary).toBeTruthy();
  }
});

it('counts primary roles as 2 points and secondary roles as 1 point', () => {
  const state = {
    ...createInitialState(1_000),
    unlockedResidents: ['sleepy_engineer', 'mist_cook', 'teleport_courier'] as GameState['unlockedResidents']
  };

  expect(getResidentRoleTotals(state)).toEqual({
    income: 3,
    comfort: 2,
    maintenance: 2,
    visitor: 2,
    renovation: 0
  });
});

it('checks resident role thresholds', () => {
  const state = {
    ...createInitialState(1_000),
    unlockedResidents: ['sleepy_engineer', 'mist_cook'] as GameState['unlockedResidents']
  };

  expect(hasResidentRole(state, 'maintenance', 2)).toBe(true);
  expect(hasResidentRole(state, 'comfort', 2)).toBe(true);
  expect(hasResidentRole(state, 'visitor', 1)).toBe(false);
});
```

Run: `npm.cmd test -- src/test/residents.test.ts`

Expected: FAIL because role helpers do not exist.

- [ ] **Step 2: Implement resident role types and helpers**

Add the role types to `src/game/types.ts`. Add a `RESIDENT_ROLE_PROFILES` map and the three helper functions to `src/game/residents.ts`.

Run: `npm.cmd test -- src/test/residents.test.ts`

Expected: PASS.

### Task 2: Role-Based Communal Duties

**Files:**
- Modify: `src/game/types.ts`
- Modify: `src/game/content/communalDuties.ts`
- Modify: `src/game/communalDuties.ts`
- Test: `src/test/communal-duties.test.ts`

**Interfaces:**
- Consumes: `hasResidentRole(state, role, points)`
- Extends: `CommunalDutyDefinition` with `preferredRole?: ResidentRole`
- Extends: `CommunalDutyDefinition` with `roleBonus?: CommunalDutyReward`

- [ ] **Step 1: Write failing duty role-bonus tests**

Add these tests to `src/test/communal-duties.test.ts`:

```ts
it('adds a preferred-role bonus when claiming a matching duty resident', () => {
  const state = {
    ...withCapsuleResident(),
    communalDuty: {
      id: 'duty-role',
      dutyId: 'capsule_quiet_hours' as const,
      roomId: 'tenant_capsule' as const,
      status: 'ready_to_claim' as const,
      createdAt: NOW,
      assignedResidentId: 'sleepy_engineer' as const,
      startedAt: NOW,
      completesAt: NOW + 1
    },
    roomConditions: { tenant_capsule: 30 }
  };

  const claimed = claimCommunalDuty(state, NOW + 10);

  expect(claimed.lastCommunalDutyResult?.conditionRepair.tenant_capsule).toBe(35);
  expect(claimed.roomConditions?.tenant_capsule).toBe(65);
});

it('does not add a role bonus for an eligible resident without the preferred role', () => {
  const base = withCapsuleResident();
  const state = {
    ...base,
    unlockedResidents: ['sleepy_engineer', 'mist_cook'] as GameState['unlockedResidents'],
    communalDuty: {
      id: 'duty-role-alt',
      dutyId: 'capsule_quiet_hours' as const,
      roomId: 'tenant_capsule' as const,
      status: 'ready_to_claim' as const,
      createdAt: NOW,
      assignedResidentId: 'mist_cook' as const,
      startedAt: NOW,
      completesAt: NOW + 1
    },
    roomConditions: { tenant_capsule: 30 }
  };

  const claimed = claimCommunalDuty(state, NOW + 10);

  expect(claimed.lastCommunalDutyResult?.conditionRepair.tenant_capsule).toBe(12);
  expect(claimed.roomConditions?.tenant_capsule).toBe(42);
});
```

Run: `npm.cmd test -- src/test/communal-duties.test.ts`

Expected: FAIL because preferred role metadata and role reward merging do not exist.

- [ ] **Step 2: Add duty role metadata and merge rewards**

Update duty definitions:

- `capsule_quiet_hours`: `preferredRole: 'maintenance'`, `roleBonus: { conditionRepair: { tenant_capsule: 10 } }`
- `kitchen_soup_escape`: `preferredRole: 'comfort'`, `roleBonus: { comfortGain: 1 }`
- `garden_vacuum_sprout`: `preferredRole: 'comfort'`, `roleBonus: { comfortGain: 1 }`
- `laundry_sock_orbit`: `preferredRole: 'maintenance'`, `roleBonus: { conditionRepair: { zero_g_laundry: 10 } }`

In `claimCommunalDuty`, merge `outcome.reward` and `definition.roleBonus` only when the assigned resident has the preferred role. Stack `comfortGain`, merge `conditionRepair` by adding per room, and keep a timed bonus if either reward has one.

Run: `npm.cmd test -- src/test/communal-duties.test.ts`

Expected: PASS.

### Task 3: Role-Gated Incident Choices

**Files:**
- Modify: `src/game/types.ts`
- Modify: `src/game/content/stationIncidents.ts`
- Modify: `src/game/stationIncidents.ts`
- Test: `src/test/station-incidents.test.ts`

**Interfaces:**
- Extends: `StationIncidentChoice` with `requiresRole?: { role: ResidentRole; points: number }`
- Produces: `getAvailableStationIncidentChoices(state: GameState, incidentId: StationIncidentId): StationIncidentChoice[]`
- Updates: `resolveStationIncident(state, incidentId, choiceId, now?)` rejects locked role choices.

- [ ] **Step 1: Write failing role-gated incident tests**

Add these tests to `src/test/station-incidents.test.ts`:

```ts
import { getAvailableStationIncidentChoices } from '../game/stationIncidents';

it('filters role-gated incident choices by resident role totals', () => {
  const base = createInitialState(1_000);
  const withoutComfort = {
    ...base,
    activeIncidents: [{ id: 'kitchen_borscht_fog' as const, queuedAt: 10_000, isNew: true }]
  };
  const withComfort = {
    ...withoutComfort,
    unlockedResidents: ['mist_cook'] as GameState['unlockedResidents']
  };

  expect(getAvailableStationIncidentChoices(withoutComfort, 'kitchen_borscht_fog').map((choice) => choice.id))
    .not.toContain('make_borscht_tradition');
  expect(getAvailableStationIncidentChoices(withComfort, 'kitchen_borscht_fog').map((choice) => choice.id))
    .toContain('make_borscht_tradition');
});

it('rejects resolving locked role-gated incident choices directly', () => {
  const base = createInitialState(1_000);
  const state = {
    ...base,
    activeIncidents: [{ id: 'kitchen_borscht_fog' as const, queuedAt: 10_000, isNew: true }]
  };

  const resolved = resolveStationIncident(state, 'kitchen_borscht_fog', 'make_borscht_tradition', 20_000);

  expect(resolved).toBe(state);
  expect(resolved.activeIncidents).toHaveLength(1);
});

it('allows resolving role-gated incident choices when role totals match', () => {
  const base = createInitialState(1_000);
  const state = {
    ...base,
    unlockedResidents: ['mist_cook'] as GameState['unlockedResidents'],
    activeIncidents: [{ id: 'kitchen_borscht_fog' as const, queuedAt: 10_000, isNew: true }]
  };

  const resolved = resolveStationIncident(state, 'kitchen_borscht_fog', 'make_borscht_tradition', 20_000);

  expect(resolved.activeIncidents).toEqual([]);
  expect(resolved.comfort).toBe(3);
  expect(resolved.unlockedIncidentVisuals).toContain('kitchen_mist_patch_01');
});
```

Run: `npm.cmd test -- src/test/station-incidents.test.ts`

Expected: FAIL because choice requirements and choice filtering do not exist.

- [ ] **Step 2: Add role-gated choices to incident content**

Add role-gated choices:

- `kitchen_borscht_fog`: `make_borscht_tradition`, requires `comfort` 2, effects `{ comfortDelta: 3, visualPlaceholderIds: ['kitchen_mist_patch_01'] }`
- `condition_warning_light`: `maintenance_shortcut`, requires `maintenance` 2, effects `{ conditionRepair: { tenant_capsule: 12 }, visualPlaceholderIds: ['warning_bulb_01'] }`
- `teleport_wrong_parcel`: `courier_protocol`, requires `visitor` 2, effects `{ comfortDelta: 2, visualPlaceholderIds: ['teleport_parcel_01'] }`
- `cat_found_warm_pipe`: `cozy_cat_corner`, requires `comfort` 2, effects `{ comfortDelta: 2, visualPlaceholderIds: ['cat_saucer_01'] }`
- `high_income_low_comfort_meeting`: `tea_council`, requires `comfort` 2, effects `{ comfortDelta: 4 }`

Run: `npm.cmd test -- src/test/station-incidents.test.ts`

Expected: still FAIL until the domain helper filters and rejects locked choices.

- [ ] **Step 3: Implement available-choice filtering and direct rejection**

Implement `getAvailableStationIncidentChoices`. Update `resolveStationIncident` to use that helper instead of reading `definition.choices` directly.

Run: `npm.cmd test -- src/test/station-incidents.test.ts`

Expected: PASS.

### Task 4: Resident Role UI

**Files:**
- Modify: `src/platform/i18n.ts`
- Modify: `src/ui/components/ResidentsPanel.tsx`
- Modify: `src/ui/components/ResidentCollectionBook.tsx`
- Modify: `src/ui/components/StationIncidentJournal.tsx`
- Test: `src/test/components.test.tsx`

**Interfaces:**
- Consumes: `getResidentRoleProfile(residentId)`
- Consumes: `getAvailableStationIncidentChoices(state, incidentId)`
- Adds translation keys: `residentRoleIncome`, `residentRoleComfort`, `residentRoleMaintenance`, `residentRoleVisitor`, `residentRoleRenovation`

- [ ] **Step 1: Write failing UI tests for resident role labels and filtered choices**

Add tests to `src/test/components.test.tsx` that render `ResidentsPanel` and verify role labels for `sleepy_engineer`, then render `StationIncidentJournal` with and without `mist_cook` and verify the role-gated `make_borscht_tradition` choice appears only with the comfort role.

Run: `npm.cmd test -- src/test/components.test.tsx`

Expected: FAIL because role labels are not rendered and journal renders all static choices.

- [ ] **Step 2: Add role translations and resident role tags**

Add the five role translation labels in `src/platform/i18n.ts`. In `ResidentsPanel` and `ResidentCollectionBook`, use `getResidentRoleProfile` to render compact role tags next to resident status or bonus text.

Run: `npm.cmd test -- src/test/components.test.tsx`

Expected: resident role label test PASS, incident choice filtering test still FAIL.

- [ ] **Step 3: Filter journal choices through domain helper**

Update `StationIncidentJournal` to use `getAvailableStationIncidentChoices(gameState, incident.id)` instead of `definition.choices`.

Run: `npm.cmd test -- src/test/components.test.tsx`

Expected: PASS.

### Task 5: Docs And Verification

**Files:**
- Modify: `docs/game-design/03-content-progression.md`
- Modify: `docs/game-design/08-technical-architecture.md`
- Modify: `docs/superpowers/plans/2026-07-05-resident-build-engine.md`

**Interfaces:**
- No code interfaces.

- [ ] **Step 1: Update game-design docs**

Document:

- resident roles and point totals;
- duty preferred roles and role bonuses;
- incident role-gated choices;
- renovation-build remains future scope.

- [ ] **Step 2: Run focused tests**

Run:

```powershell
npm.cmd test -- src/test/residents.test.ts src/test/communal-duties.test.ts src/test/station-incidents.test.ts src/test/components.test.tsx
```

Expected: PASS.

- [ ] **Step 3: Run full verification**

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
- status shows only files intentionally changed by this plan.
