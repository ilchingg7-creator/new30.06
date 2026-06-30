import { describe, expect, it } from 'vitest';
import { modules } from '../game/content/modules';
import type { ModuleId } from '../game/types';
import { getRoomDetailLevel } from '../station/roomScenes';
import { getRoomSpriteVariant } from '../station/spriteScene';
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

describe('room sprite manifests (full-image variants)', () => {
  it('defines a manifest for every module', () => {
    for (const module of modules) {
      const manifest = roomSpriteManifests[module.id as ModuleId];

      expect(manifest, `manifest for ${module.id}`).toBeDefined();
      expect(manifest.length).toBe(10); // detail levels 1..10
    }
  });

  it('every manifest has exactly 10 variants (detail levels 1..10)', () => {
    for (const module of modules) {
      const manifest = roomSpriteManifests[module.id as ModuleId];
      const detailLevels = manifest.map((v) => v.detailLevel).sort((a, b) => a - b);

      expect(detailLevels).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    }
  });

  it('variant unlock levels are 1, 11, 21, 31, 41, 51, 61, 71, 81, 91', () => {
    const expected = [1, 11, 21, 31, 41, 51, 61, 71, 81, 91];

    for (const module of modules) {
      const manifest = roomSpriteManifests[module.id as ModuleId];
      const unlockLevels = manifest.map((v) => v.unlockLevel);

      expect(unlockLevels).toEqual(expected);
    }
  });

  it('texture paths follow /sprites/rooms/<moduleId>/tier-<detailLevel>.png', () => {
    for (const module of modules) {
      const manifest = roomSpriteManifests[module.id as ModuleId];

      for (const variant of manifest) {
        expect(variant.texture).toMatch(
          new RegExp(`^/sprites/rooms/${module.id}/tier-[1-9]|10\\.png$`)
        );
      }
    }
  });

  it('higher detail levels have animations (bob or pulse)', () => {
    for (const module of modules) {
      const manifest = roomSpriteManifests[module.id as ModuleId];
      const tier8 = manifest.find((v) => v.detailLevel === 8);
      const tier5 = manifest.find((v) => v.detailLevel === 5);

      expect(tier8?.animation).toBeDefined();
      expect(tier5?.animation).toBeDefined();
    }
  });

  it('tier 1 has no animation (bare room)', () => {
    for (const module of modules) {
      const manifest = roomSpriteManifests[module.id as ModuleId];
      const tier1 = manifest.find((v) => v.detailLevel === 1);

      expect(tier1?.animation).toBeUndefined();
    }
  });
});

describe('getRoomSpriteVariant', () => {
  it('returns null for locked rooms (level 0)', () => {
    expect(getRoomSpriteVariant('tenant_capsule', 0)).toBeNull();
  });

  it('returns tier-1 variant for level 1', () => {
    const variant = getRoomSpriteVariant('tenant_capsule', 1);

    expect(variant).not.toBeNull();
    expect(variant?.detailLevel).toBe(1);
    expect(variant?.texture).toBe('/sprites/rooms/tenant_capsule/tier-1.png');
  });

  it('returns tier-1 for levels 1-10', () => {
    expect(getRoomSpriteVariant('cosmo_kitchen', 5)?.detailLevel).toBe(1);
    expect(getRoomSpriteVariant('cosmo_kitchen', 10)?.detailLevel).toBe(1);
  });

  it('returns tier-2 for level 11', () => {
    expect(getRoomSpriteVariant('cosmo_kitchen', 11)?.detailLevel).toBe(2);
  });

  it('returns tier-10 for level 100+', () => {
    expect(getRoomSpriteVariant('oxygen_garden', 100)?.detailLevel).toBe(10);
    expect(getRoomSpriteVariant('oxygen_garden', 150)?.detailLevel).toBe(10);
  });

  it('picks the highest variant whose unlockLevel does not exceed the current level', () => {
    // Level 25 → detail level 3 (unlockLevel 21), not 4 (unlockLevel 31)
    const variant = getRoomSpriteVariant('tenant_capsule', 25);

    expect(variant?.detailLevel).toBe(3);
    expect(variant?.unlockLevel).toBe(21);
  });
});
