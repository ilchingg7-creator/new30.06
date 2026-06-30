import { Container, Graphics } from 'pixi.js';
import { modules } from '../game/content/modules';
import type { GameState, ModuleId } from '../game/types';
import { stationTheme } from './stationTheme';

export interface StationModuleSprite {
  moduleId: ModuleId;
  x: number;
  y: number;
  active: boolean;
  tint: number;
}

export interface StationStar {
  x: number;
  y: number;
  radius: number;
}

export interface StationAntenna {
  x: number;
  y: number;
  height: number;
}

export interface StationSceneDetails {
  stars: StationStar[];
  antennas: StationAntenna[];
  activeWindowCount: number;
  lockedHardpointCount: number;
  hasOxygenGardenAccent: boolean;
  hasTeleportAccent: boolean;
}

export const STATION_SCENE_WIDTH = 840;
export const STATION_SCENE_HEIGHT = 480;

const MODULE_POSITIONS: Record<ModuleId, { x: number; y: number }> = {
  tenant_capsule: { x: 150, y: 210 },
  cosmo_kitchen: { x: 280, y: 170 },
  oxygen_garden: { x: 420, y: 210 },
  zero_g_laundry: { x: 560, y: 170 },
  teleport_entry: { x: 700, y: 210 },
  antigrav_gym: { x: 280, y: 330 },
  panorama_dome: { x: 420, y: 370 },
  saucer_dock: { x: 560, y: 330 }
};

const STARS: StationStar[] = [
  { x: 42, y: 42, radius: 1.5 },
  { x: 92, y: 122, radius: 1 },
  { x: 132, y: 382, radius: 1.2 },
  { x: 204, y: 66, radius: 1.5 },
  { x: 248, y: 430, radius: 1 },
  { x: 326, y: 112, radius: 1.2 },
  { x: 382, y: 34, radius: 1 },
  { x: 456, y: 92, radius: 1.5 },
  { x: 506, y: 434, radius: 1.2 },
  { x: 578, y: 72, radius: 1 },
  { x: 626, y: 406, radius: 1.5 },
  { x: 704, y: 108, radius: 1.2 },
  { x: 766, y: 44, radius: 1 },
  { x: 796, y: 352, radius: 1.5 },
  { x: 74, y: 298, radius: 1 },
  { x: 744, y: 270, radius: 1.2 },
  { x: 348, y: 414, radius: 1 },
  { x: 668, y: 194, radius: 1.5 }
];

const ANTENNAS: StationAntenna[] = [
  { x: 170, y: 176, height: 42 },
  { x: 688, y: 178, height: 46 }
];

export function calculateStationSceneFit(canvasWidth: number, canvasHeight: number) {
  const scale = Math.min(canvasWidth / STATION_SCENE_WIDTH, canvasHeight / STATION_SCENE_HEIGHT);
  const width = STATION_SCENE_WIDTH * scale;
  const height = STATION_SCENE_HEIGHT * scale;

  return {
    scale,
    width,
    height,
    x: (canvasWidth - width) / 2,
    y: (canvasHeight - height) / 2
  };
}

export function createStationModuleSprites(gameState: GameState): StationModuleSprite[] {
  return modules.map((module) => {
    const active = gameState.moduleLevels[module.id] > 0;
    const position = MODULE_POSITIONS[module.id];

    return {
      moduleId: module.id,
      x: position.x,
      y: position.y,
      active,
      tint: active ? stationTheme.lampAmber : stationTheme.utilityBlue
    };
  });
}

export function createStationSceneDetails(gameState: GameState): StationSceneDetails {
  const sprites = createStationModuleSprites(gameState);

  return {
    stars: STARS,
    antennas: ANTENNAS,
    activeWindowCount: sprites.filter((sprite) => sprite.active).length,
    lockedHardpointCount: sprites.filter((sprite) => !sprite.active).length,
    hasOxygenGardenAccent: sprites.some((sprite) => sprite.moduleId === 'oxygen_garden'),
    hasTeleportAccent: sprites.some((sprite) => sprite.moduleId === 'teleport_entry')
  };
}

function markAmbientLight(graphics: Graphics): Graphics {
  (graphics as Graphics & { label?: string }).label = 'ambient-light';

  return graphics;
}

function createBackground(): Graphics {
  const background = new Graphics();
  background.rect(0, 0, STATION_SCENE_WIDTH, STATION_SCENE_HEIGHT).fill(stationTheme.spaceNavy);

  return background;
}

function createStars(): Graphics {
  const stars = new Graphics();

  STARS.forEach((star) => {
    stars.circle(star.x, star.y, star.radius).fill(stationTheme.softWhite);
  });

  stars.alpha = 0.72;

  return stars;
}

function createCorridor(): Graphics {
  const corridor = new Graphics();
  corridor.roundRect(120, 240, 600, 52, 20).fill(stationTheme.enamelGreen);
  corridor.circle(420, 266, 34).fill(stationTheme.warmPanel);
  corridor.roundRect(146, 256, 548, 10, 5).fill(stationTheme.softWhite);
  corridor.alpha = 0.96;

  return corridor;
}

function createAntennas(): Graphics {
  const antennas = new Graphics();

  ANTENNAS.forEach((antenna) => {
    antennas.moveTo(antenna.x, antenna.y);
    antennas.lineTo(antenna.x, antenna.y - antenna.height);
    antennas.stroke({ color: stationTheme.softWhite, width: 3, alpha: 0.9 });
    antennas.circle(antenna.x, antenna.y - antenna.height - 5, 5).fill(stationTheme.signalRed);
  });

  return markAmbientLight(antennas);
}

function createModule(sprite: StationModuleSprite): Graphics {
  const module = new Graphics();
  const bodyColor = sprite.active ? stationTheme.warmPanel : stationTheme.ink;

  module.roundRect(sprite.x - 50, sprite.y - 36, 100, 72, 20).fill(bodyColor);
  module.roundRect(sprite.x - 44, sprite.y - 30, 88, 60, 16).stroke({
    color: sprite.active ? stationTheme.enamelGreen : stationTheme.utilityBlue,
    width: 3,
    alpha: sprite.active ? 0.95 : 0.55
  });

  if (sprite.active) {
    module.circle(sprite.x, sprite.y, 17).fill(stationTheme.lampAmber);
    module.circle(sprite.x - 22, sprite.y + 12, 6).fill(stationTheme.lampAmber);
    module.circle(sprite.x + 22, sprite.y + 12, 6).fill(stationTheme.lampAmber);
  } else {
    module.circle(sprite.x, sprite.y, 15).stroke({ color: stationTheme.utilityBlue, width: 3, alpha: 0.7 });
    module.circle(sprite.x - 22, sprite.y + 12, 5).fill(stationTheme.utilityBlue);
    module.circle(sprite.x + 22, sprite.y + 12, 5).fill(stationTheme.utilityBlue);
  }

  if (sprite.moduleId === 'oxygen_garden') {
    module.circle(sprite.x + 30, sprite.y - 20, 13).fill(stationTheme.enamelGreen);
    module.circle(sprite.x + 30, sprite.y - 20, 7).fill(stationTheme.softWhite);
  }

  if (sprite.moduleId === 'teleport_entry') {
    module.circle(sprite.x - 30, sprite.y + 18, 13).fill(stationTheme.utilityBlue);
    module.circle(sprite.x - 30, sprite.y + 18, 7).fill(stationTheme.softWhite);
  }

  return sprite.active ? markAmbientLight(module) : module;
}

export function buildStationContainer(gameState: GameState): Container {
  const container = new Container();

  container.addChild(createBackground());
  container.addChild(createStars());
  container.addChild(createCorridor());
  container.addChild(createAntennas());

  createStationModuleSprites(gameState).forEach((sprite) => {
    container.addChild(createModule(sprite));
  });

  return container;
}
