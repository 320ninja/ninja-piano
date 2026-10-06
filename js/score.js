// Renders a parsed song as a grand staff (treble + bass) with note names under each note.
import { labelFor } from './music.js';

const VF = () => window.Vex.Flow;
const SYSTEM_H = 250;
const TREBLE_Y = 20;
const BASS_Y = 128;

const vfDuration = (n) => n.code + (n.rest ? 'r' : '');

const buildNotes = (bar, clef, hand, b, keySig, opts) => {
  const { StaveNote, Accidental, Annotation, Dot } = VF();
  const state = {};
  return bar.map((n, i) => {
    const keys = n.rest
      ? [clef === 'treble' ? 'b/4' : 'd/3']
      : n.pitches.map((p) => `${p.letter.toLowerCase()}${p.acc}/${p.octave}`);
    const note = new StaveNote({ clef, keys, duration: vfDuration(n), auto_stem: !n.rest });
    note.setAttribute('id', `${hand}-${b}-${i}`);
    if (n.dotted) Dot.buildAndAttach([note], { all: true });
    if (!n.rest) {
      n.pitches.forEach((p, idx) => {
        const slot = p.letter + p.octave;
        const current = state[slot] ?? keySig[p.letter] ?? '';
        if (current !== p.acc) {
          note.addModifier(new Accidental(p.acc || 'n'), idx);
          state[slot] = p.acc;
        }
      });
      if (opts.showNames) {
        const text = n.pitches.map((p) => labelFor(p, opts.nameSystem)).join(' ');
        const ann = new Annotation(text)
          .setVerticalJustification(Annotation.VerticalJustify.BOTTOM)
          .setFont('Plus Jakarta Sans', n.pitches.length > 2 ? 8 : 10, 'bold');
        note.addModifier(ann, 0);
      }
    }
    return note;
  });
};

const minBarWidth = (parsed, b) => {
  const count = Math.max(parsed.rh[b]?.length || 0, parsed.lh[b]?.length || 0);
  return 34 + count * 27;
};

const layoutSystems = (parsed, width) => {
  const systems = [];
  let line = [], used = 0;
  parsed.rh.forEach((_, b) => {
    const head = line.length === 0 ? (systems.length === 0 ? 92 : 64) : 0;
    const w = minBarWidth(parsed, b) + head;
    if (line.length && used + w > width) {
      systems.push(line);
      line = []; used = 0;
      const head2 = 64;
      line.push({ b, min: minBarWidth(parsed, b) + head2 });
      used = minBarWidth(parsed, b) + head2;
      return;
    }
    line.push({ b, min: w });
    used += w;
  });
  if (line.length) systems.push(line);
  return systems;
};

export const renderScore = (container, parsed, opts) => {
  const { Renderer, Stave, StaveConnector, Voice, Formatter, Beam, Fraction } = VF();
  container.innerHTML = '';
  const width = Math.max(320, container.clientWidth);
  const usable = width - 20;
  const systems = layoutSystems(parsed, usable);
  const renderer = new Renderer(container, Renderer.Backends.SVG);
  renderer.resize(width, systems.length * SYSTEM_H + 10);
  const ctx = renderer.getContext();
  const beamGroups = parsed.time === '6/8' ? [new Fraction(3, 8)] : parsed.time === '3/4' ? [new Fraction(2, 8)] : undefined;
  const barX = {};

  systems.forEach((line, s) => {
    const total = line.reduce((a, m) => a + m.min, 0);
    const scale = s === systems.length - 1 && total < usable * 0.6 ? 1 : usable / total;
    let x = 10;
    const y = s * SYSTEM_H;
    line.forEach((m, idx) => {
      const w = m.min * scale;
      const treble = new Stave(x, y + TREBLE_Y, w);
      const bass = new Stave(x, y + BASS_Y, w);
      if (idx === 0) {
        treble.addClef('treble').addKeySignature(parsed.key.replace('m', '') === parsed.key ? parsed.key : relMajor(parsed.key));
        bass.addClef('bass').addKeySignature(parsed.key.replace('m', '') === parsed.key ? parsed.key : relMajor(parsed.key));
        if (s === 0) { treble.addTimeSignature(parsed.time); bass.addTimeSignature(parsed.time); }
      }
      if (s === 0 && idx === 0) treble.setMeasure(1); else if (idx === 0) treble.setMeasure(m.b + 1);
      const startX = Math.max(treble.getNoteStartX(), bass.getNoteStartX());
      treble.setNoteStartX(startX); bass.setNoteStartX(startX);
      treble.setContext(ctx).draw();
      bass.setContext(ctx).draw();
      if (idx === 0) {
        new StaveConnector(treble, bass).setType('brace').setContext(ctx).draw();
        new StaveConnector(treble, bass).setType('singleLeft').setContext(ctx).draw();
      }
      new StaveConnector(treble, bass).setType(m.b === parsed.rh.length - 1 ? 'boldDoubleRight' : 'singleRight').setContext(ctx).draw();

      const tNotes = buildNotes(parsed.rh[m.b], 'treble', 'rh', m.b, parsed.keySig, opts);
      const bNotes = buildNotes(parsed.lh[m.b], 'bass', 'lh', m.b, parsed.keySig, opts);
      const mk = (notes) => new Voice({ num_beats: parsed.num, beat_value: parsed.den }).setMode(Voice.Mode.SOFT).addTickables(notes);
      const tv = mk(tNotes), bv = mk(bNotes);
      const beams = [...Beam.generateBeams(tNotes, { groups: beamGroups }), ...Beam.generateBeams(bNotes, { groups: beamGroups })];
      new Formatter().joinVoices([tv]).joinVoices([bv]).format([tv, bv], w - (startX - x) - 14);
      tv.draw(ctx, treble);
      bv.draw(ctx, bass);
      beams.forEach((bm) => bm.setContext(ctx).draw());
      barX[m.b] = { x, w, y };
      x += w;
    });
  });

  const svg = container.querySelector('svg');
  svg.removeAttribute('height');
  svg.setAttribute('viewBox', `0 0 ${width} ${systems.length * SYSTEM_H + 10}`);
  const cursor = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  cursor.setAttribute('class', 'cursor');
  cursor.setAttribute('rx', 8);
  cursor.setAttribute('width', 26);
  cursor.setAttribute('height', 0);
  svg.insertBefore(cursor, svg.firstChild);

  const els = new Map();
  svg.querySelectorAll('.vf-stavenote').forEach((g) => {
    const id = g.id.replace(/^vf-/, '');
    els.set(id, g);
  });

  return {
    svg,
    get: (id) => els.get(id),
    mark(ids, cls) {
      svg.querySelectorAll(`.vf-stavenote.${cls}`).forEach((g) => g.classList.remove(cls));
      ids.forEach((id) => els.get(id)?.classList.add(cls));
    },
    add(id, cls) { els.get(id)?.classList.add(cls); },
    clear() { svg.querySelectorAll('.cur,.hit,.miss').forEach((g) => g.classList.remove('cur', 'hit', 'miss')); cursor.setAttribute('height', 0); },
    // Moves the soft highlight bar over the given note and returns its page position.
    cursorTo(id) {
      const g = els.get(id);
      if (!g) return null;
      const bb = g.getBBox();
      const bar = Number(id.split('-')[1]);
      const sys = barX[bar];
      cursor.setAttribute('x', bb.x + bb.width / 2 - 13);
      cursor.setAttribute('y', sys.y + 6);
      cursor.setAttribute('height', SYSTEM_H - 12);
      return sys.y;
    },
  };
};

const relMajor = (minorKey) => ({ Am: 'C', Em: 'G', Bm: 'D', Dm: 'F', Gm: 'Bb', Cm: 'Eb' }[minorKey] || 'C');
