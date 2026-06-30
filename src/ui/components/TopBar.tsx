import { motion } from 'framer-motion';
import { formatCredits, formatRate } from '../../game/format';
import type { GameState } from '../../game/types';

interface TopBarProps {
  gameState: GameState;
  incomePerSecond: number;
}

export function TopBar({ gameState, incomePerSecond }: TopBarProps) {
  return (
    <header className="top-bar" aria-label="Ресурсы станции">
      <motion.div
        key={Math.floor(gameState.credits)}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 0.25 }}
      >
        <span>Кредиты</span>
        <strong>{formatCredits(gameState.credits)}</strong>
      </motion.div>
      <div>
        <span>Доход</span>
        <strong>{formatRate(incomePerSecond)}</strong>
      </div>
      <motion.div
        key={`comfort-${gameState.comfort}`}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 0.3 }}
      >
        <span>Комфорт</span>
        <strong>{gameState.comfort}</strong>
      </motion.div>
      <motion.div
        key={`rep-${gameState.reputation}`}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 0.3 }}
      >
        <span>Репутация</span>
        <strong>{gameState.reputation}</strong>
      </motion.div>
    </header>
  );
}
