'use client';

import { Sparkles, Star } from 'lucide-react';
import type { Translation } from '../../platform/i18n';

interface BonusPanelProps {
  onIncomeBoost(): void;
  onVipResident(): void;
  adsAvailable?: boolean;
  adPending?: boolean;
  vipResidentAvailable?: boolean;
  t: Translation;
}

export function BonusPanel({
  onIncomeBoost,
  onVipResident,
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
