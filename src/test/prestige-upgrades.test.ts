import { describe, expect, it } from 'vitest';
import {
  buyPrestigeUpgrade,
  calculateOfflineReward,
  createInitialState,
  performPrestige,
  getOfflineCapSeconds
} from '../game/economy';

describe('prestige upgrade tree', () => {
  it('buys residents_survive when enough reputation and keeps it after renovation', () => {
    const state = {
      ...createInitialState(1_000),
      totalEarnedCredits: 400_000,
      reputation: 2,
      unlockedResidents: ['sleepy_engineer' as const, 'mist_cook' as const]
    };

    const upgraded = buyPrestigeUpgrade(state, 'residents_survive');

    expect(upgraded.reputation).toBe(0);
    expect(upgraded.purchasedPrestigeUpgrades).toContain('residents_survive');

    const renovated = performPrestige(upgraded, 2_000);

    // The two owned residents survive. retired_cosmonaut auto-unlocks because
    // reputation becomes > 0 after the first renovation.
    expect(renovated.unlockedResidents).toEqual(
      expect.arrayContaining(['sleepy_engineer', 'mist_cook', 'retired_cosmonaut'])
    );
    expect(renovated.unlockedResidents).toHaveLength(3);
  });

  it('drops residents on renovation without residents_survive (except retired_cosmonaut)', () => {
    const state = {
      ...createInitialState(1_000),
      totalEarnedCredits: 400_000,
      reputation: 0,
      unlockedResidents: ['sleepy_engineer' as const]
    };

    const renovated = performPrestige(state, 2_000);

    // sleep_engineer is dropped, but retired_cosmonaut auto-unlocks because
    // reputation becomes > 0 after the renovation.
    expect(renovated.unlockedResidents).not.toContain('sleepy_engineer');
    expect(renovated.unlockedResidents).toContain('retired_cosmonaut');
  });

  it('refuses to buy an upgrade without enough reputation', () => {
    const state = {
      ...createInitialState(1_000),
      reputation: 1
    };

    const upgraded = buyPrestigeUpgrade(state, 'residents_survive');

    expect(upgraded).toBe(state);
    expect(upgraded.purchasedPrestigeUpgrades).toBeUndefined();
  });

  it('does not allow buying the same upgrade twice', () => {
    const state = {
      ...createInitialState(1_000),
      reputation: 10,
      purchasedPrestigeUpgrades: ['starting_comfort' as const]
    };

    const upgraded = buyPrestigeUpgrade(state, 'starting_comfort');

    expect(upgraded).toBe(state);
    expect(upgraded.reputation).toBe(10);
  });

  it('grants starting comfort after renovation when starting_comfort is owned', () => {
    const state = {
      ...createInitialState(1_000),
      totalEarnedCredits: 400_000,
      reputation: 3,
      purchasedPrestigeUpgrades: ['starting_comfort' as const]
    };

    const renovated = performPrestige(state, 2_000);

    expect(renovated.comfort).toBe(5);
    expect(renovated.purchasedPrestigeUpgrades).toContain('starting_comfort');
  });

  it('extends the offline cap from 8h to 12h with higher_offline_cap', () => {
    const base = createInitialState(0);
    expect(getOfflineCapSeconds(base)).toBe(8 * 60 * 60);

    const upgraded = {
      ...base,
      purchasedPrestigeUpgrades: ['higher_offline_cap' as const]
    };
    expect(getOfflineCapSeconds(upgraded)).toBe(12 * 60 * 60);

    const reward = calculateOfflineReward(upgraded, 10 * 60 * 60 * 1_000);
    expect(reward.seconds).toBe(10 * 60 * 60);
  });
});
