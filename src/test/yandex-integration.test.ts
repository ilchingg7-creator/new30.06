import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { calculateOfflineReward, createInitialState } from '../game/economy';
import { SAVE_KEY } from '../game/save';
import { useGameState } from '../ui/useGameState';
import { createLocalStoragePort } from '../platform/storage';
import {
  STRANGE_CAT_PRODUCT_ID,
  createNoOpYandexPlatform,
  createYandexPlatform,
  initYandexPlatform,
  type YandexPlatform,
  type YandexProduct,
  type YandexPurchase
} from '../platform/yandex';

const strangeCatProduct: YandexProduct = {
  id: STRANGE_CAT_PRODUCT_ID,
  title: 'Странный кот',
  description: 'Поселить кота навсегда',
  imageURI: 'https://example.test/cat.png',
  price: '99 ЯН',
  priceValue: '99',
  priceCurrencyCode: 'YAN',
  getPriceCurrencyImage: vi.fn(() => 'https://example.test/yan.svg')
};

const strangeCatPurchase: YandexPurchase = {
  productID: STRANGE_CAT_PRODUCT_ID,
  purchaseToken: 'purchase-token',
  developerPayload: ''
};

function makePlatform(
  grant: boolean,
  options: {
    catalog?: YandexProduct[];
    purchases?: YandexPurchase[];
    purchaseResult?: YandexPurchase | null;
  } = {}
): YandexPlatform {
  return {
    isAvailable() {
      return true;
    },
    markReady: vi.fn(),
    showRewardedAd: vi.fn().mockResolvedValue(grant),
    loadCloudSave: vi.fn().mockResolvedValue(null),
    saveCloud: vi.fn().mockResolvedValue(undefined),
    submitLeaderboardScore: vi.fn().mockResolvedValue(undefined),
    getLeaderboardEntries: vi.fn().mockResolvedValue([]),
    getPurchaseCatalog: vi.fn().mockResolvedValue(options.catalog ?? []),
    getPurchases: vi.fn().mockResolvedValue(options.purchases ?? []),
    purchaseProduct: vi.fn().mockResolvedValue(options.purchaseResult ?? null)
  };
}

function makeMemoryStorage(saved: string | null = null) {
  const store = new Map<string, string>();

  if (saved !== null) {
    store.set(SAVE_KEY, saved);
  }

  return createLocalStoragePort({
    getItem(key) {
      return store.get(key) ?? null;
    },
    setItem(key, value) {
      store.set(key, value);
    }
  } as Storage);
}

afterEach(() => {
  vi.restoreAllMocks();
  delete window.YaGames;
  delete window.__yaSdkLang;
  Object.defineProperty(window, 'parent', {
    configurable: true,
    value: window
  });
});

describe('yandex platform integration', () => {
  it('reuses one Player instance for cloud load and saves', async () => {
    const player = {
      getData: vi.fn().mockResolvedValue({ [SAVE_KEY]: 'saved-state' }),
      setData: vi.fn().mockResolvedValue(undefined)
    };
    const getPlayer = vi.fn().mockResolvedValue(player);
    const platform = createYandexPlatform({ getPlayer });

    await platform.loadCloudSave(SAVE_KEY);
    await platform.saveCloud(SAVE_KEY, 'first');
    await platform.saveCloud(SAVE_KEY, 'second');

    expect(getPlayer).toHaveBeenCalledTimes(1);
    expect(player.setData).toHaveBeenCalledTimes(2);
  });

  it('restores permanent strange cat ownership during platform load', async () => {
    const platform = makePlatform(true, {
      catalog: [strangeCatProduct],
      purchases: [strangeCatPurchase]
    });
    const storage = makeMemoryStorage();
    const { result } = renderHook(() => useGameState(storage, platform));

    await waitFor(() => expect(result.current.ready).toBe(true));
    await waitFor(() => expect(result.current.strangeCatPurchaseStatus).toBe('owned'));

    expect(result.current.strangeCatOwned).toBe(true);
    expect(result.current.strangeCatProduct).toEqual(strangeCatProduct);
  });

  it('unlocks the strange cat immediately after a successful purchase', async () => {
    const platform = makePlatform(true, {
      catalog: [strangeCatProduct],
      purchaseResult: strangeCatPurchase
    });
    const storage = makeMemoryStorage();
    const { result } = renderHook(() => useGameState(storage, platform));

    await waitFor(() => expect(result.current.strangeCatPurchaseStatus).toBe('available'));

    await act(async () => {
      await result.current.purchaseStrangeCat();
    });

    expect(platform.purchaseProduct).toHaveBeenCalledWith('strange_cat');
    expect(result.current.strangeCatOwned).toBe(true);
    expect(result.current.strangeCatPurchaseStatus).toBe('owned');
  });

  it('keeps the cat locked and allows retry after a cancelled purchase', async () => {
    const platform = makePlatform(true, { catalog: [strangeCatProduct] });
    const storage = makeMemoryStorage();
    const { result } = renderHook(() => useGameState(storage, platform));

    await waitFor(() => expect(result.current.strangeCatPurchaseStatus).toBe('available'));

    await act(async () => {
      await result.current.purchaseStrangeCat();
    });

    expect(result.current.strangeCatOwned).toBe(false);
    expect(result.current.strangeCatPurchaseStatus).toBe('error');
  });

  it('loads the purchase catalog and permanent purchases from Yandex payments', async () => {
    const product = {
      id: 'strange_cat',
      title: 'Странный кот',
      description: 'Поселить кота навсегда',
      imageURI: 'https://example.test/cat.png',
      price: '99 ЯН',
      priceValue: '99',
      priceCurrencyCode: 'YAN',
      getPriceCurrencyImage: vi.fn(() => 'https://example.test/yan.svg')
    };
    const purchase = {
      productID: 'strange_cat',
      purchaseToken: 'purchase-token',
      developerPayload: ''
    };
    const getCatalog = vi.fn().mockResolvedValue([product]);
    const getPurchases = vi.fn().mockResolvedValue([purchase]);
    const platform = createYandexPlatform({
      payments: {
        getCatalog,
        getPurchases,
        purchase: vi.fn()
      }
    });

    await expect(platform.getPurchaseCatalog()).resolves.toEqual([product]);
    await expect(platform.getPurchases()).resolves.toEqual([purchase]);
    expect(getCatalog).toHaveBeenCalledTimes(1);
    expect(getPurchases).toHaveBeenCalledTimes(1);
  });

  it('purchases the requested product without consuming it', async () => {
    const purchase = {
      productID: 'strange_cat',
      purchaseToken: 'purchase-token',
      developerPayload: ''
    };
    const purchaseSdk = vi.fn().mockResolvedValue(purchase);
    const platform = createYandexPlatform({
      payments: {
        getCatalog: vi.fn(),
        getPurchases: vi.fn(),
        purchase: purchaseSdk
      }
    });

    await expect(platform.purchaseProduct('strange_cat')).resolves.toEqual(purchase);
    expect(purchaseSdk).toHaveBeenCalledWith({ id: 'strange_cat' });
  });

  it('returns safe purchase fallbacks when payments are unavailable', async () => {
    const platform = createNoOpYandexPlatform();

    await expect(platform.getPurchaseCatalog()).resolves.toEqual([]);
    await expect(platform.getPurchases()).resolves.toEqual([]);
    await expect(platform.purchaseProduct('strange_cat')).resolves.toBeNull();
  });

  it('uses no-op platform in local top-level dev even when the SDK script is present', async () => {
    const init = vi.fn().mockResolvedValue({
      adv: {
        showRewardedVideo: vi.fn()
      }
    });

    window.YaGames = { init };

    const platform = await initYandexPlatform();

    expect(init).not.toHaveBeenCalled();
    expect(platform.isAvailable()).toBe(false);
  });

  it('exposes the initialized SDK language to synchronous language detection', async () => {
    window.YaGames = {
      init: vi.fn().mockResolvedValue({
        environment: { i18n: { lang: 'en' } }
      })
    };
    Object.defineProperty(window, 'parent', {
      configurable: true,
      value: {}
    });

    await initYandexPlatform();

    expect(window.__yaSdkLang).toBe('en');
  });

  it('uses the current leaderboards SDK API without deprecated getLeaderboards', async () => {
    const setLeaderboardScore = vi.fn().mockResolvedValue(undefined);
    const getLeaderboardEntries = vi.fn().mockResolvedValue({ entries: [] });
    const getLeaderboards = vi.fn();
    const platform = createYandexPlatform({
      leaderboards: {
        getLeaderboardDescription: vi.fn(),
        setLeaderboardScore,
        getLeaderboardEntries
      },
      getLeaderboards
    });

    await platform.submitLeaderboardScore('rent', 100);
    await platform.getLeaderboardEntries('rent', 3);

    expect(getLeaderboards).not.toHaveBeenCalled();
    expect(setLeaderboardScore).toHaveBeenCalledWith('rent', 100);
    expect(getLeaderboardEntries).toHaveBeenCalledWith('rent', {
      quantityTop: 3,
      includeUser: true,
      quantityAround: 0
    });
  });

  it('calls markReady after the save loads', async () => {
    const platform = makePlatform(true);
    const storage = makeMemoryStorage();

    const { result } = renderHook(() => useGameState(storage, platform));

    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(platform.markReady).toHaveBeenCalled();
  });

  it('grants the income boost only after a successful ad watch', async () => {
    const platform = makePlatform(false);
    const storage = makeMemoryStorage();

    const { result } = renderHook(() => useGameState(storage, platform));

    await waitFor(() => expect(result.current.ready).toBe(true));
    const before = result.current.gameState.timedBonuses.length;

    await act(async () => {
      await result.current.activateIncomeBoost();
    });

    expect(platform.showRewardedAd).toHaveBeenCalledTimes(1);
    expect(result.current.gameState.timedBonuses).toHaveLength(before);
  });

  it('grants the income boost when the ad is rewarded', async () => {
    const platform = makePlatform(true);
    const storage = makeMemoryStorage();

    const { result } = renderHook(() => useGameState(storage, platform));

    await waitFor(() => expect(result.current.ready).toBe(true));

    await act(async () => {
      await result.current.activateIncomeBoost();
    });

    expect(platform.showRewardedAd).toHaveBeenCalledTimes(1);
    expect(result.current.gameState.timedBonuses).toHaveLength(1);
    expect(result.current.gameState.timedBonuses[0].id).toBe('rent_x2');
    expect(result.current.gameState.timedBonuses[0].incomeMultiplier).toBe(2);
  });

  it('allows the VIP resident reward only once per day', async () => {
    const platform = makePlatform(true);
    const storage = makeMemoryStorage();
    const now = 1_000_000;
    vi.spyOn(Date, 'now').mockReturnValue(now);

    const { result } = renderHook(() => useGameState(storage, platform));

    await waitFor(() => expect(result.current.ready).toBe(true));

    await act(async () => {
      await result.current.activateVipResident();
    });

    await act(async () => {
      await result.current.activateVipResident();
    });

    expect(platform.showRewardedAd).toHaveBeenCalledTimes(1);
    expect(result.current.gameState.timedBonuses.filter((bonus) => bonus.id === 'vip_resident')).toHaveLength(1);
    expect(result.current.gameState.lastVipResidentClaimedAt).toBe(now);
  });

  it('grants exactly the untimed 50% offline reward while advancing saved time', async () => {
    const now = 4 * 60 * 60 * 1_000;
    vi.spyOn(Date, 'now').mockReturnValue(now);
    const platform = makePlatform(true);
    const base = createInitialState(0);
    const saved = {
      ...base,
      credits: 100,
      moduleLevels: { ...base.moduleLevels, tenant_capsule: 1 },
      timedBonuses: [
        { id: 'rent_x2', incomeMultiplier: 2, expiresAt: now + 1_000 },
        { id: 'vip_resident', incomeMultiplier: 2, expiresAt: now + 1_000 }
      ],
      lastSavedAt: 0
    };
    const expectedReward = calculateOfflineReward(saved, now);
    const storage = makeMemoryStorage(JSON.stringify(saved));

    const { result } = renderHook(() => useGameState(storage, platform));

    await waitFor(() => expect(result.current.ready).toBe(true));

    expect(result.current.offlineReward).toEqual(expectedReward);
    expect(result.current.gameState.credits).toBe(saved.credits + expectedReward.credits);
    expect(result.current.gameState.totalEarnedCredits).toBe(expectedReward.credits);
    expect(result.current.gameState.totalPlaySeconds).toBe(expectedReward.seconds);
    expect(result.current.gameState.lastSavedAt).toBe(now);
  });

  it('uses the offline calculation timestamp for daily-login day boundaries', async () => {
    const dayMs = 24 * 60 * 60 * 1_000;
    let clock = 0;
    vi.spyOn(Date, 'now').mockImplementation(() => {
      clock += dayMs;
      return clock;
    });
    const platform = makePlatform(true);
    const saved = {
      ...createInitialState(0),
      lastSavedAt: 0
    };
    const storage = makeMemoryStorage(JSON.stringify(saved));

    const { result } = renderHook(() => useGameState(storage, platform));

    await waitFor(() => expect(result.current.ready).toBe(true));

    expect(result.current.gameState.lastLoginDay).toBe(
      Math.floor(result.current.gameState.lastSavedAt / dayMs)
    );
  });

  it('doubleOfflineReward adds one untimed reward copy for an exact x2 total', async () => {
    const now = 4 * 60 * 60 * 1_000;
    vi.spyOn(Date, 'now').mockReturnValue(now);
    const platform = makePlatform(true);
    const base = createInitialState(0);
    const saved = {
      ...base,
      credits: 100,
      totalEarnedCredits: 25,
      moduleLevels: { ...base.moduleLevels, tenant_capsule: 1 },
      timedBonuses: [
        { id: 'rent_x2', incomeMultiplier: 2, expiresAt: now + 1_000 },
        { id: 'vip_resident', incomeMultiplier: 2, expiresAt: now + 1_000 }
      ],
      lastSavedAt: 0
    };
    const expectedReward = calculateOfflineReward(saved, now);
    const storage = makeMemoryStorage(JSON.stringify(saved));

    const { result } = renderHook(() => useGameState(storage, platform));

    await waitFor(() => expect(result.current.ready).toBe(true));
    await waitFor(() => expect(result.current.offlineReward).not.toBeNull());

    const rewardCredits = result.current.offlineReward?.credits ?? 0;
    expect(rewardCredits).toBe(expectedReward.credits);

    await act(async () => {
      await result.current.doubleOfflineReward();
    });

    expect(platform.showRewardedAd).toHaveBeenCalledTimes(1);
    expect(result.current.gameState.credits).toBe(saved.credits + expectedReward.credits * 2);
    expect(result.current.gameState.totalEarnedCredits).toBe(
      saved.totalEarnedCredits + expectedReward.credits * 2
    );
    expect(result.current.offlineReward).toBeNull();
  });

  it('keeps the offline reward when the ad is not rewarded', async () => {
    const platform = makePlatform(false);
    const saved = {
      ...createInitialState(1_000),
      credits: 100,
      moduleLevels: { ...createInitialState(1_000).moduleLevels, tenant_capsule: 1 },
      lastSavedAt: 1_000
    };
    const storage = makeMemoryStorage(JSON.stringify(saved));

    const { result } = renderHook(() => useGameState(storage, platform));

    await waitFor(() => expect(result.current.ready).toBe(true));
    await waitFor(() => expect(result.current.offlineReward).not.toBeNull());

    await act(async () => {
      await result.current.doubleOfflineReward();
    });

    expect(platform.showRewardedAd).toHaveBeenCalledTimes(1);
    expect(result.current.offlineReward).not.toBeNull();
  });

  it('prefers the newer cloud save over the local save on load', async () => {
    const baseState = {
      ...createInitialState(1_000),
      credits: 50,
      moduleLevels: { ...createInitialState(1_000).moduleLevels, tenant_capsule: 1 }
    };
    const olderLocal = { ...baseState, credits: 10, lastSavedAt: 1_000 };
    const newerCloud = { ...baseState, credits: 999, lastSavedAt: 5_000 };
    const storage = makeMemoryStorage(JSON.stringify(olderLocal));

    const platform: YandexPlatform = {
      isAvailable() {
        return true;
      },
      markReady: vi.fn(),
      showRewardedAd: vi.fn().mockResolvedValue(false),
      loadCloudSave: vi.fn().mockResolvedValue(JSON.stringify(newerCloud)),
      saveCloud: vi.fn().mockResolvedValue(undefined),
      submitLeaderboardScore: vi.fn().mockResolvedValue(undefined),
      getLeaderboardEntries: vi.fn().mockResolvedValue([]),
      getPurchaseCatalog: vi.fn().mockResolvedValue([]),
      getPurchases: vi.fn().mockResolvedValue([]),
      purchaseProduct: vi.fn().mockResolvedValue(null)
    };

    const { result } = renderHook(() => useGameState(storage, platform));

    await waitFor(() => expect(result.current.ready).toBe(true));

    const expectedCloudCredits = newerCloud.credits + calculateOfflineReward(newerCloud).credits;

    expect(result.current.gameState.credits).toBeCloseTo(expectedCloudCredits, 5);
    expect(result.current.gameState.credits).toBeGreaterThan(olderLocal.credits);
  });

  it('waits for the real Yandex SDK init before loading cloud save', async () => {
    const cloudState = {
      ...createInitialState(Date.now()),
      credits: 777,
      lastSavedAt: Date.now()
    };
    const getData = vi.fn().mockResolvedValue({ [SAVE_KEY]: JSON.stringify(cloudState) });
    const ready = vi.fn();
    let resolveInit: (sdk: {
      features: { LoadingAPI: { ready(): void } };
      getPlayer(): Promise<{ getData: typeof getData; setData: ReturnType<typeof vi.fn> }>;
    }) => void = () => undefined;

    window.YaGames = {
      init: vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveInit = resolve;
          })
      )
    };
    Object.defineProperty(window, 'parent', {
      configurable: true,
      value: {}
    });

    const storage = makeMemoryStorage();
    const { result } = renderHook(() => useGameState(storage));

    await waitFor(() => expect(window.YaGames?.init).toHaveBeenCalled());

    act(() => {
      resolveInit({
        features: { LoadingAPI: { ready } },
        async getPlayer() {
          return {
            getData,
            setData: vi.fn().mockResolvedValue(undefined)
          };
        }
      });
    });

    await waitFor(() => expect(result.current.ready).toBe(true));

    expect(getData).toHaveBeenCalledWith({ keys: [SAVE_KEY] });
    expect(result.current.gameState.credits).toBeGreaterThanOrEqual(777);
    expect(ready).toHaveBeenCalled();
  });

  it('writes to both local storage and cloud on every state change', async () => {
    const platform = makePlatform(false);
    const storage = makeMemoryStorage();

    const { result } = renderHook(() => useGameState(storage, platform));

    await waitFor(() => expect(result.current.ready).toBe(true));

    act(() => {
      result.current.buyLevel('tenant_capsule');
    });

    await waitFor(() => expect(platform.saveCloud).toHaveBeenCalled());
    await expect(storage.load(SAVE_KEY)).resolves.not.toBeNull();
  });
});
