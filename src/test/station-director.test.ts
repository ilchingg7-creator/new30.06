import { describe, expect, it } from 'vitest';
import { createInitialState } from '../game/economy';
import { getStationGuidance } from '../game/stationDirector';
import type { GameState } from '../game/types';

function withCapsuleLevel(level: number): GameState {
  const base = createInitialState(1_000);

  return {
    ...base,
    moduleLevels: {
      ...base.moduleLevels,
      tenant_capsule: level
    }
  };
}

describe('station director guidance', () => {
  it('prioritizes an affordable visitor over normal module upgrades', () => {
    const state: GameState = {
      ...createInitialState(1_000),
      credits: 250,
      activeVisitor: {
        id: 'visitor-1',
        name: 'Visitor',
        flavor: 'Needs a room',
        cost: 100,
        rewardComfort: 2,
        expiresAt: 120_000,
        template: 'mechanic'
      }
    };

    const guidance = getStationGuidance({ state, incomePerSecond: 1 });

    expect(guidance).not.toBeNull();
    if (!guidance) {
      throw new Error('Expected visitor guidance, got null');
    }
    expect(guidance.kind).toBe('visitor');
    expect(guidance.priority).toBe(100);
    expect(guidance.canActNow).toBe(true);
  });

  it('does not duplicate close goals as station events', () => {
    const state = {
      ...withCapsuleLevel(9),
      credits: 1_000
    };

    const guidance = getStationGuidance({ state, incomePerSecond: 5 });

    expect(guidance).toBeNull();
  });

  it('prioritizes a ready communal duty above normal purchases', () => {
    const state: GameState = {
      ...createInitialState(1_000),
      communalDuty: {
        id: 'duty-1',
        dutyId: 'capsule_quiet_hours',
        roomId: 'tenant_capsule',
        status: 'ready_to_claim',
        createdAt: 1_000,
        assignedResidentId: 'sleepy_engineer',
        startedAt: 1_000,
        completesAt: 181_000
      }
    };

    const guidance = getStationGuidance({ state, incomePerSecond: 0 });

    expect(guidance).not.toBeNull();
    if (!guidance) {
      throw new Error('Expected communal duty guidance, got null');
    }
    expect(guidance.kind).toBe('communal_duty');
    expect(guidance.priority).toBe(95);
  });

  it('surfaces an available communal duty before close goals', () => {
    const state: GameState = {
      ...withCapsuleLevel(9),
      communalDuty: {
        id: 'duty-1',
        dutyId: 'capsule_quiet_hours',
        roomId: 'tenant_capsule',
        status: 'available',
        createdAt: 1_000
      }
    };

    const guidance = getStationGuidance({ state, incomePerSecond: 5 });

    expect(guidance).not.toBeNull();
    if (!guidance) {
      throw new Error('Expected communal duty guidance, got null');
    }
    expect(guidance.kind).toBe('communal_duty');
    expect(guidance.priority).toBe(85);
  });

  it('does not duplicate affordable module upgrades as station events', () => {
    const state = {
      ...createInitialState(1_000),
      credits: 15
    };

    const guidance = getStationGuidance({ state, incomePerSecond: 0 });

    expect(guidance).toBeNull();
  });

  it('does not show unaffordable module waits as station events', () => {
    const state = {
      ...createInitialState(1_000),
      credits: 10
    };

    const guidance = getStationGuidance({ state, incomePerSecond: 2 });

    expect(guidance).toBeNull();
  });

  it('does not show zero-income module waits as station events', () => {
    const state = {
      ...createInitialState(1_000),
      credits: 0
    };

    const guidance = getStationGuidance({ state, incomePerSecond: 0 });

    expect(guidance).toBeNull();
  });

  it('shows prestige guidance when renovation can produce reputation', () => {
    const base = createInitialState(1_000);
    const state = {
      ...base,
      totalEarnedCredits: 100_000,
      comfort: 25,
      moduleLevels: {
        ...base.moduleLevels,
        tenant_capsule: 10,
        cosmo_kitchen: 1
      },
      completedGoals: ['buy_capsule_10', 'unlock_kitchen', 'reach_comfort_25', 'earn_credits_10000'] as GameState['completedGoals']
    };

    const guidance = getStationGuidance({ state, incomePerSecond: 10 });

    expect(guidance).not.toBeNull();
    if (!guidance) {
      throw new Error('Expected prestige guidance, got null');
    }
    expect(guidance.kind).toBe('prestige');
    if (guidance.kind !== 'prestige') {
      throw new Error(`Expected prestige guidance, got ${guidance.kind}`);
    }
    expect(guidance.canRenovate).toBe(true);
    expect(guidance.expectedReputation).toBe(1);
  });

  it('does not show prestige guidance before renovation requirements are complete', () => {
    const state = {
      ...createInitialState(1_000),
      totalEarnedCredits: 100_000
    };

    const guidance = getStationGuidance({ state, incomePerSecond: 10 });

    expect(guidance).toBeNull();
  });

  it('can surface a pending daily reward above normal purchases', () => {
    const guidance = getStationGuidance({
      state: createInitialState(1_000),
      incomePerSecond: 0,
      hasPendingDailyReward: true
    });

    expect(guidance).not.toBeNull();
    if (!guidance) {
      throw new Error('Expected daily guidance, got null');
    }
    expect(guidance.kind).toBe('daily');
    expect(guidance.priority).toBe(90);
  });
});
