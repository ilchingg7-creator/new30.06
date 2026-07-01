import { describe, expect, it } from 'vitest';
import { buyModuleLevel, createInitialState } from '../game/economy';
import { stationTheme } from '../station/stationTheme';
import { createRoomSceneDescriptor } from '../station/roomScenes';

describe('window light cosmetics', () => {
  it('defaults to amber when windowLightColor is not set', () => {
    const state = buyModuleLevel(createInitialState(1_000), 'tenant_capsule');
    // Remove the cosmetic field to simulate an old save.
    const { windowLightColor: _omitted, ...legacy } = state;
    void _omitted;

    const descriptor = createRoomSceneDescriptor(legacy, 'tenant_capsule');

    expect(descriptor.ambientLights[0].color).toBe(stationTheme.lampAmber);
  });

  it('uses the selected window light color for the first ambient light', () => {
    const state = {
      ...buyModuleLevel(createInitialState(1_000), 'tenant_capsule'),
      windowLightColor: 'green' as const
    };

    const descriptor = createRoomSceneDescriptor(state, 'tenant_capsule');

    expect(descriptor.ambientLights[0].color).toBe(stationTheme.enamelGreen);
  });

  it('keeps the accent color independent of the window light color', () => {
    const state = {
      ...buyModuleLevel(createInitialState(1_000), 'tenant_capsule'),
      windowLightColor: 'blue' as const
    };

    const descriptor = createRoomSceneDescriptor(state, 'tenant_capsule');

    // First ambient light follows windowLightColor (blue), accent stays amber.
    expect(descriptor.ambientLights[0].color).toBe(stationTheme.utilityBlue);
    expect(descriptor.accentColor).toBe(stationTheme.lampAmber);
  });

  it('exposes windowLightColor on the descriptor so the shell can render it', () => {
    const state = {
      ...buyModuleLevel(createInitialState(1_000), 'tenant_capsule'),
      windowLightColor: 'red' as const
    };

    const descriptor = createRoomSceneDescriptor(state, 'tenant_capsule');

    expect(descriptor.windowLightColor).toBe(stationTheme.signalRed);
  });

  it('changes the descriptor windowLightColor for each cosmetic option', () => {
    const base = buyModuleLevel(createInitialState(1_000), 'tenant_capsule');

    const amber = createRoomSceneDescriptor({ ...base, windowLightColor: 'amber' }, 'tenant_capsule');
    const green = createRoomSceneDescriptor({ ...base, windowLightColor: 'green' }, 'tenant_capsule');
    const red = createRoomSceneDescriptor({ ...base, windowLightColor: 'red' }, 'tenant_capsule');
    const blue = createRoomSceneDescriptor({ ...base, windowLightColor: 'blue' }, 'tenant_capsule');

    expect(amber.windowLightColor).toBe(stationTheme.lampAmber);
    expect(green.windowLightColor).toBe(stationTheme.enamelGreen);
    expect(red.windowLightColor).toBe(stationTheme.signalRed);
    expect(blue.windowLightColor).toBe(stationTheme.utilityBlue);
    // All four must be distinct.
    expect(new Set([amber, green, red, blue].map((d) => d.windowLightColor)).size).toBe(4);
  });
});
