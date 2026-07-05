import { goals } from './content/goals';
import { getTimedBonusDurationMultiplier } from './residents';
import type { GameState, GoalDefinition, GoalId, TimedBonus, VisualPlaceholderId } from './types';

export function isGoalEligible(goalId: GoalId, state: GameState): boolean {
  switch (goalId) {
    case 'buy_capsule_10':
    case 'rebuild_capsule_10':
      return state.moduleLevels.tenant_capsule >= 10;
    case 'unlock_kitchen':
    case 'reopen_kitchen':
      return state.moduleLevels.cosmo_kitchen > 0;
    case 'reach_comfort_25':
      return state.comfort >= 25;
    case 'earn_credits_10000':
      return state.totalEarnedCredits >= 10_000;
    case 'unlock_three_residents':
      return state.unlockedResidents.length >= 3;
    case 'unlock_panorama_dome':
      return state.moduleLevels.panorama_dome > 0;
    case 'first_renovation':
      return state.reputation > 0;
    case 'unlock_laundry_after_renovation':
      return state.moduleLevels.zero_g_laundry > 0;
    case 'reach_comfort_40':
      return state.comfort >= 40;
    case 'earn_credits_50000':
      return state.totalEarnedCredits >= 50_000;
    case 'second_renovation':
      return (state.prestigeCount ?? 0) >= 2;
    case 'rebuild_capsule_25':
      return state.moduleLevels.tenant_capsule >= 25;
    case 'unlock_teleport_entry':
      return state.moduleLevels.teleport_entry > 0;
    case 'unlock_five_residents':
      return state.unlockedResidents.length >= 5;
    case 'reach_comfort_60':
      return state.comfort >= 60;
    case 'earn_credits_100000':
      return state.totalEarnedCredits >= 100_000;
    case 'repeat_renovation':
      return (state.prestigeCount ?? 0) >= 3;
    case 'reach_comfort_80':
      return state.comfort >= 80;
    case 'unlock_seven_residents':
      return state.unlockedResidents.length >= 7;
    case 'earn_credits_500000':
      return state.totalEarnedCredits >= 500_000;
    case 'unlock_orbital_library':
      return state.moduleLevels.orbital_library > 0;
    case 'reach_capsule_50':
      return state.moduleLevels.tenant_capsule >= 50;
    case 'third_renovation':
      return (state.prestigeCount ?? 0) >= 4;
  }
}

function addUnique<T extends string>(current: T[] | undefined, next: T[]): T[] {
  return Array.from(new Set([...(current ?? []), ...next]));
}

function applyGoalReward(state: GameState, goal: GoalDefinition, now: number): GameState {
  const visualIds = goal.rewardVisualPlaceholderIds ?? [];
  const timedBonuses: TimedBonus[] = goal.rewardTimedBonus
    ? [
        ...state.timedBonuses,
        {
          id: goal.rewardTimedBonus.id,
          incomeMultiplier: goal.rewardTimedBonus.incomeMultiplier,
          expiresAt: now + Math.floor(goal.rewardTimedBonus.durationMs * getTimedBonusDurationMultiplier(state))
        }
      ]
    : state.timedBonuses;

  return {
    ...state,
    comfort: state.comfort + goal.rewardComfort,
    timedBonuses,
    unlockedIncidentVisuals: visualIds.length > 0
      ? addUnique<VisualPlaceholderId>(state.unlockedIncidentVisuals, visualIds)
      : state.unlockedIncidentVisuals,
    completedGoals: [...state.completedGoals, goal.id]
  };
}

export function completeEligibleGoals(state: GameState, now = Date.now()): GameState {
  return getGoalsForCurrentCycle(state).reduce((current, goal) => {
    if (current.completedGoals.includes(goal.id) || !isGoalEligible(goal.id, current)) {
      return current;
    }

    return applyGoalReward(current, goal, now);
  }, state);
}

export function getGoalRenovationCycle(state: GameState): GoalDefinition['renovationCycle'] {
  return Math.min(state.prestigeCount ?? 0, 3) as GoalDefinition['renovationCycle'];
}

export function getGoalsForCurrentCycle(state: GameState): GoalDefinition[] {
  const cycle = getGoalRenovationCycle(state);

  return goals.filter((goal) => goal.renovationCycle === cycle);
}

export function getVisibleGoals(state: GameState, limit = 4): GoalDefinition[] {
  return getGoalsForCurrentCycle(state).filter((goal) => !state.completedGoals.includes(goal.id)).slice(0, limit);
}
