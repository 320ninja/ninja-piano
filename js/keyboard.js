// On-screen piano keyboard plus computer-keyboard and MIDI input.
import { isBlack, midiName, labelFor } from './music.js';

const WHITE_W = () => (innerWidth >= 760 ? 54 : 46);
const BLACK_W = () => (innerWidth >= 760 ? 32 : 28);

// QWERTY layout: A W S E D F T G Y H U J K O L P ; ' = C4 … F5
const QWERTY = { a: 60, w: 61, s: 62, e: 63, d: 64, f: 65, t: 66, g: 67, y: 68, h: 69, u: 70, j: 71, k: 72, o: 73, l: 74, p: 75, ';': 76, "'": 77 };

export const createKeyboard = (host, { low, high, labels, nameSystem, onPress }) => {
  // Start on a C and end on a B/E so the board looks complete.
  low = Math.max(21, low - (low % 12));
  high = Math.min(108, high + ((11 - (high % 12)) % 12));
  host.innerHTML = '<div class="keys"></div>';
  const wrap = host.firstElementChild;
  const keys = new Map();
  let whiteIndex = 0;
  for (let m = low; m <= high; m++) {
    const el = document.createElement('div');
    const black = isBlack(m);
    el.className = `key${black ? ' b' : ''}`;
    el.dataset.midi = m;
    const name = midiName(m);
    if (labels && (!black || labels === 'all')) el.textContent = labelFor(name, nameSystem, !black && nameSystem === 'letters');
    if (m === 60) el.insertAdjacentHTML('beforeend', '<i class="c4"></i>');
    if (black) el.style.left = `${whiteIndex * (WHITE_W() + 2) - BLACK_W() / 2 - 1}px`;
    else whiteIndex++;
    wrap.appendChild(el);
    keys.set(m, el);
  }

  const active = new Map();
  const press = (m) => {
    const el = keys.get(m);
    el?.classList.add('down');
    onPress(m);
  };
  const release = (m) => keys.get(m)?.classList.remove('down');

  host.addEventListener('pointerdown', (e) => {
    const el = e.target.closest('.key');
    if (!el) return;
    e.preventDefault();
    const m = Number(el.dataset.midi);
    active.set(e.pointerId, m);
    press(m);
  });
  const up = (e) => {
    const m = active.get(e.pointerId);
    if (m !== undefined) { release(m); active.delete(e.pointerId); }
  };
  host.addEventListener('pointerup', up);
  host.addEventListener('pointercancel', up);
  host.addEventListener('pointerleave', up);

  const held = new Set();
  const onKey = (e) => {
    if (e.target.matches('input,select,textarea') || e.metaKey || e.ctrlKey) return;
    const m = QWERTY[e.key.toLowerCase()];
    if (m === undefined) return;
    if (e.type === 'keydown') {
      if (held.has(m)) return;
      held.add(m);
      press(m);
    } else { held.delete(m); release(m); }
  };
  addEventListener('keydown', onKey);
  addEventListener('keyup', onKey);

  let midiAccess = null;
  const onMidi = (msg) => {
    const [st, note, vel] = msg.data;
    if ((st & 0xf0) === 0x90 && vel > 0) press(note);
    else if ((st & 0xf0) === 0x80 || ((st & 0xf0) === 0x90 && vel === 0)) release(note);
  };
  navigator.requestMIDIAccess?.().then((acc) => {
    midiAccess = acc;
    acc.inputs.forEach((i) => { i.onmidimessage = onMidi; });
  }).catch(() => {});

  const flash = (m, cls, ms = 350) => {
    const el = keys.get(m);
    if (!el) return;
    el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), ms);
  };

  return {
    flash,
    setTargets(midis) {
      wrap.querySelectorAll('.target').forEach((el) => el.classList.remove('target'));
      midis.forEach((m) => keys.get(m)?.classList.add('target'));
      if (midis.length) this.scrollTo(midis[0]);
    },
    showPlaying(midis, ms) { midis.forEach((m) => flash(m, 'down', ms)); },
    scrollTo(m) {
      const el = keys.get(m);
      if (!el) return;
      const left = el.offsetLeft - host.clientWidth / 2 + el.offsetWidth / 2;
      // Jump when far away so a page scroll can't cancel a long smooth scroll.
      const far = Math.abs(host.scrollLeft - left) > host.clientWidth;
      if (far) host.scrollLeft = left;
      else host.scrollTo({ left, behavior: 'smooth' });
    },
    destroy() {
      removeEventListener('keydown', onKey);
      removeEventListener('keyup', onKey);
      midiAccess?.inputs.forEach((i) => { i.onmidimessage = null; });
    },
  };
};
