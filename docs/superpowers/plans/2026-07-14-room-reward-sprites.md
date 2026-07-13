# Room Reward Sprites Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the generic incident markers with 21 permanent transparent pixel-art reward sprites that accumulate in their rooms and use manually controlled positions for detail levels 1 through 10.

**Architecture:** A dedicated `roomRewardSprites.ts` module owns reward asset metadata, room ownership, display size, and expanded ten-level placement records. `roomScenes.ts` lazily registers and loads only unlocked rewards for the selected room, then renders every successfully loaded reward above the full-room sprite. Art production remains review-gated: generated chroma-key drafts are inspected before accepted PNGs enter `public/assets/room-rewards/`.

**Tech Stack:** TypeScript 5.8, PixiJS 8.6, Vitest 3.2, Vite 7, built-in image generation, PNG with alpha, nearest-neighbor raster processing.

## Global Constraints

- Produce exactly the 20 active station-incident rewards plus `table_schedule_01`; disabled backlog rewards are excluded.
- Match the coarse 4x4 grid, naive hand-drawn contour, imperfect perspective, and Soviet domestic styling of the approved room scenes.
- Use transparent PNGs with dimensions divisible by four and rendered size between 32 and 180 scene pixels.
- Use no readable text except `СИРИУС / SIRIUS`, `ВЕГА / VEGA`, and `ПОЛЯРНАЯ / POLARIS` on `panorama_star_labels_01`.
- Keep every earned reward visible and manually separated; do not replace older rewards with newer ones.
- Store ten explicit placements per reward in the fixed 840x480 coordinate system.
- Load only rewards belonging to the selected room, do not mutate `GameState`, and skip an individual failed reward without blanking the room.
- Preserve nearest-neighbor scaling and the existing full-room procedural fallback.

---

### Task 1: Produce and approve the 21 reward sprites

**Files:**
- Create review drafts: `tmp/imagegen/review/reward-sprites/<placeholder-id>_source.png`
- Create review alpha PNGs: `tmp/imagegen/review/reward-sprites/<placeholder-id>_draft.png`
- Create review sheets: `tmp/imagegen/review/reward-sprites/<room-id>_contact_sheet.png`

**Interfaces:**
- Consumes: approved room PNGs in `public/assets/rooms/<room-id>/<room-id>_01.png`, `_05.png`, and `_10.png` as style and placement references.
- Produces: 21 visually approved transparent PNG drafts, one per placeholder ID.

- [ ] **Step 1: Generate one chroma-key source per reward with the built-in image-generation tool**

Use one call per asset. Include the room's level-10 PNG as the style reference and use this common prompt:

```text
Use case: stylized-concept
Asset type: small transparent game reward sprite for an 840x480 room scene
Primary request: Draw only the specified household object as deliberately crude amateur pixel art.
Style/medium: coarse 4x4 pixel grid, no antialiasing, uneven stair-stepped contour, inconsistent outline thickness, flat colors, sparse blocky shadow, slightly wrong perspective, simple-paint-program quality.
Scene/backdrop: perfectly flat solid #ff00ff chroma-key background for removal; no floor plane, no cast shadow, no lighting variation.
Color palette: sample the referenced room's warm Soviet domestic palette.
Constraints: one isolated object, generous padding, readable at mobile size, no signature, no watermark, no readable text unless the asset specification explicitly supplies exact text.
Avoid: polished professional pixel art, gradients, smooth curves, realistic material rendering, political symbols, military imagery, #ff00ff inside the object.
```

Append exactly one subject line from this table:

| Placeholder | Subject line |
|---|---|
| `capsule_padding_01` | `Subject: patched rectangular sound-damping pad made from mismatched faded fabric panels, 80x64 target.` |
| `capsule_rug_01` | `Subject: small worn red-and-beige striped communal rug, crooked fringe, 112x64 target.` |
| `warning_bulb_01` | `Subject: crooked amber warning bulb on a dark Bakelite wall fitting with a short wire, 48x72 target.` |
| `cat_saucer_01` | `Subject: chipped pale enamel cat saucer with a blue rim, 64x32 target.` |
| `capsule_frost_01` | `Subject: irregular crescent of coarse pale-blue frost crystals designed to sit along a porthole edge, 96x64 target.` |
| `drone_schedule_board_01` | `Subject: faded cream shift board in a bent metal frame with abstract unreadable block marks, 72x64 target.` |
| `cat_button_label_01` | `Subject: tiny crooked yellowed paper label with abstract unreadable marks and two pieces of tape, 48x32 target.` |
| `cosmonaut_mug_01` | `Subject: old faceted glass mug in a chipped metal holder, 40x48 target.` |
| `kitchen_mist_patch_01` | `Subject: blocky warm-white borscht steam cloud with a faint beet-red tint, 96x64 target.` |
| `kitchen_soup_pot_01` | `Subject: squat chipped cream enamel soup pot with red floral blotches and black handles, 64x56 target.` |
| `kitchen_spoon_bundle_01` | `Subject: uneven hanging bundle of three old aluminum spoons tied with string, 56x72 target.` |
| `kitchen_recipe_scroll_01` | `Subject: rolled stained recipe sheet tied with red thread and abstract unreadable marks, 56x80 target.` |
| `table_schedule_01` | `Subject: small folded communal schedule sheet with a red grid and abstract unreadable marks, 64x40 target.` |
| `garden_sprout_label_01` | `Subject: crooked wooden sprout marker with a yellowed label and abstract unreadable marks, 48x40 target.` |
| `garden_radio_plant_01` | `Subject: tiny potted plant leaning toward a squat old Bakelite radio, 72x64 target.` |
| `garden_seed_trail_01` | `Subject: short irregular trail of large brown and pale-yellow seeds, 96x32 target.` |
| `laundry_sock_cluster_01` | `Subject: cluster of three mismatched floating knitted socks, patched and crooked, 80x72 target.` |
| `laundry_static_socks_01` | `Subject: two mismatched floating socks with three blocky pale-blue static sparks, 88x80 target.` |
| `teleport_parcel_01` | `Subject: battered brown-paper communal parcel tied badly with red string and a blank label, 72x64 target.` |
| `teleport_duplicate_mug_01` | `Subject: two nearly identical chipped cream enamel mugs, one slightly miscopied, 72x48 target.` |
| `panorama_star_labels_01` | `Subject: three blank crooked yellowed paper star tags with coarse leader lines; leave clear blank text areas, 180x104 target.` |

- [ ] **Step 2: Remove the chroma key and normalize every draft**

For each source, run the installed helper, using `--edge-contract 1` only if inspection shows a magenta fringe:

```powershell
python "$env:USERPROFILE\.codex\skills\.system\imagegen\scripts\remove_chroma_key.py" `
  --input "tmp\imagegen\review\reward-sprites\<placeholder-id>_source.png" `
  --out "tmp\imagegen\review\reward-sprites\<placeholder-id>_draft.png" `
  --auto-key border --soft-matte --transparent-threshold 12 --opaque-threshold 220 --despill
```

Resize with nearest-neighbor sampling to the target dimensions in the subject table. Round both dimensions to a multiple of four; do not resample after adding exact star-label text.

- [ ] **Step 3: Add exact bilingual text to the panorama labels**

Rasterize the exact pairs with single-bit rendering, Russian above English, then composite them into the three blank tags:

```text
СИРИУС
SIRIUS

ВЕГА
VEGA

ПОЛЯРНАЯ
POLARIS
```

Use a 5x7-style bitmap treatment, 4x nearest-neighbor enlargement, dark brown ink, no antialiasing. The text must be read back visually at original size and programmatically compared against the source strings used by the rasterizer.

- [ ] **Step 4: Validate the 21 alpha drafts**

Run a raster audit that asserts: 21 files, PNG format, alpha channel present, all four corners transparent, non-empty subject coverage, dimensions divisible by four, and no border pixel within RGB distance 24 of `#ff00ff`.

Expected: `21 reward sprites audited; 0 issues`.

- [ ] **Step 5: Build six room contact sheets and pause for visual approval**

For each affected room, composite all of its earned reward drafts over room frames 01, 05, and 10 using the placement table from Task 2. Produce one contact sheet per room plus a capsule frame with all eight rewards and the tenant-cat exclusion rectangle outlined.

Review criteria: correct crude pixel style, believable support surface, mobile readability, no strong occlusion, no accidental readable text, and exact bilingual star labels. Do not copy drafts to `public/assets` until the user approves these sheets.

---

### Task 2: Add a typed reward registry with ten-level placements

**Files:**
- Create: `src/station/roomRewardSprites.ts`
- Create: `src/test/room-reward-sprites.test.ts`

**Interfaces:**
- Consumes: `ModuleId`, `RoomDetailLevel`, and `VisualPlaceholderId` from `src/game/types.ts`.
- Produces: `ROOM_REWARD_SPRITES`, `ROOM_REWARD_SPRITE_IDS`, `getRoomRewardSpriteDefinition(id)`, and `getRoomRewardSpritesForRoom(unlockedIds, roomId, detailLevel)`.

- [ ] **Step 1: Write the failing registry coverage and filtering tests**

```ts
import { describe, expect, it } from 'vitest';
import {
  getRoomRewardSpriteDefinition,
  getRoomRewardSpritesForRoom,
  ROOM_REWARD_SPRITE_IDS
} from '../station/roomRewardSprites';

describe('room reward sprite registry', () => {
  it('defines exactly the 21 approved rewards with ten placements', () => {
    expect(ROOM_REWARD_SPRITE_IDS).toHaveLength(21);
    expect(new Set(ROOM_REWARD_SPRITE_IDS).size).toBe(21);

    ROOM_REWARD_SPRITE_IDS.forEach((id) => {
      const definition = getRoomRewardSpriteDefinition(id);
      expect(definition).not.toBeNull();
      expect(definition?.src).toBe(`/assets/room-rewards/${id}.png`);
      expect(Object.keys(definition?.placements ?? {})).toHaveLength(10);
    });
  });

  it('returns unique unlocked rewards for only the selected room', () => {
    const rewards = getRoomRewardSpritesForRoom(
      ['kitchen_soup_pot_01', 'capsule_rug_01', 'kitchen_soup_pot_01'],
      'cosmo_kitchen',
      10
    );

    expect(rewards.map((reward) => reward.id)).toEqual(['kitchen_soup_pot_01']);
    expect(rewards[0].placement).toEqual({ x: 371, y: 260, width: 64, height: 56, zIndex: 20 });
  });

  it('moves milestone-anchored rewards when their support furniture appears', () => {
    expect(getRoomRewardSpritesForRoom(['table_schedule_01'], 'cosmo_kitchen', 5)[0].placement).toMatchObject({ x: 98, y: 222 });
    expect(getRoomRewardSpritesForRoom(['table_schedule_01'], 'cosmo_kitchen', 10)[0].placement).toMatchObject({ x: 606, y: 350 });
  });
});
```

- [ ] **Step 2: Run the registry test and verify RED**

Run: `npm test -- src/test/room-reward-sprites.test.ts`

Expected: FAIL because `../station/roomRewardSprites` does not exist.

- [ ] **Step 3: Implement the typed registry and placement expansion**

Use these exact public types and helper signatures:

```ts
export type UnlockedRoomDetailLevel = Exclude<RoomDetailLevel, 0>;

export interface RoomRewardPlacement {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

export interface RoomRewardSpriteDefinition {
  id: VisualPlaceholderId;
  roomId: ModuleId;
  alias: string;
  src: string;
  placements: Record<UnlockedRoomDetailLevel, RoomRewardPlacement>;
}

export interface ResolvedRoomRewardSprite extends RoomRewardSpriteDefinition {
  placement: RoomRewardPlacement;
}

function placementStops(
  width: number,
  height: number,
  zIndex: number,
  stops: Array<{ from: UnlockedRoomDetailLevel; x: number; y: number }>
): Record<UnlockedRoomDetailLevel, RoomRewardPlacement>;

export function getRoomRewardSpriteDefinition(id: VisualPlaceholderId): RoomRewardSpriteDefinition | null;

export function getRoomRewardSpritesForRoom(
  unlockedIds: readonly VisualPlaceholderId[],
  roomId: ModuleId,
  detailLevel: RoomDetailLevel
): ResolvedRoomRewardSprite[];
```

`placementStops` expands milestone stops into all ten keys. Use these exact registry rows; `x` and `y` are top-left scene coordinates:

```ts
const rows = [
  ['capsule_padding_01', 'tenant_capsule', 80, 64, 10, [[1, 288, 160]]],
  ['capsule_rug_01', 'tenant_capsule', 112, 64, 10, [[1, 171, 386]]],
  ['warning_bulb_01', 'tenant_capsule', 48, 72, 30, [[1, 690, 65]]],
  ['cat_saucer_01', 'tenant_capsule', 64, 32, 20, [[1, 657, 411]]],
  ['capsule_frost_01', 'tenant_capsule', 96, 64, 15, [[1, 448, 136]]],
  ['drone_schedule_board_01', 'tenant_capsule', 72, 64, 10, [[1, 174, 155]]],
  ['cat_button_label_01', 'tenant_capsule', 48, 32, 20, [[1, 43, 224]]],
  ['cosmonaut_mug_01', 'tenant_capsule', 40, 48, 20, [[1, 300, 315], [7, 434, 346]]],
  ['kitchen_mist_patch_01', 'cosmo_kitchen', 96, 64, 15, [[1, 389, 184]]],
  ['kitchen_soup_pot_01', 'cosmo_kitchen', 64, 56, 20, [[1, 371, 260]]],
  ['kitchen_spoon_bundle_01', 'cosmo_kitchen', 56, 72, 20, [[1, 232, 199]]],
  ['kitchen_recipe_scroll_01', 'cosmo_kitchen', 56, 80, 20, [[1, 98, 162]]],
  ['table_schedule_01', 'cosmo_kitchen', 64, 40, 20, [[1, 98, 222], [7, 606, 350]]],
  ['garden_sprout_label_01', 'oxygen_garden', 48, 40, 20, [[1, 270, 249]]],
  ['garden_radio_plant_01', 'oxygen_garden', 72, 64, 20, [[1, 600, 320], [5, 292, 107]]],
  ['garden_seed_trail_01', 'oxygen_garden', 96, 32, 20, [[1, 607, 406]]],
  ['laundry_sock_cluster_01', 'zero_g_laundry', 80, 72, 20, [[1, 195, 228]]],
  ['laundry_static_socks_01', 'zero_g_laundry', 88, 80, 30, [[1, 502, 128]]],
  ['teleport_parcel_01', 'teleport_entry', 72, 64, 20, [[1, 310, 350], [6, 325, 165]]],
  ['teleport_duplicate_mug_01', 'teleport_entry', 72, 48, 20, [[1, 600, 330], [7, 443, 341]]],
  ['panorama_star_labels_01', 'panorama_dome', 180, 104, 25, [[1, 355, 116]]]
] as const;
```

Convert each row to a definition with alias `room-reward-${id}` and source `/assets/room-rewards/${id}.png`. Keep declaration order as render order, deduplicate unlocked IDs with a `Set`, return an empty array for detail level 0, and sort resolved rewards by `zIndex` while preserving declaration order for ties.

- [ ] **Step 4: Run the registry tests and verify GREEN**

Run: `npm test -- src/test/room-reward-sprites.test.ts`

Expected: PASS, 3 tests.

- [ ] **Step 5: Commit the pure registry**

```powershell
git add -- src/station/roomRewardSprites.ts src/test/room-reward-sprites.test.ts
git commit -m "feat: define room reward sprite registry"
```

---

### Task 3: Install approved assets and enforce raster integrity

**Files:**
- Create: `public/assets/room-rewards/*.png` (21 files)
- Create: `src/test/room-reward-assets.test.ts`

**Interfaces:**
- Consumes: user-approved alpha drafts from Task 1 and `ROOM_REWARD_SPRITE_IDS` from Task 2.
- Produces: stable public PNGs consumed by the runtime registry.

- [ ] **Step 1: Write the failing asset-presence test**

```ts
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ROOM_REWARD_SPRITE_IDS } from '../station/roomRewardSprites';

describe('room reward sprite assets', () => {
  it('contains one public PNG for every approved reward', () => {
    ROOM_REWARD_SPRITE_IDS.forEach((id) => {
      expect(existsSync(resolve('public', 'assets', 'room-rewards', `${id}.png`)), id).toBe(true);
    });
  });
});
```

- [ ] **Step 2: Run the asset test and verify RED**

Run: `npm test -- src/test/room-reward-assets.test.ts`

Expected: FAIL on `capsule_padding_01` because the public reward directory is not installed yet.

- [ ] **Step 3: Copy only approved drafts to stable paths**

Create `public/assets/room-rewards/` and copy each `<placeholder-id>_draft.png` to `<placeholder-id>.png`. Do not copy sources, contact sheets, prompts, or rejected variants.

- [ ] **Step 4: Run the asset test and raster audit**

Run: `npm test -- src/test/room-reward-assets.test.ts`

Expected: PASS.

Run the Task 1 raster audit against `public/assets/room-rewards/`.

Expected: `21 reward sprites audited; 0 issues`.

- [ ] **Step 5: Commit production reward assets**

```powershell
git add -- public/assets/room-rewards src/test/room-reward-assets.test.ts
git commit -m "assets: add room reward sprites"
```

---

### Task 4: Lazily load and render accumulated rewards

**Files:**
- Modify: `src/station/roomScenes.ts`
- Modify: `src/test/room-scenes.test.ts`

**Interfaces:**
- Consumes: `getRoomRewardSpritesForRoom(...)` and `ResolvedRoomRewardSprite` from Task 2.
- Produces: reward registration/loading inside `loadRoomSpriteAssetForState(...)` and labeled Pixi children `room-reward-<placeholder-id>` inside `buildRoomContainer(...)`.

- [ ] **Step 1: Write failing render, accumulation, movement, and failure-isolation tests**

Add these tests to `src/test/room-scenes.test.ts`:

```ts
import type { VisualPlaceholderId } from '../game/types';

it('renders every unlocked reward belonging to the selected room once', () => {
  const state = {
    ...createInitialState(1_000),
    moduleLevels: { ...createInitialState(1_000).moduleLevels, cosmo_kitchen: 100 },
    unlockedIncidentVisuals: [
      'kitchen_soup_pot_01',
      'capsule_rug_01',
      'kitchen_recipe_scroll_01',
      'kitchen_soup_pot_01'
    ] as VisualPlaceholderId[]
  };

  const container = buildRoomContainer(state, 'cosmo_kitchen');
  const labels = container.children.map((child) => (child as { label?: string }).label);

  expect(labels.filter((label) => label === 'room-reward-kitchen_soup_pot_01')).toHaveLength(1);
  expect(labels).toContain('room-reward-kitchen_recipe_scroll_01');
  expect(labels).not.toContain('room-reward-capsule_rug_01');
  expect(labels.some((label) => label?.startsWith('incident-placeholder-'))).toBe(false);
});

it('uses the selected detail-level placement for a reward', () => {
  const base = createInitialState(1_000);
  const state = {
    ...base,
    moduleLevels: { ...base.moduleLevels, cosmo_kitchen: 50 },
    unlockedIncidentVisuals: ['table_schedule_01'] as VisualPlaceholderId[]
  };

  const reward = buildRoomContainer(state, 'cosmo_kitchen').children.find(
    (child) => (child as { label?: string }).label === 'room-reward-table_schedule_01'
  );

  expect(reward?.position.x).toBe(98);
  expect(reward?.position.y).toBe(222);
});

it('skips only a reward whose asset load fails', async () => {
  const base = createInitialState(1_000);
  const state = {
    ...base,
    moduleLevels: { ...base.moduleLevels, cosmo_kitchen: 100 },
    unlockedIncidentVisuals: ['kitchen_soup_pot_01', 'kitchen_recipe_scroll_01'] as VisualPlaceholderId[]
  };
  const loadSpy = vi.spyOn(Assets, 'load').mockImplementation(async (alias) => {
    if (alias === 'room-reward-kitchen_soup_pot_01') throw new Error('missing reward');
    return Texture.EMPTY;
  });

  await expect(loadRoomSpriteAssetForState(state, 'cosmo_kitchen')).resolves.toBeUndefined();
  const labels = buildRoomContainer(state, 'cosmo_kitchen').children.map(
    (child) => (child as { label?: string }).label
  );

  expect(labels).not.toContain('room-reward-kitchen_soup_pot_01');
  expect(labels).toContain('room-reward-kitchen_recipe_scroll_01');
  expect(labels).toContain('room-sprite');
  loadSpy.mockRestore();
});
```

- [ ] **Step 2: Run the focused scene tests and verify RED**

Run: `npm test -- src/test/room-scenes.test.ts`

Expected: FAIL because the container still adds generic `incident-placeholder-*` graphics and does not create `room-reward-*` sprites.

- [ ] **Step 3: Implement lazy reward registration and isolated failure tracking**

In `roomScenes.ts`, import the registry resolver. Add separate sets so a failed reward does not mark the full-room asset unavailable:

```ts
const registeredRoomRewardAliases = new Set<string>();
const unavailableRoomRewardAliases = new Set<string>();

function registerRoomRewardAsset(reward: ResolvedRoomRewardSprite): void {
  if (registeredRoomRewardAliases.has(reward.alias)) return;
  Assets.add({ alias: reward.alias, src: reward.src, data: { scaleMode: 'nearest' } });
  registeredRoomRewardAliases.add(reward.alias);
}

async function loadRoomRewardAssets(
  gameState: GameState,
  roomId: ModuleId,
  detailLevel: RoomDetailLevel
): Promise<void> {
  const rewards = getRoomRewardSpritesForRoom(gameState.unlockedIncidentVisuals ?? [], roomId, detailLevel);

  await Promise.all(rewards.map(async (reward) => {
    if (Cache.has(reward.alias)) {
      unavailableRoomRewardAliases.delete(reward.alias);
      return;
    }

    registerRoomRewardAsset(reward);
    unavailableRoomRewardAliases.delete(reward.alias);
    try {
      await Assets.load(reward.alias);
    } catch {
      unavailableRoomRewardAliases.add(reward.alias);
    }
  }));
}
```

Extend `loadRoomSpriteAssetForState(...)` so it resolves the descriptor once, attempts the full-room load, and then always calls `loadRoomRewardAssets(...)`; a base-room failure must not prevent reward attempts.

- [ ] **Step 4: Replace generic markers with Pixi reward sprites**

Remove `addIncidentVisualPlaceholders(...)` and add:

```ts
function createRoomRewardSprite(reward: ResolvedRoomRewardSprite): Sprite {
  const texture = Cache.has(reward.alias) ? Cache.get<Texture>(reward.alias) : Texture.EMPTY;
  const sprite = new Sprite(texture);

  sprite.position.set(reward.placement.x, reward.placement.y);
  sprite.width = reward.placement.width;
  sprite.height = reward.placement.height;
  sprite.zIndex = reward.placement.zIndex;
  sprite.roundPixels = true;
  sprite.texture.source.scaleMode = 'nearest';
  sprite.label = `room-reward-${reward.id}`;
  return sprite;
}

function addRoomRewardSprites(
  container: Container,
  gameState: GameState,
  roomId: ModuleId,
  detailLevel: RoomDetailLevel
): void {
  const rewards = getRoomRewardSpritesForRoom(gameState.unlockedIncidentVisuals ?? [], roomId, detailLevel);
  rewards.forEach((reward) => {
    if (!unavailableRoomRewardAliases.has(reward.alias)) {
      container.addChild(createRoomRewardSprite(reward));
    }
  });
}
```

Call `addRoomRewardSprites(...)` after either the full-room sprite or procedural fallback is built. Preserve the background as the first child. Do not enable global container sorting; registry order already provides stable z-order.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run: `npm test -- src/test/room-scenes.test.ts src/test/room-reward-sprites.test.ts src/test/room-reward-assets.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit runtime integration**

```powershell
git add -- src/station/roomScenes.ts src/test/room-scenes.test.ts
git commit -m "feat: render earned room reward sprites"
```

---

### Task 5: Visual QA and full verification

**Files:**
- Create review output: `tmp/imagegen/review/reward-sprites/runtime-contact-sheet.png`
- Verify all modified source, tests, and assets.

**Interfaces:**
- Consumes: complete production runtime from Tasks 2 through 4.
- Produces: visual evidence for all affected rooms and final automated verification.

- [ ] **Step 1: Create deterministic all-rewards preview states**

Use local preview-only state injection or a dedicated non-production harness to show detail levels 1, 5, and 10 for the six affected rooms with every reward for that room unlocked. Do not change save schema or production game state.

- [ ] **Step 2: Capture and inspect the runtime contact sheet**

Capture 18 frames: six rooms times levels 1, 5, and 10. Add one extra capsule frame with all eight rewards and the tenant cat visible.

Check each frame for: visible reward silhouette, believable surface placement, no major overlap, no cat interaction obstruction, nearest-neighbor edges, exact bilingual star labels, and no generic amber rectangles.

If a collision is found, change only the affected reward's placement stop in `roomRewardSprites.ts`, add or update the matching placement assertion, and rerun the focused tests before recapturing.

- [ ] **Step 3: Commit verified placement refinements if visual QA changed production files**

```powershell
git add -- src/station/roomRewardSprites.ts src/test/room-reward-sprites.test.ts
git diff --cached --quiet; if ($LASTEXITCODE -ne 0) { git commit -m "fix: refine room reward placement" }
```

- [ ] **Step 4: Run the full automated suite**

Run: `npm test`

Expected: 0 failed test files and 0 failed tests.

- [ ] **Step 5: Run the production build**

Run: `npm run build`

Expected: TypeScript succeeds and Vite exits 0. The existing Pixi chunk-size warning is acceptable; new errors are not.

- [ ] **Step 6: Run final repository checks**

Run: `git diff --check`

Expected: no whitespace errors.

Run: `git status --short`

Expected: only review-only `.superpowers/` and `tmp/` material may remain untracked; all production files are committed.
