import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { createInitialState } from '../game/economy';
import type { GameState } from '../game/types';
import { translations } from '../platform/i18n';
import { CommunalDutyPanel } from '../ui/components/CommunalDutyPanel';

const t = translations.en;
const css = readFileSync(join(process.cwd(), 'src/styles/global.css'), 'utf8');

function ruleBody(selectorPattern: RegExp): string {
  const match = css.match(selectorPattern);
  expect(match?.[1]).toBeTruthy();
  return (match?.[1] ?? '').replace(/\s+/g, ' ');
}

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

  it('keeps compact duty text readable after density tuning', () => {
    expect(ruleBody(/\.communal-duty-panel\.compact \.communal-duty-heading h2\s*\{([^}]*)\}/s)).toContain(
      'font-size: 0.8rem'
    );
    expect(ruleBody(/\.communal-duty-panel\.compact strong\s*\{([^}]*)\}/s)).toContain('font-size: 0.86rem');
    expect(ruleBody(/\.communal-duty-panel\.compact \.panel-copy\s*\{([^}]*)\}/s)).toContain('font-size: 0.74rem');
    expect(ruleBody(/\.communal-duty-panel\.compact button\s*\{([^}]*)\}/s)).toContain('font-size: 0.74rem');
    expect(ruleBody(/\.communal-duty-panel\.compact \.action-preview-text small\s*\{([^}]*)\}/s)).toContain(
      'font-size: 0.68rem'
    );
  });

  it('keeps the compact claim reward wide enough to wrap by words', () => {
    const claimRow = ruleBody(/\.communal-duty-panel\.compact \.communal-duty-claim-row\s*\{([^}]*)\}/s);
    const claimPreview = ruleBody(
      /\.communal-duty-panel\.compact \.communal-duty-claim-row \.action-preview\s*\{([^}]*)\}/s
    );

    expect(claimRow).toContain('grid-template-columns: minmax(0, 1fr) auto');
    expect(claimPreview).toContain('grid-column: 1');
    expect(claimPreview).toContain('min-width: 0');
    expect(
      ruleBody(/\.communal-duty-panel\.compact \.communal-duty-claim-row \.action-preview-text small\s*\{([^}]*)\}/s)
    ).toContain('overflow-wrap: break-word');
  });

  it('uses compact content-sized spacing for desktop claim results', () => {
    const claimRow = ruleBody(/\.communal-duty-claim-row\s*\{([^}]*)\}/s);

    expect(claimRow).toContain('grid-template-columns: max-content minmax(0, max-content) max-content');
    expect(claimRow).toContain('justify-content: start');
  });

  it('uses a high-contrast title in the latest duty result card', () => {
    expect(ruleBody(/\.last-action-feedback \.action-preview-text strong\s*\{([^}]*)\}/s)).toContain(
      'color: var(--color-ink)'
    );
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
