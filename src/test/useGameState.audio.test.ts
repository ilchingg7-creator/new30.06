import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createLocalStoragePort } from '../platform/storage';
import type { YandexPlatform } from '../platform/yandex';

const sound = vi.hoisted(() => ({
  isMuted: vi.fn(() => false),
  playSound: vi.fn(),
  toggleMuted: vi.fn(() => false),
  startAmbientHum: vi.fn(),
  stopAmbientHum: vi.fn(),
  startBackgroundMusic: vi.fn(),
  stopBackgroundMusic: vi.fn()
}));

vi.mock('../platform/sound', () => sound);

import { useGameState } from '../ui/useGameState';

function makeStorage() {
  const store = new Map<string, string>();

  return createLocalStoragePort({
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value); }
  } as Storage);
}

function makePlatform(): YandexPlatform {
  return {
    isAvailable: () => false,
    markReady: vi.fn(),
    showRewardedAd: vi.fn().mockResolvedValue(false),
    loadCloudSave: vi.fn().mockResolvedValue(null),
    saveCloud: vi.fn().mockResolvedValue(undefined),
    submitLeaderboardScore: vi.fn().mockResolvedValue(undefined),
    getLeaderboardEntries: vi.fn().mockResolvedValue([]),
    getPurchaseCatalog: vi.fn().mockResolvedValue([]),
    getPurchases: vi.fn().mockResolvedValue([]),
    purchaseProduct: vi.fn().mockResolvedValue(null)
  };
}

afterEach(() => {
  vi.clearAllMocks();
  sound.isMuted.mockReturnValue(false);
  sound.toggleMuted.mockReturnValue(false);
});

describe('useGameState audio lifecycle', () => {
  it('starts both ambient layers when ready and stops both on unmount', async () => {
    const storage = makeStorage();
    const platform = makePlatform();
    const { result, unmount } = renderHook(() => useGameState(storage, platform));
    await waitFor(() => expect(result.current.ready).toBe(true));

    expect(sound.startAmbientHum).toHaveBeenCalledTimes(1);
    expect(sound.startBackgroundMusic).toHaveBeenCalledTimes(1);
    unmount();
    expect(sound.stopAmbientHum).toHaveBeenCalledTimes(1);
    expect(sound.stopBackgroundMusic).toHaveBeenCalledTimes(1);
  });

  it('stops both ambient layers when sound is muted', async () => {
    sound.toggleMuted.mockReturnValueOnce(true);
    const storage = makeStorage();
    const platform = makePlatform();
    const { result } = renderHook(() => useGameState(storage, platform));
    await waitFor(() => expect(result.current.ready).toBe(true));
    vi.clearAllMocks();

    act(() => result.current.toggleSound());

    expect(sound.stopAmbientHum).toHaveBeenCalled();
    expect(sound.stopBackgroundMusic).toHaveBeenCalled();
  });
});
