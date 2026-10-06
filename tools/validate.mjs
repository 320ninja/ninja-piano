// Validates every songs/*.json file against songs/FORMAT.md.
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'songs');
const DUR = { w: 4, h: 2, q: 1, 8: 0.5, 16: 0.25 };
const CATS = ['Kids', 'Classical', 'Pop', 'Folk', 'Holiday', 'Hymns', 'Exercises', 'Jazz', 'Blues', 'Rock', 'EDM'];
const LEVELS = ['Easy', 'Medium', 'Hard'];
const KEYS = ['C', 'G', 'D', 'A', 'E', 'F', 'Bb', 'Eb', 'Ab', 'Am', 'Em', 'Bm', 'Dm', 'Gm', 'Cm'];
const TIMES = { '2/4': 2, '3/4': 3, '4/4': 4, '6/8': 3 };
const STEP = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

const midi = (p) => {
  const m = /^([A-G])(#|b)?(\d)$/.exec(p);
  if (!m) return null;
  return 12 * (Number(m[3]) + 1) + STEP[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
};

const beats = (dur) => {
  const dotted = dur.endsWith('d');
  const base = DUR[dotted ? dur.slice(0, -1) : dur];
  return base === undefined ? null : base * (dotted ? 1.5 : 1);
};

const checkHand = (text, lo, hi, errs, label) => {
  return text.split('|').map((bar, i) => {
    let total = 0;
    const tokens = bar.trim().match(/\([^)]*\)\/\S+|\S+/g) || [];
    if (!tokens.length) errs.push(`${label} bar ${i + 1} empty`);
    for (const tok of tokens) {
      const [pitchPart, dur] = tok.split('/');
      const b = beats(dur || '');
      if (b === null) { errs.push(`${label} bar ${i + 1}: bad duration "${tok}"`); continue; }
      total += b;
      if (pitchPart === 'r') continue;
      const pitches = pitchPart.startsWith('(') ? pitchPart.slice(1, -1).trim().split(/\s+/) : [pitchPart];
      for (const p of pitches) {
        const n = midi(p);
        if (n === null) errs.push(`${label} bar ${i + 1}: bad pitch "${p}"`);
        else if (n < lo || n > hi) errs.push(`${label} bar ${i + 1}: ${p} out of range`);
      }
    }
    return total;
  });
};

let failed = 0, count = 0;
const ids = new Set();
for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
  let songs;
  try { songs = JSON.parse(readFileSync(join(dir, file), 'utf8')); }
  catch (e) { console.log(`${file}: invalid JSON: ${e.message}`); failed++; continue; }
  for (const s of songs) {
    count++;
    const errs = [];
    if (!s.id || ids.has(s.id)) errs.push(`missing or duplicate id`);
    ids.add(s.id);
    if (!CATS.includes(s.cat)) errs.push(`bad cat ${s.cat}`);
    if (!LEVELS.includes(s.level)) errs.push(`bad level ${s.level}`);
    if (!KEYS.includes(s.key)) errs.push(`bad key ${s.key}`);
    if (!TIMES[s.time]) errs.push(`bad time ${s.time}`);
    if (!(s.bpm >= 30 && s.bpm <= 220)) errs.push(`bad bpm`);
    const full = s.time === '6/8' ? 3 : TIMES[s.time];
    const rh = checkHand(s.rh || '', midi('A3'), midi('C6'), errs, 'rh');
    const lh = checkHand(s.lh || '', midi('C2'), midi('E4'), errs, 'lh');
    // Full songs only: every category except Exercises needs a real length.
    const minBars = s.cat === 'Exercises' ? 8 : 32;
    if (rh.length < minBars) errs.push(`only ${rh.length} bars; full songs need at least ${minBars}`);
    if (rh.length !== lh.length) errs.push(`rh has ${rh.length} bars, lh has ${lh.length}`);
    rh.forEach((t, i) => {
      const pickup = i === 0 && t < full && lh[0] === t;
      if (t !== full && !pickup) errs.push(`rh bar ${i + 1} = ${t} beats`);
      if (lh[i] !== undefined && lh[i] !== full && !pickup) errs.push(`lh bar ${i + 1} = ${lh[i]} beats`);
    });
    if (errs.length) { failed++; console.log(`${file} › ${s.id}:\n  ${errs.slice(0, 8).join('\n  ')}`); }
  }
}
console.log(`\n${count} songs checked, ${failed} with errors.`);
process.exit(failed ? 1 : 0);
