# Station Incidents Design

## Goal

Replace the current resident story popups with a station incident journal. The
system should make the station feel alive without interrupting rapid incremental
upgrades.

The current `residentStories` model is too close to a disguised task list:
stories trigger from room level bands, ask for another room level, and reward
comfort. This clashes with bulk upgrades by 20-40 levels and makes narrative
content feel repetitive.

## Player Experience

Incidents appear as journal entries, not blocking modal popups. The main UI
shows a compact indicator when new incidents are available. The player opens the
journal when they want to resolve them.

An incident is a small cozy-comedy problem on the station:

- a resident caused or noticed something;
- a room entered an interesting state;
- two rooms created a strange combo;
- a renovation changed daily life;
- a scene micro-interaction triggered a small moment.

Each incident has a short title, one or two lines of flavor, and 2-3 choices
with clear consequences.

## Core Rules

- Room level is no longer the main trigger type.
- Incidents must not open themselves as modal dialogs.
- Bulk room upgrades must not be interrupted.
- A single state update may queue at most 1-2 new incidents.
- The journal may hold unresolved incidents.
- Completed incidents are persisted and do not repeat unless explicitly marked
  as repeatable.
- Rewards must vary: comfort-only incidents are allowed but should not dominate.
- Visual detail rewards are allowed, but each one must have a placeholder until
  final art exists.

## Data Model

`StationIncidentDefinition`:

- `id`
- `category`: `resident`, `room`, `combo`, `renovation`, `condition`, `cat`,
  `economy`
- `priority`
- `repeatable`
- `trigger`
- `choices`
- `visualPlaceholderId` optional

`StationIncidentChoice`:

- `id`
- `label`
- `description`
- `effects`

Effects may include:

- comfort delta;
- kopek cost;
- room condition repair or damage;
- temporary room income multiplier;
- temporary condition decay modifier;
- resident flag;
- goal progress flag;
- visual placeholder unlock;
- no economy effect, only journal memory.

## Trigger Types

- `roomOpened`: a module becomes owned.
- `residentUnlocked`: a resident appears for the first time.
- `renovationCompleted`: a new renovation cycle starts.
- `roomConditionBelow`: a room condition crosses a threshold.
- `roomComboAvailable`: two or more rooms are owned at required levels.
- `comfortIncomeMismatch`: high income with low comfort.
- `sceneInteraction`: cat or other room prop interaction.
- `cycleGoalCompleted`: a major cycle goal is completed.
- `idleReturn`: player returns after a meaningful offline period.

## Pacing

Incident generation should be conservative. The game can detect many eligible
incidents, but it should queue only a small number at once.

MVP pacing:

- maximum active unresolved incidents: 3;
- maximum newly queued incidents per state update: 1;
- after resolving an incident, the system may queue another eligible incident;
- priority order: renovation, resident unlock, room open, condition emergency,
  combo, economy mismatch, scene interaction;
- no auto-opened incident dialogs.

## Visual Placeholders

Visual rewards should not block implementation on final art. The first version
uses placeholder ids that can later map to sprites, room overlay props, or small
DOM/Pixi details.

Placeholder rules:

- every visual effect uses a stable id such as `kitchen_mist_patch_01`;
- if no art exists, render a simple local placeholder prop using existing room
  scene primitives or a small neutral badge in the journal;
- placeholder ids must be saved as unlocked visual flags;
- replacing placeholder art later must not require changing save data.

Initial placeholder categories:

- wall stickers and tiny posters;
- patched panels;
- lamps and warning bulbs;
- mugs, socks, plants, pots, labels;
- small animated overlay hooks, reserved for later GIF/sprite assets.

## Initial Event Catalog

The content pool should be much larger than the first implementation slice.
This prevents the system from feeling like six repeated resident requests.

### MVP Slice

1. `kitchen_borscht_fog`
   - Trigger: kitchen opened, mist cook unlocked.
   - Choices: vent the fog for condition repair; keep the aroma for comfort and
     small temporary kitchen income penalty.
   - Placeholder: `kitchen_mist_patch_01`.

2. `capsule_snore_echo`
   - Trigger: sleepy engineer unlocked and capsule condition below working.
   - Choices: install padding for kopeks and condition; declare quiet hours for
     comfort.
   - Placeholder: `capsule_padding_01`.

3. `laundry_sock_orbit`
   - Trigger: laundry opened.
   - Choices: catch socks for comfort; let sock master handle it for laundry
     income boost if resident exists.
   - Placeholder: `laundry_sock_cluster_01`.

4. `garden_first_sprout_vote`
   - Trigger: oxygen garden opened.
   - Choices: name the sprout for comfort; build a lamp for condition and
     visual detail.
   - Placeholder: `garden_sprout_label_01`.

5. `teleport_wrong_parcel`
   - Trigger: teleport entry opened.
   - Choices: return the parcel for reputation progress flag; open it for
     comfort and a tiny random kopek reward.
   - Placeholder: `teleport_parcel_01`.

6. `renovation_cold_floor`
   - Trigger: first renovation completed.
   - Choices: insulate capsule start for comfort; save materials for kopeks.
   - Placeholder: `capsule_rug_01`.

7. `condition_warning_light`
   - Trigger: any owned room condition below poor.
   - Choices: repair now for kopeks; postpone for small comfort loss prevention
     only if maintenance drones upgrade exists.
   - Placeholder: `warning_bulb_01`.

8. `cat_found_warm_pipe`
   - Trigger: strange cat clicked enough times or after capsule opened.
   - Choices: leave a saucer for comfort; mark the pipe for visual detail.
   - Placeholder: `cat_saucer_01`.

9. `kitchen_garden_soup`
   - Trigger: kitchen and garden owned.
   - Choices: communal soup for comfort; sell recipe for temporary income.
   - Placeholder: `kitchen_soup_pot_01`.

10. `high_income_low_comfort_meeting`
    - Trigger: income is strong for the cycle but comfort is low.
    - Choices: fund a tea break for comfort; ignore for no cost and journal
      memory.
    - Placeholder: none.

### Extended Pool

| Id | Trigger | Incident hook | Placeholder |
| --- | --- | --- | --- |
| `capsule_window_frost` | Capsule condition below working | Frost drawings appear on the porthole; resolve for comfort or insulation. | `capsule_frost_01` |
| `kitchen_spoon_union` | Kitchen level/condition combo | Spoons vote to stop floating; resolve through cook or kopeks. | `kitchen_spoon_bundle_01` |
| `garden_plant_listens_radio` | Garden opened and comfort 25+ | A plant grows toward old radio music; keep it cozy or tune it for income. | `garden_radio_plant_01` |
| `laundry_static_storm` | Laundry condition below working | Static turns socks into tiny satellites; ground the room or enjoy the show. | `laundry_static_socks_01` |
| `teleport_neighbor_duplicate` | Teleport opened | A delivery creates a harmless copy of a neighbor's mug; return or display it. | `teleport_duplicate_mug_01` |
| `panorama_star_argument` | Panorama opened | Residents argue which star is theirs; add labels or host a viewing night. | `panorama_star_labels_01` |
| `meteorite_pantry_label_mystery` | Pantry opened | Every jar says "probably edible"; relabel or sell mystery snacks. | `pantry_labels_01` |
| `maintenance_drones_form_committee` | Maintenance drones upgrade owned | Drones request a schedule board; approve order or let them improvise. | `drone_schedule_board_01` |
| `retired_cosmonaut_mug_missing` | Retired cosmonaut unlocked | The cosmonaut's enamel mug disappears; search rooms or print a new one. | `cosmonaut_mug_01` |
| `mist_cook_recipe_too_large` | Mist cook unlocked and kitchen owned | A recipe is longer than the corridor; archive it or cook a tiny version. | `kitchen_recipe_scroll_01` |
| `vacuum_gardener_seed_escape` | Vacuum gardener unlocked | Seeds drift through vents; catch them for garden condition or let one settle. | `garden_seed_trail_01` |
| `sock_master_invents_calendar` | Sock master unlocked | Laundry calendar uses sock phases; adopt it for comfort or simplify it. | `laundry_sock_calendar_01` |
| `courier_delivers_future_notice` | Courier unlocked | A parcel arrives from next renovation; open now or save as memory. | `teleport_future_notice_01` |
| `vip_resident_wants_red_carpet` | VIP bonus active | VIP asks for a ceremonial carpet; pay for comfort or improvise with towels. | `vip_towel_carpet_01` |
| `cat_sleeps_on_button` | Cat interaction | Strange cat sleeps on a harmless blinking button; move it or label button. | `cat_button_label_01` |
| `cat_brings_space_dust` | Cat interaction after garden opened | Cat brings shiny dust; sweep it into a jar or sprinkle garden soil. | `cat_dust_jar_01` |
| `post_renovation_old_wallpaper` | Renovation completed | Old wallpaper survives reset; preserve as memory or replace for comfort. | `old_wallpaper_patch_01` |
| `second_cycle_resident_reunion` | Second renovation cycle | Returning residents hold an awkward reunion; fund tea or let them organize. | `resident_reunion_table_01` |
| `offline_return_station_smells_like_soup` | Idle return | Station smells like soup after offline time; trace source or declare tradition. | `soup_smell_note_01` |
| `condition_pristine_housewarming` | Any room reaches pristine | Residents celebrate a freshly maintained room; add a lamp or take donations. | `housewarming_lamp_01` |
| `comfort_60_station_song` | Comfort reaches 60 | Someone writes a station song; hang lyrics or sell recordings. | `station_song_poster_01` |
| `teleport_garden_cross_pollination` | Teleport and garden owned | Teleport pollen appears in the garden; quarantine or cultivate it. | `teleport_pollen_pot_01` |
| `laundry_kitchen_steam_problem` | Laundry and kitchen owned | Steam makes towels smell like soup; reroute vents or market soup towels. | `steam_towel_hook_01` |
| `capsule_panorama_stargazing` | Capsule and panorama owned | Tenant wants a stargazing night; dim lights or charge for balcony seats. | `stargazing_blanket_01` |
| `economy_kopeks_under_sofa` | High earned credits | The station finds old kopeks under furniture; return to fund or hold lottery. | `kopeks_jar_01` |
| `renovation_upgrade_installation_day` | New renovation upgrade bought | Upgrade installation leaves labels everywhere; clean up or keep labels. | `upgrade_labels_01` |
| `five_residents_table_argument` | Five residents unlocked | Residents debate table ownership; assign schedule or buy a second table. | `table_schedule_01` |
| `first_reputation_review` | First reputation gained | A review board sends polite confusion; frame it or improve signage. | `reputation_review_frame_01` |
| `panorama_dome_first_date` | Panorama and comfort 40+ | Two residents reserve the dome; respect privacy or host public viewing. | `panorama_reserved_sign_01` |
| `garden_laundry_moss_socks` | Garden and laundry owned | Moss grows on lost socks; cultivate soft moss or clean it up. | `moss_sock_01` |

The extended pool should be implemented gradually. MVP only needs the first
8-10 incidents, but ids and copy should be authored with the larger catalog in
mind.

## UI

Desktop:

- journal button in the side panel or top utility area;
- small badge for new unresolved incidents;
- journal list with active incidents first and completed memories below.

Mobile:

- journal entry point belongs behind the compact settings/utility cluster or a
  small icon button near goals;
- no large persistent panel;
- incident choices must fit without pushing the room scene too low.

## Migration

Keep `completedStories` readable during migration. Existing completed story ids
can map to completed incident memories or simply remain ignored legacy data.

The old `ResidentStoryDialog` should be removed from the normal app flow once
the incident journal is active.

## Testing

Tests should cover:

- an eligible incident queues without opening a modal;
- bulk upgrades do not queue many incidents at once;
- unresolved incident cap is respected;
- resolving a choice applies the expected effect once;
- completed non-repeatable incidents do not return;
- visual placeholder ids persist;
- legacy `completedStories` saves still load.

## Open Implementation Order

1. Add incident types and content definitions.
2. Add pure trigger/queue/resolve helpers with tests.
3. Add save fields for active, completed and visual-placeholder incident ids.
4. Add journal UI for desktop and mobile.
5. Remove `activeStory` modal flow from `useGameState` and `App`.
6. Convert current resident story copy into the first incident set.
7. Add placeholder rendering hooks for visual rewards.
