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

export interface YandexPlatform {
  markReady(): void;
  showRewardedAd(): Promise<boolean>;
}

export function markYandexReady(sdk: YandexSdk | null): void {
  sdk?.features?.LoadingAPI?.ready();
}

export function createYandexPlatform(sdk: YandexSdk | null = null): YandexPlatform {
  return {
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
