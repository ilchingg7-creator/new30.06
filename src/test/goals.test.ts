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
    expect(isGoalEligible('unlock_kitchen', { ...state, credits: 75 })).toBe(true);
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
});
