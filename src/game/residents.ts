import { residents } from './content/residents';
import type {
  GameState,
  ModuleId,
  ResidentDefinition,
  ResidentId,
  ResidentRole,
  ResidentRoleProfile,
  ResidentRoleTotals
} from './types';

const RESIDENT_MODULE_INCOME_MULTIPLIERS: Partial<Record<ResidentId, Partial<Record<ModuleId, number>>>> = {
  sleepy_engineer: { tenant_capsule: 1.05 },
  mist_cook: { cosmo_kitchen: 1.1 },
  sock_master: { zero_g_laundry: 1.1 }
};

const RESIDENT_UNLOCK_COMFORT: Partial<Record<ResidentId, number>> = {
  vacuum_gardener: 5
};

/**
 * Returns the comfort gained when this resident is first unlocked.
 * Most residents use the static RESIDENT_UNLOCK_COMFORT map; the
 * orbital_beekeeper scales with the oxygen_garden level at unlock time
 * (+1 comfort per 5 garden levels), rewarding players who delay unlocking.
 */
function getResidentUnlockComfort(residentId: ResidentId, state: GameState): number {
  if (residentId === 'orbital_beekeeper') {
    return Math.floor(state.moduleLevels.oxygen_garden / 5);
  }

  return RESIDENT_UNLOCK_COMFORT[residentId] ?? 0;
}

const EMPTY_RESIDENT_ROLE_TOTALS: ResidentRoleTotals = {
  income: 0,
  comfort: 0,
  maintenance: 0,
  visitor: 0,
  renovation: 0
};

const RESIDENT_ROLE_PROFILES: Record<ResidentId, ResidentRoleProfile> = {
  sleepy_engineer: { primary: 'maintenance', secondary: 'income' },
  mist_cook: { primary: 'comfort', secondary: 'income' },
  vacuum_gardener: { primary: 'comfort', secondary: 'maintenance' },
  sock_master: { primary: 'maintenance', secondary: 'comfort' },
  teleport_courier: { primary: 'visitor', secondary: 'income' },
  vip_astroteenant: { primary: 'income', secondary: 'visitor' },
  retired_cosmonaut: { primary: 'renovation', secondary: 'comfort' },
  three_eyed_housekeeper: { primary: 'maintenance', secondary: 'visitor' },
  comet_plumber: { primary: 'maintenance', secondary: 'comfort' },
  signal_radio_host: { primary: 'visitor', secondary: 'comfort' },
  floating_librarian: { primary: 'comfort', secondary: 'renovation' },
  tiny_saucer_family: { primary: 'income', secondary: 'visitor' },
  orbital_beekeeper: { primary: 'comfort', secondary: 'maintenance' }
};

export function getResidentRoleProfile(residentId: ResidentId): ResidentRoleProfile {
  return RESIDENT_ROLE_PROFILES[residentId];
}

export function getResidentRoleTotals(state: GameState): ResidentRoleTotals {
  return state.unlockedResidents.reduce<ResidentRoleTotals>((totals, residentId) => {
    const profile = getResidentRoleProfile(residentId);

    totals[profile.primary] += 2;

    if (profile.secondary) {
      totals[profile.secondary] += 1;
    }

    return totals;
  }, { ...EMPTY_RESIDENT_ROLE_TOTALS });
}

export function hasResidentRole(state: GameState, role: ResidentRole, points = 1): boolean {
  return getResidentRoleTotals(state)[role] >= points;
}

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

  // Floating Librarian: +10% global income when comfort >= 50
  if (state.unlockedResidents.includes('floating_librarian') && state.comfort >= 50) {
    multiplier *= 1.1;
  }

  // Tiny Saucer Family: +3% per unlocked resident
  if (state.unlockedResidents.includes('tiny_saucer_family')) {
    multiplier *= 1 + 0.03 * state.unlockedResidents.length;
  }

  return multiplier;
}

export function getResidentFirstRoomCostMultiplier(state: GameState): number {
  return state.unlockedResidents.includes('three_eyed_housekeeper') ? 0.92 : 1;
}

/**
 * Signal Radio Host: +20% to timed bonus duration.
 * Applied when creating timed bonuses from goals, incidents, and ad buttons.
 */
export function getTimedBonusDurationMultiplier(state: GameState): number {
  return state.unlockedResidents.includes('signal_radio_host') ? 1.2 : 1;
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
      comfortGain += getResidentUnlockComfort(resident.id, state);
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
