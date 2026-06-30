import { calculateModuleCost } from './game/economy';
import { formatCredits, formatRate } from './game/format';
import { modules } from './game/content/modules';
import { useGameState } from './ui/useGameState';

export function App() {
  const game = useGameState();

  return (
    <main className="app-shell">
      <section className="game-panel" aria-label="Состояние станции">
        <header className="game-header">
          <p className="eyebrow">Retro Soviet Space Cozy</p>
          <h1>Космическая коммуналка</h1>
        </header>

        <dl className="resource-row">
          <div>
            <dt>Кредиты</dt>
            <dd>{formatCredits(game.gameState.credits)}</dd>
          </div>
          <div>
            <dt>Доход</dt>
            <dd>{formatRate(game.incomePerSecond)}</dd>
          </div>
          <div>
            <dt>Комфорт</dt>
            <dd>{game.gameState.comfort}</dd>
          </div>
        </dl>

        <section className="module-section" aria-labelledby="module-list-title">
          <h2 id="module-list-title">Комнаты</h2>
          <ul className="module-list">
            {modules.map((module) => {
              const cost = calculateModuleCost(module.id, game.gameState);
              const level = game.gameState.moduleLevels[module.id];
              const locked = game.gameState.totalEarnedCredits < module.unlockAtCredits;
              const canBuy = !locked && game.gameState.credits >= cost;

              return (
                <li className="module-item" key={module.id}>
                  <div>
                    <h3>{module.name}</h3>
                    <p>{module.role}</p>
                    <span>Уровень {level}</span>
                  </div>
                  <button type="button" disabled={!canBuy} onClick={() => game.buyLevel(module.id)}>
                    {locked ? 'Закрыто' : `Купить ${formatCredits(cost)}`}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </section>
    </main>
  );
}
