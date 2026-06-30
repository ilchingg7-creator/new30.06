import { Gift, Home, RotateCcw, Target } from 'lucide-react';
import { useState } from 'react';
import type { UseGameStateResult } from '../useGameState';
import { AchievementsPanel } from '../components/AchievementsPanel';
import { BonusPanel } from '../components/BonusPanel';
import { CosmeticsPanel } from '../components/CosmeticsPanel';
import { GoalPanel } from '../components/GoalPanel';
import { ModuleList } from '../components/ModuleList';
import { PixiStationScene } from '../components/PixiStationScene';
import { PrestigePanel } from '../components/PrestigePanel';
import { PrestigeUpgradesPanel } from '../components/PrestigeUpgradesPanel';
import { ResidentsPanel } from '../components/ResidentsPanel';
import { RoomSelector } from '../components/RoomSelector';
import { StatsPanel } from '../components/StatsPanel';
import { TopBar } from '../components/TopBar';

type MobileTab = 'modules' | 'goals' | 'bonuses' | 'prestige';

interface MobileLayoutProps {
  game: UseGameStateResult;
}

const tabs: Array<{ id: MobileTab; label: string; icon: typeof Home }> = [
  { id: 'modules', label: 'Комнаты', icon: Home },
  { id: 'goals', label: 'Цели', icon: Target },
  { id: 'bonuses', label: 'Бонусы', icon: Gift },
  { id: 'prestige', label: 'Реновация', icon: RotateCcw }
];

export function MobileLayout({ game }: MobileLayoutProps) {
  const [activeTab, setActiveTab] = useState<MobileTab>('modules');

  return (
    <section className="mobile-layout" aria-label="Mobile layout">
      <TopBar gameState={game.gameState} incomePerSecond={game.incomePerSecond} />
      <RoomSelector gameState={game.gameState} selectedRoomId={game.selectedRoomId} onSelectRoom={game.selectRoom} />
      <PixiStationScene gameState={game.gameState} selectedRoomId={game.selectedRoomId} />
      <div className="mobile-tab-content">
        {activeTab === 'modules' && <ModuleList gameState={game.gameState} onBuyLevel={game.buyLevel} />}
        {activeTab === 'goals' && (
          <>
            <GoalPanel gameState={game.gameState} />
            <ResidentsPanel gameState={game.gameState} />
            <AchievementsPanel gameState={game.gameState} />
            <StatsPanel gameState={game.gameState} />
          </>
        )}
        {activeTab === 'bonuses' && (
          <BonusPanel
            onIncomeBoost={game.activateIncomeBoost}
            onVipResident={game.activateVipResident}
            adsAvailable={game.adsAvailable}
            adPending={game.adPending}
          />
        )}
        {activeTab === 'prestige' && (
          <>
            <PrestigePanel reputation={game.gameState.reputation} onRenovate={game.renovateOrbit} />
            <PrestigeUpgradesPanel gameState={game.gameState} onBuyUpgrade={game.buyPrestigeUpgrade} />
            <CosmeticsPanel
              windowLightColor={game.gameState.windowLightColor ?? 'amber'}
              onWindowLightColor={game.setWindowLightColor}
            />
          </>
        )}
      </div>
      <nav className="bottom-tabs" aria-label="Разделы станции">
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
