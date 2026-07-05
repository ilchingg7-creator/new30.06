import { communalDuties } from './content/communalDuties';
import { hasResidentRole } from './residents';
import type {
  CommunalDutyDefinition,
  CommunalDutyId,
  CommunalDutyReward,
  GameState,
  ModuleId,
  ResidentId
} from './types';

export const COMMUNAL_DUTY_COOLDOWN_MS = 4 * 60 * 1_000;
export const COMMUNAL_DUTY_DURATION_MS = 3 * 60 * 1_000;

const TIMED_DUTY_BONUS_DURATION_MS = 5 * 60 * 1_000;
const DEFAULT_ROOM_CONDITION = 60;

function findDuty(dutyId: CommunalDutyId): CommunalDutyDefinition | null {
  return communalDuties.find((duty) => duty.id === dutyId) ?? null;
}

function hasUnlockedRoom(state: GameState, duty: CommunalDutyDefinition): boolean {
  return state.moduleLevels[duty.roomId] > 0;
}

function hasEligibleResident(state: GameState, duty: CommunalDutyDefinition): boolean {
  return duty.eligibleResidentIds.some((residentId) => state.unlockedResidents.includes(residentId));
}

function cooldownReady(state: GameState, now: number): boolean {
  const lastResolvedAt = state.lastCommunalDutyResolvedAt;

  return lastResolvedAt === undefined || now - lastResolvedAt >= COMMUNAL_DUTY_COOLDOWN_MS;
}

function getOutcome(definition: CommunalDutyDefinition, residentId: ResidentId) {
  return definition.outcomes.find((outcome) => outcome.residentId === residentId) ?? null;
}

function mergeConditionRepair(
  base: Partial<Record<ModuleId, number>>,
  bonus: Partial<Record<ModuleId, number>>
): Partial<Record<ModuleId, number>> {
  const merged = { ...base };

  for (const [roomId, repair] of Object.entries(bonus)) {
    const typedRoomId = roomId as ModuleId;

    merged[typedRoomId] = (merged[typedRoomId] ?? 0) + repair;
  }

  return merged;
}

function mergeRewards(base: CommunalDutyReward, bonus: CommunalDutyReward): CommunalDutyReward {
  return {
    comfortGain: (base.comfortGain ?? 0) + (bonus.comfortGain ?? 0),
    conditionRepair: mergeConditionRepair(base.conditionRepair ?? {}, bonus.conditionRepair ?? {}),
    timedBonus: bonus.timedBonus ?? base.timedBonus
  };
}

function getRewardForResident(
  state: GameState,
  definition: CommunalDutyDefinition,
  residentId: ResidentId,
  reward: CommunalDutyReward
): CommunalDutyReward {
  if (!definition.preferredRole || !definition.roleBonus) {
    return reward;
  }

  const assignedResidentState = {
    ...state,
    unlockedResidents: [residentId]
  };

  return hasResidentRole(assignedResidentState, definition.preferredRole, 1)
    ? mergeRewards(reward, definition.roleBonus)
    : reward;
}

function applyConditionRepair(
  roomConditions: Partial<Record<ModuleId, number>>,
  conditionRepair: Partial<Record<ModuleId, number>>
): Partial<Record<ModuleId, number>> {
  const nextConditions = { ...roomConditions };

  for (const [roomId, repair] of Object.entries(conditionRepair)) {
    const typedRoomId = roomId as ModuleId;
    const current = nextConditions[typedRoomId] ?? DEFAULT_ROOM_CONDITION;

    nextConditions[typedRoomId] = Math.min(100, current + repair);
  }

  return nextConditions;
}

function applyReward(state: GameState, reward: CommunalDutyReward, now: number): GameState {
  const conditionRepair = reward.conditionRepair ?? {};
  const timedBonuses = reward.timedBonus
    ? [
        ...state.timedBonuses,
        {
          ...reward.timedBonus,
          expiresAt: now + TIMED_DUTY_BONUS_DURATION_MS
        }
      ]
    : state.timedBonuses;

  return {
    ...state,
    comfort: state.comfort + (reward.comfortGain ?? 0),
    roomConditions: applyConditionRepair(state.roomConditions ?? {}, conditionRepair),
    timedBonuses
  };
}

export function getEligibleCommunalDutyDefinitions(state: GameState): CommunalDutyDefinition[] {
  return communalDuties.filter((duty) => hasUnlockedRoom(state, duty) && hasEligibleResident(state, duty));
}

export function maybeCreateCommunalDuty(state: GameState, now = Date.now()): GameState {
  if (state.communalDuty || !cooldownReady(state, now)) {
    return state;
  }

  const duty = getEligibleCommunalDutyDefinitions(state)[0];

  if (!duty) {
    return state;
  }

  return {
    ...state,
    communalDuty: {
      id: `duty-${now}-${duty.id}`,
      dutyId: duty.id,
      roomId: duty.roomId,
      status: 'available',
      createdAt: now
    }
  };
}

export function assignCommunalDuty(state: GameState, residentId: ResidentId, now = Date.now()): GameState {
  const active = state.communalDuty;

  if (!active || active.status !== 'available') {
    return state;
  }

  const definition = findDuty(active.dutyId);

  if (!definition || !state.unlockedResidents.includes(residentId) || !getOutcome(definition, residentId)) {
    return state;
  }

  return {
    ...state,
    communalDuty: {
      ...active,
      status: 'in_progress',
      assignedResidentId: residentId,
      startedAt: now,
      completesAt: now + definition.durationMs
    }
  };
}

export function advanceCommunalDuty(state: GameState, now = Date.now()): GameState {
  const active = state.communalDuty;

  if (!active || active.status !== 'in_progress' || active.completesAt === undefined || now < active.completesAt) {
    return state;
  }

  return {
    ...state,
    communalDuty: {
      ...active,
      status: 'ready_to_claim'
    }
  };
}

export function claimCommunalDuty(state: GameState, now = Date.now()): GameState {
  const active = state.communalDuty;

  if (!active || active.status !== 'ready_to_claim' || !active.assignedResidentId) {
    return state;
  }

  const definition = findDuty(active.dutyId);
  const outcome = definition ? getOutcome(definition, active.assignedResidentId) : null;

  if (!definition || !outcome) {
    return {
      ...state,
      communalDuty: undefined,
      lastCommunalDutyResolvedAt: now
    };
  }

  const reward = getRewardForResident(state, definition, active.assignedResidentId, outcome.reward);
  const rewarded = applyReward(state, reward, now);

  return {
    ...rewarded,
    communalDuty: undefined,
    lastCommunalDutyResolvedAt: now,
    lastCommunalDutyResult: {
      dutyId: definition.id,
      residentId: active.assignedResidentId,
      roomId: definition.roomId,
      comfortGain: reward.comfortGain ?? 0,
      conditionRepair: reward.conditionRepair ?? {},
      resultKey: outcome.resultKey,
      claimedAt: now
    }
  };
}
