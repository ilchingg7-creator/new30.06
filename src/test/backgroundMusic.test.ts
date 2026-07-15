import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

class FakeAudioParam {
  value = 0;
  setValueAtTime = vi.fn((value: number) => { this.value = value; });
  linearRampToValueAtTime = vi.fn((value: number) => { this.value = value; });
  exponentialRampToValueAtTime = vi.fn((value: number) => { this.value = value; });
  cancelScheduledValues = vi.fn();
}

class FakeNode {
  connect = vi.fn();
  disconnect = vi.fn();
}

class FakeOscillator extends FakeNode {
  type: OscillatorType = 'sine';
  frequency = new FakeAudioParam();
  start = vi.fn();
  stop = vi.fn();
  addEventListener = vi.fn();
}

class FakeGain extends FakeNode {
  gain = new FakeAudioParam();
}

class FakeAudioContext {
  static instances: FakeAudioContext[] = [];
  currentTime = 0;
  state: AudioContextState = 'running';
  destination = new FakeNode();
  oscillators: FakeOscillator[] = [];
  gains: FakeGain[] = [];
  resume = vi.fn().mockResolvedValue(undefined);
  suspend = vi.fn().mockResolvedValue(undefined);

  constructor() {
    FakeAudioContext.instances.push(this);
  }

  createOscillator() {
    const node = new FakeOscillator();
    this.oscillators.push(node);
    return node;
  }

  createGain() {
    const node = new FakeGain();
    this.gains.push(node);
    return node;
  }
}

describe('background music', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetModules();
    FakeAudioContext.instances = [];
    window.localStorage.removeItem('cosmic-communalka-muted');
    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      value: FakeAudioContext
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('fails safely when Web Audio is unavailable', async () => {
    Object.defineProperty(window, 'AudioContext', { configurable: true, value: undefined });
    const { startBackgroundMusic, stopBackgroundMusic } = await import('../platform/sound');

    expect(() => startBackgroundMusic()).not.toThrow();
    expect(() => stopBackgroundMusic()).not.toThrow();
  });

  it('does not create music while muted', async () => {
    const { setMuted, startBackgroundMusic } = await import('../platform/sound');
    setMuted(true);

    startBackgroundMusic();

    expect(FakeAudioContext.instances).toHaveLength(0);
  });

  it('starts one score and ignores duplicate starts', async () => {
    const { startBackgroundMusic } = await import('../platform/sound');

    startBackgroundMusic();
    const context = FakeAudioContext.instances[0];
    const oscillatorCount = context.oscillators.length;
    const timerCount = vi.getTimerCount();
    startBackgroundMusic();

    expect(oscillatorCount).toBeGreaterThan(0);
    expect(context.oscillators).toHaveLength(oscillatorCount);
    expect(timerCount).toBeGreaterThan(0);
    expect(vi.getTimerCount()).toBe(timerCount);
  });

  it('fades out, stops scheduled voices, and can stop twice', async () => {
    const { startBackgroundMusic, stopBackgroundMusic } = await import('../platform/sound');
    startBackgroundMusic();
    const context = FakeAudioContext.instances[0];
    const scheduledStopCalls = context.oscillators.reduce(
      (total, node) => total + node.stop.mock.calls.length,
      0
    );

    expect(() => stopBackgroundMusic()).not.toThrow();
    expect(() => stopBackgroundMusic()).not.toThrow();
    vi.advanceTimersByTime(600);

    const finalStopCalls = context.oscillators.reduce(
      (total, node) => total + node.stop.mock.calls.length,
      0
    );
    expect(finalStopCalls).toBeGreaterThan(scheduledStopCalls);
    expect(vi.getTimerCount()).toBe(0);
  });
});
