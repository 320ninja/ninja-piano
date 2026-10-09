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
};

export const playNote = (midi, { duration = 0.8, velocity = 0.8, when = 0, voice = 'grand', volume = 0.8 } = {}) => {
  ensure();
  const v = VOICES[voice] || VOICES.grand;
  const t = ctx.currentTime + Math.max(0, when);
  const f = freq(midi);
  // Low notes ring longer, high notes die faster, like real strings.
  const ring = Math.min(v.decay * (1.4 - (midi - 21) / 110), 4);
  const len = Math.max(duration, 0.25) + ring * 0.5;

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
