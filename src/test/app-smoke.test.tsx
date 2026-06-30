import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from '../App';

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

    expect(screen.getByRole('heading', { name: 'Космическая коммуналка' })).toBeInTheDocument();
    expect(await screen.findAllByText('15')).not.toHaveLength(0);
    expect(screen.getAllByText('0/сек')).not.toHaveLength(0);
    expect(screen.getAllByText('Капсула арендатора')).not.toHaveLength(0);
    expect(screen.getAllByLabelText('Визуальный вид станции')).not.toHaveLength(0);
    expect(screen.getByRole('heading', { name: 'Комнаты' })).toBeInTheDocument();
    expect(container.querySelector('.desktop-layout')).not.toBeNull();
    expect(container.querySelector('.mobile-layout')).toBeNull();
  });
});
