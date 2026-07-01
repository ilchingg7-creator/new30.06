# Communal Duties Design

## Context

The game already has the core idle structure: room upgrades, visible room
progression, goals, residents, resident stories, visitors, room condition,
prestige and Station Director guidance.

The remaining design gap is decision quality. The player can buy levels and
watch the station improve, but the moment-to-moment choice is still mostly:

```text
wait for kopeks -> buy a level -> repeat
```

Communal Duties turn residents into the active heart of the cozy-comedy loop.
They create short station situations where the player assigns a resident to
handle a room problem and later claims a useful result.

## Goal

Add a small repeatable gameplay beat that gives the player a meaningful
decision every few minutes without turning the game into a complex management
sim.

The feature should:

- make residents feel useful and present;
- connect residents, rooms, condition, Station Director and visual progress;
- create cozy-comedy moments that fit Retro Soviet Space Cozy;
- reward attention without punishing absence;
- work on mobile in short sessions;
- avoid adding a new currency.

## Core Loop

```text
a room gets a small communal situation
-> the player assigns one unlocked resident
-> the duty runs for a short duration
-> the player claims the result
-> the room, comfort or income gets a small benefit
-> Station Director points to the next useful action
```

Only one duty can be active at a time in the first implementation pass.

Duties are not quests and do not replace goals. Goals are the long-term route.
Duties are short living station moments.

## Duty Rules

Each duty definition includes:

- `dutyId`;
- target `roomId`;
- required unlocked room;
- required unlocked resident context;
- 2-3 eligible residents;
- one best resident;
- duration;
- base reward;
- best-resident reward bonus;
- short request copy;
- short result copy.

The player can assign any eligible resident. The best resident gives a stronger
result, but a non-best resident still succeeds. There is no hard failure state
in the first pass.

New duties should appear only when:

- at least one resident is unlocked;
- the related room is unlocked;
- no other duty is available, in progress or ready to claim;
- enough time has passed since the last resolved duty.

First-pass pacing:

- duty availability cooldown: 4 minutes after the last resolved duty;
- duty duration: 3 minutes;
- no more than one unresolved duty at a time.

## First Content Slice

The first pass should include 3-4 duties:

1. Tenant capsule duty.
2. Cosmo kitchen duty.
3. Oxygen garden duty.
4. Zero-g laundry duty.

Example duty:

```text
Duty: Soup Escaped Into Zero-G
Room: cosmo_kitchen
Best resident: mist_cook
Alternatives: sleepy_engineer, vacuum_gardener

mist_cook result:
  +3 comfort
  +20 kitchen condition
  temporary kitchen income boost

sleepy_engineer result:
  +25 kitchen condition
  no comfort

vacuum_gardener result:
  +1 comfort
  +10 oxygen_garden condition
```

Initial numbers should follow this scale. Balance changes should be made
through tests after the vertical slice is playable. The behavior must stay soft:
every assignment helps, the best match helps more.

## Condition System Change

Communal Duties should become the primary active way to repair room condition.
The current click-to-repair behavior competes with the duty system and should be
removed in the same implementation pass.

New condition rules:

- clicking a room no longer repairs condition;
- clicking may still grant a small active income reward or visual feedback;
- condition decay must be much slower than the current 5-second rhythm;
- first-pass value: `-1 condition` every 3 minutes;
- offline condition decay should be disabled or heavily capped in the first
  pass;
- duties can repair condition as part of their reward.

Condition should remain a gentle reason to care, not a punishment loop:

- `pristine`: small income bonus;
- `working`: normal state;
- `worn`: visual problem, no income penalty;
- `broken`: small penalty only.

The player should not return after a normal break to a station that feels
ruined.

## Rewards

Duty rewards should not grant direct kopeks. Kopeks already come from room
income, offline rewards and rewarded bonuses.

Allowed first-pass reward effects:

- comfort gain;
- condition repair for one room;
- temporary income multiplier for one room or the whole station;
- resident-story progress acknowledgement;
- future visual-detail unlock hooks.

The first implementation should support only the effects it actually uses.
Do not build a generic reward engine beyond the content slice.

## State Shape

Recommended `GameState` addition:

```ts
communalDuty?: {
  id: string;
  dutyId: CommunalDutyId;
  roomId: ModuleId;
  status: 'available' | 'in_progress' | 'ready_to_claim';
  assignedResidentId?: ResidentId;
  startedAt?: number;
  completesAt?: number;
  lastResolvedAt?: number;
}
```

The implementation may split `lastResolvedAt` into separate save fields if that
keeps generation simpler. The important rule is that duty generation must be
deterministic and testable when `now` is provided.

## Architecture

Add pure domain logic instead of growing `useGameState.ts`.

Recommended files:

- `src/game/content/communalDuties.ts`: static duty definitions;
- `src/game/communalDuties.ts`: derive, assign, advance and claim duties;
- `src/test/communal-duties.test.ts`: domain tests;
- `src/ui/components/CommunalDutyPanel.tsx`: active duty UI;
- `src/ui/screens/CommunalDutyResultDialog.tsx`: short result feedback.

`useGameState.ts` should only wire the domain functions to React state:

```ts
assignCommunalDuty(residentId)
claimCommunalDuty()
```

The hook should not own duty selection rules, reward math or content filtering.

## UI Placement

Desktop:

- place the duty panel near Station Director, above or near the room scene;
- keep it compact enough that it does not push the room scene too far down.

Mobile:

- show the active duty where the player can see it without deep navigation;
- the best first placement is below the current station task or inside the top
  portion of the goals tab if vertical space becomes too tight;
- the panel must have a compact mobile variant from the start.

Panel states:

- no duty: no large empty panel;
- available: show situation, room, eligible resident buttons and best-resident
  hint only if it can be phrased naturally;
- in progress: show assigned resident and remaining time;
- ready to claim: show claim button and expected result summary.

The result dialog should be short. It should not block the loop with long text.

## Station Director Integration

Station Director should recognize duty states:

Priority guidance:

1. Ready-to-claim duty.
2. Available duty when the player has eligible residents.
3. In-progress duty only as low-priority status, not as the main repeated call
   to action.
4. Worn or broken important room can nudge the player toward duty resolution.

This keeps the system discoverable without making it a forced tutorial chain.

## Save And Migration

Existing saves have no communal duty state. Missing fields must parse as
absence of a duty.

Save parsing should accept:

- no `communalDuty`;
- a valid active duty;
- legacy saves without duty cooldown metadata.

Invalid duty state should be dropped safely rather than breaking boot.

## Testing

Domain tests:

- no duty appears without unlocked residents;
- no duty appears for locked rooms;
- generated duties use only unlocked room context;
- assigning a resident changes status to `in_progress`;
- assigning an ineligible resident is rejected;
- advancing past `completesAt` makes the duty `ready_to_claim`;
- claiming applies rewards once;
- best resident gives stronger reward than an alternate resident;
- claiming clears the active duty and records cooldown information;
- condition repair comes from duty rewards, not room clicks.

Condition tests:

- `clickRoom` no longer repairs selected room condition;
- decay interval is slowed to the new value;
- condition cannot decay through offline time unless explicit capped behavior is
  implemented.

UI tests:

- desktop renders an available duty panel when a duty exists;
- mobile renders a compact duty panel;
- resident assignment button calls the correct handler;
- ready-to-claim duty exposes a claim action;
- no-duty state does not add a large empty panel.

## Out Of Scope

- multiple simultaneous duties;
- resident fatigue;
- resident mood;
- failure states;
- new currencies;
- inventory;
- branching dialogue;
- long scheduling UI;
- monetization tied directly to duties;
- full visual prop unlock implementation.

## Implementation Boundary

The first implementation should deliver one complete playable vertical slice:

1. Slow condition decay.
2. Remove click-based condition repair.
3. Generate one available communal duty.
4. Assign one resident.
5. Wait until completion.
6. Claim reward.
7. Show the loop on desktop and mobile.
8. Integrate duty guidance into Station Director.

Further expansion should happen only after this slice feels clear in a short
mobile session.
