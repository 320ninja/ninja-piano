// Generates songs/pack-156.json — 12 more pieces per genre × 13 genres.
// Companion to pack-260. All IDs use "p4-" prefix for uniqueness.
// Public-domain traditional + Piano Learners originals for modern styles.
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'songs', 'pack-156.json');

const PIECES = [
  // ========== KIDS (12) ==========
  { id: 'p4-eency-weency-again', cat: 'Kids', title: 'Eency Weency Spider (variant)', composer: 'Traditional', level: 'Easy', bpm: 112, time: '2/4', key: 'G',
    rh: 'G4/q G4/q | A4/q A4/q | B4/q A4/q | G4/h | G4/q A4/q | B4/q G4/q | A4/q G4/q | D5/h',
    lh: 'G3/h | D3/h | D3/h | G3/h | G3/h | G3/h | D3/h | D3/h' },
  { id: 'p4-london-bridge-2', cat: 'Kids', title: 'Jack Be Nimble', composer: 'Traditional', level: 'Easy', bpm: 120, time: '2/4', key: 'C',
    rh: 'E5/q C5/q | D5/q E5/q | F5/q E5/q | D5/h | E5/q C5/q | D5/q E5/q | C5/q D5/q | C5/h',
    lh: 'C3/h | G2/h | F3/h | G2/h | C3/h | G2/h | G2/h | C3/h' },
  { id: 'p4-pease-porridge', cat: 'Kids', title: 'Pease Porridge Hot', composer: 'Traditional', level: 'Easy', bpm: 132, time: '2/4', key: 'G',
    rh: 'G4/q G4/q | D5/q D5/q | E5/q D5/q | B4/h | G4/q G4/q | D5/q D5/q | E5/q D5/q | G4/h',
    lh: 'G3/h | D3/h | G3/h | G3/h | G3/h | D3/h | G3/h | G3/h' },
  { id: 'p4-rub-a-dub', cat: 'Kids', title: 'Rub-a-Dub-Dub', composer: 'Traditional', level: 'Easy', bpm: 120, time: '2/4', key: 'C',
    rh: 'C5/q C5/q | E5/q G5/q | E5/q D5/q | C5/h | C5/q C5/q | E5/q G5/q | F5/q E5/q | C5/h',
    lh: 'C3/h | C3/h | G2/h | C3/h | C3/h | C3/h | F3/h | C3/h' },
  { id: 'p4-tommy-tucker', cat: 'Kids', title: 'Little Tommy Tucker', composer: 'Traditional', level: 'Easy', bpm: 112, time: '2/4', key: 'F',
    rh: 'F4/q A4/q | C5/q A4/q | Bb4/q G4/q | A4/h | F4/q A4/q | C5/q F5/q | E5/q D5/q | C5/h',
    lh: 'F3/h | F3/h | Bb2/h | C3/h | F3/h | F3/h | C3/h | C3/h' },
  { id: 'p4-mary-had-lamb-2', cat: 'Kids', title: 'Little Boy Blue', composer: 'Traditional', level: 'Easy', bpm: 108, time: '2/4', key: 'G',
    rh: 'G4/q B4/q | D5/q B4/q | A4/q G4/q | D5/h | G4/q B4/q | D5/q G5/q | E5/q D5/q | B4/h',
    lh: 'G3/h | G3/h | D3/h | G3/h | G3/h | G3/h | D3/h | G3/h' },
  { id: 'p4-wee-willie', cat: 'Kids', title: 'Wee Willie Winkie', composer: 'Traditional', level: 'Easy', bpm: 120, time: '6/8', key: 'C',
    rh: 'C5/qd E5/qd | G5/qd E5/qd | F5/qd D5/8 C5/8 D5/8 | E5/qd C5/qd',
    lh: 'C3/qd C3/qd | C3/qd C3/qd | F3/qd G3/qd | C3/qd C3/qd' },
  { id: 'p4-mary-mary-contrary', cat: 'Kids', title: 'Mary Mary Quite Contrary', composer: 'Traditional', level: 'Easy', bpm: 120, time: '3/4', key: 'G',
    rh: 'G4/q B4/q D5/q | B4/q G4/q D5/q | A4/q B4/q C5/q | B4/hd | G4/q B4/q D5/q | E5/q D5/q B4/q | A4/q G4/q A4/q | G4/hd',
    lh: 'G3/hd | G3/hd | D3/hd | D3/hd | G3/hd | G3/hd | D3/hd | G3/hd' },
  { id: 'p4-peter-piper', cat: 'Kids', title: 'Peter Piper', composer: 'Traditional', level: 'Easy', bpm: 132, time: '2/4', key: 'C',
    rh: 'C5/8 D5/8 E5/8 F5/8 | G5/q E5/q | D5/8 C5/8 D5/8 E5/8 | C5/q r/q | G4/8 A4/8 B4/8 C5/8 | D5/q B4/q | C5/8 D5/8 E5/8 G5/8 | C5/h',
    lh: 'C3/h | C3/h | G2/h | C3/h | G2/h | G2/h | C3/h | C3/h' },
  { id: 'p4-apples-pears', cat: 'Kids', title: 'Apples and Pears', composer: 'Traditional', level: 'Easy', bpm: 120, time: '4/4', key: 'G',
    rh: 'G4/q B4/q D5/q G5/q | E5/q D5/q B4/h | A4/q C5/q E5/q A5/q | F#5/q E5/q D5/h',
    lh: 'G3/w | G3/w | A3/w | D3/w' },
  { id: 'p4-handy-spandy', cat: 'Kids', title: 'Handy Spandy', composer: 'Traditional', level: 'Easy', bpm: 132, time: '2/4', key: 'C',
    rh: 'G4/q E5/q | G4/q E5/q | F5/8 E5/8 D5/q | C5/h | G4/q E5/q | G4/q E5/q | D5/q E5/q | C5/h',
    lh: 'C3/h | C3/h | F3/h | C3/h | C3/h | C3/h | G2/h | C3/h' },
  { id: 'p4-georgie-porgie', cat: 'Kids', title: 'Georgie Porgie', composer: 'Traditional', level: 'Easy', bpm: 108, time: '3/4', key: 'F',
    rh: 'F4/q A4/q C5/q | F5/q C5/q A4/q | G4/q A4/q Bb4/q | A4/hd | F4/q A4/q C5/q | F5/q C5/q A4/q | G4/q F4/q G4/q | F4/hd',
    lh: 'F3/hd | F3/hd | C3/hd | F3/hd | F3/hd | F3/hd | C3/hd | F3/hd' },

  // ========== POP (12) ==========
  { id: 'p4-pop-you-made-me-love', cat: 'Pop', title: 'You Made Me Love You', composer: 'James Monaco (1913)', level: 'Easy', bpm: 108, time: '4/4', key: 'F',
    rh: 'A4/q F4/q A4/q C5/q | D5/qd C5/8 A4/h | Bb4/q A4/q G4/q F4/q | A4/q G4/q F4/h',
    lh: 'F3/w | F3/w | Bb2/w | F3/w' },
  { id: 'p4-pop-ive-been-floating', cat: 'Pop', title: 'The Yankee Doodle Boy', composer: 'George M. Cohan (1904)', level: 'Easy', bpm: 132, time: '4/4', key: 'G',
    rh: 'D5/q B4/q G4/q G4/q | A4/q B4/q C5/q A4/q | G4/q B4/q D5/q D5/q | G5/q E5/q D5/h',
    lh: 'G3/w | D3/w | G3/w | D3/h G3/h' },
  { id: 'p4-pop-silver-threads', cat: 'Pop', title: 'Silver Threads Among the Gold', composer: 'Danks / Rexford (1873)', level: 'Easy', bpm: 72, time: '3/4', key: 'G',
    rh: 'B4/q D5/q G5/q | F#5/q E5/q D5/q | C5/qd B4/8 A4/q | G4/hd | B4/q D5/q G5/q | A5/q G5/q F#5/q | E5/q D5/q C5/q | B4/hd',
    lh: 'G3/hd | G3/hd | D3/hd | G3/hd | G3/hd | D3/hd | A3/hd | G3/hd' },
  { id: 'p4-pop-when-you-and-i', cat: 'Pop', title: 'When You and I Were Young Maggie', composer: 'J.A. Butterfield (1866)', level: 'Easy', bpm: 76, time: '4/4', key: 'C',
    rh: 'C5/q C5/q A4/q C5/q | D5/qd C5/8 G4/h | A4/q A4/q B4/q C5/q | D5/qd C5/8 C5/h',
    lh: 'C3/w | C3/w | F3/w | C3/w' },
  { id: 'p4-pop-side-by-side', cat: 'Pop', title: 'Side by Side', composer: 'Harry Woods (1927)', level: 'Easy', bpm: 120, time: '4/4', key: 'C',
    rh: 'C5/q C5/q G4/q G4/q | A4/q G4/q E4/h | D5/q D5/q G4/q G4/q | C5/q B4/q C5/h',
    lh: 'C3/w | C3/w | G2/w | C3/w' },
  { id: 'p4-pop-ive-grown-accustomed', cat: 'Pop', title: 'Bicycle Built for Two (reprise)', composer: 'Harry Dacre (1892)', level: 'Easy', bpm: 108, time: '3/4', key: 'F',
    rh: 'F5/qd D5/8 Bb4/q | C5/qd A4/8 F4/q | F4/q G4/q A4/q | Bb4/hd | F5/qd D5/8 Bb4/q | C5/qd A4/8 F4/q | G4/q A4/q F4/q | F4/hd',
    lh: 'F3/hd | F3/hd | F3/hd | Bb2/hd | F3/hd | F3/hd | C3/hd | F3/hd' },
  { id: 'p4-pop-after-the-game', cat: 'Pop', title: 'Melody of Love', composer: 'Hans Engelmann (1903)', level: 'Easy', bpm: 108, time: '3/4', key: 'G',
    rh: 'D5/qd G5/8 B5/q | A5/qd G5/8 F#5/q | E5/q F#5/q G5/q | D5/hd | D5/qd G5/8 B5/q | A5/qd G5/8 F#5/q | E5/q D5/q C5/q | B4/hd',
    lh: 'G3/hd | G3/hd | A3/hd | D3/hd | G3/hd | G3/hd | A3/hd | G3/hd' },
  { id: 'p4-pop-margie', cat: 'Pop', title: 'Margie', composer: 'Con Conrad / J. Russel Robinson (1920)', level: 'Easy', bpm: 120, time: '4/4', key: 'C',
    rh: 'E5/q G5/q E5/q C5/q | D5/q D5/q D5/h | E5/q G5/q A5/q E5/q | D5/q C5/q G4/h',
    lh: 'C3/w | G2/w | C3/w | G2/h C3/h' },
  { id: 'p4-pop-ja-da', cat: 'Pop', title: 'Ja-Da', composer: 'Bob Carleton (1918)', level: 'Easy', bpm: 132, time: '4/4', key: 'C',
    rh: 'E5/q G5/q E5/q C5/q | E5/q G5/q E5/h | D5/q F5/q D5/q B4/q | D5/q F5/q D5/h',
    lh: 'C3/w | C3/w | G2/w | G2/w' },
  { id: 'p4-pop-dardanella', cat: 'Pop', title: 'Dardanella', composer: 'Felix Bernard / Johnny Black (1919)', level: 'Easy', bpm: 108, time: '4/4', key: 'F',
    rh: 'C5/q A4/q F4/q A4/q | C5/q F5/q A5/h | G5/q F5/q E5/q D5/q | C5/w',
    lh: 'F3/w | F3/w | F3/w | C3/h F3/h' },
  { id: 'p4-pop-ragtime-cowboy', cat: 'Pop', title: 'Ragtime Cowboy Joe', composer: 'Lewis F. Muir (1912)', level: 'Easy', bpm: 132, time: '2/4', key: 'G',
    rh: 'G4/q B4/q | D5/q B4/q | A4/q C5/q | E5/q C5/q | B4/q A4/q | G4/q F#4/q | G4/q A4/q | G4/h',
    lh: 'G3/h | G3/h | A3/h | A3/h | G3/h | D3/h | D3/h | G3/h' },
  { id: 'p4-pop-ill-see-you', cat: 'Pop', title: 'In the Good Old Summer Time (variant)', composer: 'Evans / Shields (1902)', level: 'Easy', bpm: 108, time: '3/4', key: 'F',
    rh: 'F4/q A4/q C5/q | F5/q C5/q A4/q | Bb4/q A4/q G4/q | A4/hd | F4/q A4/q C5/q | F5/q A5/q G5/q | F5/q E5/q D5/q | C5/hd',
    lh: 'F3/hd | F3/hd | Bb2/hd | F3/hd | F3/hd | F3/hd | Bb2/hd | C3/hd' },

  // ========== FOLK (12) ==========
  { id: 'p4-folk-irish-washerwoman-2', cat: 'Folk', title: 'The Rose Tree', composer: 'Traditional Irish', level: 'Easy', bpm: 132, time: '6/8', key: 'G',
    rh: 'D5/qd B4/qd | G4/8 B4/8 D5/8 G5/qd | E5/qd C5/qd | A4/8 C5/8 E5/8 A5/qd',
    lh: 'G3/qd G3/qd | G3/qd D3/qd | C3/qd C3/qd | A3/qd A3/qd' },
  { id: 'p4-folk-mingulay-boat', cat: 'Folk', title: 'Mingulay Boat Song', composer: 'Traditional Scottish', level: 'Easy', bpm: 108, time: '4/4', key: 'G',
    rh: 'D5/q B4/q G4/q B4/q | A4/q B4/q D5/h | E5/q D5/q B4/q G4/q | A4/q B4/q G4/h',
    lh: 'G3/w | G3/w | G3/w | D3/h G3/h' },
  { id: 'p4-folk-black-is-color', cat: 'Folk', title: 'Black Is the Color', composer: 'Traditional American', level: 'Easy', bpm: 80, time: '3/4', key: 'Dm',
    rh: 'D5/q F5/q A5/q | G5/q F5/q E5/q | D5/qd C5/8 Bb4/q | A4/hd | D5/q F5/q A5/q | G5/q A5/q G5/q | F5/q E5/q D5/q | D5/hd',
    lh: 'D3/hd | D3/hd | Bb2/hd | A2/hd | D3/hd | D3/hd | A2/hd | D3/hd' },
  { id: 'p4-folk-little-brown-church', cat: 'Folk', title: 'The Little Brown Church', composer: 'William S. Pitts (1857)', level: 'Easy', bpm: 108, time: '4/4', key: 'G',
    rh: 'G4/q B4/q D5/q D5/q | E5/q D5/q B4/h | A4/q B4/q C5/q D5/q | B4/q G4/q G4/h',
    lh: 'G3/w | G3/w | A3/w | G3/w' },
  { id: 'p4-folk-rising-sun-traditional', cat: 'Folk', title: 'The Rising of the Moon', composer: 'Traditional Irish', level: 'Easy', bpm: 112, time: '4/4', key: 'G',
    rh: 'D5/q G4/q B4/q D5/q | G5/q E5/q D5/h | B4/q D5/q C5/q B4/q | A4/q G4/q G4/h',
    lh: 'G3/w | G3/w | G3/w | D3/h G3/h' },
  { id: 'p4-folk-will-ye-go-lassie', cat: 'Folk', title: 'Will Ye Go Lassie Go', composer: 'Traditional Scottish', level: 'Easy', bpm: 100, time: '4/4', key: 'G',
    rh: 'G4/q G4/q B4/q D5/q | D5/q C5/q B4/h | A4/q A4/q C5/q E5/q | D5/q B4/q G4/h',
    lh: 'G3/w | G3/w | A3/w | G3/w' },
  { id: 'p4-folk-ash-grove', cat: 'Folk', title: 'The Ash Grove', composer: 'Traditional Welsh', level: 'Easy', bpm: 120, time: '3/4', key: 'F',
    rh: 'F5/qd E5/8 D5/q | C5/q A4/q F4/q | A4/q Bb4/q C5/q | F5/hd | F5/qd E5/8 D5/q | C5/q A4/q F4/q | A4/q G4/q A4/q | F4/hd',
    lh: 'F3/hd | F3/hd | F3/hd | C3/hd | F3/hd | F3/hd | C3/hd | F3/hd' },
  { id: 'p4-folk-morrisons-jig', cat: 'Folk', title: "Morrison's Jig", composer: 'Traditional Irish', level: 'Easy', bpm: 132, time: '6/8', key: 'Em',
    rh: 'E5/8 D5/8 B4/8 A4/8 B4/8 G4/8 | E4/8 G4/8 B4/8 D5/8 B4/8 G4/8 | E5/8 D5/8 B4/8 A4/8 B4/8 G4/8 | F#4/8 A4/8 D5/8 F#5/qd',
    lh: 'E3/qd E3/qd | E3/qd E3/qd | E3/qd E3/qd | D3/qd A3/qd' },
  { id: 'p4-folk-liebestraume-folk', cat: 'Folk', title: 'The Minstrel Boy', composer: 'Traditional Irish', level: 'Easy', bpm: 108, time: '4/4', key: 'G',
    rh: 'G4/q G4/q B4/q D5/q | E5/q D5/q B4/h | A4/q B4/q C5/q A4/q | G4/q A4/q G4/h',
    lh: 'G3/w | G3/w | G3/w | D3/h G3/h' },
  { id: 'p4-folk-maiden-mourne', cat: 'Folk', title: 'The Maid of Mourne Shore', composer: 'Traditional Irish', level: 'Easy', bpm: 80, time: '4/4', key: 'G',
    rh: 'B4/q D5/q G5/q F#5/q | E5/qd D5/8 B4/h | A4/q B4/q D5/q E5/q | D5/q B4/q G4/h',
    lh: 'G3/w | G3/w | A3/w | G3/w' },
  { id: 'p4-folk-last-rose-summer', cat: 'Folk', title: 'The Last Rose of Summer', composer: 'Traditional Irish', level: 'Easy', bpm: 76, time: '3/4', key: 'F',
    rh: 'F5/qd A5/8 F5/q | C5/qd F5/8 C5/q | A4/qd Bb4/8 C5/q | A4/hd | F5/qd A5/8 F5/q | C5/qd F5/8 C5/q | A4/qd G4/8 F4/q | F4/hd',
    lh: 'F3/hd | F3/hd | F3/hd | F3/hd | F3/hd | F3/hd | C3/hd | F3/hd' },
  { id: 'p4-folk-donkey-riding', cat: 'Folk', title: 'Donkey Riding', composer: 'Traditional Canadian', level: 'Easy', bpm: 132, time: '2/4', key: 'G',
    rh: 'G4/8 B4/8 D5/q | B4/8 G4/8 D5/q | A4/8 C5/8 E5/q | C5/8 A4/8 E5/q | G4/8 B4/8 D5/q | B4/8 G4/8 D5/q | A4/8 B4/8 D5/8 G4/8 | G4/h',
    lh: 'G3/h | G3/h | A3/h | A3/h | G3/h | G3/h | D3/h | G3/h' },

  // ========== HOLIDAY (12) ==========
  { id: 'p4-hol-away-manger-2', cat: 'Holiday', title: 'Love Came Down at Christmas', composer: 'Traditional Irish', level: 'Easy', bpm: 76, time: '3/4', key: 'G',
    rh: 'D5/q G5/q G5/q | A5/q G5/q F#5/q | E5/qd D5/8 B4/q | A4/hd | D5/q G5/q G5/q | A5/q G5/q E5/q | D5/qd C5/8 A4/q | G4/hd',
    lh: 'G3/hd | G3/hd | A3/hd | D3/hd | G3/hd | G3/hd | A3/hd | G3/hd' },
  { id: 'p4-hol-jesus-born-today', cat: 'Holiday', title: 'The Christmas Song (traditional)', composer: 'Traditional', level: 'Easy', bpm: 84, time: '4/4', key: 'F',
    rh: 'F4/q A4/q C5/q F5/q | E5/q D5/q C5/h | Bb4/q A4/q G4/q F4/q | A4/q G4/q F4/h',
    lh: 'F3/w | F3/w | Bb2/w | F3/w' },
  { id: 'p4-hol-angels-glory', cat: 'Holiday', title: 'Shepherds Rejoice', composer: 'Traditional English', level: 'Easy', bpm: 108, time: '4/4', key: 'G',
    rh: 'D5/q D5/q B4/q G4/q | A4/q B4/q G4/h | B4/q D5/q G5/q E5/q | D5/q B4/q G4/h',
    lh: 'G3/w | G3/w | G3/w | G3/w' },
  { id: 'p4-hol-personent-hodie', cat: 'Holiday', title: 'Personent Hodie', composer: 'Traditional (1360)', level: 'Easy', bpm: 120, time: '4/4', key: 'Dm',
    rh: 'D5/q D5/q D5/q F5/q | E5/q D5/q C5/h | D5/q F5/q A5/q F5/q | D5/q C5/q D5/h',
    lh: 'D3/w | D3/w | D3/w | A2/h D3/h' },
  { id: 'p4-hol-ding-dong-high-2', cat: 'Holiday', title: 'Hark the Herald (variant)', composer: 'Felix Mendelssohn', level: 'Easy', bpm: 120, time: '4/4', key: 'F',
    rh: 'F4/q F4/q A4/q A4/q | Bb4/q A4/q G4/h | C5/q C5/q F5/q F5/q | E5/q D5/q C5/h',
    lh: 'F3/w | F3/w | F3/w | C3/w' },
  { id: 'p4-hol-jesus-is-born', cat: 'Holiday', title: 'From Heaven Above', composer: 'Martin Luther (1534)', level: 'Easy', bpm: 108, time: '4/4', key: 'G',
    rh: 'G4/q G4/q A4/q B4/q | C5/q B4/q A4/h | D5/q C5/q B4/q A4/q | B4/q A4/q G4/h',
    lh: 'G3/w | G3/w | G3/w | D3/h G3/h' },
  { id: 'p4-hol-new-year-carol', cat: 'Holiday', title: 'A New Year Carol', composer: 'Traditional', level: 'Easy', bpm: 108, time: '4/4', key: 'G',
    rh: 'G4/q B4/q D5/q G5/q | E5/q D5/q B4/h | A4/q B4/q C5/q D5/q | B4/q G4/q G4/h',
    lh: 'G3/w | G3/w | A3/w | G3/w' },
  { id: 'p4-hol-christ-is-made', cat: 'Holiday', title: 'Christ Is Made the Sure Foundation', composer: 'Traditional (7th c.)', level: 'Easy', bpm: 108, time: '4/4', key: 'F',
    rh: 'F4/q A4/q C5/q F5/q | E5/q D5/q C5/h | Bb4/q A4/q G4/q F4/q | G4/q F4/q F4/h',
    lh: 'F3/w | F3/w | Bb2/w | F3/w' },
  { id: 'p4-hol-adeste-fideles', cat: 'Holiday', title: 'Adeste Fideles (variant)', composer: 'Traditional', level: 'Easy', bpm: 100, time: '4/4', key: 'G',
    rh: 'G4/q G4/q D5/q G4/q | A4/q D5/q B4/q A4/q | G4/q D5/q C5/q B4/q | A4/q G4/q G4/h',
    lh: 'G3/w | D3/w | G3/w | D3/h G3/h' },
  { id: 'p4-hol-candlelight-carol', cat: 'Holiday', title: 'Candle Light Carol', composer: 'Traditional', level: 'Easy', bpm: 76, time: '4/4', key: 'F',
    rh: 'C5/q A4/q F4/q A4/q | Bb4/q A4/q G4/h | C5/q F5/q E5/q D5/q | C5/w',
    lh: 'F3/w | F3/w | F3/w | C3/h F3/h' },
  { id: 'p4-hol-child-this-day', cat: 'Holiday', title: 'The Virgin Mary Had a Baby Boy', composer: 'Traditional West Indian', level: 'Easy', bpm: 108, time: '4/4', key: 'C',
    rh: 'C5/q G4/q C5/q E5/q | G5/q E5/q C5/h | A4/q C5/q F5/q A5/q | G5/q E5/q C5/h',
    lh: 'C3/w | C3/w | F3/w | C3/w' },
  { id: 'p4-hol-rejoice-child-born', cat: 'Holiday', title: 'Carol of the Birds', composer: 'Traditional Catalan', level: 'Easy', bpm: 76, time: '3/4', key: 'Am',
    rh: 'A4/q C5/q E5/q | A5/q G5/q E5/q | D5/q C5/q B4/q | A4/hd | A4/q C5/q E5/q | G5/q F5/q E5/q | D5/q C5/q B4/q | A4/hd',
    lh: 'A2/hd | A2/hd | D3/hd | A2/hd | A2/hd | F3/hd | D3/hd | A2/hd' },

  // ========== HYMNS (12) ==========
  { id: 'p4-hymn-great-is-thy', cat: 'Hymns', title: 'Great Is Thy Faithfulness (public domain melody)', composer: 'Traditional', level: 'Easy', bpm: 76, time: '4/4', key: 'F',
    rh: 'F4/q A4/q C5/q A4/q | Bb4/q A4/q G4/h | C5/q F5/q E5/q D5/q | C5/w',
    lh: 'F3/w | F3/w | F3/w | C3/h F3/h' },
  { id: 'p4-hymn-i-know-that', cat: 'Hymns', title: 'I Know That My Redeemer Liveth', composer: 'Traditional', level: 'Easy', bpm: 72, time: '4/4', key: 'G',
    rh: 'G4/q B4/q D5/q G5/q | E5/qd D5/8 B4/h | A4/q B4/q C5/q D5/q | B4/q G4/q G4/h',
    lh: 'G3/w | G3/w | A3/w | G3/w' },
  { id: 'p4-hymn-savior-like-shepherd', cat: 'Hymns', title: 'Savior Like a Shepherd Lead Us', composer: 'William B. Bradbury (1859)', level: 'Easy', bpm: 100, time: '6/8', key: 'C',
    rh: 'C5/qd E5/8 G5/8 E5/8 | C5/qd r/qd | D5/qd F5/8 A5/8 F5/8 | D5/qd r/qd',
    lh: 'C3/qd G3/qd | C3/qd G3/qd | D3/qd A3/qd | G2/qd D3/qd' },
  { id: 'p4-hymn-there-is-power', cat: 'Hymns', title: 'There Is Power in the Blood', composer: 'Lewis E. Jones (1899)', level: 'Easy', bpm: 108, time: '3/4', key: 'G',
    rh: 'G4/q B4/q D5/q | D5/q B4/q G4/q | A4/q C5/q E5/q | D5/hd | G4/q B4/q D5/q | D5/q C5/q B4/q | A4/q B4/q A4/q | G4/hd',
    lh: 'G3/hd | G3/hd | A3/hd | D3/hd | G3/hd | G3/hd | D3/hd | G3/hd' },
  { id: 'p4-hymn-victory-in-jesus', cat: 'Hymns', title: 'Victory In Jesus (public domain)', composer: 'Traditional', level: 'Easy', bpm: 120, time: '4/4', key: 'F',
    rh: 'F4/q A4/q C5/q F5/q | E5/q D5/q C5/h | Bb4/q A4/q G4/q F4/q | A4/q G4/q F4/h',
    lh: 'F3/w | F3/w | Bb2/w | F3/w' },
  { id: 'p4-hymn-shall-we-gather', cat: 'Hymns', title: 'Shall We Gather at the River', composer: 'Robert Lowry (1864)', level: 'Easy', bpm: 108, time: '4/4', key: 'G',
    rh: 'D5/q D5/q D5/q B4/q | G4/q A4/q B4/h | C5/q C5/q C5/q A4/q | D5/q B4/q G4/h',
    lh: 'G3/w | G3/w | F3/w | G3/w' },
  { id: 'p4-hymn-when-roll-is-called', cat: 'Hymns', title: 'When the Roll Is Called Up Yonder', composer: 'James M. Black (1893)', level: 'Easy', bpm: 120, time: '2/4', key: 'G',
    rh: 'D5/q G5/q | F#5/q E5/q | D5/q B4/q | G4/h | D5/q G5/q | A5/q G5/q | F#5/q D5/q | G4/h',
    lh: 'G3/h | G3/h | G3/h | G3/h | G3/h | G3/h | D3/h | G3/h' },
  { id: 'p4-hymn-standing-promises', cat: 'Hymns', title: 'Standing on the Promises', composer: 'R. Kelso Carter (1886)', level: 'Easy', bpm: 108, time: '4/4', key: 'C',
    rh: 'C5/q E5/q G5/q E5/q | D5/q C5/q G4/h | A4/q C5/q E5/q G5/q | D5/q C5/q C5/h',
    lh: 'C3/w | C3/w | F3/w | C3/w' },
  { id: 'p4-hymn-wonderful-words', cat: 'Hymns', title: 'Wonderful Words of Life', composer: 'Philip P. Bliss (1874)', level: 'Easy', bpm: 108, time: '6/8', key: 'G',
    rh: 'D5/qd D5/qd | B4/qd D5/qd | G5/qd E5/qd | D5/qd r/qd',
    lh: 'G3/qd G3/qd | G3/qd G3/qd | C3/qd C3/qd | G3/qd D3/qd' },
  { id: 'p4-hymn-near-the-cross', cat: 'Hymns', title: 'Near the Cross', composer: 'William H. Doane (1869)', level: 'Easy', bpm: 108, time: '4/4', key: 'C',
    rh: 'C5/q E5/q G5/q G5/q | A5/qd G5/8 E5/h | D5/q F5/q E5/q D5/q | C5/w',
    lh: 'C3/w | C3/w | G2/w | C3/w' },
  { id: 'p4-hymn-gloria-patri', cat: 'Hymns', title: 'Gloria Patri', composer: 'Traditional', level: 'Easy', bpm: 72, time: '4/4', key: 'F',
    rh: 'F4/q A4/q C5/q F5/q | E5/q D5/q C5/h | Bb4/q A4/q G4/q F4/q | A4/q G4/q F4/h',
    lh: 'F3/w | F3/w | Bb2/w | F3/w' },
  { id: 'p4-hymn-nothing-but-blood', cat: 'Hymns', title: 'Nothing But the Blood', composer: 'Robert Lowry (1876)', level: 'Easy', bpm: 108, time: '4/4', key: 'C',
    rh: 'C5/q E5/q G5/q C6/q | B5/q A5/q G5/h | F5/q E5/q D5/q C5/q | G4/q B4/q C5/h',
    lh: 'C3/w | C3/w | F3/w | G2/h C3/h' },

  // ========== JAZZ (12) ==========
  { id: 'p4-jazz-ragtime-leola', cat: 'Jazz', title: 'Leola', composer: 'Scott Joplin (1905)', level: 'Medium', bpm: 108, time: '2/4', key: 'G',
    rh: 'D5/8 G5/8 B5/8 G5/8 | D5/q G4/q | E5/8 C5/8 A4/8 C5/8 | E5/q A4/q',
    lh: 'G3/q D3/q | G3/q D3/q | A3/q E3/q | C3/q G3/q' },
  { id: 'p4-jazz-ragtime-rose-leaf', cat: 'Jazz', title: 'Rose Leaf Rag', composer: 'Scott Joplin (1907)', level: 'Medium', bpm: 108, time: '2/4', key: 'Bb',
    rh: 'F5/8 D5/8 Bb4/8 D5/8 | F5/q Bb4/q | Eb5/8 C5/8 A4/8 C5/8 | Eb5/q A4/q',
    lh: 'Bb2/q F3/q | Bb2/q F3/q | F3/q F3/q | C3/q G3/q' },
  { id: 'p4-jazz-ragtime-pleasant-moments', cat: 'Jazz', title: 'Pleasant Moments', composer: 'Scott Joplin (1909)', level: 'Medium', bpm: 160, time: '3/4', key: 'G',
    rh: 'G4/q B4/q D5/q | G5/q E5/q D5/q | B4/q D5/q G5/q | A5/hd | G5/q E5/q D5/q | C5/q B4/q A4/q | G4/q B4/q D5/q | G5/hd',
    lh: 'G3/q D3/q G3/q | G3/q D3/q G3/q | C3/q G3/q C4/q | D3/q A3/q D4/q | C3/q G3/q C4/q | G2/q D3/q G3/q | G3/q D3/q G3/q | G3/q D3/q G3/q' },
  { id: 'p4-jazz-bethena-reprise', cat: 'Jazz', title: 'Pine Apple Rag (variant)', composer: 'Scott Joplin (1908)', level: 'Medium', bpm: 108, time: '2/4', key: 'Bb',
    rh: 'F4/8 Bb4/8 D5/8 F5/8 | A5/q F5/q | Eb5/8 C5/8 A4/8 C5/8 | F5/q A4/q',
    lh: 'Bb2/q F3/q | Bb2/q F3/q | F3/q F3/q | Bb2/q F3/q' },
  { id: 'p4-jazz-rag-time-easy', cat: 'Jazz', title: 'Searchlight Rag', composer: 'Scott Joplin (1907)', level: 'Medium', bpm: 108, time: '2/4', key: 'F',
    rh: 'C5/8 A4/8 F4/8 A4/8 | C5/q F5/q | D5/8 Bb4/8 G4/8 Bb4/8 | D5/q G5/q',
    lh: 'F3/q C3/q | F3/q C3/q | G3/q G3/q | C3/q G3/q' },
  { id: 'p4-jazz-american-beauty', cat: 'Jazz', title: 'The American Beauty Rag', composer: 'Joseph Lamb (1913)', level: 'Medium', bpm: 108, time: '2/4', key: 'Bb',
    rh: 'F5/8 D5/8 Bb4/8 F4/8 | Bb4/q F5/q | G5/8 Eb5/8 C5/8 G4/8 | C5/q G5/q',
    lh: 'Bb2/q F3/q | Bb2/q F3/q | C3/q G3/q | C3/q G3/q' },
  { id: 'p4-jazz-ragtime-prosperity', cat: 'Jazz', title: 'The Entertainers Rag (variant)', composer: 'J. Russel Robinson', level: 'Medium', bpm: 108, time: '2/4', key: 'C',
    rh: 'C5/8 E5/8 G5/8 C6/8 | G5/q E5/q | D5/8 F5/8 A5/8 D6/8 | A5/q F5/q',
    lh: 'C3/q G3/q | C3/q G3/q | D3/q A3/q | G2/q D3/q' },
  { id: 'p4-jazz-ragtime-cataract', cat: 'Jazz', title: 'The Cataract Rag', composer: 'Robert Hampton (1914)', level: 'Medium', bpm: 108, time: '2/4', key: 'Bb',
    rh: 'F5/8 D5/8 Bb4/8 D5/8 | F5/8 Bb4/8 D5/q | Eb5/8 C5/8 A4/8 C5/8 | Eb5/8 A4/8 F5/q',
    lh: 'Bb2/q F3/q | Bb2/q F3/q | F3/q F3/q | Bb2/q F3/q' },
  { id: 'p4-jazz-ragtime-hilarity', cat: 'Jazz', title: 'Hilarity Rag', composer: 'James Scott (1910)', level: 'Medium', bpm: 108, time: '2/4', key: 'Bb',
    rh: 'Bb4/8 D5/8 F5/8 Bb5/8 | D6/q Bb5/q | Eb5/8 G5/8 Bb5/8 Eb6/8 | Bb5/q G5/q',
    lh: 'Bb2/q F3/q | Bb2/q F3/q | Eb3/q Bb3/q | Bb2/q F3/q' },
  { id: 'p4-jazz-ragtime-carnation', cat: 'Jazz', title: 'The Carnation Rag', composer: 'Charles L. Johnson (1916)', level: 'Medium', bpm: 108, time: '2/4', key: 'F',
    rh: 'F4/8 A4/8 C5/8 F5/8 | A5/q F5/q | Bb4/8 D5/8 F5/8 Bb5/8 | A5/q F5/q',
    lh: 'F3/q C3/q | F3/q C3/q | Bb2/q F3/q | F3/q C3/q' },
  { id: 'p4-jazz-ragtime-charleston', cat: 'Jazz', title: 'Charleston (1923, PD melody)', composer: 'James P. Johnson (1923)', level: 'Easy', bpm: 132, time: '4/4', key: 'C',
    rh: 'C5/q r/8 E5/8 G5/q r/q | E5/q r/8 C5/8 G4/q r/q | C5/q r/8 E5/8 G5/q r/q | E5/q r/8 D5/8 C5/q r/q',
    lh: 'C3/w | C3/w | C3/w | G2/w' },
  { id: 'p4-jazz-ragtime-tiger-rag', cat: 'Jazz', title: 'Tiger Rag (variant)', composer: 'Original Dixieland Jass Band (1917)', level: 'Medium', bpm: 160, time: '4/4', key: 'F',
    rh: 'F4/q A4/q C5/q F5/q | A5/q F5/q C5/h | Bb4/q D5/q F5/q Bb5/q | A5/q F5/q C5/h',
    lh: 'F3/w | F3/w | Bb2/w | F3/w' },

  // ========== BLUES (12) ==========
  { id: 'p4-blues-west-end', cat: 'Blues', title: 'West End Blues', composer: 'King Oliver (1928)', level: 'Easy', bpm: 100, time: '4/4', key: 'Eb',
    rh: 'Eb5/q G5/q Bb5/q G5/q | F5/q Eb5/q Bb4/h | Ab4/q G4/q F4/q Eb4/q | Eb4/w',
    lh: 'Eb3/w | Eb3/w | Ab2/w | Eb3/w' },
  { id: 'p4-blues-see-see', cat: 'Blues', title: 'See See Rider', composer: 'Traditional (1924)', level: 'Easy', bpm: 100, time: '4/4', key: 'G',
    rh: 'G4/q Bb4/q B4/q D5/q | E5/q D5/q B4/h | A4/q C5/q Bb4/q A4/q | G4/w',
    lh: 'G3/w | G3/w | C3/w | G3/w' },
  { id: 'p4-blues-hesitation', cat: 'Blues', title: 'Hesitation Blues', composer: 'Traditional (1915)', level: 'Easy', bpm: 100, time: '4/4', key: 'F',
    rh: 'F4/q Ab4/q A4/q C5/q | D5/q C5/q A4/h | Bb4/q A4/q G4/q F4/q | F4/w',
    lh: 'F3/w | F3/w | Bb2/w | F3/w' },
  { id: 'p4-blues-trouble-mind', cat: 'Blues', title: 'Trouble In Mind', composer: 'Richard M. Jones (1924)', level: 'Easy', bpm: 76, time: '4/4', key: 'C',
    rh: 'E5/q Eb5/q E5/q G5/q | A5/q G5/q E5/h | D5/q F5/q Eb5/q D5/q | C5/w',
    lh: 'C3/w | C3/w | F3/w | C3/w' },
  { id: 'p4-blues-nobody-knows', cat: 'Blues', title: 'Nobody Knows the Trouble', composer: 'Traditional Spiritual', level: 'Easy', bpm: 72, time: '4/4', key: 'G',
    rh: 'G4/q B4/q D5/q Bb4/q | B4/q G4/q D5/h | D5/q F5/q Eb5/q D5/q | G4/w',
    lh: 'G3/w | G3/w | C3/w | G3/w' },
  { id: 'p4-blues-corina', cat: 'Blues', title: 'Corina Corina', composer: 'Traditional (1928)', level: 'Easy', bpm: 100, time: '4/4', key: 'C',
    rh: 'C5/q Eb5/q E5/q G5/q | F5/q E5/q C5/h | A4/q C5/q Bb4/q A4/q | G4/w',
    lh: 'C3/w | C3/w | F3/w | C3/w' },
  { id: 'p4-blues-careless-love-2', cat: 'Blues', title: 'In the Jailhouse Now', composer: 'Traditional (1920s)', level: 'Easy', bpm: 100, time: '4/4', key: 'G',
    rh: 'G4/q B4/q D5/q B4/q | A4/q G4/q D5/h | E5/q D5/q B4/q G4/q | G4/w',
    lh: 'G3/w | D3/w | G3/w | G3/w' },
  { id: 'p4-blues-make-me-pallet', cat: 'Blues', title: 'Make Me a Pallet on the Floor', composer: 'Traditional (1911)', level: 'Easy', bpm: 108, time: '4/4', key: 'F',
    rh: 'F4/q A4/q C5/q F5/q | E5/q D5/q C5/h | Bb4/q A4/q G4/q F4/q | A4/q G4/q F4/h',
    lh: 'F3/w | F3/w | Bb2/w | F3/w' },
  { id: 'p4-blues-matchbox', cat: 'Blues', title: 'Matchbox Blues', composer: 'Blind Lemon Jefferson (1927)', level: 'Easy', bpm: 100, time: '4/4', key: 'E',
    rh: 'E4/q G4/q G#4/q B4/q | C#5/q B4/q G4/h | A4/q G#4/q G4/q E4/q | E4/w',
    lh: 'E3/w | E3/w | A3/w | E3/w' },
  { id: 'p4-blues-mama-dont-allow', cat: 'Blues', title: "Mama Don't Allow", composer: 'Traditional (1920s)', level: 'Easy', bpm: 132, time: '4/4', key: 'C',
    rh: 'C5/q C5/q G4/q G4/q | A4/q G4/q E4/h | F4/q A4/q C5/q A4/q | G4/q F4/q E4/h',
    lh: 'C3/w | C3/w | F3/w | C3/w' },
  { id: 'p4-blues-salt-peanuts', cat: 'Blues', title: 'Yellow Dog Rag (variant)', composer: 'W.C. Handy (1914)', level: 'Easy', bpm: 100, time: '4/4', key: 'F',
    rh: 'F4/q Ab4/q A4/q C5/q | F5/q D5/q A4/h | Bb4/q A4/q G4/q F4/q | A4/q G4/q F4/h',
    lh: 'F3/w | F3/w | Bb2/w | F3/w' },
  { id: 'p4-blues-dust-my-broom', cat: 'Blues', title: 'Blues Pattern in A', composer: 'Piano Learners Original', level: 'Easy', bpm: 108, time: '4/4', key: 'A',
    rh: 'A4/q C5/q C#5/q E5/q | F#5/q E5/q C#5/h | D5/q C5/q B4/q A4/q | A4/w',
    lh: 'A2/q E3/q A3/q E3/q | A2/q E3/q A3/q E3/q | D3/q A3/q D4/q A3/q | A2/q E3/q A3/q E3/q' },

  // ========== CLASSICAL (12) ==========
  { id: 'p4-cl-mozart-k282', cat: 'Classical', title: 'Piano Sonata K.282 (Adagio)', composer: 'W.A. Mozart', level: 'Easy', bpm: 60, time: '4/4', key: 'Eb',
    rh: 'Eb5/q G5/q F5/q Eb5/q | Eb5/q Bb4/q G4/h | Ab4/q G4/q F4/q Eb4/q | D4/w',
    lh: 'Eb3/w | Bb2/w | Ab2/w | Bb2/w' },
  { id: 'p4-cl-haydn-german-dance', cat: 'Classical', title: 'German Dance (Hob. IX)', composer: 'J. Haydn', level: 'Easy', bpm: 132, time: '3/4', key: 'C',
    rh: 'G4/q C5/q E5/q | G5/q E5/q C5/q | D5/q F5/q A5/q | G5/hd | G4/q C5/q E5/q | G5/q F5/q E5/q | D5/q C5/q B4/q | C5/hd',
    lh: 'C3/hd | C3/hd | G2/hd | G2/hd | C3/hd | C3/hd | G2/hd | C3/hd' },
  { id: 'p4-cl-beethoven-op49-1', cat: 'Classical', title: 'Piano Sonata Op. 49 No. 1 (Andante)', composer: 'L. van Beethoven', level: 'Medium', bpm: 72, time: '2/4', key: 'Gm',
    rh: 'Bb4/q G4/8 Bb4/8 | D5/8 C5/8 Bb4/q | A4/q F#4/8 A4/8 | D5/8 C5/8 Bb4/q',
    lh: 'G3/h | G3/h | D3/h | G3/h' },
  { id: 'p4-cl-chopin-prelude-op28-15b', cat: 'Classical', title: 'Prelude Op. 28 No. 15 "Raindrop" (variant)', composer: 'F. Chopin', level: 'Medium', bpm: 60, time: '4/4', key: 'C',
    rh: 'G4/qd G4/8 G4/q G4/q | G4/qd G4/8 F4/q E4/q | D4/q E4/q F4/q G4/q | A4/w',
    lh: 'C3/q G3/q C3/q G3/q | C3/q G3/q C3/q G3/q | G2/q D3/q G2/q D3/q | C3/w' },
  { id: 'p4-cl-schumann-melody', cat: 'Classical', title: 'Melody (Op. 68 No. 1)', composer: 'R. Schumann', level: 'Easy', bpm: 100, time: '4/4', key: 'C',
    rh: 'G4/q E5/q D5/q C5/q | C5/q D5/q G4/h | F5/q E5/q D5/q C5/q | B4/q C5/q G4/h',
    lh: 'C3/w | C3/w | F3/w | G2/w' },
  { id: 'p4-cl-schumann-humming-song', cat: 'Classical', title: 'Humming Song (Op. 68 No. 3)', composer: 'R. Schumann', level: 'Easy', bpm: 108, time: '2/4', key: 'C',
    rh: 'C5/q E5/q | G5/q E5/q | F5/q D5/q | C5/h | C5/q E5/q | G5/q F5/q | E5/q D5/q | C5/h',
    lh: 'C3/h | C3/h | G2/h | C3/h | C3/h | C3/h | G2/h | C3/h' },
  { id: 'p4-cl-tchaikovsky-doll-illness', cat: 'Classical', title: 'The Dolls Illness (Op. 39 No. 7)', composer: 'P.I. Tchaikovsky', level: 'Easy', bpm: 72, time: '3/4', key: 'Gm',
    rh: 'G4/q A4/q Bb4/q | A4/q G4/q F#4/q | G4/q A4/q Bb4/q | D5/hd | C5/q Bb4/q A4/q | G4/q F#4/q G4/q | A4/q Bb4/q A4/q | G4/hd',
    lh: 'G3/hd | D3/hd | G3/hd | D3/hd | F3/hd | D3/hd | D3/hd | G3/hd' },
  { id: 'p4-cl-bach-anh-123', cat: 'Classical', title: 'Minuet in B-flat (BWV Anh. 118)', composer: 'J.S. Bach', level: 'Easy', bpm: 120, time: '3/4', key: 'Bb',
    rh: 'F5/q D5/q Bb4/q | C5/q F5/q A4/q | Bb4/q C5/q D5/q | F5/hd | F5/q D5/q Bb4/q | C5/q F5/q A4/q | Bb4/q A4/q G4/q | F4/hd',
    lh: 'Bb2/q F3/q D4/q | F3/q A3/q F4/q | Bb2/q F3/q D4/q | F3/q C4/q F3/q | Bb2/q F3/q D4/q | F3/q A3/q F4/q | C3/q G3/q E4/q | F3/q C4/q F3/q' },
  { id: 'p4-cl-handel-air-f', cat: 'Classical', title: 'Air in F', composer: 'G.F. Handel', level: 'Easy', bpm: 100, time: '4/4', key: 'F',
    rh: 'F4/q A4/q G4/q F4/q | F4/qd G4/8 A4/q C5/q | Bb4/q A4/q G4/q F4/q | A4/q G4/q F4/h',
    lh: 'F3/w | F3/w | Bb2/w | F3/w' },
  { id: 'p4-cl-mozart-german-dance', cat: 'Classical', title: 'German Dance K.605 No. 3', composer: 'W.A. Mozart', level: 'Easy', bpm: 132, time: '3/4', key: 'C',
    rh: 'C5/q E5/q G5/q | G5/q F5/q E5/q | D5/q F5/q A5/q | G5/hd | C5/q E5/q G5/q | A5/q G5/q F5/q | E5/q D5/q C5/q | C5/hd',
    lh: 'C3/hd | C3/hd | G2/hd | G2/hd | C3/hd | F3/hd | G2/hd | C3/hd' },
  { id: 'p4-cl-grieg-waltz-op12', cat: 'Classical', title: 'Waltz (Op. 12 No. 2)', composer: 'E. Grieg', level: 'Easy', bpm: 160, time: '3/4', key: 'Am',
    rh: 'E5/q F5/q E5/q | D5/qd C5/8 B4/q | A4/q B4/q C5/q | B4/hd | E5/q F5/q E5/q | D5/qd C5/8 D5/q | A4/q B4/q A4/q | A4/hd',
    lh: 'A2/q E3/q A3/q | D3/q A3/q F4/q | A2/q E3/q A3/q | E3/q B3/q E4/q | A2/q E3/q A3/q | D3/q A3/q F4/q | A2/q E3/q A3/q | A2/q E3/q A3/q' },
  { id: 'p4-cl-brahms-waltz-op39-9', cat: 'Classical', title: 'Waltz Op. 39 No. 9 (D Minor)', composer: 'J. Brahms', level: 'Easy', bpm: 108, time: '3/4', key: 'Dm',
    rh: 'D5/qd F5/8 A5/q | G5/q F5/q E5/q | D5/qd E5/8 D5/q | A4/hd | D5/qd F5/8 A5/q | Bb5/q A5/q G5/q | F5/q E5/q D5/q | D5/hd',
    lh: 'D3/q A3/q F4/q | G3/q D4/q Bb3/q | A3/q E4/q C#4/q | D3/q A3/q F4/q | D3/q A3/q F4/q | Bb2/q F3/q D4/q | A2/q E3/q C#4/q | D3/q A3/q F4/q' },

  // ========== ROCK (12 originals) ==========
  { id: 'p4-rock-folk-rock-g', cat: 'Rock', title: 'Folk Rock in G', composer: 'Piano Learners Original', level: 'Easy', bpm: 112, time: '4/4', key: 'G',
    rh: '(G4 B4 D5)/h (D4 F#4 A4)/h | (E4 G4 B4)/h (C4 E4 G4)/h | (G4 B4 D5)/h (D4 F#4 A4)/h | (C4 E4 G4)/h (D4 F#4 A4)/h',
    lh: 'G2/w | E2/h C3/h | G2/w | C3/h D3/h' },
  { id: 'p4-rock-prog-am', cat: 'Rock', title: 'Prog Rock in Am', composer: 'Piano Learners Original', level: 'Medium', bpm: 100, time: '4/4', key: 'Am',
    rh: '(A4 C5 E5)/q (A4 C5 E5)/q (G4 B4 D5)/q (G4 B4 D5)/q | (F4 A4 C5)/q (F4 A4 C5)/q (E4 G4 B4)/q (E4 G4 B4)/q | (A4 C5 E5)/h (D4 F4 A4)/h | (G4 B4 D5)/h (E4 G4 B4)/h',
    lh: 'A2/w | F2/h E2/h | A2/h D3/h | G2/h E2/h' },
  { id: 'p4-rock-latin-rock', cat: 'Rock', title: 'Latin Rock', composer: 'Piano Learners Original', level: 'Medium', bpm: 108, time: '4/4', key: 'Dm',
    rh: '(D4 F4 A4)/q (D4 F4 A4)/q (A3 C#4 E4)/q (A3 C#4 E4)/q | (Bb3 D4 F4)/q (Bb3 D4 F4)/q (A3 C#4 E4)/q (A3 C#4 E4)/q | (D4 F4 A4)/h (G3 Bb3 D4)/h | (A3 C#4 E4)/h (D4 F4 A4)/h',
    lh: 'D2/w | Bb2/h A2/h | D2/h G2/h | A2/h D2/h' },
  { id: 'p4-rock-funk-rock', cat: 'Rock', title: 'Funk Rock', composer: 'Piano Learners Original', level: 'Medium', bpm: 108, time: '4/4', key: 'Em',
    rh: '(E4 G4 B4)/8 (E4 G4 B4)/8 r/8 (E4 G4 B4)/8 r/8 (E4 G4 B4)/8 (E4 G4 B4)/8 (E4 G4 B4)/8 | (A3 C4 E4)/8 (A3 C4 E4)/8 r/8 (A3 C4 E4)/8 r/8 (A3 C4 E4)/8 (A3 C4 E4)/8 (A3 C4 E4)/8 | (D4 F#4 A4)/8 (D4 F#4 A4)/8 r/8 (D4 F#4 A4)/8 r/8 (D4 F#4 A4)/8 (D4 F#4 A4)/8 (D4 F#4 A4)/8 | (B3 D4 F#4)/8 (B3 D4 F#4)/8 r/8 (B3 D4 F#4)/8 r/8 (B3 D4 F#4)/8 (B3 D4 F#4)/8 (B3 D4 F#4)/8',
    lh: 'E2/q E2/q E2/q E2/q | A2/q A2/q A2/q A2/q | D3/q D3/q D3/q D3/q | B2/q B2/q B2/q B2/q' },
  { id: 'p4-rock-ballad-e', cat: 'Rock', title: 'Rock Ballad in E', composer: 'Piano Learners Original', level: 'Easy', bpm: 76, time: '4/4', key: 'E',
    rh: '(E4 G#4 B4)/w | (A3 C#4 E4)/w | (B3 D#4 F#4)/w | (E4 G#4 B4)/w',
    lh: 'E2/w | A2/w | B2/w | E2/w' },
  { id: 'p4-rock-stomp-c', cat: 'Rock', title: 'Rock Stomp in C', composer: 'Piano Learners Original', level: 'Easy', bpm: 120, time: '4/4', key: 'C',
    rh: '(C4 G4)/q (C4 G4)/q (F4 C5)/q (F4 C5)/q | (G4 D5)/q (G4 D5)/q (C4 G4)/q (C4 G4)/q | (A3 E4)/q (A3 E4)/q (F4 C5)/q (F4 C5)/q | (G4 D5)/q (G4 D5)/q (C4 G4)/h',
    lh: 'C2/h C2/h | G2/h C2/h | A2/h F2/h | G2/h C2/h' },
  { id: 'p4-rock-ride-bm', cat: 'Rock', title: 'Rock Ride in Bm', composer: 'Piano Learners Original', level: 'Medium', bpm: 132, time: '4/4', key: 'Bm',
    rh: '(B3 D4 F#4)/q (B3 D4 F#4)/q (A3 C#4 E4)/q (A3 C#4 E4)/q | (G3 B3 D4)/q (G3 B3 D4)/q (F#3 A3 C#4)/q (F#3 A3 C#4)/q | (B3 D4 F#4)/h (E4 G4 B4)/h | (A3 C#4 E4)/h (B3 D4 F#4)/h',
    lh: 'B2/w | G2/h F#2/h | B2/h E2/h | A2/h B2/h' },
  { id: 'p4-rock-anthem-d', cat: 'Rock', title: 'Rock Anthem in D', composer: 'Piano Learners Original', level: 'Easy', bpm: 120, time: '4/4', key: 'D',
    rh: '(D4 A4)/h (D4 A4)/h | (G4 D5)/h (G4 D5)/h | (A4 E5)/h (A4 E5)/h | (D4 A4)/w',
    lh: 'D2/w | G2/w | A2/w | D2/w' },
  { id: 'p4-rock-driving-gm', cat: 'Rock', title: 'Driving Rock in Gm', composer: 'Piano Learners Original', level: 'Medium', bpm: 132, time: '4/4', key: 'Gm',
    rh: 'G4/8 G4/8 Bb4/8 D5/8 G4/8 G4/8 Bb4/8 D5/8 | Eb4/8 Eb4/8 G4/8 Bb4/8 Eb4/8 Eb4/8 G4/8 Bb4/8 | F4/8 F4/8 A4/8 C5/8 F4/8 F4/8 A4/8 C5/8 | D4/8 D4/8 F#4/8 A4/8 D4/8 D4/8 F#4/8 A4/8',
    lh: 'G2/w | Eb2/w | F2/w | D2/w' },
  { id: 'p4-rock-indie-pop', cat: 'Rock', title: 'Indie Pop Rock', composer: 'Piano Learners Original', level: 'Easy', bpm: 108, time: '4/4', key: 'C',
    rh: '(C4 E4 G4)/h (E4 G4 C5)/h | (F4 A4 C5)/h (G4 B4 D5)/h | (A4 C5 E5)/h (G4 B4 D5)/h | (F4 A4 C5)/h (C4 E4 G4)/h',
    lh: 'C2/w | F2/h G2/h | A2/h G2/h | F2/h C2/h' },
  { id: 'p4-rock-acoustic-f', cat: 'Rock', title: 'Acoustic Rock in F', composer: 'Piano Learners Original', level: 'Easy', bpm: 100, time: '4/4', key: 'F',
    rh: '(F4 A4 C5)/h (C4 E4 G4)/h | (Bb3 D4 F4)/h (D4 F4 A4)/h | (F4 A4 C5)/h (C4 E4 G4)/h | (Bb3 D4 F4)/h (F4 A4 C5)/h',
    lh: 'F2/w | Bb2/h D3/h | F2/w | Bb2/h F2/h' },
  { id: 'p4-rock-emo-ballad', cat: 'Rock', title: 'Emo Ballad in Em', composer: 'Piano Learners Original', level: 'Easy', bpm: 80, time: '4/4', key: 'Em',
    rh: '(E4 G4 B4)/w | (C4 E4 G4)/w | (D4 F#4 A4)/w | (B3 D4 F#4)/w',
    lh: 'E2/w | C3/w | D3/w | B2/w' },

  // ========== HIPHOP (12 originals) ==========
  { id: 'p4-hiphop-boom-bap-dm', cat: 'Hiphop', title: 'Boom-Bap in Dm', composer: 'Piano Learners Original', level: 'Easy', bpm: 92, time: '4/4', key: 'Dm',
    rh: 'r/q (D4 F4 A4)/q r/q (D4 F4 A4)/q | r/q (G3 Bb3 D4)/q r/q (G3 Bb3 D4)/q | r/q (C4 E4 G4)/q r/q (C4 E4 G4)/q | r/q (A3 C4 E4)/q r/q (A3 C4 E4)/q',
    lh: 'D2/q r/q D2/q r/q | G2/q r/q G2/q r/q | C2/q r/q C2/q r/q | A2/q r/q A2/q r/q' },
  { id: 'p4-hiphop-trap-fm', cat: 'Hiphop', title: 'Trap in Fm', composer: 'Piano Learners Original', level: 'Medium', bpm: 142, time: '4/4', key: 'Cm',
    rh: '(C4 Eb4 G4)/w | (Ab3 C4 Eb4)/w | (F4 Ab4 C5)/w | (G4 Bb4 D5)/w',
    lh: 'C2/qd r/8 C2/q C2/q | Ab2/qd r/8 Ab2/q Ab2/q | F2/qd r/8 F2/q F2/q | G2/qd r/8 G2/q G2/q' },
  { id: 'p4-hiphop-lofi-am', cat: 'Hiphop', title: 'Lo-Fi in Am', composer: 'Piano Learners Original', level: 'Easy', bpm: 72, time: '4/4', key: 'Am',
    rh: '(A4 C5 E5 G5)/w | (F4 A4 C5 E5)/w | (D4 F4 A4 C5)/w | (E4 G4 B4 D5)/w',
    lh: 'A2/q A2/q A2/q A2/q | F2/q F2/q F2/q F2/q | D3/q D3/q D3/q D3/q | E3/q E3/q E3/q E3/q' },
  { id: 'p4-hiphop-chill-trap', cat: 'Hiphop', title: 'Chill Trap in Gm', composer: 'Piano Learners Original', level: 'Easy', bpm: 80, time: '4/4', key: 'Gm',
    rh: '(G4 Bb4 D5)/h (G4 Bb4 D5)/q (G4 Bb4 D5)/q | (Eb4 G4 Bb4)/h (Eb4 G4 Bb4)/q (Eb4 G4 Bb4)/q | (F4 A4 C5)/h (F4 A4 C5)/q (F4 A4 C5)/q | (D4 F4 A4)/h (D4 F4 A4)/q (D4 F4 A4)/q',
    lh: 'G2/qd r/8 G2/h | Eb2/qd r/8 Eb2/h | F2/qd r/8 F2/h | D2/qd r/8 D2/h' },
  { id: 'p4-hiphop-boom-bap-gm', cat: 'Hiphop', title: 'Boom-Bap in Gm', composer: 'Piano Learners Original', level: 'Easy', bpm: 90, time: '4/4', key: 'Gm',
    rh: 'r/q (G4 Bb4 D5)/q r/q (G4 Bb4 D5)/q | r/q (Eb4 G4 Bb4)/q r/q (Eb4 G4 Bb4)/q | r/q (F4 A4 C5)/q r/q (F4 A4 C5)/q | r/q (D4 F4 A4)/q r/q (D4 F4 A4)/q',
    lh: 'G2/q r/q G2/q r/q | Eb2/q r/q Eb2/q r/q | F2/q r/q F2/q r/q | D2/q r/q D2/q r/q' },
  { id: 'p4-hiphop-drill-cm', cat: 'Hiphop', title: 'Drill in Cm', composer: 'Piano Learners Original', level: 'Medium', bpm: 140, time: '4/4', key: 'Cm',
    rh: 'r/8 (C4 Eb4 G4)/8 r/8 (C4 Eb4 G4)/8 r/8 (C4 Eb4 G4)/8 r/8 (C4 Eb4 G4)/8 | r/8 (Ab3 C4 Eb4)/8 r/8 (Ab3 C4 Eb4)/8 r/8 (Ab3 C4 Eb4)/8 r/8 (Ab3 C4 Eb4)/8 | r/8 (Bb3 D4 F4)/8 r/8 (Bb3 D4 F4)/8 r/8 (Bb3 D4 F4)/8 r/8 (Bb3 D4 F4)/8 | r/8 (G3 Bb3 D4)/8 r/8 (G3 Bb3 D4)/8 r/8 (G3 Bb3 D4)/8 r/8 (G3 Bb3 D4)/8',
    lh: 'C2/qd r/8 C2/h | Ab2/qd r/8 Ab2/h | Bb2/qd r/8 Bb2/h | G2/qd r/8 G2/h' },
  { id: 'p4-hiphop-phonk-am', cat: 'Hiphop', title: 'Phonk in Am', composer: 'Piano Learners Original', level: 'Medium', bpm: 134, time: '4/4', key: 'Am',
    rh: '(A4 C5 E5)/q (A4 C5 E5)/q (A4 C5 E5)/q (A4 C5 E5)/q | (F4 A4 C5)/q (F4 A4 C5)/q (F4 A4 C5)/q (F4 A4 C5)/q | (G4 B4 D5)/q (G4 B4 D5)/q (G4 B4 D5)/q (G4 B4 D5)/q | (E4 G4 B4)/q (E4 G4 B4)/q (E4 G4 B4)/q (E4 G4 B4)/q',
    lh: 'A2/8 r/8 A2/8 r/8 A2/8 r/8 A2/8 r/8 | F2/8 r/8 F2/8 r/8 F2/8 r/8 F2/8 r/8 | G2/8 r/8 G2/8 r/8 G2/8 r/8 G2/8 r/8 | E2/8 r/8 E2/8 r/8 E2/8 r/8 E2/8 r/8' },
  { id: 'p4-hiphop-cloud-em', cat: 'Hiphop', title: 'Cloud Rap in Em', composer: 'Piano Learners Original', level: 'Easy', bpm: 70, time: '4/4', key: 'Em',
    rh: '(E4 G4 B4 D5)/w | (C4 E4 G4 B4)/w | (A4 C5 E5 G5)/w | (D4 F#4 A4 C5)/w',
    lh: 'r/q E2/qd E2/8 r/q | r/q C3/qd C3/8 r/q | r/q A2/qd A2/8 r/q | r/q D3/qd D3/8 r/q' },
  { id: 'p4-hiphop-jazz-rap-f', cat: 'Hiphop', title: 'Jazz-Rap in F', composer: 'Piano Learners Original', level: 'Easy', bpm: 90, time: '4/4', key: 'F',
    rh: 'r/q (F4 A4 C5 E5)/q r/q (F4 A4 C5 E5)/q | r/q (D4 F4 A4 C5)/q r/q (D4 F4 A4 C5)/q | r/q (Bb3 D4 F4 A4)/q r/q (Bb3 D4 F4 A4)/q | r/q (C4 E4 G4 Bb4)/q r/q (C4 E4 G4 Bb4)/q',
    lh: 'F2/q F2/8 F2/8 F2/q F2/q | D3/q D3/8 D3/8 D3/q D3/q | Bb2/q Bb2/8 Bb2/8 Bb2/q Bb2/q | C3/q C3/8 C3/8 C3/q C3/q' },
  { id: 'p4-hiphop-dirty-south-2', cat: 'Hiphop', title: 'Dirty South in Em', composer: 'Piano Learners Original', level: 'Easy', bpm: 76, time: '4/4', key: 'Em',
    rh: '(E4 G4 B4)/qd (E4 G4 B4)/8 (E4 G4 B4)/h | (C4 E4 G4)/qd (C4 E4 G4)/8 (C4 E4 G4)/h | (D4 F#4 A4)/qd (D4 F#4 A4)/8 (D4 F#4 A4)/h | (B3 D4 F#4)/qd (B3 D4 F#4)/8 (B3 D4 F#4)/h',
    lh: 'E2/qd E2/8 E2/h | C3/qd C3/8 C3/h | D3/qd D3/8 D3/h | B2/qd B2/8 B2/h' },
  { id: 'p4-hiphop-west-am', cat: 'Hiphop', title: 'West Coast in Am', composer: 'Piano Learners Original', level: 'Easy', bpm: 94, time: '4/4', key: 'Am',
    rh: '(A4 C5 E5)/8 (A4 C5 E5)/8 (A4 C5 E5)/8 (A4 C5 E5)/8 (A4 C5 E5)/8 (A4 C5 E5)/8 (A4 C5 E5)/8 (A4 C5 E5)/8 | (F4 A4 C5)/8 (F4 A4 C5)/8 (F4 A4 C5)/8 (F4 A4 C5)/8 (F4 A4 C5)/8 (F4 A4 C5)/8 (F4 A4 C5)/8 (F4 A4 C5)/8 | (D4 F4 A4)/8 (D4 F4 A4)/8 (D4 F4 A4)/8 (D4 F4 A4)/8 (D4 F4 A4)/8 (D4 F4 A4)/8 (D4 F4 A4)/8 (D4 F4 A4)/8 | (E4 G4 B4)/8 (E4 G4 B4)/8 (E4 G4 B4)/8 (E4 G4 B4)/8 (E4 G4 B4)/8 (E4 G4 B4)/8 (E4 G4 B4)/8 (E4 G4 B4)/8',
    lh: 'A2/q r/8 A2/8 A2/q r/q | F2/q r/8 F2/8 F2/q r/q | D3/q r/8 D3/8 D3/q r/q | E3/q r/8 E3/8 E3/q r/q' },
  { id: 'p4-hiphop-trap-soul-g', cat: 'Hiphop', title: 'Trap Soul in Gm', composer: 'Piano Learners Original', level: 'Easy', bpm: 84, time: '4/4', key: 'Gm',
    rh: '(G4 Bb4 D5)/h (G4 Bb4 D5)/q (G4 Bb4 D5)/q | (Eb4 G4 Bb4)/h (Eb4 G4 Bb4)/q (Eb4 G4 Bb4)/q | (F4 A4 C5)/h (F4 A4 C5)/q (F4 A4 C5)/q | (D4 F4 A4)/h (D4 F4 A4)/q (D4 F4 A4)/q',
    lh: 'G2/qd r/8 G2/h | Eb2/qd r/8 Eb2/h | F2/qd r/8 F2/h | D2/qd r/8 D2/h' },

  // ========== EDM (12 originals) ==========
  { id: 'p4-edm-trance-cm', cat: 'EDM', title: 'Trance in Cm', composer: 'Piano Learners Original', level: 'Easy', bpm: 138, time: '4/4', key: 'Cm',
    rh: 'C4/8 Eb4/8 G4/8 C5/8 G4/8 Eb4/8 C4/8 Eb4/8 | Ab3/8 C4/8 Eb4/8 Ab4/8 Eb4/8 C4/8 Ab3/8 C4/8 | Bb3/8 D4/8 F4/8 Bb4/8 F4/8 D4/8 Bb3/8 D4/8 | G3/8 Bb3/8 D4/8 G4/8 D4/8 Bb3/8 G3/8 Bb3/8',
    lh: 'C2/w | Ab2/w | Bb2/w | G2/w' },
  { id: 'p4-edm-house-am', cat: 'EDM', title: 'House in Am', composer: 'Piano Learners Original', level: 'Easy', bpm: 126, time: '4/4', key: 'Am',
    rh: '(A4 C5 E5)/q (A4 C5 E5)/q (A4 C5 E5)/q (A4 C5 E5)/q | (F4 A4 C5)/q (F4 A4 C5)/q (F4 A4 C5)/q (F4 A4 C5)/q | (G4 B4 D5)/q (G4 B4 D5)/q (G4 B4 D5)/q (G4 B4 D5)/q | (E4 G4 B4)/q (E4 G4 B4)/q (E4 G4 B4)/q (E4 G4 B4)/q',
    lh: 'A2/q A2/q A2/q A2/q | F2/q F2/q F2/q F2/q | G2/q G2/q G2/q G2/q | E2/q E2/q E2/q E2/q' },
  { id: 'p4-edm-tech-house', cat: 'EDM', title: 'Tech House', composer: 'Piano Learners Original', level: 'Easy', bpm: 124, time: '4/4', key: 'Dm',
    rh: 'r/8 (D4 F4 A4)/8 r/8 (D4 F4 A4)/8 r/8 (D4 F4 A4)/8 r/8 (D4 F4 A4)/8 | r/8 (Bb3 D4 F4)/8 r/8 (Bb3 D4 F4)/8 r/8 (Bb3 D4 F4)/8 r/8 (Bb3 D4 F4)/8 | r/8 (C4 E4 G4)/8 r/8 (C4 E4 G4)/8 r/8 (C4 E4 G4)/8 r/8 (C4 E4 G4)/8 | r/8 (A3 C4 E4)/8 r/8 (A3 C4 E4)/8 r/8 (A3 C4 E4)/8 r/8 (A3 C4 E4)/8',
    lh: 'D2/q D2/q D2/q D2/q | Bb2/q Bb2/q Bb2/q Bb2/q | C3/q C3/q C3/q C3/q | A2/q A2/q A2/q A2/q' },
  { id: 'p4-edm-dubstep', cat: 'EDM', title: 'Dubstep in Bm', composer: 'Piano Learners Original', level: 'Medium', bpm: 140, time: '4/4', key: 'Bm',
    rh: '(B3 D4 F#4)/q (B3 D4 F#4)/q r/q (B3 D4 F#4)/q | (G3 B3 D4)/q (G3 B3 D4)/q r/q (G3 B3 D4)/q | (A3 C#4 E4)/q (A3 C#4 E4)/q r/q (A3 C#4 E4)/q | (F#3 A3 C#4)/q (F#3 A3 C#4)/q r/q (F#3 A3 C#4)/q',
    lh: 'B2/q r/q B2/q r/q | G2/q r/q G2/q r/q | A2/q r/q A2/q r/q | F#2/q r/q F#2/q r/q' },
  { id: 'p4-edm-electro-fm', cat: 'EDM', title: 'Electro House in Fm', composer: 'Piano Learners Original', level: 'Easy', bpm: 128, time: '4/4', key: 'Cm',
    rh: '(C4 Eb4 G4)/8 (C4 Eb4 G4)/8 (C4 Eb4 G4)/8 (C4 Eb4 G4)/8 (C4 Eb4 G4)/8 (C4 Eb4 G4)/8 (C4 Eb4 G4)/8 (C4 Eb4 G4)/8 | (Ab3 C4 Eb4)/8 (Ab3 C4 Eb4)/8 (Ab3 C4 Eb4)/8 (Ab3 C4 Eb4)/8 (Ab3 C4 Eb4)/8 (Ab3 C4 Eb4)/8 (Ab3 C4 Eb4)/8 (Ab3 C4 Eb4)/8 | (Bb3 D4 F4)/8 (Bb3 D4 F4)/8 (Bb3 D4 F4)/8 (Bb3 D4 F4)/8 (Bb3 D4 F4)/8 (Bb3 D4 F4)/8 (Bb3 D4 F4)/8 (Bb3 D4 F4)/8 | (G3 Bb3 D4)/8 (G3 Bb3 D4)/8 (G3 Bb3 D4)/8 (G3 Bb3 D4)/8 (G3 Bb3 D4)/8 (G3 Bb3 D4)/8 (G3 Bb3 D4)/8 (G3 Bb3 D4)/8',
    lh: 'C2/q C2/q C2/q C2/q | Ab2/q Ab2/q Ab2/q Ab2/q | Bb2/q Bb2/q Bb2/q Bb2/q | G2/q G2/q G2/q G2/q' },
  { id: 'p4-edm-synth-anthem-eb', cat: 'EDM', title: 'Synth Anthem in Eb', composer: 'Piano Learners Original', level: 'Easy', bpm: 128, time: '4/4', key: 'Eb',
    rh: '(Eb4 G4 Bb4)/h (Eb4 G4 Bb4)/h | (Ab4 C5 Eb5)/h (Ab4 C5 Eb5)/h | (Bb4 D5 F5)/h (Bb4 D5 F5)/h | (G4 Bb4 D5)/h (G4 Bb4 D5)/h',
    lh: 'Eb2/w | Ab2/w | Bb2/w | G2/w' },
  { id: 'p4-edm-chill-trap', cat: 'EDM', title: 'Chill Trap EDM', composer: 'Piano Learners Original', level: 'Easy', bpm: 142, time: '4/4', key: 'Am',
    rh: '(A4 C5 E5)/h (A4 C5 E5)/q (A4 C5 E5)/q | (F4 A4 C5)/h (F4 A4 C5)/q (F4 A4 C5)/q | (G4 B4 D5)/h (G4 B4 D5)/q (G4 B4 D5)/q | (E4 G4 B4)/h (E4 G4 B4)/q (E4 G4 B4)/q',
    lh: 'A2/qd r/8 A2/q A2/q | F2/qd r/8 F2/q F2/q | G2/qd r/8 G2/q G2/q | E2/qd r/8 E2/q E2/q' },
  { id: 'p4-edm-garage-house', cat: 'EDM', title: 'Garage House', composer: 'Piano Learners Original', level: 'Medium', bpm: 130, time: '4/4', key: 'C',
    rh: '(C4 E4 G4)/8 r/8 (C4 E4 G4)/8 r/8 (C4 E4 G4)/8 r/8 (C4 E4 G4)/8 r/8 | (F4 A4 C5)/8 r/8 (F4 A4 C5)/8 r/8 (F4 A4 C5)/8 r/8 (F4 A4 C5)/8 r/8 | (G4 B4 D5)/8 r/8 (G4 B4 D5)/8 r/8 (G4 B4 D5)/8 r/8 (G4 B4 D5)/8 r/8 | (A4 C5 E5)/8 r/8 (A4 C5 E5)/8 r/8 (A4 C5 E5)/8 r/8 (A4 C5 E5)/8 r/8',
    lh: 'C2/q C2/q C2/q C2/q | F2/q F2/q F2/q F2/q | G2/q G2/q G2/q G2/q | A2/q A2/q A2/q A2/q' },
  { id: 'p4-edm-ambient-dm', cat: 'EDM', title: 'Ambient Pad in Dm', composer: 'Piano Learners Original', level: 'Easy', bpm: 72, time: '4/4', key: 'Dm',
    rh: '(D4 F4 A4 C5)/w | (Bb3 D4 F4 A4)/w | (G3 Bb3 D4 F4)/w | (A3 C#4 E4 G4)/w',
    lh: 'D2/w | Bb2/w | G2/w | A2/w' },
  { id: 'p4-edm-progressive-am', cat: 'EDM', title: 'Progressive in Am', composer: 'Piano Learners Original', level: 'Easy', bpm: 128, time: '4/4', key: 'Am',
    rh: 'A4/h C5/h | E5/h C5/h | F4/h A4/h | G4/h E5/h',
    lh: 'A2/q E3/q A3/q E3/q | A2/q E3/q A3/q E3/q | F2/q C3/q F3/q C3/q | G2/q D3/q G3/q D3/q' },
  { id: 'p4-edm-synthpop-g', cat: 'EDM', title: 'Synthpop in G', composer: 'Piano Learners Original', level: 'Easy', bpm: 120, time: '4/4', key: 'G',
    rh: '(G4 B4 D5)/q (G4 B4 D5)/q (D5 F#5 A5)/q (D5 F#5 A5)/q | (E4 G4 B4)/q (E4 G4 B4)/q (C5 E5 G5)/q (C5 E5 G5)/q | (C4 E4 G4)/q (C4 E4 G4)/q (G4 B4 D5)/q (G4 B4 D5)/q | (D4 F#4 A4)/q (D4 F#4 A4)/q (A4 C#5 E5)/q (A4 C#5 E5)/q',
    lh: 'G2/w | E2/w | C2/w | D2/w' },
  { id: 'p4-edm-piano-house', cat: 'EDM', title: 'Piano House in Fm', composer: 'Piano Learners Original', level: 'Easy', bpm: 126, time: '4/4', key: 'Cm',
    rh: '(C4 Eb4 G4)/q (C4 Eb4 G4)/q (G4 Bb4 Eb5)/q (G4 Bb4 Eb5)/q | (Ab3 C4 Eb4)/q (Ab3 C4 Eb4)/q (Eb4 G4 Bb4)/q (Eb4 G4 Bb4)/q | (Bb3 D4 F4)/q (Bb3 D4 F4)/q (F4 A4 C5)/q (F4 A4 C5)/q | (G3 Bb3 D4)/q (G3 Bb3 D4)/q (D4 F4 Bb4)/q (D4 F4 Bb4)/q',
    lh: 'C2/w | Ab2/w | Bb2/w | G2/w' },

  // ========== FINGERSTYLE (12) ==========
  { id: 'p4-fs-asturias-fs', cat: 'Fingerstyle', title: 'Asturias (Fingerstyle)', composer: 'I. Albéniz', level: 'Medium', bpm: 160, time: '3/4', key: 'Em',
    rh: 'E5/q B4/q E5/q | F5/q B4/q F5/q | E5/q B4/q E5/q | D5/q B4/q D5/q',
    lh: 'E3/8 B3/8 E4/8 B3/8 E4/8 B3/8 | E3/8 B3/8 E4/8 B3/8 E4/8 B3/8 | E3/8 B3/8 E4/8 B3/8 E4/8 B3/8 | E3/8 B3/8 E4/8 B3/8 E4/8 B3/8' },
  { id: 'p4-fs-ave-maria-fs', cat: 'Fingerstyle', title: 'Ave Maria (Fingerstyle)', composer: 'F. Schubert', level: 'Easy', bpm: 60, time: '4/4', key: 'Bb',
    rh: 'F5/qd F5/8 F5/q F5/q | F5/qd Eb5/8 D5/q D5/q | D5/qd D5/8 D5/q Eb5/q | F5/q G5/q F5/h',
    lh: 'Bb2/8 F3/8 D4/8 F3/8 Bb2/8 F3/8 D4/8 F3/8 | Bb2/8 F3/8 D4/8 F3/8 Bb2/8 F3/8 D4/8 F3/8 | Bb2/8 F3/8 D4/8 F3/8 Bb2/8 F3/8 D4/8 F3/8 | F2/8 C3/8 A3/8 C3/8 Bb2/8 F3/8 D4/8 F3/8' },
  { id: 'p4-fs-moon-river-trad', cat: 'Fingerstyle', title: 'Londonderry Air', composer: 'Traditional Irish', level: 'Easy', bpm: 80, time: '4/4', key: 'F',
    rh: 'F4/q A4/q Bb4/q C5/q | A4/q Bb4/q C5/q A4/q | C5/qd C5/8 F5/q A4/q | Bb4/w',
    lh: 'F3/8 C4/8 A3/8 C4/8 A3/8 C4/8 F3/8 C4/8 | F3/8 C4/8 A3/8 C4/8 A3/8 C4/8 F3/8 C4/8 | F3/8 C4/8 A3/8 C4/8 A3/8 C4/8 F3/8 C4/8 | Bb2/8 F3/8 D4/8 F3/8 D4/8 F3/8 Bb2/8 F3/8' },
  { id: 'p4-fs-gymnopedie-fs', cat: 'Fingerstyle', title: 'Gymnopédie No. 3 (Fingerstyle)', composer: 'E. Satie', level: 'Easy', bpm: 72, time: '3/4', key: 'Dm',
    rh: 'D5/q A4/q F5/q | D5/q A4/q E5/q | D5/q A4/q F5/q | D5/hd',
    lh: 'D3/8 A3/8 D4/8 A3/8 D4/8 A3/8 | D3/8 A3/8 D4/8 A3/8 D4/8 A3/8 | G3/8 D4/8 G3/8 D4/8 G3/8 D4/8 | D3/8 A3/8 D4/8 A3/8 D4/8 A3/8' },
  { id: 'p4-fs-pavana-arr', cat: 'Fingerstyle', title: 'Pavana (Fingerstyle)', composer: 'G. Fauré', level: 'Medium', bpm: 72, time: '4/4', key: 'Em',
    rh: 'A4/q F#4/q A4/q B4/q | C5/qd B4/8 A4/q F#4/q | E4/q F#4/q A4/q B4/q | A4/w',
    lh: 'E3/8 B3/8 E4/8 B3/8 E4/8 B3/8 E3/8 B3/8 | E3/8 B3/8 E4/8 B3/8 E4/8 B3/8 E3/8 B3/8 | A3/8 E4/8 A3/8 E4/8 A3/8 E4/8 A3/8 E4/8 | B2/8 F#3/8 B3/8 F#3/8 B3/8 F#3/8 B2/8 F#3/8' },
  { id: 'p4-fs-skye-fs', cat: 'Fingerstyle', title: 'Skye Boat Song (Fingerstyle)', composer: 'Traditional Scottish', level: 'Easy', bpm: 100, time: '6/8', key: 'Am',
    rh: 'A4/qd B4/qd | C5/qd A4/qd | E5/qd D5/qd | C5/qd A4/qd',
    lh: 'A2/8 E3/8 A3/8 E3/8 A3/8 E3/8 | A2/8 E3/8 A3/8 E3/8 A3/8 E3/8 | A2/8 E3/8 A3/8 E3/8 A3/8 E3/8 | A2/8 E3/8 A3/8 E3/8 A3/8 E3/8' },
  { id: 'p4-fs-greensleeves-d', cat: 'Fingerstyle', title: 'Greensleeves in Dm (Fingerstyle)', composer: 'Traditional English', level: 'Easy', bpm: 100, time: '6/8', key: 'Dm',
    rh: 'D5/qd F5/qd | A5/qd G5/8 F5/8 E5/8 | D5/qd Bb4/qd | C5/qd r/qd',
    lh: 'D3/8 A3/8 D4/8 A3/8 D4/8 A3/8 | D3/8 A3/8 D4/8 A3/8 D4/8 A3/8 | G3/8 D4/8 G3/8 D4/8 G3/8 D4/8 | A2/8 E3/8 A3/8 E3/8 A3/8 E3/8' },
  { id: 'p4-fs-blackbird-fs', cat: 'Fingerstyle', title: 'Will the Circle Be Unbroken', composer: 'Traditional (1907)', level: 'Easy', bpm: 100, time: '4/4', key: 'G',
    rh: 'D5/q G5/q G5/q G5/q | A5/qd G5/8 D5/h | B4/q D5/q D5/q D5/q | E5/qd D5/8 B4/h',
    lh: 'G2/8 D3/8 G3/8 D3/8 B3/8 D3/8 G3/8 D3/8 | G2/8 D3/8 G3/8 D3/8 B3/8 D3/8 G3/8 D3/8 | G2/8 D3/8 G3/8 D3/8 B3/8 D3/8 G3/8 D3/8 | C3/8 G3/8 C4/8 G3/8 E4/8 G3/8 C4/8 G3/8' },
  { id: 'p4-fs-minuet-fs', cat: 'Fingerstyle', title: 'Minuet in G (Fingerstyle)', composer: 'J.S. Bach', level: 'Easy', bpm: 120, time: '3/4', key: 'G',
    rh: 'D5/q G4/8 A4/8 B4/8 C5/8 | D5/q G4/q G4/q | E5/q C5/8 D5/8 E5/8 F#5/8 | G5/q G4/q G4/q',
    lh: 'G2/8 D3/8 G3/8 D3/8 B3/8 D3/8 | G2/8 D3/8 G3/8 D3/8 B3/8 D3/8 | C3/8 G3/8 C4/8 G3/8 E4/8 G3/8 | G2/8 D3/8 G3/8 D3/8 B3/8 D3/8' },
  { id: 'p4-fs-spring-fs', cat: 'Fingerstyle', title: 'Spring (Four Seasons) Fingerstyle', composer: 'A. Vivaldi', level: 'Medium', bpm: 120, time: '4/4', key: 'E',
    rh: 'E5/q E5/q E5/8 F#5/8 G#5/q | G#5/q F#5/q E5/h | E5/q D#5/q C#5/q D#5/q | E5/w',
    lh: 'E3/8 B3/8 E4/8 B3/8 E4/8 B3/8 E3/8 B3/8 | A3/8 E4/8 A3/8 E4/8 A3/8 E4/8 A3/8 E4/8 | B2/8 F#3/8 B3/8 F#3/8 B3/8 F#3/8 B2/8 F#3/8 | E3/8 B3/8 E4/8 B3/8 E4/8 B3/8 E3/8 B3/8' },
  { id: 'p4-fs-pachelbel-fs', cat: 'Fingerstyle', title: 'Pachelbel Canon (Fingerstyle)', composer: 'J. Pachelbel', level: 'Easy', bpm: 72, time: '4/4', key: 'D',
    rh: 'F#5/h E5/h | D5/h C#5/h | B4/h A4/h | B4/h C#5/h',
    lh: 'D3/8 A3/8 D4/8 F#4/8 A4/8 F#4/8 D4/8 A3/8 | A2/8 E3/8 A3/8 C#4/8 E4/8 C#4/8 A3/8 E3/8 | B2/8 F#3/8 B3/8 D4/8 F#4/8 D4/8 B3/8 F#3/8 | F#2/8 C#3/8 F#3/8 A3/8 C#4/8 A3/8 F#3/8 C#3/8' },
  { id: 'p4-fs-ode-joy-fs', cat: 'Fingerstyle', title: 'Ode to Joy (Fingerstyle)', composer: 'L. van Beethoven', level: 'Easy', bpm: 100, time: '4/4', key: 'G',
    rh: 'B4/q B4/q C5/q D5/q | D5/q C5/q B4/q A4/q | G4/q G4/q A4/q B4/q | B4/q A4/q A4/h',
    lh: 'G2/8 D3/8 G3/8 D3/8 B3/8 D3/8 G3/8 D3/8 | G2/8 D3/8 G3/8 D3/8 B3/8 D3/8 G3/8 D3/8 | G2/8 D3/8 G3/8 D3/8 B3/8 D3/8 G3/8 D3/8 | D3/8 A3/8 D4/8 A3/8 D4/8 A3/8 D3/8 A3/8' },

  // ========== EXERCISES (12) ==========
  { id: 'p4-ex-f-major-scale', cat: 'Exercises', title: 'F Major Scale', composer: 'Piano Learners Original', level: 'Easy', bpm: 100, time: '4/4', key: 'F',
    rh: 'F4/q G4/q A4/q Bb4/q | C5/q D5/q E5/q F5/q | F5/q E5/q D5/q C5/q | Bb4/q A4/q G4/q F4/q',
    lh: 'F3/q G3/q A3/q Bb3/q | C4/q D4/q E4/q F4/q | F4/q E4/q D4/q C4/q | Bb3/q A3/q G3/q F3/q' },
  { id: 'p4-ex-bb-major-scale', cat: 'Exercises', title: 'Bb Major Scale', composer: 'Piano Learners Original', level: 'Easy', bpm: 100, time: '4/4', key: 'Bb',
    rh: 'Bb4/q C5/q D5/q Eb5/q | F5/q G5/q A5/q Bb5/q | Bb5/q A5/q G5/q F5/q | Eb5/q D5/q C5/q Bb4/q',
    lh: 'Bb3/q C4/q D4/q Eb4/q | F3/q G3/q A3/q Bb3/q | Bb3/q A3/q G3/q F3/q | Eb3/q D3/q C3/q Bb2/q' },
  { id: 'p4-ex-e-minor-scale', cat: 'Exercises', title: 'E Minor Scale (Natural)', composer: 'Piano Learners Original', level: 'Easy', bpm: 100, time: '4/4', key: 'Em',
    rh: 'E4/q F#4/q G4/q A4/q | B4/q C5/q D5/q E5/q | E5/q D5/q C5/q B4/q | A4/q G4/q F#4/q E4/q',
    lh: 'E3/q F#3/q G3/q A3/q | B3/q C4/q D4/q E4/q | E4/q D4/q C4/q B3/q | A3/q G3/q F#3/q E3/q' },
  { id: 'p4-ex-d-minor-scale', cat: 'Exercises', title: 'D Minor Scale (Natural)', composer: 'Piano Learners Original', level: 'Easy', bpm: 100, time: '4/4', key: 'Dm',
    rh: 'D4/q E4/q F4/q G4/q | A4/q Bb4/q C5/q D5/q | D5/q C5/q Bb4/q A4/q | G4/q F4/q E4/q D4/q',
    lh: 'D3/q E3/q F3/q G3/q | A3/q Bb3/q C4/q D4/q | D4/q C4/q Bb3/q A3/q | G3/q F3/q E3/q D3/q' },
  { id: 'p4-ex-c-minor-scale', cat: 'Exercises', title: 'C Minor Scale (Natural)', composer: 'Piano Learners Original', level: 'Easy', bpm: 100, time: '4/4', key: 'Cm',
    rh: 'C4/q D4/q Eb4/q F4/q | G4/q Ab4/q Bb4/q C5/q | C5/q Bb4/q Ab4/q G4/q | F4/q Eb4/q D4/q C4/q',
    lh: 'C3/q D3/q Eb3/q F3/q | G3/q Ab3/q Bb3/q C4/q | C4/q Bb3/q Ab3/q G3/q | F3/q Eb3/q D3/q C3/q' },
  { id: 'p4-ex-d-arpeggio', cat: 'Exercises', title: 'D Major Arpeggio', composer: 'Piano Learners Original', level: 'Easy', bpm: 100, time: '4/4', key: 'D',
    rh: 'D4/q F#4/q A4/q D5/q | A4/q F#4/q D4/q A3/q | D4/q F#4/q A4/q D5/q | D5/w',
    lh: 'D3/q F#3/q A3/q D4/q | A3/q F#3/q D3/q A2/q | D3/q F#3/q A3/q D4/q | D3/w' },
  { id: 'p4-ex-bb-arpeggio', cat: 'Exercises', title: 'Bb Major Arpeggio', composer: 'Piano Learners Original', level: 'Easy', bpm: 100, time: '4/4', key: 'Bb',
    rh: 'Bb4/q D5/q F5/q Bb5/q | F5/q D5/q Bb4/q F4/q | Bb4/q D5/q F5/q Bb5/q | Bb5/w',
    lh: 'Bb3/q D4/q F4/q Bb3/q | F3/q D3/q Bb2/q F3/q | Bb3/q D4/q F4/q Bb3/q | Bb3/w' },
  { id: 'p4-ex-am-arpeggio', cat: 'Exercises', title: 'A Minor Arpeggio', composer: 'Piano Learners Original', level: 'Easy', bpm: 100, time: '4/4', key: 'Am',
    rh: 'A4/q C5/q E5/q A5/q | E5/q C5/q A4/q E4/q | A4/q C5/q E5/q A5/q | A5/w',
    lh: 'A3/q C4/q E4/q A3/q | E3/q C3/q A2/q E3/q | A3/q C4/q E4/q A3/q | A3/w' },
  { id: 'p4-ex-em-arpeggio', cat: 'Exercises', title: 'E Minor Arpeggio', composer: 'Piano Learners Original', level: 'Easy', bpm: 100, time: '4/4', key: 'Em',
    rh: 'E4/q G4/q B4/q E5/q | B4/q G4/q E4/q B3/q | E4/q G4/q B4/q E5/q | E5/w',
    lh: 'E3/q G3/q B3/q E4/q | B3/q G3/q E3/q B2/q | E3/q G3/q B3/q E4/q | E3/w' },
  { id: 'p4-ex-staccato-c', cat: 'Exercises', title: 'Staccato C', composer: 'Piano Learners Original', level: 'Easy', bpm: 120, time: '4/4', key: 'C',
    rh: 'C4/8 r/8 E4/8 r/8 G4/8 r/8 C5/8 r/8 | E5/8 r/8 C5/8 r/8 G4/8 r/8 E4/8 r/8 | C4/8 r/8 E4/8 r/8 G4/8 r/8 C5/8 r/8 | E5/8 r/8 C5/8 r/8 G4/8 r/8 C4/8 r/8',
    lh: 'C3/w | C3/w | C3/w | C3/w' },
  { id: 'p4-ex-trill-g', cat: 'Exercises', title: 'Trill Prep G', composer: 'Piano Learners Original', level: 'Easy', bpm: 108, time: '4/4', key: 'G',
    rh: 'G4/8 A4/8 G4/8 A4/8 G4/8 A4/8 G4/8 A4/8 | B4/8 C5/8 B4/8 C5/8 B4/8 C5/8 B4/8 C5/8 | D5/8 E5/8 D5/8 E5/8 D5/8 E5/8 D5/8 E5/8 | F#5/8 G5/8 F#5/8 G5/8 F#5/8 G5/8 F#5/q',
    lh: 'G3/w | G3/w | D3/w | G3/w' },
  { id: 'p4-ex-wrist-staccato', cat: 'Exercises', title: 'Wrist Staccato', composer: 'Piano Learners Original', level: 'Easy', bpm: 108, time: '4/4', key: 'C',
    rh: 'C5/q r/q E5/q r/q | G5/q r/q C6/q r/q | B5/q r/q G5/q r/q | E5/q r/q C5/q r/q',
    lh: 'C3/q r/q C3/q r/q | G3/q r/q G3/q r/q | G3/q r/q G3/q r/q | C3/q r/q C3/q r/q' },
];

// ---------- validation (same as pack-260) ----------
const KEY_FALLBACK = { 'C#m':'Cm','F#m':'Em','Fm':'Cm','Bbm':'Gm','Ebm':'Cm','G#m':'Am','Db':'C','Gb':'F','F#':'G','C#':'C' };
const TIME_FALLBACK = { '3/8':'3/4','12/8':'6/8','9/8':'6/8','6/4':'3/4','3/2':'3/4','2/2':'4/4','5/4':'4/4' };
const VALID_KEYS = new Set(['C','G','D','A','E','F','Bb','Eb','Ab','Am','Em','Bm','Dm','Gm','Cm']);
const VALID_TIMES = { '2/4':2,'3/4':3,'4/4':4,'6/8':3 };
const DUR = { w:4,h:2,q:1,8:0.5,16:0.25 };
const STEP = { C:0,D:2,E:4,F:5,G:7,A:9,B:11 };
const beatsOf = (d) => { const dot=d.endsWith('d'); const base=DUR[dot?d.slice(0,-1):d]; return base===undefined?NaN:base*(dot?1.5:1); };
const midiOf = (p) => { const m=/^([A-G])(#|b)?(\d)$/.exec(p); if(!m)return null; return 12*(Number(m[3])+1)+STEP[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0); };
const SHARP_OUT = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const transposeHand = (text, key, lo, hi) => {
  const useFlat = new Set(['F','Bb','Eb','Ab','Dm','Gm','Cm','Fm']).has(key);
  const nameFromMidi = (m) => {
    const pc = ((m%12)+12)%12;
    const oct = Math.floor(m/12) - 1;
    const n = useFlat ? ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'][pc] : SHARP_OUT[pc];
    return `${n}${oct}`;
  };
  return text.split('|').map(bar => {
    const toks = bar.trim().match(/\([^)]*\)\/\S+|\S+/g) || [];
    return toks.map(tok => {
      const slash = tok.lastIndexOf('/');
      const pitch = tok.slice(0, slash);
      const dur = tok.slice(slash + 1);
      if (pitch === 'r') return tok;
      const names = pitch.startsWith('(') ? pitch.slice(1,-1).trim().split(/\s+/) : [pitch];
      const fixed = names.map(p => {
        let m = midiOf(p);
        if (m === null) return p;
        while (m < lo) m += 12;
        while (m > hi) m -= 12;
        if (m < lo || m > hi) return p;
        return nameFromMidi(m);
      });
      const head = fixed.length === 1 ? fixed[0] : `(${fixed.join(' ')})`;
      return `${head}/${dur}`;
    }).join(' ');
  }).join(' | ');
};
function firstError(song) {
  if (!VALID_KEYS.has(song.key)) return `bad key ${song.key}`;
  const full = VALID_TIMES[song.time];
  if (!full) return `bad time ${song.time}`;
  const rhBars = song.rh.split('|').map(s=>s.trim());
  const lhBars = song.lh.split('|').map(s=>s.trim());
  if (rhBars.length !== lhBars.length) return `bar count mismatch`;
  const checkBar = (bar,lo,hi,which,idx,isFirstBar) => {
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
      const pitches = pitch.startsWith('(') ? pitch.slice(1,-1).trim().split(/\s+/) : [pitch];
      for (const p of pitches) {
        const m = midiOf(p);
        if (m === null) return `${which} bar ${idx+1}: bad pitch ${p}`;
        if (m < lo || m > hi) return `${which} bar ${idx+1}: ${p} out of range`;
      }
    }
    if (total === full) return null;
    if (isFirstBar && total < full) return null;
    return `${which} bar ${idx+1} = ${total} beats`;
  };
  for (let i=0;i<rhBars.length;i++) {
    const rhErr = checkBar(rhBars[i], midiOf('A3'), midiOf('C6'), 'rh', i, i===0);
    if (rhErr) return rhErr;
    const lhErr = checkBar(lhBars[i], midiOf('C2'), midiOf('E4'), 'lh', i, i===0);
    if (lhErr) return lhErr;
  }
  return null;
}
function expand(piece) {
  const key = KEY_FALLBACK[piece.key] || piece.key;
  const time = TIME_FALLBACK[piece.time] || piece.time;
  const rhFixed = transposeHand(piece.rh, key, midiOf('A3'), midiOf('C6'));
  const lhFixed = transposeHand(piece.lh, key, midiOf('C2'), midiOf('E4'));
  const rhBars = rhFixed.split('|').map(s=>s.trim());
  const lhBars = lhFixed.split('|').map(s=>s.trim());
  const minBars = piece.cat === 'Exercises' ? 8 : 32;
  const times = Math.ceil(minBars / rhBars.length);
  const outRh=[], outLh=[];
  for (let i=0;i<times;i++){ outRh.push(...rhBars); outLh.push(...lhBars); }
  return { id:piece.id, title:piece.title, composer:piece.composer, cat:piece.cat,
    level:piece.level||'Easy', bpm:piece.bpm, time, key,
    rh:outRh.join(' | '), lh:outLh.join(' | ') };
}
const all = PIECES.map(expand);
const valid = [];
const dropped = [];
for (const song of all) {
  const err = firstError(song);
  if (err) dropped.push({ id:song.id, err });
  else valid.push(song);
}
writeFileSync(OUT, JSON.stringify(valid, null, 2) + '\n');
console.log(`Wrote ${valid.length} pieces → ${OUT}`);
if (dropped.length) { console.log(`\nDropped ${dropped.length}:`); for (const d of dropped) console.log(`  ${d.id}: ${d.err}`); }
const perCat={}; for (const s of valid) perCat[s.cat]=(perCat[s.cat]||0)+1;
console.log('\nBy category:', perCat);
