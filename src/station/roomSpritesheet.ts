import { Assets, Container, Rectangle, Sprite, Texture } from 'pixi.js';
import type { ModuleId } from '../game/types';

/**
 * Spritesheet-based room renderer.
 *
 * Loads a single PNG spritesheet per room and extracts 10 frames (2 rows ×
 * 5 columns). Each frame corresponds to a detail level (1..10). The frame
 * is displayed as a centered sprite that replaces the hardcoded Graphics
 * room scene.
 *
 * The spritesheet is expected at /sprites/rooms/<moduleId>/spritesheet.png
 * with a 5×2 grid layout. If the file is missing, the renderer returns null
 * and the caller falls back to the Graphics scene.
 */

interface SpritesheetConfig {
  url: string;
  cols: number;
  rows: number;
}

const spritesheetConfigs: Partial<Record<ModuleId, SpritesheetConfig>> = {
  tenant_capsule: {
    url: '/sprites/rooms/tenant_capsule/spritesheet.png',
    cols: 5,
    rows: 2
  }
};

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
 * Build a sprite container for a room at the given detail level.
 * Returns null if no spritesheet is available for this room.
 *
 * The sprite is centered in the 840×480 canvas and scaled to fit
 * while preserving aspect ratio.
 */
export async function buildSpritesheetRoom(
  moduleId: ModuleId,
  detailLevel: number
): Promise<Container | null> {
  const config = spritesheetConfigs[moduleId];

  if (!config) {
    return null;
  }

  const texture = await loadTexture(config.url);

  if (!texture) {
    return null;
  }

  // Calculate frame rectangle from the grid.
  const frameIndex = Math.max(0, Math.min(9, detailLevel - 1));
  const col = frameIndex % config.cols;
  const row = Math.floor(frameIndex / config.cols);
  const frameW = Math.floor(texture.width / config.cols);
  const frameH = Math.floor(texture.height / config.rows);
  const frameRect = new Rectangle(col * frameW, row * frameH, frameW, frameH);

  // Create a sub-texture for the specific frame.
  const frameTexture = new Texture({
    source: texture.source,
    frame: frameRect
  });

  const sprite = new Sprite(frameTexture);
  sprite.anchor.set(0.5, 0.5);
  sprite.position.set(420, 240); // center of 840×480 canvas

  // Scale to fit the canvas while preserving aspect ratio.
  // Target: ~440px wide (fits inside the room shell) while keeping height ≤ 300px.
  const targetW = 440;
  const targetH = 300;
  const scale = Math.min(targetW / frameW, targetH / frameH);
  sprite.scale.set(scale);

  const container = new Container();
  container.addChild(sprite);

  return container;
}

/**
 * Check if a spritesheet is available for a room.
 */
export function hasRoomSpritesheet(moduleId: ModuleId): boolean {
  return Boolean(spritesheetConfigs[moduleId]);
}

/**
 * Preload the spritesheet for a room.
 */
export async function preloadRoomSpritesheet(moduleId: ModuleId): Promise<void> {
  const config = spritesheetConfigs[moduleId];

  if (config) {
    await loadTexture(config.url);
  }
}

export function clearSpritesheetCache(): void {
  textureCache.clear();
}
