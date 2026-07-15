# Strange Cat Purchase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a permanent Yandex Games purchase that unlocks the strange cat from the Bonuses panel for a catalog-configured price of 99 Yan and move the cat overlay down by 22 scene units.

**Architecture:** Extend the existing Yandex platform adapter with a small typed purchase API, then let `useGameState` own the asynchronous catalog, entitlement, and purchase status. Pass that UI-level entitlement through both layouts to the Bonuses panel and room scene; keep it outside `GameState`, the idle economy, save migration, and renovation logic because `payments.getPurchases()` is the permanent source of truth.

**Tech Stack:** TypeScript 5, React 19, Yandex Games SDK v2, Vitest 3, Testing Library, PixiJS scene overlays, CSS.

## Global Constraints

- The Developer Console product ID is exactly `strange_cat`.
- The Developer Console product is non-consumable and configured at 99 Yan.
- Never call `payments.consumePurchase()` for this product.
- Render `IProduct.price` and `IProduct.getPriceCurrencyImage('small')`; never hardcode a fallback currency label or icon.
- The cat is visible only when the capsule has at least one level and the Yandex entitlement is owned.
- Set the cat overlay to `y = 230` and the love overlay to `y = 154`.
- Preserve all existing cat click, cooldown, love animation, and incident behavior after entitlement.
- Keep local development and SDK failure paths bootable; an unavailable purchase must not affect ad bonuses.
- Add Russian and English copy for every new visible state.
- Follow red-green-refactor for every behavior change and commit after each independently passing task.

---

## File Structure

- `src/platform/yandex.ts`: SDK purchase types and the only direct calls to `getCatalog`, `getPurchases`, and `purchase`.
- `src/ui/useGameState.ts`: product lookup, ownership restoration, purchase state machine, and purchase action.
- `src/ui/components/BonusPanel.tsx`: permanent cat offer and owned/unavailable/error presentation.
- `src/ui/layouts/DesktopLayout.tsx`: wires purchase state to desktop bonuses and entitlement to the scene.
- `src/ui/layouts/MobileLayout.tsx`: wires the same contract to mobile bonuses and scene.
- `src/ui/components/PixiStationScene.tsx`: gates the existing overlay on the entitlement prop.
- `src/station/roomScenes.ts`: agreed cat and love coordinates.
- `src/platform/i18n.ts`: Russian and English purchase copy.
- `src/styles/global.css`: compact offer/price/status styling within the existing panel system.
- `src/test/yandex-integration.test.ts`: adapter and `useGameState` purchase integration tests.
- `src/test/components.test.tsx`: Bonuses panel states and cat entitlement rendering tests.
- `src/test/room-scenes.test.ts`: exact scene coordinate regression tests.
- `src/test/responsive.test.tsx`: complete `UseGameStateResult` fixture and mobile/desktop wiring checks.
- `src/test/useGameState.audio.test.ts`: complete `YandexPlatform` fixture after interface expansion.
- `docs/game-design/05-yandex-games.md`: console product contract and non-consumable restoration rule.

---

### Task 1: Typed Yandex purchase adapter

**Files:**
- Modify: `src/platform/yandex.ts`
- Test: `src/test/yandex-integration.test.ts`
- Modify fixture: `src/test/useGameState.audio.test.ts`

**Interfaces:**
- Consumes: the existing initialized `YandexSdk` instance.
- Produces: `STRANGE_CAT_PRODUCT_ID`, `YandexProduct`, `YandexPurchase`, and three `YandexPlatform` methods: `getPurchaseCatalog()`, `getPurchases()`, and `purchaseProduct(productId)`.

- [ ] **Step 1: Write failing adapter tests**

Add SDK tests that prove the adapter uses the direct `payments` API and preserves catalog metadata:

```ts
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
```

- [ ] **Step 2: Run the focused tests and verify the interface failure**

Run: `npm test -- src/test/yandex-integration.test.ts src/test/useGameState.audio.test.ts`

Expected: TypeScript/Vitest fails because `payments`, `getPurchaseCatalog`, `getPurchases`, and `purchaseProduct` do not exist yet.

- [ ] **Step 3: Add the minimal SDK and platform types**

Add these declarations to `src/platform/yandex.ts`:

```ts
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
```

Add these two members to the existing `YandexSdk` declaration:

```ts
payments?: YandexPaymentsApi;
getPayments?(): Promise<YandexPaymentsApi>;
```

Add these three members to the existing `YandexPlatform` declaration:

```ts
getPurchaseCatalog(): Promise<YandexProduct[]>;
getPurchases(): Promise<YandexPurchase[]>;
purchaseProduct(productId: string): Promise<YandexPurchase | null>;
```

- [ ] **Step 4: Implement safe lazy payment access**

Add one helper and the methods to both platform constructors:

```ts
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
```

In `createYandexPlatform`:

```ts
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
```

In `createNoOpYandexPlatform`:

```ts
async getPurchaseCatalog() {
  return [];
},
async getPurchases() {
  return [];
},
async purchaseProduct() {
  return null;
}
```

Add these same three no-op methods to the `YandexPlatform` fixtures in `src/test/yandex-integration.test.ts` and `src/test/useGameState.audio.test.ts`.

- [ ] **Step 5: Run focused tests and commit**

Run: `npm test -- src/test/yandex-integration.test.ts src/test/useGameState.audio.test.ts`

Expected: both files pass, including the new catalog, restoration, purchase, and fallback tests.

```bash
git add src/platform/yandex.ts src/test/yandex-integration.test.ts src/test/useGameState.audio.test.ts
git commit -m "feat: add Yandex purchase adapter"
```

---

### Task 2: Purchase state and entitlement restoration

**Files:**
- Modify: `src/ui/useGameState.ts`
- Test: `src/test/yandex-integration.test.ts`

**Interfaces:**
- Consumes: `STRANGE_CAT_PRODUCT_ID`, `YandexProduct`, and the Task 1 `YandexPlatform` methods.
- Produces: `StrangeCatPurchaseStatus`, `strangeCatProduct`, `strangeCatPurchaseStatus`, `strangeCatOwned`, and `purchaseStrangeCat()` on `UseGameStateResult`.

- [ ] **Step 1: Write failing restoration and purchase tests**

Import the new types and constant, then define deterministic fixtures:

```ts
import {
  STRANGE_CAT_PRODUCT_ID,
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
```

Extend the test platform factory so each test controls catalog, purchases, and purchase results:

```ts
function makePlatform(
  grant: boolean,
  options: {
    catalog?: YandexProduct[];
    purchases?: YandexPurchase[];
    purchaseResult?: YandexPurchase | null;
  } = {}
): YandexPlatform {
  return {
    isAvailable: () => true,
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
```

Use those `strangeCatProduct` and `strangeCatPurchase` fixtures in these tests:

```ts
it('restores permanent strange cat ownership during platform load', async () => {
  const platform = makePlatform(true, {
    catalog: [strangeCatProduct],
    purchases: [strangeCatPurchase]
  });
  const { result } = renderHook(() => useGameState(makeMemoryStorage(), platform));

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
  const { result } = renderHook(() => useGameState(makeMemoryStorage(), platform));

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
  const { result } = renderHook(() => useGameState(makeMemoryStorage(), platform));

  await waitFor(() => expect(result.current.strangeCatPurchaseStatus).toBe('available'));

  await act(async () => {
    await result.current.purchaseStrangeCat();
  });

  expect(result.current.strangeCatOwned).toBe(false);
  expect(result.current.strangeCatPurchaseStatus).toBe('error');
});
```

- [ ] **Step 2: Run the focused tests and verify red**

Run: `npm test -- src/test/yandex-integration.test.ts`

Expected: FAIL because `UseGameStateResult` has no purchase fields or action.

- [ ] **Step 3: Add the purchase state contract**

In `src/ui/useGameState.ts`, import the Task 1 symbols and add:

```ts
export type StrangeCatPurchaseStatus =
  | 'loading'
  | 'available'
  | 'purchasing'
  | 'owned'
  | 'unavailable'
  | 'error';
```

Extend `UseGameStateResult`:

```ts
strangeCatProduct: YandexProduct | null;
strangeCatPurchaseStatus: StrangeCatPurchaseStatus;
strangeCatOwned: boolean;
purchaseStrangeCat(): Promise<void>;
```

Initialize hook state:

```ts
const [strangeCatProduct, setStrangeCatProduct] = useState<YandexProduct | null>(null);
const [strangeCatPurchaseStatus, setStrangeCatPurchaseStatus] =
  useState<StrangeCatPurchaseStatus>('loading');
```

- [ ] **Step 4: Load catalog and ownership with the platform bootstrap**

Inside the existing startup effect, define a non-blocking loader that derives one deterministic status:

```ts
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
```

Immediately after assigning `platformRef.current = platform`, start it without awaiting it:

```ts
void loadStrangeCatPurchaseState(platform);
```

The existing cloud/local save load and `markReady()` continue independently, so a slow payment catalog cannot hold the loading screen open.

Do not serialize this status into `GameState`; it is restored from Yandex purchases each launch.

- [ ] **Step 5: Implement the guarded purchase action**

Add:

```ts
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
```

Return the four new fields, deriving ownership only from status:

```ts
strangeCatProduct,
strangeCatPurchaseStatus,
strangeCatOwned: strangeCatPurchaseStatus === 'owned',
purchaseStrangeCat,
```

- [ ] **Step 6: Run focused tests and commit**

Run: `npm test -- src/test/yandex-integration.test.ts`

Expected: all integration tests pass; successful purchase owns the cat and cancellation yields retryable `error`.

```bash
git add src/ui/useGameState.ts src/test/yandex-integration.test.ts
git commit -m "feat: restore strange cat entitlement"
```

---

### Task 3: Bonuses purchase card and localized states

**Files:**
- Modify: `src/platform/i18n.ts`
- Modify: `src/ui/components/BonusPanel.tsx`
- Modify: `src/ui/layouts/DesktopLayout.tsx`
- Modify: `src/ui/layouts/MobileLayout.tsx`
- Modify: `src/styles/global.css`
- Test: `src/test/components.test.tsx`
- Test fixture: `src/test/responsive.test.tsx`

**Interfaces:**
- Consumes: Task 2 product, status, ownership, and purchase action.
- Produces: a localized purchase card in both layouts and a complete responsive test fixture.

- [ ] **Step 1: Write failing Bonuses panel tests**

Import `type YandexProduct` from `../platform/yandex` and add this component fixture:

```ts
const strangeCatProduct: YandexProduct = {
  id: 'strange_cat',
  title: 'Странный кот',
  description: 'Поселить кота навсегда',
  imageURI: 'https://example.test/cat.png',
  price: '99 ЯН',
  priceValue: '99',
  priceCurrencyCode: 'YAN',
  getPriceCurrencyImage: vi.fn(() => 'https://example.test/yan.svg')
};
```

Add focused component tests using the catalog object rather than hardcoded price markup:

```tsx
it('shows the strange cat catalog price and currency icon in Bonuses', () => {
  const onPurchase = vi.fn();

  render(
    <BonusPanel
      onIncomeBoost={vi.fn()}
      onVipResident={vi.fn()}
      onPurchaseStrangeCat={onPurchase}
      strangeCatProduct={strangeCatProduct}
      strangeCatPurchaseStatus="available"
      t={t}
    />
  );

  expect(screen.getByText('99 ЯН')).toBeInTheDocument();
  expect(screen.getByRole('img', { name: t.portalCurrency })).toHaveAttribute(
    'src',
    'https://example.test/yan.svg'
  );
  fireEvent.click(screen.getByRole('button', { name: t.buyStrangeCat }));
  expect(onPurchase).toHaveBeenCalledTimes(1);
});

it('shows an owned state without another cat purchase button', () => {
  render(
    <BonusPanel
      onIncomeBoost={vi.fn()}
      onVipResident={vi.fn()}
      onPurchaseStrangeCat={vi.fn()}
      strangeCatProduct={strangeCatProduct}
      strangeCatPurchaseStatus="owned"
      t={t}
    />
  );

  expect(screen.getByText(t.strangeCatOwned)).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: t.buyStrangeCat })).toBeNull();
});

it('keeps the cat offer visible but disabled when purchases are unavailable', () => {
  render(
    <BonusPanel
      onIncomeBoost={vi.fn()}
      onVipResident={vi.fn()}
      onPurchaseStrangeCat={vi.fn()}
      strangeCatProduct={null}
      strangeCatPurchaseStatus="unavailable"
      t={t}
    />
  );

  expect(screen.getByText(t.strangeCatOfferTitle)).toBeInTheDocument();
  expect(screen.getByText(t.strangeCatUnavailable)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: t.buyStrangeCat })).toBeDisabled();
});
```

- [ ] **Step 2: Run component tests and verify red**

Run: `npm test -- src/test/components.test.tsx src/test/responsive.test.tsx`

Expected: FAIL on missing translation keys and `BonusPanel` props.

- [ ] **Step 3: Add exact Russian and English copy**

Extend `Translation` with:

```ts
strangeCatOfferTitle: string;
strangeCatOfferBody: string;
buyStrangeCat: string;
strangeCatPurchasing: string;
strangeCatOwned: string;
strangeCatUnavailable: string;
strangeCatPurchaseError: string;
portalCurrency: string;
```

Russian values:

```ts
strangeCatOfferTitle: 'Поселить странного кота',
strangeCatOfferBody: 'Постоянная покупка: кот навсегда поселится в жилой капсуле.',
buyStrangeCat: 'Купить странного кота',
strangeCatPurchasing: 'Покупка обрабатывается…',
strangeCatOwned: 'Кот поселён',
strangeCatUnavailable: 'Покупка временно недоступна',
strangeCatPurchaseError: 'Покупка не завершена. Можно попробовать снова.',
portalCurrency: 'Валюта портала',
```

English values:

```ts
strangeCatOfferTitle: 'Settle the strange cat',
strangeCatOfferBody: 'Permanent purchase: the cat will live in the tenant capsule forever.',
buyStrangeCat: 'Buy the strange cat',
strangeCatPurchasing: 'Processing purchase…',
strangeCatOwned: 'Cat settled',
strangeCatUnavailable: 'Purchase temporarily unavailable',
strangeCatPurchaseError: 'Purchase not completed. You can try again.',
portalCurrency: 'Portal currency',
```

Change the existing station tour sentence so locked users are not told the cat is already present:

```ts
tourStepStationBody: 'Это вид станции. Кликайте по комнате, чтобы получить немного копеек. Странного кота можно навсегда поселить через раздел «Бонусы».',
```

```ts
tourStepStationBody: 'This is the station view. Click a room to earn a few kopeks. You can permanently settle the strange cat from Bonuses.',
```

- [ ] **Step 4: Implement the purchase card**

Extend `BonusPanelProps`:

```ts
onPurchaseStrangeCat(): void;
strangeCatProduct: YandexProduct | null;
strangeCatPurchaseStatus: StrangeCatPurchaseStatus;
```

Render this block above the ad bonus buttons:

```tsx
<div className="cat-purchase-card">
  <div>
    <strong>{t.strangeCatOfferTitle}</strong>
    <p className="panel-copy">{t.strangeCatOfferBody}</p>
  </div>

  {strangeCatPurchaseStatus === 'owned' ? (
    <span className="cat-purchase-status success">{t.strangeCatOwned}</span>
  ) : (
    <>
      {strangeCatProduct ? (
        <span className="cat-purchase-price">
          <img
            src={strangeCatProduct.getPriceCurrencyImage('small')}
            alt={t.portalCurrency}
          />
          {strangeCatProduct.price}
        </span>
      ) : null}
      <button
        type="button"
        onClick={onPurchaseStrangeCat}
        disabled={
          strangeCatPurchaseStatus === 'loading' ||
          strangeCatPurchaseStatus === 'purchasing' ||
          strangeCatPurchaseStatus === 'unavailable'
        }
      >
        {strangeCatPurchaseStatus === 'purchasing'
          ? t.strangeCatPurchasing
          : t.buyStrangeCat}
      </button>
      {strangeCatPurchaseStatus === 'unavailable' ? (
        <span className="cat-purchase-status">{t.strangeCatUnavailable}</span>
      ) : null}
      {strangeCatPurchaseStatus === 'error' ? (
        <span className="cat-purchase-status error">{t.strangeCatPurchaseError}</span>
      ) : null}
    </>
  )}
</div>
```

Add narrowly scoped CSS:

```css
.cat-purchase-card {
  display: grid;
  gap: 8px;
  padding: 12px;
  border: 1px solid rgb(214 159 46 / 45%);
  border-radius: var(--radius-control);
  background: rgb(214 159 46 / 8%);
}

.cat-purchase-price {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 700;
}

.cat-purchase-price img {
  width: 18px;
  height: 18px;
}

.cat-purchase-status.success { color: var(--color-enamel-green); }
.cat-purchase-status.error { color: var(--color-signal-red); }
```

- [ ] **Step 5: Wire both layouts and update typed fixtures**

Pass these props in both `DesktopLayout.tsx` and `MobileLayout.tsx`:

```tsx
onPurchaseStrangeCat={game.purchaseStrangeCat}
strangeCatProduct={game.strangeCatProduct}
strangeCatPurchaseStatus={game.strangeCatPurchaseStatus}
```

Add to `buildDutyGame()` in `src/test/responsive.test.tsx`:

```ts
strangeCatProduct: null,
strangeCatPurchaseStatus: 'unavailable',
strangeCatOwned: false,
purchaseStrangeCat: vi.fn(),
```

- [ ] **Step 6: Run UI tests and commit**

Run: `npm test -- src/test/components.test.tsx src/test/responsive.test.tsx`

Expected: purchase price/icon, owned state, unavailable state, and both layout suites pass.

```bash
git add src/platform/i18n.ts src/ui/components/BonusPanel.tsx src/ui/layouts/DesktopLayout.tsx src/ui/layouts/MobileLayout.tsx src/styles/global.css src/test/components.test.tsx src/test/responsive.test.tsx
git commit -m "feat: add strange cat purchase offer"
```

---

### Task 4: Entitlement-gated cat scene and agreed coordinates

**Files:**
- Modify: `src/ui/components/PixiStationScene.tsx`
- Modify: `src/ui/layouts/DesktopLayout.tsx`
- Modify: `src/ui/layouts/MobileLayout.tsx`
- Modify: `src/station/roomScenes.ts`
- Test: `src/test/components.test.tsx`
- Test: `src/test/room-scenes.test.ts`

**Interfaces:**
- Consumes: Task 2 `strangeCatOwned` boolean.
- Produces: `hasStrangeCat` scene prop, entitlement-gated overlay, and exact Y coordinates.

- [ ] **Step 1: Replace the existing visibility test with an entitlement regression test**

```tsx
it('shows the strange cat only when the entitlement is owned in the tenant capsule', () => {
  const gameState = {
    ...buyModuleLevel(createInitialState(1_000), 'tenant_capsule'),
    moduleLevels: {
      ...createInitialState(1_000).moduleLevels,
      tenant_capsule: 1,
      cosmo_kitchen: 1
    }
  };
  const { rerender } = render(
    <PixiStationScene
      gameState={gameState}
      selectedRoomId="tenant_capsule"
      hasStrangeCat={false}
      ariaLabel={t.stationView}
    />
  );

  expect(screen.queryByRole('button', { name: 'strange-cat' })).toBeNull();

  rerender(
    <PixiStationScene
      gameState={gameState}
      selectedRoomId="tenant_capsule"
      hasStrangeCat
      ariaLabel={t.stationView}
    />
  );
  expect(screen.getByRole('button', { name: 'strange-cat' })).toBeInTheDocument();

  rerender(
    <PixiStationScene
      gameState={gameState}
      selectedRoomId="cosmo_kitchen"
      hasStrangeCat
      ariaLabel={t.stationView}
    />
  );
  expect(screen.queryByRole('button', { name: 'strange-cat' })).toBeNull();
});
```

Also pass `hasStrangeCat` in the existing love/cooldown test so that test continues exercising the purchased cat.

- [ ] **Step 2: Update the coordinate test to express the approved geometry**

Change exact assertions in `src/test/room-scenes.test.ts`:

```ts
expect(TENANT_CAT_SCENE_RECT.y).toBe(230);
expect(TENANT_CAT_LOVE_SCENE_RECT.y).toBe(154);
expect(TENANT_CAT_LOVE_SCENE_RECT.y + TENANT_CAT_LOVE_SCENE_RECT.height - TENANT_CAT_SCENE_RECT.y).toBe(50);
```

Keep the existing width, height, right-side placement, and relative love-size assertions.

- [ ] **Step 3: Run both tests and verify red**

Run: `npm test -- src/test/components.test.tsx src/test/room-scenes.test.ts`

Expected: FAIL because `hasStrangeCat` does not exist and the constants still use 208/132.

- [ ] **Step 4: Gate the overlay and move both rectangles**

Extend the scene props and visibility expression:

```ts
interface PixiStationSceneProps {
  gameState: GameState;
  selectedRoomId: ModuleId;
  onRoomClick?: () => void;
  onTenantCatClick?: () => void;
  hasStrangeCat?: boolean;
  ariaLabel?: string;
}
```

```ts
const tenantCatVisible =
  hasStrangeCat === true &&
  selectedRoomId === 'tenant_capsule' &&
  (gameState.moduleLevels.tenant_capsule ?? 0) > 0;
```

Update `src/station/roomScenes.ts`:

```ts
export const TENANT_CAT_SCENE_RECT: SceneOverlayRect = {
  x: 540,
  y: 230,
  width: 228,
  height: 228
};

export const TENANT_CAT_LOVE_SCENE_RECT: SceneOverlayRect = {
  x: 591,
  y: 154,
  width: 126,
  height: 126
};
```

Pass `hasStrangeCat={game.strangeCatOwned}` to `PixiStationScene` in both layouts.

- [ ] **Step 5: Run scene tests and commit**

Run: `npm test -- src/test/components.test.tsx src/test/room-scenes.test.ts src/test/responsive.test.tsx`

Expected: the cat is hidden without entitlement, visible with entitlement in the capsule, clickable with its existing behavior, and positioned at 230/154.

```bash
git add src/ui/components/PixiStationScene.tsx src/ui/layouts/DesktopLayout.tsx src/ui/layouts/MobileLayout.tsx src/station/roomScenes.ts src/test/components.test.tsx src/test/room-scenes.test.ts src/test/responsive.test.tsx
git commit -m "feat: gate strange cat scene by purchase"
```

---

### Task 5: Publication contract and full verification

**Files:**
- Modify: `docs/game-design/05-yandex-games.md`
- Verify: all changed source and test files from Tasks 1–4

**Interfaces:**
- Consumes: the complete purchase flow.
- Produces: an explicit Developer Console checklist and verified production build.

- [ ] **Step 1: Document the console-side contract**

Add a `## Постоянная покупка странного кота` section containing these exact operational requirements:

```md
## Постоянная покупка странного кота

В Консоли разработчика создаётся нерасходуемый товар:

- ID: `strange_cat`;
- цена: 99 ЯН;
- назначение: навсегда открыть странного кота в жилой капсуле.

Игра получает цену, название валюты и значок валюты через `payments.getCatalog()`.
Право владения восстанавливается при каждом запуске через `payments.getPurchases()`.
Товар постоянный, поэтому `payments.consumePurchase()` для него не вызывается.

Перед публикацией нужно включить инап-покупки, создать товар с тем же ID,
проверить успешную покупку и проверить восстановление покупки после перезапуска
под тем же аккаунтом.
```

- [ ] **Step 2: Run the complete test suite**

Run: `npm test`

Expected: every Vitest file passes with no unhandled promise rejections or React warnings.

- [ ] **Step 3: Run the production build**

Run: `npm run build`

Expected: `tsc --noEmit` and `vite build` both succeed; the build emits `dist/` without TypeScript errors.

- [ ] **Step 4: Check patch hygiene**

Run: `git diff --check`

Expected: no whitespace errors.

Run: `git status --short`

Expected: only `docs/game-design/05-yandex-games.md` remains uncommitted for this task; pre-existing `.superpowers/`, `debug.log`, and `tmp/` remain untouched and unstaged.

- [ ] **Step 5: Commit documentation**

```bash
git add docs/game-design/05-yandex-games.md
git commit -m "docs: document strange cat product setup"
```

- [ ] **Step 6: Perform Yandex draft verification**

In a Yandex Games draft with purchases enabled:

1. Confirm the Bonuses card displays the catalog-provided `99 ЯН` and the SDK-provided currency icon.
2. Cancel the payment dialog and confirm the cat stays hidden and the purchase can be retried.
3. Complete the purchase and confirm the card changes to «Кот поселён» immediately.
4. Open the purchased capsule and confirm the cat appears at the agreed lower position without losing click/love/incident behavior.
5. Reload the draft and confirm `getPurchases()` restores the cat without another payment.
6. Open the same account in another supported browser/device and confirm the entitlement follows the account.

Expected: all six checks pass. If the Developer Console product is absent, the Bonuses card remains visible and disabled with «Покупка временно недоступна».
