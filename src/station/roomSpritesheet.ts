import { Assets, Container, Sprite, Texture } from 'pixi.js';
import type { ModuleId } from '../game/types';

/**
 * Spritesheet-based room renderer.
 *
 * Loads individual PNG files per detail level (tier-1.png .. tier-10.png)
 * from /sprites/rooms/<moduleId>/. Each frame corresponds to a detail
 * level (1..10). The frame is displayed as a centered sprite on top of
 * the hardcoded Graphics room scene.
 *
 * If a texture is missing, the renderer returns null and the caller
 * falls back to the Graphics-only scene.
 */

const textureCache = new Map<string, Promise<Texture | null>>();

function loadTexture(url: string): Promise<Texture | null> {
  if (textureCache.has(url)) {
    return textureCache.get(url)!;
  }

  const promise = Assets.load(url)
    .then((texture: Texture | { texture?: Texture }) => {
      if (texture && typeof texture === 'object' && 'textureId' in texture) {
        return texture as Texture;
      }
      return texture as Texture;
    })
    .catch(() => null);

  textureCache.set(url, promise);
  return promise;
}

/**
 * Rooms that have sprite art available. Add a module ID here when
 * sprites are placed in public/sprites/rooms/<moduleId>/tier-N.png.
 */
const SPRITE_ROOMS: Partial<Record<ModuleId, true>> = {
  tenant_capsule: true
};

/**
 * Build a sprite container for a room at the given detail level.
 * Returns null if no sprite is available for this room/level.
 *
 * The sprite is centered in the 840×480 canvas and scaled to fill
 * the room interior (~600×340px) while preserving aspect ratio.
 */
export async function buildSpritesheetRoom(
  moduleId: ModuleId,
  detailLevel: number
): Promise<Container | null> {
  if (!SPRITE_ROOMS[moduleId]) {
    return null;
  }

  // Try the exact tier for this detail level, then fall back to older tiers.
  for (let tier = Math.min(10, Math.max(1, detailLevel)); tier >= 1; tier -= 1) {
    const url = `/sprites/rooms/${moduleId}/tier-${tier}.png`;
    const texture = await loadTexture(url);

    if (!texture) {
      continue;
    }

    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5, 0.5);
    sprite.position.set(420, 240); // center of 840×480 canvas

    // Scale to fill the room interior. The room shell interior is roughly
    // 572×224px (from the Graphics renderer). We want the sprite to be
    // large and visible — target ~600px wide, ~340px tall, whichever is smaller.
    const targetW = 600;
    const targetH = 340;
    const scale = Math.min(targetW / texture.width, targetH / texture.height);
    sprite.scale.set(scale);

    const container = new Container();
    container.addChild(sprite);

    return container;
  }

  return null;
}

/**
 * Check if sprite art is available for a room.
 */
export function hasRoomSpritesheet(moduleId: ModuleId): boolean {
  return Boolean(SPRITE_ROOMS[moduleId]);
}

/**
 * Preload all tier textures for a room.
 */
export async function preloadRoomSpritesheet(moduleId: ModuleId): Promise<void> {
  if (!SPRITE_ROOMS[moduleId]) {
    return;
  }

  for (let tier = 1; tier <= 10; tier += 1) {
    void loadTexture(`/sprites/rooms/${moduleId}/tier-${tier}.png`);
  }
}

export function clearSpritesheetCache(): void {
  textureCache.clear();
}
