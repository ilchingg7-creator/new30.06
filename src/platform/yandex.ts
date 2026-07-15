export interface YandexPlayer {
  getData(options?: { keys?: string[] }): Promise<Record<string, unknown>>;
  setData(
    data: Record<string, unknown>,
    options?: { flush?: boolean }
  ): Promise<void>;
}

export interface YandexLeaderboardEntry {
  score: number;
  extraData?: string;
  rank: number;
  player: {
    publicName: string;
    uniqueID: string;
    getAvatarSrc(size: string): string;
  };
}

export interface YandexLeaderboard {
  entries: YandexLeaderboardEntry[];
  userRank?: number;
  userScore?: number;
}

export const STRANGE_CAT_PRODUCT_ID = 'strange_cat';

export interface YandexProduct {
  id: string;
  title: string;
  description: string;
  imageURI: string;
  price: string;
  priceValue: string;
  priceCurrencyCode: string;
  getPriceCurrencyImage(size: 'small' | 'medium' | 'svg'): string;
}

export interface YandexPurchase {
  productID: string;
  purchaseToken: string;
  developerPayload: string;
}

export interface YandexPaymentsApi {
  getCatalog(): Promise<YandexProduct[]>;
  getPurchases(): Promise<YandexPurchase[]>;
  purchase(data: { id: string; developerPayload?: string }): Promise<YandexPurchase>;
}

export interface YandexSdk {
  environment?: {
    i18n?: {
      lang?: string;
    };
  };
  features?: {
    LoadingAPI?: {
      ready(): void;
    };
  };
  adv?: {
    showRewardedVideo(options: {
      callbacks?: {
        onOpen?: () => void;
        onRewarded?: () => void;
        onClose?: () => void;
        onError?: () => void;
      };
    }): void;
  };
  leaderboards?: YandexLeaderboardsApi;
  payments?: YandexPaymentsApi;
  getPlayer?(): Promise<YandexPlayer>;
  getLeaderboards?(): Promise<YandexLeaderboardsApi>;
  getPayments?(): Promise<YandexPaymentsApi>;
}

export interface YandexLeaderboardsApi {
  getLeaderboardDescription(leaderboardName: string): Promise<{ name: string; title: string }>;
  setLeaderboardScore(leaderboardName: string, score: number, extraData?: string): Promise<void>;
  getLeaderboardEntries(
    leaderboardName: string,
    options?: { quantityTop?: number; includeUser?: boolean; quantityAround?: number }
  ): Promise<YandexLeaderboard>;
}

export interface YandexGamesLib {
  init(): Promise<YandexSdk>;
}

export interface YandexPlatform {
  isAvailable(): boolean;
  markReady(): void;
  showRewardedAd(onOpen?: () => void): Promise<boolean>;
  loadCloudSave(key: string): Promise<string | null>;
  saveCloud(key: string, value: string): Promise<void>;
  submitLeaderboardScore(leaderboardName: string, score: number): Promise<void>;
  getLeaderboardEntries(
    leaderboardName: string,
    quantity?: number
  ): Promise<YandexLeaderboardEntry[]>;
  getPurchaseCatalog(): Promise<YandexProduct[]>;
  getPurchases(): Promise<YandexPurchase[]>;
  purchaseProduct(productId: string): Promise<YandexPurchase | null>;
}

declare global {
  interface Window {
    YaGames?: YandexGamesLib;
    __cosmicCommunalkaSessionLanguage?: 'ru' | 'en';
    __yaSdkLang?: string;
  }
}

function isYandexGamesRuntime(): boolean {
  if (typeof window === 'undefined' || !window.YaGames) {
    return false;
  }

  return window.parent !== window || window.location.hostname.endsWith('yandex.ru');
}

async function getLeaderboardsApi(sdk: YandexSdk | null): Promise<YandexLeaderboardsApi | undefined> {
  return sdk?.leaderboards ?? sdk?.getLeaderboards?.();
}

async function getPaymentsApi(sdk: YandexSdk | null): Promise<YandexPaymentsApi | null> {
  if (sdk?.payments) {
    return sdk.payments;
  }

  try {
    return (await sdk?.getPayments?.()) ?? null;
  } catch {
    return null;
  }
}

export function markYandexReady(sdk: YandexSdk | null): void {
  sdk?.features?.LoadingAPI?.ready();
}

export function createYandexPlatform(sdk: YandexSdk | null = null): YandexPlatform {
  let playerPromise: Promise<YandexPlayer | null> | null = null;

  function getPlayer(): Promise<YandexPlayer | null> {
    if (!sdk?.getPlayer) {
      return Promise.resolve(null);
    }

    if (!playerPromise) {
      playerPromise = sdk.getPlayer().catch(() => {
        playerPromise = null;
        return null;
      });
    }

    return playerPromise;
  }

  return {
    isAvailable() {
      return Boolean(sdk?.adv?.showRewardedVideo);
    },
    markReady() {
      markYandexReady(sdk);
    },
    async showRewardedAd(onOpen?: () => void) {
      if (!sdk?.adv?.showRewardedVideo) {
        return false;
      }

      return new Promise<boolean>((resolve) => {
        let rewarded = false;

        sdk.adv?.showRewardedVideo({
          callbacks: {
            onOpen() {
              onOpen?.();
            },
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
      const player = await getPlayer();

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
      const player = await getPlayer();

      if (!player) {
        return;
      }

      try {
        await player.setData({ [key]: value }, { flush: true });
      } catch {
        // Cloud save is best-effort; localStorage already has the data.
      }
    },
    async submitLeaderboardScore(leaderboardName: string, score: number) {
      try {
        const lb = await getLeaderboardsApi(sdk);
        await lb?.setLeaderboardScore(leaderboardName, score);
      } catch {
        // Leaderboard is best-effort.
      }
    },
    async getLeaderboardEntries(leaderboardName: string, quantity = 10) {
      try {
        const lb = await getLeaderboardsApi(sdk);
        const result = await lb?.getLeaderboardEntries(leaderboardName, {
          quantityTop: quantity,
          includeUser: true,
          quantityAround: 0
        });

        return result?.entries ?? [];
      } catch {
        return [];
      }
    },
    async getPurchaseCatalog() {
      const payments = await getPaymentsApi(sdk);
      return payments?.getCatalog().catch(() => []) ?? [];
    },
    async getPurchases() {
      const payments = await getPaymentsApi(sdk);
      return payments?.getPurchases().catch(() => []) ?? [];
    },
    async purchaseProduct(productId: string) {
      const payments = await getPaymentsApi(sdk);

      if (!payments) {
        return null;
      }

      try {
        return await payments.purchase({ id: productId });
      } catch {
        return null;
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
    async showRewardedAd(_onOpen?: () => void) {
      return false;
    },
    async loadCloudSave() {
      return null;
    },
    async saveCloud() {
      // no-op outside Yandex Games
    },
    async submitLeaderboardScore() {
      // no-op outside Yandex Games
    },
    async getLeaderboardEntries() {
      return [];
    },
    async getPurchaseCatalog() {
      return [];
    },
    async getPurchases() {
      return [];
    },
    async purchaseProduct() {
      return null;
    }
  };
}

/**
 * Loads the Yandex Games SDK if present on `window.YaGames`, initializes it,
 * and returns a `YandexPlatform`. Falls back to a no-op platform when the SDK
 * is missing or initialization fails, so the game always boots.
 */
export async function initYandexPlatform(): Promise<YandexPlatform> {
  if (!isYandexGamesRuntime()) {
    return createNoOpYandexPlatform();
  }

  const yaGames = window.YaGames;

  if (!yaGames) {
    return createNoOpYandexPlatform();
  }

  try {
    const sdk = await yaGames.init();
    const sdkLanguage = sdk.environment?.i18n?.lang;

    if (sdkLanguage) {
      window.__yaSdkLang = sdkLanguage;
    }

    return createYandexPlatform(sdk);
  } catch {
    return createNoOpYandexPlatform();
  }
}
