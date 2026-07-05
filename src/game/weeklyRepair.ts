import { modules } from './content/modules';
import { getRoomCondition } from './roomConditions';
import type { GameState, ModuleId, WeeklyRepairState, WeeklyRepairTask } from './types';

const WEEK_MS = 7 * 24 * 60 * 60 * 1_000;
const TASKS_PER_EVENT = 3;
const BONUS_COMFORT = 10;

interface TaskTemplate {
  kind: WeeklyRepairTask['kind'];
  roomId: ModuleId;
  target: number;
  rewardComfort: number;
}

function getUnlockedRooms(state: GameState): ModuleId[] {
  return modules.filter((m) => state.moduleLevels[m.id] > 0).map((m) => m.id);
}

function generateTasks(state: GameState, now: number): WeeklyRepairTask[] {
  const rooms = getUnlockedRooms(state);

  if (rooms.length === 0) {
    return [];
  }

  const templates: TaskTemplate[] = [];
  const usedRooms = new Set<ModuleId>();

  // Task 1: Repair a room to 80+ condition
  const repairRoom = rooms.find((r) => getRoomCondition(state, r) < 80 && !usedRooms.has(r))
    ?? rooms[0];
  usedRooms.add(repairRoom);
  templates.push({
    kind: 'repair_room',
    roomId: repairRoom,
    target: 80,
    rewardComfort: 3
  });

  // Task 2: Buy N levels in a room
  if (rooms.length > 1) {
    const levelRoom = rooms.find((r) => !usedRooms.has(r)) ?? rooms[0];
    usedRooms.add(levelRoom);
    templates.push({
      kind: 'buy_levels',
      roomId: levelRoom,
      target: 5,
      rewardComfort: 4
    });
  }

  // Task 3: Reach condition threshold on a room
  if (rooms.length > 2) {
    const condRoom = rooms.find((r) => !usedRooms.has(r)) ?? rooms[0];
    templates.push({
      kind: 'reach_condition',
      roomId: condRoom,
      target: 90,
      rewardComfort: 3
    });
  }

  return templates.map((t, i) => ({
    id: `task_${now}_${i}`,
    kind: t.kind,
    roomId: t.roomId,
    target: t.target,
    progress: 0,
    completed: false,
    rewardComfort: t.rewardComfort
  }));
}

export function getOrCreateWeeklyRepair(state: GameState, now = Date.now()): WeeklyRepairState {
  const existing = state.weeklyRepair;

  if (existing && now < existing.expiresAt) {
    return existing;
  }

  return {
    startedAt: now,
    expiresAt: now + WEEK_MS,
    tasks: generateTasks(state, now),
    bonusClaimed: false
  };
}

/**
 * Update task progress based on current game state.
 * Called from the game tick or after room purchases.
 */
export function updateWeeklyRepairProgress(state: GameState, now = Date.now()): GameState {
  const weekly = state.weeklyRepair;

  if (!weekly || now >= weekly.expiresAt) {
    // Event expired — regenerate
    const fresh = getOrCreateWeeklyRepair(state, now);
    return { ...state, weeklyRepair: fresh };
  }

  let changed = false;
  const updatedTasks = weekly.tasks.map((task): WeeklyRepairTask => {
    if (task.completed) {
      return task;
    }

    let progress = task.progress;

    switch (task.kind) {
      case 'repair_room':
      case 'reach_condition': {
        const condition = getRoomCondition(state, task.roomId);
        progress = Math.min(task.target, condition);
        break;
      }
      case 'buy_levels': {
        // Progress tracked via trackLevelPurchase; just check if completed
        break;
      }
    }

    const completed = progress >= task.target;

    if (completed !== task.completed || progress !== task.progress) {
      changed = true;
    }

    return { ...task, progress, completed };
  });

  if (!changed) {
    return state;
  }

  // Apply comfort rewards for newly completed tasks
  let comfortGain = 0;
  for (let i = 0; i < updatedTasks.length; i += 1) {
    if (updatedTasks[i].completed && !weekly.tasks[i].completed) {
      comfortGain += updatedTasks[i].rewardComfort;
    }
  }

  return {
    ...state,
    comfort: state.comfort + comfortGain,
    weeklyRepair: { ...weekly, tasks: updatedTasks }
  };
}

/**
 * Track a room level purchase for buy_levels tasks.
 * Call from buyModuleLevel.
 */
export function trackLevelPurchase(state: GameState, moduleId: ModuleId): GameState {
  const weekly = state.weeklyRepair;

  if (!weekly) {
    return state;
  }

  let changed = false;
  const updatedTasks = weekly.tasks.map((task): WeeklyRepairTask => {
    if (task.completed || task.kind !== 'buy_levels' || task.roomId !== moduleId) {
      return task;
    }

    const progress = Math.min(task.target, task.progress + 1);
    const completed = progress >= task.target;

    if (completed !== task.completed || progress !== task.progress) {
      changed = true;
    }

    return { ...task, progress, completed };
  });

  if (!changed) {
    return state;
  }

  // Apply comfort for newly completed
  let comfortGain = 0;
  for (let i = 0; i < updatedTasks.length; i += 1) {
    if (updatedTasks[i].completed && !weekly.tasks[i].completed) {
      comfortGain += updatedTasks[i].rewardComfort;
    }
  }

  return {
    ...state,
    comfort: state.comfort + comfortGain,
    weeklyRepair: { ...weekly, tasks: updatedTasks }
  };
}

/**
 * Check if all tasks are completed and the bonus is claimable.
 */
export function canClaimWeeklyBonus(state: GameState): boolean {
  const weekly = state.weeklyRepair;

  if (!weekly || weekly.bonusClaimed) {
    return false;
  }

  return weekly.tasks.length > 0 && weekly.tasks.every((t) => t.completed);
}

/**
 * Claim the weekly completion bonus (+10 comfort).
 */
export function claimWeeklyBonus(state: GameState): GameState {
  if (!canClaimWeeklyBonus(state)) {
    return state;
  }

  return {
    ...state,
    comfort: state.comfort + BONUS_COMFORT,
    weeklyRepair: { ...state.weeklyRepair!, bonusClaimed: true }
  };
}

/**
 * Time remaining in human-readable parts.
 */
export function getWeeklyRepairTimeRemaining(state: GameState, now = Date.now()): {
  expired: boolean;
  days: number;
  hours: number;
} {
  const weekly = state.weeklyRepair;

  if (!weekly) {
    return { expired: true, days: 0, hours: 0 };
  }

  const remaining = Math.max(0, weekly.expiresAt - now);
  const days = Math.floor(remaining / (24 * 60 * 60 * 1_000));
  const hours = Math.floor((remaining % (24 * 60 * 60 * 1_000)) / (60 * 60 * 1_000));

  return { expired: remaining === 0, days, hours };
}
