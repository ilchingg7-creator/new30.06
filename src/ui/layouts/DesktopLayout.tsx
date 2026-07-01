import type { UseGameStateResult } from '../useGameState';
import type { Translation } from '../../platform/i18n';
import { getStationGuidance } from '../../game/stationDirector';
import { AchievementsPanel } from '../components/AchievementsPanel';
import { BonusPanel } from '../components/BonusPanel';
import { CommunalDutyPanel } from '../components/CommunalDutyPanel';
import { CosmeticsPanel } from '../components/CosmeticsPanel';
import { GoalPanel } from '../components/GoalPanel';
import { ModuleList } from '../components/ModuleList';
import { PixiStationScene } from '../components/PixiStationScene';
import { PrestigePanel } from '../components/PrestigePanel';
import { RoomConditionBar } from '../components/RoomConditionBar';
import { PrestigeUpgradesPanel } from '../components/PrestigeUpgradesPanel';
import { ResidentCollectionBook } from '../components/ResidentCollectionBook';
import { ResidentsPanel } from '../components/ResidentsPanel';
import { RoomSelector } from '../components/RoomSelector';
import { StationTaskPanel } from '../components/StationTaskPanel';
import { StatsPanel } from '../components/StatsPanel';
import { TopBar } from '../components/TopBar';

interface DesktopLayoutProps {
  game: UseGameStateResult;
  t: Translation;
}

export function DesktopLayout({ game, t }: DesktopLayoutProps) {
  const stationGuidance = getStationGuidance({
    state: game.gameState,
    incomePerSecond: game.incomePerSecond,
    hasPendingDailyReward: Boolean(game.dailyReward)
  });

  return (
    <section className="desktop-layout" aria-label="Desktop layout">
      <TopBar gameState={game.gameState} incomePerSecond={game.incomePerSecond} t={t} />
      <ModuleList gameState={game.gameState} onBuyLevel={game.buyLevel} t={t} />
      <div className="station-stack">
        <StationTaskPanel
          guidance={stationGuidance}
          onSelectRoom={game.selectRoom}
          onRenovate={game.renovateOrbit}
          t={t}
        />
        <CommunalDutyPanel
          gameState={game.gameState}
          onAssign={game.assignCommunalDuty}
          onClaim={game.claimCommunalDuty}
          t={t}
        />
        <RoomSelector
          gameState={game.gameState}
          selectedRoomId={game.selectedRoomId}
          onSelectRoom={game.selectRoom}
          t={t}
        />
        <PixiStationScene gameState={game.gameState} selectedRoomId={game.selectedRoomId} onRoomClick={game.clickRoom} ariaLabel={t.stationView} />
        <RoomConditionBar gameState={game.gameState} roomId={game.selectedRoomId} t={t} />
      </div>
      <aside className="side-panel">
        <GoalPanel gameState={game.gameState} t={t} />
        <ResidentsPanel gameState={game.gameState} t={t} />
        <ResidentCollectionBook gameState={game.gameState} t={t} />
        <BonusPanel
          onIncomeBoost={game.activateIncomeBoost}
          onVipResident={game.activateVipResident}
          adsAvailable={game.adsAvailable}
          adPending={game.adPending}
          t={t}
        />
        <PrestigePanel reputation={game.gameState.reputation} onRenovate={game.renovateOrbit} t={t} />
        <PrestigeUpgradesPanel gameState={game.gameState} onBuyUpgrade={game.buyPrestigeUpgrade} t={t} />
        <CosmeticsPanel
          windowLightColor={game.gameState.windowLightColor ?? 'amber'}
          onWindowLightColor={game.setWindowLightColor}
          t={t}
        />
        <AchievementsPanel gameState={game.gameState} t={t} />
        <StatsPanel gameState={game.gameState} t={t} />
      </aside>
    </section>
  );
}
