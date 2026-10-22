// Generates songs/hiphop.json — 100 Ninja Piano original hip-hop beats.
// All music is original (composer: "Ninja Piano Original") and public-domain safe.
// Run: node tools/gen-hiphop.mjs
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'songs', 'hiphop.json');

// ---------- pitch spelling ----------
const SHARP = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const FLAT  = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
const FLAT_KEYS = new Set(['F','Bb','Eb','Ab','Dm','Gm','Cm']);
const noteName = (midi, key) => {
  const pc = ((midi % 12) + 12) % 12;
  const oct = Math.floor(midi / 12) - 1;
  return `${(FLAT_KEYS.has(key) ? FLAT : SHARP)[pc]}${oct}`;
};
const nameTok = (midis, key) =>
  midis.length === 1 ? noteName(midis[0], key) : `(${midis.map(m => noteName(m, key)).join(' ')})`;

// ---------- diatonic chord engine ----------
const KEY_TONIC = { C:0, G:7, D:2, A:9, E:4, F:5, Bb:10, Eb:3, Ab:8, Am:9, Em:4, Bm:11, Dm:2, Gm:7, Cm:0 };
const isMinorKey = (k) => k.endsWith('m');
const MAJ_SCALE = [0,2,4,5,7,9,11];
const MIN_SCALE = [0,2,3,5,7,8,10];
const MAJ_QUAL  = ['maj','min','min','maj','maj','min','dim'];
const MIN_QUAL  = ['min','dim','maj','min','min','maj','maj'];

const diatonic = (key, degree) => {
  const tonic = KEY_TONIC[key];
  const minor = isMinorKey(key);
  const scale = minor ? MIN_SCALE : MAJ_SCALE;
  const rootPc = (tonic + scale[degree - 1]) % 12;
  const quality = (minor ? MIN_QUAL : MAJ_QUAL)[degree - 1];
  return { rootPc, quality };
};

const INTERVALS = {
  maj:  [0, 4, 7],
  min:  [0, 3, 7],
  dim:  [0, 3, 6],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
  dim7: [0, 3, 6, 10], // half-diminished (m7b5)
};

// Place chord (triad or 7th) with root in C4..B4 (midi 60..71). Stays in RH range A3..C6.
const voiceChord = (key, degree, seventh = false) => {
  const { rootPc, quality } = diatonic(key, degree);
  const kind = seventh
    ? (quality === 'maj' ? 'maj7' : quality === 'min' ? 'min7' : 'dim7')
    : quality;
  let root = 60 + rootPc;
  if (root > 71) root -= 12;
  return INTERVALS[kind].map(i => root + i);
};

// Bass note in C2..B2 (midi 36..47). Always in LH range (C2..E4).
const bassNote = (key, degree) => {
  const { rootPc } = diatonic(key, degree);
  return 36 + rootPc;
};

// ---------- style groove templates (each returns ONE bar, must sum to 4 beats) ----------
const STYLES = [
  { id: 'boom-bap', name: 'Boom-Bap', bpms: [86, 88, 90, 92],
    rh: (c, k) => `r/q ${nameTok(c, k)}/q r/q ${nameTok(c, k)}/q`,
    lh: (b, k) => `${nameTok([b], k)}/q r/q ${nameTok([b], k)}/q r/q`,
  },
  { id: 'trap', name: 'Trap', bpms: [138, 140, 142, 144],
    rh: (c, k) => `${nameTok(c, k)}/h ${nameTok(c, k)}/q ${nameTok(c, k)}/q`,
    lh: (b, k) => `${nameTok([b], k)}/qd r/8 ${nameTok([b], k)}/q ${nameTok([b], k)}/q`,
  },
  { id: 'lofi', name: 'Lo-Fi', bpms: [72, 75, 78, 80],
    rh: (c, k) => `${nameTok(c, k)}/h ${nameTok(c, k)}/q ${nameTok(c, k)}/q`,
    lh: (b, k) => `${nameTok([b], k)}/q ${nameTok([b], k)}/q ${nameTok([b], k)}/q ${nameTok([b], k)}/q`,
  },
  { id: 'gfunk', name: 'G-Funk', bpms: [92, 94, 96, 98],
    rh: (c, k) => {
      const t = nameTok(c, k);
      return `${t}/8 ${t}/8 ${t}/8 ${t}/8 ${t}/8 ${t}/8 ${t}/8 ${t}/8`;
    },
    lh: (b, k) => `${nameTok([b], k)}/q r/8 ${nameTok([b], k)}/8 ${nameTok([b], k)}/q r/q`,
  },
  { id: 'jazzrap', name: 'Jazz-Rap', bpms: [88, 90, 92, 94],
    rh: (c, k) => `r/q ${nameTok(c, k)}/q r/q ${nameTok(c, k)}/q`,
    lh: (b, k) => `${nameTok([b], k)}/q ${nameTok([b], k)}/8 ${nameTok([b], k)}/8 ${nameTok([b], k)}/q ${nameTok([b], k)}/q`,
  },
  { id: 'memphis', name: 'Memphis', bpms: [70, 72, 74, 76],
    rh: (c, k) => `${nameTok(c, k)}/h r/q ${nameTok(c, k)}/q`,
    lh: (b, k) => `${nameTok([b], k)}/w`,
  },
  { id: 'drill', name: 'Drill', bpms: [138, 140, 142, 144],
    rh: (c, k) => {
      const t = nameTok(c, k);
      return `r/8 ${t}/8 r/8 ${t}/8 r/8 ${t}/8 r/8 ${t}/8`;
    },
    lh: (b, k) => `${nameTok([b], k)}/qd r/8 ${nameTok([b], k)}/h`,
  },
  { id: 'phonk', name: 'Phonk', bpms: [130, 134, 138, 142],
    rh: (c, k) => `${nameTok(c, k)}/q ${nameTok(c, k)}/q ${nameTok(c, k)}/q ${nameTok(c, k)}/q`,
    lh: (b, k) => {
      const t = nameTok([b], k);
      return `${t}/8 r/8 ${t}/8 r/8 ${t}/8 r/8 ${t}/8 r/8`;
    },
  },
  { id: 'cloudrap', name: 'Cloud Rap', bpms: [65, 70, 75, 78],
    rh: (c, k) => `${nameTok(c, k)}/w`,
    lh: (b, k) => `r/q ${nameTok([b], k)}/qd ${nameTok([b], k)}/8 r/q`,
  },
  { id: 'hyphy', name: 'Hyphy', bpms: [100, 102, 104, 106],
    rh: (c, k) => {
      const t = nameTok(c, k);
      return `${t}/8 ${t}/8 ${t}/8 ${t}/8 ${t}/8 ${t}/8 ${t}/8 ${t}/8`;
    },
    lh: (b, k) => `${nameTok([b], k)}/q ${nameTok([b], k)}/q ${nameTok([b], k)}/q ${nameTok([b], k)}/q`,
  },
  { id: 'dirtysouth', name: 'Dirty South', bpms: [72, 75, 78, 80],
    rh: (c, k) => `${nameTok(c, k)}/qd ${nameTok(c, k)}/8 ${nameTok(c, k)}/h`,
    lh: (b, k) => `${nameTok([b], k)}/qd ${nameTok([b], k)}/8 ${nameTok([b], k)}/h`,
  },
  { id: 'soul', name: 'Soul-Rap', bpms: [80, 82, 84, 86],
    rh: (c, k) => `${nameTok(c, k)}/h ${nameTok(c, k)}/h`,
    lh: (b, k) => `${nameTok([b], k)}/q ${nameTok([b], k)}/q ${nameTok([b], k)}/q ${nameTok([b], k)}/q`,
  },
  { id: 'ukdrill', name: 'UK Drill', bpms: [140, 142, 144, 146],
    rh: (c, k) => `${nameTok(c, k)}/8 r/8 ${nameTok(c, k)}/8 r/8 ${nameTok(c, k)}/h`,
    lh: (b, k) => `${nameTok([b], k)}/w`,
  },
  { id: 'trapsoul', name: 'Trap Soul', bpms: [82, 84, 86, 88],
    rh: (c, k) => `${nameTok(c, k)}/h ${nameTok(c, k)}/q ${nameTok(c, k)}/q`,
    lh: (b, k) => `${nameTok([b], k)}/qd r/8 ${nameTok([b], k)}/h`,
  },
  { id: 'experimental', name: 'Experimental', bpms: [85, 95, 100, 110],
    rh: (c, k) => `${nameTok(c, k)}/16 ${nameTok(c, k)}/16 ${nameTok(c, k)}/8 ${nameTok(c, k)}/q ${nameTok(c, k)}/h`,
    lh: (b, k) => `r/8 ${nameTok([b], k)}/8 r/8 ${nameTok([b], k)}/8 r/q ${nameTok([b], k)}/q`,
  },
];

// ---------- 4-bar chord progressions (one chord per bar; looped 12x = 48 bars) ----------
const PROGS = [
  [1, 7, 6, 5],   // i-VII-VI-V (minor lament)
  [6, 4, 1, 5],   // vi-IV-I-V (major sensitive) / also usable in minor as 6-4-1-5
  [1, 4, 1, 5],   // i-iv-i-V (minor circle)
  [1, 6, 3, 7],   // i-VI-III-VII (hopeful minor)
  [2, 5, 1, 6],   // ii-V-I-vi (jazz turnaround)
  [1, 5, 6, 4],   // I-V-vi-IV (pop)
  [1, 7, 6, 7],   // i-VII-VI-VII (modal vamp)
  [6, 3, 4, 5],   // vi-iii-IV-V (nostalgic)
  [1, 4, 5, 1],   // I-IV-V-I (blues/classic)
  [1, 1, 4, 5],   // tonic-heavy pedal
];

// ---------- keys (minor-weighted for hip-hop feel) ----------
const KEY_ROTATION = [
  'Am','Em','Dm','Gm','Cm','Bm','Am','Em','Dm','Gm',  // ten minors
  'C','F','G','D','Bb','Eb','Am','Em','Dm','Gm',       // five majors, then more minors
];

// ---------- titles grouped by style (7 for first ten styles, 6 for last five) ----------
const TITLES_BY_STYLE = {
  'boom-bap':     ['Street Corner Theory','Boom-Bap Dreams','Midnight Freestyle','Vinyl Soul','Golden Era Theme','Back Alley Blocks','Crates And Breaks'],
  'trap':         ['Trap Horizon','808 Mountains','Lean Tempo','Diamond Mines','Southern Thunder','ATL After Dark','Luxury Trap'],
  'lofi':         ['Lo-Fi Study','Tape Hiss','Rainy Window','Cafe Loop','Vinyl Rain','Weekend Chill','Headphone Nap'],
  'gfunk':        ['West Coast Cruise','Compton Roll','Sunset Boulevard','Cali Breeze','Convertible Blues','G-Funk Garden','Pacific Flow'],
  'jazzrap':      ['Jazz Cafe Rap','Bronx Blue Note','Latch Key','Brass Monk','Smokey Lounge','Scribbled Rhymes','Notebook Jazz'],
  'memphis':      ['Memphis Nights','Three Six Shadows','Candlelit Church','Backroad Trunk','Dirty Keys','Dungeon Echoes','Southern Gothic'],
  'drill':        ['Drill Session','Opp Block Shadow','Brooklyn Drill','Chi-Town Cold','New York Drill','Smoke Signal','Rooftop Watch'],
  'phonk':        ['Phonk Garage','Memphis Revival','Cowbell Chaos','Underground Phonk','Night Rider','Phonk Alley','Black Smoke'],
  'cloudrap':     ['Cloud Nine Rap','Floating Verse','Vapor Mind','Atmosphere Beat','Haze Flow','Dream Script','Astral Flow'],
  'hyphy':        ['Hyphy Jam','Bay Area Bounce','Yay Area','Thizz Face','Bay Breeze','Oakland Nights','Scraper Bike'],
  'dirtysouth':   ['Dirty South Anthem','Houston Screw','Chopped And Keys','Codeine Cadence','Slab Season','Fourth Ward'],
  'soul':         ['Soul Rap Classic','Church Keys','Gospel Rap','Soulful Loop','Praise Flow','Harlem Keys'],
  'ukdrill':      ['UK Drill Shadow','Peckham Nights','South London','London Drizzle','Camden Haze','Brixton Blocks'],
  'trapsoul':     ['Trap Soul Love','Candle Trap','Midnight Confessions','Velvet 808','Silk Keys','Bedroom Soul'],
  'experimental': ['Avant Flow','Experimental Keys','Glitch Rhyme','Beat Scientist','Lab Session','Neon Fracture'],
};

// ---------- slug ----------
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// ---------- compose one song (A-B form: intro + verse + hook + verse + hook + outro) ----------
function makeSong(index) {
  const style = STYLES[index % STYLES.length];
  const slot  = Math.floor(index / STYLES.length);                            // 0..6
  const titleList = TITLES_BY_STYLE[style.id];
  const title = titleList[slot % titleList.length];
  const progA = PROGS[(index * 3 + slot) % PROGS.length];                     // verse
  const progB = PROGS[(index * 3 + slot + 5) % PROGS.length];                 // hook (contrasting)
  const key   = KEY_ROTATION[(index * 7 + slot * 2) % KEY_ROTATION.length];
  const bpm   = style.bpms[slot % style.bpms.length];
  const id    = `hiphop-${String(index + 1).padStart(3, '0')}-${slug(title)}`;

  const rh = [];
  const lh = [];

  // Intro — 4 bars, sustained whole notes: i → v → i → v
  for (const d of [1, 5, 1, 5]) {
    const c = voiceChord(key, d, false);
    const b = bassNote(key, d);
    rh.push(`${nameTok(c, key)}/w`);
    lh.push(`${nameTok([b], key)}/w`);
  }

  // Section runner — pushes `cycles` cycles of a 4-chord progression using the style groove.
  const pushSection = (prog, cycles, seventh) => {
    for (let i = 0; i < cycles * 4; i++) {
      const d = prog[i % 4];
      const c = voiceChord(key, d, seventh);
      const b = bassNote(key, d);
      rh.push(style.rh(c, key));
      lh.push(style.lh(b, key));
    }
  };

  pushSection(progA, 3, false);  // Verse 1 — 12 bars, triads
  pushSection(progB, 3, true);   // Hook 1  — 12 bars, 7th chords (richer, contrasting)
  pushSection(progA, 3, false);  // Verse 2 — 12 bars
  pushSection(progB, 3, true);   // Hook 2  — 12 bars

  // Outro — 4 bars cadence: iv → v → i → i
  for (const d of [4, 5, 1, 1]) {
    const c = voiceChord(key, d, false);
    const b = bassNote(key, d);
    rh.push(`${nameTok(c, key)}/w`);
    lh.push(`${nameTok([b], key)}/w`);
  }

  // Total bars: 4 + 12 + 12 + 12 + 12 + 4 = 56

  return {
    id,
    title,
    composer: 'Ninja Piano Original',
    cat: 'Hiphop',
    level: 'Medium',
    bpm,
    time: '4/4',
    key,
    rh: rh.join(' | '),
    lh: lh.join(' | '),
  };
}

// ---------- write ----------
const songs = Array.from({ length: 100 }, (_, i) => makeSong(i));
writeFileSync(OUT, JSON.stringify(songs, null, 2) + '\n');
console.log(`Wrote ${songs.length} songs → ${OUT}`);
