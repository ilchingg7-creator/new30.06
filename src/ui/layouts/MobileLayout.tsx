import { Gift, Home, RotateCcw, Target } from 'lucide-react';
import { lazy, Suspense, useState } from 'react';
import type { UseGameStateResult } from '../useGameState';
import type { Translation } from '../../platform/i18n';
import { getStationGuidance } from '../../game/stationDirector';
import { AchievementsPanel } from '../components/AchievementsPanel';
import { BonusPanel } from '../components/BonusPanel';
import { CommunalDutyPanel } from '../components/CommunalDutyPanel';
import { GoalPanel } from '../components/GoalPanel';
import { LastActionFeedbackPanel } from '../components/LastActionFeedbackPanel';
import { ModuleList } from '../components/ModuleList';
import { RoomConditionBar } from '../components/RoomConditionBar';
import { PrestigePanel } from '../components/PrestigePanel';
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

const PixiStationScene = lazy(() => import('../components/PixiStationScene').then((m) => ({ default: m.PixiStationScene })));

function SceneFallback() {
  return (
    <div className="station-view station-view-loading" aria-hidden="true">
      <div className="station-view-spinner" />
    </div>
  );
}

type MobileTab = 'modules' | 'goals' | 'bonuses' | 'prestige';

interface MobileLayoutProps {
  game: UseGameStateResult;
  t: Translation;
}

export function MobileLayout({ game, t }: MobileLayoutProps) {
  const [activeTab, setActiveTab] = useState<MobileTab>('modules');
  const stationGuidance = getStationGuidance({
    state: game.gameState,
    incomePerSecond: game.incomePerSecond,
    hasPendingDailyReward: Boolean(game.dailyReward),
    t
  });

  const tabs: Array<{ id: MobileTab; label: string; icon: typeof Home }> = [
    { id: 'modules', label: t.rooms, icon: Home },
    { id: 'goals', label: t.goals, icon: Target },
    { id: 'bonuses', label: t.bonuses, icon: Gift },
    { id: 'prestige', label: t.renovation, icon: RotateCcw }
  ];

  return (
    <section className="mobile-layout" aria-label="Mobile layout">
      <div data-tour="stats">
        <TopBar gameState={game.gameState} incomePerSecond={game.incomePerSecond} variant="compact" t={t} saveStatus={game.saveStatus} />
      </div>
      {stationGuidance ? (
        <StationTaskPanel
          guidance={stationGuidance}
          onSelectRoom={game.selectRoom}
          onRenovate={game.renovateOrbit}
          variant="compact"
          t={t}
        />
      ) : null}
      <LastActionFeedbackPanel gameState={game.gameState} t={t} variant="compact" />
      <CommunalDutyPanel
        gameState={game.gameState}
        onAssign={game.assignCommunalDuty}
        onClaim={game.claimCommunalDuty}
        variant="compact"
        t={t}
      />
      <RoomSelector gameState={game.gameState} selectedRoomId={game.selectedRoomId} onSelectRoom={game.selectRoom} t={t} />
      <div className="mobile-room-area" data-tour="station-view">
        <Suspense fallback={<SceneFallback />}>
          <PixiStationScene
            gameState={game.gameState}
            selectedRoomId={game.selectedRoomId}
            onRoomClick={game.clickRoom}
            onTenantCatClick={game.triggerCatIncident}
            ariaLabel={t.stationView}
          />
        </Suspense>
        <RoomConditionBar gameState={game.gameState} roomId={game.selectedRoomId} t={t} />
      </div>
      <div className="mobile-tab-content">
        {activeTab === 'modules' && (
          <div data-tour="modules">
            <ModuleList gameState={game.gameState} onBuyLevel={game.buyLevel} t={t} />
          </div>
        )}
        {activeTab === 'goals' && (
          <>
            <div data-tour="goals">
              <GoalPanel gameState={game.gameState} t={t} />
            </div>
            <StationIncidentJournal
              gameState={game.gameState}
              newIncidentCount={game.newIncidentCount}
              onResolve={game.resolveIncident}
              onMarkSeen={game.markIncidentsSeen}
              variant="compact"
              t={t}
            />
            <ResidentCollectionBook gameState={game.gameState} t={t} />
            <AchievementsPanel gameState={game.gameState} t={t} />
            <StatsPanel gameState={game.gameState} t={t} />
            <WeeklyRepairPanel gameState={game.gameState} onClaimBonus={game.claimWeeklyBonus} t={t} variant="compact" />
            <LeaderboardPanel
              score={Math.floor(game.gameState.totalEarnedCredits)}
              onRefresh={game.refreshLeaderboard}
              onLoadEntries={game.loadLeaderboardEntries}
              t={t}
              variant="compact"
            />
          </>
        )}
        {activeTab === 'bonuses' && (
          <div data-tour="bonuses">
            <BonusPanel
              onIncomeBoost={game.activateIncomeBoost}
              onVipResident={game.activateVipResident}
              adsAvailable={game.adsAvailable}
              adPending={game.adPending}
              t={t}
            />
          </div>
        )}
        {activeTab === 'prestige' && (
          <>
            <PrestigePanel gameState={game.gameState} onRenovate={game.renovateOrbit} t={t} />
            <PrestigeUpgradesPanel gameState={game.gameState} onBuyUpgrade={game.buyPrestigeUpgrade} t={t} />
          </>
        )}
      </div>
      <nav className="bottom-tabs" aria-label={t.stationSections}>
        {tabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <button
              type="button"
              key={tab.id}
              className={activeTab === tab.id ? 'active' : undefined}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon aria-hidden="true" size={16} />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </section>
  );
}
