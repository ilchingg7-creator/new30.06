import { describe, expect, it } from 'vitest';
import { buyModuleLevel, createInitialState } from '../game/economy';
import { modules } from '../game/content/modules';
import {
  buildRoomContainer,
  calculateRoomSceneFit,
  createRoomSceneDescriptor,
  createRoomSelectorItems,
  getRoomSpriteAsset,
  getRoomDetailTier,
  resolveSelectedRoomId
} from '../station/roomScenes';

function buyCapsuleLevels(count: number) {
  let state = { ...createInitialState(1_000), credits: 100_000_000 };

  for (let index = 0; index < count; index += 1) {
    state = buyModuleLevel(state, 'tenant_capsule');
  }

  return state;
}

describe('focused room scene descriptors', () => {
  it('maps module levels to detail tiers', () => {
    expect(getRoomDetailTier(0)).toBe('locked');
    expect(getRoomDetailTier(1)).toBe('basic');
    expect(getRoomDetailTier(10)).toBe('working');
    expect(getRoomDetailTier(25)).toBe('cozy');
    expect(getRoomDetailTier(50)).toBe('busy');
    expect(getRoomDetailTier(100)).toBe('complete');
  });

  it('creates one selector item per module with locked state', () => {
    const state = createInitialState(1_000);
    const items = createRoomSelectorItems(state);

    expect(items).toHaveLength(modules.length);
    expect(items[0]).toMatchObject({ moduleId: 'tenant_capsule', unlocked: false, level: 0 });
  });

  it('resolves invalid selected room to first unlocked room and then capsule', () => {
    const empty = createInitialState(1_000);
    const bought = buyModuleLevel(empty, 'tenant_capsule');

    expect(resolveSelectedRoomId(empty, 'saucer_dock')).toBe('tenant_capsule');
    expect(resolveSelectedRoomId(bought, 'saucer_dock')).toBe('tenant_capsule');
  });

  it('describes selected room detail and visual props', () => {
    const state = buyCapsuleLevels(25);
    const descriptor = createRoomSceneDescriptor(state, 'tenant_capsule');

    expect(descriptor.moduleId).toBe('tenant_capsule');
    expect(descriptor.tier).toBe('cozy');
    expect(descriptor.props.length).toBeGreaterThan(3);
    expect(descriptor.ambientLights.length).toBeGreaterThan(0);
  });

  it('builds a detailed pixi room container from a non-sprite room', () => {
    const state = {
      ...createInitialState(1_000),
      moduleLevels: {
        ...createInitialState(1_000).moduleLevels,
        cosmo_kitchen: 25
      }
    };
    const container = buildRoomContainer(state, 'cosmo_kitchen');

    expect(container.children.length).toBeGreaterThan(6);
    expect(container.children.some((child) => (child as { label?: string }).label === 'ambient-light')).toBe(true);
  });

  it('uses tenant capsule sprite assets every ten levels', () => {
    expect(getRoomSpriteAsset('tenant_capsule', 1)).toBe('/assets/rooms/tenant_capsule/tenant_capsule_01.png');
    expect(getRoomSpriteAsset('tenant_capsule', 3)).toBe('/assets/rooms/tenant_capsule/tenant_capsule_03.png');
    expect(getRoomSpriteAsset('tenant_capsule', 10)).toBe('/assets/rooms/tenant_capsule/tenant_capsule_10.png');
    expect(getRoomSpriteAsset('cosmo_kitchen', 3)).toBeNull();
  });

  it('replaces the tenant capsule vector room with a sprite scene', () => {
    const state = buyCapsuleLevels(25);
    const container = buildRoomContainer(state, 'tenant_capsule');

    expect(container.children).toHaveLength(1);
    expect((container.children[0] as { label?: string }).label).toBe('room-sprite');
  });

  it('fits the fixed room composition inside the canvas bounds', () => {
    const mobileFit = calculateRoomSceneFit(390, 260);
    const desktopFit = calculateRoomSceneFit(572, 560);

    expect(mobileFit.width).toBeLessThanOrEqual(390);
    expect(mobileFit.height).toBeLessThanOrEqual(260);
    expect(mobileFit.x).toBe(0);
    expect(mobileFit.y).toBeGreaterThan(0);

    expect(desktopFit.width).toBeLessThanOrEqual(572);
    expect(desktopFit.height).toBeLessThanOrEqual(560);
    expect(desktopFit.x).toBe(0);
    expect(desktopFit.y).toBeGreaterThan(0);
  });
});
