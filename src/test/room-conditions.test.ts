import { describe, expect, it } from 'vitest';
import { buyModuleLevel, calculateIncomePerSecond, createInitialState } from '../game/economy';
import {
  decayRoomConditions,
  getOverallConditionMultiplier,
  getRoomCondition,
  getRoomConditionMultiplier,
  getRoomConditionStatus,
  initializeRoomCondition,
  repairRoom,
  DECAY_INTERVAL_SECONDS,
  INITIAL_CONDITION,
  REPAIR_PER_CLICK,
  PRISTINE_THRESHOLD,
  WORN_THRESHOLD
} from '../game/roomConditions';

describe('room condition system', () => {
  it('returns INITIAL_CONDITION for rooms without a stored condition', () => {
    const state = createInitialState(1_000);

    expect(getRoomCondition(state, 'tenant_capsule')).toBe(INITIAL_CONDITION);
  });

  it('initializes condition on first room purchase', () => {
    let state = { ...createInitialState(1_000), credits: 1_000 };
    state = buyModuleLevel(state, 'tenant_capsule');

    expect(state.roomConditions?.tenant_capsule).toBe(INITIAL_CONDITION);
  });

  it('repairRoom increases condition by REPAIR_PER_CLICK', () => {
    const state = {
      ...createInitialState(1_000),
      roomConditions: { tenant_capsule: 30 }
    };

    const repaired = repairRoom(state, 'tenant_capsule');

    expect(repaired.roomConditions?.tenant_capsule).toBe(30 + REPAIR_PER_CLICK);
  });

  it('repairRoom caps at 100', () => {
    const state = {
      ...createInitialState(1_000),
      roomConditions: { tenant_capsule: 95 }
    };

    const repaired = repairRoom(state, 'tenant_capsule');

    expect(repaired.roomConditions?.tenant_capsule).toBe(100);
  });

  it('decayRoomConditions reduces all unlocked rooms by 1', () => {
    const state = {
      ...createInitialState(1_000),
      moduleLevels: { ...createInitialState(1_000).moduleLevels, tenant_capsule: 1, cosmo_kitchen: 1 },
      roomConditions: { tenant_capsule: 60, cosmo_kitchen: 50 }
    };

    const decayed = decayRoomConditions(state);

    expect(decayed.roomConditions?.tenant_capsule).toBe(59);
    expect(decayed.roomConditions?.cosmo_kitchen).toBe(49);
  });

  it('decayRoomConditions does not affect locked rooms', () => {
    const state = {
      ...createInitialState(1_000),
      roomConditions: {}
    };

    const decayed = decayRoomConditions(state);

    expect(decayed).toBe(state);
  });

  it('decayRoomConditions does not go below 0', () => {
    const state = {
      ...createInitialState(1_000),
      moduleLevels: { ...createInitialState(1_000).moduleLevels, tenant_capsule: 1 },
      roomConditions: { tenant_capsule: 0 }
    };

    const decayed = decayRoomConditions(state);

    expect(decayed.roomConditions?.tenant_capsule).toBe(0);
  });

  it('decays room condition on the slower communal-duty rhythm', () => {
    expect(DECAY_INTERVAL_SECONDS).toBe(180);
  });
});

describe('room condition status and multipliers', () => {
  it('returns pristine for condition >= 80', () => {
    expect(getRoomConditionStatus(80)).toBe('pristine');
    expect(getRoomConditionStatus(100)).toBe('pristine');
  });

  it('returns working for condition 30-79', () => {
    expect(getRoomConditionStatus(30)).toBe('working');
    expect(getRoomConditionStatus(79)).toBe('working');
  });

  it('returns worn for condition 1-29', () => {
    expect(getRoomConditionStatus(1)).toBe('worn');
    expect(getRoomConditionStatus(29)).toBe('worn');
  });

  it('returns broken for condition 0', () => {
    expect(getRoomConditionStatus(0)).toBe('broken');
  });

  it('pristine gives +10% multiplier', () => {
    expect(getRoomConditionMultiplier(80)).toBe(1.1);
    expect(getRoomConditionMultiplier(100)).toBe(1.1);
  });

  it('working gives 1.0 multiplier', () => {
    expect(getRoomConditionMultiplier(50)).toBe(1.0);
  });

  it('worn gives 1.0 multiplier (no penalty, just visual)', () => {
    expect(getRoomConditionMultiplier(20)).toBe(1.0);
  });

  it('broken gives -20% multiplier', () => {
    expect(getRoomConditionMultiplier(0)).toBe(0.8);
  });
});

describe('overall condition multiplier', () => {
  it('returns 1.0 when no rooms are unlocked', () => {
    const state = createInitialState(1_000);

    expect(getOverallConditionMultiplier(state)).toBe(1.0);
  });

  it('returns 1.1 when all rooms are pristine', () => {
    const state = {
      ...createInitialState(1_000),
      moduleLevels: { ...createInitialState(1_000).moduleLevels, tenant_capsule: 1 },
      roomConditions: { tenant_capsule: 100 }
    };

    expect(getOverallConditionMultiplier(state)).toBeCloseTo(1.1, 5);
  });

  it('returns 0.8 when all rooms are broken', () => {
    const state = {
      ...createInitialState(1_000),
      moduleLevels: { ...createInitialState(1_000).moduleLevels, tenant_capsule: 1 },
      roomConditions: { tenant_capsule: 0 }
    };

    expect(getOverallConditionMultiplier(state)).toBeCloseTo(0.8, 5);
  });

  it('affects income calculation', () => {
    const pristine = {
      ...createInitialState(1_000),
      moduleLevels: { ...createInitialState(1_000).moduleLevels, tenant_capsule: 1 },
      roomConditions: { tenant_capsule: 100 }
    };
    const broken = {
      ...createInitialState(1_000),
      moduleLevels: { ...createInitialState(1_000).moduleLevels, tenant_capsule: 1 },
      roomConditions: { tenant_capsule: 0 }
    };

    const pristineIncome = calculateIncomePerSecond(pristine);
    const brokenIncome = calculateIncomePerSecond(broken);

    expect(pristineIncome).toBeGreaterThan(brokenIncome);
  });
});
