import { Sparkles, Star } from 'lucide-react';

interface BonusPanelProps {
  onIncomeBoost(): void;
  onVipResident(): void;
}

export function BonusPanel({ onIncomeBoost, onVipResident }: BonusPanelProps) {
  return (
    <section className="panel" aria-labelledby="bonus-panel-title">
      <h2 id="bonus-panel-title">Бонусы</h2>
      <div className="button-stack">
        <button type="button" onClick={onIncomeBoost}>
          <Sparkles aria-hidden="true" size={16} />
          x2 аренда
        </button>
        <button type="button" onClick={onVipResident}>
          <Star aria-hidden="true" size={16} />
          VIP-жилец
        </button>
      </div>
    </section>
  );
}
