import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { StationGuidance } from '../game/stationDirector';
import { translations } from '../platform/i18n';
import { StationTaskPanel } from '../ui/components/StationTaskPanel';

const t = translations.en;

describe('StationTaskPanel', () => {
  it('renders visitor event guidance with translated copy and cost', () => {
    const guidance: StationGuidance = {
      kind: 'visitor',
      priority: 100,
      copyKey: 'visitor',
      canActNow: true,
      visitorCost: 120,
      visitorRewardComfort: 2
    };

    render(<StationTaskPanel guidance={guidance} onSelectRoom={vi.fn()} t={t} />);

    expect(screen.getByRole('heading', { name: t.currentTask })).toBeInTheDocument();
    expect(screen.getByText(t.taskVisitorTitle)).toBeInTheDocument();
    expect(screen.getByText(t.taskVisitorBody)).toBeInTheDocument();
    expect(screen.getByText(/120/)).toBeInTheDocument();
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

  it('renders communal duty guidance with translated copy', () => {
    const guidance: StationGuidance = {
      kind: 'communal_duty',
      priority: 95,
      copyKey: 'communal_duty_claim',
      canActNow: true,
      dutyId: 'capsule_quiet_hours',
      targetRoomId: 'tenant_capsule'
    };

    render(<StationTaskPanel guidance={guidance} onSelectRoom={vi.fn()} t={t} />);

    expect(screen.getByText(t.taskCommunalDutyClaimTitle)).toBeInTheDocument();
    expect(screen.getByText(t.taskCommunalDutyClaimBody)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: t.taskSelectRoom })).toBeInTheDocument();
  });

  it('renders guidance preview reason and result', () => {
    const guidance: StationGuidance = {
      kind: 'communal_duty',
      priority: 95,
      copyKey: 'communal_duty_claim',
      canActNow: true,
      dutyId: 'capsule_quiet_hours',
      targetRoomId: 'tenant_capsule',
      preview: {
        title: 'Expected duty result',
        reason: 'Resident role matches this duty.',
        result: '+35 condition',
        tags: ['condition', 'role'],
        tone: 'positive'
      }
    };

    render(<StationTaskPanel guidance={guidance} onSelectRoom={vi.fn()} t={t} />);

    expect(screen.getByText('Resident role matches this duty.')).toBeInTheDocument();
    expect(screen.getByText('+35 condition')).toBeInTheDocument();
  });
});
