'use client';

import { RotateCcw } from 'lucide-react';
import type { Translation } from '../../platform/i18n';

interface PrestigePanelProps {
  reputation: number;
  onRenovate(): void;
  t: Translation;
}

export function PrestigePanel({ reputation, onRenovate, t }: PrestigePanelProps) {
  return (
    <section className="panel" aria-labelledby="prestige-panel-title">
      <h2 id="prestige-panel-title">{t.renovationTitle}</h2>
      <p className="panel-copy">{t.reputationStation}: {reputation}</p>
      <button
        type="button"
        onClick={onRenovate}
        title={t.renovateTooltip}
      >
        <RotateCcw aria-hidden="true" size={16} />
        {t.renovate}
      </button>
    </section>
  );
}
