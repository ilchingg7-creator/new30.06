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

// Procedural sovietwave background music. Notes are scheduled ahead through
// one master gain so the original 16-beat loop has no audible boundary gap.

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
      scheduleMusicVoice(audioCtx, music, frequency, chordIndex * 4, 4.05, 'triangle', 0.022);
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
    master.gain.linearRampToValueAtTime(0.28, now + 2.5);
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

// ── Ambient station hum ───────────────────────────────────────────
// A very low-volume continuous drone that plays while the game is active.
// Uses two detuned sine oscillators through a low-pass filter for a warm
// "station reactor" feel. Respects the global mute flag.

let humOscA: OscillatorNode | null = null;
let humOscB: OscillatorNode | null = null;
let humGain: GainNode | null = null;
let humFilter: BiquadFilterNode | null = null;
let humStarted = false;

export function startAmbientHum(): void {
  if (muted || humStarted) {
    return;
  }

  const audioCtx = ensureContext();

  if (!audioCtx) {
    return;
  }

  try {
    humFilter = audioCtx.createBiquadFilter();
    humFilter.type = 'lowpass';
    humFilter.frequency.value = 180;
    humFilter.Q.value = 0.7;

    humGain = audioCtx.createGain();
    humGain.gain.value = 0;

    humOscA = audioCtx.createOscillator();
    humOscA.type = 'sine';
    humOscA.frequency.value = 55; // A1 — deep reactor hum

    humOscB = audioCtx.createOscillator();
    humOscB.type = 'sine';
    humOscB.frequency.value = 82.41; // E2 — perfect fifth above, warm interval

    humOscA.connect(humFilter);
    humOscB.connect(humFilter);
    humFilter.connect(humGain);
    humGain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    humGain.gain.setValueAtTime(0, now);
    humGain.gain.linearRampToValueAtTime(0.015, now + 2.5); // fade in over 2.5s

    humOscA.start(now);
    humOscB.start(now);

    humStarted = true;
  } catch {
    // If oscillator creation fails (old browser), silently skip.
    humStarted = false;
  }
}

export function stopAmbientHum(): void {
  if (!humStarted || !ctx) {
    humStarted = false;
    return;
  }

  try {
    const now = ctx.currentTime;
    if (humGain) {
      humGain.gain.cancelScheduledValues(now);
      humGain.gain.setValueAtTime(humGain.gain.value, now);
      humGain.gain.linearRampToValueAtTime(0, now + 0.5);
    }

    const oscA = humOscA;
    const oscB = humOscB;

    window.setTimeout(() => {
      try {
        oscA?.stop();
        oscB?.stop();
        oscA?.disconnect();
        oscB?.disconnect();
        humFilter?.disconnect();
        humGain?.disconnect();
      } catch {
        // already cleaned up
      }
    }, 600);
  } catch {
    // ignore
  }

  humOscA = null;
  humOscB = null;
  humGain = null;
  humFilter = null;
  humStarted = false;
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
