import type { ModuleId, RoomSpriteVariant } from '../game/types';

/**
 * Full-room artwork variants for every room. Each room has up to 10
 * variants (detail levels 1..10), one per 10 module levels. When the
 * module levels up past a threshold, the ENTIRE room image swaps to the
 * richer variant — the room stays the same room (kitchen stays kitchen),
 * only the amount of detail grows.
 *
 * Detail levels map to module levels:
 *   1 → levels 1-10    (basic: bare room)
 *   2 → levels 11-20   (first resident appears)
 *   3 → levels 21-30   (work prop added)
 *   4 → levels 31-40   (decoration)
 *   5 → levels 41-50   (more decoration)
 *   6 → levels 51-60   (service panel)
 *   7 → levels 61-70   (window upgrade + second resident)
 *   8 → levels 71-80   (premium detail)
 *   9 → levels 81-90   (ambient particles)
 *  10 → levels 91-100+ (complete: most detail, golden glow)
 *
 * Texture paths: /sprites/rooms/<moduleId>/tier-<detailLevel>.png
 * Missing textures are tolerated by the loader (falls back to the most
 * recent available variant, or skips the sprite entirely).
 */
const MODULE_IDS: ModuleId[] = [
  'tenant_capsule',
  'cosmo_kitchen',
  'oxygen_garden',
  'zero_g_laundry',
  'teleport_entry',
  'antigrav_gym',
  'panorama_dome',
  'saucer_dock',
  'radiator_balcony',
  'mail_tube_office'
];

function buildVariants(moduleId: ModuleId): RoomSpriteVariant[] {
  const variants: RoomSpriteVariant[] = [];

  for (let detail = 1; detail <= 10; detail += 1) {
    const unlockLevel = detail === 1 ? 1 : (detail - 1) * 10 + 1;
    const animation =
      detail >= 8
        ? { kind: 'pulse' as const, amplitude: 0.02, speed: 0.8 }
        : detail >= 5
          ? { kind: 'bob' as const, amplitude: 0.8, speed: 0.5, axis: 'y' as const }
          : undefined;

    variants.push({
      detailLevel: detail as RoomSpriteVariant['detailLevel'],
      unlockLevel,
      texture: `/sprites/rooms/${moduleId}/tier-${detail}.png`,
      animation
    });
  }

  return variants;
}

export const roomSpriteManifests: Record<ModuleId, RoomSpriteVariant[]> = Object.fromEntries(
  MODULE_IDS.map((id) => [id, buildVariants(id)])
) as Record<ModuleId, RoomSpriteVariant[]>;
