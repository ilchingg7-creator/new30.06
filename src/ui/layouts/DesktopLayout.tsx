import type { UseGameStateResult } from '../useGameState';
import type { Translation } from '../../platform/i18n';
import { getStationGuidance } from '../../game/stationDirector';
import { AchievementsPanel } from '../components/AchievementsPanel';
import { BonusPanel } from '../components/BonusPanel';
import { CommunalDutyPanel } from '../components/CommunalDutyPanel';
import { GoalPanel } from '../components/GoalPanel';
import { LastActionFeedbackPanel } from '../components/LastActionFeedbackPanel';
import { ModuleList } from '../components/ModuleList';
import { PixiStationScene } from '../components/PixiStationScene';
import { PrestigePanel } from '../components/PrestigePanel';
import { RoomConditionBar } from '../components/RoomConditionBar';
import { PrestigeUpgradesPanel } from '../components/PrestigeUpgradesPanel';
import { ResidentCollectionBook } from '../components/ResidentCollectionBook';
import { ResidentsPanel } from '../components/ResidentsPanel';
import { RoomSelector } from '../components/RoomSelector';
import { StationTaskPanel } from '../components/StationTaskPanel';
import { StationIncidentJournal } from '../components/StationIncidentJournal';
import { StatsPanel } from '../components/StatsPanel';
import { TopBar } from '../components/TopBar';
import { WeeklyRepairPanel } from '../components/WeeklyRepairPanel';
import { LeaderboardPanel } from '../components/LeaderboardPanel';

interface DesktopLayoutProps {
  game: UseGameStateResult;
  t: Translation;
}

export function DesktopLayout({ game, t }: DesktopLayoutProps) {
  const stationGuidance = getStationGuidance({
    state: game.gameState,
    incomePerSecond: game.incomePerSecond,
    hasPendingDailyReward: Boolean(game.dailyReward),
    t
  });

  return (
    <section className="desktop-layout" aria-label="Desktop layout">
      <TopBar gameState={game.gameState} incomePerSecond={game.incomePerSecond} t={t} />
      <ModuleList gameState={game.gameState} onBuyLevel={game.buyLevel} t={t} />
      <div className="station-stack">
        {stationGuidance ? (
          <StationTaskPanel
            guidance={stationGuidance}
            onSelectRoom={game.selectRoom}
            onRenovate={game.renovateOrbit}
            t={t}
          />
        ) : null}
        <LastActionFeedbackPanel gameState={game.gameState} t={t} />
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
        <PixiStationScene
          gameState={game.gameState}
          selectedRoomId={game.selectedRoomId}
          onRoomClick={game.clickRoom}
          onTenantCatClick={game.triggerCatIncident}
          ariaLabel={t.stationView}
        />
        <RoomConditionBar gameState={game.gameState} roomId={game.selectedRoomId} t={t} />
      </div>
      <aside className="side-panel">
        <StationIncidentJournal
          gameState={game.gameState}
          newIncidentCount={game.newIncidentCount}
          onResolve={game.resolveIncident}
          onMarkSeen={game.markIncidentsSeen}
          variant="compact"
          t={t}
        />
        <GoalPanel gameState={game.gameState} t={t} />
        <ResidentCollectionBook gameState={game.gameState} t={t} />
        <BonusPanel
          onIncomeBoost={game.activateIncomeBoost}
          onVipResident={game.activateVipResident}
          adsAvailable={game.adsAvailable}
          adPending={game.adPending}
          t={t}
        />
        <PrestigePanel gameState={game.gameState} onRenovate={game.renovateOrbit} t={t} />
        <PrestigeUpgradesPanel gameState={game.gameState} onBuyUpgrade={game.buyPrestigeUpgrade} t={t} />
        <AchievementsPanel gameState={game.gameState} t={t} />
        <StatsPanel gameState={game.gameState} t={t} />
        <WeeklyRepairPanel gameState={game.gameState} onClaimBonus={game.claimWeeklyBonus} t={t} />
        <LeaderboardPanel
          score={Math.floor(game.gameState.totalEarnedCredits)}
          onRefresh={game.refreshLeaderboard}
          onLoadEntries={game.loadLeaderboardEntries}
          t={t}
        />
      </aside>
    </section>
  );
}
