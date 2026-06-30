import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from '../App';

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

afterEach(() => {
  vi.restoreAllMocks();
  Reflect.deleteProperty(window, 'matchMedia');
});

describe('responsive layout rendering', () => {
  it('renders the four resource metrics required by the desktop top bar', async () => {
    setViewportWidth(1200);
    render(<App />);

    await screen.findAllByText('Копейки');
    expect(screen.getAllByText('Копейки').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Доход').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Комфорт').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Репутация').length).toBeGreaterThanOrEqual(1);
  });

  it('renders only the desktop layout above the mobile breakpoint', async () => {
    setViewportWidth(1200);
    const { container } = render(<App />);

    await screen.findAllByText('Капсула арендатора');

    expect(container.querySelector('.desktop-layout')).not.toBeNull();
    expect(container.querySelector('.mobile-layout')).toBeNull();
  });

  it('renders only the mobile layout below the mobile breakpoint', async () => {
    setViewportWidth(390);
    const { container } = render(<App />);

    await screen.findAllByText('Капсула арендатора');

    expect(container.querySelector('.desktop-layout')).toBeNull();
    expect(container.querySelector('.mobile-layout')).not.toBeNull();
  });

  it('uses the CSS media query result when browser mobile emulation changes layout viewport', async () => {
    setViewportWidth(1200);
    setMediaQueryMatches(true);

    const { container } = render(<App />);

    await screen.findAllByText('Капсула арендатора');

    expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 899px)');
    expect(container.querySelector('.desktop-layout')).toBeNull();
    expect(container.querySelector('.mobile-layout')).not.toBeNull();
  });

  it('renders the four mobile bottom tabs with the required labels', async () => {
    setViewportWidth(390);
    render(<App />);

    await screen.findAllByText('Капсула арендатора');

    expect(screen.getByRole('button', { name: 'Комнаты' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Цели' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Бонусы' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Реновация' })).toBeInTheDocument();
  });

  it('renders one room selector navigation for the active layout', async () => {
    setViewportWidth(1200);
    render(<App />);

    await screen.findAllByRole('navigation', { name: 'Комнаты' });
    expect(screen.getAllByRole('navigation', { name: 'Комнаты' })).toHaveLength(1);
  });
});
