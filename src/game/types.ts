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
 * Each step corresponds to 10 module levels and swaps the room artwork to
 * a richer version — the whole image changes, not just an added layer.
 */
export type RoomDetailLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/**
 * Programmatic animation applied to the whole room sprite via the PixiJS
 * ticker. Cheap, consistent, no frame-by-frame art needed.
 */
export interface RoomSpriteAnimation {
  kind: 'bob' | 'pulse' | 'flicker';
  amplitude: number;
  speed: number;
  axis?: 'x' | 'y';
}

/**
 * One full-room artwork at a specific detail level. The sprite replaces
 * the entire room image when the module reaches `unlockLevel`. The room
 * stays the same room (e.g. kitchen stays kitchen) — only the richness
 * of detail grows.
 */
export interface RoomSpriteVariant {
  /** Detail level (1..10) this artwork represents. 0 = locked (no sprite). */
  detailLevel: RoomDetailLevel;
  /** Module level at which this artwork appears (1, 10, 20, ..., 100). */
  unlockLevel: number;
  texture: string;
  /** Optional whole-room animation (e.g. gentle bob, ambient pulse). */
  animation?: RoomSpriteAnimation;
}

export interface VisitorRequest {
  id: string;
  name: string;
  flavor: string;
  cost: number;
  rewardComfort: number;
  expiresAt: number;
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
  /**
   * Save schema version. Injected by `serializeGameState` and validated by
   * `parseGameState`. Not set on fresh in-memory states created by
   * `createInitialState`; it only appears on serialized/parsed states.
   */
  schemaVersion?: number;
}
