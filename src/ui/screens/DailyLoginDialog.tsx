import { CalendarHeart } from 'lucide-react';
import { formatCredits } from '../../game/format';
import type { Translation } from '../../platform/i18n';

interface DailyLoginDialogProps {
  streak: number;
  credits: number;
  onCollect(): void;
  t: Translation;
}

const MAX_STREAK = 7;

export function DailyLoginDialog({ streak, credits, onCollect, t }: DailyLoginDialogProps) {
  const effectiveStreak = ((streak - 1) % MAX_STREAK) + 1;

  return (
    <div className="dialog-backdrop" role="presentation">
      <section className="dialog-panel" role="dialog" aria-modal="true" aria-labelledby="daily-login-title">
        <h2 id="daily-login-title">{t.dailyLoginTitle}</h2>
        <p className="panel-copy">
          <CalendarHeart aria-hidden="true" size={16} style={{ verticalAlign: 'middle' }} /> {t.day} {effectiveStreak} {t.of}{' '}
          {MAX_STREAK}
        </p>
        <p className="dialog-stats-copy">
          {t.dailyRewardText} <strong>{formatCredits(credits)}</strong> копеек.
        </p>
        <div className="daily-streak-dots" aria-hidden="true">
          {Array.from({ length: MAX_STREAK }, (_, index) => (
            <span key={index} className={index < effectiveStreak ? 'daily-dot active' : 'daily-dot'} />
          ))}
        </div>
        <button type="button" onClick={onCollect}>
          {t.collect}
        </button>
      </section>
    </div>
  );
}
