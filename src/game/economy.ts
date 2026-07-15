import { checkAchievements } from './achievements';
import { advanceCommunalDuty } from './communalDuties';
import { modules } from './content/modules';
import { prestigeUpgrades } from './content/prestigeUpgrades';
import { completeEligibleGoals, getGoalRenovationCycle, getGoalsForCurrentCycle } from './goals';
import { getOverallConditionMultiplier, initializeRoomCondition } from './roomConditions';
import { trackLevelPurchase } from './weeklyRepair';
import {
  checkResidentUnlocks,
  getResidentFirstRoomCostMultiplier,
  getResidentGlobalIncomeMultiplier,
  getResidentModuleIncomeMultiplier
} from './residents';
import type { GameState, ModuleId, ModuleLevels, PrestigeUpgradeId, TimedBonus } from './types';

export const LEVEL_COST_GROWTH = 1.18;
export const OFFLINE_CAP_SECONDS = 3 * 60 * 60;
const UPGRADED_OFFLINE_CAP_SECONDS = 4.5 * 60 * 60;
const EXTENDED_OFFLINE_CAP_SECONDS = 6 * 60 * 60;
const OFFLINE_INCOME_EFFICIENCY = 0.5;
const STARTING_COMFORT_BONUS = 5;
const STARTING_COMFORT_PLUS_BONUS = 10;
const WARM_START_CREDITS = 100;
const CAPSULE_HEAD_START_LEVEL = 5;
const FIRST_ROOM_DISCOUNT_MULTIPLIER = 0.9;
const GOALS_REQUIRED_FOR_RENOVATION = 4;

export type PrestigeRequirementId = 'reputation_reward' | 'station_progress' | 'cycle_goals';

export interface PrestigeRequirement {
  id: PrestigeRequirementId;
  completed: boolean;
  current: number;
  target: number;
}

export function getOfflineCapSeconds(state: GameState): number {
  const upgrades = state.purchasedPrestigeUpgrades ?? [];
  let cap = upgrades.includes('offline_cap_16h')
    ? EXTENDED_OFFLINE_CAP_SECONDS
    : upgrades.includes('higher_offline_cap')
      ? UPGRADED_OFFLINE_CAP_SECONDS
      : OFFLINE_CAP_SECONDS;

  // Comet Plumber: +1 hour to whichever offline cap applies.
  if (state.unlockedResidents.includes('comet_plumber')) {
    cap += 60 * 60;
  }

  return cap;
}

const MILESTONE_MULTIPLIERS = [
  { level: 10, multiplier: 2 },
  { level: 25, multiplier: 2 },
  { level: 50, multiplier: 3 },
  { level: 100, multiplier: 4 }
] as const;

function createEmptyModuleLevels(): ModuleLevels {
  return {
    tenant_capsule: 0,
    cosmo_kitchen: 0,
    oxygen_garden: 0,
    zero_g_laundry: 0,
    teleport_entry: 0,
    antigrav_gym: 0,
    panorama_dome: 0,
    saucer_dock: 0,
    radiator_balcony: 0,
    mail_tube_office: 0,
    meteorite_pantry: 0,
    shared_observatory: 0,
    comet_water_tank: 0,
    orbital_library: 0
  };
}

function getModule(moduleId: ModuleId) {
  const module = modules.find((item) => item.id === moduleId);

  if (!module) {
    throw new Error(`Unknown module: ${moduleId}`);
  }

  return module;
}

function calculateMilestoneMultiplier(level: number): number {
  return MILESTONE_MULTIPLIERS.reduce((multiplier, milestone) => {
    return level >= milestone.level ? multiplier * milestone.multiplier : multiplier;
  }, 1);
}

function calculateTimedBonusMultiplier(bonuses: TimedBonus[], now: number): number {
  return bonuses.reduce((multiplier, bonus) => {
    return bonus.expiresAt > now ? multiplier * bonus.incomeMultiplier : multiplier;
  }, 1);
}

export function createInitialState(now = Date.now()): GameState {
  return {
    credits: 15,
    totalEarnedCredits: 0,
    comfort: 0,
    reputation: 0,
    moduleLevels: createEmptyModuleLevels(),
    completedGoals: [],
    unlockedResidents: [],
    timedBonuses: [],
    lastSavedAt: now,
    windowLightColor: 'amber'
  };
}

export function calculateModuleCost(moduleId: ModuleId, state: GameState): number {
  const module = getModule(moduleId);
  const level = state.moduleLevels[moduleId];
  const baseCost = module.baseCost * LEVEL_COST_GROWTH ** level;
  const firstRoomMultiplier = level === 0
    ? (state.purchasedPrestigeUpgrades?.includes('first_room_discount') ? FIRST_ROOM_DISCOUNT_MULTIPLIER : 1) *
      getResidentFirstRoomCostMultiplier(state)
    : 1;

  return Math.ceil(baseCost * firstRoomMultiplier);
}

function calculateUntimedIncomePerSecond(state: GameState): number {
  const moduleIncome = modules.reduce((sum, module) => {
    const level = state.moduleLevels[module.id];
    const milestoneMultiplier = calculateMilestoneMultiplier(level);

    return sum + module.baseIncomePerSecond * level * milestoneMultiplier * getResidentModuleIncomeMultiplier(state, module.id);
  }, 0);
  const comfortMultiplier = 1 + state.comfort * 0.01;
  const reputationIncomeRate = state.purchasedPrestigeUpgrades?.includes('reputation_income') ? 0.07 : 0.05;
  const reputationMultiplier = 1 + state.reputation * reputationIncomeRate;
  const residentGlobalMultiplier = getResidentGlobalIncomeMultiplier(state);
  const conditionMultiplier = getOverallConditionMultiplier(state);

  return moduleIncome * residentGlobalMultiplier * comfortMultiplier * reputationMultiplier * conditionMultiplier;
}

export function calculateIncomePerSecond(state: GameState, now = Date.now()): number {
  const timedBonusMultiplier = calculateTimedBonusMultiplier(state.timedBonuses, now);

  return calculateUntimedIncomePerSecond(state) * timedBonusMultiplier;
}

export function buyModuleLevel(state: GameState, moduleId: ModuleId): GameState {
  const cost = calculateModuleCost(moduleId, state);

  if (state.credits < cost) {
    return state;
  }

  const module = getModule(moduleId);
  const currentLevel = state.moduleLevels[moduleId];
  const comfortGain = currentLevel === 0 ? module.comfortBonus : 0;

  const nextState = {
    ...state,
    credits: state.credits - cost,
    comfort: state.comfort + comfortGain,
    moduleLevels: {
      ...state.moduleLevels,
      [moduleId]: currentLevel + 1
    },
    totalModulesBought: (state.totalModulesBought ?? 0) + 1
  };

  // Initialize room condition on first purchase.
  const withCondition = currentLevel === 0 ? initializeRoomCondition(nextState, moduleId) : nextState;

  // Track weekly repair buy_levels task
  const withWeekly = trackLevelPurchase(withCondition, moduleId);

  return checkResidentUnlocks(checkAchievements(completeEligibleGoals(withWeekly)));
}

export function advanceGame(
  state: GameState,
  seconds: number,
  now = Date.now(),
  earnedCreditsOverride?: number
): GameState {
  const elapsedSeconds = Math.max(0, seconds);
  const earnedCredits = earnedCreditsOverride ?? calculateIncomePerSecond(state, now) * elapsedSeconds;

  const nextState = {
    ...state,
    credits: state.credits + earnedCredits,
    totalEarnedCredits: state.totalEarnedCredits + earnedCredits,
    lastSavedAt: now,
    totalPlaySeconds: (state.totalPlaySeconds ?? 0) + elapsedSeconds
  };

  return advanceCommunalDuty(checkResidentUnlocks(checkAchievements(completeEligibleGoals(nextState))), now);
}

export function calculateOfflineReward(
  state: GameState,
  now = Date.now()
): { seconds: number; credits: number } {
  const elapsedSeconds = Math.max(0, Math.floor((now - state.lastSavedAt) / 1_000));
  const cappedSeconds = Math.min(elapsedSeconds, getOfflineCapSeconds(state));

  return {
    seconds: cappedSeconds,
    credits: calculateUntimedIncomePerSecond(state) * cappedSeconds * OFFLINE_INCOME_EFFICIENCY
  };
}

export function calculatePrestigeReward(state: GameState): number {
  // Linear scaling: hoarding kopeks before renovation is rewarded proportionally.
  // 200K earned → 1 rep, 1M → 5 rep, 5M → 25 rep. (Was sqrt with diminishing returns.)
  return Math.floor(state.totalEarnedCredits / 200_000);
}

function getCompletedRenovationCycleGoalCount(state: GameState): number {
  const cycleGoals = getGoalsForCurrentCycle(state).filter((goal) => goal.rewardKind !== 'prestige_hint');
  const completed = new Set(state.completedGoals);

  return cycleGoals.filter((goal) => completed.has(goal.id)).length;
}

function getStationProgressRequirement(state: GameState): PrestigeRequirement {
  const cycle = getGoalRenovationCycle(state);

  if (cycle === 0) {
    const current = Number(state.moduleLevels.tenant_capsule >= 10) + Number(state.moduleLevels.cosmo_kitchen > 0);

    return {
      id: 'station_progress',
      completed: current >= 2,
      current,
      target: 2
    };
  }

  if (cycle === 1) {
    const current = Number(state.moduleLevels.tenant_capsule >= 25) + Number(state.moduleLevels.zero_g_laundry > 0);

    return {
      id: 'station_progress',
      completed: current >= 2,
      current,
      target: 2
    };
  }

  if (cycle === 2) {
    const current = Number(state.moduleLevels.teleport_entry > 0) + Number(state.unlockedResidents.length >= 5);

    return {
      id: 'station_progress',
      completed: current >= 2,
      current,
      target: 2
    };
  }

  // Cycle 3: deep station — orbital library + high comfort
  const current = Number(state.moduleLevels.orbital_library > 0) + Number(state.comfort >= 70);

  return {
    id: 'station_progress',
    completed: current >= 2,
    current,
    target: 2
  };
}

export function getPrestigeRequirements(state: GameState): PrestigeRequirement[] {
  const expectedReputation = calculatePrestigeReward(state);
  const completedGoals = getCompletedRenovationCycleGoalCount(state);

  return [
    {
      id: 'reputation_reward',
      completed: expectedReputation > 0,
      current: expectedReputation,
      target: 1
    },
    getStationProgressRequirement(state),
    {
      id: 'cycle_goals',
      completed: completedGoals >= GOALS_REQUIRED_FOR_RENOVATION,
      current: Math.min(completedGoals, GOALS_REQUIRED_FOR_RENOVATION),
      target: GOALS_REQUIRED_FOR_RENOVATION
    }
  ];
}

export function canPerformPrestige(state: GameState): boolean {
  return getPrestigeRequirements(state).every((requirement) => requirement.completed);
}

export function getAvailablePrestigeUpgrades(state: GameState) {
  const owned = state.purchasedPrestigeUpgrades ?? [];
  const availableSlots = state.prestigeCount ?? 0;

  if (owned.length >= availableSlots) {
    return [];
  }

  const nextTier = Math.min(owned.length + 1, 3);

  return prestigeUpgrades.filter((upgrade) => upgrade.renovationTier === nextTier && !owned.includes(upgrade.id));
}

export function performPrestige(state: GameState, now = Date.now()): GameState {
  if (!canPerformPrestige(state)) {
    return state;
  }

  const nextReputation = state.reputation + calculatePrestigeReward(state);
  const upgrades = state.purchasedPrestigeUpgrades ?? [];

  const base = createInitialState(now);
  const moduleLevels = {
    ...base.moduleLevels,
    tenant_capsule: upgrades.includes('capsule_head_start') ? CAPSULE_HEAD_START_LEVEL : base.moduleLevels.tenant_capsule
  };
  const nextComfort = upgrades.includes('starting_comfort_plus')
    ? STARTING_COMFORT_PLUS_BONUS
    : upgrades.includes('starting_comfort')
      ? STARTING_COMFORT_BONUS
      : base.comfort;
  const nextState: GameState = {
    ...base,
    credits: upgrades.includes('warm_start_credits') ? WARM_START_CREDITS : base.credits,
    reputation: nextReputation,
    moduleLevels,
    purchasedPrestigeUpgrades: upgrades,
    // Tier 2 prestige upgrade: residents survive renovation.
    unlockedResidents: upgrades.includes('residents_survive')
      ? state.unlockedResidents
      : base.unlockedResidents,
    comfort: nextComfort,
    // Lifetime stats survive renovation.
    totalPlaySeconds: state.totalPlaySeconds,
    totalModulesBought: state.totalModulesBought,
    prestigeCount: (state.prestigeCount ?? 0) + 1,
    communalDuty: undefined,
    lastCommunalDutyResult: undefined,
    lastCommunalDutyResolvedAt: state.lastCommunalDutyResolvedAt
  };

  const withCondition = upgrades.includes('capsule_head_start')
    ? initializeRoomCondition(nextState, 'tenant_capsule')
    : nextState;

  return checkResidentUnlocks(checkAchievements(completeEligibleGoals(withCondition)));
}

export function buyPrestigeUpgrade(state: GameState, upgradeId: PrestigeUpgradeId): GameState {
  const upgrade = prestigeUpgrades.find((item) => item.id === upgradeId);

  if (!upgrade) {
    return state;
  }

  const owned = state.purchasedPrestigeUpgrades ?? [];
  const availableUpgradeIds = new Set(getAvailablePrestigeUpgrades(state).map((item) => item.id));

  if (
    owned.includes(upgradeId) ||
    !availableUpgradeIds.has(upgradeId) ||
    state.reputation < upgrade.reputationCost
  ) {
    return state;
  }

  return checkResidentUnlocks(checkAchievements({
    ...state,
    reputation: state.reputation - upgrade.reputationCost,
    purchasedPrestigeUpgrades: [...owned, upgradeId]
  }));
}

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1_000;
const MAX_DAILY_STREAK = 7;

export function getDayIndex(now: number): number {
  return Math.floor(now / MILLISECONDS_PER_DAY);
}

export type DailyRewardKind = 'kopeks' | 'comfort' | 'condition_repair_all' | 'timed_bonus' | 'prestige_hint';

export interface DailyRewardInfo {
  kind: DailyRewardKind;
  /** Kopeks for 'kopeks' kind. Comfort for 'comfort' kind. Condition repair for 'condition_repair_all'. */
  amount: number;
  /** For timed_bonus: income multiplier. */
  multiplier?: number;
  /** For timed_bonus: duration in ms. */
  durationMs?: number;
  /** Human-readable label key for i18n. */
  labelKey: string;
}

const DAILY_REWARD_TABLE: DailyRewardInfo[] = [
  { kind: 'comfort', amount: 1, labelKey: 'daily_comfort' },                             // Day 1
  { kind: 'condition_repair_all', amount: 15, labelKey: 'daily_condition_repair' },      // Day 2
  { kind: 'timed_bonus', amount: 0, multiplier: 1.3, durationMs: 10 * 60 * 1_000, labelKey: 'daily_timed_bonus' }, // Day 3
  { kind: 'comfort', amount: 2, labelKey: 'daily_comfort' },                             // Day 4
  { kind: 'condition_repair_all', amount: 30, labelKey: 'daily_condition_repair' },      // Day 5
  { kind: 'timed_bonus', amount: 0, multiplier: 1.5, durationMs: 15 * 60 * 1_000, labelKey: 'daily_timed_bonus' }, // Day 6
  { kind: 'comfort', amount: 5, labelKey: 'daily_comfort' }                              // Day 7
];

export function getDailyLoginReward(streak: number): DailyRewardInfo {
  const effectiveStreak = ((streak - 1) % MAX_DAILY_STREAK) + 1;
  return DAILY_REWARD_TABLE[effectiveStreak - 1];
}

export interface DailyLoginResult {
  state: GameState;
  reward: DailyRewardInfo;
  streak: number;
}

export function checkDailyLogin(state: GameState, now = Date.now()): DailyLoginResult {
  const today = getDayIndex(now);
  const lastDay = state.lastLoginDay;

  if (lastDay === today) {
    return {
      state,
      reward: { kind: 'kopeks', amount: 0, labelKey: 'daily_kopeks' },
      streak: state.dailyStreak ?? 0
    };
  }

  const previousStreak = state.dailyStreak ?? 0;
  const isConsecutive = lastDay === today - 1;
  const nextStreak = isConsecutive ? previousStreak + 1 : 1;
  const rewardInfo = getDailyLoginReward(nextStreak);

  // Apply reward based on kind
  let credits = state.credits;
  let comfort = state.comfort;
  let timedBonuses = state.timedBonuses;
  const roomConditions = { ...(state.roomConditions ?? {}) };

  switch (rewardInfo.kind) {
    case 'kopeks':
      credits += rewardInfo.amount;
      break;
    case 'comfort':
      comfort += rewardInfo.amount;
      break;
    case 'condition_repair_all': {
      const repairAmount = rewardInfo.amount;
      for (const module of modules) {
        if (state.moduleLevels[module.id] > 0) {
          const current = roomConditions[module.id] ?? 60;
          roomConditions[module.id] = Math.min(100, current + repairAmount);
        }
      }
      break;
    }
    case 'timed_bonus':
      if (rewardInfo.multiplier && rewardInfo.durationMs) {
        timedBonuses = [
          ...timedBonuses,
          {
            id: `daily_bonus_${now}`,
            incomeMultiplier: rewardInfo.multiplier,
            expiresAt: now + rewardInfo.durationMs
          }
        ];
      }
      break;
    case 'prestige_hint':
      // No economy effect, just informational
      break;
  }

  const nextState: GameState = {
    ...state,
    credits,
    comfort,
    timedBonuses,
    roomConditions: Object.keys(roomConditions).length > 0 ? roomConditions : state.roomConditions,
    totalEarnedCredits: state.totalEarnedCredits + (rewardInfo.kind === 'kopeks' ? rewardInfo.amount : 0),
    lastLoginDay: today,
    dailyStreak: nextStreak
  };

  return {
    state: checkResidentUnlocks(checkAchievements(completeEligibleGoals(nextState))),
    reward: rewardInfo,
    streak: nextStreak
  };
}
