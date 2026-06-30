import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from '../App';

describe('App shell', () => {
  it('renders the game title and first module state', async () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Космическая коммуналка' })).toBeInTheDocument();
    expect(await screen.findAllByText('15')).not.toHaveLength(0);
    expect(screen.getAllByText('0/сек')).not.toHaveLength(0);
    expect(screen.getAllByText('Капсула арендатора')).not.toHaveLength(0);
    expect(screen.getAllByLabelText('Визуальный вид станции')).not.toHaveLength(0);
    expect(screen.getByRole('button', { name: 'Комнаты' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Цели' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Бонусы' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Реновация' })).toBeInTheDocument();
  });
});
