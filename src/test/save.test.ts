import { describe, expect, it } from 'vitest';
import { createInitialState } from '../game/economy';
import { CURRENT_SCHEMA_VERSION, parseGameState, SAVE_KEY, serializeGameState } from '../game/save';

describe('save serialization', () => {
  it('uses a stable save key', () => {
    expect(SAVE_KEY).toBe('cosmic-communalka-save-v2');
  });

  it('serializes and parses a valid game state with the current schema version', () => {
    const state = {
      ...createInitialState(1_000),
      credits: 123,
      totalEarnedCredits: 456,
      moduleLevels: {
        ...createInitialState(1_000).moduleLevels,
        tenant_capsule: 3
      }
    };

    const serialized = serializeGameState(state);
    const parsed = JSON.parse(serialized);

    expect(parsed.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    // Round-trip drops the injected schemaVersion via parseGameState returning a typed state.
    expect(parseGameState(serialized)).toEqual({ ...state, schemaVersion: CURRENT_SCHEMA_VERSION });
  });

  it('returns null for absent, invalid or incomplete saves', () => {
    expect(parseGameState(null)).toBeNull();
    expect(parseGameState('not-json')).toBeNull();
    expect(parseGameState(JSON.stringify({ credits: 1 }))).toBeNull();
  });

  it('rejects saves from a newer schema version', () => {
    const future = {
      ...createInitialState(1_000),
      schemaVersion: CURRENT_SCHEMA_VERSION + 1
    };

    expect(parseGameState(JSON.stringify(future))).toBeNull();
  });

  it('migrates a legacy v1 save (no schemaVersion) by backfilling optional fields', () => {
    const legacy = {
      credits: 100,
      totalEarnedCredits: 500,
      comfort: 5,
      reputation: 0,
      moduleLevels: {
        tenant_capsule: 1,
        cosmo_kitchen: 0,
        oxygen_garden: 0,
        zero_g_laundry: 0,
        teleport_entry: 0,
        antigrav_gym: 0,
        panorama_dome: 0,
        saucer_dock: 0,
        radiator_balcony: 0,
        mail_tube_office: 0
      },
      completedGoals: [],
      unlockedResidents: [],
      timedBonuses: [],
      lastSavedAt: 1_000
      // No windowLightColor, purchasedPrestigeUpgrades, unlockedAchievements,
      // lastLoginDay, dailyStreak, or schemaVersion.
    };

    const migrated = parseGameState(JSON.stringify(legacy));

    expect(migrated).not.toBeNull();
    expect(migrated?.windowLightColor).toBe('amber');
    expect(migrated?.purchasedPrestigeUpgrades).toEqual([]);
    expect(migrated?.unlockedAchievements).toEqual([]);
    expect(migrated?.dailyStreak).toBeUndefined();
    expect(JSON.parse(serializeGameState(migrated!)).schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
  });

  it('preserves existing optional fields when migrating a v1 save', () => {
    const legacyWithCosmetics = {
      credits: 0,
      totalEarnedCredits: 0,
      comfort: 0,
      reputation: 0,
      moduleLevels: {
        tenant_capsule: 0,
        cosmo_kitchen: 0,
        oxygen_garden: 0,
        zero_g_laundry: 0,
        teleport_entry: 0,
        antigrav_gym: 0,
        panorama_dome: 0,
        saucer_dock: 0,
        radiator_balcony: 0,
        mail_tube_office: 0
      },
      completedGoals: [],
      unlockedResidents: [],
      timedBonuses: [],
      lastSavedAt: 0,
      windowLightColor: 'green',
      dailyStreak: 3
    };

    const migrated = parseGameState(JSON.stringify(legacyWithCosmetics));

    expect(migrated?.windowLightColor).toBe('green');
    expect(migrated?.dailyStreak).toBe(3);
    expect(JSON.parse(serializeGameState(migrated!)).schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
  });

  it('parses saves without communal duty fields as valid legacy-compatible state', () => {
    const state = createInitialState(1_000);
    const raw = JSON.stringify({ ...state, schemaVersion: CURRENT_SCHEMA_VERSION });

    const parsed = parseGameState(raw);

    expect(parsed).not.toBeNull();
    expect(parsed?.communalDuty).toBeUndefined();
    expect(parsed?.lastCommunalDutyResolvedAt).toBeUndefined();
  });

  it('round-trips a valid available communal duty', () => {
    const state = {
      ...createInitialState(1_000),
      communalDuty: {
        id: 'duty-1',
        dutyId: 'capsule_quiet_hours' as const,
        roomId: 'tenant_capsule' as const,
        status: 'available' as const,
        createdAt: 1_000
      },
      lastCommunalDutyResolvedAt: 500
    };

    const parsed = parseGameState(serializeGameState(state));

    expect(parsed?.communalDuty?.dutyId).toBe('capsule_quiet_hours');
    expect(parsed?.lastCommunalDutyResolvedAt).toBe(500);
  });

  it('rejects saves with invalid communal duty ids', () => {
    const state = createInitialState(1_000);
    const raw = JSON.stringify({
      ...state,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      communalDuty: {
        id: 'duty-bad',
        dutyId: 'not_a_duty',
        roomId: 'tenant_capsule',
        status: 'available',
        createdAt: 1_000
      }
    });

    expect(parseGameState(raw)).toBeNull();
  });
});
