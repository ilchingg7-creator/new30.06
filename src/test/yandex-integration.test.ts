import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createInitialState } from '../game/economy';
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
  Object.defineProperty(window, 'parent', {
    configurable: true,
    value: window
  });
});

describe('yandex platform integration', () => {
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

  it('doubleOfflineReward adds the reward credits and clears the dialog on success', async () => {
    const platform = makePlatform(true);
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

    const baseCredits = result.current.gameState.credits;
    const rewardCredits = result.current.offlineReward?.credits ?? 0;
    expect(rewardCredits).toBeGreaterThan(0);

    await act(async () => {
      await result.current.doubleOfflineReward();
    });

    expect(platform.showRewardedAd).toHaveBeenCalledTimes(1);
    expect(result.current.gameState.credits).toBeCloseTo(baseCredits + rewardCredits, 5);
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

    // Cloud save had 999 credits; advanceGame applies offline income from
    // lastSavedAt=5000 to now (huge delta, ~29k credits) + a daily login
    // reward of 50. The key assertion: we did NOT use the local save (10
    // credits + tiny offline delta), so credits must be well above 999.
    expect(result.current.gameState.credits).toBeGreaterThan(999);
    expect(result.current.gameState.credits).toBeGreaterThanOrEqual(29_000);
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
