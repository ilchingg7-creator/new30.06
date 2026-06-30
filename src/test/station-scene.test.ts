import { describe, expect, it } from 'vitest';
import { buyModuleLevel, createInitialState } from '../game/economy';
import { stationTheme } from '../station/stationTheme';
import { calculateStationSceneFit, createStationModuleSprites, createStationSceneDetails } from '../station/stationScene';

describe('station scene mapping', () => {
  it('creates one sprite descriptor for every MVP module', () => {
    const sprites = createStationModuleSprites(createInitialState(1_000));

    expect(sprites).toHaveLength(8);
  });

  it('uses utility blue for locked or empty module hardpoints', () => {
    const sprites = createStationModuleSprites(createInitialState(1_000));

    expect(sprites.every((sprite) => sprite.active === false)).toBe(true);
    expect(sprites.every((sprite) => sprite.tint === stationTheme.utilityBlue)).toBe(true);
  });

  it('uses lamp amber for purchased modules', () => {
    const state = buyModuleLevel(createInitialState(1_000), 'tenant_capsule');
    const sprites = createStationModuleSprites(state);

    expect(sprites[0]).toMatchObject({
      moduleId: 'tenant_capsule',
      active: true,
      tint: stationTheme.lampAmber
    });
  });

  it('keeps descriptor positions stable', () => {
    const sprites = createStationModuleSprites(createInitialState(1_000));

    expect(
      sprites.map((sprite) => ({
        moduleId: sprite.moduleId,
        x: sprite.x,
        y: sprite.y
      }))
    ).toEqual([
      { moduleId: 'tenant_capsule', x: 150, y: 210 },
      { moduleId: 'cosmo_kitchen', x: 280, y: 170 },
      { moduleId: 'oxygen_garden', x: 420, y: 210 },
      { moduleId: 'zero_g_laundry', x: 560, y: 170 },
      { moduleId: 'teleport_entry', x: 700, y: 210 },
      { moduleId: 'antigrav_gym', x: 280, y: 330 },
      { moduleId: 'panorama_dome', x: 420, y: 370 },
      { moduleId: 'saucer_dock', x: 560, y: 330 }
    ]);
  });

  it('describes polished ambient scene details', () => {
    const state = buyModuleLevel(createInitialState(1_000), 'tenant_capsule');
    const details = createStationSceneDetails(state);

    expect(details.stars).toHaveLength(18);
    expect(details.antennas).toHaveLength(2);
    expect(details.activeWindowCount).toBe(1);
    expect(details.lockedHardpointCount).toBe(7);
    expect(details.hasOxygenGardenAccent).toBe(true);
    expect(details.hasTeleportAccent).toBe(true);
  });

  it('fits the fixed station composition inside the canvas bounds', () => {
    const mobileFit = calculateStationSceneFit(390, 260);
    const desktopFit = calculateStationSceneFit(572, 560);

    expect(mobileFit.scale).toBeCloseTo(390 / 840);
    expect(mobileFit.x).toBe(0);
    expect(mobileFit.y).toBeGreaterThan(0);
    expect(mobileFit.width).toBeLessThanOrEqual(390);
    expect(mobileFit.height).toBeLessThanOrEqual(260);

    expect(desktopFit.width).toBeLessThanOrEqual(572);
    expect(desktopFit.height).toBeLessThanOrEqual(560);
    expect(desktopFit.x).toBe(0);
    expect(desktopFit.y).toBeGreaterThan(0);
  });
});
