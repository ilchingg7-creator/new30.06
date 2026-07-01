import { describe, expect, it } from 'vitest';
import { buyModuleLevel, createInitialState, performPrestige } from '../game/economy';
import { checkAchievements, isAchievementUnlocked } from '../game/achievements';

describe('soft achievements', () => {
  it('unlocks first_purchase after buying the first module level', () => {
    const state = buyModuleLevel(createInitialState(1_000), 'tenant_capsule');

    expect(state.unlockedAchievements).toContain('first_purchase');
  });

  it('unlocks ten_module_levels at 10 total levels', () => {
    let state = { ...createInitialState(1_000), credits: 100_000_000 };

    for (let i = 0; i < 10; i += 1) {
      state = buyModuleLevel(state, 'tenant_capsule');
    }

    expect(state.unlockedAchievements).toContain('ten_module_levels');
    expect(isAchievementUnlocked('fifty_module_levels', state)).toBe(false);
  });

  it('unlocks credits_million when totalEarnedCredits reaches 1M', () => {
    const state = {
      ...createInitialState(1_000),
      totalEarnedCredits: 1_000_000
    };
    const checked = checkAchievements(state);

    expect(checked.unlockedAchievements).toContain('credits_million');
  });

  it('unlocks first_prestige after a renovation', () => {
    const state = {
      ...createInitialState(1_000),
      totalEarnedCredits: 400_000
    };
    const renovated = performPrestige(state, 2_000);

    expect(renovated.unlockedAchievements).toContain('first_prestige');
  });

  it('unlocks comfort_50 when comfort reaches 50', () => {
    const state = {
      ...createInitialState(1_000),
      comfort: 50
    };
    const checked = checkAchievements(state);

    expect(checked.unlockedAchievements).toContain('comfort_50');
  });

  it('does not duplicate already-unlocked achievements', () => {
    const state = {
      ...createInitialState(1_000),
      totalEarnedCredits: 1_000_000,
      unlockedAchievements: ['credits_million' as const]
    };
    const checked = checkAchievements(state);

    expect(checked.unlockedAchievements).toEqual(['credits_million']);
  });

  it('unlocks daily_streak_7 at streak 7', () => {
    const state = {
      ...createInitialState(1_000),
      dailyStreak: 7
    };
    const checked = checkAchievements(state);

    expect(checked.unlockedAchievements).toContain('daily_streak_7');
  });
});
