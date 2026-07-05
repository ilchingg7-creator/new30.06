# Station Events, Goals And Renovation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace low-value current tasks with meaningful station events, make visitor offers respect short wait times, rotate goals by renovation cycle, and make renovation upgrades a gated 1-of-3 tier choice.

**Architecture:** Keep economy and progression rules in `src/game`, keep UI presentation in React components, and keep text/content in `src/game/content` plus `platform/i18n`. `StationTaskPanel` becomes event-only; goals remain in `GoalPanel`; prestige upgrades become a broader permanent-choice list gated by renovation count.

**Tech Stack:** TypeScript, React, Vitest, existing save schema migration.

## Global Constraints

- Do not add new runtime dependencies.
- Do not grant goal credits.
- Completed goals stay hidden from the active goal list.
- Visitor offers that cost credits for comfort must not spawn when the player needs more than 7 seconds to afford them.
- Each renovation grants at most one prestige-upgrade purchase slot.
- Each unspent renovation slot shows exactly 3 tier-specific upgrades.
- Renovation requires reward, station-progress and current-cycle goal requirements.
- Update game-design markdown when mechanics change.

---

### Task 1: Station Events

**Files:**
- Modify: `src/game/stationDirector.ts`
- Modify: `src/ui/layouts/DesktopLayout.tsx`
- Modify: `src/ui/layouts/MobileLayout.tsx`
- Modify: `src/ui/components/StationTaskPanel.tsx`
- Test: `src/test/station-director.test.ts`
- Test: `src/test/station-task-panel.test.tsx`
- Test: `src/test/responsive.test.tsx`

**Interfaces:**
- `getStationGuidance(input): StationGuidance | null`
- Goal and module guidance are removed from station guidance.
- Layouts render `StationTaskPanel` only when guidance is not null.

**Steps:**
- [x] Add failing tests that module/goal-only states return `null`.
- [x] Update layouts to conditionally render task/event panel.
- [x] Remove goal/module guidance variants and UI branches.
- [x] Run station director, task panel and responsive tests.

### Task 2: Visitor Wait Filter

**Files:**
- Modify: `src/game/visitors.ts`
- Modify: `src/ui/useGameState.ts`
- Test: `src/test/visitors.test.ts`

**Interfaces:**
- `generateVisitorRequest(state, now, incomePerSecond = 0): VisitorRequest | null`
- Visitor generation returns null if missing credits require more than `7` seconds at current income.

**Steps:**
- [x] Add failing visitor tests for >7 seconds, <=7 seconds and zero-income unaffordable cases.
- [x] Pass income into visitor generation from `useGameState`.
- [x] Run visitor and Yandex integration tests.

### Task 3: Renovation Cycle Goals

**Files:**
- Modify: `src/game/types.ts`
- Modify: `src/game/content/goals.ts`
- Modify: `src/game/goals.ts`
- Modify: `src/game/stationDirector.ts`
- Modify: `src/ui/components/GoalPanel.tsx`
- Test: `src/test/goals.test.ts`

**Interfaces:**
- `GoalDefinition` gains `renovationCycle: 0 | 1 | 2`.
- `getVisibleGoals` filters goals by `state.prestigeCount ?? 0`, using cycle `2` for all later cycles.
- Reward labels should name only implemented effects.

**Steps:**
- [x] Add failing tests for first-cycle goals, second-cycle goals after one renovation, and later-cycle goals.
- [x] Add enough cycle-specific goal definitions to keep the panel populated.
- [x] Keep `completeEligibleGoals` comfort-only until other reward effects are implemented.
- [x] Run goal, economy and app smoke tests.

### Task 4: Renovation Upgrade Choices

**Files:**
- Modify: `src/game/types.ts`
- Modify: `src/game/content/prestigeUpgrades.ts`
- Modify: `src/game/economy.ts`
- Modify: `src/ui/components/PrestigeUpgradesPanel.tsx`
- Modify: `src/platform/i18n.ts`
- Test: `src/test/prestige-upgrades.test.ts`
- Test: `src/test/components.test.tsx`

**Interfaces:**
- Add 7-9 new `PrestigeUpgradeId` values.
- `buyPrestigeUpgrade` rejects purchases when the upgrade is not in `getAvailablePrestigeUpgrades(state)`.
- First renovation creates one tier-1 purchase slot with 3 choices.
- Later renovation slots advance to later 3-choice tiers and do not repeat similar numeric upgrades.

**Steps:**
- [x] Add failing tests for one-upgrade-per-renovation and second purchase blocked.
- [x] Add expanded upgrade content and localized names/descriptions.
- [x] Update UI copy to show remaining renovation picks.
- [x] Run prestige, components and focused related tests.

### Task 5: Docs And Verification

**Files:**
- Modify: `docs/game-design/01-core-loop.md`
- Modify: `docs/game-design/02-economy-balance.md`
- Modify: `docs/game-design/03-content-progression.md`
- Modify: `docs/game-design/10-progression-roadmap.md`

**Steps:**
- [x] Document station events replacing current tasks.
- [x] Document visitor wait rule.
- [x] Document renovation-cycle goals.
- [x] Document one upgrade choice per renovation.
- [x] Run `npm.cmd test`, `npm.cmd run build`, `git diff --check`, and inspect `git status --short`.
