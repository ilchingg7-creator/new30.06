import { describe, expect, it } from 'vitest';
import {
  getRoomRewardSpriteDefinition,
  getRoomRewardSpritesForRoom,
  ROOM_REWARD_SPRITE_IDS
} from '../station/roomRewardSprites';

describe('room reward sprite registry', () => {
  it('defines exactly the 21 approved rewards with ten explicit placements', () => {
    expect(ROOM_REWARD_SPRITE_IDS).toHaveLength(21);
    expect(new Set(ROOM_REWARD_SPRITE_IDS).size).toBe(21);

    ROOM_REWARD_SPRITE_IDS.forEach((id) => {
      const definition = getRoomRewardSpriteDefinition(id);

      expect(definition).not.toBeNull();
      expect(definition?.src).toBe(`./assets/room-rewards/${id}.png`);
      expect(Object.keys(definition?.placements ?? {})).toEqual([
        '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'
      ]);
    });
  });

  it('keeps the approved V5 positions for changing room geometry', () => {
    expect(getRoomRewardSpriteDefinition('capsule_padding_01')?.placements).toMatchObject({
      1: { x: 80, y: 292 },
      5: { x: 92, y: 292 },
      10: { x: 92, y: 292 }
    });
    expect(getRoomRewardSpriteDefinition('kitchen_soup_pot_01')?.placements).toMatchObject({
      1: { x: 396, y: 272 },
      7: { x: 640, y: 328 },
      10: { x: 648, y: 340 }
    });
    expect(getRoomRewardSpriteDefinition('teleport_parcel_01')?.placements).toMatchObject({
      1: { x: 676, y: 384 },
      4: { x: 696, y: 348 },
      6: { x: 520, y: 376 },
      10: { x: 156, y: 404 }
    });
  });

  it('returns unique unlocked rewards for only the selected room in stable z-order', () => {
    const rewards = getRoomRewardSpritesForRoom(
      ['kitchen_soup_pot_01', 'capsule_rug_01', 'kitchen_mist_patch_01', 'kitchen_soup_pot_01'],
      'cosmo_kitchen',
      10
    );

    expect(rewards.map((reward) => reward.id)).toEqual([
      'kitchen_mist_patch_01',
      'kitchen_soup_pot_01'
    ]);
    expect(rewards[1].placement).toEqual({ x: 648, y: 340, width: 64, height: 56, zIndex: 20 });
  });

  it('returns no rewards for a locked room detail level', () => {
    expect(getRoomRewardSpritesForRoom(['capsule_rug_01'], 'tenant_capsule', 0)).toEqual([]);
  });
});
