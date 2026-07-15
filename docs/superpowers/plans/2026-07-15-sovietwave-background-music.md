# Sovietwave Background Music Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an original, low-volume procedural sovietwave loop that follows the game's existing sound, mute, and visibility lifecycle.

**Architecture:** Extend `src/platform/sound.ts` with an idempotent Web Audio music scheduler. It schedules a sparse 16-beat score ahead of playback through one master gain node, then `useGameState` starts and stops it alongside the existing reactor hum.

**Tech Stack:** TypeScript 5.8, Web Audio API, React 19 hooks, Vitest 3, Testing Library, Vite 7.

## Global Constraints

- The composition is instrumental, original, and does not copy melodies or arrangements by ППВК or other artists.
- Tempo is 84 BPM, within the approved 80–90 BPM range.
- Use warm synth voices, a soft pulse, a calm bass line, and a sparse melancholic melody.
- Keep music below interface sound effects and retain the reactor hum as a quieter atmospheric layer.
- Use no external audio files, network requests, dependencies, new UI, or separate volume setting.
- Start only when the game is ready and unmuted; fade out on mute and suspend with the shared `AudioContext` when the page is hidden.
- All new behavior is implemented test-first.

---

## File Map

- Modify `src/platform/sound.ts`: define the original score, schedule Web Audio nodes, and export `startBackgroundMusic()` / `stopBackgroundMusic()`.
- Create `src/test/backgroundMusic.test.ts`: isolate and verify the music engine with a fake Web Audio implementation.
- Modify `src/ui/useGameState.ts`: connect music start/stop to readiness, mute, and hook cleanup.
- Create `src/test/useGameState.audio.test.ts`: verify the hook calls both ambient layers at the correct lifecycle points.

### Task 1: Procedural sovietwave music engine

**Files:**
- Modify: `src/platform/sound.ts:18-21, 176-285`
- Create: `src/test/backgroundMusic.test.ts`

**Interfaces:**
- Consumes: existing private `ensureContext(): AudioContext | null` and global `muted: boolean` from `src/platform/sound.ts`.
- Produces: `startBackgroundMusic(): void` and `stopBackgroundMusic(): void`.

- [ ] **Step 1: Write the failing engine tests**

Create `src/test/backgroundMusic.test.ts`:

```ts
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
    startBackgroundMusic();

    expect(oscillatorCount).toBeGreaterThan(0);
    expect(context.oscillators).toHaveLength(oscillatorCount);
    expect(vi.getTimerCount()).toBe(1);
  });

  it('fades out, stops scheduled voices, and can stop twice', async () => {
    const { startBackgroundMusic, stopBackgroundMusic } = await import('../platform/sound');
    startBackgroundMusic();
    const context = FakeAudioContext.instances[0];

    expect(() => stopBackgroundMusic()).not.toThrow();
    expect(() => stopBackgroundMusic()).not.toThrow();
    vi.advanceTimersByTime(600);

    expect(context.oscillators.every((node) => node.stop.mock.calls.length > 0)).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });
});
```

- [ ] **Step 2: Run the new test and verify RED**

Run: `npm test -- src/test/backgroundMusic.test.ts`

Expected: FAIL because `startBackgroundMusic` and `stopBackgroundMusic` are not exported.

- [ ] **Step 3: Implement the score scheduler**

Add below `resumeAudio()` and above the ambient-hum section in `src/platform/sound.ts`:

```ts
const MUSIC_BPM = 84;
const MUSIC_BEAT_SECONDS = 60 / MUSIC_BPM;
const MUSIC_LOOP_BEATS = 16;
const MUSIC_LOOP_SECONDS = MUSIC_BEAT_SECONDS * MUSIC_LOOP_BEATS;
const MUSIC_LOOKAHEAD_SECONDS = 2.5;

interface ActiveMusic {
  master: GainNode;
  voices: Set<OscillatorNode>;
  schedulerId: number;
  nextLoopAt: number;
}

let activeMusic: ActiveMusic | null = null;

function scheduleMusicVoice(
  audioCtx: AudioContext,
  music: ActiveMusic,
  frequency: number,
  beat: number,
  beatsLong: number,
  type: OscillatorType,
  volume: number
): void {
  const start = music.nextLoopAt + beat * MUSIC_BEAT_SECONDS;
  const duration = beatsLong * MUSIC_BEAT_SECONDS;
  const oscillator = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain);
  gain.connect(music.master);
  music.voices.add(oscillator);
  oscillator.addEventListener('ended', () => {
    music.voices.delete(oscillator);
    oscillator.disconnect();
    gain.disconnect();
  }, { once: true });
  oscillator.start(start);
  oscillator.stop(start + duration + 0.05);
}

function scheduleMusicLoop(audioCtx: AudioContext, music: ActiveMusic): void {
  const chords = [
    [220, 261.63, 329.63],
    [174.61, 220, 261.63],
    [130.81, 164.81, 196],
    [196, 246.94, 293.66]
  ];
  const bass = [110, 110, 87.31, 87.31, 65.41, 65.41, 98, 98];
  const melody = [329.63, 440, 523.25, 493.88, 392, 329.63, 293.66, 246.94];

  chords.forEach((chord, chordIndex) => {
    chord.forEach((frequency) => {
      scheduleMusicVoice(audioCtx, music, frequency, chordIndex * 4, 3.8, 'triangle', 0.022);
    });
  });

  bass.forEach((frequency, index) => {
    scheduleMusicVoice(audioCtx, music, frequency, index * 2, 1.5, 'sine', 0.038);
  });

  melody.forEach((frequency, index) => {
    scheduleMusicVoice(audioCtx, music, frequency, index * 2 + 0.5, 0.85, 'triangle', 0.018);
  });

  for (let beat = 0; beat < MUSIC_LOOP_BEATS; beat += 2) {
    scheduleMusicVoice(audioCtx, music, 68, beat, 0.18, 'sine', 0.03);
  }
}

function scheduleUpcomingMusic(audioCtx: AudioContext, music: ActiveMusic): void {
  while (music.nextLoopAt < audioCtx.currentTime + MUSIC_LOOKAHEAD_SECONDS) {
    scheduleMusicLoop(audioCtx, music);
    music.nextLoopAt += MUSIC_LOOP_SECONDS;
  }
}

export function startBackgroundMusic(): void {
  if (muted || activeMusic) {
    return;
  }

  const audioCtx = ensureContext();
  if (!audioCtx) {
    return;
  }

  try {
    const master = audioCtx.createGain();
    const now = audioCtx.currentTime;
    master.gain.setValueAtTime(0, now);
    master.gain.linearRampToValueAtTime(0.035, now + 2.5);
    master.connect(audioCtx.destination);

    const music: ActiveMusic = {
      master,
      voices: new Set(),
      schedulerId: 0,
      nextLoopAt: now + 0.05
    };
    activeMusic = music;
    scheduleUpcomingMusic(audioCtx, music);
    music.schedulerId = window.setInterval(() => {
      scheduleUpcomingMusic(audioCtx, music);
    }, 1000);
  } catch {
    activeMusic = null;
  }
}

export function stopBackgroundMusic(): void {
  const music = activeMusic;
  if (!music || !ctx) {
    activeMusic = null;
    return;
  }

  activeMusic = null;
  window.clearInterval(music.schedulerId);
  const now = ctx.currentTime;
  music.master.gain.cancelScheduledValues(now);
  music.master.gain.setValueAtTime(music.master.gain.value, now);
  music.master.gain.linearRampToValueAtTime(0, now + 0.5);

  window.setTimeout(() => {
    music.voices.forEach((voice) => {
      try {
        voice.stop();
        voice.disconnect();
      } catch {
        // Voice may already have ended.
      }
    });
    music.voices.clear();
    music.master.disconnect();
  }, 600);
}
```

Reduce the reactor-hum target at `src/platform/sound.ts:222` from `0.025` to `0.015` so it remains underneath the music:

```ts
humGain.gain.linearRampToValueAtTime(0.015, now + 2.5);
```

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `npm test -- src/test/backgroundMusic.test.ts src/test/sound.test.ts`

Expected: both test files PASS with no unhandled timer or audio-node errors.

- [ ] **Step 5: Commit the engine**

```bash
git add src/platform/sound.ts src/test/backgroundMusic.test.ts
git commit -m "feat: add procedural sovietwave music engine"
```

### Task 2: Game-state audio lifecycle

**Files:**
- Modify: `src/ui/useGameState.ts:39, 503-528`
- Create: `src/test/useGameState.audio.test.ts`

**Interfaces:**
- Consumes: `startBackgroundMusic(): void` and `stopBackgroundMusic(): void` from Task 1.
- Produces: readiness, mute, unmute, and unmount lifecycle integration for both music and ambient hum.

- [ ] **Step 1: Write the failing hook lifecycle tests**

Create `src/test/useGameState.audio.test.ts`:

```ts
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createLocalStoragePort } from '../platform/storage';
import type { YandexPlatform } from '../platform/yandex';

const sound = vi.hoisted(() => ({
  isMuted: vi.fn(() => false),
  playSound: vi.fn(),
  toggleMuted: vi.fn(() => false),
  startAmbientHum: vi.fn(),
  stopAmbientHum: vi.fn(),
  startBackgroundMusic: vi.fn(),
  stopBackgroundMusic: vi.fn()
}));

vi.mock('../platform/sound', () => sound);

import { useGameState } from '../ui/useGameState';

function makeStorage() {
  const store = new Map<string, string>();
  return createLocalStoragePort({
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value); }
  } as Storage);
}

function makePlatform(): YandexPlatform {
  return {
    isAvailable: () => false,
    markReady: vi.fn(),
    showRewardedAd: vi.fn().mockResolvedValue(false),
    loadCloudSave: vi.fn().mockResolvedValue(null),
    saveCloud: vi.fn().mockResolvedValue(undefined),
    submitLeaderboardScore: vi.fn().mockResolvedValue(undefined),
    getLeaderboardEntries: vi.fn().mockResolvedValue([])
  };
}

afterEach(() => {
  vi.clearAllMocks();
  sound.isMuted.mockReturnValue(false);
  sound.toggleMuted.mockReturnValue(false);
});

describe('useGameState audio lifecycle', () => {
  it('starts both ambient layers when ready and stops both on unmount', async () => {
    const { result, unmount } = renderHook(() => useGameState(makeStorage(), makePlatform()));
    await waitFor(() => expect(result.current.ready).toBe(true));

    expect(sound.startAmbientHum).toHaveBeenCalledTimes(1);
    expect(sound.startBackgroundMusic).toHaveBeenCalledTimes(1);
    unmount();
    expect(sound.stopAmbientHum).toHaveBeenCalledTimes(1);
    expect(sound.stopBackgroundMusic).toHaveBeenCalledTimes(1);
  });

  it('stops both ambient layers when sound is muted', async () => {
    sound.toggleMuted.mockReturnValueOnce(true);
    const { result } = renderHook(() => useGameState(makeStorage(), makePlatform()));
    await waitFor(() => expect(result.current.ready).toBe(true));
    vi.clearAllMocks();

    act(() => result.current.toggleSound());

    expect(sound.stopAmbientHum).toHaveBeenCalled();
    expect(sound.stopBackgroundMusic).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the hook test and verify RED**

Run: `npm test -- src/test/useGameState.audio.test.ts`

Expected: FAIL because `useGameState` never calls `startBackgroundMusic` or `stopBackgroundMusic`.

- [ ] **Step 3: Connect music to the existing lifecycle**

Replace the sound import in `src/ui/useGameState.ts` with:

```ts
import {
  isMuted,
  playSound,
  startAmbientHum,
  startBackgroundMusic,
  stopAmbientHum,
  stopBackgroundMusic,
  toggleMuted
} from '../platform/sound';
```

Replace the toggle and effect block at `src/ui/useGameState.ts:503-528` with:

```ts
const toggleSound = useCallback(() => {
  const next = toggleMuted();
  setSoundMuted(next);
  if (next) {
    stopAmbientHum();
    stopBackgroundMusic();
  } else {
    playSound('click');
    startAmbientHum();
    startBackgroundMusic();
  }
}, []);

// Start ambient audio once the game is ready and sound is not muted.
// Browser autoplay policy may keep the shared AudioContext suspended until
// the first user gesture; the scheduled audio begins when it resumes.
useEffect(() => {
  if (!ready || soundMuted) {
    return;
  }

  startAmbientHum();
  startBackgroundMusic();

  return () => {
    stopAmbientHum();
    stopBackgroundMusic();
  };
}, [ready, soundMuted]);
```

- [ ] **Step 4: Run focused integration tests and verify GREEN**

Run: `npm test -- src/test/useGameState.audio.test.ts src/test/yandex-integration.test.ts src/test/responsive.test.tsx`

Expected: all three test files PASS.

- [ ] **Step 5: Run the full verification suite**

Run: `npm test`

Expected: all test files PASS.

Run: `npm run build`

Expected: TypeScript exits successfully and Vite creates `dist/` without build errors.

Run: `git diff --check`

Expected: no whitespace errors.

- [ ] **Step 6: Perform the browser audio check**

Run: `npm run dev` and open `http://127.0.0.1:5173`.

Verify:

1. After the first click, an original quiet sovietwave loop plays below interface effects.
2. The 16-beat boundary has no obvious silence or click.
3. The sound button fades both music and hum out and prevents effects.
4. Turning sound back on restarts both ambient layers without doubling them.
5. Switching away from the tab pauses audio; returning resumes it.

- [ ] **Step 7: Commit lifecycle integration**

```bash
git add src/ui/useGameState.ts src/test/useGameState.audio.test.ts
git commit -m "feat: connect background music lifecycle"
```
