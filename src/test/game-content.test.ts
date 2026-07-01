import { describe, expect, it } from 'vitest';
import { goals } from '../game/content/goals';
import { modules } from '../game/content/modules';
import { residents } from '../game/content/residents';

describe('game content', () => {
  it('defines 10 modules with increasing base prices', () => {
    expect(modules).toHaveLength(14);

    const prices = modules.map((module) => module.baseCost);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it('uses unique ids for modules, residents and goals', () => {
    const ids = [...modules, ...residents, ...goals].map((item) => item.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps every module visually mapped for station rendering', () => {
    expect(modules.every((module) => module.visualKey.length > 0)).toBe(true);
  });
});
