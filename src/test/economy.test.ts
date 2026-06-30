import { describe, expect, it } from 'vitest';
import {
  advanceGame,
  buyModuleLevel,
  calculateIncomePerSecond,
  calculateModuleCost,
  calculateOfflineReward,
  calculatePrestigeReward,
  createInitialState,
  performPrestige
} from '../game/economy';

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

  it('caps offline income at 8 hours', () => {
    const state = buyModuleLevel(createInitialState(1_000), 'tenant_capsule');
    const reward = calculateOfflineReward(state, 10 * 60 * 60 * 1_000);

    expect(reward.seconds).toBe(8 * 60 * 60);
    expect(reward.credits).toBe(8 * 60 * 60);
  });

  it('uses square root prestige rewards and keeps reputation after renovation', () => {
    const state = {
      ...createInitialState(1_000),
      totalEarnedCredits: 400_000,
      reputation: 3
    };
    const renovated = performPrestige(state, 2_000);

    expect(calculatePrestigeReward(state)).toBe(2);
    expect(renovated.reputation).toBe(5);
    expect(renovated.credits).toBe(15);
    expect(renovated.moduleLevels.tenant_capsule).toBe(0);
  });
});
