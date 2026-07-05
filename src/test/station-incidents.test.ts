import { describe, expect, it } from 'vitest';
import { activeStationIncidents, stationIncidents } from '../game/content/stationIncidents';
import { createInitialState } from '../game/economy';
import {
  getActiveStationIncidents,
  getAvailableStationIncidentChoices,
  getNewStationIncidentCount,
  markStationIncidentsSeen,
  queueEligibleIncidents,
  resolveStationIncident
} from '../game/stationIncidents';
import type { GameState } from '../game/types';

describe('station incidents content', () => {
  it('defines a large incident catalog with a focused active MVP slice', () => {
    expect(stationIncidents).toHaveLength(40);
    expect(activeStationIncidents).toHaveLength(21);
  });

  it('gives active incidents at least two choices', () => {
    for (const incident of activeStationIncidents) {
      expect(incident.choices.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('uses stable placeholders for active visual rewards', () => {
    const visualEffects = activeStationIncidents.flatMap((incident) =>
      incident.choices.flatMap((choice) => choice.effects.visualPlaceholderIds ?? [])
    );

    expect(visualEffects).toContain('kitchen_mist_patch_01');
    expect(visualEffects).toContain('cat_saucer_01');
    expect(new Set(visualEffects).size).toBeGreaterThanOrEqual(8);
  });

  it('keeps active incident rewards varied instead of credit-heavy', () => {
    const choices = activeStationIncidents.flatMap((incident) => incident.choices);
    const positiveCreditChoices = choices.filter((choice) => (choice.effects.creditsDelta ?? 0) > 0);
    const timedBonusChoices = choices.filter((choice) => choice.effects.timedBonus);
    const visualChoices = choices.filter((choice) => (choice.effects.visualPlaceholderIds ?? []).length > 0);
    const conditionChoices = choices.filter((choice) => Object.keys(choice.effects.conditionRepair ?? {}).length > 0);

    expect(positiveCreditChoices.length).toBeLessThanOrEqual(3);
    expect(timedBonusChoices.length).toBeGreaterThanOrEqual(1);
    expect(visualChoices.length).toBeGreaterThanOrEqual(8);
    expect(conditionChoices.length).toBeGreaterThanOrEqual(6);
  });
});

describe('station incident state', () => {
  it('queues at most one eligible incident per state update', () => {
    const base = createInitialState(1_000);
    const state: GameState = {
      ...base,
      moduleLevels: {
        ...base.moduleLevels,
        cosmo_kitchen: 1,
        oxygen_garden: 1,
        zero_g_laundry: 1
      }
    };

    const queued = queueEligibleIncidents(state, { now: 10_000 });

    expect(getActiveStationIncidents(queued)).toHaveLength(1);
    expect(getNewStationIncidentCount(queued)).toBe(1);
  });

  it('exposes only one unresolved incident at a time', () => {
    const base = createInitialState(1_000);
    const state: GameState = {
      ...base,
      activeIncidents: [
        { id: 'kitchen_borscht_fog', queuedAt: 1, isNew: true },
        { id: 'laundry_sock_orbit', queuedAt: 2, isNew: true },
        { id: 'garden_first_sprout_vote', queuedAt: 3, isNew: true }
      ],
      moduleLevels: {
        ...base.moduleLevels,
        teleport_entry: 1
      }
    };

    const active = getActiveStationIncidents(state);
    const queued = queueEligibleIncidents(state, { now: 10_000 });

    expect(active).toHaveLength(1);
    expect(active[0]?.id).toBe('kitchen_borscht_fog');
    expect(getActiveStationIncidents(queued)).toHaveLength(1);
  });

  it('resolves an incident choice once and persists visual placeholder rewards', () => {
    const base = createInitialState(1_000);
    const state: GameState = {
      ...base,
      activeIncidents: [{ id: 'kitchen_borscht_fog', queuedAt: 10_000, isNew: true }],
      roomConditions: { cosmo_kitchen: 60 }
    };

    const resolved = resolveStationIncident(state, 'kitchen_borscht_fog', 'vent_fog');

    expect(resolved.activeIncidents).toEqual([]);
    expect(resolved.completedIncidents).toContain('kitchen_borscht_fog');
    expect(resolved.unlockedIncidentVisuals).toContain('kitchen_mist_patch_01');
    expect(resolved.roomConditions?.cosmo_kitchen).toBe(68);
  });

  it('resolves timed incident bonuses with a real future expiry', () => {
    const base = createInitialState(1_000);
    const state: GameState = {
      ...base,
      activeIncidents: [{ id: 'kitchen_garden_soup', queuedAt: 10_000, isNew: true }]
    };

    const resolved = resolveStationIncident(state, 'kitchen_garden_soup', 'sell_recipe', 20_000);

    expect(resolved.timedBonuses).toContainEqual({
      id: 'incident_kitchen_garden_soup_recipe',
      incomeMultiplier: 1.2,
      expiresAt: 320_000
    });
  });

  it('does not return completed non-repeatable incidents', () => {
    const base = createInitialState(1_000);
    const state: GameState = {
      ...base,
      completedIncidents: ['kitchen_borscht_fog'],
      moduleLevels: {
        ...base.moduleLevels,
        cosmo_kitchen: 1
      }
    };

    const queued = queueEligibleIncidents(state, { now: 10_000 });

    expect(getActiveStationIncidents(queued)).toHaveLength(0);
  });

  it('marks new incidents as seen', () => {
    const base = createInitialState(1_000);
    const state: GameState = {
      ...base,
      activeIncidents: [{ id: 'cat_found_warm_pipe', queuedAt: 10_000, isNew: true }]
    };

    const seen = markStationIncidentsSeen(state);

    expect(getNewStationIncidentCount(seen)).toBe(0);
    expect(seen.activeIncidents?.[0]?.isNew).toBe(false);
  });

  it('queues cat incident only from scene interaction context', () => {
    const base = createInitialState(1_000);

    expect(getActiveStationIncidents(queueEligibleIncidents(base, { now: 10_000 }))).toHaveLength(0);

    const queued = queueEligibleIncidents(base, {
      now: 10_000,
      sceneInteractionId: 'strange_cat'
    });

    expect(getActiveStationIncidents(queued)[0]?.id).toBe('cat_found_warm_pipe');
  });

  it('filters role-gated incident choices by resident role totals', () => {
    const base = createInitialState(1_000);
    const withoutComfort = {
      ...base,
      activeIncidents: [{ id: 'kitchen_borscht_fog' as const, queuedAt: 10_000, isNew: true }]
    };
    const withComfort = {
      ...withoutComfort,
      unlockedResidents: ['mist_cook'] as GameState['unlockedResidents']
    };

    expect(getAvailableStationIncidentChoices(withoutComfort, 'kitchen_borscht_fog').map((choice) => choice.id)).not.toContain(
      'make_borscht_tradition'
    );
    expect(getAvailableStationIncidentChoices(withComfort, 'kitchen_borscht_fog').map((choice) => choice.id)).toContain(
      'make_borscht_tradition'
    );
  });

  it('rejects resolving locked role-gated incident choices directly', () => {
    const base = createInitialState(1_000);
    const state: GameState = {
      ...base,
      activeIncidents: [{ id: 'kitchen_borscht_fog', queuedAt: 10_000, isNew: true }]
    };

    const resolved = resolveStationIncident(state, 'kitchen_borscht_fog', 'make_borscht_tradition', 20_000);

    expect(resolved).toBe(state);
    expect(resolved.activeIncidents).toHaveLength(1);
  });

  it('allows resolving role-gated incident choices when role totals match', () => {
    const base = createInitialState(1_000);
    const state: GameState = {
      ...base,
      unlockedResidents: ['mist_cook'],
      activeIncidents: [{ id: 'kitchen_borscht_fog', queuedAt: 10_000, isNew: true }]
    };

    const resolved = resolveStationIncident(state, 'kitchen_borscht_fog', 'make_borscht_tradition', 20_000);

    expect(resolved.activeIncidents).toEqual([]);
    expect(resolved.comfort).toBe(3);
    expect(resolved.unlockedIncidentVisuals).toContain('kitchen_mist_patch_01');
  });
});
