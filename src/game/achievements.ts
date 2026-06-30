import { achievements } from './content/achievements';
import { modules } from './content/modules';
import type { AchievementId, GameState } from './types';

function getTotalModuleLevels(state: GameState): number {
  return modules.reduce((sum, module) => sum + state.moduleLevels[module.id], 0);
}

function hasAllRoomsUnlocked(state: GameState): boolean {
  return modules.every((module) => state.moduleLevels[module.id] > 0);
}

export function isAchievementUnlocked(achievementId: AchievementId, state: GameState): boolean {
  switch (achievementId) {
    case 'first_purchase':
      return getTotalModuleLevels(state) >= 1;
    case 'ten_module_levels':
      return getTotalModuleLevels(state) >= 10;
    case 'fifty_module_levels':
      return getTotalModuleLevels(state) >= 50;
    case 'first_prestige':
      return state.reputation > 0;
    case 'comfort_50':
      return state.comfort >= 50;
    case 'credits_million':
      return state.totalEarnedCredits >= 1_000_000;
    case 'all_rooms_unlocked':
      return hasAllRoomsUnlocked(state);
    case 'daily_streak_7':
      return (state.dailyStreak ?? 0) >= 7;
  }
}

export function checkAchievements(state: GameState): GameState {
  const owned = new Set(state.unlockedAchievements ?? []);
  let changed = false;

  for (const achievement of achievements) {
    if (owned.has(achievement.id)) {
      continue;
    }

    if (isAchievementUnlocked(achievement.id, state)) {
      owned.add(achievement.id);
      changed = true;
    }
  }

  if (!changed) {
    return state;
  }

  return {
    ...state,
    unlockedAchievements: Array.from(owned)
  };
}
