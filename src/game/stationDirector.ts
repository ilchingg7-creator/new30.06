import { modules } from './content/modules';
import { calculateModuleCost, calculatePrestigeReward } from './economy';
import { getVisibleGoals } from './goals';
import type { GameState, GoalId, ModuleId } from './types';

export type StationGuidanceCopyKey =
  | 'visitor'
  | 'daily'
  | 'goal'
  | 'module_buy'
  | 'module_wait'
  | 'module_unlock'
  | 'prestige';

interface StationGuidanceBase {
  kind: 'visitor' | 'daily' | 'goal' | 'module' | 'prestige';
  priority: number;
  copyKey: StationGuidanceCopyKey;
  targetRoomId?: ModuleId;
  canActNow: boolean;
}

export interface VisitorGuidance extends StationGuidanceBase {
  kind: 'visitor';
  visitorCost: number;
  visitorRewardComfort: number;
}

export interface DailyGuidance extends StationGuidanceBase {
  kind: 'daily';
}

export interface GoalGuidance extends StationGuidanceBase {
  kind: 'goal';
  goalId: GoalId;
  progressCurrent: number;
  progressTarget: number;
}

export interface ModuleGuidance extends StationGuidanceBase {
  kind: 'module';
  moduleId: ModuleId;
  canAfford: boolean;
  cost: number;
  waitSeconds: number | null;
}

export interface PrestigeGuidance extends StationGuidanceBase {
  kind: 'prestige';
  canRenovate: boolean;
  expectedReputation: number;
}

export type StationGuidance =
  | VisitorGuidance
  | DailyGuidance
  | GoalGuidance
  | ModuleGuidance
  | PrestigeGuidance;

export interface StationGuidanceInput {
  state: GameState;
  incomePerSecond: number;
  hasPendingDailyReward?: boolean;
}

interface GoalProgress {
  goalId: GoalId;
  current: number;
  target: number;
  targetRoomId?: ModuleId;
}

function clampProgress(current: number, target: number): number {
  return Math.max(0, Math.min(current, target));
}

function getGoalProgress(goalId: GoalId, state: GameState): GoalProgress {
  switch (goalId) {
    case 'buy_capsule_10':
      return {
        goalId,
        current: clampProgress(state.moduleLevels.tenant_capsule, 10),
        target: 10,
        targetRoomId: 'tenant_capsule'
      };
    case 'unlock_kitchen':
      return {
        goalId,
        current: state.moduleLevels.cosmo_kitchen > 0 ? 1 : 0,
        target: 1,
        targetRoomId: 'cosmo_kitchen'
      };
    case 'reach_comfort_25':
      return {
        goalId,
        current: clampProgress(state.comfort, 25),
        target: 25
      };
    case 'earn_credits_10000':
      return {
        goalId,
        current: clampProgress(Math.floor(state.totalEarnedCredits), 10_000),
        target: 10_000
      };
    case 'unlock_three_residents':
      return {
        goalId,
        current: clampProgress(state.unlockedResidents.length, 3),
        target: 3
      };
    case 'unlock_panorama_dome':
      return {
        goalId,
        current: state.moduleLevels.panorama_dome > 0 ? 1 : 0,
        target: 1,
        targetRoomId: 'panorama_dome'
      };
    case 'first_renovation':
      return {
        goalId,
        current: state.reputation > 0 ? 1 : 0,
        target: 1
      };
  }
}

function getCloseGoalGuidance(state: GameState): GoalGuidance | null {
  const visibleGoals = getVisibleGoals(state, 4);

  for (const goal of visibleGoals) {
    const progress = getGoalProgress(goal.id, state);
    const ratio = progress.target === 0 ? 0 : progress.current / progress.target;

    if (ratio < 0.7 || progress.current >= progress.target) {
      continue;
    }

    return {
      kind: 'goal',
      priority: 80,
      copyKey: 'goal',
      canActNow: false,
      goalId: goal.id,
      targetRoomId: progress.targetRoomId,
      progressCurrent: progress.current,
      progressTarget: progress.target
    };
  }

  return null;
}

function getNextModuleGuidance(state: GameState, incomePerSecond: number): ModuleGuidance {
  const unlockedModules = modules.filter((module) => state.totalEarnedCredits >= module.unlockAtCredits);
  const affordable = unlockedModules.find((module) => state.credits >= calculateModuleCost(module.id, state));
  const targetModule = affordable ?? unlockedModules[0] ?? modules[0];
  const cost = calculateModuleCost(targetModule.id, state);
  const missingCredits = Math.max(0, cost - state.credits);
  const waitSeconds = missingCredits === 0
    ? 0
    : incomePerSecond > 0
      ? Math.ceil(missingCredits / incomePerSecond)
      : null;

  return {
    kind: 'module',
    priority: affordable ? 70 : 60,
    copyKey: affordable ? 'module_buy' : 'module_wait',
    canActNow: Boolean(affordable),
    moduleId: targetModule.id,
    targetRoomId: targetModule.id,
    canAfford: Boolean(affordable),
    cost,
    waitSeconds
  };
}

export function getStationGuidance({
  state,
  incomePerSecond,
  hasPendingDailyReward = false
}: StationGuidanceInput): StationGuidance {
  if (state.activeVisitor && state.credits >= state.activeVisitor.cost) {
    return {
      kind: 'visitor',
      priority: 100,
      copyKey: 'visitor',
      canActNow: true,
      visitorCost: state.activeVisitor.cost,
      visitorRewardComfort: state.activeVisitor.rewardComfort
    };
  }

  if (hasPendingDailyReward) {
    return {
      kind: 'daily',
      priority: 90,
      copyKey: 'daily',
      canActNow: true
    };
  }

  const closeGoal = getCloseGoalGuidance(state);

  if (closeGoal) {
    return closeGoal;
  }

  const prestigeReward = calculatePrestigeReward(state);

  if (prestigeReward > 0) {
    return {
      kind: 'prestige',
      priority: 75,
      copyKey: 'prestige',
      canActNow: true,
      canRenovate: true,
      expectedReputation: prestigeReward
    };
  }

  return getNextModuleGuidance(state, incomePerSecond);
}
