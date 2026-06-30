import { Application } from 'pixi.js';
import { useEffect, useRef } from 'react';
import type { GameState } from '../../game/types';
import { buildStationContainer } from '../../station/stationScene';
import { stationTheme } from '../../station/stationTheme';

interface PixiStationSceneProps {
  gameState: GameState;
}

export function PixiStationScene({ gameState }: PixiStationSceneProps) {
  const hostRef = useRef<HTMLElement | null>(null);
  const appRef = useRef<Application | null>(null);
  const gameStateRef = useRef(gameState);

  useEffect(() => {
    gameStateRef.current = gameState;

    const app = appRef.current;

    if (!app?.stage) {
      return;
    }

    app.stage.removeChildren();
    app.stage.addChild(buildStationContainer(gameState));
  }, [gameState]);

  useEffect(() => {
    const host = hostRef.current;

    if (!host) {
      return undefined;
    }

    let cancelled = false;
    const app = new Application();
    appRef.current = app;

    void app
      .init({
        backgroundColor: stationTheme.spaceNavy,
        resizeTo: host
      })
      .then(() => {
        if (cancelled) {
          app.destroy(true);
          return;
        }

        host.appendChild(app.canvas);
        app.stage.addChild(buildStationContainer(gameStateRef.current));
      });

    return () => {
      cancelled = true;
      app.destroy(true);
      appRef.current = null;
    };
  }, []);

  return <section className="station-view" aria-label="Визуальный вид станции" ref={hostRef} />;
}
