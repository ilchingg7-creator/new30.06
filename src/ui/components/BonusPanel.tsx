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
  const boostLabel = adsAvailable ? `${t.boost2x} (реклама)` : t.boost2x;
  const vipLabel = adsAvailable ? `${t.vipResident} (реклама)` : t.vipResident;

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
          title="Удваивает доход станции на 5 минут. На Yandex Games требует просмотра рекламы."
        >
          <Sparkles aria-hidden="true" size={16} />
          {adPending ? t.adPending : boostLabel}
        </button>
        <button
          type="button"
          onClick={onVipResident}
          disabled={adPending}
          title="Заселяет VIP-жильца: x2 доход на 10 минут. На Yandex Games требует просмотра рекламы."
        >
          <Star aria-hidden="true" size={16} />
          {adPending ? t.adPending : vipLabel}
        </button>
      </div>
    </section>
  );
}
