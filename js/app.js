import { THEMES, applyTheme } from './themes.js';
import { CATEGORIES, SONG_FILES, parseSong, buildTimeline, buildSteps, labelFor, midiName, durationSeconds, fmtTime, chordName } from './music.js';
import { renderScore } from './score.js';
import { playNote, playClick, unlockAudio, now, setSustain, getSustain } from './audio.js';
import { createKeyboard } from './keyboard.js?v=38';
import { createFalling } from './falling.js';
import { parseMusicXML } from './musicxml.js';

/* ---------- storage ---------- */
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } };

const DEFAULTS = {
  name: '', theme: 'ninja', mode: 'dark', showNames: true, keyLabels: true, highlight: true,
  nameSystem: 'letters', tempo: 100, voice: 'grand', volume: 80, metronome: false, waitMode: true, seenWelcome: false, fallingSound: true, colorNotes: true,
};
const settings = { ...DEFAULTS, ...load('np.settings', {}) };
const progress = load('np.progress', {});   // id -> { best, plays, done, last }
let favs = new Set(load('np.favs', []));
const setSetting = (k, v) => { settings[k] = v; save('np.settings', settings); };
const saveProgress = () => save('np.progress', progress);

applyTheme(settings.theme, settings.mode);
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => applyTheme(settings.theme, settings.mode));

/* ---------- icons ---------- */
const P = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  lib: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  practice: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  back: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21.2l8.8-8.8a5.5 5.5 0 0 0 0-7.8z"/>',
  play: '<path d="M7 4v16l13-8z"/>',
  pause: '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>',
  prev: '<path d="M19 20 9 12l10-8zM5 19V5"/>',
  next: '<path d="m5 4 10 8-10 8zM19 5v14"/>',
  loop: '<path d="m17 1 4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
  metro: '<path d="M12 2 6 22h12z"/><path d="m12 14 6-8"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  ear: '<path d="M6 8.5a6 6 0 1 1 12 0c0 4-4 4.5-4 8a3.5 3.5 0 0 1-6.5 1.8"/>',
  arrowR: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  arrowL: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
  sheet: '<path d="M4 6h16M4 10h16M4 14h16M4 18h16"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  restart: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  scan: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
  sustain: '<rect x="3" y="3" width="18" height="10" rx="2"/><line x1="7" y1="13" x2="7" y2="21"/><line x1="12" y1="13" x2="12" y2="21"/><line x1="17" y1="13" x2="17" y2="21"/><line x1="4" y1="21" x2="20" y2="21"/>',
};
const icon = (n, extra = '') => `<svg class="i" viewBox="0 0 24 24" ${extra}>${P[n]}</svg>`;
const LOGO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3" fill="currentColor"/><circle cx="18" cy="16" r="3" fill="currentColor"/></svg>';

// Category art: [emoji, gradientA, gradientB]
const CAT_ART = {
  Kids:        ['🎹', '#f59e0b', '#ef4444'],
  Classical:   ['🎻', '#7c3aed', '#4338ca'],
  Pop:         ['🎤', '#db2777', '#9333ea'],
  Folk:        ['🪕', '#65a30d', '#0d9488'],
  Holiday:     ['🎄', '#16a34a', '#dc2626'],
  Hymns:       ['🕊️', '#0284c7', '#6d28d9'],
  Jazz:        ['🎷', '#d97706', '#92400e'],
  Blues:       ['🎸', '#1d4ed8', '#1e3a8a'],
  Rock:        ['🤘', '#dc2626', '#111827'],
  EDM:         ['🎧', '#7c3aed', '#0891b2'],
  Fingerstyle: ['🖐️', '#0d9488', '#065f46'],
  Exercises:   ['🎯', '#4f46e5', '#7c3aed'],
};

// SVG artwork per category — music-themed silhouettes / symbols
const CAT_SVG = {
  Kids: `<circle cx="29" cy="29" r="24" fill="rgba(255,255,255,.08)"/>
    <text x="29" y="20" text-anchor="middle" font-size="22" fill="rgba(255,255,255,.9)">♪</text>
    <text x="16" y="38" text-anchor="middle" font-size="16" fill="rgba(255,255,255,.7)">♩</text>
    <text x="42" y="36" text-anchor="middle" font-size="18" fill="rgba(255,255,255,.8)">♫</text>`,
  Classical: `<circle cx="29" cy="29" r="24" fill="rgba(255,255,255,.07)"/>
    <text x="29" y="42" text-anchor="middle" font-size="40" fill="rgba(255,255,255,.88)">𝄞</text>`,
  Pop: `<circle cx="29" cy="29" r="24" fill="rgba(255,255,255,.08)"/>
    <rect x="24" y="8" width="10" height="26" rx="5" fill="rgba(255,255,255,.9)"/>
    <rect x="19" y="30" width="20" height="4" rx="2" fill="rgba(255,255,255,.7)"/>
    <rect x="27" y="34" width="4" height="10" rx="2" fill="rgba(255,255,255,.8)"/>
    <rect x="20" y="44" width="18" height="3" rx="1.5" fill="rgba(255,255,255,.6)"/>`,
  Folk: `<circle cx="29" cy="29" r="24" fill="rgba(255,255,255,.07)"/>
    <ellipse cx="24" cy="38" rx="10" ry="8" fill="rgba(255,255,255,.88)"/>
    <rect x="33" y="10" width="3" height="30" rx="1.5" fill="rgba(255,255,255,.8)"/>
    <line x1="20" y1="34" x2="28" y2="34" stroke="rgba(255,255,255,.5)" stroke-width="1.5"/>
    <line x1="20" y1="37" x2="28" y2="37" stroke="rgba(255,255,255,.5)" stroke-width="1.5"/>
    <line x1="20" y1="40" x2="28" y2="40" stroke="rgba(255,255,255,.5)" stroke-width="1.5"/>`,
  Holiday: `<circle cx="29" cy="29" r="24" fill="rgba(255,255,255,.07)"/>
    <polygon points="29,8 38,26 48,26 29,44 10,26 20,26" fill="rgba(255,255,255,.9)"/>
    <rect x="26" y="44" width="6" height="6" rx="1" fill="rgba(255,255,255,.7)"/>
    <circle cx="29" cy="8" r="3" fill="#fde68a"/>`,
  Hymns: `<circle cx="29" cy="29" r="24" fill="rgba(255,255,255,.07)"/>
    <rect x="26" y="10" width="6" height="38" rx="3" fill="rgba(255,255,255,.9)"/>
    <rect x="12" y="22" width="34" height="6" rx="3" fill="rgba(255,255,255,.9)"/>`,
  Jazz: `<circle cx="29" cy="29" r="24" fill="rgba(255,255,255,.07)"/>
    <!-- Saxophone body -->
    <path d="M22 8 Q20 8 20 10 L20 30 Q20 38 26 42 Q30 46 34 44 Q38 42 38 38 Q38 34 34 32 L32 30 L32 10 Q32 8 30 8 Z" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="2" stroke-linecap="round"/>
    <!-- Saxophone bell -->
    <path d="M34 38 Q36 44 32 47 Q28 50 24 46 Q20 42 22 38" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Saxophone neck/mouthpiece -->
    <path d="M30 8 Q34 6 36 4 Q37 3 38 4" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="1.8" stroke-linecap="round"/>
    <!-- Keys (small circles on body) -->
    <circle cx="24" cy="16" r="1.8" fill="rgba(255,255,255,.7)"/>
    <circle cx="24" cy="22" r="1.8" fill="rgba(255,255,255,.7)"/>
    <circle cx="24" cy="28" r="1.8" fill="rgba(255,255,255,.7)"/>
    <!-- Trumpet (right side, smaller) -->
    <path d="M36 12 Q44 12 44 18 Q44 22 40 22 L38 22" fill="none" stroke="rgba(255,255,255,.65)" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M40 22 Q44 24 45 28 Q46 32 42 34" fill="none" stroke="rgba(255,255,255,.65)" stroke-width="1.6" stroke-linecap="round"/>
    <ellipse cx="41" cy="35" rx="3" ry="2" fill="none" stroke="rgba(255,255,255,.65)" stroke-width="1.4"/>`,
  Blues: `<circle cx="29" cy="29" r="24" fill="rgba(255,255,255,.07)"/>
    <rect x="20" y="10" width="6" height="36" rx="3" fill="rgba(255,255,255,.85)"/>
    <rect x="24" y="10" width="14" height="5" rx="2" fill="rgba(255,255,255,.85)"/>
    <rect x="24" y="22" width="12" height="4" rx="2" fill="rgba(255,255,255,.85)"/>
    <circle cx="23" cy="46" r="5" fill="rgba(255,255,255,.85)"/>`,
  Rock: `<circle cx="29" cy="29" r="24" fill="rgba(255,255,255,.07)"/>
    <path d="M18 44 L24 28 L20 28 L29 10 L25 22 L32 22 L22 44Z" fill="rgba(255,255,255,.9)"/>
    <path d="M32 44 L38 28 L34 28 L43 10 L39 22 L46 22 L36 44Z" fill="rgba(255,255,255,.65)"/>`,
  EDM: `<circle cx="29" cy="29" r="24" fill="rgba(255,255,255,.07)"/>
    <path d="M10 29 Q14 18 18 29 Q22 40 26 29 Q30 18 34 29 Q38 40 42 29 Q46 18 50 29" stroke="rgba(255,255,255,.9)" stroke-width="3" fill="none" stroke-linecap="round"/>
    <circle cx="29" cy="29" r="6" fill="rgba(255,255,255,.25)"/>`,
  Fingerstyle: `<circle cx="29" cy="29" r="24" fill="rgba(255,255,255,.07)"/>
    <rect x="18" y="24" width="5" height="20" rx="2.5" fill="rgba(255,255,255,.85)"/>
    <rect x="25" y="18" width="5" height="26" rx="2.5" fill="rgba(255,255,255,.85)"/>
    <rect x="32" y="20" width="5" height="24" rx="2.5" fill="rgba(255,255,255,.85)"/>
    <rect x="39" y="26" width="5" height="18" rx="2.5" fill="rgba(255,255,255,.85)"/>
    <path d="M14 22 Q29 12 44 22" stroke="rgba(255,255,255,.6)" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
  Exercises: `<circle cx="29" cy="29" r="24" fill="rgba(255,255,255,.07)"/>
    <rect x="10" y="32" width="7" height="14" rx="2" fill="rgba(255,255,255,.9)"/>
    <rect x="22" y="24" width="7" height="22" rx="2" fill="rgba(255,255,255,.8)"/>
    <rect x="34" y="16" width="7" height="30" rx="2" fill="rgba(255,255,255,.7)"/>
    <rect x="46" y="10" width="7" height="36" rx="2" fill="rgba(255,255,255,.6)"/>`,
};

const strHash = (s) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };

const thumb = (s) => {
  const [, c1, c2] = CAT_ART[s.cat] || CAT_ART.Kids;
  const art = CAT_SVG[s.cat] || CAT_SVG.Kids;
  const h = strHash(s.id || s.title || '');
  const angle = 120 + (h % 80);
  // Per-song rotation offset for variety within the same category
  const rot = (h % 30) - 15;
  return `<div class="thumb" style="background:linear-gradient(${angle}deg,${c1},${c2})">
    <svg viewBox="0 0 58 58" xmlns="http://www.w3.org/2000/svg" style="position:absolute;inset:0;width:100%;height:100%;transform:rotate(${rot}deg) scale(1.05)">${art}</svg>
  </div>`;
};
// Note names for an event, plus the red chord name when it is a chord.
const eventLabel = (names) => {
  const c = names.length > 1 ? chordName(names) : null;
  const notes = names.map((n) => labelFor(n, settings.nameSystem)).join(' ');
  return c ? `<span class="chordtag">${c.name}${c.inv ? ` <small>${c.inv}</small>` : ''}</span> ${notes}` : notes;
};
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------- songs ---------- */
let SONGS = [];
const songById = (id) => SONGS.find((s) => s.id === id);
const songsReady = Promise.allSettled(SONG_FILES.map((f) => fetch(`songs/${f}.json`).then((r) => (r.ok ? r.json() : []))))
  .then((res) => {
    SONGS = res.flatMap((r) => (r.status === 'fulfilled' && Array.isArray(r.value) ? r.value : []));
    const order = { Easy: 0, Medium: 1, Hard: 2 };
    SONGS.sort((a, b) => CATEGORIES.indexOf(a.cat) - CATEGORIES.indexOf(b.cat) || order[a.level] - order[b.level] || a.title.localeCompare(b.title));
  });

/* ---------- shell ---------- */
const app = document.getElementById('app');
const nav = document.getElementById('nav');
let cleanup = () => {};

const toast = (msg) => {
  document.querySelector('.toast')?.remove();
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2200);
};

const songRow = (s, opts = {}) => {
  const p = progress[s.id];
  const [, c1, c2] = CAT_ART[s.cat] || CAT_ART.Kids;
  return `<a class="song" href="#/song/${s.id}" style="--c1:${c1};--c2:${c2}">
    ${thumb(s)}
    <div class="meta"><div class="t">${esc(s.title)}</div>
      <div class="s">${esc(s.composer || 'Traditional')}${opts.time ? ' · ' + fmtTime(durationSeconds(parseSong(s))) : ''}</div>
      <div class="tags"><span class="tag ${s.level}">${s.level}</span><span class="tag cat">${s.cat}</span>${p?.done ? `<span class="tag done">✓ ${p.best}%</span>` : ''}</div>
    </div><span class="play">${icon('play')}</span></a>`;
};

// Colourful animated section heading with an emoji badge.
const catChips = (active, attr = 'c') => ['All', ...CATEGORIES].map((c) => {
  const [e, c1, c2] = CAT_ART[c] || ['🎵', '#c4b5fd', '#6d5dfc'];
  return `<button class="chip cc ${c === active ? 'on' : ''}" data-${attr}="${c}" style="--c1:${c1};--c2:${c2}">${c === 'All' ? '🎵 All' : e + ' ' + c}</button>`;
}).join('');

const heading = (emoji, text, extra = '') => `<h3 class="sec"><span class="badge">${emoji}</span><span class="gt">${text}</span>${extra}</h3>`;

// Compact instrument selector rendered in the top bar of any playing page.
const VOICE_ICONS = { grand:'🎹', bright:'✨', electric:'🎸', soft:'🪗', synth:'🎛️', organ:'🎺', edm:'🎧' };
const VOICE_LABELS = { grand:'Grand', bright:'Bright', electric:'Electric', soft:'Soft', synth:'Synth', organ:'Organ', edm:'EDM' };
const voicePicker = () => `<div class="voice-pick-wrap"><select class="voice-pick" id="voicePick" title="Instrument sound">${Object.keys(VOICE_LABELS).map(v=>`<option value="${v}"${settings.voice===v?' selected':''}>${VOICE_ICONS[v]} ${VOICE_LABELS[v]}</option>`).join('')}</select></div>`;
const sustainBtn = () => `<button id="sustainBtn" class="iconbtn${getSustain()?' on':''}" title="Sustain pedal">${icon('sustain')}</button>`;

// Per-note-name color system (C=red, D=orange, E=yellow, F=green, G=teal, A=blue, B=purple)
const NOTE_COLORS = { C:'#ef4444', D:'#f97316', E:'#eab308', F:'#22c55e', G:'#06b6d4', A:'#3b82f6', B:'#8b5cf6' };
// Matches note name text like "F4", "G#3", "Bb2", "A", "C#" etc.
const NOTE_TEXT_RE = /^([A-G][b#♭♯]?)\d?$/;
const colorizeScore = (container) => {
  if (!container) return;
  container.querySelectorAll('text').forEach(el => {
    const raw = el.textContent.trim();
    const m = raw.match(NOTE_TEXT_RE);
    if (!m) return;
    const letter = m[1].charAt(0).toUpperCase();
    const col = NOTE_COLORS[letter];
    if (!col) return;
    if (settings.colorNotes) {
      el.style.fill = col;
      el.setAttribute('fill', col);
      // Color the notehead in same VexFlow stavenote group
      const grp = el.closest('.vf-stavenote') || el.parentElement;
      if (grp) {
        grp.querySelectorAll('path.vf-notehead, path[class*="notehead"]').forEach(p => {
          p.style.fill = col; p.style.stroke = col;
          p.setAttribute('fill', col); p.setAttribute('stroke', col);
        });
      }
    } else {
      el.style.fill = ''; el.removeAttribute('fill');
      const grp = el.closest('.vf-stavenote') || el.parentElement;
      if (grp) grp.querySelectorAll('path.vf-notehead, path[class*="notehead"]').forEach(p => {
        p.style.fill = ''; p.style.stroke = ''; p.removeAttribute('fill'); p.removeAttribute('stroke');
      });
    }
  });
};

// Previous / page numbers / Next, showing a window of pages around the current one.
const pagerHtml = (page, pages, total, per) => {
  if (pages <= 1) return '';
  const from = (page - 1) * per + 1, to = Math.min(total, page * per);
  const nums = [];
  for (let i = 1; i <= pages; i++) if (i === 1 || i === pages || Math.abs(i - page) <= 1) nums.push(i);
  const parts = [];
  nums.forEach((n, i) => { if (i && n - nums[i - 1] > 1) parts.push('<span class="dots">…</span>'); parts.push(`<button class="${n === page ? 'on' : ''}" data-p="${n}">${n}</button>`); });
  return `<div class="pager-info">Showing ${from}–${to} of ${total}</div>
    <div class="pager-row"><button class="pnav" data-p="${page - 1}" ${page === 1 ? 'disabled' : ''}>${icon('arrowL')} Prev</button>
    ${parts.join('')}
    <button class="pnav next" data-p="${page + 1}" ${page === pages ? 'disabled' : ''}>Next ${icon('arrowR')}</button></div>`;
};

const THEME_BTN = '<button class="theme-fab" aria-label="Change theme"><i></i><span>Theme</span></button>';

const setNav = (route) => {
  const map = { home: 'home', library: 'library', practice: 'practice', settings: 'settings' };
  const hidden = ['welcome', 'done', 'practice-run'].includes(route);
  nav.classList.toggle('hide', hidden);
  document.body.classList.toggle('nonav', hidden);
  nav.querySelectorAll('a').forEach((a) => a.classList.toggle('on', a.dataset.r === map[route]));
  // Floating home button on full-screen practice pages
  let fab = document.getElementById('fabHome');
  if (hidden && route !== 'welcome' && route !== 'done') {
    if (!fab) {
      fab = document.createElement('a');
      fab.id = 'fabHome';
      fab.href = '#/home';
      fab.title = 'Go Home';
      fab.innerHTML = icon('home');
      document.body.appendChild(fab);
    }
  } else {
    fab?.remove();
  }
};

/* ---------- views ---------- */
const views = {};

views.welcome = () => {
  setNav('welcome');
  const petals = Array.from({ length: 14 }, (_, i) =>
    `<span class="petal" style="left:${10 + i * 7}%;top:${Math.random() * 30}%;animation-duration:${6 + Math.random() * 6}s;animation-delay:${-Math.random() * 8}s"></span>`).join('');
  app.innerHTML = `<section class="view welcome">
    <svg class="art" viewBox="0 0 400 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <circle cx="285" cy="110" r="56" fill="#fef3c7" opacity=".9"/><circle cx="285" cy="110" r="90" fill="#fef3c7" opacity=".08"/>
      <path d="M0 330 Q80 280 160 320 T400 300 V420 H0Z" fill="#000" opacity=".35"/>
      <g fill="#f472b6" opacity=".55"><circle cx="40" cy="60" r="26"/><circle cx="70" cy="40" r="22"/><circle cx="20" cy="95" r="20"/><circle cx="85" cy="80" r="18"/></g>
      <path d="M0 140 Q50 100 95 70" stroke="#3b1d2e" stroke-width="5" fill="none"/>
      <g transform="translate(150 230)">
        <path d="M20 40 Q120 -10 220 30 L230 70 L10 70Z" fill="#0a0a14"/><rect x="10" y="70" width="220" height="16" rx="3" fill="#15152a"/>
        <g fill="#f8fafc">${Array.from({ length: 13 }, (_, i) => `<rect x="${14 + i * 16.5}" y="72" width="15" height="12" rx="1.5"/>`).join('')}</g>
        <rect x="30" y="86" width="6" height="60" fill="#0a0a14"/><rect x="205" y="86" width="6" height="60" fill="#0a0a14"/>
      </g>
      <g transform="translate(70 250)">
        <ellipse cx="40" cy="110" rx="34" ry="8" fill="#000" opacity=".3"/>
        <path d="M14 60 Q40 40 66 60 L72 108 H8Z" fill="#1e1b4b"/>
        <circle cx="40" cy="36" r="24" fill="#1e1b4b"/>
        <rect x="18" y="30" width="44" height="11" rx="5.5" fill="#fde7c7"/>
        <circle cx="32" cy="35.5" r="2.4" fill="#111"/><circle cx="48" cy="35.5" r="2.4" fill="#111"/>
        <path d="M62 28 L84 20 L80 30 L92 30" stroke="var(--p)" stroke-width="5" fill="none" stroke-linecap="round"/>
        <rect x="16" y="26" width="48" height="5" fill="var(--p)"/>
        <path d="M60 70 Q80 66 92 58" stroke="#1e1b4b" stroke-width="9" fill="none" stroke-linecap="round"/>
      </g>
      ${petals}
    </svg>
    <h2>Ninja Piano</h2>
    <div class="sub">Learn piano, step by step</div>
    <div class="feat"><i>🎼</i>Read real sheet music</div>
    <div class="feat"><i>🔤</i>See the note name on every note</div>
    <div class="feat"><i>🎹</i>Play along and improve</div>
    <a class="btn block" href="#/home" id="start">Get Started ${icon('arrowR')}</a>
    <a class="link" href="#/library" id="explore">Explore Songs</a>
  </section>`;
  const seen = () => { setSetting('seenWelcome', true); unlockAudio(); };
  app.querySelector('#start').onclick = seen;
  app.querySelector('#explore').onclick = seen;
};

views.home = () => {
  setNav('home');
  const cat = sessionStorage.getItem('np.homeCat') || 'All';
  const played = Object.entries(progress).sort((a, b) => b[1].last - a[1].last);
  const lastSong = played.length ? songById(played[0][0]) : null;
  const learned = Object.values(progress).filter((p) => p.done).length;
  const avg = learned ? Math.round(Object.values(progress).filter((p) => p.done).reduce((a, p) => a + p.best, 0) / learned) : 0;
  const streak = load('np.streak', { days: 0 }).days;
  const pick = SONGS.length ? SONGS[new Date().getDate() * 7 % SONGS.length] : null;
  const pool = cat === 'All' ? SONGS : SONGS.filter((s) => s.cat === cat);
  const hpage = Math.min(Math.max(1, Number(sessionStorage.getItem('np.homePage')) || 1), Math.max(1, Math.ceil(pool.length / 30)));
  const hour = new Date().getHours();
  const hi = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const PIANO_SVG = `<div class="piano-deco" aria-hidden="true"><svg viewBox="0 0 320 48" xmlns="http://www.w3.org/2000/svg">
    ${Array.from({length:18},(_,i)=>`<rect x="${i*17+1}" y="2" width="15" height="40" rx="3" fill="rgba(255,255,255,.12)" stroke="rgba(255,255,255,.08)" stroke-width=".5"/>`).join('')}
    ${[1,2,4,5,6,8,9,11,12,13,15,16].map(i=>`<rect x="${i*17+10}" y="2" width="10" height="26" rx="2" fill="rgba(0,0,0,.35)"/>`).join('')}
  </svg></div>`;

  app.innerHTML = `<section class="view">
    <div class="top" style="margin-bottom:0"><div class="brand"><span class="logo">${LOGO}</span>Ninja Piano</div>
      ${THEME_BTN}<a class="iconbtn fav-btn ${favs.size?'has-fav':''}" href="#/favs" aria-label="Favourites">${icon('heart')}<span class="fav-count">${favs.size||''}</span></a><a class="iconbtn" href="#/library?focus=1" aria-label="Search">${icon('search')}</a></div>
    ${PIANO_SVG}
    ${heading('📷', 'Scan sheet music')}
    <a class="hero-card scan-card" href="#/scan" style="text-decoration:none;cursor:pointer">
      <div class="thumb" style="background:linear-gradient(135deg,#a8c8f8,#7eb8f7);border-radius:14px;width:56px;height:56px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:26px">📷</div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:800;font-size:17px">Import from photo or PDF</div>
        <div style="opacity:.7;font-size:13px">Scan printed sheet music and play it instantly</div>
        <div style="margin-top:6px;display:flex;gap:6px"><span style="font-size:11px;padding:2px 10px;background:rgba(160,80,220,.15);color:#a050dc;border-radius:20px;font-weight:600">OMR</span><span style="font-size:11px;padding:2px 10px;background:rgba(80,200,120,.15);color:#30a060;border-radius:20px;font-weight:600">Free</span></div>
      </div>
      <div style="width:38px;height:38px;border-radius:50%;background:#a050dc;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px;color:#fff">▶</div>
    </a>
    <h2 class="hello"><span class="gt">${hi}${settings.name ? ', ' + esc(settings.name) : ''}!</span> <span class="wave">👋</span></h2>
    <div class="muted">Choose a song to start learning</div>
    ${lastSong ? `${heading('▶️', 'Continue learning')}
      <div class="hero-card">${thumb(lastSong)}<div style="flex:1;min-width:0"><div style="font-weight:800;font-size:17px">${esc(lastSong.title)}</div>
      <div style="opacity:.8;font-size:13px">Best ${progress[lastSong.id].best || 0}% · ${progress[lastSong.id].plays} plays</div></div>
      <a class="btn sm" href="#/practice/${lastSong.id}">Practice</a></div>` : ''}
    ${heading('📈', 'Your progress')}
    <div class="stats"><div class="card stat s1"><b>${learned}</b><span>Songs learned</span></div>
      <div class="card stat s2"><b>${streak}🔥</b><span>Day streak</span></div>
      <div class="card stat s3"><b>${avg}%</b><span>Avg accuracy</span></div></div>
    ${pick ? `${heading('⭐', 'Song of the day')}<div class="list">${songRow(pick, { time: true })}</div>` : ''}
    ${heading('🎹', 'Browse songs', `<a href="#/library">See all ${SONGS.length}</a>`)}
    <div class="chips" id="cats">${catChips(cat)}</div>
    <div class="list grid2" id="hlist">${pool.slice((hpage - 1) * 30, hpage * 30).map((s) => songRow(s, { time: true })).join('') || '<div class="empty">No songs yet.</div>'}</div>
    <div class="pager" id="hpager">${pagerHtml(hpage, Math.ceil(pool.length / 30), pool.length, 30)}</div>
  </section>`;
  app.querySelector('#hpager').onclick = (e) => {
    const p = Number(e.target.closest('[data-p]')?.dataset.p);
    if (!p) return;
    sessionStorage.setItem('np.homePage', p);
    views.home();
    document.getElementById('cats').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  app.querySelector('#cats').onclick = (e) => {
    const c = e.target.closest('.chip')?.dataset.c;
    if (!c) return;
    sessionStorage.setItem('np.homeCat', c);
    sessionStorage.setItem('np.homePage', 1);
    views.home();
  };
};

views.library = (params) => {
  setNav('library');
  const PAGE = 30;
  const st = { q: '', cat: params.get('cat') || 'All', level: 'All', fav: params.get('fav') === '1', page: 1 };
  if (st.cat !== 'All' && !CATEGORIES.includes(st.cat)) st.cat = 'All';
  app.innerHTML = `<section class="view">
    <div class="top"><a class="iconbtn" href="#/home">${icon('back')}</a><h1>All Songs</h1>${THEME_BTN}<button class="iconbtn" id="fav" aria-label="Favourites">${icon('heart')}</button></div>
    <label class="search">${icon('search')}<input id="q" type="search" placeholder="Search ${SONGS.length} songs, composers…" autocomplete="off"></label>
    <div class="banner"><div><div class="gt big">Song Library</div><div class="muted">${SONGS.length} songs · 30 per page</div></div><span class="bn-emoji">🎼</span></div>
    <div class="chips" id="cats">${catChips(st.cat)}</div>
    <div class="chips" id="lv" style="padding-top:0">${['All', 'Easy', 'Medium', 'Hard'].map((c) => `<button class="chip" data-l="${c}">${c === 'All' ? 'All levels' : c}</button>`).join('')}</div>
    <div class="muted" id="count" style="font-size:13px;margin:4px 0 10px"></div>
    <div class="list grid2" id="list"></div>
    <div class="pager" id="pager"></div>
  </section>`;
  const $ = (s) => app.querySelector(s);
  const draw = () => {
    const q = st.q.trim().toLowerCase();
    const list = SONGS.filter((s) => (st.cat === 'All' || s.cat === st.cat) && (st.level === 'All' || s.level === st.level)
      && (!st.fav || favs.has(s.id)) && (!q || `${s.title} ${s.composer} ${s.cat}`.toLowerCase().includes(q)));
    const pages = Math.max(1, Math.ceil(list.length / PAGE));
    st.page = Math.min(st.page, pages);
    $('#cats').querySelectorAll('.chip').forEach((c) => c.classList.toggle('on', c.dataset.c === st.cat));
    $('#lv').querySelectorAll('.chip').forEach((c) => c.classList.toggle('on', c.dataset.l === st.level));
    $('#fav').classList.toggle('on', st.fav);
    $('#count').textContent = `${list.length} song${list.length === 1 ? '' : 's'}${st.fav ? ' in favourites' : ''}`;
    $('#list').innerHTML = list.slice((st.page - 1) * PAGE, st.page * PAGE).map((s) => songRow(s, { time: true })).join('')
      || `<div class="empty">${st.fav ? 'Tap ♥ on a song to save it here.' : 'No songs match.'}</div>`;
    $('#pager').innerHTML = pagerHtml(st.page, pages, list.length, PAGE);
  };
  $('#q').oninput = (e) => { st.q = e.target.value; st.page = 1; draw(); };
  $('#cats').onclick = (e) => { const c = e.target.closest('.chip')?.dataset.c; if (c) { st.cat = c; st.page = 1; draw(); } };
  $('#lv').onclick = (e) => { const l = e.target.closest('.chip')?.dataset.l; if (l) { st.level = l; st.page = 1; draw(); } };
  $('#fav').onclick = () => { st.fav = !st.fav; st.page = 1; draw(); };
  $('#pager').onclick = (e) => { const p = Number(e.target.closest('[data-p]')?.dataset.p); if (p) { st.page = p; draw(); scrollTo({ top: 0, behavior: 'smooth' }); } };
  draw();
  if (params.get('focus')) $('#q').focus();
};

views.practiceHub = () => {
  setNav('practice');
  const inProgress = Object.entries(progress).filter(([id, p]) => !p.done && songById(id)).map(([id]) => songById(id));
  const easy = SONGS.filter((s) => s.level === 'Easy' && !progress[s.id]?.done).slice(0, 8);
  const ex = SONGS.filter((s) => s.cat === 'Exercises').slice(0, 6);
  app.innerHTML = `<section class="view">
    <div class="top"><div class="brand"><span class="logo">${LOGO}</span>Practice</div>${THEME_BTN}</div>
    <div class="card pad" style="display:flex;gap:14px;align-items:center">
      <div style="font-size:40px">🥷</div>
      <div><b>How practice works</b><div class="muted" style="font-size:13.5px;margin-top:4px">The next note glows on the keyboard and its name shows on the sheet. Play it to move on. Use the on-screen keys, your computer keyboard (A S D F…) or a MIDI piano.</div></div>
    </div>
    <a class="hero-card scan-card" href="#/scan" style="text-decoration:none;cursor:pointer;margin-top:10px">
      <div style="background:linear-gradient(135deg,#a8c8f8,#7b5ea7);border-radius:14px;width:56px;height:56px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:28px">🎵</div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:800;font-size:16px">Add your own notes</div>
        <div style="opacity:.7;font-size:13px">Import MusicXML, scan a photo or upload a PDF</div>
        <div style="margin-top:6px;display:flex;gap:6px">
          <span style="font-size:11px;padding:2px 10px;background:rgba(123,94,167,.18);color:var(--p);border-radius:20px;font-weight:600">MusicXML</span>
          <span style="font-size:11px;padding:2px 10px;background:rgba(123,94,167,.18);color:var(--p);border-radius:20px;font-weight:600">PDF</span>
          <span style="font-size:11px;padding:2px 10px;background:rgba(123,94,167,.18);color:var(--p);border-radius:20px;font-weight:600">Photo</span>
        </div>
      </div>
      <div style="width:38px;height:38px;border-radius:50%;background:var(--p);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff">${icon('arrowR')}</div>
    </a>
    ${heading('🎼', 'Chord Progressions')}
    <a class="song" href="#/progressions">
      <div class="thumb" style="background:linear-gradient(135deg,#6d28d9,#3b82f6)"><svg viewBox="0 0 58 58" xmlns="http://www.w3.org/2000/svg"><line x1="6" y1="14" x2="52" y2="14" stroke="#fff" stroke-width="1.2" opacity=".5"/><line x1="6" y1="22" x2="52" y2="22" stroke="#fff" stroke-width="1.2" opacity=".5"/><line x1="6" y1="30" x2="52" y2="30" stroke="#fff" stroke-width="1.2" opacity=".5"/><line x1="6" y1="38" x2="52" y2="38" stroke="#fff" stroke-width="1.2" opacity=".5"/><ellipse cx="13" cy="38" rx="5" ry="3.5" fill="#ef4444"/><line x1="18" y1="38" x2="18" y2="10" stroke="#ef4444" stroke-width="1.5"/><ellipse cx="26" cy="30" rx="5" ry="3.5" fill="#eab308"/><line x1="31" y1="30" x2="31" y2="6" stroke="#eab308" stroke-width="1.5"/><ellipse cx="39" cy="22" rx="5" ry="3.5" fill="#22c55e"/><line x1="44" y1="22" x2="44" y2="4" stroke="#22c55e" stroke-width="1.5"/><ellipse cx="50" cy="30" rx="5" ry="3.5" fill="#3b82f6"/><line x1="55" y1="30" x2="55" y2="8" stroke="#3b82f6" stroke-width="1.5"/><text x="29" y="54" text-anchor="middle" font-size="8" fill="#fff" font-weight="700" opacity=".85">I – IV – V – I</text></svg></div>
      <div class="meta"><div class="t">Progression Practice</div>
        <div class="s">Play by mood · Transpose to any key</div>
        <div class="tags"><span class="tag cat">😊 Happy</span><span class="tag cat">🎸 Rock</span><span class="tag cat">🎷 Jazz</span><span class="tag cat">${PROGRESSIONS_DB.length} progressions</span></div>
      </div><span class="play">${icon('play')}</span>
    </a>
    ${heading('📷', 'Scan sheet music')}
    <a class="song" href="#/scan">
      <div class="thumb" style="background:linear-gradient(135deg,#0ea5e9,#0284c7)"><svg viewBox="0 0 58 58" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="18" width="38" height="28" rx="3" fill="rgba(255,255,255,.15)" stroke="#fff" stroke-width="1.5"/><rect x="16" y="10" width="12" height="10" rx="2" fill="rgba(255,255,255,.3)" stroke="#fff" stroke-width="1.2"/><circle cx="29" cy="32" r="7" fill="none" stroke="#fff" stroke-width="2"/><circle cx="29" cy="32" r="3" fill="#fff"/><line x1="8" y1="26" x2="14" y2="26" stroke="#fff" stroke-width="2" stroke-linecap="round"/><text x="29" y="54" text-anchor="middle" font-size="8" fill="#fff" font-weight="700" opacity=".85">SCAN &amp; PLAY</text></svg></div>
      <div class="meta"><div class="t">Import from photo or PDF</div>
        <div class="s">Scan printed sheet music and play it instantly</div>
        <div class="tags"><span class="tag cat">OMR</span><span class="tag cat">Free</span></div>
      </div><span class="play">${icon('arrowR')}</span>
    </a>
    ${heading('🎯', 'Practice styles')}
    <div class="practice-styles-list">
      ${(() => {
        const learnSongs = SONGS.filter(s=>s.level==='Easy').slice(0,3);
        const rhythmSongs = SONGS.filter(s=>s.level==='Medium').slice(0,3);
        const memorySongs = SONGS.filter(s=>s.level==='Easy').slice(3,6);
        const speedSongs = SONGS.filter(s=>s.level==='Medium').slice(3,6);
        const miniList = (songs, style) => songs.length ? `<div class="pstyle-songs">${songs.map(s=>`<a class="pstyle-song-link" href="#/practice/${s.id}" onclick="localStorage.setItem('np.pstyle',JSON.stringify({style:'${style}'}))">${s.title}</a>`).join('')}</div>` : '';
        const NOTA_LEARN = `<svg viewBox="0 0 80 44" xmlns="http://www.w3.org/2000/svg"><line x1="4" y1="10" x2="76" y2="10" stroke="currentColor" stroke-width=".8" opacity=".3"/><line x1="4" y1="18" x2="76" y2="18" stroke="currentColor" stroke-width=".8" opacity=".3"/><line x1="4" y1="26" x2="76" y2="26" stroke="currentColor" stroke-width=".8" opacity=".3"/><line x1="4" y1="34" x2="76" y2="34" stroke="currentColor" stroke-width=".8" opacity=".3"/><line x1="4" y1="42" x2="76" y2="42" stroke="currentColor" stroke-width=".8" opacity=".3"/><ellipse cx="24" cy="34" rx="5" ry="3.5" fill="#ef4444"/><line x1="29" y1="34" x2="29" y2="10" stroke="#ef4444" stroke-width="1.2"/><text x="24" y="43" text-anchor="middle" font-size="7" fill="#ef4444" font-weight="700">C</text><ellipse cx="48" cy="26" rx="5" ry="3.5" fill="#eab308"/><line x1="53" y1="26" x2="53" y2="6" stroke="#eab308" stroke-width="1.2"/><text x="48" y="35" text-anchor="middle" font-size="7" fill="#eab308" font-weight="700">E</text><ellipse cx="64" cy="18" rx="5" ry="3.5" fill="#06b6d4"/><line x1="69" y1="18" x2="69" y2="2" stroke="#06b6d4" stroke-width="1.2"/><text x="64" y="27" text-anchor="middle" font-size="7" fill="#06b6d4" font-weight="700">G</text></svg>`;
        const NOTA_RHYTHM = `<svg viewBox="0 0 80 44" xmlns="http://www.w3.org/2000/svg"><line x1="4" y1="10" x2="76" y2="10" stroke="currentColor" stroke-width=".8" opacity=".3"/><line x1="4" y1="18" x2="76" y2="18" stroke="currentColor" stroke-width=".8" opacity=".3"/><line x1="4" y1="26" x2="76" y2="26" stroke="currentColor" stroke-width=".8" opacity=".3"/><line x1="4" y1="34" x2="76" y2="34" stroke="currentColor" stroke-width=".8" opacity=".3"/><line x1="4" y1="42" x2="76" y2="42" stroke="currentColor" stroke-width=".8" opacity=".3"/><ellipse cx="18" cy="34" rx="5" ry="3.5" fill="#ef4444"/><line x1="23" y1="34" x2="23" y2="10" stroke="#ef4444" stroke-width="1.2"/><text x="18" y="43" text-anchor="middle" font-size="7" fill="#ef4444" font-weight="700">D</text><ellipse cx="36" cy="30" rx="5" ry="3.5" fill="#22c55e"/><line x1="41" y1="30" x2="41" y2="8" stroke="#22c55e" stroke-width="1.2"/><text x="36" y="39" text-anchor="middle" font-size="7" fill="#22c55e" font-weight="700">F</text><ellipse cx="54" cy="26" rx="5" ry="3.5" fill="#3b82f6"/><line x1="59" y1="26" x2="59" y2="6" stroke="#3b82f6" stroke-width="1.2"/><text x="54" y="35" text-anchor="middle" font-size="7" fill="#3b82f6" font-weight="700">A</text><rect x="10" y="40" width="4" height="1.5" fill="var(--bad)" rx=".5" opacity=".7"/><rect x="28" y="40" width="4" height="1.5" fill="var(--bad)" rx=".5" opacity=".7"/><rect x="46" y="40" width="4" height="1.5" fill="var(--bad)" rx=".5" opacity=".7"/></svg>`;
        const NOTA_MEMORY = `<svg viewBox="0 0 80 44" xmlns="http://www.w3.org/2000/svg"><line x1="4" y1="10" x2="76" y2="10" stroke="currentColor" stroke-width=".8" opacity=".3"/><line x1="4" y1="18" x2="76" y2="18" stroke="currentColor" stroke-width=".8" opacity=".3"/><line x1="4" y1="26" x2="76" y2="26" stroke="currentColor" stroke-width=".8" opacity=".3"/><line x1="4" y1="34" x2="76" y2="34" stroke="currentColor" stroke-width=".8" opacity=".3"/><line x1="4" y1="42" x2="76" y2="42" stroke="currentColor" stroke-width=".8" opacity=".3"/><ellipse cx="24" cy="34" rx="5" ry="3.5" fill="var(--muted)"/><line x1="29" y1="34" x2="29" y2="10" stroke="var(--muted)" stroke-width="1.2"/><ellipse cx="48" cy="26" rx="5" ry="3.5" fill="var(--muted)"/><line x1="53" y1="26" x2="53" y2="6" stroke="var(--muted)" stroke-width="1.2"/><ellipse cx="64" cy="18" rx="5" ry="3.5" fill="var(--muted)"/><line x1="69" y1="18" x2="69" y2="2" stroke="var(--muted)" stroke-width="1.2"/><text x="40" y="44" text-anchor="middle" font-size="7.5" fill="var(--bad)" font-weight="800">?  ?  ?</text></svg>`;
        const NOTA_SPEED = `<svg viewBox="0 0 80 44" xmlns="http://www.w3.org/2000/svg"><line x1="4" y1="10" x2="76" y2="10" stroke="currentColor" stroke-width=".8" opacity=".3"/><line x1="4" y1="18" x2="76" y2="18" stroke="currentColor" stroke-width=".8" opacity=".3"/><line x1="4" y1="26" x2="76" y2="26" stroke="currentColor" stroke-width=".8" opacity=".3"/><line x1="4" y1="34" x2="76" y2="34" stroke="currentColor" stroke-width=".8" opacity=".3"/><line x1="4" y1="42" x2="76" y2="42" stroke="currentColor" stroke-width=".8" opacity=".3"/><ellipse cx="16" cy="34" rx="5" ry="3.5" fill="#8b5cf6" opacity=".4"/><line x1="21" y1="34" x2="21" y2="10" stroke="#8b5cf6" stroke-width="1.2" opacity=".4"/><text x="16" y="43" text-anchor="middle" font-size="7" fill="#8b5cf6" font-weight="700" opacity=".4">B</text><ellipse cx="36" cy="34" rx="5" ry="3.5" fill="#8b5cf6" opacity=".7"/><line x1="41" y1="34" x2="41" y2="10" stroke="#8b5cf6" stroke-width="1.2" opacity=".7"/><text x="36" y="43" text-anchor="middle" font-size="7" fill="#8b5cf6" font-weight="700" opacity=".7">B</text><ellipse cx="56" cy="34" rx="5" ry="3.5" fill="#8b5cf6"/><line x1="61" y1="34" x2="61" y2="10" stroke="#8b5cf6" stroke-width="1.2"/><text x="56" y="43" text-anchor="middle" font-size="7" fill="#8b5cf6" font-weight="700">B</text><text x="72" y="28" text-anchor="middle" font-size="9" fill="#22c55e" font-weight="800">🚀</text></svg>`;
        return `
          <div class="pstyle-card"><div class="pstyle-nota">${NOTA_LEARN}</div><div class="pstyle-info"><b>🎓 Learn</b><span>App waits for the right key — glowing keys guide you.</span>${miniList(learnSongs,'learn')}</div></div>
          <div class="pstyle-card"><div class="pstyle-nota">${NOTA_RHYTHM}</div><div class="pstyle-info"><b>🥁 Rhythm</b><span>Play in time and get scored Perfect, Good or Miss.</span>${miniList(rhythmSongs,'rhythm')}</div></div>
          <div class="pstyle-card"><div class="pstyle-nota">${NOTA_MEMORY}</div><div class="pstyle-info"><b>🧠 Memory</b><span>No names or glowing keys — read real notes from the staff.</span>${miniList(memorySongs,'memory')}</div></div>
          <div class="pstyle-card"><div class="pstyle-nota">${NOTA_SPEED}</div><div class="pstyle-info"><b>🚀 Speed Builder</b><span>Loop from 60% up to full speed automatically.</span>${miniList(speedSongs,'speed')}</div></div>`;
      })()}
    </div>
    <div class="muted" style="font-size:12.5px;margin:6px 2px 2px">Or open any song → tap Practice → choose a style.</div>
    ${heading('🎮', 'Skill games')}
    <div class="list">
      <a class="song" href="#/quiz/read"><div class="thumb" style="background:linear-gradient(135deg,#ddd6fe,#6d5dfc)"><svg viewBox="0 0 58 58" xmlns="http://www.w3.org/2000/svg"><line x1="6" y1="18" x2="52" y2="18" stroke="#fff" stroke-width="1.5" opacity=".7"/><line x1="6" y1="26" x2="52" y2="26" stroke="#fff" stroke-width="1.5" opacity=".7"/><line x1="6" y1="34" x2="52" y2="34" stroke="#fff" stroke-width="1.5" opacity=".7"/><line x1="6" y1="42" x2="52" y2="42" stroke="#fff" stroke-width="1.5" opacity=".7"/><line x1="6" y1="50" x2="52" y2="50" stroke="#fff" stroke-width="1.5" opacity=".7"/><ellipse cx="29" cy="42" rx="7" ry="5" fill="#fff"/><line x1="36" y1="42" x2="36" y2="12" stroke="#fff" stroke-width="2"/><text x="29" y="56" text-anchor="middle" font-size="9" fill="#fff" font-weight="700">C</text></svg></div><div class="meta"><div class="t">Note Reading</div><div class="s">See a note on the staff — play it on the keys</div><div class="tags"><span class="tag cat">Best ${load('np.quiz.read', 0)}🔥</span><span class="tag cat">20 drills/level</span></div></div><span class="play">${icon('play')}</span></a>
      <a class="song" href="#/quiz/ear"><div class="thumb" style="background:linear-gradient(135deg,#a7f3d0,#059669)"><svg viewBox="0 0 58 58" xmlns="http://www.w3.org/2000/svg"><text x="29" y="38" text-anchor="middle" font-size="28" fill="#fff">👂</text><text x="29" y="52" text-anchor="middle" font-size="9" fill="#fff" font-weight="700" opacity=".9">A</text></svg></div><div class="meta"><div class="t">Ear Training</div><div class="s">Hear a note — find it on the keyboard</div><div class="tags"><span class="tag cat">Best ${load('np.quiz.ear', 0)}🔥</span><span class="tag cat">3 levels</span></div></div><span class="play">${icon('play')}</span></a>
      <a class="song" href="#/quiz/chord"><div class="thumb" style="background:linear-gradient(135deg,#fde68a,#f59e0b)"><svg viewBox="0 0 58 58" xmlns="http://www.w3.org/2000/svg"><line x1="6" y1="22" x2="52" y2="22" stroke="#fff" stroke-width="1.2" opacity=".6"/><line x1="6" y1="30" x2="52" y2="30" stroke="#fff" stroke-width="1.2" opacity=".6"/><line x1="6" y1="38" x2="52" y2="38" stroke="#fff" stroke-width="1.2" opacity=".6"/><line x1="6" y1="46" x2="52" y2="46" stroke="#fff" stroke-width="1.2" opacity=".6"/><ellipse cx="18" cy="38" rx="5" ry="3.5" fill="#fff"/><text x="18" y="50" text-anchor="middle" font-size="7" fill="#fff" font-weight="700">C</text><ellipse cx="29" cy="30" rx="5" ry="3.5" fill="#fff"/><text x="29" y="42" text-anchor="middle" font-size="7" fill="#fff" font-weight="700">E</text><ellipse cx="40" cy="22" rx="5" ry="3.5" fill="#fff"/><text x="40" y="34" text-anchor="middle" font-size="7" fill="#fff" font-weight="700">G</text></svg></div><div class="meta"><div class="t">Chord Speller</div><div class="s">See a chord name — play all the notes together</div><div class="tags"><span class="tag cat">Best ${load('np.quiz.chord', 0)}🔥</span><span class="tag cat">Major · Minor · 7th</span></div></div><span class="play">${icon('play')}</span></a>
      <a class="song" href="#/quiz/black"><div class="thumb" style="background:linear-gradient(135deg,#1f2937,#4b5563)"><svg viewBox="0 0 58 58" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="10" width="10" height="28" rx="2" fill="rgba(255,255,255,.15)"/><rect x="20" y="10" width="10" height="28" rx="2" fill="rgba(255,255,255,.15)"/><rect x="34" y="10" width="10" height="28" rx="2" fill="rgba(255,255,255,.15)"/><rect x="48" y="10" width="8" height="28" rx="2" fill="rgba(255,255,255,.15)"/><rect x="13" y="10" width="8" height="18" rx="1.5" fill="#fff"/><rect x="27" y="10" width="8" height="18" rx="1.5" fill="#fff"/><rect x="41" y="10" width="8" height="18" rx="1.5" fill="#fff"/><text x="29" y="52" text-anchor="middle" font-size="9" fill="#fff" font-weight="700">F# · Bb · Eb</text></svg></div><div class="meta"><div class="t">Black Key Drill</div><div class="s">Ear training for sharps &amp; flats only</div><div class="tags"><span class="tag cat">Best ${load('np.quiz.black', 0)}🔥</span><span class="tag cat">5 black keys</span></div></div><span class="play">${icon('play')}</span></a>
    </div>
    ${heading('🔥', 'Hard challenges')}<div class="list grid2">${SONGS.filter((s) => s.level === 'Hard').slice(0, 6).map((s) => songRow(s)).join('')}</div>
    ${inProgress.length ? `${heading('💪', 'Keep going')}<div class="list grid2">${inProgress.map((s) => songRow(s)).join('')}</div>` : ''}
    ${heading('🔥', 'Warm-up exercises')}<div class="list grid2">${ex.map((s) => songRow(s)).join('') || '<div class="empty">Loading…</div>'}</div>
    ${heading('🌱', 'Easy songs to learn next')}<div class="list grid2">${easy.map((s) => songRow(s)).join('')}</div>
  </section>`;
};

/* --- shared player/practice pieces --- */

// Render a tiny 1-note VexFlow snippet into el showing the given midi notes.
let _lastMiniKey = '';
// Mini staff SVG — shows up to 4 notes on a treble clef, with note names below each head.
// Staff lines at y=10,16,22,28,34. Middle C ledger = y=46. Note positions (midi%12 → line offset from B4=y=10):
const MINI_NOTE_Y = { 0:46,1:45,2:40,3:39,4:34,5:31,6:30,7:28,8:27,9:22,10:21,11:16 }; // C..B offsets
const MINI_NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const renderMiniScore = (el, rhMidis, lhMidis) => {
  if (!el) return;
  const midis = (rhMidis.length ? rhMidis : lhMidis).slice(0, 4);
  const k = midis.join(',');
  if (k === _lastMiniKey) return;
  _lastMiniKey = k;
  if (!midis.length) { el.innerHTML = ''; return; }

  // Octave shift: bring notes into treble range (midi 60-84)
  const shifted = midis.map(m => { let n=m; while(n<52) n+=12; while(n>88) n-=12; return n; });

  const W = 100, H = 58;
  const staffLines = [10,16,22,28,34].map(y=>`<line x1="8" y1="${y}" x2="${W-4}" y2="${y}" stroke="currentColor" stroke-width=".8" opacity=".5"/>`).join('');
  // Treble clef glyph (simplified)
  const clef = `<text x="9" y="38" font-size="32" fill="currentColor" opacity=".7" font-family="serif">𝄞</text>`;

  const noteSpacing = Math.min(18, (W - 30) / shifted.length);
  const notesSvg = shifted.map((m, i) => {
    const pc = m % 12;
    const oct = Math.floor(m / 12) - 5; // offset from octave 5
    let y = (MINI_NOTE_Y[pc] ?? 22) - oct * 21;
    const name = MINI_NOTE_NAMES[pc];
    const x = 30 + i * noteSpacing;
    // Ledger line for middle C (below staff)
    const ledger = y >= 43 ? `<line x1="${x-5}" y1="${y}" x2="${x+12}" y2="${y}" stroke="currentColor" stroke-width=".8" opacity=".5"/>` : '';
    // Accidental
    const sharp = name.includes('#') ? `<text x="${x-5}" y="${y+4}" font-size="8" fill="var(--p)" font-weight="900">#</text>` : '';
    return `${ledger}${sharp}<ellipse cx="${x+3}" cy="${y}" rx="5" ry="3.5" fill="var(--p)"/><line x1="${x+8}" y1="${y}" x2="${x+8}" y2="${y-18}" stroke="var(--p)" stroke-width="1.2"/><text x="${x+3}" y="${H-2}" text-anchor="middle" font-size="7.5" fill="var(--p)" font-weight="800">${name}</text>`;
  }).join('');

  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">${staffLines}${clef}${notesSvg}</svg>`;
};

const keyRange = (parsed) => {
  const all = [...parsed.rh, ...parsed.lh].flat().flatMap((n) => n.pitches.map((p) => p.midi));
  return { low: Math.min(48, ...all), high: Math.max(72, ...all) };
};

const scoreOpts = () => ({ showNames: settings.showNames, nameSystem: settings.nameSystem });

const scrollScoreTo = (scoreEl, y) => {
  if (y == null) return;
  const svg = scoreEl.querySelector('svg');
  const scale = svg.clientWidth / svg.viewBox.baseVal.width;
  const top = svg.getBoundingClientRect().top + scrollY + y * scale - 90;
  if (Math.abs(top - scrollY) > 40) scrollTo({ top, behavior: 'smooth' });
};

views.song = (params, id) => {
  const song = songById(id);
  if (!song) return notFound();
  setNav('practice-run');
  const parsed = parseSong(song);
  const tl = buildTimeline(parsed);
  const secs = durationSeconds(parsed);
  const st = { playing: false, beat: 0, speed: settings.tempo / 100, loop: false, metro: settings.metronome, hands: ['rh', 'lh'], tab: 'sheet' };
  const speeds = [0.5, 0.75, 1, 1.25];
  if (!speeds.includes(st.speed)) speeds.push(st.speed), speeds.sort();

  app.innerHTML = `<section class="view">
    <div class="top"><a class="iconbtn" href="javascript:history.back()">${icon('back')}</a><h1>${esc(song.title)}</h1>
      <div style="display:flex;gap:4px;align-items:center">${voicePicker()}${sustainBtn()}<button id="colorToggle" class="iconbtn${settings.colorNotes?' on':''}" title="Color notes by pitch" style="font-size:16px">🎨</button><button class="iconbtn ${favs.has(id) ? 'on' : ''}" id="fav" aria-label="Favourite">${icon('heart')}</button></div></div>
    <div style="display:flex;gap:8px;padding:0 16px 8px">
      <a class="btn block ok" href="#/practice/${id}" style="flex:1">${icon('practice')} Practice</a>
      <a class="btn block" href="#/practice/${id}" id="fallingBtnTop" style="flex:1;background:linear-gradient(135deg,#6d5dfc,#4f8ef7);color:#fff">🎹 Falling Notes</a>
    </div>
    <div class="player-head"><div class="tags"><span class="tag ${song.level}">${song.level}</span><span class="tag cat">${song.cat}</span><span class="tag cat">⏱ ${fmtTime(secs)}</span><span class="tag cat">${song.key} · ${song.time}</span></div>
      <div class="muted" style="font-size:13px">${esc(song.composer || 'Traditional')}</div></div>
    <div class="progress" id="prog"><i></i><b></b></div>
    <div class="times"><span id="tcur">0:00</span><span>${fmtTime(secs)}</span></div>
    <div class="controls">
      <button class="iconbtn" id="loop" aria-label="Loop">${icon('loop')}</button>
      <button class="iconbtn" id="restart" aria-label="Restart">${icon('prev')}</button>
      <button class="big" id="play" aria-label="Play">${icon('play')}</button>
      <button class="iconbtn" id="metro" aria-label="Metronome">${icon('metro')}</button>
      <button class="speed" id="speed">${st.speed}x</button>
    </div>
    <div class="seg" id="tabs"><button data-t="sheet" class="on">Sheet Music</button><button data-t="hands">Hands</button></div>
    <div class="seg" id="hands" style="display:none;margin-top:8px"><button data-h="both" class="on">Both hands</button><button data-h="rh">Right hand</button><button data-h="lh">Left hand</button></div>
    <div class="card score-wrap"><h4>${esc(song.title)}</h4><div class="by">${esc(song.composer || 'Traditional')}</div><div class="score" id="score"></div></div>
    <div style="display:flex;gap:8px;margin-top:14px">
      <a class="btn block ok" href="#/practice/${id}" style="flex:1">${icon('practice')} Practice</a>
      <a class="btn block" href="#/practice/${id}" id="fallingBtn" style="flex:1;background:linear-gradient(135deg,#6d5dfc,#4f8ef7);color:#fff">🎹 Falling Notes</a>
    </div>
    <div class="kb-dock">
      <div class="card kb-info">
        <div class="mini-score-wrap"><div id="miniScore" class="mini-score"></div></div>
        <div class="cn-block"><div class="cn">Current note<b id="cnote">—</b></div><div class="next" id="nnote"></div></div>
      </div>
      <div class="kb" id="kb"></div>
    </div>
  </section>`;
  const $ = (s) => app.querySelector(s);
  // Falling Notes shortcut buttons (top + bottom)
  const goFalling = (e) => {
    e.preventDefault();
    save('np.pstyle', { style: 'falling' });
    location.hash = `#/practice/${id}`;
  };
  $('#fallingBtn')?.addEventListener('click', goFalling);
  $('#fallingBtnTop')?.addEventListener('click', goFalling);
  let score;
  const draw = () => { score = renderScore($('#score'), parsed, scoreOpts()); colorizeScore($('#score')); };
  draw();
  const { low, high } = keyRange(parsed);
  const kb = createKeyboard($('#kb'), { low, high, labels: settings.keyLabels, nameSystem: settings.nameSystem,
    onPress: (m) => { unlockAudio(); playNote(m, { voice: settings.voice, volume: settings.volume / 100 }); } });
  kb.scrollTo(tl.events[0]?.midis[0] ?? 60);

  let startCtx = 0, timer = 0, raf = 0, nextIdx = 0, lastBeatClick = -1, lastSys = -1;
  const beatToSec = (b) => (b * 60) / (parsed.bpm * st.speed);
  const curBeat = () => (now() - startCtx) / beatToSec(1);

  const schedule = () => {
    const horizon = curBeat() + 0.6 / beatToSec(1);
    while (nextIdx < tl.events.length && tl.events[nextIdx].start < horizon) {
      const e = tl.events[nextIdx++];
      if (!st.hands.includes(e.hand)) continue;
      const when = startCtx + beatToSec(e.start) - now();
      e.midis.forEach((m) => playNote(m, { duration: beatToSec(e.beats), when, voice: settings.voice, volume: settings.volume / 100, velocity: e.hand === 'rh' ? 0.85 : 0.6 }));
    }
    if (st.metro) {
      const b = Math.floor(curBeat() + 0.1);
      if (b > lastBeatClick && b < tl.total) { lastBeatClick = b; playClick(b % parsed.num === 0, Math.max(0, startCtx + beatToSec(b) - now())); }
    }
  };
  const frame = () => {
    const b = curBeat();
    st.beat = b;
    if (b >= tl.total) {
      if (st.loop) { seek(0); return; }
      stop(); seek(0); return;
    }
    const active = tl.events.filter((e) => st.hands.includes(e.hand) && e.start <= b && b < e.start + e.beats);
    if (settings.highlight) score.mark(active.map((e) => e.id), 'cur');
    const lead = active.find((e) => e.hand === 'rh') || active[0];
    if (lead) {
      const y = score.cursorTo(lead.id);
      if (y !== lastSys) { lastSys = y; scrollScoreTo($('#score'), y); }
      $('#cnote').innerHTML = active.map((e) => eventLabel(e.names)).join(' + ');
      const nxt = tl.events.find((e) => st.hands.includes(e.hand) && e.start > lead.start && e.hand === lead.hand);
      $('#nnote').innerHTML = nxt ? `Next: ${eventLabel(nxt.names)} ›` : '';
      kb.setTargets(active.flatMap((e) => e.midis));
      renderMiniScore($('#miniScore'), active.filter(e=>e.hand==='rh').flatMap(e=>e.midis), active.filter(e=>e.hand==='lh').flatMap(e=>e.midis), parsed.key);
    }
    updateProg();
    raf = requestAnimationFrame(frame);
  };
  const updateProg = () => {
    const pct = Math.min(100, (st.beat / tl.total) * 100);
    $('#prog i').style.width = pct + '%';
    $('#prog b').style.left = pct + '%';
    $('#tcur').textContent = fmtTime(beatToSec(st.beat));
  };
  const start = () => {
    unlockAudio();
    startCtx = now() - beatToSec(st.beat) + 0.05;
    nextIdx = tl.events.findIndex((e) => e.start >= st.beat - 1e-6);
    if (nextIdx < 0) nextIdx = tl.events.length;
    lastBeatClick = Math.ceil(st.beat) - 1;
    st.playing = true;
    $('#play').innerHTML = icon('pause');
    timer = setInterval(schedule, 25);
    schedule();
    raf = requestAnimationFrame(frame);
  };
  const stop = () => {
    st.playing = false;
    clearInterval(timer);
    cancelAnimationFrame(raf);
    $('#play').innerHTML = icon('play');
  };
  const seek = (beat) => {
    const was = st.playing;
    if (was) stop();
    st.beat = Math.max(0, Math.min(beat, tl.total - 0.01));
    score.clear(); kb.setTargets([]); lastSys = -1;
    updateProg();
    if (was) start();
  };

  $('#play').onclick = () => (st.playing ? stop() : start());
  $('#restart').onclick = () => seek(0);
  $('#loop').onclick = (e) => { st.loop = !st.loop; e.currentTarget.classList.toggle('on', st.loop); };
  $('#metro').onclick = (e) => { st.metro = !st.metro; e.currentTarget.classList.toggle('on', st.metro); };
  $('#metro').classList.toggle('on', st.metro);
  $('#speed').onclick = (e) => {
    st.speed = speeds[(speeds.indexOf(st.speed) + 1) % speeds.length];
    e.currentTarget.textContent = st.speed + 'x';
    if (st.playing) { stop(); start(); }
  };
  $('#fav').onclick = (e) => {
    favs.has(id) ? favs.delete(id) : favs.add(id);
    save('np.favs', [...favs]);
    e.currentTarget.classList.toggle('on', favs.has(id));
    toast(favs.has(id) ? 'Saved to favourites' : 'Removed from favourites');
  };
  $('#tabs').onclick = (e) => {
    const t = e.target.dataset.t; if (!t) return;
    $('#tabs').querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.t === t));
    $('#hands').style.display = t === 'hands' ? 'flex' : 'none';
  };
  $('#hands').onclick = (e) => {
    const h = e.target.dataset.h; if (!h) return;
    st.hands = h === 'both' ? ['rh', 'lh'] : [h];
    $('#hands').querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.h === h));
  };
  const prog = $('#prog');
  const seekFromEvent = (e) => { const r = prog.getBoundingClientRect(); seek(((e.clientX - r.left) / r.width) * tl.total); };
  prog.onpointerdown = (e) => { prog.setPointerCapture(e.pointerId); seekFromEvent(e); prog.onpointermove = seekFromEvent; };
  prog.onpointerup = () => { prog.onpointermove = null; };
  // Tap a note on the sheet to hear it and jump there.
  $('#score').onclick = (e) => {
    const g = e.target.closest('.vf-stavenote'); if (!g) return;
    const ev = tl.events.find((x) => x.id === g.id.replace(/^vf-/, '')); if (!ev) return;
    ev.midis.forEach((m) => playNote(m, { voice: settings.voice, volume: settings.volume / 100 }));
    kb.showPlaying(ev.midis, 400);
    seek(ev.start);
  };
  $('#colorToggle')?.addEventListener('click', () => {
    setSetting('colorNotes', !settings.colorNotes);
    $('#colorToggle').classList.toggle('on', settings.colorNotes);
    colorizeScore($('#score'));
  });
  $('#sustainBtn')?.addEventListener('click', () => {
    setSustain(!getSustain());
    $('#sustainBtn').classList.toggle('on', getSustain());
  });
  let rw = innerWidth;
  const onResize = () => { if (Math.abs(innerWidth - rw) > 30) { rw = innerWidth; draw(); } };
  addEventListener('resize', onResize);
  cleanup = () => { stop(); kb.destroy(); removeEventListener('resize', onResize); };
};

const PRACTICE_STYLES = {
  falling: ['🎹 Falling Notes', 'Synthesia-style: notes fall down, press the key when they hit the line.'],
  learn: ['Learn', 'Waits for the right key. Names and glowing keys guide you.'],
  rhythm: ['Rhythm', 'Plays in time. Hit each note on the beat: Perfect, Good or Miss.'],
  memory: ['Memory', 'No names, no glowing keys. Read the real notes. A hint appears after 2 mistakes.'],
  speed: ['Speed Builder', 'Loops the section in time, starting slow and getting 10% faster after each clean pass.'],
};

views.practice = (params, id) => {
  const song = songById(id);
  if (!song) return notFound();
  setNav('practice-run');
  const parsed = parseSong(song);
  const tl = buildTimeline(parsed);
  const bars = parsed.rh.length;
  const cfg = { hands: 'rh', style: 'learn', from: 1, to: bars, loop: false, speed: 1, ...load(`np.pcfg.${id}`, {}), ...load('np.pstyle', {}) };
  cfg.from = Math.min(Math.max(1, cfg.from), bars);
  cfg.to = Math.min(Math.max(cfg.from, cfg.to), bars);
  const style = cfg.style;

  /* ---- Falling Notes mode ---- */
  if (style === 'falling') {
    // Request landscape orientation on mobile for Falling Notes
    screen.orientation?.lock?.('landscape').catch(() => {});
    // Unlock when navigating away
    const unlockOrientation = () => screen.orientation?.unlock?.();
    window.addEventListener('hashchange', unlockOrientation, { once: true });

    const hands = cfg.hands === 'both' ? ['rh', 'lh'] : [cfg.hands];
    const inRange = (e) => e.bar >= cfg.from - 1 && e.bar <= cfg.to - 1;
    const events = tl.events.filter(inRange);
    const steps = buildSteps({ events }, hands.length ? hands : ['rh', 'lh']);
    const { low, high } = keyRange(parsed);
    let score = 0, judged = 0;

    app.innerHTML = `<section class="view" style="display:flex;flex-direction:column;height:100dvh;overflow:hidden">
      <div class="top" style="flex-shrink:0"><a class="iconbtn" href="#/song/${id}">${icon('back')}</a>
        <h1>🎹 Falling · ${esc(song.title)}</h1>
        <div style="display:flex;gap:4px;align-items:center">${voicePicker()}<button class="iconbtn" id="go" aria-label="Start">${icon('play')}</button></div></div>
      <div class="chips" id="styles" style="padding-top:0;flex-shrink:0">${Object.entries(PRACTICE_STYLES).map(([k, v]) => `<button class="chip ${k === style ? 'on' : ''}" data-s="${k}">${v[0]}</button>`).join('')}</div>
      <div id="fall-canvas" style="flex:1;min-height:0;background:#0d0d14;border-radius:12px;overflow:hidden;margin:0 0 8px"></div>
      <div class="kb-dock" style="flex-shrink:0">
        <div class="kb" id="kb"></div>
        <div class="prac-nav" style="gap:6px;flex-wrap:wrap">
          <button class="btn soft" id="seekBack" style="font-size:15px;padding:0 10px" title="Back 5s">⏪</button>
          <button class="btn soft" id="goKb" aria-label="Play/Pause" style="padding:0 12px">${icon('play')}</button>
          <button class="btn soft" id="seekFwd" style="font-size:15px;padding:0 10px" title="Forward 5s">⏩</button>
          <button class="btn soft" id="restart">${icon('restart')} Restart</button>
          <button class="btn soft${settings.fallingSound !== false ? ' on' : ''}" id="toggleSound" title="Toggle auto-play sound">🔊 Sound</button>
          <button class="btn soft${settings.keyLabels ? ' on' : ''}" id="toggleLabels" title="Toggle note names">🎵 Names</button>
        </div>
        <div style="display:flex;align-items:center;gap:6px;padding:6px 4px 2px">
          <span style="font-size:11px;font-weight:700;color:var(--muted);white-space:nowrap">SPEED</span>
          <input type="range" id="fallSpeed" min="10" max="150" step="5" value="${Math.round(cfg.speed*100)}" style="flex:1;accent-color:var(--p)">
          <span id="fallSpeedVal" style="font-size:12px;font-weight:800;color:var(--p);min-width:36px;text-align:right">${Math.round(cfg.speed*100)}%</span>
        </div>
      </div>
    </section>`;

    const $ = (s) => app.querySelector(s);
    let soundOn = settings.fallingSound !== false;
    // Derive key pitch class and mode from parsed.key (e.g. 'C', 'Am', 'Gm')
    const KEY_PC = { C:0, D:2, E:4, F:5, G:7, A:9, B:11 };
    const keyStr = parsed.key || 'C';
    const minorKey = /m$/.test(keyStr);
    const keyRoot = keyStr.replace(/m$/, '').replace(/b$/, '').replace(/#$/, '');
    const keyAcc  = keyStr.includes('#') ? 1 : keyStr.replace(/m$/, '').endsWith('b') ? -1 : 0;
    const keyPc   = ((KEY_PC[keyRoot[0]] ?? 0) + keyAcc + 12) % 12;

    const makeFalling = (spd) => createFalling($('#fall-canvas'), {
      steps, low, high, bpm: parsed.bpm, speed: spd, keyPc, isMinor: minorKey,
      setTargets(midis) { kb?.setHint(midis); },
      flashKey(m, cls, ms) { kb?.flash(m, cls, ms); },
      autoPlay(m) { if (soundOn) { unlockAudio(); playNote(m, { voice: settings.voice, volume: settings.volume / 100 }); } },
      onJudge(idx, val) {
        score += val; judged++;
        if (judged >= steps.length) {
          falling.stop();
          const acc = Math.round((score / steps.length) * 100);
          const p = progress[id] || { best: 0, plays: 0, done: false };
          progress[id] = { best: Math.max(p.best, acc), plays: p.plays + 1, done: p.done || acc >= 60, last: Date.now() };
          saveProgress();
          sessionStorage.setItem('np.result', JSON.stringify({ id, notes: steps.length, secs: 0, acc, style: '🎹 Falling Notes' }));
          setTimeout(() => { location.hash = `#/done/${id}`; }, 600);
        }
      },
    });
    let falling = makeFalling(cfg.speed);

    let showLabels = settings.keyLabels;
    let kb = createKeyboard($('#kb'), {
      low, high, labels: showLabels, nameSystem: settings.nameSystem,
      onPress(m) {
        unlockAudio();
        playNote(m, { voice: settings.voice, volume: settings.volume / 100 });
        falling.press(m, performance.now() / 1000);
      },
    });
    const updateDegrees = () => {
      const kbHost = $('#kb');
      if (!kbHost) return;
      kbHost.querySelectorAll('.degree-label').forEach(el => el.remove());
      falling.getUpcomingSteps(5).forEach(({ order, midis }) => {
        const row = order % 2 === 1 ? '16px' : '32px'; // alternate rows
        midis.forEach(midi => {
          const el = kbHost.querySelector(`.key[data-midi="${midi}"]`);
          if (!el) return;
          const lbl = document.createElement('span');
          lbl.className = 'degree-label';
          lbl.style.bottom = row;
          lbl.textContent = order;
          el.appendChild(lbl);
        });
      });
      requestAnimationFrame(updateDegrees);
    };
    requestAnimationFrame(updateDegrees);

    let started = false;
    const syncPlayBtns = (playing) => {
      [$('#go'), $('#goKb')].forEach(b => { if (b) b.innerHTML = playing ? icon('pause') : icon('play'); });
    };
    const startGame = () => {
      if (started) return;
      started = true;
      score = 0; judged = 0;
      const countInMs = (60 / parsed.bpm) * cfg.speed * 1000 * parsed.barBeats;
      for (let b = 0; b < parsed.barBeats; b++) playClick(b === 0, (b * 60) / (parsed.bpm * cfg.speed));
      falling.start(performance.now() + countInMs);
      syncPlayBtns(true);
    };

    const togglePlay = () => {
      if (!started) { startGame(); return; }
      if (falling.paused) { falling.resume(); syncPlayBtns(true); }
      else { falling.pause(); syncPlayBtns(false); }
    };
    $('#go').onclick = togglePlay;
    $('#goKb').onclick = togglePlay;
    $('#restart').onclick = () => { started = false; falling.stop(); score = 0; judged = 0; syncPlayBtns(false); startGame(); };
    $('#seekBack').onclick = () => { if (started) { falling.seekBy(-5000); score = 0; judged = 0; } };
    $('#seekFwd').onclick  = () => { if (started) { falling.seekBy(5000);  score = 0; judged = 0; } };
    $('#fallSpeed').oninput = (e) => {
      const pct = Number(e.target.value);
      $('#fallSpeedVal').textContent = pct + '%';
      cfg.speed = pct / 100;
      save(`np.pcfg.${id}`, cfg);
      // recreate falling engine with new speed, then restart
      falling.stop();
      falling = makeFalling(cfg.speed);
      started = false;
      score = 0; judged = 0;
      startGame();
    };
    $('#toggleSound').onclick = () => {
      soundOn = !soundOn;
      save('np.settings', { ...load('np.settings'), fallingSound: soundOn });
      $('#toggleSound').classList.toggle('on', soundOn);
    };
    $('#toggleLabels').onclick = () => {
      showLabels = !showLabels;
      $('#toggleLabels').classList.toggle('on', showLabels);
      kb = createKeyboard($('#kb'), {
        low, high, labels: showLabels, nameSystem: settings.nameSystem,
        onPress(m) {
          unlockAudio();
          playNote(m, { voice: settings.voice, volume: settings.volume / 100 });
          falling.press(m, performance.now() / 1000);
        },
      });
    };
    $('#styles').onclick = (e) => {
      const s2 = e.target.closest('.chip')?.dataset.s; if (!s2) return;
      save('np.pstyle', { style: s2 }); views.practice(params, id);
    };
    return;
  }

  const timed = style === 'rhythm' || style === 'speed';
  const hidden = style === 'memory';
  const st = { hands: cfg.hands === 'both' ? ['rh', 'lh'] : [cfg.hands], idx: 0, wrong: 0, score: 0, missedStep: false, pressed: new Set(), t0: Date.now(), loops: 0, speed: style === 'speed' ? Math.min(cfg.speed, 0.6) : cfg.speed, stepWrong: 0 };
  const inRange = (e) => e.bar >= cfg.from - 1 && e.bar <= cfg.to - 1;
  let steps = buildSteps({ events: tl.events.filter(inRange) }, st.hands);
  if (!steps.length) { st.hands = ['rh', 'lh']; steps = buildSteps({ events: tl.events.filter(inRange) }, st.hands); }
  const barOpts = (sel) => Array.from({ length: bars }, (_, i) => `<option value="${i + 1}" ${i + 1 === sel ? 'selected' : ''}>${i + 1}</option>`).join('');

  app.innerHTML = `<section class="view">
    <div class="top"><a class="iconbtn" href="#/song/${id}">${icon('back')}</a><h1>${PRACTICE_STYLES[style][0]} · ${esc(song.title)}</h1><div style="display:flex;gap:4px;align-items:center">${voicePicker()}<button id="colorToggle" class="iconbtn${settings.colorNotes?' on':''}" title="Color notes by pitch" style="font-size:16px">🎨</button><button class="iconbtn" id="listen" aria-label="Listen">${icon('ear')}</button></div></div>
    <div class="chips" id="styles" style="padding-top:0">${Object.entries(PRACTICE_STYLES).map(([k, v]) => `<button class="chip ${k === style ? 'on' : ''}" data-s="${k}">${v[0]}</button>`).join('')}</div>
    <div class="muted" style="font-size:12.5px;margin:-4px 0 8px">${PRACTICE_STYLES[style][1]}</div>
    <div class="card prac-top">
      <div class="ring"><svg viewBox="0 0 84 84" width="84" height="84"><circle cx="42" cy="42" r="36" stroke="var(--line)" stroke-width="8" fill="none"/>
        <circle id="arc" cx="42" cy="42" r="36" stroke="var(--a)" stroke-width="8" fill="none" stroke-linecap="round" stroke-dasharray="226" stroke-dashoffset="226" style="transition:stroke-dashoffset .4s var(--ease)"/></svg>
        <b><span id="cnt">0/${steps.length}</span><small>Notes</small></b></div>
      <div class="feedback wait" id="fb"><span class="fi">${icon('practice')}</span><div><span id="fbt">${timed ? 'Press Start' : 'Play the glowing key'}</span><small id="fbs">${timed ? 'One bar count-in, then play along' : esc(song.title)}</small></div></div>
    </div>
    <details class="card setup" ${params.get('setup') ? 'open' : ''}><summary>Hands · section · speed <span class="muted">${cfg.hands === 'both' ? 'Both hands' : cfg.hands === 'rh' ? 'Right hand' : 'Left hand'} · bars ${cfg.from}–${cfg.to}${cfg.loop || style === 'speed' ? ' · loop' : ''} · ${Math.round(st.speed * 100)}%</span></summary>
      <div class="seg hand" id="hands"><button data-h="rh">Right hand</button><button data-h="lh">Left hand</button><button data-h="both">Both</button></div>
      <div class="row"><span>Bars</span><span><select id="from">${barOpts(cfg.from)}</select> to <select id="to">${barOpts(cfg.to)}</select></span></div>
      <label class="row"><span>Loop this section</span><span class="sw"><input type="checkbox" id="loop" ${cfg.loop ? 'checked' : ''}><span></span></span></label>
      <div class="row"><span>Speed</span><select id="spd">${[0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.25].map((v) => `<option value="${v}" ${v === cfg.speed ? 'selected' : ''}>${Math.round(v * 100)}%</option>`).join('')}</select></div>
      <div class="row"><span></span><button class="btn sm" id="apply">Apply</button></div>
    </details>
    <div class="card score-wrap"><div class="score" id="score"></div></div>
    <div class="kb-dock">
      <div class="card kb-info">
        <div class="mini-score-wrap"><div id="miniScore" class="mini-score"></div></div>
        <div class="cn-block"><div class="cn">${hidden ? 'Read the note' : 'Play this note'}<b id="cnote">—</b></div><div class="next" id="nnote"></div></div>
      </div>
      <div class="kb" id="kb"></div>
      <div class="prac-nav">${timed
        ? `<button class="btn soft" id="restart">${icon('restart')} Restart</button><button class="btn ok" id="go">${icon('play')} Start</button>`
        : `<button class="btn soft" id="prev">${icon('arrowL')} Previous</button><button class="btn ok" id="next">Next ${icon('arrowR')}</button>`}</div>
    </div>
  </section>`;
  const $ = (s) => app.querySelector(s);
  $('#hands').querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.h === cfg.hands));
  const score = renderScore($('#score'), parsed, { ...scoreOpts(), showNames: settings.showNames && !hidden, showChords: !hidden }); colorizeScore($('#score'));
  const { low, high } = keyRange(parsed);
  const names = (midis) => midis.map((m) => labelFor(midiName(m), settings.nameSystem)).join(' ');
  const PRAISE = ['Good!', 'Great!', 'Nice!', 'Perfect!', 'Awesome!', 'Well done!'];

  const feedback = (kind, title, sub) => {
    const fb = $('#fb');
    fb.className = `feedback ${kind}`;
    void fb.offsetWidth;
    fb.classList.add('pop');
    fb.querySelector('.fi').innerHTML = icon(kind === 'bad' ? 'x' : kind === 'wait' ? 'practice' : 'check');
    $('#fbt').textContent = title;
    $('#fbs').textContent = sub;
  };
  const progressUi = () => {
    $('#cnt').textContent = `${st.idx}/${steps.length}`;
    $('#arc').style.strokeDashoffset = 226 - (226 * st.idx) / steps.length;
  };
  const show = () => {
    const step = steps[st.idx];
    if (!step) return sectionDone();
    st.pressed = new Set();
    st.missedStep = false;
    st.stepWrong = 0;
    score.mark(step.events.map((e) => e.id), 'cur');
    scrollScoreTo($('#score'), score.cursorTo(step.events[0].id));
    kb.setTargets(hidden ? [] : step.midis);
    $('#cnote').innerHTML = hidden ? '?' : step.events.map((e) => eventLabel(e.names)).join(' + ');
    const nx = steps[st.idx + 1];
    $('#nnote').innerHTML = hidden ? '' : nx ? `Next: ${nx.events.map((e) => eventLabel(e.names)).join(' + ')} ›` : 'Last note!';
    if (!hidden) renderMiniScore($('#miniScore'), step.events.filter(e=>e.hand==='rh').flatMap(e=>e.midis), step.events.filter(e=>e.hand==='lh').flatMap(e=>e.midis), parsed.key);
    progressUi();
  };

  // Result of one step: 1 = perfect, 0.7 = good/late, 0 = missed.
  const judge = (step, value, label) => {
    step.events.forEach((e) => score.add(e.id, value >= 0.7 ? 'hit' : 'miss'));
    st.score += value;
    if (label) feedback(value > 0 ? '' : 'bad', label, value === 1 ? 'Right on time' : value > 0 ? 'Close — keep going' : `It was ${names(step.midis)}`);
  };

  const finish = () => {
    stopTimed();
    const total = steps.length * Math.max(1, st.loops);
    const acc = Math.round((st.score / Math.max(1, total)) * 100);
    const secs = Math.round((Date.now() - st.t0) / 1000);
    const p = progress[id] || { best: 0, plays: 0, done: false };
    const whole = cfg.from === 1 && cfg.to === bars;
    progress[id] = { best: whole ? Math.max(p.best, acc) : p.best, plays: p.plays + 1, done: p.done || (whole && acc >= 60), last: Date.now() };
    saveProgress();
    bumpStreak();
    sessionStorage.setItem('np.result', JSON.stringify({ id, notes: total, secs, acc, style: PRACTICE_STYLES[style][0] }));
    location.hash = `#/done/${id}`;
  };

  // End of the chosen bars: loop, speed up, or finish.
  const sectionDone = () => {
    st.loops++;
    const passAcc = st.score / (steps.length * st.loops);
    if (style === 'speed') {
      if (passAcc >= 0.9 && st.speed >= 1) return finish();
      if (passAcc >= 0.9) { st.speed = Math.min(1, +(st.speed + 0.1).toFixed(2)); toast(`Clean pass! Speed up to ${Math.round(st.speed * 100)}%`); }
      else toast(`Pass ${st.loops}: ${Math.round(passAcc * 100)}% — again at ${Math.round(st.speed * 100)}%`);
      return restartSection(true);
    }
    if (cfg.loop) { toast(`Loop ${st.loops} done — ${Math.round(passAcc * 100)}%`); return restartSection(timed); }
    finish();
  };
  const restartSection = (autoStart) => {
    stopTimed();
    st.idx = 0;
    score.clear();
    show();
    if (autoStart) setTimeout(startTimed, 600);
  };

  /* ----- Learn / Memory: wait for the right key ----- */
  const advance = () => {
    const step = steps[st.idx];
    step.events.forEach((e) => score.add(e.id, st.missedStep ? 'miss' : 'hit'));
    if (!st.missedStep) st.score++;
    st.idx++;
    show();
  };
  const onWaitPress = (m) => {
    const step = steps[st.idx];
    if (!step) return;
    if (step.midis.includes(m)) {
      st.pressed.add(m);
      kb.flash(m, 'good');
      if (step.midis.every((x) => st.pressed.has(x))) {
        feedback('', PRAISE[Math.floor(Math.random() * PRAISE.length)], st.missedStep ? 'Got it — keep going!' : 'Keep going!');
        setTimeout(advance, 120);
      }
      return;
    }
    st.wrong++;
    st.stepWrong++;
    st.missedStep = true;
    kb.flash(m, 'wrong');
    navigator.vibrate?.(40);
    if (hidden && st.stepWrong < 2) feedback('bad', 'Not that one', `That was ${labelFor(midiName(m), settings.nameSystem)}. Read the note again.`);
    else {
      feedback('bad', 'Try again', `That was ${labelFor(midiName(m), settings.nameSystem)} — play ${names(step.midis)}`);
      if (hidden) { kb.setTargets(step.midis); $('#cnote').innerHTML = step.events.map((e) => eventLabel(e.names)).join(' + '); }
    }
    if (!settings.waitMode && !hidden) setTimeout(advance, 300);
  };

  /* ----- Rhythm / Speed Builder: play in time ----- */
  const PERFECT = 0.12, GOOD = 0.28; // seconds
  let t = { running: false, raf: 0, timer: 0, start: 0, next: 0 };
  const sectionStart = steps[0]?.start ?? 0;
  const secPerBeat = () => 60 / (parsed.bpm * st.speed);
  const stepTime = (i) => t.start + (steps[i].start - sectionStart) * secPerBeat();
  const accomp = tl.events.filter((e) => inRange(e) && !st.hands.includes(e.hand));
  const startTimed = () => {
    if (t.running) return;
    unlockAudio();
    st.idx = 0; st.pressed = new Set();
    const countIn = parsed.barBeats * secPerBeat();
    t = { running: true, raf: 0, timer: 0, start: now() + countIn + 0.1, next: 0 };
    for (let b = 0; b < parsed.barBeats; b++) playClick(b === 0, 0.1 + b * secPerBeat());
    feedback('wait', 'Get ready…', `${parsed.barBeats} beat count-in`);
    // Other hand plays along so the music stays complete.
    t.timer = setInterval(() => {
      while (t.next < accomp.length && t.start + (accomp[t.next].start - sectionStart) * secPerBeat() < now() + 0.5) {
        const e = accomp[t.next++];
        const when = t.start + (e.start - sectionStart) * secPerBeat() - now();
        e.midis.forEach((m) => playNote(m, { when, duration: e.beats * secPerBeat(), voice: settings.voice, volume: settings.volume / 100, velocity: 0.5 }));
      }
      if (settings.metronome) { /* the count-in click is enough by default */ }
    }, 30);
    $('#go').innerHTML = `${icon('pause')} Stop`;
    show();
    const frame = () => {
      if (!t.running) return;
      const nowT = now();
      // Missed: the window for the current step has passed.
      while (steps[st.idx] && nowT > stepTime(st.idx) + GOOD) {
        judge(steps[st.idx], 0, 'Miss');
        st.idx++;
        if (!steps[st.idx]) { t.running = false; return sectionDone(); }
        show();
      }
      t.raf = requestAnimationFrame(frame);
    };
    t.raf = requestAnimationFrame(frame);
  };
  const stopTimed = () => {
    t.running = false;
    cancelAnimationFrame(t.raf);
    clearInterval(t.timer);
    if ($('#go')) $('#go').innerHTML = `${icon('play')} Start`;
  };
  const onTimedPress = (m) => {
    const step = steps[st.idx];
    if (!t.running || !step) return;
    const diff = now() - stepTime(st.idx);
    if (!step.midis.includes(m) || diff < -GOOD) {
      st.wrong++;
      kb.flash(m, 'wrong');
      return;
    }
    if (!st.pressed.size) st.firstDiff = Math.abs(diff);
    st.pressed.add(m);
    kb.flash(m, 'good');
    if (step.midis.every((x) => st.pressed.has(x))) {
      const perfect = st.firstDiff <= PERFECT;
      judge(step, perfect ? 1 : 0.7, perfect ? 'Perfect!' : diff < 0 ? 'Good (early)' : 'Good (late)');
      st.idx++;
      if (!steps[st.idx]) { t.running = false; return sectionDone(); }
      show();
    }
  };

  const onPress = (m) => {
    unlockAudio();
    playNote(m, { voice: settings.voice, volume: settings.volume / 100 });
    (timed ? onTimedPress : onWaitPress)(m);
  };
  const kb = createKeyboard($('#kb'), { low, high, labels: settings.keyLabels && !hidden, nameSystem: settings.nameSystem, onPress });

  if (timed) {
    $('#go').onclick = () => (t.running ? stopTimed() : startTimed());
    $('#restart').onclick = () => { st.score = 0; st.loops = 0; restartSection(false); };
  } else {
    $('#prev').onclick = () => { if (st.idx > 0) { st.idx--; show(); feedback('wait', 'Back one note', ''); } };
    $('#next').onclick = () => { st.missedStep = true; advance(); feedback('wait', 'Skipped', 'Skipped notes don’t count toward accuracy'); };
  }
  $('#listen').onclick = () => {
    const step = steps[st.idx]; if (!step) return;
    unlockAudio();
    step.midis.forEach((m) => playNote(m, { voice: settings.voice, volume: settings.volume / 100 }));
    kb.showPlaying(step.midis, 400);
  };
  const saveCfg = (patch) => save(`np.pcfg.${id}`, { ...load(`np.pcfg.${id}`, {}), ...patch });
  $('#colorToggle')?.addEventListener('click', () => {
    setSetting('colorNotes', !settings.colorNotes);
    $('#colorToggle').classList.toggle('on', settings.colorNotes);
    colorizeScore($('#score'));
  });
  $('#styles').onclick = (e) => {
    const s2 = e.target.closest('.chip')?.dataset.s; if (!s2) return;
    save('np.pstyle', { style: s2 });
    views.practice(params, id);
  };
  $('#hands').onclick = (e) => { const h = e.target.dataset.h; if (!h) return; cfg.hands = h; $('#hands').querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.h === h)); };
  $('#apply').onclick = () => {
    const from = Number($('#from').value), to = Math.max(from, Number($('#to').value));
    saveCfg({ hands: cfg.hands, from, to, loop: $('#loop').checked, speed: Number($('#spd').value) });
    views.practice(new URLSearchParams('setup=1'), id);
  };
  progress[id] = { ...(progress[id] || { best: 0, plays: 0, done: false }), last: Date.now() };
  saveProgress();
  show();
  cleanup = () => { stopTimed(); kb.destroy(); };
};

/* ---------- quizzes ---------- */
// ── Favourites view ────────────────────────────────────────
views.favs = () => {
  setNav('library');
  const list = SONGS.filter(s => favs.has(s.id));
  app.innerHTML = `<section class="view">
    <div class="top"><a class="iconbtn" href="#/home">${icon('back')}</a><h1>Favourites</h1><span style="width:42px"></span></div>
    ${list.length
      ? `<div class="list grid2">${list.map(s => songRow(s,{time:true})).join('')}</div>`
      : `<div style="text-align:center;padding:60px 20px">
          <div style="font-size:48px">💔</div>
          <div style="margin-top:12px;font-size:17px;font-weight:700">No favourites yet</div>
          <div class="muted" style="margin-top:6px">Tap ♥ on any song to save it here</div>
          <a class="btn" href="#/library" style="margin-top:20px;display:inline-flex">Browse songs</a>
        </div>`}
  </section>`;
};

// ══════════════════════════════════════════════════════════
// CHORD PROGRESSIONS FEATURE
// ══════════════════════════════════════════════════════════
const KEY_NAMES_PROG = ['C','Db','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
const KEY_ROOT_MIDI  = { C:60,Db:61,D:62,Eb:63,E:64,F:65,'F#':66,G:67,Ab:68,A:69,Bb:70,B:71 };
const CHORD_TYPE_INTERVALS = { M:[0,4,7], m:[0,3,7], '7':[0,4,7,10], m7:[0,3,7,10], M7:[0,4,7,11], dim:[0,3,6], sus4:[0,5,7], aug:[0,4,8] };
const CHORD_TYPE_SUFFIX    = { M:'', m:'m', '7':'7', m7:'m7', M7:'maj7', dim:'°', sus4:'sus4', aug:'+' };

const progChordLabel = (keyMidi, semOff, q) => {
  const rootPc = (keyMidi - 60 + semOff + 120) % 12;
  return KEY_NAMES_PROG[rootPc] + (CHORD_TYPE_SUFFIX[q] ?? '');
};
const progChordMidis = (keyMidi, semOff, q) => {
  const root = ((keyMidi + semOff - 48 + 120) % 12) + 48;
  return (CHORD_TYPE_INTERVALS[q] || CHORD_TYPE_INTERVALS.M).map(s => root + s);
};
const progChordInversion = (label, q) => {
  const type = q === 'm' ? 'minor' : q === 'M7' ? 'major 7th' : q === 'm7' ? 'minor 7th' : q === '7' ? 'dominant 7th' : q === 'dim' ? 'diminished' : q === 'aug' ? 'augmented' : q === 'sus4' ? 'sus4' : 'major';
  return `${label} ${type}`;
};
const getChordInversionName = (label, q, midis) => {
  const type = q === 'm' ? 'minor' : q === 'M7' ? 'major 7th' : q === 'm7' ? 'minor 7th' : q === '7' ? 'dominant 7th' : q === 'dim' ? 'diminished' : q === 'aug' ? 'augmented' : q === 'sus4' ? 'sus4' : 'major';
  const shifted = midis.map(m => { let n = m; while (n < 60) n += 12; while (n > 71) n -= 12; return n; }).sort((a,b) => a - b);
  const rootPc = midis[0] % 12;
  const bassPc = shifted[0] % 12;
  const intervals = CHORD_TYPE_INTERVALS[q] || CHORD_TYPE_INTERVALS.M;
  const bassInterval = (bassPc - rootPc + 12) % 12;
  let inv = 'Root position';
  if (intervals.length >= 2 && bassInterval === intervals[1]) inv = '1st inversion';
  else if (intervals.length >= 3 && bassInterval === intervals[2]) inv = '2nd inversion';
  else if (intervals.length >= 4 && bassInterval === intervals[3]) inv = '3rd inversion';
  return `${label} ${type} – ${inv}`;
};

const PROG_MOODS = ['All','😊 Happy','😢 Sad','💫 Emotional','🔥 Epic','🎷 Jazz','🎼 Blues','🎵 Pop','🎸 Rock','🎤 Hip-Hop','🎧 EDM','💕 Romantic','🌙 Dark'];
const MOOD_KEY   = { 'All':'all','😊 Happy':'happy','😢 Sad':'sad','💫 Emotional':'emotional','🔥 Epic':'epic','🎷 Jazz':'jazz','🎼 Blues':'blues','🎵 Pop':'pop','🎸 Rock':'rock','🎤 Hip-Hop':'hiphop','🎧 EDM':'edm','💕 Romantic':'romantic','🌙 Dark':'dark' };

const PROGRESSIONS_DB = [
  // ── Happy ──────────────────────────────────────────────
  { id:'I-IV-V-I',      name:'I – IV – V – I',        mood:['happy','classic'],           genre:'Pop',
    chords:[{s:0,q:'M',r:'I'},{s:5,q:'M',r:'IV'},{s:7,q:'M',r:'V'},{s:0,q:'M',r:'I'}] },
  { id:'I-V-vi-IV',     name:'I – V – vi – IV',       mood:['happy','pop'],               genre:'Pop',
    chords:[{s:0,q:'M',r:'I'},{s:7,q:'M',r:'V'},{s:9,q:'m',r:'vi'},{s:5,q:'M',r:'IV'}] },
  { id:'I-IV-I-V',      name:'I – IV – I – V',        mood:['happy','folk'],              genre:'Folk',
    chords:[{s:0,q:'M',r:'I'},{s:5,q:'M',r:'IV'},{s:0,q:'M',r:'I'},{s:7,q:'M',r:'V'}] },
  { id:'I-iii-IV-V',    name:'I – iii – IV – V',      mood:['happy','romantic'],          genre:'Pop',
    chords:[{s:0,q:'M',r:'I'},{s:4,q:'m',r:'iii'},{s:5,q:'M',r:'IV'},{s:7,q:'M',r:'V'}] },
  { id:'I-I-IV-V',      name:'I – I – IV – V',        mood:['happy','blues'],             genre:'Rock',
    chords:[{s:0,q:'M',r:'I'},{s:0,q:'M',r:'I'},{s:5,q:'M',r:'IV'},{s:7,q:'M',r:'V'}] },

  // ── Sad ───────────────────────────────────────────────
  { id:'vi-IV-I-V',     name:'vi – IV – I – V',       mood:['sad','emotional','pop'],     genre:'Pop',
    chords:[{s:9,q:'m',r:'vi'},{s:5,q:'M',r:'IV'},{s:0,q:'M',r:'I'},{s:7,q:'M',r:'V'}] },
  { id:'i-VII-VI-VII',  name:'i – VII – VI – VII',    mood:['sad','emotional'],           genre:'Rock',
    chords:[{s:0,q:'m',r:'i'},{s:10,q:'M',r:'VII'},{s:8,q:'M',r:'VI'},{s:10,q:'M',r:'VII'}] },
  { id:'i-iv-v-i',      name:'i – iv – v – i',        mood:['sad','dark','classic'],      genre:'Classical',
    chords:[{s:0,q:'m',r:'i'},{s:5,q:'m',r:'iv'},{s:7,q:'m',r:'v'},{s:0,q:'m',r:'i'}] },
  { id:'i-iv-VII-III',  name:'i – iv – VII – III',    mood:['sad','classical'],           genre:'Classical',
    chords:[{s:0,q:'m',r:'i'},{s:5,q:'m',r:'iv'},{s:10,q:'M',r:'VII'},{s:3,q:'M',r:'III'}] },
  { id:'i-VI-III-VII',  name:'i – VI – III – VII',    mood:['sad','emotional','cinematic'],genre:'Cinematic',
    chords:[{s:0,q:'m',r:'i'},{s:8,q:'M',r:'VI'},{s:3,q:'M',r:'III'},{s:10,q:'M',r:'VII'}] },

  // ── Emotional ─────────────────────────────────────────
  { id:'I-V-vi-iii-IV', name:'I – V – vi – iii – IV', mood:['emotional','classic'],      genre:'Classical',
    chords:[{s:0,q:'M',r:'I'},{s:7,q:'M',r:'V'},{s:9,q:'m',r:'vi'},{s:4,q:'m',r:'iii'},{s:5,q:'M',r:'IV'}] },
  { id:'vi-V-IV-V',     name:'vi – V – IV – V',       mood:['emotional','sad'],          genre:'Pop',
    chords:[{s:9,q:'m',r:'vi'},{s:7,q:'M',r:'V'},{s:5,q:'M',r:'IV'},{s:7,q:'M',r:'V'}] },
  { id:'I-iii-vi-IV',   name:'I – iii – vi – IV',     mood:['emotional','romantic'],     genre:'Pop',
    chords:[{s:0,q:'M',r:'I'},{s:4,q:'m',r:'iii'},{s:9,q:'m',r:'vi'},{s:5,q:'M',r:'IV'}] },
  { id:'I-IV-vi-V',     name:'I – IV – vi – V',       mood:['emotional','pop'],          genre:'Pop',
    chords:[{s:0,q:'M',r:'I'},{s:5,q:'M',r:'IV'},{s:9,q:'m',r:'vi'},{s:7,q:'M',r:'V'}] },

  // ── Epic ──────────────────────────────────────────────
  { id:'i-III-VII-IV',  name:'i – III – VII – IV',    mood:['epic','cinematic'],         genre:'Cinematic',
    chords:[{s:0,q:'m',r:'i'},{s:3,q:'M',r:'III'},{s:10,q:'M',r:'VII'},{s:5,q:'M',r:'IV'}] },
  { id:'I-VII-VI-VII',  name:'I – VII – VI – VII',    mood:['epic','rock'],              genre:'Rock',
    chords:[{s:0,q:'M',r:'I'},{s:10,q:'M',r:'VII'},{s:8,q:'M',r:'VI'},{s:10,q:'M',r:'VII'}] },
  { id:'i-VI-VII-i',    name:'i – VI – VII – i',      mood:['epic','dark'],              genre:'Cinematic',
    chords:[{s:0,q:'m',r:'i'},{s:8,q:'M',r:'VI'},{s:10,q:'M',r:'VII'},{s:0,q:'m',r:'i'}] },
  { id:'I-IV-V-IV',     name:'I – IV – V – IV',       mood:['epic','rock','happy'],      genre:'Rock',
    chords:[{s:0,q:'M',r:'I'},{s:5,q:'M',r:'IV'},{s:7,q:'M',r:'V'},{s:5,q:'M',r:'IV'}] },

  // ── Jazz (10) ─────────────────────────────────────────
  { id:'ii-V-I',        name:'ii – V – I',            mood:['jazz'],                     genre:'Jazz',
    chords:[{s:2,q:'m7',r:'ii7'},{s:7,q:'7',r:'V7'},{s:0,q:'M7',r:'Imaj7'}] },
  { id:'I-vi-ii-V',     name:'I – vi – ii – V',       mood:['jazz','romantic'],          genre:'Jazz',
    chords:[{s:0,q:'M7',r:'Imaj7'},{s:9,q:'m7',r:'vi7'},{s:2,q:'m7',r:'ii7'},{s:7,q:'7',r:'V7'}] },
  { id:'iii-VI-ii-V',   name:'iii – VI – ii – V',     mood:['jazz'],                     genre:'Jazz',
    chords:[{s:4,q:'m7',r:'iii7'},{s:9,q:'7',r:'VI7'},{s:2,q:'m7',r:'ii7'},{s:7,q:'7',r:'V7'}] },
  { id:'I-vi-IV-V-jazz',name:'I – vi – IV – V (Jazz)',mood:['jazz','romantic'],          genre:'Jazz',
    chords:[{s:0,q:'M7',r:'Imaj7'},{s:9,q:'m7',r:'vi7'},{s:5,q:'M7',r:'IVmaj7'},{s:7,q:'7',r:'V7'}] },
  { id:'jazz-ii-V-I-vi',name:'ii – V – I – vi (Loop)',mood:['jazz'],                    genre:'Jazz',
    chords:[{s:2,q:'m7',r:'ii7'},{s:7,q:'7',r:'V7'},{s:0,q:'M7',r:'Imaj7'},{s:9,q:'m7',r:'vi7'}] },
  { id:'jazz-I-IV-iii-VI',name:'I – IV – iii – VI',  mood:['jazz'],                    genre:'Jazz',
    chords:[{s:0,q:'M7',r:'Imaj7'},{s:5,q:'M7',r:'IVmaj7'},{s:4,q:'m7',r:'iii7'},{s:9,q:'7',r:'VI7'}] },
  { id:'jazz-i-iv-II-V',name:'i – iv – II – V',       mood:['jazz','sad'],              genre:'Jazz',
    chords:[{s:0,q:'m7',r:'im7'},{s:5,q:'m7',r:'ivm7'},{s:2,q:'7',r:'II7'},{s:7,q:'7',r:'V7'}] },
  { id:'jazz-VI-ii-V-I',name:'VI – ii – V – I',       mood:['jazz'],                    genre:'Jazz',
    chords:[{s:9,q:'7',r:'VI7'},{s:2,q:'m7',r:'ii7'},{s:7,q:'7',r:'V7'},{s:0,q:'M7',r:'Imaj7'}] },
  { id:'jazz-I-bVII-IV',name:'I – ♭VII – IV',         mood:['jazz','blues'],            genre:'Jazz',
    chords:[{s:0,q:'M7',r:'Imaj7'},{s:10,q:'7',r:'♭VII7'},{s:5,q:'M7',r:'IVmaj7'},{s:7,q:'7',r:'V7'}] },
  { id:'jazz-iii-bIII-ii-V',name:'iii – ♭III – ii – V',mood:['jazz'],                  genre:'Jazz',
    chords:[{s:4,q:'m7',r:'iii7'},{s:3,q:'7',r:'♭III7'},{s:2,q:'m7',r:'ii7'},{s:7,q:'7',r:'V7'}] },

  // ── Blues (10) ────────────────────────────────────────
  { id:'12-bar-blues',  name:'12-Bar Blues',          mood:['blues'],                    genre:'Blues',
    chords:[{s:0,q:'7',r:'I7'},{s:0,q:'7',r:'I7'},{s:0,q:'7',r:'I7'},{s:0,q:'7',r:'I7'},
            {s:5,q:'7',r:'IV7'},{s:5,q:'7',r:'IV7'},{s:0,q:'7',r:'I7'},{s:0,q:'7',r:'I7'},
            {s:7,q:'7',r:'V7'},{s:5,q:'7',r:'IV7'},{s:0,q:'7',r:'I7'},{s:7,q:'7',r:'V7'}] },
  { id:'blues-I-IV',    name:'Blues I – IV Shuffle',  mood:['blues'],                    genre:'Blues',
    chords:[{s:0,q:'7',r:'I7'},{s:5,q:'7',r:'IV7'},{s:0,q:'7',r:'I7'},{s:5,q:'7',r:'IV7'}] },
  { id:'blues-quick-IV',name:'Quick Change Blues',    mood:['blues'],                    genre:'Blues',
    chords:[{s:0,q:'7',r:'I7'},{s:5,q:'7',r:'IV7'},{s:0,q:'7',r:'I7'},{s:0,q:'7',r:'I7'},
            {s:5,q:'7',r:'IV7'},{s:5,q:'7',r:'IV7'},{s:0,q:'7',r:'I7'},{s:0,q:'7',r:'I7'},
            {s:7,q:'7',r:'V7'},{s:5,q:'7',r:'IV7'},{s:0,q:'7',r:'I7'},{s:7,q:'7',r:'V7'}] },
  { id:'blues-8-bar',   name:'8-Bar Blues',           mood:['blues'],                    genre:'Blues',
    chords:[{s:0,q:'7',r:'I7'},{s:0,q:'7',r:'I7'},{s:5,q:'7',r:'IV7'},{s:5,q:'7',r:'IV7'},
            {s:0,q:'7',r:'I7'},{s:7,q:'7',r:'V7'},{s:5,q:'7',r:'IV7'},{s:0,q:'7',r:'I7'}] },
  { id:'blues-minor',   name:'Minor Blues',           mood:['blues','sad'],              genre:'Blues',
    chords:[{s:0,q:'m7',r:'im7'},{s:0,q:'m7',r:'im7'},{s:0,q:'m7',r:'im7'},{s:0,q:'m7',r:'im7'},
            {s:5,q:'m7',r:'ivm7'},{s:5,q:'m7',r:'ivm7'},{s:0,q:'m7',r:'im7'},{s:0,q:'m7',r:'im7'},
            {s:8,q:'M7',r:'♭VImaj7'},{s:7,q:'7',r:'V7'},{s:0,q:'m7',r:'im7'},{s:7,q:'7',r:'V7'}] },
  { id:'blues-jazz',    name:'Jazz Blues',            mood:['blues','jazz'],             genre:'Blues',
    chords:[{s:0,q:'7',r:'I7'},{s:5,q:'7',r:'IV7'},{s:0,q:'7',r:'I7'},{s:9,q:'7',r:'VI7'},
            {s:5,q:'7',r:'IV7'},{s:3,q:'7',r:'♭III7'},{s:0,q:'7',r:'I7'},{s:9,q:'7',r:'VI7'},
            {s:2,q:'m7',r:'ii7'},{s:7,q:'7',r:'V7'},{s:0,q:'7',r:'I7'},{s:2,q:'m7',r:'ii7'},{s:7,q:'7',r:'V7'}] },
  { id:'blues-I-IV-I-V',name:'I – IV – I – V Turnaround',mood:['blues'],               genre:'Blues',
    chords:[{s:0,q:'7',r:'I7'},{s:5,q:'7',r:'IV7'},{s:0,q:'7',r:'I7'},{s:7,q:'7',r:'V7'}] },
  { id:'blues-gospel',  name:'Gospel Blues',          mood:['blues','happy'],            genre:'Blues',
    chords:[{s:0,q:'M',r:'I'},{s:5,q:'M',r:'IV'},{s:0,q:'M',r:'I'},{s:0,q:'7',r:'I7'},
            {s:5,q:'M',r:'IV'},{s:5,q:'M',r:'IV'},{s:0,q:'M',r:'I'},{s:9,q:'m',r:'vi'},
            {s:2,q:'m7',r:'ii7'},{s:7,q:'7',r:'V7'},{s:0,q:'M',r:'I'},{s:7,q:'7',r:'V7'}] },
  { id:'blues-boogie',  name:'Boogie Blues',          mood:['blues','happy'],            genre:'Blues',
    chords:[{s:0,q:'7',r:'I7'},{s:0,q:'7',r:'I7'},{s:5,q:'7',r:'IV7'},{s:0,q:'7',r:'I7'},
            {s:7,q:'7',r:'V7'},{s:5,q:'7',r:'IV7'},{s:0,q:'7',r:'I7'},{s:7,q:'7',r:'V7'}] },
  { id:'blues-stop-time',name:'Stop-Time Blues',      mood:['blues'],                   genre:'Blues',
    chords:[{s:0,q:'7',r:'I7'},{s:0,q:'7',r:'I7'},{s:0,q:'7',r:'I7'},{s:7,q:'7',r:'V7'},
            {s:5,q:'7',r:'IV7'},{s:5,q:'7',r:'IV7'},{s:0,q:'7',r:'I7'},{s:7,q:'7',r:'V7'}] },

  // ── Pop (10) ──────────────────────────────────────────
  { id:'pop-I-V-vi-IV', name:'I – V – vi – IV (Pop Anthem)',mood:['pop','happy'],       genre:'Pop',
    chords:[{s:0,q:'M',r:'I'},{s:7,q:'M',r:'V'},{s:9,q:'m',r:'vi'},{s:5,q:'M',r:'IV'}] },
  { id:'pop-vi-IV-I-V', name:'vi – IV – I – V (Sad Pop)',  mood:['pop','sad'],          genre:'Pop',
    chords:[{s:9,q:'m',r:'vi'},{s:5,q:'M',r:'IV'},{s:0,q:'M',r:'I'},{s:7,q:'M',r:'V'}] },
  { id:'pop-I-IV-vi-V', name:'I – IV – vi – V',           mood:['pop','emotional'],     genre:'Pop',
    chords:[{s:0,q:'M',r:'I'},{s:5,q:'M',r:'IV'},{s:9,q:'m',r:'vi'},{s:7,q:'M',r:'V'}] },
  { id:'pop-I-vi-IV-V', name:'I – vi – IV – V (50s)',     mood:['pop','romantic'],      genre:'Pop',
    chords:[{s:0,q:'M',r:'I'},{s:9,q:'m',r:'vi'},{s:5,q:'M',r:'IV'},{s:7,q:'M',r:'V'}] },
  { id:'pop-I-iii-IV-I',name:'I – iii – IV – I',          mood:['pop','happy'],         genre:'Pop',
    chords:[{s:0,q:'M',r:'I'},{s:4,q:'m',r:'iii'},{s:5,q:'M',r:'IV'},{s:0,q:'M',r:'I'}] },
  { id:'pop-vi-V-IV-III',name:'vi – V – IV – III (Descending)',mood:['pop','emotional'],genre:'Pop',
    chords:[{s:9,q:'m',r:'vi'},{s:7,q:'M',r:'V'},{s:5,q:'M',r:'IV'},{s:4,q:'M',r:'III'}] },
  { id:'pop-I-V-IV',    name:'I – V – IV (3-chord pop)',  mood:['pop','happy'],         genre:'Pop',
    chords:[{s:0,q:'M',r:'I'},{s:7,q:'M',r:'V'},{s:5,q:'M',r:'IV'},{s:0,q:'M',r:'I'}] },
  { id:'pop-IV-I-V-vi', name:'IV – I – V – vi',           mood:['pop','happy'],         genre:'Pop',
    chords:[{s:5,q:'M',r:'IV'},{s:0,q:'M',r:'I'},{s:7,q:'M',r:'V'},{s:9,q:'m',r:'vi'}] },
  { id:'pop-I-ii-IV-V', name:'I – ii – IV – V',           mood:['pop','happy'],         genre:'Pop',
    chords:[{s:0,q:'M',r:'I'},{s:2,q:'m',r:'ii'},{s:5,q:'M',r:'IV'},{s:7,q:'M',r:'V'}] },
  { id:'pop-vi-IV-V-I', name:'vi – IV – V – I',           mood:['pop','emotional'],     genre:'Pop',
    chords:[{s:9,q:'m',r:'vi'},{s:5,q:'M',r:'IV'},{s:7,q:'M',r:'V'},{s:0,q:'M',r:'I'}] },

  // ── Rock (10) ─────────────────────────────────────────
  { id:'rock-I-VII-IV', name:'I – ♭VII – IV (Power)',     mood:['rock','epic'],         genre:'Rock',
    chords:[{s:0,q:'M',r:'I'},{s:10,q:'M',r:'♭VII'},{s:5,q:'M',r:'IV'},{s:0,q:'M',r:'I'}] },
  { id:'rock-I-IV-V',   name:'I – IV – V (3-chord rock)', mood:['rock','happy'],        genre:'Rock',
    chords:[{s:0,q:'M',r:'I'},{s:5,q:'M',r:'IV'},{s:7,q:'M',r:'V'},{s:0,q:'M',r:'I'}] },
  { id:'rock-i-VII-VI-V',name:'i – ♭VII – ♭VI – V',      mood:['rock','epic','dark'],  genre:'Rock',
    chords:[{s:0,q:'m',r:'i'},{s:10,q:'M',r:'♭VII'},{s:8,q:'M',r:'♭VI'},{s:7,q:'M',r:'V'}] },
  { id:'rock-I-V-VI-IV',name:'I – V – ♭VI – IV',         mood:['rock','emotional'],    genre:'Rock',
    chords:[{s:0,q:'M',r:'I'},{s:7,q:'M',r:'V'},{s:8,q:'M',r:'♭VI'},{s:5,q:'M',r:'IV'}] },
  { id:'rock-i-VI-III-VII',name:'i – ♭VI – ♭III – ♭VII', mood:['rock','dark'],         genre:'Rock',
    chords:[{s:0,q:'m',r:'i'},{s:8,q:'M',r:'♭VI'},{s:3,q:'M',r:'♭III'},{s:10,q:'M',r:'♭VII'}] },
  { id:'rock-I-bVII-I', name:'I – ♭VII – I (Riff)',      mood:['rock','epic'],         genre:'Rock',
    chords:[{s:0,q:'M',r:'I'},{s:10,q:'M',r:'♭VII'},{s:0,q:'M',r:'I'},{s:7,q:'M',r:'V'}] },
  { id:'rock-IV-I-V-I', name:'IV – I – V – I (Classic Rock)',mood:['rock','happy'],     genre:'Rock',
    chords:[{s:5,q:'M',r:'IV'},{s:0,q:'M',r:'I'},{s:7,q:'M',r:'V'},{s:0,q:'M',r:'I'}] },
  { id:'rock-i-v-VII',  name:'i – v – ♭VII (Grunge)',     mood:['rock','dark','sad'],   genre:'Rock',
    chords:[{s:0,q:'m',r:'i'},{s:7,q:'m',r:'v'},{s:10,q:'M',r:'♭VII'},{s:0,q:'m',r:'i'}] },
  { id:'rock-I-IV-bVII',name:'I – IV – ♭VII (Stadium)',   mood:['rock','epic'],         genre:'Rock',
    chords:[{s:0,q:'M',r:'I'},{s:5,q:'M',r:'IV'},{s:10,q:'M',r:'♭VII'},{s:0,q:'M',r:'I'}] },
  { id:'rock-i-III-VII-IV',name:'i – ♭III – ♭VII – IV',  mood:['rock','epic','dark'],  genre:'Rock',
    chords:[{s:0,q:'m',r:'i'},{s:3,q:'M',r:'♭III'},{s:10,q:'M',r:'♭VII'},{s:5,q:'M',r:'IV'}] },

  // ── Hip-Hop (10) ──────────────────────────────────────
  { id:'hiphop-i-VI-III-VII',name:'i – ♭VI – ♭III – ♭VII',mood:['hiphop','dark'],      genre:'Hip-Hop',
    chords:[{s:0,q:'m',r:'i'},{s:8,q:'M',r:'♭VI'},{s:3,q:'M',r:'♭III'},{s:10,q:'M',r:'♭VII'}] },
  { id:'hiphop-i-iv-I-V', name:'i – iv – I – V (Boom Bap)',mood:['hiphop','sad'],       genre:'Hip-Hop',
    chords:[{s:0,q:'m',r:'i'},{s:5,q:'m',r:'iv'},{s:0,q:'M',r:'I'},{s:7,q:'M',r:'V'}] },
  { id:'hiphop-I-vi-IV-V',name:'I – vi – IV – V (Sample)',  mood:['hiphop','pop'],      genre:'Hip-Hop',
    chords:[{s:0,q:'M',r:'I'},{s:9,q:'m',r:'vi'},{s:5,q:'M',r:'IV'},{s:7,q:'M',r:'V'}] },
  { id:'hiphop-ii-V-I-vi',name:'ii – V – I – vi (Neo Soul)',mood:['hiphop','jazz'],     genre:'Hip-Hop',
    chords:[{s:2,q:'m7',r:'ii7'},{s:7,q:'7',r:'V7'},{s:0,q:'M7',r:'Imaj7'},{s:9,q:'m7',r:'vi7'}] },
  { id:'hiphop-i-VII-VI-V',name:'i – ♭VII – ♭VI – V (Minor Trap)',mood:['hiphop','dark'],genre:'Hip-Hop',
    chords:[{s:0,q:'m',r:'i'},{s:10,q:'M',r:'♭VII'},{s:8,q:'M',r:'♭VI'},{s:7,q:'M',r:'V'}] },
  { id:'hiphop-I-IV-I-V',name:'I – IV – I – V (West Coast)',mood:['hiphop','happy'],    genre:'Hip-Hop',
    chords:[{s:0,q:'M',r:'I'},{s:5,q:'M',r:'IV'},{s:0,q:'M',r:'I'},{s:7,q:'M',r:'V'}] },
  { id:'hiphop-i-bVI-bVII',name:'i – ♭VI – ♭VII (Trap Loop)',mood:['hiphop','dark'],   genre:'Hip-Hop',
    chords:[{s:0,q:'m',r:'i'},{s:8,q:'M',r:'♭VI'},{s:10,q:'M',r:'♭VII'},{s:0,q:'m',r:'i'}] },
  { id:'hiphop-I-iii-vi-IV',name:'I – iii – vi – IV (R&B)',mood:['hiphop','emotional'], genre:'Hip-Hop',
    chords:[{s:0,q:'M7',r:'Imaj7'},{s:4,q:'m7',r:'iii7'},{s:9,q:'m7',r:'vi7'},{s:5,q:'M7',r:'IVmaj7'}] },
  { id:'hiphop-iv-i-VI-III',name:'iv – i – ♭VI – ♭III (Dark Trap)',mood:['hiphop','dark'],genre:'Hip-Hop',
    chords:[{s:5,q:'m',r:'iv'},{s:0,q:'m',r:'i'},{s:8,q:'M',r:'♭VI'},{s:3,q:'M',r:'♭III'}] },
  { id:'hiphop-I-V-vi-iii',name:'I – V – vi – iii (Melodic)',mood:['hiphop','emotional'],genre:'Hip-Hop',
    chords:[{s:0,q:'M',r:'I'},{s:7,q:'M',r:'V'},{s:9,q:'m',r:'vi'},{s:4,q:'m',r:'iii'}] },

  // ── EDM (10) ──────────────────────────────────────────
  { id:'edm-i-VI-III-VII',name:'i – ♭VI – ♭III – ♭VII (Festival)',mood:['edm','epic'],  genre:'EDM',
    chords:[{s:0,q:'m',r:'i'},{s:8,q:'M',r:'♭VI'},{s:3,q:'M',r:'♭III'},{s:10,q:'M',r:'♭VII'}] },
  { id:'edm-I-V-vi-IV', name:'I – V – vi – IV (Euphoric)',mood:['edm','happy'],          genre:'EDM',
    chords:[{s:0,q:'M',r:'I'},{s:7,q:'M',r:'V'},{s:9,q:'m',r:'vi'},{s:5,q:'M',r:'IV'}] },
  { id:'edm-vi-IV-I-V', name:'vi – IV – I – V (Emotional EDM)',mood:['edm','sad'],       genre:'EDM',
    chords:[{s:9,q:'m',r:'vi'},{s:5,q:'M',r:'IV'},{s:0,q:'M',r:'I'},{s:7,q:'M',r:'V'}] },
  { id:'edm-i-VII-VI-VII',name:'i – ♭VII – ♭VI – ♭VII (Trance)',mood:['edm','dark'],    genre:'EDM',
    chords:[{s:0,q:'m',r:'i'},{s:10,q:'M',r:'♭VII'},{s:8,q:'M',r:'♭VI'},{s:10,q:'M',r:'♭VII'}] },
  { id:'edm-I-IV-vi-V', name:'I – IV – vi – V (Club Anthem)',mood:['edm','happy'],       genre:'EDM',
    chords:[{s:0,q:'M',r:'I'},{s:5,q:'M',r:'IV'},{s:9,q:'m',r:'vi'},{s:7,q:'M',r:'V'}] },
  { id:'edm-iv-i-bVI-bVII',name:'iv – i – ♭VI – ♭VII (Dark EDM)',mood:['edm','dark'],   genre:'EDM',
    chords:[{s:5,q:'m',r:'iv'},{s:0,q:'m',r:'i'},{s:8,q:'M',r:'♭VI'},{s:10,q:'M',r:'♭VII'}] },
  { id:'edm-I-vi-IV-I', name:'I – vi – IV – I (Future Bass)',mood:['edm','happy'],       genre:'EDM',
    chords:[{s:0,q:'M',r:'I'},{s:9,q:'m',r:'vi'},{s:5,q:'M',r:'IV'},{s:0,q:'M',r:'I'}] },
  { id:'edm-i-III-VII', name:'i – ♭III – ♭VII (Big Room)',  mood:['edm','epic'],         genre:'EDM',
    chords:[{s:0,q:'m',r:'i'},{s:3,q:'M',r:'♭III'},{s:10,q:'M',r:'♭VII'},{s:0,q:'m',r:'i'}] },
  { id:'edm-I-V-IV-V',  name:'I – V – IV – V (Progressive)',mood:['edm','epic','happy'], genre:'EDM',
    chords:[{s:0,q:'M',r:'I'},{s:7,q:'M',r:'V'},{s:5,q:'M',r:'IV'},{s:7,q:'M',r:'V'}] },
  { id:'edm-vi-I-V-IV', name:'vi – I – V – IV (Melodic House)',mood:['edm','emotional'], genre:'EDM',
    chords:[{s:9,q:'m',r:'vi'},{s:0,q:'M',r:'I'},{s:7,q:'M',r:'V'},{s:5,q:'M',r:'IV'}] },

  // ── Romantic ──────────────────────────────────────────
  { id:'I-vi-IV-V-doo', name:'I – vi – IV – V',       mood:['romantic','happy','classic'],genre:'Doo-wop',
    chords:[{s:0,q:'M',r:'I'},{s:9,q:'m',r:'vi'},{s:5,q:'M',r:'IV'},{s:7,q:'M',r:'V'}] },
  { id:'I-V-IV-V',      name:'I – V – IV – V',        mood:['romantic'],                 genre:'Pop',
    chords:[{s:0,q:'M',r:'I'},{s:7,q:'M',r:'V'},{s:5,q:'M',r:'IV'},{s:7,q:'M',r:'V'}] },
  { id:'I-IV-V-vi',     name:'I – IV – V – vi',       mood:['romantic','emotional'],     genre:'Pop',
    chords:[{s:0,q:'M',r:'I'},{s:5,q:'M',r:'IV'},{s:7,q:'M',r:'V'},{s:9,q:'m',r:'vi'}] },

  // ── Dark ──────────────────────────────────────────────
  { id:'i-ii-dim-III',  name:'i – ii° – III – iv',    mood:['dark','classical'],         genre:'Classical',
    chords:[{s:0,q:'m',r:'i'},{s:2,q:'dim',r:'ii°'},{s:3,q:'M',r:'III'},{s:5,q:'m',r:'iv'}] },
  { id:'i-VII-i-V',     name:'i – VII – i – V',       mood:['dark','epic'],              genre:'Cinematic',
    chords:[{s:0,q:'m',r:'i'},{s:10,q:'M',r:'VII'},{s:0,q:'m',r:'i'},{s:7,q:'M',r:'V'}] },
  { id:'i-iv-i-V',      name:'i – iv – i – V',        mood:['dark','sad'],               genre:'Classical',
    chords:[{s:0,q:'m',r:'i'},{s:5,q:'m',r:'iv'},{s:0,q:'m',r:'i'},{s:7,q:'M',r:'V'}] },

  // ── Minor Blues (10) ──────────────────────────────────
  { id:'mb-12bar',       name:'12-Bar Minor Blues',         mood:['blues','sad'],          genre:'Blues',
    chords:[{s:0,q:'m7',r:'im7'},{s:0,q:'m7',r:'im7'},{s:0,q:'m7',r:'im7'},{s:0,q:'m7',r:'im7'},
            {s:5,q:'m7',r:'ivm7'},{s:5,q:'m7',r:'ivm7'},{s:0,q:'m7',r:'im7'},{s:0,q:'m7',r:'im7'},
            {s:7,q:'7',r:'V7'},{s:5,q:'m7',r:'ivm7'},{s:0,q:'m7',r:'im7'},{s:7,q:'7',r:'V7'}] },
  { id:'mb-shuffle',     name:'Minor Blues Shuffle',        mood:['blues','sad'],          genre:'Blues',
    chords:[{s:0,q:'m7',r:'im7'},{s:5,q:'m7',r:'ivm7'},{s:0,q:'m7',r:'im7'},{s:7,q:'7',r:'V7'}] },
  { id:'mb-quick-iv',    name:'Minor Quick Change Blues',   mood:['blues','sad'],          genre:'Blues',
    chords:[{s:0,q:'m7',r:'im7'},{s:5,q:'m7',r:'ivm7'},{s:0,q:'m7',r:'im7'},{s:0,q:'m7',r:'im7'},
            {s:5,q:'m7',r:'ivm7'},{s:5,q:'m7',r:'ivm7'},{s:0,q:'m7',r:'im7'},{s:7,q:'7',r:'V7'}] },
  { id:'mb-flat6',       name:'Minor Blues ♭VI Turnaround', mood:['blues','sad','dark'],   genre:'Blues',
    chords:[{s:0,q:'m7',r:'im7'},{s:0,q:'m7',r:'im7'},{s:5,q:'m7',r:'ivm7'},{s:0,q:'m7',r:'im7'},
            {s:8,q:'M7',r:'♭VImaj7'},{s:7,q:'7',r:'V7'},{s:0,q:'m7',r:'im7'},{s:7,q:'7',r:'V7'}] },
  { id:'mb-slow',        name:'Slow Minor Blues',           mood:['blues','sad'],          genre:'Blues',
    chords:[{s:0,q:'m7',r:'im7'},{s:0,q:'7',r:'I7'},{s:5,q:'m7',r:'ivm7'},{s:5,q:'m7',r:'ivm7'},
            {s:0,q:'m7',r:'im7'},{s:8,q:'M7',r:'♭VImaj7'},{s:7,q:'7',r:'V7'},{s:0,q:'m7',r:'im7'}] },
  { id:'mb-texas',       name:'Texas Minor Blues',          mood:['blues','sad'],          genre:'Blues',
    chords:[{s:0,q:'7',r:'I7'},{s:0,q:'7',r:'I7'},{s:0,q:'7',r:'I7'},{s:0,q:'7',r:'I7'},
            {s:5,q:'m7',r:'ivm7'},{s:5,q:'m7',r:'ivm7'},{s:0,q:'7',r:'I7'},{s:0,q:'7',r:'I7'},
            {s:8,q:'M',r:'♭VI'},{s:7,q:'7',r:'V7'},{s:0,q:'7',r:'I7'},{s:7,q:'7',r:'V7'}] },
  { id:'mb-jazz-minor',  name:'Jazz Minor Blues',           mood:['blues','jazz','sad'],   genre:'Blues',
    chords:[{s:0,q:'m7',r:'im7'},{s:5,q:'m7',r:'ivm7'},{s:0,q:'m7',r:'im7'},{s:9,q:'7',r:'VI7'},
            {s:5,q:'m7',r:'ivm7'},{s:3,q:'7',r:'♭III7'},{s:0,q:'m7',r:'im7'},{s:8,q:'M7',r:'♭VImaj7'},
            {s:2,q:'dim',r:'ii°7'},{s:7,q:'7',r:'V7'},{s:0,q:'m7',r:'im7'},{s:7,q:'7',r:'V7'}] },
  { id:'mb-memphis',     name:'Memphis Minor Blues',        mood:['blues','sad'],          genre:'Blues',
    chords:[{s:0,q:'m7',r:'im7'},{s:3,q:'7',r:'♭III7'},{s:5,q:'m7',r:'ivm7'},{s:0,q:'m7',r:'im7'},
            {s:8,q:'M',r:'♭VI'},{s:7,q:'7',r:'V7'},{s:0,q:'m7',r:'im7'},{s:0,q:'m7',r:'im7'}] },
  { id:'mb-8bar',        name:'8-Bar Minor Blues',          mood:['blues','sad'],          genre:'Blues',
    chords:[{s:0,q:'m7',r:'im7'},{s:5,q:'m7',r:'ivm7'},{s:0,q:'m7',r:'im7'},{s:7,q:'7',r:'V7'},
            {s:5,q:'m7',r:'ivm7'},{s:5,q:'m7',r:'ivm7'},{s:0,q:'m7',r:'im7'},{s:7,q:'7',r:'V7'}] },
  { id:'mb-ii7-sub',     name:'Minor Blues ii° Substitution', mood:['blues','jazz','sad'], genre:'Blues',
    chords:[{s:0,q:'m7',r:'im7'},{s:0,q:'m7',r:'im7'},{s:5,q:'m7',r:'ivm7'},{s:5,q:'m7',r:'ivm7'},
            {s:0,q:'m7',r:'im7'},{s:0,q:'m7',r:'im7'},{s:2,q:'dim',r:'ii°7'},{s:7,q:'7',r:'V7'}] },

  // ── Minor Jazz (6) ────────────────────────────────────
  { id:'mj-ii-V-i',      name:'Minor ii° – V – i',         mood:['jazz','sad'],           genre:'Jazz',
    chords:[{s:2,q:'dim',r:'ii°7'},{s:7,q:'7',r:'V7'},{s:0,q:'m7',r:'im7'},{s:0,q:'m7',r:'im7'}] },
  { id:'mj-i-iv-V-i',    name:'i – iv – V – i (Minor)',    mood:['jazz','sad'],           genre:'Jazz',
    chords:[{s:0,q:'m7',r:'im7'},{s:5,q:'m7',r:'ivm7'},{s:7,q:'7',r:'V7'},{s:0,q:'m7',r:'im7'}] },
  { id:'mj-i-VI-ii-V',   name:'i – ♭VI – ii° – V',        mood:['jazz','sad','dark'],    genre:'Jazz',
    chords:[{s:0,q:'m7',r:'im7'},{s:8,q:'M7',r:'♭VImaj7'},{s:2,q:'dim',r:'ii°7'},{s:7,q:'7',r:'V7'}] },
  { id:'mj-i-VII-VI-V',  name:'i – ♭VII – ♭VI – V (Descending)', mood:['jazz','sad','dark'], genre:'Jazz',
    chords:[{s:0,q:'m7',r:'im7'},{s:10,q:'7',r:'♭VII7'},{s:8,q:'M7',r:'♭VImaj7'},{s:7,q:'7',r:'V7'}] },
  { id:'mj-i-III-VII-iv',name:'i – ♭III – ♭VII – iv (Modal Minor)', mood:['jazz','dark','emotional'], genre:'Jazz',
    chords:[{s:0,q:'m7',r:'im7'},{s:3,q:'M7',r:'♭IIImaj7'},{s:10,q:'7',r:'♭VII7'},{s:5,q:'m7',r:'ivm7'}] },
  { id:'mj-i-VI7-ii-V',  name:'i – VI7 – ii° – V (Minor Turnaround)', mood:['jazz','sad'], genre:'Jazz',
    chords:[{s:0,q:'m7',r:'im7'},{s:9,q:'7',r:'VI7'},{s:2,q:'dim',r:'ii°7'},{s:7,q:'7',r:'V7'}] },
];

// ── Progressions Favourites ─────────────────────────────────────
const getFavProgs = () => { try { return new Set(JSON.parse(localStorage.getItem('favProgs')||'[]')); } catch { return new Set(); } };
const setFavProgs = (s) => { try { localStorage.setItem('favProgs', JSON.stringify([...s])); } catch {} };
const toggleFavProg = (id) => { const f = getFavProgs(); f.has(id) ? f.delete(id) : f.add(id); setFavProgs(f); };

// ── Progressions Hub ───────────────────────────────────────────
views.progressions = (params) => {
  setNav('practice');
  const mood = params?.get('mood') || 'all';
  const scale = params?.get('scale') || 'all'; // 'all' | 'major' | 'minor'
  const showFavs = params?.get('favs') === '1';
  const isProgMinor = (p) => /^i[^I]|^i$/.test(p.chords[0]?.r || '') || p.mood.some(m => /sad|dark/.test(m));
  let filtered = mood === 'all' ? PROGRESSIONS_DB : PROGRESSIONS_DB.filter(p => p.mood.includes(mood));
  if (scale === 'major') filtered = filtered.filter(p => !isProgMinor(p));
  if (scale === 'minor') filtered = filtered.filter(p => isProgMinor(p));
  const favs = getFavProgs();
  if (showFavs) filtered = filtered.filter(p => favs.has(p.id));
  const MOOD_COLORS = {
    happy:'#f59e0b',sad:'#6366f1',emotional:'#8b5cf6',epic:'#ef4444',
    jazz:'#d97706',blues:'#1d4ed8',pop:'#ec4899',rock:'#dc2626',hiphop:'#7c3aed',edm:'#0891b2',
    romantic:'#ec4899',dark:'#374151',classic:'#0d9488',folk:'#65a30d',
  };
  const moodBadge = (m) => `<span style="font-size:11px;padding:1px 8px;border-radius:12px;background:${MOOD_COLORS[m]||'#666'}22;color:${MOOD_COLORS[m]||'#888'};font-weight:600">${m}</span>`;

  app.innerHTML = `<section class="view">
    <div class="top"><a class="iconbtn" href="#/practice">${icon('back')}</a><h1>Chord Progressions</h1><span style="width:42px"></span></div>
    <div class="chips" style="padding-top:0;overflow-x:auto;flex-wrap:nowrap" id="moodChips">
      ${PROG_MOODS.map(m=>`<button class="chip ${MOOD_KEY[m]===mood?'on':''}" data-mood="${MOOD_KEY[m]}">${m}</button>`).join('')}
    </div>
    <div class="chips" style="padding-top:0;gap:6px" id="scaleChips">
      ${['all','major','minor'].map(s=>`<button class="chip ${s===scale&&!showFavs?'on':''}" data-scale="${s}">${s==='all'?'🎼 All':s==='major'?'☀️ Major':'🌙 Minor'}</button>`).join('')}
      <button class="chip ${showFavs?'on':''}" data-favs="1" style="${showFavs?'':''}">❤️ Favs</button>
    </div>
    <div class="list" id="plist">
      ${filtered.length === 0 ? `<div style="padding:32px;text-align:center;color:var(--muted);font-size:14px">No favourites yet.<br>Tap ❤️ on any progression to save it.</div>` :
      filtered.map(p=>`
        <div class="song" data-prog-id="${p.id}" style="cursor:default">
          <a href="#/progressionPlay/${p.id}" style="display:contents">
          <div class="thumb" style="background:linear-gradient(135deg,${MOOD_COLORS[p.mood[0]]||'#6d5dfc'},${MOOD_COLORS[p.mood[1]]||'#22c55e'});font-size:28px;display:flex;align-items:center;justify-content:center">
            ${{happy:'😊',sad:'😢',emotional:'💫',epic:'🔥',jazz:'🎷',blues:'🎸',romantic:'💕',dark:'🌙'}[p.mood[0]]||'🎼'}
          </div>
          <div class="meta">
            <div class="t">${p.name}</div>
            <div class="s">${p.genre} · ${p.chords.length} chords</div>
            <div class="tags" style="gap:4px">${p.mood.slice(0,3).map(moodBadge).join('')}</div>
          </div>
          </a>
          <button class="fav-btn" data-fav-id="${p.id}" style="background:none;border:none;cursor:pointer;font-size:20px;padding:8px;flex-shrink:0" title="Favourite">${favs.has(p.id)?'❤️':'🤍'}</button>
          <a class="play" href="#/progressionPlay/${p.id}">${icon('play')}</a>
        </div>`).join('')}
    </div>
  </section>`;
  app.querySelector('#moodChips').onclick = (e) => {
    const m = e.target.closest('[data-mood]')?.dataset.mood;
    if (m) location.hash = `#/progressions?mood=${m}&scale=${scale}&favs=${showFavs?1:0}`;
  };
  app.querySelector('#scaleChips').onclick = (e) => {
    const s = e.target.closest('[data-scale]')?.dataset.scale;
    if (s) { location.hash = `#/progressions?mood=${mood}&scale=${s}&favs=0`; return; }
    if (e.target.closest('[data-favs]')) location.hash = `#/progressions?mood=${mood}&scale=${scale}&favs=${showFavs?0:1}`;
  };
  app.querySelector('#plist').onclick = (e) => {
    const btn = e.target.closest('.fav-btn');
    if (!btn) return;
    e.preventDefault(); e.stopPropagation();
    const id = btn.dataset.favId;
    toggleFavProg(id);
    const newFavs = getFavProgs();
    btn.textContent = newFavs.has(id) ? '❤️' : '🤍';
    if (showFavs && !newFavs.has(id)) btn.closest('.song')?.remove();
  };
};

// ── Progression Player ─────────────────────────────────────────
// Returns detailed improv tips based on key and progression mood/genre
const getImprovTips = (keyName, prog) => {
  const NOTE_SEQ = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const FLAT_MAP = { Db:'C#',Eb:'D#',Fb:'E',Gb:'F#',Ab:'G#',Bb:'A#',Cb:'B' };
  const normalKey = FLAT_MAP[keyName] || keyName;
  const rootIdx = NOTE_SEQ.indexOf(normalKey);
  const s = (n) => NOTE_SEQ[(rootIdx + n + 12) % 12];

  const moods = prog.mood || [];
  const isMinor = moods.some(m => /sad|dark|blues/.test(m)) || /minor/i.test(prog.name||'');

  const SCALE_DATA = {
    jazz: {
      name: 'Ionian / Dorian Mix',
      degrees: [
        { n:s(0),  deg:'1 (Root)',   role:'Home base — always safe to land here' },
        { n:s(2),  deg:'2',          role:'Passing note — connects root to 3rd' },
        { n:s(4),  deg:'3 (Major)',  role:'Defines major sound — strong chord tone' },
        { n:s(5),  deg:'4',          role:'Tension note — resolves down to 3rd' },
        { n:s(7),  deg:'5 (Fifth)',  role:'Second strongest note — very stable' },
        { n:s(9),  deg:'6',          role:'Color note — sweet and jazzy' },
        { n:s(10), deg:'♭7',         role:'Dorian flavor — hip, bluesy tension' },
        { n:s(11), deg:'7 (Major)',  role:'Leading tone — pulls strongly to root' },
      ],
      chordTones: [s(0), s(4), s(7), s(11)],
      patterns: ['1–3–5–7 arpeggio up', 'Chromatic approach: play note a semitone below chord tone', '♭7–root turnaround'],
      theory: 'Jazz loves the ii–V–I movement. Target the 3rd and 7th of each chord. Use chromatic approach notes (half-step below) for bebop flavor.',
      avoid: `${s(6)} (tritone) — unless deliberately creating tension on the V chord`,
    },
    blues: {
      name: 'Blues Scale',
      degrees: [
        { n:s(0),  deg:'1 (Root)',   role:'Your anchor — always resolve here' },
        { n:s(3),  deg:'♭3',         role:'The "blue" note — gives blues its soulful ache' },
        { n:s(5),  deg:'4',          role:'Strong passing note — very useful' },
        { n:s(6),  deg:'♭5 (Tritone)',role:'Maximum tension — use briefly for drama' },
        { n:s(7),  deg:'5',          role:'Stable and strong — great for riffs' },
        { n:s(10), deg:'♭7',         role:'Essential blues tone — creates the "call"' },
      ],
      chordTones: [s(0), s(3), s(7), s(10)],
      patterns: ['Bend from ♭3 up to 3', 'Riff: 1–♭3–4–♭5–5', 'End phrase on ♭7 then resolve to root'],
      theory: 'In blues the ♭3 and ♭7 are played over major chords — this clash IS the sound. Start phrases on beat 1 with the root, end phrases on weak beats with the ♭7.',
      avoid: `${s(2)} (major 2nd) — can sound too "happy" against the blues feel`,
    },
    rock: {
      name: 'Minor Pentatonic',
      degrees: [
        { n:s(0),  deg:'1 (Root)',   role:'Power — always works, especially on I chord' },
        { n:s(3),  deg:'♭3',         role:'Gritty rock sound — drive and attitude' },
        { n:s(5),  deg:'4',          role:'Solid — great for riffs and power motifs' },
        { n:s(7),  deg:'5',          role:'Power chord partner — very strong' },
        { n:s(10), deg:'♭7',         role:'Rock anthem note — rebellious energy' },
      ],
      chordTones: [s(0), s(3), s(7)],
      patterns: ['Box shape riff: 1–♭3–4–5', 'Octave jump then fall back', 'Repeat a 2-note motif rhythmically'],
      theory: 'Rock riffs are built on the pentatonic minor box. The ♭3 over a major I chord creates the rock sound. Add the ♭5 (blue note) for a harder edge.',
      avoid: `${s(11)} (major 7th) — too gentle for rock`,
    },
    hiphop: {
      name: 'Minor Pentatonic / Dorian',
      degrees: [
        { n:s(0),  deg:'1 (Root)',   role:'Anchor — use on beat 1 of each bar' },
        { n:s(3),  deg:'♭3',         role:'Soulful, melancholy — hip-hop staple' },
        { n:s(5),  deg:'4',          role:'Rhythm note — great on offbeats' },
        { n:s(7),  deg:'5',          role:'Solid resolution point' },
        { n:s(9),  deg:'6 (Dorian)', role:'Adds brightness — distinguish from pure minor' },
        { n:s(10), deg:'♭7',         role:'The most hip-hop note — soulful tension' },
      ],
      chordTones: [s(0), s(3), s(7), s(10)],
      patterns: ['Short 2-bar phrase, repeat with variation', 'Syncopate: land on the "and" of beat 2', '♭7–root fall for resolution'],
      theory: 'Hip-hop melody prioritizes rhythm over notes. Use fewer notes but vary the rhythm. The ♭7 to root is the signature hip-hop resolution.',
      avoid: `${s(11)} (major 7th) — too jazz-influenced for raw hip-hop`,
    },
    edm: {
      name: 'Mixolydian (Major ♭7)',
      degrees: [
        { n:s(0),  deg:'1 (Root)',   role:'Tonic — use on beat 1 for stability' },
        { n:s(2),  deg:'2',          role:'Passing note — smooth movement' },
        { n:s(4),  deg:'3',          role:'Bright major 3rd — energetic' },
        { n:s(5),  deg:'4',          role:'Build tension for the drop' },
        { n:s(7),  deg:'5',          role:'Power note — works over any chord' },
        { n:s(9),  deg:'6',          role:'Euphoric — classic EDM lead note' },
        { n:s(10), deg:'♭7',         role:'The Mixolydian signature — drive and energy' },
      ],
      chordTones: [s(0), s(4), s(7), s(10)],
      patterns: ['16th-note arpeggio: 1–3–5–♭7', 'Build 4 bars: add one note each bar', 'Drop riff: 5–4–3–1'],
      theory: 'EDM leads work by building tension over 4/8/16 bars then resolving at the drop. Use the ♭7 to create that driving, non-resolving feeling before the drop.',
      avoid: `${s(11)} (major 7th) — too static for EDM energy`,
    },
    pop: {
      name: 'Major Scale (Ionian)',
      degrees: [
        { n:s(0),  deg:'1 (Root)',   role:'Home — start and end phrases here' },
        { n:s(2),  deg:'2',          role:'Stepwise motion — very natural in pop' },
        { n:s(4),  deg:'3',          role:'Sweet spot — most-used pop melody note' },
        { n:s(5),  deg:'4',          role:'Suspension — resolves nicely to 3rd' },
        { n:s(7),  deg:'5',          role:'Second home — strong and stable' },
        { n:s(9),  deg:'6',          role:'Emotional note — adds feeling' },
        { n:s(11), deg:'7 (Leading)',role:'Tension — must resolve up to root' },
      ],
      chordTones: [s(0), s(4), s(7), s(11)],
      patterns: ['3–2–1 (do-re-mi fall)', 'Start on 3rd, step up to 5th', '5–6–5–3 (classic pop hook)'],
      theory: 'Pop melody thrives on scale steps (not jumps) and repetition. The 3rd is the most memorable pop note. Use the 4–3 resolution for a sweet, satisfying feel.',
      avoid: `${s(6)} (♯4/tritone) — dissonant, breaks the pop vibe`,
    },
    happy: {
      name: 'Major Pentatonic',
      degrees: [
        { n:s(0),  deg:'1 (Root)',   role:'Bright home — uplifting resolve' },
        { n:s(2),  deg:'2',          role:'Light and open — great for movement' },
        { n:s(4),  deg:'3',          role:'The smile note — major, bright, happy' },
        { n:s(7),  deg:'5',          role:'Strong and confident' },
        { n:s(9),  deg:'6',          role:'The "joy" note — uplifting and warm' },
      ],
      chordTones: [s(0), s(4), s(7)],
      patterns: ['Jump 1→6 for uplifting leap', '3–5–6–5 motif', 'Bounce between 2 and 3'],
      theory: 'Major pentatonic has no half-steps so every note sounds good everywhere. The major 6th (interval of a 6th up from root) is the "sunshine" interval in happy music.',
      avoid: `${s(3)} (minor 3rd) — makes it sad instead of happy`,
    },
    sad: {
      name: 'Natural Minor (Aeolian)',
      degrees: [
        { n:s(0),  deg:'1 (Root)',   role:'Dark home — heavy, final' },
        { n:s(2),  deg:'2',          role:'Brief passing note' },
        { n:s(3),  deg:'♭3',         role:'The sadness note — defines minor' },
        { n:s(5),  deg:'4',          role:'Yearning quality' },
        { n:s(7),  deg:'5',          role:'Stable but melancholy here' },
        { n:s(8),  deg:'♭6',         role:'Most melancholy note — emotional peak' },
        { n:s(10), deg:'♭7',         role:'Bittersweet — softer sadness' },
      ],
      chordTones: [s(0), s(3), s(7)],
      patterns: ['Descend: 5–♭3–1 (falling phrase)', '♭6–5 fall for heartbreak feel', 'Long sustained ♭3'],
      theory: 'Sad melodies go DOWN. Descending stepwise motion triggers emotional response. The ♭6 is the most heart-wrenching note — use it on a strong beat then resolve down to 5.',
      avoid: `${s(11)} (major 7th) — too bright, breaks the sad mood`,
    },
    dark: {
      name: 'Harmonic Minor',
      degrees: [
        { n:s(0),  deg:'1 (Root)',   role:'Ominous home base' },
        { n:s(2),  deg:'2',          role:'Passing — brief use only' },
        { n:s(3),  deg:'♭3',         role:'Minor quality — dark foundation' },
        { n:s(5),  deg:'4',          role:'Tension before the tritone' },
        { n:s(7),  deg:'5',          role:'Dark resolve point' },
        { n:s(8),  deg:'♭6',         role:'Sinister color — maximum darkness' },
        { n:s(11), deg:'7 (Major)',  role:'The harmonic minor signature — dramatic tension' },
      ],
      chordTones: [s(0), s(3), s(7), s(11)],
      patterns: ['♭6→7 augmented 2nd — exotic, tense', '5–♭6–5 tremolo feel', 'Descend: 1–7–♭6–5'],
      theory: 'Harmonic minor has an augmented 2nd interval between ♭6 and 7. This gap creates an exotic, tense sound used in horror, drama, and metal. The raised 7th (not ♭7) is what makes it "harmonic."',
      avoid: `${s(10)} (♭7) — use the raised ${s(11)} instead to keep the harmonic minor flavor`,
    },
    romantic: {
      name: 'Lydian (Major ♯4)',
      degrees: [
        { n:s(0),  deg:'1 (Root)',   role:'Dreamy home' },
        { n:s(2),  deg:'2',          role:'Floating quality' },
        { n:s(4),  deg:'3',          role:'Warm major 3rd' },
        { n:s(6),  deg:'♯4 (Lydian)',role:'THE romantic note — dreamy, magical' },
        { n:s(7),  deg:'5',          role:'Stable, grounded warmth' },
        { n:s(9),  deg:'6',          role:'Tender, heartfelt' },
        { n:s(11), deg:'7',          role:'Longing — pulls toward root' },
      ],
      chordTones: [s(0), s(4), s(7), s(11)],
      patterns: ['Linger on ♯4 over the I chord', 'Slow stepwise rise: 1–2–3–♯4', '♯4–5–6–7 ascending sigh'],
      theory: 'Lydian mode raises the 4th by a half-step, creating a "floating," dreamy sound. The ♯4 is the magic note — it sounds like reaching for something. Used in film scores for wonder and romance.',
      avoid: `${s(5)} (perfect 4th) — use the ♯4 instead; the natural 4th kills the Lydian magic`,
    },
    emotional: {
      name: 'Minor + Major 6th (Dorian)',
      degrees: [
        { n:s(0),  deg:'1 (Root)',   role:'Emotional anchor' },
        { n:s(2),  deg:'2',          role:'Gentle passing note' },
        { n:s(3),  deg:'♭3',         role:'Minor — introspective feeling' },
        { n:s(5),  deg:'4',          role:'Wistful quality' },
        { n:s(7),  deg:'5',          role:'Stability amid emotion' },
        { n:s(9),  deg:'6 (Dorian)', role:'Hope within sadness — Dorian signature' },
        { n:s(10), deg:'♭7',         role:'Unresolved feeling — searching' },
      ],
      chordTones: [s(0), s(3), s(7), s(10)],
      patterns: ['♭3–6 jump (minor to major — bittersweet)', '1–2–♭3–4 stepwise climb', 'End on ♭7 without resolving'],
      theory: 'Dorian mode is minor but with a major 6th — this creates "hopeful sadness." It\'s used in countless emotional ballads. The ♭3→6 jump captures the feeling of longing mixed with hope.',
      avoid: `${s(11)} (major 7th) — too resolved; keep that unfinished emotional quality`,
    },
    epic: {
      name: 'Phrygian Dominant / Harmonic Minor',
      degrees: [
        { n:s(0),  deg:'1 (Root)',   role:'Power — massive, commanding' },
        { n:s(1),  deg:'♭2 (Phrygian)',role:'The epic clash — cinematic tension' },
        { n:s(4),  deg:'3 (Major)',  role:'Heroic — major over minor backdrop' },
        { n:s(5),  deg:'4',          role:'March-like strength' },
        { n:s(7),  deg:'5',          role:'Triumphant power note' },
        { n:s(8),  deg:'♭6',         role:'Danger, drama, darkness' },
        { n:s(10), deg:'♭7',         role:'Cinematic resolution point' },
      ],
      chordTones: [s(0), s(4), s(7)],
      patterns: ['Fanfare: 1–5–1 (octave)', '♭2–1 clash for drama', 'Timpani rhythm: 1 _ _ 1 _ 5'],
      theory: 'Epic music uses Phrygian Dominant (major chord on a minor/Phrygian backdrop). The ♭2 note is the cinematic "danger" interval. Wide intervals and dotted rhythms create grandeur.',
      avoid: `${s(2)} (major 2nd) — too gentle; use ♭2 for the dramatic Phrygian clash`,
    },
  };

  const moodKeys = [...(prog.mood||[])];
  let chosen = null;
  for (const mk of moodKeys) { if (SCALE_DATA[mk]) { chosen = SCALE_DATA[mk]; break; } }
  if (!chosen) chosen = isMinor ? SCALE_DATA.sad : SCALE_DATA.happy;

  return { ...chosen, keyName, prog };
};

// Colors keyboard keys by note name — chord tones vivid, passing notes soft
const NOTE_PC_COLORS = { C:'#ef4444',D:'#f97316',E:'#eab308',F:'#22c55e',G:'#06b6d4',A:'#3b82f6',B:'#8b5cf6' };
const NOTE_SEQ_12 = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
// Mini treble-clef staff SVG for a chord
const chordNotationSVG = (midis) => {
  const DIA = [0,0,1,1,2,3,3,4,4,5,5,6]; // pc → diatonic step from C
  const ACC = [0,1,0,1,0,0,1,0,1,0,1,0]; // 1=sharp
  // Normalize to the octave that centers best on treble staff (C4=60 to B4=71 ideally)
  const normOct = (m) => { while (m < 60) m+=12; while (m > 83) m-=12; return m; };
  const staffY = (m) => {
    const stepsFromE4 = (Math.floor(m/12)-1)*7 + DIA[m%12] - 30; // E4=30 steps from C0
    return 56 - stepsFromE4*4.5;
  };
  // Staff: 5 lines 12px apart, top line at y=16, bottom at y=64
  const LG = 12; // line gap
  const TOP = 16;
  const lineY = [TOP, TOP+LG, TOP+LG*2, TOP+LG*3, TOP+LG*4]; // [16,28,40,52,64]
  const staffX1 = 28, staffX2 = 110;
  const staffLines = lineY.map(y=>`<line x1="${staffX1}" y1="${y}" x2="${staffX2}" y2="${y}" stroke="currentColor" stroke-width="1.5" opacity=".7"/>`).join('');
  // Note y: E4=bottom line=64, each diatonic step = LG/2 = 6px up
  const noteStaffY = (m) => {
    const stepsFromE4 = (Math.floor(m/12)-1)*7 + DIA[m%12] - 30;
    return lineY[4] - stepsFromE4*(LG/2);
  };
  const ledgers = new Set();
  midis.forEach(m=>{ const y=noteStaffY(normOct(m)); if(y>lineY[4]) for(let l=lineY[4]+LG;l<=y+3;l+=LG) ledgers.add(l); if(y<lineY[0]) for(let l=lineY[0]-LG;l>=y-3;l-=LG) ledgers.add(l); });
  const NX = 70; // x position of noteheads
  const ledgerSvg = [...ledgers].map(y=>`<line x1="${NX-10}" y1="${y}" x2="${NX+10}" y2="${y}" stroke="currentColor" stroke-width="1.5" opacity=".7"/>`).join('');
  const notes = [...midis].sort((a,b)=>a-b).map(m=>{
    const mn=normOct(m), y=noteStaffY(mn), pc=mn%12, sharp=ACC[pc];
    const nx=NX+(sharp?5:0);
    return `${sharp?`<text x="${nx-12}" y="${y+4}" font-size="13" font-weight="bold" fill="currentColor">#</text>`:''}<ellipse cx="${nx}" cy="${y}" rx="7.5" ry="5.2" fill="currentColor" transform="rotate(-12,${nx},${y})"/>`;
  }).join('');
  return `<svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg" style="color:var(--ink);opacity:.85;width:100px;height:75px"><text x="0" y="70" font-size="60" font-family="serif" fill="currentColor" style="font-style:italic">𝄞</text>${staffLines}${ledgerSvg}${notes}</svg>`;
};

// Stamp scale degree numbers (1–7) onto keyboard keys for a given key/mode
const stampDegrees = (kbHost, keyPc, isMinor) => {
  kbHost.querySelectorAll('.degree-label').forEach(el => el.remove());
  const major = [0,2,4,5,7,9,11];
  const minor = [0,2,3,5,7,8,10];
  const scale = isMinor ? minor : major;
  kbHost.querySelectorAll('.key').forEach(el => {
    const midi = Number(el.dataset.midi);
    const pc = (midi - keyPc + 120) % 12;
    const deg = scale.indexOf(pc);
    if (deg === -1) return;
    const lbl = document.createElement('span');
    lbl.className = 'degree-label';
    lbl.textContent = deg + 1;
    el.appendChild(lbl);
  });
};

// Color only chord tone keys in a single chord color — all tones same color so the chord reads as a unit
const colorKbChord = (chordMidis, chordColor) => {
  document.querySelectorAll('.key[data-improv]').forEach(el => {
    el.removeAttribute('data-improv');
    el.style.removeProperty('--improv-col');
  });
  const host = document.querySelector('#kb');
  if (!host) return;
  // Shift chord into octave 4 (C4=60) for middle-keyboard display
  const shifted = chordMidis.map(m => { while (m < 60) m += 12; while (m > 71) m -= 12; return m; });
  const chordSet = new Set(shifted);
  const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  host.querySelectorAll('.key').forEach(el => {
    el.querySelector('.improv-note-label')?.remove();
    if (chordSet.has(Number(el.dataset.midi))) {
      el.dataset.improv = 'chord';
      el.style.setProperty('--improv-col', chordColor);
      const lbl = document.createElement('span');
      lbl.className = 'improv-note-label';
      lbl.textContent = NOTE_NAMES[Number(el.dataset.midi) % 12];
      el.appendChild(lbl);
    }
  });
};

views.progressionPlay = (params, progId) => {
  setNav('practice-run');
  const prog = PROGRESSIONS_DB.find(p => p.id === progId);
  if (!prog) { location.hash = '#/progressions'; return; }
  let keyName = params?.get('key') || 'C';
  if (!KEY_ROOT_MIDI[keyName]) keyName = 'C';
  let keyMidi = KEY_ROOT_MIDI[keyName];
  let bpm = Number(params?.get('bpm')) || 72;
  let curIdx = 0;
  let autoPlaying = false;
  let autoTimer = null;

  const render = () => {
    const chord = prog.chords[curIdx];
    const label = progChordLabel(keyMidi, chord.s, chord.q);
    const midis = progChordMidis(keyMidi, chord.s, chord.q);
    // Update chord display
    const nameEl = app.querySelector('#curChordName');
    const romEl  = app.querySelector('#curRoman');
    const pillsEl= app.querySelector('#progPills');
    const infoEl = app.querySelector('#chordInfo');
    if (nameEl) nameEl.textContent = label;
    if (romEl)  romEl.textContent = chord.r || '';
    const typeEl = app.querySelector('#chordTypeName');
    if (typeEl) typeEl.textContent = progChordInversion(label, chord.q);
    const kbLabelEl = app.querySelector('#kbChordLabel');
    if (kbLabelEl) kbLabelEl.textContent = getChordInversionName(label, chord.q, midis);
    if (infoEl) infoEl.textContent = midis.map(m => midiName(m).replace(/\d+/,'')).join(' – ');
    const notEl = app.querySelector('#chordNotation');
    if (notEl) notEl.innerHTML = chordNotationSVG(midis);
    if (pillsEl) {
      pillsEl.querySelectorAll('.pp').forEach((el,i) => {
        const col = pillColor(prog.chords[i].r);
        const active = i===curIdx;
        el.style.background = active ? col+'22' : '';
        el.style.color = col;
        el.style.border = `2px solid ${active ? col : col+'66'}`;
        el.style.boxShadow = active ? `0 0 0 3px ${col}44` : '';
        el.style.fontWeight = '800';
      });
    }
    if (kb) {
      kb.setTargets([]);
      kb.setHint([]);
      colorKbChord(midis, pillColor(chord.r));
    }
    // Play the chord tones
    unlockAudio();
    midis.forEach((m,i) => setTimeout(()=>playNote(m,{voice:settings.voice,volume:settings.volume/100}), i*30));
  };

  const advance = (dir=1) => {
    curIdx = (curIdx + dir + prog.chords.length) % prog.chords.length;
    render();
  };

  const startAuto = () => {
    autoPlaying = true;
    app.querySelector('#autoBtn').innerHTML = icon('pause')+' Stop';
    const ms = Math.round(60000/bpm)*2;
    autoTimer = setInterval(()=>{ curIdx = (curIdx + 1) % prog.chords.length; renderWithImprov(); }, ms);
  };
  const stopAuto = () => {
    autoPlaying = false;
    clearInterval(autoTimer);
    const btn = app.querySelector('#autoBtn');
    if (btn) btn.innerHTML = icon('play')+' Auto';
  };

  // Consistent color per roman numeral root (same chord = same color)
  const CHORD_PILL_COLOR = {
    'I':'#ef4444','I7':'#ef4444','Imaj7':'#ef4444',
    'ii':'#8b5cf6','ii7':'#8b5cf6','iim7':'#8b5cf6',
    'iii':'#f59e0b','iii7':'#f59e0b',
    'IV':'#3b82f6','IV7':'#3b82f6','IVmaj7':'#3b82f6',
    'V':'#22c55e','V7':'#22c55e',
    'vi':'#f97316','vi7':'#f97316',
    'vii':'#ec4899',
    'i':'#ef4444','im7':'#ef4444','iv':'#3b82f6','ivm7':'#3b82f6','v':'#22c55e',
    '♭VII':'#0891b2','♭VII7':'#0891b2','VII':'#0891b2',
    '♭VI':'#d97706','♭VImaj7':'#d97706','VI':'#d97706','VI7':'#d97706',
    '♭III':'#7c3aed','♭III7':'#7c3aed','III':'#7c3aed',
    'II7':'#059669','ii°':'#6b7280',
  };
  const pillColor = (r) => {
    if (!r) return '#6b7280';
    const base = r.replace(/\s.*/,''); // strip trailing info
    return CHORD_PILL_COLOR[base] || '#6b7280';
  };
  const buildChordList = () => prog.chords.map((c,i)=>{
    const col = pillColor(c.r);
    const active = i===curIdx;
    return `<button class="pp chip" data-i="${i}" style="background:${active?col:''}22;color:${col};border:2px solid ${active?col:col+'66'};font-weight:800;${active?'box-shadow:0 0 0 3px '+col+'44':''}">${c.r}</button>`;
  }).join('');

  app.innerHTML = `<section class="view">
    <div class="top"><a class="iconbtn" href="#/progressions">${icon('back')}</a><h1 style="font-size:15px">${prog.name}</h1><div style="display:flex;gap:4px;align-items:center">${voicePicker()}${sustainBtn()}</div></div>

    <div class="card pad" style="display:flex;align-items:center;gap:10px;padding:10px 14px">
      <div style="font-size:11px;font-weight:700;opacity:.6;text-transform:uppercase;letter-spacing:.5px;flex:none">Key</div>
      <div style="display:flex;gap:4px;flex-wrap:wrap;flex:1">
        ${KEY_NAMES_PROG.map(k=>`<button class="chip ${k===keyName?'on':''}" data-key="${k}" style="padding:3px 9px;font-size:12px">${k}</button>`).join('')}
      </div>
    </div>

    <div style="text-align:center;padding:16px 16px;background:var(--card);border-radius:18px;margin:0 0 10px">
      <div id="curRoman" style="font-size:13px;font-weight:700;color:var(--p);opacity:.8;margin-bottom:2px">${prog.chords[0].r}</div>
      <div style="display:flex;align-items:center;justify-content:center;gap:10px">
        <div id="chordNotation" style="flex-shrink:0">${chordNotationSVG(progChordMidis(keyMidi,prog.chords[0].s,prog.chords[0].q))}</div>
        <div>
          <div id="curChordName" style="font-size:52px;font-weight:900;line-height:1;color:var(--ink)">${progChordLabel(keyMidi,prog.chords[0].s,prog.chords[0].q)}</div>
          <div id="chordTypeName" style="font-size:14px;font-weight:700;color:var(--p);margin-top:2px">${progChordInversion(progChordLabel(keyMidi,prog.chords[0].s,prog.chords[0].q),prog.chords[0].q)}</div>
          <div id="chordInfo" style="font-size:13px;opacity:.5;margin-top:2px">${progChordMidis(keyMidi,prog.chords[0].s,prog.chords[0].q).map(m=>midiName(m).replace(/\d+/,'')).join(' – ')}</div>
        </div>
      </div>
    </div>

    <div class="chips" id="progPills" style="justify-content:center;flex-wrap:wrap;padding:0 0 8px">${buildChordList()}</div>

    <div style="display:flex;gap:8px;align-items:center;padding:0 0 10px">
      <button class="btn sm" id="prevBtn">${icon('arrowL')} Prev</button>
      <button class="btn" id="autoBtn" style="flex:1">${icon('play')} Auto</button>
      <button class="btn sm" id="nextBtn">Next ${icon('arrowR')}</button>
    </div>

    <div class="card pad" style="display:flex;align-items:center;gap:12px;padding:10px 14px">
      <div style="font-size:11px;font-weight:700;opacity:.6;text-transform:uppercase;letter-spacing:.5px;white-space:nowrap">BPM</div>
      <input type="range" min="40" max="160" value="${bpm}" id="bpmSlider" style="flex:1;accent-color:var(--p)">
      <b id="bpmVal" style="min-width:36px;text-align:right;font-size:14px">${bpm}</b>
    </div>

    <div id="improvPanel" style="margin:10px 0"></div>
    <div class="kb-dock">
      <div id="kbChordLabel" style="text-align:center;padding:6px 0 3px;font-size:16px;font-weight:800;color:var(--ink);letter-spacing:.3px">${getChordInversionName(progChordLabel(keyMidi,prog.chords[0].s,prog.chords[0].q),prog.chords[0].q,progChordMidis(keyMidi,prog.chords[0].s,prog.chords[0].q))}</div>
      <div class="kb" id="kb"></div>
    </div>
  </section>`;

  const renderImprov = (currentChordMidis) => {
    const t = getImprovTips(keyName, prog);
    const npanel = app.querySelector('#improvPanel');
    if (!npanel) return;
    const NC = { C:'#ef4444',D:'#f97316',E:'#eab308',F:'#22c55e',G:'#06b6d4',A:'#3b82f6',B:'#8b5cf6' };
    const nc = (n) => NC[n.charAt(0)] || 'var(--p)';
    const NOTE_MIDI5 = {C:72,'C#':73,D:74,'D#':75,E:76,F:77,'F#':78,G:79,'G#':80,A:81,'A#':82,B:83};
    const noteChip = (n, label='', highlight=false) => {
      const col = nc(n);
      const midi = NOTE_MIDI5[n] ?? 72;
      return `<div style="display:flex;flex-direction:column;align-items:center;gap:2px">
        <button data-play-midi="${midi}" style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;background:${highlight?col:col+'22'};color:${highlight?'#fff':col};font-weight:900;font-size:13px;border:2px solid ${col}${highlight?'':'66'};cursor:pointer;padding:0;outline:none">${n}</button>
        ${label?`<span style="font-size:9px;color:var(--muted);text-align:center;line-height:1.1;max-width:36px">${label}</span>`:''}
      </div>`;
    };

    // Scale degrees row
    const degRow = t.degrees.map(d => noteChip(d.n, d.deg, t.chordTones?.includes(d.n))).join('');

    // Chord tones chips — use actual current chord midis if available
    const NOTE_SEQ_R = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    const liveChordNames = currentChordMidis ? [...new Set(currentChordMidis.map(m => NOTE_SEQ_R[m%12]))] : (t.chordTones||[]);
    const ctRow = liveChordNames.map(n => { const midi = NOTE_MIDI5[n] ?? 72; return `<button data-play-midi="${midi}" style="padding:6px 14px;border-radius:12px;background:${nc(n)};color:#fff;font-weight:900;font-size:14px;border:none;cursor:pointer;outline:none">${n}</button>`; }).join('');

    // Patterns list
    const patList = (t.patterns||[]).map(p=>`<li style="margin-bottom:4px;font-size:12.5px">${p}</li>`).join('');

    // Mini one-octave keyboard showing chord tones
    const chordPcs = new Set((currentChordMidis||[]).map(m => m % 12));
    const wKeys = [{m:0,i:0},{m:2,i:1},{m:4,i:2},{m:5,i:3},{m:7,i:4},{m:9,i:5},{m:11,i:6}];
    const bKeys = [{m:1,x:13},{m:3,x:31},{m:6,x:67},{m:8,x:85},{m:10,x:103}];
    const mkW = (m,i) => `<rect x="${i*18+1}" y="1" width="16" height="57" rx="2" fill="${chordPcs.has(m)?'var(--p)':'white'}" stroke="#ccc" stroke-width="0.5"/>`;
    const mkB = ({m,x}) => `<rect x="${x}" y="1" width="11" height="38" rx="1.5" fill="${chordPcs.has(m)?'#0d9488':'#222'}"/>`;
    const miniKb = `<svg width="126" height="60" viewBox="0 0 126 60" style="border-radius:6px;overflow:hidden;border:1px solid #ddd;flex-shrink:0">${wKeys.map(({m,i})=>mkW(m,i)).join('')}${bKeys.map(mkB).join('')}</svg>`;

    npanel.innerHTML = `<div class="card pad" style="padding:14px">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:20px">🎹</span>
          <div><b style="font-size:14px;display:block">Improvisation Guide</b><span style="font-size:11px;color:var(--muted)">${t.name} · Key of ${keyName}</span></div>
        </div>
        ${miniKb}
      </div>

      <div style="margin-bottom:12px;padding:10px;background:var(--p)11;border-radius:10px;border:1.5px solid var(--p)33">
        <div style="font-size:11px;font-weight:700;color:var(--p);margin-bottom:6px">🎯 Best notes for this chord</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:4px">${ctRow}</div>
        <div style="font-size:11px;color:var(--muted)">These chord tones are highlighted on the keyboard</div>
      </div>

      <div style="margin-bottom:12px">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--muted);margin-bottom:8px">Full scale — ● = chord tones (lit on keyboard)</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">${degRow}</div>
      </div>

      <div style="margin-bottom:12px;padding:10px 12px;background:var(--bg);border-radius:10px;border-left:3px solid var(--p)">
        <div style="font-size:11px;font-weight:700;color:var(--p);margin-bottom:4px">🎓 Theory</div>
        <div style="font-size:12.5px;line-height:1.6;color:var(--ink)">${t.theory}</div>
      </div>

      <div style="margin-bottom:10px">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--muted);margin-bottom:6px">🔥 Patterns to try</div>
        <ul style="margin:0;padding-left:16px;color:var(--ink)">${patList}</ul>
      </div>

      <div style="font-size:11px;padding:6px 10px;background:var(--bad)18;border-radius:8px;color:var(--bad)">
        ⚠️ ${t.avoid}
      </div>
    </div>`;
  };

  let kb = null;
  const onPress = (m) => { unlockAudio(); playNote(m,{voice:settings.voice,volume:settings.volume/100}); };
  kb = createKeyboard(app.querySelector('#kb'),{low:48,high:84,labels:true,nameSystem:settings.nameSystem,onPress});
  const renderWithImprov = () => {
    render();
    const chord = prog.chords[curIdx];
    renderImprov(progChordMidis(keyMidi, chord.s, chord.q));
  };
  renderWithImprov();

  // Key selector
  app.querySelector('.card').onclick = (e) => {
    const k = e.target.closest('[data-key]')?.dataset.key;
    if (!k) return;
    keyName=k; keyMidi=KEY_ROOT_MIDI[k];
    app.querySelectorAll('[data-key]').forEach(b=>b.classList.toggle('on',b.dataset.key===k));
    renderWithImprov();
  };

  // Pill selector
  app.querySelector('#progPills').onclick = (e) => {
    const i = e.target.closest('[data-i]')?.dataset.i;
    if (i!=null){curIdx=Number(i);renderWithImprov();}
  };

  // Auto advance also re-renders improv panel
  const origAdvance = advance;
  const advanceWithImprov = (dir=1) => { curIdx = (curIdx + dir + prog.chords.length) % prog.chords.length; renderWithImprov(); };

  app.querySelector('#prevBtn').onclick=()=>{stopAuto();advanceWithImprov(-1);};
  app.querySelector('#nextBtn').onclick=()=>{stopAuto();advanceWithImprov(1);};
  app.querySelector('#autoBtn').onclick=()=>autoPlaying?stopAuto():startAuto();
  app.querySelector('#bpmSlider').oninput=(e)=>{
    bpm=Number(e.target.value);
    app.querySelector('#bpmVal').textContent=bpm;
    if(autoPlaying){stopAuto();startAuto();}
  };
  app.querySelector('#voicePick')?.addEventListener('change',(e)=>setSetting('voice',e.target.value));
  // Sustain — delegated so it survives re-renders of the top bar
  app.addEventListener('click',(e)=>{
    if(e.target.closest('#sustainBtn')){
      setSustain(!getSustain());
      app.querySelectorAll('#sustainBtn').forEach(b=>b.classList.toggle('on',getSustain()));
    }
    const midi = Number(e.target.closest('[data-play-midi]')?.dataset.playMidi);
    if(midi){ unlockAudio(); playNote(midi,{voice:settings.voice,volume:settings.volume/100,duration:0.5}); }
  });

  cleanup=()=>{stopAuto();kb?.destroy();};
};

// --- Chord Speller quiz ---
views.quizChord = (params) => {
  setNav('practice-run');
  const level = params.get('level') || 'easy';
  const CHORDS = {
    easy: [
      { name: 'C Major', notes: [60,64,67] }, { name: 'G Major', notes: [67,71,74] },
      { name: 'F Major', notes: [65,69,72] }, { name: 'A Minor', notes: [69,72,76] },
      { name: 'D Minor', notes: [62,65,69] }, { name: 'E Minor', notes: [64,67,71] },
    ],
    medium: [
      { name: 'C Major', notes: [60,64,67] }, { name: 'D Major', notes: [62,66,69] },
      { name: 'E Major', notes: [64,68,71] }, { name: 'F Major', notes: [65,69,72] },
      { name: 'G Major', notes: [67,71,74] }, { name: 'A Major', notes: [69,73,76] },
      { name: 'B Major', notes: [71,75,78] }, { name: 'A Minor', notes: [69,72,76] },
      { name: 'D Minor', notes: [62,65,69] }, { name: 'E Minor', notes: [64,67,71] },
      { name: 'C7', notes: [60,64,67,70] }, { name: 'G7', notes: [67,71,74,77] },
    ],
    hard: [
      { name: 'C Major', notes: [60,64,67] }, { name: 'C# Major', notes: [61,65,68] },
      { name: 'D Major', notes: [62,66,69] }, { name: 'Eb Major', notes: [63,67,70] },
      { name: 'E Major', notes: [64,68,71] }, { name: 'F Major', notes: [65,69,72] },
      { name: 'F# Major', notes: [66,70,73] }, { name: 'G Major', notes: [67,71,74] },
      { name: 'Ab Major', notes: [68,72,75] }, { name: 'A Major', notes: [69,73,76] },
      { name: 'Bb Major', notes: [70,74,77] }, { name: 'B Major', notes: [71,75,78] },
      { name: 'A Minor', notes: [69,72,76] }, { name: 'D Minor', notes: [62,65,69] },
      { name: 'Cmaj7', notes: [60,64,67,71] }, { name: 'Dm7', notes: [62,65,69,72] },
    ],
  };
  const pool = CHORDS[level] || CHORDS.easy;
  const st = { n: 0, right: 0, streak: 0, best: load('np.quiz.chord', 0), target: null, held: new Set() };
  app.innerHTML = `<section class="view">
    <div class="top"><a class="iconbtn" href="#/practice">${icon('back')}</a><h1>Chord Speller</h1>${voicePicker()}</div>
    <div class="chips" id="lv" style="padding-top:0">${['easy','medium','hard'].map((l)=>`<a class="chip ${l===level?'on':''}" href="#/quiz/chord?level=${l}">${l[0].toUpperCase()+l.slice(1)}</a>`).join('')}</div>
    <div class="stats"><div class="card stat"><b id="sc">0/0</b><span>Correct</span></div><div class="card stat"><b id="sk">0🔥</b><span>Streak</span></div><div class="card stat"><b>${st.best}</b><span>Best</span></div></div>
    <div class="card pad" style="margin-top:12px;text-align:center;min-height:120px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px">
      <div id="chordName" style="font-size:36px;font-weight:900;color:var(--p)">—</div>
      <div id="chordHeld" style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;min-height:28px"></div>
      <div class="muted" id="qmsg" style="font-size:13px">Play all notes of the chord shown above</div>
    </div>
    <div class="kb-dock"><div class="kb" id="kb"></div></div>
  </section>`;
  const $q = (s) => app.querySelector(s);
  const next = () => {
    let c; do { c = pool[Math.floor(Math.random()*pool.length)]; } while (c===st.target && pool.length>1);
    st.target = c; st.held.clear();
    $q('#chordName').textContent = c.name;
    $q('#chordHeld').innerHTML = c.notes.map(()=>`<span style="width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,.12);border:2px solid rgba(255,255,255,.2)"></span>`).join('');
    $q('#qmsg').textContent = `Play ${c.notes.length} notes`;
  };
  const onPress = (m) => {
    unlockAudio(); playNote(m, { voice: settings.voice, volume: settings.volume/100 });
    if (!st.target) return;
    if (st.target.notes.includes(m)) {
      st.held.add(m);
      const dots = $q('#chordHeld').querySelectorAll('span');
      const idx = st.target.notes.indexOf(m);
      if (dots[idx]) dots[idx].style.cssText='width:28px;height:28px;border-radius:50%;background:var(--ok);border:2px solid var(--ok)';
      if (st.target.notes.every(n=>st.held.has(n))) {
        st.right++; st.streak++; st.n++;
        if (st.streak>st.best){st.best=st.streak;save('np.quiz.chord',st.best);}
        $q('#sc').textContent=`${st.right}/${st.n}`; $q('#sk').textContent=`${st.streak}🔥`;
        $q('#qmsg').innerHTML=`<b style="color:var(--ok)">✓ ${st.target.name}!</b>`;
        setTimeout(next,800);
      }
    } else {
      st.streak=0; kb.flash(m,'wrong');
      $q('#qmsg').innerHTML=`<b style="color:var(--bad)">✗ Not in ${st.target.name}</b>`;
    }
  };
  const kb = createKeyboard($q('#kb'),{low:48,high:84,labels:false,nameSystem:settings.nameSystem,onPress});
  next();
  cleanup=()=>kb.destroy();
};

// --- Interval Ear quiz ---
views.quizInterval = (params) => {
  setNav('practice-run');
  const level = params.get('level') || 'easy';
  const INTERVALS = [
    {name:'Unison',semi:0},{name:'Minor 2nd',semi:1},{name:'Major 2nd',semi:2},
    {name:'Minor 3rd',semi:3},{name:'Major 3rd',semi:4},{name:'Perfect 4th',semi:5},
    {name:'Tritone',semi:6},{name:'Perfect 5th',semi:7},{name:'Minor 6th',semi:8},
    {name:'Major 6th',semi:9},{name:'Minor 7th',semi:10},{name:'Major 7th',semi:11},{name:'Octave',semi:12},
  ];
  const POOLS = { easy:[2,4,5,7,12], medium:[2,3,4,5,7,9,12], hard:[0,1,2,3,4,5,6,7,8,9,10,11,12] };
  const pool = POOLS[level];
  const st = { n:0, right:0, streak:0, best:load('np.quiz.interval',0), root:0, semi:0 };
  const byName = Object.fromEntries(INTERVALS.map(i=>[i.name,i]));
  const render = () => {
    const choices = [...new Set([st.semi,...pool.filter(s=>s!==st.semi).sort(()=>Math.random()-.5).slice(0,3)])].sort(()=>Math.random()-.5);
    $q('#choices').innerHTML = choices.map(s=>{
      const iv=INTERVALS.find(i=>i.semi===s);
      return `<button class="btn sm" data-semi="${s}" style="flex:1 1 45%">${iv?.name||s}</button>`;
    }).join('');
  };
  app.innerHTML = `<section class="view">
    <div class="top"><a class="iconbtn" href="#/practice">${icon('back')}</a><h1>Interval Ear</h1><span style="width:42px"></span></div>
    <div class="chips" id="lv" style="padding-top:0">${['easy','medium','hard'].map((l)=>`<a class="chip ${l===level?'on':''}" href="#/quiz/interval?level=${l}">${l[0].toUpperCase()+l.slice(1)}</a>`).join('')}</div>
    <div class="stats"><div class="card stat"><b id="sc">0/0</b><span>Correct</span></div><div class="card stat"><b id="sk">0🔥</b><span>Streak</span></div><div class="card stat"><b>${st.best}</b><span>Best</span></div></div>
    <div class="card pad" style="margin-top:12px;text-align:center">
      <button class="btn" id="hear" style="margin:12px auto">▶ Play the interval</button>
      <div class="muted" id="qmsg" style="margin:10px 0">Listen and identify the interval</div>
      <div id="choices" style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:8px"></div>
    </div>
  </section>`;
  const $q = (s) => app.querySelector(s);
  const playInterval = () => {
    unlockAudio();
    playNote(st.root,{voice:settings.voice,volume:settings.volume/100});
    setTimeout(()=>playNote(st.root+st.semi,{voice:settings.voice,volume:settings.volume/100}),450);
  };
  const next = () => {
    st.root = 48+Math.floor(Math.random()*24);
    st.semi = pool[Math.floor(Math.random()*pool.length)];
    $q('#qmsg').textContent='Listen and identify the interval';
    render(); playInterval();
  };
  $q('#hear').onclick=()=>{ if(!st.semi&&st.semi!==0) next(); else playInterval(); };
  $q('#choices').onclick=(e)=>{
    const btn=e.target.closest('[data-semi]'); if(!btn) return;
    const picked=Number(btn.dataset.semi);
    if(picked===st.semi){
      st.right++;st.streak++;st.n++;
      if(st.streak>st.best){st.best=st.streak;save('np.quiz.interval',st.best);}
      $q('#sc').textContent=`${st.right}/${st.n}`; $q('#sk').textContent=`${st.streak}🔥`;
      btn.style.background='var(--ok)'; btn.style.color='#fff';
      $q('#qmsg').innerHTML=`<b style="color:var(--ok)">✓ ${INTERVALS.find(i=>i.semi===st.semi)?.name}!</b>`;
      setTimeout(next,900);
    } else {
      st.streak=0; btn.style.background='var(--bad)'; btn.style.color='#fff';
      $q('#qmsg').innerHTML=`<b style="color:var(--bad)">✗ That was ${INTERVALS.find(i=>i.semi===st.semi)?.name}</b>`;
    }
  };
  $q('#hear').click();
};

// --- Black Key Drill (ear training, accidentals only) ---
views.quizBlack = (params) => {
  setNav('practice-run');
  const level = params.get('level') || 'easy';
  const BLACK_POOLS = {
    easy:  [61,63,66,68,70],
    medium:[61,63,66,68,70,73,75,78,80,82],
    hard:  [49,51,54,56,58,61,63,66,68,70,73,75,78,80,82],
  };
  const pool = BLACK_POOLS[level];
  const st = { n:0, right:0, streak:0, best:load('np.quiz.black',0), target:0, tries:0 };
  app.innerHTML = `<section class="view">
    <div class="top"><a class="iconbtn" href="#/practice">${icon('back')}</a><h1>Black Key Drill</h1>${voicePicker()}</div>
    <div class="chips" id="lv" style="padding-top:0">${['easy','medium','hard'].map((l)=>`<a class="chip ${l===level?'on':''}" href="#/quiz/black?level=${l}">${l[0].toUpperCase()+l.slice(1)}</a>`).join('')}</div>
    <div class="stats"><div class="card stat"><b id="sc">0/0</b><span>Correct</span></div><div class="card stat"><b id="sk">0🔥</b><span>Streak</span></div><div class="card stat"><b>${st.best}</b><span>Best</span></div></div>
    <div class="card score-wrap" style="margin-top:12px;text-align:center">
      <button class="btn" id="hear" style="margin:26px auto">🖤 Play the note</button>
      <div class="muted" id="qmsg" style="padding-bottom:10px">Find the black key you heard</div>
    </div>
    <div class="kb-dock"><div class="kb" id="kb"></div></div>
  </section>`;
  const $q = (s) => app.querySelector(s);
  const next = () => {
    let m; do { m=pool[Math.floor(Math.random()*pool.length)]; } while(m===st.target&&pool.length>1);
    st.target=m; st.tries=0;
    unlockAudio(); playNote(m,{voice:settings.voice,volume:settings.volume/100});
    $q('#qmsg').textContent='Which black key was that?';
  };
  const onPress = (m) => {
    unlockAudio(); playNote(m,{voice:settings.voice,volume:settings.volume/100});
    if(!st.target) return;
    if(m===st.target){
      if(st.tries===0){st.right++;st.streak++;}else st.streak=0;
      st.n++;
      if(st.streak>st.best){st.best=st.streak;save('np.quiz.black',st.best);}
      kb.flash(m,'good',500);
      $q('#sc').textContent=`${st.right}/${st.n}`; $q('#sk').textContent=`${st.streak}🔥`;
      $q('#qmsg').innerHTML=`<b style="color:var(--ok)">✓ ${labelFor(midiName(m),settings.nameSystem)}</b>`;
      setTimeout(next,700);
    } else {
      st.tries++; kb.flash(m,'wrong');
      $q('#qmsg').innerHTML=`<b style="color:var(--bad)">✗ That was ${labelFor(midiName(m),settings.nameSystem)}</b>${st.tries>=2?` — it's ${labelFor(midiName(st.target),settings.nameSystem)}`:''}`;
      if(st.tries>=2) kb.setTargets([st.target]);
    }
  };
  const kb = createKeyboard($q('#kb'),{low:Math.min(...pool)-1,high:Math.max(...pool)+1,labels:false,nameSystem:settings.nameSystem,onPress});
  $q('#hear').onclick=()=>{ if(!st.target) next(); else { unlockAudio(); playNote(st.target,{voice:settings.voice,volume:settings.volume/100}); }};
  $q('#hear').click();
  cleanup=()=>kb.destroy();
};

views.quiz = (params, kind) => {
  setNav('practice-run');
  const ear = kind === 'ear';
  const level = params.get('level') || 'easy';
  const POOLS = {
    easy: [60, 62, 64, 65, 67, 69, 71, 72],
    medium: [48, 50, 52, 53, 55, 57, 59, 60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79],
    hard: Array.from({ length: 37 }, (_, i) => 43 + i),
  };
  const pool = POOLS[level];
  const st = { n: 0, right: 0, streak: 0, best: load(`np.quiz.${kind}`, 0), target: 0, tries: 0, t0: 0 };
  app.innerHTML = `<section class="view">
    <div class="top"><a class="iconbtn" href="#/practice">${icon('back')}</a><h1>${ear ? 'Ear Training' : 'Note Reading'}</h1>${voicePicker()}</div>
    <div class="chips" id="lv" style="padding-top:0">${['easy', 'medium', 'hard'].map((l) => `<a class="chip ${l === level ? 'on' : ''}" href="#/quiz/${kind}?level=${l}">${l[0].toUpperCase() + l.slice(1)}</a>`).join('')}</div>
    <div class="stats"><div class="card stat"><b id="sc">0/0</b><span>Correct</span></div><div class="card stat"><b id="sk">0🔥</b><span>Streak</span></div><div class="card stat"><b>${st.best}</b><span>Best streak</span></div></div>
    <div class="card score-wrap" style="margin-top:12px;text-align:center">
      ${ear ? `<button class="btn" id="hear" style="margin:26px auto">${icon('ear')} Play the note again</button>` : '<div class="score" id="score" style="max-width:340px;margin:0 auto"></div>'}
      <div class="muted" id="qmsg" style="padding-bottom:10px">${ear ? 'Listen, then find the note on the keyboard' : 'Which note is this? Play it on the keyboard'}</div>
    </div>
    <div class="kb-dock"><div class="kb" id="kb"></div></div>
  </section>`;
  const $ = (s) => app.querySelector(s);
  const qSong = (m) => {
    const name = midiName(m);
    const pitch = name.replace('#', '#');
    const clef = m < 60 ? 'lh' : 'rh';
    return { id: 'q', title: '', key: 'C', time: '4/4', bpm: 80, rh: clef === 'rh' ? `${pitch}/w` : 'r/w', lh: clef === 'lh' ? `${pitch}/w` : 'r/w' };
  };
  const next = () => {
    let m;
    do { m = pool[Math.floor(Math.random() * pool.length)]; } while (m === st.target && pool.length > 1);
    st.target = m; st.tries = 0;
    if (ear) { unlockAudio(); playNote(m, { voice: settings.voice, volume: settings.volume / 100 }); }
    else renderScore($('#score'), parseSong(qSong(m)), { showNames: false, showChords: false });
    $('#qmsg').textContent = ear ? 'Which note did you hear?' : 'Which note is this?';
  };
  const onPress = (m) => {
    unlockAudio();
    playNote(m, { voice: settings.voice, volume: settings.volume / 100 });
    if (!st.target) return;
    if (m === st.target) {
      if (st.tries === 0) { st.right++; st.streak++; } else st.streak = 0;
      st.n++;
      if (st.streak > st.best) { st.best = st.streak; save(`np.quiz.${kind}`, st.best); }
      kb.flash(m, 'good', 500);
      $('#qmsg').innerHTML = `<b style="color:var(--ok)">✓ ${labelFor(midiName(m), settings.nameSystem)}</b>`;
      $('#sc').textContent = `${st.right}/${st.n}`;
      $('#sk').textContent = `${st.streak}🔥`;
      setTimeout(next, 700);
    } else {
      st.tries++;
      kb.flash(m, 'wrong');
      $('#qmsg').innerHTML = `<b style="color:var(--bad)">✗ That was ${labelFor(midiName(m), settings.nameSystem)}</b>${st.tries >= 2 ? ` — it’s ${labelFor(midiName(st.target), settings.nameSystem)}` : ''}`;
      if (st.tries >= 2) kb.setTargets([st.target]);
    }
  };
  const kb = createKeyboard($('#kb'), { low: Math.min(...pool), high: Math.max(...pool), labels: false, nameSystem: settings.nameSystem, onPress });
  const _set = kb.setTargets.bind(kb);
  kb.setTargets = (ms) => { _set(ms); if (ms.length) setTimeout(() => _set([]), 900); };
  if (ear) $('#hear').onclick = () => { unlockAudio(); playNote(st.target, { voice: settings.voice, volume: settings.volume / 100 }); };
  // Ear training needs a tap first so the browser allows sound.
  if (ear) { $('#qmsg').textContent = 'Tap “Play the note” to start'; $('#hear').onclick = () => { if (!st.target) next(); else playNote(st.target, { voice: settings.voice, volume: settings.volume / 100 }); }; }
  else next();
  cleanup = () => kb.destroy();
};

/* ---------- scan view ---------- */
views.scan = () => {
  setNav('practice-run');
  const serverUrl = load('np.omrServer', '');
  let scannedSong = null;

  app.innerHTML = `<section class="view">
    <div class="top"><a class="iconbtn" href="javascript:history.back()">${icon('back')}</a><h1>Scan Sheet Music</h1></div>
    <div class="card group" style="margin-top:12px">
      <h4>${icon('scan')} How it works</h4>
      <div class="muted" style="font-size:13px;line-height:1.6">
        Take a photo or upload a PDF of printed sheet music. It gets sent to your OMR server, recognised, and loaded as a playable song.
        <br><br>
        <b>Need a server?</b> Deploy the <code>server/</code> folder to <a href="https://render.com" target="_blank" style="color:var(--p)">Render.com</a> for free, then paste the URL below.
      </div>
    </div>
    <div class="card group">
      <h4>Server URL</h4>
      <input id="srv" type="url" placeholder="https://your-app.onrender.com"
        value="${esc(serverUrl)}"
        style="width:100%;box-sizing:border-box;border:1px solid var(--line);background:var(--solid);border-radius:12px;height:42px;padding:0 14px;font-size:14px;margin-top:6px">
      <div class="muted" style="font-size:12px;margin-top:6px">Saved automatically. Leave blank if running locally on port 8000.</div>
    </div>
    <div class="seg" id="importTabs" style="margin:0 0 10px">
      <button data-tab="xml" class="on">MusicXML</button>
      <button data-tab="scan">Scan / Photo</button>
    </div>
    <div id="xmlPane">
      <div class="card group" id="dropzoneXml" style="cursor:pointer;border:2px dashed var(--line);text-align:center;padding:32px 16px;transition:border-color .2s">
        ${icon('upload')}
        <div style="font-size:16px;font-weight:700;margin:10px 0 4px">Drop MusicXML file here</div>
        <div class="muted" style="font-size:13px">or tap to choose file</div>
        <div class="muted" style="font-size:12px;margin-top:6px">.xml · exported from MuseScore, Finale, Sibelius</div>
        <input id="fileXml" type="file" accept=".xml,application/xml,text/xml" style="display:none">
      </div>
    </div>
    <div id="scanPane" style="display:none">
      <div style="display:flex;gap:10px;margin-bottom:10px">
        <button id="btnCamera" class="btn block" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px">${icon('scan')} Camera</button>
        <button id="btnFile" class="btn block" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px">${icon('upload')} File / PDF</button>
      </div>
      <div class="card group" id="dropzone" style="cursor:pointer;border:2px dashed var(--line);text-align:center;padding:24px 16px;transition:border-color .2s">
        ${icon('upload')}
        <div style="font-size:15px;font-weight:700;margin:8px 0 3px">Drop image or PDF here</div>
        <div class="muted" style="font-size:12px">JPG · PNG · PDF · requires OMR server URL above</div>
      </div>
      <input id="fileCamera" type="file" accept="image/*" capture="environment" style="display:none">
      <input id="file" type="file" accept="image/*,.pdf" style="display:none">
    </div>
    <div id="status" style="display:none" class="card group" style="padding:16px">
      <div id="stmsg" style="text-align:center;font-size:14px;font-weight:600;margin-bottom:10px"></div>
      <div id="progWrap" style="display:none;background:var(--line);border-radius:99px;height:8px;overflow:hidden;margin-bottom:6px">
        <div id="progBar" style="height:100%;width:0%;background:var(--p);border-radius:99px;transition:width .4s ease"></div>
      </div>
      <div id="progLabel" style="display:none;text-align:center;font-size:12px;color:var(--muted)"></div>
    </div>
    <div id="result" style="display:none">
      <div class="card score-wrap" style="margin-top:12px"><div class="score" id="preview"></div></div>
      <div style="margin-top:14px">
        <a class="btn block" id="loadBtn" href="#" style="font-size:17px;padding:16px;background:var(--p);color:#fff;border-radius:16px;text-align:center;display:flex;align-items:center;justify-content:center;gap:8px;text-decoration:none;font-weight:700">
          ${icon('play')} Proceed — Load &amp; Play
        </a>
      </div>
    </div>
  </section>`;

  const $ = (s) => app.querySelector(s);
  const status = $('#status');
  const stmsg = $('#stmsg');
  const result = $('#result');

  // Tab switching
  $('#importTabs').onclick = (e) => {
    const tab = e.target.dataset.tab; if (!tab) return;
    $('#importTabs').querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
    $('#xmlPane').style.display = tab === 'xml' ? '' : 'none';
    $('#scanPane').style.display = tab === 'scan' ? '' : 'none';
  };

  $('#srv').onchange = (e) => { save('np.omrServer', e.target.value.trim()); };

  // MusicXML direct import
  const loadXML = (xmlText) => {
    try {
      setStatus('Parsing MusicXML…');
      scannedSong = parseMusicXML(xmlText);
      renderScore($('#preview'), parseSong(scannedSong), scoreOpts());
      result.style.display = '';
      setStatus(`✓ "${scannedSong.title}" · ${scannedSong.rh.split('|').length} bars · ${scannedSong.key} ${scannedSong.time}`);
      $('#dropzoneXml').style.borderColor = 'var(--ok)';
    } catch (e) {
      setStatus('Parse error: ' + e.message);
      $('#dropzoneXml').style.borderColor = 'var(--bad)';
    }
  };
  const dz = $('#dropzone');
  const fileInput = $('#file');
  const cameraInput = $('#fileCamera');
  const dzXml = $('#dropzoneXml');
  const fileXml = $('#fileXml');
  dzXml.onclick = () => fileXml.click();
  fileXml.onchange = (e) => { const f = e.target.files[0]; if (!f) return; f.text().then(loadXML); };
  dzXml.ondragover = (e) => { e.preventDefault(); dzXml.style.borderColor = 'var(--p)'; };
  dzXml.ondragleave = () => { dzXml.style.borderColor = 'var(--line)'; };
  dzXml.ondrop = (e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) f.text().then(loadXML); };

  const progBar = $('#progBar');
  const progWrap = $('#progWrap');
  const progLabel = $('#progLabel');

  const setStatus = (msg, show = true) => {
    status.style.display = show ? '' : 'none';
    $('#stmsg').textContent = msg;
  };

  const setProgress = (pct, label = '') => {
    progWrap.style.display = pct >= 0 ? '' : 'none';
    progLabel.style.display = label ? '' : 'none';
    progBar.style.width = pct + '%';
    progLabel.textContent = label;
  };


  const processFile = async (file) => {
    const url = ($('#srv').value.trim()).replace(/\/$/, '');
    if (!url) {
      setStatus('Enter your OMR server URL above first. Deploy the server/ folder to Render.com for free.');
      return;
    }
    result.style.display = 'none';
    dz.style.borderColor = 'var(--p)';
    setStatus('📤 Uploading…');
    setProgress(10, 'Uploading file…');

    try {
      const fd = new FormData();
      fd.append('file', file);

      // Animate progress while waiting (oemer takes a while)
      let pct = 10;
      const ticker = setInterval(() => {
        if (pct < 85) { pct += (pct < 40 ? 3 : pct < 65 ? 1.5 : 0.5); }
        const label = pct < 30 ? 'Uploading file…' : pct < 55 ? 'Recognising notes…' : pct < 75 ? 'Parsing score…' : 'Almost done…';
        setProgress(Math.round(pct), label);
      }, 800);

      let res;
      try {
        res = await fetch(`/api/scan`, { method: 'POST', body: fd });
      } catch (networkErr) {
        clearInterval(ticker);
        throw new Error('Cannot reach the OMR server. Make sure it is running: cd server && uvicorn main:app');
      }
      clearInterval(ticker);

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || 'Server error ' + res.status);
      }

      setProgress(95, 'Loading song…');
      setStatus('✅ Recognised! Parsing notes…');
      const { musicxml } = await res.json();
      scannedSong = parseMusicXML(musicxml);
      renderScore($('#preview'), parseSong(scannedSong), scoreOpts());
      setProgress(100, 'Done!');
      result.style.display = '';
      setStatus(`✅ Ready! "${scannedSong.title}" · ${scannedSong.rh.split('|').length} bars`);
      dz.style.borderColor = 'var(--ok)';
    } catch (e) {
      setProgress(-1);
      // Trim noisy server diagnostic lines (URLs, scikit warnings) from the displayed message
      const msg = e.message.split('\n')
        .filter(l => !l.startsWith('https://') && !l.startsWith('http://') && l.trim())
        .slice(-6)
        .join(' · ') || e.message;
      setStatus('❌ ' + msg);
      dz.style.borderColor = 'var(--bad)';
    }
  };

  $('#btnCamera').onclick = () => cameraInput.click();
  $('#btnFile').onclick = () => fileInput.click();
  cameraInput.onchange = (e) => { if (e.target.files[0]) processFile(e.target.files[0]); };
  dz.onclick = () => fileInput.click();
  fileInput.onchange = (e) => { if (e.target.files[0]) processFile(e.target.files[0]); };
  $('#btnCamera').onclick = () => cameraInput.click();
  $('#btnFile').onclick = () => fileInput.click();
  cameraInput.onchange = (e) => { if (e.target.files[0]) processFile(e.target.files[0]); };
  dz.ondragover = (e) => { e.preventDefault(); dz.style.borderColor = 'var(--p)'; };
  dz.ondragleave = () => { dz.style.borderColor = 'var(--line)'; };
  dz.ondrop = (e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) processFile(f); };

  $('#loadBtn').onclick = (e) => {
    e.preventDefault();
    if (!scannedSong) return;
    // Inject into SONGS array temporarily and navigate
    const existing = SONGS.findIndex((s) => s.id === scannedSong.id);
    if (existing >= 0) SONGS.splice(existing, 1);
    SONGS.unshift(scannedSong);
    location.hash = `#/song/${scannedSong.id}`;
  };
};

const bumpStreak = () => {
  const today = new Date().toDateString();
  const s = load('np.streak', { days: 0, last: '' });
  if (s.last === today) return;
  const yest = new Date(Date.now() - 864e5).toDateString();
  save('np.streak', { days: s.last === yest ? s.days + 1 : 1, last: today });
};

views.done = (params, id) => {
  const song = songById(id);
  const r = JSON.parse(sessionStorage.getItem('np.result') || 'null');
  if (!song || !r) return (location.hash = '#/home');
  setNav('done');
  const stars = r.acc >= 95 ? 3 : r.acc >= 75 ? 2 : 1;
  const idx = SONGS.indexOf(song);
  const next = SONGS.slice(idx + 1).find((s) => s.cat === song.cat) || SONGS[(idx + 1) % SONGS.length];
  const title = r.acc >= 95 ? 'Perfect!' : r.acc >= 75 ? 'Great Job!' : 'Nice effort!';
  const colors = ['#facc15', '#f472b6', '#60a5fa', '#34d399', '#a78bfa', '#fb923c'];
  const conf = Array.from({ length: 40 }, (_, i) => `<i class="confetti" style="left:${Math.random() * 100}%;background:${colors[i % 6]};animation-delay:${Math.random() * 1.5}s;animation-duration:${2.5 + Math.random() * 2}s"></i>`).join('');
  app.innerHTML = `<section class="view done-screen">${conf}
    <div><div class="trophy">🏆</div><h2>${title}</h2><div style="opacity:.75">You completed the song${r.style ? ` in ${r.style} mode` : ''}!</div>
    <div class="stars">${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}</div></div>
    <div class="card pad"><div style="display:flex;gap:12px;align-items:center;margin-bottom:14px">${thumb(song)}<div><b>${esc(song.title)}</b><div><span class="tag done" style="background:rgba(34,197,94,.2);color:#4ade80">Completed ✓</span></div></div></div>
      <div class="stats"><div class="stat"><b>${r.notes}</b><span>Notes</span></div><div class="stat"><b>${fmtTime(r.secs)}</b><span>Duration</span></div><div class="stat"><b style="color:#4ade80">${r.acc}%</b><span>Accuracy</span></div></div></div>
    <a class="btn block" href="#/practice/${id}">${icon('restart')} Play Again</a>
    <a class="btn block ghost" href="#/library" style="margin-top:10px">Back to Library</a>
    ${next ? `<a class="link" href="#/song/${next.id}" style="margin-top:16px;display:block;opacity:.85;font-weight:600">Try next song: ${esc(next.title)} →</a>` : ''}
  </section>`;
  unlockAudio();
  [72, 76, 79, 84].forEach((m, i) => playNote(m, { when: i * 0.12, voice: settings.voice, volume: settings.volume / 100 }));
};

views.settings = () => {
  setNav('settings');
  const sw = (k, label) => `<label class="row"><span>${label}</span><span class="sw"><input type="checkbox" data-k="${k}" ${settings[k] ? 'checked' : ''}><span></span></span></label>`;
  app.innerHTML = `<section class="view">
    <div class="top"><div class="brand"><span class="logo">${LOGO}</span>Settings</div>${THEME_BTN}</div>
    <div class="card group"><h4>You</h4>
      <label class="row"><span>Your name</span><input id="name" value="${esc(settings.name)}" placeholder="Optional" style="border:1px solid var(--line);background:var(--solid);border-radius:12px;height:38px;padding:0 12px;width:150px"></label></div>
    <div class="card group"><h4>Music display</h4>
      ${sw('showNames', 'Show note names on sheet')}
      ${sw('keyLabels', 'Show note names on keys')}
      ${sw('highlight', 'Highlight current note')}
      <label class="row"><span>Note names</span><select data-k="nameSystem">
        <option value="letters">Letters (C D E)</option><option value="solfege">Solfège (Do Re Mi)</option><option value="sargam">Sargam (Sa Re Ga)</option></select></label></div>
    <div class="card group"><h4>Playback</h4>
      <div class="row" style="flex-wrap:wrap;padding:8px 0"><span>Tempo</span><b id="tv">${settings.tempo}%</b><input type="range" min="40" max="150" step="5" value="${settings.tempo}" id="tempo"></div>
      <label class="row"><span>Sound</span><select data-k="voice"><option value="grand">Grand Piano</option><option value="bright">Bright Piano</option><option value="electric">Electric Piano</option><option value="soft">Soft Piano</option><option value="synth">Synth</option></select></label>
      <div class="row" style="flex-wrap:wrap;padding:8px 0"><span>Volume</span><b id="vv">${settings.volume}%</b><input type="range" min="0" max="100" step="5" value="${settings.volume}" id="vol"></div>
      ${sw('metronome', 'Metronome on by default')}
      ${sw('waitMode', 'Practice waits for the right note')}</div>
    <div class="card group"><h4>Display</h4>
      <div class="row"><span>Theme</span><div class="seg" id="mode" style="width:230px"><button data-m="light">${icon('sun')}</button><button data-m="auto">Auto</button><button data-m="dark">${icon('moon')}</button></div></div>
      <div class="themes" id="themes">${Object.entries(THEMES).map(([k, t]) => `<button class="th ${k === settings.theme ? 'on' : ''}" data-t="${k}"><i><s style="background:${t[1]}"></s><s style="background:${t[2]}"></s><s style="background:${t[5]}"></s></i>${t[0]}</button>`).join('')}</div></div>
    <div class="card group"><h4>Data</h4>
      <div class="row"><span>Songs in library</span><b>${SONGS.length}</b></div>
      <div class="row"><span>Reset progress</span><button class="btn sm ghost" id="reset">Reset</button></div>
      <div class="row muted" style="font-size:13px">Install: in Safari tap Share → Add to Home Screen. On Android tap ⋮ → Install app.</div></div>
  </section>`;
  const $ = (s) => app.querySelector(s);
  app.querySelectorAll('input[type=checkbox][data-k]').forEach((i) => { i.onchange = () => setSetting(i.dataset.k, i.checked); });
  app.querySelectorAll('select[data-k]').forEach((s) => { s.value = settings[s.dataset.k]; s.onchange = () => { setSetting(s.dataset.k, s.value); if (s.dataset.k === 'voice') { unlockAudio(); playNote(60, { voice: s.value, volume: settings.volume / 100 }); } }; });
  $('#name').onchange = (e) => setSetting('name', e.target.value.trim().slice(0, 30));
  $('#tempo').oninput = (e) => { setSetting('tempo', Number(e.target.value)); $('#tv').textContent = e.target.value + '%'; };
  $('#vol').oninput = (e) => { setSetting('volume', Number(e.target.value)); $('#vv').textContent = e.target.value + '%'; };
  const modeBtns = () => $('#mode').querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.m === settings.mode));
  modeBtns();
  $('#mode').onclick = (e) => { const m = e.target.closest('button')?.dataset.m; if (!m) return; setSetting('mode', m); applyTheme(settings.theme, m); modeBtns(); };
  $('#themes').onclick = (e) => {
    const t = e.target.closest('.th')?.dataset.t; if (!t) return;
    setSetting('theme', t); applyTheme(t, settings.mode);
    $('#themes').querySelectorAll('.th').forEach((b) => b.classList.toggle('on', b.dataset.t === t));
  };
  $('#reset').onclick = () => {
    if (!confirm('Reset all progress and favourites?')) return;
    Object.keys(progress).forEach((k) => delete progress[k]);
    saveProgress(); favs = new Set(); save('np.favs', []); save('np.streak', { days: 0 });
    toast('Progress reset');
  };
};

const openThemeSheet = () => {
  document.querySelector('.sheet-bg')?.remove(); document.querySelector('.sheet')?.remove();
  const bg = document.createElement('div'); bg.className = 'sheet-bg';
  const sh = document.createElement('div'); sh.className = 'sheet';
  const draw = () => {
    sh.innerHTML = `<div class="grab"></div><h4>Theme</h4>
      <div class="seg" id="tmode">${['light', 'auto', 'dark'].map((m) => `<button data-m="${m}" class="${settings.mode === m ? 'on' : ''}">${m === 'light' ? icon('sun') + ' Light' : m === 'dark' ? icon('moon') + ' Dark' : 'Auto'}</button>`).join('')}</div>
      <div class="themes">${Object.entries(THEMES).map(([k, t]) => `<button class="th ${k === settings.theme ? 'on' : ''}" data-t="${k}"><i><s style="background:${t[1]}"></s><s style="background:${t[2]}"></s><s style="background:${t[5]}"></s></i>${t[0]}</button>`).join('')}</div>`;
  };
  draw();
  const close = () => { bg.remove(); sh.remove(); };
  bg.onclick = close;
  sh.onclick = (e) => {
    const t = e.target.closest('.th')?.dataset.t;
    const m = e.target.closest('[data-m]')?.dataset.m;
    if (t) setSetting('theme', t);
    if (m) setSetting('mode', m);
    if (t || m) { applyTheme(settings.theme, settings.mode); draw(); }
  };
  document.body.append(bg, sh);
};
document.addEventListener('click', (e) => {
  if (e.target.closest('.theme-fab')) openThemeSheet();
  // Touch ripple on every button.
  const b = e.target.closest('.btn');
  if (!b) return;
  const r = b.getBoundingClientRect();
  const d = Math.max(r.width, r.height);
  const sp = document.createElement('span');
  sp.className = 'ripple';
  sp.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
  b.appendChild(sp);
  setTimeout(() => sp.remove(), 650);
});

const notFound = () => { app.innerHTML = '<div class="empty view">Song not found. <a href="#/library" style="color:var(--p)">Browse songs</a></div>'; };

/* ---------- router ---------- */
const route = async () => {
  cleanup(); cleanup = () => {};
  const [path, query = ''] = location.hash.slice(2).split('?');
  const [name, id] = path.split('/');
  const params = new URLSearchParams(query);
  if (!SONGS.length) { app.innerHTML = '<div class="loading">Loading songs…</div>'; await songsReady; }
  scrollTo(0, 0);
  if (!name) return settings.seenWelcome ? views.home() : views.welcome();
  const map = { quiz: views.quiz, home: views.home, library: views.library, practice: id ? views.practice : views.practiceHub, song: views.song, done: views.done, settings: views.settings, welcome: views.welcome, scan: views.scan };
  if (name === 'quiz' && id === 'chord') return views.quizChord(params);
  if (name === 'quiz' && id === 'interval') return views.quizInterval(params);
  if (name === 'quiz' && id === 'black') return views.quizBlack(params);
  if (name === 'progressions') return views.progressions(params);
  if (name === 'progressionPlay') return views.progressionPlay(params, id && decodeURIComponent(id));
  if (name === 'favs') return views.favs(params);
  (map[name] || views.home)(params, id && decodeURIComponent(id));
};
addEventListener('hashchange', route);
route();

// Global delegated handler for voice picker (present on many pages).
app.addEventListener('change', (e) => {
  if (e.target.id === 'voicePick') {
    setSetting('voice', e.target.value);
    unlockAudio();
    playNote(60, { voice: e.target.value, volume: settings.volume / 100 });
  }
});

if ('serviceWorker' in navigator && !['localhost', '127.0.0.1'].includes(location.hostname)) navigator.serviceWorker.register('sw.js').catch(() => {});
