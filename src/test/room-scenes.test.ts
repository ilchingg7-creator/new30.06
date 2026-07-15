import { Assets } from 'pixi.js';
import { describe, expect, it, vi } from 'vitest';
import { buyModuleLevel, createInitialState } from '../game/economy';
import { modules } from '../game/content/modules';
import type { VisualPlaceholderId } from '../game/types';
import {
  buildRoomContainer,
  calculateSceneOverlayRect,
  calculateRoomSceneFit,
  createRoomSceneDescriptor,
  createRoomSelectorItems,
  getRoomSpriteAsset,
  getRoomDetailTier,
  loadRoomSpriteAssetForState,
  TENANT_CAT_LOVE_SCENE_RECT,
  TENANT_CAT_SCENE_RECT,
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

  it('builds an approved non-capsule room from a sprite', () => {
    const state = {
      ...createInitialState(1_000),
      moduleLevels: {
        ...createInitialState(1_000).moduleLevels,
        cosmo_kitchen: 25
      }
    };
    const container = buildRoomContainer(state, 'cosmo_kitchen');

    expect(container.children).toHaveLength(1);
    expect((container.children[0] as { label?: string }).label).toBe('room-sprite');
  });

  it('renders each unlocked reward for the selected room once without generic markers', () => {
    const state = {
      ...createInitialState(1_000),
      moduleLevels: { ...createInitialState(1_000).moduleLevels, cosmo_kitchen: 100 },
      unlockedIncidentVisuals: [
        'kitchen_soup_pot_01',
        'capsule_rug_01',
        'kitchen_recipe_scroll_01',
        'kitchen_soup_pot_01'
      ] as VisualPlaceholderId[]
    };
    const labels = buildRoomContainer(state, 'cosmo_kitchen').children.map(
      (child) => (child as { label?: string }).label
    );

    expect(labels.filter((label) => label === 'room-reward-kitchen_soup_pot_01')).toHaveLength(1);
    expect(labels).toContain('room-reward-kitchen_recipe_scroll_01');
    expect(labels).not.toContain('room-reward-capsule_rug_01');
    expect(labels.some((label) => label?.startsWith('incident-placeholder-'))).toBe(false);
  });

  it('uses the selected detail-level placement for a reward', () => {
    const base = createInitialState(1_000);
    const state = {
      ...base,
      moduleLevels: { ...base.moduleLevels, cosmo_kitchen: 50 },
      unlockedIncidentVisuals: ['table_schedule_01'] as VisualPlaceholderId[]
    };

    const reward = buildRoomContainer(state, 'cosmo_kitchen').children.find(
      (child) => (child as { label?: string }).label === 'room-reward-table_schedule_01'
    );

    expect(reward?.position.x).toBe(96);
    expect(reward?.position.y).toBe(288);
  });

  it('skips only a reward whose asset load fails', async () => {
    const base = createInitialState(1_000);
    const state = {
      ...base,
      moduleLevels: { ...base.moduleLevels, cosmo_kitchen: 100 },
      unlockedIncidentVisuals: ['kitchen_soup_pot_01', 'kitchen_recipe_scroll_01'] as VisualPlaceholderId[]
    };
    const loadSpy = vi.spyOn(Assets, 'load').mockImplementation(async (aliases) => {
      const aliasList = (Array.isArray(aliases) ? aliases : [aliases]) as unknown[];

      if (aliasList.some((alias) => alias === 'room-reward-kitchen_soup_pot_01')) {
        throw new Error('missing reward');
      }

      return {};
    });

    await expect(loadRoomSpriteAssetForState(state, 'cosmo_kitchen')).resolves.toBeUndefined();
    const labels = buildRoomContainer(state, 'cosmo_kitchen').children.map(
      (child) => (child as { label?: string }).label
    );

    expect(labels).not.toContain('room-reward-kitchen_soup_pot_01');
    expect(labels).toContain('room-reward-kitchen_recipe_scroll_01');
    expect(labels).toContain('room-sprite');

    loadSpy.mockRestore();
  });

  it('maps every room and detail level to its sprite asset', () => {
    modules.forEach((module) => {
      for (let detailLevel = 1; detailLevel <= 10; detailLevel += 1) {
        const suffix = String(detailLevel).padStart(2, '0');

        expect(getRoomSpriteAsset(module.id, detailLevel as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10)).toBe(
          `/assets/rooms/${module.id}/${module.id}_${suffix}.png`
        );
      }
    });

    expect(getRoomSpriteAsset('tenant_capsule', 0)).toBeNull();
  });

  it('keeps procedural room art when a sprite fails to load', async () => {
    const state = {
      ...createInitialState(1_000),
      moduleLevels: {
        ...createInitialState(1_000).moduleLevels,
        oxygen_garden: 1
      }
    };
    const loadSpy = vi.spyOn(Assets, 'load').mockRejectedValueOnce(new Error('missing sprite'));

    await expect(loadRoomSpriteAssetForState(state, 'oxygen_garden')).resolves.toBeUndefined();

    const container = buildRoomContainer(state, 'oxygen_garden');
    expect(container.children.some((child) => (child as { label?: string }).label === 'room-sprite')).toBe(false);
    expect(container.children.some((child) => (child as { label?: string }).label === 'ambient-light')).toBe(true);

    loadSpy.mockRestore();
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

  it('places the tenant cat overlay inside the lower right of the room scene', () => {
    const catRect = calculateSceneOverlayRect(420, 240, TENANT_CAT_SCENE_RECT);
    const loveRect = calculateSceneOverlayRect(420, 240, TENANT_CAT_LOVE_SCENE_RECT);

    expect(TENANT_CAT_SCENE_RECT.width).toBe(228);
    expect(TENANT_CAT_SCENE_RECT.height).toBe(228);
    expect(TENANT_CAT_SCENE_RECT.y).toBe(208);
    expect(TENANT_CAT_LOVE_SCENE_RECT.width).toBe(126);
    expect(TENANT_CAT_LOVE_SCENE_RECT.height).toBe(126);
    expect(TENANT_CAT_LOVE_SCENE_RECT.y).toBe(132);
    expect(TENANT_CAT_LOVE_SCENE_RECT.y + TENANT_CAT_LOVE_SCENE_RECT.height - TENANT_CAT_SCENE_RECT.y).toBe(
      50
    );

    expect(catRect.width).toBe(114);
    expect(catRect.height).toBe(114);
    expect(catRect.left).toBeGreaterThan(250);
    expect(catRect.top).toBeGreaterThan(95);
    expect(catRect.left + catRect.width).toBeLessThan(420);
    expect(catRect.top + catRect.height).toBeLessThan(240);

    expect(loveRect.width).toBeLessThan(catRect.width);
    expect(loveRect.height).toBeLessThan(catRect.height);
    expect(loveRect.top).toBeLessThan(catRect.top);
  });
});
