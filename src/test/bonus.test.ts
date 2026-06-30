import { describe, expect, it } from 'vitest';
import { buyModuleLevel, calculateIncomePerSecond, createInitialState } from '../game/economy';

describe('timed bonuses', () => {
  it('multiplies income while a timed bonus is active', () => {
    const now = 10_000;
    const state = {
      ...buyModuleLevel(createInitialState(1_000), 'tenant_capsule'),
      timedBonuses: [
        {
          id: 'rent_x2',
          incomeMultiplier: 2,
          expiresAt: now + 1_000
        }
      ]
    };

    expect(calculateIncomePerSecond(state, now)).toBe(2);
  });

  it('ignores expired timed bonuses', () => {
    const now = 10_000;
    const state = {
      ...buyModuleLevel(createInitialState(1_000), 'tenant_capsule'),
      timedBonuses: [
        {
          id: 'rent_x2',
          incomeMultiplier: 2,
          expiresAt: now - 1
        }
      ]
    };

    expect(calculateIncomePerSecond(state, now)).toBe(1);
  });
});
