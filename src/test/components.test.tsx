import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { buyModuleLevel, calculateIncomePerSecond, createInitialState } from '../game/economy';
import { getStationGuidance } from '../game/stationDirector';
import { translations } from '../platform/i18n';
import { BonusPanel } from '../ui/components/BonusPanel';
import { CommunalDutyPanel } from '../ui/components/CommunalDutyPanel';
import { GoalPanel } from '../ui/components/GoalPanel';
import { ModuleList } from '../ui/components/ModuleList';
import { PixiStationScene } from '../ui/components/PixiStationScene';
import { PrestigePanel } from '../ui/components/PrestigePanel';
import { ResidentsPanel } from '../ui/components/ResidentsPanel';
import { RoomSelector } from '../ui/components/RoomSelector';
import { StationTaskPanel } from '../ui/components/StationTaskPanel';
import { TopBar } from '../ui/components/TopBar';

const t = translations.ru;

describe('core UI components', () => {
  it('renders station, resources, modules, room selector, goals, bonuses and prestige panels', () => {
    const gameState = buyModuleLevel(createInitialState(1_000), 'tenant_capsule');
    const guidance = getStationGuidance({
      state: gameState,
      incomePerSecond: calculateIncomePerSecond(gameState)
    });
    const dutyState = {
      ...gameState,
      unlockedResidents: ['sleepy_engineer'],
      communalDuty: {
        id: 'duty-1',
        dutyId: 'capsule_quiet_hours' as const,
        roomId: 'tenant_capsule' as const,
        status: 'available' as const,
        createdAt: 1_000
      }
    };

    render(
      <>
        <TopBar gameState={gameState} incomePerSecond={calculateIncomePerSecond(gameState)} t={t} />
        <StationTaskPanel guidance={guidance} onSelectRoom={vi.fn()} onRenovate={vi.fn()} t={t} />
        <RoomSelector gameState={gameState} selectedRoomId="tenant_capsule" onSelectRoom={vi.fn()} t={t} />
        <PixiStationScene gameState={gameState} selectedRoomId="tenant_capsule" ariaLabel={t.stationView} />
        <CommunalDutyPanel gameState={dutyState} onAssign={vi.fn()} onClaim={vi.fn()} t={t} />
        <ModuleList gameState={gameState} onBuyLevel={vi.fn()} t={t} />
        <GoalPanel gameState={gameState} t={t} />
        <BonusPanel
          onIncomeBoost={vi.fn()}
          onVipResident={vi.fn()}
          adsAvailable={false}
          adPending={false}
          t={t}
        />
        <PrestigePanel reputation={gameState.reputation} onRenovate={vi.fn()} t={t} />
      </>
    );

    expect(screen.getByText('Копейки')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Комнаты' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: t.currentTask })).toBeInTheDocument();
    expect(screen.getByLabelText(t.stationView)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: t.communalDutyTitle })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Комнаты' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Цели' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Бонусы' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Реновация орбиты' })).toBeInTheDocument();
  });

  it('does not mark locked rooms as active in the selector', () => {
    const { container } = render(
      <RoomSelector gameState={createInitialState(1_000)} selectedRoomId="tenant_capsule" onSelectRoom={vi.fn()} t={t} />
    );

    expect(container.querySelector('.room-selector button.active')).toBeNull();
  });

  it('shows whether the station has settled residents yet', () => {
    render(<ResidentsPanel gameState={createInitialState(1_000)} t={t} />);

    expect(screen.getByText(`0/8 ${t.residentsSettled}`)).toBeInTheDocument();
    expect(screen.getByText('Пока жильцов нет')).toBeInTheDocument();
    expect(screen.getAllByText(t.notSettled)).toHaveLength(8);
  });

  it('marks unlocked residents as settled', () => {
    render(
      <ResidentsPanel
        gameState={{
          ...createInitialState(1_000),
          unlockedResidents: ['sleepy_engineer']
        }}
        t={t}
      />
    );

    expect(screen.getByText(`1/8 ${t.residentsSettled}`)).toBeInTheDocument();
    expect(screen.getByText(t.settled)).toBeInTheDocument();
    expect(screen.getAllByText(t.notSettled)).toHaveLength(7);
  });
});
