import { describe, expect, it } from 'vitest';
import { buyModuleLevel, createInitialState, performPrestige } from '../game/economy';
import { checkResidentStories, getActiveResidentStory, residentStories } from '../game/residentStories';
import type { GameState } from '../game/types';

describe('resident stories', () => {
  it('returns null when no residents are unlocked', () => {
    const state = createInitialState(1_000);

    expect(getActiveResidentStory(state)).toBeNull();
  });

  it('returns null when the resident is unlocked but room level is below trigger', () => {
    const state = {
      ...createInitialState(1_000),
      unlockedResidents: ['sleepy_engineer' as const],
      moduleLevels: { ...createInitialState(1_000).moduleLevels, tenant_capsule: 5 }
    };

    expect(getActiveResidentStory(state)).toBeNull();
  });

  it('returns an active story when room level is between trigger and required', () => {
    const state = {
      ...createInitialState(1_000),
      unlockedResidents: ['sleepy_engineer' as const],
      moduleLevels: { ...createInitialState(1_000).moduleLevels, tenant_capsule: 12 }
    };

    const story = getActiveResidentStory(state);

    expect(story).not.toBeNull();
    expect(story?.id).toBe('engineer_quiet_capsule');
    expect(story?.currentLevel).toBe(12);
    expect(story?.requiredLevel).toBe(15);
  });

  it('returns null when the story is already completed', () => {
    const state = {
      ...createInitialState(1_000),
      unlockedResidents: ['sleepy_engineer' as const],
      moduleLevels: { ...createInitialState(1_000).moduleLevels, tenant_capsule: 12 },
      completedStories: ['engineer_quiet_capsule' as const]
    };

    expect(getActiveResidentStory(state)).toBeNull();
  });

  it('returns null when the room level meets or exceeds requiredLevel (story auto-completes)', () => {
    const state = {
      ...createInitialState(1_000),
      unlockedResidents: ['sleepy_engineer' as const],
      moduleLevels: { ...createInitialState(1_000).moduleLevels, tenant_capsule: 15 }
    };

    expect(getActiveResidentStory(state)).toBeNull();
  });

  it('checkResidentStories grants comfort and marks story as completed', () => {
    const state = {
      ...createInitialState(1_000),
      unlockedResidents: ['sleepy_engineer' as const],
      moduleLevels: { ...createInitialState(1_000).moduleLevels, tenant_capsule: 15 },
      comfort: 5
    };

    const result = checkResidentStories(state);

    expect(result.comfort).toBe(7); // 5 + 2 reward
    expect(result.completedStories).toContain('engineer_quiet_capsule');
  });

  it('checkResidentStories does not re-complete already completed stories', () => {
    const state = {
      ...createInitialState(1_000),
      unlockedResidents: ['sleepy_engineer' as const],
      moduleLevels: { ...createInitialState(1_000).moduleLevels, tenant_capsule: 20 },
      comfort: 5,
      completedStories: ['engineer_quiet_capsule' as const]
    };

    const result = checkResidentStories(state);

    expect(result.comfort).toBe(5); // no change
    expect(result.completedStories).toHaveLength(1);
  });

  it('checkResidentStories returns state unchanged when no stories are ready', () => {
    const state = {
      ...createInitialState(1_000),
      unlockedResidents: ['sleepy_engineer' as const],
      moduleLevels: { ...createInitialState(1_000).moduleLevels, tenant_capsule: 12 }
    };

    const result = checkResidentStories(state);

    expect(result).toBe(state);
  });

  it('auto-completes stories through buyModuleLevel (economy integration)', () => {
    // Start with sleepy_engineer unlocked and capsule at level 14.
    let state: GameState = {
      ...createInitialState(1_000),
      credits: 1_000_000_000,
      unlockedResidents: ['sleepy_engineer' as const]
    };

    // Buy levels up to 15 (the requiredLevel for engineer_quiet_capsule).
    for (let i = 0; i < 15; i += 1) {
      state = buyModuleLevel(state, 'tenant_capsule');
    }

    expect(state.completedStories).toContain('engineer_quiet_capsule');
    expect(state.comfort).toBeGreaterThan(0);
  });

  it('defines stories for at least 6 residents', () => {
    expect(residentStories.length).toBeGreaterThanOrEqual(6);
  });

  it('every story has triggerLevel < requiredLevel', () => {
    for (const story of residentStories) {
      expect(story.triggerLevel).toBeLessThan(story.requiredLevel);
    }
  });

  it('every story has a positive comfort reward', () => {
    for (const story of residentStories) {
      expect(story.rewardComfort).toBeGreaterThan(0);
    }
  });

  it('cosmonaut_warm_start triggers after first prestige (retired_cosmonaut unlocks)', () => {
    let state = {
      ...createInitialState(1_000),
      credits: 1_000_000_000,
      totalEarnedCredits: 400_000
    };
    // Buy capsule to level 1 so resident can unlock.
    state = buyModuleLevel(state, 'tenant_capsule');
    // Prestige — retired_cosmonaut auto-unlocks.
    state = performPrestige(state, 2_000);

    // After prestige, capsule resets to 0, but story should not trigger
    // because capsule level is 0 < triggerLevel (1).
    // Buy capsule back to level 1.
    state = buyModuleLevel(state, 'tenant_capsule');

    const story = getActiveResidentStory(state);

    // cosmonaut_warm_start triggers at level 1, requires level 10.
    expect(story?.id).toBe('cosmonaut_warm_start');
  });
});
