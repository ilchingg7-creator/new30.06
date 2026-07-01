import { describe, expect, it } from 'vitest';
import {
  COMMUNAL_DUTY_COOLDOWN_MS,
  COMMUNAL_DUTY_DURATION_MS,
  advanceCommunalDuty,
  assignCommunalDuty,
  claimCommunalDuty,
  getEligibleCommunalDutyDefinitions,
  maybeCreateCommunalDuty
} from '../game/communalDuties';
import { createInitialState } from '../game/economy';
import type { CommunalDutyState, GameState } from '../game/types';

const NOW = 10_000;

function withCapsuleResident(): GameState {
  const base = createInitialState(NOW);

  return {
    ...base,
    moduleLevels: {
      ...base.moduleLevels,
      tenant_capsule: 10
    },
    unlockedResidents: ['sleepy_engineer'],
    roomConditions: {
      tenant_capsule: 45
    },
    lastCommunalDutyResolvedAt: NOW - COMMUNAL_DUTY_COOLDOWN_MS
  };
}

function withKitchenResident(): GameState {
  const base = withCapsuleResident();

  return {
    ...base,
    moduleLevels: {
      ...base.moduleLevels,
      cosmo_kitchen: 20
    },
    unlockedResidents: ['sleepy_engineer', 'mist_cook'],
    roomConditions: {
      ...base.roomConditions,
      cosmo_kitchen: 40
    }
  };
}

describe('communal duties', () => {
  it('does not generate a duty without unlocked residents', () => {
    const base = createInitialState(NOW);
    const state = {
      ...base,
      moduleLevels: {
        ...base.moduleLevels,
        tenant_capsule: 10
      },
      lastCommunalDutyResolvedAt: NOW - COMMUNAL_DUTY_COOLDOWN_MS
    };

    expect(getEligibleCommunalDutyDefinitions(state)).toHaveLength(0);
    expect(maybeCreateCommunalDuty(state, NOW)).toBe(state);
  });

  it('does not generate a duty before cooldown expires', () => {
    const state = {
      ...withCapsuleResident(),
      lastCommunalDutyResolvedAt: NOW - COMMUNAL_DUTY_COOLDOWN_MS + 1
    };

    expect(maybeCreateCommunalDuty(state, NOW)).toBe(state);
  });

  it('generates one available duty for an unlocked room and resident', () => {
    const next = maybeCreateCommunalDuty(withCapsuleResident(), NOW);

    expect(next.communalDuty).toMatchObject({
      dutyId: 'capsule_quiet_hours',
      roomId: 'tenant_capsule',
      status: 'available'
    });
  });

  it('assigns an eligible resident and sets completion time', () => {
    const available = maybeCreateCommunalDuty(withCapsuleResident(), NOW);
    const assigned = assignCommunalDuty(available, 'sleepy_engineer', NOW);

    expect(assigned.communalDuty).toMatchObject({
      status: 'in_progress',
      assignedResidentId: 'sleepy_engineer',
      startedAt: NOW,
      completesAt: NOW + COMMUNAL_DUTY_DURATION_MS
    });
  });

  it('rejects an ineligible resident assignment', () => {
    const available = maybeCreateCommunalDuty(withCapsuleResident(), NOW);
    const rejected = assignCommunalDuty(available, 'mist_cook', NOW);

    expect(rejected).toBe(available);
  });

  it('marks an assigned duty ready to claim after completion time', () => {
    const available = maybeCreateCommunalDuty(withCapsuleResident(), NOW);
    const assigned = assignCommunalDuty(available, 'sleepy_engineer', NOW);
    const ready = advanceCommunalDuty(assigned, NOW + COMMUNAL_DUTY_DURATION_MS);

    expect(ready.communalDuty?.status).toBe('ready_to_claim');
  });

  it('claiming applies rewards once and clears the active duty', () => {
    const available = maybeCreateCommunalDuty(withCapsuleResident(), NOW);
    const assigned = assignCommunalDuty(available, 'sleepy_engineer', NOW);
    const ready = advanceCommunalDuty(assigned, NOW + COMMUNAL_DUTY_DURATION_MS);
    const claimed = claimCommunalDuty(ready, NOW + COMMUNAL_DUTY_DURATION_MS);
    const claimedAgain = claimCommunalDuty(claimed, NOW + COMMUNAL_DUTY_DURATION_MS);

    expect(claimed.communalDuty).toBeUndefined();
    expect(claimed.lastCommunalDutyResolvedAt).toBe(NOW + COMMUNAL_DUTY_DURATION_MS);
    expect(claimed.comfort).toBeGreaterThan(ready.comfort);
    expect(claimed.roomConditions?.tenant_capsule).toBeGreaterThan(ready.roomConditions?.tenant_capsule ?? 0);
    expect(claimedAgain).toBe(claimed);
  });

  it('best resident gives stronger comfort reward than alternate resident', () => {
    const state = withKitchenResident();
    const kitchenDuty: CommunalDutyState = {
      id: 'duty-kitchen',
      dutyId: 'kitchen_soup_escape',
      roomId: 'cosmo_kitchen',
      status: 'available',
      createdAt: NOW
    };
    const available = {
      ...maybeCreateCommunalDuty(state, NOW),
      communalDuty: kitchenDuty
    };

    const best = claimCommunalDuty(
      advanceCommunalDuty(assignCommunalDuty(available, 'mist_cook', NOW), NOW + COMMUNAL_DUTY_DURATION_MS),
      NOW + COMMUNAL_DUTY_DURATION_MS
    );
    const alternate = claimCommunalDuty(
      advanceCommunalDuty(assignCommunalDuty(available, 'sleepy_engineer', NOW), NOW + COMMUNAL_DUTY_DURATION_MS),
      NOW + COMMUNAL_DUTY_DURATION_MS
    );

    expect(best.comfort).toBeGreaterThan(alternate.comfort);
  });
});
