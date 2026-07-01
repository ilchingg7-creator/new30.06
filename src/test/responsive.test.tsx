import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from '../App';
import { createInitialState } from '../game/economy';
import type { GameState, ResidentId } from '../game/types';
import { translations } from '../platform/i18n';
import { MobileLayout } from '../ui/layouts/MobileLayout';
import type { UseGameStateResult } from '../ui/useGameState';

const t = translations.ru;

function setViewportWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    value: width
  });
  window.dispatchEvent(new Event('resize'));
}

function setMediaQueryMatches(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn()
  }));
}

function buildDutyGameState(): GameState {
  const base = createInitialState(1_000);

  return {
    ...base,
    moduleLevels: {
      ...base.moduleLevels,
      tenant_capsule: 10
    },
    unlockedResidents: ['sleepy_engineer'],
    roomConditions: {
      tenant_capsule: 45
    },
    communalDuty: {
      id: 'duty-1',
      dutyId: 'capsule_quiet_hours',
      roomId: 'tenant_capsule',
      status: 'available',
      createdAt: 1_000
    }
  };
}

function buildDutyGame(): UseGameStateResult {
  const gameState = buildDutyGameState();

  return {
    gameState,
    incomePerSecond: 1,
    offlineReward: null,
    dailyReward: null,
    ready: true,
    selectedRoomId: 'tenant_capsule',
    adPending: false,
    adsAvailable: false,
    buyLevel: vi.fn(),
    selectRoom: vi.fn(),
    renovateOrbit: vi.fn(),
    dismissOfflineReward: vi.fn(),
    dismissDailyReward: vi.fn(),
    activateIncomeBoost: vi.fn(),
    activateVipResident: vi.fn(),
    doubleOfflineReward: vi.fn(),
    setWindowLightColor: vi.fn(),
    buyPrestigeUpgrade: vi.fn(),
    toggleSound: vi.fn(),
    soundMuted: false,
    acceptVisitor: vi.fn(),
    declineVisitor: vi.fn(),
    resetSave: vi.fn(),
    clickRoom: vi.fn(),
    activeStory: null,
    storyDismissed: false,
    dismissStory: vi.fn(),
    assignCommunalDuty: vi.fn() as (residentId: ResidentId) => void,
    claimCommunalDuty: vi.fn()
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  Reflect.deleteProperty(window, 'matchMedia');
});

describe('responsive layout rendering', () => {
  it('renders the four resource metrics required by the desktop top bar', async () => {
    setViewportWidth(1200);
    render(<App />);

    await screen.findAllByText('Копейки');
    expect(screen.getAllByText(t.kopeks).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(t.income).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(t.comfort).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(t.reputation).length).toBeGreaterThanOrEqual(1);
  });

  it('renders only the desktop layout above the mobile breakpoint', async () => {
    setViewportWidth(1200);
    const { container } = render(<App />);

    await screen.findAllByText(t.content.modules.tenant_capsule.name);

    expect(container.querySelector('.desktop-layout')).not.toBeNull();
    expect(container.querySelector('.mobile-layout')).toBeNull();
  });

  it('renders only the mobile layout below the mobile breakpoint', async () => {
    setViewportWidth(390);
    const { container } = render(<App />);

    await screen.findAllByText(t.content.modules.tenant_capsule.name);

    expect(container.querySelector('.desktop-layout')).toBeNull();
    expect(container.querySelector('.mobile-layout')).not.toBeNull();
  });

  it('uses a compact single settings button in the mobile header', async () => {
    setViewportWidth(390);
    render(<App />);

    await screen.findAllByText(t.content.modules.tenant_capsule.name);

    expect(screen.queryByRole('heading', { name: t.appTitle })).toBeNull();
    expect(screen.getByRole('button', { name: t.settings })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: t.howToPlay })).toBeNull();
    expect(screen.queryByRole('button', { name: t.soundOff })).toBeNull();
    expect(screen.queryByRole('button', { name: t.soundOn })).toBeNull();
  });

  it('moves help and sound controls into the mobile settings dialog', async () => {
    const user = userEvent.setup();
    setViewportWidth(390);
    render(<App />);

    await screen.findAllByText(t.content.modules.tenant_capsule.name);
    await user.click(screen.getByRole('button', { name: t.settings }));

    expect(screen.getByRole('dialog', { name: t.settingsTitle })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: t.howToPlay })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: t.soundOff })).toBeInTheDocument();
  });

  it('uses the CSS media query result when browser mobile emulation changes layout viewport', async () => {
    setViewportWidth(1200);
    setMediaQueryMatches(true);

    const { container } = render(<App />);

    await screen.findAllByText(t.content.modules.tenant_capsule.name);

    expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 899px)');
    expect(container.querySelector('.desktop-layout')).toBeNull();
    expect(container.querySelector('.mobile-layout')).not.toBeNull();
  });

  it('renders the four mobile bottom tabs with the required labels', async () => {
    setViewportWidth(390);
    render(<App />);

    await screen.findAllByText(t.content.modules.tenant_capsule.name);

    expect(screen.getByRole('button', { name: t.rooms })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: t.goals })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: t.bonuses })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: t.renovation })).toBeInTheDocument();
  });

  it('renders station director guidance in the active responsive layout', async () => {
    setViewportWidth(390);
    render(<App />);

    await screen.findAllByText(t.content.modules.tenant_capsule.name);

    expect(screen.getAllByRole('heading', { name: t.currentTask })).toHaveLength(1);
  });

  it('uses compact station director density in the mobile layout', async () => {
    setViewportWidth(390);
    const { container } = render(<App />);

    await screen.findAllByText(t.content.modules.tenant_capsule.name);

    expect(container.querySelector('.mobile-layout .station-task-panel.compact')).not.toBeNull();
  });

  it('uses compact resource metrics in the mobile layout', async () => {
    setViewportWidth(390);
    const { container } = render(<App />);

    await screen.findAllByText(t.content.modules.tenant_capsule.name);

    expect(container.querySelector('.mobile-layout .top-bar.compact')).not.toBeNull();
  });

  it('renders compact communal duty panel when mobile layout has an active duty', () => {
    setViewportWidth(390);
    const { container } = render(<MobileLayout game={buildDutyGame()} t={t} />);

    expect(container.querySelector('.mobile-layout .communal-duty-panel.compact')).not.toBeNull();
  });

  it('renders one room selector navigation for the active layout', async () => {
    setViewportWidth(1200);
    render(<App />);

    await screen.findAllByRole('navigation', { name: t.rooms });
    expect(screen.getAllByRole('navigation', { name: t.rooms })).toHaveLength(1);
  });
});
