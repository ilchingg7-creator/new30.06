import type { ModuleId, RoomSpriteLayer } from '../game/types';

/**
 * Sprite layer manifests for every room. Each layer unlocks at a specific
 * module level (1, 10, 20, ..., 100). At each step a new detail sprite
 * appears, and many layers carry a programmatic animation (bob/rotate/pulse/
 * flicker/drift) so the room feels alive without costly frame-by-frame art.
 *
 * Layers are positioned inside the 840×480 room canvas. The background and
 * shell are still drawn with PixiJS Graphics (cheap, already works); sprite
 * layers sit on top of the shell as detailed props, residents and effects.
 *
 * Texture paths point to /sprites/rooms/<moduleId>/<layer>.png. Missing
 * textures are tolerated by the loader (the layer is skipped) so the game
 * keeps working while sprites are generated incrementally.
 */
export const roomSpriteManifests: Record<ModuleId, RoomSpriteLayer[]> = {
  tenant_capsule: [
    {
      id: 'base',
      texture: '/sprites/rooms/tenant_capsule/base.png',
      x: 420,
      y: 240,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.58,
      unlockLevel: 1,
      z: 1
    },
    {
      id: 'resident-1',
      texture: '/sprites/rooms/tenant_capsule/resident-1.png',
      x: 328,
      y: 262,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.4,
      unlockLevel: 10,
      z: 20,
      animation: { kind: 'bob', amplitude: 2, speed: 1.6, axis: 'y' }
    },
    {
      id: 'work-prop',
      texture: '/sprites/rooms/tenant_capsule/work-prop.png',
      x: 560,
      y: 230,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.35,
      unlockLevel: 20,
      z: 15,
      animation: { kind: 'rotate', amplitude: 0.12, speed: 2.2 }
    },
    {
      id: 'decoration-1',
      texture: '/sprites/rooms/tenant_capsule/decoration-1.png',
      x: 180,
      y: 200,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.3,
      unlockLevel: 30,
      z: 10
    },
    {
      id: 'decoration-2',
      texture: '/sprites/rooms/tenant_capsule/decoration-2.png',
      x: 660,
      y: 300,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.28,
      unlockLevel: 40,
      z: 12
    },
    {
      id: 'service-prop',
      texture: '/sprites/rooms/tenant_capsule/service-prop.png',
      x: 460,
      y: 150,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.25,
      unlockLevel: 50,
      z: 8,
      animation: { kind: 'flicker', amplitude: 0.3, speed: 3 }
    },
    {
      id: 'window-upgrade',
      texture: '/sprites/rooms/tenant_capsule/window-upgrade.png',
      x: 620,
      y: 180,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.3,
      unlockLevel: 60,
      z: 5
    },
    {
      id: 'resident-2',
      texture: '/sprites/rooms/tenant_capsule/resident-2.png',
      x: 500,
      y: 280,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.32,
      unlockLevel: 70,
      z: 25,
      animation: { kind: 'bob', amplitude: 1.5, speed: 1.2, axis: 'y' }
    },
    {
      id: 'premium-detail',
      texture: '/sprites/rooms/tenant_capsule/premium-detail.png',
      x: 420,
      y: 110,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.35,
      unlockLevel: 80,
      z: 6
    },
    {
      id: 'ambient-effect',
      texture: '/sprites/rooms/tenant_capsule/ambient-effect.png',
      x: 420,
      y: 240,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.5,
      unlockLevel: 90,
      z: 30,
      animation: { kind: 'drift', amplitude: 8, speed: 0.4, axis: 'y' }
    },
    {
      id: 'complete-overlay',
      texture: '/sprites/rooms/tenant_capsule/complete-overlay.png',
      x: 420,
      y: 240,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.6,
      unlockLevel: 100,
      z: 40,
      animation: { kind: 'pulse', amplitude: 0.12, speed: 1 }
    }
  ],

  cosmo_kitchen: [
    {
      id: 'base',
      texture: '/sprites/rooms/cosmo_kitchen/base.png',
      x: 420,
      y: 240,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.58,
      unlockLevel: 1,
      z: 1
    },
    {
      id: 'resident-1',
      texture: '/sprites/rooms/cosmo_kitchen/resident-1.png',
      x: 398,
      y: 250,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.38,
      unlockLevel: 10,
      z: 20,
      animation: { kind: 'bob', amplitude: 2, speed: 1.4, axis: 'y' }
    },
    {
      id: 'work-prop',
      texture: '/sprites/rooms/cosmo_kitchen/work-prop.png',
      x: 398,
      y: 200,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.32,
      unlockLevel: 20,
      z: 15,
      animation: { kind: 'pulse', amplitude: 0.08, speed: 2.5 }
    },
    {
      id: 'decoration-1',
      texture: '/sprites/rooms/cosmo_kitchen/decoration-1.png',
      x: 200,
      y: 210,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.28,
      unlockLevel: 30,
      z: 10
    },
    {
      id: 'decoration-2',
      texture: '/sprites/rooms/cosmo_kitchen/decoration-2.png',
      x: 640,
      y: 290,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.26,
      unlockLevel: 40,
      z: 12
    },
    {
      id: 'service-prop',
      texture: '/sprites/rooms/cosmo_kitchen/service-prop.png',
      x: 520,
      y: 150,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.24,
      unlockLevel: 50,
      z: 8,
      animation: { kind: 'flicker', amplitude: 0.25, speed: 2.8 }
    },
    {
      id: 'window-upgrade',
      texture: '/sprites/rooms/cosmo_kitchen/window-upgrade.png',
      x: 620,
      y: 180,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.3,
      unlockLevel: 60,
      z: 5
    },
    {
      id: 'resident-2',
      texture: '/sprites/rooms/cosmo_kitchen/resident-2.png',
      x: 540,
      y: 270,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.32,
      unlockLevel: 70,
      z: 25,
      animation: { kind: 'bob', amplitude: 1.5, speed: 1.1, axis: 'y' }
    },
    {
      id: 'premium-detail',
      texture: '/sprites/rooms/cosmo_kitchen/premium-detail.png',
      x: 420,
      y: 110,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.34,
      unlockLevel: 80,
      z: 6
    },
    {
      id: 'ambient-effect',
      texture: '/sprites/rooms/cosmo_kitchen/ambient-effect.png',
      x: 398,
      y: 180,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.4,
      unlockLevel: 90,
      z: 30,
      animation: { kind: 'drift', amplitude: 6, speed: 0.5, axis: 'y' }
    },
    {
      id: 'complete-overlay',
      texture: '/sprites/rooms/cosmo_kitchen/complete-overlay.png',
      x: 420,
      y: 240,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.6,
      unlockLevel: 100,
      z: 40,
      animation: { kind: 'pulse', amplitude: 0.12, speed: 1 }
    }
  ],

  oxygen_garden: [
    {
      id: 'base',
      texture: '/sprites/rooms/oxygen_garden/base.png',
      x: 420,
      y: 240,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.58,
      unlockLevel: 1,
      z: 1
    },
    {
      id: 'resident-1',
      texture: '/sprites/rooms/oxygen_garden/resident-1.png',
      x: 420,
      y: 250,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.36,
      unlockLevel: 10,
      z: 20,
      animation: { kind: 'bob', amplitude: 2, speed: 1.3, axis: 'y' }
    },
    {
      id: 'work-prop',
      texture: '/sprites/rooms/oxygen_garden/work-prop.png',
      x: 420,
      y: 220,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.3,
      unlockLevel: 20,
      z: 15,
      animation: { kind: 'pulse', amplitude: 0.1, speed: 1.8 }
    },
    {
      id: 'decoration-1',
      texture: '/sprites/rooms/oxygen_garden/decoration-1.png',
      x: 220,
      y: 230,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.26,
      unlockLevel: 30,
      z: 10
    },
    {
      id: 'decoration-2',
      texture: '/sprites/rooms/oxygen_garden/decoration-2.png',
      x: 620,
      y: 240,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.26,
      unlockLevel: 40,
      z: 12
    },
    {
      id: 'service-prop',
      texture: '/sprites/rooms/oxygen_garden/service-prop.png',
      x: 500,
      y: 150,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.22,
      unlockLevel: 50,
      z: 8,
      animation: { kind: 'flicker', amplitude: 0.2, speed: 2.5 }
    },
    {
      id: 'window-upgrade',
      texture: '/sprites/rooms/oxygen_garden/window-upgrade.png',
      x: 620,
      y: 170,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.28,
      unlockLevel: 60,
      z: 5
    },
    {
      id: 'resident-2',
      texture: '/sprites/rooms/oxygen_garden/resident-2.png',
      x: 540,
      y: 270,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.3,
      unlockLevel: 70,
      z: 25,
      animation: { kind: 'bob', amplitude: 1.5, speed: 1.1, axis: 'y' }
    },
    {
      id: 'premium-detail',
      texture: '/sprites/rooms/oxygen_garden/premium-detail.png',
      x: 420,
      y: 110,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.32,
      unlockLevel: 80,
      z: 6
    },
    {
      id: 'ambient-effect',
      texture: '/sprites/rooms/oxygen_garden/ambient-effect.png',
      x: 420,
      y: 200,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.45,
      unlockLevel: 90,
      z: 30,
      animation: { kind: 'drift', amplitude: 10, speed: 0.3, axis: 'y' }
    },
    {
      id: 'complete-overlay',
      texture: '/sprites/rooms/oxygen_garden/complete-overlay.png',
      x: 420,
      y: 240,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.6,
      unlockLevel: 100,
      z: 40,
      animation: { kind: 'pulse', amplitude: 0.12, speed: 1 }
    }
  ],

  zero_g_laundry: [
    {
      id: 'base',
      texture: '/sprites/rooms/zero_g_laundry/base.png',
      x: 420,
      y: 240,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.58,
      unlockLevel: 1,
      z: 1
    },
    {
      id: 'resident-1',
      texture: '/sprites/rooms/zero_g_laundry/resident-1.png',
      x: 500,
      y: 250,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.36,
      unlockLevel: 10,
      z: 20,
      animation: { kind: 'bob', amplitude: 2, speed: 1.5, axis: 'y' }
    },
    {
      id: 'work-prop',
      texture: '/sprites/rooms/zero_g_laundry/work-prop.png',
      x: 420,
      y: 240,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.32,
      unlockLevel: 20,
      z: 15,
      animation: { kind: 'rotate', amplitude: 0.3, speed: 4 }
    },
    {
      id: 'decoration-1',
      texture: '/sprites/rooms/zero_g_laundry/decoration-1.png',
      x: 220,
      y: 220,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.26,
      unlockLevel: 30,
      z: 10
    },
    {
      id: 'decoration-2',
      texture: '/sprites/rooms/zero_g_laundry/decoration-2.png',
      x: 640,
      y: 280,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.24,
      unlockLevel: 40,
      z: 12
    },
    {
      id: 'service-prop',
      texture: '/sprites/rooms/zero_g_laundry/service-prop.png',
      x: 480,
      y: 150,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.22,
      unlockLevel: 50,
      z: 8,
      animation: { kind: 'flicker', amplitude: 0.25, speed: 3 }
    },
    {
      id: 'window-upgrade',
      texture: '/sprites/rooms/zero_g_laundry/window-upgrade.png',
      x: 620,
      y: 180,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.28,
      unlockLevel: 60,
      z: 5
    },
    {
      id: 'resident-2',
      texture: '/sprites/rooms/zero_g_laundry/resident-2.png',
      x: 340,
      y: 270,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.3,
      unlockLevel: 70,
      z: 25,
      animation: { kind: 'bob', amplitude: 1.5, speed: 1.2, axis: 'y' }
    },
    {
      id: 'premium-detail',
      texture: '/sprites/rooms/zero_g_laundry/premium-detail.png',
      x: 420,
      y: 110,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.32,
      unlockLevel: 80,
      z: 6
    },
    {
      id: 'ambient-effect',
      texture: '/sprites/rooms/zero_g_laundry/ambient-effect.png',
      x: 420,
      y: 200,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.4,
      unlockLevel: 90,
      z: 30,
      animation: { kind: 'drift', amplitude: 12, speed: 0.35, axis: 'y' }
    },
    {
      id: 'complete-overlay',
      texture: '/sprites/rooms/zero_g_laundry/complete-overlay.png',
      x: 420,
      y: 240,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.6,
      unlockLevel: 100,
      z: 40,
      animation: { kind: 'pulse', amplitude: 0.12, speed: 1 }
    }
  ],

  teleport_entry: [
    {
      id: 'base',
      texture: '/sprites/rooms/teleport_entry/base.png',
      x: 420,
      y: 240,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.58,
      unlockLevel: 1,
      z: 1
    },
    {
      id: 'resident-1',
      texture: '/sprites/rooms/teleport_entry/resident-1.png',
      x: 500,
      y: 260,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.36,
      unlockLevel: 10,
      z: 20,
      animation: { kind: 'bob', amplitude: 2, speed: 1.4, axis: 'y' }
    },
    {
      id: 'work-prop',
      texture: '/sprites/rooms/teleport_entry/work-prop.png',
      x: 420,
      y: 240,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.34,
      unlockLevel: 20,
      z: 15,
      animation: { kind: 'pulse', amplitude: 0.15, speed: 3 }
    },
    {
      id: 'decoration-1',
      texture: '/sprites/rooms/teleport_entry/decoration-1.png',
      x: 220,
      y: 220,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.26,
      unlockLevel: 30,
      z: 10
    },
    {
      id: 'decoration-2',
      texture: '/sprites/rooms/teleport_entry/decoration-2.png',
      x: 640,
      y: 270,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.24,
      unlockLevel: 40,
      z: 12
    },
    {
      id: 'service-prop',
      texture: '/sprites/rooms/teleport_entry/service-prop.png',
      x: 480,
      y: 150,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.22,
      unlockLevel: 50,
      z: 8,
      animation: { kind: 'flicker', amplitude: 0.3, speed: 2.5 }
    },
    {
      id: 'window-upgrade',
      texture: '/sprites/rooms/teleport_entry/window-upgrade.png',
      x: 620,
      y: 180,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.28,
      unlockLevel: 60,
      z: 5
    },
    {
      id: 'resident-2',
      texture: '/sprites/rooms/teleport_entry/resident-2.png',
      x: 340,
      y: 270,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.3,
      unlockLevel: 70,
      z: 25,
      animation: { kind: 'bob', amplitude: 1.5, speed: 1.1, axis: 'y' }
    },
    {
      id: 'premium-detail',
      texture: '/sprites/rooms/teleport_entry/premium-detail.png',
      x: 420,
      y: 110,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.32,
      unlockLevel: 80,
      z: 6
    },
    {
      id: 'ambient-effect',
      texture: '/sprites/rooms/teleport_entry/ambient-effect.png',
      x: 420,
      y: 220,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.4,
      unlockLevel: 90,
      z: 30,
      animation: { kind: 'drift', amplitude: 8, speed: 0.4, axis: 'y' }
    },
    {
      id: 'complete-overlay',
      texture: '/sprites/rooms/teleport_entry/complete-overlay.png',
      x: 420,
      y: 240,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.6,
      unlockLevel: 100,
      z: 40,
      animation: { kind: 'pulse', amplitude: 0.12, speed: 1 }
    }
  ],

  antigrav_gym: [
    {
      id: 'base',
      texture: '/sprites/rooms/antigrav_gym/base.png',
      x: 420,
      y: 240,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.58,
      unlockLevel: 1,
      z: 1
    },
    {
      id: 'resident-1',
      texture: '/sprites/rooms/antigrav_gym/resident-1.png',
      x: 420,
      y: 230,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.38,
      unlockLevel: 10,
      z: 20,
      animation: { kind: 'rotate', amplitude: 0.15, speed: 2 }
    },
    {
      id: 'work-prop',
      texture: '/sprites/rooms/antigrav_gym/work-prop.png',
      x: 420,
      y: 220,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.32,
      unlockLevel: 20,
      z: 15,
      animation: { kind: 'rotate', amplitude: 0.2, speed: 2.5 }
    },
    {
      id: 'decoration-1',
      texture: '/sprites/rooms/antigrav_gym/decoration-1.png',
      x: 220,
      y: 220,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.26,
      unlockLevel: 30,
      z: 10
    },
    {
      id: 'decoration-2',
      texture: '/sprites/rooms/antigrav_gym/decoration-2.png',
      x: 640,
      y: 280,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.24,
      unlockLevel: 40,
      z: 12
    },
    {
      id: 'service-prop',
      texture: '/sprites/rooms/antigrav_gym/service-prop.png',
      x: 480,
      y: 150,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.22,
      unlockLevel: 50,
      z: 8,
      animation: { kind: 'flicker', amplitude: 0.25, speed: 2.8 }
    },
    {
      id: 'window-upgrade',
      texture: '/sprites/rooms/antigrav_gym/window-upgrade.png',
      x: 620,
      y: 180,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.28,
      unlockLevel: 60,
      z: 5
    },
    {
      id: 'resident-2',
      texture: '/sprites/rooms/antigrav_gym/resident-2.png',
      x: 540,
      y: 260,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.3,
      unlockLevel: 70,
      z: 25,
      animation: { kind: 'bob', amplitude: 1.5, speed: 1.3, axis: 'y' }
    },
    {
      id: 'premium-detail',
      texture: '/sprites/rooms/antigrav_gym/premium-detail.png',
      x: 420,
      y: 110,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.32,
      unlockLevel: 80,
      z: 6
    },
    {
      id: 'ambient-effect',
      texture: '/sprites/rooms/antigrav_gym/ambient-effect.png',
      x: 420,
      y: 220,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.4,
      unlockLevel: 90,
      z: 30,
      animation: { kind: 'drift', amplitude: 6, speed: 0.5, axis: 'y' }
    },
    {
      id: 'complete-overlay',
      texture: '/sprites/rooms/antigrav_gym/complete-overlay.png',
      x: 420,
      y: 240,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.6,
      unlockLevel: 100,
      z: 40,
      animation: { kind: 'pulse', amplitude: 0.12, speed: 1 }
    }
  ],

  panorama_dome: [
    {
      id: 'base',
      texture: '/sprites/rooms/panorama_dome/base.png',
      x: 420,
      y: 240,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.58,
      unlockLevel: 1,
      z: 1
    },
    {
      id: 'resident-1',
      texture: '/sprites/rooms/panorama_dome/resident-1.png',
      x: 420,
      y: 280,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.36,
      unlockLevel: 10,
      z: 20,
      animation: { kind: 'bob', amplitude: 1.5, speed: 1.2, axis: 'y' }
    },
    {
      id: 'work-prop',
      texture: '/sprites/rooms/panorama_dome/work-prop.png',
      x: 420,
      y: 240,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.3,
      unlockLevel: 20,
      z: 15,
      animation: { kind: 'pulse', amplitude: 0.1, speed: 1.5 }
    },
    {
      id: 'decoration-1',
      texture: '/sprites/rooms/panorama_dome/decoration-1.png',
      x: 240,
      y: 260,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.26,
      unlockLevel: 30,
      z: 10
    },
    {
      id: 'decoration-2',
      texture: '/sprites/rooms/panorama_dome/decoration-2.png',
      x: 600,
      y: 260,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.26,
      unlockLevel: 40,
      z: 12
    },
    {
      id: 'service-prop',
      texture: '/sprites/rooms/panorama_dome/service-prop.png',
      x: 480,
      y: 130,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.22,
      unlockLevel: 50,
      z: 8,
      animation: { kind: 'flicker', amplitude: 0.2, speed: 2 }
    },
    {
      id: 'window-upgrade',
      texture: '/sprites/rooms/panorama_dome/window-upgrade.png',
      x: 420,
      y: 160,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.35,
      unlockLevel: 60,
      z: 5
    },
    {
      id: 'resident-2',
      texture: '/sprites/rooms/panorama_dome/resident-2.png',
      x: 500,
      y: 280,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.3,
      unlockLevel: 70,
      z: 25,
      animation: { kind: 'bob', amplitude: 1.5, speed: 1, axis: 'y' }
    },
    {
      id: 'premium-detail',
      texture: '/sprites/rooms/panorama_dome/premium-detail.png',
      x: 420,
      y: 100,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.32,
      unlockLevel: 80,
      z: 6
    },
    {
      id: 'ambient-effect',
      texture: '/sprites/rooms/panorama_dome/ambient-effect.png',
      x: 420,
      y: 180,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.45,
      unlockLevel: 90,
      z: 30,
      animation: { kind: 'drift', amplitude: 8, speed: 0.3, axis: 'y' }
    },
    {
      id: 'complete-overlay',
      texture: '/sprites/rooms/panorama_dome/complete-overlay.png',
      x: 420,
      y: 240,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.6,
      unlockLevel: 100,
      z: 40,
      animation: { kind: 'pulse', amplitude: 0.12, speed: 1 }
    }
  ],

  saucer_dock: [
    {
      id: 'base',
      texture: '/sprites/rooms/saucer_dock/base.png',
      x: 420,
      y: 240,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.58,
      unlockLevel: 1,
      z: 1
    },
    {
      id: 'resident-1',
      texture: '/sprites/rooms/saucer_dock/resident-1.png',
      x: 500,
      y: 260,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.36,
      unlockLevel: 10,
      z: 20,
      animation: { kind: 'bob', amplitude: 2, speed: 1.3, axis: 'y' }
    },
    {
      id: 'work-prop',
      texture: '/sprites/rooms/saucer_dock/work-prop.png',
      x: 420,
      y: 240,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.34,
      unlockLevel: 20,
      z: 15,
      animation: { kind: 'pulse', amplitude: 0.12, speed: 2 }
    },
    {
      id: 'decoration-1',
      texture: '/sprites/rooms/saucer_dock/decoration-1.png',
      x: 220,
      y: 230,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.26,
      unlockLevel: 30,
      z: 10
    },
    {
      id: 'decoration-2',
      texture: '/sprites/rooms/saucer_dock/decoration-2.png',
      x: 640,
      y: 280,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.24,
      unlockLevel: 40,
      z: 12
    },
    {
      id: 'service-prop',
      texture: '/sprites/rooms/saucer_dock/service-prop.png',
      x: 480,
      y: 150,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.22,
      unlockLevel: 50,
      z: 8,
      animation: { kind: 'flicker', amplitude: 0.3, speed: 3 }
    },
    {
      id: 'window-upgrade',
      texture: '/sprites/rooms/saucer_dock/window-upgrade.png',
      x: 620,
      y: 180,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.28,
      unlockLevel: 60,
      z: 5
    },
    {
      id: 'resident-2',
      texture: '/sprites/rooms/saucer_dock/resident-2.png',
      x: 340,
      y: 270,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.3,
      unlockLevel: 70,
      z: 25,
      animation: { kind: 'bob', amplitude: 1.5, speed: 1.1, axis: 'y' }
    },
    {
      id: 'premium-detail',
      texture: '/sprites/rooms/saucer_dock/premium-detail.png',
      x: 420,
      y: 110,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.32,
      unlockLevel: 80,
      z: 6
    },
    {
      id: 'ambient-effect',
      texture: '/sprites/rooms/saucer_dock/ambient-effect.png',
      x: 420,
      y: 220,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.4,
      unlockLevel: 90,
      z: 30,
      animation: { kind: 'drift', amplitude: 6, speed: 0.4, axis: 'y' }
    },
    {
      id: 'complete-overlay',
      texture: '/sprites/rooms/saucer_dock/complete-overlay.png',
      x: 420,
      y: 240,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.6,
      unlockLevel: 100,
      z: 40,
      animation: { kind: 'pulse', amplitude: 0.12, speed: 1 }
    }
  ],

  radiator_balcony: [
    {
      id: 'base',
      texture: '/sprites/rooms/radiator_balcony/base.png',
      x: 420,
      y: 240,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.58,
      unlockLevel: 1,
      z: 1
    },
    {
      id: 'resident-1',
      texture: '/sprites/rooms/radiator_balcony/resident-1.png',
      x: 420,
      y: 260,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.36,
      unlockLevel: 10,
      z: 20,
      animation: { kind: 'bob', amplitude: 1.5, speed: 1.2, axis: 'y' }
    },
    {
      id: 'work-prop',
      texture: '/sprites/rooms/radiator_balcony/work-prop.png',
      x: 420,
      y: 220,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.32,
      unlockLevel: 20,
      z: 15,
      animation: { kind: 'flicker', amplitude: 0.2, speed: 1.5 }
    },
    {
      id: 'decoration-1',
      texture: '/sprites/rooms/radiator_balcony/decoration-1.png',
      x: 220,
      y: 230,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.26,
      unlockLevel: 30,
      z: 10
    },
    {
      id: 'decoration-2',
      texture: '/sprites/rooms/radiator_balcony/decoration-2.png',
      x: 640,
      y: 270,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.24,
      unlockLevel: 40,
      z: 12
    },
    {
      id: 'service-prop',
      texture: '/sprites/rooms/radiator_balcony/service-prop.png',
      x: 480,
      y: 150,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.22,
      unlockLevel: 50,
      z: 8,
      animation: { kind: 'flicker', amplitude: 0.25, speed: 2.5 }
    },
    {
      id: 'window-upgrade',
      texture: '/sprites/rooms/radiator_balcony/window-upgrade.png',
      x: 620,
      y: 180,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.28,
      unlockLevel: 60,
      z: 5
    },
    {
      id: 'resident-2',
      texture: '/sprites/rooms/radiator_balcony/resident-2.png',
      x: 500,
      y: 270,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.3,
      unlockLevel: 70,
      z: 25,
      animation: { kind: 'bob', amplitude: 1.5, speed: 1, axis: 'y' }
    },
    {
      id: 'premium-detail',
      texture: '/sprites/rooms/radiator_balcony/premium-detail.png',
      x: 420,
      y: 110,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.32,
      unlockLevel: 80,
      z: 6
    },
    {
      id: 'ambient-effect',
      texture: '/sprites/rooms/radiator_balcony/ambient-effect.png',
      x: 420,
      y: 220,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.4,
      unlockLevel: 90,
      z: 30,
      animation: { kind: 'drift', amplitude: 8, speed: 0.35, axis: 'y' }
    },
    {
      id: 'complete-overlay',
      texture: '/sprites/rooms/radiator_balcony/complete-overlay.png',
      x: 420,
      y: 240,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.6,
      unlockLevel: 100,
      z: 40,
      animation: { kind: 'pulse', amplitude: 0.12, speed: 1 }
    }
  ],

  mail_tube_office: [
    {
      id: 'base',
      texture: '/sprites/rooms/mail_tube_office/base.png',
      x: 420,
      y: 240,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.58,
      unlockLevel: 1,
      z: 1
    },
    {
      id: 'resident-1',
      texture: '/sprites/rooms/mail_tube_office/resident-1.png',
      x: 500,
      y: 260,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.36,
      unlockLevel: 10,
      z: 20,
      animation: { kind: 'bob', amplitude: 2, speed: 1.4, axis: 'y' }
    },
    {
      id: 'work-prop',
      texture: '/sprites/rooms/mail_tube_office/work-prop.png',
      x: 420,
      y: 240,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.34,
      unlockLevel: 20,
      z: 15,
      animation: { kind: 'drift', amplitude: 40, speed: 1.5, axis: 'x' }
    },
    {
      id: 'decoration-1',
      texture: '/sprites/rooms/mail_tube_office/decoration-1.png',
      x: 220,
      y: 220,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.26,
      unlockLevel: 30,
      z: 10
    },
    {
      id: 'decoration-2',
      texture: '/sprites/rooms/mail_tube_office/decoration-2.png',
      x: 640,
      y: 280,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.24,
      unlockLevel: 40,
      z: 12
    },
    {
      id: 'service-prop',
      texture: '/sprites/rooms/mail_tube_office/service-prop.png',
      x: 480,
      y: 150,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.22,
      unlockLevel: 50,
      z: 8,
      animation: { kind: 'flicker', amplitude: 0.25, speed: 2.8 }
    },
    {
      id: 'window-upgrade',
      texture: '/sprites/rooms/mail_tube_office/window-upgrade.png',
      x: 620,
      y: 180,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.28,
      unlockLevel: 60,
      z: 5
    },
    {
      id: 'resident-2',
      texture: '/sprites/rooms/mail_tube_office/resident-2.png',
      x: 340,
      y: 270,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.3,
      unlockLevel: 70,
      z: 25,
      animation: { kind: 'bob', amplitude: 1.5, speed: 1.1, axis: 'y' }
    },
    {
      id: 'premium-detail',
      texture: '/sprites/rooms/mail_tube_office/premium-detail.png',
      x: 420,
      y: 110,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.32,
      unlockLevel: 80,
      z: 6
    },
    {
      id: 'ambient-effect',
      texture: '/sprites/rooms/mail_tube_office/ambient-effect.png',
      x: 420,
      y: 220,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.4,
      unlockLevel: 90,
      z: 30,
      animation: { kind: 'drift', amplitude: 6, speed: 0.4, axis: 'y' }
    },
    {
      id: 'complete-overlay',
      texture: '/sprites/rooms/mail_tube_office/complete-overlay.png',
      x: 420,
      y: 240,
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.6,
      unlockLevel: 100,
      z: 40,
      animation: { kind: 'pulse', amplitude: 0.12, speed: 1 }
    }
  ]
};
