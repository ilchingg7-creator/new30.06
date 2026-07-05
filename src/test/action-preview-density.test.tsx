import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createInitialState } from '../game/economy';
import type { GameState } from '../game/types';
import { translations } from '../platform/i18n';
import { ModuleList } from '../ui/components/ModuleList';
import { StationIncidentJournal } from '../ui/components/StationIncidentJournal';

const t = translations.ru;

describe('action preview density', () => {
  it('renders room card previews as inline density', () => {
    const { container } = render(<ModuleList gameState={createInitialState(1_000)} onBuyLevel={vi.fn()} t={t} />);

    expect(container.querySelector('.module-panel .action-preview.inline')).not.toBeNull();
  });

  it('renders incident choice previews as inline density', () => {
    const gameState: GameState = {
      ...createInitialState(1_000),
      unlockedResidents: ['mist_cook'],
      activeIncidents: [{ id: 'kitchen_borscht_fog', queuedAt: 10_000, isNew: true }]
    };

    const { container } = render(
      <StationIncidentJournal
        gameState={gameState}
        newIncidentCount={1}
        onResolve={vi.fn()}
        onMarkSeen={vi.fn()}
        t={t}
      />
    );

    expect(container.querySelector('.incident-choice-list .incident-choice-button')).not.toBeNull();
    expect(container.querySelector('.incident-choice-list .action-preview.inline')).not.toBeNull();
  });
});
