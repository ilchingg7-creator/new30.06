import { describe, expect, it } from 'vitest';
import { createInitialState } from '../game/economy';
import { completeEligibleGoals, getVisibleGoals, isGoalEligible } from '../game/goals';
import type { GameState } from '../game/types';

function withCapsuleLevel(level: number): GameState {
  return {
    ...createInitialState(1_000),
    moduleLevels: {
      ...createInitialState(1_000).moduleLevels,
      tenant_capsule: level
    }
  };
}

describe('goal completion', () => {
  it('detects eligible goals from game state', () => {
    const state = withCapsuleLevel(10);

    expect(isGoalEligible('buy_capsule_10', state)).toBe(true);
    expect(isGoalEligible('unlock_kitchen', { ...state, credits: 75 })).toBe(false);
    expect(isGoalEligible('unlock_kitchen', {
      ...state,
      moduleLevels: {
        ...state.moduleLevels,
        cosmo_kitchen: 1
      }
    })).toBe(true);
  });

  it('completes eligible goals once without adding credits', () => {
    const eligible = withCapsuleLevel(10);
    const completed = completeEligibleGoals(eligible);
    const completedAgain = completeEligibleGoals(completed);

    expect(completed.completedGoals).toContain('buy_capsule_10');
    expect(completed.credits).toBe(eligible.credits);
    expect(completed.comfort).toBe(eligible.comfort + 1);
    expect(completedAgain.completedGoals).toEqual(completed.completedGoals);
    expect(completedAgain.comfort).toBe(completed.comfort);
  });

  it('excludes completed goals from the visible active list', () => {
    const completed = completeEligibleGoals(withCapsuleLevel(10));
    const visible = getVisibleGoals(completed, 4).map((goal) => goal.id);

    expect(visible).not.toContain('buy_capsule_10');
    expect(visible).toHaveLength(4);
  });

  it('shows a new goal list after the first renovation', () => {
    const visible = getVisibleGoals({ ...createInitialState(1_000), prestigeCount: 1 }, 4).map((goal) => goal.id);

    expect(visible).toEqual(['rebuild_capsule_10', 'reopen_kitchen', 'unlock_laundry_after_renovation', 'reach_comfort_40']);
  });

  it('shows later-cycle goals after the second renovation and beyond', () => {
    const secondCycle = getVisibleGoals({ ...createInitialState(1_000), prestigeCount: 2 }, 4).map((goal) => goal.id);
    const laterCycle = getVisibleGoals({ ...createInitialState(1_000), prestigeCount: 5 }, 4).map((goal) => goal.id);

    expect(secondCycle).toEqual(['rebuild_capsule_25', 'unlock_teleport_entry', 'unlock_five_residents', 'reach_comfort_60']);
    expect(laterCycle).toEqual(secondCycle);
  });

  it('does not complete future renovation-cycle goals before their cycle is active', () => {
    const completed = completeEligibleGoals({
      ...createInitialState(1_000),
      moduleLevels: {
        ...createInitialState(1_000).moduleLevels,
        tenant_capsule: 25,
        cosmo_kitchen: 1,
        zero_g_laundry: 1
      },
      comfort: 80,
      unlockedResidents: ['sleepy_engineer', 'mist_cook', 'vacuum_gardener', 'sock_master', 'teleport_courier']
    });

    expect(completed.completedGoals).toContain('buy_capsule_10');
    expect(completed.completedGoals).not.toContain('rebuild_capsule_10');
    expect(completed.completedGoals).not.toContain('rebuild_capsule_25');
  });

  it('applies temporary boost goal rewards once', () => {
    const eligible = {
      ...createInitialState(1_000),
      totalEarnedCredits: 10_000
    };
    const completed = completeEligibleGoals(eligible, 50_000);
    const completedAgain = completeEligibleGoals(completed, 100_000);

    expect(completed.completedGoals).toContain('earn_credits_10000');
    expect(completed.timedBonuses).toContainEqual({
      id: 'goal_earn_credits_10000',
      incomeMultiplier: 1.15,
      expiresAt: 350_000
    });
    expect(completedAgain.timedBonuses).toEqual(completed.timedBonuses);
  });

  it('applies visual detail goal rewards once', () => {
    const eligible = {
      ...createInitialState(1_000),
      unlockedResidents: ['sleepy_engineer', 'mist_cook', 'vacuum_gardener'] as GameState['unlockedResidents']
    };
    const completed = completeEligibleGoals(eligible);
    const completedAgain = completeEligibleGoals(completed);

    expect(completed.completedGoals).toContain('unlock_three_residents');
    expect(completed.unlockedIncidentVisuals).toContain('table_schedule_01');
    expect(completedAgain.unlockedIncidentVisuals).toEqual(completed.unlockedIncidentVisuals);
  });
});
