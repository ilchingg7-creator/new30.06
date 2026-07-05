import { residents } from './content/residents';
import type { GameState, ModuleId, ResidentDefinition, ResidentId } from './types';

const RESIDENT_MODULE_INCOME_MULTIPLIERS: Partial<Record<ResidentId, Partial<Record<ModuleId, number>>>> = {
  sleepy_engineer: { tenant_capsule: 1.05 },
  mist_cook: { cosmo_kitchen: 1.1 },
  sock_master: { zero_g_laundry: 1.1 }
};

const RESIDENT_UNLOCK_COMFORT: Partial<Record<ResidentId, number>> = {
  vacuum_gardener: 5
};

export function getResidentModuleIncomeMultiplier(state: GameState, moduleId: ModuleId): number {
  return state.unlockedResidents.reduce((multiplier, residentId) => {
    return multiplier * (RESIDENT_MODULE_INCOME_MULTIPLIERS[residentId]?.[moduleId] ?? 1);
  }, 1);
}

export function getResidentGlobalIncomeMultiplier(state: GameState): number {
  let multiplier = 1;

  if (state.unlockedResidents.includes('teleport_courier')) {
    multiplier *= 1.05;
  }

  if (state.unlockedResidents.includes('retired_cosmonaut') && (state.prestigeCount ?? 0) > 0) {
    multiplier *= 1.1;
  }

  return multiplier;
}

export function getResidentFirstRoomCostMultiplier(state: GameState): number {
  return state.unlockedResidents.includes('three_eyed_housekeeper') ? 0.92 : 1;
}

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
  let comfortGain = 0;

  for (const resident of residents) {
    if (owned.has(resident.id)) {
      continue;
    }

    if (isResidentUnlocked(resident.id, state)) {
      owned.add(resident.id);
      comfortGain += RESIDENT_UNLOCK_COMFORT[resident.id] ?? 0;
      changed = true;
    }
  }

  if (!changed) {
    return state;
  }

  return {
    ...state,
    comfort: state.comfort + comfortGain,
    unlockedResidents: Array.from(owned)
  };
}

export function getVisibleResidents(state: GameState, limit = 4): ResidentDefinition[] {
  const owned = new Set(state.unlockedResidents);

  return residents
    .filter((resident) => !owned.has(resident.id))
    .slice(0, limit);
}
