import { THEMES, applyTheme } from './themes.js';
import { CATEGORIES, SONG_FILES, parseSong, buildTimeline, buildSteps, labelFor, midiName, durationSeconds, fmtTime, chordName } from './music.js?v=191';
import { renderScore } from './score.js';
import { playNote, playBassNote, playClick, unlockAudio, now, setSustain, getSustain, stopAllAudio, playKick, playSnare, playHihat, setEffect } from './audio.js';
import { createKeyboard } from './keyboard.js?v=40';
import { createFalling } from './falling.js';
import { parseMusicXML } from './musicxml.js';
import { CHORDS_LIBRARY, CL_GENRES } from './chords-library.js?v=7';

/* ---------- storage ---------- */
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } };

const DEFAULTS = {
  name: '', theme: 'ninja', mode: 'dark', showNames: true, keyLabels: true, highlight: true,
  nameSystem: 'letters', tempo: 100, voice: 'grand', volume: 80, drumVolume: 80, effect: 'none', metronome: false, waitMode: true, seenWelcome: false, fallingSound: true, colorNotes: true,
};
const settings = { ...DEFAULTS, ...load('np.settings', {}) };
const progress = load('np.progress', {});   // id -> { best, plays, done, last }
let favs = new Set(load('np.favs', []));
let progFavs = new Set(load('np.prog-favs', []));
const setSetting = (k, v) => { settings[k] = v; save('np.settings', settings); };
const saveProgress = () => save('np.progress', progress);

applyTheme(settings.theme, settings.mode);
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => applyTheme(settings.theme, settings.mode));
// Apply saved effect on first audio interaction
document.addEventListener('click', () => { if (settings.effect && settings.effect !== 'none') setEffect(settings.effect); }, { once: true });

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
  Hiphop:      ['🎙️', '#f59e0b', '#1f2937'],
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
  Hiphop: `<circle cx="29" cy="29" r="24" fill="rgba(255,255,255,.07)"/>
    <!-- Studio microphone capsule -->
    <ellipse cx="29" cy="20" rx="9" ry="11" fill="rgba(255,255,255,.92)"/>
    <line x1="23" y1="17" x2="35" y2="17" stroke="rgba(0,0,0,.18)" stroke-width="0.8"/>
    <line x1="22" y1="20" x2="36" y2="20" stroke="rgba(0,0,0,.18)" stroke-width="0.8"/>
    <line x1="23" y1="23" x2="35" y2="23" stroke="rgba(0,0,0,.18)" stroke-width="0.8"/>
    <!-- Mic yoke / collar -->
    <path d="M18 25 Q18 32 29 32 Q40 32 40 25" stroke="rgba(255,255,255,.75)" stroke-width="1.8" fill="none"/>
    <!-- Handle -->
    <rect x="27" y="32" width="4" height="12" rx="1.5" fill="rgba(255,255,255,.78)"/>
    <!-- Base -->
    <ellipse cx="29" cy="47" rx="9" ry="2.5" fill="rgba(255,255,255,.85)"/>`,
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

/* ---------- theme preview ---------- */
const themePreview = (primary, accent) => {
  // Grand piano 3/4 angle: open lid, visible strings interior, keyboard at front
  // Interior string lines running vertically within the interior quad
  const strings = Array.from({length:22}, (_,i) => {
    const t = (i + 0.5) / 22;
    const x1 = (18 + t * 96).toFixed(1), y1 = (12 - t * 1.5).toFixed(1);
    const x2 = (17 + t * 98).toFixed(1), y2 = (45 - t * 1.5).toFixed(1);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(255,255,255,0.22)" stroke-width="0.5"/>`;
  }).join('');
  // Cross braces (harp structure)
  const braces = [0.25,0.5,0.75].map(t => {
    const x1 = (18 + t*96).toFixed(1), x2 = (18 + (t+0.12)*96).toFixed(1);
    const y1 = 12, y2 = 45;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(255,255,255,0.35)" stroke-width="1.2"/>`;
  }).join('');
  // White keys at front (simple row, slightly in perspective)
  const WK = 13, KY1 = 53, KY2 = 71;
  const kTotalW = 111, kX0 = 9;
  const wHit = new Set([0,2,4,7,9,12]);
  const wkeys = Array.from({length:WK}, (_,i) => {
    const x1 = (kX0 + i/WK*kTotalW).toFixed(1);
    const x2 = (kX0 + (i+1)/WK*kTotalW).toFixed(1);
    const fill = wHit.has(i) ? primary : '#f0ede6';
    return `<polygon points="${x1},${KY1} ${x2},${KY1} ${x2},${KY2} ${x1},${KY2}" fill="${fill}" stroke="#bbb" stroke-width="0.4"/>`;
  }).join('');
  // Black keys
  const kw = kTotalW / WK;
  const bAfter = [1,2,4,5,7,8,10,11];
  const bAccentSet = new Set([0,3,6]);
  const bkeys = bAfter.map((after, i) => {
    const cx = kX0 + (after + 0.5) * kw;
    const bw = (kw * 0.62).toFixed(1), bh = ((KY2-KY1)*0.62).toFixed(1);
    const fill = bAccentSet.has(i) ? accent : '#111';
    return `<rect x="${(cx-kw*0.31).toFixed(1)}" y="${KY1}" width="${bw}" height="${bh}" rx="1" fill="${fill}"/>` +
      `<rect x="${(cx-kw*0.31+1).toFixed(1)}" y="${KY1}" width="${(kw*0.62-2).toFixed(1)}" height="5" rx="1" fill="rgba(255,255,255,0.14)"/>`;
  }).join('');
  return (
    `<svg viewBox="0 0 130 85" width="100%" style="display:block;border-radius:10px;overflow:hidden">` +
    // Background
    `<rect width="130" height="85" fill="#080808"/>` +
    // Piano body (grand piano curved shape, 3/4 view, black lacquer)
    `<path d="M 8,51 Q 4,35 10,19 Q 17,6 40,3 Q 66,0 94,3 L 122,4 L 120,51 L 106,68 Q 82,76 52,76 Q 22,76 8,65 Z" fill="#1a1a1a" stroke="#2e2e2e" stroke-width="1"/>` +
    // Lacquer sheen (highlight line on body)
    `<path d="M 15,60 Q 50,70 100,58" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="3"/>` +
    // Lid (dark outer frame, angled open)
    `<path d="M 12,49 L 121,47 L 119,5 L 14,7 Z" fill="#0e0e0e" stroke="#3a3a3a" stroke-width="0.8"/>` +
    // Interior (strings & soundboard) — theme primary color
    `<path d="M 16,46 L 116,44 L 114,10 L 18,12 Z" fill="${primary}"/>` +
    strings + braces +
    // Interior front highlight
    `<line x1="16" y1="46" x2="116" y2="44" stroke="rgba(255,255,255,0.28)" stroke-width="1.2"/>` +
    // Lid prop stick
    `<line x1="113" y1="44" x2="120" y2="5" stroke="#999" stroke-width="1.8" stroke-linecap="round"/>` +
    `<circle cx="113" cy="44" r="2.5" fill="#666"/>` +
    // Keyboard bed (dark strip)
    `<path d="M 8,51 L 121,49 L 121,73 L 8,75 Z" fill="#1c1c1c"/>` +
    wkeys + bkeys +
    // Front rail below keys
    `<path d="M 8,75 L 121,73 L 121,79 L 8,81 Z" fill="#111" stroke="#252525" stroke-width="0.5"/>` +
    // Legs
    `<rect x="8" y="79" width="7" height="6" rx="1" fill="#0f0f0f"/>` +
    `<rect x="116" y="77" width="6" height="6" rx="1" fill="#0f0f0f"/>` +
    // Brand
    `<text x="64" y="84" font-size="4" fill="#2a2a2a" text-anchor="middle" font-family="Georgia,serif" letter-spacing="1.5">STUDIO GRAND</text>` +
    `</svg>`
  );
};
const themeCard = (k, t, active) =>
  `<button class="th ${active?'on':''}" data-t="${k}">${themePreview(t[1],t[2],t[5])}<span>${t[0]}</span></button>`;
const themeGrid = (cur) => Object.entries(THEMES).map(([k,t])=>themeCard(k,t,k===cur)).join('');

/* ---------- shell ---------- */
const app = document.getElementById('app');
const nav = document.getElementById('nav');
let cleanup = () => {};

/* Auto-hide nav after 3s of inactivity; show on scroll/mouse/touch */
let navIdleTimer = null;
const NAV_IDLE_MS = 3000;
const showNav = () => {
  nav.classList.remove('nav-idle');
  clearTimeout(navIdleTimer);
  navIdleTimer = setTimeout(() => { if (!nav.classList.contains('hide')) nav.classList.add('nav-idle'); }, NAV_IDLE_MS);
};
['scroll','mousemove','touchstart','touchmove','keydown'].forEach(ev =>
  window.addEventListener(ev, showNav, { passive: true })
);
showNav();

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
  if (!hidden) showNav();
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
    ${heading('🎼', 'Scale Explorer')}
    <a class="song" href="#/scales">
      <div class="thumb" style="background:linear-gradient(135deg,#0d9488,#065f46)"><svg viewBox="0 0 58 58" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="38" width="7" height="12" rx="1.5" fill="#fff" opacity=".9"/><rect x="15" y="30" width="7" height="20" rx="1.5" fill="#fff" opacity=".9"/><rect x="24" y="22" width="7" height="28" rx="1.5" fill="#fff" opacity=".9"/><rect x="33" y="28" width="7" height="22" rx="1.5" fill="#fff" opacity=".9"/><rect x="42" y="18" width="7" height="32" rx="1.5" fill="#fff" opacity=".9"/><rect x="9" y="12" width="4" height="14" rx="1" fill="rgba(255,255,255,.5)"/><rect x="22" y="12" width="4" height="14" rx="1" fill="rgba(255,255,255,.5)"/><rect x="35" y="12" width="4" height="14" rx="1" fill="rgba(255,255,255,.5)"/><text x="29" y="55" text-anchor="middle" font-size="7" fill="#fff" font-weight="700" opacity=".85">SCALES</text></svg></div>
      <div class="meta"><div class="t">Scale Explorer</div>
        <div class="s">Visualize scales · See diatonic chords · Tap to hear</div>
        <div class="tags"><span class="tag cat">7 scales</span><span class="tag cat">All 12 keys</span><span class="tag cat">Chords</span></div>
      </div><span class="play">${icon('arrowR')}</span>
    </a>
    ${heading('🎹', 'Chords Practice')}
    <a class="song" href="#/chordsPractice">
      <div class="thumb" style="background:linear-gradient(135deg,#ec4899,#be185d)"><svg viewBox="0 0 58 58" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="28" width="8" height="20" rx="2" fill="#fff" opacity=".9"/><rect x="16" y="28" width="8" height="20" rx="2" fill="#fff" opacity=".9"/><rect x="26" y="28" width="8" height="20" rx="2" fill="#fff" opacity=".9"/><rect x="36" y="28" width="8" height="20" rx="2" fill="#fff" opacity=".9"/><rect x="46" y="28" width="8" height="20" rx="2" fill="#fff" opacity=".9"/><rect x="12" y="28" width="5" height="12" rx="1" fill="rgba(0,0,0,.7)"/><rect x="22" y="28" width="5" height="12" rx="1" fill="rgba(0,0,0,.7)"/><rect x="38" y="28" width="5" height="12" rx="1" fill="rgba(0,0,0,.7)"/><text x="29" y="18" text-anchor="middle" font-size="11" fill="#fff" font-weight="800">I IV V</text><text x="29" y="55" text-anchor="middle" font-size="7" fill="#fff" font-weight="700" opacity=".85">CHORDS</text></svg></div>
      <div class="meta"><div class="t">Chords Practice</div>
        <div class="s">Practice diatonic chords in any key · All scale types</div>
        <div class="tags"><span class="tag cat">12 keys</span><span class="tag cat">12 scales</span><span class="tag cat">Play All</span></div>
      </div><span class="play">${icon('play')}</span>
    </a>
    ${heading('🎼', 'Chord Progressions')}
    <a class="song" href="#/progressions">
      <div class="thumb" style="background:linear-gradient(135deg,#6d28d9,#3b82f6)"><svg viewBox="0 0 58 58" xmlns="http://www.w3.org/2000/svg"><line x1="6" y1="14" x2="52" y2="14" stroke="#fff" stroke-width="1.2" opacity=".5"/><line x1="6" y1="22" x2="52" y2="22" stroke="#fff" stroke-width="1.2" opacity=".5"/><line x1="6" y1="30" x2="52" y2="30" stroke="#fff" stroke-width="1.2" opacity=".5"/><line x1="6" y1="38" x2="52" y2="38" stroke="#fff" stroke-width="1.2" opacity=".5"/><ellipse cx="13" cy="38" rx="5" ry="3.5" fill="#ef4444"/><line x1="18" y1="38" x2="18" y2="10" stroke="#ef4444" stroke-width="1.5"/><ellipse cx="26" cy="30" rx="5" ry="3.5" fill="#eab308"/><line x1="31" y1="30" x2="31" y2="6" stroke="#eab308" stroke-width="1.5"/><ellipse cx="39" cy="22" rx="5" ry="3.5" fill="#22c55e"/><line x1="44" y1="22" x2="44" y2="4" stroke="#22c55e" stroke-width="1.5"/><ellipse cx="50" cy="30" rx="5" ry="3.5" fill="#3b82f6"/><line x1="55" y1="30" x2="55" y2="8" stroke="#3b82f6" stroke-width="1.5"/><text x="29" y="54" text-anchor="middle" font-size="8" fill="#fff" font-weight="700" opacity=".85">I – IV – V – I</text></svg></div>
      <div class="meta"><div class="t">Progression Practice</div>
        <div class="s">Play by mood · Transpose to any key</div>
        <div class="tags"><span class="tag cat">😊 Happy</span><span class="tag cat">🎸 Rock</span><span class="tag cat">🎷 Jazz</span><span class="tag cat">${PROGRESSIONS_DB.length} progressions</span></div>
      </div><span class="play">${icon('play')}</span>
    </a>
    ${heading('🎵', 'Chords Library')}
    <a class="song" href="#/chordsLibrary">
      <div class="thumb" style="background:linear-gradient(135deg,#f59e0b,#d97706)"><svg viewBox="0 0 58 58" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="14" width="42" height="5" rx="2.5" fill="rgba(255,255,255,.9)"/><rect x="8" y="24" width="34" height="5" rx="2.5" fill="rgba(255,255,255,.7)"/><rect x="8" y="34" width="38" height="5" rx="2.5" fill="rgba(255,255,255,.7)"/><rect x="8" y="44" width="28" height="5" rx="2.5" fill="rgba(255,255,255,.5)"/><text x="50" y="52" text-anchor="middle" font-size="10" fill="#fff" font-weight="800" opacity=".9">♪</text></svg></div>
      <div class="meta"><div class="t">Chords Library</div>
        <div class="s">Search chords for top hit songs · All genres</div>
        <div class="tags"><span class="tag cat">${CHORDS_LIBRARY.length} songs</span><span class="tag cat">Pop · Rock · Jazz</span><span class="tag cat">All genres</span></div>
      </div><span class="play">${icon('arrowR')}</span>
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
  const wrap = scoreEl.closest('.score-wrap');
  if (wrap && wrap.scrollHeight > wrap.clientHeight) {
    // score-wrap has internal scroll — scroll within it
    const svgTop = svg.getBoundingClientRect().top - wrap.getBoundingClientRect().top + wrap.scrollTop;
    wrap.scrollTo({ top: svgTop + y * scale - 40, behavior: 'smooth' });
  } else {
    const top = svg.getBoundingClientRect().top + scrollY + y * scale - 120;
    if (Math.abs(top - scrollY) > 40) scrollTo({ top, behavior: 'smooth' });
  }
};

views.song = (params, id) => {
  const song = songById(id);
  if (!song) return notFound();
  setNav('practice-run');
  const parsed = parseSong(song);
  const tl = buildTimeline(parsed);
  const secs = durationSeconds(parsed);
  const st = { playing: false, beat: 0, speed: settings.tempo / 100, loop: false, metro: settings.metronome, hands: ['rh', 'lh'], tab: 'sheet' };
  const speeds = [0.25, 0.5, 0.75, 1, 1.25];
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
      <div style="display:flex;align-items:center;gap:8px;padding:6px 10px 4px;background:var(--bg)">
        <button id="kbSkipBack" title="Back 5 notes" style="background:var(--card);border:1.5px solid var(--border);border-radius:10px;padding:6px 10px;font-size:13px;font-weight:700;cursor:pointer;color:var(--ink);flex-shrink:0">⏮5</button>
        <button id="kbPlay" style="background:var(--p);border:none;border-radius:10px;padding:6px 16px;font-size:15px;cursor:pointer;color:#fff;display:flex;align-items:center;gap:4px;flex-shrink:0">${icon('play')}</button>
        <button id="kbSkipFwd" title="Forward 5 notes" style="background:var(--card);border:1.5px solid var(--border);border-radius:10px;padding:6px 10px;font-size:13px;font-weight:700;cursor:pointer;color:var(--ink);flex-shrink:0">5⏭</button>
        <div style="display:flex;flex-direction:column;flex:1;gap:2px;min-width:0">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:10px;color:var(--muted);font-weight:600">SPEED</span>
            <span id="kbSpdLabel" style="font-size:12px;font-weight:800;color:var(--p)">${st.speed}x</span>
          </div>
          <input type="range" id="kbSpdSlider" min="5" max="200" step="5" value="${Math.round(st.speed*100)}" style="width:100%;accent-color:var(--p);height:4px;cursor:pointer">
        </div>
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
  const draw = () => { score = renderScore($('#score'), parsed, { ...scoreOpts(), showChords: true }); colorizeScore($('#score')); };
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
      kb.setTargets(active.flatMap((e) => e.midis));
    }
    updateProg();
    updateSongDegrees(b);
    raf = requestAnimationFrame(frame);
  };
  const updateSongDegrees = (b) => {
    const kbHost = $('#kb');
    if (!kbHost) return;
    kbHost.querySelectorAll('.degree-label').forEach(el => el.remove());
    const midiOrder = new Map();
    let order = 1;
    for (let i = 0; i < tl.events.length && order <= 5; i++) {
      const e = tl.events[i];
      if (!st.hands.includes(e.hand)) continue;
      if (e.start < b - 0.05) continue;
      e.midis.forEach(midi => { if (!midiOrder.has(midi)) midiOrder.set(midi, order); });
      order++;
    }
    midiOrder.forEach((ord, midi) => {
      const el = kbHost.querySelector(`.key[data-midi="${midi}"]`);
      if (!el) return;
      const lbl = document.createElement('span');
      lbl.className = 'degree-label';
      lbl.style.fontSize = ord === 1 ? '16px' : '12px';
      lbl.textContent = ord;
      el.appendChild(lbl);
    });
  };
  const updateProg = () => {
    const pct = Math.min(100, (st.beat / tl.total) * 100);
    $('#prog i').style.width = pct + '%';
    $('#prog b').style.left = pct + '%';
    $('#tcur').textContent = fmtTime(beatToSec(st.beat));
  };
  // Show degree numbers immediately on load
  requestAnimationFrame(() => updateSongDegrees(0));
  const start = () => {
    unlockAudio();
    startCtx = now() - beatToSec(st.beat) + 0.05;
    nextIdx = tl.events.findIndex((e) => e.start >= st.beat - 1e-6);
    if (nextIdx < 0) nextIdx = tl.events.length;
    lastBeatClick = Math.ceil(st.beat) - 1;
    st.playing = true;
    $('#play').innerHTML = icon('pause');
    const kbPlayBtn = $('#kbPlay'); if (kbPlayBtn) kbPlayBtn.innerHTML = icon('pause');
    timer = setInterval(schedule, 25);
    schedule();
    raf = requestAnimationFrame(frame);
  };
  const stop = () => {
    st.playing = false;
    clearInterval(timer);
    cancelAnimationFrame(raf);
    $('#play').innerHTML = icon('play');
    const kbPlayBtn = $('#kbPlay'); if (kbPlayBtn) kbPlayBtn.innerHTML = icon('play');
  };
  const syncKbSpd = () => {
    const lbl = $('#kbSpdLabel'); if (lbl) lbl.textContent = st.speed + 'x';
    const sl = $('#kbSpdSlider'); if (sl) sl.value = Math.round(st.speed * 100);
    $('#speed').textContent = st.speed + 'x';
  };
  const skipNotes = (n) => {
    const rhEvents = tl.events.filter(e => e.hand === 'rh');
    const cur = rhEvents.findIndex(e => e.start >= st.beat - 0.01);
    const idx = Math.max(0, Math.min(rhEvents.length - 1, (cur < 0 ? rhEvents.length : cur) + n));
    seek(rhEvents[idx]?.start ?? 0);
  };
  const seek = (beat) => {
    const was = st.playing;
    if (was) stop();
    st.beat = Math.max(0, Math.min(beat, tl.total - 0.01));
    score.clear(); kb.setTargets([]); lastSys = -1;
    updateProg();
    updateSongDegrees(st.beat);
    if (was) start();
  };

  $('#play').onclick = () => (st.playing ? stop() : start());
  $('#restart').onclick = () => seek(0);
  $('#loop').onclick = (e) => { st.loop = !st.loop; e.currentTarget.classList.toggle('on', st.loop); };
  $('#metro').onclick = (e) => { st.metro = !st.metro; e.currentTarget.classList.toggle('on', st.metro); };
  $('#metro').classList.toggle('on', st.metro);
  $('#speed').onclick = (e) => {
    st.speed = speeds[(speeds.indexOf(st.speed) + 1) % speeds.length];
    syncKbSpd();
    if (st.playing) { stop(); start(); }
  };
  $('#kbPlay').onclick = () => (st.playing ? stop() : start());
  $('#kbSkipBack').onclick = () => skipNotes(-5);
  $('#kbSkipFwd').onclick = () => skipNotes(5);
  $('#kbSpdSlider').oninput = (e) => {
    st.speed = Math.round(parseInt(e.target.value)) / 100;
    syncKbSpd();
    if (st.playing) { stop(); start(); }
  };
  syncKbSpd();
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
      // Build a map: midi → lowest order (nearest upcoming note on that key)
      const midiOrder = new Map();
      
      falling.getUpcomingSteps(5).forEach(({ order, midis }) => {
        midis.forEach(midi => {
          if (!midiOrder.has(midi)) midiOrder.set(midi, order);
        });
      });
      midiOrder.forEach((order, midi) => {
        const el = kbHost.querySelector(`.key[data-midi="${midi}"]`);
        if (!el) return;
        const lbl = document.createElement('span');
        lbl.className = 'degree-label';
        lbl.style.bottom = '16px';
        lbl.style.color = '#ef4444';
        lbl.style.fontSize = order === 1 ? '16px' : '12px';
        
        lbl.innerHTML = `${order}`;
        el.appendChild(lbl);
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
    cleanup = () => { falling.stop(); kb?.destroy(); };
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
  const showDegreeLabels = () => {
    const kbHost = $('#kb');
    if (!kbHost) return;
    kbHost.querySelectorAll('.degree-label').forEach(el => el.remove());
    return; // numbers only in song player, not practice modes
    const midiOrder = new Map();
    for (let i = st.idx; i < Math.min(steps.length, st.idx + 5); i++) {
      const order = i - st.idx + 1;
      steps[i].midis.forEach(midi => {
        if (!midiOrder.has(midi)) midiOrder.set(midi, order);
      });
    }
    midiOrder.forEach((order, midi) => {
      const el = kbHost.querySelector(`.key[data-midi="${midi}"]`);
      if (!el) return;
      const lbl = document.createElement('span');
      lbl.className = 'degree-label';
      lbl.style.bottom = '16px';
      const isCurrent = order === 1;
      lbl.style.color = '#ef4444';
      lbl.style.fontSize = isCurrent ? '16px' : '12px';
      
      lbl.innerHTML = `${order}`;
      el.appendChild(lbl);
    });
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
    showDegreeLabels();
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

const PROG_MOODS = ['All','😊 Happy','😢 Sad','💫 Emotional','🔥 Epic','🎷 Jazz','🎼 Blues','🎵 Pop','🎸 Rock','🎤 Hip-Hop','🎧 EDM','💕 Romantic','🌙 Dark','🌴 Reggae'];
const MOOD_KEY   = { 'All':'all','😊 Happy':'happy','😢 Sad':'sad','💫 Emotional':'emotional','🔥 Epic':'epic','🎷 Jazz':'jazz','🎼 Blues':'blues','🎵 Pop':'pop','🎸 Rock':'rock','🎤 Hip-Hop':'hiphop','🎧 EDM':'edm','💕 Romantic':'romantic','🌙 Dark':'dark','🌴 Reggae':'reggae' };

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

  // ── Reggae (15) ───────────────────────────────────────
  { id:'reg-I-IV',        name:'I – IV (One Drop)',             mood:['reggae','happy'],           genre:'Reggae',
    chords:[{s:0,q:'M',r:'I'},{s:5,q:'M',r:'IV'},{s:0,q:'M',r:'I'},{s:5,q:'M',r:'IV'}] },
  { id:'reg-I-V-IV',      name:'I – V – IV (Roots Rock)',       mood:['reggae','happy'],           genre:'Reggae',
    chords:[{s:0,q:'M',r:'I'},{s:7,q:'M',r:'V'},{s:5,q:'M',r:'IV'},{s:0,q:'M',r:'I'}] },
  { id:'reg-I-IV-V',      name:'I – IV – V (Classic Ska)',      mood:['reggae','happy'],           genre:'Reggae',
    chords:[{s:0,q:'M',r:'I'},{s:5,q:'M',r:'IV'},{s:7,q:'M',r:'V'},{s:0,q:'M',r:'I'}] },
  { id:'reg-i-VII-VI-VII',name:'i – ♭VII – ♭VI – ♭VII (Minor Reggae)',mood:['reggae','emotional'],genre:'Reggae',
    chords:[{s:0,q:'m',r:'i'},{s:10,q:'M',r:'♭VII'},{s:8,q:'M',r:'♭VI'},{s:10,q:'M',r:'♭VII'}] },
  { id:'reg-i-iv-VII',    name:'i – iv – ♭VII (Dancehall)',     mood:['reggae','dark'],            genre:'Reggae',
    chords:[{s:0,q:'m',r:'i'},{s:5,q:'m',r:'iv'},{s:10,q:'M',r:'♭VII'},{s:0,q:'m',r:'i'}] },
  { id:'reg-I-VI-IV-V',   name:'I – VI – IV – V (Rocksteady)',  mood:['reggae','happy'],           genre:'Reggae',
    chords:[{s:0,q:'M',r:'I'},{s:9,q:'m',r:'vi'},{s:5,q:'M',r:'IV'},{s:7,q:'M',r:'V'}] },
  { id:'reg-i-VI-III-VII',name:'i – ♭VI – ♭III – ♭VII (Dub)',  mood:['reggae','dark'],            genre:'Reggae',
    chords:[{s:0,q:'m',r:'i'},{s:8,q:'M',r:'♭VI'},{s:3,q:'M',r:'♭III'},{s:10,q:'M',r:'♭VII'}] },
  { id:'reg-I-IV-I-V',    name:'I – IV – I – V (Ska Shuffle)',  mood:['reggae','happy'],           genre:'Reggae',
    chords:[{s:0,q:'M',r:'I'},{s:5,q:'M',r:'IV'},{s:0,q:'M',r:'I'},{s:7,q:'M',r:'V'}] },
  { id:'reg-i-iv-v-i',    name:'i – iv – v – i (Minor Roots)', mood:['reggae','sad'],             genre:'Reggae',
    chords:[{s:0,q:'m',r:'i'},{s:5,q:'m',r:'iv'},{s:7,q:'m',r:'v'},{s:0,q:'m',r:'i'}] },
  { id:'reg-I-V-vi-IV',   name:'I – V – vi – IV (Lovers Rock)', mood:['reggae','romantic'],       genre:'Reggae',
    chords:[{s:0,q:'M',r:'I'},{s:7,q:'M',r:'V'},{s:9,q:'m',r:'vi'},{s:5,q:'M',r:'IV'}] },
  { id:'reg-i-III-VII',   name:'i – ♭III – ♭VII (Steppers)',   mood:['reggae','dark'],            genre:'Reggae',
    chords:[{s:0,q:'m',r:'i'},{s:3,q:'M',r:'♭III'},{s:10,q:'M',r:'♭VII'},{s:0,q:'m',r:'i'}] },
  { id:'reg-I-bVII-IV',   name:'I – ♭VII – IV (Nyahbinghi)',   mood:['reggae','epic'],            genre:'Reggae',
    chords:[{s:0,q:'M',r:'I'},{s:10,q:'M',r:'♭VII'},{s:5,q:'M',r:'IV'},{s:0,q:'M',r:'I'}] },
  { id:'reg-I-IV-vi-V',   name:'I – IV – vi – V (Pop Reggae)', mood:['reggae','happy'],           genre:'Reggae',
    chords:[{s:0,q:'M',r:'I'},{s:5,q:'M',r:'IV'},{s:9,q:'m',r:'vi'},{s:7,q:'M',r:'V'}] },
  { id:'reg-i-VII-IV-VII',name:'i – ♭VII – IV – ♭VII (Dub Bass)', mood:['reggae','dark'],        genre:'Reggae',
    chords:[{s:0,q:'m',r:'i'},{s:10,q:'M',r:'♭VII'},{s:5,q:'M',r:'IV'},{s:10,q:'M',r:'♭VII'}] },
  { id:'reg-I-vi-IV-I',   name:'I – vi – IV – I (Mento)',      mood:['reggae','happy','classic'], genre:'Reggae',
    chords:[{s:0,q:'M',r:'I'},{s:9,q:'m',r:'vi'},{s:5,q:'M',r:'IV'},{s:0,q:'M',r:'I'}] },
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
    romantic:'#ec4899',dark:'#374151',classic:'#0d9488',folk:'#65a30d',reggae:'#16a34a',
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
  const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const notes = [...midis].sort((a,b)=>a-b).map(m=>{
    const mn=normOct(m), y=noteStaffY(mn), pc=mn%12, sharp=ACC[pc];
    const nx=NX+(sharp?5:0);
    const name=NOTE_NAMES[pc];
    return `${sharp?`<text x="${nx-12}" y="${y+4}" font-size="13" font-weight="bold" fill="currentColor">#</text>`:''}<ellipse cx="${nx}" cy="${y}" rx="8" ry="5.5" fill="currentColor" transform="rotate(-12,${nx},${y})"/><text x="${nx}" y="${y+1}" font-size="${name.length>2?8:10}" font-weight="900" fill="#ef4444" text-anchor="middle" dominant-baseline="middle" font-family="Plus Jakarta Sans,sans-serif">${name}</text>`;
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
    const kbPillsEl = app.querySelector('#kbProgPills');
    const infoEl = app.querySelector('#chordInfo');
    if (nameEl) nameEl.textContent = label;
    if (romEl)  romEl.textContent = chord.r || '';
    const typeEl = app.querySelector('#chordTypeName');
    if (typeEl) typeEl.textContent = progChordInversion(label, chord.q);
    const chordCol = pillColor(chord.r);
    const kbLabelEl = app.querySelector('#kbChordLabel');
    if (kbLabelEl) { kbLabelEl.textContent = getChordInversionName(label, chord.q, midis); kbLabelEl.style.color = chordCol; }
    if (infoEl) infoEl.textContent = midis.map(m => midiName(m).replace(/\d+/,'')).join(' – ');
    const notEl = app.querySelector('#chordNotation');
    if (notEl) notEl.innerHTML = chordNotationSVG(midis);
    const kbNotEl = app.querySelector('#kbNotation');
    if (kbNotEl) kbNotEl.innerHTML = chordNotationSVG(midis);
    [pillsEl, kbPillsEl].forEach(container => {
      if (!container) return;
      container.innerHTML = buildChordList();
    });
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

  const syncKbAuto = (playing) => { const b = app.querySelector('#kbAuto'); if (b) b.textContent = playing ? '⏸' : '▶'; };
  const startAuto = () => {
    autoPlaying = true;
    app.querySelector('#autoBtn').innerHTML = icon('pause')+' Stop';
    syncKbAuto(true);
    const ms = Math.round(60000/bpm)*2;
    autoTimer = setInterval(()=>{ curIdx = (curIdx + 1) % prog.chords.length; renderWithImprov(); }, ms);
  };
  const stopAuto = () => {
    autoPlaying = false;
    clearInterval(autoTimer);
    const btn = app.querySelector('#autoBtn');
    if (btn) btn.innerHTML = icon('play')+' Auto';
    syncKbAuto(false);
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
    const label = progChordLabel(keyMidi, c.s, c.q);
    const chordName = progChordInversion(label, c.q);
    const midis = progChordMidis(keyMidi, c.s, c.q);
    const invFull = getChordInversionName(label, c.q, midis);
    const invPart = invFull.split('–')[1]?.trim() || '';
    const invLine = invPart && invPart !== 'Root position' ? `<span style="font-size:8px;opacity:.65;line-height:1;white-space:nowrap">${invPart}</span>` : '';
    return `<button class="pp chip" data-i="${i}" style="background:${active?col+'22':''};color:${col};border:2px solid ${active?col:col+'66'};font-weight:800;${active?'box-shadow:0 0 0 3px '+col+'44;':''}display:flex;flex-direction:column;align-items:center;gap:1px;height:auto;padding:5px 8px;line-height:1.2"><span>${c.r}</span><span style="font-size:9px;font-weight:600;opacity:.8;line-height:1.1;white-space:nowrap">${chordName}</span>${invLine}</button>`;
  }).join('');

  const progIdx = PROGRESSIONS_DB.findIndex(p => p.id === progId);
  const prevProgId = PROGRESSIONS_DB[(progIdx - 1 + PROGRESSIONS_DB.length) % PROGRESSIONS_DB.length]?.id;
  const nextProgId = PROGRESSIONS_DB[(progIdx + 1) % PROGRESSIONS_DB.length]?.id;

  app.innerHTML = `<section class="view">
    <div class="top">
      <a class="iconbtn" href="#/progressions">${icon('back')}</a>
      <div style="display:flex;align-items:center;gap:4px;flex:1;justify-content:center;overflow:hidden">
        <a class="iconbtn" href="#/progressionPlay/${prevProgId}?key=${keyName}&bpm=${bpm}" title="Previous progression" style="flex-shrink:0">${icon('arrowL')}</a>
        <h1 style="font-size:13px;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:center">${prog.name}</h1>
        <a class="iconbtn" href="#/progressionPlay/${nextProgId}?key=${keyName}&bpm=${bpm}" title="Next progression" style="flex-shrink:0">${icon('arrowR')}</a>
      </div>
      <div style="display:flex;gap:4px;align-items:center">
        ${voicePicker()}${sustainBtn()}
        <button id="progFavBtn" class="iconbtn${progFavs.has(progId)?' on':''}" title="Favourite progression">${icon('heart')}</button>
      </div>
    </div>

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
      <button id="progFavBtn2" class="btn sm${progFavs.has(progId)?' on':''}" style="flex-shrink:0;background:${progFavs.has(progId)?'#ef4444':'var(--card)'};color:${progFavs.has(progId)?'#fff':'var(--ink)'};border:2px solid ${progFavs.has(progId)?'#ef4444':'var(--border)'}" title="Save to favourites">${icon('heart')}</button>
    </div>

    <div class="card pad" style="display:flex;align-items:center;gap:12px;padding:10px 14px">
      <div style="font-size:11px;font-weight:700;opacity:.6;text-transform:uppercase;letter-spacing:.5px;white-space:nowrap">BPM</div>
      <input type="range" min="40" max="160" value="${bpm}" id="bpmSlider" style="flex:1;accent-color:var(--p)">
      <b id="bpmVal" style="min-width:36px;text-align:right;font-size:14px">${bpm}</b>
    </div>

    <div id="improvPanel" style="margin:10px 0"></div>
    <div class="kb-dock">
      <div style="display:flex;align-items:center;gap:8px;padding:4px 8px 2px;flex-wrap:wrap">
        <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
          <div id="kbNotation" style="flex-shrink:0">${chordNotationSVG(progChordMidis(keyMidi,prog.chords[0].s,prog.chords[0].q))}</div>
          <div id="kbChordLabel" style="font-size:13px;font-weight:800;color:${pillColor(prog.chords[0].r)};letter-spacing:.2px;white-space:nowrap">${getChordInversionName(progChordLabel(keyMidi,prog.chords[0].s,prog.chords[0].q),prog.chords[0].q,progChordMidis(keyMidi,prog.chords[0].s,prog.chords[0].q))}</div>
        </div>
        <div class="chips" id="kbProgPills" style="flex:1;justify-content:flex-start;flex-wrap:nowrap;overflow-x:auto;padding:0;margin:0;gap:5px">${buildChordList()}</div>
        <div style="display:flex;gap:4px;flex-shrink:0">
          <button id="kbPrev" style="background:var(--card);border:1.5px solid var(--border);border-radius:8px;padding:4px 8px;font-size:13px;cursor:pointer;color:var(--ink)" title="Prev">◀</button>
          <button id="kbAuto" style="background:var(--p);border:none;border-radius:8px;padding:4px 10px;font-size:13px;cursor:pointer;color:#fff" title="Play/Pause">▶</button>
          <button id="kbNext" style="background:var(--card);border:1.5px solid var(--border);border-radius:8px;padding:4px 8px;font-size:13px;cursor:pointer;color:var(--ink)" title="Next">▶▶</button>
        </div>
      </div>
      <div class="kb" id="kb"></div>
    </div>
  </section>`;

  const buildInversionKbs = (midis, q, chordCol) => {
    const intervals = CHORD_TYPE_INTERVALS[q] || CHORD_TYPE_INTERVALS.M;
    const rootPc = midis[0] % 12;
    const baseRoot = 60 + rootPc;
    const rootNotes = intervals.map(i => baseRoot + i);
    // Detect current inversion from shifted display notes
    const shifted = midis.map(m => { let n=m; while(n<60)n+=12; while(n>71)n-=12; return n; }).sort((a,b)=>a-b);
    const bassPc = shifted[0] % 12;
    const bassInterval = (bassPc - rootPc + 12) % 12;
    let currentInv = 0;
    for (let i = 0; i < intervals.length; i++) { if (bassInterval === intervals[i]) { currentInv = i; break; } }
    const INV_NAMES = ['Root pos.','1st inv.','2nd inv.','3rd inv.'];
    // 2-octave SVG keyboard (MIDI 60–83) so each inversion shows notes at different positions
    const KW = 12, KH = 46, BW = 7, BH = 30;
    const octW = 7 * KW;
    const TOTAL_W = 2 * octW + 1;
    const whitePC = [0,2,4,5,7,9,11];
    const blackDef = [{pc:1,ox:9},{pc:3,ox:21},{pc:6,ox:45},{pc:8,ox:57},{pc:10,ox:69}];
    const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    const makeKb = (highlightMidis, isActive) => {
      const highSet = new Set(highlightMidis);
      let wkeys = '', bkeys = '', labels = '';
      for (let oct = 0; oct < 2; oct++) {
        const octX = oct * octW;
        const base = 60 + oct * 12;
        whitePC.forEach((pc, wi) => {
          const midi = base + pc;
          const x = octX + wi * KW + 1;
          const isH = highSet.has(midi);
          wkeys += `<rect x="${x}" y="1" width="${KW-1}" height="${KH}" rx="2" fill="${isH?chordCol:'white'}" stroke="${isH?chordCol:'#ccc'}" stroke-width="${isH?1.5:0.5}"/>`;
          if (isH) labels += `<text x="${x+(KW-1)/2}" y="${KH-4}" font-size="7" font-weight="900" fill="white" text-anchor="middle" font-family="Plus Jakarta Sans,sans-serif">${NOTE_NAMES[pc]}</text>`;
        });
        blackDef.forEach(({pc, ox}) => {
          const midi = base + pc;
          const isH = highSet.has(midi);
          bkeys += `<rect x="${octX+ox}" y="1" width="${BW}" height="${BH}" rx="1" fill="${isH?chordCol:'#222'}"/>`;
          if (isH) labels += `<text x="${octX+ox+BW/2}" y="${BH-3}" font-size="6" font-weight="900" fill="white" text-anchor="middle" font-family="Plus Jakarta Sans,sans-serif">${NOTE_NAMES[pc]}</text>`;
        });
      }
      const border = isActive ? `2px solid ${chordCol}` : '1.5px solid #e5e7eb';
      const shadow = isActive ? `0 0 0 3px ${chordCol}44` : 'none';
      const opacity = isActive ? 1 : 0.75;
      return `<svg width="170" height="58" viewBox="0 0 ${TOTAL_W} ${KH+2}" style="border-radius:8px;overflow:hidden;border:${border};box-shadow:${shadow};display:block;opacity:${opacity}"><rect width="${TOTAL_W}" height="${KH+2}" fill="#ddd"/>${wkeys}${bkeys}${labels}</svg>`;
    };
    return intervals.map((_, inv) => {
      const invNotes = [...rootNotes];
      for (let j = 0; j < inv; j++) invNotes[j] += 12;
      invNotes.sort((a, b) => a - b);
      // Normalize so bass note starts in octave 4 (MIDI 60–71)
      while (invNotes[0] < 60) invNotes.forEach((_, k) => invNotes[k] += 12);
      while (invNotes[0] > 71) invNotes.forEach((_, k) => invNotes[k] -= 12);
      const isActive = inv === currentInv;
      const svg = makeKb(invNotes, isActive);
      return `<div style="display:flex;flex-direction:column;align-items:center;gap:4px"><span style="font-size:12px;font-weight:${isActive?800:500};color:${isActive?chordCol:'#888'};white-space:nowrap">${INV_NAMES[inv]}</span>${svg}</div>`;
    }).join('');
  };

  const renderImprov = (currentChordMidis, currentQ, chordCol, chordLabel) => {
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

    // Inversion keyboards row
    const activeCol = chordCol || 'var(--p)';
    const chordTypeName = progChordInversion(chordLabel || '', currentQ || 'M');
    const invRow = currentChordMidis ? buildInversionKbs(currentChordMidis, currentQ || 'M', activeCol) : '';

    npanel.innerHTML = `<div class="card pad" style="padding:14px">
      ${invRow ? `<div style="margin-bottom:12px;padding:12px;background:var(--bg);border-radius:10px;border:1px solid #e5e7eb">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--muted);margin-bottom:4px">🎹 Chord Chart</div>
        <div style="font-size:16px;font-weight:800;color:${activeCol};margin-bottom:10px;letter-spacing:.2px">${chordTypeName}</div>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">${invRow}</div>
      </div>` : ''}

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

      <div style="font-size:11px;padding:6px 10px;background:var(--bad)18;border-radius:8px;color:var(--bad);margin-bottom:12px">
        ⚠️ ${t.avoid}
      </div>

      <div style="display:flex;align-items:center;gap:8px;padding-top:4px;border-top:1px solid var(--border)">
        <span style="font-size:20px">🎹</span>
        <div><b style="font-size:14px;display:block">Improvisation Guide</b><span style="font-size:11px;color:var(--muted)">${t.name} · Key of ${keyName}</span></div>
      </div>
    </div>`;
  };

  let kb = null;
  const onPress = (m) => { unlockAudio(); playNote(m,{voice:settings.voice,volume:settings.volume/100}); };
  kb = createKeyboard(app.querySelector('#kb'),{low:48,high:84,labels:true,nameSystem:settings.nameSystem,onPress});
  const renderWithImprov = () => {
    render();
    const chord = prog.chords[curIdx];
    renderImprov(progChordMidis(keyMidi, chord.s, chord.q), chord.q, pillColor(chord.r), progChordLabel(keyMidi, chord.s, chord.q));
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
  const pillClickHandler = (e) => {
    const i = e.target.closest('[data-i]')?.dataset.i;
    if (i!=null){curIdx=Number(i);renderWithImprov();}
  };
  app.querySelector('#progPills').onclick = pillClickHandler;
  app.querySelector('#kbProgPills').onclick = pillClickHandler;

  // Favourite progression toggle
  const toggleProgFav = () => {
    if (progFavs.has(progId)) progFavs.delete(progId); else progFavs.add(progId);
    save('np.prog-favs', [...progFavs]);
    const isFavNow = progFavs.has(progId);
    [app.querySelector('#progFavBtn'), app.querySelector('#progFavBtn2')].forEach(btn => {
      if (!btn) return;
      btn.classList.toggle('on', isFavNow);
      btn.style.background = isFavNow ? '#ef4444' : 'var(--card)';
      btn.style.color = isFavNow ? '#fff' : 'var(--ink)';
      btn.style.borderColor = isFavNow ? '#ef4444' : 'var(--border)';
    });
  };
  app.querySelector('#progFavBtn')?.addEventListener('click', toggleProgFav);
  app.querySelector('#progFavBtn2')?.addEventListener('click', toggleProgFav);

  // Auto advance also re-renders improv panel
  const origAdvance = advance;
  const advanceWithImprov = (dir=1) => { curIdx = (curIdx + dir + prog.chords.length) % prog.chords.length; renderWithImprov(); };

  app.querySelector('#prevBtn').onclick=()=>{stopAuto();advanceWithImprov(-1);};
  app.querySelector('#nextBtn').onclick=()=>{stopAuto();advanceWithImprov(1);};
  app.querySelector('#autoBtn').onclick=()=>autoPlaying?stopAuto():startAuto();
  app.querySelector('#kbPrev').onclick=()=>{stopAuto();advanceWithImprov(-1);};
  app.querySelector('#kbNext').onclick=()=>{stopAuto();advanceWithImprov(1);};
  app.querySelector('#kbAuto').onclick=()=>{ if(autoPlaying){stopAuto();app.querySelector('#kbAuto').textContent='▶';}else{startAuto();app.querySelector('#kbAuto').textContent='⏸';} };
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

  const onSpaceKey = (e) => {
    if (e.code === 'Space' && !e.target.matches('input,textarea,button')) {
      e.preventDefault();
      autoPlaying ? stopAuto() : startAuto();
    }
  };
  addEventListener('keydown', onSpaceKey);
  cleanup=()=>{stopAuto();kb?.destroy();removeEventListener('keydown',onSpaceKey);};
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
  const mode = params.get('mode') || 'notes';
  const POOLS = {
    easy: [60, 62, 64, 65, 67, 69, 71, 72],
    medium: [48, 50, 52, 53, 55, 57, 59, 60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79],
    hard: Array.from({ length: 37 }, (_, i) => 43 + i),
  };
  const CHORD_IVS = {
    major: [0,4,7], minor: [0,3,7], '7th': [0,4,7,10],
    maj7: [0,4,7,11], m7: [0,3,7,10], dim: [0,3,6], aug: [0,4,8],
    sus4: [0,5,7], sus2: [0,2,7], '9th': [0,4,7,10,14],
  };
  const SCALE_IVS = { major:[0,2,4,5,7,9,11], minor:[0,2,3,5,7,8,10], blues:[0,3,5,6,7,10] };
  const ROOTS = [60,62,64,65,67,69,71]; // C D E F G A B
  const ROOTS_ALL = Array.from({length:12},(_,i)=>60+i);

  const buildPool = () => {
    if (mode === 'notes') return POOLS[level];
    if (mode === 'scales') {
      const types = Object.values(SCALE_IVS);
      return (level==='hard'?ROOTS_ALL:ROOTS).flatMap(r => types.map(ivs => ivs.map(i => r + i)));
    }
    let chordTypes;
    if (mode === 'major') chordTypes = [CHORD_IVS.major];
    else if (mode === 'minor') chordTypes = [CHORD_IVS.minor];
    else if (mode === '7th') chordTypes = [CHORD_IVS['7th'], CHORD_IVS.maj7, CHORD_IVS.m7];
    else chordTypes = [CHORD_IVS.dim, CHORD_IVS.aug, CHORD_IVS.sus4, CHORD_IVS.sus2, CHORD_IVS['9th']];
    return (level==='hard'?ROOTS_ALL:ROOTS).flatMap(r => chordTypes.map(ivs => ivs.map(i => r + i)));
  };

  const pool = buildPool();
  const isChordMode = mode !== 'notes';
  const st = { n: 0, right: 0, streak: 0, best: load(`np.quiz.${kind}`, 0), target: null, targetSet: new Set(), hit: new Set(), tries: 0 };

  const MODES = [
    {k:'notes',l:'Notes'},{k:'scales',l:'Scales'},{k:'major',l:'Major'},{k:'minor',l:'Minor'},
    {k:'7th',l:'7th'},{k:'variations',l:'Variations'}
  ];
  const modeChips = MODES.map(({k,l})=>`<a class="chip ${k===mode?'on':''}" href="#/quiz/${kind}?level=${level}&mode=${k}">${l}</a>`).join('');

  app.innerHTML = `<section class="view">
    <div class="top"><a class="iconbtn" href="#/practice">${icon('back')}</a><h1>${ear ? 'Ear Training' : 'Note Reading'}</h1>${voicePicker()}</div>
    <div class="chips" id="lv" style="padding-top:0">${['easy', 'medium', 'hard'].map((l) => `<a class="chip ${l === level ? 'on' : ''}" href="#/quiz/${kind}?level=${l}&mode=${mode}">${l[0].toUpperCase() + l.slice(1)}</a>`).join('')}</div>
    <div class="chips" style="padding-top:0;padding-bottom:4px">${modeChips}</div>
    <div class="stats"><div class="card stat"><b id="sc">0/0</b><span>Correct</span></div><div class="card stat"><b id="sk">0🔥</b><span>Streak</span></div><div class="card stat"><b>${st.best}</b><span>Best streak</span></div></div>
    <div class="card score-wrap" style="margin-top:12px;text-align:center">
      ${ear ? `<button class="btn" id="hear" style="margin:26px auto">${icon('ear')} Play the note again</button>` : '<div class="score" id="score" style="max-width:340px;margin:0 auto"></div>'}
      <div class="muted" id="qmsg" style="padding-bottom:10px">${ear ? 'Listen, then find the note on the keyboard' : isChordMode ? 'Play all the notes shown' : 'Which note is this? Play it on the keyboard'}</div>
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
  const qChordSong = (midis) => {
    const rh = midis.filter(m=>m>=60).map(m=>midiName(m).replace('#','#'));
    const lh = midis.filter(m=>m<60).map(m=>midiName(m).replace('#','#'));
    return { id:'q', title:'', key:'C', time:'4/4', bpm:80,
      rh: rh.length ? `(${rh.join(' ')})/w` : 'r/w',
      lh: lh.length ? `(${lh.join(' ')})/w` : 'r/w' };
  };
  const next = () => {
    let item;
    do { item = pool[Math.floor(Math.random() * pool.length)]; } while (item === st.target && pool.length > 1);
    st.target = item; st.tries = 0;
    if (isChordMode) {
      const midis = Array.isArray(item) ? item : [item];
      st.targetSet = new Set(midis);
      st.hit = new Set();
      if (ear) { unlockAudio(); midis.forEach((m,i)=>setTimeout(()=>playNote(m,{voice:settings.voice,volume:settings.volume/100}),i*60)); }
      else renderScore($('#score'), parseSong(qChordSong(midis)), { showNames: false, showChords: false });
      $('#qmsg').textContent = ear ? 'Play all the notes you heard' : `Play all ${midis.length} notes shown`;
    } else {
      const m = Array.isArray(item) ? item[0] : item;
      st.target = m; st.targetSet = new Set([m]); st.hit = new Set();
      if (ear) { unlockAudio(); playNote(m, { voice: settings.voice, volume: settings.volume / 100 }); }
      else renderScore($('#score'), parseSong(qSong(m)), { showNames: false, showChords: false });
      $('#qmsg').textContent = ear ? 'Which note did you hear?' : 'Which note is this?';
    }
  };
  const onPress = (m) => {
    unlockAudio();
    playNote(m, { voice: settings.voice, volume: settings.volume / 100 });
    if (!st.targetSet || !st.targetSet.size) return;
    if (st.targetSet.has(m)) {
      st.hit.add(m);
      kb.flash(m, 'good', 500);
      if (st.hit.size >= st.targetSet.size) {
        if (st.tries === 0) { st.right++; st.streak++; } else st.streak = 0;
        st.n++;
        if (st.streak > st.best) { st.best = st.streak; save(`np.quiz.${kind}`, st.best); }
        const names = [...st.targetSet].map(n=>labelFor(midiName(n),settings.nameSystem)).join(' ');
        $('#qmsg').innerHTML = `<b style="color:var(--ok)">✓ ${names}</b>`;
        $('#sc').textContent = `${st.right}/${st.n}`;
        $('#sk').textContent = `${st.streak}🔥`;
        setTimeout(next, 700);
      } else {
        $('#qmsg').innerHTML = `<b style="color:var(--ok)">✓ ${st.hit.size}/${st.targetSet.size}</b> — keep going`;
      }
    } else {
      st.tries++;
      kb.flash(m, 'wrong');
      const remaining = [...st.targetSet].filter(n=>!st.hit.has(n));
      $('#qmsg').innerHTML = `<b style="color:var(--bad)">✗ That was ${labelFor(midiName(m), settings.nameSystem)}</b>${st.tries >= 3 ? ` — remaining: ${remaining.map(n=>labelFor(midiName(n),settings.nameSystem)).join(' ')}` : ''}`;
      if (st.tries >= 3) kb.setTargets(remaining);
    }
  };
  const allMidis = pool.flat();
  const kb = createKeyboard($('#kb'), { low: Math.min(...allMidis), high: Math.max(...allMidis), labels: false, nameSystem: settings.nameSystem, onPress });
  const _set = kb.setTargets.bind(kb);
  kb.setTargets = (ms) => { _set(ms); if (ms.length) setTimeout(() => _set([]), 900); };
  if (ear) $('#hear').onclick = () => { unlockAudio(); const midis=[...st.targetSet]; midis.forEach((m,i)=>setTimeout(()=>playNote(m,{voice:settings.voice,volume:settings.volume/100}),i*60)); };
  if (ear) { $('#qmsg').textContent = 'Tap "Play the note" to start'; $('#hear').onclick = () => { if (!st.targetSet||!st.targetSet.size) next(); else { const midis=[...st.targetSet]; midis.forEach((m,i)=>setTimeout(()=>playNote(m,{voice:settings.voice,volume:settings.volume/100}),i*60)); } }; }
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

views.scales = () => {
  setNav('practice');
  const $ = (s) => app.querySelector(s);
  const SCALE_DEFS = {
    'Major':           { intervals:[0,2,4,5,7,9,11],    desc:'Bright, happy' },
    'Minor':           { intervals:[0,2,3,5,7,8,10],    desc:'Dark, emotional' },
    'Harmonic Minor':  { intervals:[0,2,3,5,7,8,11],    desc:'Exotic, dramatic' },
    'Melodic Minor':   { intervals:[0,2,3,5,7,9,11],    desc:'Jazz-influenced' },
    'Major Penta':     { intervals:[0,2,4,7,9],         desc:'Happy, no half-steps' },
    'Minor Penta':     { intervals:[0,3,5,7,10],        desc:'Rock & blues solos' },
    'Major Blues':     { intervals:[0,2,3,4,7,9],       desc:'Major with blue note' },
    'Minor Blues':     { intervals:[0,3,5,6,7,10],      desc:'Classic blues sound' },
    'Dorian':          { intervals:[0,2,3,5,7,9,10],    desc:'Minor with bright 6th' },
    'Mixolydian':      { intervals:[0,2,4,5,7,9,10],    desc:'Major with flat 7th' },
    'Phrygian':        { intervals:[0,1,3,5,7,8,10],    desc:'Spanish, flamenco' },
    'Lydian':          { intervals:[0,2,4,6,7,9,11],    desc:'Dreamy, raised 4th' },
    'Jazz Bebop':      { intervals:[0,2,4,5,7,9,10,11], desc:'8-note bebop' },
    'Whole Tone':      { intervals:[0,2,4,6,8,10],      desc:'Dreamy, symmetric' },
    'Diminished':      { intervals:[0,2,3,5,6,8,9,11],  desc:'Dark, symmetric' },
  };
  const NMS = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const NMF = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
  const USE_FLAT = new Set([1,3,5,8,10]);
  const nn = (pc) => USE_FLAT.has(pc%12) ? NMF[pc%12] : NMS[pc%12];

  const saved = JSON.parse(localStorage.getItem('np.scales') || '{}');
  let selRoot = saved.root||0, selScale = (saved.scale && SCALE_DEFS[saved.scale]) ? saved.scale : 'Major', selChordIdx = -1;

  // 3-octave keyboard C3–B5 (midi 48–83)
  const KW=14, KH=58, BW=9, BH=36, octW=7*KW, nOcts=3, KB0=48;
  const TW = nOcts*octW+1;
  const wPC=[0,2,4,5,7,9,11];
  const bDef=[{pc:1,ox:10},{pc:3,ox:24},{pc:6,ox:52},{pc:8,ox:66},{pc:10,ox:80}];

  const buildKb = (scalePCs, chordMidis, chordColor) => {
    const scSet=new Set(scalePCs), chSet=new Set(chordMidis||[]);
    const cCol=chordColor||'var(--p)';
    let wk='', bk='', lb='';
    for(let o=0;o<nOcts;o++){
      const ox=o*octW, base=KB0+o*12;
      wPC.forEach((pc,wi)=>{
        const midi=base+pc, gpc=midi%12, x=ox+wi*KW+1;
        const isCh=chSet.has(midi), isSc=scSet.has(gpc);
        const fill=isCh?cCol:isSc?'#fecaca':'white';
        const stroke=isSc||isCh?'#ef4444':'#ddd', sw=isSc||isCh?1.5:0.5;
        wk+=`<rect x="${x}" y="1" width="${KW-1}" height="${KH}" rx="2" fill="${fill}" stroke="${isCh?cCol:stroke}" stroke-width="${sw}"/>`;
        if(isSc||isCh) lb+=`<text x="${x+(KW-1)/2}" y="${KH-3}" text-anchor="middle" font-size="7.5" fill="${isCh?'#fff':'#ef4444'}" font-weight="800">${nn(gpc)}</text>`;
      });
      bDef.forEach(({pc,ox:bx})=>{
        const midi=base+pc, gpc=midi%12;
        const isCh=chSet.has(midi), isSc=scSet.has(gpc);
        const fill=isCh?cCol:isSc?'#ef4444':'#1a1a1a';
        bk+=`<rect x="${ox+bx}" y="1" width="${BW}" height="${BH}" rx="1" fill="${fill}"/>`;
        if(isSc||isCh) lb+=`<text x="${ox+bx+BW/2}" y="${BH-2}" text-anchor="middle" font-size="6" fill="#fff" font-weight="800">${nn(gpc)}</text>`;
      });
    }
    return `<svg width="100%" viewBox="0 0 ${TW} ${KH+2}" style="border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;display:block"><rect width="${TW}" height="${KH+2}" fill="#c8c8c8"/>${wk}${bk}${lb}</svg>`;
  };

  const getDiatonic = (root, intervals) => {
    const len=intervals.length;
    if(len<3) return [];
    return intervals.map((iv,deg)=>{
      const cRoot=(root+iv)%12;
      const t3Int=(intervals[(deg+2)%len]-iv+12)%12 || 12;
      let t5Int=(intervals[(deg+4)%len]-iv+12)%12;
      if(t5Int<=t3Int) t5Int+=12;
      let sym='',qcls='M',typeName='Major';
      if(t3Int===4&&t5Int===7){sym='';qcls='M';typeName='Major';}
      else if(t3Int===3&&t5Int===7){sym='m';qcls='m';typeName='minor';}
      else if(t3Int===3&&t5Int===6){sym='°';qcls='d';typeName='dim';}
      else if(t3Int===4&&t5Int===8){sym='+';qcls='a';typeName='aug';}
      else{sym='';qcls='M';typeName='Major';}
      const RNUMS=['I','II','III','IV','V','VI','VII','VIII'].slice(0,len);
      const deg_label=qcls==='m'||qcls==='d'?RNUMS[deg].toLowerCase()+sym:RNUMS[deg]+sym;
      const rm=60+(cRoot+12)%12;
      let midis=[rm, rm+t3Int, rm+t5Int];
      midis=midis.map(m=>{ while(m<KB0)m+=12; while(m>KB0+nOcts*12-1)m-=12; return m; });
      const noteNames=midis.map(m=>nn(m)).join(' · ');
      return {name:nn(cRoot)+sym, deg_label, midis, sym, typeName, noteNames};
    });
  };

  const render = () => {
    const def=SCALE_DEFS[selScale];
    const ivs=def.intervals;
    const scalePCs=ivs.map(i=>(selRoot+i)%12);
    const chords=getDiatonic(selRoot,ivs);
    const chord=chords[selChordIdx];
    const CHORD_COLORS=['#ef4444','#f97316','#eab308','#22c55e','#06b6d4','#8b5cf6','#ec4899','#10b981','#3b82f6','#f43f5e','#14b8a6','#a855f7'];
    const chordKbColor=selChordIdx>=0?CHORD_COLORS[selChordIdx%CHORD_COLORS.length]:null;
    const kbSvg=buildKb(scalePCs, chord?.midis||null, chordKbColor);
    const scaleNotes=scalePCs.map(pc=>nn(pc));
    const panel=app.querySelector('#scales-panel');
    if(!panel) return;
    const rootBtns=NMS.map((_,i)=>{
      const lbl=USE_FLAT.has(i)?NMF[i]:NMS[i];
      const on=i===selRoot;
      return `<button data-sroot="${i}" style="flex:0 0 auto;padding:7px 11px;border-radius:10px;font-weight:${on?800:500};font-size:13px;background:${on?'var(--p)':'var(--card)'};color:${on?'#fff':'var(--fg)'};border:1.5px solid ${on?'var(--p)':'#3a3a4a'};cursor:pointer">${lbl}</button>`;
    }).join('');
    const scaleBtns=Object.entries(SCALE_DEFS).map(([name])=>{
      const on=name===selScale;
      return `<button data-sscale="${name}" style="flex:0 0 auto;padding:6px 11px;border-radius:10px;font-weight:${on?700:500};font-size:12px;background:${on?'var(--p)':'var(--card)'};color:${on?'#fff':'var(--fg)'};border:1.5px solid ${on?'var(--p)':'#3a3a4a'};cursor:pointer">${name}</button>`;
    }).join('');
    const noteChips=scaleNotes.map(n=>`<span style="display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;background:#ef444420;color:#ef4444;font-weight:800;font-size:12px;border:2px solid #ef444460">${n}</span>`).join('');
    const chordBtns=chords.map((ch,i)=>{
      const on=i===selChordIdx;
      const col=CHORD_COLORS[i%CHORD_COLORS.length];
      const bg=on?col:`${col}18`, fg=on?'#fff':col, bd=on?col:`${col}55`;
      return `<button data-schord="${i}" style="display:flex;flex-direction:column;align-items:center;gap:2px;padding:9px 12px;border-radius:14px;background:${bg};color:${fg};border:2px solid ${bd};cursor:pointer;min-width:64px;text-align:center">
        <span style="font-size:10px;font-weight:700;opacity:.8">${ch.deg_label}</span>
        <span style="font-weight:900;font-size:16px;line-height:1">${ch.name}</span>
        <span style="font-size:10px;font-weight:600;opacity:.85;margin-top:1px">${ch.typeName}</span>
        <span style="font-size:9px;opacity:.7;margin-top:2px;letter-spacing:.2px">${ch.noteNames}</span>
      </button>`;
    }).join('');
    panel.innerHTML=`
      <div style="font-size:18px;font-weight:800;color:var(--p);margin-bottom:10px">${nn(selRoot)} ${selScale}</div>
      <div style="overflow-x:auto;display:flex;gap:6px;flex-wrap:nowrap;padding-bottom:4px;margin-bottom:10px;-webkit-overflow-scrolling:touch">${rootBtns}</div>
      <div style="overflow-x:auto;display:flex;gap:6px;flex-wrap:nowrap;padding-bottom:4px;margin-bottom:14px;-webkit-overflow-scrolling:touch">${scaleBtns}</div>
      <div style="margin-bottom:10px">${kbSvg}</div>
      <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:14px;align-items:center">${noteChips}</div>
      ${chords.length?`<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--muted);margin-bottom:10px">Diatonic Chords — tap to hear &amp; highlight</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">${chordBtns}</div>`:''}
    `;
    panel.querySelectorAll('[data-sroot]').forEach(b=>b.addEventListener('click',()=>{ selRoot=+b.dataset.sroot; selChordIdx=-1; localStorage.setItem('np.scales',JSON.stringify({root:selRoot,scale:selScale})); render(); }));
    panel.querySelectorAll('[data-sscale]').forEach(b=>b.addEventListener('click',()=>{ selScale=b.dataset.sscale; selChordIdx=-1; localStorage.setItem('np.scales',JSON.stringify({root:selRoot,scale:selScale})); render(); }));
    panel.querySelectorAll('[data-schord]').forEach(b=>b.addEventListener('click',()=>{
      const i=+b.dataset.schord;
      selChordIdx=selChordIdx===i?-1:i;
      if(selChordIdx>=0){ unlockAudio(); chords[i].midis.forEach(m=>playNote(m,{voice:settings.voice,volume:settings.volume/100})); }
      render();
    }));
  };

  app.innerHTML=`<section class="view">
    <div class="top"><a class="iconbtn" href="#/practice">${icon('back')}</a><h1>Scale Explorer</h1><span style="width:42px"></span></div>
    <div class="card pad" id="scales-panel" style="padding:16px"></div>
  </section>`;
  render();
};

// ── Shared drum patterns (used by Chords Practice + Chords Library) ──────
const DRUM_GENRES = {
  '🥁 Rock':[
    {name:'Standard',    k:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
    {name:'Kick Groove', k:[1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
    {name:'Half-Time',   k:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
    {name:'16th Hats',   k:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]},
    {name:'Double Kick', k:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
    {name:'Driving',     k:[1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
    {name:'Punk',        k:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
    {name:'Ballad',      k:[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],s:[0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],h:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]},
    {name:'Prog',        k:[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,1,0,0,1,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
    {name:'Stadium',     k:[1,0,0,0,1,0,0,0,1,0,1,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,1,0],h:[1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0]},
  ],
  '🎤 Hip-Hop':[
    {name:'Boom Bap',    k:[1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0]},
    {name:'Classic',     k:[1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]},
    {name:'Trap',        k:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]},
    {name:'Modern',      k:[1,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
    {name:'Boom Bap 2',  k:[1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0],h:[1,0,1,0,1,0,0,0,1,0,1,0,1,0,0,0]},
    {name:'Lo-Fi',       k:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1]},
    {name:'Drill',       k:[1,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0],h:[1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1]},
    {name:'Hyphy',       k:[1,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,1,1,0,0,1,0,1,0,1,1,0,0,1,0]},
    {name:'Cloud Rap',   k:[1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],s:[0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0],h:[1,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0]},
    {name:'Grime',       k:[1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0],s:[0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0],h:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]},
  ],
  '🎷 Jazz':[
    {name:'Swing',       k:[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],s:[0,0,0,0,0,0,.5,0,0,0,0,0,0,0,.5,0],h:[1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0]},
    {name:'Bossa',       k:[1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0],s:[0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
    {name:'Cool',        k:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,.5,0,0,0,0,0,0,0,.5,0,0,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
    {name:'Be-Bop',      k:[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],s:[0,0,0,0,.3,0,0,0,0,0,0,0,.3,0,0,0],h:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]},
    {name:'Waltz',       k:[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0],h:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]},
    {name:'Funk Jazz',   k:[1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
    {name:'Latin Jazz',  k:[1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0],s:[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
    {name:'Gospel Jazz', k:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0],h:[1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0]},
    {name:'Free',        k:[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0],s:[0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1],h:[1,0,1,0,1,1,0,0,1,0,1,0,1,1,0,0]},
    {name:'Fusion',      k:[1,0,0,0,0,0,1,0,1,0,0,1,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1],h:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]},
  ],
  '🌴 Reggae':[
    {name:'One Drop',    k:[0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],h:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]},
    {name:'Steppers',    k:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
    {name:'Rockers',     k:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
    {name:'Ska',         k:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0]},
    {name:'Dancehall',   k:[1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
    {name:'Nyahbinghi',  k:[1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0],h:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]},
    {name:'Dub',         k:[1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],s:[0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],h:[1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]},
    {name:'Rocksteady',  k:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0],h:[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0]},
    {name:'Ragga',       k:[1,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0]},
    {name:'Mento',       k:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
  ],
  '💃 Latin':[
    {name:'Bossa Nova',  k:[1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0],s:[0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
    {name:'Salsa',       k:[1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0],s:[0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
    {name:'Samba',       k:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],s:[0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0],h:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]},
    {name:'Cha-Cha',     k:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,1,0,0,0,0,0,1,0,1,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
    {name:'Mambo',       k:[1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
    {name:'Cumbia',      k:[1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],s:[0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
    {name:'Tango',       k:[1,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0],s:[0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0],h:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]},
    {name:'Merengue',    k:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]},
    {name:'Bachata',     k:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0],s:[0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
    {name:'Flamenco',    k:[1,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0],s:[0,1,0,0,0,1,0,0,1,0,0,0,1,0,0,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
  ],
  '🎧 EDM':[
    {name:'Four/Floor',  k:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
    {name:'House',       k:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]},
    {name:'Techno',      k:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],s:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
    {name:'Trap EDM',    k:[1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,1,1,1,0,0,1,1,1,1,1,1,0,0,1,1]},
    {name:'Future Bass', k:[1,0,0,0,1,1,0,0,1,0,0,0,1,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
    {name:'Big Room',    k:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]},
    {name:'Dubstep',     k:[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],s:[0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],h:[1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0]},
    {name:'Drum & Bass', k:[1,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]},
    {name:'Trance',      k:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0]},
    {name:'Ambient',     k:[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],s:[0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0]},
  ],
  '🎸 Funk':[
    {name:'Classic',     k:[1,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]},
    {name:'JB Groove',   k:[1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],h:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]},
    {name:'Funky Drummer',k:[1,0,1,0,0,0,0,0,1,0,1,0,0,0,0,0],s:[0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0],h:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]},
    {name:'Groove',      k:[1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]},
    {name:'Heavy',       k:[1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]},
    {name:'P-Funk',      k:[1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,1,0,1,0,0,0],h:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]},
    {name:'Neo-Soul',    k:[1,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0],s:[0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0],h:[1,0,1,1,0,0,1,0,1,0,1,1,0,0,1,0]},
    {name:'G-Funk',      k:[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,1,0,0,1,0,0,1,1,1,0,0,1,0,0,1]},
    {name:'Minneapolis', k:[1,0,0,1,0,0,0,0,1,0,0,0,0,0,1,0],s:[0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],h:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]},
    {name:'New Jack',    k:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0],h:[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0]},
  ],
  '🎼 Blues':[
    {name:'Shuffle',     k:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0]},
    {name:'12-Bar',      k:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
    {name:'Slow',        k:[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]},
    {name:'Jump',        k:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0]},
    {name:'Chicago',     k:[1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0]},
    {name:'Texas',       k:[1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0]},
    {name:'Gospel',      k:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
    {name:'Delta',       k:[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],s:[0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],h:[1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0]},
    {name:'Boogie',      k:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0]},
    {name:'Acoustic',    k:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,1,0,0,0,0,0,1,0,1,0,0,0,0,0]},
  ],
  '🤘 Metal':[
    {name:'Blast Beat',  k:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],s:[0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
    {name:'Double Bass', k:[1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
    {name:'Thrash',      k:[1,0,1,1,0,0,1,0,1,0,1,1,0,0,1,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]},
    {name:'Death Metal', k:[1,1,1,0,1,1,0,1,1,1,1,0,1,1,0,1],s:[0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
    {name:'Groove Metal',k:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
    {name:'Power Metal', k:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]},
    {name:'Nu-Metal',    k:[1,0,0,1,0,0,1,0,1,0,0,1,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,1,0,1,0,0,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
    {name:'Djent',       k:[1,0,0,0,0,1,0,0,0,0,1,0,0,0,1,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]},
    {name:'Black Metal', k:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
    {name:'Post-Metal',  k:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],h:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]},
  ],
  '🤠 Country':[
    {name:'Twostep',     k:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
    {name:'Honky Tonk',  k:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0]},
    {name:'Shuffle',     k:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0]},
    {name:'Waltz',       k:[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0],h:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]},
    {name:'Bro Country', k:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]},
    {name:'Outlaw',      k:[1,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
    {name:'Bluegrass',   k:[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0]},
    {name:'Boot Scoot',  k:[1,0,1,0,0,0,0,0,1,0,1,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
    {name:'Western',     k:[1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1],h:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]},
    {name:'Acoustic',    k:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,1,0,0,0,0,0,1,0,1,0,0,0,0,0]},
  ],
  '🎵 R&B':[
    {name:'Classic RnB', k:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,1,1,0,0,1,0,1,0,1,1,0,0,1,0]},
    {name:'Soul',        k:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
    {name:'Neo Soul',    k:[1,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0],h:[1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0]},
    {name:'Contemporary',k:[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
    {name:'Quiet Storm', k:[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1]},
    {name:'Trap Soul',   k:[1,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0],h:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]},
    {name:'Gospel',      k:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
    {name:'Motown',      k:[1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]},
    {name:'Old School',  k:[1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0]},
    {name:'Alt RnB',     k:[1,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0],h:[1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0]},
  ],
  '🌍 Afrobeat':[
    {name:'Classic Afro', k:[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0],s:[0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
    {name:'Afropop',     k:[1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,1,1,0,0,1,0,1,0,1,1,0,0,1,0]},
    {name:'Highlife',    k:[1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0],s:[0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
    {name:'Jùjú',        k:[1,0,0,1,0,0,0,0,1,0,0,0,1,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,1,0,1,0,1,1,0,1,1,0,1,0,1,1,0]},
    {name:'Amapiano',    k:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
    {name:'Afrofusion',  k:[1,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0],h:[1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0]},
    {name:'Afroswing',   k:[1,0,0,1,0,0,0,0,1,0,0,0,0,0,1,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,1,1,1,0,1,0,1,0,1,1,1,0,1,0]},
    {name:'Azonto',      k:[1,0,0,0,1,0,1,0,0,0,0,0,1,0,0,0],s:[0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
    {name:'Burna Style', k:[1,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0],h:[1,0,1,0,1,1,0,0,1,0,1,0,1,1,0,0]},
    {name:'Kizomba',     k:[1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1]},
  ],
};

// ── Chords Practice ──────────────────────────────────────────────────────
views.chordsPractice = () => {
  setNav('practice');
  const SCALE_DEFS = {
    'Major':           { intervals:[0,2,4,5,7,9,11] },
    'Minor':           { intervals:[0,2,3,5,7,8,10] },
    'Harmonic Minor':  { intervals:[0,2,3,5,7,8,11] },
    'Melodic Minor':   { intervals:[0,2,3,5,7,9,11] },
    'Dorian':          { intervals:[0,2,3,5,7,9,10] },
    'Mixolydian':      { intervals:[0,2,4,5,7,9,10] },
    'Phrygian':        { intervals:[0,1,3,5,7,8,10] },
    'Lydian':          { intervals:[0,2,4,6,7,9,11] },
    'Major Blues':     { intervals:[0,2,3,4,7,9] },
    'Minor Blues':     { intervals:[0,3,5,6,7,10] },
    'Major Penta':     { intervals:[0,2,4,7,9] },
    'Minor Penta':     { intervals:[0,3,5,7,10] },
  };
  const NMS = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const NMF = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
  const USE_FLAT = new Set([1,3,5,8,10]);
  const nn = (pc) => USE_FLAT.has(pc%12) ? NMF[pc%12] : NMS[pc%12];
  const CHORD_COLORS=['#ef4444','#f97316','#eab308','#22c55e','#06b6d4','#8b5cf6','#ec4899','#10b981','#3b82f6','#f43f5e','#14b8a6','#a855f7'];

  const saved = JSON.parse(localStorage.getItem('np.cpractice') || '{}');
  let selRoot = saved.root||0, selScale = (saved.scale && SCALE_DEFS[saved.scale]) ? saved.scale : 'Major';
  let selChordIdx = -1, selAdvIdx = -1, playTimer = null, playIdx = 0;
  let showScale = true;
  let cpLoop = saved.loop || false;
  let cpShuffle = saved.shuffle || false;
  let cpInversion = saved.inversion ?? 0;
  let cpVoice = saved.voice || 'grand';
  let cpTempo = saved.tempo || 100;
  let cpDrums = saved.drums || false;
  let cpDrumGenre = saved.drumGenre || '🥁 Rock';
  let cpDrumPat = saved.drumPat ?? 'mixed'; // number 0-5 = locked pattern, 'mixed' = cycle
  let cpDrumPatIdx = 0;
  let drumTimer = null, drumBeat = 0;
  let lastPlayedMidis = null;

  const INV_OPTS = [{v:0,l:'Root'},{v:1,l:'1st Inv'},{v:2,l:'2nd Inv'},{v:3,l:'3rd Inv'},{v:'best',l:'Best'},{v:'random',l:'Random'}];

  // Random Practice state
  let rpTimer = null, rpSeq = [], rpPos = 0, rpActiveIdx = -1, rpInvOn = false, rpLoop = true, rpBassOn = false;
  let rpCurrentBassMidis = [];   // the 5 bass MIDI notes of the current chord's pattern
  let rpCurrentBassNames = [];   // readable note names for those bass notes
  const rpSavedKey = 'np.rpractice';
  { const s=JSON.parse(localStorage.getItem(rpSavedKey)||'{}'); rpInvOn=s.inv||false; rpLoop=s.loop!==false; rpBassOn=s.bass||false; }
  const saveRp = () => localStorage.setItem(rpSavedKey, JSON.stringify({inv:rpInvOn,loop:rpLoop,bass:rpBassOn}));

  // Bass pattern engine — 6 variations per quality, randomly picked each chord
  // indices: 0=root, 1=3rd/b3rd, 2=5th, 3=7th
  const BASS_PATTERNS = {
    'M':    [[0,2,0,1,2],[0,1,2,1,0],[0,0,2,0,1],[0,2,1,2,0],[0,1,0,2,0],[0,2,2,1,0]],
    'm':    [[0,2,0,1,2],[0,1,2,0,2],[0,0,1,0,2],[0,2,0,2,1],[0,1,2,1,2],[0,0,2,1,2]],
    '7':    [[0,2,3,1,2],[0,1,3,2,0],[0,3,2,1,0],[0,2,1,3,0],[0,0,3,2,1],[0,1,2,3,0]],
    'maj7': [[0,2,3,1,2],[0,1,2,3,0],[0,3,2,1,0],[0,2,1,3,2],[0,1,3,2,0],[0,0,2,3,1]],
    'm7':   [[0,2,3,1,2],[0,1,3,0,2],[0,3,1,2,0],[0,2,0,3,1],[0,1,2,3,1],[0,0,3,1,2]],
    'dim':  [[0,1,2,0,1],[0,2,1,0,2],[0,0,1,2,1],[0,1,0,2,0],[0,2,0,1,0],[0,1,2,1,0]],
    'ø':    [[0,1,2,3,0],[0,2,3,1,0],[0,3,1,2,0],[0,1,3,2,0],[0,2,1,3,0],[0,0,2,3,1]],
    'aug':  [[0,1,2,0,2],[0,2,1,0,1],[0,0,1,2,0],[0,2,0,1,2],[0,1,0,2,1],[0,2,2,1,0]],
  };
  const qualToBassKey = (ch) => {
    const t = (ch.typeName||'').toLowerCase();
    const s = (ch.sym||'');
    if(t==='maj7'||s==='maj7') return 'maj7';
    if(t==='dom7'||t==='7th'||s==='7') return '7';
    if(t==='min7'||s==='m7') return 'm7';
    if(t==='half-dim'||s==='ø7') return 'ø';
    if(t==='dim7'||t==='dim'||s==='°'||s==='°7') return 'dim';
    if(t==='aug7'||t==='augmaj7'||s==='+'||s==='+7') return 'aug';
    if(t==='minor'||s==='m') return 'm';
    if(t==='major') return 'M';
    return 'M';
  };
  const playBassPattern = (ch, durSec, opts) => {
    // Root midi in bass octave 2 (MIDI 36–47)
    const rootPc = ch.midis[0] % 12;
    const bassRoot = 36 + rootPc;
    // Chord tones in bass octave — keep within 36–55
    const tones = ch.midis.map(m => {
      let b = 36 + (m % 12);
      if(b > 55) b -= 12;
      return b;
    });
    const key = qualToBassKey(ch);
    const variants = BASS_PATTERNS[key] || BASS_PATTERNS['M'];
    const pattern = variants[Math.floor(Math.random() * variants.length)];
    // Resolve the 5 midi notes for this pattern
    const patternMidis = pattern.map(toneIdx => tones[Math.min(toneIdx, tones.length-1)] ?? bassRoot);
    // Save for keyboard display (unique set in order of first appearance)
    const seen = new Set();
    rpCurrentBassMidis = patternMidis.filter(m => { if(seen.has(m)) return false; seen.add(m); return true; });
    rpCurrentBassNames = rpCurrentBassMidis.map(m => nn(m%12));
    // Space 5 hits across the chord duration
    const step = durSec / 5;
    patternMidis.forEach((midi, i) => {
      const when = i * step;
      setTimeout(() => playNote(midi, {
        voice: 'soft',
        volume: (opts.volume||0.7) * 0.72,
        velocity: i === 0 ? 0.85 : 0.6,
        duration: step * 0.85,
        when: 0
      }), when * 1000);
    });
  };
  const stopRp = () => { if(rpTimer){clearInterval(rpTimer);rpTimer=null;} rpCurrentBassMidis=[]; rpCurrentBassNames=[]; };
  // Fisher-Yates shuffle
  const shuffle = arr => { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };
  // Build next permutation block so all chords appear before repeating
  const rpNextBlock = (len) => shuffle([...Array(len)].map((_,i)=>i));
  const rpResolveInv = (midis) => {
    if(!rpInvOn) return midis;
    const maxInv = Math.min(2, midis.length-1);
    return invertChord(midis, Math.floor(Math.random()*(maxInv+1)));
  };
  const invertChord = (midis, inv) => {
    if(inv===0||!midis.length) return midis;
    const m=[...midis];
    for(let i=0;i<inv&&i<m.length-1;i++) m.push(m.shift()+12);
    return m;
  };
  const bestInversion = (midis, maxInv, prev) => {
    if(!prev||!prev.length) return midis;
    const prevAvg=prev.reduce((a,b)=>a+b,0)/prev.length;
    let best=midis, bestDist=Infinity;
    for(let inv=0;inv<=maxInv;inv++){
      const m=invertChord(midis,inv);
      const avg=m.reduce((a,b)=>a+b,0)/m.length;
      const d=Math.abs(avg-prevAvg);
      if(d<bestDist){bestDist=d;best=m;}
    }
    return best;
  };
  const resolveInversion = (midis, maxInv) => {
    if(cpInversion==='best') return bestInversion(midis,maxInv,lastPlayedMidis);
    if(cpInversion==='random') return invertChord(midis,Math.floor(Math.random()*(maxInv+1)));
    return invertChord(midis,Math.min(cpInversion,maxInv));
  };
  const CP_VOICES = {grand:'Grand Piano',bright:'Bright',electric:'Electric',soft:'Soft',synth:'Synth',organ:'Organ',edm:'EDM'};
  const saveCp = () => localStorage.setItem('np.cpractice',JSON.stringify({root:selRoot,scale:selScale,showScale,loop:cpLoop,shuffle:cpShuffle,inversion:cpInversion,voice:cpVoice,tempo:cpTempo,drums:cpDrums,drumGenre:cpDrumGenre,drumPat:cpDrumPat}));
  // Schedule one bar of drums using Web Audio time — perfectly synced to each chord tick
  const scheduleDrumBar = (durSec) => {
    if (!cpDrums) return;
    const genre = DRUM_GENRES[cpDrumGenre] || DRUM_GENRES['🥁 Rock'];
    const pat = cpDrumPat === 'mixed' ? genre[cpDrumPatIdx % genre.length] : genre[Math.min(cpDrumPat, genre.length - 1)];
    cpDrumPatIdx++;
    const step = durSec / 16;
    const dv = (settings.drumVolume ?? 80) / 100;
    for (let i = 0; i < 16; i++) {
      if (pat.k[i]) playKick(i * step, pat.k[i] * 0.7 * dv);
      if (pat.s[i]) playSnare(i * step, pat.s[i] * 0.5 * dv);
      if (pat.h[i]) playHihat(i * step, pat.h[i] * 0.22 * dv, false);
    }
  };
  const startDrums = () => {};   // no-op — drums now fire per chord tick
  const stopDrums = () => { if (drumTimer) { clearInterval(drumTimer); drumTimer = null; } drumBeat = 0; };

  const KW=14, KH=58, BW=9, BH=36, octW=7*KW, nOcts=3, KB0=48;
  const TW = nOcts*octW+1;
  const wPC=[0,2,4,5,7,9,11];
  const bDef=[{pc:1,ox:10},{pc:3,ox:24},{pc:6,ox:52},{pc:8,ox:66},{pc:10,ox:80}];

  const buildKb = (scalePCs, chordMidis, chordColor, bassMidis) => {
    const scSet=new Set(showScale?scalePCs:[]);
    const chSet=new Set(chordMidis||[]);
    const bsSet=new Set((bassMidis||[]).map(m=>{ let n=m; while(n<48)n+=12; while(n>59)n-=12; return n; }));
    const BASS_COL='#0891b2';
    const cCol=chordColor||'var(--p)';
    let wk='', bk='', lb='';
    for(let o=0;o<nOcts;o++){
      const ox=o*octW, base=KB0+o*12;
      wPC.forEach((pc,wi)=>{
        const midi=base+pc, gpc=midi%12, x=ox+wi*KW+1;
        const isCh=chSet.has(midi), isBs=bsSet.has(midi), isSc=scSet.has(gpc);
        const fill=isCh?cCol:isBs?BASS_COL:isSc?'#fecaca':'white';
        const stroke=isCh?cCol:isBs?BASS_COL:isSc?'#ef4444':'#ddd';
        const sw=isCh||isBs||isSc?1.5:0.5;
        wk+=`<rect x="${x}" y="1" width="${KW-1}" height="${KH}" rx="2" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
        if(isCh||isBs||isSc) lb+=`<text x="${x+(KW-1)/2}" y="${KH-3}" text-anchor="middle" font-size="7.5" fill="${isCh||isBs?'#fff':'#ef4444'}" font-weight="800">${nn(gpc)}</text>`;
      });
      bDef.forEach(({pc,ox:bx})=>{
        const midi=base+pc, gpc=midi%12;
        const isCh=chSet.has(midi), isBs=bsSet.has(midi), isSc=scSet.has(gpc);
        const fill=isCh?cCol:isBs?BASS_COL:isSc?'#ef4444':'#1a1a1a';
        bk+=`<rect x="${ox+bx}" y="1" width="${BW}" height="${BH}" rx="1" fill="${fill}"/>`;
        if(isCh||isBs||isSc) lb+=`<text x="${ox+bx+BW/2}" y="${BH-2}" text-anchor="middle" font-size="6" fill="#fff" font-weight="800">${nn(gpc)}</text>`;
      });
    }
    return `<svg width="100%" viewBox="0 0 ${TW} ${KH+2}" style="border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;display:block"><rect width="${TW}" height="${KH+2}" fill="#c8c8c8"/>${wk}${bk}${lb}</svg>`;
  };

  const getDiatonic = (root, intervals) => {
    const len=intervals.length;
    if(len<3) return [];
    const scPCs=new Set(intervals.map(i=>(root+i)%12));
    return intervals.map((iv,deg)=>{
      const cRoot=(root+iv)%12;
      const has3=scPCs.has((cRoot+4)%12), has3m=scPCs.has((cRoot+3)%12);
      const has5=scPCs.has((cRoot+7)%12), has5d=scPCs.has((cRoot+6)%12), has5a=scPCs.has((cRoot+8)%12);
      let t3Int=has3?4:has3m?3:4;
      let t5Int=has5?7:has5d?6:has5a?8:7;
      let sym='',typeName='Major';
      if(t3Int===4&&t5Int===7){sym='';typeName='Major';}
      else if(t3Int===3&&t5Int===7){sym='m';typeName='minor';}
      else if(t3Int===3&&t5Int===6){sym='°';typeName='dim';}
      else if(t3Int===4&&t5Int===8){sym='+';typeName='aug';}
      else{sym='';typeName='Major';}
      const RNUMS=['I','II','III','IV','V','VI','VII','VIII'].slice(0,len);
      const deg_label=(typeName==='minor'||typeName==='dim')?RNUMS[deg].toLowerCase()+sym:RNUMS[deg]+sym;
      const rm=60+(cRoot+12)%12;
      let midis=[rm, rm+t3Int, rm+t5Int];
      midis=midis.map(m=>{ while(m<KB0)m+=12; while(m>KB0+nOcts*12-1)m-=12; return m; });
      const noteNames=midis.map(m=>nn(m)).join(' · ');
      return {name:nn(cRoot)+sym, deg_label, midis, typeName, noteNames};
    });
  };

  const getDiatonic7th = (root, intervals) => {
    const len=intervals.length;
    if(len<4) return [];
    const scPCs=new Set(intervals.map(i=>(root+i)%12));
    return intervals.map((iv,deg)=>{
      const cRoot=(root+iv)%12;
      const has3=scPCs.has((cRoot+4)%12), has3m=scPCs.has((cRoot+3)%12);
      const has5=scPCs.has((cRoot+7)%12), has5d=scPCs.has((cRoot+6)%12), has5a=scPCs.has((cRoot+8)%12);
      const has7M=scPCs.has((cRoot+11)%12), has7m=scPCs.has((cRoot+10)%12), has7d=scPCs.has((cRoot+9)%12);
      let t3=has3?4:has3m?3:4;
      let t5=has5?7:has5d?6:has5a?8:7;
      let t7=has7M?11:has7m?10:has7d?9:11;
      let sym='', typeName='';
      if(t3===4&&t5===7&&t7===11){sym='maj7';typeName='maj7';}
      else if(t3===4&&t5===7&&t7===10){sym='7';typeName='dom7';}
      else if(t3===3&&t5===7&&t7===10){sym='m7';typeName='min7';}
      else if(t3===3&&t5===7&&t7===11){sym='mMaj7';typeName='minMaj7';}
      else if(t3===3&&t5===6&&t7===10){sym='ø7';typeName='half-dim';}
      else if(t3===3&&t5===6&&t7===9){sym='°7';typeName='dim7';}
      else if(t3===4&&t5===8&&t7===10){sym='+7';typeName='aug7';}
      else if(t3===4&&t5===8&&t7===11){sym='+maj7';typeName='augMaj7';}
      else{sym='7';typeName='7th';}
      const RNUMS=['I','II','III','IV','V','VI','VII','VIII'].slice(0,len);
      const isMinor=t3===3;
      const deg_label=(isMinor?RNUMS[deg].toLowerCase():RNUMS[deg])+sym;
      const rm=60+(cRoot+12)%12;
      let midis=[rm, rm+t3, rm+t5, rm+t7];
      midis=midis.map(m=>{ while(m<KB0)m+=12; while(m>KB0+nOcts*12-1)m-=12; return m; });
      const noteNames=midis.map(m=>nn(m)).join(' · ');
      return {name:nn(cRoot)+sym, deg_label, midis, typeName, noteNames};
    });
  };

  const stopPlay = () => { if(playTimer){clearInterval(playTimer);playTimer=null;} stopRp(); rpActiveIdx=-1; stopDrums(); };

  const render = () => {
    const def=SCALE_DEFS[selScale];
    const ivs=def.intervals;
    const scalePCs=ivs.map(i=>(selRoot+i)%12);
    const chords=getDiatonic(selRoot,ivs);
    const adv=getDiatonic7th(selRoot,ivs);
    const maxInvTriad=typeof cpInversion==='number'?Math.min(cpInversion,2):2;
    const maxInv7=typeof cpInversion==='number'?Math.min(cpInversion,3):3;
    const allPool=[...chords,...adv];
    const rpChord = rpTimer!==null&&rpActiveIdx>=0 ? allPool[rpActiveIdx] : null;
    const activeChord=rpChord||(selChordIdx>=0?chords[selChordIdx]:selAdvIdx>=0?adv[selAdvIdx]:null);
    const activeMidis=activeChord?(rpChord?lastPlayedMidis:resolveInversion(activeChord.midis,selChordIdx>=0?maxInvTriad:maxInv7)):null;
    const activeColor=rpChord?CHORD_COLORS[rpActiveIdx%CHORD_COLORS.length]:selChordIdx>=0?CHORD_COLORS[selChordIdx%CHORD_COLORS.length]:selAdvIdx>=0?CHORD_COLORS[selAdvIdx%CHORD_COLORS.length]:null;
    const activeBass = rpBassOn && rpTimer !== null && rpCurrentBassMidis.length ? rpCurrentBassMidis : null;
    const kbSvg=buildKb(scalePCs, activeMidis, activeColor, activeBass);
    const scaleNotes=scalePCs.map(pc=>nn(pc));

    // Bass note names below keyboard
    const bassNamesHtml = activeBass
      ? `<div style="font-size:11px;font-weight:700;color:#0891b2;margin-top:4px;margin-bottom:2px">Bass: ${rpCurrentBassNames.join(' · ')}</div>`
      : '';

    // Compute now-playing label — single horizontal row: Bass | Now Playing | Next
    let nowPlayingHtml = '';
    if(activeChord && activeMidis) {
      const INV_NAMES_CP = ['Root Position','1st Inversion','2nd Inversion','3rd Inversion'];
      const rootPCs = activeChord.midis.map(m=>m%12);
      const bassPC = activeMidis[0]%12;
      const invIdx = rootPCs.indexOf(bassPC);
      const invName = INV_NAMES_CP[invIdx] ?? 'Root Position';
      const col = activeColor || 'var(--p)';

      // LEFT — bass section
      const bassSection = (rpBassOn && rpTimer !== null && rpCurrentBassNames.length)
        ? `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;min-width:80px">
            <span style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#0891b2">Bass</span>
            <span style="font-size:13px;font-weight:800;color:#0891b2;line-height:1.2;text-align:center">${rpCurrentBassNames.join(' · ')}</span>
          </div>`
        : `<div style="min-width:80px"></div>`;

      // CENTER — now playing
      const nowPlayingCenter = `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;flex:1">
          <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted)">Now Playing</span>
          <span style="font-size:26px;font-weight:900;color:${col};line-height:1.1">${activeChord.name}</span>
          <span style="font-size:12px;font-weight:600;color:${col};opacity:.8">${invName}</span>
        </div>`;

      // RIGHT — next chords
      let nextSection = `<div style="min-width:80px"></div>`;
      if(rpTimer !== null && rpSeq.length > 0) {
        const nextItems = rpSeq.slice(rpPos, rpPos + 2).map(idx => {
          const ch = allPool[idx];
          if(!ch) return '';
          const c = CHORD_COLORS[idx % CHORD_COLORS.length];
          return `<div style="display:flex;flex-direction:column;align-items:center;gap:1px">
            <span style="font-size:8px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.5px">next</span>
            <span style="font-size:14px;font-weight:800;color:${c};line-height:1">${ch.name}</span>
            <span style="font-size:8px;font-weight:600;color:${c};opacity:.7">${ch.typeName||''}</span>
          </div>`;
        });
        if(nextItems.length) nextSection = `<div style="display:flex;flex-direction:column;gap:5px;min-width:80px;padding-left:10px;border-left:1.5px solid var(--line)">${nextItems.join('')}</div>`;
      }

      nowPlayingHtml = `<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 4px 4px">
        ${bassSection}${nowPlayingCenter}${nextSection}
      </div>`;
    }

    const rootBtns=NMS.map((_,i)=>{
      const lbl=USE_FLAT.has(i)?NMF[i]:NMS[i];
      const on=i===selRoot;
      return `<button data-cproot="${i}" style="flex:0 0 auto;padding:7px 12px;border-radius:10px;font-weight:${on?800:500};font-size:13px;background:${on?'var(--p)':'var(--card)'};color:${on?'#fff':'var(--fg)'};border:1.5px solid ${on?'var(--p)':'var(--line)'};cursor:pointer">${lbl}</button>`;
    }).join('');

    const scaleBtns=Object.entries(SCALE_DEFS).map(([name])=>{
      const on=name===selScale;
      return `<button data-cpscale="${name}" style="flex:0 0 auto;padding:6px 12px;border-radius:10px;font-weight:${on?700:500};font-size:12px;background:${on?'var(--p)':'var(--card)'};color:${on?'#fff':'var(--fg)'};border:1.5px solid ${on?'var(--p)':'var(--line)'};cursor:pointer">${name}</button>`;
    }).join('');

    const noteChips=scaleNotes.map(n=>`<span style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;background:#ef444420;color:#ef4444;font-weight:800;font-size:12px;border:2px solid #ef444460">${n}</span>`).join('');

    const invLabel=cpInversion==='best'?' — Best':cpInversion==='random'?' — Random':cpInversion>0?' — '+INV_OPTS[cpInversion].l:'';
    const chordCards=chords.map((ch,i)=>{
      const on=i===selChordIdx;
      const col=CHORD_COLORS[i%CHORD_COLORS.length];
      const bg=on?col:`${col}18`, fg=on?'#fff':col, bd=on?col:`${col}55`;
      const im=typeof cpInversion==='number'?invertChord(ch.midis,maxInvTriad):ch.midis;
      const iNotes=im.map(m=>nn(m)).join(' · ');
      const rootOnly=ch.name.replace(/m\b|°|ø|\+/g,'');
      const fullName=rootOnly+' '+(ch.typeName||'');
      return `<button data-cpchord="${i}" style="display:flex;flex-direction:column;align-items:center;gap:3px;padding:10px 14px;border-radius:16px;background:${bg};color:${fg};border:2.5px solid ${bd};cursor:pointer;min-width:68px;text-align:center;transition:all .18s;${on?'transform:scale(1.05);box-shadow:0 4px 18px '+col+'55':''}">
        <span style="font-size:10px;font-weight:700;opacity:.85">${ch.deg_label}</span>
        <span style="font-weight:900;font-size:18px;line-height:1">${ch.name.replace(/[°+]/,'')}</span>
        <span style="font-size:10px;font-weight:700;opacity:.95">${fullName}</span>
        <span style="font-size:9.5px;font-weight:600;opacity:.8">${ch.typeName}${invLabel}</span>
        <span style="font-size:9px;opacity:.7;margin-top:1px">${iNotes}</span>
      </button>`;
    }).join('');

    const advCards=adv.map((ch,i)=>{
      const on=i===selAdvIdx;
      const col=CHORD_COLORS[i%CHORD_COLORS.length];
      const bg=on?col:`${col}18`, fg=on?'#fff':col, bd=on?col:`${col}55`;
      const im=typeof cpInversion==='number'?invertChord(ch.midis,maxInv7):ch.midis;
      const iNotes=im.map(m=>nn(m)).join(' · ');
      const rootOnly7=ch.name.replace(/m\b|°|ø|\+|maj|min|dim|aug|7|9|11|13/gi,'');
      const fullName7=rootOnly7+' '+(ch.typeName||'');
      return `<button data-cpadv="${i}" style="display:flex;flex-direction:column;align-items:center;gap:3px;padding:10px 14px;border-radius:16px;background:${bg};color:${fg};border:2.5px solid ${bd};cursor:pointer;min-width:68px;text-align:center;transition:all .18s;${on?'transform:scale(1.05);box-shadow:0 4px 18px '+col+'55':''}">
        <span style="font-size:10px;font-weight:700;opacity:.85">${ch.deg_label}</span>
        <span style="font-weight:900;font-size:16px;line-height:1">${ch.name.replace(/[°ø+]/g,'')}</span>
        <span style="font-size:10px;font-weight:700;opacity:.95">${fullName7}</span>
        <span style="font-size:9px;font-weight:600;opacity:.8">${ch.typeName}${invLabel}</span>
        <span style="font-size:8.5px;opacity:.7;margin-top:1px">${iNotes}</span>
      </button>`;
    }).join('');

    const isPlaying = playTimer !== null;
    const panel=app.querySelector('#cp-panel');
    if(!panel) return;
    panel.innerHTML=`
      <div style="font-size:20px;font-weight:900;color:var(--p);margin-bottom:12px">${nn(selRoot)} ${selScale}</div>
      <div style="overflow-x:auto;display:flex;gap:6px;flex-wrap:nowrap;padding-bottom:4px;margin-bottom:10px;-webkit-overflow-scrolling:touch">${rootBtns}</div>
      <div style="overflow-x:auto;display:flex;gap:6px;flex-wrap:nowrap;padding-bottom:4px;margin-bottom:14px;-webkit-overflow-scrolling:touch">${scaleBtns}</div>
      <div style="margin-bottom:0px">${kbSvg}</div>
      ${bassNamesHtml}
      ${nowPlayingHtml}
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;align-items:center">
        ${noteChips}
        <button id="cpToggleScale" style="margin-left:auto;padding:5px 10px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;border:1.5px solid #ef444460;background:${showScale?'#ef444420':'var(--card)'};color:${showScale?'#ef4444':'var(--muted)'}">${showScale?'Scale ✓':'Scale'}</button>
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px;padding:10px 12px;border-radius:12px;background:var(--card);border:1px solid var(--line)">
        <button id="cpLoopBtn" style="padding:4px 10px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;border:1.5px solid ${cpLoop?'var(--p)':'var(--line)'};background:${cpLoop?'var(--p)':'transparent'};color:${cpLoop?'#fff':'var(--muted)'}">🔁 Loop</button>
        <button id="cpShuffleBtn" style="padding:4px 10px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;border:1.5px solid ${cpShuffle?'var(--p)':'var(--line)'};background:${cpShuffle?'var(--p)':'transparent'};color:${cpShuffle?'#fff':'var(--muted)'}">🔀 Random</button>
        <select id="cpInvSel" style="padding:4px 8px;border-radius:8px;font-size:11px;font-weight:600;border:1.5px solid var(--line);background:var(--bg);color:var(--fg);cursor:pointer">
          ${INV_OPTS.map(o=>`<option value="${o.v}"${String(o.v)===String(cpInversion)?' selected':''}>${o.l}</option>`).join('')}
        </select>
        <select id="cpVoiceSel" style="padding:4px 8px;border-radius:8px;font-size:11px;font-weight:600;border:1.5px solid var(--line);background:var(--bg);color:var(--fg);cursor:pointer">
          ${Object.entries(CP_VOICES).map(([k,v])=>`<option value="${k}"${k===cpVoice?' selected':''}>${v}</option>`).join('')}
        </select>
        <div style="display:flex;align-items:center;gap:4px;margin-left:auto">
          <span style="font-size:10px;font-weight:700;color:var(--muted)">BPM</span>
          <button id="cpTempoDown" style="width:24px;height:24px;border-radius:6px;border:1px solid var(--line);background:var(--bg);color:var(--fg);cursor:pointer;font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center">−</button>
          <span id="cpTempoVal" style="font-size:13px;font-weight:800;min-width:32px;text-align:center">${cpTempo}</span>
          <button id="cpTempoUp" style="width:24px;height:24px;border-radius:6px;border:1px solid var(--line);background:var(--bg);color:var(--fg);cursor:pointer;font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center">+</button>
        </div>
      </div>
      <div style="margin-bottom:14px">
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;align-items:center">
          <span style="font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;white-space:nowrap">✨ FX</span>
          ${[['none','Dry'],['flanger','Flanger'],['phaser','Phaser'],['saw','Saw'],['pingpong','Ping-Pong'],['reverb','Reverb'],['plucking','Plucking'],['mixed','Mixed']].map(([id,label])=>`<button data-fx="${id}" style="padding:4px 9px;border-radius:8px;font-size:10px;font-weight:700;cursor:pointer;border:1.5px solid ${settings.effect===id?'var(--p)':'var(--line)'};background:${settings.effect===id?'color-mix(in srgb,var(--p) 14%,transparent)':'transparent'};color:${settings.effect===id?'var(--p)':'var(--muted)'};transition:all .15s">${label}</button>`).join('')}
        </div>
        <button id="cpDrumsBtn" style="width:100%;padding:10px;border-radius:${cpDrums?'12px 12px 0 0':'12px'};font-size:14px;font-weight:700;cursor:pointer;border:2px solid ${cpDrums?'#f97316':'var(--line)'};border-bottom:${cpDrums?'none':'2px solid var(--line)'};background:${cpDrums?'#f9731620':'var(--card)'};color:${cpDrums?'#f97316':'var(--muted)'};display:flex;align-items:center;justify-content:center;gap:8px">🥁 Drums ${cpDrums?'ON':'OFF — tap to turn ON'}</button>
        ${cpDrums?`<div style="padding:10px;border-radius:0 0 12px 12px;border:2px solid #f97316;border-top:1px solid #f9731640;background:#f9731610;display:flex;flex-direction:column;gap:8px">
          <div style="display:flex;flex-wrap:wrap;gap:5px">
            ${Object.keys(DRUM_GENRES).map(g=>`<button data-dg="${g}" style="padding:4px 9px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;border:1.5px solid ${g===cpDrumGenre?'#f97316':'var(--line)'};background:${g===cpDrumGenre?'#f97316':'transparent'};color:${g===cpDrumGenre?'#fff':'var(--muted)'}">${g}</button>`).join('')}
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:5px">
            ${(DRUM_GENRES[cpDrumGenre]||DRUM_GENRES['🥁 Rock']).map((p,i)=>`<button data-dp="${i}" style="padding:4px 9px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;border:1.5px solid ${cpDrumPat===i?'#38bdf8':'var(--line)'};background:${cpDrumPat===i?'#38bdf820':'transparent'};color:${cpDrumPat===i?'#38bdf8':'var(--muted)'}">${p.name}</button>`).join('')}
            <button data-dp="mixed" style="padding:4px 9px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;border:1.5px solid ${cpDrumPat==='mixed'?'#a855f7':'var(--line)'};background:${cpDrumPat==='mixed'?'#a855f720':'transparent'};color:${cpDrumPat==='mixed'?'#a855f7':'var(--muted)'}">🔀 Mixed</button>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:11px;color:#f97316;font-weight:700;white-space:nowrap">🔊 Vol</span>
            <input id="cpDrumVol" type="range" min="0" max="100" step="5" value="${settings.drumVolume}" style="flex:1;accent-color:#f97316;height:4px;cursor:pointer">
            <span id="cpDrumVolLabel" style="font-size:11px;color:#f97316;font-weight:700;min-width:32px">${settings.drumVolume}%</span>
          </div>
        </div>`:''}
      </div>
      ${chords.length?`
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--muted)">Diatonic Chords — tap to hear & highlight</span>
          <button id="cpPlayAll" style="padding:6px 14px;border-radius:10px;font-size:12px;font-weight:700;border:1.5px solid var(--p);background:${isPlaying&&selChordIdx>=0?'var(--p)':'var(--card)'};color:${isPlaying&&selChordIdx>=0?'#fff':'var(--p)'};cursor:pointer">${isPlaying&&selChordIdx>=0?'⏹ Stop':'▶ Play All'}</button>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">${chordCards}</div>
      `:''}
      ${adv.length?`
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:20px;margin-bottom:10px">
          <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--muted)">Advanced — 7th Chords</span>
          <button id="cpPlayAdv" style="padding:6px 14px;border-radius:10px;font-size:12px;font-weight:700;border:1.5px solid var(--p);background:${isPlaying&&selAdvIdx>=0?'var(--p)':'var(--card)'};color:${isPlaying&&selAdvIdx>=0?'#fff':'var(--p)'};cursor:pointer">${isPlaying&&selAdvIdx>=0?'⏹ Stop':'▶ Play All'}</button>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">${advCards}</div>
      `:''}
      ${(()=>{
        const rpOn = rpTimer !== null;
        // Build the visual sequence queue — show current + next 7 from rpSeq
        const allPool = [...chords, ...adv];
        const queueStart = Math.max(0, rpPos - 1);
        const queueItems = rpSeq.slice(queueStart, queueStart + 8).map((idx, qi) => {
          const ch = allPool[idx];
          if(!ch) return '';
          const col = CHORD_COLORS[idx % CHORD_COLORS.length];
          const currentQi = rpPos > 0 ? 1 : 0;
          const isCurrent = qi === currentQi && rpOn;
          return `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;min-width:52px;padding:8px 10px;border-radius:12px;background:${isCurrent?col:col+'18'};color:${isCurrent?'#fff':col};border:2px solid ${isCurrent?col:col+'44'};transition:all .2s;${isCurrent?'transform:scale(1.08);box-shadow:0 4px 16px '+col+'66':'opacity:.7'}">
            <span style="font-size:9px;font-weight:700;opacity:.85">${ch.deg_label||''}</span>
            <span style="font-size:15px;font-weight:900;line-height:1">${ch.name}</span>
            <span style="font-size:8px;font-weight:600;opacity:.8">${ch.typeName||''}</span>
          </div>`;
        }).join('');
        return `
        <div style="margin-top:24px;padding:16px;border-radius:16px;background:var(--card);border:1.5px solid var(--line)">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--muted)">🎲 Random Practice</span>
            <div style="display:flex;gap:6px;align-items:center">
              <button id="rpBassBtn" style="padding:4px 10px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;border:1.5px solid ${rpBassOn?'#22c55e':'var(--line)'};background:${rpBassOn?'#22c55e':'transparent'};color:${rpBassOn?'#fff':'var(--muted)'}">🎸 Bass ${rpBassOn?'ON':'OFF'}</button>
              <button id="rpInvBtn" style="padding:4px 10px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;border:1.5px solid ${rpInvOn?'var(--p)':'var(--line)'};background:${rpInvOn?'var(--p)':'transparent'};color:${rpInvOn?'#fff':'var(--muted)'}">🔄 Inv ${rpInvOn?'ON':'OFF'}</button>
              <button id="rpLoopBtn" style="padding:4px 10px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;border:1.5px solid ${rpLoop?'var(--p)':'var(--line)'};background:${rpLoop?'var(--p)':'transparent'};color:${rpLoop?'#fff':'var(--muted)'}">🔁 Loop</button>
              <button id="rpPlayBtn" style="padding:6px 16px;border-radius:10px;font-size:12px;font-weight:700;border:none;background:${rpOn?'#ef4444':'var(--p)'};color:#fff;cursor:pointer">${rpOn?'⏹ Stop':'▶ Start'}</button>
            </div>
          </div>
          <div style="font-size:10px;color:var(--muted);margin-bottom:10px;font-weight:600">All ${allPool.length} chords rotate through every possible order — no chord repeats until all have played</div>
          ${rpOn&&queueItems?`<div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:6px;-webkit-overflow-scrolling:touch">${queueItems}<div style="display:flex;align-items:center;padding:0 8px;color:var(--muted);font-size:18px;opacity:.4">→</div></div>`:'<div style="color:var(--muted);font-size:12px;text-align:center;padding:12px 0">Press Start to begin random chord sequence</div>'}
        </div>`;
      })()}
    `;

    panel.querySelectorAll('[data-cproot]').forEach(b=>b.addEventListener('click',()=>{ selRoot=+b.dataset.cproot; selChordIdx=-1; selAdvIdx=-1; rpActiveIdx=-1; rpSeq=[]; stopPlay(); saveCp(); render(); }));
    panel.querySelectorAll('[data-cpscale]').forEach(b=>b.addEventListener('click',()=>{ selScale=b.dataset.cpscale; selChordIdx=-1; selAdvIdx=-1; rpActiveIdx=-1; rpSeq=[]; stopPlay(); saveCp(); render(); }));
    const cpPlayOpts = () => ({voice:cpVoice,volume:settings.volume/100});
    const cpInterval = () => Math.round(60000/cpTempo);
    panel.querySelectorAll('[data-cpchord]').forEach(b=>b.addEventListener('click',()=>{
      const i=+b.dataset.cpchord;
      stopPlay(); selAdvIdx=-1;
      selChordIdx=selChordIdx===i?-1:i;
      if(selChordIdx>=0){ unlockAudio(); const pm=resolveInversion(chords[i].midis,2); lastPlayedMidis=pm; pm.forEach((m,j)=>setTimeout(()=>playNote(m,{...cpPlayOpts()}),j*40)); }
      render();
    }));
    panel.querySelectorAll('[data-cpadv]').forEach(b=>b.addEventListener('click',()=>{
      const i=+b.dataset.cpadv;
      stopPlay(); selChordIdx=-1;
      selAdvIdx=selAdvIdx===i?-1:i;
      if(selAdvIdx>=0){ unlockAudio(); const pm=resolveInversion(adv[i].midis,3); lastPlayedMidis=pm; pm.forEach((m,j)=>setTimeout(()=>playNote(m,{...cpPlayOpts()}),j*40)); }
      render();
    }));
    panel.querySelector('#cpToggleScale')?.addEventListener('click',()=>{ showScale=!showScale; saveCp(); render(); });
    panel.querySelector('#cpLoopBtn')?.addEventListener('click',()=>{ cpLoop=!cpLoop; saveCp(); render(); });
    panel.querySelector('#cpShuffleBtn')?.addEventListener('click',()=>{ cpShuffle=!cpShuffle; saveCp(); render(); });
    panel.querySelectorAll('[data-fx]').forEach(b=>b.addEventListener('click',(e)=>{ e.stopPropagation(); const fx=b.dataset.fx; setSetting('effect',fx); unlockAudio(); setEffect(fx==='none'?null:fx); panel.querySelectorAll('[data-fx]').forEach(x=>{ const on=x.dataset.fx===fx; x.style.borderColor=on?'var(--p)':'var(--line)'; x.style.background=on?'color-mix(in srgb,var(--p) 14%,transparent)':'transparent'; x.style.color=on?'var(--p)':'var(--muted)'; }); }));
    panel.querySelector('#cpDrumsBtn')?.addEventListener('click',()=>{ cpDrums=!cpDrums; cpDrumPatIdx=0; saveCp(); render(); });
    panel.querySelectorAll('[data-dg]').forEach(b=>b.addEventListener('click',(e)=>{ e.stopPropagation(); cpDrumGenre=b.dataset.dg; cpDrumPat='mixed'; cpDrumPatIdx=0; saveCp(); render(); }));
    panel.querySelectorAll('[data-dp]').forEach(b=>b.addEventListener('click',(e)=>{ e.stopPropagation(); const v=b.dataset.dp; cpDrumPat=v==='mixed'?'mixed':parseInt(v); cpDrumPatIdx=0; saveCp(); render(); }));
    panel.querySelector('#cpDrumVol')?.addEventListener('input',(e)=>{ e.stopPropagation(); setSetting('drumVolume',Number(e.target.value)); panel.querySelector('#cpDrumVolLabel').textContent=e.target.value+'%'; });
    panel.querySelector('#cpInvSel')?.addEventListener('change',(e)=>{ const v=e.target.value; cpInversion=isNaN(v)?v:+v; lastPlayedMidis=null; saveCp(); render(); });
    panel.querySelector('#cpVoiceSel')?.addEventListener('change',(e)=>{ cpVoice=e.target.value; saveCp(); });
    panel.querySelector('#cpTempoDown')?.addEventListener('click',()=>{ cpTempo=Math.max(10,cpTempo-5); saveCp(); render(); });
    panel.querySelector('#cpTempoUp')?.addEventListener('click',()=>{ cpTempo=Math.min(240,cpTempo+5); saveCp(); render(); });
    const randIdx=(len)=>Math.floor(Math.random()*len);
    panel.querySelector('#cpPlayAll')?.addEventListener('click',()=>{
      unlockAudio();
      if(playTimer){ stopPlay(); selChordIdx=-1; selAdvIdx=-1; render(); return; }
      selAdvIdx=-1; playIdx=0;
      const playNext=()=>{
        const idx=cpShuffle?randIdx(chords.length):playIdx;
        if(!cpShuffle&&playIdx>=chords.length){ if(cpLoop){playIdx=0;}else{stopPlay(); selChordIdx=-1; render(); return;} }
        selChordIdx=cpShuffle?idx:playIdx;
        const dur=cpInterval()/1000;
        const pm=resolveInversion(chords[selChordIdx].midis,2); lastPlayedMidis=pm; pm.forEach((m,j)=>setTimeout(()=>playNote(m,{...cpPlayOpts(),duration:dur}),j*40));
        scheduleDrumBar(dur);
        if(!cpShuffle) playIdx++;
        render();
      };
      playNext();
      playTimer=setInterval(playNext, cpInterval());
    });
    panel.querySelector('#cpPlayAdv')?.addEventListener('click',()=>{
      unlockAudio();
      if(playTimer&&selAdvIdx>=0){ stopPlay(); selAdvIdx=-1; render(); return; }
      stopPlay(); selChordIdx=-1; playIdx=0;
      const playNext=()=>{
        const idx=cpShuffle?randIdx(adv.length):playIdx;
        if(!cpShuffle&&playIdx>=adv.length){ if(cpLoop){playIdx=0;}else{stopPlay(); selAdvIdx=-1; render(); return;} }
        selAdvIdx=cpShuffle?idx:playIdx;
        const dur=cpInterval()/1000;
        const pm=resolveInversion(adv[selAdvIdx].midis,3); lastPlayedMidis=pm; pm.forEach((m,j)=>setTimeout(()=>playNote(m,{...cpPlayOpts(),duration:dur}),j*40));
        scheduleDrumBar(dur);
        if(!cpShuffle) playIdx++;
        render();
      };
      playNext();
      playTimer=setInterval(playNext, cpInterval());
    });

    // Random Practice
    panel.querySelector('#rpBassBtn')?.addEventListener('click',()=>{ rpBassOn=!rpBassOn; saveRp(); render(); });
    panel.querySelector('#rpInvBtn')?.addEventListener('click',()=>{ rpInvOn=!rpInvOn; saveRp(); render(); });
    panel.querySelector('#rpLoopBtn')?.addEventListener('click',()=>{ rpLoop=!rpLoop; saveRp(); render(); });
    panel.querySelector('#rpPlayBtn')?.addEventListener('click',()=>{
      unlockAudio();
      if(rpTimer){ stopRp(); stopDrums(); rpActiveIdx=-1; rpSeq=[]; render(); return; }
      stopPlay(); selChordIdx=-1; selAdvIdx=-1;
      const allPool=[...chords,...adv];
      // Seed the sequence with 3 shuffled permutations so the queue looks full
      rpSeq=[...rpNextBlock(allPool.length),...rpNextBlock(allPool.length),...rpNextBlock(allPool.length)];
      rpPos=0;
      const playRpNext=()=>{
        // Refill when running low — ensures endless unique patterns
        if(rpPos>=rpSeq.length-allPool.length) rpSeq=[...rpSeq,...rpNextBlock(allPool.length)];
        if(rpPos>=rpSeq.length){ if(rpLoop){rpPos=0;}else{stopRp();rpActiveIdx=-1;render();return;} }
        const idx=rpSeq[rpPos];
        rpActiveIdx=idx;
        const ch=allPool[idx];
        const maxInv=idx<chords.length?2:3;
        const pm=rpResolveInv(rpInvOn?invertChord(ch.midis,Math.floor(Math.random()*(maxInv+1))):ch.midis);
        lastPlayedMidis=pm;
        const dur=cpInterval()/1000;
        pm.forEach((m,j)=>setTimeout(()=>playNote(m,{...cpPlayOpts(),duration:dur}),j*40));
        if(rpBassOn) playBassPattern(ch, dur, cpPlayOpts());
        scheduleDrumBar(dur);
        rpPos++;
        render();
      };
      // Set timer BEFORE first play so render() sees rpTimer as non-null
      rpTimer=setInterval(playRpNext, cpInterval());
      playRpNext();
    });
  };

  app.innerHTML=`<section class="view">
    <div class="top"><a class="iconbtn" href="#/practice">${icon('back')}</a><h1>Chords Practice</h1><span style="width:42px"></span></div>
    <div class="card pad" id="cp-panel" style="padding:16px"></div>
  </section>`;
  render();
  addEventListener('hashchange', ()=>{ stopPlay(); stopDrums(); }, { once: true });
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

/* ── Chords Library shared helpers ─────────────────────────────────────── */
// Parse a chord name → { root, accidental, quality } e.g. "F#m7" → {root:"F",acc:"#",qual:"m7"}
const parseChordName = (name) => {
  const m = (name || '').match(/^([A-G])([b#♭♯]?)(.*)$/);
  if (!m) return { root: name, acc: '', qual: '' };
  return { root: m[1], acc: m[2].replace('♭','b').replace('♯','#'), qual: m[3] };
};
// Return MIDI root (C4 = 60) for a chord name
const chordRootMidi = (name) => {
  const { root, acc } = parseChordName(name);
  const BASE = { C:60, D:62, E:64, F:65, G:67, A:69, B:71 };
  return (BASE[root] ?? 60) + (acc === '#' ? 1 : acc === 'b' ? -1 : 0);
};
// Play a chord (strum notes with slight delay)
const playChordAudio = (name, duration = 1.4) => {
  const QUALITY_INTERVALS = {
    '': [0,4,7], 'm': [0,3,7], '7': [0,4,7,10], 'maj7': [0,4,7,11],
    'm7': [0,3,7,10], 'dim': [0,3,6], 'aug': [0,4,8], 'sus4': [0,5,7],
    'sus2': [0,2,7], '9': [0,4,7,10,14], 'm9': [0,3,7,10,14],
    '7sus4': [0,5,7,10], 'b5': [0,4,6], '7b5': [0,4,6,10],
    'm7b5': [0,3,6,10], 'dim7': [0,3,6,9], 'maj9': [0,4,7,11,14],
    'add9': [0,4,7,14], '6': [0,4,7,9], 'm6': [0,3,7,9],
    '11': [0,4,7,10,14,17], 'D9': [0,4,7,10,14],
  };
  const { qual } = parseChordName(name);
  const midi = chordRootMidi(name);
  const ivs = QUALITY_INTERVALS[qual] || QUALITY_INTERVALS[''];
  const opts = { voice: settings.voice, volume: settings.volume / 100, duration };
  ivs.forEach((iv, i) => setTimeout(() => playNote(midi + iv, opts), i * 35));
};
// Play an explicit set of MIDI notes (used for voiced inversions)
const playMidisAudio = (midis, duration = 1.4) => {
  const opts = { voice: settings.voice, volume: settings.volume / 100, duration };
  midis.forEach((m, i) => setTimeout(() => playNote(m, opts), i * 35));
};
// Module-level player state so it persists across re-renders
let _clPlayerTimer = null;
const stopClPlayer = () => { if (_clPlayerTimer) { clearInterval(_clPlayerTimer); _clPlayerTimer = null; } };

// Chords Library favourites (per-song), stored in localStorage
const CL_FAV_KEY = 'np.cl-favs';
const getClFavs = () => { try { return new Set(JSON.parse(localStorage.getItem(CL_FAV_KEY) || '[]')); } catch { return new Set(); } };
const setClFavs = (set) => { try { localStorage.setItem(CL_FAV_KEY, JSON.stringify([...set])); } catch {} };
const toggleClFav = (id) => { const s = getClFavs(); if (s.has(id)) s.delete(id); else s.add(id); setClFavs(s); return s.has(id); };

/* ── Chords Library ─────────────────────────────────────────────────────── */
views.chordsLibrary = (params) => {
  setNav('practice');
  const q = (params?.get('q') || '').toLowerCase();
  const g = params?.get('g') || 'All';
  const page = parseInt(params?.get('p') || '1', 10);
  const PER = 30;

  const clFavs = getClFavs();
  let filtered = CHORDS_LIBRARY;
  if (g === 'Favourites') filtered = filtered.filter(s => clFavs.has(s.id));
  else if (g !== 'All') filtered = filtered.filter(s => s.genre === g);
  if (q) filtered = filtered.filter(s =>
    s.title.toLowerCase().includes(q) ||
    s.artist.toLowerCase().includes(q) ||
    s.chords.some(c => c.toLowerCase().includes(q))
  );
  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / PER));
  const shown = filtered.slice((page - 1) * PER, page * PER);

  const DIFF_COLOR = { Easy: '#22c55e', Medium: '#f59e0b', Hard: '#ef4444' };
  const favChip = `<button class="chip cc ${g === 'Favourites' ? 'on' : ''}" data-clg="Favourites" style="--c1:#ef4444;--c2:#dc2626">♥ Favourites${clFavs.size ? ` (${clFavs.size})` : ''}</button>`;
  const genreChips = favChip + CL_GENRES.map(genre => {
    const on = genre === g;
    return `<button class="chip cc ${on ? 'on' : ''}" data-clg="${genre}" style="--c1:#f59e0b;--c2:#d97706">${genre}</button>`;
  }).join('');

  const songRows = shown.map(s => `
    <a class="song" href="#/chordsLibrary/${encodeURIComponent(s.id)}" style="text-decoration:none">
      <div class="thumb" style="background:linear-gradient(135deg,#f59e0b,#d97706);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px">
        <div style="font-size:10px;font-weight:800;color:#fff;opacity:.9;text-align:center;padding:0 4px;line-height:1.2;max-width:52px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(s.key)}</div>
        <div style="font-size:7px;color:rgba(255,255,255,.75);font-weight:600">${esc(s.genre)}</div>
      </div>
      <div class="meta">
        <div class="t">${esc(s.title)}</div>
        <div class="s">${esc(s.artist)} · ${s.year}</div>
        <div class="tags">
          <span class="tag cat" style="background:${DIFF_COLOR[s.difficulty]}22;color:${DIFF_COLOR[s.difficulty]}">${s.difficulty}</span>
          ${s.chords.slice(0, 4).map(c => `<span class="tag cat">${esc(c)}</span>`).join('')}
          ${s.chords.length > 4 ? `<span class="tag cat">+${s.chords.length - 4}</span>` : ''}
        </div>
      </div>
      <button class="cl-fav-btn" data-id="${s.id}" title="Favourite" style="background:none;border:none;cursor:pointer;font-size:20px;line-height:1;padding:4px 6px;color:${clFavs.has(s.id)?'#ef4444':'var(--muted)'};align-self:center">${clFavs.has(s.id)?'♥':'♡'}</button>
      <span class="play">${icon('arrowR')}</span>
    </a>`).join('');

  app.innerHTML = `<section class="view">
    <div class="top">
      <a class="iconbtn" href="#/practice">${icon('back')}</a>
      <h1>Chords Library</h1>
      <span style="width:42px"></span>
    </div>
    <div style="position:relative;margin:0 0 10px">
      <input id="clSearch" type="search" placeholder="Search song, artist or chord…"
        value="${esc(q)}"
        style="width:100%;box-sizing:border-box;padding:10px 14px 10px 40px;border:1.5px solid var(--line);border-radius:14px;background:var(--solid);font-size:15px;font-family:inherit;color:var(--fg);outline:none">
      <svg style="position:absolute;left:13px;top:50%;transform:translateY(-50%);opacity:.45;pointer-events:none" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    </div>
    <div class="chips" style="display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none">${genreChips}</div>
    <div style="font-size:12.5px;color:var(--muted);margin:6px 2px 8px">${total} song${total !== 1 ? 's' : ''} found</div>
    <div class="list">${songRows || '<div class="empty" style="padding:32px;text-align:center;color:var(--muted)">No songs match — try a different search.</div>'}</div>
    ${pagerHtml(page, pages, total, PER)}
  </section>`;

  const input = app.querySelector('#clSearch');
  let debounce;
  input?.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      const newQ = input.value;
      location.hash = `#/chordsLibrary?q=${encodeURIComponent(newQ)}&g=${encodeURIComponent(g)}`;
    }, 280);
  });

  app.querySelectorAll('[data-clg]').forEach(btn =>
    btn.addEventListener('click', () => {
      location.hash = `#/chordsLibrary?q=${encodeURIComponent(q)}&g=${encodeURIComponent(btn.dataset.clg)}`;
    })
  );

  app.querySelectorAll('.cl-fav-btn').forEach(btn =>
    btn.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      const on = toggleClFav(btn.dataset.id);
      btn.textContent = on ? '♥' : '♡';
      btn.style.color = on ? '#ef4444' : 'var(--muted)';
      // if viewing the Favourites filter and unfavourited, drop the row
      if (!on && g === 'Favourites') {
        const row = btn.closest('.song');
        if (row) row.remove();
      }
    })
  );

  app.querySelectorAll('.pager-row button[data-p], .pager-row button.pnav[data-p]').forEach(btn =>
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      location.hash = `#/chordsLibrary?q=${encodeURIComponent(q)}&g=${encodeURIComponent(g)}&p=${btn.dataset.p}`;
    })
  );
};

views.chordsLibrarySong = (params, songId) => {
  setNav('practice');
  stopClPlayer();
  const songIdx = CHORDS_LIBRARY.findIndex(s => s.id === songId);
  const song = CHORDS_LIBRARY[songIdx];
  if (!song) { location.hash = '#/chordsLibrary'; return; }
  const prevSongId = CHORDS_LIBRARY[(songIdx - 1 + CHORDS_LIBRARY.length) % CHORDS_LIBRARY.length].id;
  const nextSongId = CHORDS_LIBRARY[(songIdx + 1) % CHORDS_LIBRARY.length].id;

  const PILL_COLORS = ['#ef4444','#f97316','#eab308','#22c55e','#06b6d4','#3b82f6','#8b5cf6','#ec4899','#14b8a6','#f43f5e'];
  const NOTE_COLORS_MAP = { C:'#ef4444',D:'#f97316',E:'#eab308',F:'#22c55e',G:'#06b6d4',A:'#3b82f6',B:'#8b5cf6' };
  const uniqueChords = [...new Set(song.chords)];
  const getUniqueChords = () => [...new Set(song.chords.map(c => transposeChord(c, clTranspose)))];
  const DIFF_COLOR = { Easy: '#22c55e', Medium: '#f59e0b', Hard: '#ef4444' };
  const QUALITY_INTERVALS_CL = {
    '': [0,4,7], 'm': [0,3,7], '7': [0,4,7,10], 'maj7': [0,4,7,11],
    'm7': [0,3,7,10], 'dim': [0,3,6], 'aug': [0,4,8], 'sus4': [0,5,7],
    'sus2': [0,2,7], 'm7b5': [0,3,6,10], 'dim7': [0,3,6,9],
    '9': [0,4,7,10,14], 'add9': [0,4,7,14], '6': [0,4,7,9], 'm6': [0,3,7,9],
  };
  const NOTE_NAMES_CL = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

  const qualLabel = (q) => ({
    '':'major','m':'minor','7':'dom 7','maj7':'maj 7','m7':'min 7',
    'dim':'dim','aug':'aug','sus4':'sus4','sus2':'sus2','m7b5':'half dim',
    'dim7':'dim 7','9':'dom 9','add9':'add 9','6':'maj 6','m6':'min 6',
  }[q] || q || 'major');

  const chordPill = (c, colorIdx) => {
    const col = PILL_COLORS[colorIdx % PILL_COLORS.length];
    const { root, acc, qual } = parseChordName(c);
    const rootNote = root + acc;
    const rootCol = NOTE_COLORS_MAP[root] || col;
    return `<span class="chord-pill cl-pill" data-chord="${esc(c)}" data-cidx="${colorIdx}"
      style="background:${col}18;border:2px solid ${col}55;border-radius:14px;padding:8px 14px 6px;
             font-weight:700;cursor:pointer;transition:all .18s;display:inline-flex;flex-direction:column;
             align-items:center;min-width:54px;text-align:center;position:relative">
      <span style="font-size:9px;font-weight:800;background:${rootCol};color:#fff;border-radius:5px;
                   padding:1px 5px;margin-bottom:3px;letter-spacing:.02em">${esc(rootNote)}</span>
      <span style="font-size:15px;color:${col};line-height:1">${esc(c)}</span>
      <span style="font-size:9.5px;color:${col};opacity:.75;margin-top:1px">${qualLabel(qual)}</span>
    </span>`;
  };

  // Compute MIDI notes for a chord (root position)
  const clChordMidis = (name) => {
    const { qual } = parseChordName(name);
    const root = chordRootMidi(name);
    const ivs = QUALITY_INTERVALS_CL[qual] || QUALITY_INTERVALS_CL[''];
    return ivs.map(iv => root + iv);
  };

  // Voice-lead a section: pick the inversion of each chord that moves least
  // from the previous chord, so the player shows real inversions (e.g. 2nd inv.)
  const INV_NAMES_FULL = ['Root position','1st inversion','2nd inversion','3rd inversion','4th inversion'];
  const voiceLeadSection = (chords) => {
    let prevAvg = 62; // ~D4, a comfortable starting register
    return chords.map((name, idx) => {
      const { qual } = parseChordName(name);
      const rootMidis = clChordMidis(name);
      const n = rootMidis.length;
      let best = null;
      for (let i = 0; i < n; i++) {
        const base = [...rootMidis.slice(i), ...rootMidis.slice(0, i).map(m => m + 12)];
        for (const oct of [-12, 0, 12]) {
          const cand = base.map(m => m + oct);
          const avg = cand.reduce((a, b) => a + b, 0) / cand.length;
          if (avg < 50 || avg > 76) continue;
          // on the first chord lightly prefer root position; otherwise pure voice-leading
          const cost = Math.abs(avg - prevAvg) + (idx === 0 ? i * 0.6 : 0);
          if (!best || cost < best.cost) best = { cost, midis: cand, inv: i, avg };
        }
      }
      if (!best) best = { midis: rootMidis, inv: 0, avg: prevAvg };
      prevAvg = best.avg;
      return { name, qual, midis: best.midis, inv: best.inv, invName: INV_NAMES_FULL[best.inv] || 'Root position' };
    });
  };
  let _voiceCache = {};
  let _voiceCacheTrans = null;
  const getVoicings = (si) => {
    if (_voiceCacheTrans !== clTranspose) { _voiceCache = {}; _voiceCacheTrans = clTranspose; }
    const tChords = song.sections[si].chords.map(c => transposeChord(c, clTranspose));
    return _voiceCache[si] || (_voiceCache[si] = voiceLeadSection(tChords));
  };

  // 2-octave mini keyboard SVG. Notes are shown at their ACTUAL inversion
  // positions (bass normalised into the first octave) so each inversion looks
  // distinct — root pos, 1st inv and 2nd inv sit at different places.
  const WHITE_PCS_CL = [0,2,4,5,7,9,11];
  const BLACK_DEF_CL = [{pc:1,ox:1},{pc:3,ox:2},{pc:6,ox:4},{pc:8,ox:5},{pc:10,ox:6}];
  const miniKbSVG = (midis, activeColor) => {
    const WW = 14, WH = 48, BW = 9, BH = 30, OCT = 2;
    let ms = [...midis].sort((a,b)=>a-b);
    while (ms.length && ms[0] < 60) ms = ms.map(m=>m+12);
    while (ms.length && ms[0] > 71) ms = ms.map(m=>m-12);
    const highSet = new Set(ms);
    const octW = 7*WW, svgW = OCT*octW+2, svgH = WH+4;
    let wkeys='', bkeys='', labels='';
    for (let oct=0; oct<OCT; oct++) {
      const base = 60 + oct*12, octX = oct*octW;
      WHITE_PCS_CL.forEach((pc,wi) => {
        const on = highSet.has(base+pc); const x = octX+wi*WW+1;
        wkeys += `<rect x="${x}" y="1" width="${WW-1}" height="${WH}" rx="2" fill="${on?activeColor:'#f5f5f5'}" stroke="#c8c8c8" stroke-width="1"/>`;
        if (on) labels += `<text x="${x+(WW-1)/2}" y="${WH-5}" font-size="8" font-weight="900" fill="#fff" text-anchor="middle" font-family="Plus Jakarta Sans,sans-serif">${NOTE_NAMES_CL[pc]}</text>`;
      });
      BLACK_DEF_CL.forEach(({pc,ox}) => {
        const on = highSet.has(base+pc); const x = octX+ox*WW-Math.floor(BW/2)+1;
        bkeys += `<rect x="${x}" y="1" width="${BW}" height="${BH}" rx="1.5" fill="${on?activeColor:'#1e1e2e'}" stroke="#0f0f1a" stroke-width="1"/>`;
        if (on) labels += `<text x="${x+BW/2}" y="${BH-3}" font-size="6.5" font-weight="900" fill="#fff" text-anchor="middle" font-family="Plus Jakarta Sans,sans-serif">${NOTE_NAMES_CL[pc]}</text>`;
      });
    }
    return `<svg viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg" width="100%" height="${svgH}" preserveAspectRatio="xMidYMid meet" style="max-width:${svgW}px">${wkeys}${bkeys}${labels}</svg>`;
  };

  // Wide full keyboard (4 octaves) highlighting the currently-playing chord.
  // big=true renders a taller keyboard that fills the card width.
  let clShowLabels = true;
  let clShowBass = true;
  const BASS_COL = '#06b6d4';
  const fullKbSVG = (midis, activeColor, big = false, bassActiveMidi = -1) => {
    const WW = 15, WH = big ? 104 : 62, BW = 9, BH = big ? 64 : 38, OCT = 4, BASE = 36;
    const lblW = big ? 10 : 7.5, lblB = big ? 8 : 6;
    const NR = big ? 7 : 5, NF = big ? 7 : 5.5; // number badge radius + font
    const highSet = new Set(midis);
    const bassNote = (clShowBass && midis && midis.length) ? Math.min(...midis) : -1;
    const bassLow  = bassNote >= 0 ? bassNote - 12 : -1;
    const BASS_ACTIVE_COL = '#22c55e'; // green for currently playing bass note
    // Chord interval numbers: sort midis, assign 1 3 5 7 by position
    // Bass sequence: always compute from current step (numbers persist, not just on blink)
    const bassNumMap = new Map();
    if (clBassStepMidis.length && clBassCurrentStep >= 0) {
      const playingMidi = clBassStepMidis[clBassCurrentStep];
      if (playingMidi) bassNumMap.set(playingMidi, 1);
      let num = 2;
      for (let i = 1; i < 16 && num <= 4; i++) {
        const m = clBassStepMidis[(clBassCurrentStep + i) % 16];
        if (m && !bassNumMap.has(m)) bassNumMap.set(m, num++);
      }
    }
    const octW = 7*WW, svgW = OCT*octW+2, svgH = WH+4;
    let wkeys='', bkeys='', labels='', badges='', anims='';
    for (let oct=0; oct<OCT; oct++) {
      const base = BASE + oct*12, octX = oct*octW;
      WHITE_PCS_CL.forEach((pc,wi) => {
        const midi = base+pc;
        const on = highSet.has(midi);
        const isBassBlink = bassActiveMidi >= 0 && midi === bassActiveMidi;
        const isBassLow   = !isBassBlink && midi === bassLow;
        const fill = isBassBlink ? BASS_ACTIVE_COL : isBassLow ? BASS_COL : on ? activeColor : '#f7f7fa';
        const x = octX+wi*WW+1, cx = x+(WW-1)/2;
        const rectId = isBassBlink ? `bb${midi}` : '';
        wkeys += `<rect${rectId?` id="${rectId}"`:''} x="${x}" y="1" width="${WW-1}" height="${WH}" rx="2.5" fill="${fill}" stroke="${(isBassBlink||isBassLow)?BASS_COL:'#c8c8c8'}" stroke-width="${(isBassBlink||isBassLow)?2.5:1}"/>`;
        if (isBassBlink) anims += `<animate href="#${rectId}" attributeName="opacity" values="1;0.4;1" dur="0.18s" repeatCount="1"/>`;
        if (isBassBlink||isBassLow||on) labels += `<text x="${cx}" y="${WH-6}" font-size="${lblW}" font-weight="900" fill="#fff" text-anchor="middle" font-family="Plus Jakarta Sans,sans-serif">${NOTE_NAMES_CL[pc]}</text>`;
        else if (clShowLabels) labels += `<text x="${cx}" y="${WH-6}" font-size="${lblW}" font-weight="600" fill="#c43" text-anchor="middle" font-family="Plus Jakarta Sans,sans-serif">${NOTE_NAMES_CL[pc]}</text>`;
        // bass sequence badges (no chord badges); always shown if clShowBassNums
        if (clShowBassNums && bassNumMap.has(midi)) {
          const num = bassNumMap.get(midi);
          const isPlaying = num === 1 && isBassBlink;
          const bc = isPlaying ? BASS_ACTIVE_COL : num === 1 ? BASS_COL : `${BASS_COL}99`;
          badges += `<circle cx="${cx}" cy="${NR+3}" r="${NR}" fill="${bc}"/>`;
          badges += `<text x="${cx}" y="${NR+3+NF*0.38}" font-size="${NF}" font-weight="900" fill="${isPlaying?'#002233':'#fff'}" text-anchor="middle" font-family="Plus Jakarta Sans,sans-serif">${num}</text>`;
        }
      });
      BLACK_DEF_CL.forEach(({pc,ox}) => {
        const midi = base+pc;
        const on = highSet.has(midi);
        const isBassBlink = bassActiveMidi >= 0 && midi === bassActiveMidi;
        const isBassLow   = !isBassBlink && midi === bassLow;
        const fill = isBassBlink ? BASS_ACTIVE_COL : isBassLow ? BASS_COL : on ? activeColor : '#1e1e2e';
        const x = octX+ox*WW-Math.floor(BW/2)+1, cx = x+BW/2;
        const rectId = isBassBlink ? `bbb${midi}` : '';
        bkeys += `<rect${rectId?` id="${rectId}"`:''}  x="${x}" y="1" width="${BW}" height="${BH}" rx="1.5" fill="${fill}" stroke="${(isBassBlink||isBassLow)?BASS_COL:'#0f0f1a'}" stroke-width="1"/>`;
        if (isBassBlink) anims += `<animate href="#${rectId}" attributeName="opacity" values="1;0.3;1" dur="0.18s" repeatCount="1"/>`;
        if (isBassBlink||isBassLow||on) labels += `<text x="${cx}" y="${BH-4}" font-size="${lblB}" font-weight="900" fill="#fff" text-anchor="middle" font-family="Plus Jakarta Sans,sans-serif">${NOTE_NAMES_CL[pc]}</text>`;
        const NRb=Math.max(NR-1,3), NFb=Math.max(NF-1,4);
        if (clShowBassNums && bassNumMap.has(midi)) {
          const num = bassNumMap.get(midi);
          const isPlaying = num === 1 && isBassBlink;
          const bc = isPlaying ? BASS_ACTIVE_COL : num === 1 ? BASS_COL : `${BASS_COL}99`;
          badges += `<circle cx="${cx}" cy="${NRb+2}" r="${NRb}" fill="${bc}"/>`;
          badges += `<text x="${cx}" y="${NRb+2+NFb*0.38}" font-size="${NFb}" font-weight="900" fill="#fff" text-anchor="middle" font-family="Plus Jakarta Sans,sans-serif">${num}</text>`;
        }
      });
    }
    const sizing = big ? 'width="100%" preserveAspectRatio="xMidYMid meet" style="display:block;width:92%;height:auto;margin:0 auto"' : `width="100%" height="${svgH}" preserveAspectRatio="xMidYMid meet"`;
    return `<svg viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg" ${sizing}>${wkeys}${bkeys}${labels}${badges}${anims}</svg>`;
  };

  // Build chord chart HTML for a given chord name. activeInv highlights the
  // inversion actually being played in the current section (voice-led).
  const buildChordChartHtml = (chordName, activeInv = 0) => {
    const { qual } = parseChordName(chordName);
    const root = chordRootMidi(chordName);
    const ivs = QUALITY_INTERVALS_CL[qual] || QUALITY_INTERVALS_CL[''];
    const rootMidis = ivs.map(iv => root + iv);
    const invNames = ['Root pos.', '1st inv.', '2nd inv.', '3rd inv.'];
    const inversions = ivs.map((_, i) => ({
      name: invNames[i] || `${i}th inv.`,
      midis: [...rootMidis.slice(i), ...rootMidis.slice(0,i).map(m => m+12)],
    }));
    const col = PILL_COLORS[uniqueChords.indexOf(chordName) % PILL_COLORS.length] || '#6366f1';
    const notesStr = rootMidis.map(m => NOTE_NAMES_CL[m%12]).join(' – ');
    return `
      <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);margin-bottom:4px">🎹 Chord Chart</div>
      <div style="font-size:18px;font-weight:900;color:${col};margin-bottom:2px">${esc(chordName)} <span style="font-weight:500;font-size:14px;color:var(--muted)">${qualLabel(qual)}</span></div>
      <div style="font-size:12px;color:var(--muted);margin-bottom:12px">${notesStr}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        ${inversions.map((inv,i) => { const on = i===activeInv; return `
          <div class="cl-inv-card" data-chord="${esc(chordName)}" data-inv="${i}"
            style="text-align:center;cursor:pointer;user-select:none">
            <div style="font-size:11px;font-weight:700;margin-bottom:5px;color:${on?col:'var(--muted)'}">${inv.name}${on?' ◀':''}</div>
            <div style="border:2px solid ${on?col:'var(--line)'};border-radius:10px;padding:5px;background:${on?col+'14':'var(--solid)'};transition:border-color .15s,background .15s">
              ${miniKbSVG(inv.midis, col)}
            </div>
          </div>`; }).join('')}
      </div>
      <div style="font-size:11px;color:var(--muted);margin-top:10px">Tap an inversion to hear it</div>`;
  };

  // Roman numeral from chord name relative to key
  const SCALE_DEGREES = [1,'b2',2,'b3',3,4,'b5',5,'b6',6,'b7',7];
  const chordToDegree = (chordName, keyRoot) => {
    const chordMidi = chordRootMidi(chordName);
    const keyMidi = chordRootMidi(keyRoot);
    const interval = ((chordMidi - keyMidi) % 12 + 12) % 12;
    return SCALE_DEGREES[interval];
  };
  const getProgression = (chords, key) => [...new Set(chords)].map(c => chordToDegree(c, key)).join(' – ');

  // Transpose state
  let clTranspose = 0;
  const transposeChord = (name, semitones) => {
    if (semitones === 0) return name;
    const { root, acc, qual } = parseChordName(name);
    const BASE = { C:0, D:2, E:4, F:5, G:7, A:9, B:11 };
    const pc = ((BASE[root] ?? 0) + (acc === '#' ? 1 : acc === 'b' ? -1 : 0) + semitones + 120) % 12;
    return NOTE_NAMES_CL[pc] + qual;
  };
  const transposeSong = () => {
    const tKey = transposeChord(song.key, clTranspose);
    const tChords = song.chords.map(c => transposeChord(c, clTranspose));
    const tSections = song.sections.map(sec => ({ ...sec, chords: sec.chords.map(c => transposeChord(c, clTranspose)) }));
    return { key: tKey, chords: tChords, sections: tSections };
  };

  // Player state
  const baseBpm = parseInt(song.tempo) || 80;
  let bpm = baseBpm;
  const speeds = { slow: 8, normal: 4, fast: 2 };
  let currentSpeed = 'normal';
  let activeSi = -1;
  let sectionPlayerIdx = 0;
  let fullSong = false;
  // Drum state for CL — reuse DRUM_GENRES + scheduleDrumBar from chords practice if loaded
  const clDrumSaved = JSON.parse(localStorage.getItem('np.cldrums') || '{}');
  let clDrumsOn = clDrumSaved.on || false;
  let clDrumGenre = clDrumSaved.genre || '🥁 Rock';
  let clDrumPat = clDrumSaved.pat ?? 'mixed';
  let clDrumPatIdx = 0;
  const saveCLDrums = () => localStorage.setItem('np.cldrums', JSON.stringify({on:clDrumsOn,genre:clDrumGenre,pat:clDrumPat}));
  const clDrumGenres = typeof DRUM_GENRES !== 'undefined' ? DRUM_GENRES : null;
  const clScheduleDrums = (durSec) => {
    if (!clDrumsOn || !clDrumGenres) return;
    const genre = clDrumGenres[clDrumGenre] || clDrumGenres['🥁 Rock'];
    const pat = clDrumPat === 'mixed' ? genre[clDrumPatIdx % genre.length] : genre[Math.min(clDrumPat, genre.length-1)];
    clDrumPatIdx++;
    const step = durSec / 16;
    const dv = (settings.drumVolume ?? 80) / 100;
    for (let i = 0; i < 16; i++) {
      if (pat.k[i]) playKick(i * step, pat.k[i] * 0.7 * dv);
      if (pat.s[i]) playSnare(i * step, pat.s[i] * 0.5 * dv);
      if (pat.h[i]) playHihat(i * step, pat.h[i] * 0.22 * dv, false);
    }
  };
  // Bass pattern state
  const clBassSaved = JSON.parse(localStorage.getItem('np.clbass') || '{}');
  let clBassOn = clBassSaved.on || false;
  let clBassPattern = clBassSaved.pat || 'Arp Up';
  let clBassVol = clBassSaved.vol != null ? clBassSaved.vol : 0.7;
  let clBassVoice = clBassSaved.voice || 'Electric';
  let clMixIdx = 0;
  let clBassActiveMidi = -1; // currently blinking bass note
  let clBassBlinkTimers = [];
  let clBassStepMidis = []; // resolved midi per step (0=rest) for upcoming display
  let clBassCurrentStep = -1; // which step is currently playing
  const clBassSaved2 = (() => { try { return JSON.parse(localStorage.getItem('np.clbass2')||'{}'); } catch(e){return{};} })();
  let clShowBassNums = clBassSaved2.showNums !== false; // default on
  const saveCLBass = () => localStorage.setItem('np.clbass', JSON.stringify({on:clBassOn,pat:clBassPattern,vol:clBassVol,voice:clBassVoice}));
  const saveCLBass2 = () => localStorage.setItem('np.clbass2', JSON.stringify({showNums:clShowBassNums}));
  const flashBassKey = (midi, stepMs, stepIdx) => {
    clBassActiveMidi = midi;
    clBassCurrentStep = stepIdx;
    const kbEl = app.querySelector('#clNowKb'), kbEl2 = app.querySelector('#clNowKb2');
    if (kbEl && kbEl._lastMidis) { kbEl.innerHTML = fullKbSVG(kbEl._lastMidis, kbEl._lastCol, false, midi); }
    if (kbEl2 && kbEl2._lastMidis) { kbEl2.innerHTML = fullKbSVG(kbEl2._lastMidis, kbEl2._lastCol, true, midi); }
    // clear blink after ~70% of step
    const off = setTimeout(() => {
      clBassActiveMidi = -1;
      if (kbEl && kbEl._lastMidis) kbEl.innerHTML = fullKbSVG(kbEl._lastMidis, kbEl._lastCol, false, -1);
      if (kbEl2 && kbEl2._lastMidis) kbEl2.innerHTML = fullKbSVG(kbEl2._lastMidis, kbEl2._lastCol, true, -1);
    }, stepMs * 0.65);
    clBassBlinkTimers.push(off);
  };
  const clearBassTimers = () => { clBassBlinkTimers.forEach(t => clearTimeout(t)); clBassBlinkTimers = []; clBassCurrentStep = -1; };

  // Each step: 'R'=root, '3'=third, '5'=fifth, '8'=root+octave, '6'=sixth, '7'=7th, 0=rest
  const BASS_PATTERNS = {
    'Root':      ['R',0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    'On Beat':   ['R',0,0,0, 'R',0,0,0, 'R',0,0,0, 'R',0,0,0],
    'Root-5th':  ['R',0,0,0, 0,0,0,0, '5',0,0,0, 0,0,0,0],
    'Arp Up':    ['R',0,'3',0, '5',0,'8',0, '5',0,'3',0, 'R',0,0,0],
    'Arp Down':  ['8',0,'5',0, '3',0,'R',0, '3',0,'5',0, '8',0,0,0],
    'Chord Walk':['R',0,'3',0, '5',0,'3',0, 'R',0,'5',0, '3',0,'R',0],
    'Bounce':    ['R',0,0,'R', '5',0,0,'5', 'R',0,0,'R', '3',0,0,0],
    'Walking':   ['R',0,0,0, '3',0,0,0, '5',0,0,0, '3',0,0,0],
    'Syncopated':['R',0,'3',0, 0,'5',0,0, '8',0,0,'3', 0,'5',0,0],
    'Boogie':    ['R','R',0,'5', 0,'5',0,'R', 'R','R',0,'5', 0,'5',0,0],
    'Strum':     ['R','3','5','8', '5','3','R',0, 'R','3','5','8', '5','3',0,0],
    'Pulse':     ['R',0,'R',0, '5',0,'R',0, 'R',0,'R',0, '5',0,'3',0],
    'Mixed':     null,
  };

  const BASS_PAT_KEYS = Object.keys(BASS_PATTERNS).filter(k => k !== 'Mixed');

  const clScheduleBass = (chordName, durSec) => {
    if (!clBassOn) return;
    const rootMidi = chordRootMidi(chordName);
    let bassRoot = rootMidi;
    while (bassRoot >= 48) bassRoot -= 12;
    bassRoot += 12; // put in octave below middle C (36-47 range)
    // derive chord tones from name quality
    const isMinor = /m\b|min\b/.test(chordName.replace(/^[A-G][#b]?/,''));
    const isDim   = /°|dim/.test(chordName);
    const isAug   = /\+|aug/.test(chordName);
    const third   = isDim||isMinor ? 3 : 4;
    const fifth   = isDim ? 6 : isAug ? 8 : 7;
    const sixth   = 9;
    const seventh = /maj7|M7/.test(chordName) ? 11 : 10;
    const noteMap = { 'R': bassRoot, '3': bassRoot+third, '5': bassRoot+fifth,
                      '8': bassRoot+12, '6': bassRoot+sixth, '7': bassRoot+seventh };

    let patKey = clBassPattern;
    if (patKey === 'Mixed') {
      patKey = BASS_PAT_KEYS[clMixIdx % BASS_PAT_KEYS.length];
      clMixIdx++;
    }
    const steps = BASS_PATTERNS[patKey] || BASS_PATTERNS['Root'];
    // resolve full step midi array for upcoming badge display
    clBassStepMidis = steps.map(token => token ? (noteMap[token] ?? bassRoot) : 0);
    const step = durSec / 16;
    const stepMs = step * 1000;
    clearBassTimers();
    steps.forEach((token, i) => {
      if (!token) return;
      const note = noteMap[token] ?? bassRoot;
      playBassNote(note, {duration: step * 2.5, velocity: 0.9, when: i * step, voice: clBassVoice, volume: clBassVol});
      // schedule visual blink in sync with audio
      const t = setTimeout(() => flashBassKey(note, stepMs, i), i * stepMs);
      clBassBlinkTimers.push(t);
    });
  };

  const setSecBtn = (si, ch) => { const b = app.querySelector(`.cl-sec-play[data-si="${si}"]`); if (b) b.textContent = ch; };

  // Now-playing bar updater. voicing = { name, qual, midis, inv, invName }
  const showNowPlaying = (voicing, sectionChords, activeIdx, sectionName = '') => {
    const bar = app.querySelector('#clNowPlayingBar');
    if (!bar) return;
    bar.style.display = 'block';
    const { name: chordName, qual, midis, invName } = voicing;
    const tuc = getUniqueChords();
    const col = PILL_COLORS[tuc.indexOf(chordName)%PILL_COLORS.length] || '#6366f1';
    const secBadge = sectionName
      ? `<span style="display:inline-block;background:${col};color:#fff;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;padding:2px 8px;border-radius:7px;margin-right:8px;vertical-align:middle">${esc(sectionName)}</span>`
      : '';
    const labelHtml = `${secBadge}<span style="vertical-align:middle">${esc(chordName)} ${qualLabel(qual)} – ${invName}</span>`;
    const svgEl = app.querySelector('#clNowSvg');
    if (svgEl) svgEl.innerHTML = chordNotationSVG(midis);
    const labelEl = app.querySelector('#clNowChordLabel');
    if (labelEl) labelEl.innerHTML = labelHtml;
    const kbEl = app.querySelector('#clNowKb');
    if (kbEl) { kbEl.innerHTML = fullKbSVG(midis, col); kbEl._lastMidis = midis; kbEl._lastCol = col; }
    const bar2 = app.querySelector('#clNowPlayingBar2');
    if (bar2) bar2.style.display = 'block';
    const kbEl2 = app.querySelector('#clNowKb2');
    if (kbEl2) { kbEl2.innerHTML = fullKbSVG(midis, col, true); kbEl2._lastMidis = midis; kbEl2._lastCol = col; }
    const label2 = app.querySelector('#clNowChordLabel2');
    if (label2) { label2.innerHTML = labelHtml; label2.style.color = col; }
    const pillsHtml = sectionChords.map((c,i) => {
      const pcol = PILL_COLORS[tuc.indexOf(c)%PILL_COLORS.length];
      const active = i === activeIdx;
      return `<span class="cl-now-pill" data-chord="${esc(c)}" data-ci="${i}" style="padding:3px 10px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;
        background:${active?pcol:pcol+'22'};color:${active?'#fff':pcol};
        border:1.5px solid ${active?pcol:pcol+'44'};transition:all .18s;${active?`box-shadow:0 0 10px ${pcol}66`:''}">${esc(c)}</span>`;
    }).join('');
    const pillsEl = app.querySelector('#clNowPills');
    if (pillsEl) pillsEl.innerHTML = pillsHtml;
    const pillsEl2 = app.querySelector('#clNowPills2');
    if (pillsEl2) pillsEl2.innerHTML = pillsHtml;
    const tKey = transposeChord(song.key, clTranspose);
    const progStr = sectionChords.map(c => chordToDegree(c, tKey)).join(' – ');
    const progEl = app.querySelector('#clNowProgLabel');
    if (progEl) progEl.textContent = progStr;
    const progEl2 = app.querySelector('#clNowProgLabel2');
    if (progEl2) progEl2.textContent = progStr;
  };

  // Highlight a pill within a section
  const highlightSecPill = (si, idx) => {
    const container = app.querySelector(`.cl-sec-pills[data-si="${si}"]`);
    if (!container) return;
    container.querySelectorAll('.cl-pill').forEach((p,i) => {
      const col = PILL_COLORS[parseInt(p.dataset.cidx||'0')%PILL_COLORS.length];
      if (i === idx) {
        p.style.background = col+'55'; p.style.border = `2px solid ${col}`;
        p.style.transform = 'scale(1.08)'; p.style.boxShadow = `0 0 14px ${col}66`;
      } else {
        p.style.background = col+'18'; p.style.border = `2px solid ${col}55`;
        p.style.transform = ''; p.style.boxShadow = '';
      }
    });
  };

  const resetSecPills = (si) => {
    const container = app.querySelector(`.cl-sec-pills[data-si="${si}"]`);
    if (!container) return;
    container.querySelectorAll('.cl-pill').forEach(p => {
      const col = PILL_COLORS[parseInt(p.dataset.cidx||'0')%PILL_COLORS.length];
      p.style.background = col+'18'; p.style.border = `2px solid ${col}55`;
      p.style.transform = ''; p.style.boxShadow = '';
    });
  };

  const tick = () => {
    if (activeSi === -1) return;
    const sec = song.sections[activeSi];
    const tChords = sec.chords.map(c => transposeChord(c, clTranspose));
    const chordIdx = sectionPlayerIdx % sec.chords.length;
    const chord = tChords[chordIdx];
    const voicing = getVoicings(activeSi)[chordIdx];
    const dot = app.querySelector(`.cl-beat-dot-sec[data-si="${activeSi}"]`);
    if (dot) { dot.style.background='var(--p)'; setTimeout(()=>{if(dot)dot.style.background='var(--muted)';},120); }
    highlightSecPill(activeSi, chordIdx);
    showNowPlaying(voicing, tChords, chordIdx, sec.name);
    const chartEl = app.querySelector('#clChordChart');
    if (chartEl) chartEl.innerHTML = buildChordChartHtml(chord, voicing.inv);
    unlockAudio();
    const chordDuration = (60/bpm) * speeds[currentSpeed];
    playMidisAudio(voicing.midis, chordDuration * 0.85);
    clScheduleDrums(chordDuration);
    clScheduleBass(chord, chordDuration);
    const next = chordIdx + 1;
    if (fullSong && next >= sec.chords.length) {
      resetSecPills(activeSi);
      setSecBtn(activeSi, '▶');
      activeSi = (activeSi + 1) % song.sections.length;
      setSecBtn(activeSi, '⏸');
      sectionPlayerIdx = 0;
      // keep picker on "full" during full song mode
    } else {
      sectionPlayerIdx = next % sec.chords.length;
    }
  };

  const stopSection = (si) => {
    stopClPlayer();
    if (si !== -1) {
      const btn = app.querySelector(`.cl-sec-play[data-si="${si}"]`);
      if (btn) btn.textContent = '▶';
      const dot = app.querySelector(`.cl-beat-dot-sec[data-si="${si}"]`);
      if (dot) dot.style.background = 'var(--muted)';
      resetSecPills(si);
    }
    activeSi = -1;
    fullSong = false;
    app.querySelectorAll('.cl-section-go').forEach(mp => mp.textContent = '▶');
    const bar = app.querySelector('#clNowPlayingBar');
    if (bar) bar.style.display = 'none';
    const bar2 = app.querySelector('#clNowPlayingBar2');
    if (bar2) bar2.style.display = 'none';
  };

  // HTML build
  const sectionsHtml = song.sections.map((sec, si) => `
    <div style="margin-bottom:${si<song.sections.length-1?'20':'0'}px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <button class="cl-sec-play" data-si="${si}"
          style="width:38px;height:38px;border-radius:50%;background:var(--p);border:none;color:#fff;
                 font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;
                 flex-shrink:0;box-shadow:0 2px 8px rgba(99,102,241,.3)">▶</button>
        <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)">${esc(sec.name)}</div>
        <div class="cl-beat-dot-sec" data-si="${si}" style="width:10px;height:10px;border-radius:50%;background:var(--muted);transition:background .08s;margin-left:auto"></div>
      </div>
      <div class="cl-sec-pills" data-si="${si}" style="display:flex;flex-wrap:wrap;gap:8px">
        ${sec.chords.map(c => chordPill(c, uniqueChords.indexOf(c))).join('')}
      </div>
    </div>`).join('');

  const allChordsHtml = uniqueChords.map((c,i) => chordPill(c,i)).join('');

  const scaleNotesHtml = (song.scaleNotes||[]).map(n => {
    const col = NOTE_COLORS_MAP[n[0]] || '#8b5cf6';
    return `<span class="cl-scale-note" data-note="${esc(n)}" title="Play ${esc(n)}"
      style="width:34px;height:34px;border-radius:50%;background:${col};color:#fff;
      font-size:13px;font-weight:800;display:flex;align-items:center;justify-content:center;
      cursor:pointer;user-select:none;transition:transform .12s,box-shadow .12s">${esc(n)}</span>`;
  }).join('');

  const improvHtml = (song.improvTips||[]).map((tip,i) => `
    <div style="display:flex;gap:10px;margin-bottom:10px;align-items:flex-start">
      <span style="width:22px;height:22px;border-radius:50%;background:var(--p);color:#fff;
                   font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;
                   flex-shrink:0;margin-top:1px">${i+1}</span>
      <span style="font-size:14px;line-height:1.5;color:var(--fg)">${esc(tip)}</span>
    </div>`).join('');

  const speedBtnsHtml = ['slow','normal','fast'].map(s=>`<button class="cl-speed ${s==='normal'?'on':''}" data-s="${s}"
    style="padding:4px 12px;border-radius:8px;border:1.5px solid var(--line);font-size:12.5px;
           font-weight:600;cursor:pointer;background:${s==='normal'?'var(--p)':'var(--solid)'};
           color:${s==='normal'?'#fff':'var(--fg)'};border-color:${s==='normal'?'var(--p)':'var(--line)'}">${s.charAt(0).toUpperCase()+s.slice(1)}</button>`).join('');

  app.innerHTML = `<section class="view">
    <div class="top">
      <a class="iconbtn" id="clBack" href="#/chordsLibrary">${icon('back')}</a>
      <h1 style="font-size:16px;flex:1;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(song.title)}</h1>
      <button class="iconbtn" id="clFavBtn" title="Favourite" style="width:42px;font-size:20px;line-height:1;color:${getClFavs().has(song.id)?'#ef4444':'var(--muted)'}">${getClFavs().has(song.id)?'♥':'♡'}</button>
    </div>

    <!-- Info card -->
    <div class="card pad" style="display:flex;gap:14px;align-items:flex-start">
      <div style="width:58px;height:58px;flex-shrink:0;border-radius:14px;background:linear-gradient(135deg,#f59e0b,#d97706);
                  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0">
        <div style="font-size:15px;font-weight:900;color:#fff;line-height:1">${esc(song.key)}</div>
        <div style="font-size:8px;color:rgba(255,255,255,.8);font-weight:700;letter-spacing:.05em">KEY</div>
      </div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:800;font-size:17px;margin-bottom:1px">${esc(song.title)}</div>
        <div style="color:var(--muted);font-size:13.5px;margin-bottom:7px">${esc(song.artist)} · ${song.year}</div>
        <div style="display:flex;flex-wrap:wrap;gap:5px">
          <span class="tag cat" style="background:${DIFF_COLOR[song.difficulty]}22;color:${DIFF_COLOR[song.difficulty]}">${song.difficulty}</span>
          <span class="tag cat">${esc(song.genre)}</span>
          <span class="tag cat">⏱ ${esc(song.tempo)}</span>
          <span class="tag cat">🎵 ${esc(song.key)}</span>
        </div>
      </div>
    </div>

    <!-- Speed + instrument control -->
    <div class="card pad" style="padding-top:10px;padding-bottom:10px">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <span style="font-size:12px;color:var(--muted);margin-right:2px">Speed</span>
        ${speedBtnsHtml}
        <span style="font-size:12px;color:var(--muted);margin:0 2px 0 8px">Sound</span>
        ${voicePicker()}
      </div>
      <div style="display:flex;align-items:center;gap:10px;margin-top:12px">
        <span style="font-size:12px;color:var(--muted)">Tempo</span>
        <button id="clBpmDown" title="Slower" style="width:30px;height:30px;border-radius:8px;border:1.5px solid var(--line);background:var(--solid);color:var(--fg);font-size:18px;font-weight:800;cursor:pointer;line-height:1">−</button>
        <input id="clBpm" type="range" min="40" max="220" step="1" value="${baseBpm}" style="flex:1;accent-color:var(--p);cursor:pointer">
        <button id="clBpmUp" title="Faster" style="width:30px;height:30px;border-radius:8px;border:1.5px solid var(--line);background:var(--solid);color:var(--fg);font-size:18px;font-weight:800;cursor:pointer;line-height:1">+</button>
        <span id="clBpmVal" style="font-size:13px;font-weight:800;color:var(--p);min-width:62px;text-align:right">${baseBpm} BPM</span>
      </div>
    </div>

    <!-- Transpose -->
    <div class="card pad" style="padding-top:10px;padding-bottom:10px">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:12px;color:var(--muted)">Transpose</span>
        <button id="clTransDown" title="Down" style="width:30px;height:30px;border-radius:8px;border:1.5px solid var(--line);background:var(--solid);color:var(--fg);font-size:18px;font-weight:800;cursor:pointer;line-height:1">−</button>
        <span id="clTransVal" style="font-size:13px;font-weight:800;color:var(--p);min-width:32px;text-align:center">0</span>
        <button id="clTransUp" title="Up" style="width:30px;height:30px;border-radius:8px;border:1.5px solid var(--line);background:var(--solid);color:var(--fg);font-size:18px;font-weight:800;cursor:pointer;line-height:1">+</button>
        <span id="clTransKey" style="font-size:13px;font-weight:700;color:var(--fg);margin-left:4px">Key: ${esc(song.key)}</span>
      </div>
      <div id="clProgression" style="margin-top:8px;font-size:13px;font-weight:700;color:var(--p);letter-spacing:.03em">${getProgression(song.chords, song.key)}</div>
    </div>

    <!-- Transport: section picker + prev/play/next -->
    <div class="card pad" style="padding-top:12px;padding-bottom:12px">
      <div style="display:flex;align-items:center;justify-content:center;gap:14px;flex-wrap:wrap">
        <select id="clSectionPicker" class="cl-sec-picker" style="padding:8px 12px;border-radius:10px;border:1.5px solid var(--line);background:var(--solid);color:var(--fg);font-size:13px;font-weight:700;cursor:pointer;min-width:140px">
          <option value="full">🔁 Full Song</option>
          ${song.sections.map((sec,si) => `<option value="${si}">▶ ${esc(sec.name)}</option>`).join('')}
        </select>
        <div style="display:flex;align-items:center;gap:12px">
          <a class="iconbtn cl-prev-song" id="clPrevSong" title="Previous song" href="#/chordsLibrary/${encodeURIComponent(prevSongId)}"
             style="width:44px;height:44px;font-size:20px;display:flex;align-items:center;justify-content:center">⏮</a>
          <button class="cl-section-go" id="clMasterPlay" title="Play selected section"
            style="width:60px;height:60px;border-radius:50%;background:var(--p);border:none;color:#fff;font-size:26px;
                   cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px var(--p)">▶</button>
          <a class="iconbtn cl-next-song" id="clNextSong" title="Next song" href="#/chordsLibrary/${encodeURIComponent(nextSongId)}"
             style="width:44px;height:44px;font-size:20px;display:flex;align-items:center;justify-content:center">⏭</a>
        </div>
      </div>
      <div style="text-align:center;font-size:11px;color:var(--muted);margin-top:6px">Select a section or play the full song</div>
    </div>

    <!-- Now Playing bar (shown when a section is playing) -->
    <div id="clNowPlayingBar" style="display:none">
      <h3 class="sec"><span class="badge">🎵</span><span class="gt">Now Playing</span></h3>
      <div class="card pad" style="padding:12px 14px">
        <div style="display:flex;gap:12px;align-items:center">
          <div id="clNowSvg" style="flex-shrink:0;opacity:.9"></div>
          <div style="flex:1;min-width:0">
            <div id="clNowChordLabel" style="font-size:15px;font-weight:900;color:var(--p);margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"></div>
            <div id="clNowProgLabel" style="font-size:11px;font-weight:700;color:var(--muted);margin-bottom:5px;letter-spacing:.03em"></div>
            <div id="clNowPills" style="display:flex;flex-wrap:wrap;gap:5px"></div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
            <select class="cl-sec-picker" style="padding:5px 8px;border-radius:8px;border:1.5px solid var(--line);background:var(--solid);color:var(--fg);font-size:11px;font-weight:700;cursor:pointer">
              <option value="full">🔁 Full</option>
              ${song.sections.map((sec,si) => `<option value="${si}">${esc(sec.name)}</option>`).join('')}
            </select>
            <a class="iconbtn cl-prev-song" title="Previous song" href="#/chordsLibrary/${encodeURIComponent(prevSongId)}" style="width:34px;height:34px;font-size:16px;display:flex;align-items:center;justify-content:center">⏮</a>
            <button class="cl-section-go" title="Play / pause" style="width:44px;height:44px;border-radius:50%;background:var(--p);border:none;color:#fff;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center">⏸</button>
            <a class="iconbtn cl-next-song" title="Next song" href="#/chordsLibrary/${encodeURIComponent(nextSongId)}" style="width:34px;height:34px;font-size:16px;display:flex;align-items:center;justify-content:center">⏭</a>
          </div>
        </div>
        <div id="clNowKb" style="margin-top:12px;background:#dcdce4;border-radius:10px;padding:5px;overflow:hidden"></div>
      </div>
    </div>

    <!-- Song Sections (each with own play button) -->
    <h3 class="sec"><span class="badge">📋</span><span class="gt">Song Sections</span></h3>
    <div class="card pad">${sectionsHtml}</div>

    <!-- Chord Chart -->
    <h3 class="sec"><span class="badge">🎹</span><span class="gt">Chord Chart</span></h3>
    <div class="card pad" id="clChordChart">${buildChordChartHtml(song.chords[0])}</div>

    <!-- Chords Used -->
    <h3 class="sec"><span class="badge">🎸</span><span class="gt">Chords Used</span></h3>
    <div class="card pad" style="display:flex;flex-wrap:wrap;gap:10px">${allChordsHtml}</div>

    <!-- Scale -->
    <h3 class="sec"><span class="badge">🎼</span><span class="gt">Scale: ${esc(song.scale || song.key + ' Major')}</span></h3>
    <div class="card pad">
      <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:10px">${scaleNotesHtml}</div>
      <div style="font-size:12.5px;color:var(--muted)">${esc(song.scale||'')} — ${song.scaleNotes ? song.scaleNotes.join(' – ') : ''}</div>
    </div>

    <!-- Improv tips -->
    <h3 class="sec"><span class="badge">💡</span><span class="gt">Improvisation Tips</span></h3>
    <div class="card pad">${improvHtml}</div>

    <!-- Drums + Bass controls above currently playing -->
    <div id="clDrumsWrap" style="margin-bottom:8px"></div>
    <div id="clBassWrap" style="margin-bottom:10px"></div>

    <!-- Currently playing keyboard (mirror, below tips) -->
    <div id="clNowPlayingBar2" style="display:none;margin-bottom:20px">
      <h3 class="sec"><span class="badge">🎹</span><span class="gt">Currently Playing</span></h3>
      <div class="card pad" style="padding:12px 14px">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:8px">
          <div style="min-width:0">
            <div id="clNowChordLabel2" style="font-size:15px;font-weight:900;color:var(--p);white-space:nowrap"></div>
            <div id="clNowProgLabel2" style="font-size:11px;font-weight:700;color:var(--muted);letter-spacing:.03em"></div>
          </div>
          <div id="clNowPills2" style="display:flex;flex-wrap:wrap;gap:5px"></div>
          <div style="margin-left:auto;display:flex;align-items:center;gap:8px">
            <select class="cl-sec-picker" style="padding:5px 8px;border-radius:8px;border:1.5px solid var(--line);background:var(--solid);color:var(--fg);font-size:11px;font-weight:700;cursor:pointer">
              <option value="full">🔁 Full</option>
              ${song.sections.map((sec,si) => `<option value="${si}">${esc(sec.name)}</option>`).join('')}
            </select>
            <a class="iconbtn cl-prev-song" title="Previous song" href="#/chordsLibrary/${encodeURIComponent(prevSongId)}" style="width:34px;height:34px;font-size:16px;display:flex;align-items:center;justify-content:center">⏮</a>
            <button class="cl-section-go" title="Play / pause" style="width:44px;height:44px;border-radius:50%;background:var(--p);border:none;color:#fff;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center">⏸</button>
            <a class="iconbtn cl-next-song" title="Next song" href="#/chordsLibrary/${encodeURIComponent(nextSongId)}" style="width:34px;height:34px;font-size:16px;display:flex;align-items:center;justify-content:center">⏭</a>
          </div>
        </div>
        <div id="clNowKb2" style="background:#dcdce4;border-radius:10px;padding:5px;overflow:hidden"></div>
        <div style="display:flex;justify-content:flex-end;gap:6px;margin-top:6px">
          <button id="clToggleLabels" style="font-size:11px;font-weight:700;padding:4px 12px;border-radius:8px;border:1.5px solid var(--line);background:var(--p);color:#fff;cursor:pointer">Notes: ON</button>
        </div>
      </div>
    </div>
  </section>`;

  // ── Per-section play buttons ───────────────────────────────────────────────
  app.querySelectorAll('.cl-sec-play').forEach(btn => {
    btn.addEventListener('click', () => {
      unlockAudio();
      const si = parseInt(btn.dataset.si);
      if (activeSi === si && !clPaused) {
        // pause: keep bars visible
        stopClPlayer();
        clPaused = true;
        btn.textContent = '▶';
        setMasterBtns('▶');
      } else if (activeSi === si && clPaused) {
        // resume
        clPaused = false;
        btn.textContent = '⏸';
        setMasterBtns('⏸');
        tick();
        const ms = (60000/bpm) * speeds[currentSpeed];
        _clPlayerTimer = setInterval(tick, ms);
      } else {
        if (activeSi !== -1) stopSection(activeSi);
        clPaused = false;
        fullSong = false;
        activeSi = si;
        sectionPlayerIdx = 0;
        btn.textContent = '⏸';
        setMasterBtns('⏸');
        tick();
        const ms = (60000/bpm) * speeds[currentSpeed];
        _clPlayerTimer = setInterval(tick, ms);
      }
    });
  });

  // ── Section picker sync ─────────────────────────────────────────────────
  const setMasterBtns = (ch) => app.querySelectorAll('.cl-section-go').forEach(b => b.textContent = ch);
  let clPaused = false;
  const syncPickers = (val) => app.querySelectorAll('.cl-sec-picker').forEach(p => p.value = val);
  app.querySelectorAll('.cl-sec-picker').forEach(p => {
    p.addEventListener('change', () => {
      syncPickers(p.value);
      if (activeSi !== -1 && !clPaused) {
        startFromPicker();
      }
    });
  });

  // ── Section-go play/pause — reads from picker ─────────────────────────
  const startFromPicker = () => {
    const pickerVal = app.querySelector('.cl-sec-picker')?.value || 'full';
    if (activeSi !== -1) stopSection(activeSi);
    clPaused = false;
    if (pickerVal === 'full') {
      fullSong = true;
      activeSi = 0;
    } else {
      fullSong = false;
      activeSi = parseInt(pickerVal);
    }
    sectionPlayerIdx = 0;
    setMasterBtns('⏸');
    setSecBtn(activeSi, '⏸');
    tick();
    _clPlayerTimer = setInterval(tick, (60000/bpm) * speeds[currentSpeed]);
  };
  app.querySelectorAll('.cl-section-go').forEach(mp => {
    mp.addEventListener('click', () => {
      unlockAudio();
      if (activeSi !== -1 && !clPaused) {
        stopClPlayer();
        clPaused = true;
        setMasterBtns('▶');
        setSecBtn(activeSi, '▶');
      } else if (clPaused && activeSi !== -1) {
        clPaused = false;
        setMasterBtns('⏸');
        setSecBtn(activeSi, '⏸');
        tick();
        _clPlayerTimer = setInterval(tick, (60000/bpm) * speeds[currentSpeed]);
      } else {
        startFromPicker();
      }
    });
  });

  // ── Prev/Next song — stop playback before navigating ──────────────────────
  app.querySelectorAll('.cl-prev-song, .cl-next-song').forEach(a =>
    a.addEventListener('click', () => stopSection(activeSi)));

  // ── Speed buttons ─────────────────────────────────────────────────────────
  app.querySelectorAll('.cl-speed').forEach(b => {
    b.addEventListener('click', () => {
      currentSpeed = b.dataset.s;
      app.querySelectorAll('.cl-speed').forEach(s => {
        const on = s.dataset.s === currentSpeed;
        s.style.background = on ? 'var(--p)' : 'var(--solid)';
        s.style.color = on ? '#fff' : 'var(--fg)';
        s.style.borderColor = on ? 'var(--p)' : 'var(--line)';
      });
      if (activeSi !== -1) { stopClPlayer(); const ms=(60000/bpm)*speeds[currentSpeed]; _clPlayerTimer=setInterval(tick,ms); }
    });
  });

  // ── Tempo (BPM) adjustment ────────────────────────────────────────────────
  const restartTimer = () => {
    if (activeSi !== -1) { stopClPlayer(); _clPlayerTimer = setInterval(tick, (60000/bpm) * speeds[currentSpeed]); }
  };
  const bpmSlider = app.querySelector('#clBpm');
  const bpmVal = app.querySelector('#clBpmVal');
  const setBpm = (v) => {
    bpm = Math.max(40, Math.min(220, Math.round(v)));
    if (bpmSlider) bpmSlider.value = bpm;
    if (bpmVal) bpmVal.textContent = `${bpm} BPM`;
    restartTimer();
  };
  bpmSlider?.addEventListener('input', () => setBpm(parseInt(bpmSlider.value)));
  app.querySelector('#clBpmDown')?.addEventListener('click', () => setBpm(bpm - 4));
  app.querySelector('#clBpmUp')?.addEventListener('click', () => setBpm(bpm + 4));

  // ── Drums controls ────────────────────────────────────────────────────
  const renderCLDrumsWrap = () => {
    const wrap = app.querySelector('#clDrumsWrap');
    if (!wrap) return;
    wrap.innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;align-items:center"><span style="font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;white-space:nowrap">✨ FX</span>${[['none','Dry'],['flanger','Flanger'],['phaser','Phaser'],['saw','Saw'],['pingpong','Ping-Pong'],['reverb','Reverb'],['plucking','Plucking'],['mixed','Mixed']].map(([id,label])=>`<button data-fx="${id}" style="padding:4px 9px;border-radius:8px;font-size:10px;font-weight:700;cursor:pointer;border:1.5px solid ${settings.effect===id?'var(--p)':'var(--line)'};background:${settings.effect===id?'color-mix(in srgb,var(--p) 14%,transparent)':'transparent'};color:${settings.effect===id?'var(--p)':'var(--muted)'};transition:all .15s">${label}</button>`).join('')}</div><button id="clDrumsBtn" style="width:100%;padding:9px;border-radius:${clDrumsOn?'10px 10px 0 0':'10px'};font-size:13px;font-weight:700;cursor:pointer;border:2px solid ${clDrumsOn?'#f97316':'var(--line)'};border-bottom:${clDrumsOn?'none':'2px solid var(--line)'};background:${clDrumsOn?'#f9731620':'var(--card)'};color:${clDrumsOn?'#f97316':'var(--muted)'};display:flex;align-items:center;justify-content:center;gap:8px">🥁 Drums ${clDrumsOn?'ON':'OFF — tap to turn ON'}</button>${clDrumsOn&&clDrumGenres?`<div style="padding:10px;border-radius:0 0 10px 10px;border:2px solid #f97316;border-top:1px solid #f9731640;background:#f9731610;display:flex;flex-direction:column;gap:8px"><div style="display:flex;flex-wrap:wrap;gap:5px">${Object.keys(clDrumGenres).map(g=>`<button data-clg="${g}" style="padding:4px 9px;border-radius:8px;font-size:10px;font-weight:700;cursor:pointer;border:1.5px solid ${g===clDrumGenre?'#f97316':'var(--line)'};background:${g===clDrumGenre?'#f97316':'transparent'};color:${g===clDrumGenre?'#fff':'var(--muted)'}">${g}</button>`).join('')}</div><div style="display:flex;flex-wrap:wrap;gap:5px">${(clDrumGenres[clDrumGenre]||clDrumGenres['🥁 Rock']).map((p,i)=>`<button data-clp="${i}" style="padding:4px 9px;border-radius:8px;font-size:10px;font-weight:700;cursor:pointer;border:1.5px solid ${clDrumPat===i?'#38bdf8':'var(--line)'};background:${clDrumPat===i?'#38bdf820':'transparent'};color:${clDrumPat===i?'#38bdf8':'var(--muted)'}">${p.name}</button>`).join('')}<button data-clp="mixed" style="padding:4px 9px;border-radius:8px;font-size:10px;font-weight:700;cursor:pointer;border:1.5px solid ${clDrumPat==='mixed'?'#a855f7':'var(--line)'};background:${clDrumPat==='mixed'?'#a855f720':'transparent'};color:${clDrumPat==='mixed'?'#a855f7':'var(--muted)'}">🔀 Mixed</button></div><div style="display:flex;align-items:center;gap:8px"><span style="font-size:11px;color:#f97316;font-weight:700;white-space:nowrap">🔊 Vol</span><input id="clDrumVol" type="range" min="0" max="100" step="5" value="${settings.drumVolume}" style="flex:1;accent-color:#f97316;height:4px;cursor:pointer"><span id="clDrumVolLabel" style="font-size:11px;color:#f97316;font-weight:700;min-width:32px">${settings.drumVolume}%</span></div></div>`:''}`;
    wrap.querySelectorAll('[data-fx]').forEach(b=>b.addEventListener('click',(e)=>{ e.stopPropagation(); const fx=b.dataset.fx; setSetting('effect',fx); unlockAudio(); setEffect(fx==='none'?null:fx); wrap.querySelectorAll('[data-fx]').forEach(x=>{ const on=x.dataset.fx===fx; x.style.borderColor=on?'var(--p)':'var(--line)'; x.style.background=on?'color-mix(in srgb,var(--p) 14%,transparent)':'transparent'; x.style.color=on?'var(--p)':'var(--muted)'; }); }));
    wrap.querySelector('#clDrumsBtn')?.addEventListener('click', () => { clDrumsOn=!clDrumsOn; clDrumPatIdx=0; saveCLDrums(); renderCLDrumsWrap(); });
    wrap.querySelectorAll('[data-clg]').forEach(b=>b.addEventListener('click',(e)=>{ e.stopPropagation(); clDrumGenre=b.dataset.clg; clDrumPat='mixed'; clDrumPatIdx=0; saveCLDrums(); renderCLDrumsWrap(); }));
    wrap.querySelectorAll('[data-clp]').forEach(b=>b.addEventListener('click',(e)=>{ e.stopPropagation(); const v=b.dataset.clp; clDrumPat=v==='mixed'?'mixed':parseInt(v); clDrumPatIdx=0; saveCLDrums(); renderCLDrumsWrap(); }));
    wrap.querySelector('#clDrumVol')?.addEventListener('input',(e)=>{ e.stopPropagation(); setSetting('drumVolume',Number(e.target.value)); wrap.querySelector('#clDrumVolLabel').textContent=e.target.value+'%'; });
  };
  renderCLDrumsWrap();

  // ── Bass pattern controls ─────────────────────────────────────────────
  const renderCLBassWrap = () => {
    const wrap = app.querySelector('#clBassWrap');
    if (!wrap) return;
    const volPct = Math.round(clBassVol * 100);
    const BASS_VOICE_KEYS = ['Electric','Synth Sub','Slap','Upright','Fretless','Funk','Deep Sub','Moog'];
    wrap.innerHTML = `<button id="clBassBtn" style="width:100%;padding:9px;border-radius:${clBassOn?'10px 10px 0 0':'10px'};font-size:13px;font-weight:700;cursor:pointer;border:2px solid ${clBassOn?'#06b6d4':'var(--line)'};border-bottom:${clBassOn?'none':'2px solid var(--line)'};background:${clBassOn?'#06b6d420':'var(--card)'};color:${clBassOn?'#06b6d4':'var(--muted)'};display:flex;align-items:center;justify-content:center;gap:8px">🎸 Bass ${clBassOn?'ON':'OFF — tap to turn ON'}</button>${clBassOn?`<div style="padding:10px;border-radius:0 0 10px 10px;border:2px solid #06b6d4;border-top:1px solid #06b6d440;background:#06b6d410;display:flex;flex-direction:column;gap:8px"><div style="font-size:10px;font-weight:700;color:#06b6d4;opacity:.7;text-transform:uppercase;letter-spacing:.06em">Instrument</div><div style="display:flex;flex-wrap:wrap;gap:5px">${BASS_VOICE_KEYS.map(v=>`<button data-bv="${v}" style="padding:4px 10px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;border:1.5px solid ${clBassVoice===v?'#f59e0b':'var(--line)'};background:${clBassVoice===v?'#f59e0b20':'transparent'};color:${clBassVoice===v?'#f59e0b':'var(--muted)'}">${v}</button>`).join('')}</div><div style="font-size:10px;font-weight:700;color:#06b6d4;opacity:.7;text-transform:uppercase;letter-spacing:.06em">Pattern</div><div style="display:flex;flex-wrap:wrap;gap:5px">${Object.keys(BASS_PATTERNS).map(p=>`<button data-bp="${p}" style="padding:4px 10px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;border:1.5px solid ${clBassPattern===p?'#06b6d4':'var(--line)'};background:${clBassPattern===p?'#06b6d4':'transparent'};color:${clBassPattern===p?'#fff':'var(--muted)'}">${p==='Mixed'?'🔀 Mixed':p}</button>`).join('')}</div><div style="display:flex;align-items:center;gap:8px"><span style="font-size:11px;color:#06b6d4;font-weight:700;white-space:nowrap">🔊 Vol</span><input id="clBassVol" type="range" min="0" max="100" value="${volPct}" style="flex:1;accent-color:#06b6d4;height:4px"><span id="clBassVolLabel" style="font-size:11px;color:#06b6d4;font-weight:700;min-width:32px">${volPct}%</span><button id="clBassNumsBtn" style="padding:4px 10px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;border:1.5px solid ${clShowBassNums?'#22c55e':'var(--line)'};background:${clShowBassNums?'#22c55e20':'transparent'};color:${clShowBassNums?'#22c55e':'var(--muted)'}">1 2 3</button></div></div>`:''}`;
    wrap.querySelector('#clBassBtn')?.addEventListener('click', () => { clBassOn=!clBassOn; saveCLBass(); renderCLBassWrap(); });
    wrap.querySelectorAll('[data-bv]').forEach(b=>b.addEventListener('click',(e)=>{ e.stopPropagation(); clBassVoice=b.dataset.bv; saveCLBass(); renderCLBassWrap(); }));
    wrap.querySelectorAll('[data-bp]').forEach(b=>b.addEventListener('click',(e)=>{ e.stopPropagation(); clBassPattern=b.dataset.bp; clMixIdx=0; saveCLBass(); renderCLBassWrap(); }));
    wrap.querySelector('#clBassNumsBtn')?.addEventListener('click',(e)=>{ e.stopPropagation(); clShowBassNums=!clShowBassNums; saveCLBass2(); renderCLBassWrap(); const kbEl=app.querySelector('#clNowKb'),kbEl2=app.querySelector('#clNowKb2'); if(kbEl&&kbEl._lastMidis)kbEl.innerHTML=fullKbSVG(kbEl._lastMidis,kbEl._lastCol,false,clBassActiveMidi); if(kbEl2&&kbEl2._lastMidis)kbEl2.innerHTML=fullKbSVG(kbEl2._lastMidis,kbEl2._lastCol,true,clBassActiveMidi); });
    const volSlider = wrap.querySelector('#clBassVol');
    if (volSlider) {
      volSlider.addEventListener('input', () => {
        clBassVol = parseInt(volSlider.value) / 100;
        const lbl = wrap.querySelector('#clBassVolLabel');
        if (lbl) lbl.textContent = volSlider.value + '%';
        saveCLBass();
      });
    }
  };
  renderCLBassWrap();

  // ── Transpose controls ────────────────────────────────────────────────
  const updateTransposeUI = () => {
    const tKey = transposeChord(song.key, clTranspose);
    const el = app.querySelector('#clTransVal');
    if (el) el.textContent = (clTranspose > 0 ? '+' : '') + clTranspose;
    const keyEl = app.querySelector('#clTransKey');
    if (keyEl) keyEl.textContent = `Key: ${tKey}`;
    const progEl = app.querySelector('#clProgression');
    if (progEl) progEl.textContent = getProgression(song.chords.map(c => transposeChord(c, clTranspose)), tKey);
    _voiceCache = {}; _voiceCacheTrans = null;
    restartTimer();
  };
  app.querySelector('#clTransDown')?.addEventListener('click', () => { clTranspose = ((clTranspose - 1) + 12) % 12; if (clTranspose > 6) clTranspose -= 12; updateTransposeUI(); });
  app.querySelector('#clTransUp')?.addEventListener('click', () => { clTranspose = ((clTranspose + 1) + 12) % 12; if (clTranspose > 6) clTranspose -= 12; updateTransposeUI(); });

  // ── Toggle note labels on keyboard ─────────────────────────────────────
  app.querySelector('#clToggleLabels')?.addEventListener('click', (e) => {
    clShowLabels = !clShowLabels;
    e.currentTarget.textContent = clShowLabels ? 'Notes: ON' : 'Notes: OFF';
    e.currentTarget.style.background = clShowLabels ? 'var(--p)' : 'var(--solid)';
    e.currentTarget.style.color = clShowLabels ? '#fff' : 'var(--fg)';
    const kbEl = app.querySelector('#clNowKb');
    const kbEl2 = app.querySelector('#clNowKb2');
    if (kbEl && kbEl._lastMidis) { kbEl.innerHTML = fullKbSVG(kbEl._lastMidis, kbEl._lastCol); if (kbEl2) kbEl2.innerHTML = fullKbSVG(kbEl._lastMidis, kbEl._lastCol, true); }
  });


  // ── Clickable Now Playing pills — tap a chord to hear & see it ─────────
  const handleNowPillClick = (e) => {
    const pill = e.target.closest('.cl-now-pill');
    if (!pill) return;
    const chord = pill.dataset.chord;
    if (!chord) return;
    unlockAudio();
    playChordAudio(chord, 1.4);
    const si = activeSi >= 0 ? activeSi : 0;
    const voicings = getVoicings(si);
    const ci = parseInt(pill.dataset.ci || '0');
    const voicing = voicings[ci] || voicings[0];
    if (voicing) {
      const sec = song.sections[si];
      const col = PILL_COLORS[getUniqueChords().indexOf(chord) % PILL_COLORS.length] || '#6366f1';
      const kbEl = app.querySelector('#clNowKb');
      if (kbEl) kbEl.innerHTML = fullKbSVG(voicing.midis, col);
      const kbEl2 = app.querySelector('#clNowKb2');
      if (kbEl2) kbEl2.innerHTML = fullKbSVG(voicing.midis, col, true);
      const invName = voicing.invName || '';
      const labelHtml = `<span style="vertical-align:middle">${esc(chord)} ${qualLabel(voicing.qual)} – ${invName}</span>`;
      const labelEl = app.querySelector('#clNowChordLabel');
      if (labelEl) labelEl.innerHTML = labelHtml;
      const label2 = app.querySelector('#clNowChordLabel2');
      if (label2) { label2.innerHTML = labelHtml; label2.style.color = col; }
      const chartEl = app.querySelector('#clChordChart');
      if (chartEl) chartEl.innerHTML = buildChordChartHtml(chord, voicing.inv);
      playMidisAudio(voicing.midis, 1.4);
      const bar = app.querySelector('#clNowPlayingBar');
      if (bar) bar.style.display = 'block';
      const bar2 = app.querySelector('#clNowPlayingBar2');
      if (bar2) bar2.style.display = 'block';
    }
  };
  app.querySelector('#clNowPills')?.addEventListener('click', handleNowPillClick);
  app.querySelector('#clNowPills2')?.addEventListener('click', handleNowPillClick);

  // ── Navigation cleanup ────────────────────────────────────────────────────
  app.querySelector('#clBack')?.addEventListener('click', () => stopSection(activeSi));
  addEventListener('hashchange', () => stopSection(activeSi), { once: true });

  // ── Favourite toggle ─────────────────────────────────────────────────────
  app.querySelector('#clFavBtn')?.addEventListener('click', (e) => {
    const btn = e.currentTarget;
    const on = toggleClFav(song.id);
    btn.textContent = on ? '♥' : '♡';
    btn.style.color = on ? '#ef4444' : 'var(--muted)';
    btn.style.transform = 'scale(1.3)';
    setTimeout(() => { btn.style.transform = ''; }, 180);
  });

  // ── Tap chord pill → play audio + update chord chart ─────────────────────
  app.querySelectorAll('.cl-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      unlockAudio();
      const c = pill.dataset.chord;
      playChordAudio(c, 1.4);
      const chartEl = app.querySelector('#clChordChart');
      if (chartEl) chartEl.innerHTML = buildChordChartHtml(c);
    });
  });

  // ── Scale note circles → play note ───────────────────────────────────────
  app.querySelectorAll('.cl-scale-note').forEach(el => {
    el.addEventListener('click', () => {
      unlockAudio();
      const n = el.dataset.note;
      const midi = chordRootMidi(n); // reuse parser — handles sharps and flats
      playNote(midi, { voice: settings.voice, volume: settings.volume / 100, duration: 1.0 });
      el.style.transform = 'scale(1.22)';
      el.style.boxShadow = `0 0 12px ${el.style.background || '#6366f1'}88`;
      setTimeout(() => { el.style.transform = ''; el.style.boxShadow = ''; }, 280);
    });
  });

  // ── Chord chart inversion cards → play inversion (event delegation) ───────
  app.querySelector('#clChordChart')?.addEventListener('click', (e) => {
    const card = e.target.closest('.cl-inv-card');
    if (!card) return;
    unlockAudio();
    const chordName = card.dataset.chord;
    const invIdx = parseInt(card.dataset.inv);
    const { qual } = parseChordName(chordName);
    const root = chordRootMidi(chordName);
    const ivs = QUALITY_INTERVALS_CL[qual] || QUALITY_INTERVALS_CL[''];
    const rootMidis = ivs.map(iv => root + iv);
    const invMidis = [...rootMidis.slice(invIdx), ...rootMidis.slice(0, invIdx).map(m => m + 12)];
    const opts = { voice: settings.voice, volume: settings.volume / 100, duration: 1.4 };
    invMidis.forEach((m, i) => setTimeout(() => playNote(m, opts), i * 35));
    // Highlight the tapped inversion card briefly
    app.querySelectorAll('.cl-inv-card').forEach(c2 => c2.querySelector('div[style*="border"]') && (c2.querySelector('div[style*="border"]').style.transform = ''));
    const inner = card.querySelector('div[style*="border"]');
    if (inner) { inner.style.transform = 'scale(1.04)'; setTimeout(() => { inner.style.transform = ''; }, 300); }
  });
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
      <div class="row" style="flex-wrap:wrap;padding:8px 0"><span>Drums Volume</span><b id="dvv">${settings.drumVolume}%</b><input type="range" min="0" max="100" step="5" value="${settings.drumVolume}" id="drumVol"></div>
      ${sw('metronome', 'Metronome on by default')}
      ${sw('waitMode', 'Practice waits for the right note')}</div>
    <div class="card group"><h4>Effects</h4>
      <div style="display:flex;flex-wrap:wrap;gap:8px;padding:6px 0" id="fxGrid">
        ${[['none','🎹 Dry'],['flanger','🌀 Flanger'],['phaser','🔄 Phaser'],['saw','⚡ Saw'],['pingpong','🏓 Ping‑Pong'],['reverb','🏛 Reverb'],['plucking','🪕 Plucking'],['mixed','✨ Mixed']].map(([id,label])=>`<button data-fx="${id}" style="padding:7px 14px;border-radius:12px;font-size:12px;font-weight:700;cursor:pointer;border:2px solid ${settings.effect===id?'var(--p)':'var(--line)'};background:${settings.effect===id?'color-mix(in srgb,var(--p) 14%,transparent)':'transparent'};color:${settings.effect===id?'var(--p)':'var(--muted)'};transition:all .18s">${label}</button>`).join('')}
      </div></div>
    <div class="card group"><h4>Display</h4>
      <div class="row"><span>Theme</span><div class="seg" id="mode" style="width:230px"><button data-m="light">${icon('sun')}</button><button data-m="auto">Auto</button><button data-m="dark">${icon('moon')}</button></div></div>
      <div class="themes" id="themes">${themeGrid(settings.theme)}</div></div>
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
  $('#drumVol').oninput = (e) => { setSetting('drumVolume', Number(e.target.value)); $('#dvv').textContent = e.target.value + '%'; };
  $('#fxGrid').onclick = (e) => {
    const fx = e.target.closest('[data-fx]')?.dataset.fx; if (!fx) return;
    setSetting('effect', fx);
    unlockAudio(); setEffect(fx === 'none' ? null : fx);
    $('#fxGrid').querySelectorAll('[data-fx]').forEach(b => {
      const on = b.dataset.fx === fx;
      b.style.borderColor = on ? 'var(--p)' : 'var(--line)';
      b.style.background = on ? 'color-mix(in srgb,var(--p) 14%,transparent)' : 'transparent';
      b.style.color = on ? 'var(--p)' : 'var(--muted)';
    });
  };
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
      <div class="themes">${themeGrid(settings.theme)}</div>`;
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
  stopAllAudio();
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
  if (name === 'scales') return views.scales(params);
  if (name === 'chordsPractice') return views.chordsPractice(params);
  if (name === 'progressions') return views.progressions(params);
  if (name === 'progressionPlay') return views.progressionPlay(params, id && decodeURIComponent(id));
  if (name === 'chordsLibrary' && id) return views.chordsLibrarySong(params, decodeURIComponent(id));
  if (name === 'chordsLibrary') return views.chordsLibrary(params);
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

if ('serviceWorker' in navigator && !['localhost', '127.0.0.1'].includes(location.hostname)) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
  navigator.serviceWorker.addEventListener('message', (e) => { if (e.data?.type === 'SW_UPDATED') location.reload(); });
}

/* ---------- global page zoom ---------- */
const PAGE_ZOOMS = [0.55, 0.65, 0.75, 0.82, 0.9, 1, 1.1, 1.2];
const DEFAULT_PZ = window.innerWidth < 768 ? 3 : 5; // 0.82 on phones, 1.0 on desktop
let pzi = parseInt(localStorage.getItem('np.pz') ?? DEFAULT_PZ, 10);
localStorage.removeItem('scoreZoom'); // remove old per-score zoom
const applyPageZoom = () => { document.documentElement.style.zoom = PAGE_ZOOMS[pzi]; };
applyPageZoom();
const pzEl = document.createElement('div');
pzEl.id = 'pz';
pzEl.innerHTML = '<button id="pzOut">−</button><button id="pzIn">+</button>';
document.body.appendChild(pzEl);
document.getElementById('pzOut').addEventListener('click', () => { pzi = Math.max(0, pzi - 1); localStorage.setItem('np.pz', pzi); applyPageZoom(); });
document.getElementById('pzIn').addEventListener('click',  () => { pzi = Math.min(PAGE_ZOOMS.length - 1, pzi + 1); localStorage.setItem('np.pz', pzi); applyPageZoom(); });
