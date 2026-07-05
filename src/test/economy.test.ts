import { describe, expect, it } from 'vitest';
import {
  advanceGame,
  buyModuleLevel,
  calculateIncomePerSecond,
  calculateModuleCost,
  calculateOfflineReward,
  calculatePrestigeReward,
  canPerformPrestige,
  createInitialState,
  getPrestigeRequirements,
  performPrestige
} from '../game/economy';
import type { GameState } from '../game/types';

function createFirstRenovationReadyState() {
  const base = createInitialState(1_000);

  return {
    ...base,
    totalEarnedCredits: 400_000,
    comfort: 25,
    moduleLevels: {
      ...base.moduleLevels,
      tenant_capsule: 10,
      cosmo_kitchen: 1
    },
    completedGoals: ['buy_capsule_10', 'unlock_kitchen', 'reach_comfort_25', 'earn_credits_10000'] as GameState['completedGoals']
  };
}

describe('economy engine', () => {
  it('starts with enough credits for the first capsule', () => {
    const state = createInitialState(1_000);

    expect(state.credits).toBe(15);
    expect(calculateModuleCost('tenant_capsule', state)).toBe(15);
  });

  it('buys the first capsule level and produces income over time', () => {
    const started = createInitialState(1_000);
    const bought = buyModuleLevel(started, 'tenant_capsule');
    const advanced = advanceGame(bought, 10, 11_000);

    expect(bought.moduleLevels.tenant_capsule).toBe(1);
    expect(bought.credits).toBe(0);
    expect(calculateIncomePerSecond(bought)).toBe(1);
    expect(advanced.credits).toBe(10);
    expect(advanced.totalEarnedCredits).toBe(10);
  });

  it('adds module comfort only when a room is first opened', () => {
    const started = { ...createInitialState(1_000), credits: 1_000, completedGoals: ['unlock_kitchen' as const] };
    const opened = buyModuleLevel(started, 'cosmo_kitchen');
    const upgraded = buyModuleLevel({ ...opened, credits: 1_000 }, 'cosmo_kitchen');

    expect(opened.comfort).toBe(1);
    expect(upgraded.comfort).toBe(1);
  });

  it('caps offline income at 8 hours', () => {
    const state = buyModuleLevel(createInitialState(1_000), 'tenant_capsule');
    const reward = calculateOfflineReward(state, 10 * 60 * 60 * 1_000);

    expect(reward.seconds).toBe(8 * 60 * 60);
    expect(reward.credits).toBe(8 * 60 * 60);
  });

  it('uses square root prestige rewards and keeps reputation after renovation', () => {
    const state = {
      ...createFirstRenovationReadyState(),
      reputation: 3
    };
    const renovated = performPrestige(state, 2_000);

    expect(calculatePrestigeReward(state)).toBe(2);
    expect(renovated.reputation).toBe(5);
    expect(renovated.credits).toBe(15);
    expect(renovated.moduleLevels.tenant_capsule).toBe(0);
  });

  it('blocks renovation until the current cycle requirements are complete', () => {
    const state = {
      ...createInitialState(1_000),
      totalEarnedCredits: 400_000
    };
    const requirements = getPrestigeRequirements(state);
    const renovated = performPrestige(state, 2_000);

    expect(calculatePrestigeReward(state)).toBe(2);
    expect(requirements.map((requirement) => requirement.completed)).toEqual([true, false, false]);
    expect(canPerformPrestige(state)).toBe(false);
    expect(renovated).toBe(state);
  });

  it('allows renovation when reward, station and goal requirements are complete', () => {
    const state = createFirstRenovationReadyState();
    const requirements = getPrestigeRequirements(state);
    const renovated = performPrestige(state, 2_000);

    expect(requirements.every((requirement) => requirement.completed)).toBe(true);
    expect(canPerformPrestige(state)).toBe(true);
    expect(renovated).not.toBe(state);
    expect(renovated.prestigeCount).toBe(1);
  });
});
