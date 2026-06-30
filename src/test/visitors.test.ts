import { describe, expect, it } from 'vitest';
import { buyModuleLevel, createInitialState } from '../game/economy';
import {
  acceptVisitor,
  declineVisitor,
  generateVisitorRequest,
  isVisitorExpired
} from '../game/visitors';

describe('visitor requests', () => {
  it('does not spawn a visitor without any modules', () => {
    const state = createInitialState(1_000);

    expect(generateVisitorRequest(state, 5_000)).toBeNull();
  });

  it('spawns a visitor with a cost, reward, and expiry when modules exist', () => {
    const state = buyModuleLevel({ ...createInitialState(1_000), credits: 1_000 }, 'tenant_capsule');
    const visitor = generateVisitorRequest(state, 5_000);

    expect(visitor).not.toBeNull();
    expect(visitor?.id).toMatch(/^visitor-/);
    expect(visitor?.cost).toBeGreaterThan(0);
    expect(visitor?.rewardComfort).toBeGreaterThan(0);
    expect(visitor?.expiresAt).toBeGreaterThan(5_000);
  });

  it('does not spawn a visitor when one is already active', () => {
    const state = {
      ...buyModuleLevel({ ...createInitialState(1_000), credits: 1_000 }, 'tenant_capsule'),
      activeVisitor: {
        id: 'existing',
        name: 'Existing',
        flavor: '',
        cost: 100,
        rewardComfort: 1,
        expiresAt: 10_000
      }
    };

    expect(generateVisitorRequest(state, 5_000)).toBeNull();
  });

  it('acceptVisitor deducts credits, adds comfort, and clears the visitor', () => {
    const state = {
      ...buyModuleLevel({ ...createInitialState(1_000), credits: 1_000 }, 'tenant_capsule'),
      credits: 500,
      comfort: 5,
      activeVisitor: {
        id: 'v1',
        name: 'Test',
        flavor: '',
        cost: 200,
        rewardComfort: 3,
        expiresAt: 10_000
      }
    };

    const next = acceptVisitor(state, 5_000);

    expect(next.credits).toBe(300);
    expect(next.comfort).toBe(8);
    expect(next.activeVisitor).toBeNull();
  });

  it('acceptVisitor does nothing when the player cannot afford the cost', () => {
    const state = {
      ...createInitialState(1_000),
      credits: 50,
      comfort: 0,
      activeVisitor: {
        id: 'v1',
        name: 'Test',
        flavor: '',
        cost: 200,
        rewardComfort: 3,
        expiresAt: 10_000
      }
    };

    const next = acceptVisitor(state, 5_000);

    expect(next).toBe(state);
    expect(next.activeVisitor).not.toBeNull();
  });

  it('acceptVisitor clears expired visitors without reward', () => {
    const state = {
      ...createInitialState(1_000),
      credits: 1000,
      comfort: 5,
      activeVisitor: {
        id: 'v1',
        name: 'Test',
        flavor: '',
        cost: 200,
        rewardComfort: 3,
        expiresAt: 5_000
      }
    };

    const next = acceptVisitor(state, 6_000);

    expect(next.credits).toBe(1000);
    expect(next.comfort).toBe(5);
    expect(next.activeVisitor).toBeNull();
  });

  it('declineVisitor clears the visitor without changing credits or comfort', () => {
    const state = {
      ...createInitialState(1_000),
      credits: 500,
      comfort: 5,
      activeVisitor: {
        id: 'v1',
        name: 'Test',
        flavor: '',
        cost: 200,
        rewardComfort: 3,
        expiresAt: 10_000
      }
    };

    const next = declineVisitor(state);

    expect(next.credits).toBe(500);
    expect(next.comfort).toBe(5);
    expect(next.activeVisitor).toBeNull();
  });

  it('isVisitorExpired returns true past the expiry time', () => {
    const state = {
      ...createInitialState(1_000),
      activeVisitor: {
        id: 'v1',
        name: 'Test',
        flavor: '',
        cost: 100,
        rewardComfort: 1,
        expiresAt: 5_000
      }
    };

    expect(isVisitorExpired(state, 4_999)).toBe(false);
    expect(isVisitorExpired(state, 5_001)).toBe(true);
  });
});
