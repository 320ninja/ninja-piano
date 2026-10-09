// Converts a MusicXML string into the app's song format.
const TYPE_MAP = { whole: 'w', half: 'h', quarter: 'q', eighth: '8', '16th': '16' };

const MAJOR_KEY = { '-4':'Ab','-3':'Eb','-2':'Bb','-1':'F','0':'C','1':'G','2':'D','3':'A','4':'E' };
const MINOR_KEY = { '-2':'Gm','-1':'Dm','0':'Am','1':'Em','2':'Bm' };

function resolveKey(fifths, mode) {
  const f = String(Math.max(-4, Math.min(4, fifths)));
  return mode === 'minor' ? (MINOR_KEY[f] || 'Am') : (MAJOR_KEY[f] || 'C');
}

function noteToken(noteEl) {
  if (noteEl.querySelector('grace')) return null;
  const isRest = !!noteEl.querySelector('rest');
  const typeEl = noteEl.querySelector('type');
  if (!typeEl) return null;
  const base = TYPE_MAP[typeEl.textContent.trim()];
  if (!base) return null;
  const dur = noteEl.querySelector('dot') ? base + 'd' : base;
  if (isRest) return { rest: true, dur, pitch: null };
  const pitch = noteEl.querySelector('pitch');
  if (!pitch) return null;
  const step = pitch.querySelector('step')?.textContent || 'C';
  const oct  = pitch.querySelector('octave')?.textContent || '4';
  const alt  = parseFloat(pitch.querySelector('alter')?.textContent || '0');
  const acc  = alt >= 1 ? '#' : alt <= -1 ? 'b' : '';
  return { rest: false, dur, pitch: `${step}${acc}${oct}`, chord: !!noteEl.querySelector('chord') };
}

function measureToText(measureEl) {
  const tokens = [];
  const notes = measureEl.querySelectorAll('note');
  let group = null;

  const flush = () => {
    if (!group) return;
    if (group.pitches.length === 1) tokens.push(`${group.pitches[0]}/${group.dur}`);
    else tokens.push(`(${group.pitches.join(' ')})/${group.dur}`);
    group = null;
  };

  for (const n of notes) {
    const t = noteToken(n);
    if (!t) continue;
    if (t.rest) { flush(); tokens.push(`r/${t.dur}`); continue; }
    if (t.chord && group) { group.pitches.push(t.pitch); continue; }
    flush();
    group = { pitches: [t.pitch], dur: t.dur };
  }
  flush();
  return tokens.join(' ') || 'r/w';
}

function parsePart(partEl) {
  return [...partEl.querySelectorAll('measure')].map(measureToText);
}

export function parseMusicXML(xml) {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');

  const fifths = parseInt(doc.querySelector('fifths')?.textContent || '0');
  const mode   = doc.querySelector('mode')?.textContent?.trim() || 'major';
  const beats  = doc.querySelector('beats')?.textContent || '4';
  const btype  = doc.querySelector('beat-type')?.textContent || '4';
  const time   = ['2/4','3/4','4/4','6/8'].includes(`${beats}/${btype}`) ? `${beats}/${btype}` : '4/4';
  const bpm    = Math.min(200, Math.max(40, parseInt(doc.querySelector('sound[tempo]')?.getAttribute('tempo') || '100')));
  const title  = doc.querySelector('movement-title,work-title,credit-words')?.textContent?.trim() || 'Scanned Song';
  const comp   = doc.querySelector('creator[type="composer"]')?.textContent?.trim() || '';

  const parts = [...doc.querySelectorAll('part')];
  let rh = ['r/w'], lh = ['r/w'];
  if (parts.length >= 2) { rh = parsePart(parts[0]); lh = parsePart(parts[1]); }
  else if (parts.length === 1) { rh = parsePart(parts[0]); lh = rh.map(() => 'r/w'); }

  const bars = Math.max(rh.length, lh.length, 1);
  while (rh.length < bars) rh.push('r/w');
  while (lh.length < bars) lh.push('r/w');

  return {
    id: 'scan-' + Date.now(),
    title, composer: comp,
    key: resolveKey(fifths, mode), time, bpm,
    cat: 'Classical', level: 'Medium',
    rh: rh.join(' | '), lh: lh.join(' | '),
  };
}
