export type ModuleId =
  | 'tenant_capsule'
  | 'cosmo_kitchen'
  | 'oxygen_garden'
  | 'zero_g_laundry'
  | 'teleport_entry'
  | 'antigrav_gym'
  | 'panorama_dome'
  | 'saucer_dock';

export type ResidentId =
  | 'sleepy_engineer'
  | 'mist_cook'
  | 'vacuum_gardener'
  | 'sock_master'
  | 'teleport_courier'
  | 'vip_astroteenant';

export type GoalId =
  | 'buy_capsule_10'
  | 'unlock_kitchen'
  | 'reach_comfort_25'
  | 'earn_credits_10000'
  | 'unlock_three_residents'
  | 'unlock_panorama_dome'
  | 'first_renovation';

export interface ModuleDefinition {
  id: ModuleId;
  name: string;
  role: string;
  baseCost: number;
  baseIncomePerSecond: number;
  comfortBonus: number;
  unlockAtCredits: number;
  visualKey: string;
}

export interface ResidentDefinition {
  id: ResidentId;
  name: string;
  unlockText: string;
  bonusText: string;
  requiredModule?: ModuleId;
  requiredModuleLevel?: number;
  requiredComfort?: number;
}

export interface GoalDefinition {
  id: GoalId;
  title: string;
  rewardCredits: number;
  rewardComfort: number;
}

export type ModuleLevels = Record<ModuleId, number>;

export interface TimedBonus {
  id: string;
  incomeMultiplier: number;
  expiresAt: number;
}

export interface GameState {
  credits: number;
  totalEarnedCredits: number;
  comfort: number;
  reputation: number;
  moduleLevels: ModuleLevels;
  completedGoals: GoalId[];
  unlockedResidents: ResidentId[];
  timedBonuses: TimedBonus[];
  lastSavedAt: number;
}
