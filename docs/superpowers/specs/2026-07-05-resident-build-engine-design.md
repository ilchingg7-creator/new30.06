# Resident Build Engine Design

## Goal

Turn residents from mostly passive collection entries into the main build
engine of the station. The player should upgrade rooms partly to unlock
specific residents, combine their roles, and make duties and incidents resolve
differently based on who lives on the station.

The first implementation slice focuses on resident roles, role totals, duties
and incidents. Renovation build upgrades are intentionally left for the next
slice after the resident-role layer is proven readable.

## Player Experience

The station has a visible resident identity:

- income-heavy stations feel efficient and a little commercial;
- comfort/service stations feel stable, repaired and cozy;
- maintenance stations resist condition decay and make duties stronger;
- visitor/social stations turn outside requests and incidents into better
  rewards;
- renovation stations prepare for future cycle-level progression.

This should not become a complex party-management screen. The player sees
resident roles as short tags in the existing resident UI, then feels those roles
through better duty outcomes and special incident choices.

## Resident Roles

Add a small role taxonomy:

- `income`: improves earnings and income-style choices;
- `comfort`: improves comfort, cozy visual rewards and resident morale hooks;
- `maintenance`: improves condition repair and reduces station wear pressure;
- `visitor`: improves visitor/social incident outcomes;
- `renovation`: prepares for future renovation-cycle bonuses.

Each resident has one primary role and may have one secondary role:

| Resident | Primary | Secondary | Build Meaning |
| --- | --- | --- | --- |
| `sleepy_engineer` | `maintenance` | `income` | Keeps the capsule efficient and repaired. |
| `mist_cook` | `comfort` | `income` | Turns kitchen progress into comfort and income. |
| `vacuum_gardener` | `comfort` | `maintenance` | Stabilizes garden/condition and comfort growth. |
| `sock_master` | `maintenance` | `comfort` | Makes laundry and repair duties stronger. |
| `teleport_courier` | `visitor` | `income` | Improves guest, delivery and social outcomes. |
| `vip_astroteenant` | `income` | `visitor` | Strong temporary income/social pressure. |
| `retired_cosmonaut` | `renovation` | `comfort` | Future renovation mentor and cycle memory anchor. |
| `three_eyed_housekeeper` | `maintenance` | `visitor` | Lowers service friction and handles station order. |

Role totals are derived from unlocked residents and are not saved separately.
A primary role counts as 2 points. A secondary role counts as 1 point.

## Domain API

Add pure helpers in the resident domain:

```ts
export type ResidentRole = 'income' | 'comfort' | 'maintenance' | 'visitor' | 'renovation';

export interface ResidentRoleProfile {
  primary: ResidentRole;
  secondary?: ResidentRole;
}

export type ResidentRoleTotals = Record<ResidentRole, number>;

export function getResidentRoleProfile(residentId: ResidentId): ResidentRoleProfile;
export function getResidentRoleTotals(state: GameState): ResidentRoleTotals;
export function hasResidentRole(state: GameState, role: ResidentRole, points = 1): boolean;
```

These helpers should not mutate `GameState` and should not depend on React.

## Duties

Communal Duties should use resident roles in addition to exact resident ids.
The existing best-resident system remains, but roles add a small extra layer:

- assigning a resident with the duty's preferred role adds a role bonus;
- the exact best resident is still strongest;
- non-best, non-role residents can still complete the duty if eligible.

Add optional duty metadata:

```ts
preferredRole?: ResidentRole;
roleBonus?: CommunalDutyReward;
```

Reward stacking rules:

- base resident outcome applies first;
- if assigned resident has the duty's preferred role, merge `roleBonus`;
- condition repair stacks additively and caps at 100 through existing repair
  logic;
- timed bonuses append like existing duty bonuses;
- no negative duty outcome in this slice.

First duty role mapping:

- `capsule_quiet_hours`: `maintenance`;
- `kitchen_soup_escape`: `comfort`;
- `garden_vacuum_sprout`: `comfort`;
- `laundry_sock_orbit`: `maintenance`.

## Incidents

Incidents gain optional role-gated choices. A choice can require a role total:

```ts
requiresRole?: {
  role: ResidentRole;
  points: number;
}
```

If the station does not meet the role requirement, the journal can still show
the incident but must hide or disable that choice. The first implementation can
filter role-locked choices out of the rendered choice list and make the domain
reject the choice if called directly.

First role-gated choices:

- `kitchen_borscht_fog`: comfort role can turn fog into a better comfort result.
- `condition_warning_light`: maintenance role can repair without kopek cost.
- `teleport_wrong_parcel`: visitor role can return the parcel for stronger
  social/comfort value.
- `cat_found_warm_pipe`: comfort role can add a cozy visual detail.
- `high_income_low_comfort_meeting`: comfort role can solve the meeting through
  tea instead of credits.

Role-gated choices should never be required to resolve an incident. Every
incident must keep at least one always-available choice.

## UI

Update existing resident UI only:

- `ResidentsPanel` shows role tags for unlocked and locked residents;
- `ResidentCollectionBook` shows the same role tags;
- the current duty panel can mention best match as it does now, but does not
  need a new role explanation block in the first slice;
- incident choice copy should remain short and use existing translation paths.

No new full-screen build page in this slice. The build should be felt through
existing systems first.

## Save And Migration

No save schema change is required for role totals because they are derived from
`unlockedResidents`. Incident choices gain optional static requirements in
content definitions, not save data.

Existing saves continue to load. Players with already unlocked residents
immediately receive the corresponding role totals.

## Testing

Tests should cover:

- role profiles exist for all resident ids;
- role totals count primary and secondary roles correctly;
- duties merge role bonuses only when the assigned resident has the preferred
  role;
- incidents filter/reject role-gated choices without blocking resolution;
- resident UI renders role labels;
- existing save fixtures remain valid.

## Out Of Scope

- resident fatigue;
- resident moods;
- manual resident assignment loadouts;
- multiple simultaneous duties;
- renovation-specific role upgrades;
- new currencies;
- new full-screen build planner;
- negative outcomes or failure states.

## Success Criteria

After this slice, a player can look at unlocked residents and understand that
their station has a build direction. Duties and incidents should visibly reward
having the right kind of resident, without making the wrong resident feel like a
hard fail.
