import { formatCredits, formatRate } from '../../game/format';
import type { GameState } from '../../game/types';

interface TopBarProps {
  gameState: GameState;
  incomePerSecond: number;
}

export function TopBar({ gameState, incomePerSecond }: TopBarProps) {
  return (
    <header className="top-bar" aria-label="Ресурсы станции">
      <div>
        <span>Кредиты</span>
        <strong>{formatCredits(gameState.credits)}</strong>
      </div>
      <div>
        <span>Доход</span>
        <strong>{formatRate(incomePerSecond)}</strong>
      </div>
      <div>
        <span>Комфорт</span>
        <strong>{gameState.comfort}</strong>
      </div>
      <div>
        <span>Репутация</span>
        <strong>{gameState.reputation}</strong>
      </div>
    </header>
  );
}
