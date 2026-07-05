import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { createInitialState } from '../game/economy';
import type { GameState } from '../game/types';
import { translations } from '../platform/i18n';
import { CommunalDutyPanel } from '../ui/components/CommunalDutyPanel';

const t = translations.en;

function availableDutyState(): GameState {
  const base = createInitialState(1_000);

  return {
    ...base,
    moduleLevels: {
      ...base.moduleLevels,
      tenant_capsule: 10
    },
    unlockedResidents: ['sleepy_engineer'],
    communalDuty: {
      id: 'duty-1',
      dutyId: 'capsule_quiet_hours',
      roomId: 'tenant_capsule',
      status: 'available',
      createdAt: 1_000
    }
  };
}

describe('CommunalDutyPanel', () => {
  it('renders nothing when there is no active duty', () => {
    const { container } = render(
      <CommunalDutyPanel gameState={createInitialState(1_000)} onAssign={vi.fn()} onClaim={vi.fn()} t={t} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders available duty and assigns an eligible resident', async () => {
    const user = userEvent.setup();
    const onAssign = vi.fn();

    render(<CommunalDutyPanel gameState={availableDutyState()} onAssign={onAssign} onClaim={vi.fn()} t={t} />);

    expect(screen.getByRole('heading', { name: t.communalDutyTitle })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Sleepy Engineer/i }));

    expect(onAssign).toHaveBeenCalledWith('sleepy_engineer');
  });

  it('shows role-matched duty reward before assignment', () => {
    render(<CommunalDutyPanel gameState={availableDutyState()} onAssign={vi.fn()} onClaim={vi.fn()} t={t} />);

    expect(screen.getByText(/maintenance role matches this duty/i)).toBeInTheDocument();
    expect(screen.getByText(/\+35 condition/i)).toBeInTheDocument();
  });

  it('renders compact duty assignment choices as dense rows', () => {
    const { container } = render(
      <CommunalDutyPanel
        gameState={availableDutyState()}
        onAssign={vi.fn()}
        onClaim={vi.fn()}
        t={t}
        variant="compact"
      />
    );

    expect(container.querySelector('.communal-duty-panel.compact .communal-duty-choice-row')).not.toBeNull();
    expect(container.querySelector('.communal-duty-choice-row .action-preview.inline')).not.toBeNull();
  });

  it('renders compact ready-to-claim duty as a dense claim row', () => {
    const activeDuty = availableDutyState().communalDuty!;
    const state = {
      ...availableDutyState(),
      communalDuty: {
        ...activeDuty,
        status: 'ready_to_claim' as const,
        assignedResidentId: 'sleepy_engineer' as const,
        startedAt: 1_000,
        completesAt: 181_000
      }
    };

    const { container } = render(
      <CommunalDutyPanel gameState={state} onAssign={vi.fn()} onClaim={vi.fn()} t={t} variant="compact" />
    );

    expect(container.querySelector('.communal-duty-panel.compact .communal-duty-claim-row')).not.toBeNull();
    expect(container.querySelector('.communal-duty-claim-row .action-preview.inline')).not.toBeNull();
  });

  it('renders ready-to-claim duty with claim action', async () => {
    const user = userEvent.setup();
    const onClaim = vi.fn();
    const activeDuty = availableDutyState().communalDuty!;
    const state = {
      ...availableDutyState(),
      communalDuty: {
        ...activeDuty,
        status: 'ready_to_claim' as const,
        assignedResidentId: 'sleepy_engineer' as const,
        startedAt: 1_000,
        completesAt: 181_000
      }
    };

    render(<CommunalDutyPanel gameState={state} onAssign={vi.fn()} onClaim={onClaim} t={t} />);

    await user.click(screen.getByRole('button', { name: t.communalDutyClaim }));

    expect(onClaim).toHaveBeenCalledTimes(1);
  });
});
