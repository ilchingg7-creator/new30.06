# Room Reward Sprites Design

## Goal

Replace the generic amber incident markers with small, individually drawn pixel-art reward sprites that remain visible as permanent additions to their rooms. Each reward uses a transparent PNG and manually selected placement for every room detail level from 1 through 10.

This design covers the 20 active station-incident visual rewards plus the one active goal visual reward. Disabled backlog rewards remain out of scope.

## Approved Visual Direction

Reward sprites must match the approved room artwork:

- coarse 4x4 pixel grid;
- intentionally naive, hand-drawn contours;
- no antialiasing, gradients, soft shadows, or clean vector geometry;
- simple silhouettes and slightly incorrect perspective;
- room-specific lighting and palette so the object feels placed in the scene rather than pasted above it;
- Soviet domestic cues through enamel, Bakelite, faded paper, simple glass, repair materials, and communal household objects;
- transparent background;
- approximate rendered sizes between 32 and 112 scene pixels, selected per object for mobile readability.

Text is forbidden on reward sprites except for the panorama star-label reward. That reward contains three exact bilingual label pairs, with Russian above English on crooked paper tags:

- `СИРИУС / SIRIUS`
- `ВЕГА / VEGA`
- `ПОЛЯРНАЯ / POLARIS`

## Reward Scope

### Tenant capsule

| Placeholder | Visual |
|---|---|
| `capsule_padding_01` | Patched sound-damping wall pad |
| `capsule_rug_01` | Small worn striped rug |
| `warning_bulb_01` | Crooked warning bulb with Bakelite fitting |
| `cat_saucer_01` | Chipped enamel cat saucer |
| `capsule_frost_01` | Coarse frost marks for the porthole edge |
| `drone_schedule_board_01` | Faded drone-shift board with unreadable marks |
| `cat_button_label_01` | Tiny crooked label beside the wall button, without readable text |
| `cosmonaut_mug_01` | Old faceted cosmonaut mug |

### Cosmo kitchen

| Placeholder | Visual |
|---|---|
| `kitchen_mist_patch_01` | Blocky borscht steam or mist patch |
| `kitchen_soup_pot_01` | Chipped enamel soup pot |
| `kitchen_spoon_bundle_01` | Uneven hanging bundle of spoons |
| `kitchen_recipe_scroll_01` | Rolled and stained recipe sheet with unreadable marks |
| `table_schedule_01` | Small communal schedule sheet with unreadable marks |

### Oxygen garden

| Placeholder | Visual |
|---|---|
| `garden_sprout_label_01` | Crooked sprout label with unreadable marks |
| `garden_radio_plant_01` | Small plant leaning toward an old radio |
| `garden_seed_trail_01` | Short irregular seed trail |

### Zero-G laundry

| Placeholder | Visual |
|---|---|
| `laundry_sock_cluster_01` | Cluster of mismatched floating socks |
| `laundry_static_socks_01` | Two statically charged socks with blocky sparks |

### Teleport entry

| Placeholder | Visual |
|---|---|
| `teleport_parcel_01` | Roughly tied communal parcel |
| `teleport_duplicate_mug_01` | Two nearly identical chipped mugs |

### Panorama dome

| Placeholder | Visual |
|---|---|
| `panorama_star_labels_01` | Three bilingual paper star labels and coarse leader lines |

## Placement Model

Every earned reward remains visible. Multiple rewards in one room accumulate and are manually separated rather than collapsed into a latest-only list.

Each reward definition stores:

- owning `ModuleId`;
- stable PNG URL;
- intended scene width and height;
- ten placement records keyed by `RoomDetailLevel` 1 through 10;
- `x` and `y` coordinates in the fixed 840x480 scene coordinate system;
- optional reward-to-reward z-order.

Positions may repeat across adjacent detail levels. A reward moves only when new furniture, a lamp, the tenant cat overlay, an interaction area, or another accumulated reward would substantially cover it. The level-10 frame is the densest reference and therefore the primary safety check.

All reward sprites render above the flattened room background. Placement must therefore use believable open surfaces such as walls, tables, shelves, window edges, counters, and floor patches; the design does not pretend to place a reward behind furniture embedded in the room PNG.

The tenant cat and its love-effect overlay remain above the room canvas. The saucer may sit near the cat but must retain a visible silhouette and must not block the cat interaction target.

## Runtime Architecture

Create a focused reward-sprite registry separate from the full-room sprite registry. The registry owns asset metadata and placement data, while `roomScenes.ts` consumes resolved definitions when building the selected room.

Runtime flow:

1. Read `GameState.unlockedIncidentVisuals`.
2. Filter rewards to the selected room.
3. Resolve the selected room's detail level.
4. Register and lazily load only those reward assets.
5. Build the full-room background sprite.
6. Add every successfully loaded reward sprite at its level-specific position and configured size.
7. Preserve stable reward ordering and prevent duplicates.

Loading a reward asset must never mutate `GameState`.

## Failure Handling

- A missing registry entry is ignored without blanking or delaying the room.
- A missing or failed reward PNG skips only that reward.
- Failure of one reward does not prevent other rewards in the same room from rendering.
- The existing full-room procedural fallback remains unchanged.
- The generic amber placeholder rectangles are removed only after the real reward-sprite path is verified.

## Asset Layout

Final assets use stable paths:

`public/assets/room-rewards/<placeholder-id>.png`

Each file is a transparent PNG with dimensions aligned to the 4x4 pixel grid. Generation drafts and chroma-key sources remain review-only and do not enter `public/assets`.

## Validation

Automated checks must cover:

- all 21 in-scope placeholder IDs have one registry definition and one PNG;
- every definition points to the correct room;
- every definition contains placements for detail levels 1 through 10;
- earned rewards accumulate without duplicates;
- only rewards belonging to the selected room are loaded and rendered;
- position changes follow detail-level changes;
- failed reward loading skips the failed sprite and keeps the room plus other rewards visible;
- nearest-neighbor texture scaling is retained.

Asset checks must confirm:

- transparent PNG output;
- dimensions divisible by four;
- transparent corners and no chroma-key fringe;
- no generated text except the exact bilingual star labels;
- legibility at the game's mobile scene size.

Visual review uses levels 1, 5, and 10 for every affected room and an all-rewards state for each room. The capsule receives an additional all-eight-rewards check with the tenant cat visible.

## Out of Scope

- Disabled incident-backlog rewards;
- animated reward sprites;
- new quests or reward logic;
- changes to full-room progression artwork;
- automatic collision detection or runtime anchor selection;
- baking reward combinations into full-room PNGs.
