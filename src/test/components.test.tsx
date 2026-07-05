import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { buyModuleLevel, calculateIncomePerSecond, createInitialState } from '../game/economy';
import type { StationGuidance } from '../game/stationDirector';
import type { GameState } from '../game/types';
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
import { StationIncidentJournal } from '../ui/components/StationIncidentJournal';
import { TopBar } from '../ui/components/TopBar';

const t = translations.ru;

describe('core UI components', () => {
  it('renders station, resources, modules, room selector, goals, bonuses and prestige panels', () => {
    const gameState = buyModuleLevel(createInitialState(1_000), 'tenant_capsule');
    const guidance: StationGuidance = {
      kind: 'daily',
      priority: 90,
      copyKey: 'daily',
      canActNow: true
    };
    const dutyState: GameState = {
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
        <PrestigePanel gameState={gameState} onRenovate={vi.fn()} t={t} />
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

  it('shows module purchase preview on room cards', () => {
    render(<ModuleList gameState={createInitialState(1_000)} onBuyLevel={vi.fn()} t={t} />);

    expect(screen.getByText(/first working room/i)).toBeInTheDocument();
    expect(screen.getByText(/\+1.00\/sec/i)).toBeInTheDocument();
  });

  it('shows locked module unlock preview instead of purchase impact', () => {
    render(<ModuleList gameState={createInitialState(1_000)} onBuyLevel={vi.fn()} t={t} />);

    expect(screen.getAllByText(/Unlocks at/i).length).toBeGreaterThan(0);
  });

  it('shows whether the station has settled residents yet', () => {
    render(<ResidentsPanel gameState={createInitialState(1_000)} t={t} />);

    expect(screen.getByText(`0/12 ${t.residentsSettled}`)).toBeInTheDocument();
    expect(screen.getByText('Пока жильцов нет')).toBeInTheDocument();
    expect(screen.getAllByText(t.notSettled)).toHaveLength(12);
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

    expect(screen.getByText(`1/12 ${t.residentsSettled}`)).toBeInTheDocument();
    expect(screen.getByText(t.settled)).toBeInTheDocument();
    expect(screen.getAllByText(t.notSettled)).toHaveLength(11);
  });

  it('shows resident role labels for settled residents', () => {
    render(
      <ResidentsPanel
        gameState={{
          ...createInitialState(1_000),
          unlockedResidents: ['sleepy_engineer']
        }}
        t={t}
      />
    );

    expect(screen.getAllByText(t.residentRoleMaintenance).length).toBeGreaterThan(0);
    expect(screen.getAllByText(t.residentRoleIncome).length).toBeGreaterThan(0);
  });

  it('shows renovation requirements and disables renovation before they are complete', () => {
    render(<PrestigePanel gameState={{ ...createInitialState(1_000), totalEarnedCredits: 400_000 }} onRenovate={vi.fn()} t={t} />);

    expect(screen.getByText(t.renovationRequirements)).toBeInTheDocument();
    expect(screen.getByText('Накопить награду реновации +1 репутация')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: t.renovate })).toBeDisabled();
  });

  it('shows the strange cat only in the tenant capsule scene', () => {
    const gameState = {
      ...buyModuleLevel(createInitialState(1_000), 'tenant_capsule'),
      moduleLevels: {
        ...createInitialState(1_000).moduleLevels,
        tenant_capsule: 1,
        cosmo_kitchen: 1
      }
    };
    const { rerender } = render(
      <PixiStationScene gameState={gameState} selectedRoomId="tenant_capsule" ariaLabel={t.stationView} />
    );

    expect(screen.getByRole('button', { name: 'strange-cat' })).toBeInTheDocument();

    rerender(<PixiStationScene gameState={gameState} selectedRoomId="cosmo_kitchen" ariaLabel={t.stationView} />);

    expect(screen.queryByRole('button', { name: 'strange-cat' })).toBeNull();
  });

  it('plays cat love and disables the strange cat interaction during cooldown', () => {
    vi.useFakeTimers();
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const gameState = buyModuleLevel(createInitialState(1_000), 'tenant_capsule');
    const onTenantCatClick = vi.fn();

    try {
      render(
        <PixiStationScene
          gameState={gameState}
          selectedRoomId="tenant_capsule"
          ariaLabel={t.stationView}
          onTenantCatClick={onTenantCatClick}
        />
      );

      const catButton = screen.getByRole('button', { name: 'strange-cat' });

      fireEvent.click(catButton);

      expect(screen.getByTestId('tenant-cat-love')).toHaveAttribute('src', '/assets/rooms/tenant_capsule/cat-love.gif');
      expect(onTenantCatClick).toHaveBeenCalledTimes(1);
      expect(catButton).toBeDisabled();

      act(() => {
        vi.advanceTimersByTime(900);
      });

      expect(screen.queryByTestId('tenant-cat-love')).toBeNull();
      expect(catButton).toBeDisabled();

      act(() => {
        vi.advanceTimersByTime(2_100);
      });

      expect(catButton).not.toBeDisabled();
    } finally {
      randomSpy.mockRestore();
      vi.useRealTimers();
    }
  });

  it('renders station incidents as a non-blocking journal with choices', () => {
    const onResolve = vi.fn();
    const onSeen = vi.fn();
    const gameState: GameState = {
      ...createInitialState(1_000),
      activeIncidents: [{ id: 'kitchen_borscht_fog', queuedAt: 10_000, isNew: true }]
    };

    render(
      <StationIncidentJournal
        gameState={gameState}
        newIncidentCount={1}
        onResolve={onResolve}
        onMarkSeen={onSeen}
        t={t}
      />
    );

    expect(screen.getByText(t.incidentJournalTitle)).toBeInTheDocument();
    expect(screen.getByText(t.incidents.kitchen_borscht_fog.title)).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: t.incidents.kitchen_borscht_fog.choices.vent_fog.label }));

    expect(onResolve).toHaveBeenCalledWith('kitchen_borscht_fog', 'vent_fog');
  });

  it('filters station incident choices by resident roles in the journal', () => {
    const onResolve = vi.fn();
    const onSeen = vi.fn();
    const roleChoiceLabel = t.incidents.kitchen_borscht_fog.choices.make_borscht_tradition.label;
    const gameState: GameState = {
      ...createInitialState(1_000),
      activeIncidents: [{ id: 'kitchen_borscht_fog', queuedAt: 10_000, isNew: true }]
    };
    const { rerender } = render(
      <StationIncidentJournal
        gameState={gameState}
        newIncidentCount={1}
        onResolve={onResolve}
        onMarkSeen={onSeen}
        t={t}
      />
    );

    expect(screen.queryByRole('button', { name: roleChoiceLabel })).toBeNull();

    rerender(
      <StationIncidentJournal
        gameState={{
          ...gameState,
          unlockedResidents: ['mist_cook']
        }}
        newIncidentCount={1}
        onResolve={onResolve}
        onMarkSeen={onSeen}
        t={t}
      />
    );

    expect(screen.getByRole('button', { name: roleChoiceLabel })).toBeInTheDocument();
  });

  it('shows incident choice reward previews', () => {
    const gameState: GameState = {
      ...createInitialState(1_000),
      unlockedResidents: ['mist_cook'],
      activeIncidents: [{ id: 'kitchen_borscht_fog', queuedAt: 10_000, isNew: true }]
    };

    render(
      <StationIncidentJournal
        gameState={gameState}
        newIncidentCount={1}
        onResolve={vi.fn()}
        onMarkSeen={vi.fn()}
        t={t}
      />
    );

    expect(screen.getByText(/comfort role unlocks this option/i)).toBeInTheDocument();
    expect(screen.getByText(/\+3 comfort/i)).toBeInTheDocument();
  });
});
