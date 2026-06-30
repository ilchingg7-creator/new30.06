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
}

export interface YandexGamesLib {
  init(): Promise<YandexSdk>;
}

export interface YandexPlatform {
  isAvailable(): boolean;
  markReady(): void;
  showRewardedAd(): Promise<boolean>;
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
    }
  };
}

/**
 * No-op platform used when Yandex Games SDK is unavailable (local dev, other
 * platforms). `showRewardedAd` resolves to `false` so UI code treats it as
 * "ad not available" and never blocks the player.
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
