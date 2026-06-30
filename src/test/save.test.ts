import { describe, expect, it } from 'vitest';
import { createInitialState } from '../game/economy';
import { parseGameState, SAVE_KEY, serializeGameState } from '../game/save';

describe('save serialization', () => {
  it('uses a stable save key', () => {
    expect(SAVE_KEY).toBe('cosmic-communalka-save-v1');
  });

  it('serializes and parses a valid game state', () => {
    const state = {
      ...createInitialState(1_000),
      credits: 123,
      totalEarnedCredits: 456,
      moduleLevels: {
        ...createInitialState(1_000).moduleLevels,
        tenant_capsule: 3
      }
    };

    expect(parseGameState(serializeGameState(state))).toEqual(state);
  });

  it('returns null for absent, invalid or incomplete saves', () => {
    expect(parseGameState(null)).toBeNull();
    expect(parseGameState('not-json')).toBeNull();
    expect(parseGameState(JSON.stringify({ credits: 1 }))).toBeNull();
  });
});
