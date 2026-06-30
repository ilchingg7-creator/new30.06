import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from '../App';
import { translations } from '../platform/i18n';

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

  it('renders one room selector navigation for the active layout', async () => {
    setViewportWidth(1200);
    render(<App />);

    await screen.findAllByRole('navigation', { name: t.rooms });
    expect(screen.getAllByRole('navigation', { name: t.rooms })).toHaveLength(1);
  });
});
