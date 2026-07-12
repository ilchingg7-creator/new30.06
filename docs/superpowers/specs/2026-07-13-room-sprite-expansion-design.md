# Room Sprite Expansion Design

## Goal

Replace the procedural room artwork with full-frame sprite progression that matches the existing `tenant_capsule` image. Prove the visual direction on `cosmo_kitchen` before producing art for the other rooms.

The approval sequence is deliberately gated:

1. Create one level-1 `cosmo_kitchen` draft.
2. Ask the user to approve or revise its visual style.
3. After style approval, create the ten cumulative `cosmo_kitchen` stages.
4. Ask the user to approve the complete kitchen sequence.
5. Only then propose and produce sequences for the other rooms.

Generated drafts are review material. No generated image enters the final build without explicit visual approval and consistency checks.

## Existing State

- The project contains 14 room modules.
- `tenant_capsule` is the only room with sprite assets.
- Its ten files are opaque `840x480` PNG images.
- The ten current capsule PNGs have identical SHA-256 hashes, so they do not yet show visual progression.
- The other 13 rooms fall back to procedural PixiJS graphics.
- The room renderer already selects one of ten detail levels derived from module level.

## Approved Art Direction

Match the first-room sprite closely instead of modernizing it.

The desired style is intentionally naive, amateur pixel art:

- large, clearly visible pixels;
- no antialiasing;
- uneven stair-stepped contours;
- inconsistent line thickness where it feels hand-drawn;
- simple, imperfect object silhouettes;
- slightly incorrect perspective;
- flat color fields with sparse, coarse shadows;
- warm, friendly colors derived from the existing room and station palette;
- a handmade, "drawn in a simple paint program" quality;
- readable room function at mobile size despite the rough execution.

Soviet domestic styling is mandatory for every room. Communicate it through ordinary household design rather than political imagery: worn painted enamel, Bakelite controls, checked oilcloth, faceted glassware, old analog appliances, simple communal furniture, repair patches, and small unreadable calendar-like paper props. Each room should use only the cues appropriate to its function and progression level.

Avoid:

- polished professional pixel art;
- smooth curves or clean vector geometry;
- gradients, soft rendering, realistic lighting, or detailed material rendering;
- precise isometric perspective;
- readable signs or generated text;
- watermarks and signatures.
- political symbols, flags, propaganda, or military imagery.

## Composition Rules

Every room sequence uses a fixed camera and fixed architectural shell. Upgrades accumulate: a later frame preserves all approved details from earlier frames and adds one visually obvious improvement.

All output frames must:

- be `840x480` opaque PNGs;
- fill the whole frame, as the capsule sprite does;
- use the existing scene framing without transparent margins;
- remain legible when the game scales the image down;
- keep important interactive overlay areas free when a room later receives DOM overlays;
- avoid long or readable text inside the image.

## Cosmo-Kitchen Pilot

The pilot uses a curved orbital communal kitchen with one porthole and a fixed counter. The level-1 draft establishes the room shell, palette, pixel scale, perspective, kettle design, and visual roughness.

After the level-1 style draft is approved, the sequence grows cumulatively:

| Detail level | Added visual element |
|---:|---|
| 1 | Bare curved kitchen, porthole, counter, primitive kettle. |
| 2 | Crooked warm ceiling lamp. |
| 3 | Simple soup pot and blocky steam marks. |
| 4 | Uneven wall shelf with mugs and jars. |
| 5 | Visible enamel repair patch and cloth detail. |
| 6 | Small old refrigerator/storage cabinet. |
| 7 | Small communal table with one mismatched stool. |
| 8 | Hanging utensils and analog kitchen controls. |
| 9 | Secondary warm light and denser, inhabited countertop details. |
| 10 | Fully equipped communal kitchen with celebratory warm accents, without cluttering the room. |

If image generation moves or removes an earlier object, that frame is rejected or revised. Progress must read as accumulation, not as ten unrelated kitchen illustrations.

## Production Approach

Use the existing capsule image as a style reference and the approved previous kitchen frame as a continuity reference.

For each stage:

1. Generate or edit one draft while preserving the fixed camera, shell, and earlier objects.
2. Inspect it at original size and at a small mobile preview size.
3. Check pixel roughness, palette, silhouette clarity, and absence of text/watermarks.
4. Present the draft for approval at the required gate.
5. Save approved project assets under `public/assets/rooms/<module_id>/` with stable names such as `cosmo_kitchen_01.png`.

Do not produce all remaining rooms in one ungated batch. The kitchen pilot defines the reusable art constraints first.

## Runtime Integration

After the kitchen art sequence is approved:

- extend the room sprite asset registry from its tenant-only record to module-keyed records;
- register and preload only the selected room/detail asset;
- preserve the existing procedural renderer as a fallback for rooms without approved sprite sets;
- keep `scaleMode: 'nearest'` and render every room sprite at `840x480`;
- retain the current `GameState -> descriptor -> detail level -> asset` data flow;
- do not let Pixi asset loading mutate game state.

An absent or failed sprite must leave the procedural room visible rather than produce a blank scene.

## Validation

Visual checks for every approved frame:

- exact `840x480` dimensions;
- opaque background and no unintended alpha holes;
- nearest-neighbor appearance with no antialiasing blur;
- room purpose readable at mobile scale;
- all prior-stage objects preserved;
- no generated text, signature, or watermark;
- close stylistic match to `tenant_capsule_01.png` in roughness and pixel scale.

Runtime tests after integration:

- `getRoomSpriteAsset('cosmo_kitchen', level)` resolves all ten approved paths;
- unapproved rooms still return the procedural fallback;
- asset loading does not blank the scene when loading fails;
- the room sprite is the first Pixi scene child when present;
- existing capsule sprite behavior remains unchanged;
- the full test suite and production build pass.

## Scope

This design authorizes only the kitchen pilot and its approval workflow. It does not automatically authorize generation of all 130 potential images for the remaining 13 rooms, replacement of the capsule art, new animations, or new room interactions. Those steps require later approval based on the kitchen result.
