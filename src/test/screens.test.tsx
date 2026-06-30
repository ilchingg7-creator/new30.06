import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LoadingScreen } from '../ui/screens/LoadingScreen';
import { OfflineRewardDialog } from '../ui/screens/OfflineRewardDialog';

describe('game screens', () => {
  it('renders a nonblank loading screen', () => {
    render(<LoadingScreen />);

    expect(screen.getByRole('heading', { name: 'Космическая коммуналка' })).toBeInTheDocument();
    expect(screen.getByText('Греем шлюзы')).toBeInTheDocument();
  });

  it('renders an offline reward dialog', () => {
    render(<OfflineRewardDialog seconds={3_660} credits={12_400} onCollect={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Станция поработала без вас' })).toBeInTheDocument();
    expect(screen.getByText('1ч 1м')).toBeInTheDocument();
    expect(screen.getByText('12.4K')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Забрать' })).toBeInTheDocument();
  });
});
