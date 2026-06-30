import { Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { calculateModuleCost } from '../../game/economy';
import { formatCredits } from '../../game/format';
import { modules } from '../../game/content/modules';
import type { GameState, ModuleId } from '../../game/types';

interface ModuleListProps {
  gameState: GameState;
  onBuyLevel(moduleId: ModuleId): void;
}

export function ModuleList({ gameState, onBuyLevel }: ModuleListProps) {
  return (
    <section className="panel module-panel" aria-labelledby="module-panel-title">
      <h2 id="module-panel-title">Комнаты</h2>
      <ul className="component-list">
        {modules.map((module) => {
          const level = gameState.moduleLevels[module.id];
          const cost = calculateModuleCost(module.id, gameState);
          const locked = gameState.totalEarnedCredits < module.unlockAtCredits;
          const canBuy = !locked && gameState.credits >= cost;

          return (
            <motion.li
              className="component-card"
              key={module.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
            >
              <div>
                <h3>{module.name}</h3>
                <p>{module.role}</p>
                <span>Уровень {level}</span>
              </div>
              <motion.button
                type="button"
                disabled={!canBuy}
                onClick={() => onBuyLevel(module.id)}
                whileTap={canBuy ? { scale: 0.94 } : undefined}
                whileHover={canBuy ? { scale: 1.02 } : undefined}
              >
                <Home aria-hidden="true" size={16} />
                {locked ? 'Закрыто' : formatCredits(cost)}
              </motion.button>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
