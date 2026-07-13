# Wrap Truncated UI Copy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow all identified interface copy except leaderboard player names to wrap instead of ending in an ellipsis.

**Architecture:** Keep the change entirely in the shared stylesheet and protect it with a focused Vitest CSS regression test. React components and translation data remain unchanged because the truncation originates in selector-level CSS.

**Tech Stack:** CSS, TypeScript, Vitest

## Global Constraints

- `.leaderboard-name` must retain `text-overflow: ellipsis` and `white-space: nowrap`.
- In-scope copy must use `white-space: normal` and `overflow-wrap: anywhere`.
- In-scope rules must not use `text-overflow: ellipsis` or hide overflowing text.
- Do not change React components, translations, or layout dimensions.

---

### Task 1: Replace truncation with wrapping

**Files:**
- Create: `src/test/ui-copy-wrapping-css.test.ts`
- Modify: `src/styles/global.css:226-232,1547-1551,1643-1650,1927-1931,2238-2242,2279-2283`

**Interfaces:**
- Consumes: selector rules from `src/styles/global.css`
- Produces: regression coverage for wrapping behavior; no runtime API changes

- [ ] **Step 1: Write the failing CSS regression test**

Create `src/test/ui-copy-wrapping-css.test.ts` with a helper that extracts rule bodies. Assert that the income name, compact task body, compact duty copy, inline action detail, base incident choice copy, and compact incident override contain `white-space: normal` and `overflow-wrap: anywhere`, and contain neither `text-overflow: ellipsis` nor `overflow: hidden`. Separately assert that `.leaderboard-name` retains ellipsis and nowrap.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- src/test/ui-copy-wrapping-css.test.ts`

Expected: FAIL because the in-scope selectors still contain truncation rules or lack `overflow-wrap: anywhere`.

- [ ] **Step 3: Apply the minimal stylesheet change**

For each in-scope selector, remove `overflow: hidden`, remove `text-overflow: ellipsis`, replace `white-space: nowrap` with `white-space: normal`, and add `overflow-wrap: anywhere`. Leave `.leaderboard-name` unchanged. Normalize the compact incident override to the same declarations.

- [ ] **Step 4: Run focused and complete verification**

Run: `npm test -- src/test/ui-copy-wrapping-css.test.ts`

Expected: PASS.

Run: `npm test`

Expected: all tests PASS.

Run: `npm run build`

Expected: TypeScript and Vite build complete successfully.

- [ ] **Step 5: Review the diff**

Run: `git diff --check` and `git diff -- src/styles/global.css src/test/ui-copy-wrapping-css.test.ts`.

Expected: no whitespace errors; only the intended CSS rules and regression test differ.
