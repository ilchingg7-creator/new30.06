'use client';

import { Palette } from 'lucide-react';
import type { WindowLightColor } from '../../game/types';
import type { Translation } from '../../platform/i18n';

interface CosmeticsPanelProps {
  windowLightColor: WindowLightColor;
  onWindowLightColor(color: WindowLightColor): void;
  t: Translation;
}

function buildColorOptions(t: Translation): Array<{ id: WindowLightColor; label: string; swatch: string }> {
  return [
    { id: 'amber', label: t.amber, swatch: 'var(--color-lamp-amber)' },
    { id: 'green', label: t.green, swatch: 'var(--color-enamel-green)' },
    { id: 'red', label: t.red, swatch: 'var(--color-signal-red)' },
    { id: 'blue', label: t.blue, swatch: 'var(--color-utility-blue)' }
  ];
}

export function CosmeticsPanel({ windowLightColor, onWindowLightColor, t }: CosmeticsPanelProps) {
  const colorOptions = buildColorOptions(t);

  return (
    <section className="panel" aria-labelledby="cosmetics-panel-title">
      <h2 id="cosmetics-panel-title">{t.cosmeticsTitle}</h2>
      <p className="panel-copy">{t.windowLightColor}</p>
      <div className="cosmetics-grid">
        {colorOptions.map((option) => (
          <button
            type="button"
            key={option.id}
            className={windowLightColor === option.id ? 'cosmetics-swatch active' : 'cosmetics-swatch'}
            onClick={() => onWindowLightColor(option.id)}
            aria-pressed={windowLightColor === option.id}
          >
            <span className="cosmetics-dot" style={{ background: option.swatch }} aria-hidden="true" />
            <Palette aria-hidden="true" size={14} />
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
