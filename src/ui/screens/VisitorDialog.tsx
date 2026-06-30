'use client';

import { motion } from 'framer-motion';
import { UserRound } from 'lucide-react';
import { formatCredits } from '../../game/format';
import type { VisitorRequest } from '../../game/types';

interface VisitorDialogProps {
  visitor: VisitorRequest;
  canAfford: boolean;
  onAccept(): void;
  onDecline(): void;
}

export function VisitorDialog({ visitor, canAfford, onAccept, onDecline }: VisitorDialogProps) {
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
        aria-labelledby="visitor-title"
        initial={{ scale: 0.92, y: 12, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      >
        <h2 id="visitor-title">
          <UserRound aria-hidden="true" size={18} style={{ verticalAlign: 'middle' }} /> {visitor.name}
        </h2>
        <p className="dialog-stats-copy">{visitor.flavor}</p>
        <dl className="dialog-stats">
          <div>
            <dt>Цена</dt>
            <dd>{formatCredits(visitor.cost)}</dd>
          </div>
          <div>
            <dt>Награда</dt>
            <dd>+{visitor.rewardComfort} комфорт</dd>
          </div>
        </dl>
        <div className="visitor-actions">
          <motion.button
            type="button"
            className="dialog-double"
            onClick={onAccept}
            disabled={!canAfford}
            whileTap={canAfford ? { scale: 0.96 } : undefined}
          >
            Принять
          </motion.button>
          <motion.button
            type="button"
            onClick={onDecline}
            whileTap={{ scale: 0.96 }}
          >
            Отказать
          </motion.button>
        </div>
      </motion.section>
    </motion.div>
  );
}
