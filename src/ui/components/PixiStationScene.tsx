import { Application, type Container, type Ticker } from 'pixi.js';
import { useEffect, useRef } from 'react';
import type { GameState, ModuleId } from '../../game/types';
import { buildRoomContainer, calculateRoomSceneFit, loadRoomSpriteAssetForState } from '../../station/roomScenes';
import { stationTheme } from '../../station/stationTheme';

interface PixiStationSceneProps {
  gameState: GameState;
  selectedRoomId: ModuleId;
  onRoomClick?: () => void;
  ariaLabel?: string;
}

export function PixiStationScene({ gameState, selectedRoomId, onRoomClick, ariaLabel }: PixiStationSceneProps) {
  const hostRef = useRef<HTMLElement | null>(null);
  const appRef = useRef<Application | null>(null);
  const gameStateRef = useRef(gameState);
  const selectedRoomIdRef = useRef(selectedRoomId);
  const onRoomClickRef = useRef(onRoomClick);
  const sceneRef = useRef<Container | null>(null);
  const pulseTimeRef = useRef(0);
  const sceneRequestIdRef = useRef(0);

  function applySceneFit(app: Application, scene: Container) {
    const fit = calculateRoomSceneFit(app.renderer.width, app.renderer.height);

    scene.scale.set(fit.scale);
    scene.position.set(fit.x, fit.y);
  }

  async function setScene(app: Application, nextGameState: GameState, nextSelectedRoomId: ModuleId) {
    const requestId = sceneRequestIdRef.current + 1;
    sceneRequestIdRef.current = requestId;

    await loadRoomSpriteAssetForState(nextGameState, nextSelectedRoomId);

    if (requestId !== sceneRequestIdRef.current || appRef.current !== app || !app.stage) {
      return;
    }

    const scene = buildRoomContainer(nextGameState, nextSelectedRoomId);

    app.stage.removeChildren();
    app.stage.addChild(scene);
    applySceneFit(app, scene);
    sceneRef.current = scene;
  }

  useEffect(() => {
    gameStateRef.current = gameState;
    selectedRoomIdRef.current = selectedRoomId;
    onRoomClickRef.current = onRoomClick;

    const app = appRef.current;

    if (!app?.stage) {
      return;
    }

    void setScene(app, gameState, selectedRoomId);
  }, [gameState, selectedRoomId, onRoomClick]);

  useEffect(() => {
    const host = hostRef.current;

    if (!host) {
      return undefined;
    }

    let cancelled = false;
    let initialized = false;
    const app = new Application();
    const animateAmbientLights = (ticker: Ticker) => {
      pulseTimeRef.current += ticker.deltaTime * 0.04;
      const alpha = 0.78 + Math.sin(pulseTimeRef.current) * 0.18;
      const scene = sceneRef.current;

      if (!scene) {
        return;
      }

      applySceneFit(app, scene);

      scene.children.forEach((child) => {
        const labeledChild = child as Container & { label?: string };

        if (labeledChild.label === 'ambient-light') {
          labeledChild.alpha = alpha;
        }
      });
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
        void setScene(app, gameStateRef.current, selectedRoomIdRef.current);
        app.ticker.add(animateAmbientLights);

        const canvas = app.canvas;

        canvas.style.cursor = 'pointer';
        canvas.addEventListener('pointerdown', () => {
          onRoomClickRef.current?.();
        });
      });

    return () => {
      cancelled = true;
      if (initialized) {
        app.ticker.remove(animateAmbientLights);
        app.destroy(true);
      }
      appRef.current = null;
    };
  }, []);

  return <section className="station-view" aria-label={ariaLabel} ref={hostRef} />;
}
