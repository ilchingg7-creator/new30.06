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

function createBackground(): Graphics {
  const background = new Graphics();
  background.rect(0, 0, 840, 480).fill(stationTheme.spaceNavy);

  return background;
}

function createCorridor(): Graphics {
  const corridor = new Graphics();
  corridor.roundRect(120, 240, 600, 52, 20).fill(stationTheme.enamelGreen);
  corridor.circle(420, 266, 34).fill(stationTheme.warmPanel);

  return corridor;
}

function createModule(sprite: StationModuleSprite): Graphics {
  const module = new Graphics();
  const bodyColor = sprite.active ? stationTheme.warmPanel : stationTheme.ink;

  module.roundRect(sprite.x - 48, sprite.y - 34, 96, 68, 20).fill(bodyColor);
  module.circle(sprite.x, sprite.y, 16).fill(sprite.tint);

  if (sprite.moduleId === 'oxygen_garden') {
    module.circle(sprite.x + 28, sprite.y - 18, 12).fill(stationTheme.enamelGreen);
  }

  if (sprite.moduleId === 'teleport_entry') {
    module.circle(sprite.x - 28, sprite.y + 16, 12).fill(stationTheme.utilityBlue);
  }

  return module;
}

export function buildStationContainer(gameState: GameState): Container {
  const container = new Container();

  container.addChild(createBackground());
  container.addChild(createCorridor());

  createStationModuleSprites(gameState).forEach((sprite) => {
    container.addChild(createModule(sprite));
  });

  return container;
}
