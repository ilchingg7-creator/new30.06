import { Home } from 'lucide-react';
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
            <li className="component-card" key={module.id}>
              <div>
                <h3>{module.name}</h3>
                <p>{module.role}</p>
                <span>Уровень {level}</span>
              </div>
              <button type="button" disabled={!canBuy} onClick={() => onBuyLevel(module.id)}>
                <Home aria-hidden="true" size={16} />
                {locked ? 'Закрыто' : formatCredits(cost)}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
