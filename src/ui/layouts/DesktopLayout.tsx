import type { UseGameStateResult } from '../useGameState';
import type { Translation } from '../../platform/i18n';
import { lazy, Suspense } from 'react';
import { getStationGuidance } from '../../game/stationDirector';
import { BonusPanel } from '../components/BonusPanel';
import { CommunalDutyPanel } from '../components/CommunalDutyPanel';
import { GoalPanel } from '../components/GoalPanel';
import { LastActionFeedbackPanel } from '../components/LastActionFeedbackPanel';
import { ModuleList } from '../components/ModuleList';
import { PrestigePanel } from '../components/PrestigePanel';
import { RoomConditionBar } from '../components/RoomConditionBar';
import { PrestigeUpgradesPanel } from '../components/PrestigeUpgradesPanel';
import { ResidentsPanel } from '../components/ResidentsPanel';
import { RoomSelector } from '../components/RoomSelector';
import { StationTaskPanel } from '../components/StationTaskPanel';
import { StationIncidentJournal } from '../components/StationIncidentJournal';
import { StatsPanel } from '../components/StatsPanel';
import { TopBar } from '../components/TopBar';
import { WeeklyRepairPanel } from '../components/WeeklyRepairPanel';
import { LeaderboardPanel } from '../components/LeaderboardPanel';

const PixiStationScene = lazy(() => import('../components/PixiStationScene').then((m) => ({ default: m.PixiStationScene })));
const ResidentCollectionBook = lazy(() => import('../components/ResidentCollectionBook').then((m) => ({ default: m.ResidentCollectionBook })));
const AchievementsPanel = lazy(() => import('../components/AchievementsPanel').then((m) => ({ default: m.AchievementsPanel })));

function SceneFallback() {
  return (
    <div className="station-view station-view-loading" aria-hidden="true">
      <div className="station-view-spinner" />
    </div>
  );
}

function PanelFallback() {
  return (
    <div className="panel-skeleton" aria-hidden="true">
      <div className="panel-skeleton-bar" />
      <div className="panel-skeleton-bar" />
      <div className="panel-skeleton-bar" />
    </div>
  );
}

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
      <div className="desktop-top-area" data-tour="stats">
        <TopBar gameState={game.gameState} incomePerSecond={game.incomePerSecond} t={t} saveStatus={game.saveStatus} />
      </div>
      <div className="desktop-modules-area" data-tour="modules">
        <ModuleList gameState={game.gameState} onBuyLevel={game.buyLevel} t={t} />
      </div>
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
        <div data-tour="station-view">
          <Suspense fallback={<SceneFallback />}>
            <PixiStationScene
              gameState={game.gameState}
              selectedRoomId={game.selectedRoomId}
              onRoomClick={game.clickRoom}
              onTenantCatClick={game.triggerCatIncident}
              ariaLabel={t.stationView}
            />
          </Suspense>
        </div>
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
        <div data-tour="goals">
          <GoalPanel gameState={game.gameState} t={t} />
        </div>
        <Suspense fallback={<PanelFallback />}>
          <ResidentCollectionBook gameState={game.gameState} t={t} />
        </Suspense>
        <div data-tour="bonuses">
          <BonusPanel
            onIncomeBoost={game.activateIncomeBoost}
            onVipResident={game.activateVipResident}
            onPurchaseStrangeCat={game.purchaseStrangeCat}
            strangeCatProduct={game.strangeCatProduct}
            strangeCatPurchaseStatus={game.strangeCatPurchaseStatus}
            adsAvailable={game.adsAvailable}
            adPending={game.adPending}
            vipResidentAvailable={game.vipResidentAvailable}
            t={t}
          />
        </div>
        <PrestigePanel gameState={game.gameState} onRenovate={game.renovateOrbit} t={t} />
        <PrestigeUpgradesPanel gameState={game.gameState} onBuyUpgrade={game.buyPrestigeUpgrade} t={t} />
        <Suspense fallback={<PanelFallback />}>
          <AchievementsPanel gameState={game.gameState} t={t} />
        </Suspense>
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
