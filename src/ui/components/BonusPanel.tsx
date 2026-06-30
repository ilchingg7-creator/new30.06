'use client';

import { Sparkles, Star } from 'lucide-react';

interface BonusPanelProps {
  onIncomeBoost(): void;
  onVipResident(): void;
  adsAvailable?: boolean;
  adPending?: boolean;
}

export function BonusPanel({
  onIncomeBoost,
  onVipResident,
  adsAvailable = false,
  adPending = false
}: BonusPanelProps) {
  const boostLabel = adsAvailable ? 'x2 аренда (реклама)' : 'x2 аренда';
  const vipLabel = adsAvailable ? 'VIP-жилец (реклама)' : 'VIP-жилец';

  return (
    <section className="panel" aria-labelledby="bonus-panel-title">
      <h2 id="bonus-panel-title">Бонусы</h2>
      {!adsAvailable && (
        <p className="panel-copy">
          Рекламные бонусы доступны на Yandex Games. Локально бонусы включаются сразу.
        </p>
      )}
      <div className="button-stack">
        <button
          type="button"
          onClick={onIncomeBoost}
          disabled={adPending}
          title="Удваивает доход станции на 5 минут. На Yandex Games требует просмотра рекламы."
        >
          <Sparkles aria-hidden="true" size={16} />
          {adPending ? 'Реклама...' : boostLabel}
        </button>
        <button
          type="button"
          onClick={onVipResident}
          disabled={adPending}
          title="Заселяет VIP-жильца: x2 доход на 10 минут. На Yandex Games требует просмотра рекламы."
        >
          <Star aria-hidden="true" size={16} />
          {adPending ? 'Реклама...' : vipLabel}
        </button>
      </div>
    </section>
  );
}
