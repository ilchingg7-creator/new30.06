import { modules } from './content/modules';
import type { GameState, ModuleId, ModuleLevels, TimedBonus } from './types';

export const LEVEL_COST_GROWTH = 1.15;
export const OFFLINE_CAP_SECONDS = 8 * 60 * 60;

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
    saucer_dock: 0
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
    lastSavedAt: now
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

  return {
    ...state,
    credits: state.credits - cost,
    comfort: state.comfort + module.comfortBonus,
    moduleLevels: {
      ...state.moduleLevels,
      [moduleId]: state.moduleLevels[moduleId] + 1
    }
  };
}

export function advanceGame(state: GameState, seconds: number, now = Date.now()): GameState {
  const elapsedSeconds = Math.max(0, seconds);
  const earnedCredits = calculateIncomePerSecond(state, now) * elapsedSeconds;

  return {
    ...state,
    credits: state.credits + earnedCredits,
    totalEarnedCredits: state.totalEarnedCredits + earnedCredits,
    lastSavedAt: now
  };
}

export function calculateOfflineReward(
  state: GameState,
  now = Date.now()
): { seconds: number; credits: number } {
  const elapsedSeconds = Math.max(0, Math.floor((now - state.lastSavedAt) / 1_000));
  const cappedSeconds = Math.min(elapsedSeconds, OFFLINE_CAP_SECONDS);

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

  return {
    ...createInitialState(now),
    reputation: nextReputation
  };
}
