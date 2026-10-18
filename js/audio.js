// Piano sound, synthesised with Web Audio so the app works fully offline.
let ctx = null;
let master = null;
let reverb = null;

const ensure = () => {
  if (ctx) return ctx;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  master = ctx.createDynamicsCompressor();
  master.threshold.value = -14;
  master.ratio.value = 4;
  const out = ctx.createGain();
  out.gain.value = 0.9;
  master.connect(out).connect(ctx.destination);
  // Short room reverb from a decaying noise impulse.
  reverb = ctx.createConvolver();
  const len = ctx.sampleRate * 1.6;
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  }
  reverb.buffer = buf;
  const wet = ctx.createGain();
  wet.gain.value = 0.18;
  reverb.connect(wet).connect(master);
  return ctx;
};

// iOS only starts audio inside a user gesture.
export const unlockAudio = () => {
  ensure();
  if (ctx.state === 'suspended') ctx.resume();
};

const freq = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

const VOICES = {
  grand: { partials: [[1, 1], [2, 0.45], [3, 0.22], [4, 0.12], [5, 0.06], [6, 0.03]], decay: 2.6, type: 'sine', bright: 5200 },
  bright: { partials: [[1, 1], [2, 0.6], [3, 0.4], [4, 0.25], [6, 0.12]], decay: 2.0, type: 'triangle', bright: 8000 },
  electric: { partials: [[1, 1], [2, 0.18], [4, 0.3]], decay: 1.6, type: 'sine', bright: 3200, trem: true },
  soft: { partials: [[1, 1], [2, 0.12]], decay: 1.8, type: 'sine', bright: 1800 },
  synth: { partials: [[1, 0.7], [1.005, 0.7]], decay: 0.9, type: 'sawtooth', bright: 3600 },
  organ: { partials: [[1, 1], [2, 1], [3, 1], [4, 0.5], [6, 0.5]], decay: 4.0, type: 'sine', bright: 4000 },
  edm: { partials: [[1, 0.9], [2, 0.8], [3, 0.5], [1.001, 0.9]], decay: 0.6, type: 'square', bright: 6000, trem: true },
};

// Bass-specific voices — tuned for low register with more punch
const BASS_VOICES = {
  'Electric':  { partials: [[1,1],[2,0.5],[3,0.25],[4,0.1]], decay: 1.4, type: 'triangle', bright: 1400, gainMult: 3.0 },
  'Synth Sub': { partials: [[1,1],[2,0.6],[1.002,0.5]], decay: 1.0, type: 'sawtooth', bright: 900, gainMult: 3.2 },
  'Slap':      { partials: [[1,1],[2,0.7],[3,0.4],[4,0.2]], decay: 0.5, type: 'triangle', bright: 2800, gainMult: 3.5, slap: true },
  'Upright':   { partials: [[1,1],[2,0.28],[3,0.08]], decay: 2.0, type: 'sine', bright: 700, gainMult: 2.8 },
  'Fretless':  { partials: [[1,1],[2,0.32],[3,0.1],[4,0.04]], decay: 2.4, type: 'sine', bright: 1000, gainMult: 2.8, slide: true },
  'Funk':      { partials: [[1,1],[2,0.8],[3,0.5],[4,0.25],[1.003,0.6]], decay: 0.7, type: 'sawtooth', bright: 2200, gainMult: 3.4 },
  'Deep Sub':  { partials: [[1,1],[2,0.2]], decay: 1.6, type: 'sine', bright: 400, gainMult: 4.0 },
  'Moog':      { partials: [[1,1],[2,0.9],[3,0.7],[4,0.5],[5,0.3]], decay: 0.8, type: 'sawtooth', bright: 1600, gainMult: 3.0 },
};

export const playBassNote = (midi, { duration = 0.8, velocity = 0.9, when = 0, voice = 'Electric', volume = 0.7 } = {}) => {
  ensure();
  const v = BASS_VOICES[voice] || BASS_VOICES['Electric'];
  const t = ctx.currentTime + Math.max(0, when);
  const f = freq(midi);
  const ring = Math.min(v.decay * 1.5, 3);
  const len = Math.max(duration, 0.2) + ring * 0.4;

  const env = ctx.createGain();
  const peak = velocity * volume * 0.32 * (v.gainMult || 2.5);
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(peak, t + (v.slap ? 0.002 : 0.008));
  env.gain.exponentialRampToValueAtTime(peak * 0.5, t + 0.06);
  env.gain.exponentialRampToValueAtTime(peak * 0.28, t + Math.max(duration, 0.15));
  env.gain.exponentialRampToValueAtTime(0.0001, t + len);

  // Low-pass filter keeping warmth, rolling off harshness
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(Math.min(v.bright + f * 3, 8000), t);
  filter.frequency.exponentialRampToValueAtTime(Math.max(f * 1.2, 200), t + len);
  filter.Q.value = 1.2;
  env.connect(filter);

  // Subtle sub boost
  const sub = ctx.createBiquadFilter();
  sub.type = 'peaking';
  sub.frequency.value = Math.min(f * 1.5, 200);
  sub.gain.value = 6;
  sub.Q.value = 1;
  filter.connect(sub);
  sub.connect(master);
  // Less reverb for bass (keep it tight)
  const wetG = ctx.createGain();
  wetG.gain.value = 0.06;
  sub.connect(wetG).connect(reverb);

  for (const [mult, amp] of v.partials) {
    const osc = ctx.createOscillator();
    osc.type = mult === Math.round(mult) ? v.type : 'sine';
    osc.frequency.value = f * mult;
    if (v.slide) {
      osc.frequency.setValueAtTime(f * mult * 0.97, t);
      osc.frequency.exponentialRampToValueAtTime(f * mult, t + 0.04);
    }
    const g = ctx.createGain();
    g.gain.value = amp / v.partials.length;
    osc.connect(g).connect(env);
    osc.start(t);
    osc.stop(t + len + 0.05);
  }
  // Slap click transient
  if (v.slap) {
    const nb = ctx.createBuffer(1, ctx.sampleRate * 0.02, ctx.sampleRate);
    const nd = nb.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = (Math.random()*2-1) * (1 - i/nd.length);
    const ns = ctx.createBufferSource(); ns.buffer = nb;
    const nf = ctx.createBiquadFilter(); nf.type='bandpass'; nf.frequency.value=f*5; nf.Q.value=0.5;
    const ng = ctx.createGain(); ng.gain.value = peak * 0.4;
    ns.connect(nf).connect(ng).connect(master);
    ns.start(t);
  }
};

let sustainOn = false;
export const setSustain = (on) => { sustainOn = on; };
export const getSustain = () => sustainOn;

export const playNote = (midi, { duration = 0.8, velocity = 0.8, when = 0, voice = 'grand', volume = 0.8 } = {}) => {
  ensure();
  const v = VOICES[voice] || VOICES.grand;
  const t = ctx.currentTime + Math.max(0, when);
  const f = freq(midi);
  // Sustain pedal: multiply ring and duration by 3×
  const sustainMult = sustainOn ? 3 : 1;
  const ring = Math.min(v.decay * (1.4 - (midi - 21) / 110) * sustainMult, 8);
  const len = Math.max(duration * sustainMult, 0.25) + ring * 0.5;

  const env = ctx.createGain();
  const peak = velocity * volume * 0.32;
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(peak, t + 0.005);
  env.gain.exponentialRampToValueAtTime(peak * 0.45, t + 0.12);
  env.gain.exponentialRampToValueAtTime(peak * 0.25, t + Math.max(duration, 0.2));
  env.gain.exponentialRampToValueAtTime(0.0001, t + len);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(Math.min(v.bright + f * 2, 16000), t);
  filter.frequency.exponentialRampToValueAtTime(Math.max(f * 1.5, 400), t + len);
  env.connect(filter);
  filter.connect(master);
  filter.connect(reverb);

  for (const [mult, amp] of v.partials) {
    const osc = ctx.createOscillator();
    osc.type = mult === 1 ? v.type : 'sine';
    osc.frequency.value = f * mult * (1 + (mult - 1) * 0.0004); // slight inharmonicity
    const g = ctx.createGain();
    g.gain.value = amp / v.partials.length;
    osc.connect(g).connect(env);
    osc.start(t);
    osc.stop(t + len + 0.05);
  }
  if (v.trem) {
    const lfo = ctx.createOscillator();
    const depth = ctx.createGain();
    lfo.frequency.value = 5;
    depth.gain.value = peak * 0.25;
    lfo.connect(depth).connect(env.gain);
    lfo.start(t);
    lfo.stop(t + len);
  }
  // Hammer click.
  const noise = ctx.createBufferSource();
  const nb = ctx.createBuffer(1, ctx.sampleRate * 0.03, ctx.sampleRate);
  const nd = nb.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = (Math.random() * 2 - 1) * (1 - i / nd.length);
  noise.buffer = nb;
  const ng = ctx.createGain();
  ng.gain.value = peak * 0.08;
  const nf = ctx.createBiquadFilter();
  nf.type = 'bandpass';
  nf.frequency.value = f * 4;
  noise.connect(nf).connect(ng).connect(master);
  noise.start(t);
};

export const playClick = (accent, when = 0) => {
  ensure();
  const t = ctx.currentTime + when;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.frequency.value = accent ? 1600 : 1100;
  g.gain.setValueAtTime(0.25, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + 0.06);
};

export const now = () => (ctx ? ctx.currentTime : 0);

// ── Drum synthesis ──────────────────────────────────────────────────────────
export const playKick = (when = 0, vol = 0.7) => {
  ensure();
  const t = ctx.currentTime + when;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.frequency.setValueAtTime(150, t);
  o.frequency.exponentialRampToValueAtTime(40, t + 0.15);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
  o.connect(g).connect(master);
  o.start(t); o.stop(t + 0.36);
};

export const playSnare = (when = 0, vol = 0.5) => {
  ensure();
  const t = ctx.currentTime + when;
  // Tonal body
  const o = ctx.createOscillator();
  const og = ctx.createGain();
  o.frequency.value = 200;
  og.gain.setValueAtTime(vol * 0.6, t);
  og.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
  o.connect(og).connect(master);
  o.start(t); o.stop(t + 0.13);
  // Noise snare body
  const nb = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
  const d = nb.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = nb;
  const nf = ctx.createBiquadFilter();
  nf.type = 'bandpass'; nf.frequency.value = 3000; nf.Q.value = 0.8;
  const ng = ctx.createGain();
  ng.gain.setValueAtTime(vol * 0.8, t);
  ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
  noise.connect(nf).connect(ng).connect(master);
  noise.start(t);
};

export const playHihat = (when = 0, vol = 0.25, open = false) => {
  ensure();
  const t = ctx.currentTime + when;
  const nb = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
  const d = nb.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = nb;
  const nf = ctx.createBiquadFilter();
  nf.type = 'highpass'; nf.frequency.value = 8000;
  const ng = ctx.createGain();
  const decay = open ? 0.3 : 0.06;
  ng.gain.setValueAtTime(vol, t);
  ng.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  noise.connect(nf).connect(ng).connect(master);
  noise.start(t);
};

let outGain = null;
const ensure2 = () => { ensure(); return outGain; };

export const stopAllAudio = () => {
  if (!ctx) return;
  // Close and recreate the AudioContext to kill all in-flight nodes.
  ctx.close().catch(() => {});
  ctx = null; master = null; reverb = null; outGain = null;
};
