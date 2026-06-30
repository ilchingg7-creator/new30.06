import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from '../App';

describe('responsive layout rendering', () => {
  it('renders the four resource metrics required by the desktop top bar', async () => {
    render(<App />);

    // Both DesktopLayout and MobileLayout mount a TopBar, so each label
    // appears twice in the DOM (CSS toggles visibility by viewport width).
    await screen.findAllByText('Кредиты');
    expect(screen.getAllByText('Кредиты').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Доход').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Комфорт').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Репутация').length).toBeGreaterThanOrEqual(1);
  });

  it('renders both desktop and mobile layout containers so CSS can switch them', async () => {
    const { container } = render(<App />);

    await screen.findAllByText('Капсула арендатора');

    expect(container.querySelector('.desktop-layout')).not.toBeNull();
    expect(container.querySelector('.mobile-layout')).not.toBeNull();
  });

  it('renders the four mobile bottom tabs with the required labels', async () => {
    render(<App />);

    await screen.findAllByText('Капсула арендатора');

    expect(screen.getByRole('button', { name: 'Комнаты' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Цели' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Бонусы' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Реновация' })).toBeInTheDocument();
  });

  it('renders the room selector navigation on both layouts', async () => {
    render(<App />);

    // Both DesktopLayout and MobileLayout mount a RoomSelector.
    await screen.findAllByRole('navigation', { name: 'Комнаты станции' });
    expect(screen.getAllByRole('navigation', { name: 'Комнаты станции' })).toHaveLength(2);
  });
});
