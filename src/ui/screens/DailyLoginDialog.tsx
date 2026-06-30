import { CalendarHeart } from 'lucide-react';
import { formatCredits } from '../../game/format';

interface DailyLoginDialogProps {
  streak: number;
  credits: number;
  onCollect(): void;
}

const MAX_STREAK = 7;

export function DailyLoginDialog({ streak, credits, onCollect }: DailyLoginDialogProps) {
  const effectiveStreak = ((streak - 1) % MAX_STREAK) + 1;

  return (
    <div className="dialog-backdrop" role="presentation">
      <section
        className="dialog-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="daily-login-title"
      >
        <h2 id="daily-login-title">Ежедневный вход</h2>
        <p className="panel-copy">
          <CalendarHeart aria-hidden="true" size={16} style={{ verticalAlign: 'middle' }} /> День {effectiveStreak} из {MAX_STREAK}
        </p>
        <p className="dialog-stats-copy">
          Станция благодарит вас за возвращение. Награда: <strong>{formatCredits(credits)}</strong> кредитов.
        </p>
        <div className="daily-streak-dots" aria-hidden="true">
          {Array.from({ length: MAX_STREAK }, (_, index) => (
            <span key={index} className={index < effectiveStreak ? 'daily-dot active' : 'daily-dot'} />
          ))}
        </div>
        <button type="button" onClick={onCollect}>
          Забрать
        </button>
      </section>
    </div>
  );
}
