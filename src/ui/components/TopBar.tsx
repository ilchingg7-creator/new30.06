import { formatCredits, formatRate } from '../../game/format';
import type { GameState } from '../../game/types';
import type { Translation } from '../../platform/i18n';
import type { SaveStatus } from '../useGameState';

interface TopBarProps {
  gameState: GameState;
  incomePerSecond: number;
  variant?: 'default' | 'compact';
  t: Translation;
  saveStatus?: SaveStatus;
}

export function TopBar({ gameState, incomePerSecond, variant = 'default', t }: TopBarProps) {
  return (
    <header className={variant === 'compact' ? 'top-bar compact' : 'top-bar'} aria-label={t.stationResources}>
      <div className="metric-pulse" key={Math.floor(gameState.credits)}>
        <span>{t.kopeks}</span>
        <strong>{formatCredits(gameState.credits)}</strong>
      </div>
      <div>
        <span>{t.income}</span>
        <strong>{formatRate(incomePerSecond, t.perSecond)}</strong>
      </div>
      <div className="metric-pulse" key={`comfort-${gameState.comfort}`}>
        <span>{t.comfort}</span>
        <strong>{gameState.comfort} <small className="metric-bonus">+{gameState.comfort}%</small></strong>
      </div>
      <div className="metric-pulse" key={`rep-${gameState.reputation}`}>
        <span>{t.reputation}</span>
        <strong>{gameState.reputation}</strong>
      </div>
    </header>
  );
}
