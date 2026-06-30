import { describe, expect, it } from 'vitest';
import { modules } from '../game/content/modules';
import type { ModuleId, RoomSpriteLayer } from '../game/types';
import { getRoomDetailLevel, getRoomSpriteLayers } from '../station/roomScenes';
import { roomSpriteManifests } from '../station/roomSpriteManifests';

describe('room detail level (granular tier)', () => {
  it('returns 0 for locked rooms (level 0)', () => {
    expect(getRoomDetailLevel(0)).toBe(0);
  });

  it('returns 1 for the first level (1-10)', () => {
    expect(getRoomDetailLevel(1)).toBe(1);
    expect(getRoomDetailLevel(10)).toBe(1);
  });

  it('increments every 10 levels', () => {
    expect(getRoomDetailLevel(11)).toBe(2);
    expect(getRoomDetailLevel(20)).toBe(2);
    expect(getRoomDetailLevel(21)).toBe(3);
    expect(getRoomDetailLevel(30)).toBe(3);
    expect(getRoomDetailLevel(50)).toBe(5);
    expect(getRoomDetailLevel(99)).toBe(10);
  });

  it('caps at 10 for level 100+', () => {
    expect(getRoomDetailLevel(100)).toBe(10);
    expect(getRoomDetailLevel(150)).toBe(10);
    expect(getRoomDetailLevel(999)).toBe(10);
  });
});

describe('room sprite manifests', () => {
  it('defines a manifest for every module', () => {
    for (const module of modules) {
      const manifest = roomSpriteManifests[module.id as ModuleId];

      expect(manifest, `manifest for ${module.id}`).toBeDefined();
      expect(manifest.length).toBeGreaterThan(0);
    }
  });

  it('every manifest has a base layer unlocking at level 1', () => {
    for (const module of modules) {
      const manifest = roomSpriteManifests[module.id as ModuleId];
      const base = manifest.find((layer) => layer.id === 'base');

      expect(base, `base layer for ${module.id}`).toBeDefined();
      expect(base?.unlockLevel).toBe(1);
    }
  });

  it('every manifest has exactly 11 layers (one per detail level)', () => {
    for (const module of modules) {
      const manifest = roomSpriteManifests[module.id as ModuleId];

      expect(manifest).toHaveLength(11);
    }
  });

  it('layers unlock at levels 1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100', () => {
    const expectedLevels = [1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

    for (const module of modules) {
      const manifest = roomSpriteManifests[module.id as ModuleId];
      const unlockLevels = manifest.map((layer) => layer.unlockLevel).sort((a, b) => a - b);

      expect(unlockLevels).toEqual(expectedLevels);
    }
  });

  it('texture paths follow the /sprites/rooms/<moduleId>/<layer>.png convention', () => {
    for (const module of modules) {
      const manifest = roomSpriteManifests[module.id as ModuleId];

      for (const layer of manifest) {
        expect(layer.texture).toMatch(/^\/sprites\/rooms\/[^/]+\/[^/]+\.png$/);
      }
    }
  });
});

describe('getRoomSpriteLayers', () => {
  it('returns no layers for a locked room (level 0)', () => {
    const layers = getRoomSpriteLayers('tenant_capsule', 0);

    expect(layers).toHaveLength(0);
  });

  it('returns only the base layer at level 1', () => {
    const layers = getRoomSpriteLayers('tenant_capsule', 1);

    expect(layers).toHaveLength(1);
    expect(layers[0].id).toBe('base');
  });

  it('adds the resident layer at level 10', () => {
    const layers = getRoomSpriteLayers('tenant_capsule', 10);

    expect(layers).toHaveLength(2);
    expect(layers.map((l) => l.id)).toContain('resident-1');
  });

  it('adds a new layer every 10 levels', () => {
    expect(getRoomSpriteLayers('cosmo_kitchen', 20)).toHaveLength(3);
    expect(getRoomSpriteLayers('cosmo_kitchen', 30)).toHaveLength(4);
    expect(getRoomSpriteLayers('cosmo_kitchen', 50)).toHaveLength(6);
  });

  it('returns all 11 layers at level 100', () => {
    const layers = getRoomSpriteLayers('oxygen_garden', 100);

    expect(layers).toHaveLength(11);
  });

  it('returns layers sorted by z (render order)', () => {
    const layers = getRoomSpriteLayers('tenant_capsule', 100) as RoomSpriteLayer[];
    const zValues = layers.map((l) => l.z ?? l.unlockLevel);

    // Check that z values are in non-decreasing order.
    for (let i = 1; i < zValues.length; i += 1) {
      expect(zValues[i]).toBeGreaterThanOrEqual(zValues[i - 1]);
    }
  });

  it('resident and work-prop layers have animations', () => {
    const layers = getRoomSpriteLayers('tenant_capsule', 20);
    const resident = layers.find((l) => l.id === 'resident-1');
    const workProp = layers.find((l) => l.id === 'work-prop');

    expect(resident?.animation).toBeDefined();
    expect(workProp?.animation).toBeDefined();
  });

  it('base layer has no animation', () => {
    const layers = getRoomSpriteLayers('tenant_capsule', 1);
    const base = layers.find((l) => l.id === 'base');

    expect(base?.animation).toBeUndefined();
  });
});
