import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from '../App';
import { translations } from '../platform/i18n';

const t = translations.ru;

// Ensure tests run in Russian (navigator.language defaults to en-US in jsdom).
beforeEach(() => {
  Object.defineProperty(navigator, 'language', {
    configurable: true,
    value: 'ru-RU'
  });
  window.localStorage.removeItem('cosmic-communalka-language');
  // Mark onboarding tour as seen so it doesn't overlay the app shell.
  window.localStorage.setItem('cosmic-communalka-help-seen', '1');
});

function setViewportWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    value: width
  });
}

describe('App shell', () => {
  it('renders the game title and first desktop module state', async () => {
    setViewportWidth(1200);
    const { container } = render(<App />);

    expect(screen.getByRole('heading', { name: t.appTitle })).toBeInTheDocument();
    expect(await screen.findAllByText('15')).not.toHaveLength(0);
    expect(screen.getAllByText(`0${t.perSecond}`)).not.toHaveLength(0);
    expect(screen.getAllByText(t.content.modules.tenant_capsule.name)).not.toHaveLength(0);
    await waitFor(() => {
      expect(screen.getAllByLabelText(t.stationView)).not.toHaveLength(0);
    });
    expect(screen.getByRole('heading', { name: t.rooms })).toBeInTheDocument();
    expect(container.querySelector('.desktop-layout')).not.toBeNull();
    expect(container.querySelector('.mobile-layout')).toBeNull();
  });
});
