import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { StationGuidance } from '../game/stationDirector';
import { translations } from '../platform/i18n';
import { StationTaskPanel } from '../ui/components/StationTaskPanel';

const t = translations.en;

describe('StationTaskPanel', () => {
  it('renders module guidance with translated copy and cost', () => {
    const guidance: StationGuidance = {
      kind: 'module',
      priority: 70,
      copyKey: 'module_buy',
      canActNow: true,
      moduleId: 'tenant_capsule',
      targetRoomId: 'tenant_capsule',
      canAfford: true,
      cost: 15,
      waitSeconds: 0
    };

    render(<StationTaskPanel guidance={guidance} onSelectRoom={vi.fn()} t={t} />);

    expect(screen.getByRole('heading', { name: t.currentTask })).toBeInTheDocument();
    expect(screen.getByText(t.taskModuleBuyTitle)).toBeInTheDocument();
    expect(screen.getByText(t.taskModuleBuyBody)).toBeInTheDocument();
    expect(screen.getByText(/15/)).toBeInTheDocument();
  });

  it('calls onSelectRoom when room-focused guidance action is clicked', async () => {
    const user = userEvent.setup();
    const onSelectRoom = vi.fn();
    const guidance: StationGuidance = {
      kind: 'goal',
      priority: 80,
      copyKey: 'goal',
      canActNow: false,
      goalId: 'buy_capsule_10',
      targetRoomId: 'tenant_capsule',
      progressCurrent: 9,
      progressTarget: 10
    };

    render(<StationTaskPanel guidance={guidance} onSelectRoom={onSelectRoom} t={t} />);

    await user.click(screen.getByRole('button', { name: t.taskSelectRoom }));

    expect(onSelectRoom).toHaveBeenCalledWith('tenant_capsule');
    expect(screen.getByText('9/10')).toBeInTheDocument();
  });

  it('calls onRenovate when prestige guidance action is clicked', async () => {
    const user = userEvent.setup();
    const onRenovate = vi.fn();
    const guidance: StationGuidance = {
      kind: 'prestige',
      priority: 75,
      copyKey: 'prestige',
      canActNow: true,
      canRenovate: true,
      expectedReputation: 1
    };

    render(<StationTaskPanel guidance={guidance} onRenovate={onRenovate} t={t} />);

    await user.click(screen.getByRole('button', { name: t.taskRenovate }));

    expect(onRenovate).toHaveBeenCalledTimes(1);
  });
});
