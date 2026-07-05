import { activeStationIncidents } from './content/stationIncidents';
import { calculateIncomePerSecond } from './economy';
import type {
  ActiveStationIncident,
  GameState,
  ModuleId,
  StationIncidentDefinition,
  StationIncidentId
} from './types';

const MAX_ACTIVE_INCIDENTS = 3;
const MAX_NEW_PER_UPDATE = 1;

export interface StationIncidentQueueContext {
  now?: number;
  sceneInteractionId?: 'strange_cat';
}

export function getActiveStationIncidents(state: GameState): ActiveStationIncident[] {
  return state.activeIncidents ?? [];
}

export function getNewStationIncidentCount(state: GameState): number {
  return getActiveStationIncidents(state).filter((incident) => incident.isNew).length;
}

export function markStationIncidentsSeen(state: GameState): GameState {
  const active = getActiveStationIncidents(state);

  if (active.every((incident) => !incident.isNew)) {
    return state;
  }

  return {
    ...state,
    activeIncidents: active.map((incident) => ({ ...incident, isNew: false }))
  };
}

function isRoomOwned(state: GameState, roomId: ModuleId): boolean {
  return (state.moduleLevels[roomId] ?? 0) > 0;
}

function isIncidentAlreadyPresent(state: GameState, definition: StationIncidentDefinition): boolean {
  return getActiveStationIncidents(state).some((incident) => incident.id === definition.id);
}

function isIncidentCompleted(state: GameState, definition: StationIncidentDefinition): boolean {
  return !definition.repeatable && (state.completedIncidents ?? []).includes(definition.id);
}

function hasRoomConditionBelow(state: GameState, roomId: ModuleId | undefined, threshold: number): boolean {
  const entries = Object.entries(state.roomConditions ?? {}) as Array<[ModuleId, number]>;

  if (roomId) {
    return isRoomOwned(state, roomId) && (state.roomConditions?.[roomId] ?? 100) < threshold;
  }

  return entries.some(([id, condition]) => isRoomOwned(state, id) && condition < threshold);
}

function isTriggerMet(
  state: GameState,
  definition: StationIncidentDefinition,
  context: StationIncidentQueueContext
): boolean {
  const trigger = definition.trigger;

  switch (trigger.kind) {
    case 'roomOpened':
      return isRoomOwned(state, trigger.roomId);
    case 'residentUnlocked':
      return state.unlockedResidents.includes(trigger.residentId);
    case 'renovationCompleted':
      return (state.prestigeCount ?? 0) >= trigger.minPrestigeCount;
    case 'roomConditionBelow':
      return hasRoomConditionBelow(state, trigger.roomId, trigger.threshold);
    case 'roomComboAvailable':
      return trigger.roomIds.every((roomId) => isRoomOwned(state, roomId));
    case 'comfortIncomeMismatch':
      return state.comfort <= trigger.maxComfort && calculateIncomePerSecond(state) >= trigger.minIncomePerSecond;
    case 'sceneInteraction':
      return context.sceneInteractionId === trigger.interactionId;
    case 'idleReturn':
      return false;
  }
}

export function queueEligibleIncidents(state: GameState, context: StationIncidentQueueContext = {}): GameState {
  const active = getActiveStationIncidents(state);

  if (active.length >= MAX_ACTIVE_INCIDENTS) {
    return state;
  }

  const now = context.now ?? Date.now();
  const slots = Math.min(MAX_NEW_PER_UPDATE, MAX_ACTIVE_INCIDENTS - active.length);
  const eligible = activeStationIncidents
    .filter((definition) => !isIncidentAlreadyPresent(state, definition))
    .filter((definition) => !isIncidentCompleted(state, definition))
    .filter((definition) => isTriggerMet(state, definition, context))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, slots);

  if (eligible.length === 0) {
    return state;
  }

  return {
    ...state,
    activeIncidents: [
      ...active,
      ...eligible.map((definition) => ({
        id: definition.id,
        queuedAt: now,
        isNew: true
      }))
    ]
  };
}

function findDefinition(incidentId: StationIncidentId): StationIncidentDefinition | undefined {
  return activeStationIncidents.find((definition) => definition.id === incidentId);
}

function addUnique<T extends string>(current: T[] | undefined, next: T[]): T[] {
  return Array.from(new Set([...(current ?? []), ...next]));
}

export function resolveStationIncident(
  state: GameState,
  incidentId: StationIncidentId,
  choiceId: string,
  now = Date.now()
): GameState {
  const active = getActiveStationIncidents(state);

  if (!active.some((incident) => incident.id === incidentId)) {
    return state;
  }

  const definition = findDefinition(incidentId);
  const choice = definition?.choices.find((candidate) => candidate.id === choiceId);

  if (!definition || !choice) {
    return state;
  }

  const effect = choice.effects;
  const nextRoomConditions = { ...(state.roomConditions ?? {}) };

  for (const [roomId, repair] of Object.entries(effect.conditionRepair ?? {}) as Array<[ModuleId, number]>) {
    nextRoomConditions[roomId] = Math.min(100, (nextRoomConditions[roomId] ?? 60) + repair);
  }

  const timedBonuses = effect.timedBonus
    ? [
        ...state.timedBonuses,
        {
          id: effect.timedBonus.id,
          incomeMultiplier: effect.timedBonus.incomeMultiplier,
          expiresAt: now + effect.timedBonus.durationMs
        }
      ]
    : state.timedBonuses;

  return {
    ...state,
    credits: Math.max(0, state.credits + (effect.creditsDelta ?? 0)),
    comfort: Math.max(0, state.comfort + (effect.comfortDelta ?? 0)),
    roomConditions: Object.keys(nextRoomConditions).length > 0 ? nextRoomConditions : state.roomConditions,
    activeIncidents: active.filter((incident) => incident.id !== incidentId),
    completedIncidents: addUnique(state.completedIncidents, [incidentId]),
    unlockedIncidentVisuals: addUnique(state.unlockedIncidentVisuals, effect.visualPlaceholderIds ?? []),
    timedBonuses
  };
}
