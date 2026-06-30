'use client';

import { Palette } from 'lucide-react';
import type { WindowLightColor } from '../../game/types';

interface CosmeticsPanelProps {
  windowLightColor: WindowLightColor;
  onWindowLightColor(color: WindowLightColor): void;
}

const colorOptions: Array<{ id: WindowLightColor; label: string; swatch: string }> = [
  { id: 'amber', label: 'Янтарный', swatch: 'var(--color-lamp-amber)' },
  { id: 'green', label: 'Эмалевый', swatch: 'var(--color-enamel-green)' },
  { id: 'red', label: 'Сигнальный', swatch: 'var(--color-signal-red)' },
  { id: 'blue', label: 'Сервисный', swatch: 'var(--color-utility-blue)' }
];

export function CosmeticsPanel({ windowLightColor, onWindowLightColor }: CosmeticsPanelProps) {
  return (
    <section className="panel" aria-labelledby="cosmetics-panel-title">
      <h2 id="cosmetics-panel-title">Косметика станции</h2>
      <p className="panel-copy">Цвет света в окнах</p>
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
