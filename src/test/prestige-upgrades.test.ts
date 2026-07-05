import { describe, expect, it } from 'vitest';
import {
  buyPrestigeUpgrade,
  calculateIncomePerSecond,
  calculateModuleCost,
  calculateOfflineReward,
  createInitialState,
  getAvailablePrestigeUpgrades,
  performPrestige,
  getOfflineCapSeconds
} from '../game/economy';
import { prestigeUpgrades } from '../game/content/prestigeUpgrades';
import type { GameState, PrestigeUpgradeId } from '../game/types';
import { initializeRoomCondition } from '../game/roomConditions';

function createRenovationReadyState(overrides: Partial<GameState> = {}): GameState {
  const base = createInitialState(1_000);
  const prestigeCount = overrides.prestigeCount ?? base.prestigeCount ?? 0;
  const cycle = Math.min(prestigeCount, 2);
  const cycleState = cycle === 0
    ? {
        comfort: 25,
        moduleLevels: {
          ...base.moduleLevels,
          tenant_capsule: 10,
          cosmo_kitchen: 1
        },
        completedGoals: ['buy_capsule_10', 'unlock_kitchen', 'reach_comfort_25', 'earn_credits_10000'] as GameState['completedGoals']
      }
    : cycle === 1
      ? {
          comfort: 40,
          moduleLevels: {
            ...base.moduleLevels,
            tenant_capsule: 25,
            zero_g_laundry: 1
          },
          completedGoals: ['rebuild_capsule_10', 'reopen_kitchen', 'unlock_laundry_after_renovation', 'reach_comfort_40'] as GameState['completedGoals']
        }
      : {
          comfort: 60,
          moduleLevels: {
            ...base.moduleLevels,
            tenant_capsule: 25,
            teleport_entry: 1
          },
          completedGoals: ['rebuild_capsule_25', 'unlock_teleport_entry', 'unlock_five_residents', 'reach_comfort_60'] as GameState['completedGoals']
        };

  return {
    ...base,
    ...cycleState,
    totalEarnedCredits: 400_000,
    ...overrides,
    moduleLevels: {
      ...cycleState.moduleLevels,
      ...overrides.moduleLevels
    }
  };
}

describe('prestige upgrade tree', () => {
  it('buys residents_survive from the second renovation choice set and keeps it after renovation', () => {
    const state = createRenovationReadyState({
      reputation: 2,
      prestigeCount: 2,
      purchasedPrestigeUpgrades: ['warm_start_credits' as const],
      unlockedResidents: ['sleepy_engineer' as const, 'mist_cook' as const]
    });

    const upgraded = buyPrestigeUpgrade(state, 'residents_survive');

    expect(upgraded.reputation).toBe(0);
    expect(upgraded.purchasedPrestigeUpgrades).toContain('residents_survive');

    const renovated = performPrestige(upgraded, 2_000);

    // The two owned residents survive. retired_cosmonaut auto-unlocks because
    // reputation becomes > 0 after the first renovation.
    expect(renovated.unlockedResidents).toEqual(
      expect.arrayContaining(['sleepy_engineer', 'mist_cook', 'retired_cosmonaut'])
    );
  });

  it('drops residents on renovation without residents_survive (except retired_cosmonaut)', () => {
    const state = createRenovationReadyState({
      reputation: 0,
      unlockedResidents: ['sleepy_engineer' as const]
    });

    const renovated = performPrestige(state, 2_000);

    // sleep_engineer is dropped, but retired_cosmonaut auto-unlocks because
    // reputation becomes > 0 after the renovation.
    expect(renovated.unlockedResidents).not.toContain('sleepy_engineer');
    expect(renovated.unlockedResidents).toContain('retired_cosmonaut');
  });

  it('refuses to buy an upgrade without enough reputation', () => {
    const state = {
      ...createInitialState(1_000),
      reputation: 1,
      prestigeCount: 1
    };

    const upgraded = buyPrestigeUpgrade(state, 'residents_survive');

    expect(upgraded).toBe(state);
    expect(upgraded.purchasedPrestigeUpgrades).toBeUndefined();
  });

  it('does not allow buying the same upgrade twice', () => {
    const state = {
      ...createInitialState(1_000),
      reputation: 10,
      prestigeCount: 1,
      purchasedPrestigeUpgrades: ['starting_comfort' as const]
    };

    const upgraded = buyPrestigeUpgrade(state, 'starting_comfort');

    expect(upgraded).toBe(state);
    expect(upgraded.reputation).toBe(10);
  });

  it('grants starting comfort after renovation when starting_comfort is owned', () => {
    const state = createRenovationReadyState({
      reputation: 3,
      purchasedPrestigeUpgrades: ['starting_comfort' as const]
    });

    const renovated = performPrestige(state, 2_000);

    expect(renovated.comfort).toBe(5);
    expect(renovated.purchasedPrestigeUpgrades).toContain('starting_comfort');
  });

  it('exposes a broader renovation upgrade list', () => {
    expect(prestigeUpgrades).toHaveLength(9);
    expect(prestigeUpgrades.map((upgrade) => upgrade.id)).toEqual(
      expect.arrayContaining([
        'warm_start_credits',
        'capsule_head_start',
        'offline_cap_16h',
        'first_room_discount',
        'reputation_income',
        'visitor_comfort_bonus',
        'maintenance_drones'
      ])
    );
    expect(prestigeUpgrades.map((upgrade) => upgrade.id)).not.toEqual(
      expect.arrayContaining(['higher_offline_cap', 'starting_comfort_plus'])
    );
    expect([1, 2, 3].map((tier) => prestigeUpgrades.filter((upgrade) => upgrade.renovationTier === tier))).toEqual([
      expect.arrayContaining([
        expect.objectContaining({ id: 'warm_start_credits' }),
        expect.objectContaining({ id: 'first_room_discount' }),
        expect.objectContaining({ id: 'starting_comfort' })
      ]),
      expect.arrayContaining([
        expect.objectContaining({ id: 'residents_survive' }),
        expect.objectContaining({ id: 'capsule_head_start' }),
        expect.objectContaining({ id: 'visitor_comfort_bonus' })
      ]),
      expect.arrayContaining([
        expect.objectContaining({ id: 'reputation_income' }),
        expect.objectContaining({ id: 'offline_cap_16h' }),
        expect.objectContaining({ id: 'maintenance_drones' })
      ])
    ]);
  });

  it('offers exactly three upgrades for the next unspent renovation tier', () => {
    const firstTier = getAvailablePrestigeUpgrades({
      ...createInitialState(1_000),
      prestigeCount: 1
    }).map((upgrade) => upgrade.id);
    const secondTier = getAvailablePrestigeUpgrades({
      ...createInitialState(1_000),
      prestigeCount: 2,
      purchasedPrestigeUpgrades: ['warm_start_credits']
    }).map((upgrade) => upgrade.id);
    const spent = getAvailablePrestigeUpgrades({
      ...createInitialState(1_000),
      prestigeCount: 1,
      purchasedPrestigeUpgrades: ['warm_start_credits']
    });

    expect(firstTier).toEqual(['warm_start_credits', 'first_room_discount', 'starting_comfort']);
    expect(secondTier).toEqual(['residents_survive', 'capsule_head_start', 'visitor_comfort_bonus']);
    expect(spent).toEqual([]);
  });

  it('does not allow buying renovation upgrades before the first renovation', () => {
    const state = {
      ...createInitialState(1_000),
      reputation: 10,
      prestigeCount: 0
    };

    const upgraded = buyPrestigeUpgrade(state, 'starting_comfort');

    expect(upgraded).toBe(state);
    expect(upgraded.purchasedPrestigeUpgrades).toBeUndefined();
  });

  it('allows only one upgrade purchase per completed renovation', () => {
    const state = {
      ...createInitialState(1_000),
      reputation: 10,
      prestigeCount: 1
    };

    const first = buyPrestigeUpgrade(state, 'starting_comfort');
    const second = buyPrestigeUpgrade(first, 'first_room_discount');

    expect(first.purchasedPrestigeUpgrades).toEqual(['starting_comfort']);
    expect(second).toBe(first);
    expect(second.purchasedPrestigeUpgrades).toEqual(['starting_comfort']);
  });

  it('unlocks another upgrade purchase slot after another renovation', () => {
    const state = {
      ...createInitialState(1_000),
      reputation: 10,
      prestigeCount: 2,
      purchasedPrestigeUpgrades: ['starting_comfort' as const]
    };

    const upgraded = buyPrestigeUpgrade(state, 'capsule_head_start');

    expect(upgraded.purchasedPrestigeUpgrades).toEqual(['starting_comfort', 'capsule_head_start']);
  });

  it('does not allow skipping to a future renovation tier', () => {
    const state = {
      ...createInitialState(1_000),
      reputation: 10,
      prestigeCount: 1
    };

    const upgraded = buyPrestigeUpgrade(state, 'offline_cap_16h');

    expect(upgraded).toBe(state);
    expect(upgraded.purchasedPrestigeUpgrades).toBeUndefined();
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

  it('extends the offline cap to 16h with offline_cap_16h', () => {
    const upgraded = {
      ...createInitialState(0),
      purchasedPrestigeUpgrades: ['offline_cap_16h' as const]
    };

    expect(getOfflineCapSeconds(upgraded)).toBe(16 * 60 * 60);
  });

  it('applies new renovation upgrade effects after prestige', () => {
    const renovated = performPrestige(
      {
        ...createRenovationReadyState(),
        purchasedPrestigeUpgrades: ['warm_start_credits', 'capsule_head_start', 'starting_comfort']
      },
      2_000
    );

    expect(renovated.credits).toBe(100);
    expect(renovated.moduleLevels.tenant_capsule).toBe(5);
    expect(renovated.comfort).toBe(5);
  });

  it('applies first room discount and reputation income upgrades', () => {
    const base = { ...createInitialState(1_000), reputation: 10 };
    const upgraded = {
      ...base,
      purchasedPrestigeUpgrades: ['first_room_discount', 'reputation_income'] as PrestigeUpgradeId[],
      moduleLevels: {
        ...base.moduleLevels,
        tenant_capsule: 10
      }
    };

    expect(calculateModuleCost('tenant_capsule', { ...base, credits: 1_000 })).toBe(15);
    expect(calculateModuleCost('tenant_capsule', { ...base, credits: 1_000, purchasedPrestigeUpgrades: ['first_room_discount'] })).toBe(14);
    expect(calculateIncomePerSecond(upgraded)).toBeGreaterThan(calculateIncomePerSecond({ ...upgraded, purchasedPrestigeUpgrades: [] }));
  });

  it('maintenance_drones starts newly opened rooms in better condition', () => {
    const base = {
      ...createInitialState(1_000),
      purchasedPrestigeUpgrades: ['maintenance_drones' as const]
    };

    const withCondition = initializeRoomCondition(base, 'tenant_capsule');

    expect(withCondition.roomConditions?.tenant_capsule).toBe(80);
  });
});
