import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createInitialState } from '../game/economy';
import { SAVE_KEY } from '../game/save';
import { useGameState } from '../ui/useGameState';
import { createLocalStoragePort } from '../platform/storage';
import type { YandexPlatform } from '../platform/yandex';

function makePlatform(grant: boolean): YandexPlatform {
  return {
    isAvailable() {
      return true;
    },
    markReady: vi.fn(),
    showRewardedAd: vi.fn().mockResolvedValue(grant),
    loadCloudSave: vi.fn().mockResolvedValue(null),
    saveCloud: vi.fn().mockResolvedValue(undefined)
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

describe('yandex platform integration', () => {
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
      saveCloud: vi.fn().mockResolvedValue(undefined)
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

  it('writes to both local storage and cloud on every state change', async () => {
    const platform = makePlatform(false);
    const storage = makeMemoryStorage();

    const { result } = renderHook(() => useGameState(storage, platform));

    await waitFor(() => expect(result.current.ready).toBe(true));

    act(() => {
      result.current.buyLevel('tenant_capsule');
    });

    await waitFor(() => expect(platform.saveCloud).toHaveBeenCalled());
    expect(storage.load(SAVE_KEY)).resolves.not.toBeNull();
  });
});
