// Tiny synthesized sound engine – no audio files required.
export type SoundName =
  | "click"
  | "points"
  | "minus"
  | "unlock"
  | "success"
  | "alarm"
  | "tick"
  | "go"
  | "fanfare"
  | "reveal"
  | "whoosh";

let ctx: AudioContext | null = null;
let muted = false;

export const setMuted = (m: boolean) => {
  muted = m;
};
export const isMuted = () => muted;

const getCtx = () => {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
};

interface ToneOpts {
  freq: number;
  start?: number;
  duration?: number;
  type?: OscillatorType;
  gain?: number;
  slideTo?: number;
}

const tone = (c: AudioContext, { freq, start = 0, duration = 0.15, type = "sine", gain = 0.18, slideTo }: ToneOpts) => {
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  const t0 = c.currentTime + start;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + duration);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
};

export const playSound = (name: SoundName) => {
  if (muted) return;
  const c = getCtx();
  if (!c) return;
  try {
    switch (name) {
      case "click":
        tone(c, { freq: 600, duration: 0.07, type: "square", gain: 0.06 });
        break;
      case "tick":
        tone(c, { freq: 880, duration: 0.12, type: "triangle", gain: 0.15 });
        break;
      case "go":
        tone(c, { freq: 660, duration: 0.5, type: "triangle", gain: 0.2 });
        tone(c, { freq: 990, duration: 0.5, type: "triangle", gain: 0.2 });
        tone(c, { freq: 1320, start: 0.05, duration: 0.6, type: "sine", gain: 0.15 });
        break;
      case "points":
        tone(c, { freq: 880, duration: 0.1, type: "triangle" });
        tone(c, { freq: 1320, start: 0.09, duration: 0.18, type: "triangle" });
        break;
      case "minus":
        tone(c, { freq: 500, duration: 0.1, type: "triangle" });
        tone(c, { freq: 350, start: 0.09, duration: 0.18, type: "triangle" });
        break;
      case "unlock":
        [523, 659, 784, 1047].forEach((f, i) => tone(c, { freq: f, start: i * 0.09, duration: 0.2, type: "triangle" }));
        tone(c, { freq: 1568, start: 0.4, duration: 0.5, type: "sine", gain: 0.14 });
        break;
      case "success":
        [523, 659, 784, 1047, 1319].forEach((f, i) => tone(c, { freq: f, start: i * 0.1, duration: 0.25, type: "triangle" }));
        [1047, 1319, 1568].forEach((f) => tone(c, { freq: f, start: 0.55, duration: 0.8, type: "sine", gain: 0.1 }));
        break;
      case "fanfare":
        [392, 392, 392, 523].forEach((f, i) => tone(c, { freq: f, start: i * 0.14, duration: 0.14, type: "square", gain: 0.08 }));
        [659, 784, 1047].forEach((f, i) => tone(c, { freq: f, start: 0.6 + i * 0.15, duration: 0.3, type: "triangle", gain: 0.15 }));
        [523, 659, 784, 1047].forEach((f) => tone(c, { freq: f, start: 1.1, duration: 1.2, type: "sine", gain: 0.09 }));
        break;
      case "alarm":
        for (let i = 0; i < 4; i++) {
          tone(c, { freq: 700, start: i * 0.3, duration: 0.15, type: "sawtooth", gain: 0.08, slideTo: 1000 });
          tone(c, { freq: 1000, start: i * 0.3 + 0.15, duration: 0.15, type: "sawtooth", gain: 0.08, slideTo: 700 });
        }
        break;
      case "reveal":
        tone(c, { freq: 200, duration: 0.6, type: "sawtooth", gain: 0.08, slideTo: 1200 });
        tone(c, { freq: 1200, start: 0.55, duration: 0.4, type: "sine", gain: 0.15 });
        break;
      case "whoosh":
        tone(c, { freq: 300, duration: 0.3, type: "sine", gain: 0.1, slideTo: 1500 });
        break;
    }
  } catch {
    /* ignore audio errors */
  }
};
