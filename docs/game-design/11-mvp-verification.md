# MVP Verification

## Automated

- `npm test` passes.
- `npm run build` passes.

## Manual Desktop

- 1366x768 shows top bar, module list, room selector, Pixi room canvas and right panels without overlap.
- 1920x1080 keeps the focused room scene as the main visual focus.
- Buying the first capsule updates credits, level, income and room detail.
- Disabled purchase buttons are clearly disabled.

## Manual Mobile

- 360x640 shows credits, income, room selector, station canvas and bottom tabs.
- 390x844 allows buying a module in one tap.
- Selector scrolls horizontally without covering purchase buttons.
- Bottom tabs do not cover purchase buttons.
- Text remains readable and does not overflow cards or selector buttons.

## Pixi Scene

- Canvas is nonblank after loading.
- Focused room scene stays framed after resize.
- Room ambient lights are visible.
- Motion is subtle and does not move DOM controls.

## Focused Room Scenes

- Room selector is visible on desktop and mobile.
- Locked rooms are disabled in the selector.
- Buying a module level focuses that room.
- Manual room selection works for unlocked rooms.
- Room detail visibly changes at levels 1, 10, 25, 50 and 100.

## Goals

- Completed goals disappear from the active goal list.
- Goal completion does not add credits.
- Goal rewards use comfort, visual detail, temporary boost or prestige hint labels.

## Balance Pacing

- `npm test -- src/test/balance-simulation.test.ts` passes.
- The last room does not unlock during the first 2-3 minutes of normal simulation.
- `saucer_dock` target unlock remains in the 60-90 minute window without mandatory ads.

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

## Current MVP Notes

- PixiJS remains in the MVP stack by product decision.
- Current build includes Pixi renderer chunks; this is accepted for MVP but should be watched before upload.
- Desktop 1366x768 and mobile 390x844 visual checks should be repeated after focused-room changes.
- Browser console showed a favicon 404 during desktop visual check; it does not affect gameplay, but can be cleaned up before publication.
- Favicon was added in a later commit (`public/favicon.png` + metadata in `index.html`); the 404 is resolved.

## Sandbox Verification Note

This project was developed in a sandbox that only exposes one external port (3000, used by a Next.js host). Running the Vite dev server on a different port for in-browser visual QA via `agent-browser` is not possible because background processes on non-3000 ports are killed by the sandbox. Visual verification therefore relies on:

- `npm test` — 78 tests across 18 files, including React component smoke tests via jsdom with a hardened canvas mock (roundRect, quadraticCurveTo, gradients) so PixiJS Graphics render paths work in the test environment.
- `npm run build` — Vite production build must succeed.
- `src/test/responsive.test.tsx` — verifies both desktop and mobile layouts mount, all four top-bar metrics render, all four mobile bottom tabs render, and the room selector appears on both layouts.
- `src/test/app-smoke.test.tsx` — end-to-end App render through the real `useGameState` hook.

Manual browser checks at 1366x768 and 390x844 remain a pre-publication requirement on a developer machine or CI with a headless browser.
