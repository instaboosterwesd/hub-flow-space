// Background music for the Aviator game — plays only the user's uploaded MP3 (looped).
// No synthesized sound effects; the Music/Sound toggles control this single track.

import bgMusicUrl from "../assets/bg-music.mp3";

let musicEl: HTMLAudioElement | null = null;

export function startMusic(): void {
  if (typeof window === "undefined") return;
  if (!musicEl) {
    musicEl = new Audio(bgMusicUrl);
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
