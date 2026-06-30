import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  advanceGame,
  buyModuleLevel,
  calculateIncomePerSecond,
  calculateOfflineReward,
  performPrestige,
  createInitialState
} from '../game/economy';
import { parseGameState, SAVE_KEY, serializeGameState } from '../game/save';
import type { GameState, ModuleId, WindowLightColor } from '../game/types';
import { createLocalStoragePort, type StoragePort } from '../platform/storage';
import {
  createNoOpYandexPlatform,
  initYandexPlatform,
  type YandexPlatform
} from '../platform/yandex';
import { resolveSelectedRoomId } from '../station/roomScenes';

export interface OfflineReward {
  seconds: number;
  credits: number;
}

export interface UseGameStateResult {
  gameState: GameState;
  incomePerSecond: number;
  offlineReward: OfflineReward | null;
  ready: boolean;
  selectedRoomId: ModuleId;
  adPending: boolean;
  adsAvailable: boolean;
  buyLevel(moduleId: ModuleId): void;
  selectRoom(moduleId: ModuleId): void;
  renovateOrbit(): void;
  dismissOfflineReward(): void;
  activateIncomeBoost(): Promise<void>;
  activateVipResident(): Promise<void>;
  doubleOfflineReward(): Promise<void>;
  setWindowLightColor(color: WindowLightColor): void;
}

export function useGameState(
  storagePort?: StoragePort,
  yandexPlatform?: YandexPlatform
): UseGameStateResult {
  const storage = useMemo(() => storagePort ?? createLocalStoragePort(), [storagePort]);
  const platformRef = useRef<YandexPlatform>(yandexPlatform ?? createNoOpYandexPlatform());
  const [gameState, setGameState] = useState(() => createInitialState());
  const [selectedRoomId, setSelectedRoomId] = useState<ModuleId>('tenant_capsule');
  const [ready, setReady] = useState(false);
  const [offlineReward, setOfflineReward] = useState<OfflineReward | null>(null);
  const [adPending, setAdPending] = useState(false);
  const [adsAvailable, setAdsAvailable] = useState(false);

  useEffect(() => {
    if (yandexPlatform) {
      platformRef.current = yandexPlatform;
      setAdsAvailable(yandexPlatform.isAvailable());
      return undefined;
    }

    let cancelled = false;

    void initYandexPlatform().then((platform) => {
      if (cancelled) {
        return;
      }

      platformRef.current = platform;
      setAdsAvailable(platform.isAvailable());
    });

    return () => {
      cancelled = true;
    };
  }, [yandexPlatform]);

  useEffect(() => {
    let cancelled = false;

    async function loadSavedState() {
      const savedState = parseGameState(await storage.load(SAVE_KEY));

      if (cancelled) {
        return;
      }

      if (savedState) {
        const reward = calculateOfflineReward(savedState);
        setGameState(advanceGame(savedState, reward.seconds));
        setOfflineReward(reward.credits > 0 ? reward : null);
      }

      setReady(true);
      // Tell the platform the loading screen is gone and the station is visible.
      platformRef.current.markReady();
    }

    void loadSavedState();

    return () => {
      cancelled = true;
    };
  }, [storage]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    void storage.save(SAVE_KEY, serializeGameState(gameState));
  }, [gameState, ready, storage]);

  useEffect(() => {
    if (!ready) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setGameState((current) => advanceGame(current, 1));
    }, 1_000);

    return () => window.clearInterval(intervalId);
  }, [ready]);

  useEffect(() => {
    setSelectedRoomId((current) => resolveSelectedRoomId(gameState, current));
  }, [gameState]);

  const buyLevel = useCallback((moduleId: ModuleId) => {
    setGameState((current) => {
      const next = buyModuleLevel(current, moduleId);

      if (next !== current) {
        setSelectedRoomId(moduleId);
      }

      return next;
    });
  }, []);

  const selectRoom = useCallback(
    (moduleId: ModuleId) => {
      setSelectedRoomId(resolveSelectedRoomId(gameState, moduleId));
    },
    [gameState]
  );

  const renovateOrbit = useCallback(() => {
    setGameState((current) => performPrestige(current));
  }, []);

  const dismissOfflineReward = useCallback(() => {
    setOfflineReward(null);
  }, []);

  // When the Yandex SDK is unavailable (local dev, other platforms), rewarded
  // bonuses are granted immediately so the feature stays testable. In
  // production the bonus is only granted after a successful ad watch.
  const resolveAdGrant = useCallback(async () => {
    if (!platformRef.current.isAvailable()) {
      return true;
    }

    return platformRef.current.showRewardedAd();
  }, []);

  const activateIncomeBoost = useCallback(async () => {
    if (adPending) {
      return;
    }

    setAdPending(true);

    try {
      const granted = await resolveAdGrant();

      if (!granted) {
        return;
      }

      setGameState((current) => ({
        ...current,
        timedBonuses: [
          ...current.timedBonuses,
          {
            id: 'rent_x2',
            incomeMultiplier: 2,
            expiresAt: Date.now() + 5 * 60 * 1_000
          }
        ]
      }));
    } finally {
      setAdPending(false);
    }
  }, [adPending, resolveAdGrant]);

  const activateVipResident = useCallback(async () => {
    if (adPending) {
      return;
    }

    setAdPending(true);

    try {
      const granted = await resolveAdGrant();

      if (!granted) {
        return;
      }

      setGameState((current) => ({
        ...current,
        timedBonuses: [
          ...current.timedBonuses,
          {
            id: 'vip_resident',
            incomeMultiplier: 2,
            expiresAt: Date.now() + 10 * 60 * 1_000
          }
        ]
      }));
    } finally {
      setAdPending(false);
    }
  }, [adPending, resolveAdGrant]);

  const doubleOfflineReward = useCallback(async () => {
    if (adPending || !offlineReward) {
      return;
    }

    setAdPending(true);

    try {
      const granted = await resolveAdGrant();

      if (!granted) {
        return;
      }

      const bonus = offlineReward.credits;

      setGameState((current) => ({
        ...current,
        credits: current.credits + bonus,
        totalEarnedCredits: current.totalEarnedCredits + bonus
      }));
      setOfflineReward(null);
    } finally {
      setAdPending(false);
    }
  }, [adPending, offlineReward, resolveAdGrant]);

  const setWindowLightColor = useCallback((color: WindowLightColor) => {
    setGameState((current) => ({
      ...current,
      windowLightColor: color
    }));
  }, []);

  return {
    gameState,
    incomePerSecond: calculateIncomePerSecond(gameState),
    offlineReward,
    ready,
    selectedRoomId,
    adPending,
    adsAvailable,
    buyLevel,
    selectRoom,
    renovateOrbit,
    dismissOfflineReward,
    activateIncomeBoost,
    activateVipResident,
    doubleOfflineReward,
    setWindowLightColor
  };
}
