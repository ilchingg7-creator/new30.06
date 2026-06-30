import { Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCredits, formatDuration } from '../../game/format';

interface OfflineRewardDialogProps {
  seconds: number;
  credits: number;
  onCollect(): void;
  onDouble?(): void;
  adsAvailable?: boolean;
  adPending?: boolean;
}

export function OfflineRewardDialog({
  seconds,
  credits,
  onCollect,
  onDouble,
  adsAvailable = false,
  adPending = false
}: OfflineRewardDialogProps) {
  const showDouble = Boolean(onDouble) && adsAvailable;

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
        aria-labelledby="offline-reward-title"
        initial={{ scale: 0.92, y: 12, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      >
        <h2 id="offline-reward-title">Станция поработала без вас</h2>
        <dl className="dialog-stats">
          <div>
            <dt>Время</dt>
            <dd>{formatDuration(seconds)}</dd>
          </div>
          <div>
            <dt>Кредиты</dt>
            <dd>{formatCredits(credits)}</dd>
          </div>
        </dl>
        {showDouble && (
          <motion.button
            type="button"
            className="dialog-double"
            onClick={onDouble}
            disabled={adPending}
            whileTap={{ scale: 0.96 }}
          >
            <Gift aria-hidden="true" size={16} />
            {adPending ? 'Реклама...' : 'Удвоить за рекламу'}
          </motion.button>
        )}
        <motion.button
          type="button"
          onClick={onCollect}
          disabled={adPending}
          whileTap={{ scale: 0.96 }}
        >
          Забрать
        </motion.button>
      </motion.section>
    </motion.div>
  );
}
