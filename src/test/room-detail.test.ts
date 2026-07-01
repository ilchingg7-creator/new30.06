import { describe, expect, it } from 'vitest';
import { buyModuleLevel, createInitialState } from '../game/economy';
import { createRoomSceneDescriptor, getRoomDetailLevel } from '../station/roomScenes';

describe('room detail level (granular Graphics progression)', () => {
  it('returns 0 for locked rooms (level 0)', () => {
    expect(getRoomDetailLevel(0)).toBe(0);
  });

  it('returns 1 for levels 1-10', () => {
    expect(getRoomDetailLevel(1)).toBe(1);
    expect(getRoomDetailLevel(10)).toBe(1);
  });

  it('increments every 10 levels', () => {
    expect(getRoomDetailLevel(11)).toBe(2);
    expect(getRoomDetailLevel(20)).toBe(2);
    expect(getRoomDetailLevel(21)).toBe(3);
    expect(getRoomDetailLevel(50)).toBe(5);
    expect(getRoomDetailLevel(99)).toBe(10);
  });

  it('caps at 10 for level 100+', () => {
    expect(getRoomDetailLevel(100)).toBe(10);
    expect(getRoomDetailLevel(150)).toBe(10);
  });
});

describe('room scene detail progression (hardcoded Graphics)', () => {
  it('base level (detail 1) has only the 3 base props', () => {
    const state = buyModuleLevel(createInitialState(1_000), 'tenant_capsule');
    const descriptor = createRoomSceneDescriptor(state, 'tenant_capsule');

    // base props: lamp + patch + bed = 3
    expect(descriptor.props).toHaveLength(3);
  });

  it('detail level 2 (level 11) adds an extra lamp', () => {
    const state = { ...createInitialState(1_000), credits: 1e9 };
    let s = state;
    for (let i = 0; i < 11; i += 1) {
      s = buyModuleLevel(s, 'tenant_capsule');
    }
    const descriptor = createRoomSceneDescriptor(s, 'tenant_capsule');

    // 3 base + 1 extra lamp = 4
    expect(descriptor.props).toHaveLength(4);
  });

  it('detail level 5 (level 41-50) adds multiple props', () => {
    const state = { ...createInitialState(1_000), credits: 1e9 };
    let s = state;
    for (let i = 0; i < 45; i += 1) {
      s = buyModuleLevel(s, 'tenant_capsule');
    }
    const descriptor = createRoomSceneDescriptor(s, 'tenant_capsule');

    // 3 base + lamp(2) + patch(3) + lamp(4) + patch(5) = 7
    expect(descriptor.props.length).toBeGreaterThanOrEqual(7);
  });

  it('detail level 10 (level 100+) has the most props', () => {
    const state = { ...createInitialState(1_000), credits: 1e12 };
    let s = state;
    for (let i = 0; i < 100; i += 1) {
      s = buyModuleLevel(s, 'tenant_capsule');
    }
    const descriptor = createRoomSceneDescriptor(s, 'tenant_capsule');

    // 3 base + 9 detail additions + 2 final = 14
    expect(descriptor.props.length).toBeGreaterThanOrEqual(12);
  });

  it('ambient lights grow with detail level', () => {
    const baseState = buyModuleLevel(createInitialState(1_000), 'tenant_capsule');
    const baseDescriptor = createRoomSceneDescriptor(baseState, 'tenant_capsule');
    expect(baseDescriptor.ambientLights).toHaveLength(2);

    const highState = { ...createInitialState(1_000), credits: 1e12 };
    let s = highState;
    for (let i = 0; i < 100; i += 1) {
      s = buyModuleLevel(s, 'tenant_capsule');
    }
    const highDescriptor = createRoomSceneDescriptor(s, 'tenant_capsule');
    expect(highDescriptor.ambientLights.length).toBeGreaterThan(2);
  });
});
