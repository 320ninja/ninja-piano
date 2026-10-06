// Song parsing, note naming and the playback/practice timeline.
const DUR = { w: 4, h: 2, q: 1, 8: 0.5, 16: 0.25 };
const STEP = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const CATEGORIES = ['Kids', 'Classical', 'Pop', 'Folk', 'Holiday', 'Hymns', 'Jazz', 'Blues', 'Rock', 'EDM', 'Exercises'];
export const SONG_FILES = ['kids', 'classical', 'pop', 'folk', 'holiday', 'hymns', 'jazz', 'blues', 'rock', 'edm', 'exercises'];

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
  const acc = p.acc === '#' ? '♯' : p.acc === 'b' ? '♭' : '';
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
