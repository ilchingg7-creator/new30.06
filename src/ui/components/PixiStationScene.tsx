import { Application, type Container, type Ticker } from 'pixi.js';
import { useEffect, useRef } from 'react';
import type { GameState } from '../../game/types';
import { buildStationContainer, calculateStationSceneFit } from '../../station/stationScene';
import { stationTheme } from '../../station/stationTheme';

interface PixiStationSceneProps {
  gameState: GameState;
}

export function PixiStationScene({ gameState }: PixiStationSceneProps) {
  const hostRef = useRef<HTMLElement | null>(null);
  const appRef = useRef<Application | null>(null);
  const gameStateRef = useRef(gameState);
  const sceneRef = useRef<Container | null>(null);
  const pulseTimeRef = useRef(0);

  function applySceneFit(app: Application, scene: Container) {
    const fit = calculateStationSceneFit(app.renderer.width, app.renderer.height);

    scene.scale.set(fit.scale);
    scene.position.set(fit.x, fit.y);
  }

  function setScene(app: Application, nextGameState: GameState) {
    const scene = buildStationContainer(nextGameState);

    app.stage.removeChildren();
    app.stage.addChild(scene);
    applySceneFit(app, scene);
    sceneRef.current = scene;
  }

  useEffect(() => {
    gameStateRef.current = gameState;

    const app = appRef.current;

    if (!app?.stage) {
      return;
    }

    setScene(app, gameState);
  }, [gameState]);

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
        setScene(app, gameStateRef.current);
        app.ticker.add(animateAmbientLights);
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

  return <section className="station-view" aria-label="Визуальный вид станции" ref={hostRef} />;
}
