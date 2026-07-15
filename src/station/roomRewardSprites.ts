import type { ModuleId, RoomDetailLevel, VisualPlaceholderId } from '../game/types';
import { resolveAssetUrl } from '../platform/assets';

export type UnlockedRoomDetailLevel = Exclude<RoomDetailLevel, 0>;

export interface RoomRewardPlacement {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

export interface RoomRewardSpriteDefinition {
  id: VisualPlaceholderId;
  roomId: ModuleId;
  alias: string;
  src: string;
  placements: Record<UnlockedRoomDetailLevel, RoomRewardPlacement>;
}

export interface ResolvedRoomRewardSprite extends RoomRewardSpriteDefinition {
  placement: RoomRewardPlacement;
}

type Position = readonly [x: number, y: number];

const ROOM_DETAIL_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

function explicitPlacements(
  width: number,
  height: number,
  zIndex: number,
  positions: readonly Position[]
): Record<UnlockedRoomDetailLevel, RoomRewardPlacement> {
  if (positions.length !== ROOM_DETAIL_LEVELS.length) {
    throw new Error(`Room reward needs 10 placements, received ${positions.length}`);
  }

  return Object.fromEntries(
    ROOM_DETAIL_LEVELS.map((level, index) => {
      const [x, y] = positions[index];

      return [level, { x, y, width, height, zIndex }];
    })
  ) as Record<UnlockedRoomDetailLevel, RoomRewardPlacement>;
}

function defineReward(
  id: VisualPlaceholderId,
  roomId: ModuleId,
  width: number,
  height: number,
  zIndex: number,
  positions: readonly Position[]
): RoomRewardSpriteDefinition {
  return {
    id,
    roomId,
    alias: `room-reward-${id}`,
    src: resolveAssetUrl(`assets/room-rewards/${id}.png`),
    placements: explicitPlacements(width, height, zIndex, positions)
  };
}

export const ROOM_REWARD_SPRITES: readonly RoomRewardSpriteDefinition[] = [
  defineReward('capsule_padding_01', 'tenant_capsule', 80, 64, 10, [
    [80, 292], [80, 292], [80, 292], [80, 292], [92, 292],
    [92, 292], [92, 292], [92, 292], [92, 292], [92, 292]
  ]),
  defineReward('capsule_rug_01', 'tenant_capsule', 112, 64, 10, [
    [360, 400], [360, 400], [360, 400], [360, 400], [360, 400],
    [360, 400], [228, 416], [228, 416], [228, 416], [228, 416]
  ]),
  defineReward('warning_bulb_01', 'tenant_capsule', 48, 72, 30, [
    [692, 64], [692, 64], [692, 64], [692, 64], [692, 64],
    [692, 64], [692, 64], [692, 64], [692, 64], [692, 64]
  ]),
  defineReward('cat_saucer_01', 'tenant_capsule', 64, 32, 20, [
    [648, 412], [648, 412], [648, 412], [648, 412], [648, 412],
    [648, 412], [648, 412], [648, 412], [648, 412], [648, 412]
  ]),
  defineReward('capsule_frost_01', 'tenant_capsule', 96, 64, 15, [
    [448, 136], [448, 136], [448, 136], [448, 136], [448, 136],
    [448, 136], [448, 136], [448, 136], [448, 136], [448, 136]
  ]),
  defineReward('drone_schedule_board_01', 'tenant_capsule', 72, 64, 10, [
    [280, 148], [280, 148], [280, 148], [280, 148], [280, 148],
    [280, 148], [280, 148], [280, 148], [280, 148], [280, 148]
  ]),
  defineReward('cat_button_label_01', 'tenant_capsule', 48, 32, 20, [
    [720, 172], [720, 172], [720, 172], [720, 172], [720, 172],
    [720, 172], [720, 172], [720, 172], [720, 172], [720, 172]
  ]),
  defineReward('cosmonaut_mug_01', 'tenant_capsule', 40, 48, 20, [
    [300, 260], [300, 260], [300, 260], [300, 260], [300, 260],
    [300, 260], [420, 336], [420, 336], [456, 344], [456, 344]
  ]),
  defineReward('kitchen_mist_patch_01', 'cosmo_kitchen', 96, 64, 15, [
    [380, 204], [380, 204], [380, 204], [380, 204], [380, 204],
    [380, 204], [624, 264], [624, 264], [632, 276], [632, 276]
  ]),
  defineReward('kitchen_soup_pot_01', 'cosmo_kitchen', 64, 56, 20, [
    [396, 272], [396, 272], [396, 272], [396, 272], [396, 272],
    [396, 272], [640, 328], [640, 328], [648, 340], [648, 340]
  ]),
  defineReward('kitchen_spoon_bundle_01', 'cosmo_kitchen', 56, 72, 20, [
    [260, 168], [260, 168], [260, 168], [260, 168], [260, 168],
    [260, 168], [260, 168], [260, 168], [268, 168], [268, 168]
  ]),
  defineReward('kitchen_recipe_scroll_01', 'cosmo_kitchen', 56, 80, 20, [
    [616, 156], [616, 156], [616, 156], [616, 156], [616, 156],
    [616, 156], [616, 156], [112, 176], [112, 176], [112, 176]
  ]),
  defineReward('table_schedule_01', 'cosmo_kitchen', 64, 40, 20, [
    [96, 288], [96, 288], [96, 288], [96, 288], [96, 288],
    [96, 288], [696, 348], [696, 348], [704, 360], [704, 360]
  ]),
  defineReward('garden_sprout_label_01', 'oxygen_garden', 48, 40, 20, [
    [272, 256], [272, 256], [272, 256], [272, 256], [272, 256],
    [272, 256], [272, 256], [272, 256], [272, 256], [272, 256]
  ]),
  defineReward('garden_radio_plant_01', 'oxygen_garden', 72, 64, 20, [
    [304, 164], [304, 164], [304, 164], [304, 164], [304, 164],
    [304, 164], [536, 344], [536, 344], [536, 344], [536, 344]
  ]),
  defineReward('garden_seed_trail_01', 'oxygen_garden', 96, 32, 20, [
    [500, 416], [500, 416], [500, 416], [500, 416], [500, 416],
    [500, 416], [352, 420], [352, 420], [352, 420], [352, 420]
  ]),
  defineReward('laundry_sock_cluster_01', 'zero_g_laundry', 80, 72, 20, [
    [420, 92], [420, 92], [420, 92], [420, 92], [420, 92],
    [360, 76], [360, 76], [360, 76], [360, 76], [360, 76]
  ]),
  defineReward('laundry_static_socks_01', 'zero_g_laundry', 88, 80, 30, [
    [632, 96], [632, 96], [632, 96], [608, 96], [608, 96],
    [500, 108], [500, 108], [500, 108], [500, 108], [500, 108]
  ]),
  defineReward('teleport_parcel_01', 'teleport_entry', 72, 64, 20, [
    [676, 384], [676, 384], [676, 384], [696, 348], [696, 348],
    [520, 376], [148, 400], [148, 400], [156, 404], [156, 404]
  ]),
  defineReward('teleport_duplicate_mug_01', 'teleport_entry', 72, 48, 20, [
    [676, 352], [676, 352], [676, 352], [696, 276], [696, 276],
    [604, 244], [476, 340], [476, 340], [500, 348], [500, 348]
  ]),
  defineReward('panorama_star_labels_01', 'panorama_dome', 240, 104, 25, [
    [300, 116], [300, 116], [300, 116], [300, 116], [300, 116],
    [300, 116], [300, 116], [300, 116], [300, 116], [300, 116]
  ])
];

export const ROOM_REWARD_SPRITE_IDS = ROOM_REWARD_SPRITES.map((reward) => reward.id);

const ROOM_REWARD_SPRITE_BY_ID = new Map(ROOM_REWARD_SPRITES.map((reward) => [reward.id, reward]));

export function getRoomRewardSpriteDefinition(id: VisualPlaceholderId): RoomRewardSpriteDefinition | null {
  return ROOM_REWARD_SPRITE_BY_ID.get(id) ?? null;
}

export function getRoomRewardSpritesForRoom(
  unlockedIds: readonly VisualPlaceholderId[],
  roomId: ModuleId,
  detailLevel: RoomDetailLevel
): ResolvedRoomRewardSprite[] {
  if (detailLevel === 0) {
    return [];
  }

  const unlocked = new Set(unlockedIds);

  return ROOM_REWARD_SPRITES
    .filter((reward) => reward.roomId === roomId && unlocked.has(reward.id))
    .map((reward) => ({ ...reward, placement: reward.placements[detailLevel] }))
    .sort((left, right) => left.placement.zIndex - right.placement.zIndex);
}
