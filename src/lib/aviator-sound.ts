// Lightweight WebAudio sound engine for the Aviator game.
// Effects are synthesized; background music uses the uploaded MP3 asset.

import bgMusicUrl from "../assets/bg-music.mp3";

let ctx: AudioContext | null = null;

// --- Background music (uploaded MP3, looped) ---
let musicEl: HTMLAudioElement | null = null;

export function startMusic(): void {
  if (typeof window === "undefined") return;
  if (!musicEl) {
    musicEl = new Audio(bgMusicAsset.url);
    musicEl.loop = true;
    musicEl.volume = 0.5;
  }
  void musicEl.play().catch(() => { /* blocked until user interaction */ });
}

export function stopMusic(): void {
  if (!musicEl) return;
  musicEl.pause();
  musicEl.currentTime = 0;
}

function audioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function masterGain(context: AudioContext, volume: number): GainNode {
  const gain = context.createGain();
  gain.gain.value = volume;
  gain.connect(context.destination);
  return gain;
}

// --- Engine hum (looped while flying) ---
let engineNodes: { osc: OscillatorNode; lfo: OscillatorNode; gain: GainNode } | null = null;

export function startEngineHum(): void {
  const context = audioContext();
  if (!context || engineNodes) return;
  const osc = context.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.value = 85;
  const lfo = context.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 9;
  const lfoGain = context.createGain();
  lfoGain.gain.value = 14;
  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);
  const gain = masterGain(context, 0.045);
  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 420;
  osc.connect(filter);
  filter.connect(gain);
  osc.start();
  lfo.start();
  engineNodes = { osc, lfo, gain };
}

export function stopEngineHum(): void {
  if (!engineNodes || !ctx) return;
  const { osc, lfo, gain } = engineNodes;
  engineNodes = null;
  gain.gain.setTargetAtTime(0, ctx.currentTime, 0.08);
  window.setTimeout(() => {
    try { osc.stop(); lfo.stop(); } catch { /* already stopped */ }
  }, 300);
}

// --- One-shot effects ---
function blip(frequency: number, duration: number, volume: number, type: OscillatorType = "sine", slideTo?: number): void {
  const context = audioContext();
  if (!context) return;
  const osc = context.createOscillator();
  osc.type = type;
  osc.frequency.value = frequency;
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, context.currentTime + duration);
  const gain = masterGain(context, 0);
  gain.gain.setValueAtTime(volume, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
  osc.connect(gain);
  osc.start();
  osc.stop(context.currentTime + duration);
}

function noiseBurst(duration: number, volume: number, filterFreq: number): void {
  const context = audioContext();
  if (!context) return;
  const length = Math.floor(context.sampleRate * duration);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  const source = context.createBufferSource();
  source.buffer = buffer;
  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = filterFreq;
  const gain = masterGain(context, volume);
  source.connect(filter);
  filter.connect(gain);
  source.start();
}

export function playBetClick(): void {
  blip(660, 0.09, 0.12, "triangle");
}

export function playTakeoff(): void {
  blip(220, 0.5, 0.1, "sawtooth", 520);
}

export function playCashout(): void {
  blip(880, 0.12, 0.14, "sine");
  window.setTimeout(() => blip(1320, 0.18, 0.14, "sine"), 110);
}

export function playCrash(): void {
  noiseBurst(0.6, 0.35, 900);
  blip(160, 0.5, 0.2, "square", 40);
}
