# Player-Facing Bonus Tour Copy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Russian onboarding bonus description with the approved player-facing advertising guidance.

**Architecture:** Keep the localization structure and UI unchanged. Lock the exact Russian copy with a focused Vitest regression, then replace only `translations.ru.tourStepBonusesBody`.

**Tech Stack:** TypeScript, Vitest 3, existing localization object in `src/platform/i18n.ts`.

## Global Constraints

- Exact copy: «Хотите больше дохода? Смотрите рекламу, удваивайте аренду и приглашайте VIP-жильца. А за ежедневный вход вас ждут награды.»
- Change only the Russian `tourStepBonusesBody` localization string.
- Preserve the step title, layout, pagination, other languages, tooltips, and bonus mechanics.
- The message must not contain `Yandex Games`, `локально`, or developer-oriented platform explanations.
- Preserve unrelated uncommitted offline-income changes.

---

### Task 1: Replace the Russian bonus-tour body

**Files:**
- Create: `src/test/player-facing-bonus-tour-copy.test.ts`
- Modify: `src/platform/i18n.ts:471`

**Interfaces:**
- Consumes: `translations.ru.tourStepBonusesBody: string` exported by `src/platform/i18n.ts`.
- Produces: the approved player-facing string rendered by onboarding step 4/5.

- [ ] **Step 1: Write the failing localization regression**

```ts
import { describe, expect, it } from 'vitest';
import { translations } from '../platform/i18n';

describe('player-facing bonus tour copy', () => {
  it('describes ad bonuses without platform or developer language', () => {
    const copy = translations.ru.tourStepBonusesBody;

    expect(copy).toBe(
      'Хотите больше дохода? Смотрите рекламу, удваивайте аренду и приглашайте VIP-жильца. А за ежедневный вход вас ждут награды.'
    );
    expect(copy).not.toMatch(/Yandex Games|локальн/i);
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm.cmd test -- src/test/player-facing-bonus-tour-copy.test.ts`

Expected: FAIL because the current string starts with `На Yandex Games`.

- [ ] **Step 3: Apply the minimal localization change**

```ts
tourStepBonusesBody: 'Хотите больше дохода? Смотрите рекламу, удваивайте аренду и приглашайте VIP-жильца. А за ежедневный вход вас ждут награды.',
```

- [ ] **Step 4: Verify GREEN without absorbing unrelated test failures**

Run: `npm.cmd test -- src/test/player-facing-bonus-tour-copy.test.ts`

Expected: one test PASS.

Run: `npm.cmd test -- src/test/screens.test.tsx src/test/components.test.tsx`

Expected: onboarding/UI-related suites PASS. Do not modify the known concurrent cloud-save/offline-income failure.

- [ ] **Step 5: Check the exact diff and commit only scoped files**

```powershell
git diff --check -- src/platform/i18n.ts src/test/player-facing-bonus-tour-copy.test.ts
git add -- src/platform/i18n.ts src/test/player-facing-bonus-tour-copy.test.ts
git commit -m "fix: make bonus tour copy player-facing"
```

