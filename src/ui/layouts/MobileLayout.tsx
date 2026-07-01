import { Gift, Home, RotateCcw, Target } from 'lucide-react';
import { useState } from 'react';
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
import { RoomConditionBar } from '../components/RoomConditionBar';
import { PrestigePanel } from '../components/PrestigePanel';
import { PrestigeUpgradesPanel } from '../components/PrestigeUpgradesPanel';
import { ResidentCollectionBook } from '../components/ResidentCollectionBook';
import { ResidentsPanel } from '../components/ResidentsPanel';
import { RoomSelector } from '../components/RoomSelector';
import { StationTaskPanel } from '../components/StationTaskPanel';
import { StatsPanel } from '../components/StatsPanel';
import { TopBar } from '../components/TopBar';

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
    hasPendingDailyReward: Boolean(game.dailyReward)
  });

  const tabs: Array<{ id: MobileTab; label: string; icon: typeof Home }> = [
    { id: 'modules', label: t.rooms, icon: Home },
    { id: 'goals', label: t.goals, icon: Target },
    { id: 'bonuses', label: t.bonuses, icon: Gift },
    { id: 'prestige', label: t.renovation, icon: RotateCcw }
  ];

  return (
    <section className="mobile-layout" aria-label="Mobile layout">
      <TopBar gameState={game.gameState} incomePerSecond={game.incomePerSecond} variant="compact" t={t} />
      <StationTaskPanel
        guidance={stationGuidance}
        onSelectRoom={game.selectRoom}
        onRenovate={game.renovateOrbit}
        variant="compact"
        t={t}
      />
      <CommunalDutyPanel
        gameState={game.gameState}
        onAssign={game.assignCommunalDuty}
        onClaim={game.claimCommunalDuty}
        variant="compact"
        t={t}
      />
      <RoomSelector gameState={game.gameState} selectedRoomId={game.selectedRoomId} onSelectRoom={game.selectRoom} t={t} />
      <PixiStationScene gameState={game.gameState} selectedRoomId={game.selectedRoomId} onRoomClick={game.clickRoom} ariaLabel={t.stationView} />
      <RoomConditionBar gameState={game.gameState} roomId={game.selectedRoomId} t={t} />
      <div className="mobile-tab-content">
        {activeTab === 'modules' && <ModuleList gameState={game.gameState} onBuyLevel={game.buyLevel} t={t} />}
        {activeTab === 'goals' && (
          <>
            <GoalPanel gameState={game.gameState} t={t} />
            <ResidentCollectionBook gameState={game.gameState} t={t} />
            <ResidentsPanel gameState={game.gameState} t={t} />
            <AchievementsPanel gameState={game.gameState} t={t} />
            <StatsPanel gameState={game.gameState} t={t} />
          </>
        )}
        {activeTab === 'bonuses' && (
          <BonusPanel
            onIncomeBoost={game.activateIncomeBoost}
            onVipResident={game.activateVipResident}
            adsAvailable={game.adsAvailable}
            adPending={game.adPending}
            t={t}
          />
        )}
        {activeTab === 'prestige' && (
          <>
            <PrestigePanel reputation={game.gameState.reputation} onRenovate={game.renovateOrbit} t={t} />
            <PrestigeUpgradesPanel gameState={game.gameState} onBuyUpgrade={game.buyPrestigeUpgrade} t={t} />
            <CosmeticsPanel
              windowLightColor={game.gameState.windowLightColor ?? 'amber'}
              onWindowLightColor={game.setWindowLightColor}
              t={t}
            />
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
