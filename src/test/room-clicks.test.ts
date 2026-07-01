import { describe, expect, it } from 'vitest';
import { createInitialState } from '../game/economy';
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
});
