import { Assets, Container, Sprite, type Texture } from 'pixi.js';
import type { ModuleId, RoomSpriteAnimation, RoomSpriteVariant } from '../game/types';
import { getRoomDetailLevel } from './roomScenes';
import { roomSpriteManifests } from './roomSpriteManifests';

const textureCache = new Map<string, Promise<Texture | null>>();

function loadTexture(url: string): Promise<Texture | null> {
  if (textureCache.has(url)) {
    return textureCache.get(url)!;
  }

  const promise: Promise<Texture | null> = Assets.load(url)
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
 * Find the best available artwork variant for a room at the given module
 * level. Returns the variant whose unlockLevel is the highest without
 * exceeding the current level, or null if none exists / level is 0.
 */
export function getRoomSpriteVariant(
  moduleId: ModuleId,
  level: number
): RoomSpriteVariant | null {
  if (level <= 0) {
    return null;
  }

  const variants = roomSpriteManifests[moduleId] ?? [];
  let best: RoomSpriteVariant | null = null;

  for (const variant of variants) {
    if (variant.unlockLevel <= level && (!best || variant.unlockLevel > best.unlockLevel)) {
      best = variant;
    }
  }

  return best;
}

interface AnimatedSpriteState {
  animation: RoomSpriteAnimation;
  phase: number;
  baseX: number;
  baseY: number;
  baseScale: number;
}

const ANIMATED_LABEL = 'animated-room-sprite';
const SPRITE_STATE_KEY = Symbol('spriteState');

/**
 * Build a room container with a single full-room sprite for the current
 * detail level. The sprite replaces the entire room image — no layering.
 * The background and shell (Graphics) are NOT included here; the caller
 * composites this container on top of them.
 *
 * Falls back to older variant textures if the exact one for the current
 * level is missing (e.g. not yet generated).
 */
export async function buildSpriteRoomContainer(
  moduleId: ModuleId,
  level: number
): Promise<Container> {
  const container = new Container();

  if (level <= 0) {
    return container;
  }

  const variants = roomSpriteManifests[moduleId] ?? [];
  const detailLevel = getRoomDetailLevel(level);

  // Try the exact variant for this detail level first, then fall back to
  // progressively older variants so the room is never blank.
  const candidates: RoomSpriteVariant[] = [];

  for (let d = detailLevel; d >= 1; d -= 1) {
    const variant = variants.find((v) => v.detailLevel === d);

    if (variant) {
      candidates.push(variant);
    }
  }

  for (const variant of candidates) {
    const texture = await loadTexture(variant.texture);

    if (!texture) {
      continue; // missing sprite — try the next older variant
    }

    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5, 0.5);
    sprite.position.set(420, 240); // center of 840×480 canvas
    sprite.scale.set(0.55); // 1024px sprite → ~563px, fits the canvas

    if (variant.animation) {
      sprite.label = ANIMATED_LABEL;
      const state: AnimatedSpriteState = {
        animation: variant.animation,
        phase: Math.random() * Math.PI * 2,
        baseX: 420,
        baseY: 240,
        baseScale: 0.55
      };
      (sprite as unknown as Record<symbol, AnimatedSpriteState>)[SPRITE_STATE_KEY] = state;
    }

    container.addChild(sprite);
    break; // use the first available texture
  }

  return container;
}

function getSpriteState(sprite: Container): AnimatedSpriteState | undefined {
  return (sprite as unknown as Record<symbol, AnimatedSpriteState | undefined>)[SPRITE_STATE_KEY];
}

/**
 * Update the whole-room sprite animation. Called from the PixiJS ticker.
 */
export function updateSpriteAnimations(container: Container, _deltaTime: number, elapsed: number): void {
  container.children.forEach((child) => {
    if (child.label !== ANIMATED_LABEL) {
      return;
    }

    const state = getSpriteState(child);

    if (!state) {
      return;
    }

    const { animation, phase, baseX, baseY, baseScale } = state;
    const t = elapsed * animation.speed + phase;

    switch (animation.kind) {
      case 'bob': {
        const offset = Math.sin(t) * animation.amplitude;
        if (animation.axis === 'x') {
          child.x = baseX + offset;
        } else {
          child.y = baseY + offset;
        }
        break;
      }
      case 'pulse': {
        const scale = baseScale * (1 + Math.sin(t) * animation.amplitude);
        child.scale.set(scale);
        break;
      }
      case 'flicker': {
        child.alpha = 0.85 + Math.sin(t) * animation.amplitude;
        break;
      }
    }
  });
}

/**
 * Preload the sprite texture for a room at the current level so switching
 * to it is instant.
 */
export async function preloadRoomSprites(moduleId: ModuleId, level: number): Promise<void> {
  const variant = getRoomSpriteVariant(moduleId, level);

  if (variant) {
    await loadTexture(variant.texture);
  }
}

export function isTextureCached(url: string): boolean {
  return textureCache.has(url);
}

export function clearTextureCache(): void {
  textureCache.clear();
}
