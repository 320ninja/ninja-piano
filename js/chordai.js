// Music theory engine: chord recognition, scale detection, progression analysis.
// Works entirely offline — no API needed.

export const NOTE_NAMES  = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
export const NOTE_FLAT   = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];

// ── Chord types ──────────────────────────────────────────────────────────────
// Ordered longest-match first so more specific chords win.
const CHORD_DB = [
  // 5-note
  { s:'maj13',   i:[0,4,7,11,2,9]  },
  { s:'13',      i:[0,4,7,10,2,9]  },
  { s:'m13',     i:[0,3,7,10,2,9]  },
  { s:'maj9#11', i:[0,4,7,11,2,6]  },
  { s:'9#11',    i:[0,4,7,10,2,6]  },
  // 4-note
  { s:'maj9',    i:[0,2,4,7,11]    },
  { s:'9',       i:[0,2,4,7,10]    },
  { s:'m9',      i:[0,2,3,7,10]    },
  { s:'mM9',     i:[0,2,3,7,11]    },
  { s:'6/9',     i:[0,2,4,7,9]     },
  { s:'maj7#5',  i:[0,4,8,11]      },
  { s:'maj7b5',  i:[0,4,6,11]      },
  { s:'maj7',    i:[0,4,7,11]      },
  { s:'7#5',     i:[0,4,8,10]      },
  { s:'7b5',     i:[0,4,6,10]      },
  { s:'7',       i:[0,4,7,10]      },
  { s:'7b9',     i:[0,1,4,7,10]    },
  { s:'7#9',     i:[0,3,4,7,10]    },
  { s:'m7b5',    i:[0,3,6,10]      },
  { s:'mM7',     i:[0,3,7,11]      },
  { s:'m7',      i:[0,3,7,10]      },
  { s:'dim7',    i:[0,3,6,9]       },
  { s:'add9',    i:[0,2,4,7]       },
  { s:'madd9',   i:[0,2,3,7]       },
  { s:'6',       i:[0,4,7,9]       },
  { s:'m6',      i:[0,3,7,9]       },
  // 3-note
  { s:'sus4',    i:[0,5,7]         },
  { s:'sus2',    i:[0,2,7]         },
  { s:'aug',     i:[0,4,8]         },
  { s:'dim',     i:[0,3,6]         },
  { s:'5',       i:[0,7]           },  // power chord
  { s:'m',       i:[0,3,7]         },
  { s:'',        i:[0,4,7]         },  // major last
];

const INV_NAMES = ['', '1st inv', '2nd inv', '3rd inv', '4th inv'];

export function recognizeChord(midis) {
  if (!midis || midis.length < 2) return null;
  const sorted = [...midis].sort((a, b) => a - b);
  const bassNote = sorted[0] % 12;
  const pcs = [...new Set(sorted.map(m => m % 12))];

  let best = null;
  for (const pc of pcs) {
    const ivs = pcs.map(p => (p - pc + 12) % 12).sort((a, b) => a - b);
    for (const ct of CHORD_DB) {
      const required = ct.i.map(x => x % 12);
      const unique = [...new Set(required)].sort((a,b) => a-b);
      if (unique.length === ivs.length && unique.every((x, i) => x === ivs[i])) {
        const inv = pc !== bassNote ? INV_NAMES[pcs.indexOf(bassNote)] || `/${NOTE_NAMES[bassNote]}` : '';
        const slashBass = pc !== bassNote && !INV_NAMES[pcs.indexOf(bassNote)] ? `/${NOTE_NAMES[bassNote]}` : '';
        const score = ct.i.length * 10 + (pc === bassNote ? 5 : 0);
        if (!best || score > best.score) {
          best = {
            root: pc,
            bass: bassNote,
            suffix: ct.s,
            inv,
            name: preferFlat(pc) ? NOTE_FLAT[pc] + ct.s : NOTE_NAMES[pc] + ct.s,
            fullName: (preferFlat(pc) ? NOTE_FLAT[pc] : NOTE_NAMES[pc]) + ct.s + (pc !== bassNote ? `/${preferFlat(bassNote)?NOTE_FLAT[bassNote]:NOTE_NAMES[bassNote]}` : ''),
            invLabel: pcs.indexOf(bassNote) > 0 ? INV_NAMES[pcs.indexOf(bassNote)] : '',
            score,
          };
        }
        break;
      }
    }
  }
  return best;
}

function preferFlat(pc) { return [1,3,6,8,10].includes(pc); } // Bb, Eb, Ab, Db, Gb

// ── Scale / mode detection ────────────────────────────────────────────────────
const SCALES = [
  { name:'Major',            i:[0,2,4,5,7,9,11] },
  { name:'Natural Minor',    i:[0,2,3,5,7,8,10] },
  { name:'Harmonic Minor',   i:[0,2,3,5,7,8,11] },
  { name:'Melodic Minor',    i:[0,2,3,5,7,9,11] },
  { name:'Dorian',           i:[0,2,3,5,7,9,10] },
  { name:'Phrygian',         i:[0,1,3,5,7,8,10] },
  { name:'Lydian',           i:[0,2,4,6,7,9,11] },
  { name:'Mixolydian',       i:[0,2,4,5,7,9,10] },
  { name:'Locrian',          i:[0,1,3,5,6,8,10] },
  { name:'Pentatonic Major', i:[0,2,4,7,9]       },
  { name:'Pentatonic Minor', i:[0,3,5,7,10]      },
  { name:'Blues',            i:[0,3,5,6,7,10]    },
  { name:'Whole Tone',       i:[0,2,4,6,8,10]    },
  { name:'Diminished',       i:[0,2,3,5,6,8,9,11]},
];

export function detectScale(midis, keyPc) {
  const pcs = [...new Set(midis.map(m => m % 12))];
  let best = null, bestScore = -1;
  const root = keyPc ?? 0;
  for (const sc of SCALES) {
    for (let r = 0; r < 12; r++) {
      const shifted = sc.i.map(x => (x + r) % 12).sort((a,b)=>a-b);
      const hits = pcs.filter(p => shifted.includes(p)).length;
      const misses = pcs.filter(p => !shifted.includes(p)).length;
      const score = hits * 3 - misses * 2 + (r === root ? 2 : 0);
      if (score > bestScore) {
        bestScore = score;
        best = { name: (preferFlat(r) ? NOTE_FLAT[r] : NOTE_NAMES[r]) + ' ' + sc.name, root: r, scale: sc };
      }
    }
  }
  return best;
}

// ── Roman numeral analysis ────────────────────────────────────────────────────
const ROMAN = ['I','II','III','IV','V','VI','VII'];
const SCALE_DEGREES = {
  major:  [0,2,4,5,7,9,11],
  minor:  [0,2,3,5,7,8,10],
};

export function toRoman(rootPc, keyPc, isMinor, chordSuffix) {
  const scale = isMinor ? SCALE_DEGREES.minor : SCALE_DEGREES.major;
  const interval = (rootPc - keyPc + 12) % 12;
  const deg = scale.indexOf(interval);
  if (deg < 0) {
    // chromatic — use nearest
    const nearest = scale.reduce((a,b) => Math.abs(b-interval) < Math.abs(a-interval) ? b : a);
    const ndeg = scale.indexOf(nearest);
    const prefix = interval < nearest ? 'b' : '#';
    const isMin = chordSuffix.startsWith('m') && !chordSuffix.startsWith('maj');
    const roman = ROMAN[ndeg];
    return prefix + (isMin ? roman.toLowerCase() : roman) + chordSuffix.replace(/^m?/,'');
  }
  const isMin = chordSuffix.startsWith('m') && !chordSuffix.startsWith('maj');
  const roman = ROMAN[deg];
  const num = isMin ? roman.toLowerCase() : roman;
  // Add extension suffix for display
  const ext = chordSuffix.replace(/^m?/,'').replace(/^(maj|M)?/,'') || '';
  return num + (ext && ext !== '7' ? ext : (chordSuffix.includes('7') ? '7' : ''));
}

// ── Harmonic function ────────────────────────────────────────────────────────
// Returns 'tonic' | 'subdominant' | 'dominant' | 'other'
export function harmonicFunction(rootPc, keyPc, isMinor) {
  const iv = (rootPc - keyPc + 12) % 12;
  if (iv === 0) return 'tonic';
  if (iv === 9 && isMinor) return 'tonic';       // vi in major = tonic
  if (iv === 3 && isMinor) return 'tonic';       // III in minor
  if (iv === 5) return 'subdominant';             // IV
  if (iv === 2) return 'subdominant';             // ii
  if (iv === 10 && isMinor) return 'subdominant'; // bVII in minor
  if (iv === 7) return 'dominant';               // V
  if (iv === 11) return 'dominant';              // vii°
  if (iv === 1) return 'dominant';               // bII (Neapolitan)
  return 'other';
}

export const FUNCTION_COLOR = {
  tonic:       '#60a5fa',   // blue  – home
  subdominant: '#34d399',   // green – away
  dominant:    '#f87171',   // red   – tension
  other:       '#c084fc',   // purple
};

// ── Progression patterns ─────────────────────────────────────────────────────
const PROGRESSION_PATTERNS = [
  { name:'ii–V–I',        intervals:[2,7,0]     },
  { name:'I–IV–V',        intervals:[0,5,7]     },
  { name:'I–V–vi–IV',     intervals:[0,7,9,5]   },
  { name:'I–vi–IV–V',     intervals:[0,9,5,7]   },
  { name:'I–vi–ii–V',     intervals:[0,9,2,7]   },
  { name:'IV–V–I',        intervals:[5,7,0]     },
  { name:'I–IV–I–V',      intervals:[0,5,0,7]   },
  { name:'12-bar Blues',  intervals:[0,0,0,0,5,5,0,0,7,5,0,7] },
  { name:'I–bVII–IV',     intervals:[0,10,5]    },  // rock
  { name:'vi–IV–I–V',     intervals:[9,5,0,7]   },
  { name:'I–V–IV',        intervals:[0,7,5]     },
  { name:'iii–VI–ii–V',   intervals:[4,9,2,7]   },  // jazz cycle
  { name:'I–IV–vi–V',     intervals:[0,5,9,7]   },
];

export function detectProgression(chordRoots, keyPc) {
  // chordRoots: array of pitch classes in order
  const ivs = chordRoots.map(r => (r - keyPc + 12) % 12);
  for (const pat of PROGRESSION_PATTERNS) {
    const p = pat.intervals;
    // sliding window
    for (let i = 0; i <= ivs.length - p.length; i++) {
      const slice = ivs.slice(i, i + p.length);
      if (p.every((x, j) => x === slice[j])) {
        return { name: pat.name, startIdx: i, len: p.length };
      }
    }
  }
  return null;
}

// ── Full analysis of a step sequence ────────────────────────────────────────
export function analyzeSteps(steps, keyPc, isMinor) {
  // Group by bar
  const byBar = new Map();
  steps.forEach((step) => {
    step.events.forEach((e) => {
      const b = e.bar ?? 0;
      if (!byBar.has(b)) byBar.set(b, { firstBeat: step.start, lastBeat: step.start, midis: [] });
      const entry = byBar.get(b);
      const end = step.start + (e.beats || 0.5);
      if (end > entry.lastBeat) entry.lastBeat = end;
      e.midis.forEach(m => entry.midis.push(m));
    });
  });

  const chords = [];
  byBar.forEach(({ firstBeat, lastBeat, midis }, bar) => {
    const ch = recognizeChord(midis);
    if (!ch) return;
    const fn = harmonicFunction(ch.root, keyPc, isMinor);
    const roman = toRoman(ch.root, keyPc, isMinor, ch.suffix);
    chords.push({
      bar, beat: firstBeat, endBeat: lastBeat,
      chord: ch, fn, roman,
      color: FUNCTION_COLOR[fn],
    });
  });
  chords.sort((a, b) => a.beat - b.beat);

  // Detect overall progression
  const roots = chords.map(c => c.chord.root);
  const prog = detectProgression(roots, keyPc);

  // Scale for entire section
  const allMidis = steps.flatMap(s => s.events.flatMap(e => e.midis));
  const scale = detectScale(allMidis, keyPc);

  return { chords, progression: prog, scale };
}
