import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { buyModuleLevel, calculateIncomePerSecond, createInitialState } from '../game/economy';
import { BonusPanel } from '../ui/components/BonusPanel';
import { GoalPanel } from '../ui/components/GoalPanel';
import { ModuleList } from '../ui/components/ModuleList';
import { PixiStationScene } from '../ui/components/PixiStationScene';
import { PrestigePanel } from '../ui/components/PrestigePanel';
import { TopBar } from '../ui/components/TopBar';

describe('core UI components', () => {
  it('renders station, resources, modules, goals, bonuses and prestige panels', () => {
    const gameState = buyModuleLevel(createInitialState(1_000), 'tenant_capsule');

    render(
      <>
        <TopBar gameState={gameState} incomePerSecond={calculateIncomePerSecond(gameState)} />
        <PixiStationScene gameState={gameState} />
        <ModuleList gameState={gameState} onBuyLevel={vi.fn()} />
        <GoalPanel gameState={gameState} />
        <BonusPanel onIncomeBoost={vi.fn()} onVipResident={vi.fn()} />
        <PrestigePanel reputation={gameState.reputation} onRenovate={vi.fn()} />
      </>
    );

    expect(screen.getByText('Кредиты')).toBeInTheDocument();
    expect(screen.getByLabelText('Визуальный вид станции')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Комнаты' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Цели' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Бонусы' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Реновация орбиты' })).toBeInTheDocument();
  });
});
