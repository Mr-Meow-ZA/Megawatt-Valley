/** Lightweight procedural SFX via Web Audio API (no files / deps). */

export type SfxName =
  | 'click'
  | 'place'
  | 'commission'
  | 'fault'
  | 'repair'
  | 'clean'
  | 'unlock'
  | 'event'
  | 'hail'
  | 'star'
  | 'error'
  | 'save';

const MUTE_KEY = 'mv-sfx-muted';
const MASTER_GAIN = 0.15;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = readMuted();
let unavailable = false;

function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

function writeMuted(value: boolean): void {
  try {
    localStorage.setItem(MUTE_KEY, value ? '1' : '0');
  } catch {
    /* ignore quota / private mode */
  }
}

function ensureContext(): AudioContext | null {
  if (unavailable) return null;
  if (ctx) return ctx;

  const AC =
    typeof window !== 'undefined'
      ? window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      : undefined;

  if (!AC) {
    unavailable = true;
    return null;
  }

  try {
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : MASTER_GAIN;
    master.connect(ctx.destination);
  } catch {
    unavailable = true;
    ctx = null;
    master = null;
    return null;
  }

  return ctx;
}

/** Resume / create AudioContext on first user gesture. Safe to call repeatedly. */
export function initAudio(): void {
  const c = ensureContext();
  if (!c) return;
  if (c.state === 'suspended') {
    void c.resume().catch(() => {
      /* autoplay policy — ignore */
    });
  }
}

export function setMuted(value: boolean): void {
  muted = value;
  writeMuted(value);
  if (master) {
    master.gain.value = muted ? 0 : MASTER_GAIN;
  }
}

export function isMuted(): boolean {
  return muted;
}

/** Flip mute and return the new muted state. */
export function toggleMute(): boolean {
  setMuted(!muted);
  return muted;
}

function now(): number {
  return ctx?.currentTime ?? 0;
}

function tone(
  freq: number,
  start: number,
  dur: number,
  type: OscillatorType = 'sine',
  vol = 1,
  slideTo?: number,
): void {
  if (!ctx || !master) return;

  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (slideTo !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), start + dur);
  }

  const peak = Math.max(0.0001, vol);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(peak, start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);

  osc.connect(g);
  g.connect(master);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

function noiseBurst(start: number, dur: number, vol = 0.4, bandHz?: number): void {
  if (!ctx || !master) return;

  const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const src = ctx.createBufferSource();
  src.buffer = buffer;

  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0001, vol), start + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);

  if (bandHz !== undefined) {
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = bandHz;
    filter.Q.value = 1.2;
    src.connect(filter);
    filter.connect(g);
  } else {
    src.connect(g);
  }

  g.connect(master);
  src.start(start);
  src.stop(start + dur + 0.02);
}

function playNamed(name: SfxName): void {
  const t = now();

  switch (name) {
    case 'click':
      tone(880, t, 0.04, 'square', 0.25);
      break;
    case 'place':
      tone(320, t, 0.06, 'triangle', 0.35);
      tone(480, t + 0.04, 0.08, 'triangle', 0.28);
      break;
    case 'commission':
      tone(440, t, 0.1, 'sine', 0.3);
      tone(554, t + 0.08, 0.1, 'sine', 0.28);
      tone(659, t + 0.16, 0.14, 'sine', 0.32);
      break;
    case 'fault':
      tone(220, t, 0.18, 'sawtooth', 0.3, 90);
      noiseBurst(t, 0.12, 0.2, 400);
      break;
    case 'repair':
      tone(500, t, 0.07, 'square', 0.2);
      tone(700, t + 0.06, 0.09, 'triangle', 0.28);
      break;
    case 'clean':
      noiseBurst(t, 0.1, 0.22, 2400);
      tone(1200, t, 0.08, 'sine', 0.15, 1800);
      break;
    case 'unlock':
      tone(523, t, 0.08, 'sine', 0.28);
      tone(659, t + 0.07, 0.08, 'sine', 0.28);
      tone(784, t + 0.14, 0.12, 'sine', 0.34);
      tone(1046, t + 0.22, 0.16, 'sine', 0.3);
      break;
    case 'event':
      tone(392, t, 0.12, 'triangle', 0.3);
      tone(494, t + 0.1, 0.14, 'triangle', 0.28);
      break;
    case 'hail':
      noiseBurst(t, 0.05, 0.18, 1800);
      noiseBurst(t + 0.04, 0.05, 0.14, 2200);
      noiseBurst(t + 0.08, 0.06, 0.12, 1600);
      break;
    case 'star':
      tone(880, t, 0.1, 'sine', 0.28, 1320);
      tone(1320, t + 0.08, 0.14, 'sine', 0.22);
      break;
    case 'error':
      tone(180, t, 0.12, 'square', 0.28);
      tone(140, t + 0.1, 0.16, 'square', 0.24);
      break;
    case 'save':
      tone(660, t, 0.06, 'sine', 0.22);
      tone(990, t + 0.05, 0.1, 'sine', 0.26);
      break;
  }
}

export function playSfx(name: SfxName): void {
  if (muted || unavailable) return;
  const c = ensureContext();
  if (!c || !master) return;
  if (c.state === 'suspended') {
    void c.resume().catch(() => undefined);
  }
  try {
    playNamed(name);
  } catch {
    /* ignore synthesis failures */
  }
}
