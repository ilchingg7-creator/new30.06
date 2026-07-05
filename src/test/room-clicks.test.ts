import { describe, expect, it } from 'vitest';
import { calculateIncomePerSecond, createInitialState } from '../game/economy';
import { applyRoomClickReward } from '../game/roomClicks';

describe('room click reward', () => {
  it('grants kopeks without repairing room condition', () => {
    const base = createInitialState(1_000);
    const state = {
      ...base,
      moduleLevels: {
        ...base.moduleLevels,
        tenant_capsule: 10
      },
      roomConditions: {
        tenant_capsule: 25
      }
    };

    const clicked = applyRoomClickReward(state);

    expect(clicked.credits).toBeGreaterThan(state.credits);
    expect(clicked.totalEarnedCredits).toBeGreaterThan(state.totalEarnedCredits);
    expect(clicked.roomConditions?.tenant_capsule).toBe(25);
  });

  it('keeps manual clicking as a small bonus instead of a second income stream', () => {
    const base = createInitialState(1_000);
    const state = {
      ...base,
      moduleLevels: {
        ...base.moduleLevels,
        tenant_capsule: 100,
        cosmo_kitchen: 50,
        oxygen_garden: 25
      }
    };

    const clicked = applyRoomClickReward(state);
    const clickReward = clicked.credits - state.credits;
    const incomePerSecond = calculateIncomePerSecond(state);

    expect(clickReward).toBeLessThanOrEqual(1 + Math.floor(incomePerSecond * 0.12));
  });
});
