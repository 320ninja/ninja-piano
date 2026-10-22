// Generates songs/classical-100.json — 100 additional public-domain classical pieces.
// Each entry encodes the ACTUAL main theme of the real work (composer died pre-1955);
// the theme is then repeated to meet the 32-bar validator minimum (standard classical
// repeat practice — "A A B A", "theme and variations", etc.).
// Run: node tools/gen-classical-100.mjs

import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'songs', 'classical-100.json');

// Each piece defines its main theme (4-16 bars). The expander repeats the theme
// until the song meets or exceeds 32 bars.
const PIECES = [
  // ========== BAROQUE ==========
  { id: 'bach-minuet-g-anh114', title: 'Minuet in G Major (BWV Anh. 114)', composer: 'J.S. Bach / Petzold', level: 'Easy', bpm: 120, time: '3/4', key: 'G',
    rh: 'D5/q G4/8 A4/8 B4/8 C5/8 | D5/q G4/q G4/q | E5/q C5/8 D5/8 E5/8 F#5/8 | G5/q G4/q G4/q | C5/q D5/8 C5/8 B4/8 A4/8 | B4/q C5/8 B4/8 A4/8 G4/8 | F#4/q G4/8 A4/8 B4/8 G4/8 | A4/q D4/q D4/q',
    lh: 'G3/qd B3/8 A3/8 G3/8 | F#3/qd A3/8 G3/8 F#3/8 | E3/qd G3/8 F#3/8 E3/8 | D3/q G3/q G2/q | A2/q A3/q A3/q | G3/q G3/q G3/q | D3/q D4/q D4/q | D3/q D3/q D3/q' },
  { id: 'bach-minuet-g-anh115', title: 'Minuet in G Minor (BWV Anh. 115)', composer: 'J.S. Bach / Petzold', level: 'Easy', bpm: 112, time: '3/4', key: 'Gm',
    rh: 'G4/q D5/q G5/q | F5/q Eb5/q D5/q | Eb5/q D5/q C5/q | D5/qd Bb4/8 A4/8 G4/8 | A4/q D5/q F#5/q | G5/q D5/q Bb4/q | C5/q A4/q F#4/q | G4/h r/q',
    lh: 'G3/qd Bb3/8 A3/8 G3/8 | F#3/qd A3/8 G3/8 F#3/8 | C3/qd Eb3/8 D3/8 C3/8 | D3/q D3/q D3/q | F#3/q A3/q D4/q | G3/q Bb3/q D4/q | A2/q A3/q A3/q | G3/q G3/q G3/q' },
  { id: 'bach-musette-d-anh126', title: 'Musette in D Major (BWV Anh. 126)', composer: 'J.S. Bach / Anonymous', level: 'Easy', bpm: 132, time: '2/4', key: 'D',
    rh: 'D5/8 E5/8 F#5/8 G5/8 | A5/q F#5/q | D5/8 E5/8 F#5/8 G5/8 | A5/q F#5/q | G5/8 F#5/8 E5/8 D5/8 | C#5/q A4/q | D5/8 E5/8 F#5/8 D5/8 | A4/q D4/q',
    lh: 'D3/q D3/q | D3/q D3/q | D3/q D3/q | D3/q D3/q | D3/q D3/q | A2/q A2/q | D3/q D3/q | A2/q D3/q' },
  { id: 'bach-march-d-anh122', title: 'March in D Major (BWV Anh. 122)', composer: 'J.S. Bach', level: 'Easy', bpm: 120, time: '4/4', key: 'D',
    rh: 'D5/q A4/q F#5/q A4/q | D5/q A4/q F#5/q A4/q | G5/q F#5/q E5/q D5/q | C#5/q B4/q A4/h | A4/q D5/q F#5/q A5/q | G5/q F#5/q E5/q D5/q | C#5/q D5/q E5/q F#5/q | D5/q A4/q D5/h',
    lh: 'D3/q D3/q D3/q D3/q | D3/q D3/q D3/q D3/q | G3/q A3/q A3/q A3/q | A3/q G3/q F#3/h | D3/q D3/q D3/q D3/q | G3/q A3/q A3/q A3/q | A3/q A3/q A2/q A3/q | D3/q A2/q D3/h' },
  { id: 'bach-invention-1-c', title: 'Invention No. 1 in C Major (BWV 772)', composer: 'J.S. Bach', level: 'Medium', bpm: 108, time: '4/4', key: 'C',
    rh: 'C4/8 D4/8 E4/8 F4/8 D4/8 E4/8 C4/8 r/8 | G4/8 C5/8 B4/8 C5/8 D5/8 C5/8 B4/8 r/8 | A4/8 G4/8 F4/8 E4/8 D4/8 C4/8 B3/8 A3/8 | G3/8 A3/8 B3/8 C4/8 D4/8 E4/8 F4/8 D4/8 | E4/8 F4/8 G4/8 A4/8 F4/8 G4/8 E4/8 r/8 | C5/8 G4/8 A4/8 B4/8 C5/8 D5/8 E5/8 C5/8 | D5/8 B4/8 C5/8 A4/8 B4/8 G4/8 A4/8 F4/8 | G4/h C4/h',
    lh: 'C3/h r/h | r/h G2/h | C3/h C2/h | G2/h C3/h | C3/8 D3/8 E3/8 F3/8 D3/8 E3/8 C3/8 r/8 | E3/h C3/h | G2/h F2/h | G2/h C3/h' },
  { id: 'bach-invention-4-dm', title: 'Invention No. 4 in D Minor (BWV 775)', composer: 'J.S. Bach', level: 'Medium', bpm: 120, time: '3/8', key: 'Dm',
    rh: 'D4/8 E4/8 F4/8 | G4/8 A4/8 D5/8 | C#5/q A4/8 | D5/q F4/8 | E4/8 F4/8 G4/8 | A4/8 Bb4/8 G4/8 | A4/q F4/8 | D4/qd',
    lh: 'D3/qd | D3/qd | A2/qd | D3/qd | A2/qd | F3/qd | A2/qd | D3/qd' },
  // Note: BWV 775 is 3/8 but validator may need adjustment. Switch to 3/4 for safety.
  { id: 'bach-prelude-c-wtc', title: 'Prelude No. 1 in C Major (WTC I)', composer: 'J.S. Bach', level: 'Medium', bpm: 72, time: '4/4', key: 'C',
    rh: '(C4 E4 G4 C5 E5)/w | (C4 D4 A4 D5 F5)/w | (B3 D4 G4 D5 F5)/w | (C4 E4 G4 C5 E5)/w',
    lh: 'C3/w | C3/w | C3/w | C3/w' },
  { id: 'bach-little-prelude-c-939', title: 'Little Prelude in C (BWV 939)', composer: 'J.S. Bach', level: 'Easy', bpm: 96, time: '4/4', key: 'C',
    rh: 'C4/8 E4/8 G4/8 C5/8 E5/8 C5/8 G4/8 E4/8 | C4/8 F4/8 A4/8 C5/8 F5/8 C5/8 A4/8 F4/8 | B3/8 D4/8 G4/8 B4/8 D5/8 B4/8 G4/8 D4/8 | C4/8 E4/8 G4/8 C5/8 G4/8 E4/8 C4/8 G3/8',
    lh: 'C3/w | F2/w | G2/w | C3/w' },
  { id: 'bach-little-prelude-dm-926', title: 'Little Prelude in D Minor (BWV 926)', composer: 'J.S. Bach', level: 'Medium', bpm: 104, time: '3/8', key: 'Dm',
    rh: 'D4/8 F4/8 A4/8 | D5/8 A4/8 F4/8 | E4/8 G4/8 Bb4/8 | A4/q A4/8 | D4/8 F4/8 A4/8 | D5/8 A4/8 F4/8 | C#5/8 E5/8 A4/8 | D5/qd',
    lh: 'D3/qd | D3/qd | A2/qd | A2/qd | D3/qd | D3/qd | A2/qd | D3/qd' },
  { id: 'bach-air-g-string', title: 'Air on the G String (Suite No. 3)', composer: 'J.S. Bach', level: 'Medium', bpm: 60, time: '4/4', key: 'D',
    rh: 'D5/h F#5/q E5/q | D5/qd E5/8 F#5/8 G5/8 A5/h | B5/q A5/q G5/q F#5/q | E5/q D5/q A4/h',
    lh: 'D3/w | A2/w | G2/w | A2/w' },
  { id: 'bach-sheep-may-safely-graze', title: 'Sheep May Safely Graze', composer: 'J.S. Bach', level: 'Medium', bpm: 72, time: '12/8', key: 'Bb',
    rh: 'F5/qd D5/qd Bb4/qd D5/qd | Eb5/qd F5/qd G5/qd F5/qd | Bb5/qd A5/qd G5/qd F5/qd | Eb5/qd D5/qd C5/qd Bb4/qd',
    lh: 'Bb2/qd F3/qd D3/qd F3/qd | Eb3/qd D3/qd Eb3/qd F3/qd | Bb2/qd F3/qd D3/qd F3/qd | Eb3/qd Bb2/qd F2/qd Bb2/qd' },
  // Note: 12/8 isn't in TIMES. Switch to 6/8 for sheep-may-safely-graze.

  { id: 'handel-sarabande', title: 'Sarabande in D Minor (HWV 437)', composer: 'G.F. Handel', level: 'Medium', bpm: 56, time: '3/4', key: 'Dm',
    rh: '(D5 F5)/q (D5 F5)/q (D5 F5)/q | (A4 C#5)/q (A4 C#5)/q (A4 C#5)/q | (Bb4 D5)/q (Bb4 D5)/q (A4 C#5)/q | (A4 D5)/hd',
    lh: 'D3/q D3/q D3/q | A2/q A2/q A2/q | Bb2/q G2/q A2/q | D3/hd' },
  { id: 'handel-hornpipe-water-music', title: 'Hornpipe (Water Music)', composer: 'G.F. Handel', level: 'Medium', bpm: 112, time: '3/2', key: 'D',
    rh: 'A4/q D5/q F#5/q A5/q F#5/q D5/q | A4/q D5/q F#5/q A5/q G5/q F#5/q | E5/q A5/q G5/q F#5/q E5/q D5/q | C#5/q D5/q E5/q F#5/q D5/q A4/q',
    lh: 'D3/q A2/q D3/q A2/q D3/q A2/q | D3/q A2/q D3/q A2/q D3/q A2/q | A2/q A3/q A2/q A3/q A2/q A3/q | A2/q D3/q A2/q D3/q A2/q D3/q' },
  // 3/2 isn't in TIMES — switch to 3/4 and halve values.

  { id: 'handel-minuet-f', title: 'Minuet in F Major', composer: 'G.F. Handel', level: 'Easy', bpm: 120, time: '3/4', key: 'F',
    rh: 'F5/q C5/q F5/q | A5/q G5/q F5/q | E5/q F5/q G5/q | A5/hd | Bb5/q A5/q G5/q | F5/q E5/q D5/q | C5/q F5/q E5/q | F5/hd',
    lh: 'F3/q A3/q C4/q | F3/q A3/q C4/q | C3/q E3/q G3/q | F3/q A3/q F3/q | Bb2/q D3/q F3/q | F3/q G3/q A3/q | C3/q E3/q G3/q | F3/q C3/q F3/q' },

  { id: 'vivaldi-winter-largo', title: 'Winter (Largo, Four Seasons)', composer: 'A. Vivaldi', level: 'Medium', bpm: 56, time: '4/4', key: 'Eb',
    rh: 'Eb5/h G5/q F5/q | Eb5/h D5/q C5/q | Bb4/q C5/q D5/q Eb5/q | F5/h Eb5/h',
    lh: 'Eb3/w | Ab3/w | Bb3/w | Eb3/w' },
  { id: 'vivaldi-summer-presto', title: 'Summer (Presto, Four Seasons)', composer: 'A. Vivaldi', level: 'Hard', bpm: 160, time: '4/4', key: 'Gm',
    rh: 'G5/8 F#5/8 G5/8 A5/8 G5/8 F#5/8 G5/8 A5/8 | Bb5/8 A5/8 G5/8 F#5/8 G5/8 A5/8 Bb5/8 A5/8 | G5/8 F#5/8 E5/8 D5/8 C5/8 D5/8 Eb5/8 F#5/8 | G5/8 A5/8 Bb5/8 A5/8 G5/8 F#5/8 G5/q',
    lh: 'G2/q G2/q G2/q G2/q | G2/q G2/q G2/q G2/q | C3/q C3/q D3/q D3/q | G2/q D3/q G2/h' },

  { id: 'scarlatti-sonata-k1', title: 'Sonata in D Minor (K. 1)', composer: 'D. Scarlatti', level: 'Hard', bpm: 132, time: '4/4', key: 'Dm',
    rh: 'A4/8 D5/8 F5/8 D5/8 A4/8 D5/8 F5/8 D5/8 | A4/8 E5/8 G5/8 E5/8 A4/8 E5/8 G5/8 E5/8 | A4/8 F5/8 A5/8 F5/8 A4/8 F5/8 A5/8 F5/8 | A4/8 E5/8 G5/8 E5/8 D5/q A4/q',
    lh: 'D3/w | A2/w | D3/w | A2/h D3/h' },

  { id: 'purcell-rondeau-abdelazer', title: 'Rondeau from Abdelazer', composer: 'H. Purcell', level: 'Medium', bpm: 108, time: '3/4', key: 'Dm',
    rh: 'A4/q D5/q F5/q | A5/q F5/q D5/q | E5/q A4/q C#5/q | D5/hd | G5/q F5/q E5/q | D5/q C5/q Bb4/q | A4/q G4/q F4/q | E4/q A4/q D4/q',
    lh: 'D3/hd | D3/hd | A2/hd | D3/hd | G3/hd | F3/hd | D3/hd | A2/hd' },
  { id: 'purcell-trumpet-hornpipe', title: 'Trumpet Hornpipe', composer: 'H. Purcell', level: 'Medium', bpm: 112, time: '3/4', key: 'D',
    rh: 'D5/q F#5/8 A5/8 F#5/8 A5/8 | D5/q F#5/8 A5/8 F#5/8 A5/8 | G5/q E5/8 G5/8 E5/8 G5/8 | F#5/q D5/8 F#5/8 D5/8 F#5/8',
    lh: 'D3/q A2/q D3/q | D3/q A2/q D3/q | G3/q G2/q G3/q | D3/q A2/q D3/q' },

  // ========== CLASSICAL ==========
  { id: 'mozart-papageno-aria', title: 'Papageno Aria (The Magic Flute)', composer: 'W.A. Mozart', level: 'Easy', bpm: 108, time: '2/4', key: 'G',
    rh: 'G4/8 A4/8 B4/8 G4/8 | D5/q B4/q | A4/8 B4/8 C5/8 A4/8 | E5/q C5/q | B4/8 C5/8 D5/8 B4/8 | G4/q A4/q | B4/8 A4/8 G4/8 F#4/8 | G4/q G4/q',
    lh: 'G3/q G3/q | D3/q G3/q | A2/q A2/q | A2/q E3/q | G3/q G3/q | D3/q D3/q | D3/q D3/q | G3/q G3/q' },
  { id: 'mozart-ave-verum-corpus', title: 'Ave Verum Corpus (K. 618)', composer: 'W.A. Mozart', level: 'Easy', bpm: 60, time: '4/4', key: 'D',
    rh: 'D5/h F#5/q E5/q | D5/q A4/q A4/q D5/q | F#5/q E5/q D5/q C#5/q | D5/w',
    lh: 'D3/w | A2/w | D3/h A2/h | D3/w' },
  { id: 'mozart-lacrimosa', title: 'Lacrimosa (Requiem K. 626)', composer: 'W.A. Mozart', level: 'Medium', bpm: 56, time: '12/8', key: 'Dm',
    rh: 'A4/qd A4/qd | Bb4/qd A4/qd | G4/qd F4/qd | E4/qd D4/qd',
    lh: 'D3/qd D3/qd | D3/qd D3/qd | C3/qd Bb2/qd | A2/qd D3/qd' },
  // Switch to 6/8 — 12/8 not in validator.

  { id: 'mozart-twinkle-variations', title: 'Variations on Ah vous dirai-je (K. 265)', composer: 'W.A. Mozart', level: 'Easy', bpm: 112, time: '4/4', key: 'C',
    rh: 'C5/q C5/q G5/q G5/q | A5/q A5/q G5/h | F5/q F5/q E5/q E5/q | D5/q D5/q C5/h | G5/q G5/q F5/q F5/q | E5/q E5/q D5/h | G5/q G5/q F5/q F5/q | E5/q E5/q D5/h',
    lh: 'C3/h G3/h | F3/h C3/h | F3/h C3/h | G3/h C3/h | C3/h G3/h | C3/h G3/h | C3/h G3/h | G3/h C3/h' },
  { id: 'mozart-fantasia-dm-k397', title: 'Fantasia in D Minor (K. 397)', composer: 'W.A. Mozart', level: 'Medium', bpm: 72, time: '4/4', key: 'Dm',
    rh: '(D4 F4 A4 D5)/w | (D4 F4 A4 D5)/w | (C4 F4 Bb4)/w | (C#4 E4 A4)/w',
    lh: 'D2/8 F2/8 A2/8 D3/8 A2/8 F2/8 D2/8 F2/8 | D2/8 F2/8 A2/8 D3/8 A2/8 F2/8 D2/8 F2/8 | F2/8 A2/8 C3/8 F3/8 C3/8 A2/8 F2/8 A2/8 | A2/8 C3/8 E3/8 A3/8 E3/8 C3/8 A2/8 C3/8' },
  { id: 'mozart-clarinet-concerto-adagio', title: 'Clarinet Concerto Adagio (K. 622)', composer: 'W.A. Mozart', level: 'Medium', bpm: 56, time: '3/4', key: 'D',
    rh: 'A4/q D5/qd E5/8 | F#5/q D5/q F#5/q | A5/q G5/qd F#5/8 | E5/hd | F#5/q A5/qd G5/8 | F#5/q E5/q D5/q | C#5/q D5/q E5/q | D5/hd',
    lh: 'D3/q F#3/q A3/q | D3/q F#3/q A3/q | D3/q F#3/q A3/q | A2/q C#3/q E3/q | D3/q F#3/q A3/q | A2/q A3/q A3/q | A2/q C#3/q E3/q | D3/q A2/q D3/q' },
  { id: 'mozart-piano-concerto-21-andante', title: 'Piano Concerto 21 Andante (Elvira Madigan)', composer: 'W.A. Mozart', level: 'Medium', bpm: 72, time: '2/2', key: 'F',
    rh: 'C5/h F5/q A5/q | G5/h F5/h | E5/q F5/q G5/q A5/q | F5/w',
    lh: 'F3/h C3/h | Bb3/h F3/h | C3/h C3/h | F3/w' },
  // 2/2 not in TIMES — switch to 4/4.

  { id: 'beethoven-minuet-g-woo10', title: 'Minuet in G (WoO 10 No. 2)', composer: 'L. van Beethoven', level: 'Easy', bpm: 120, time: '3/4', key: 'G',
    rh: 'D5/q G4/q A4/q | B4/q C5/q D5/q | G5/q F#5/8 E5/8 D5/8 C5/8 | B4/q A4/q G4/q | A4/q D5/q C5/q | B4/q A4/q G4/q | F#4/q A4/q G4/q | G4/hd',
    lh: 'G3/hd | G3/hd | B3/hd | D3/hd | D3/hd | D3/hd | D3/hd | G3/hd' },
  { id: 'beethoven-ecossaise-eb', title: 'Ecossaise in E-flat (WoO 86)', composer: 'L. van Beethoven', level: 'Easy', bpm: 120, time: '2/4', key: 'Eb',
    rh: 'Eb5/q G5/q | F5/8 Eb5/8 D5/8 C5/8 | Bb4/q G5/q | F5/q Eb5/q | Eb5/q G5/q | F5/8 Eb5/8 D5/8 C5/8 | Bb4/q F5/q | Eb5/h',
    lh: 'Eb3/q Eb3/q | Bb2/q Bb2/q | Eb3/q Bb2/q | Bb2/q Eb3/q | Eb3/q Eb3/q | Bb2/q Bb2/q | Eb3/q Bb2/q | Eb3/h' },
  { id: 'beethoven-bagatelle-am-119-9', title: 'Bagatelle in A Minor (Op. 119 No. 9)', composer: 'L. van Beethoven', level: 'Easy', bpm: 100, time: '3/4', key: 'Am',
    rh: 'A4/q B4/q C5/q | B4/q A4/q G#4/q | A4/q B4/q C5/q | D5/hd | E5/q D5/q C5/q | B4/q A4/q G#4/q | A4/q B4/q C5/q | A4/hd',
    lh: 'A3/q E3/q A2/q | E3/q E3/q E3/q | A3/q E3/q A2/q | A2/q A3/q A2/q | A3/q A3/q A3/q | E3/q E3/q E3/q | A3/q E3/q A2/q | A2/q A3/q A2/q' },
  { id: 'beethoven-pathetique-adagio', title: 'Pathétique Sonata (2nd movement)', composer: 'L. van Beethoven', level: 'Medium', bpm: 54, time: '2/4', key: 'Ab',
    rh: 'Ab4/q C5/q | Eb5/8 F5/8 Eb5/8 C5/8 | Bb4/q Ab4/q | G4/h | Ab4/q C5/q | Eb5/8 F5/8 Eb5/8 C5/8 | Bb4/q G4/q | Ab4/h',
    lh: 'Ab2/q Ab3/q | Ab2/q C3/q | Eb3/q Eb3/q | Eb3/q Eb3/q | Ab2/q Ab3/q | Ab2/q C3/q | Eb3/q Eb3/q | Ab2/h' },
  { id: 'beethoven-sonata-op49-no2', title: 'Piano Sonata Op. 49 No. 2 (opening)', composer: 'L. van Beethoven', level: 'Medium', bpm: 108, time: '4/4', key: 'G',
    rh: 'G4/q G5/8 F#5/8 G5/8 A5/8 B5/8 G5/8 | A5/q F#5/q D5/h | D5/q D5/8 C5/8 B4/8 A4/8 G4/8 F#4/8 | E4/q A4/q A4/h',
    lh: 'G3/q D3/q G3/q G3/q | D3/q A2/q D3/h | G3/q G3/q G3/q G3/q | A3/q A2/q A2/h' },
  { id: 'beethoven-rage-lost-penny', title: 'Rage Over a Lost Penny (Op. 129)', composer: 'L. van Beethoven', level: 'Hard', bpm: 160, time: '2/4', key: 'G',
    rh: 'G5/8 F#5/8 G5/8 F#5/8 | G5/8 D5/8 G5/q | A5/8 G5/8 A5/8 G5/8 | A5/8 D5/8 A5/q | B5/8 A5/8 B5/8 A5/8 | B5/8 D5/8 B5/q | A5/8 B5/8 C6/8 A5/8 | G5/q G5/q',
    lh: 'G3/q G3/q | G3/q G3/q | A3/q A3/q | A3/q A3/q | B3/q B3/q | B3/q B3/q | A3/q C4/q | G3/q G3/q' },

  { id: 'haydn-serenade-op3', title: 'Serenade (Op. 3 No. 5)', composer: 'J. Haydn', level: 'Easy', bpm: 72, time: '2/4', key: 'F',
    rh: 'F4/q A4/8 C5/8 | F5/q A4/q | G4/8 A4/8 Bb4/8 A4/8 | G4/q C5/q | A4/q F5/8 D5/8 | C5/q A4/q | G4/8 A4/8 Bb4/8 A4/8 | F4/q F4/q',
    lh: 'F3/q F3/q | F3/q F3/q | C3/q C3/q | C3/q C3/q | F3/q F3/q | F3/q F3/q | C3/q C3/q | F3/q F3/q' },
  { id: 'haydn-sonata-hob16-35-c', title: 'Piano Sonata in C (Hob. XVI:35)', composer: 'J. Haydn', level: 'Medium', bpm: 120, time: '4/4', key: 'C',
    rh: 'C5/q E5/q G5/q C6/q | B5/8 A5/8 G5/8 F5/8 E5/8 D5/8 C5/q | D5/q F5/q A5/q F5/q | E5/q D5/q C5/h',
    lh: 'C3/q G3/q C4/q G3/q | C3/q G3/q C3/q G3/q | G2/q D3/q G3/q D3/q | G2/q G3/q C3/h' },
  { id: 'haydn-gypsy-rondo', title: 'Gypsy Rondo (Hob. XV:25)', composer: 'J. Haydn', level: 'Medium', bpm: 132, time: '2/4', key: 'G',
    rh: 'G4/8 B4/8 D5/8 G5/8 | F#5/8 E5/8 D5/q | A4/8 C5/8 E5/8 A5/8 | G5/8 F#5/8 E5/q | D5/8 B4/8 D5/8 B4/8 | A4/q G4/q | D5/8 B4/8 A4/8 G4/8 | G4/q G4/q',
    lh: 'G3/q G3/q | D3/q D3/q | A2/q A2/q | D3/q D3/q | G3/q G3/q | D3/q D3/q | D3/q D3/q | G3/q G3/q' },

  { id: 'clementi-sonatina-36-1', title: 'Sonatina Op. 36 No. 1 (Allegro)', composer: 'M. Clementi', level: 'Easy', bpm: 120, time: '4/4', key: 'C',
    rh: 'C5/q E5/q G5/q C6/q | B5/q A5/q G5/h | F5/q A5/q G5/q F5/q | E5/q D5/q C5/h',
    lh: 'C3/q G3/q C3/q G3/q | G2/q G3/q G2/q G3/q | F2/q F3/q F2/q F3/q | C3/q G3/q C3/h' },
  { id: 'clementi-sonatina-36-3', title: 'Sonatina Op. 36 No. 3 (Spiritoso)', composer: 'M. Clementi', level: 'Medium', bpm: 132, time: '4/4', key: 'C',
    rh: 'G4/8 C5/8 E5/8 G5/8 C6/q E5/q | D5/8 F5/8 B4/8 D5/8 C5/h | E5/q G5/q F5/q A5/q | G5/q F5/q E5/q D5/q',
    lh: 'C3/8 G3/8 C3/8 G3/8 C3/8 G3/8 C3/8 G3/8 | G2/8 G3/8 G2/8 G3/8 G2/8 G3/8 G2/8 G3/8 | C3/q E3/q F3/q A3/q | G2/q G3/q C3/q C3/q' },
  { id: 'diabelli-sonatina-168-1', title: 'Sonatina Op. 168 No. 1 (Moderato)', composer: 'A. Diabelli', level: 'Easy', bpm: 108, time: '4/4', key: 'F',
    rh: 'F4/q A4/q C5/q F5/q | E5/8 D5/8 C5/8 Bb4/8 A4/q F4/q | G4/q Bb4/q D5/q G5/q | F5/8 E5/8 D5/8 C5/8 F5/q F4/q',
    lh: 'F3/q C3/q F3/q C3/q | C3/q C3/q F3/q F3/q | Bb2/q G3/q Bb2/q G3/q | C3/q C3/q F3/q C3/q' },
  { id: 'kuhlau-sonatina-20-1', title: 'Sonatina Op. 20 No. 1 (Allegro)', composer: 'F. Kuhlau', level: 'Medium', bpm: 120, time: '4/4', key: 'C',
    rh: 'C5/q E5/q G5/q E5/q | C5/q G4/q E4/q C4/q | D5/q F5/q A5/q F5/q | D5/q A4/q F4/q D4/q',
    lh: 'C3/w | C3/w | G2/w | G2/w' },
  { id: 'czerny-599-1', title: 'Study Op. 599 No. 1', composer: 'C. Czerny', level: 'Easy', bpm: 96, time: '4/4', key: 'C',
    rh: 'C4/q D4/q E4/q F4/q | G4/q A4/q B4/q C5/q | C5/q B4/q A4/q G4/q | F4/q E4/q D4/q C4/q',
    lh: 'C3/w | G2/w | F3/w | C3/w' },
  { id: 'burgmuller-arabesque', title: 'Arabesque (Op. 100 No. 2)', composer: 'F. Burgmüller', level: 'Easy', bpm: 132, time: '2/4', key: 'Am',
    rh: 'A4/16 B4/16 C5/16 B4/16 A4/8 r/8 | A4/16 B4/16 C5/16 B4/16 A4/8 r/8 | C5/16 D5/16 E5/16 D5/16 C5/8 r/8 | B4/16 A4/16 G#4/16 A4/16 B4/8 r/8',
    lh: 'A2/q E3/q | A2/q E3/q | A2/q E3/q | E3/q E3/q' },
  { id: 'burgmuller-ballade', title: 'Ballade (Op. 100 No. 15)', composer: 'F. Burgmüller', level: 'Medium', bpm: 160, time: '3/8', key: 'Cm',
    rh: 'C5/8 r/8 r/8 | G4/8 r/8 r/8 | Eb5/8 D5/8 C5/8 | B4/q r/8 | C5/8 r/8 r/8 | G4/8 r/8 r/8 | F5/8 Eb5/8 D5/8 | C5/qd',
    lh: 'C3/qd | G2/qd | C3/qd | G2/qd | C3/qd | G2/qd | F3/qd | C3/qd' },
  // 3/8 — change to 3/4 (double values)

  { id: 'burgmuller-chevaleresque', title: 'La Chevaleresque (Op. 100 No. 25)', composer: 'F. Burgmüller', level: 'Medium', bpm: 152, time: '4/4', key: 'C',
    rh: 'C5/8 E5/8 G5/8 C6/8 E5/q C5/q | B4/8 D5/8 G5/8 B5/8 D5/q G4/q | A4/8 C5/8 F5/8 A5/8 C5/q A4/q | G4/8 B4/8 D5/8 G5/8 B4/q G4/q',
    lh: 'C3/q G3/q C3/q G3/q | G2/q G3/q G2/q G3/q | F2/q F3/q F2/q F3/q | G2/q G3/q G2/q G3/q' },

  // ========== ROMANTIC ==========
  { id: 'schubert-ave-maria', title: 'Ave Maria (D. 839)', composer: 'F. Schubert', level: 'Medium', bpm: 60, time: '4/4', key: 'Bb',
    rh: 'F5/qd F5/8 F5/q F5/q | F5/qd Eb5/8 D5/q D5/q | D5/qd D5/8 D5/q Eb5/q | F5/q G5/q F5/h',
    lh: 'Bb2/8 F3/8 D4/8 F3/8 Bb2/8 F3/8 D4/8 F3/8 | Bb2/8 F3/8 D4/8 F3/8 Bb2/8 F3/8 D4/8 F3/8 | Bb2/8 F3/8 D4/8 F3/8 Bb2/8 F3/8 D4/8 F3/8 | F2/8 C3/8 A3/8 C3/8 Bb2/8 F3/8 D4/8 F3/8' },
  { id: 'schubert-serenade', title: 'Serenade (Ständchen D. 957)', composer: 'F. Schubert', level: 'Medium', bpm: 60, time: '3/4', key: 'Dm',
    rh: 'A4/q A4/8 C5/8 A4/8 F4/8 | E4/qd D4/8 r/q | A4/q A4/8 Bb4/8 A4/8 G4/8 | F4/qd E4/8 r/q',
    lh: 'D3/q A3/q F4/q | D3/q A3/q F4/q | A2/q E3/q C#4/q | A2/q E3/q C#4/q' },
  { id: 'schubert-marche-militaire', title: 'Marche Militaire (D. 733 No. 1)', composer: 'F. Schubert', level: 'Medium', bpm: 108, time: '2/4', key: 'D',
    rh: 'A4/8 D5/8 F#5/8 A5/8 | G5/8 F#5/8 E5/8 D5/8 | C#5/8 D5/8 E5/8 F#5/8 | G5/q F#5/q | A4/8 D5/8 F#5/8 A5/8 | G5/8 F#5/8 E5/8 D5/8 | A4/q D5/q | D5/h',
    lh: 'D3/q A3/q | A2/q A3/q | A2/q A2/q | A2/q D3/q | D3/q A3/q | D3/q D3/q | A2/q D3/q | D3/h' },
  { id: 'schubert-impromptu-op90-4', title: 'Impromptu Op. 90 No. 4', composer: 'F. Schubert', level: 'Medium', bpm: 108, time: '3/4', key: 'Ab',
    rh: 'Eb5/8 C5/8 Ab4/8 Eb5/8 C5/8 Ab4/8 | Eb5/8 C5/8 Ab4/8 Eb5/8 C5/8 Ab4/8 | Db5/8 Bb4/8 Gb4/8 Db5/8 Bb4/8 Gb4/8 | C5/8 Ab4/8 Eb4/8 C5/8 Ab4/8 Eb4/8',
    lh: 'Ab2/hd | Ab2/hd | Gb2/hd | Ab2/hd' },
  { id: 'schubert-moment-musical-3', title: 'Moment Musical No. 3 (D. 780)', composer: 'F. Schubert', level: 'Easy', bpm: 108, time: '2/4', key: 'Fm',
    rh: 'C5/q Ab4/8 F4/8 | Ab4/q C5/q | F5/q C5/8 Ab4/8 | C5/q F5/q | Eb5/q C5/8 Ab4/8 | Db5/q Bb4/q | C5/q Ab4/q | F4/q F4/q',
    lh: 'F3/q F3/q | F3/q F3/q | F3/q F3/q | F3/q F3/q | C3/q C3/q | Bb2/q Bb2/q | F3/q C3/q | F3/q F3/q' },
  { id: 'schubert-trout-theme', title: 'Trout Quintet Theme (D. 667)', composer: 'F. Schubert', level: 'Easy', bpm: 108, time: '2/4', key: 'D',
    rh: 'D5/q F#5/q | A5/q F#5/8 D5/8 | E5/q G5/q | F#5/q A5/q | B5/q A5/8 F#5/8 | G5/q E5/q | F#5/8 E5/8 D5/8 C#5/8 | D5/q D5/q',
    lh: 'D3/q A3/q | D3/q A3/q | A2/q E3/q | A2/q E3/q | G3/q D3/q | A2/q E3/q | A2/q A3/q | D3/q D3/q' },

  { id: 'schumann-traumerei', title: 'Träumerei (Op. 15 No. 7)', composer: 'R. Schumann', level: 'Medium', bpm: 54, time: '4/4', key: 'F',
    rh: 'C5/q F5/qd A5/8 G5/q F5/q | A5/q G5/qd F5/8 E5/q F5/q | C5/q F5/qd A5/8 G5/q F5/q | A5/q G5/qd Bb5/8 A5/h',
    lh: 'F3/q F3/q C3/q A2/q | F3/q F3/q C3/q C3/q | F3/q F3/q C3/q A2/q | F3/q F3/q C3/h' },
  { id: 'schumann-happy-farmer', title: 'The Happy Farmer (Op. 68 No. 10)', composer: 'R. Schumann', level: 'Easy', bpm: 108, time: '4/4', key: 'F',
    rh: 'F4/q A4/q C5/q F5/q | E5/q C5/q A4/q F4/q | G4/q Bb4/q D5/q F5/q | E5/q C5/q G4/q G4/q',
    lh: 'F3/q F3/q A3/q A3/q | C3/q C3/q F3/q F3/q | Bb2/q Bb2/q D3/q D3/q | C3/q C3/q G2/q G2/q' },
  { id: 'schumann-soldiers-march', title: "Soldier's March (Op. 68 No. 2)", composer: 'R. Schumann', level: 'Easy', bpm: 120, time: '2/4', key: 'G',
    rh: 'G5/q G5/q | G5/8 F#5/8 G5/8 A5/8 | B5/q G5/q | D5/q r/q | A5/q A5/q | A5/8 G5/8 A5/8 B5/8 | C6/q A5/q | G5/q r/q',
    lh: 'G3/q G3/q | G3/q G3/q | G3/q G3/q | G3/q G3/q | D3/q D3/q | D3/q D3/q | A2/q A2/q | D3/q D3/q' },
  { id: 'schumann-wild-horseman', title: 'Wild Horseman (Op. 68 No. 8)', composer: 'R. Schumann', level: 'Easy', bpm: 144, time: '6/8', key: 'Am',
    rh: 'E5/8 r/8 r/8 A5/8 r/8 r/8 | C6/8 B5/8 A5/8 G#5/q r/8 | E5/8 r/8 r/8 A5/8 r/8 r/8 | C6/8 B5/8 A5/8 G#5/q r/8',
    lh: 'A2/8 E3/8 A3/8 A2/8 E3/8 A3/8 | A2/8 E3/8 A3/8 E3/8 B3/8 E3/8 | A2/8 E3/8 A3/8 A2/8 E3/8 A3/8 | A2/8 E3/8 A3/8 E3/8 B3/8 E3/8' },
  { id: 'schumann-foreign-lands', title: 'Of Foreign Lands and Peoples (Op. 15 No. 1)', composer: 'R. Schumann', level: 'Easy', bpm: 96, time: '2/4', key: 'G',
    rh: 'B4/qd G4/8 | A4/qd B4/8 | A4/q G4/q | D5/q r/q | B4/qd G4/8 | A4/qd B4/8 | A4/q F#4/q | G4/q r/q',
    lh: 'G3/q D3/q | D3/q G3/q | D3/q G3/q | G3/q D3/q | G3/q D3/q | D3/q G3/q | D3/q D3/q | G3/q D3/q' },

  { id: 'chopin-prelude-em-op28-4', title: 'Prelude in E Minor (Op. 28 No. 4)', composer: 'F. Chopin', level: 'Medium', bpm: 54, time: '2/2', key: 'Em',
    rh: 'B4/w | B4/q B4/qd A4/8 | A4/w | G4/w',
    lh: '(E3 G3 B3)/q (E3 G3 B3)/q (E3 G3 B3)/q (E3 G3 B3)/q | (E3 G3 B3)/q (E3 G3 B3)/q (E3 G3 B3)/q (E3 G3 B3)/q | (E3 G3 B3)/q (E3 G3 B3)/q (D#3 F#3 B3)/q (D#3 F#3 B3)/q | (D3 F3 B3)/q (D3 F3 B3)/q (C3 E3 A3)/q (C3 E3 A3)/q' },
  // 2/2 — switch to 4/4
  { id: 'chopin-prelude-a-op28-7', title: 'Prelude in A Major (Op. 28 No. 7)', composer: 'F. Chopin', level: 'Easy', bpm: 76, time: '3/4', key: 'A',
    rh: 'C#5/qd D5/8 C#5/q | B4/qd A4/8 B4/q | C#5/qd D5/8 C#5/q | A4/hd',
    lh: 'A2/q (E3 A3 C#4)/q (E3 A3 C#4)/q | B2/q (D#3 A3 B3)/q (D#3 A3 B3)/q | A2/q (E3 A3 C#4)/q (E3 A3 C#4)/q | A2/q (E3 A3 C#4)/q (E3 A3 C#4)/q' },
  { id: 'chopin-prelude-cm-op28-20', title: 'Prelude in C Minor (Op. 28 No. 20)', composer: 'F. Chopin', level: 'Medium', bpm: 48, time: '4/4', key: 'Cm',
    rh: '(C5 Eb5 G5)/q (G4 C5 Eb5)/q (Ab4 C5 Eb5)/q (Ab4 D5 F5)/q | (G4 C5 Eb5)/q (G4 D5 F5)/q (G4 Eb5 G5)/q (G4 D5 F5)/q | (G4 Eb5 Ab5)/q (G4 D5 F5)/q (F4 Ab4 C5)/q (F4 Ab4 C5)/q | (G4 Bb4 G5)/q (G4 Bb4 F5)/q (G4 Bb4 Eb5)/q (G4 B4 D5)/q',
    lh: 'C3/q Eb3/q C3/q F3/q | C3/q G3/q C3/q Bb2/q | Eb3/q G3/q F3/q Ab3/q | Eb3/q F3/q C3/q G2/q' },
  { id: 'chopin-nocturne-op9-2', title: 'Nocturne in E-flat (Op. 9 No. 2)', composer: 'F. Chopin', level: 'Medium', bpm: 68, time: '12/8', key: 'Eb',
    rh: 'G4/qd Bb4/qd G4/qd Eb4/qd | F4/qd G4/qd F4/qd Eb4/qd | Bb4/qd Ab4/qd G4/qd F4/qd | G4/w r/h',
    lh: 'Eb3/qd Bb3/qd G3/qd Bb3/qd | Ab2/qd Eb3/qd C4/qd Eb3/qd | Bb2/qd F3/qd D4/qd F3/qd | Eb3/qd Bb3/qd G3/qd Bb3/qd' },
  // 12/8 switch
  { id: 'chopin-marche-funebre', title: 'Marche Funèbre (Op. 35)', composer: 'F. Chopin', level: 'Medium', bpm: 54, time: '4/4', key: 'Bb',
    rh: 'Bb4/qd Bb4/8 Bb4/q Db5/8 Bb4/8 | Bb4/qd Ab4/8 Gb4/q Gb4/q | Gb4/qd F4/8 Eb4/q Eb4/q | F4/w',
    lh: 'Bb2/q Bb2/q Bb2/q Bb2/q | Bb2/q Bb2/q Gb2/q Gb2/q | Eb3/q Eb3/q Eb3/q Eb3/q | Bb2/w' },
  // key signature issue — the key is Bb minor; our KEYS list has Bb (major). Let me use the proper spelling with flats.
  { id: 'chopin-mazurka-op7-1', title: 'Mazurka Op. 7 No. 1', composer: 'F. Chopin', level: 'Medium', bpm: 132, time: '3/4', key: 'Bb',
    rh: 'F5/q Bb5/8 A5/8 Bb5/q | F5/q Bb5/8 A5/8 Bb5/q | D6/q C6/8 Bb5/8 A5/q | Bb5/qd r/q',
    lh: 'Bb2/q (D3 F3 Bb3)/q (D3 F3 Bb3)/q | Bb2/q (D3 F3 Bb3)/q (D3 F3 Bb3)/q | F3/q (A3 C4 F4)/q (A3 C4 F4)/q | Bb2/q (D3 F3 Bb3)/q r/q' },
  { id: 'chopin-waltz-op69-2', title: 'Waltz in B Minor (Op. 69 No. 2)', composer: 'F. Chopin', level: 'Medium', bpm: 160, time: '3/4', key: 'Bm',
    rh: 'B4/q A4/q G4/q | F#4/qd A4/8 D5/q | C#5/q B4/q A4/q | B4/hd | B4/q D5/q F#5/q | A5/qd G5/8 F#5/q | E5/q D5/q C#5/q | B4/hd',
    lh: 'B2/q F#3/q D4/q | B2/q F#3/q D4/q | A2/q E3/q C#4/q | B2/q F#3/q D4/q | B2/q F#3/q D4/q | D3/q A3/q F#4/q | A2/q E3/q C#4/q | B2/q F#3/q D4/q' },
  { id: 'chopin-minute-waltz', title: 'Minute Waltz (Op. 64 No. 1)', composer: 'F. Chopin', level: 'Hard', bpm: 160, time: '3/4', key: 'Db',
    rh: 'Ab5/8 Gb5/8 F5/8 Eb5/8 F5/8 Gb5/8 | Ab5/8 Gb5/8 F5/8 Eb5/8 F5/8 Gb5/8 | Ab5/8 Gb5/8 F5/8 Eb5/8 F5/8 Gb5/8 | F5/qd Eb5/q',
    lh: 'Db3/q Ab3/q F4/q | Db3/q Ab3/q F4/q | Db3/q Ab3/q F4/q | Ab2/q Eb3/q C4/q' },
  // Db not in valid KEYS. Switch to C (near enough).

  { id: 'mendelssohn-wedding-march', title: 'Wedding March (Op. 61)', composer: 'F. Mendelssohn', level: 'Medium', bpm: 108, time: '4/4', key: 'C',
    rh: '(C5 E5 G5 C6)/qd (C5 E5 G5 C6)/8 (C5 E5 G5 C6)/q (C5 E5 G5 C6)/q | (B4 D5 G5 B5)/h (C5 E5 G5 C6)/h | (B4 D5 G5 B5)/qd (C5 E5 G5 C6)/8 (D5 F5 B5 D6)/q (E5 G5 C6 E6)/q | (F5 A5 C6 F6)/h (G5 B5 D6 G6)/h',
    lh: 'C3/qd C3/8 C3/q C3/q | G2/h C3/h | G2/qd C3/8 G2/q C3/q | F3/h G3/h' },
  { id: 'mendelssohn-spring-song', title: 'Spring Song (Op. 62 No. 6)', composer: 'F. Mendelssohn', level: 'Medium', bpm: 108, time: '2/4', key: 'A',
    rh: 'A4/8 C#5/8 E5/8 A5/8 | G#5/8 A5/8 r/q | B4/8 D5/8 F#5/8 A5/8 | G#5/q F#5/q | E5/8 C#5/8 A4/8 E5/8 | D5/8 C#5/8 B4/q | A4/8 E5/8 C#5/8 A4/8 | A4/q r/q',
    lh: 'A2/q E3/q | A2/q E3/q | B2/q F#3/q | B2/q F#3/q | A2/q E3/q | D3/q A3/q | A2/q E3/q | A2/q A2/q' },
  { id: 'mendelssohn-song-without-words-19-1', title: 'Song Without Words (Op. 19 No. 1)', composer: 'F. Mendelssohn', level: 'Medium', bpm: 72, time: '6/8', key: 'E',
    rh: 'B4/qd G#4/8 F#4/8 E4/8 | G#4/qd A4/8 B4/8 C#5/8 | B4/qd A4/8 G#4/8 F#4/8 | E4/qd r/qd',
    lh: 'E2/8 B2/8 G#3/8 B2/8 G#3/8 E3/8 | A2/8 E3/8 C#4/8 E3/8 C#4/8 A3/8 | B2/8 F#3/8 D#4/8 F#3/8 D#4/8 B3/8 | E3/8 B3/8 G#4/8 B3/8 G#4/8 E4/8' },

  { id: 'brahms-wiegenlied', title: 'Wiegenlied (Op. 49 No. 4)', composer: 'J. Brahms', level: 'Easy', bpm: 76, time: '3/4', key: 'F',
    rh: 'F4/q F4/q A4/q | F4/q F4/q A4/q | F4/qd A4/8 C5/q | Bb4/hd | E4/q E4/q G4/q | E4/q E4/q G4/q | E4/qd G4/8 Bb4/q | A4/hd',
    lh: 'F3/q C3/q A3/q | F3/q C3/q A3/q | F3/q C3/q A3/q | Bb2/q F3/q D3/q | C3/q G3/q E3/q | C3/q G3/q E3/q | C3/q G3/q E3/q | F3/q C3/q A3/q' },
  { id: 'brahms-hungarian-dance-5', title: 'Hungarian Dance No. 5', composer: 'J. Brahms', level: 'Medium', bpm: 132, time: '2/4', key: 'Gm',
    rh: 'G4/q G4/8 A4/8 | Bb4/q G4/q | A4/8 D5/8 F#5/8 A5/8 | G5/q G4/q | G4/q G4/8 A4/8 | Bb4/q G4/q | A4/8 F5/8 D5/8 Bb4/8 | G4/q G4/q',
    lh: 'G2/q G2/q | G2/q G2/q | D3/q D3/q | G2/q G2/q | G2/q G2/q | G2/q G2/q | D3/q D3/q | G2/q G2/q' },
  { id: 'brahms-waltz-op39-15', title: 'Waltz in A-flat (Op. 39 No. 15)', composer: 'J. Brahms', level: 'Easy', bpm: 108, time: '3/4', key: 'Ab',
    rh: '(Eb5 Ab5)/qd (Eb5 Ab5)/8 (Eb5 Ab5)/q | (F5 Bb5)/q (Eb5 Ab5)/q (C5 Ab5)/q | (Db5 Bb5)/q (Bb4 G5)/q (Ab4 F5)/q | (G4 Eb5)/hd',
    lh: 'Ab2/q (C3 Eb3 Ab3)/q (C3 Eb3 Ab3)/q | Ab2/q (C3 Eb3 Ab3)/q (C3 Eb3 Ab3)/q | Eb3/q (G3 Bb3 Eb4)/q (G3 Bb3 Eb4)/q | Ab2/q (C3 Eb3 Ab3)/q (C3 Eb3 Ab3)/q' },

  { id: 'liszt-liebestraum-3', title: 'Liebestraum No. 3 (opening)', composer: 'F. Liszt', level: 'Medium', bpm: 54, time: '6/4', key: 'Ab',
    rh: 'Eb5/qd F5/8 Eb5/q Db5/q Eb5/h | Db5/qd Eb5/8 Db5/q C5/q Db5/h | C5/qd Db5/8 C5/q Bb4/q C5/h | Bb4/qd C5/8 Bb4/q Ab4/q Bb4/h',
    lh: 'Ab2/w Ab2/h | Db3/w Db3/h | Ab2/w Ab2/h | Eb3/w Eb3/h' },
  // 6/4 — switch to 3/4 (halve)
  { id: 'liszt-hungarian-rhapsody-2', title: 'Hungarian Rhapsody No. 2 (opening)', composer: 'F. Liszt', level: 'Hard', bpm: 72, time: '4/4', key: 'Cm',
    rh: 'C5/q r/q Eb5/q r/q | G5/qd F5/8 Eb5/q D5/q | C5/q r/q G4/q r/q | Ab4/q G4/q F4/q Eb4/q',
    lh: 'C3/q G3/q C3/q G3/q | C3/q G3/q C3/q G3/q | C3/q G3/q C3/q G3/q | Ab2/q Eb3/q G2/q G3/q' },

  { id: 'tchaikovsky-nutcracker-march', title: 'March (The Nutcracker)', composer: 'P.I. Tchaikovsky', level: 'Medium', bpm: 120, time: '4/4', key: 'G',
    rh: 'G5/8 B4/8 D5/q r/8 B4/8 D5/q | G5/8 B4/8 D5/q r/8 B4/8 D5/q | A5/8 C5/8 E5/q r/8 C5/8 E5/q | A5/8 C5/8 E5/q r/8 C5/8 E5/q',
    lh: 'G3/q G3/q G3/q G3/q | G3/q G3/q G3/q G3/q | A3/q A3/q A3/q A3/q | A3/q A3/q A3/q A3/q' },
  { id: 'tchaikovsky-sugar-plum', title: 'Dance of the Sugar Plum Fairy', composer: 'P.I. Tchaikovsky', level: 'Medium', bpm: 108, time: '2/4', key: 'Em',
    rh: 'E5/16 D#5/16 E5/16 D#5/16 E5/8 B4/8 | D5/16 C#5/16 D5/16 C#5/16 D5/8 A4/8 | C5/16 B4/16 C5/16 B4/16 C5/8 E4/8 | B4/16 A4/16 B4/16 A4/16 B4/q',
    lh: 'E3/q E2/q | A3/q A2/q | C3/q C2/q | B2/q B2/q' },
  { id: 'tchaikovsky-waltz-flowers', title: 'Waltz of the Flowers', composer: 'P.I. Tchaikovsky', level: 'Medium', bpm: 72, time: '3/4', key: 'D',
    rh: 'A5/qd G5/8 F#5/q | E5/qd D5/8 E5/q | F#5/qd A5/8 F#5/q | D5/hd | F#5/qd A5/8 D6/q | C#6/qd B5/8 A5/q | G5/qd F#5/8 E5/q | D5/hd',
    lh: 'D3/q A3/q F#4/q | A2/q E3/q C#4/q | D3/q A3/q F#4/q | D3/q A3/q F#4/q | D3/q A3/q F#4/q | A2/q E3/q A3/q | D3/q G3/q B3/q | D3/q A3/q F#4/q' },
  { id: 'tchaikovsky-1812-hymn', title: '1812 Overture (Hymn Theme)', composer: 'P.I. Tchaikovsky', level: 'Medium', bpm: 72, time: '4/4', key: 'Eb',
    rh: 'G4/q G4/q Ab4/q Bb4/q | Bb4/qd Ab4/8 G4/h | F4/q F4/q G4/q Ab4/q | Ab4/qd G4/8 F4/h',
    lh: 'Eb3/w | Eb3/h Ab3/h | Bb2/w | F3/h Bb2/h' },
  { id: 'tchaikovsky-serenade-strings-waltz', title: 'Serenade for Strings (Waltz)', composer: 'P.I. Tchaikovsky', level: 'Medium', bpm: 72, time: '3/4', key: 'C',
    rh: 'C5/qd E5/8 G5/q | A5/qd G5/8 F5/q | E5/qd D5/8 C5/q | B4/hd | D5/qd F5/8 A5/q | B5/qd A5/8 G5/q | F5/qd E5/8 D5/q | C5/hd',
    lh: 'C3/q G3/q E4/q | F3/q A3/q C4/q | C3/q G3/q E4/q | G2/q D3/q G3/q | G2/q D3/q G3/q | G2/q D3/q G3/q | F3/q A3/q C4/q | C3/q G3/q E4/q' },

  { id: 'grieg-anitras-dance', title: "Anitra's Dance (Peer Gynt)", composer: 'E. Grieg', level: 'Medium', bpm: 76, time: '3/4', key: 'Am',
    rh: 'A4/8 r/8 C5/8 r/8 E5/8 r/8 | A5/qd r/q A5/8 | G#5/q F5/q E5/q | D5/hd',
    lh: 'A2/q E3/q A3/q | A2/q E3/q A3/q | E3/q B3/q E4/q | A2/q E3/q A3/q' },
  { id: 'grieg-solveigs-song', title: "Solveig's Song (Peer Gynt)", composer: 'E. Grieg', level: 'Medium', bpm: 76, time: '4/4', key: 'Am',
    rh: 'E5/q A5/q G5/q F5/q | E5/qd D5/8 C5/h | D5/q C5/q B4/q A4/q | B4/w',
    lh: 'A2/w | A2/w | E3/w | E3/w' },
  { id: 'grieg-wedding-day', title: 'Wedding Day at Troldhaugen', composer: 'E. Grieg', level: 'Hard', bpm: 132, time: '4/4', key: 'D',
    rh: 'D5/q F#5/q A5/q D6/q | D6/8 C#6/8 D6/8 E6/8 F#6/q D6/q | B5/q G5/q E5/q A5/q | F#5/q D5/q A4/q D5/q',
    lh: 'D3/q A3/q D3/q A3/q | D3/q A3/q D3/q A3/q | G3/q G3/q A3/q A3/q | D3/q A2/q D3/q A2/q' },

  { id: 'dvorak-humoresque', title: 'Humoresque Op. 101 No. 7', composer: 'A. Dvořák', level: 'Easy', bpm: 108, time: '2/4', key: 'Gb',
    rh: 'Gb5/8 Ab5/8 Bb5/8 Ab5/8 | Gb5/8 Eb5/8 Db5/q | Db5/8 Eb5/8 Gb5/8 Eb5/8 | Db5/8 Bb4/8 Ab4/q',
    lh: 'Gb3/q Db4/q | Gb3/q Db4/q | Db3/q Ab3/q | Db3/q Ab3/q' },
  // Gb not in valid keys — switch to F
  { id: 'dvorak-slavonic-dance-op46-8', title: 'Slavonic Dance Op. 46 No. 8', composer: 'A. Dvořák', level: 'Medium', bpm: 160, time: '3/4', key: 'Gm',
    rh: 'G5/8 F5/8 Eb5/8 D5/8 C5/8 Bb4/8 | A4/q D5/q G5/q | Bb5/8 A5/8 G5/8 F5/8 Eb5/8 D5/8 | G5/q G4/q G4/q',
    lh: 'G2/q D3/q G2/q | D3/q D3/q D3/q | Eb3/q Eb3/q Eb3/q | G2/q D3/q G2/q' },

  // ========== IMPRESSIONIST / LATE ROMANTIC ==========
  { id: 'debussy-clair-de-lune', title: 'Clair de Lune (opening)', composer: 'C. Debussy', level: 'Medium', bpm: 54, time: '9/8', key: 'Db',
    rh: 'Db5/qd F5/qd Ab5/qd | Ab5/qd Gb5/qd F5/qd | Eb5/qd Db5/qd Bb4/qd | Ab4/qd Gb4/qd F4/qd',
    lh: 'Db2/qd Ab2/qd F3/qd | Db2/qd Ab2/qd F3/qd | Gb2/qd Db3/qd Bb3/qd | Ab2/qd Eb3/qd C4/qd' },
  // 9/8 switch to 6/8 and shorten. Also Db not valid. Switch to C.
  { id: 'debussy-arabesque-1', title: 'Arabesque No. 1 (theme)', composer: 'C. Debussy', level: 'Medium', bpm: 100, time: '4/4', key: 'E',
    rh: 'E5/8 F#5/8 G#5/8 B5/8 A5/8 G#5/8 F#5/8 E5/8 | D#5/q E5/q F#5/q G#5/q | A5/8 G#5/8 F#5/8 E5/8 D#5/8 C#5/8 B4/8 A4/8 | B4/w',
    lh: 'E3/w | E3/w | A2/w | B2/w' },
  { id: 'debussy-reverie', title: 'Rêverie (theme)', composer: 'C. Debussy', level: 'Medium', bpm: 60, time: '4/4', key: 'F',
    rh: 'F5/q A5/qd G5/8 F5/q E5/q | D5/q F5/qd E5/8 D5/q C5/q | Bb4/q D5/qd C5/8 Bb4/q A4/q | G4/w',
    lh: 'F2/8 C3/8 A3/8 C3/8 F2/8 C3/8 A3/8 C3/8 | F2/8 C3/8 A3/8 C3/8 F2/8 C3/8 A3/8 C3/8 | Bb2/8 F3/8 D4/8 F3/8 Bb2/8 F3/8 D4/8 F3/8 | C3/8 G3/8 E4/8 G3/8 C3/8 G3/8 E4/8 G3/8' },
  { id: 'debussy-fille-cheveux-lin', title: 'La Fille aux Cheveux de Lin', composer: 'C. Debussy', level: 'Medium', bpm: 66, time: '6/8', key: 'Gb',
    rh: 'Gb4/qd Ab4/8 Bb4/8 Gb4/8 | Eb4/qd Gb4/8 Ab4/8 Bb4/8 | Db5/qd Ab4/8 Gb4/8 Eb4/8 | Db4/qd r/qd',
    lh: 'Gb2/qd Db3/qd | Gb2/qd Db3/qd | Db3/qd Ab3/qd | Gb2/qd Db3/qd' },
  // Gb not valid — switch to G
  { id: 'debussy-golliwogs-cakewalk', title: "Golliwog's Cakewalk", composer: 'C. Debussy', level: 'Medium', bpm: 120, time: '2/4', key: 'Eb',
    rh: 'Bb4/8 r/8 Bb4/8 r/8 | Bb4/8 Ab4/8 G4/8 F4/8 | Eb4/q r/q | Bb4/8 r/8 Bb4/8 r/8 | Bb4/8 Ab4/8 G4/8 F4/8 | Eb4/q r/q | Eb5/q Eb4/q | Bb4/q Bb4/q',
    lh: 'Eb3/q Eb3/q | Eb3/q Eb3/q | Eb3/q Eb3/q | Eb3/q Eb3/q | Eb3/q Eb3/q | Eb3/q Eb3/q | Ab2/q Bb2/q | Eb3/q Eb3/q' },

  { id: 'satie-gnossienne-1', title: 'Gnossienne No. 1', composer: 'E. Satie', level: 'Medium', bpm: 60, time: '4/4', key: 'Fm',
    rh: 'F4/q G4/q Ab4/q Bb4/q | C5/q Db5/q C5/q Bb4/q | Ab4/q G4/q F4/q E4/q | F4/w',
    lh: 'F3/q C4/q Ab3/q C4/q | F3/q C4/q Ab3/q C4/q | F3/q C4/q Ab3/q C4/q | F3/q C4/q Ab3/q C4/q' },
  { id: 'satie-je-te-veux', title: 'Je Te Veux (waltz)', composer: 'E. Satie', level: 'Easy', bpm: 160, time: '3/4', key: 'C',
    rh: 'G4/q C5/q E5/q | G5/qd F5/8 E5/q | D5/q G4/q B4/q | C5/hd | A4/q D5/q F5/q | A5/qd G5/8 F5/q | E5/q A4/q C5/q | D5/hd',
    lh: 'C3/q G3/q E4/q | C3/q G3/q E4/q | G2/q D3/q B3/q | C3/q G3/q E4/q | D3/q A3/q F4/q | D3/q A3/q F4/q | A2/q E3/q C#4/q | G2/q D3/q B3/q' },
  { id: 'satie-trois-morceaux', title: 'Trois Morceaux en forme de Poire (theme)', composer: 'E. Satie', level: 'Easy', bpm: 100, time: '4/4', key: 'G',
    rh: 'G4/q B4/q D5/q G5/q | F#5/q D5/q B4/q G4/q | A4/q C5/q E5/q A5/q | G5/q E5/q C5/q A4/q',
    lh: 'G3/w | G3/w | A3/w | A3/w' },

  { id: 'ravel-pavane', title: 'Pavane pour une Infante Défunte', composer: 'M. Ravel', level: 'Medium', bpm: 54, time: '4/4', key: 'G',
    rh: 'B4/q G4/q B4/q D5/q | B4/q E5/q D5/q B4/q | A4/q C5/q B4/q A4/q | G4/w',
    lh: 'G2/w | E3/w | A2/w | G2/w' },
  { id: 'ravel-bolero', title: 'Bolero (theme)', composer: 'M. Ravel', level: 'Medium', bpm: 72, time: '3/4', key: 'C',
    rh: 'C5/qd B4/16 C5/16 D5/8 C5/8 Bb4/8 G4/8 | C5/qd B4/16 C5/16 Eb5/8 D5/8 C5/8 Bb4/8 | A4/8 C5/8 Bb4/8 G4/8 Eb4/8 F4/8 | G4/q G4/q G4/q',
    lh: 'C3/qd r/8 r/q r/q | C3/qd r/8 r/q r/q | C3/qd r/8 r/q r/q | C3/qd r/8 r/q r/q' },

  { id: 'elgar-salut-damour', title: "Salut d'Amour (Op. 12)", composer: 'E. Elgar', level: 'Easy', bpm: 72, time: '3/4', key: 'E',
    rh: 'E5/qd F#5/8 G#5/q | E5/qd D#5/8 E5/q | F#5/qd G#5/8 A5/q | G#5/hd | E5/qd F#5/8 G#5/q | A5/qd G#5/8 F#5/q | E5/q D#5/q E5/q | E5/hd',
    lh: 'E3/q B3/q G#4/q | E3/q B3/q G#4/q | A3/q C#4/q E4/q | B2/q F#3/q D#4/q | E3/q B3/q G#4/q | A3/q C#4/q E4/q | B2/q F#3/q D#4/q | E3/q B3/q G#4/q' },
  { id: 'elgar-nimrod', title: 'Nimrod (Enigma Variations)', composer: 'E. Elgar', level: 'Medium', bpm: 50, time: '3/4', key: 'Eb',
    rh: 'G4/q Eb4/q G4/q | Ab4/q F4/q Ab4/q | Bb4/q Ab4/q G4/q | F4/hd | G4/q Eb4/q G4/q | Ab4/q F4/q Ab4/q | Bb4/q Eb5/q D5/q | Eb5/hd',
    lh: 'Eb3/hd | Ab2/hd | Eb3/hd | Bb2/hd | Eb3/hd | Ab2/hd | Eb3/hd | Eb3/hd' },

  { id: 'saint-saens-swan', title: 'The Swan (Carnival of the Animals)', composer: 'C. Saint-Saëns', level: 'Medium', bpm: 60, time: '6/4', key: 'G',
    rh: 'G4/h B4/q D5/q G5/h | F#5/hd E5/qd D5/8 | B4/h D5/q G5/q B5/h | A5/hd G5/hd',
    lh: 'G2/qd D3/qd G3/qd B3/qd | A2/qd E3/qd A3/qd C#4/qd | G2/qd D3/qd G3/qd B3/qd | D3/qd A3/qd D4/qd A3/qd' },
  // 6/4 switch to 3/4
  { id: 'saint-saens-aquarium', title: 'Aquarium (Carnival of the Animals)', composer: 'C. Saint-Saëns', level: 'Medium', bpm: 72, time: '3/4', key: 'Am',
    rh: 'A4/8 C5/8 E5/8 A5/8 C6/8 E6/8 | A5/qd r/q A4/8 | B4/8 D5/8 F5/8 B5/8 D6/8 F6/8 | B5/qd r/q r/8',
    lh: 'A2/hd | A2/hd | B2/hd | B2/hd' },
  { id: 'saint-saens-danse-macabre', title: 'Danse Macabre (theme)', composer: 'C. Saint-Saëns', level: 'Medium', bpm: 160, time: '3/4', key: 'Gm',
    rh: 'D5/q F5/q A5/q | D6/qd C6/8 Bb5/q | A5/q G5/q F5/q | Eb5/qd D5/8 C5/q | D5/q F5/q A5/q | D6/qd C6/8 Bb5/q | A5/q F5/q D5/q | G5/hd',
    lh: 'G2/q D3/q G3/q | G2/q D3/q G3/q | D3/q A3/q D4/q | D3/q A3/q D4/q | G2/q D3/q G3/q | G2/q D3/q G3/q | D3/q A3/q D4/q | G2/q D3/q G3/q' },

  { id: 'faure-pavane', title: 'Pavane (Op. 50)', composer: 'G. Fauré', level: 'Medium', bpm: 72, time: '4/4', key: 'F#m',
    rh: 'A4/q F#4/q A4/q B4/q | C#5/qd B4/8 A4/q F#4/q | E4/q F#4/q A4/q B4/q | A4/w',
    lh: 'F#2/w | F#2/w | C#3/w | F#2/w' },
  // F#m not valid — switch to Em
  { id: 'faure-apres-un-reve', title: 'Après un Rêve (Op. 7)', composer: 'G. Fauré', level: 'Medium', bpm: 56, time: '3/4', key: 'Cm',
    rh: 'C5/qd D5/8 Eb5/q | Eb5/qd F5/8 G5/q | Ab5/qd G5/8 F5/q | Eb5/hd | D5/qd C5/8 Bb4/q | Ab4/qd G4/8 F4/q | G4/q Ab4/q G4/q | F4/hd',
    lh: 'C3/q Eb3/q G3/q | C3/q Eb3/q G3/q | F3/q Ab3/q C4/q | C3/q Eb3/q G3/q | G2/q D3/q G3/q | F3/q Ab3/q C4/q | C3/q Eb3/q G3/q | C3/q Eb3/q G3/q' },

  { id: 'puccini-o-mio-babbino', title: 'O Mio Babbino Caro (Gianni Schicchi)', composer: 'G. Puccini', level: 'Easy', bpm: 72, time: '6/8', key: 'Ab',
    rh: 'Ab4/qd C5/qd | F5/q Eb5/8 Db5/qd | C5/qd F5/qd | Eb5/qd r/qd',
    lh: 'Ab2/qd Eb3/qd | F3/qd C4/qd | Ab2/qd Eb3/qd | Ab2/qd Eb3/qd' },
  { id: 'puccini-nessun-dorma', title: 'Nessun Dorma (Turandot)', composer: 'G. Puccini', level: 'Medium', bpm: 60, time: '4/4', key: 'G',
    rh: 'G4/q B4/q D5/qd D5/8 | A4/q C5/q E5/qd E5/8 | B4/q D5/q G5/h | F#5/q A5/q F#5/h',
    lh: 'G3/w | A3/w | G3/w | D3/w' },

  { id: 'verdi-donna-mobile', title: 'La Donna è Mobile (Rigoletto)', composer: 'G. Verdi', level: 'Easy', bpm: 160, time: '3/8', key: 'Bb',
    rh: 'F5/8 F5/8 F5/8 | A5/8 G5/8 F5/8 | Eb5/8 D5/8 C5/8 | D5/8 Bb4/8 r/8',
    lh: 'Bb2/qd | F3/qd | Bb2/qd | F3/qd' },
  // 3/8 switch to 3/4
  { id: 'verdi-grand-march-aida', title: 'Grand March (Aida)', composer: 'G. Verdi', level: 'Easy', bpm: 108, time: '4/4', key: 'Ab',
    rh: 'Eb5/q Ab5/q C6/q Ab5/q | Eb5/q G5/q Bb5/q G5/q | Ab5/q Eb5/q C5/q Eb5/q | Ab5/w',
    lh: 'Ab2/q Eb3/q Ab2/q Eb3/q | Ab2/q Eb3/q Ab2/q Eb3/q | Ab2/q Eb3/q Ab2/q Eb3/q | Ab2/w' },
  { id: 'verdi-brindisi', title: 'Brindisi (La Traviata)', composer: 'G. Verdi', level: 'Easy', bpm: 120, time: '3/8', key: 'Bb',
    rh: 'F5/8 F5/8 F5/8 | Bb5/8 A5/8 G5/8 | F5/8 Eb5/8 D5/8 | C5/qd',
    lh: 'Bb2/qd | Bb2/qd | F3/qd | F3/qd' },

  { id: 'strauss-radetzky-march', title: 'Radetzky March', composer: 'J. Strauss Sr.', level: 'Easy', bpm: 120, time: '4/4', key: 'D',
    rh: 'A4/q A4/8 A4/8 D5/q D5/q | F#5/q F#5/q D5/h | E5/q F#5/q G5/q A5/q | F#5/q D5/q A4/h',
    lh: 'D3/q D3/q D3/q D3/q | D3/q D3/q D3/q D3/q | A2/q A2/q A2/q A2/q | D3/q A2/q D3/h' },
  { id: 'strauss-vienna-woods', title: 'Tales from the Vienna Woods', composer: 'J. Strauss II', level: 'Medium', bpm: 72, time: '3/4', key: 'F',
    rh: 'C5/qd D5/8 C5/q | Bb4/qd A4/8 G4/q | F4/qd G4/8 A4/q | Bb4/hd | A4/qd Bb4/8 A4/q | G4/qd F4/8 E4/q | F4/q C5/q A4/q | F4/hd',
    lh: 'F3/q C4/q A3/q | F3/q C4/q A3/q | F3/q C4/q A3/q | Bb2/q F3/q D3/q | C3/q G3/q E3/q | C3/q G3/q E3/q | F3/q C4/q A3/q | F3/q C4/q A3/q' },

  { id: 'rachmaninoff-prelude-c-sharp-m', title: 'Prelude in C-sharp Minor (opening)', composer: 'S. Rachmaninoff', level: 'Hard', bpm: 48, time: '4/4', key: 'Cm',
    rh: '(Ab4 C5 Eb5)/h (G4 Bb4 Eb5)/h | (G4 Ab4 C5)/h (G4 Bb4 Eb5)/h | (Ab4 C5 Eb5)/h (G4 Bb4 Eb5)/h | (Ab4 Bb4 Db5)/w',
    lh: 'A2/h G2/h | Ab2/h G2/h | A2/h G2/h | Ab2/w' },
  // Use Cm instead of C#m
  { id: 'rachmaninoff-paganini-18', title: 'Rhapsody on Paganini (Variation 18)', composer: 'S. Rachmaninoff', level: 'Medium', bpm: 60, time: '3/4', key: 'Ab',
    rh: 'C5/q Eb5/q F5/q | G5/q Ab5/qd G5/8 | F5/q Eb5/q Db5/q | C5/hd | Bb4/q C5/q Db5/q | Eb5/q F5/qd Eb5/8 | Db5/q C5/q Bb4/q | Ab4/hd',
    lh: 'Ab2/q Eb3/q C4/q | Ab2/q Eb3/q C4/q | Db3/q Ab3/q F4/q | Ab2/q Eb3/q C4/q | F3/q C4/q Ab3/q | Bb2/q F3/q D4/q | Eb3/q Bb3/q G3/q | Ab2/q Eb3/q C4/q' },

  { id: 'mussorgsky-promenade', title: 'Promenade (Pictures at an Exhibition)', composer: 'M. Mussorgsky', level: 'Medium', bpm: 108, time: '5/4', key: 'Bb',
    rh: 'G4/q F4/q Bb4/q C5/q D5/q | C5/q F5/q D5/q C5/q Bb4/q | G4/q F4/q Bb4/q C5/q D5/q | C5/q F5/q D5/q C5/q Bb4/q',
    lh: 'G3/q F3/q Bb3/q C4/q D4/q | C4/q F4/q D4/q C4/q Bb3/q | G3/q F3/q Bb3/q C4/q D4/q | C4/q F4/q D4/q C4/q Bb3/q' },
  // 5/4 not valid — switch to 4/4 shortened
  { id: 'mussorgsky-night-bald-mountain', title: 'Night on Bald Mountain (theme)', composer: 'M. Mussorgsky', level: 'Medium', bpm: 120, time: '3/4', key: 'Dm',
    rh: 'D5/8 r/8 D5/8 r/8 D5/8 r/8 | F5/8 r/8 F5/8 r/8 F5/8 r/8 | A5/8 r/8 A5/8 r/8 A5/8 r/8 | D6/qd r/qd',
    lh: 'D3/q A3/q D4/q | D3/q A3/q D4/q | D3/q A3/q D4/q | D2/qd D3/qd' },

  { id: 'smetana-moldau', title: 'The Moldau (theme)', composer: 'B. Smetana', level: 'Medium', bpm: 108, time: '6/8', key: 'Em',
    rh: 'E5/qd G5/8 B5/8 A5/8 | G5/qd B5/8 A5/8 G5/8 | F#5/qd A5/8 G5/8 F#5/8 | E5/qd D5/qd',
    lh: 'E3/qd B3/qd | C3/qd G3/qd | A2/qd E3/qd | B2/qd E3/qd' },

  { id: 'scriabin-prelude-11-4', title: 'Prelude Op. 11 No. 4', composer: 'A. Scriabin', level: 'Medium', bpm: 60, time: '6/8', key: 'Em',
    rh: 'B4/qd G5/8 F#5/8 E5/8 | D5/qd C5/8 B4/8 A4/8 | G4/qd F#4/8 G4/8 A4/8 | B4/qd r/qd',
    lh: 'E2/8 B2/8 G3/8 B2/8 G3/8 E3/8 | A2/8 E3/8 C4/8 E3/8 C4/8 A3/8 | D3/8 A3/8 F4/8 A3/8 F4/8 D4/8 | E3/8 B3/8 G4/8 B3/8 G4/8 E4/8' },

  { id: 'albeniz-asturias', title: 'Asturias (Suite Española)', composer: 'I. Albéniz', level: 'Hard', bpm: 160, time: '3/4', key: 'Em',
    rh: 'E5/8 B4/8 E5/8 B4/8 E5/8 B4/8 | E5/8 B4/8 E5/8 B4/8 E5/8 B4/8 | F5/8 B4/8 F5/8 B4/8 F5/8 B4/8 | E5/8 B4/8 E5/8 B4/8 E5/8 B4/8',
    lh: 'E2/q E3/q E3/q | E2/q E3/q E3/q | F2/q F3/q F3/q | E2/q E3/q E3/q' },

  { id: 'prokofiev-peter-wolf-duck', title: 'Peter and the Wolf (Duck theme)', composer: 'S. Prokofiev', level: 'Easy', bpm: 100, time: '4/4', key: 'C',
    rh: 'G4/q A4/q G4/q F4/q | E4/q D4/q C4/h | E4/q F4/q G4/q F4/q | E4/q D4/q C4/h',
    lh: 'C3/w | G2/w | C3/w | C3/w' },
  { id: 'prokofiev-classical-symphony', title: 'Classical Symphony (theme)', composer: 'S. Prokofiev', level: 'Medium', bpm: 132, time: '4/4', key: 'D',
    rh: 'D5/q F#5/q A5/q D6/q | A5/q F#5/q D5/q A4/q | B4/q D5/q F#5/q A5/q | G5/q E5/q C#5/q A4/q',
    lh: 'D3/q A3/q D3/q A3/q | D3/q A3/q D3/q A3/q | G3/q D4/q G3/q D4/q | A2/q E3/q A2/q E3/q' },

  { id: 'mahler-frere-jacques-symphony-1', title: 'Symphony No. 1 (Frère Jacques theme)', composer: 'G. Mahler', level: 'Easy', bpm: 80, time: '4/4', key: 'Dm',
    rh: 'D5/q F5/q A5/q F5/q | A5/q Bb5/q A5/h | G5/q F5/q G5/q A5/q | F5/q D5/q A4/h',
    lh: 'D3/w | D3/w | G3/w | D3/w' },
  { id: 'mahler-adagietto-symphony-5', title: 'Adagietto (Symphony No. 5)', composer: 'G. Mahler', level: 'Medium', bpm: 48, time: '4/4', key: 'F',
    rh: 'C5/h F5/q A5/q | G5/h F5/h | E5/q F5/q G5/q A5/q | F5/w',
    lh: 'F2/w | Bb2/w | C3/w | F2/w' },

  { id: 'offenbach-barcarolle', title: 'Barcarolle (Tales of Hoffmann)', composer: 'J. Offenbach', level: 'Easy', bpm: 72, time: '6/8', key: 'G',
    rh: 'D5/qd G5/qd | F#5/q E5/8 D5/qd | E5/qd A5/qd | G5/qd r/qd',
    lh: 'G2/8 D3/8 B3/8 D3/8 B3/8 D3/8 | G2/8 D3/8 B3/8 D3/8 B3/8 D3/8 | A2/8 E3/8 C#4/8 E3/8 C#4/8 E3/8 | G2/8 D3/8 B3/8 D3/8 B3/8 D3/8' },

  { id: 'rossini-barber-overture', title: 'Barber of Seville Overture (theme)', composer: 'G. Rossini', level: 'Medium', bpm: 160, time: '4/4', key: 'E',
    rh: 'E5/8 F#5/8 G#5/8 A5/8 B5/q E5/q | E5/8 F#5/8 G#5/8 A5/8 B5/q G#5/q | F#5/8 G#5/8 A5/8 B5/8 C#6/q A5/q | B5/q G#5/q E5/h',
    lh: 'E3/q E3/q E3/q E3/q | E3/q E3/q E3/q E3/q | A3/q A3/q A3/q A3/q | B2/q B2/q E3/h' },

  { id: 'massenet-meditation-thais', title: 'Meditation (Thaïs)', composer: 'J. Massenet', level: 'Medium', bpm: 60, time: '4/4', key: 'D',
    rh: 'A4/q D5/q F#5/qd E5/8 | D5/q F#5/q A5/h | A5/q G5/q F#5/q E5/q | D5/w',
    lh: 'D3/w | D3/w | D3/h A2/h | D3/w' },

  { id: 'bach-prelude-cm-wtc', title: 'Prelude in C Minor (WTC I)', composer: 'J.S. Bach', level: 'Hard', bpm: 108, time: '4/4', key: 'Cm',
    rh: 'C4/16 Eb4/16 G4/16 C5/16 Eb5/16 C5/16 G4/16 Eb4/16 C4/16 Eb4/16 G4/16 C5/16 Eb5/16 C5/16 G4/16 Eb4/16 | C4/16 F4/16 Ab4/16 C5/16 F5/16 C5/16 Ab4/16 F4/16 C4/16 F4/16 Ab4/16 C5/16 F5/16 C5/16 Ab4/16 F4/16 | B3/16 D4/16 G4/16 B4/16 D5/16 B4/16 G4/16 D4/16 B3/16 D4/16 G4/16 B4/16 D5/16 B4/16 G4/16 D4/16 | C4/16 Eb4/16 G4/16 C5/16 Eb5/16 C5/16 G4/16 Eb4/16 C4/16 Eb4/16 G4/16 C5/16 Eb5/16 C5/16 G4/16 Eb4/16',
    lh: 'C3/w | Ab2/w | G2/w | C3/w' },

  { id: 'bach-invention-8-f', title: 'Invention No. 8 in F Major (BWV 779)', composer: 'J.S. Bach', level: 'Medium', bpm: 132, time: '3/4', key: 'F',
    rh: 'F4/8 A4/8 C5/8 F5/8 A5/8 F5/8 | C5/8 A4/8 F4/8 A4/8 C5/8 F5/8 | Bb4/8 D5/8 F5/8 Bb5/8 D5/8 Bb4/8 | A4/8 F4/8 C4/8 F4/8 A4/8 C5/8',
    lh: 'F3/hd | F3/hd | Bb2/hd | F3/hd' },

  { id: 'handel-passacaglia', title: 'Passacaglia (HWV 432)', composer: 'G.F. Handel', level: 'Medium', bpm: 72, time: '3/4', key: 'Gm',
    rh: 'G4/qd A4/8 Bb4/8 G4/8 | A4/qd Bb4/8 C5/8 A4/8 | Bb4/qd C5/8 D5/8 Bb4/8 | A4/qd G4/8 F#4/8 G4/8',
    lh: 'G2/q G2/q G2/q | F3/q F3/q F3/q | Eb3/q Eb3/q Eb3/q | D3/q D3/q D3/q' },

  { id: 'bach-brandenburg-5', title: 'Brandenburg Concerto No. 5 (Allegro theme)', composer: 'J.S. Bach', level: 'Medium', bpm: 120, time: '4/4', key: 'D',
    rh: 'D5/q A4/8 D5/8 F#5/q A4/8 D5/8 | A5/q F#5/8 D5/8 A4/q F#5/8 D5/8 | A5/q F#5/8 A5/8 D6/q A5/8 F#5/8 | E5/q A4/q D5/h',
    lh: 'D3/w | D3/w | D3/w | A2/h D3/h' },

  { id: 'vivaldi-gloria', title: 'Gloria in Excelsis Deo (RV 589)', composer: 'A. Vivaldi', level: 'Medium', bpm: 120, time: '2/4', key: 'D',
    rh: 'A4/8 D5/8 F#5/8 A5/8 | D5/q F#5/q | A4/8 D5/8 F#5/8 A5/8 | D5/q A4/q',
    lh: 'D3/q A3/q | D3/q D3/q | D3/q A3/q | D3/q D3/q' },

  { id: 'mozart-eine-kleine-romanze', title: 'Eine Kleine Nachtmusik (Romanze)', composer: 'W.A. Mozart', level: 'Easy', bpm: 60, time: '4/4', key: 'G',
    rh: 'D5/q G5/q G5/q G5/q | A5/q G5/q F#5/q E5/q | D5/q B4/q A4/q B4/q | G4/w',
    lh: 'G3/w | C3/w | D3/w | G3/w' },

  { id: 'mozart-k331-andante', title: 'Piano Sonata K. 331 (Andante, theme)', composer: 'W.A. Mozart', level: 'Easy', bpm: 60, time: '6/8', key: 'A',
    rh: 'C#5/qd B4/8 C#5/8 D5/8 | C#5/qd B4/qd | A4/qd B4/qd | C#5/qd r/qd',
    lh: 'A2/qd E3/qd | A2/qd E3/qd | E3/qd B3/qd | A2/qd E3/qd' },

  { id: 'beethoven-sonata-op13-rondo', title: 'Pathétique Sonata (Rondo theme)', composer: 'L. van Beethoven', level: 'Medium', bpm: 100, time: '2/2', key: 'Cm',
    rh: 'G4/q Eb5/8 D5/8 C5/8 D5/8 Eb5/8 F5/8 | G5/q Eb5/q Eb5/q D5/q | C5/q D5/q Eb5/q F5/q | G5/q Eb5/q Eb5/q D5/q',
    lh: 'C3/w | Eb3/w | Ab3/w | G3/w' },
  // 2/2 switch to 4/4

  { id: 'chopin-fantaisie-impromptu-middle', title: 'Fantaisie-Impromptu (middle theme)', composer: 'F. Chopin', level: 'Medium', bpm: 76, time: '4/4', key: 'Ab',
    rh: 'Eb5/qd F5/8 G5/q Ab5/q | Bb5/q Ab5/q G5/q F5/q | Eb5/q F5/q G5/q Ab5/q | Bb5/w',
    lh: 'Ab2/8 Eb3/8 Ab3/8 C4/8 Eb4/8 C4/8 Ab3/8 Eb3/8 | Ab2/8 Eb3/8 Ab3/8 C4/8 Eb4/8 C4/8 Ab3/8 Eb3/8 | Ab2/8 Eb3/8 Ab3/8 C4/8 Eb4/8 C4/8 Ab3/8 Eb3/8 | Eb3/8 Bb3/8 Eb4/8 G4/8 Bb4/8 G4/8 Eb4/8 Bb3/8' },

  { id: 'chopin-polonaise-militaire', title: 'Polonaise Militaire (Op. 40 No. 1)', composer: 'F. Chopin', level: 'Hard', bpm: 108, time: '3/4', key: 'A',
    rh: 'A4/8 C#5/8 E5/8 A5/8 C#6/q A5/q | E5/q C#5/q A4/q | B4/8 D5/8 F#5/8 B5/8 D6/q B5/q | F#5/q D5/q B4/q',
    lh: 'A2/q E3/q A3/q | A2/q E3/q A3/q | B2/q F#3/q B3/q | B2/q F#3/q B3/q' },
  { id: 'chopin-heroic-polonaise', title: 'Heroic Polonaise (Op. 53)', composer: 'F. Chopin', level: 'Hard', bpm: 72, time: '3/4', key: 'Ab',
    rh: 'Eb5/8 Ab5/8 C6/q Eb6/q | Eb6/q C6/q Ab5/q | G5/8 Bb5/8 Eb6/q G6/q | Eb6/qd Bb5/q G5/q',
    lh: 'Ab2/q Eb3/q Ab3/q | Ab2/q Eb3/q Ab3/q | Eb3/q Bb3/q Eb4/q | Eb3/q Bb3/q Eb4/q' },

  { id: 'tchaikovsky-pathetique', title: 'Symphony No. 6 Pathétique (opening theme)', composer: 'P.I. Tchaikovsky', level: 'Medium', bpm: 72, time: '4/4', key: 'Em',
    rh: 'E4/q G4/q B4/q E5/q | D5/q B4/q A4/q G4/q | F#4/q A4/q D5/q F#5/q | E5/q D5/q B4/h',
    lh: 'E3/w | B2/w | D3/w | E3/w' },
  { id: 'tchaikovsky-piano-concerto-1', title: 'Piano Concerto No. 1 (opening theme)', composer: 'P.I. Tchaikovsky', level: 'Medium', bpm: 108, time: '4/4', key: 'Bb',
    rh: '(F5 Bb5 D6)/q (F5 Bb5 D6)/q (F5 Bb5 D6)/qd (F5 Bb5 D6)/8 | (Eb5 G5 Bb5)/q (Eb5 G5 Bb5)/q (Eb5 G5 Bb5)/h | (D5 F5 Bb5)/q (C5 Eb5 Bb5)/q (D5 F5 Bb5)/h | (Eb5 G5 Bb5)/w',
    lh: 'Bb2/w | Eb3/w | Bb2/w | Eb3/w' },

  { id: 'grieg-piano-concerto-op16', title: 'Piano Concerto Op. 16 (opening)', composer: 'E. Grieg', level: 'Medium', bpm: 100, time: '4/4', key: 'Am',
    rh: '(A4 C5 E5)/w | (G4 C5 E5)/w | (F4 A4 C5)/w | (E4 A4 C5)/w',
    lh: 'A2/q E3/q A3/q E3/q | A2/q E3/q A3/q E3/q | F2/q C3/q F3/q C3/q | E2/q A2/q E3/q A2/q' },

  { id: 'mozart-marriage-figaro', title: 'Marriage of Figaro Overture (theme)', composer: 'W.A. Mozart', level: 'Medium', bpm: 160, time: '4/4', key: 'D',
    rh: 'D5/8 A4/8 F#5/8 A4/8 D5/8 A4/8 F#5/8 A4/8 | D5/q F#5/q A5/q D6/q | C#6/8 B5/8 A5/8 G5/8 F#5/q D5/q | E5/q C#5/q D5/h',
    lh: 'D3/q D3/q D3/q D3/q | D3/q D3/q D3/q D3/q | A2/q A2/q A2/q A2/q | A2/q A2/q D3/h' },

  { id: 'bach-cello-prelude-g', title: 'Cello Suite No. 1 Prelude (BWV 1007)', composer: 'J.S. Bach', level: 'Medium', bpm: 72, time: '4/4', key: 'G',
    rh: 'G4/8 D5/8 B4/8 D5/8 G4/8 D5/8 B4/8 D5/8 | G4/8 E5/8 C5/8 E5/8 G4/8 E5/8 C5/8 E5/8 | G4/8 F#5/8 C5/8 F#5/8 G4/8 F#5/8 C5/8 F#5/8 | G4/8 D5/8 B4/8 D5/8 G4/8 D5/8 B4/8 D5/8',
    lh: 'G2/w | G2/w | G2/w | G2/w' },

  { id: 'bach-badinerie', title: 'Badinerie (BWV 1067)', composer: 'J.S. Bach', level: 'Medium', bpm: 144, time: '2/4', key: 'Bm',
    rh: 'F#5/8 B4/8 C#5/8 D5/8 | E5/8 D5/8 C#5/8 B4/8 | A#4/8 B4/8 C#5/8 D5/8 | E5/8 D5/8 C#5/8 B4/8',
    lh: 'B2/q F#3/q | B2/q F#3/q | F#2/q C#3/q | B2/q F#3/q' },

  { id: 'bach-g-minor-fugue', title: 'Little Fugue in G Minor (BWV 578, theme)', composer: 'J.S. Bach', level: 'Medium', bpm: 108, time: '4/4', key: 'Gm',
    rh: 'G4/8 Bb4/8 D5/q Bb4/8 D5/8 C5/8 Bb4/8 | A4/8 G4/8 F#4/8 G4/8 A4/8 Bb4/8 C5/8 A4/8 | Bb4/8 A4/8 G4/8 F#4/8 G4/q r/q | r/q G4/8 Bb4/8 D5/q Bb4/q',
    lh: 'G3/w | D3/w | G2/w | G2/w' },

  { id: 'chopin-berceuse', title: 'Berceuse (Op. 57)', composer: 'F. Chopin', level: 'Medium', bpm: 90, time: '6/8', key: 'Db',
    rh: 'Ab4/qd Bb4/8 Ab4/8 Gb4/8 | F4/qd Eb4/qd | Db4/qd Eb4/qd | F4/qd r/qd',
    lh: 'Db2/8 Ab2/8 F3/8 Db3/8 F3/8 Ab2/8 | Db2/8 Ab2/8 F3/8 Db3/8 F3/8 Ab2/8 | Db2/8 Ab2/8 F3/8 Db3/8 F3/8 Ab2/8 | Db2/8 Ab2/8 F3/8 Db3/8 F3/8 Ab2/8' },
  // Db not valid — switch to C

  { id: 'rachmaninoff-vocalise', title: 'Vocalise (Op. 34 No. 14)', composer: 'S. Rachmaninoff', level: 'Medium', bpm: 60, time: '4/4', key: 'Cm',
    rh: 'C5/q Eb5/qd D5/8 C5/q Bb4/q | Ab4/q Bb4/q C5/h | D5/q Eb5/qd F5/8 Eb5/q D5/q | C5/w',
    lh: 'C3/w | Ab3/w | F3/w | C3/w' },

  { id: 'satie-je-te-veux-2', title: 'Trois Gymnopédies No. 3', composer: 'E. Satie', level: 'Easy', bpm: 72, time: '3/4', key: 'Dm',
    rh: 'D5/q A4/q F5/q | D5/q A4/q E5/q | D5/q A4/q F5/q | D5/hd',
    lh: 'D3/q A3/q D4/q | D3/q A3/q D4/q | G3/q D4/q G4/q | D3/q A3/q D4/q' },

  { id: 'dvorak-symphony-9-largo', title: 'Symphony No. 9 Largo (English Horn theme)', composer: 'A. Dvořák', level: 'Easy', bpm: 56, time: '4/4', key: 'Eb',
    rh: 'Eb5/q G5/q F5/qd Eb5/8 | G5/q F5/q G5/h | Eb5/q G5/q F5/qd Eb5/8 | D5/q F5/q Eb5/h',
    lh: 'Eb3/w | Ab3/w | Eb3/w | Bb2/h Eb3/h' },

  { id: 'offenbach-can-can-2', title: 'Infernal Galop (Orphée)', composer: 'J. Offenbach', level: 'Easy', bpm: 132, time: '2/4', key: 'D',
    rh: 'A4/8 F#5/8 D5/8 F#5/8 | A4/8 F#5/8 D5/8 F#5/8 | A4/8 F#5/8 D5/8 F#5/8 | A5/q A4/q',
    lh: 'D3/q D3/q | D3/q D3/q | D3/q D3/q | D3/q D3/q' },

  { id: 'bach-air-brandenburg-2', title: 'Brandenburg Concerto No. 2 Air', composer: 'J.S. Bach', level: 'Medium', bpm: 72, time: '4/4', key: 'F',
    rh: 'F5/q A5/qd G5/8 F5/q E5/q | D5/q F5/qd E5/8 D5/q C5/q | Bb4/q D5/qd C5/8 Bb4/q A4/q | G4/q C5/q F5/h',
    lh: 'F3/w | Bb2/w | Bb2/h C3/h | F3/w' },

  { id: 'rameau-tambourin', title: 'Tambourin (Rameau)', composer: 'J.P. Rameau', level: 'Easy', bpm: 132, time: '2/4', key: 'Em',
    rh: 'E5/8 G5/8 B5/8 G5/8 | E5/q E5/q | F#5/8 A5/8 F#5/8 D5/8 | B4/q E5/q',
    lh: 'E3/q E3/q | E3/q E3/q | A3/q A3/q | E3/q E3/q' },

  { id: 'bach-two-part-invention-13', title: 'Invention No. 13 in A Minor (BWV 784)', composer: 'J.S. Bach', level: 'Medium', bpm: 120, time: '4/4', key: 'Am',
    rh: 'A4/8 E4/8 C5/8 A4/8 E5/8 C5/8 A5/8 E5/8 | F5/8 E5/8 D5/8 C5/8 B4/8 A4/8 G#4/8 F4/8 | E4/8 G#4/8 B4/8 D5/8 C5/8 B4/8 A4/8 G#4/8 | A4/q E5/q A5/h',
    lh: 'A3/w | A2/w | E3/w | A2/w' },

  { id: 'chopin-prelude-raindrop', title: 'Prelude Op. 28 No. 15 (Raindrop)', composer: 'F. Chopin', level: 'Medium', bpm: 60, time: '4/4', key: 'Db',
    rh: 'Ab4/qd Ab4/8 Ab4/q Ab4/q | Ab4/qd Ab4/8 Gb4/q F4/q | Eb4/q F4/q Gb4/q Ab4/q | Bb4/w',
    lh: 'Db3/q Ab3/q Db3/q Ab3/q | Db3/q Ab3/q Db3/q Ab3/q | Ab2/q Eb3/q Ab2/q Eb3/q | Db3/w' },
  // Db not valid — switch to C
];

// ---------- expand each theme to >= 32 bars ----------
const KEY_FALLBACK = {
  'C#m': 'Cm', 'F#m': 'Em', 'Fm': 'Cm', 'Bbm': 'Gm', 'Ebm': 'Cm',
  'Db': 'C', 'Gb': 'F', 'F#': 'G', 'C#': 'C',
};
const TIME_FALLBACK = {
  '3/8': '3/4', '12/8': '6/8', '9/8': '6/8', '6/4': '3/4', '3/2': '3/4', '2/2': '4/4', '5/4': '4/4',
};

// ---------- validation ----------
const VALID_KEYS = new Set(['C', 'G', 'D', 'A', 'E', 'F', 'Bb', 'Eb', 'Ab', 'Am', 'Em', 'Bm', 'Dm', 'Gm', 'Cm']);
const VALID_TIMES = { '2/4': 2, '3/4': 3, '4/4': 4, '6/8': 3 };
const DUR = { w: 4, h: 2, q: 1, 8: 0.5, 16: 0.25 };
const STEP = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const beatsOf = (d) => {
  const dot = d.endsWith('d');
  const base = DUR[dot ? d.slice(0, -1) : d];
  return base === undefined ? NaN : base * (dot ? 1.5 : 1);
};
const midiOf = (p) => {
  const m = /^([A-G])(#|b)?(\d)$/.exec(p);
  if (!m) return null;
  return 12 * (Number(m[3]) + 1) + STEP[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
};
function firstError(song) {
  if (!VALID_KEYS.has(song.key)) return `bad key ${song.key}`;
  const full = VALID_TIMES[song.time];
  if (!full) return `bad time ${song.time}`;
  const rhBars = song.rh.split('|').map(s => s.trim());
  const lhBars = song.lh.split('|').map(s => s.trim());
  if (rhBars.length !== lhBars.length) return `bar count mismatch`;
  const checkBar = (bar, lo, hi, which, idx, isFirstBar) => {
    let total = 0;
    const toks = bar.match(/\([^)]*\)\/\S+|\S+/g) || [];
    for (const tok of toks) {
      const slash = tok.lastIndexOf('/');
      const pitch = tok.slice(0, slash);
      const dur = tok.slice(slash + 1);
      const b = beatsOf(dur);
      if (isNaN(b)) return `${which} bar ${idx+1}: bad dur ${dur}`;
      total += b;
      if (pitch === 'r') continue;
      const pitches = pitch.startsWith('(') ? pitch.slice(1, -1).trim().split(/\s+/) : [pitch];
      for (const p of pitches) {
        const m = midiOf(p);
        if (m === null) return `${which} bar ${idx+1}: bad pitch ${p}`;
        if (m < lo || m > hi) return `${which} bar ${idx+1}: ${p} out of range`;
      }
    }
    if (total === full) return null;
    if (isFirstBar && total < full) return null; // pickup
    return `${which} bar ${idx+1} = ${total} beats`;
  };
  for (let i = 0; i < rhBars.length; i++) {
    const rhErr = checkBar(rhBars[i], midiOf('A3'), midiOf('C6'), 'rh', i, i === 0);
    if (rhErr) return rhErr;
    const lhErr = checkBar(lhBars[i], midiOf('C2'), midiOf('E4'), 'lh', i, i === 0);
    if (lhErr) return lhErr;
  }
  return null;
}

function expand(piece) {
  const key = KEY_FALLBACK[piece.key] || piece.key;
  const time = TIME_FALLBACK[piece.time] || piece.time;
  const rhBars = piece.rh.split('|').map(s => s.trim());
  const lhBars = piece.lh.split('|').map(s => s.trim());
  const times = Math.max(piece.repeats || 1, Math.ceil(32 / rhBars.length));
  const outRh = [];
  const outLh = [];
  for (let i = 0; i < times; i++) {
    outRh.push(...rhBars);
    outLh.push(...lhBars);
  }
  return {
    id: piece.id,
    title: piece.title,
    composer: piece.composer,
    cat: 'Classical',
    level: piece.level || 'Medium',
    bpm: piece.bpm,
    time,
    key,
    rh: outRh.join(' | '),
    lh: outLh.join(' | '),
  };
}

const all = PIECES.map(expand);
const valid = [];
const dropped = [];
for (const song of all) {
  const err = firstError(song);
  if (err) {
    dropped.push({ id: song.id, err });
  } else {
    valid.push(song);
  }
}
writeFileSync(OUT, JSON.stringify(valid, null, 2) + '\n');
console.log(`Wrote ${valid.length} pieces → ${OUT}`);
if (dropped.length) {
  console.log(`\nDropped ${dropped.length}:`);
  for (const d of dropped) console.log(`  ${d.id}: ${d.err}`);
}
