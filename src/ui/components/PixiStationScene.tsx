import { Application, type Container, type Ticker } from 'pixi.js';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import type { GameState, ModuleId } from '../../game/types';
import {
  buildRoomContainer,
  calculateRoomSceneFit,
  calculateSceneOverlayRect,
  loadRoomSpriteAssetForState,
  TENANT_CAT_LOVE_SCENE_RECT,
  TENANT_CAT_SCENE_RECT
} from '../../station/roomScenes';
import { stationTheme } from '../../station/stationTheme';

interface PixiStationSceneProps {
  gameState: GameState;
  selectedRoomId: ModuleId;
  onRoomClick?: () => void;
  onTenantCatClick?: () => void;
  hasStrangeCat?: boolean;
  ariaLabel?: string;
}

const TENANT_CAT_ASSET = '/assets/rooms/tenant_capsule/strange-cat.gif';
const TENANT_CAT_LOVE_ASSET = '/assets/rooms/tenant_capsule/cat-love.gif';
const TENANT_CAT_LOVE_DISPLAY_MS = 900;
const TENANT_CAT_COOLDOWN_MIN_MS = 2_000;
const TENANT_CAT_COOLDOWN_RANGE_MS = 2_000;

function toOverlayStyle(rect: ReturnType<typeof calculateSceneOverlayRect>): CSSProperties {
  return {
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`
  };
}

function getRendererSize(app: Application): { width: number; height: number } | null {
  const renderer = (app as Application & { renderer?: { width: number; height: number } }).renderer;

  if (!renderer) {
    return null;
  }

  return {
    width: renderer.width,
    height: renderer.height
  };
}

export function PixiStationScene({
  gameState,
  selectedRoomId,
  onRoomClick,
  onTenantCatClick,
  hasStrangeCat,
  ariaLabel
}: PixiStationSceneProps) {
  const hostRef = useRef<HTMLElement | null>(null);
  const appRef = useRef<Application | null>(null);
  const gameStateRef = useRef(gameState);
  const selectedRoomIdRef = useRef(selectedRoomId);
  const onRoomClickRef = useRef(onRoomClick);
  const sceneRef = useRef<Container | null>(null);
  const pulseTimeRef = useRef(0);
  const sceneRequestIdRef = useRef(0);
  const catLoveTimerRef = useRef<number | null>(null);
  const catCooldownTimerRef = useRef<number | null>(null);
  const [hostSize, setHostSize] = useState({ width: 0, height: 0 });
  const [catLoveVisible, setCatLoveVisible] = useState(false);
  const [catCooldownActive, setCatCooldownActive] = useState(false);
  const tenantCatVisible =
    hasStrangeCat === true &&
    selectedRoomId === 'tenant_capsule' &&
    (gameState.moduleLevels.tenant_capsule ?? 0) > 0;
  const tenantCatStyle = useMemo(
    () => toOverlayStyle(calculateSceneOverlayRect(hostSize.width, hostSize.height, TENANT_CAT_SCENE_RECT)),
    [hostSize.height, hostSize.width]
  );
  const tenantCatLoveStyle = useMemo(
    () => toOverlayStyle(calculateSceneOverlayRect(hostSize.width, hostSize.height, TENANT_CAT_LOVE_SCENE_RECT)),
    [hostSize.height, hostSize.width]
  );

  function clearCatTimer(timerRef: typeof catLoveTimerRef) {
    if (timerRef.current === null) {
      return;
    }

    window.clearTimeout(timerRef.current);
    timerRef.current = null;
  }

  function handleTenantCatClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();

    if (catCooldownActive) {
      return;
    }

    clearCatTimer(catLoveTimerRef);
    clearCatTimer(catCooldownTimerRef);
    setCatLoveVisible(true);
    setCatCooldownActive(true);

    catLoveTimerRef.current = window.setTimeout(() => {
      setCatLoveVisible(false);
      catLoveTimerRef.current = null;
    }, TENANT_CAT_LOVE_DISPLAY_MS);

    const cooldownMs = Math.round(TENANT_CAT_COOLDOWN_MIN_MS + Math.random() * TENANT_CAT_COOLDOWN_RANGE_MS);

    catCooldownTimerRef.current = window.setTimeout(() => {
      setCatCooldownActive(false);
      catCooldownTimerRef.current = null;
    }, cooldownMs);
    onTenantCatClick?.();
  }

  function applySceneFit(app: Application, scene: Container) {
    const rendererSize = getRendererSize(app);

    if (!rendererSize) {
      return;
    }

    const fit = calculateRoomSceneFit(rendererSize.width, rendererSize.height);

    scene.scale.set(fit.scale);
    scene.position.set(fit.x, fit.y);
  }

  async function setScene(app: Application, nextGameState: GameState, nextSelectedRoomId: ModuleId) {
    const requestId = sceneRequestIdRef.current + 1;
    sceneRequestIdRef.current = requestId;

    await loadRoomSpriteAssetForState(nextGameState, nextSelectedRoomId);

    if (requestId !== sceneRequestIdRef.current || appRef.current !== app || !app.stage || !getRendererSize(app)) {
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

  useEffect(() => {
    const host = hostRef.current;

    if (!host) {
      return undefined;
    }

    const updateHostSize = () => {
      const rect = host.getBoundingClientRect();

      setHostSize({
        width: rect.width || host.clientWidth,
        height: rect.height || host.clientHeight
      });
    };

    updateHostSize();

    const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updateHostSize);

    resizeObserver?.observe(host);
    window.addEventListener('resize', updateHostSize);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateHostSize);
    };
  }, []);

  useEffect(
    () => () => {
      clearCatTimer(catLoveTimerRef);
      clearCatTimer(catCooldownTimerRef);
    },
    []
  );

  return (
    <section className="station-view" aria-label={ariaLabel} ref={hostRef}>
      {tenantCatVisible ? (
        <div className="station-scene-overlay">
          <button
            type="button"
            className="tenant-cat-button"
            aria-label="strange-cat"
            disabled={catCooldownActive}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={handleTenantCatClick}
            style={tenantCatStyle}
          >
            <img src={TENANT_CAT_ASSET} alt="" draggable={false} />
          </button>
          {catLoveVisible ? (
            <img
              className="tenant-cat-love"
              data-testid="tenant-cat-love"
              src={TENANT_CAT_LOVE_ASSET}
              alt=""
              aria-hidden="true"
              draggable={false}
              style={tenantCatLoveStyle}
            />
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
