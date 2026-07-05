/**
 * Lightweight sound effects via the Web Audio API. No audio assets needed —
 * all sounds are synthesized procedurally so the bundle stays small for
 * Yandex Games. Sounds respect a global mute flag persisted to localStorage.
 */

type SoundName =
  | 'purchase'
  | 'reward'
  | 'unlock'
  | 'prestige'
  | 'error'
  | 'click'
  | 'daily'
  | 'incident'
  | 'boost';

const MUTE_KEY = 'cosmic-communalka-muted';

let ctx: AudioContext | null = null;
let muted = false;

function getMutedFromStorage(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.localStorage.getItem(MUTE_KEY) === '1';
}

function ensureContext(): AudioContext | null {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!ctx) {
    const AudioCtor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioCtor) {
      return null;
    }

    ctx = new AudioCtor();
  }

  // Browsers suspend AudioContext until a user gesture; resume on demand.
  if (ctx.state === 'suspended') {
    void ctx.resume();
  }

  return ctx;
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.12,
  delay = 0
): void {
  if (muted) {
    return;
  }

  const audioCtx = ensureContext();

  if (!audioCtx) {
    return;
  }

  const start = audioCtx.currentTime + delay;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);

  // Quick attack, exponential decay — feels like a retro game blip.
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(start);
  osc.stop(start + duration + 0.02);
}

const soundPresets: Record<SoundName, () => void> = {
  purchase: () => {
    playTone(523.25, 0.12, 'triangle', 0.1); // C5
    playTone(659.25, 0.14, 'triangle', 0.1, 0.06); // E5
  },
  reward: () => {
    playTone(659.25, 0.1, 'sine', 0.12); // E5
    playTone(783.99, 0.1, 'sine', 0.12, 0.08); // G5
    playTone(1046.5, 0.18, 'sine', 0.12, 0.16); // C6
  },
  unlock: () => {
    playTone(440, 0.1, 'square', 0.06); // A4
    playTone(660, 0.16, 'square', 0.06, 0.08); // E5
  },
  prestige: () => {
    playTone(261.63, 0.2, 'sawtooth', 0.08); // C4
    playTone(392, 0.2, 'sawtooth', 0.08, 0.1); // G4
    playTone(523.25, 0.3, 'sawtooth', 0.08, 0.2); // C5
  },
  error: () => {
    playTone(180, 0.18, 'sawtooth', 0.08);
  },
  click: () => {
    playTone(420, 0.04, 'square', 0.04);
  },
  daily: () => {
    playTone(587.33, 0.1, 'sine', 0.1); // D5
    playTone(880, 0.16, 'sine', 0.1, 0.08); // A5
  },
  incident: () => {
    // Curious two-tone "something happened" chime
    playTone(523.25, 0.08, 'triangle', 0.08); // C5
    playTone(622.25, 0.08, 'triangle', 0.08, 0.06); // Eb5
    playTone(739.99, 0.14, 'triangle', 0.08, 0.12); // F#5
  },
  boost: () => {
    // Rising arpeggio for ad-activated income boost
    playTone(392, 0.08, 'sawtooth', 0.07); // G4
    playTone(523.25, 0.08, 'sawtooth', 0.07, 0.06); // C5
    playTone(659.25, 0.08, 'sawtooth', 0.07, 0.12); // E5
    playTone(880, 0.2, 'sawtooth', 0.07, 0.18); // A5
  }
};

export function playSound(name: SoundName): void {
  soundPresets[name]?.();
}

export function isMuted(): boolean {
  if (muted === undefined) {
    muted = getMutedFromStorage();
  }

  return muted;
}

export function setMuted(value: boolean): void {
  muted = value;

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(MUTE_KEY, value ? '1' : '0');
  }
}

export function toggleMuted(): boolean {
  setMuted(!isMuted());
  return muted;
}

/**
 * Suspend the AudioContext when the page is hidden (requirement 1.3).
 * Browsers do this automatically in some cases, but explicit suspension
 * is required for Yandex Games moderation.
 */
export function suspendAudio(): void {
  if (ctx && ctx.state === 'running') {
    void ctx.suspend();
  }
}

export function resumeAudio(): void {
  if (ctx && ctx.state === 'suspended') {
    void ctx.resume();
  }
}

// Initialize from storage on module load + wire visibility change.
if (typeof window !== 'undefined') {
  muted = getMutedFromStorage();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      suspendAudio();
    } else {
      resumeAudio();
    }
  });
}
