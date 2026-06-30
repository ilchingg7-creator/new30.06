import { Gift, Home, RotateCcw, Target } from 'lucide-react';
import { useState } from 'react';
import type { UseGameStateResult } from '../useGameState';
import { BonusPanel } from '../components/BonusPanel';
import { GoalPanel } from '../components/GoalPanel';
import { ModuleList } from '../components/ModuleList';
import { PixiStationScene } from '../components/PixiStationScene';
import { PrestigePanel } from '../components/PrestigePanel';
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
      <PixiStationScene gameState={game.gameState} />
      <div className="mobile-tab-content">
        {activeTab === 'modules' && <ModuleList gameState={game.gameState} onBuyLevel={game.buyLevel} />}
        {activeTab === 'goals' && <GoalPanel gameState={game.gameState} />}
        {activeTab === 'bonuses' && (
          <BonusPanel onIncomeBoost={game.activateIncomeBoost} onVipResident={game.activateVipResident} />
        )}
        {activeTab === 'prestige' && (
          <PrestigePanel reputation={game.gameState.reputation} onRenovate={game.renovateOrbit} />
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
