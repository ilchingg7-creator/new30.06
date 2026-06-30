import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isMuted, playSound, setMuted, toggleMuted } from '../platform/sound';

describe('sound effects', () => {
  beforeEach(() => {
    setMuted(false);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('cosmic-communalka-muted');
    }
  });

  afterEach(() => {
    setMuted(false);
    vi.restoreAllMocks();
  });

  it('starts unmuted', () => {
    expect(isMuted()).toBe(false);
  });

  it('persists mute state to localStorage', () => {
    setMuted(true);
    expect(isMuted()).toBe(true);
    expect(window.localStorage.getItem('cosmic-communalka-muted')).toBe('1');

    setMuted(false);
    expect(isMuted()).toBe(false);
    expect(window.localStorage.getItem('cosmic-communalka-muted')).toBe('0');
  });

  it('toggleMuted flips the state and returns the new value', () => {
    expect(toggleMuted()).toBe(true);
    expect(isMuted()).toBe(true);

    expect(toggleMuted()).toBe(false);
    expect(isMuted()).toBe(false);
  });

  it('playSound does not throw when called without an AudioContext', () => {
    expect(() => playSound('purchase')).not.toThrow();
    expect(() => playSound('reward')).not.toThrow();
    expect(() => playSound('error')).not.toThrow();
    expect(() => playSound('click')).not.toThrow();
  });

  it('playSound does not throw when muted', () => {
    setMuted(true);
    expect(() => playSound('purchase')).not.toThrow();
  });
});
