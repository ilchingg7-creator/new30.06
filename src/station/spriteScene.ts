import { Assets, Container, Sprite, type Texture } from 'pixi.js';
import type { ModuleId, RoomSpriteAnimation, RoomSpriteLayer } from '../game/types';
import { getRoomSpriteLayers } from './roomScenes';

/**
 * Texture cache keyed by URL. PixiJS Assets.load already deduplicates, but
 * keeping our own Promise map lets callers check availability without kicking
 * off a load, and makes tests easier (the cache is module-scoped).
 */
const textureCache = new Map<string, Promise<Texture | null>>();

function loadTexture(url: string): Promise<Texture | null> {
  if (textureCache.has(url)) {
    return textureCache.get(url)!;
  }

  const promise: Promise<Texture | null> = Assets.load(url)
    .then((texture: Texture | { texture?: Texture }) => {
      // Assets.load returns a Texture for image URLs in PixiJS 8.
      if (texture && typeof texture === 'object' && 'textureId' in texture) {
        return texture as Texture;
      }

      return texture as Texture;
    })
    .catch(() => {
      // Missing sprite (e.g. not yet generated) — skip the layer gracefully.
      return null;
    });

  textureCache.set(url, promise);

  return promise;
}

interface AnimatedSpriteState {
  animation: RoomSpriteAnimation;
  phase: number;
  baseX: number;
  baseY: number;
  baseScale: number;
}

const ANIMATED_LABEL = 'animated-sprite';

/**
 * Build a room container from sprite layers. Each layer is a static sprite;
 * animated layers are tagged so the ticker can update them every frame.
 *
 * The background and shell (drawn with PixiJS Graphics) are NOT included
 * here — the caller composites this container on top of them.
 */
export async function buildSpriteRoomContainer(
  moduleId: ModuleId,
  level: number
): Promise<Container> {
  const layers = getRoomSpriteLayers(moduleId, level);
  const container = new Container();

  const textures = await Promise.all(layers.map((layer) => loadTexture(layer.texture)));

  layers.forEach((layer, index) => {
    const texture = textures[index];

    if (!texture) {
      // Sprite not generated yet — skip this layer. The room still renders
      // with whatever layers are available.
      return;
    }

    const sprite = new Sprite(texture);
    sprite.anchor.set(layer.anchor.x, layer.anchor.y);
    sprite.position.set(layer.x, layer.y);
    sprite.scale.set(layer.scale);

    if (layer.animation) {
      sprite.label = ANIMATED_LABEL;
      const state: AnimatedSpriteState = {
        animation: layer.animation,
        phase: Math.random() * Math.PI * 2,
        baseX: layer.x,
        baseY: layer.y,
        baseScale: layer.scale
      };
      // PixiJS 8 Container has no userData; attach via a symbol-keyed property.
      (sprite as unknown as Record<symbol, AnimatedSpriteState>)[SPRITE_STATE_KEY] = state;
    }

    container.addChild(sprite);
  });

  return container;
}

const SPRITE_STATE_KEY = Symbol('spriteState');

function getSpriteState(sprite: Container): AnimatedSpriteState | undefined {
  return (sprite as unknown as Record<symbol, AnimatedSpriteState | undefined>)[SPRITE_STATE_KEY];
}

/**
 * Update all animated sprite layers in a container. Called from the PixiJS
 * ticker every frame. Pure motion math — no allocations, safe for 60fps.
 */
export function updateSpriteAnimations(container: Container, deltaTime: number, elapsed: number): void {
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
      case 'rotate': {
        child.rotation = Math.sin(t) * animation.amplitude;
        break;
      }
      case 'pulse': {
        const scale = baseScale * (1 + Math.sin(t) * animation.amplitude);
        child.scale.set(scale);
        break;
      }
      case 'flicker': {
        child.alpha = 0.7 + Math.sin(t) * animation.amplitude;
        break;
      }
      case 'drift': {
        // Continuous drift with wrap-around so ambient particles loop forever.
        if (animation.axis === 'x') {
          child.x += animation.amplitude * deltaTime * animation.speed * 0.02;
          if (child.x > baseX + animation.amplitude) {
            child.x = baseX - animation.amplitude;
          }
        } else {
          child.y -= animation.amplitude * deltaTime * animation.speed * 0.02;
          if (child.y < baseY - animation.amplitude) {
            child.y = baseY + animation.amplitude;
          }
        }
        break;
      }
    }
  });
}

/**
 * Preload all sprite textures for a room so switching to it is instant.
 * Best called when the player gets close to unlocking a room.
 */
export async function preloadRoomSprites(moduleId: ModuleId, level: number): Promise<void> {
  const layers = getRoomSpriteLayers(moduleId, level);

  await Promise.all(layers.map((layer) => loadTexture(layer.texture)));
}

/**
 * Check whether a sprite texture has been loaded (or attempted) already.
 * Used by tests to verify caching behavior.
 */
export function isTextureCached(url: string): boolean {
  return textureCache.has(url);
}

/** Clear the texture cache. Test-only helper. */
export function clearTextureCache(): void {
  textureCache.clear();
}
