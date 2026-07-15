import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { translations } from '../platform/i18n';
import { LoadingScreen } from '../ui/screens/LoadingScreen';
import { OfflineRewardDialog } from '../ui/screens/OfflineRewardDialog';

const t = translations.ru;

describe('game screens', () => {
  it('renders a nonblank loading screen', () => {
    render(<LoadingScreen t={t} />);

    expect(screen.getByRole('heading', { name: 'Космическая коммуналка' })).toBeInTheDocument();
    expect(screen.getByText('Греем шлюзы')).toBeInTheDocument();
  });

  it('renders an offline reward dialog', () => {
    render(<OfflineRewardDialog seconds={3_660} credits={12_400} onCollect={vi.fn()} t={t} />);

    expect(screen.getByRole('heading', { name: 'Станция поработала без вас' })).toBeInTheDocument();
    expect(screen.getByText('1ч 1м')).toBeInTheDocument();
    expect(screen.getByText('12.4K')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Забрать' })).toBeInTheDocument();
  });

  it('hides the double-via-ad button when ads are unavailable', () => {
    render(
      <OfflineRewardDialog
        seconds={3_660}
        credits={12_400}
        onCollect={vi.fn()}
        onDouble={vi.fn()}
        adsAvailable={false}
        t={t}
      />
    );

    expect(screen.queryByRole('button', { name: /Удвоить/ })).toBeNull();
  });

  it('shows the double-via-ad button when ads are available', () => {
    render(
      <OfflineRewardDialog
        seconds={3_660}
        credits={12_400}
        onCollect={vi.fn()}
        onDouble={vi.fn()}
        adsAvailable
        t={t}
      />
    );

    expect(screen.getByText('Автоматика станции приносит 50% дохода за учтённое время.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Посмотреть рекламу — удвоить результат' })).toBeInTheDocument();
  });

  it('explains the counted 50% reward and exact ad result in English', () => {
    render(
      <OfflineRewardDialog
        seconds={3_660}
        credits={12_400}
        onCollect={vi.fn()}
        onDouble={vi.fn()}
        adsAvailable
        t={translations.en}
      />
    );

    expect(screen.getByText('Station automation earns 50% income for the counted time.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Watch an ad — double the result' })).toBeInTheDocument();
  });
});
