'use client';

import { Sparkles, Star } from 'lucide-react';
import type { Translation } from '../../platform/i18n';
import type { YandexProduct } from '../../platform/yandex';
import type { StrangeCatPurchaseStatus } from '../useGameState';

interface BonusPanelProps {
  onIncomeBoost(): void;
  onVipResident(): void;
  onPurchaseStrangeCat(): void;
  strangeCatProduct: YandexProduct | null;
  strangeCatPurchaseStatus: StrangeCatPurchaseStatus;
  adsAvailable?: boolean;
  adPending?: boolean;
  vipResidentAvailable?: boolean;
  t: Translation;
}

export function BonusPanel({
  onIncomeBoost,
  onVipResident,
  onPurchaseStrangeCat,
  strangeCatProduct,
  strangeCatPurchaseStatus,
  adsAvailable = false,
  adPending = false,
  vipResidentAvailable = true,
  t
}: BonusPanelProps) {
  const boostLabel = adsAvailable ? `${t.boost2x} ${t.adSuffix}` : t.boost2x;
  const vipLabel = adsAvailable ? `${t.vipResident} ${t.adSuffix}` : t.vipResident;
  const vipDisabled = adPending || !vipResidentAvailable;
  const vipButtonLabel = adPending ? t.adPending : vipResidentAvailable ? vipLabel : t.vipCooldown;

  return (
    <section className="panel" aria-labelledby="bonus-panel-title">
      <h2 id="bonus-panel-title">{t.bonuses}</h2>
      {!adsAvailable && (
        <p className="panel-copy">{t.adBonusesHint}</p>
      )}
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
      <div className="button-stack">
        <button
          type="button"
          onClick={onIncomeBoost}
          disabled={adPending}
          title={t.boostTooltip}
        >
          <Sparkles aria-hidden="true" size={16} />
          {adPending ? t.adPending : boostLabel}
        </button>
        <button
          type="button"
          onClick={onVipResident}
          disabled={vipDisabled}
          title={t.vipTooltip}
        >
          <Star aria-hidden="true" size={16} />
          {vipButtonLabel}
        </button>
      </div>
    </section>
  );
}
