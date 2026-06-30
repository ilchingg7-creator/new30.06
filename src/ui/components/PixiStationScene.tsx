import { Application, type Container, type Ticker } from 'pixi.js';
import { useEffect, useRef } from 'react';
import type { GameState, ModuleId } from '../../game/types';
import { buildRoomContainer, calculateRoomSceneFit, createRoomSceneDescriptor } from '../../station/roomScenes';
import { buildSpriteRoomContainer, updateSpriteAnimations } from '../../station/spriteScene';
import { stationTheme } from '../../station/stationTheme';

interface PixiStationSceneProps {
  gameState: GameState;
  selectedRoomId: ModuleId;
}

export function PixiStationScene({ gameState, selectedRoomId }: PixiStationSceneProps) {
  const hostRef = useRef<HTMLElement | null>(null);
  const appRef = useRef<Application | null>(null);
  const gameStateRef = useRef(gameState);
  const selectedRoomIdRef = useRef(selectedRoomId);
  const sceneRef = useRef<Container | null>(null);
  const spriteLayerRef = useRef<Container | null>(null);
  const pulseTimeRef = useRef(0);
  const spriteTimeRef = useRef(0);
  const sceneTokenRef = useRef(0);

  function applySceneFit(app: Application, scene: Container) {
    const fit = calculateRoomSceneFit(app.renderer.width, app.renderer.height);

    scene.scale.set(fit.scale);
    scene.position.set(fit.x, fit.y);
  }

  function setScene(app: Application, nextGameState: GameState, nextSelectedRoomId: ModuleId) {
    const scene = buildRoomContainer(nextGameState, nextSelectedRoomId);

    app.stage.removeChildren();
    app.stage.addChild(scene);
    applySceneFit(app, scene);
    sceneRef.current = scene;
    spriteLayerRef.current = null;

    // Load sprite layers async and composite on top of the Graphics scene.
    // Each call increments a token so a stale load can't overwrite a newer scene.
    const token = ++sceneTokenRef.current;
    const descriptor = createRoomSceneDescriptor(nextGameState, nextSelectedRoomId);
    const moduleId: ModuleId = descriptor.moduleId;
    const level = nextGameState.moduleLevels[moduleId];

    void buildSpriteRoomContainer(moduleId, level).then((spriteLayer) => {
      if (token !== sceneTokenRef.current) {
        return; // a newer scene was set while we were loading
      }

      const currentScene = sceneRef.current;

      if (!currentScene) {
        return;
      }

      currentScene.addChild(spriteLayer);
      spriteLayerRef.current = spriteLayer;
    });
  }

  useEffect(() => {
    gameStateRef.current = gameState;
    selectedRoomIdRef.current = selectedRoomId;

    const app = appRef.current;

    if (!app?.stage) {
      return;
    }

    setScene(app, gameState, selectedRoomId);
  }, [gameState, selectedRoomId]);

  useEffect(() => {
    const host = hostRef.current;

    if (!host) {
      return undefined;
    }

    let cancelled = false;
    let initialized = false;
    const app = new Application();
    const animate = (ticker: Ticker) => {
      pulseTimeRef.current += ticker.deltaTime * 0.04;
      const alpha = 0.78 + Math.sin(pulseTimeRef.current) * 0.18;
      const scene = sceneRef.current;

      if (!scene) {
        return;
      }

      applySceneFit(app, scene);

      // Pulse ambient-light Graphics children (legacy).
      scene.children.forEach((child) => {
        const labeledChild = child as Container & { label?: string };

        if (labeledChild.label === 'ambient-light') {
          labeledChild.alpha = alpha;
        }
      });

      // Animate sprite layers.
      spriteTimeRef.current += ticker.deltaMS / 1000;
      const spriteLayer = spriteLayerRef.current;

      if (spriteLayer) {
        updateSpriteAnimations(spriteLayer, ticker.deltaTime, spriteTimeRef.current);
      }
    };

    appRef.current = app;

    void app
      .init({
        backgroundColor: stationTheme.spaceNavy,
        resizeTo: host
      })
      .then(() => {
        initialized = true;

        if (cancelled) {
          app.destroy(true);
          return;
        }

        host.appendChild(app.canvas);
        setScene(app, gameStateRef.current, selectedRoomIdRef.current);
        app.ticker.add(animate);
      });

    return () => {
      cancelled = true;
      if (initialized) {
        app.ticker.remove(animate);
        app.destroy(true);
      }
      appRef.current = null;
    };
  }, []);

  return <section className="station-view" aria-label="Визуальный вид станции" ref={hostRef} />;
}
