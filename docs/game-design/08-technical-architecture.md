# Technical Architecture

## Decision

MVP uses **React + PixiJS + TypeScript**.

React owns application UI: panels, tabs, buttons, dialogs, saves, Yandex SDK integration and responsive desktop/mobile layout. PixiJS owns only the living station scene: space background, modules, windows, lights, small ambient animation and visual growth.

This keeps the idle-tycoon UI easy to build and test while giving the station enough visual life to justify the Retro Soviet Space Cozy style.

## Why Not CSS/SVG Only

CSS/SVG is faster for a static MVP, but it limits the station to simple shapes and lightweight transitions. The chosen setting depends on visible growth and atmosphere: warm windows, blinking indicators, module assembly, floating details and responsive scene framing. PixiJS is a better fit for that part.

## Boundary

PixiJS must not render normal UI.

PixiJS renders:

- star background and subtle parallax;
- station modules and hardpoints;
- window lights and ambient motion;
- module purchase pulse;
- decorative resident hints when they are readable;
- future cosmetic station skins.

React renders:

- top bar;
- module cards;
- goals;
- bonuses;
- prestige;
- dialogs;
- bottom mobile tabs;
- Yandex loading and reward states.

## Data Flow

```text
GameState + selectedRoomId -> React layouts -> PixiStationScene props -> roomScenes renderer
```

The Pixi scene receives plain data and never mutates game economy. It may emit UI-level interaction events later, such as `onModuleSelect(moduleId)`, but purchase logic remains in React/domain code.

## Testing Strategy

- Domain economy is tested without browser or Pixi.
- Pixi scene mapping is tested as pure data: module id, level, position, color role and active/locked state.
- React smoke tests verify that the canvas container mounts.
- Visual verification checks that the canvas is nonblank on mobile and desktop.

## Implementation Guardrails

- Keep Pixi scene lifecycle isolated in `PixiStationScene`.
- Keep scene construction helpers in `src/station`.
- Do not put buttons, readable UI labels or long text into Pixi.
- Do not make Pixi a dependency of economy or save code.
- If the scene requires new colors, module silhouettes or motion rules, update `07-visual-style.md` first.
- If Pixi causes build size or mobile performance issues, fall back to a simpler renderer before changing the economy or UI architecture.

## Focused Room Scene Architecture

The Pixi station surface should render one selected room scene at a time instead of a full exterior station map.

Data flow:

```text
GameState + selectedRoomId -> PixiStationScene -> focused room container
```

Responsibilities:

- React owns `selectedRoomId` because room selection is UI state.
- A successful room upgrade should set `selectedRoomId` to the upgraded module id.
- Pixi receives `gameState` and `selectedRoomId`, then renders the matching room at the correct detail tier.
- Pure station helpers should expose room descriptors for tests before constructing Pixi graphics.
- Economy and goal completion logic must stay in `src/game`.

Recommended file split:

- `src/station/roomScenes.ts`: room descriptors, detail tier mapping and Pixi room construction helpers;
- `src/ui/components/RoomSelector.tsx`: React room selector for desktop and mobile;
- `src/game/goals.ts`: pure goal eligibility, completion and visible-goal helpers.

The existing `PixiStationScene` lifecycle can remain, but its scene-building input changes from global station overview to focused room descriptor.

## Scene DOM Overlay

Small readable or browser-native animated room details may be rendered above the Pixi canvas as React DOM overlays. This is allowed only for decorative/interactable scene details that benefit from DOM behavior, such as animated GIFs.

Rules:

- overlay coordinates are expressed in the fixed room scene space (`840x480`) and converted through the same scene-fit math used by Pixi;
- overlay clicks must not accidentally trigger the generic room click handler;
- overlay interactions must stay lightweight and avoid economy side effects unless explicitly designed;
- normal UI controls and readable labels still belong to React layout panels, not inside Pixi.

## Station Incidents

`src/game/stationIncidents.ts` owns pure incident queueing and resolving.
`src/game/content/stationIncidents.ts` owns definitions. React only renders
the journal and dispatches choices; it does not decide incident eligibility.
