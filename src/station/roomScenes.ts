import { Container, Graphics } from 'pixi.js';
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

export function calculateRoomSceneFit(canvasWidth: number, canvasHeight: number) {
  const scale = Math.min(canvasWidth / ROOM_SCENE_WIDTH, canvasHeight / ROOM_SCENE_HEIGHT);
  const width = ROOM_SCENE_WIDTH * scale;
  const height = ROOM_SCENE_HEIGHT * scale;

  return {
    scale,
    width,
    height,
    x: (canvasWidth - width) / 2,
    y: (canvasHeight - height) / 2
  };
}

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

function markAmbientLight(graphics: Graphics): Graphics {
  (graphics as Graphics & { label?: string }).label = 'ambient-light';

  return graphics;
}

function createRoomBackground(): Graphics {
  const background = new Graphics();

  background.rect(0, 0, ROOM_SCENE_WIDTH, ROOM_SCENE_HEIGHT).fill(stationTheme.spaceNavy);
  background.circle(82, 58, 1.5).fill(stationTheme.softWhite);
  background.circle(172, 92, 1).fill(stationTheme.softWhite);
  background.circle(704, 74, 1.4).fill(stationTheme.softWhite);
  background.circle(780, 190, 1).fill(stationTheme.softWhite);
  background.circle(626, 408, 1.2).fill(stationTheme.softWhite);

  return background;
}

function createRoomShell(descriptor: RoomSceneDescriptor): Graphics {
  const shell = new Graphics();

  shell.roundRect(92, 74, 656, 334, 28).fill(stationTheme.ink);
  shell.roundRect(108, 90, 624, 302, 24).stroke({ color: descriptor.accentColor, width: 4, alpha: 0.8 });
  shell.roundRect(134, 122, 572, 224, 18).fill(stationTheme.warmPanel);
  shell.roundRect(134, 308, 572, 38, 10).fill(stationTheme.enamelGreen);
  shell.roundRect(162, 324, 516, 8, 4).fill(stationTheme.softWhite);
  shell.roundRect(172, 146, 166, 78, 18).fill(stationTheme.spaceNavy);
  shell.circle(228, 184, 18).stroke({ color: stationTheme.utilityBlue, width: 4, alpha: 0.9 });
  shell.circle(282, 184, 18).stroke({ color: descriptor.accentColor, width: 4, alpha: 0.85 });

  if (descriptor.tier !== 'basic' && descriptor.tier !== 'locked') {
    shell.roundRect(506, 144, 126, 60, 14).fill(stationTheme.spaceNavy);
    shell.circle(548, 174, 13).fill(descriptor.accentColor);
    shell.circle(590, 174, 13).fill(stationTheme.enamelGreen);
  }

  return shell;
}

function createRoomPlate(descriptor: RoomSceneDescriptor): Graphics {
  const plate = new Graphics();
  const fillColor = descriptor.tier === 'locked' ? stationTheme.ink : descriptor.accentColor;

  plate.roundRect(354, 82, 132, 34, 10).fill(stationTheme.ink);
  plate.roundRect(366, 94, 108, 10, 5).fill(fillColor);
  plate.alpha = descriptor.tier === 'locked' ? 0.44 : 0.95;

  return plate;
}

function createAmbientLight(light: RoomSceneDescriptor['ambientLights'][number]): Graphics {
  const ambientLight = new Graphics();

  ambientLight.circle(light.x, light.y, light.radius).fill({ color: light.color, alpha: 0.34 });

  return markAmbientLight(ambientLight);
}

function createBed(prop: RoomSceneProp): Graphics {
  const bed = new Graphics();

  bed.roundRect(prop.x - 92, prop.y - 30, 184, 60, 16).fill(stationTheme.ink);
  bed.roundRect(prop.x - 74, prop.y - 44, 76, 44, 14).fill(prop.color);
  bed.roundRect(prop.x - 4, prop.y - 36, 88, 50, 14).fill(stationTheme.softWhite);
  bed.circle(prop.x - 54, prop.y - 18, 10).fill(stationTheme.lampAmber);

  return bed;
}

function createKettle(prop: RoomSceneProp): Graphics {
  const kettle = new Graphics();

  kettle.roundRect(prop.x - 86, prop.y + 20, 172, 24, 10).fill(stationTheme.ink);
  kettle.roundRect(prop.x - 34, prop.y - 26, 68, 56, 16).fill(prop.color);
  kettle.circle(prop.x + 42, prop.y - 2, 18).stroke({ color: stationTheme.ink, width: 8 });
  kettle.roundRect(prop.x - 16, prop.y - 48, 32, 18, 8).fill(stationTheme.softWhite);

  return kettle;
}

function createPlant(prop: RoomSceneProp): Graphics {
  const plant = new Graphics();

  plant.roundRect(prop.x - 28, prop.y + 18, 56, 52, 14).fill(stationTheme.ink);
  plant.circle(prop.x - 28, prop.y - 8, 28).fill(prop.color);
  plant.circle(prop.x + 28, prop.y - 8, 28).fill(prop.color);
  plant.circle(prop.x, prop.y - 38, 32).fill(stationTheme.enamelGreen);
  plant.roundRect(prop.x - 8, prop.y - 8, 16, 38, 6).fill(stationTheme.warmPanel);

  return plant;
}

function createWasher(prop: RoomSceneProp): Graphics {
  const washer = new Graphics();

  washer.roundRect(prop.x - 54, prop.y - 58, 108, 116, 18).fill(stationTheme.softWhite);
  washer.circle(prop.x, prop.y, 34).stroke({ color: prop.color, width: 8 });
  washer.circle(prop.x, prop.y, 20).fill(stationTheme.utilityBlue);
  washer.circle(prop.x + 30, prop.y - 40, 8).fill(stationTheme.signalRed);

  return washer;
}

function createTeleport(prop: RoomSceneProp): Graphics {
  const teleport = new Graphics();

  teleport.roundRect(prop.x - 64, prop.y + 52, 128, 24, 12).fill(stationTheme.ink);
  teleport.circle(prop.x, prop.y, 62).stroke({ color: prop.color, width: 8, alpha: 0.9 });
  teleport.circle(prop.x, prop.y, 38).stroke({ color: stationTheme.softWhite, width: 4, alpha: 0.8 });
  teleport.circle(prop.x, prop.y, 14).fill(stationTheme.lampAmber);

  return teleport;
}

function createGymRing(prop: RoomSceneProp): Graphics {
  const ring = new Graphics();

  ring.circle(prop.x, prop.y, 68).stroke({ color: prop.color, width: 8 });
  ring.circle(prop.x, prop.y, 40).stroke({ color: stationTheme.softWhite, width: 4, alpha: 0.8 });
  ring.roundRect(prop.x - 76, prop.y + 68, 152, 18, 9).fill(stationTheme.ink);
  ring.circle(prop.x - 42, prop.y + 76, 8).fill(stationTheme.lampAmber);
  ring.circle(prop.x + 42, prop.y + 76, 8).fill(stationTheme.lampAmber);

  return ring;
}

function createWindowSeat(prop: RoomSceneProp): Graphics {
  const seat = new Graphics();

  seat.roundRect(prop.x - 96, prop.y - 118, 192, 120, 44).fill(stationTheme.spaceNavy);
  seat.circle(prop.x - 34, prop.y - 64, 4).fill(stationTheme.softWhite);
  seat.circle(prop.x + 38, prop.y - 86, 3).fill(stationTheme.softWhite);
  seat.roundRect(prop.x - 92, prop.y - 8, 184, 52, 18).fill(stationTheme.ink);
  seat.roundRect(prop.x - 70, prop.y - 22, 140, 32, 14).fill(prop.color);

  return seat;
}

function createDockClamp(prop: RoomSceneProp): Graphics {
  const clamp = new Graphics();

  clamp.roundRect(prop.x - 94, prop.y + 34, 188, 26, 13).fill(stationTheme.ink);
  clamp.roundRect(prop.x - 70, prop.y - 38, 34, 90, 14).fill(prop.color);
  clamp.roundRect(prop.x + 36, prop.y - 38, 34, 90, 14).fill(prop.color);
  clamp.circle(prop.x, prop.y, 44).stroke({ color: stationTheme.softWhite, width: 6, alpha: 0.85 });

  return clamp;
}

function createLamp(prop: RoomSceneProp): Graphics {
  const lamp = new Graphics();

  lamp.moveTo(prop.x, prop.y - 38);
  lamp.lineTo(prop.x, prop.y - 2);
  lamp.stroke({ color: stationTheme.ink, width: 4 });
  lamp.circle(prop.x, prop.y + 14, 22).fill(prop.color);
  lamp.circle(prop.x, prop.y + 14, 10).fill(stationTheme.softWhite);

  return markAmbientLight(lamp);
}

function createPatch(prop: RoomSceneProp): Graphics {
  const patch = new Graphics();

  patch.roundRect(prop.x - 42, prop.y - 20, 84, 40, 12).fill(stationTheme.ink);
  patch.roundRect(prop.x - 30, prop.y - 10, 60, 20, 8).fill(prop.color);
  patch.circle(prop.x - 20, prop.y, 4).fill(stationTheme.softWhite);
  patch.circle(prop.x + 20, prop.y, 4).fill(stationTheme.softWhite);

  return patch;
}

function createRoomProp(prop: RoomSceneProp): Graphics {
  switch (prop.kind) {
    case 'bed':
      return createBed(prop);
    case 'kettle':
      return createKettle(prop);
    case 'plant':
      return createPlant(prop);
    case 'washer':
      return createWasher(prop);
    case 'teleport':
      return createTeleport(prop);
    case 'gym_ring':
      return createGymRing(prop);
    case 'window_seat':
      return createWindowSeat(prop);
    case 'dock_clamp':
      return createDockClamp(prop);
    case 'lamp':
      return createLamp(prop);
    case 'patch':
      return createPatch(prop);
  }
}

export function buildRoomContainer(gameState: GameState, selectedRoomId: ModuleId): Container {
  const descriptor = createRoomSceneDescriptor(gameState, selectedRoomId);
  const container = new Container();

  container.addChild(createRoomBackground());
  descriptor.ambientLights.forEach((light) => {
    container.addChild(createAmbientLight(light));
  });
  container.addChild(createRoomShell(descriptor));
  container.addChild(createRoomPlate(descriptor));
  descriptor.props.forEach((prop) => {
    container.addChild(createRoomProp(prop));
  });

  return container;
}
