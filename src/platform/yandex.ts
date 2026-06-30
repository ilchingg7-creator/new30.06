export interface YandexPlayer {
  getData(options?: { keys?: string[] }): Promise<Record<string, unknown>>;
  setData(
    data: Record<string, unknown>,
    options?: { flush?: boolean }
  ): Promise<void>;
}

export interface YandexSdk {
  features?: {
    LoadingAPI?: {
      ready(): void;
    };
  };
  adv?: {
    showRewardedVideo(options: {
      callbacks?: {
        onRewarded?: () => void;
        onClose?: () => void;
        onError?: () => void;
      };
    }): void;
  };
  getPlayer?(): Promise<YandexPlayer>;
}

export interface YandexGamesLib {
  init(): Promise<YandexSdk>;
}

export interface YandexPlatform {
  isAvailable(): boolean;
  markReady(): void;
  showRewardedAd(): Promise<boolean>;
  loadCloudSave(key: string): Promise<string | null>;
  saveCloud(key: string, value: string): Promise<void>;
}

declare global {
  interface Window {
    YaGames?: YandexGamesLib;
  }
}

export function markYandexReady(sdk: YandexSdk | null): void {
  sdk?.features?.LoadingAPI?.ready();
}

export function createYandexPlatform(sdk: YandexSdk | null = null): YandexPlatform {
  return {
    isAvailable() {
      return Boolean(sdk?.adv?.showRewardedVideo);
    },
    markReady() {
      markYandexReady(sdk);
    },
    async showRewardedAd() {
      if (!sdk?.adv?.showRewardedVideo) {
        return false;
      }

      return new Promise<boolean>((resolve) => {
        let rewarded = false;

        sdk.adv?.showRewardedVideo({
          callbacks: {
            onRewarded() {
              rewarded = true;
            },
            onClose() {
              resolve(rewarded);
            },
            onError() {
              resolve(false);
            }
          }
        });
      });
    },
    async loadCloudSave(key: string) {
      const player = await sdk?.getPlayer?.().catch(() => null);

      if (!player) {
        return null;
      }

      try {
        const data = await player.getData({ keys: [key] });
        const raw = data[key];

        return typeof raw === 'string' ? raw : null;
      } catch {
        return null;
      }
    },
    async saveCloud(key: string, value: string) {
      const player = await sdk?.getPlayer?.().catch(() => null);

      if (!player) {
        return;
      }

      try {
        await player.setData({ [key]: value }, { flush: true });
      } catch {
        // Cloud save is best-effort; localStorage already has the data.
      }
    }
  };
}

/**
 * No-op platform used when Yandex Games SDK is unavailable (local dev, other
 * platforms). `showRewardedAd` resolves to `false` so UI code treats it as
 * "ad not available" and never blocks the player. Cloud save methods resolve
 * as empty so the local storage fallback is used instead.
 */
export function createNoOpYandexPlatform(): YandexPlatform {
  return {
    isAvailable() {
      return false;
    },
    markReady() {
      // no-op outside Yandex Games
    },
    async showRewardedAd() {
      return false;
    },
    async loadCloudSave() {
      return null;
    },
    async saveCloud() {
      // no-op outside Yandex Games
    }
  };
}

/**
 * Loads the Yandex Games SDK if present on `window.YaGames`, initializes it,
 * and returns a `YandexPlatform`. Falls back to a no-op platform when the SDK
 * is missing or initialization fails, so the game always boots.
 */
export async function initYandexPlatform(): Promise<YandexPlatform> {
  if (typeof window === 'undefined' || !window.YaGames) {
    return createNoOpYandexPlatform();
  }

  try {
    const sdk = await window.YaGames.init();
    return createYandexPlatform(sdk);
  } catch {
    return createNoOpYandexPlatform();
  }
}
