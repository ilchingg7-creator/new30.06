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
import { CloudSaveQueue } from '../platform/cloudSaveQueue';
import type { GameState, ModuleId, PrestigeUpgradeId, ResidentId, StationIncidentId } from '../game/types';
import { decayRoomConditions, DECAY_INTERVAL_SECONDS } from '../game/roomConditions';
import {
  claimWeeklyBonus as claimWeeklyBonusState,
  updateWeeklyRepairProgress as updateWeeklyRepairProgressState
} from '../game/weeklyRepair';
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
import {
  isMuted,
  playSound,
  resumeAudio,
  startAmbientHum,
  startBackgroundMusic,
  stopAmbientHum,
  stopBackgroundMusic,
  suspendAudio,
  toggleMuted
} from '../platform/sound';
import {
  STRANGE_CAT_PRODUCT_ID,
  createNoOpYandexPlatform,
  initYandexPlatform,
  type YandexPlatform,
  type YandexLeaderboardEntry,
  type YandexProduct
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

export interface CelebrationInfo {
  cycle: number;
  reputationGained: number;
}

export type SaveStatus = 'idle' | 'saving' | 'saved';

export type StrangeCatPurchaseStatus =
  | 'loading'
  | 'available'
  | 'purchasing'
  | 'owned'
  | 'unavailable'
  | 'error';

const VIP_RESIDENT_COOLDOWN_MS = 24 * 60 * 60 * 1_000;

function getVipResidentCooldownMs(state: GameState, now = Date.now()): number {
  const lastClaimedAt = state.lastVipResidentClaimedAt;

  if (lastClaimedAt === undefined) {
    return 0;
  }

  return Math.max(0, lastClaimedAt + VIP_RESIDENT_COOLDOWN_MS - now);
}

export interface UseGameStateResult {
  gameState: GameState;
  incomePerSecond: number;
  offlineReward: OfflineReward | null;
  dailyReward: DailyLoginReward | null;
  celebration: CelebrationInfo | null;
  saveStatus: SaveStatus;
  lastSavedAt: number | null;
  ready: boolean;
  selectedRoomId: ModuleId;
  adPending: boolean;
  adsAvailable: boolean;
  strangeCatProduct: YandexProduct | null;
  strangeCatPurchaseStatus: StrangeCatPurchaseStatus;
  strangeCatOwned: boolean;
  vipResidentAvailable: boolean;
  vipResidentCooldownMs: number;
  buyLevel(moduleId: ModuleId): void;
  selectRoom(moduleId: ModuleId): void;
  renovateOrbit(): void;
  dismissOfflineReward(): void;
  dismissDailyReward(): void;
  dismissCelebration(): void;
  activateIncomeBoost(): Promise<void>;
  activateVipResident(): Promise<void>;
  purchaseStrangeCat(): Promise<void>;
  doubleOfflineReward(): Promise<void>;
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
  refreshLeaderboard(): void;
  loadLeaderboardEntries(): Promise<YandexLeaderboardEntry[]>;
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
  const cloudSaveQueue = useMemo(
    () => new CloudSaveQueue((key, value) => platformRef.current.saveCloud(key, value)),
    []
  );
  const [gameState, setGameState] = useState(() => createInitialState());
  const [selectedRoomId, setSelectedRoomId] = useState<ModuleId>('tenant_capsule');
  const [ready, setReady] = useState(false);
  const [offlineReward, setOfflineReward] = useState<OfflineReward | null>(null);
  const [dailyReward, setDailyReward] = useState<DailyLoginReward | null>(null);
  const [celebration, setCelebration] = useState<CelebrationInfo | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [adPending, setAdPending] = useState(false);
  const [adsAvailable, setAdsAvailable] = useState(false);
  const [strangeCatProduct, setStrangeCatProduct] = useState<YandexProduct | null>(null);
  const [strangeCatPurchaseStatus, setStrangeCatPurchaseStatus] = useState<StrangeCatPurchaseStatus>('loading');
  const [soundMuted, setSoundMuted] = useState(() => isMuted());

  useEffect(() => {
    let cancelled = false;

    async function loadStrangeCatPurchaseState(platform: YandexPlatform) {
      const [catalog, purchases] = await Promise.all([
        platform.getPurchaseCatalog(),
        platform.getPurchases()
      ]);
      const catProduct = catalog.find((product) => product.id === STRANGE_CAT_PRODUCT_ID) ?? null;
      const catOwned = purchases.some((purchase) => purchase.productID === STRANGE_CAT_PRODUCT_ID);

      if (cancelled) {
        return;
      }

      setStrangeCatProduct(catProduct);
      setStrangeCatPurchaseStatus(catOwned ? 'owned' : catProduct ? 'available' : 'unavailable');
    }

    async function loadSavedState() {
      const platform = yandexPlatform ?? (await initYandexPlatform());

      if (cancelled) {
        return;
      }

      platformRef.current = platform;
      setAdsAvailable(platform.isAvailable());
      void loadStrangeCatPurchaseState(platform);

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
        const now = Date.now();
        const reward = calculateOfflineReward(savedState, now);
        const advanced = advanceGame(savedState, reward.seconds, now, reward.credits);
        const daily = checkDailyLogin(advanced, now);

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

    setSaveStatus('saving');

    // Always persist locally first (synchronous, reliable), then push to the
    // Yandex cloud in the background. Cloud failures are swallowed by the
    // platform so a network drop never blocks gameplay.
    void storage.save(SAVE_KEY, serialized);
    cloudSaveQueue.enqueue(SAVE_KEY, serialized);

    const now = Date.now();
    setLastSavedAt(now);

    const timer = window.setTimeout(() => {
      setSaveStatus('saved');
    }, 400);

    return () => window.clearTimeout(timer);
  }, [cloudSaveQueue, gameState, ready, storage]);

  useEffect(() => {
    const flushWhenHidden = () => {
      if (document.hidden) {
        void cloudSaveQueue.flushNow();
      }
    };

    document.addEventListener('visibilitychange', flushWhenHidden);

    return () => {
      document.removeEventListener('visibilitychange', flushWhenHidden);
      cloudSaveQueue.dispose();
    };
  }, [cloudSaveQueue]);

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
    let nextCelebration: CelebrationInfo | null = null;

    setGameState((current) => {
      const next = withQueuedIncidents(performPrestige(current));
      renovated = next !== current;

      if (renovated) {
        nextCelebration = {
          cycle: next.prestigeCount ?? 0,
          reputationGained: next.reputation - current.reputation
        };
      }

      return next;
    });
    playSound(renovated ? 'prestige' : 'error');

    if (nextCelebration) {
      setCelebration(nextCelebration);
    }
  }, []);

  const dismissOfflineReward = useCallback(() => {
    setOfflineReward(null);
    playSound('reward');
  }, []);

  const dismissDailyReward = useCallback(() => {
    setDailyReward(null);
    playSound('click');
  }, []);

  const dismissCelebration = useCallback(() => {
    setCelebration(null);
    playSound('click');
  }, []);

  // When the Yandex SDK is unavailable (local dev, other platforms), rewarded
  // bonuses are granted immediately so the feature stays testable. In
  // production the bonus is only granted after a successful ad watch.
  const resolveAdGrant = useCallback(async () => {
    if (!platformRef.current.isAvailable()) {
      return true;
    }

    // Requirement 4.7: stop game audio while the ad is visible.
    const granted = await platformRef.current.showRewardedAd(() => {
      suspendAudio();
    });

    // Restore audio after the ad closes, but only if the player has not muted
    // the game. If the tab is hidden the visibilitychange handler keeps the
    // context suspended — resumeAudio is a no-op when already suspended.
    if (!isMuted()) {
      resumeAudio();
    }

    return granted;
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
      playSound('boost');
    } finally {
      setAdPending(false);
    }
  }, [adPending, resolveAdGrant]);

  const purchaseStrangeCat = useCallback(async () => {
    if (
      strangeCatPurchaseStatus === 'purchasing' ||
      strangeCatPurchaseStatus === 'owned' ||
      !strangeCatProduct
    ) {
      return;
    }

    setStrangeCatPurchaseStatus('purchasing');
    const purchase = await platformRef.current.purchaseProduct(STRANGE_CAT_PRODUCT_ID);

    if (purchase?.productID === STRANGE_CAT_PRODUCT_ID) {
      setStrangeCatPurchaseStatus('owned');
      playSound('unlock');
      return;
    }

    setStrangeCatPurchaseStatus('error');
    playSound('error');
  }, [strangeCatProduct, strangeCatPurchaseStatus]);

  const activateVipResident = useCallback(async () => {
    if (adPending || getVipResidentCooldownMs(gameState) > 0) {
      playSound('error');
      return;
    }

    setAdPending(true);

    try {
      const granted = await resolveAdGrant();

      if (!granted) {
        return;
      }

      const claimedAt = Date.now();

      setGameState((current) => {
        if (getVipResidentCooldownMs(current, claimedAt) > 0) {
          return current;
        }

        return {
          ...current,
          lastVipResidentClaimedAt: claimedAt,
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
              expiresAt: claimedAt + 10 * 60 * 1_000
            }
          ]
        };
      });
      playSound('boost');
    } finally {
      setAdPending(false);
    }
  }, [adPending, gameState, resolveAdGrant]);

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
    if (next) {
      stopAmbientHum();
      stopBackgroundMusic();
    } else {
      playSound('click');
      startAmbientHum();
      startBackgroundMusic();
    }
  }, []);

  // Start ambient audio once the game is ready and sound is not muted.
  // Browser autoplay policy may keep the shared AudioContext suspended until
  // the first user gesture; the scheduled audio begins when it resumes.
  useEffect(() => {
    if (!ready || soundMuted) {
      return;
    }

    startAmbientHum();
    startBackgroundMusic();

    return () => {
      stopAmbientHum();
      stopBackgroundMusic();
    };
  }, [ready, soundMuted]);

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
    playSound('prestige');
  }, []);

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
    playSound('incident');
  }, []);

  const markIncidentsSeen = useCallback(() => {
    setGameState((current) => markStationIncidentsSeen(current));
  }, []);

  const triggerCatIncident = useCallback(() => {
    setGameState((current) => queueEligibleIncidents(current, { sceneInteractionId: 'strange_cat' }));
  }, []);

  const vipResidentCooldownMs = getVipResidentCooldownMs(gameState);

  return {
    gameState,
    incomePerSecond: calculateIncomePerSecond(gameState),
    offlineReward,
    dailyReward,
    celebration,
    saveStatus,
    lastSavedAt,
    ready,
    selectedRoomId,
    adPending,
    adsAvailable,
    strangeCatProduct,
    strangeCatPurchaseStatus,
    strangeCatOwned: strangeCatPurchaseStatus === 'owned',
    vipResidentAvailable: vipResidentCooldownMs <= 0,
    vipResidentCooldownMs,
    buyLevel,
    selectRoom,
    renovateOrbit,
    dismissOfflineReward,
    dismissDailyReward,
    dismissCelebration,
    activateIncomeBoost,
    activateVipResident,
    purchaseStrangeCat,
    doubleOfflineReward,
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
        const withEvent = updateWeeklyRepairProgressState(current);
        return claimWeeklyBonusState(withEvent);
      });
    }, []),
    refreshLeaderboard: useCallback(() => {
      const score = Math.floor(gameState.totalEarnedCredits);
      void platformRef.current.submitLeaderboardScore('totalEarned', score);
    }, [gameState.totalEarnedCredits]),
    loadLeaderboardEntries: useCallback(async () => {
      return platformRef.current.getLeaderboardEntries('totalEarned', 10);
    }, [])
  };
}
