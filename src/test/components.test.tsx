import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { buyModuleLevel, calculateIncomePerSecond, createInitialState } from '../game/economy';
import { BonusPanel } from '../ui/components/BonusPanel';
import { GoalPanel } from '../ui/components/GoalPanel';
import { ModuleList } from '../ui/components/ModuleList';
import { PixiStationScene } from '../ui/components/PixiStationScene';
import { PrestigePanel } from '../ui/components/PrestigePanel';
import { ResidentsPanel } from '../ui/components/ResidentsPanel';
import { RoomSelector } from '../ui/components/RoomSelector';
import { TopBar } from '../ui/components/TopBar';

describe('core UI components', () => {
  it('renders station, resources, modules, room selector, goals, bonuses and prestige panels', () => {
    const gameState = buyModuleLevel(createInitialState(1_000), 'tenant_capsule');

    render(
      <>
        <TopBar gameState={gameState} incomePerSecond={calculateIncomePerSecond(gameState)} />
        <RoomSelector gameState={gameState} selectedRoomId="tenant_capsule" onSelectRoom={vi.fn()} />
        <PixiStationScene gameState={gameState} selectedRoomId="tenant_capsule" />
        <ModuleList gameState={gameState} onBuyLevel={vi.fn()} />
        <GoalPanel gameState={gameState} />
        <BonusPanel
          onIncomeBoost={vi.fn()}
          onVipResident={vi.fn()}
          adsAvailable={false}
          adPending={false}
        />
        <PrestigePanel reputation={gameState.reputation} onRenovate={vi.fn()} />
      </>
    );

    expect(screen.getByText('Кредиты')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Комнаты станции' })).toBeInTheDocument();
    expect(screen.getByLabelText('Визуальный вид станции')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Комнаты' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Цели' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Бонусы' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Реновация орбиты' })).toBeInTheDocument();
  });

  it('does not mark locked rooms as active in the selector', () => {
    const { container } = render(
      <RoomSelector gameState={createInitialState(1_000)} selectedRoomId="tenant_capsule" onSelectRoom={vi.fn()} />
    );

    expect(container.querySelector('.room-selector button.active')).toBeNull();
  });

  it('shows whether the station has settled residents yet', () => {
    render(<ResidentsPanel gameState={createInitialState(1_000)} />);

    expect(screen.getByText('0/8 заселено')).toBeInTheDocument();
    expect(screen.getByText('Пока жильцов нет')).toBeInTheDocument();
    expect(screen.getAllByText('Не заселен')).toHaveLength(8);
  });

  it('marks unlocked residents as settled', () => {
    render(
      <ResidentsPanel
        gameState={{
          ...createInitialState(1_000),
          unlockedResidents: ['sleepy_engineer']
        }}
      />
    );

    expect(screen.getByText('1/8 заселено')).toBeInTheDocument();
    expect(screen.getByText('Заселен')).toBeInTheDocument();
    expect(screen.getAllByText('Не заселен')).toHaveLength(7);
  });
});
