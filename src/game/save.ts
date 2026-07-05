import { stationIncidents } from './content/stationIncidents';
import { modules } from './content/modules';
import type { GameState } from './types';

/**
 * Current save schema version. Bump when an incompatible change is made to
 * GameState and add a migration in `migrateGameState`. Saves with a version
 * higher than CURRENT are rejected (forward-incompatible) to avoid corrupting
 * newer saves when a user rolls back to an older client.
 */
export const CURRENT_SCHEMA_VERSION = 3;
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

  // All existing module levels must be valid numbers. New modules added
  // after the save was created will be missing — they default to 0
  // via `createEmptyModuleLevels` merge in the migration path.
  return modules.every((module) => isNumber(value[module.id]) || value[module.id] === undefined);
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
  'higher_offline_cap',
  'warm_start_credits',
  'capsule_head_start',
  'offline_cap_16h',
  'first_room_discount',
  'reputation_income',
  'visitor_comfort_bonus',
  'starting_comfort_plus',
  'maintenance_drones'
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

const VALID_STORY_IDS = new Set([
  'engineer_quiet_capsule',
  'cook_working_kitchen',
  'gardener_first_plant',
  'sock_master_laundry_upgrade',
  'courier_teleport_traffic',
  'cosmonaut_warm_start'
]);

const VALID_STATION_INCIDENT_IDS: Set<string> = new Set(stationIncidents.map((incident) => incident.id));
const VALID_INCIDENT_VISUAL_PLACEHOLDER_IDS: Set<string> = new Set(
  stationIncidents.flatMap((incident) =>
    incident.choices.flatMap((choice) => choice.effects.visualPlaceholderIds ?? [])
  )
);

const VALID_RESIDENT_IDS = new Set([
  'sleepy_engineer',
  'mist_cook',
  'vacuum_gardener',
  'sock_master',
  'teleport_courier',
  'vip_astroteenant',
  'retired_cosmonaut',
  'three_eyed_housekeeper',
  'comet_plumber',
  'signal_radio_host',
  'floating_librarian',
  'tiny_saucer_family'
]);

const VALID_COMMUNAL_DUTY_IDS = new Set([
  'capsule_quiet_hours',
  'kitchen_soup_escape',
  'garden_vacuum_sprout',
  'laundry_sock_orbit'
]);

const VALID_COMMUNAL_DUTY_STATUSES = new Set(['available', 'in_progress', 'ready_to_claim']);

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

function hasOptionalStories(value: unknown): boolean {
  if (value === undefined) {
    return true;
  }

  return isStringArray(value) && value.every((id) => VALID_STORY_IDS.has(id));
}

function hasOptionalActiveIncidents(value: unknown): boolean {
  if (value === undefined) {
    return true;
  }

  return (
    Array.isArray(value) &&
    value.every((incident) => {
      return (
        isRecord(incident) &&
        typeof incident.id === 'string' &&
        VALID_STATION_INCIDENT_IDS.has(incident.id) &&
        isNumber(incident.queuedAt) &&
        typeof incident.isNew === 'boolean'
      );
    })
  );
}

function hasOptionalIncidentIds(value: unknown): boolean {
  if (value === undefined) {
    return true;
  }

  return isStringArray(value) && value.every((id) => VALID_STATION_INCIDENT_IDS.has(id));
}

function hasOptionalIncidentVisuals(value: unknown): boolean {
  if (value === undefined) {
    return true;
  }

  return isStringArray(value) && value.every((id) => VALID_INCIDENT_VISUAL_PLACEHOLDER_IDS.has(id));
}

function hasOptionalNumber(value: unknown): boolean {
  return value === undefined || isNumber(value);
}

function hasOptionalRoomConditions(value: unknown): boolean {
  if (value === undefined) {
    return true;
  }

  if (!isRecord(value)) {
    return false;
  }

  return Object.values(value).every((v) => isNumber(v));
}

function isValidModuleId(value: unknown): boolean {
  return typeof value === 'string' && modules.some((module) => module.id === value);
}

function hasOptionalCommunalDuty(value: unknown): boolean {
  if (value === undefined) {
    return true;
  }

  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.dutyId === 'string' &&
    VALID_COMMUNAL_DUTY_IDS.has(value.dutyId) &&
    isValidModuleId(value.roomId) &&
    typeof value.status === 'string' &&
    VALID_COMMUNAL_DUTY_STATUSES.has(value.status) &&
    isNumber(value.createdAt) &&
    hasOptionalNumber(value.startedAt) &&
    hasOptionalNumber(value.completesAt) &&
    (
      value.assignedResidentId === undefined ||
      (typeof value.assignedResidentId === 'string' && VALID_RESIDENT_IDS.has(value.assignedResidentId))
    )
  );
}

function hasOptionalConditionRepair(value: unknown): boolean {
  if (value === undefined) {
    return true;
  }

  if (!isRecord(value)) {
    return false;
  }

  return Object.entries(value).every(([moduleId, repair]) => isValidModuleId(moduleId) && isNumber(repair));
}

function hasOptionalCommunalDutyResult(value: unknown): boolean {
  if (value === undefined) {
    return true;
  }

  return (
    isRecord(value) &&
    typeof value.dutyId === 'string' &&
    VALID_COMMUNAL_DUTY_IDS.has(value.dutyId) &&
    typeof value.residentId === 'string' &&
    VALID_RESIDENT_IDS.has(value.residentId) &&
    isValidModuleId(value.roomId) &&
    isNumber(value.comfortGain) &&
    hasOptionalConditionRepair(value.conditionRepair) &&
    typeof value.resultKey === 'string' &&
    isNumber(value.claimedAt)
  );
}

const VALID_WEEKLY_REPAIR_TASK_KINDS = new Set(['repair_room', 'buy_levels', 'reach_condition']);

/**
 * Validate the optional `activeVisitor` field. Accepts `null` (no active
 * visitor) or a record with the numeric `cost`, `rewardComfort` and
 * `expiresAt` fields a VisitorRequest needs to function in the UI.
 */
function hasOptionalActiveVisitor(value: unknown): boolean {
  if (value === undefined || value === null) {
    return true;
  }

  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.flavor === 'string' &&
    isNumber(value.cost) &&
    isNumber(value.rewardComfort) &&
    isNumber(value.expiresAt) &&
    (value.template === undefined || typeof value.template === 'string')
  );
}

/**
 * Validate the optional `weeklyRepair` event state. Requires the numeric
 * `startedAt`/`expiresAt` timestamps, a boolean `bonusClaimed` flag, and a
 * `tasks` array whose entries each match the WeeklyRepairTask shape.
 */
function hasOptionalWeeklyRepair(value: unknown): boolean {
  if (value === undefined) {
    return true;
  }

  if (!isRecord(value)) {
    return false;
  }

  if (
    !isNumber(value.startedAt) ||
    !isNumber(value.expiresAt) ||
    typeof value.bonusClaimed !== 'boolean' ||
    !Array.isArray(value.tasks)
  ) {
    return false;
  }

  return value.tasks.every((task) => {
    if (!isRecord(task)) {
      return false;
    }

    return (
      typeof task.id === 'string' &&
      typeof task.kind === 'string' &&
      VALID_WEEKLY_REPAIR_TASK_KINDS.has(task.kind) &&
      isValidModuleId(task.roomId) &&
      isNumber(task.target) &&
      isNumber(task.progress) &&
      typeof task.completed === 'boolean' &&
      isNumber(task.rewardComfort)
    );
  });
}

function createDefaultModuleLevels(): Record<string, number> {
  return Object.fromEntries(modules.map((module) => [module.id, 0]));
}

function backfillModuleLevels(value: UnknownRecord): UnknownRecord {
  if (!isRecord(value.moduleLevels)) {
    return value;
  }

  return {
    ...value,
    moduleLevels: {
      ...createDefaultModuleLevels(),
      ...value.moduleLevels
    }
  };
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

function migrateV2ToV3(value: UnknownRecord): UnknownRecord {
  return {
    ...value,
    schemaVersion: 3,
    activeIncidents: value.activeIncidents ?? [],
    completedIncidents: value.completedIncidents ?? [],
    unlockedIncidentVisuals: value.unlockedIncidentVisuals ?? []
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

  if (startVersion < 3) {
    current = migrateV2ToV3(current);
  }

  return backfillModuleLevels(current);
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
    hasOptionalAchievements(value.unlockedAchievements) &&
    hasOptionalStories(value.completedStories) &&
    hasOptionalActiveIncidents(value.activeIncidents) &&
    hasOptionalIncidentIds(value.completedIncidents) &&
    hasOptionalIncidentVisuals(value.unlockedIncidentVisuals) &&
    hasOptionalRoomConditions(value.roomConditions) &&
    hasOptionalCommunalDuty(value.communalDuty) &&
    hasOptionalNumber(value.lastCommunalDutyResolvedAt) &&
    hasOptionalCommunalDutyResult(value.lastCommunalDutyResult) &&
    hasOptionalNumber(value.totalPlaySeconds) &&
    hasOptionalNumber(value.totalModulesBought) &&
    hasOptionalNumber(value.prestigeCount) &&
    hasOptionalActiveVisitor(value.activeVisitor) &&
    hasOptionalWeeklyRepair(value.weeklyRepair)
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
