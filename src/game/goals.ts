import { goals } from './content/goals';
import { modules } from './content/modules';
import type { GameState, GoalDefinition, GoalId, ModuleId } from './types';

function getModuleUnlockCredits(moduleId: ModuleId): number {
  const module = modules.find((item) => item.id === moduleId);

  if (!module) {
    throw new Error(`Unknown module: ${moduleId}`);
  }

  return module.unlockAtCredits;
}

export function isGoalEligible(goalId: GoalId, state: GameState): boolean {
  switch (goalId) {
    case 'buy_capsule_10':
      return state.moduleLevels.tenant_capsule >= 10;
    case 'unlock_kitchen':
      return state.moduleLevels.cosmo_kitchen > 0 || state.credits >= getModuleUnlockCredits('cosmo_kitchen');
    case 'reach_comfort_25':
      return state.comfort >= 25;
    case 'earn_credits_10000':
      return state.totalEarnedCredits >= 10_000;
    case 'unlock_three_residents':
      return state.unlockedResidents.length >= 3;
    case 'unlock_panorama_dome':
      return state.moduleLevels.panorama_dome > 0 || state.credits >= getModuleUnlockCredits('panorama_dome');
    case 'first_renovation':
      return state.reputation > 0;
  }
}

export function completeEligibleGoals(state: GameState): GameState {
  return goals.reduce((current, goal) => {
    if (current.completedGoals.includes(goal.id) || !isGoalEligible(goal.id, current)) {
      return current;
    }

    return {
      ...current,
      comfort: current.comfort + goal.rewardComfort,
      completedGoals: [...current.completedGoals, goal.id]
    };
  }, state);
}

export function getVisibleGoals(state: GameState, limit = 4): GoalDefinition[] {
  return goals.filter((goal) => !state.completedGoals.includes(goal.id)).slice(0, limit);
}
