# All Room Sprite Runtime Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install the approved 10-frame sprite progression for all 14 rooms and display the frame matching the room detail level.

**Architecture:** `roomScenes.ts` derives a stable asset alias and public URL from `ModuleId` plus `RoomDetailLevel`. The current room frame is registered and loaded lazily; a failed load is remembered so `buildRoomContainer` uses the existing procedural renderer instead of an empty sprite. Approved review PNGs are copied into module-specific public asset folders.

**Tech Stack:** TypeScript, PixiJS 8, Vitest, Vite, opaque 840x480 PNG assets.

## Global Constraints

- Keep the existing level-to-detail mapping: 1-10 maps to frame 01, 11-20 to frame 02, through 91-100 to frame 10.
- Keep nearest-neighbor texture scaling and the fixed 840x480 scene size.
- Load only the selected room/detail asset.
- Preserve procedural rendering as the failure fallback.
- Do not modify game state during asset loading.

---

### Task 1: Define and verify the complete sprite registry

**Files:**
- Modify: `src/test/room-scenes.test.ts`
- Modify: `src/station/roomScenes.ts`

- [x] Add a failing test that iterates all module IDs and detail levels 1-10 and expects `/assets/rooms/<module>/<module>_<NN>.png`.
- [x] Run `npm test -- src/test/room-scenes.test.ts` and confirm the test fails for a non-capsule room.
- [x] Replace the tenant-only record with a module/detail asset-definition helper.
- [x] Run the focused test and confirm it passes.

### Task 2: Preserve the procedural fallback on load failure

**Files:**
- Modify: `src/test/room-scenes.test.ts`
- Modify: `src/station/roomScenes.ts`

- [x] Add a failing test proving a failed sprite load does not produce a `room-sprite` child.
- [x] Run the focused test and confirm the expected failure.
- [x] Catch asset load failures, track unavailable aliases, and have `buildRoomContainer` use procedural drawing for those aliases.
- [x] Run the focused test and confirm it passes.

### Task 3: Install the approved PNGs

**Files:**
- Create: `public/assets/rooms/<module>/<module>_01.png` through `<module>_10.png` for all 14 modules.

- [x] Copy the 140 approved draft PNGs from `tmp/imagegen/review` into their stable public paths.
- [x] Audit that all 140 expected files exist, are 840x480, opaque, and unique within each room.

### Task 4: Full verification

**Files:**
- Verify all modified source, tests, and assets.

- [x] Run `npm test`.
- [x] Run `npm run build`.
- [x] Run `git diff --check` and inspect `git status --short`.
