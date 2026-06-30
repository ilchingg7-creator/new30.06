import { CalendarHeart } from 'lucide-react';
import { motion } from 'framer-motion';
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
    <motion.div
      className="dialog-backdrop"
      role="presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
    >
      <motion.section
        className="dialog-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="daily-login-title"
        initial={{ scale: 0.92, y: 12, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
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
            <motion.span
              key={index}
              className={index < effectiveStreak ? 'daily-dot active' : 'daily-dot'}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05, type: 'spring', stiffness: 400, damping: 20 }}
            />
          ))}
        </div>
        <motion.button
          type="button"
          onClick={onCollect}
          whileTap={{ scale: 0.96 }}
        >
          Забрать
        </motion.button>
      </motion.section>
    </motion.div>
  );
}
