import { RotateCcw } from 'lucide-react';

interface PrestigePanelProps {
  reputation: number;
  onRenovate(): void;
}

export function PrestigePanel({ reputation, onRenovate }: PrestigePanelProps) {
  return (
    <section className="panel" aria-labelledby="prestige-panel-title">
      <h2 id="prestige-panel-title">Реновация орбиты</h2>
      <p className="panel-copy">Репутация станции: {reputation}</p>
      <button type="button" onClick={onRenovate}>
        <RotateCcw aria-hidden="true" size={16} />
        Реновировать
      </button>
    </section>
  );
}
