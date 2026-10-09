import { THEMES, applyTheme } from './themes.js';
import { CATEGORIES, SONG_FILES, parseSong, buildTimeline, buildSteps, labelFor, midiName, durationSeconds, fmtTime, chordName } from './music.js';
import { renderScore } from './score.js';
import { playNote, playClick, unlockAudio, now } from './audio.js';
import { createKeyboard } from './keyboard.js';
import { parseMusicXML } from './musicxml.js';

/* ---------- storage ---------- */
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } };

const DEFAULTS = {
  name: '', theme: 'ninja', mode: 'auto', showNames: true, keyLabels: true, highlight: true,
  nameSystem: 'letters', tempo: 100, voice: 'grand', volume: 80, metronome: false, waitMode: true, seenWelcome: false,
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
};
const icon = (n, extra = '') => `<svg class="i" viewBox="0 0 24 24" ${extra}>${P[n]}</svg>`;
const LOGO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3" fill="currentColor"/><circle cx="18" cy="16" r="3" fill="currentColor"/></svg>';

const CAT_ART = {
  Kids: ['⭐', '#fde68a', '#f59e0b'], Classical: ['🎻', '#fcd9b6', '#b45309'], Pop: ['🎤', '#fbcfe8', '#db2777'],
  Folk: ['🪕', '#d9f99d', '#65a30d'], Holiday: ['🎄', '#bbf7d0', '#dc2626'], Hymns: ['🕊️', '#e0f2fe', '#0284c7'],
  Jazz: ['🎷', '#fde68a', '#7c2d12'], Blues: ['🎸', '#bfdbfe', '#1e3a8a'], Rock: ['🤘', '#fecaca', '#111827'],
  EDM: ['🎧', '#a5f3fc', '#7c3aed'], Fingerstyle: ['🖐️', '#fde68a', '#0d9488'], Exercises: ['🎯', '#ddd6fe', '#4f46e5'],
};
const thumb = (s) => {
  const [e, c1, c2] = CAT_ART[s.cat] || CAT_ART.Kids;
  return `<div class="thumb" style="background:linear-gradient(135deg,${c1},${c2})">${e}</div>`;
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

  app.innerHTML = `<section class="view">
    <div class="top"><div class="brand"><span class="logo">${LOGO}</span>Ninja Piano</div>
      ${THEME_BTN}<a class="iconbtn" href="#/library?focus=1" aria-label="Search">${icon('search')}</a></div>
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
    ${heading('🎯', 'Practice styles')}
    <div class="list grid2">
      <div class="card pad"><b>🎓 Learn</b><div class="muted" style="font-size:13px;margin-top:4px">Step by step. The app waits for the right key.</div></div>
      <div class="card pad"><b>🥁 Rhythm</b><div class="muted" style="font-size:13px;margin-top:4px">Play in time and get scored Perfect, Good or Miss.</div></div>
      <div class="card pad"><b>🧠 Memory</b><div class="muted" style="font-size:13px;margin-top:4px">No names or glowing keys. Read the real notes.</div></div>
      <div class="card pad"><b>🚀 Speed Builder</b><div class="muted" style="font-size:13px;margin-top:4px">Loop a section from 60% up to full speed.</div></div>
    </div>
    <div class="muted" style="font-size:12.5px;margin:6px 2px">Open any song, tap Practice, then choose a style. You can also pick hands, bars and speed.</div>
    ${heading('🎮', 'Skill games')}
    <div class="list grid2">
      <a class="song" href="#/quiz/read"><div class="thumb" style="background:linear-gradient(135deg,#ddd6fe,#6d5dfc)">🎼</div><div class="meta"><div class="t">Note Reading</div><div class="s">See a note on the staff, play it</div><div class="tags"><span class="tag cat">Best ${load('np.quiz.read', 0)}🔥</span></div></div><span class="play">${icon('play')}</span></a>
      <a class="song" href="#/quiz/ear"><div class="thumb" style="background:linear-gradient(135deg,#a7f3d0,#059669)">👂</div><div class="meta"><div class="t">Ear Training</div><div class="s">Hear a note, find it on the keys</div><div class="tags"><span class="tag cat">Best ${load('np.quiz.ear', 0)}🔥</span></div></div><span class="play">${icon('play')}</span></a>
    </div>
    ${heading('🔥', 'Hard challenges')}<div class="list grid2">${SONGS.filter((s) => s.level === 'Hard').slice(0, 6).map((s) => songRow(s)).join('')}</div>
    ${inProgress.length ? `${heading('💪', 'Keep going')}<div class="list grid2">${inProgress.map((s) => songRow(s)).join('')}</div>` : ''}
    ${heading('🔥', 'Warm-up exercises')}<div class="list grid2">${ex.map((s) => songRow(s)).join('') || '<div class="empty">Loading…</div>'}</div>
    ${heading('🌱', 'Easy songs to learn next')}<div class="list grid2">${easy.map((s) => songRow(s)).join('')}</div>
    ${heading('📷', 'Scan sheet music')}
    <a class="song" href="#/scan">
      <div class="thumb" style="background:linear-gradient(135deg,#e0f2fe,#0284c7)">${icon('scan')}</div>
      <div class="meta"><div class="t">Import from photo or PDF</div>
        <div class="s">Scan printed sheet music and play it instantly</div>
        <div class="tags"><span class="tag cat">OMR</span><span class="tag cat">Free</span></div>
      </div><span class="play">${icon('arrowR')}</span>
    </a>
  </section>`;
};

/* --- shared player/practice pieces --- */
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
      <button class="iconbtn ${favs.has(id) ? 'on' : ''}" id="fav" aria-label="Favourite">${icon('heart')}</button></div>
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
    <div style="display:flex;gap:10px;margin-top:14px"><a class="btn block ok" href="#/practice/${id}">${icon('practice')} Practice this song</a></div>
    <div class="kb-dock">
      <div class="card kb-info"><div class="cn">Current note<b id="cnote">—</b></div><div class="next" id="nnote"></div></div>
      <div class="kb" id="kb"></div>
    </div>
  </section>`;
  const $ = (s) => app.querySelector(s);
  let score;
  const draw = () => { score = renderScore($('#score'), parsed, scoreOpts()); };
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
      if (st.loop) { seek(0); start(); return; }
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
  let rw = innerWidth;
  const onResize = () => { if (Math.abs(innerWidth - rw) > 30) { rw = innerWidth; draw(); } };
  addEventListener('resize', onResize);
  cleanup = () => { stop(); kb.destroy(); removeEventListener('resize', onResize); };
};

const PRACTICE_STYLES = {
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
  const timed = style === 'rhythm' || style === 'speed';
  const hidden = style === 'memory';
  const st = { hands: cfg.hands === 'both' ? ['rh', 'lh'] : [cfg.hands], idx: 0, wrong: 0, score: 0, missedStep: false, pressed: new Set(), t0: Date.now(), loops: 0, speed: style === 'speed' ? Math.min(cfg.speed, 0.6) : cfg.speed, stepWrong: 0 };
  const inRange = (e) => e.bar >= cfg.from - 1 && e.bar <= cfg.to - 1;
  let steps = buildSteps({ events: tl.events.filter(inRange) }, st.hands);
  if (!steps.length) { st.hands = ['rh', 'lh']; steps = buildSteps({ events: tl.events.filter(inRange) }, st.hands); }
  const barOpts = (sel) => Array.from({ length: bars }, (_, i) => `<option value="${i + 1}" ${i + 1 === sel ? 'selected' : ''}>${i + 1}</option>`).join('');

  app.innerHTML = `<section class="view">
    <div class="top"><a class="iconbtn" href="#/song/${id}">${icon('back')}</a><h1>${PRACTICE_STYLES[style][0]} · ${esc(song.title)}</h1><button class="iconbtn" id="listen" aria-label="Listen">${icon('ear')}</button></div>
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
      <div class="card kb-info"><div class="cn">${hidden ? 'Read the note' : 'Play this note'}<b id="cnote">—</b></div><div class="next" id="nnote"></div></div>
      <div class="kb" id="kb"></div>
      <div class="prac-nav">${timed
        ? `<button class="btn soft" id="restart">${icon('restart')} Restart</button><button class="btn ok" id="go">${icon('play')} Start</button>`
        : `<button class="btn soft" id="prev">${icon('arrowL')} Previous</button><button class="btn ok" id="next">Next ${icon('arrowR')}</button>`}</div>
    </div>
  </section>`;
  const $ = (s) => app.querySelector(s);
  $('#hands').querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.h === cfg.hands));
  const score = renderScore($('#score'), parsed, { ...scoreOpts(), showNames: settings.showNames && !hidden, showChords: !hidden });
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
    <div class="top"><a class="iconbtn" href="#/practice">${icon('back')}</a><h1>${ear ? 'Ear Training' : 'Note Reading'}</h1><span style="width:42px"></span></div>
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
    <div id="status" style="display:none" class="card group">
      <div id="stmsg" class="muted" style="text-align:center;padding:8px 0;font-size:14px"></div>
    </div>
    <div id="result" style="display:none">
      <div class="card score-wrap" style="margin-top:12px"><div class="score" id="preview"></div></div>
      <div style="display:flex;gap:10px;margin-top:12px">
        <a class="btn block ok" id="loadBtn" href="#">${icon('play')} Load &amp; Play</a>
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
  const dzXml = $('#dropzoneXml');
  const fileXml = $('#fileXml');
  dzXml.onclick = () => fileXml.click();
  fileXml.onchange = (e) => { const f = e.target.files[0]; if (!f) return; f.text().then(loadXML); };
  dzXml.ondragover = (e) => { e.preventDefault(); dzXml.style.borderColor = 'var(--p)'; };
  dzXml.ondragleave = () => { dzXml.style.borderColor = 'var(--line)'; };
  dzXml.ondrop = (e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) f.text().then(loadXML); };

  const setStatus = (msg, show = true) => {
    status.style.display = show ? '' : 'none';
    stmsg.textContent = msg;
  };

  const dz = $('#dropzone');
  const fileInput = $('#file');
  const cameraInput = $('#fileCamera');

  const processFile = async (file) => {
    const url = ($('#srv').value.trim()).replace(/\/$/, '');
    if (!url) {
      setStatus('Enter your OMR server URL above first. Deploy the server/ folder to Render.com for free.');
      return;
    }
    setStatus('Uploading…');
    result.style.display = 'none';
    dz.style.borderColor = 'var(--p)';

    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${url}/scan`, { method: 'POST', body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || 'Server error');
      }
      const { musicxml } = await res.json();
      setStatus('Recognised! Parsing notes…');
      scannedSong = parseMusicXML(musicxml);
      renderScore($('#preview'), parseSong(scannedSong), scoreOpts());
      result.style.display = '';
      setStatus(`✓ "${scannedSong.title}" · ${scannedSong.rh.split('|').length} bars · ${scannedSong.key} ${scannedSong.time}`);
      dz.style.borderColor = 'var(--ok)';
    } catch (e) {
      setStatus('Error: ' + e.message);
      dz.style.borderColor = 'var(--bad)';
    }
  };

  $('#btnCamera').onclick = () => cameraInput.click();
  $('#btnFile').onclick = () => fileInput.click();
  cameraInput.onchange = (e) => { if (e.target.files[0]) processFile(e.target.files[0]); };
  dz.onclick = () => fileInput.click();
  fileInput.onchange = (e) => { if (e.target.files[0]) processFile(e.target.files[0]); };
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
  (map[name] || views.home)(params, id && decodeURIComponent(id));
};
addEventListener('hashchange', route);
route();

if ('serviceWorker' in navigator && !['localhost', '127.0.0.1'].includes(location.hostname)) navigator.serviceWorker.register('sw.js').catch(() => {});
