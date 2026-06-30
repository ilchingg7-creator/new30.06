import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from '../App';

describe('App shell', () => {
  it('renders the game title and first module state', async () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Космическая коммуналка' })).toBeInTheDocument();
    expect(await screen.findByText('15')).toBeInTheDocument();
    expect(screen.getByText('0/сек')).toBeInTheDocument();
    expect(screen.getByText('Капсула арендатора')).toBeInTheDocument();
  });
});
