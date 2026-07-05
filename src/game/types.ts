// ── Weekly Repair Event ──────────────────────────────────────────

export type WeeklyRepairTaskKind = 'repair_room' | 'buy_levels' | 'reach_condition';

export interface WeeklyRepairTask {
  id: string;
  kind: WeeklyRepairTaskKind;
  roomId: ModuleId;
  /** For repair_room: target condition. For buy_levels: levels to buy. For reach_condition: target condition. */
  target: number;
  /** Current progress (0..target). */
  progress: number;
  completed: boolean;
  /** Reward comfort for completing this task. */
  rewardComfort: number;
}

export interface WeeklyRepairState {
  /** Epoch ms when the current event started. */
  startedAt: number;
  /** Epoch ms when the event expires (7 days after startedAt). */
  expiresAt: number;
  /** Tasks for this week. */
  tasks: WeeklyRepairTask[];
  /** Whether the player claimed the completion bonus. */
  bonusClaimed: boolean;
}

// ── Core Types ───────────────────────────────────────────────────

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
  | 'mail_tube_office'
  | 'meteorite_pantry'
  | 'shared_observatory'
  | 'comet_water_tank'
  | 'orbital_library';

export type ResidentId =
  | 'sleepy_engineer'
  | 'mist_cook'
  | 'vacuum_gardener'
  | 'sock_master'
  | 'teleport_courier'
  | 'vip_astroteenant'
  | 'retired_cosmonaut'
  | 'three_eyed_housekeeper'
  | 'comet_plumber'
  | 'signal_radio_host'
  | 'floating_librarian'
  | 'tiny_saucer_family';

export type ResidentRole = 'income' | 'comfort' | 'maintenance' | 'visitor' | 'renovation';

export interface ResidentRoleProfile {
  primary: ResidentRole;
  secondary?: ResidentRole;
}

export type ResidentRoleTotals = Record<ResidentRole, number>;

export type ActionPreviewTag =
  | 'income'
  | 'comfort'
  | 'condition'
  | 'resident'
  | 'role'
  | 'visual'
  | 'renovation'
  | 'timed_bonus'
  | 'cost';

export type ActionPreviewTone = 'neutral' | 'positive' | 'warning';

export interface ActionPreview {
  title: string;
  reason?: string;
  result: string;
  tags: ActionPreviewTag[];
  tone?: ActionPreviewTone;
}

export interface LastActionFeedback {
  title: string;
  detail: string;
  tags: ActionPreviewTag[];
}

export type GoalId =
  | 'buy_capsule_10'
  | 'unlock_kitchen'
  | 'reach_comfort_25'
  | 'earn_credits_10000'
  | 'unlock_three_residents'
  | 'unlock_panorama_dome'
  | 'first_renovation'
  | 'rebuild_capsule_10'
  | 'reopen_kitchen'
  | 'unlock_laundry_after_renovation'
  | 'reach_comfort_40'
  | 'earn_credits_50000'
  | 'second_renovation'
  | 'rebuild_capsule_25'
  | 'unlock_teleport_entry'
  | 'unlock_five_residents'
  | 'reach_comfort_60'
  | 'earn_credits_100000'
  | 'repeat_renovation';

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

export type StationIncidentId =
  | 'kitchen_borscht_fog'
  | 'capsule_snore_echo'
  | 'laundry_sock_orbit'
  | 'garden_first_sprout_vote'
  | 'teleport_wrong_parcel'
  | 'renovation_cold_floor'
  | 'condition_warning_light'
  | 'cat_found_warm_pipe'
  | 'kitchen_garden_soup'
  | 'high_income_low_comfort_meeting'
  | 'capsule_window_frost'
  | 'kitchen_spoon_union'
  | 'garden_plant_listens_radio'
  | 'laundry_static_storm'
  | 'teleport_neighbor_duplicate'
  | 'panorama_star_argument'
  | 'meteorite_pantry_label_mystery'
  | 'maintenance_drones_form_committee'
  | 'retired_cosmonaut_mug_missing'
  | 'mist_cook_recipe_too_large'
  | 'vacuum_gardener_seed_escape'
  | 'sock_master_invents_calendar'
  | 'courier_delivers_future_notice'
  | 'vip_resident_wants_red_carpet'
  | 'cat_sleeps_on_button'
  | 'cat_brings_space_dust'
  | 'post_renovation_old_wallpaper'
  | 'second_cycle_resident_reunion'
  | 'offline_return_station_smells_like_soup'
  | 'condition_pristine_housewarming'
  | 'comfort_60_station_song'
  | 'teleport_garden_cross_pollination'
  | 'laundry_kitchen_steam_problem'
  | 'capsule_panorama_stargazing'
  | 'economy_kopeks_under_sofa'
  | 'renovation_upgrade_installation_day'
  | 'five_residents_table_argument'
  | 'first_reputation_review'
  | 'panorama_dome_first_date'
  | 'garden_laundry_moss_socks';

export type VisualPlaceholderId =
  | 'kitchen_mist_patch_01'
  | 'capsule_padding_01'
  | 'laundry_sock_cluster_01'
  | 'garden_sprout_label_01'
  | 'teleport_parcel_01'
  | 'capsule_rug_01'
  | 'warning_bulb_01'
  | 'cat_saucer_01'
  | 'kitchen_soup_pot_01'
  | 'capsule_frost_01'
  | 'kitchen_spoon_bundle_01'
  | 'garden_radio_plant_01'
  | 'laundry_static_socks_01'
  | 'teleport_duplicate_mug_01'
  | 'panorama_star_labels_01'
  | 'pantry_labels_01'
  | 'drone_schedule_board_01'
  | 'cosmonaut_mug_01'
  | 'kitchen_recipe_scroll_01'
  | 'garden_seed_trail_01'
  | 'laundry_sock_calendar_01'
  | 'teleport_future_notice_01'
  | 'vip_towel_carpet_01'
  | 'cat_button_label_01'
  | 'cat_dust_jar_01'
  | 'old_wallpaper_patch_01'
  | 'resident_reunion_table_01'
  | 'soup_smell_note_01'
  | 'housewarming_lamp_01'
  | 'station_song_poster_01'
  | 'teleport_pollen_pot_01'
  | 'steam_towel_hook_01'
  | 'stargazing_blanket_01'
  | 'kopeks_jar_01'
  | 'upgrade_labels_01'
  | 'table_schedule_01'
  | 'reputation_review_frame_01'
  | 'panorama_reserved_sign_01'
  | 'moss_sock_01';

export type StationIncidentCategory =
  | 'resident'
  | 'room'
  | 'combo'
  | 'renovation'
  | 'condition'
  | 'cat'
  | 'economy';

export type StationIncidentTrigger =
  | { kind: 'roomOpened'; roomId: ModuleId }
  | { kind: 'residentUnlocked'; residentId: ResidentId }
  | { kind: 'renovationCompleted'; minPrestigeCount: number }
  | { kind: 'roomConditionBelow'; roomId?: ModuleId; threshold: number }
  | { kind: 'roomComboAvailable'; roomIds: ModuleId[] }
  | { kind: 'comfortIncomeMismatch'; minIncomePerSecond: number; maxComfort: number }
  | { kind: 'sceneInteraction'; interactionId: 'strange_cat' }
  | { kind: 'idleReturn'; minSeconds: number };

export interface StationIncidentEffect {
  comfortDelta?: number;
  creditsDelta?: number;
  conditionRepair?: Partial<Record<ModuleId, number>>;
  timedBonus?: StationIncidentTimedBonusReward;
  visualPlaceholderIds?: VisualPlaceholderId[];
}

export interface StationIncidentTimedBonusReward {
  id: string;
  incomeMultiplier: number;
  durationMs: number;
}

export interface StationIncidentChoice {
  id: string;
  effects: StationIncidentEffect;
  requiresRole?: {
    role: ResidentRole;
    points: number;
  };
}

export interface StationIncidentDefinition {
  id: StationIncidentId;
  category: StationIncidentCategory;
  priority: number;
  enabled: boolean;
  repeatable: boolean;
  trigger: StationIncidentTrigger;
  choices: StationIncidentChoice[];
}

export interface ActiveStationIncident {
  id: StationIncidentId;
  queuedAt: number;
  isNew: boolean;
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
  | 'higher_offline_cap'
  | 'warm_start_credits'
  | 'capsule_head_start'
  | 'offline_cap_16h'
  | 'first_room_discount'
  | 'reputation_income'
  | 'visitor_comfort_bonus'
  | 'starting_comfort_plus'
  | 'maintenance_drones';

export interface PrestigeUpgradeDefinition {
  id: PrestigeUpgradeId;
  name: string;
  description: string;
  reputationCost: number;
  renovationTier: 1 | 2 | 3;
}

export type GoalRewardKind = 'comfort' | 'visual_detail' | 'temporary_boost' | 'prestige_hint';

export interface GoalTimedBonusReward {
  id: string;
  incomeMultiplier: number;
  durationMs: number;
}

export interface GoalDefinition {
  id: GoalId;
  title: string;
  renovationCycle: 0 | 1 | 2;
  rewardComfort: number;
  rewardKind: GoalRewardKind;
  rewardLabel: string;
  rewardVisualPlaceholderIds?: VisualPlaceholderId[];
  rewardTimedBonus?: GoalTimedBonusReward;
}

export type ModuleLevels = Record<ModuleId, number>;

export interface TimedBonus {
  id: string;
  incomeMultiplier: number;
  expiresAt: number;
}

export type CommunalDutyId =
  | 'capsule_quiet_hours'
  | 'kitchen_soup_escape'
  | 'garden_vacuum_sprout'
  | 'laundry_sock_orbit';

export type CommunalDutyStatus = 'available' | 'in_progress' | 'ready_to_claim';

export interface CommunalDutyReward {
  comfortGain?: number;
  conditionRepair?: Partial<Record<ModuleId, number>>;
  timedBonus?: TimedBonus;
}

export interface CommunalDutyResidentOutcome {
  residentId: ResidentId;
  reward: CommunalDutyReward;
  resultKey: string;
}

export interface CommunalDutyDefinition {
  id: CommunalDutyId;
  roomId: ModuleId;
  eligibleResidentIds: ResidentId[];
  bestResidentId: ResidentId;
  durationMs: number;
  preferredRole?: ResidentRole;
  roleBonus?: CommunalDutyReward;
  outcomes: CommunalDutyResidentOutcome[];
}

export interface CommunalDutyState {
  id: string;
  dutyId: CommunalDutyId;
  roomId: ModuleId;
  status: CommunalDutyStatus;
  createdAt: number;
  assignedResidentId?: ResidentId;
  startedAt?: number;
  completesAt?: number;
}

export interface CommunalDutyResult {
  dutyId: CommunalDutyId;
  residentId: ResidentId;
  roomId: ModuleId;
  comfortGain: number;
  conditionRepair: Partial<Record<ModuleId, number>>;
  resultKey: string;
  claimedAt: number;
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
  /** Active non-blocking station incidents shown in the journal. */
  activeIncidents?: ActiveStationIncident[];
  /** Completed non-repeatable station incident IDs. */
  completedIncidents?: StationIncidentId[];
  /** Stable visual placeholder rewards unlocked by incident choices. */
  unlockedIncidentVisuals?: VisualPlaceholderId[];
  /** Epoch ms when the next station incident may be queued after resolving one. */
  nextIncidentAvailableAt?: number;
  /**
   * Room condition values (0-100) keyed by ModuleId. Condition decays over
   * time; clicking the room repairs it. High condition gives an income
   * multiplier; low condition shows visual problems in the scene.
   */
  roomConditions?: Partial<Record<ModuleId, number>>;
  communalDuty?: CommunalDutyState;
  lastCommunalDutyResolvedAt?: number;
  lastCommunalDutyResult?: CommunalDutyResult;
  /** Weekly repair event state. Regenerates every 7 days. */
  weeklyRepair?: WeeklyRepairState;
  /**
   * Save schema version. Injected by `serializeGameState` and validated by
   * `parseGameState`. Not set on fresh in-memory states created by
   * `createInitialState`; it only appears on serialized/parsed states.
   */
  schemaVersion?: number;
}
