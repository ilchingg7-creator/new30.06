'use client';

import { useEffect, useState } from 'react';
import { RotateCcw, Sparkles, Star } from 'lucide-react';
import type { Translation } from '../../platform/i18n';
import type { CelebrationInfo } from '../useGameState';

interface CelebrationOverlayProps {
  celebration: CelebrationInfo;
  onDismiss(): void;
  t: Translation;
}

function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_match, key: string) => {
    return key in vars ? String(vars[key]) : `{${key}}`;
  });
}

export function CelebrationOverlay({ celebration, onDismiss, t }: CelebrationOverlayProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = window.setTimeout(onDismiss, 5000);
    return () => window.clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={visible ? 'celebration-overlay visible' : 'celebration-overlay'}
      role="dialog"
      aria-modal="true"
      aria-labelledby="celebration-title"
      onClick={onDismiss}
    >
      <div className="celebration-confetti" aria-hidden="true">
        {Array.from({ length: 24 }, (_, i) => (
          <span
            key={i}
            className={`confetti-piece confetti-${i % 4}`}
            style={{
              left: `${(i * 4.17 + 2)%100}%`,
              animationDelay: `${(i % 6) * 0.12}s`,
              animationDuration: `${1.8 + (i % 4) * 0.4}s`
            }}
          />
        ))}
      </div>
      <div className="celebration-card" onClick={(e) => e.stopPropagation()}>
        <div className="celebration-icon-row">
          <Sparkles aria-hidden="true" size={20} className="celebration-sparkle sparkle-left" />
          <RotateCcw aria-hidden="true" size={36} className="celebration-main-icon" />
          <Sparkles aria-hidden="true" size={20} className="celebration-sparkle sparkle-right" />
        </div>
        <h2 id="celebration-title" className="celebration-title">{t.celebrationTitle}</h2>
        <div className="celebration-stats">
          <div className="celebration-stat">
            <Star aria-hidden="true" size={14} />
            <span>{interpolate(t.celebrationCycle, { cycle: celebration.cycle })}</span>
          </div>
          <div className="celebration-stat highlight">
            <Star aria-hidden="true" size={14} />
            <span>{interpolate(t.celebrationReputation, { amount: celebration.reputationGained })}</span>
          </div>
        </div>
        <button type="button" className="celebration-btn" onClick={onDismiss}>
          {t.celebrationDismiss}
        </button>
      </div>
    </div>
  );
}
