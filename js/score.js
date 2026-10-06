// Renders a parsed song as a grand staff (treble + bass) with note names under each note.
import { labelFor, chordName } from './music.js';

const VF = () => window.Vex.Flow;
let TREBLE_Y = 20;
const LINE_H = 12;
let SYSTEM_H = 250;
let BASS_Y = 128;

const maxChord = (hand) => Math.max(1, ...hand.flat().map((n) => n.pitches.length));

const vfDuration = (n) => n.code + (n.rest ? 'r' : '');

const buildNotes = (bar, clef, hand, b, keySig, opts) => {
  const { StaveNote, Accidental, Annotation, Dot } = VF();
  const state = {};
  return bar.map((n, i) => {
    const keys = n.rest
      ? [clef === 'treble' ? 'b/4' : 'd/3']
      : n.pitches.map((p) => `${p.letter.toLowerCase()}${p.acc}/${p.octave}`);
    // Stems always point up when names are shown, so beams stay clear of the name row underneath.
    const note = new StaveNote({ clef, keys, duration: vfDuration(n), ...(opts.showNames ? { stem_direction: 1 } : { auto_stem: !n.rest }) });
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
        // One name per line for chords, highest note first.
        [...n.pitches].sort((a, b) => b.midi - a.midi).forEach((p) => {
          const ann = new Annotation(labelFor(p, opts.nameSystem))
            .setVerticalJustification(Annotation.VerticalJustify.BOTTOM)
            .setFont('Plus Jakarta Sans', n.pitches.length > 1 ? 9 : 10, 'bold');
          note.addModifier(ann, 0);
        });
      }
    }
    return note;
  });
};

// Each note needs room for its name (e.g. "D#5") so names never touch.
const minBarWidth = (parsed, b, names = true) => {
  const count = Math.max(parsed.rh[b]?.length || 0, parsed.lh[b]?.length || 0);
  return 34 + count * (names ? 34 : 27);
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
  const extraT = opts.showNames ? (maxChord(parsed.rh) - 1) * LINE_H : 0;
  const extraB = opts.showNames ? (maxChord(parsed.lh) - 1) * LINE_H : 0;
  const hasChords = opts.showChords !== false && [...parsed.rh, ...parsed.lh].flat().some((n) => n.pitches.length > 1 && chordName(n.pitches.map((p) => p.name)));
  const top = hasChords ? 44 : 0;
  TREBLE_Y = 20 + top;
  BASS_Y = 128 + extraT + top;
  SYSTEM_H = 250 + extraT + extraB + top;
  const chordLabels = [];
  const width = Math.max(320, container.clientWidth);
  const usable = width - 30;
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
      const beamOpts = { groups: beamGroups, maintain_stem_directions: opts.showNames };
      const beams = [...Beam.generateBeams(tNotes, beamOpts), ...Beam.generateBeams(bNotes, beamOpts)];
      new Formatter({ softmaxFactor: opts.showNames ? 1.5 : 100 }).joinVoices([tv]).joinVoices([bv]).format([tv, bv], w - (startX - x) - 14);
      tv.draw(ctx, treble);
      bv.draw(ctx, bass);
      beams.forEach((bm) => bm.setContext(ctx).draw());
      if (hasChords) {
        // Bass-clef chords name the harmony, so they win over a right-hand chord at the same spot.
        const seen = [];
        let lastName = '';
        const collect = (notes, bar) => notes.forEach((note, i) => {
          const n = bar[i];
          if (n.rest || n.pitches.length < 2) return;
          const c = chordName(n.pitches.map((p) => p.name));
          if (!c) return;
          const cx = note.getAbsoluteX() + 6;
          if (seen.some((sx) => Math.abs(sx - cx) < 14)) return;
          seen.push(cx);
          // Like a lead sheet: name a chord when it changes, not on every repeat in the bar.
          if (c.name === lastName) return;
          lastName = c.name;
          chordLabels.push({ x: cx, y: y + TREBLE_Y + 6, sysY: y, ...c, id: note.getAttribute('id') });
        });
        collect(bNotes, parsed.lh[m.b]);
        collect(tNotes, parsed.rh[m.b]);
      }
      barX[m.b] = { x, w, y };
      x += w;
    });
  });

  const svg = container.querySelector('svg');
  svg.removeAttribute('height');
  svg.setAttribute('viewBox', `0 0 ${width} ${systems.length * SYSTEM_H + 10}`);
  const NS = 'http://www.w3.org/2000/svg';
  // Fast runs on narrow screens: when two note names would touch, drop the second half a line.
  const rows = new Map();
  svg.querySelectorAll('.vf-stavenote').forEach((g) => {
    const texts = g.querySelectorAll('text');
    if (texts.length !== 1) return;
    const t = texts[0];
    const bb = t.getBBox();
    const key = g.id.slice(3, 5) + Math.floor(bb.y / SYSTEM_H);
    if (!rows.has(key)) rows.set(key, []);
    rows.get(key).push({ t, bb });
  });
  rows.forEach((items) => {
    items.sort((a, b) => a.bb.x - b.bb.x);
    let prev = null;
    items.forEach((it) => {
      if (prev && !prev.low && it.bb.x < prev.bb.x + prev.bb.width + 3) {
        const y = Math.max(Number(it.t.getAttribute('y')), Number(prev.t.getAttribute('y')) + 11);
        it.t.setAttribute('y', y);
        it.low = true;
      }
      prev = it;
    });
  });
  const noteBoxes = chordLabels.length ? [...svg.querySelectorAll('.vf-stavenote, .vf-beam')].map((g) => g.getBBox()) : [];
  chordLabels.forEach((c) => {
    // Sit above the highest point of the note (stem, beam) so nothing overlaps.
    noteBoxes.forEach((bb) => {
      if (bb.y >= c.sysY && bb.y < c.sysY + SYSTEM_H && bb.x < c.x + 16 && bb.x + bb.width > c.x - 16) c.y = Math.min(c.y, bb.y - 4);
    });
    const t = document.createElementNS(NS, 'text');
    t.setAttribute('class', 'chord');
    t.setAttribute('x', c.x);
    t.setAttribute('y', c.y - (c.inv ? 14 : 4));
    t.setAttribute('text-anchor', 'middle');
    t.dataset.for = c.id;
    t.textContent = c.name;
    svg.appendChild(t);
    if (c.inv) {
      const inv = document.createElementNS(NS, 'text');
      inv.setAttribute('class', 'chord inv');
      inv.setAttribute('x', c.x);
      inv.setAttribute('y', c.y - 3);
      inv.setAttribute('text-anchor', 'middle');
      inv.textContent = c.inv;
      svg.appendChild(inv);
    }
  });
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
