let ctx: AudioContext | null = null;

/** Muss einmal durch eine Nutzer-Geste aufgerufen werden (Tippen), sonst blockt der Browser den Ton. */
export function unlockAudio() {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
  } catch {
    /* kein Audio verfügbar */
  }
}

export function beep(freq = 880, ms = 250) {
  try {
    unlockAudio();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = freq;
    gain.gain.value = 0.15;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + ms / 1000);
  } catch {
    /* ignorieren */
  }
}
