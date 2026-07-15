# Yandex Runtime Regressions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Устранить повторные 404 ресурсов, превышение лимитов облачного сохранения и буквенный перенос текста, затем научить аудит находить root-relative пути внутри production-JS.

**Architecture:** Динамические ресурсы получают единый относительный resolver и отрицательный кеш загрузки. Локальные сохранения остаются немедленными, а отдельная очередь объединяет облачные записи и кешированный объект Yandex Player исключает повторную инициализацию. CSS-патч ограничивается карточками модулей; аудитор расширяет существующую проверку Rule 1.22.

**Tech Stack:** TypeScript, React 19, Vite 7, PixiJS 8, Vitest 3, Node.js ESM.

## Global Constraints

- Не менять игровую экономику, секундный тик и формат сохранения.
- Не менять desktop/mobile breakpoint и не выполнять общий редизайн.
- Локальное сохранение выполняется при каждом изменении состояния.
- Облачная запись получает последнюю версию и выполняется не чаще одного раза в 15 секунд, кроме принудительной отправки при скрытии страницы.
- Production-код не содержит локальных URL, начинающихся с `/assets/`.
- Снимок правил Яндекс Игр не обновляется.

---

### Task 1: Portable dynamic asset paths and negative cache

**Files:**
- Create: `src/platform/assets.ts`
- Modify: `src/station/roomScenes.ts`
- Modify: `src/station/roomRewardSprites.ts`
- Modify: `src/ui/components/PixiStationScene.tsx`
- Test: `src/test/room-scenes.test.ts`
- Test: `src/test/room-reward-sprites.test.ts`
- Test: `src/test/components.test.tsx`

**Interfaces:**
- Produces: `resolveAssetUrl(path: string, baseUrl?: string): string`.
- Preserves: `getRoomSpriteAsset(moduleId, detailLevel): string | null`.

- [ ] **Step 1: Write failing path and retry tests**

Assert that room, reward, cat paths start with `./assets/`, not `/assets/`. Extend the missing-sprite test to call `loadRoomSpriteAssetForState` twice and assert `Assets.load` was called once.

```ts
expect(getRoomSpriteAsset('tenant_capsule', 1)).toBe('./assets/rooms/tenant_capsule/tenant_capsule_01.png');
await loadRoomSpriteAssetForState(state, 'oxygen_garden');
await loadRoomSpriteAssetForState(state, 'oxygen_garden');
expect(loadSpy).toHaveBeenCalledTimes(1);
```

- [ ] **Step 2: Run RED tests**

Run: `npm.cmd test -- src/test/room-scenes.test.ts src/test/room-reward-sprites.test.ts src/test/components.test.tsx`

Expected: FAIL because current values start with `/assets/` and a failed alias is retried.

- [ ] **Step 3: Add the resolver and use it for every dynamic game asset**

```ts
export function resolveAssetUrl(path: string, baseUrl = import.meta.env.BASE_URL): string {
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${base}${path.replace(/^\.?\//, '')}`;
}
```

Use `resolveAssetUrl('assets/...')` in room sprites, reward sprites and both tenant-cat constants. Before `Assets.load`, return immediately when the alias is already in the corresponding unavailable set; do not delete the marker until a cached texture is actually present.

- [ ] **Step 4: Run GREEN tests**

Run: `npm.cmd test -- src/test/room-scenes.test.ts src/test/room-reward-sprites.test.ts src/test/components.test.tsx`

Expected: all selected tests PASS.

- [ ] **Step 5: Commit**

```powershell
git add -- src/platform/assets.ts src/station/roomScenes.ts src/station/roomRewardSprites.ts src/ui/components/PixiStationScene.tsx src/test/room-scenes.test.ts src/test/room-reward-sprites.test.ts src/test/components.test.tsx
git commit -m "fix: resolve yandex runtime assets relatively"
```

### Task 2: Rate-limited cloud-save queue and cached Player

**Files:**
- Create: `src/platform/cloudSaveQueue.ts`
- Create: `src/test/cloud-save-queue.test.ts`
- Modify: `src/platform/yandex.ts`
- Modify: `src/ui/useGameState.ts`
- Modify: `src/test/yandex-integration.test.ts`

**Interfaces:**
- Produces: `CLOUD_SAVE_INTERVAL_MS = 15_000`.
- Produces: `CloudSaveQueue.enqueue(key: string, value: string): void`, `flushNow(): Promise<void>`, `dispose(): void`.
- Preserves: `YandexPlatform.saveCloud(key, value): Promise<void>`.

- [ ] **Step 1: Write failing queue and Player-cache tests**

Use fake timers to enqueue changing values once per second for 30 seconds. Assert that the first value is sent immediately, later sends are separated by 15 seconds, and the latest value wins. In the platform integration test, call load and save methods several times and assert `sdk.getPlayer` is called once.

```ts
expect(saveCloud.mock.calls.length).toBeLessThanOrEqual(3);
expect(saveCloud).toHaveBeenLastCalledWith(SAVE_KEY, 'latest');
expect(getPlayer).toHaveBeenCalledTimes(1);
```

- [ ] **Step 2: Run RED tests**

Run: `npm.cmd test -- src/test/cloud-save-queue.test.ts src/test/yandex-integration.test.ts`

Expected: FAIL because the queue does not exist and `getPlayer()` is called for every operation.

- [ ] **Step 3: Implement `CloudSaveQueue`**

Store one pending `{ key, value }`, one timer, one in-flight promise and the last request start time. `enqueue` overwrites pending data and schedules the earliest allowed send. `flushNow` clears the timer and bypasses the interval. After an in-flight request settles, schedule the newest pending value. `dispose` clears the timer.

```ts
export const CLOUD_SAVE_INTERVAL_MS = 15_000;

export class CloudSaveQueue {
  constructor(
    private readonly save: (key: string, value: string) => Promise<void>,
    private readonly intervalMs = CLOUD_SAVE_INTERVAL_MS
  ) {}
  enqueue(key: string, value: string): void;
  flushNow(): Promise<void>;
  dispose(): void;
}
```

- [ ] **Step 4: Integrate the queue and cache the Yandex Player promise**

Create one queue per `useGameState` hook using a closure around `platformRef.current.saveCloud`. The state-save effect continues calling `storage.save` immediately and only enqueues the cloud payload. On `visibilitychange` with `document.hidden === true`, call `flushNow`; dispose on unmount. Remove the direct cloud write from `resetSave` so the state effect remains the single path.

Inside `createYandexPlatform`, share one retryable `playerPromise` between `loadCloudSave` and `saveCloud`; reset it only when `getPlayer()` rejects.

- [ ] **Step 5: Run GREEN tests**

Run: `npm.cmd test -- src/test/cloud-save-queue.test.ts src/test/yandex-integration.test.ts`

Expected: all selected tests PASS with bounded cloud calls and a single Player initialization.

- [ ] **Step 6: Commit**

```powershell
git add -- src/platform/cloudSaveQueue.ts src/platform/yandex.ts src/ui/useGameState.ts src/test/cloud-save-queue.test.ts src/test/yandex-integration.test.ts
git commit -m "fix: coalesce yandex cloud saves"
```

### Task 3: Readable module preview at the desktop boundary

**Files:**
- Modify: `src/styles/global.css`
- Test: `src/test/ui-copy-wrapping-css.test.ts`

**Interfaces:**
- Consumes existing `.module-panel`, `.action-preview.inline`, `.action-preview-tags` selectors.
- Produces no TypeScript API.

- [ ] **Step 1: Write the failing CSS regression test**

Assert that the module-panel override has one grid column, wrapping tags, and word-only copy wrapping.

```ts
expect(ruleBody(/\.module-panel \.action-preview\.inline\s*\{([^}]*)\}/s))
  .toContain('grid-template-columns: minmax(0, 1fr)');
expect(ruleBody(/\.module-panel \.action-preview\.inline \.action-preview-tags\s*\{([^}]*)\}/s))
  .toContain('flex-wrap: wrap');
```

- [ ] **Step 2: Run the test to verify RED**

Run: `npm.cmd test -- src/test/ui-copy-wrapping-css.test.ts`

Expected: FAIL because the scoped overrides do not exist.

- [ ] **Step 3: Add scoped CSS overrides**

```css
.module-panel .action-preview.inline {
  grid-template-columns: minmax(0, 1fr);
}

.module-panel .action-preview.inline .action-preview-tags {
  flex-wrap: wrap;
  justify-content: flex-start;
}

.module-panel .action-preview.inline .action-preview-text small {
  overflow-wrap: break-word;
  word-break: normal;
}
```

- [ ] **Step 4: Run GREEN test and verify the 900 px viewport**

Run: `npm.cmd test -- src/test/ui-copy-wrapping-css.test.ts src/test/responsive.test.tsx`

Expected: tests PASS. Browser probe at 900×700 must report preview text width above 90 px and no character-by-character wrapping.

- [ ] **Step 5: Commit**

```powershell
git add -- src/styles/global.css src/test/ui-copy-wrapping-css.test.ts
git commit -m "fix: keep module preview copy readable"
```

### Task 4: Detect root-relative assets inside production JavaScript

**Files:**
- Modify: `C:/Users/Пользователь/.codex/skills/auditing-yandex-games/scripts/lib/audit.mjs`
- Modify: `C:/Users/Пользователь/.codex/skills/auditing-yandex-games/tests/audit.test.mjs`

**Interfaces:**
- Extends existing `inspectLocalResourceReferences(files)`.
- Preserves existing issue shape `{ html, url, reason }` for report compatibility.

- [ ] **Step 1: Write the failing auditor test**

Add a JS file containing `const sprite = "/assets/rooms/capsule.png"` and expect a root-relative issue attributed to that JS file. Include `https://example.test/assets/x.png` and `./assets/x.png` as non-findings.

- [ ] **Step 2: Run auditor test to verify RED**

Run: `npm.cmd test --prefix "C:\Users\Пользователь\.codex\skills\auditing-yandex-games"`

Expected: FAIL because only HTML attributes are scanned.

- [ ] **Step 3: Extend the scanner narrowly**

For `.js`, `.mjs` and `.cjs` text files, find quoted string literals beginning exactly with `/assets/` and append `{ html: file.relative, url, reason: 'root-relative' }`. Do not match `https://`, protocol-relative URLs, regex literals or relative `./assets/` strings.

- [ ] **Step 4: Run auditor tests and validate the skill**

Run: `npm.cmd test --prefix "C:\Users\Пользователь\.codex\skills\auditing-yandex-games"`

Run: `node "C:\Users\Пользователь\.codex\skills\auditing-yandex-games\scripts\validate-skill.mjs"`

Expected: all audit, workflow and skill tests PASS; validation reports success.

### Task 5: Release verification

**Files:**
- Regenerate: `dist/**`
- Regenerate: `release/game.zip`

- [ ] **Step 1: Run the full application test suite**

Run: `npm.cmd test`

Expected: 0 failed tests.

- [ ] **Step 2: Build and package the release**

Run: `npm.cmd run release`

Expected: TypeScript and Vite build succeed; `release/game.zip` is recreated.

- [ ] **Step 3: Verify the production artifact**

Search decoded ZIP JavaScript for quoted `/assets/` paths and assert none are present. Confirm `tenant_capsule_01.png` exists under `assets/rooms/tenant_capsule/`.

- [ ] **Step 4: Run the deterministic Yandex audit**

Run: `node "C:\Users\Пользователь\.codex\skills\auditing-yandex-games\scripts\audit.mjs" "C:\Users\Пользователь\Documents\ЯИ\new30.06" --run-build --run-serve --format json`

Expected: `BLOCKER=0`, `ERROR=0`, `WARNING=0`; Rules 1.21 and 1.22 are `PASS`.

- [ ] **Step 5: Check repository state**

Run: `git diff --check`

Expected: no whitespace errors; only pre-existing untracked artifacts remain.
