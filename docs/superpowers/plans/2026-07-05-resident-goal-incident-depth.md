# Resident, Goal And Incident Depth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make resident bonuses, goal reward kinds and station incident effects mechanically real.

**Architecture:** Domain logic stays in `src/game`; React panels continue to render existing state and labels. Resident bonuses are helper functions consumed by economy and unlock logic. Goal rewards get explicit optional effect fields and are applied by `completeEligibleGoals`. Incident depth is added by promoting existing backlog entries and using the current queue/resolve pipeline.

**Tech Stack:** TypeScript, React, Vitest, existing save schema.

## Global Constraints

- Do not add runtime dependencies.
- Do not add a new currency.
- Keep completed goals hidden from the active goal list.
- Keep station incidents non-modal.
- Keep incident cap at 3 unresolved entries.
- Keep incident generation at 1 new incident per state update.
- Use TDD: write and run failing tests before production code.
- Update game-design markdown after mechanics change.

---

### Task 1: Resident Bonuses

**Files:**
- Modify: `src/game/residents.ts`
- Modify: `src/game/economy.ts`
- Test: `src/test/residents.test.ts`
- Test: `src/test/economy.test.ts`

**Interfaces:**
- Produce: `getResidentModuleIncomeMultiplier(state: GameState, moduleId: ModuleId): number`
- Produce: `getResidentGlobalIncomeMultiplier(state: GameState): number`
- Produce: `getResidentFirstRoomCostMultiplier(state: GameState): number`
- Consume: `calculateIncomePerSecond(state, now)` and `calculateModuleCost(moduleId, state)`

- [x] **Step 1: Write failing resident income tests**

Add tests that unlocked `sleepy_engineer`, `mist_cook`, `sock_master`,
`teleport_courier` and `retired_cosmonaut` change calculated income.

Run: `npm.cmd test -- src/test/economy.test.ts src/test/residents.test.ts`
Expected: FAIL because income ignores resident bonuses.

- [x] **Step 2: Implement resident income helpers**

Add helper functions in `src/game/residents.ts` and call them from
`calculateIncomePerSecond`.

Run: `npm.cmd test -- src/test/economy.test.ts src/test/residents.test.ts`
Expected: PASS for resident income tests.

- [x] **Step 3: Write failing unlock comfort and discount tests**

Add tests for `vacuum_gardener` one-time comfort gain and
`three_eyed_housekeeper` first-room discount.

Run: `npm.cmd test -- src/test/economy.test.ts src/test/residents.test.ts`
Expected: FAIL because those effects are not applied.

- [x] **Step 4: Implement comfort unlock and discount effects**

Update resident unlock application and module cost calculation with the helper
multiplier.

Run: `npm.cmd test -- src/test/economy.test.ts src/test/residents.test.ts`
Expected: PASS.

### Task 2: Goal Reward Effects

**Files:**
- Modify: `src/game/types.ts`
- Modify: `src/game/content/goals.ts`
- Modify: `src/game/goals.ts`
- Test: `src/test/goals.test.ts`
- Test: `src/test/save.test.ts`

**Interfaces:**
- Extend: `GoalDefinition` with optional `rewardVisualPlaceholderIds?: VisualPlaceholderId[]`
- Extend: `GoalDefinition` with optional `rewardTimedBonus?: { id: string; incomeMultiplier: number; durationMs: number }`
- Consume: `completeEligibleGoals(state)`

- [x] **Step 1: Write failing tests for visual and timed goal rewards**

Add tests showing a visual-detail goal adds `unlockedIncidentVisuals` and a
temporary-boost goal adds a finite timed bonus.

Run: `npm.cmd test -- src/test/goals.test.ts src/test/save.test.ts`
Expected: FAIL because only comfort rewards are applied.

- [x] **Step 2: Implement goal reward application**

Update `completeEligibleGoals` to apply comfort, visual flags and timed bonuses
once per completed goal.

Run: `npm.cmd test -- src/test/goals.test.ts src/test/save.test.ts`
Expected: PASS.

- [x] **Step 3: Convert selected goal content**

Change several existing goals to `visual_detail` and `temporary_boost` with
clear reward labels.

Run: `npm.cmd test -- src/test/goals.test.ts src/test/components.test.tsx`
Expected: PASS.

### Task 3: Station Incident Depth

**Files:**
- Modify: `src/game/content/stationIncidents.ts`
- Modify: `src/game/stationIncidents.ts`
- Test: `src/test/station-incidents.test.ts`

**Interfaces:**
- Preserve: `queueEligibleIncidents(state, context)`
- Preserve: `resolveStationIncident(state, incidentId, choiceId)`
- Change: active incident count from 10 to 15.

- [x] **Step 1: Write failing active-slice and reward-variety tests**

Add tests that active incidents count 15 and credit-positive choices are rare
relative to visual/condition/timed/comfort effects.

Run: `npm.cmd test -- src/test/station-incidents.test.ts`
Expected: FAIL because active count is 10 and effects are still shallow.

- [x] **Step 2: Promote five backlog incidents**

Enable five existing backlog ids with meaningful triggers and choices.

Run: `npm.cmd test -- src/test/station-incidents.test.ts`
Expected: PASS for active count and queue tests.

- [x] **Step 3: Add timed bonus coverage**

Ensure at least one active incident choice grants a timed income bonus with a
real future `expiresAt`.

Run: `npm.cmd test -- src/test/station-incidents.test.ts`
Expected: PASS.

### Task 4: Docs And Verification

**Files:**
- Modify: `docs/game-design/01-core-loop.md`
- Modify: `docs/game-design/02-economy-balance.md`
- Modify: `docs/game-design/03-content-progression.md`

**Interfaces:**
- No code interfaces.

- [x] **Step 1: Update design docs**

Document real resident bonuses, actual goal reward effects and expanded active
incident slice.

- [x] **Step 2: Run focused tests**

Run: `npm.cmd test -- src/test/economy.test.ts src/test/residents.test.ts src/test/goals.test.ts src/test/station-incidents.test.ts`
Expected: PASS.

- [x] **Step 3: Run full verification**

Run: `npm.cmd test`
Expected: all tests PASS.

Run: `npx.cmd tsc --noEmit`
Expected: exit 0.

Run: `git diff --check`
Expected: no whitespace errors.
