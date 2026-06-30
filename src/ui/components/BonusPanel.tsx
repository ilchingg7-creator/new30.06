'use client';

import { Sparkles, Star } from 'lucide-react';
import type { Translation } from '../../platform/i18n';

interface BonusPanelProps {
  onIncomeBoost(): void;
  onVipResident(): void;
  adsAvailable?: boolean;
  adPending?: boolean;
  t: Translation;
}

export function BonusPanel({
  onIncomeBoost,
  onVipResident,
  adsAvailable = false,
  adPending = false,
  t
}: BonusPanelProps) {
  const boostLabel = adsAvailable ? `${t.boost2x} ${t.adSuffix}` : t.boost2x;
  const vipLabel = adsAvailable ? `${t.vipResident} ${t.adSuffix}` : t.vipResident;

  return (
    <section className="panel" aria-labelledby="bonus-panel-title">
      <h2 id="bonus-panel-title">{t.bonuses}</h2>
      {!adsAvailable && (
        <p className="panel-copy">{t.adBonusesHint}</p>
      )}
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
          disabled={adPending}
          title={t.vipTooltip}
        >
          <Star aria-hidden="true" size={16} />
          {adPending ? t.adPending : vipLabel}
        </button>
      </div>
    </section>
  );
}
