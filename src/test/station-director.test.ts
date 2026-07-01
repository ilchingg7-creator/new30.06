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

    expect(guidance.kind).toBe('visitor');
    expect(guidance.priority).toBe(100);
    expect(guidance.canActNow).toBe(true);
  });

  it('prioritizes a close goal before a generic module upgrade', () => {
    const state = {
      ...withCapsuleLevel(9),
      credits: 1_000
    };

    const guidance = getStationGuidance({ state, incomePerSecond: 5 });

    expect(guidance.kind).toBe('goal');
    if (guidance.kind !== 'goal') {
      throw new Error(`Expected goal guidance, got ${guidance.kind}`);
    }
    expect(guidance.goalId).toBe('buy_capsule_10');
    expect(guidance.targetRoomId).toBe('tenant_capsule');
    expect(guidance.progressCurrent).toBe(9);
    expect(guidance.progressTarget).toBe(10);
  });

  it('recommends an affordable room upgrade with a room target', () => {
    const state = {
      ...createInitialState(1_000),
      credits: 15
    };

    const guidance = getStationGuidance({ state, incomePerSecond: 0 });

    expect(guidance.kind).toBe('module');
    if (guidance.kind !== 'module') {
      throw new Error(`Expected module guidance, got ${guidance.kind}`);
    }
    expect(guidance.moduleId).toBe('tenant_capsule');
    expect(guidance.targetRoomId).toBe('tenant_capsule');
    expect(guidance.canAfford).toBe(true);
    expect(guidance.waitSeconds).toBe(0);
  });

  it('includes a finite wait time for unaffordable unlocked upgrades when income is positive', () => {
    const state = {
      ...createInitialState(1_000),
      credits: 10
    };

    const guidance = getStationGuidance({ state, incomePerSecond: 2 });

    expect(guidance.kind).toBe('module');
    if (guidance.kind !== 'module') {
      throw new Error(`Expected module guidance, got ${guidance.kind}`);
    }
    expect(guidance.canAfford).toBe(false);
    expect(guidance.waitSeconds).toBeGreaterThan(0);
    expect(Number.isFinite(guidance.waitSeconds)).toBe(true);
  });

  it('does not produce an invalid wait time when income is zero', () => {
    const state = {
      ...createInitialState(1_000),
      credits: 0
    };

    const guidance = getStationGuidance({ state, incomePerSecond: 0 });

    expect(guidance.kind).toBe('module');
    if (guidance.kind !== 'module') {
      throw new Error(`Expected module guidance, got ${guidance.kind}`);
    }
    expect(guidance.canAfford).toBe(false);
    expect(guidance.waitSeconds).toBeNull();
  });

  it('shows prestige guidance when renovation can produce reputation', () => {
    const state = {
      ...createInitialState(1_000),
      totalEarnedCredits: 100_000
    };

    const guidance = getStationGuidance({ state, incomePerSecond: 10 });

    expect(guidance.kind).toBe('prestige');
    if (guidance.kind !== 'prestige') {
      throw new Error(`Expected prestige guidance, got ${guidance.kind}`);
    }
    expect(guidance.canRenovate).toBe(true);
    expect(guidance.expectedReputation).toBe(1);
  });

  it('can surface a pending daily reward above normal purchases', () => {
    const guidance = getStationGuidance({
      state: createInitialState(1_000),
      incomePerSecond: 0,
      hasPendingDailyReward: true
    });

    expect(guidance.kind).toBe('daily');
    expect(guidance.priority).toBe(90);
  });
});
