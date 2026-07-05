import { describe, expect, it } from 'vitest';
import { buyModuleLevel, createInitialState, performPrestige } from '../game/economy';
import { checkResidentUnlocks, isResidentUnlocked } from '../game/residents';
import type { GameState } from '../game/types';

describe('resident unlocks', () => {
  it('does not unlock any resident at the start', () => {
    const state = createInitialState(1_000);

    expect(state.unlockedResidents).toEqual([]);
  });

  it('unlocks vacuum_gardener when the oxygen garden is opened', () => {
    let state = { ...createInitialState(1_000), credits: 100_000_000 };
    // oxygen_garden unlockAtCredits is 1100, baseCost 1600.
    state = buyModuleLevel(state, 'oxygen_garden');

    expect(state.unlockedResidents).toContain('vacuum_gardener');
    expect(state.comfort).toBe(10);
  });

  it('unlocks sleepy_engineer when tenant_capsule reaches level 10', () => {
    let state = { ...createInitialState(1_000), credits: 100_000_000 };

    for (let i = 0; i < 10; i += 1) {
      state = buyModuleLevel(state, 'tenant_capsule');
    }

    expect(state.unlockedResidents).toContain('sleepy_engineer');
  });

  it('unlocks retired_cosmonaut after the first prestige', () => {
    const base = createInitialState(1_000);
    const state = {
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
    const renovated = performPrestige(state, 2_000);

    expect(renovated.unlockedResidents).toContain('retired_cosmonaut');
  });

  it('unlocks three_eyed_housekeeper when comfort reaches 40', () => {
    const state = {
      ...createInitialState(1_000),
      comfort: 40
    };
    const checked = checkResidentUnlocks(state);

    expect(checked.unlockedResidents).toContain('three_eyed_housekeeper');
  });

  it('does not unlock vip_astroteenant automatically by comfort', () => {
    const state = {
      ...createInitialState(1_000),
      comfort: 30 // vip requires comfort 25
    };
    const checked = checkResidentUnlocks(state);

    expect(checked.unlockedResidents).not.toContain('vip_astroteenant');
  });

  it('does not duplicate already-unlocked residents', () => {
    const state = {
      ...createInitialState(1_000),
      comfort: 40,
      unlockedResidents: ['three_eyed_housekeeper' as const]
    };
    const checked = checkResidentUnlocks(state);

    expect(checked.unlockedResidents.filter((id) => id === 'three_eyed_housekeeper')).toHaveLength(1);
  });

  it('isResidentUnlocked reports false for locked residents', () => {
    const state = createInitialState(1_000);

    expect(isResidentUnlocked('sleepy_engineer', state)).toBe(false);
    expect(isResidentUnlocked('vacuum_gardener', state)).toBe(false);
  });
});
