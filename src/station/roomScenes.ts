import { modules } from '../game/content/modules';
import type { GameState, ModuleId } from '../game/types';
import { stationTheme } from './stationTheme';

export type RoomDetailTier = 'locked' | 'basic' | 'working' | 'cozy' | 'busy' | 'complete';

export interface RoomSelectorItem {
  moduleId: ModuleId;
  name: string;
  level: number;
  unlocked: boolean;
  tier: RoomDetailTier;
}

export interface RoomSceneProp {
  kind:
    | 'bed'
    | 'kettle'
    | 'plant'
    | 'washer'
    | 'teleport'
    | 'gym_ring'
    | 'window_seat'
    | 'dock_clamp'
    | 'lamp'
    | 'patch';
  x: number;
  y: number;
  color: number;
}

export interface RoomSceneDescriptor {
  moduleId: ModuleId;
  name: string;
  level: number;
  tier: RoomDetailTier;
  accentColor: number;
  props: RoomSceneProp[];
  ambientLights: Array<{ x: number; y: number; radius: number; color: number }>;
}

export const ROOM_SCENE_WIDTH = 840;
export const ROOM_SCENE_HEIGHT = 480;

const roomAccentColors: Record<ModuleId, number> = {
  tenant_capsule: stationTheme.lampAmber,
  cosmo_kitchen: stationTheme.lampAmber,
  oxygen_garden: stationTheme.enamelGreen,
  zero_g_laundry: stationTheme.softWhite,
  teleport_entry: stationTheme.utilityBlue,
  antigrav_gym: stationTheme.signalRed,
  panorama_dome: stationTheme.lampAmber,
  saucer_dock: stationTheme.utilityBlue
};

export function getRoomDetailTier(level: number): RoomDetailTier {
  if (level <= 0) {
    return 'locked';
  }

  if (level >= 100) {
    return 'complete';
  }

  if (level >= 50) {
    return 'busy';
  }

  if (level >= 25) {
    return 'cozy';
  }

  if (level >= 10) {
    return 'working';
  }

  return 'basic';
}

export function createRoomSelectorItems(gameState: GameState): RoomSelectorItem[] {
  return modules.map((module) => {
    const level = gameState.moduleLevels[module.id];

    return {
      moduleId: module.id,
      name: module.name,
      level,
      unlocked: level > 0,
      tier: getRoomDetailTier(level)
    };
  });
}

export function resolveSelectedRoomId(gameState: GameState, selectedRoomId: ModuleId | null): ModuleId {
  const selectedLevel = selectedRoomId ? gameState.moduleLevels[selectedRoomId] : 0;

  if (selectedRoomId && selectedLevel > 0) {
    return selectedRoomId;
  }

  const firstUnlocked = modules.find((module) => gameState.moduleLevels[module.id] > 0);

  return firstUnlocked?.id ?? 'tenant_capsule';
}

function getModuleName(moduleId: ModuleId): string {
  const module = modules.find((item) => item.id === moduleId);

  if (!module) {
    throw new Error(`Unknown module: ${moduleId}`);
  }

  return module.name;
}

function createBaseProps(moduleId: ModuleId, accentColor: number): RoomSceneProp[] {
  const lamp: RoomSceneProp = { kind: 'lamp', x: 660, y: 132, color: stationTheme.lampAmber };
  const patch: RoomSceneProp = { kind: 'patch', x: 184, y: 306, color: stationTheme.enamelGreen };

  switch (moduleId) {
    case 'tenant_capsule':
      return [lamp, patch, { kind: 'bed', x: 328, y: 292, color: accentColor }];
    case 'cosmo_kitchen':
      return [lamp, patch, { kind: 'kettle', x: 398, y: 260, color: accentColor }];
    case 'oxygen_garden':
      return [lamp, patch, { kind: 'plant', x: 420, y: 260, color: accentColor }];
    case 'zero_g_laundry':
      return [lamp, patch, { kind: 'washer', x: 420, y: 260, color: accentColor }];
    case 'teleport_entry':
      return [lamp, patch, { kind: 'teleport', x: 420, y: 252, color: accentColor }];
    case 'antigrav_gym':
      return [lamp, patch, { kind: 'gym_ring', x: 420, y: 246, color: accentColor }];
    case 'panorama_dome':
      return [lamp, patch, { kind: 'window_seat', x: 420, y: 292, color: accentColor }];
    case 'saucer_dock':
      return [lamp, patch, { kind: 'dock_clamp', x: 420, y: 268, color: accentColor }];
  }
}

function addTierProps(props: RoomSceneProp[], tier: RoomDetailTier, accentColor: number): RoomSceneProp[] {
  if (tier === 'locked' || tier === 'basic') {
    return props;
  }

  const nextProps = [...props, { kind: 'lamp' as const, x: 238, y: 150, color: stationTheme.lampAmber }];

  if (tier === 'cozy' || tier === 'busy' || tier === 'complete') {
    nextProps.push({ kind: 'patch', x: 568, y: 330, color: stationTheme.enamelGreen });
  }

  if (tier === 'busy' || tier === 'complete') {
    nextProps.push({ kind: 'lamp', x: 600, y: 180, color: accentColor });
  }

  if (tier === 'complete') {
    nextProps.push({ kind: 'patch', x: 420, y: 118, color: stationTheme.softWhite });
  }

  return nextProps;
}

export function createRoomSceneDescriptor(gameState: GameState, selectedRoomId: ModuleId): RoomSceneDescriptor {
  const moduleId = resolveSelectedRoomId(gameState, selectedRoomId);
  const level = gameState.moduleLevels[moduleId];
  const tier = getRoomDetailTier(level);
  const accentColor = roomAccentColors[moduleId];
  const props = addTierProps(createBaseProps(moduleId, accentColor), tier, accentColor);

  return {
    moduleId,
    name: getModuleName(moduleId),
    level,
    tier,
    accentColor,
    props,
    ambientLights: [
      { x: 660, y: 132, radius: tier === 'locked' ? 12 : 22, color: stationTheme.lampAmber },
      { x: 420, y: 246, radius: tier === 'complete' ? 28 : 18, color: accentColor }
    ]
  };
}
