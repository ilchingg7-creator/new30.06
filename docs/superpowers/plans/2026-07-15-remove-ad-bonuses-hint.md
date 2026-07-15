# Remove Ad Bonuses Hint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the local-platform advertising hint from the Bonuses panel without changing any other advertising copy or bonus behavior.

**Architecture:** Delete the hint at its React render site, then remove the translation field that no longer has a consumer. Protect the UI behavior with a component test that uses the old English sentence as an independent regression assertion.

**Tech Stack:** TypeScript 5, React 19, Vitest 3, Testing Library.

## Global Constraints

- Keep help dialog copy, onboarding copy, and button tooltips unchanged.
- Keep advertising behavior and bonus activation logic unchanged.
- Do not hide or replace the paragraph with CSS or an empty element.

---

### Task 1: Remove the Bonuses Panel Advertising Hint

**Files:**
- Modify: `src/test/components.test.tsx`
- Modify: `src/ui/components/BonusPanel.tsx`
- Modify: `src/platform/i18n.ts`

**Interfaces:**
- Consumes: `BonusPanel(props: BonusPanelProps)` and `translations.en`.
- Produces: a `BonusPanel` DOM with no local-platform advertising hint, and a `Translation` interface without `adBonusesHint`.

- [ ] **Step 1: Write the failing component test**

Add this test inside `describe('core UI components', ...)` in `src/test/components.test.tsx`:

```tsx
it('does not render the local ad bonuses hint', () => {
  render(
    <BonusPanel
      onIncomeBoost={vi.fn()}
      onVipResident={vi.fn()}
      onPurchaseStrangeCat={vi.fn()}
      strangeCatProduct={null}
      strangeCatPurchaseStatus="unavailable"
      adsAvailable={false}
      t={translations.en}
    />
  );

  expect(
    screen.queryByText(
      'Ad bonuses are available on Yandex Games. Locally they activate immediately.'
    )
  ).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
npm test -- src/test/components.test.tsx -t "does not render the local ad bonuses hint"
```

Expected: FAIL because `queryByText(...)` finds the existing hint paragraph.

- [ ] **Step 3: Remove the paragraph and obsolete translation field**

Delete this block from `src/ui/components/BonusPanel.tsx`:

```tsx
{!adsAvailable && (
  <p className="panel-copy">{t.adBonusesHint}</p>
)}
```

Delete the field from the `Translation` interface in `src/platform/i18n.ts`:

```ts
adBonusesHint: string;
```

Delete the Russian and English translation properties from their respective translation objects:

```ts
adBonusesHint: 'Рекламные бонусы доступны на Yandex Games. Локально бонусы включаются сразу.',
```

```ts
adBonusesHint: 'Ad bonuses are available on Yandex Games. Locally they activate immediately.',
```

Keep `adsAvailable` in `BonusPanelProps` because it still controls the labels of both advertising bonus buttons.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```bash
npm test -- src/test/components.test.tsx -t "does not render the local ad bonuses hint"
```

Expected: PASS.

- [ ] **Step 5: Run regression verification**

Run:

```bash
npm test
npm run build
git diff --check
```

Expected: all tests pass, the production build succeeds, and `git diff --check` prints no errors.

- [ ] **Step 6: Commit the implementation**

```bash
git add src/test/components.test.tsx src/ui/components/BonusPanel.tsx src/platform/i18n.ts
git commit -m "fix: remove local ad bonuses hint"
```
