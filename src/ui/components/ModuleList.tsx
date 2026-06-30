import { Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { calculateModuleCost, calculateIncomePerSecond } from '../../game/economy';
import { formatCredits, formatRate } from '../../game/format';
import { modules } from '../../game/content/modules';
import type { GameState, ModuleId } from '../../game/types';

interface ModuleListProps {
  gameState: GameState;
  onBuyLevel(moduleId: ModuleId): void;
}

function getNextMilestone(level: number): { level: number; multiplier: number } | null {
  const milestones = [
    { level: 10, multiplier: 2 },
    { level: 25, multiplier: 2 },
    { level: 50, multiplier: 3 },
    { level: 100, multiplier: 4 }
  ];

  return milestones.find((milestone) => level < milestone.level) ?? null;
}

function buildModuleTooltip(moduleId: ModuleId, state: GameState): string {
  const module = modules.find((item) => item.id === moduleId);
  const level = state.moduleLevels[moduleId];
  const cost = calculateModuleCost(moduleId, state);
  const income = calculateIncomePerSecond(state);
  const milestone = getNextMilestone(level);

  const lines = [
    `Уровень: ${level}`,
    `Цена следующего: ${formatCredits(cost)} кредитов`,
    `Текущий доход станции: ${formatRate(income)}`
  ];

  if (module?.comfortBonus) {
    lines.push(`Комфорт при открытии: +${module.comfortBonus}`);
  }

  if (milestone) {
    lines.push(`Следующий milestone: ур. ${milestone.level} (x${milestone.multiplier})`);
  }

  return lines.join('\n');
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
              title={buildModuleTooltip(module.id, gameState)}
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
