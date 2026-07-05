# Clarity Spine Design

## Goal

Polish the game by making every major action self-explanatory. The player
should understand:

```text
what matters now -> why it matters -> what the action changes -> where to see it
```

This is not a new tutorial system. Clarity Spine is a thin explanation layer
over existing systems: Station Director, module cards, communal duties,
incidents, renovation and last-action feedback.

## Player Experience

The game should feel less like a set of disconnected panels and more like a
station that explains itself through actions.

Examples:

- Current task says: open kitchen because it unlocks the cook and first duty
  flow.
- Duty assignment says: Sleepy Engineer matches maintenance, so capsule repair
  will be stronger.
- Incident choice says: comfort role unlocks a cozy solution and gives comfort.
- Renovation says: this resets rooms and kopeks, gives reputation, and makes
  the next cycle stronger.
- After a claim or choice, a short result line confirms the reward and reason.

The tone stays cozy and concise. The UI should not become a rulebook.

## Scope

First pass includes:

- Current Task copy gains a reason and expected result.
- Module cards preview what buying a level changes now or unlocks next.
- Communal Duty assignment shows best match, role match and resulting reward.
- Incident choice buttons show clearer reward summaries and role-gated reason.
- Renovation panel explains reset impact, reputation gain and next-cycle value.
- Last-action feedback shows a small result summary without modal interruption.

First pass does not include:

- new tutorial state;
- new currencies;
- new progression mechanics;
- full layout redesign;
- new room art or visual scenes;
- balance rebalance beyond clearer reward presentation.

## Architecture

Use existing domain helpers and add pure preview helpers where needed. React
components should render domain-derived clarity data instead of duplicating
rules in UI code.

Recommended domain surface:

```ts
interface ActionPreview {
  title: string;
  reason?: string;
  result: string;
  tags: ActionPreviewTag[];
}

type ActionPreviewTag =
  | 'income'
  | 'comfort'
  | 'condition'
  | 'resident'
  | 'role'
  | 'visual'
  | 'renovation'
  | 'timed_bonus';
```

Preview helpers should be small and specific:

- module purchase preview: cost, income change, comfort, unlock hints;
- duty preview: assigned resident, best match, role bonus, final reward;
- incident choice preview: reward summary, role requirement if present;
- renovation preview: reputation gain, reset impact, upgrade choice count;
- last-result preview: short summary of the latest resolved action.

The helpers may return translation keys or structured numeric data. They should
not mutate `GameState`.

## Station Director

Station Director becomes the main "why now" layer. It should continue to show
one current task, but task body copy should answer two questions:

- why this task matters;
- what changes after completing it.

The task should not explain every rule. It should point the player to the next
useful action and make its consequence clear.

## Action Cards

Action surfaces should show consequences before click:

- module card: next income, comfort, unlock or milestone;
- duty panel: expected result and role bonus if resident matches;
- incident choice: reward summary and role-gated reason;
- renovation upgrade: permanent effect and why it helps the next cycle.

If space is tight on mobile, show compact tags first and keep explanatory copy
to one short line.

## Last-Action Feedback

Use a small non-modal feedback area for the latest meaningful result:

- duty claim: `Capsule repaired: +35 condition, maintenance role matched`;
- incident choice: `Visual detail unlocked: kitchen mist patch`;
- resident unlock: `Mist Cook settled: comfort role available`;
- renovation: `Renovation complete: +1 reputation, choose 1 upgrade`.

Feedback should be informational, not a blocking reward popup.

## UI Constraints

- Do not add a new full-screen help or tutorial page.
- Do not add visible long-form explanations inside compact mobile panels.
- Keep role and reward labels consistent across panels.
- Prefer tags and short consequence lines over paragraphs.
- The same underlying preview should power desktop and mobile copy.

## Documentation

Update these docs during implementation:

- `docs/game-design/04-desktop-mobile-ux.md`: clarity expectations per layout.
- `docs/game-design/08-technical-architecture.md`: preview helper ownership.
- `docs/game-design/11-mvp-verification.md`: manual checks for action clarity.

## Testing

Tests should cover:

- Station Director task copy includes a reason/result for representative states.
- Module cards show preview text or tags for purchasable and locked states.
- Duty panel shows role-matched reward information.
- Incident journal hides locked role choices and explains available rewards.
- Renovation panel shows reset impact and reputation gain.
- Last-action feedback renders for duty, incident and renovation results.
- Responsive tests still pass for desktop and mobile layouts.

## Success Criteria

After the first pass, a player should be able to answer:

- what is the next useful action;
- what the action costs;
- what reward or state change it produces;
- why a certain resident or incident choice is better;
- why renovation is worth doing despite the reset.

This should be visible during normal play, without opening documentation or
reading a tutorial modal.
