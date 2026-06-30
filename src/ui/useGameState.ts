import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  advanceGame,
  buyModuleLevel,
  buyPrestigeUpgrade,
  calculateIncomePerSecond,
  calculateOfflineReward,
  checkDailyLogin,
  performPrestige,
  createInitialState
} from '../game/economy';
import { parseGameState, SAVE_KEY, serializeGameState } from '../game/save';
import type { GameState, ModuleId, PrestigeUpgradeId, WindowLightColor } from '../game/types';
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

export interface DailyLoginReward {
  streak: number;
  credits: number;
}

export interface UseGameStateResult {
  gameState: GameState;
  incomePerSecond: number;
  offlineReward: OfflineReward | null;
  dailyReward: DailyLoginReward | null;
  ready: boolean;
  selectedRoomId: ModuleId;
  adPending: boolean;
  adsAvailable: boolean;
  buyLevel(moduleId: ModuleId): void;
  selectRoom(moduleId: ModuleId): void;
  renovateOrbit(): void;
  dismissOfflineReward(): void;
  dismissDailyReward(): void;
  activateIncomeBoost(): Promise<void>;
  activateVipResident(): Promise<void>;
  doubleOfflineReward(): Promise<void>;
  setWindowLightColor(color: WindowLightColor): void;
  buyPrestigeUpgrade(upgradeId: PrestigeUpgradeId): void;
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
  const [dailyReward, setDailyReward] = useState<DailyLoginReward | null>(null);
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
      // Prefer the Yandex cloud save when available; fall back to local
      // storage so the game still boots offline or on other platforms.
      const cloudRaw = await platformRef.current.loadCloudSave(SAVE_KEY).catch(() => null);
      const cloudState = parseGameState(cloudRaw);
      const localRaw = await storage.load(SAVE_KEY);
      const localState = parseGameState(localRaw);

      // Pick the newer of the two valid saves (cloud vs local) by lastSavedAt
      // so a player who switched devices keeps their latest progress.
      let savedState: ReturnType<typeof parseGameState> = null;

      if (cloudState && localState) {
        savedState = cloudState.lastSavedAt >= localState.lastSavedAt ? cloudState : localState;
      } else {
        savedState = cloudState ?? localState;
      }

      // If we loaded from cloud but local is empty/stale, mirror it locally so
      // future offline boots have a recent copy.
      if (cloudState && (!localState || cloudState.lastSavedAt > localState.lastSavedAt)) {
        void storage.save(SAVE_KEY, cloudRaw ?? '');
      }

      if (cancelled) {
        return;
      }

      if (savedState) {
        const reward = calculateOfflineReward(savedState);
        const advanced = advanceGame(savedState, reward.seconds);
        const daily = checkDailyLogin(advanced);

        setGameState(daily.state);
        setOfflineReward(reward.credits > 0 ? reward : null);
        setDailyReward(daily.reward > 0 ? { streak: daily.streak, credits: daily.reward } : null);
      } else {
        const fresh = createInitialState();
        const daily = checkDailyLogin(fresh);

        setGameState(daily.state);
        setDailyReward(daily.reward > 0 ? { streak: daily.streak, credits: daily.reward } : null);
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

    const serialized = serializeGameState(gameState);

    // Always persist locally first (synchronous, reliable), then push to the
    // Yandex cloud in the background. Cloud failures are swallowed by the
    // platform so a network drop never blocks gameplay.
    void storage.save(SAVE_KEY, serialized);
    void platformRef.current.saveCloud(SAVE_KEY, serialized);
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

  const dismissDailyReward = useCallback(() => {
    setDailyReward(null);
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
        // Mark the VIP resident as permanently unlocked when first activated
        // via rewarded ad, while the timed bonus still expires.
        unlockedResidents: current.unlockedResidents.includes('vip_astroteenant')
          ? current.unlockedResidents
          : [...current.unlockedResidents, 'vip_astroteenant'],
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

  const buyUpgrade = useCallback((upgradeId: PrestigeUpgradeId) => {
    setGameState((current) => buyPrestigeUpgrade(current, upgradeId));
  }, []);

  return {
    gameState,
    incomePerSecond: calculateIncomePerSecond(gameState),
    offlineReward,
    dailyReward,
    ready,
    selectedRoomId,
    adPending,
    adsAvailable,
    buyLevel,
    selectRoom,
    renovateOrbit,
    dismissOfflineReward,
    dismissDailyReward,
    activateIncomeBoost,
    activateVipResident,
    doubleOfflineReward,
    setWindowLightColor,
    buyPrestigeUpgrade: buyUpgrade
  };
}
