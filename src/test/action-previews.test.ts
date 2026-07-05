import { describe, expect, it } from 'vitest';
import {
  getCommunalDutyAssignmentPreview,
  getCommunalDutyClaimPreview,
  getLastActionFeedback,
  getModulePurchasePreview,
  getRenovationPreview,
  getStationIncidentChoicePreview
} from '../game/actionPreviews';
import { createInitialState } from '../game/economy';
import { translations } from '../platform/i18n';
import type { GameState } from '../game/types';

const t = translations.en;

describe('action previews', () => {
  it('previews a first room purchase with cost, income and comfort impact', () => {
    const state = createInitialState(1_000);

    const preview = getModulePurchasePreview(state, 'tenant_capsule', t);

    expect(preview.tags).toEqual(expect.arrayContaining(['cost', 'income']));
    expect(preview.result).toContain('+1.00/sec');
    expect(preview.reason).toContain('first working room');
  });

  it('previews locked modules with unlock progress instead of purchase impact', () => {
    const state = createInitialState(1_000);

    const preview = getModulePurchasePreview(state, 'cosmo_kitchen', t);

    expect(preview.tone).toBe('warning');
    expect(preview.result).toContain('Unlocks at');
    expect(preview.tags).toContain('cost');
  });

  it('previews a role-matched communal duty assignment reward', () => {
    const state: GameState = {
      ...createInitialState(1_000),
      unlockedResidents: ['sleepy_engineer'],
      roomConditions: { tenant_capsule: 30 }
    };

    const preview = getCommunalDutyAssignmentPreview(state, 'capsule_quiet_hours', 'sleepy_engineer', t);

    expect(preview.tags).toEqual(expect.arrayContaining(['condition', 'role']));
    expect(preview.reason).toContain('maintenance role matches');
    expect(preview.result).toContain('+35 condition');
  });

  it('previews a ready communal duty claim from last computed reward', () => {
    const state: GameState = {
      ...createInitialState(1_000),
      communalDuty: {
        id: 'duty-1',
        dutyId: 'capsule_quiet_hours',
        roomId: 'tenant_capsule',
        status: 'ready_to_claim',
        createdAt: 1_000,
        assignedResidentId: 'sleepy_engineer',
        startedAt: 1_000,
        completesAt: 181_000
      },
      unlockedResidents: ['sleepy_engineer']
    };

    const preview = getCommunalDutyClaimPreview(state, t);

    expect(preview?.result).toContain('+35 condition');
    expect(preview?.tags).toContain('condition');
  });

  it('previews role-gated incident choices with role reason and reward', () => {
    const state: GameState = {
      ...createInitialState(1_000),
      unlockedResidents: ['mist_cook']
    };

    const preview = getStationIncidentChoicePreview(state, 'kitchen_borscht_fog', 'make_borscht_tradition', t);

    expect(preview?.reason).toContain('comfort role');
    expect(preview?.result).toContain('+3 comfort');
    expect(preview?.tags).toEqual(expect.arrayContaining(['comfort', 'role', 'visual']));
  });

  it('previews renovation reset impact and reputation gain', () => {
    const base = createInitialState(1_000);
    const state: GameState = {
      ...base,
      totalEarnedCredits: 200_000,
      comfort: 25,
      moduleLevels: {
        ...base.moduleLevels,
        tenant_capsule: 10,
        cosmo_kitchen: 1
      },
      completedGoals: ['buy_capsule_10', 'unlock_kitchen', 'reach_comfort_25', 'earn_credits_10000']
    };

    const preview = getRenovationPreview(state, t);

    expect(preview.tags).toEqual(expect.arrayContaining(['renovation']));
    expect(preview.result).toContain('+1 reputation');
    expect(preview.reason).toContain('resets rooms and kopeks');
  });

  it('builds last action feedback from a communal duty result', () => {
    const state: GameState = {
      ...createInitialState(1_000),
      lastCommunalDutyResult: {
        dutyId: 'capsule_quiet_hours',
        residentId: 'sleepy_engineer',
        roomId: 'tenant_capsule',
        comfortGain: 2,
        conditionRepair: { tenant_capsule: 35 },
        resultKey: 'best',
        claimedAt: 2_000
      }
    };

    const feedback = getLastActionFeedback(state, t);

    expect(feedback?.title).toContain('Duty result');
    expect(feedback?.detail).toContain('+35 condition');
    expect(feedback?.tags).toContain('condition');
  });
});
