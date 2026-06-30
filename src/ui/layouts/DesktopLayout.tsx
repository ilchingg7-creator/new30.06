import type { UseGameStateResult } from '../useGameState';
import { BonusPanel } from '../components/BonusPanel';
import { GoalPanel } from '../components/GoalPanel';
import { ModuleList } from '../components/ModuleList';
import { PixiStationScene } from '../components/PixiStationScene';
import { PrestigePanel } from '../components/PrestigePanel';
import { TopBar } from '../components/TopBar';

interface DesktopLayoutProps {
  game: UseGameStateResult;
}

export function DesktopLayout({ game }: DesktopLayoutProps) {
  return (
    <section className="desktop-layout" aria-label="Desktop layout">
      <TopBar gameState={game.gameState} incomePerSecond={game.incomePerSecond} />
      <ModuleList gameState={game.gameState} onBuyLevel={game.buyLevel} />
      <PixiStationScene gameState={game.gameState} />
      <aside className="side-panel">
        <GoalPanel gameState={game.gameState} />
        <BonusPanel onIncomeBoost={game.activateIncomeBoost} onVipResident={game.activateVipResident} />
        <PrestigePanel reputation={game.gameState.reputation} onRenovate={game.renovateOrbit} />
      </aside>
    </section>
  );
}
