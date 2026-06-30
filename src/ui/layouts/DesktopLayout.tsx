import type { UseGameStateResult } from '../useGameState';
import { BonusPanel } from '../components/BonusPanel';
import { GoalPanel } from '../components/GoalPanel';
import { ModuleList } from '../components/ModuleList';
import { PixiStationScene } from '../components/PixiStationScene';
import { PrestigePanel } from '../components/PrestigePanel';
import { RoomSelector } from '../components/RoomSelector';
import { TopBar } from '../components/TopBar';

interface DesktopLayoutProps {
  game: UseGameStateResult;
}

export function DesktopLayout({ game }: DesktopLayoutProps) {
  return (
    <section className="desktop-layout" aria-label="Desktop layout">
      <TopBar gameState={game.gameState} incomePerSecond={game.incomePerSecond} />
      <ModuleList gameState={game.gameState} onBuyLevel={game.buyLevel} />
      <div className="station-stack">
        <RoomSelector
          gameState={game.gameState}
          selectedRoomId={game.selectedRoomId}
          onSelectRoom={game.selectRoom}
        />
        <PixiStationScene gameState={game.gameState} selectedRoomId={game.selectedRoomId} />
      </div>
      <aside className="side-panel">
        <GoalPanel gameState={game.gameState} />
        <BonusPanel
          onIncomeBoost={game.activateIncomeBoost}
          onVipResident={game.activateVipResident}
          adsAvailable={game.adsAvailable}
          adPending={game.adPending}
        />
        <PrestigePanel reputation={game.gameState.reputation} onRenovate={game.renovateOrbit} />
      </aside>
    </section>
  );
}
