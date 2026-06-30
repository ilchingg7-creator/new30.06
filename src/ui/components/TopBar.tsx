import { motion } from 'framer-motion';
import { formatCredits, formatRate } from '../../game/format';
import type { GameState } from '../../game/types';
import type { Translation } from '../../platform/i18n';

interface TopBarProps {
  gameState: GameState;
  incomePerSecond: number;
  t: Translation;
}

export function TopBar({ gameState, incomePerSecond, t }: TopBarProps) {
  return (
    <header className="top-bar" aria-label="Ресурсы станции">
      <motion.div
        key={Math.floor(gameState.credits)}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 0.25 }}
      >
        <span>{t.kopeks}</span>
        <strong>{formatCredits(gameState.credits)}</strong>
      </motion.div>
      <div>
        <span>{t.income}</span>
        <strong>{formatRate(incomePerSecond)}</strong>
      </div>
      <motion.div
        key={`comfort-${gameState.comfort}`}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 0.3 }}
      >
        <span>{t.comfort}</span>
        <strong>{gameState.comfort}</strong>
      </motion.div>
      <motion.div
        key={`rep-${gameState.reputation}`}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 0.3 }}
      >
        <span>{t.reputation}</span>
        <strong>{gameState.reputation}</strong>
      </motion.div>
    </header>
  );
}
