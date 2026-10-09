// Song parsing, note naming and the playback/practice timeline.
const DUR = { w: 4, h: 2, q: 1, 8: 0.5, 16: 0.25 };
const STEP = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const CATEGORIES = ['Kids', 'Classical', 'Pop', 'Folk', 'Holiday', 'Hymns', 'Jazz', 'Blues', 'Rock', 'EDM', 'Fingerstyle', 'Exercises'];
export const SONG_FILES = ['kids', 'classical', 'pop', 'folk', 'holiday', 'hymns', 'jazz', 'blues', 'blues-patterns', 'rock', 'edm', 'fingerstyle', 'hard', 'jazz-hard', 'blues-hard', 'exercises'];

// Key signatures: sharps/flats each letter takes by default.
const KEY_SIG = {
  C: {}, Am: {},
  G: { F: '#' }, Em: { F: '#' },
  D: { F: '#', C: '#' }, Bm: { F: '#', C: '#' },
  A: { F: '#', C: '#', G: '#' },
  E: { F: '#', C: '#', G: '#', D: '#' },
  F: { B: 'b' }, Dm: { B: 'b' },
  Bb: { B: 'b', E: 'b' }, Gm: { B: 'b', E: 'b' },
  Eb: { B: 'b', E: 'b', A: 'b' }, Cm: { B: 'b', E: 'b', A: 'b' },
  Ab: { B: 'b', E: 'b', A: 'b', D: 'b' },
};

export const parsePitch = (p) => {
  const m = /^([A-G])(#|b)?(\d)$/.exec(p);
  if (!m) return null;
  const acc = m[2] || '';
  const midi = 12 * (Number(m[3]) + 1) + STEP[m[1]] + (acc === '#' ? 1 : acc === 'b' ? -1 : 0);
  return { letter: m[1], acc, octave: Number(m[3]), midi, name: p };
};

const parseDuration = (d) => {
  const dotted = d.endsWith('d');
  const base = dotted ? d.slice(0, -1) : d;
  return { code: base, dotted, beats: DUR[base] * (dotted ? 1.5 : 1) };
};

const parseHand = (text) => text.split('|').map((bar) =>
  (bar.trim().match(/\([^)]*\)\/\S+|\S+/g) || []).map((tok) => {
    const slash = tok.lastIndexOf('/');
    const head = tok.slice(0, slash);
    const dur = parseDuration(tok.slice(slash + 1));
    if (head === 'r') return { rest: true, ...dur, pitches: [] };
    const names = head.startsWith('(') ? head.slice(1, -1).trim().split(/\s+/) : [head];
    return { rest: false, ...dur, pitches: names.map(parsePitch).filter(Boolean) };
  }));

export const parseSong = (song) => {
  const rh = parseHand(song.rh);
  const lh = parseHand(song.lh);
  const [num, den] = song.time.split('/').map(Number);
  const barBeats = num * (4 / den);
  return { ...song, rh, lh, num, den, barBeats, keySig: KEY_SIG[song.key] || {} };
};

// Every sounding note, with absolute start time in beats.
// Ids match the ids the score renderer gives VexFlow notes ("rh-3-1").
export const buildTimeline = (parsed) => {
  const events = [];
  for (const hand of ['rh', 'lh']) {
    let start = 0;
    parsed[hand].forEach((bar, b) => {
      // A pickup bar is shorter than a full bar.
      let t = start;
      bar.forEach((n, i) => {
        if (!n.rest) events.push({ id: `${hand}-${b}-${i}`, hand, bar: b, start: t, beats: n.beats, midis: n.pitches.map((p) => p.midi), names: n.pitches.map((p) => p.name) });
        t += n.beats;
      });
      start = t;
    });
  }
  events.sort((a, b) => a.start - b.start || (a.hand === 'rh' ? -1 : 1));
  const total = Math.max(0, ...events.map((e) => e.start + e.beats));
  return { events, total };
};

// Practice steps: groups of notes that start together, for the chosen hand(s).
export const buildSteps = (timeline, hands) => {
  const steps = [];
  for (const e of timeline.events) {
    if (!hands.includes(e.hand)) continue;
    const last = steps[steps.length - 1];
    if (last && Math.abs(last.start - e.start) < 1e-6) {
      last.events.push(e);
      last.midis.push(...e.midis);
    } else steps.push({ start: e.start, events: [e], midis: [...e.midis] });
  }
  return steps;
};

// Note-name systems: Letters (C4), Solfège (Do), Sargam (Sa).
const SOLFEGE = { C: 'Do', D: 'Re', E: 'Mi', F: 'Fa', G: 'Sol', A: 'La', B: 'Ti' };
const SARGAM = { C: 'Sa', D: 'Re', E: 'Ga', F: 'Ma', G: 'Pa', A: 'Dha', B: 'Ni' };

export const labelFor = (name, system = 'letters', withOctave = true) => {
  const p = typeof name === 'string' ? parsePitch(name) : name;
  if (!p) return '';
  const acc = p.acc;
  if (system === 'solfege') return SOLFEGE[p.letter] + acc;
  if (system === 'sargam') return SARGAM[p.letter] + acc;
  return p.letter + acc + (withOctave ? p.octave : '');
};

export const midiName = (midi) => SHARP_NAMES[midi % 12] + (Math.floor(midi / 12) - 1);
export const isBlack = (midi) => [1, 3, 6, 8, 10].includes(midi % 12);

export const durationSeconds = (parsed) => {
  const bars = parsed.rh.length;
  return Math.round((bars * parsed.barBeats * 60) / parsed.bpm);
};

export const fmtTime = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

// Chord recognition: names a set of notes ("C", "Am7", "G/B") and its inversion.
const CHORD_TYPES = [
  ['', [0, 4, 7]], ['m', [0, 3, 7]], ['dim', [0, 3, 6]], ['aug', [0, 4, 8]],
  ['7', [0, 4, 7, 10]], ['maj7', [0, 4, 7, 11]], ['m7', [0, 3, 7, 10]], ['m7b5', [0, 3, 6, 10]], ['dim7', [0, 3, 6, 9]],
  ['sus4', [0, 5, 7]], ['sus2', [0, 2, 7]], ['6', [0, 4, 7, 9]], ['m6', [0, 3, 7, 9]], ['add9', [0, 2, 4, 7]],
  ['7', [0, 4, 10]], ['m7', [0, 3, 10]], ['5', [0, 7]],
];
const FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const INV = ['', '1st inv', '2nd inv', '3rd inv'];

// names: the written pitches ("Bb3"), so spelling follows the song.
export const chordName = (names) => {
  const pitches = names.map(parsePitch).filter(Boolean).sort((a, b) => a.midi - b.midi);
  const pcs = [...new Set(pitches.map((p) => p.midi % 12))];
  if (pcs.length < 2) return null;
  const spell = (pc) => {
    const p = pitches.find((x) => x.midi % 12 === pc);
    return p ? p.letter + p.acc : FLAT_NAMES[pc];
  };
  const bassPc = pitches[0].midi % 12;
  for (const [suffix, shape] of CHORD_TYPES) {
    if (shape.length !== pcs.length) continue;
    for (const root of pcs) {
      const rel = pcs.map((pc) => (pc - root + 12) % 12).sort((a, b) => a - b);
      if (rel.join() !== [...shape].sort((a, b) => a - b).join()) continue;
      // Two-note shapes are only a chord when they are a power chord in root position.
      if (shape.length === 2 && bassPc !== root) continue;
      const name = spell(root) + suffix;
      const degree = shape.indexOf((bassPc - root + 12) % 12);
      return { name: degree > 0 ? `${name}/${spell(bassPc)}` : name, inv: INV[degree] || '', root: spell(root) };
    }
  }
  return null;
};

// ---- Harmony analysis: a chord for every half bar, even when chords are broken up ----
const FIT_TYPES = [
  ['', [0, 4, 7], 0], ['m', [0, 3, 7], 0], ['7', [0, 4, 7, 10], 0.45], ['m7', [0, 3, 7, 10], 0.55],
  ['maj7', [0, 4, 7, 11], 0.9], ['6', [0, 4, 7, 9], 0.7], ['dim', [0, 3, 6], 0.35], ['sus4', [0, 5, 7], 0.6], ['aug', [0, 4, 8], 0.8],
];
const SHARP_SPELL = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_KEYS = ['F', 'Bb', 'Eb', 'Ab', 'Dm', 'Gm', 'Cm'];

const fitChord = (weights, bassPc, flat) => {
  const total = weights.reduce((a, b) => a + b, 0);
  if (total === 0) return null;
  let best = null;
  for (let root = 0; root < 12; root++) {
    for (const [suffix, shape, cost] of FIT_TYPES) {
      const tones = shape.map((i) => (root + i) % 12);
      let inW = 0;
      for (let pc = 0; pc < 12; pc++) if (tones.includes(pc)) inW += weights[pc];
      // Missing tones (other than the fifth) and outside notes both count against a chord.
      const missing = tones.filter((pc, i) => weights[pc] === 0 && shape[i] !== 7).length;
      let score = inW - (total - inW) * 0.8 - missing * total * 0.18 - cost * total * 0.3;
      if (weights[root] > 0) score += total * 0.12;
      if (bassPc === root) score += total * 0.2;
      if (!best || score > best.score) best = { score, root, suffix, tones, cover: inW / total };
    }
  }
  if (!best || best.cover < 0.6) return null;
  const spell = (pc) => (flat ? FLAT_NAMES : SHARP_SPELL)[pc];
  const degree = best.tones.indexOf(bassPc);
  const name = spell(best.root) + best.suffix;
  return { name: degree > 0 ? `${name}/${spell(bassPc)}` : name, inv: degree > 0 ? INV[degree] || '' : '' };
};

export const analyzeHarmony = (parsed) => {
  const per = parsed.time === '3/4' || parsed.time === '2/4' ? parsed.barBeats : parsed.barBeats / 2;
  const out = [];
  let prev = '';
  const flat = FLAT_KEYS.includes(parsed.key);
  parsed.rh.forEach((_, b) => {
    for (let w = 0; w < parsed.barBeats - 1e-6; w += per) {
      const weights = new Array(12).fill(0);
      let bass = null;
      for (const hand of ['rh', 'lh']) {
        let t = 0;
        for (const n of parsed[hand][b] || []) {
          const s = Math.max(t, w), e = Math.min(t + n.beats, w + per);
          if (e > s && !n.rest) {
            for (const p of n.pitches) {
              // Bass notes and notes landing on the start of the window shape the harmony most.
              weights[p.midi % 12] += (e - s) * (hand === 'lh' ? 1.5 : 1) * (Math.abs(t - w) < 1e-6 ? 1.4 : 1);
              if (!bass || p.midi < bass) bass = p.midi;
            }
          }
          t += n.beats;
        }
      }
      const barLen = parsed.rh[b].reduce((a, n) => a + n.beats, 0);
      if (b === 0 && barLen < parsed.barBeats - 1e-6) continue; // pickup bar
      const c = fitChord(weights, bass === null ? -1 : bass % 12, flat);
      if (c && c.name !== prev) { out.push({ bar: b, beat: w, ...c }); prev = c.name; }
    }
  });
  return out;
};

// ---- Scale detection from the whole song (Krumhansl key profiles) ----
const MAJOR_P = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const MINOR_P = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];
export const detectScale = (parsed) => {
  const w = new Array(12).fill(0);
  for (const hand of ['rh', 'lh']) for (const bar of parsed[hand]) for (const n of bar) for (const p of n.pitches) w[p.midi % 12] += n.beats;
  const corr = (prof, k) => prof.reduce((a, v, i) => a + v * w[(i + k) % 12], 0);
  let best = { s: -1 };
  for (let k = 0; k < 12; k++) {
    const maj = corr(MAJOR_P, k), min = corr(MINOR_P, k);
    if (maj > best.s) best = { s: maj, k, minor: false };
    if (min > best.s) best = { s: min, k, minor: true };
  }
  const flat = FLAT_KEYS.includes(parsed.key) || [5, 10, 3, 8].includes(best.k);
  const name = (flat ? FLAT_NAMES : SHARP_SPELL)[best.k];
  // Harmonic minor when the raised 7th is used a lot.
  const harmonic = best.minor && w[(best.k + 11) % 12] > w[(best.k + 10) % 12];
  const blues = !best.minor && w[(best.k + 3) % 12] > 0 && w[(best.k + 10) % 12] > 0 && w[(best.k + 6) % 12] > 0;
  return `${name} ${best.minor ? (harmonic ? 'harmonic minor' : 'minor') : blues ? 'blues' : 'major'}`;
};
