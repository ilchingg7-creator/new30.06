export type ModuleId =
  | 'tenant_capsule'
  | 'cosmo_kitchen'
  | 'oxygen_garden'
  | 'zero_g_laundry'
  | 'teleport_entry'
  | 'antigrav_gym'
  | 'panorama_dome'
  | 'saucer_dock'
  | 'radiator_balcony'
  | 'mail_tube_office';

export type ResidentId =
  | 'sleepy_engineer'
  | 'mist_cook'
  | 'vacuum_gardener'
  | 'sock_master'
  | 'teleport_courier'
  | 'vip_astroteenant'
  | 'retired_cosmonaut'
  | 'three_eyed_housekeeper';

export type GoalId =
  | 'buy_capsule_10'
  | 'unlock_kitchen'
  | 'reach_comfort_25'
  | 'earn_credits_10000'
  | 'unlock_three_residents'
  | 'unlock_panorama_dome'
  | 'first_renovation';

export interface ModuleDefinition {
  id: ModuleId;
  name: string;
  role: string;
  baseCost: number;
  baseIncomePerSecond: number;
  comfortBonus: number;
  unlockAtCredits: number;
  visualKey: string;
}

export interface ResidentDefinition {
  id: ResidentId;
  name: string;
  unlockText: string;
  bonusText: string;
  requiredModule?: ModuleId;
  requiredModuleLevel?: number;
  requiredComfort?: number;
}

export type WindowLightColor = 'amber' | 'green' | 'red' | 'blue';

/**
 * Granular room detail level: 0 (locked) through 10 (complete, level 100+).
 * Each step corresponds to 10 module levels and adds more Graphics detail
 * to the room scene. Used by the hardcoded PixiJS room renderer.
 */
export type RoomDetailLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface VisitorRequest {
  id: string;
  name: string;
  flavor: string;
  cost: number;
  rewardComfort: number;
  expiresAt: number;
  template?: string;
}

/**
 * Identifies a resident story — a state-derived cozy-comedy moment where a
 * resident asks the player to improve their room or station. Each story
 * fires once per save (tracked in `completedStories`).
 */
export type ResidentStoryId =
  | 'engineer_quiet_capsule'
  | 'cook_working_kitchen'
  | 'gardener_first_plant'
  | 'sock_master_laundry_upgrade'
  | 'courier_teleport_traffic'
  | 'cosmonaut_warm_start';

/**
 * A resident story definition. The story becomes active when:
 * 1. The resident is unlocked.
 * 2. The story is not in `completedStories`.
 * 3. The trigger condition is met (e.g. room level >= triggerLevel).
 *
 * The story completes when the requirement is met (e.g. room level >=
 * requiredLevel). The reward is comfort + flavor.
 */
export interface ResidentStoryDefinition {
  id: ResidentStoryId;
  residentId: ResidentId;
  /** Room the story is tied to (for visual focus). */
  roomId: ModuleId;
  /** Room level at which the story triggers (resident notices a problem). */
  triggerLevel: number;
  /** Room level required to complete the story. */
  requiredLevel: number;
  /** Comfort reward on completion. */
  rewardComfort: number;
}

/** An active resident story instance (derived from GameState, not persisted). */
export interface ActiveResidentStory {
  id: ResidentStoryId;
  residentId: ResidentId;
  roomId: ModuleId;
  currentLevel: number;
  requiredLevel: number;
  rewardComfort: number;
}

export type AchievementId =
  | 'first_purchase'
  | 'ten_module_levels'
  | 'fifty_module_levels'
  | 'first_prestige'
  | 'comfort_50'
  | 'credits_million'
  | 'all_rooms_unlocked'
  | 'daily_streak_7';

export interface AchievementDefinition {
  id: AchievementId;
  title: string;
  description: string;
}

export type PrestigeUpgradeId =
  | 'residents_survive'
  | 'starting_comfort'
  | 'higher_offline_cap';

export interface PrestigeUpgradeDefinition {
  id: PrestigeUpgradeId;
  name: string;
  description: string;
  reputationCost: number;
}

export type GoalRewardKind = 'comfort' | 'visual_detail' | 'temporary_boost' | 'prestige_hint';

export interface GoalDefinition {
  id: GoalId;
  title: string;
  rewardComfort: number;
  rewardKind: GoalRewardKind;
  rewardLabel: string;
}

export type ModuleLevels = Record<ModuleId, number>;

export interface TimedBonus {
  id: string;
  incomeMultiplier: number;
  expiresAt: number;
}

export interface GameState {
  credits: number;
  totalEarnedCredits: number;
  comfort: number;
  reputation: number;
  moduleLevels: ModuleLevels;
  completedGoals: GoalId[];
  unlockedResidents: ResidentId[];
  timedBonuses: TimedBonus[];
  lastSavedAt: number;
  windowLightColor?: WindowLightColor;
  purchasedPrestigeUpgrades?: PrestigeUpgradeId[];
  lastLoginDay?: number;
  dailyStreak?: number;
  unlockedAchievements?: AchievementId[];
  /** Total seconds played across all sessions (accumulated by the tick loop). */
  totalPlaySeconds?: number;
  /** Total module levels purchased across all sessions. */
  totalModulesBought?: number;
  /** Number of prestige renovations performed. */
  prestigeCount?: number;
  /** Active visitor request, if any. Cleared on accept/decline/expire. */
  activeVisitor?: VisitorRequest | null;
  /** Completed resident story IDs. Each story fires once per save. */
  completedStories?: ResidentStoryId[];
  /**
   * Room condition values (0-100) keyed by ModuleId. Condition decays over
   * time; clicking the room repairs it. High condition gives an income
   * multiplier; low condition shows visual problems in the scene.
   */
  roomConditions?: Partial<Record<ModuleId, number>>;
  /**
   * Save schema version. Injected by `serializeGameState` and validated by
   * `parseGameState`. Not set on fresh in-memory states created by
   * `createInitialState`; it only appears on serialized/parsed states.
   */
  schemaVersion?: number;
}
