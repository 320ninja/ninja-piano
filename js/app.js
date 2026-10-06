import { THEMES, applyTheme } from './themes.js';
import { CATEGORIES, SONG_FILES, parseSong, buildTimeline, buildSteps, labelFor, midiName, durationSeconds, fmtTime } from './music.js';
import { renderScore } from './score.js';
import { playNote, playClick, unlockAudio, now } from './audio.js';
import { createKeyboard } from './keyboard.js';

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
};
const icon = (n, extra = '') => `<svg class="i" viewBox="0 0 24 24" ${extra}>${P[n]}</svg>`;
const LOGO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3" fill="currentColor"/><circle cx="18" cy="16" r="3" fill="currentColor"/></svg>';

const CAT_ART = {
  Kids: ['⭐', '#fde68a', '#f59e0b'], Classical: ['🎻', '#fcd9b6', '#b45309'], Pop: ['🎤', '#fbcfe8', '#db2777'],
  Folk: ['🪕', '#d9f99d', '#65a30d'], Holiday: ['🎄', '#bbf7d0', '#dc2626'], Hymns: ['🕊️', '#e0f2fe', '#0284c7'],
  Jazz: ['🎷', '#fde68a', '#7c2d12'], Blues: ['🎸', '#bfdbfe', '#1e3a8a'], Rock: ['🤘', '#fecaca', '#111827'],
  EDM: ['🎧', '#a5f3fc', '#7c3aed'], Exercises: ['🎯', '#ddd6fe', '#4f46e5'],
};
const thumb = (s) => {
  const [e, c1, c2] = CAT_ART[s.cat] || CAT_ART.Kids;
  return `<div class="thumb" style="background:linear-gradient(135deg,${c1},${c2})">${e}</div>`;
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
  return `<a class="song" href="#/song/${s.id}">
    ${thumb(s)}
    <div class="meta"><div class="t">${esc(s.title)}</div>
      <div class="s">${esc(s.composer || 'Traditional')}${opts.time ? ' · ' + fmtTime(durationSeconds(parseSong(s))) : ''}</div>
      <div class="tags"><span class="tag ${s.level}">${s.level}</span><span class="tag cat">${s.cat}</span>${p?.done ? `<span class="tag done">✓ ${p.best}%</span>` : ''}</div>
    </div><span class="play">${icon('play')}</span></a>`;
};

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
  const hour = new Date().getHours();
  const hi = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  app.innerHTML = `<section class="view">
    <div class="top"><div class="brand"><span class="logo">${LOGO}</span>Ninja Piano</div>
      <a class="iconbtn" href="#/library?focus=1" aria-label="Search">${icon('search')}</a></div>
    <h2>${hi}${settings.name ? ', ' + esc(settings.name) : ''}! 👋</h2>
    <div class="muted">Choose a song to start learning</div>
    ${lastSong ? `<h3>Continue learning</h3>
      <div class="hero-card">${thumb(lastSong)}<div style="flex:1;min-width:0"><div style="font-weight:800;font-size:17px">${esc(lastSong.title)}</div>
      <div style="opacity:.8;font-size:13px">Best ${progress[lastSong.id].best || 0}% · ${progress[lastSong.id].plays} plays</div></div>
      <a class="btn sm" href="#/practice/${lastSong.id}">Practice</a></div>` : ''}
    <h3>Your progress</h3>
    <div class="stats"><div class="card stat"><b>${learned}</b><span>Songs learned</span></div>
      <div class="card stat"><b>${streak}🔥</b><span>Day streak</span></div>
      <div class="card stat"><b>${avg}%</b><span>Avg accuracy</span></div></div>
    ${pick ? `<h3>Song of the day</h3><div class="list">${songRow(pick, { time: true })}</div>` : ''}
    <h3>Browse <a href="#/library">See all ${SONGS.length}</a></h3>
    <div class="chips" id="cats">${['All', ...CATEGORIES].map((c) => `<button class="chip ${c === cat ? 'on' : ''}" data-c="${c}">${c === 'All' ? 'All' : (CAT_ART[c]?.[0] || '') + ' ' + c}</button>`).join('')}</div>
    <div class="list grid2">${pool.slice(0, 12).map((s) => songRow(s)).join('') || '<div class="empty">No songs yet.</div>'}</div>
    ${pool.length > 12 ? `<div style="text-align:center;margin-top:14px"><a class="btn ghost sm" href="#/library?cat=${encodeURIComponent(cat)}">More ${cat === 'All' ? '' : cat} songs</a></div>` : ''}
  </section>`;
  app.querySelector('#cats').onclick = (e) => {
    const c = e.target.closest('.chip')?.dataset.c;
    if (!c) return;
    sessionStorage.setItem('np.homeCat', c);
    views.home();
  };
};

views.library = (params) => {
  setNav('library');
  const PAGE = 30;
  const st = { q: '', cat: params.get('cat') || 'All', level: 'All', fav: params.get('fav') === '1', page: 1 };
  if (st.cat !== 'All' && !CATEGORIES.includes(st.cat)) st.cat = 'All';
  app.innerHTML = `<section class="view">
    <div class="top"><a class="iconbtn" href="#/home">${icon('back')}</a><h1>All Songs</h1><button class="iconbtn" id="fav" aria-label="Favourites">${icon('heart')}</button></div>
    <label class="search">${icon('search')}<input id="q" type="search" placeholder="Search ${SONGS.length} songs, composers…" autocomplete="off"></label>
    <div class="chips" id="cats">${['All', ...CATEGORIES].map((c) => `<button class="chip" data-c="${c}">${c}</button>`).join('')}</div>
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
    $('#pager').innerHTML = pages > 1 ? Array.from({ length: pages }, (_, i) => `<button class="${i + 1 === st.page ? 'on' : ''}" data-p="${i + 1}">${i + 1}</button>`).join('') : '';
  };
  $('#q').oninput = (e) => { st.q = e.target.value; st.page = 1; draw(); };
  $('#cats').onclick = (e) => { const c = e.target.closest('.chip')?.dataset.c; if (c) { st.cat = c; st.page = 1; draw(); } };
  $('#lv').onclick = (e) => { const l = e.target.closest('.chip')?.dataset.l; if (l) { st.level = l; st.page = 1; draw(); } };
  $('#fav').onclick = () => { st.fav = !st.fav; st.page = 1; draw(); };
  $('#pager').onclick = (e) => { const p = e.target.dataset.p; if (p) { st.page = Number(p); draw(); scrollTo({ top: 0, behavior: 'smooth' }); } };
  draw();
  if (params.get('focus')) $('#q').focus();
};

views.practiceHub = () => {
  setNav('practice');
  const inProgress = Object.entries(progress).filter(([id, p]) => !p.done && songById(id)).map(([id]) => songById(id));
  const easy = SONGS.filter((s) => s.level === 'Easy' && !progress[s.id]?.done).slice(0, 8);
  const ex = SONGS.filter((s) => s.cat === 'Exercises').slice(0, 6);
  app.innerHTML = `<section class="view">
    <div class="top"><div class="brand"><span class="logo">${LOGO}</span>Practice</div></div>
    <div class="card pad" style="display:flex;gap:14px;align-items:center">
      <div style="font-size:40px">🥷</div>
      <div><b>How practice works</b><div class="muted" style="font-size:13.5px;margin-top:4px">The next note glows on the keyboard and its name shows on the sheet. Play it to move on. Use the on-screen keys, your computer keyboard (A S D F…) or a MIDI piano.</div></div>
    </div>
    ${inProgress.length ? `<h3>Keep going</h3><div class="list grid2">${inProgress.map((s) => songRow(s)).join('')}</div>` : ''}
    <h3>Warm-up exercises</h3><div class="list grid2">${ex.map((s) => songRow(s)).join('') || '<div class="empty">Loading…</div>'}</div>
    <h3>Easy songs to learn next</h3><div class="list grid2">${easy.map((s) => songRow(s)).join('')}</div>
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
      $('#cnote').textContent = lead.names.map((n) => labelFor(n, settings.nameSystem)).join(' ');
      const nxt = tl.events.find((e) => st.hands.includes(e.hand) && e.start > lead.start && e.hand === lead.hand);
      $('#nnote').textContent = nxt ? `Next: ${nxt.names.map((n) => labelFor(n, settings.nameSystem)).join(' ')} ›` : '';
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

views.practice = (params, id) => {
  const song = songById(id);
  if (!song) return notFound();
  setNav('practice-run');
  const parsed = parseSong(song);
  const tl = buildTimeline(parsed);
  const handPref = sessionStorage.getItem('np.hands') || 'rh';
  const st = { hands: handPref === 'both' ? ['rh', 'lh'] : [handPref], idx: 0, wrong: 0, firstTry: 0, missedStep: false, pressed: new Set(), t0: Date.now() };
  let steps = buildSteps(tl, st.hands);
  if (!steps.length) { st.hands = ['rh', 'lh']; steps = buildSteps(tl, st.hands); }

  app.innerHTML = `<section class="view">
    <div class="top"><a class="iconbtn" href="#/song/${id}">${icon('back')}</a><h1>Practice Mode</h1><button class="iconbtn" id="listen" aria-label="Listen">${icon('ear')}</button></div>
    <div class="card prac-top">
      <div class="ring"><svg viewBox="0 0 84 84" width="84" height="84"><circle cx="42" cy="42" r="36" stroke="var(--line)" stroke-width="8" fill="none"/>
        <circle id="arc" cx="42" cy="42" r="36" stroke="var(--a)" stroke-width="8" fill="none" stroke-linecap="round" stroke-dasharray="226" stroke-dashoffset="226" style="transition:stroke-dashoffset .4s var(--ease)"/></svg>
        <b><span id="cnt">0/${steps.length}</span><small>Notes</small></b></div>
      <div class="feedback wait" id="fb"><span class="fi">${icon('practice')}</span><div><span id="fbt">Play the glowing key</span><small id="fbs">${esc(song.title)}</small></div></div>
    </div>
    <div class="seg hand" id="hands"><button data-h="rh">Right hand</button><button data-h="lh">Left hand</button><button data-h="both">Both</button></div>
    <div class="card score-wrap"><div class="score" id="score"></div></div>
    <div class="kb-dock">
      <div class="card kb-info"><div class="cn">Play this note<b id="cnote">—</b></div><div class="next" id="nnote"></div></div>
      <div class="kb" id="kb"></div>
      <div class="prac-nav"><button class="btn soft" id="prev">${icon('arrowL')} Previous</button><button class="btn ok" id="next">Next ${icon('arrowR')}</button></div>
    </div>
  </section>`;
  const $ = (s) => app.querySelector(s);
  $('#hands').querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.h === (st.hands.length === 2 ? 'both' : st.hands[0])));
  const score = renderScore($('#score'), parsed, scoreOpts());
  const { low, high } = keyRange(parsed);
  const names = (midis) => midis.map((m) => labelFor(midiName(m), settings.nameSystem)).join(' ');

  const show = () => {
    const step = steps[st.idx];
    if (!step) return finish();
    st.pressed = new Set();
    st.missedStep = false;
    score.mark(step.events.map((e) => e.id), 'cur');
    scrollScoreTo($('#score'), score.cursorTo(step.events[0].id));
    kb.setTargets(step.midis);
    $('#cnote').textContent = step.events.map((e) => e.names.map((n) => labelFor(n, settings.nameSystem)).join(' ')).join(' + ');
    const nx = steps[st.idx + 1];
    $('#nnote').textContent = nx ? `Next: ${names(nx.midis)} ›` : 'Last note!';
    $('#cnt').textContent = `${st.idx}/${steps.length}`;
    $('#arc').style.strokeDashoffset = 226 - (226 * st.idx) / steps.length;
  };
  const feedback = (kind, title, sub) => {
    const fb = $('#fb');
    fb.className = `feedback ${kind}`;
    void fb.offsetWidth;
    fb.classList.add('pop');
    fb.querySelector('.fi').innerHTML = icon(kind === 'bad' ? 'x' : kind === 'wait' ? 'practice' : 'check');
    $('#fbt').textContent = title;
    $('#fbs').textContent = sub;
  };
  const PRAISE = ['Good!', 'Great!', 'Nice!', 'Perfect!', 'Awesome!', 'Well done!'];
  const advance = () => {
    const step = steps[st.idx];
    step.events.forEach((e) => score.add(e.id, st.missedStep ? 'miss' : 'hit'));
    if (!st.missedStep) st.firstTry++;
    st.idx++;
    show();
  };
  const onPress = (m) => {
    unlockAudio();
    playNote(m, { voice: settings.voice, volume: settings.volume / 100 });
    const step = steps[st.idx];
    if (!step) return;
    if (step.midis.includes(m)) {
      st.pressed.add(m);
      kb.flash(m, 'good');
      if (step.midis.every((x) => st.pressed.has(x))) {
        feedback('', PRAISE[Math.floor(Math.random() * PRAISE.length)], st.missedStep ? 'Got it — keep going!' : 'Keep going!');
        setTimeout(advance, 120);
      }
    } else {
      st.wrong++;
      st.missedStep = true;
      kb.flash(m, 'wrong');
      navigator.vibrate?.(40);
      feedback('bad', 'Try again', `That was ${labelFor(midiName(m), settings.nameSystem)} — play ${names(step.midis)}`);
      if (!settings.waitMode) { setTimeout(advance, 300); }
    }
  };
  const kb = createKeyboard($('#kb'), { low, high, labels: settings.keyLabels, nameSystem: settings.nameSystem, onPress });

  const finish = () => {
    const total = steps.length;
    const acc = Math.round((st.firstTry / Math.max(1, total)) * 100);
    const secs = Math.round((Date.now() - st.t0) / 1000);
    const p = progress[id] || { best: 0, plays: 0, done: false };
    progress[id] = { best: Math.max(p.best, acc), plays: p.plays + 1, done: p.done || acc >= 60, last: Date.now() };
    saveProgress();
    bumpStreak();
    sessionStorage.setItem('np.result', JSON.stringify({ id, notes: total, secs, acc }));
    location.hash = `#/done/${id}`;
  };

  $('#prev').onclick = () => { if (st.idx > 0) { st.idx--; score.mark([], 'hit'); show(); feedback('wait', 'Back one note', ''); } };
  $('#next').onclick = () => { st.missedStep = true; advance(); feedback('wait', 'Skipped', 'Skipped notes don’t count toward accuracy'); };
  $('#listen').onclick = () => {
    const step = steps[st.idx]; if (!step) return;
    unlockAudio();
    step.midis.forEach((m) => playNote(m, { voice: settings.voice, volume: settings.volume / 100 }));
    kb.showPlaying(step.midis, 400);
  };
  $('#hands').onclick = (e) => {
    const h = e.target.dataset.h; if (!h) return;
    sessionStorage.setItem('np.hands', h);
    views.practice(params, id);
  };
  progress[id] = { ...(progress[id] || { best: 0, plays: 0, done: false }), last: Date.now() };
  saveProgress();
  show();
  cleanup = () => kb.destroy();
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
    <div><div class="trophy">🏆</div><h2>${title}</h2><div style="opacity:.75">You completed the song!</div>
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
    <div class="top"><div class="brand"><span class="logo">${LOGO}</span>Settings</div></div>
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
  const map = { home: views.home, library: views.library, practice: id ? views.practice : views.practiceHub, song: views.song, done: views.done, settings: views.settings, welcome: views.welcome };
  (map[name] || views.home)(params, id && decodeURIComponent(id));
};
addEventListener('hashchange', route);
route();

if ('serviceWorker' in navigator && !['localhost', '127.0.0.1'].includes(location.hostname)) navigator.serviceWorker.register('sw.js').catch(() => {});
