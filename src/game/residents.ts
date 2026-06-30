import { residents } from './content/residents';
import type { GameState, ResidentDefinition, ResidentId } from './types';

export function isResidentUnlocked(residentId: ResidentId, state: GameState): boolean {
  const resident = residents.find((item) => item.id === residentId);

  if (!resident) {
    return false;
  }

  if (resident.requiredModule) {
    return state.moduleLevels[resident.requiredModule] >= (resident.requiredModuleLevel ?? 1);
  }

  if (resident.requiredComfort !== undefined) {
    // vip_astroteenant is a special case: unlocked via rewarded ad, not
    // automatically by comfort. Skip it here; the hook handles it manually.
    if (residentId === 'vip_astroteenant') {
      return state.unlockedResidents.includes(residentId);
    }

    // retired_cosmonaut unlocks after first prestige (reputation > 0).
    if (residentId === 'retired_cosmonaut') {
      return state.reputation > 0;
    }

    return state.comfort >= resident.requiredComfort;
  }

  return false;
}

export function checkResidentUnlocks(state: GameState): GameState {
  const owned = new Set(state.unlockedResidents);
  let changed = false;

  for (const resident of residents) {
    if (owned.has(resident.id)) {
      continue;
    }

    if (isResidentUnlocked(resident.id, state)) {
      owned.add(resident.id);
      changed = true;
    }
  }

  if (!changed) {
    return state;
  }

  return {
    ...state,
    unlockedResidents: Array.from(owned)
  };
}

export function getVisibleResidents(state: GameState, limit = 4): ResidentDefinition[] {
  const owned = new Set(state.unlockedResidents);

  return residents
    .filter((resident) => !owned.has(resident.id))
    .slice(0, limit);
}
