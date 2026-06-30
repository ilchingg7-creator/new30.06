import { modules } from './content/modules';
import type { GameState } from './types';

/**
 * Current save schema version. Bump when an incompatible change is made to
 * GameState and add a migration in `migrateGameState`. Saves with a version
 * higher than CURRENT are rejected (forward-incompatible) to avoid corrupting
 * newer saves when a user rolls back to an older client.
 */
export const CURRENT_SCHEMA_VERSION = 2;
export const SAVE_KEY = 'cosmic-communalka-save-v2';

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

/**
 * Pre-versioned saves (no schemaVersion field) are treated as version 1.
 * They predate cosmetics, prestige upgrades, daily login and achievements.
 * The v1->v2 migration backfills the optional fields with their defaults so
 * the rest of the app sees a fully-shaped state.
 */
function migrateV1ToV2(value: UnknownRecord): UnknownRecord {
  return {
    ...value,
    schemaVersion: 2,
    windowLightColor: value.windowLightColor ?? 'amber',
    purchasedPrestigeUpgrades: value.purchasedPrestigeUpgrades ?? [],
    lastLoginDay: value.lastLoginDay,
    dailyStreak: value.dailyStreak,
    unlockedAchievements: value.unlockedAchievements ?? []
  };
}

/**
 * Apply the chain of migrations to bring a parsed save up to CURRENT_SCHEMA_VERSION.
 * Each migration takes a record and returns a record one version higher.
 * Unknown/missing fields are tolerated here; strict validation happens after.
 */
function migrateGameState(value: UnknownRecord): UnknownRecord {
  let current = value;
  const startVersion = typeof current.schemaVersion === 'number' ? current.schemaVersion : 1;

  if (startVersion < 2) {
    current = migrateV1ToV2(current);
  }

  // Future migrations (2 -> 3, 3 -> 4, ...) go here.

  return current;
}

function isGameStateShape(value: unknown): value is GameState {
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
  return JSON.stringify({ ...state, schemaVersion: CURRENT_SCHEMA_VERSION });
}

export function parseGameState(raw: string | null): GameState | null {
  if (raw === null) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!isRecord(parsed)) {
      return null;
    }

    const declaredVersion = typeof parsed.schemaVersion === 'number' ? parsed.schemaVersion : 1;

    // Reject saves from a newer client to avoid silent data loss.
    if (declaredVersion > CURRENT_SCHEMA_VERSION) {
      return null;
    }

    const migrated = migrateGameState(parsed);

    return isGameStateShape(migrated) ? (migrated as GameState) : null;
  } catch {
    return null;
  }
}
