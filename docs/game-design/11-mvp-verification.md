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

## Current MVP Notes

- PixiJS remains in the MVP stack by product decision.
- Current build includes Pixi renderer chunks; this is accepted for MVP but should be watched before upload.
- Desktop 1366x768 and mobile 390x844 visual checks were performed through local Chrome during Task 11.
- Browser console showed a favicon 404 during desktop visual check; it does not affect gameplay, but can be cleaned up before publication.
