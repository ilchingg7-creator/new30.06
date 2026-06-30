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
});
