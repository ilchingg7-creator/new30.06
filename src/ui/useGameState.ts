import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  advanceGame,
  buyModuleLevel,
  buyPrestigeUpgrade,
  calculateIncomePerSecond,
  calculateOfflineReward,
  checkDailyLogin,
  performPrestige,
  createInitialState,
  type DailyRewardInfo
} from '../game/economy';
import {
  assignCommunalDuty as assignCommunalDutyState,
  claimCommunalDuty as claimCommunalDutyState,
  maybeCreateCommunalDuty
} from '../game/communalDuties';
import { applyRoomClickReward } from '../game/roomClicks';
import { parseGameState, SAVE_KEY, serializeGameState } from '../game/save';
import type { GameState, ModuleId, PrestigeUpgradeId, ResidentId, StationIncidentId, WindowLightColor } from '../game/types';
import { decayRoomConditions, DECAY_INTERVAL_SECONDS } from '../game/roomConditions';
import {
  getNewStationIncidentCount,
  markStationIncidentsSeen,
  queueEligibleIncidents,
  resolveStationIncident
} from '../game/stationIncidents';
import {
  acceptVisitor,
  declineVisitor,
  generateVisitorRequest,
  isVisitorExpired
} from '../game/visitors';
import { createLocalStoragePort, type StoragePort } from '../platform/storage';
import { playSound, toggleMuted, isMuted } from '../platform/sound';
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
  reward: DailyRewardInfo;
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
  toggleSound(): void;
  soundMuted: boolean;
  acceptVisitor(): void;
  declineVisitor(): void;
  resetSave(): void;
  clickRoom(): void;
  assignCommunalDuty(residentId: ResidentId): void;
  claimCommunalDuty(): void;
  resolveIncident(incidentId: StationIncidentId, choiceId: string): void;
  markIncidentsSeen(): void;
  triggerCatIncident(): void;
  newIncidentCount: number;
  claimWeeklyBonus(): void;
}

export function useGameState(
  storagePort?: StoragePort,
  yandexPlatform?: YandexPlatform
): UseGameStateResult {
  function withQueuedIncidents(state: GameState): GameState {
    return queueEligibleIncidents(state);
  }

  const storage = useMemo(() => storagePort ?? createLocalStoragePort(), [storagePort]);
  const platformRef = useRef<YandexPlatform>(yandexPlatform ?? createNoOpYandexPlatform());
  const [gameState, setGameState] = useState(() => createInitialState());
  const [selectedRoomId, setSelectedRoomId] = useState<ModuleId>('tenant_capsule');
  const [ready, setReady] = useState(false);
  const [offlineReward, setOfflineReward] = useState<OfflineReward | null>(null);
  const [dailyReward, setDailyReward] = useState<DailyLoginReward | null>(null);
  const [adPending, setAdPending] = useState(false);
  const [adsAvailable, setAdsAvailable] = useState(false);
  const [soundMuted, setSoundMuted] = useState(() => isMuted());

  useEffect(() => {
    let cancelled = false;

    async function loadSavedState() {
      const platform = yandexPlatform ?? (await initYandexPlatform());

      if (cancelled) {
        return;
      }

      platformRef.current = platform;
      setAdsAvailable(platform.isAvailable());

      // Prefer the Yandex cloud save when available; fall back to local
      // storage so the game still boots offline or on other platforms.
      const cloudRaw = await platform.loadCloudSave(SAVE_KEY).catch(() => null);
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

        setGameState(withQueuedIncidents(daily.state));
        setOfflineReward(reward.credits > 0 ? reward : null);
        setDailyReward(daily.reward.amount > 0 || daily.reward.kind !== 'kopeks' ? { streak: daily.streak, reward: daily.reward } : null);
      } else {
        const fresh = createInitialState();
        const daily = checkDailyLogin(fresh);

        setGameState(withQueuedIncidents(daily.state));
        setDailyReward(daily.reward.amount > 0 || daily.reward.kind !== 'kopeks' ? { streak: daily.streak, reward: daily.reward } : null);
      }

      setReady(true);
      // Tell the platform the loading screen is gone and the station is visible.
      platform.markReady();
    }

    void loadSavedState();

    return () => {
      cancelled = true;
    };
  }, [storage, yandexPlatform]);

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
      // Pause game tick when the tab is hidden (requirement 1.19.4).
      if (document.hidden) return;
      setGameState((current) => withQueuedIncidents(maybeCreateCommunalDuty(advanceGame(current, 1))));
    }, 1_000);

    return () => window.clearInterval(intervalId);
  }, [ready]);

  // Room condition decay: every DECAY_INTERVAL_SECONDS, all room conditions
  // drop by 1. Communal duties are the primary repair source.
  useEffect(() => {
    if (!ready) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      // Pause decay when the tab is hidden (requirement 1.19.4).
      if (document.hidden) return;
      setGameState((current) => withQueuedIncidents(decayRoomConditions(current)));
    }, DECAY_INTERVAL_SECONDS * 1_000);

    return () => window.clearInterval(intervalId);
  }, [ready]);

  // Visitor request system: periodically spawn a visitor and clear expired ones.
  useEffect(() => {
    if (!ready) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setGameState((current) => {
        // Clear expired visitor first.
        if (current.activeVisitor && isVisitorExpired(current)) {
          return { ...current, activeVisitor: null };
        }

        // 50% chance every check, but only if no active visitor.
        if (current.activeVisitor) {
          return current;
        }

        if (Math.random() < 0.5) {
          const visitor = generateVisitorRequest(current, Date.now(), calculateIncomePerSecond(current));

          if (visitor) {
            return { ...current, activeVisitor: visitor };
          }
        }

        return current;
      });
    }, 2 * 60 * 1_000); // check every 2 minutes

    return () => window.clearInterval(intervalId);
  }, [ready]);

  useEffect(() => {
    setSelectedRoomId((current) => resolveSelectedRoomId(gameState, current));
  }, [gameState]);

  const buyLevel = useCallback((moduleId: ModuleId) => {
    let purchased = false;

    setGameState((current) => {
      const next = withQueuedIncidents(buyModuleLevel(current, moduleId));

      if (next !== current) {
        purchased = true;
        setSelectedRoomId(moduleId);
      }

      return next;
    });

    // Play sound outside the updater to avoid setState-in-render warnings.
    if (purchased) {
      playSound('purchase');
    } else {
      playSound('error');
    }
  }, []);

  const selectRoom = useCallback(
    (moduleId: ModuleId) => {
      setSelectedRoomId(resolveSelectedRoomId(gameState, moduleId));
    },
    [gameState]
  );

  const renovateOrbit = useCallback(() => {
    let renovated = false;

    setGameState((current) => {
      const next = withQueuedIncidents(performPrestige(current));
      renovated = next !== current;

      return next;
    });
    playSound(renovated ? 'prestige' : 'error');
  }, []);

  const dismissOfflineReward = useCallback(() => {
    setOfflineReward(null);
    playSound('reward');
  }, []);

  const dismissDailyReward = useCallback(() => {
    setDailyReward(null);
    playSound('click');
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
    let purchased = false;

    setGameState((current) => {
      const next = buyPrestigeUpgrade(current, upgradeId);

      if (next !== current) {
        purchased = true;
      }

      return next;
    });

    if (purchased) {
      playSound('unlock');
    } else {
      playSound('error');
    }
  }, []);

  const toggleSound = useCallback(() => {
    const next = toggleMuted();
    setSoundMuted(next);
    if (!next) {
      playSound('click');
    }
  }, []);

  const handleAcceptVisitor = useCallback(() => {
    let accepted = false;

    setGameState((current) => {
      const next = acceptVisitor(current);

      if (next !== current && !next.activeVisitor) {
        accepted = true;
      }

      return next;
    });

    if (accepted) {
      playSound('reward');
    } else {
      playSound('error');
    }
  }, []);

  const handleDeclineVisitor = useCallback(() => {
    setGameState((current) => declineVisitor(current));
    playSound('click');
  }, []);

  const resetSave = useCallback(() => {
    const fresh = createInitialState();
    setGameState(fresh);
    setOfflineReward(null);
    setDailyReward(null);
    setSelectedRoomId('tenant_capsule');
    void storage.save(SAVE_KEY, serializeGameState(fresh));
    void platformRef.current.saveCloud(SAVE_KEY, serializeGameState(fresh));
    playSound('prestige');
  }, [storage]);

  const clickRoom = useCallback(() => {
    setGameState((current) => applyRoomClickReward(current));
    playSound('click');
  }, []);

  const assignDuty = useCallback((residentId: ResidentId) => {
    setGameState((current) => assignCommunalDutyState(current, residentId));
    playSound('click');
  }, []);

  const claimDuty = useCallback(() => {
    setGameState((current) => claimCommunalDutyState(current));
    playSound('reward');
  }, []);

  const resolveIncident = useCallback((incidentId: StationIncidentId, choiceId: string) => {
    setGameState((current) => withQueuedIncidents(resolveStationIncident(current, incidentId, choiceId)));
    playSound('reward');
  }, []);

  const markIncidentsSeen = useCallback(() => {
    setGameState((current) => markStationIncidentsSeen(current));
  }, []);

  const triggerCatIncident = useCallback(() => {
    setGameState((current) => queueEligibleIncidents(current, { sceneInteractionId: 'strange_cat' }));
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
    buyPrestigeUpgrade: buyUpgrade,
    toggleSound,
    soundMuted,
    acceptVisitor: handleAcceptVisitor,
    declineVisitor: handleDeclineVisitor,
    resetSave,
    clickRoom,
    assignCommunalDuty: assignDuty,
    claimCommunalDuty: claimDuty,
    resolveIncident,
    markIncidentsSeen,
    triggerCatIncident,
    newIncidentCount: getNewStationIncidentCount(gameState),
    claimWeeklyBonus: useCallback(() => {
      setGameState((current) => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const wr = require('../game/weeklyRepair');
        const withEvent = wr.updateWeeklyRepairProgress(current);

        return wr.claimWeeklyBonus(withEvent);
      });
    }, [])
  };
}
