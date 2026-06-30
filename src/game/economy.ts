import { checkAchievements } from './achievements';
import { modules } from './content/modules';
import { prestigeUpgrades } from './content/prestigeUpgrades';
import { completeEligibleGoals } from './goals';
import { checkResidentUnlocks } from './residents';
import type { GameState, ModuleId, ModuleLevels, PrestigeUpgradeId, TimedBonus } from './types';

export const LEVEL_COST_GROWTH = 1.18;
export const OFFLINE_CAP_SECONDS = 8 * 60 * 60;
const UPGRADED_OFFLINE_CAP_SECONDS = 12 * 60 * 60;
const STARTING_COMFORT_BONUS = 5;

export function getOfflineCapSeconds(state: GameState): number {
  return state.purchasedPrestigeUpgrades?.includes('higher_offline_cap')
    ? UPGRADED_OFFLINE_CAP_SECONDS
    : OFFLINE_CAP_SECONDS;
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
    mail_tube_office: 0
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

  return Math.ceil(module.baseCost * LEVEL_COST_GROWTH ** level);
}

export function calculateIncomePerSecond(state: GameState, now = Date.now()): number {
  const moduleIncome = modules.reduce((sum, module) => {
    const level = state.moduleLevels[module.id];
    const milestoneMultiplier = calculateMilestoneMultiplier(level);

    return sum + module.baseIncomePerSecond * level * milestoneMultiplier;
  }, 0);
  const comfortMultiplier = 1 + state.comfort * 0.01;
  const reputationMultiplier = 1 + state.reputation * 0.05;
  const timedBonusMultiplier = calculateTimedBonusMultiplier(state.timedBonuses, now);

  return moduleIncome * comfortMultiplier * reputationMultiplier * timedBonusMultiplier;
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

  return checkResidentUnlocks(checkAchievements(completeEligibleGoals(nextState)));
}

export function advanceGame(state: GameState, seconds: number, now = Date.now()): GameState {
  const elapsedSeconds = Math.max(0, seconds);
  const earnedCredits = calculateIncomePerSecond(state, now) * elapsedSeconds;

  const nextState = {
    ...state,
    credits: state.credits + earnedCredits,
    totalEarnedCredits: state.totalEarnedCredits + earnedCredits,
    lastSavedAt: now,
    totalPlaySeconds: (state.totalPlaySeconds ?? 0) + elapsedSeconds
  };

  return checkResidentUnlocks(checkAchievements(completeEligibleGoals(nextState)));
}

export function calculateOfflineReward(
  state: GameState,
  now = Date.now()
): { seconds: number; credits: number } {
  const elapsedSeconds = Math.max(0, Math.floor((now - state.lastSavedAt) / 1_000));
  const cappedSeconds = Math.min(elapsedSeconds, getOfflineCapSeconds(state));

  return {
    seconds: cappedSeconds,
    credits: calculateIncomePerSecond(state, now) * cappedSeconds
  };
}

export function calculatePrestigeReward(state: GameState): number {
  return Math.floor(Math.sqrt(state.totalEarnedCredits / 100_000));
}

export function performPrestige(state: GameState, now = Date.now()): GameState {
  const nextReputation = state.reputation + calculatePrestigeReward(state);
  const upgrades = state.purchasedPrestigeUpgrades ?? [];

  const base = createInitialState(now);
  const nextState: GameState = {
    ...base,
    reputation: nextReputation,
    purchasedPrestigeUpgrades: upgrades,
    // Tier 2 prestige upgrade: residents survive renovation.
    unlockedResidents: upgrades.includes('residents_survive')
      ? state.unlockedResidents
      : base.unlockedResidents,
    // Tier 2 prestige upgrade: warm start comfort.
    comfort: upgrades.includes('starting_comfort') ? STARTING_COMFORT_BONUS : base.comfort,
    // Lifetime stats survive renovation.
    totalPlaySeconds: state.totalPlaySeconds,
    totalModulesBought: state.totalModulesBought,
    prestigeCount: (state.prestigeCount ?? 0) + 1
  };

  return checkResidentUnlocks(checkAchievements(completeEligibleGoals(nextState)));
}

export function buyPrestigeUpgrade(state: GameState, upgradeId: PrestigeUpgradeId): GameState {
  const upgrade = prestigeUpgrades.find((item) => item.id === upgradeId);

  if (!upgrade) {
    return state;
  }

  const owned = state.purchasedPrestigeUpgrades ?? [];

  if (owned.includes(upgradeId) || state.reputation < upgrade.reputationCost) {
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

export function getDailyLoginReward(streak: number): number {
  // Reward grows with streak, capped at day 7 then cycles.
  const effectiveStreak = ((streak - 1) % MAX_DAILY_STREAK) + 1;
  return effectiveStreak * 50;
}

export interface DailyLoginResult {
  state: GameState;
  reward: number;
  streak: number;
}

export function checkDailyLogin(state: GameState, now = Date.now()): DailyLoginResult {
  const today = getDayIndex(now);
  const lastDay = state.lastLoginDay;

  if (lastDay === today) {
    return {
      state,
      reward: 0,
      streak: state.dailyStreak ?? 0
    };
  }

  const previousStreak = state.dailyStreak ?? 0;
  // Consecutive if last login was yesterday. Otherwise reset to 0 (becomes 1).
  const isConsecutive = lastDay === today - 1;
  const nextStreak = isConsecutive ? previousStreak + 1 : 1;
  const reward = getDailyLoginReward(nextStreak);

  const nextState: GameState = {
    ...state,
    credits: state.credits + reward,
    totalEarnedCredits: state.totalEarnedCredits + reward,
    lastLoginDay: today,
    dailyStreak: nextStreak
  };

  return {
    state: checkResidentUnlocks(checkAchievements(completeEligibleGoals(nextState))),
    reward,
    streak: nextStreak
  };
}
