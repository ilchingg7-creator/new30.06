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
    <header className="top-bar" aria-label={t.stationResources}>
      <div className="metric-pulse" key={Math.floor(gameState.credits)}>
        <span>{t.kopeks}</span>
        <strong>{formatCredits(gameState.credits)}</strong>
      </div>
      <div>
        <span>{t.income}</span>
        <strong>{formatRate(incomePerSecond)}</strong>
      </div>
      <div className="metric-pulse" key={`comfort-${gameState.comfort}`}>
        <span>{t.comfort}</span>
        <strong>{gameState.comfort}</strong>
      </div>
      <div className="metric-pulse" key={`rep-${gameState.reputation}`}>
        <span>{t.reputation}</span>
        <strong>{gameState.reputation}</strong>
      </div>
    </header>
  );
}
