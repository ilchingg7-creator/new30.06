import type { CommunalDutyDefinition } from '../types';

export const communalDuties: CommunalDutyDefinition[] = [
  {
    id: 'capsule_quiet_hours',
    roomId: 'tenant_capsule',
    eligibleResidentIds: ['sleepy_engineer', 'mist_cook'],
    bestResidentId: 'sleepy_engineer',
    durationMs: 3 * 60 * 1_000,
    outcomes: [
      {
        residentId: 'sleepy_engineer',
        resultKey: 'best',
        reward: {
          comfortGain: 2,
          conditionRepair: { tenant_capsule: 25 }
        }
      },
      {
        residentId: 'mist_cook',
        resultKey: 'alternate',
        reward: {
          comfortGain: 1,
          conditionRepair: { tenant_capsule: 12 }
        }
      }
    ]
  },
  {
    id: 'kitchen_soup_escape',
    roomId: 'cosmo_kitchen',
    eligibleResidentIds: ['mist_cook', 'sleepy_engineer', 'vacuum_gardener'],
    bestResidentId: 'mist_cook',
    durationMs: 3 * 60 * 1_000,
    outcomes: [
      {
        residentId: 'mist_cook',
        resultKey: 'best',
        reward: {
          comfortGain: 3,
          conditionRepair: { cosmo_kitchen: 20 },
          timedBonus: {
            id: 'duty_kitchen_soup_escape',
            incomeMultiplier: 1.2,
            expiresAt: 0
          }
        }
      },
      {
        residentId: 'sleepy_engineer',
        resultKey: 'alternate_engineer',
        reward: {
          conditionRepair: { cosmo_kitchen: 25 }
        }
      },
      {
        residentId: 'vacuum_gardener',
        resultKey: 'alternate_gardener',
        reward: {
          comfortGain: 1,
          conditionRepair: { oxygen_garden: 10 }
        }
      }
    ]
  },
  {
    id: 'garden_vacuum_sprout',
    roomId: 'oxygen_garden',
    eligibleResidentIds: ['vacuum_gardener', 'mist_cook'],
    bestResidentId: 'vacuum_gardener',
    durationMs: 3 * 60 * 1_000,
    outcomes: [
      {
        residentId: 'vacuum_gardener',
        resultKey: 'best',
        reward: {
          comfortGain: 3,
          conditionRepair: { oxygen_garden: 25 }
        }
      },
      {
        residentId: 'mist_cook',
        resultKey: 'alternate',
        reward: {
          comfortGain: 1,
          conditionRepair: { oxygen_garden: 12 }
        }
      }
    ]
  },
  {
    id: 'laundry_sock_orbit',
    roomId: 'zero_g_laundry',
    eligibleResidentIds: ['sock_master', 'sleepy_engineer'],
    bestResidentId: 'sock_master',
    durationMs: 3 * 60 * 1_000,
    outcomes: [
      {
        residentId: 'sock_master',
        resultKey: 'best',
        reward: {
          comfortGain: 4,
          conditionRepair: { zero_g_laundry: 25 }
        }
      },
      {
        residentId: 'sleepy_engineer',
        resultKey: 'alternate',
        reward: {
          conditionRepair: { zero_g_laundry: 18 }
        }
      }
    ]
  }
];
