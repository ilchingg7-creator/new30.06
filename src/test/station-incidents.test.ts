import { describe, expect, it } from 'vitest';
import { activeStationIncidents, stationIncidents } from '../game/content/stationIncidents';
import { createInitialState } from '../game/economy';
import {
  getActiveStationIncidents,
  getNewStationIncidentCount,
  markStationIncidentsSeen,
  queueEligibleIncidents,
  resolveStationIncident
} from '../game/stationIncidents';
import type { GameState } from '../game/types';

describe('station incidents content', () => {
  it('defines a large incident catalog with a focused active MVP slice', () => {
    expect(stationIncidents).toHaveLength(40);
    expect(activeStationIncidents).toHaveLength(10);
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
    expect(new Set(visualEffects).size).toBe(visualEffects.length);
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

  it('respects the unresolved incident cap', () => {
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

    const queued = queueEligibleIncidents(state, { now: 10_000 });

    expect(getActiveStationIncidents(queued)).toHaveLength(3);
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
});
