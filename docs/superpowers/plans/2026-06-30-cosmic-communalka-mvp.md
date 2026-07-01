# Cosmic Communalka MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first playable MVP of "Космическая коммуналка", a cozy-comedy idle tycoon for Yandex Games with one shared economy, responsive desktop/mobile UI and a living PixiJS station scene.

**Architecture:** The game domain is pure TypeScript: economy, content, saves, offline rewards and prestige have no React or PixiJS dependency. React renders all UI, layouts, dialogs and Yandex platform states. PixiJS renders only the station scene through `PixiStationScene`, using plain `GameState` data from React.

**Tech Stack:** Vite, React, PixiJS, TypeScript, Vitest, Testing Library, CSS/global tokens, localStorage fallback, Yandex Games SDK adapter.

## Global Constraints

- Source docs live in `docs/game-design`; update the relevant markdown file before changing mechanics, UI, economy, Yandex integration, content, technical architecture or visual style.
- Content roadmap lives in `docs/game-design/09-content-roadmap.md`; it is future scope and must not expand MVP tasks.
- Progression roadmap lives in `docs/game-design/10-progression-roadmap.md`; it guides extensibility but Day 2-7 systems are excluded from MVP.
- Technical architecture is `React + PixiJS + TypeScript`; React renders UI and PixiJS renders only the station scene.
- Visual style is `Retro Soviet Space Cozy`; use palette tokens from `docs/game-design/07-visual-style.md`.
- Follow `docs/game-design/08-technical-architecture.md`: do not render buttons, long labels or normal UI text in PixiJS.
- One codebase must support mobile and desktop; switch layout at 900 px width.
- Mobile first-screen targets: 360x640 and 390x844.
- Desktop first-screen targets: 1366x768 and 1920x1080.
- First purchase target is 10-20 seconds.
- First new module target is 45-90 seconds.
- First visible station upgrade target is within 2 minutes.
- Offline income is capped at 8 hours.
- Rewarded ads are voluntary and must not block base progress.
- Interstitial ads remain disabled for MVP.
- Prestige is named "Реновация орбиты".
- Main currency is credits; comfort is a non-spendable score; reputation is prestige currency.
- No final AI-generated art goes into the build without rights and consistency review.

---

## File Structure

Create this structure:

```text
package.json
index.html
tsconfig.json
tsconfig.node.json
vite.config.ts
vitest.config.ts
vitest.setup.ts
src/main.tsx
src/App.tsx
src/styles/tokens.css
src/styles/global.css
src/game/types.ts
src/game/content/modules.ts
src/game/content/residents.ts
src/game/content/goals.ts
src/game/economy.ts
src/game/format.ts
src/game/save.ts
src/platform/yandex.ts
src/platform/storage.ts
src/station/stationTheme.ts
src/station/stationScene.ts
src/ui/useGameState.ts
src/ui/components/TopBar.tsx
src/ui/components/PixiStationScene.tsx
src/ui/components/ModuleList.tsx
src/ui/components/GoalPanel.tsx
src/ui/components/BonusPanel.tsx
src/ui/components/PrestigePanel.tsx
src/ui/layouts/MobileLayout.tsx
src/ui/layouts/DesktopLayout.tsx
src/ui/screens/OfflineRewardDialog.tsx
src/ui/screens/LoadingScreen.tsx
src/test/game-content.test.ts
src/test/economy.test.ts
src/test/format.test.ts
src/test/save.test.ts
src/test/station-scene.test.ts
src/test/components.test.tsx
src/test/app-smoke.test.tsx
```

Responsibilities:

- `src/game/*` contains deterministic business logic with no React, PixiJS or browser SDK dependencies.
- `src/game/content/*` contains MVP content data from the design docs.
- `src/station/*` contains PixiJS scene mapping and rendering helpers with no React state ownership.
- `src/platform/*` isolates Yandex SDK and storage fallback.
- `src/ui/*` owns React state, layouts and components.
- `src/styles/*` contains visual tokens and global responsive rules.
- `src/test/*` tests content integrity, math, persistence, Pixi scene mapping and smoke rendering.

---

### Task 1: Project Shell And Tooling

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles/tokens.css`
- Create: `src/styles/global.css`
- Create: `src/test/app-smoke.test.tsx`

**Interfaces:**
- Consumes: design docs in `docs/game-design`.
- Produces: Vite React TypeScript app shell with PixiJS installed and test/build scripts.

- [ ] **Step 1: Initialize git if needed**

Run:

```bash
git init
```

Expected: git creates `.git/`, or reports that the repository already exists.

- [ ] **Step 2: Create `package.json`**

```json
{
  "name": "cosmic-communalka",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview --host 127.0.0.1",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^5.0.0",
    "vite": "^7.0.0",
    "typescript": "^5.8.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "pixi.js": "^8.6.0",
    "lucide-react": "^0.468.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "jsdom": "^25.0.1",
    "vitest": "^3.2.6"
  }
}
```

- [ ] **Step 3: Install dependencies**

Run:

```bash
npm install
```

Expected: `node_modules` and `package-lock.json` are created.

- [ ] **Step 4: Create TypeScript and Vite config**

Create `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `vitest.config.ts` and `vitest.setup.ts` with strict TypeScript, React JSX and `jsdom` Vitest setup. `vite.config.ts` includes only Vite app config. `vitest.config.ts` must include `@vitejs/plugin-react` and:

```ts
test: {
  environment: 'jsdom',
  globals: true,
  setupFiles: './vitest.setup.ts'
}
```

- [ ] **Step 5: Create app shell**

`src/App.tsx` starts as a placeholder that renders the title `Космическая коммуналка`. `src/main.tsx` mounts `<App />` and imports `src/styles/tokens.css` plus `src/styles/global.css`.

- [ ] **Step 6: Create visual tokens**

`src/styles/tokens.css` must expose the exact style-guide palette:

```css
:root {
  --color-space-navy: #172033;
  --color-warm-panel: #e7d7b2;
  --color-enamel-green: #7fb7a6;
  --color-signal-red: #d95550;
  --color-lamp-amber: #f2b84b;
  --color-utility-blue: #5e8ccb;
  --color-ink: #27313f;
  --color-soft-white: #f8f1df;
  --radius-panel: 8px;
  --radius-control: 6px;
}
```

- [ ] **Step 7: Add app smoke test**

`src/test/app-smoke.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from '../App';

describe('App shell', () => {
  it('renders the game title', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Космическая коммуналка' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 8: Verify shell**

Run:

```bash
npm test
npm run build
```

Expected: both commands pass.

- [ ] **Step 9: Commit**

```bash
git add .gitignore docs package.json package-lock.json index.html tsconfig.json tsconfig.node.json vite.config.ts vitest.config.ts vitest.setup.ts src
git commit -m "chore: scaffold cosmic communalka app"
```

---

### Task 2: Content Types And Static Data

**Files:**
- Create: `src/game/types.ts`
- Create: `src/game/content/modules.ts`
- Create: `src/game/content/residents.ts`
- Create: `src/game/content/goals.ts`
- Create: `src/test/game-content.test.ts`

**Interfaces:**
- Consumes: `docs/game-design/02-economy-balance.md`, `docs/game-design/03-content-progression.md`.
- Produces: typed module, resident and goal data used by economy, UI and Pixi station mapping.

- [ ] **Step 1: Write content integrity tests**

Test that there are 8 modules, module prices increase, all ids are unique, and every module has a nonempty `visualKey`.

- [ ] **Step 2: Create content types**

`src/game/types.ts` must define `ModuleId`, `ResidentId`, `GoalId`, `ModuleDefinition`, `ResidentDefinition`, `GoalDefinition`, `ModuleLevels`, `TimedBonus` and `GameState`.

`GameState` must contain:

```ts
credits: number;
totalEarnedCredits: number;
comfort: number;
reputation: number;
moduleLevels: ModuleLevels;
completedGoals: GoalId[];
unlockedResidents: ResidentId[];
timedBonuses: TimedBonus[];
lastSavedAt: number;
```

- [ ] **Step 3: Create MVP content**

Create the 8 modules from `02-economy-balance.md`:

```text
tenant_capsule, cosmo_kitchen, oxygen_garden, zero_g_laundry,
teleport_entry, antigrav_gym, panorama_dome, saucer_dock
```

Create 6 residents and 7 goals from `03-content-progression.md`.

- [ ] **Step 4: Verify content**

Run:

```bash
npm test -- src/test/game-content.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game src/test/game-content.test.ts
git commit -m "feat: add cosmic communalka content data"
```

---

### Task 3: Economy Engine

**Files:**
- Create: `src/game/economy.ts`
- Create: `src/test/economy.test.ts`

**Interfaces:**
- Consumes: `modules` and `GameState`.
- Produces: `createInitialState`, `calculateIncomePerSecond`, `calculateModuleCost`, `buyModuleLevel`, `advanceGame`, `calculateOfflineReward`, `calculatePrestigeReward`, `performPrestige`.

- [ ] **Step 1: Write failing tests**

Cover:

- starting credits are `15`;
- first capsule cost is `15`;
- buying a capsule sets level to `1`;
- 10 seconds at 1 credit/sec earns `10`;
- offline reward caps at 8 hours;
- prestige reward uses `floor(sqrt(totalEarnedCredits / 100000))`.

- [ ] **Step 2: Implement economy**

Rules:

```ts
const LEVEL_COST_GROWTH = 1.15;
const OFFLINE_CAP_SECONDS = 8 * 60 * 60;
```

Milestones:

```text
level 10: x2
level 25: x2
level 50: x3
level 100: x4
```

Income:

```text
base module income * level * milestones * comfort multiplier * reputation multiplier * active timed bonuses
```

- [ ] **Step 3: Verify economy**

Run:

```bash
npm test -- src/test/economy.test.ts src/test/game-content.test.ts
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/game/economy.ts src/test/economy.test.ts
git commit -m "feat: implement idle economy"
```

---

### Task 4: Formatting, Saves And Platform Ports

**Files:**
- Create: `src/game/format.ts`
- Create: `src/game/save.ts`
- Create: `src/platform/storage.ts`
- Create: `src/platform/yandex.ts`
- Create: `src/test/format.test.ts`
- Create: `src/test/save.test.ts`

**Interfaces:**
- Produces compact number/time formatting, save serialization, localStorage fallback and Yandex SDK adapter shell.

- [ ] **Step 1: Implement formatting**

Expose:

```ts
formatCredits(value: number): string
formatRate(value: number): string
formatDuration(seconds: number): string
```

Expected examples:

```text
12400 -> 12.4K
8100000 -> 8.1M
12.34/sec -> 12.3/сек
3660 sec -> 1ч 1м
```

- [ ] **Step 2: Implement save serialization**

Expose:

```ts
export const SAVE_KEY = 'cosmic-communalka-save-v1';
serializeGameState(state: GameState): string
parseGameState(raw: string | null): GameState | null
```

Invalid JSON and invalid shapes return `null`.

- [ ] **Step 3: Implement platform ports**

`src/platform/storage.ts`:

```ts
export interface StoragePort {
  load(key: string): Promise<string | null>;
  save(key: string, value: string): Promise<void>;
}
```

`src/platform/yandex.ts` exposes `createYandexPlatform`, `markReady()` and `showRewardedAd(): Promise<boolean>`. If SDK is absent locally, rewarded ads resolve to `false`.

- [ ] **Step 4: Verify**

Run:

```bash
npm test -- src/test/format.test.ts src/test/save.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/format.ts src/game/save.ts src/platform src/test/format.test.ts src/test/save.test.ts
git commit -m "feat: add formatting saves and platform ports"
```

---

### Task 5: React Game State Hook

**Files:**
- Create: `src/ui/useGameState.ts`
- Modify: `src/App.tsx`
- Modify: `src/test/app-smoke.test.tsx`

**Interfaces:**
- Consumes: economy engine, save system and storage port.
- Produces: `useGameState()` returning state, derived income, offline reward state and actions.

- [ ] **Step 1: Implement hook**

`useGameState()` returns:

```ts
gameState
incomePerSecond
offlineReward
ready
buyLevel(moduleId)
renovateOrbit()
dismissOfflineReward()
activateIncomeBoost()
activateVipResident()
```

It loads saved data, calculates offline reward, ticks once per second, saves state changes, and never imports PixiJS.

- [ ] **Step 2: Temporarily render first module in `App.tsx`**

Render title, credits, income and module names so `app-smoke.test.tsx` can assert `Капсула арендатора`.

- [ ] **Step 3: Verify hook wiring**

Run:

```bash
npm test -- src/test/app-smoke.test.tsx
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/ui/useGameState.ts src/App.tsx src/test/app-smoke.test.tsx
git commit -m "feat: connect game state to react"
```

---

### Task 6: Pixi Station Scene

**Files:**
- Create: `src/station/stationTheme.ts`
- Create: `src/station/stationScene.ts`
- Create: `src/ui/components/PixiStationScene.tsx`
- Create: `src/test/station-scene.test.ts`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: `GameState`, `modules`, `docs/game-design/07-visual-style.md`, `docs/game-design/08-technical-architecture.md`.
- Produces: a stable canvas scene host and pure station descriptor mapping.

- [ ] **Step 1: Write station mapping tests**

`src/test/station-scene.test.ts` must test:

- all 8 modules produce descriptors;
- locked modules use utility blue;
- purchased modules use lamp amber;
- descriptor positions are stable.

- [ ] **Step 2: Implement `stationTheme.ts`**

Use exact numeric equivalents of the documented palette:

```ts
export const stationTheme = {
  spaceNavy: 0x172033,
  warmPanel: 0xe7d7b2,
  enamelGreen: 0x7fb7a6,
  signalRed: 0xd95550,
  lampAmber: 0xf2b84b,
  utilityBlue: 0x5e8ccb,
  ink: 0x27313f,
  softWhite: 0xf8f1df
} as const;
```

- [ ] **Step 3: Implement `stationScene.ts`**

Expose:

```ts
export interface StationModuleSprite {
  moduleId: ModuleId;
  x: number;
  y: number;
  active: boolean;
  tint: number;
}

export function createStationModuleSprites(gameState: GameState): StationModuleSprite[]
export function buildStationContainer(gameState: GameState): Container
```

`buildStationContainer` creates a `Container` with navy background, green corridor, warm module bodies and active/locked window lights. It must not know about React.

- [ ] **Step 4: Implement `PixiStationScene.tsx`**

The component:

- owns the Pixi `Application` lifecycle;
- initializes with `resizeTo: host`;
- appends `app.canvas` to the host;
- rebuilds scene children when `gameState` changes;
- destroys Pixi on unmount;
- renders `<section className="station-view" aria-label="Визуальный вид станции" />`.

- [ ] **Step 5: Add canvas CSS**

```css
.station-view {
  min-height: 240px;
  overflow: hidden;
  background: var(--color-space-navy);
  border-radius: var(--radius-panel);
}

.station-view canvas {
  width: 100%;
  height: 100%;
  display: block;
}
```

- [ ] **Step 6: Verify**

Run:

```bash
npm test -- src/test/station-scene.test.ts
npm run build
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/station src/ui/components/PixiStationScene.tsx src/styles/global.css src/test/station-scene.test.ts
git commit -m "feat: add pixi station scene"
```

---

### Task 7: Core UI Components

**Files:**
- Create: `src/ui/components/TopBar.tsx`
- Create: `src/ui/components/ModuleList.tsx`
- Create: `src/ui/components/GoalPanel.tsx`
- Create: `src/ui/components/BonusPanel.tsx`
- Create: `src/ui/components/PrestigePanel.tsx`
- Create: `src/test/components.test.tsx`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: `GameState`, format helpers and React actions from `useGameState`.
- Produces: presentational UI components used by desktop and mobile layouts.

- [ ] **Step 1: Add component smoke test**

Render `TopBar`, `PixiStationScene`, `ModuleList`, `GoalPanel`, `BonusPanel` and `PrestigePanel`. Assert headings `Комнаты`, `Цели`, `Бонусы`, `Реновация орбиты` and station aria-label.

- [ ] **Step 2: Implement components**

Rules:

- `TopBar` shows credits, income/sec, comfort and reputation.
- `ModuleList` shows module name, role, level, next cost and disabled state.
- `GoalPanel` shows first 4 MVP goals.
- `BonusPanel` accepts `onIncomeBoost` and `onVipResident` props.
- `PrestigePanel` accepts `reputation` and `onRenovate`.

- [ ] **Step 3: Add component CSS**

Use DOM panels/cards/buttons from the visual style. UI cards and buttons use 6-8 px radius. Minimum button height is 44 px.

- [ ] **Step 4: Verify**

Run:

```bash
npm test -- src/test/components.test.tsx src/test/station-scene.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/ui/components src/styles/global.css src/test/components.test.tsx
git commit -m "feat: add core ui components"
```

---

### Task 8: Desktop And Mobile Layouts

**Files:**
- Create: `src/ui/layouts/MobileLayout.tsx`
- Create: `src/ui/layouts/DesktopLayout.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles/global.css`
- Modify: `src/test/app-smoke.test.tsx`

**Interfaces:**
- Consumes: `PixiStationScene`, core components and `useGameState`.
- Produces: responsive app layout with desktop split view and mobile tab-first view.

- [ ] **Step 1: Implement desktop layout**

Desktop layout:

```text
top bar across full width
left: ModuleList
center: PixiStationScene
right: GoalPanel, BonusPanel, PrestigePanel
```

- [ ] **Step 2: Implement mobile layout**

Mobile layout:

```text
top bar
PixiStationScene
active tab content
bottom tabs: Комнаты | Цели | Бонусы | Реновация
```

- [ ] **Step 3: Mount layouts in `App.tsx`**

Use `.desktop-only` and `.mobile-only` wrappers. Desktop appears at `min-width: 900px`.

- [ ] **Step 4: Add stable canvas layout CSS**

The station canvas container must not change height when buying modules or switching tabs.

- [ ] **Step 5: Verify**

Run:

```bash
npm test -- src/test/app-smoke.test.tsx
npm run build
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/ui/layouts src/styles/global.css src/test/app-smoke.test.tsx
git commit -m "feat: add responsive game layouts"
```

---

### Task 9: Offline Reward Dialog And Loading Screen

**Files:**
- Create: `src/ui/screens/OfflineRewardDialog.tsx`
- Create: `src/ui/screens/LoadingScreen.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: `offlineReward`, `ready`, `dismissOfflineReward` from `useGameState`.
- Produces: nonblank loading state and offline reward dialog.

- [ ] **Step 1: Implement loading screen**

Loading copy:

```text
Космическая коммуналка
Греем шлюзы
Станция готовит первый жилой модуль.
```

- [ ] **Step 2: Implement offline reward dialog**

Dialog title: `Станция поработала без вас`. It shows formatted duration and credits, with a `Забрать` button.

- [ ] **Step 3: Mount screens in `App.tsx`**

If `!game.ready`, render `LoadingScreen`. If `game.offlineReward`, render `OfflineRewardDialog`.

- [ ] **Step 4: Verify**

Run:

```bash
npm test
npm run build
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/ui/screens src/styles/global.css
git commit -m "feat: add loading and offline reward screens"
```

---

### Task 10: Rewarded Bonuses And Yandex Ready Hook

**Files:**
- Modify: `src/ui/useGameState.ts`
- Modify: `src/ui/components/BonusPanel.tsx`
- Modify: `src/ui/layouts/MobileLayout.tsx`
- Modify: `src/ui/layouts/DesktopLayout.tsx`
- Modify: `src/platform/yandex.ts`
- Create: `src/test/bonus.test.ts`

**Interfaces:**
- Consumes: timed bonus support in `GameState`.
- Produces: income boost, VIP resident boost and SDK-ready integration point.

- [ ] **Step 1: Test timed bonuses**

Assert active multiplier changes income and expired multiplier is ignored.

- [ ] **Step 2: Add bonus actions**

`activateIncomeBoost()` adds `rent_x2` with x2 multiplier for 5 minutes. `activateVipResident()` adds `vip_resident` with x2 multiplier for 10 minutes.

- [ ] **Step 3: Wire bonus buttons**

`BonusPanel` calls the two actions. Refusing or not having rewarded ad support must not block progress.

- [ ] **Step 4: Add `markYandexReady`**

`src/platform/yandex.ts` exports:

```ts
export function markYandexReady(sdk: YandexSdk | null): void {
  sdk?.features?.LoadingAPI?.ready();
}
```

- [ ] **Step 5: Verify**

Run:

```bash
npm test
npm run build
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/ui src/platform/yandex.ts src/test/bonus.test.ts
git commit -m "feat: add rewarded bonus actions"
```

---

### Task 11: Pixi Visual Polish And Responsive Verification

**Files:**
- Modify: `src/station/stationScene.ts`
- Modify: `src/ui/components/PixiStationScene.tsx`
- Modify: `src/styles/global.css`
- Review: `docs/game-design/07-visual-style.md`
- Review: `docs/game-design/08-technical-architecture.md`

**Interfaces:**
- Consumes: Retro Soviet Space Cozy style guide and Pixi architecture doc.
- Produces: first polished station scene that is nonblank, framed and readable on mobile and desktop.

- [ ] **Step 1: Check docs before editing**

Read `07-visual-style.md` and `08-technical-architecture.md`. If the implementation needs a new palette, silhouette, motion rule or Pixi boundary change, update markdown first.

- [ ] **Step 2: Improve Pixi scene**

Add:

- central corridor;
- two antennas;
- warm active windows;
- locked module hardpoints;
- oxygen garden green accent;
- teleport blue accent;
- subtle star background.

- [ ] **Step 3: Add lightweight motion**

Use Pixi ticker for subtle window pulse or antenna blink. The motion must not affect DOM UI button positions.

- [ ] **Step 4: Verify technically**

Run:

```bash
npm test
npm run build
```

Expected: PASS.

- [ ] **Step 5: Verify visually**

Run:

```bash
npm run dev
```

Check:

- 390x844 mobile viewport;
- 1366x768 desktop viewport;
- canvas is nonblank;
- station remains framed;
- text does not overlap buttons;
- canvas size is stable while switching tabs and buying modules.

- [ ] **Step 6: Commit**

```bash
git add docs/game-design/07-visual-style.md docs/game-design/08-technical-architecture.md src/station src/ui/components/PixiStationScene.tsx src/styles/global.css
git commit -m "feat: polish pixi station visuals"
```

---

### Task 12: MVP Verification Checklist

**Files:**
- Modify: `docs/game-design/06-mvp-roadmap.md` if findings change scope.
- Create: `docs/game-design/11-mvp-verification.md`

**Interfaces:**
- Consumes: all implemented MVP systems.
- Produces: repeatable manual verification checklist for desktop, mobile, Pixi scene and Yandex readiness.

- [ ] **Step 1: Create verification document**

`docs/game-design/11-mvp-verification.md`:

```md
# MVP Verification

## Automated

- `npm test` passes.
- `npm run build` passes.

## Manual Desktop

- 1366x768 shows top bar, module list, Pixi station canvas and right panels without overlap.
- 1920x1080 keeps station as the main visual focus.
- Buying the first capsule updates credits, level, income and station lights.
- Disabled purchase buttons are clearly disabled.

## Manual Mobile

- 360x640 shows credits, income, station canvas and bottom tabs.
- 390x844 allows buying a module in one tap.
- Bottom tabs do not cover purchase buttons.
- Text remains readable and does not overflow cards.

## Pixi Scene

- Canvas is nonblank after loading.
- Station stays framed after resize.
- Active module lights are visible.
- Motion is subtle and does not move DOM controls.

## Game Loop

- First purchase is possible immediately with 15 starting credits.
- First new module becomes reachable in the first 45-90 seconds.
- Offline reward appears after returning from a saved session.
- Prestige screen displays "Реновация орбиты".

## Yandex Games Readiness

- Loading screen is never blank.
- Save fallback works through localStorage.
- Rewarded bonuses are voluntary.
- Interstitial ads are disabled for MVP.
- Build size is checked before upload.
```

- [ ] **Step 2: Run checks**

Run:

```bash
npm test
npm run build
npm run dev
```

Record any scope change in `docs/game-design/06-mvp-roadmap.md` before changing code.

- [ ] **Step 3: Commit**

```bash
git add docs/game-design/06-mvp-roadmap.md docs/game-design/11-mvp-verification.md
git commit -m "docs: add mvp verification checklist"
```

---

## Self-Review

Spec coverage:

- Product vision covered by Tasks 1, 7, 8 and 11.
- Core loop covered by Tasks 3, 5, 9 and 10.
- Economy and balance covered by Tasks 2, 3 and 4.
- Content progression covered by Tasks 2, 6, 7 and 11.
- Desktop/mobile UX covered by Tasks 7, 8, 11 and 12.
- Yandex Games requirements covered by Tasks 4, 9, 10 and 12.
- Visual style covered by Tasks 1, 6, 7 and 11.
- Technical architecture covered by Tasks 1, 5, 6, 8 and 11.

Placeholder scan:

- No unfinished-work markers are intended in the plan.
- No task relies on an unnamed function or file.

Type consistency:

- `ModuleId`, `ResidentId`, `GoalId`, `GameState` originate in `src/game/types.ts`.
- Economy exports are consumed by `useGameState`.
- UI layouts consume `ReturnType<typeof useGameState>`.
- Pixi scene mapping consumes `GameState` but never mutates economy.
- Storage and Yandex interfaces stay behind `src/platform`.
