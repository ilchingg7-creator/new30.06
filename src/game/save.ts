import { modules } from './content/modules';
import type { GameState } from './types';

export const SAVE_KEY = 'cosmic-communalka-save-v1';

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function hasValidModuleLevels(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  return modules.every((module) => isNumber(value[module.id]));
}

function hasValidTimedBonuses(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.every((bonus) => {
      return (
        isRecord(bonus) &&
        typeof bonus.id === 'string' &&
        isNumber(bonus.incomeMultiplier) &&
        isNumber(bonus.expiresAt)
      );
    })
  );
}

const VALID_WINDOW_LIGHT_COLORS = new Set(['amber', 'green', 'red', 'blue']);
const VALID_PRESTIGE_UPGRADE_IDS = new Set([
  'residents_survive',
  'starting_comfort',
  'higher_offline_cap'
]);

const VALID_ACHIEVEMENT_IDS = new Set([
  'first_purchase',
  'ten_module_levels',
  'fifty_module_levels',
  'first_prestige',
  'comfort_50',
  'credits_million',
  'all_rooms_unlocked',
  'daily_streak_7'
]);

function hasOptionalWindowLightColor(value: unknown): boolean {
  return value === undefined || (typeof value === 'string' && VALID_WINDOW_LIGHT_COLORS.has(value));
}

function hasOptionalPrestigeUpgrades(value: unknown): boolean {
  if (value === undefined) {
    return true;
  }

  return isStringArray(value) && value.every((id) => VALID_PRESTIGE_UPGRADE_IDS.has(id));
}

function hasOptionalAchievements(value: unknown): boolean {
  if (value === undefined) {
    return true;
  }

  return isStringArray(value) && value.every((id) => VALID_ACHIEVEMENT_IDS.has(id));
}

function hasOptionalNumber(value: unknown): boolean {
  return value === undefined || isNumber(value);
}

function isGameState(value: unknown): value is GameState {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isNumber(value.credits) &&
    isNumber(value.totalEarnedCredits) &&
    isNumber(value.comfort) &&
    isNumber(value.reputation) &&
    hasValidModuleLevels(value.moduleLevels) &&
    isStringArray(value.completedGoals) &&
    isStringArray(value.unlockedResidents) &&
    hasValidTimedBonuses(value.timedBonuses) &&
    isNumber(value.lastSavedAt) &&
    hasOptionalWindowLightColor(value.windowLightColor) &&
    hasOptionalPrestigeUpgrades(value.purchasedPrestigeUpgrades) &&
    hasOptionalNumber(value.lastLoginDay) &&
    hasOptionalNumber(value.dailyStreak) &&
    hasOptionalAchievements(value.unlockedAchievements)
  );
}

export function serializeGameState(state: GameState): string {
  return JSON.stringify(state);
}

export function parseGameState(raw: string | null): GameState | null {
  if (raw === null) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    return isGameState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
