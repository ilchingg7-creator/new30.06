import { modules } from './content/modules';
import type { GameState, ModuleId } from './types';

/**
 * Room condition system (Pass 3).
 *
 * Each unlocked room has a condition value (0-100). Condition decays
 * slowly over time; clicking the room repairs it. High condition gives
 * a small income multiplier; low condition shows visual problems.
 *
 * - condition >= 80: 'pristine' — +10% income multiplier for that room
 * - condition 40-79: 'working'  — normal income
 * - condition 1-39:  'worn'     — visual indicator (flickering lamp etc.)
 * - condition 0:     'broken'   — -20% income penalty for that room
 */

export const INITIAL_CONDITION = 60;
export const REPAIR_PER_CLICK = 8;
export const DECAY_PER_TICK = 1;
export const DECAY_INTERVAL_SECONDS = 180;
export const PRISTINE_THRESHOLD = 80;
export const BROKEN_THRESHOLD = 0;
export const WORN_THRESHOLD = 30;

export type RoomConditionStatus = 'pristine' | 'working' | 'worn' | 'broken';

export function getRoomCondition(state: GameState, moduleId: ModuleId): number {
  return state.roomConditions?.[moduleId] ?? INITIAL_CONDITION;
}

export function getRoomConditionStatus(condition: number): RoomConditionStatus {
  if (condition <= BROKEN_THRESHOLD) return 'broken';
  if (condition < WORN_THRESHOLD) return 'worn';
  if (condition >= PRISTINE_THRESHOLD) return 'pristine';
  return 'working';
}

/**
 * Income multiplier for a room based on its condition.
 * - pristine: 1.1 (+10%)
 * - working: 1.0 (normal)
 * - worn: 1.0 (no penalty, but visual indicator)
 * - broken: 0.8 (-20%)
 */
export function getRoomConditionMultiplier(condition: number): number {
  const status = getRoomConditionStatus(condition);

  switch (status) {
    case 'pristine':
      return 1.1;
    case 'broken':
      return 0.8;
    default:
      return 1.0;
  }
}

/**
 * Overall income multiplier across all rooms, weighted by their base income.
 * Used as a global multiplier in calculateIncomePerSecond.
 */
export function getOverallConditionMultiplier(state: GameState): number {
  let totalWeight = 0;
  let weightedMultiplier = 0;

  for (const module of modules) {
    const level = state.moduleLevels[module.id];

    if (level <= 0) continue;

    const condition = getRoomCondition(state, module.id);
    const multiplier = getRoomConditionMultiplier(condition);
    const weight = module.baseIncomePerSecond * level;

    totalWeight += weight;
    weightedMultiplier += multiplier * weight;
  }

  return totalWeight > 0 ? weightedMultiplier / totalWeight : 1.0;
}

/**
 * Initialize condition for a newly unlocked room (level 0 → 1).
 * Returns a new GameState with the condition set if needed.
 */
export function initializeRoomCondition(state: GameState, moduleId: ModuleId): GameState {
  if (state.roomConditions?.[moduleId] !== undefined) {
    return state;
  }

  return {
    ...state,
    roomConditions: {
      ...state.roomConditions,
      [moduleId]: INITIAL_CONDITION
    }
  };
}

/**
 * Repair a room by clicking on it. Increases condition by REPAIR_PER_CLICK,
 * capped at 100. Returns a new GameState.
 */
export function repairRoom(state: GameState, moduleId: ModuleId): GameState {
  const current = getRoomCondition(state, moduleId);
  const next = Math.min(100, current + REPAIR_PER_CLICK);

  return {
    ...state,
    roomConditions: {
      ...state.roomConditions,
      [moduleId]: next
    }
  };
}

/**
 * Decay all room conditions by DECAY_PER_TICK. Called every
 * DECAY_INTERVAL_SECONDS from the game loop. Rooms at level 0 are skipped.
 */
export function decayRoomConditions(state: GameState): GameState {
  let changed = false;
  const nextConditions = { ...state.roomConditions };

  for (const module of modules) {
    const level = state.moduleLevels[module.id];

    if (level <= 0) continue;

    const current = nextConditions[module.id] ?? INITIAL_CONDITION;
    const next = Math.max(0, current - DECAY_PER_TICK);

    if (next !== current) {
      nextConditions[module.id] = next;
      changed = true;
    }
  }

  if (!changed) {
    return state;
  }

  return {
    ...state,
    roomConditions: nextConditions
  };
}
