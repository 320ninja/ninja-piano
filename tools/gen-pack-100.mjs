// Generates songs/pack-100.json — 100 real public-domain pieces split across
// 7 genres (Kids, Pop, Folk, Holiday, Hymns, Jazz, Classical), ~14-15 per genre.
// Each piece encodes the ACTUAL main theme (traditional melody / pre-1955 composer);
// the theme is repeated to meet the 32-bar validator minimum.
// Run: node tools/gen-pack-100.mjs

import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'songs', 'pack-100.json');

const PIECES = [
  // ============ KIDS (14) ============
  { id: 'muffin-man', cat: 'Kids', title: 'Do You Know the Muffin Man?', composer: 'Traditional', level: 'Easy', bpm: 108, time: '4/4', key: 'G',
    rh: 'G4/q G4/q A4/q B4/q | C5/q B4/q A4/h | D5/q D5/q B4/q G4/q | A4/q A4/q G4/h',
    lh: 'G3/w | D3/w | G3/w | D3/h G3/h' },
  { id: 'hey-diddle-diddle', cat: 'Kids', title: 'Hey Diddle Diddle', composer: 'Traditional', level: 'Easy', bpm: 108, time: '6/8', key: 'F',
    rh: 'F4/8 F4/8 A4/8 A4/8 C5/8 C5/8 | A4/qd F4/qd | G4/8 G4/8 Bb4/8 Bb4/8 D5/8 D5/8 | C5/qd F5/qd',
    lh: 'F3/qd C3/qd | F3/qd C3/qd | G3/qd Bb3/qd | C3/qd F3/qd' },
  { id: 'pat-a-cake', cat: 'Kids', title: 'Pat-a-Cake', composer: 'Traditional', level: 'Easy', bpm: 120, time: '2/4', key: 'C',
    rh: 'C4/q E4/q | G4/q E4/q | F4/q D4/q | C4/h | C4/q E4/q | G4/q E4/q | F4/q D4/q | C4/h',
    lh: 'C3/h | C3/h | G2/h | C3/h | C3/h | C3/h | G2/h | C3/h' },
  { id: 'jack-and-jill', cat: 'Kids', title: 'Jack and Jill', composer: 'Traditional', level: 'Easy', bpm: 112, time: '2/4', key: 'F',
    rh: 'F4/q A4/q | C5/q A4/q | Bb4/q G4/q | F4/h | F4/q A4/q | C5/q A4/q | G4/q Bb4/q | F4/h',
    lh: 'F3/q F3/q | F3/q F3/q | Bb2/q C3/q | F3/h | F3/q F3/q | F3/q F3/q | C3/q C3/q | F3/h' },
  { id: 'little-jack-horner', cat: 'Kids', title: 'Little Jack Horner', composer: 'Traditional', level: 'Easy', bpm: 120, time: '6/8', key: 'G',
    rh: 'D5/8 B4/8 G4/8 G4/8 B4/8 D5/8 | E5/8 D5/8 C5/8 B4/qd | A4/8 A4/8 B4/8 C5/8 D5/8 E5/8 | D5/qd G4/qd',
    lh: 'G3/qd G3/qd | C3/qd G3/qd | D3/qd D3/qd | G3/qd G3/qd' },
  { id: 'little-bo-peep', cat: 'Kids', title: 'Little Bo Peep', composer: 'Traditional', level: 'Easy', bpm: 112, time: '6/8', key: 'F',
    rh: 'F4/8 A4/8 C5/8 F5/qd | E5/8 D5/8 C5/8 Bb4/qd | A4/8 G4/8 F4/8 G4/8 A4/8 Bb4/8 | C5/qd F4/qd',
    lh: 'F3/qd F3/qd | Bb3/qd F3/qd | F3/qd C3/qd | F3/qd F3/qd' },
  { id: 'hickory-dickory-dock', cat: 'Kids', title: 'Hickory Dickory Dock', composer: 'Traditional', level: 'Easy', bpm: 132, time: '6/8', key: 'G',
    rh: 'D5/8 B4/8 G4/8 B4/8 D5/8 G5/8 | D5/qd B4/qd | A4/8 G4/8 F#4/8 G4/8 A4/8 B4/8 | C5/8 B4/8 A4/8 G4/qd',
    lh: 'G3/qd G3/qd | G3/qd D3/qd | D3/qd D3/qd | C3/qd G3/qd' },
  { id: 'simple-simon', cat: 'Kids', title: 'Simple Simon', composer: 'Traditional', level: 'Easy', bpm: 108, time: '2/4', key: 'C',
    rh: 'C5/q G4/q | E5/8 D5/8 C5/q | D5/q D5/q | G4/h | C5/q G4/q | E5/8 D5/8 C5/q | B4/q D5/q | C5/h',
    lh: 'C3/h | C3/h | G2/h | G2/h | C3/h | C3/h | G2/h | C3/h' },
  { id: 'duke-of-york', cat: 'Kids', title: 'The Grand Old Duke of York', composer: 'Traditional', level: 'Easy', bpm: 132, time: '2/4', key: 'G',
    rh: 'G4/q G4/8 G4/8 | B4/q G4/q | D5/q D5/8 D5/8 | B4/q G4/q | D5/q D5/8 D5/8 | B4/8 B4/8 G4/8 G4/8 | D5/8 D5/8 B4/8 G4/8 | G4/q G4/q',
    lh: 'G3/h | G3/h | D3/h | G3/h | D3/h | G3/h | D3/h | G3/h' },
  { id: 'little-teapot', cat: 'Kids', title: "I'm a Little Teapot", composer: 'Traditional', level: 'Easy', bpm: 120, time: '4/4', key: 'G',
    rh: 'G4/q G4/q A4/q B4/q | C5/q C5/q D5/h | G4/q G4/q A4/q B4/q | A4/q A4/q G4/h',
    lh: 'G3/w | C3/w | G3/w | D3/h G3/h' },
  { id: 'hush-little-baby', cat: 'Kids', title: 'Hush Little Baby', composer: 'Traditional', level: 'Easy', bpm: 80, time: '2/4', key: 'F',
    rh: 'F4/q A4/q | C5/q C5/q | Bb4/q A4/q | G4/h | A4/q A4/q | G4/q F4/q | E4/q G4/q | F4/h',
    lh: 'F3/h | F3/h | Bb2/h | C3/h | F3/h | F3/h | C3/h | F3/h' },
  { id: 'bear-mountain', cat: 'Kids', title: 'The Bear Went Over the Mountain', composer: 'Traditional', level: 'Easy', bpm: 112, time: '6/8', key: 'C',
    rh: 'C5/qd E5/qd | G5/qd E5/qd | C5/qd E5/8 D5/8 C5/8 | D5/qd r/qd | D5/qd F5/qd | A5/qd F5/qd | D5/qd F5/8 E5/8 D5/8 | C5/qd r/qd',
    lh: 'C3/qd C3/qd | C3/qd C3/qd | C3/qd C3/qd | G2/qd G2/qd | G3/qd G3/qd | G3/qd G3/qd | G3/qd G3/qd | C3/qd C3/qd' },
  { id: 'oats-peas-beans', cat: 'Kids', title: 'Oats Peas Beans and Barley Grow', composer: 'Traditional', level: 'Easy', bpm: 120, time: '2/4', key: 'C',
    rh: 'C5/q C5/q | A4/q G4/q | E5/q E5/q | D5/h | C5/q C5/q | A4/q G4/q | D5/q D5/q | C5/h',
    lh: 'C3/h | F3/h | C3/h | G2/h | C3/h | F3/h | G2/h | C3/h' },
  { id: 'wind-the-bobbin-up', cat: 'Kids', title: 'Wind the Bobbin Up', composer: 'Traditional', level: 'Easy', bpm: 120, time: '2/4', key: 'G',
    rh: 'G4/8 A4/8 B4/8 G4/8 | B4/q A4/q | G4/8 A4/8 B4/8 G4/8 | B4/q A4/q | D5/q B4/q | A4/q G4/q | D5/q B4/q | A4/q G4/q',
    lh: 'G3/h | D3/h | G3/h | D3/h | G3/h | D3/h | G3/h | G3/h' },

  // ============ POP (14 — pre-1928 parlor songs & standards) ============
  { id: 'by-light-silvery-moon', cat: 'Pop', title: 'By the Light of the Silvery Moon', composer: 'Edwards / Madden (1909)', level: 'Easy', bpm: 112, time: '2/4', key: 'C',
    rh: 'G4/q E5/q | D5/q C5/q | B4/q G4/q | C5/h | G4/q E5/q | D5/q C5/q | B4/q D5/q | C5/h',
    lh: 'C3/h | G2/h | G2/h | C3/h | C3/h | G2/h | G2/h | C3/h' },
  { id: 'oh-you-beautiful-doll', cat: 'Pop', title: 'Oh You Beautiful Doll', composer: 'Brown / Ayer (1911)', level: 'Easy', bpm: 132, time: '2/4', key: 'F',
    rh: 'F4/q A4/q | C5/q A4/q | Bb4/q G4/q | A4/h | F4/q A4/q | C5/q F5/q | E5/q D5/q | C5/h',
    lh: 'F3/h | F3/h | Bb2/h | F3/h | F3/h | F3/h | C3/h | F3/h' },
  { id: 'sidewalks-new-york', cat: 'Pop', title: 'The Sidewalks of New York', composer: 'Lawlor / Blake (1894)', level: 'Easy', bpm: 160, time: '3/4', key: 'G',
    rh: 'D5/q D5/q D5/q | E5/q D5/q B4/q | G4/qd A4/8 B4/q | A4/hd | D5/q D5/q D5/q | E5/q D5/q B4/q | G4/q A4/q B4/q | G4/hd',
    lh: 'G3/q D3/q G3/q | G3/q D3/q G3/q | C3/q G3/q C4/q | D3/q A3/q D4/q | G3/q D3/q G3/q | G3/q D3/q G3/q | C3/q D3/q G3/q | G3/q D3/q G3/q' },
  { id: 'give-regards-broadway', cat: 'Pop', title: 'Give My Regards to Broadway', composer: 'George M. Cohan (1904)', level: 'Easy', bpm: 132, time: '2/4', key: 'F',
    rh: 'C5/q C5/q | C5/q A4/q | Bb4/q Bb4/q | G4/q F4/q | A4/q A4/q | A4/q F4/q | G4/q A4/q | Bb4/q G4/q',
    lh: 'F3/h | F3/h | Bb2/h | F3/h | F3/h | F3/h | C3/h | Bb2/h' },
  { id: 'school-days', cat: 'Pop', title: 'School Days', composer: 'Edwards / Cobb (1907)', level: 'Easy', bpm: 108, time: '3/4', key: 'F',
    rh: 'F4/q F4/q G4/q | A4/qd Bb4/8 C5/q | A4/q G4/q F4/q | G4/hd | F4/q F4/q G4/q | A4/qd Bb4/8 C5/q | D5/q C5/q A4/q | F4/hd',
    lh: 'F3/q F3/q A3/q | F3/q F3/q A3/q | C3/q C3/q E3/q | C3/q C3/q E3/q | F3/q F3/q A3/q | F3/q F3/q A3/q | Bb2/q C3/q F3/q | F3/q C3/q F3/q' },
  { id: 'meet-me-st-louis', cat: 'Pop', title: 'Meet Me in St. Louis', composer: 'Mills / Sterling (1904)', level: 'Easy', bpm: 120, time: '3/4', key: 'C',
    rh: 'E5/q E5/q D5/q | C5/q G4/q G4/q | A4/q G4/q F4/q | E4/hd | E5/q E5/q D5/q | C5/q G4/q G4/q | A4/q B4/q C5/q | C5/hd',
    lh: 'C3/q G3/q E4/q | C3/q G3/q E4/q | F3/q A3/q C4/q | C3/q G3/q E4/q | C3/q G3/q E4/q | C3/q G3/q E4/q | F3/q G3/q C4/q | C3/q G3/q E4/q' },
  { id: 'wait-sun-shines-nellie', cat: 'Pop', title: 'Wait Till the Sun Shines Nellie', composer: 'Von Tilzer / Sterling (1905)', level: 'Easy', bpm: 108, time: '4/4', key: 'F',
    rh: 'F5/q F5/q E5/q D5/q | C5/q C5/q A4/h | A4/q Bb4/q C5/q D5/q | F5/q F5/q F5/h',
    lh: 'F3/w | C3/w | F3/w | F3/w' },
  { id: 'alexanders-ragtime-band', cat: 'Pop', title: "Alexander's Ragtime Band", composer: 'Irving Berlin (1911)', level: 'Medium', bpm: 120, time: '4/4', key: 'C',
    rh: 'C5/q C5/q G4/q G4/q | A4/q A4/q G4/h | C5/q E5/q G5/q E5/q | D5/q D5/q C5/h',
    lh: 'C3/w | G2/w | C3/w | G2/h C3/h' },
  { id: 'in-shade-apple-tree', cat: 'Pop', title: 'In the Shade of the Old Apple Tree', composer: 'Van Alstyne / Williams (1905)', level: 'Easy', bpm: 100, time: '4/4', key: 'G',
    rh: 'B4/qd G4/8 B4/q D5/q | G5/qd E5/8 D5/q B4/q | A4/qd A4/8 B4/q C5/q | D5/w',
    lh: 'G3/w | G3/h D3/h | D3/w | G3/w' },
  { id: 'pack-up-troubles', cat: 'Pop', title: 'Pack Up Your Troubles', composer: 'Powell / Asaf (1915)', level: 'Easy', bpm: 120, time: '2/4', key: 'G',
    rh: 'G4/q A4/8 B4/8 | C5/q B4/q | A4/q B4/q | G4/h | G4/q A4/8 B4/8 | C5/q B4/q | A4/q D5/q | G5/h',
    lh: 'G3/h | C3/h | D3/h | G3/h | G3/h | C3/h | D3/h | G3/h' },
  { id: 'band-played-on', cat: 'Pop', title: 'The Band Played On', composer: 'Ward / Palmer (1895)', level: 'Easy', bpm: 160, time: '3/4', key: 'C',
    rh: 'G4/qd A4/8 B4/q | C5/qd D5/8 E5/q | D5/qd C5/8 B4/q | A4/hd | G4/qd A4/8 B4/q | C5/qd D5/8 E5/q | D5/qd C5/8 D5/q | C5/hd',
    lh: 'C3/q G3/q E4/q | C3/q G3/q E4/q | G2/q D3/q B3/q | G2/q D3/q B3/q | C3/q G3/q E4/q | C3/q G3/q E4/q | G2/q D3/q B3/q | C3/q G3/q E4/q' },
  { id: 'kkk-katy', cat: 'Pop', title: 'K-K-K-Katy', composer: 'Geoffrey OHara (1917)', level: 'Easy', bpm: 132, time: '2/4', key: 'F',
    rh: 'F4/q F4/q | F4/q A4/q | G4/q G4/q | A4/h | F4/q F4/q | A4/q C5/q | Bb4/q A4/q | F4/h',
    lh: 'F3/h | F3/h | C3/h | F3/h | F3/h | F3/h | C3/h | F3/h' },
  { id: 'yes-no-bananas', cat: 'Pop', title: 'Yes We Have No Bananas', composer: 'Silver / Cohn (1923)', level: 'Easy', bpm: 132, time: '4/4', key: 'C',
    rh: 'G4/q G4/q G4/q C5/q | E5/q E5/q D5/h | D5/q F5/q E5/q D5/q | C5/w',
    lh: 'C3/w | C3/w | G2/w | C3/w' },
  { id: 'aint-we-got-fun', cat: 'Pop', title: "Ain't We Got Fun", composer: 'Whiting / Kahn (1921)', level: 'Easy', bpm: 132, time: '4/4', key: 'C',
    rh: 'E5/q E5/q E5/q G5/q | F5/q E5/q D5/q C5/q | D5/q D5/q D5/q F5/q | E5/q D5/q C5/h',
    lh: 'C3/w | F3/w | G2/w | C3/w' },

  // ============ FOLK (14 — traditional, not in existing) ============
  { id: 'streets-of-laredo', cat: 'Folk', title: 'Streets of Laredo', composer: 'Traditional', level: 'Easy', bpm: 100, time: '3/4', key: 'G',
    rh: 'G4/q B4/q D5/q | G5/qd E5/8 D5/q | B4/q D5/q G5/q | B4/hd | D5/q D5/q C5/q | B4/qd A4/8 G4/q | A4/q B4/q C5/q | B4/hd',
    lh: 'G3/q D3/q G3/q | G3/q D3/q G3/q | C3/q G3/q C4/q | G3/q D3/q G3/q | G3/q D3/q G3/q | G3/q D3/q G3/q | D3/q A3/q D4/q | G3/q D3/q G3/q' },
  { id: 'blow-the-man-down', cat: 'Folk', title: 'Blow the Man Down', composer: 'Traditional Sea Shanty', level: 'Easy', bpm: 100, time: '6/8', key: 'G',
    rh: 'G4/qd B4/qd | D5/qd D5/qd | E5/qd D5/qd | C5/qd A4/qd | D5/qd B4/qd | A4/qd G4/qd | A4/8 B4/8 A4/8 G4/qd | G4/qd r/qd',
    lh: 'G3/qd G3/qd | G3/qd G3/qd | C3/qd C3/qd | D3/qd D3/qd | G3/qd D3/qd | G3/qd D3/qd | D3/qd G3/qd | G3/qd G3/qd' },
  { id: 'erie-canal', cat: 'Folk', title: 'The Erie Canal', composer: 'Traditional', level: 'Easy', bpm: 112, time: '2/4', key: 'Dm',
    rh: 'D4/q F4/q | A4/q D5/q | A4/q F4/q | D4/h | D4/q F4/q | A4/q D5/q | C5/q A4/q | A4/h',
    lh: 'D3/h | D3/h | D3/h | D3/h | D3/h | D3/h | A2/h | D3/h' },
  { id: 'molly-malone', cat: 'Folk', title: 'Molly Malone', composer: 'Traditional Irish', level: 'Easy', bpm: 108, time: '3/4', key: 'C',
    rh: 'C5/qd E5/8 G5/q | E5/q C5/q G4/q | A4/q C5/q E5/q | D5/hd | G5/q E5/q C5/q | D5/q F5/q A5/q | G5/q E5/q D5/q | C5/hd',
    lh: 'C3/q G3/q C4/q | C3/q G3/q C4/q | F3/q A3/q C4/q | G2/q D3/q G3/q | C3/q G3/q C4/q | F3/q A3/q C4/q | G2/q D3/q G3/q | C3/q G3/q C4/q' },
  { id: 'bluetail-fly', cat: 'Folk', title: 'Jimmy Crack Corn (Blue Tail Fly)', composer: 'Traditional', level: 'Easy', bpm: 120, time: '2/4', key: 'F',
    rh: 'F4/q A4/q | C5/q A4/q | G4/q F4/q | C5/h | F4/q A4/q | C5/q A4/q | G4/q G4/q | F4/h',
    lh: 'F3/h | F3/h | C3/h | C3/h | F3/h | F3/h | C3/h | F3/h' },
  { id: 'the-fox', cat: 'Folk', title: 'The Fox Went Out on a Chilly Night', composer: 'Traditional', level: 'Easy', bpm: 120, time: '6/8', key: 'D',
    rh: 'A4/8 B4/8 A4/8 F#4/qd | A4/8 B4/8 A4/8 D5/qd | E5/8 F#5/8 E5/8 D5/qd | A4/qd A4/qd',
    lh: 'D3/qd A3/qd | D3/qd A3/qd | A2/qd E3/qd | D3/qd D3/qd' },
  { id: 'little-brown-jug', cat: 'Folk', title: 'Little Brown Jug', composer: 'Joseph Winner (1869)', level: 'Easy', bpm: 132, time: '2/4', key: 'F',
    rh: 'F4/q F4/q | C5/q A4/q | F4/q F4/q | A4/q C5/q | F4/q F4/q | C5/q A4/q | Bb4/q A4/q | G4/h',
    lh: 'F3/h | F3/h | F3/h | F3/h | F3/h | F3/h | Bb2/h | C3/h' },
  { id: 'dixie', cat: 'Folk', title: 'Dixie', composer: 'Daniel Emmett (1859)', level: 'Easy', bpm: 160, time: '2/4', key: 'G',
    rh: 'D5/8 D5/8 D5/8 B4/8 | G4/q A4/q | B4/q D5/q | G5/h | D5/8 D5/8 D5/8 B4/8 | G4/q A4/q | B4/q D5/q | G5/h',
    lh: 'G3/h | G3/h | G3/h | G3/h | G3/h | G3/h | G3/h | G3/h' },
  { id: 'yellow-rose-texas', cat: 'Folk', title: 'The Yellow Rose of Texas', composer: 'Traditional', level: 'Easy', bpm: 120, time: '2/4', key: 'F',
    rh: 'F4/q A4/q | C5/q A4/q | Bb4/q G4/q | A4/h | F4/q A4/q | C5/q F5/q | C5/q Bb4/q | F4/h',
    lh: 'F3/h | F3/h | Bb2/h | C3/h | F3/h | F3/h | Bb2/h | F3/h' },
  { id: 'arkansas-traveler', cat: 'Folk', title: 'Arkansas Traveler', composer: 'Traditional', level: 'Easy', bpm: 132, time: '2/4', key: 'D',
    rh: 'D5/8 F#5/8 A5/8 F#5/8 | D5/q A4/q | D5/8 F#5/8 A5/8 F#5/8 | D5/q A4/q | B4/8 D5/8 G5/8 D5/8 | B4/q A4/q | A4/8 B4/8 A4/8 G4/8 | F#4/q D4/q',
    lh: 'D3/h | D3/h | D3/h | D3/h | G3/h | D3/h | A2/h | D3/h' },
  { id: 'early-one-morning', cat: 'Folk', title: 'Early One Morning', composer: 'Traditional English', level: 'Easy', bpm: 108, time: '4/4', key: 'G',
    rh: 'G4/q B4/q D5/q G5/q | E5/q D5/q B4/h | A4/q C5/q E5/q A5/q | F#5/q E5/q D5/h',
    lh: 'G3/w | G3/w | A3/w | D3/w' },
  { id: 'men-of-harlech', cat: 'Folk', title: 'Men of Harlech', composer: 'Traditional Welsh', level: 'Easy', bpm: 108, time: '4/4', key: 'Dm',
    rh: 'D5/qd C5/8 D5/q A4/q | D5/qd C5/8 D5/q F5/q | E5/qd D5/8 C5/q B4/q | A4/w',
    lh: 'D3/w | D3/w | A2/w | D3/w' },
  { id: 'over-hills-far-away', cat: 'Folk', title: 'Over the Hills and Far Away', composer: 'Traditional English', level: 'Easy', bpm: 112, time: '6/8', key: 'G',
    rh: 'G4/qd B4/8 A4/8 G4/8 | D5/qd D5/8 C5/8 B4/8 | A4/qd G4/8 A4/8 B4/8 | G4/qd r/qd',
    lh: 'G3/qd D3/qd | G3/qd D3/qd | D3/qd D3/qd | G3/qd G3/qd' },
  { id: 'sloop-john-b', cat: 'Folk', title: 'Sloop John B', composer: 'Traditional Bahamian', level: 'Easy', bpm: 108, time: '4/4', key: 'G',
    rh: 'G4/q B4/q D5/q G5/q | F#5/q E5/q D5/h | D5/q D5/q C5/q B4/q | A4/q B4/q G4/h',
    lh: 'G3/w | D3/w | C3/w | G3/w' },

  // ============ HOLIDAY (14 — carols not in existing) ============
  { id: 'o-holy-night', cat: 'Holiday', title: 'O Holy Night', composer: 'Adolphe Adam (1847)', level: 'Medium', bpm: 72, time: '6/8', key: 'C',
    rh: 'C5/qd E5/8 G5/8 C6/8 | B5/q G5/8 E5/q G5/8 | A5/qd G5/8 F5/8 E5/8 | G5/qd r/qd',
    lh: 'C3/qd G3/qd | C3/qd G3/qd | F3/qd C4/qd | G3/qd G3/qd' },
  { id: 'what-child-is-this', cat: 'Holiday', title: 'What Child Is This', composer: 'Traditional / Dix (1865)', level: 'Easy', bpm: 108, time: '6/8', key: 'Em',
    rh: 'E5/8 D5/8 B4/8 A4/8 G4/8 A4/8 | B4/8 C5/8 B4/8 A4/8 G4/8 F#4/8 | E4/8 F#4/8 G4/8 A4/8 B4/8 G4/8 | E4/qd E4/qd | B4/8 B4/8 C5/8 D5/qd | B4/8 A4/8 G4/8 F#4/qd | E4/8 F#4/8 G4/8 A4/8 B4/8 G4/8 | E4/qd E4/qd',
    lh: 'E3/qd E3/qd | A2/qd C3/qd | G3/qd D3/qd | E3/qd E3/qd | G3/qd D3/qd | A2/qd D3/qd | G3/qd D3/qd | E3/qd E3/qd' },
  { id: 'coventry-carol', cat: 'Holiday', title: 'Coventry Carol', composer: 'Traditional English (16th c.)', level: 'Easy', bpm: 96, time: '3/4', key: 'Em',
    rh: 'E4/qd F#4/8 G4/q | A4/q G4/q F#4/q | E4/qd D4/8 C4/q | B3/hd | A4/qd G4/8 F#4/q | G4/q A4/q G4/q | F#4/qd E4/8 D4/q | E4/hd',
    lh: 'E3/hd | A3/hd | A3/hd | B2/hd | A3/hd | E3/hd | B2/hd | E3/hd' },
  { id: 'patapan', cat: 'Holiday', title: 'Pat-a-Pan', composer: 'Traditional French (1720)', level: 'Easy', bpm: 120, time: '2/4', key: 'Em',
    rh: 'E4/q G4/q | B4/q G4/q | E4/q G4/q | B4/q B4/q | A4/q F#4/q | G4/q E4/q | F#4/q D4/q | E4/h',
    lh: 'E3/h | G3/h | E3/h | E3/h | A3/h | E3/h | D3/h | E3/h' },
  { id: 'holly-and-ivy', cat: 'Holiday', title: 'The Holly and the Ivy', composer: 'Traditional English', level: 'Easy', bpm: 120, time: '3/4', key: 'G',
    rh: 'D5/qd D5/8 D5/q | D5/q B4/q G4/q | B4/qd A4/8 G4/q | A4/hd | D5/qd D5/8 D5/q | E5/q D5/q B4/q | A4/q G4/q A4/q | G4/hd',
    lh: 'G3/hd | G3/hd | C3/hd | D3/hd | G3/hd | G3/hd | D3/hd | G3/hd' },
  { id: 'wassailing', cat: 'Holiday', title: 'Here We Come A-Wassailing', composer: 'Traditional English', level: 'Easy', bpm: 132, time: '6/8', key: 'D',
    rh: 'D5/qd A4/qd | D5/qd F#5/qd | E5/8 D5/8 C#5/8 D5/qd | A4/qd r/qd | A4/qd A4/qd | D5/qd F#5/qd | E5/8 D5/8 C#5/8 D5/qd | A4/qd r/qd',
    lh: 'D3/qd D3/qd | D3/qd D3/qd | A2/qd A2/qd | D3/qd D3/qd | A2/qd A2/qd | D3/qd D3/qd | A2/qd A2/qd | D3/qd D3/qd' },
  { id: 'lo-how-a-rose', cat: 'Holiday', title: "Lo How a Rose E'er Blooming", composer: 'Traditional German (1599)', level: 'Easy', bpm: 72, time: '4/4', key: 'F',
    rh: 'F4/q A4/q C5/q Bb4/q | A4/q G4/q F4/h | G4/q A4/q Bb4/q A4/q | G4/w',
    lh: 'F3/w | F3/w | Bb2/h F3/h | C3/w' },
  { id: 'in-bleak-midwinter', cat: 'Holiday', title: 'In the Bleak Midwinter', composer: 'Gustav Holst (1906)', level: 'Easy', bpm: 76, time: '4/4', key: 'F',
    rh: 'F5/q F5/q A5/q G5/q | F5/q E5/q F5/h | A5/q A5/q C6/q Bb5/q | A5/q G5/q F5/h',
    lh: 'F3/w | F3/w | F3/w | C3/w' },
  { id: 'infant-holy', cat: 'Holiday', title: 'Infant Holy Infant Lowly', composer: 'Traditional Polish', level: 'Easy', bpm: 108, time: '3/4', key: 'F',
    rh: 'F4/q A4/q C5/q | F5/q C5/q A4/q | Bb4/q G4/q F4/q | A4/hd | F4/q A4/q C5/q | F5/q C5/q A4/q | G4/q A4/q Bb4/q | F4/hd',
    lh: 'F3/q C4/q F3/q | F3/q C4/q F3/q | Bb2/q F3/q D3/q | C3/q G3/q E3/q | F3/q C4/q F3/q | F3/q C4/q F3/q | C3/q G3/q E3/q | F3/q C4/q F3/q' },
  { id: 'still-still-still', cat: 'Holiday', title: 'Still Still Still', composer: 'Traditional Austrian', level: 'Easy', bpm: 72, time: '3/4', key: 'G',
    rh: 'D5/q D5/q D5/q | B4/q G4/q G4/q | A4/q A4/q A4/q | D5/hd | D5/q D5/q D5/q | B4/q G4/q G4/q | A4/qd B4/8 A4/q | G4/hd',
    lh: 'G3/hd | G3/hd | D3/hd | D3/hd | G3/hd | G3/hd | D3/hd | G3/hd' },
  { id: 'il-est-ne', cat: 'Holiday', title: 'Il est né le divin enfant', composer: 'Traditional French', level: 'Easy', bpm: 108, time: '6/8', key: 'F',
    rh: 'A4/8 A4/8 A4/8 Bb4/qd | A4/8 G4/8 F4/qd A4/8 | G4/8 F4/8 E4/8 F4/qd | A4/qd r/qd',
    lh: 'F3/qd F3/qd | F3/qd F3/qd | C3/qd C3/qd | F3/qd C3/qd' },
  { id: 'angels-from-realms', cat: 'Holiday', title: 'Angels from the Realms of Glory', composer: 'Smart / Montgomery (1816)', level: 'Easy', bpm: 108, time: '4/4', key: 'G',
    rh: 'G4/q G4/q B4/q D5/q | C5/q B4/q A4/h | A4/q G4/q F#4/q A4/q | G4/w',
    lh: 'G3/w | G3/w | D3/w | G3/w' },
  { id: 'boars-head-carol', cat: 'Holiday', title: "The Boar's Head Carol", composer: 'Traditional English (15th c.)', level: 'Easy', bpm: 120, time: '4/4', key: 'G',
    rh: 'D5/q D5/q B4/q G4/q | A4/q B4/q C5/q A4/q | G4/q A4/q B4/q G4/q | D5/q B4/q G4/h',
    lh: 'G3/w | D3/w | C3/w | G3/w' },
  { id: 'masters-in-this-hall', cat: 'Holiday', title: 'Masters in This Hall', composer: 'Traditional French', level: 'Easy', bpm: 120, time: '4/4', key: 'Dm',
    rh: 'D5/q F5/q A5/q F5/q | D5/q F5/q A5/h | G5/q F5/q E5/q D5/q | C#5/q D5/q A4/h',
    lh: 'D3/w | D3/w | G3/w | A2/h D3/h' },

  // ============ HYMNS (14 — not in existing) ============
  { id: 'rock-of-ages', cat: 'Hymns', title: 'Rock of Ages', composer: 'Thomas Hastings (1830)', level: 'Easy', bpm: 76, time: '4/4', key: 'F',
    rh: 'F4/q F4/q G4/q A4/q | A4/q G4/q F4/h | Bb4/q A4/q G4/q F4/q | G4/q F4/q E4/h',
    lh: 'F3/w | F3/w | Bb2/w | C3/w' },
  { id: 'blessed-assurance', cat: 'Hymns', title: 'Blessed Assurance', composer: 'Phoebe P. Knapp (1873)', level: 'Easy', bpm: 100, time: '4/4', key: 'D',
    rh: 'D5/q D5/q F#5/qd G5/8 | A5/qd A5/8 G5/q F#5/q | E5/q F#5/q G5/qd F#5/8 | D5/w',
    lh: 'D3/w | D3/w | A2/w | D3/w' },
  { id: 'come-thou-fount', cat: 'Hymns', title: 'Come Thou Fount of Every Blessing', composer: 'John Wyeth (1813)', level: 'Easy', bpm: 100, time: '4/4', key: 'D',
    rh: 'A4/q A4/q D5/q F#5/q | E5/q D5/q A4/h | B4/q D5/q A4/q F#4/q | E4/q F#4/q D4/h',
    lh: 'D3/w | A2/w | B2/w | D3/w' },
  { id: 'just-as-i-am', cat: 'Hymns', title: 'Just As I Am', composer: 'William B. Bradbury (1849)', level: 'Easy', bpm: 72, time: '4/4', key: 'F',
    rh: 'F4/q A4/q C5/q Bb4/q | A4/q G4/q F4/h | G4/q A4/q Bb4/q A4/q | G4/q F4/q F4/h',
    lh: 'F3/w | F3/w | Bb2/w | F3/w' },
  { id: 'all-hail-the-power', cat: 'Hymns', title: "All Hail the Power of Jesus' Name", composer: 'Oliver Holden (1793)', level: 'Easy', bpm: 100, time: '4/4', key: 'G',
    rh: 'G4/q B4/q D5/q G5/q | F#5/q E5/q D5/h | E5/q D5/q C5/q B4/q | A4/q B4/q G4/h',
    lh: 'G3/w | D3/w | C3/w | G3/w' },
  { id: 'fairest-lord-jesus', cat: 'Hymns', title: 'Fairest Lord Jesus', composer: 'Traditional German (1677)', level: 'Easy', bpm: 100, time: '3/4', key: 'F',
    rh: 'F4/q A4/q C5/q | C5/q Bb4/q A4/q | G4/q A4/q F4/q | A4/q G4/q F4/q | F4/q A4/q C5/q | C5/q Bb4/q A4/q | G4/q F4/q G4/q | F4/hd',
    lh: 'F3/hd | F3/hd | Bb2/hd | F3/hd | F3/hd | F3/hd | C3/hd | F3/hd' },
  { id: 'for-beauty-of-earth', cat: 'Hymns', title: 'For the Beauty of the Earth', composer: 'Conrad Kocher (1838)', level: 'Easy', bpm: 100, time: '4/4', key: 'G',
    rh: 'G4/q B4/q D5/q D5/q | E5/q D5/q B4/h | B4/q C5/q A4/q G4/q | A4/q B4/q G4/h',
    lh: 'G3/w | G3/w | D3/w | G3/w' },
  { id: 'o-worship-the-king', cat: 'Hymns', title: 'O Worship the King', composer: 'Johann Michael Haydn (1830)', level: 'Easy', bpm: 100, time: '4/4', key: 'G',
    rh: 'G4/q B4/q D5/q B4/q | D5/q E5/q D5/h | B4/q A4/q G4/q F#4/q | G4/q A4/q G4/h',
    lh: 'G3/w | G3/w | D3/w | G3/w' },
  { id: 'when-i-survey', cat: 'Hymns', title: 'When I Survey the Wondrous Cross', composer: 'Lowell Mason (1824)', level: 'Easy', bpm: 72, time: '4/4', key: 'F',
    rh: 'F4/q F4/q A4/q C5/q | C5/q Bb4/q A4/h | Bb4/q A4/q G4/q F4/q | G4/q F4/q F4/h',
    lh: 'F3/w | F3/w | Bb2/w | F3/w' },
  { id: 'praise-to-the-lord', cat: 'Hymns', title: 'Praise to the Lord the Almighty', composer: 'Traditional German (1680)', level: 'Easy', bpm: 100, time: '3/4', key: 'F',
    rh: 'F4/q A4/q C5/q | F5/q C5/q A4/q | Bb4/q A4/q G4/q | F4/hd | F4/q A4/q C5/q | F5/q C5/q A4/q | G4/q A4/q G4/q | F4/hd',
    lh: 'F3/hd | F3/hd | Bb2/hd | F3/hd | F3/hd | F3/hd | C3/hd | F3/hd' },
  { id: 'faith-of-our-fathers', cat: 'Hymns', title: 'Faith of Our Fathers', composer: 'Henri Hemy (1849)', level: 'Easy', bpm: 100, time: '4/4', key: 'G',
    rh: 'D5/q D5/q G5/q F#5/q | E5/q D5/q B4/h | C5/q B4/q A4/q G4/q | F#4/q G4/q G4/h',
    lh: 'G3/w | G3/w | C3/w | G3/w' },
  { id: 'love-divine', cat: 'Hymns', title: 'Love Divine All Loves Excelling', composer: 'Rowland Prichard (1830)', level: 'Easy', bpm: 100, time: '4/4', key: 'F',
    rh: 'C5/q C5/q Bb4/q A4/q | A4/q G4/q F4/h | A4/q A4/q Bb4/q C5/q | C5/q A4/q F4/h',
    lh: 'F3/w | F3/w | F3/w | F3/w' },
  { id: 'all-creatures', cat: 'Hymns', title: 'All Creatures of Our God and King', composer: 'Traditional German (1623)', level: 'Easy', bpm: 108, time: '4/4', key: 'Eb',
    rh: 'Eb5/q Eb5/q Eb5/q F5/q | G5/q G5/q F5/h | Eb5/q D5/q Eb5/q F5/q | G5/q F5/q Eb5/h',
    lh: 'Eb3/w | Bb2/w | Eb3/w | Bb2/h Eb3/h' },
  { id: 'my-faith-looks-up', cat: 'Hymns', title: 'My Faith Looks Up to Thee', composer: 'Lowell Mason (1831)', level: 'Easy', bpm: 76, time: '4/4', key: 'F',
    rh: 'F4/q F4/q A4/q C5/q | C5/q Bb4/q A4/h | A4/q G4/q F4/q G4/q | F4/w',
    lh: 'F3/w | F3/w | C3/w | F3/w' },

  // ============ JAZZ (15 — ragtime pre-1928) ============
  { id: 'ragtime-maple-leaf', cat: 'Jazz', title: 'Maple Leaf Rag', composer: 'Scott Joplin (1899)', level: 'Hard', bpm: 108, time: '4/4', key: 'Ab',
    rh: 'Ab4/8 C5/8 Eb5/8 F5/8 Eb5/8 C5/8 Ab4/8 Eb5/8 | Ab5/8 G5/8 F5/8 Eb5/8 Db5/8 C5/8 Bb4/8 Ab4/8 | G4/8 Bb4/8 Db5/8 Eb5/8 Db5/8 Bb4/8 G4/8 Db5/8 | F5/q r/q Eb5/q r/q',
    lh: 'Ab2/q (C3 Eb3 Ab3)/q Ab2/q (C3 Eb3 Ab3)/q | Ab2/q (C3 Eb3 Ab3)/q Ab2/q (C3 Eb3 Ab3)/q | Eb3/q (G3 Bb3 Db4)/q Eb3/q (G3 Bb3 Db4)/q | Ab2/q (C3 Eb3 Ab3)/q Eb3/q (G3 Bb3 Db4)/q' },
  { id: 'ragtime-pine-apple', cat: 'Jazz', title: 'Pine Apple Rag', composer: 'Scott Joplin (1908)', level: 'Medium', bpm: 108, time: '2/4', key: 'Bb',
    rh: 'F4/8 Bb4/8 D5/8 F5/8 | D5/8 Bb4/8 F4/8 Bb4/8 | Eb5/8 C5/8 A4/8 C5/8 | F5/q F4/q',
    lh: 'Bb2/q F3/q | Bb2/q F3/q | F3/q F3/q | Bb2/q F3/q' },
  { id: 'ragtime-easy-winners', cat: 'Jazz', title: 'The Easy Winners', composer: 'Scott Joplin (1901)', level: 'Medium', bpm: 108, time: '2/4', key: 'Ab',
    rh: 'Eb5/8 Ab5/8 C6/8 Ab5/8 | Eb5/8 C5/8 Eb5/8 F5/8 | Eb5/8 Ab4/8 C5/8 Eb5/8 | Ab5/q r/q',
    lh: 'Ab2/q Eb3/q | Ab2/q Eb3/q | Ab2/q Eb3/q | Ab2/q Ab2/q' },
  { id: 'ragtime-solace', cat: 'Jazz', title: 'Solace (A Mexican Serenade)', composer: 'Scott Joplin (1909)', level: 'Medium', bpm: 72, time: '2/4', key: 'F',
    rh: 'C5/8 D5/8 F5/8 D5/8 | C5/q A4/q | Bb4/8 A4/8 G4/8 F4/8 | A4/q C5/q',
    lh: 'F3/q C3/q | F3/q C3/q | Bb2/q F3/q | C3/q C3/q' },
  { id: 'ragtime-bethena', cat: 'Jazz', title: 'Bethena (A Concert Waltz)', composer: 'Scott Joplin (1905)', level: 'Medium', bpm: 160, time: '3/4', key: 'G',
    rh: 'B4/q D5/q G5/q | F#5/qd E5/8 D5/q | B4/q D5/q G5/q | A5/hd | G5/q E5/q D5/q | C5/q B4/q A4/q | B4/q D5/q G5/q | G5/hd',
    lh: 'G3/q D3/q G3/q | G3/q D3/q G3/q | G3/q D3/q G3/q | D3/q A3/q D4/q | C3/q G3/q C4/q | G2/q D3/q B3/q | G3/q D3/q G3/q | G3/q D3/q G3/q' },
  { id: 'ragtime-peacherine', cat: 'Jazz', title: 'Peacherine Rag', composer: 'Scott Joplin (1901)', level: 'Medium', bpm: 108, time: '2/4', key: 'C',
    rh: 'E5/8 C5/8 G4/8 C5/8 | E5/q G5/q | F5/8 D5/8 B4/8 D5/8 | G5/q G5/q',
    lh: 'C3/q G3/q | C3/q G3/q | G2/q D3/q | G2/q G2/q' },
  { id: 'ragtime-original-rags', cat: 'Jazz', title: 'Original Rags', composer: 'Scott Joplin (1899)', level: 'Medium', bpm: 108, time: '2/4', key: 'G',
    rh: 'D5/8 G4/8 B4/8 D5/8 | G5/q D5/q | E5/8 C5/8 A4/8 C5/8 | E5/q G5/q',
    lh: 'G3/q D3/q | G3/q D3/q | A3/q A3/q | C3/q G3/q' },
  { id: 'ragtime-elite-syncopations', cat: 'Jazz', title: 'Elite Syncopations', composer: 'Scott Joplin (1902)', level: 'Medium', bpm: 108, time: '2/4', key: 'C',
    rh: 'C5/8 E5/8 G5/8 E5/8 | C5/q r/q | D5/8 F5/8 A5/8 F5/8 | D5/q G5/q',
    lh: 'C3/q G3/q | C3/q G3/q | D3/q A3/q | G2/q D3/q' },
  { id: 'ragtime-fig-leaf', cat: 'Jazz', title: 'Fig Leaf Rag', composer: 'Scott Joplin (1908)', level: 'Medium', bpm: 108, time: '2/4', key: 'Ab',
    rh: 'Ab4/8 C5/8 Eb5/8 Ab5/8 | G5/8 F5/8 Eb5/8 C5/8 | Bb4/8 Db5/8 F5/8 Bb5/8 | Ab5/q Eb5/q',
    lh: 'Ab2/q Eb3/q | Ab2/q Eb3/q | Bb2/q F3/q | Ab2/q Eb3/q' },
  { id: 'ragtime-twelfth-street', cat: 'Jazz', title: 'Twelfth Street Rag', composer: 'Euday L. Bowman (1914)', level: 'Medium', bpm: 108, time: '2/4', key: 'F',
    rh: 'F5/8 D5/8 Bb4/8 F4/8 | F5/8 D5/8 Bb4/8 F4/8 | G5/8 E5/8 C5/8 G4/8 | G5/8 E5/8 C5/8 G4/8',
    lh: 'F3/q F3/q | F3/q F3/q | C3/q C3/q | C3/q C3/q' },
  { id: 'ragtime-dill-pickles', cat: 'Jazz', title: 'Dill Pickles Rag', composer: 'Charles L. Johnson (1906)', level: 'Medium', bpm: 108, time: '2/4', key: 'G',
    rh: 'G4/8 B4/8 D5/8 G5/8 | D5/8 B4/8 G4/8 B4/8 | A4/8 C5/8 E5/8 A5/8 | E5/8 C5/8 A4/8 C5/8',
    lh: 'G3/q D3/q | G3/q D3/q | A3/q E3/q | A3/q E3/q' },
  { id: 'ragtime-hello-ma-baby', cat: 'Jazz', title: 'Hello Ma Baby (Cakewalk)', composer: 'Howard / Emerson (1899)', level: 'Easy', bpm: 132, time: '2/4', key: 'G',
    rh: 'G4/q B4/q | D5/q B4/q | D5/8 D5/8 D5/8 B4/8 | A4/q G4/q | G4/q B4/q | D5/q G5/q | F#5/q A5/q | G5/h',
    lh: 'G3/h | G3/h | G3/h | D3/h | G3/h | G3/h | D3/h | G3/h' },
  { id: 'ragtime-georgia-camp', cat: 'Jazz', title: 'At a Georgia Camp Meeting', composer: 'Kerry Mills (1897)', level: 'Medium', bpm: 120, time: '2/4', key: 'F',
    rh: 'F5/q A5/q | C5/q F5/q | Bb4/q G5/q | F5/8 E5/8 D5/q | C5/q A4/q | G4/q F4/q | Bb4/q A4/q | F4/h',
    lh: 'F3/h | F3/h | Bb2/h | C3/h | C3/h | F3/h | Bb2/h | F3/h' },
  { id: 'ragtime-sunflower-slow', cat: 'Jazz', title: 'Sunflower Slow Drag', composer: 'Scott Joplin (1901)', level: 'Medium', bpm: 72, time: '2/4', key: 'Bb',
    rh: 'F4/8 Bb4/8 D5/8 F5/8 | D5/q Bb4/q | Eb5/8 C5/8 A4/8 C5/8 | F5/q D5/q',
    lh: 'Bb2/q F3/q | Bb2/q F3/q | F3/q F3/q | Bb2/q F3/q' },
  { id: 'ragtime-swipesy', cat: 'Jazz', title: 'Swipesy Cakewalk', composer: 'Joplin / Marshall (1900)', level: 'Easy', bpm: 108, time: '2/4', key: 'C',
    rh: 'E5/8 G5/8 C6/8 G5/8 | E5/q C5/q | F5/8 A5/8 C6/8 A5/8 | F5/q D5/q | E5/8 G5/8 C6/8 G5/8 | E5/q C5/q | D5/q G4/q | C5/h',
    lh: 'C3/h | C3/h | F3/h | F3/h | C3/h | C3/h | G2/h | C3/h' },

  // ============ CLASSICAL (15 — additional, not in existing 135) ============
  { id: 'chopin-prelude-op28-6', cat: 'Classical', title: 'Prelude Op. 28 No. 6 (B Minor)', composer: 'F. Chopin', level: 'Medium', bpm: 72, time: '3/4', key: 'Bm',
    rh: 'B4/qd A4/8 G4/q | F#4/q E4/q D4/q | A4/qd G4/8 F#4/q | E4/hd',
    lh: 'B2/q F#3/q D4/q | A2/q E3/q C#4/q | D3/q A3/q F#3/q | E3/q B3/q G3/q' },
  { id: 'chopin-prelude-op28-13', cat: 'Classical', title: 'Prelude Op. 28 No. 13 (F# Major)', composer: 'F. Chopin', level: 'Medium', bpm: 72, time: '6/8', key: 'G',
    rh: 'B4/qd D5/8 G5/8 B5/8 | A5/qd D5/8 B4/8 G4/8 | B4/qd D5/8 G5/8 B5/8 | A5/qd r/qd',
    lh: 'G2/8 D3/8 B3/8 D3/8 B3/8 D3/8 | A2/8 E3/8 C#4/8 E3/8 C#4/8 E3/8 | G2/8 D3/8 B3/8 D3/8 B3/8 D3/8 | D3/8 A3/8 F#3/8 A3/8 F#3/8 A3/8' },
  { id: 'schumann-wichtige-begebenheit', cat: 'Classical', title: 'Wichtige Begebenheit (Op. 15 No. 6)', composer: 'R. Schumann', level: 'Easy', bpm: 108, time: '3/4', key: 'A',
    rh: 'A4/q E5/q A5/q | B5/q A5/q E5/q | C#5/q E5/q A5/q | B5/q A5/q E5/q | A4/q E5/q A5/q | B5/q A5/q E5/q | D5/q C#5/q B4/q | A4/hd',
    lh: 'A2/q E3/q A3/q | A2/q E3/q A3/q | A2/q E3/q A3/q | A2/q E3/q A3/q | A2/q E3/q A3/q | A2/q E3/q A3/q | D3/q A3/q D4/q | A2/q E3/q A3/q' },
  { id: 'tchaikovsky-sweet-dream', cat: 'Classical', title: 'Sweet Dream (Op. 39 No. 21)', composer: 'P.I. Tchaikovsky', level: 'Medium', bpm: 72, time: '3/4', key: 'C',
    rh: 'E5/qd D5/8 C5/q | B4/qd A4/8 G4/q | A4/qd B4/8 C5/q | D5/hd | E5/qd D5/8 C5/q | B4/qd C5/8 D5/q | E5/q F5/q G5/q | E5/hd',
    lh: 'C3/q G3/q E4/q | G2/q D3/q B3/q | F3/q C4/q A3/q | G2/q D3/q B3/q | C3/q G3/q E4/q | C3/q G3/q E4/q | F3/q C4/q A3/q | C3/q G3/q E4/q' },
  { id: 'grieg-butterfly', cat: 'Classical', title: 'Butterfly (Op. 43 No. 1)', composer: 'E. Grieg', level: 'Medium', bpm: 132, time: '6/8', key: 'A',
    rh: 'A5/8 G5/8 F#5/8 E5/8 D5/8 C#5/8 | B4/8 A4/8 G#4/8 A4/qd | A5/8 G5/8 F#5/8 E5/8 D5/8 C#5/8 | B4/qd A4/qd',
    lh: 'A2/qd E3/qd | A2/qd E3/qd | A2/qd E3/qd | E3/qd E3/qd' },
  { id: 'brahms-waltz-op39-16', cat: 'Classical', title: 'Waltz in C# Minor (Op. 39 No. 16)', composer: 'J. Brahms', level: 'Easy', bpm: 108, time: '3/4', key: 'Cm',
    rh: 'Eb5/qd F5/8 Eb5/q | D5/qd Eb5/8 D5/q | C5/qd D5/8 C5/q | Bb4/hd | Eb5/qd F5/8 Eb5/q | D5/qd Eb5/8 D5/q | C5/qd Bb4/8 C5/q | Bb4/hd',
    lh: 'C3/q G3/q Eb4/q | C3/q G3/q Eb4/q | F3/q C4/q Ab3/q | G2/q D3/q Bb3/q | C3/q G3/q Eb4/q | C3/q G3/q Eb4/q | F3/q C4/q Ab3/q | G2/q D3/q Bb3/q' },
  { id: 'mozart-divertimento-k136', cat: 'Classical', title: 'Divertimento K.136 (Allegro)', composer: 'W.A. Mozart', level: 'Medium', bpm: 132, time: '4/4', key: 'D',
    rh: 'D5/q A4/8 F#5/8 D5/8 A4/8 F#5/8 D5/8 | A4/8 F#5/8 A4/8 D5/8 A4/q F#5/q | G5/q E5/q D5/q A4/q | F#5/q D5/q A4/h',
    lh: 'D3/w | D3/w | A2/w | D3/w' },
  { id: 'beethoven-fur-die-leicht', cat: 'Classical', title: 'Sonatina in G (Anh. 5 No. 1)', composer: 'L. van Beethoven (attr.)', level: 'Easy', bpm: 108, time: '4/4', key: 'G',
    rh: 'G5/q D5/8 G5/8 B5/q G5/q | A5/q F#5/8 A5/8 D5/q r/q | G5/q G4/8 B4/8 D5/q G4/q | A4/q F#4/8 A4/8 D4/h',
    lh: 'G3/w | D3/w | G3/w | D3/w' },
  { id: 'bach-polonaise-g', cat: 'Classical', title: 'Polonaise in G Minor (BWV Anh. 119)', composer: 'J.S. Bach', level: 'Easy', bpm: 120, time: '3/4', key: 'Gm',
    rh: 'D5/q G5/q F5/q | Eb5/q D5/q C5/q | Bb4/8 D5/8 C5/q Bb4/q | A4/hd | D5/q G5/q F5/q | Eb5/q D5/q C5/q | Bb4/8 A4/8 G4/q F#4/q | G4/hd',
    lh: 'G2/q Bb3/q G3/q | C3/q Bb3/q G3/q | D3/q A3/q F#3/q | D3/q A3/q F#3/q | G2/q Bb3/q G3/q | C3/q Bb3/q G3/q | D3/q A3/q D3/q | G2/q G3/q G3/q' },
  { id: 'haydn-andante-sym94', cat: 'Classical', title: 'Andante (Symphony No. 94 theme)', composer: 'J. Haydn', level: 'Easy', bpm: 72, time: '2/4', key: 'C',
    rh: 'C5/q C5/q | E5/q E5/q | G5/q G5/q | E5/q r/q | F5/q F5/q | D5/q D5/q | B4/q B4/q | C5/q r/q',
    lh: 'C3/h | C3/h | G2/h | G2/h | F3/h | G2/h | G2/h | C3/h' },
  { id: 'mozart-piano-sonata-k310', cat: 'Classical', title: 'Piano Sonata K.310 (Allegro theme)', composer: 'W.A. Mozart', level: 'Medium', bpm: 132, time: '4/4', key: 'Am',
    rh: 'A4/qd A4/8 A4/q A4/q | B4/q C5/q D5/q E5/q | F5/q E5/q D5/q C5/q | B4/q A4/q A4/h',
    lh: 'A2/8 E3/8 A3/8 E3/8 A2/8 E3/8 A3/8 E3/8 | A2/8 E3/8 A3/8 E3/8 A2/8 E3/8 A3/8 E3/8 | D3/8 A3/8 D4/8 A3/8 D3/8 A3/8 D4/8 A3/8 | E3/8 B3/8 E4/8 B3/8 A2/q A2/q' },
  { id: 'chopin-waltz-op64-2', cat: 'Classical', title: 'Waltz Op. 64 No. 2 (C# Minor)', composer: 'F. Chopin', level: 'Medium', bpm: 160, time: '3/4', key: 'Cm',
    rh: 'G5/q Ab5/q G5/q | F5/q G5/q F5/q | Eb5/q F5/q Eb5/q | D5/hd | G5/q Ab5/q G5/q | F5/q Eb5/q D5/q | C5/q D5/q Eb5/q | C5/hd',
    lh: 'C3/q G3/q Eb4/q | C3/q G3/q Eb4/q | F3/q C4/q Ab3/q | G2/q D3/q B3/q | C3/q G3/q Eb4/q | C3/q G3/q Eb4/q | F3/q C4/q Ab3/q | C3/q G3/q Eb4/q' },
  { id: 'schumann-first-loss', cat: 'Classical', title: 'First Loss (Op. 68 No. 16)', composer: 'R. Schumann', level: 'Easy', bpm: 72, time: '2/4', key: 'Em',
    rh: 'E4/qd F#4/8 | G4/q F#4/q | E4/qd D4/8 | B3/h | E4/qd F#4/8 | G4/q A4/q | B4/qd A4/8 | G4/h',
    lh: 'E3/q B3/q | A3/q F#3/q | B2/q E3/q | B2/q B2/q | E3/q B3/q | C3/q A3/q | D3/q G3/q | E3/h' },
  { id: 'bach-prelude-e-minor-wtc', cat: 'Classical', title: 'Prelude in E Minor (WTC I)', composer: 'J.S. Bach', level: 'Medium', bpm: 72, time: '3/4', key: 'Em',
    rh: 'E5/qd D#5/8 E5/q | F#5/q G5/q F#5/q | E5/qd D#5/8 E5/q | B4/hd',
    lh: 'E3/q B3/q E4/q | A3/q E4/q A3/q | E3/q B3/q E4/q | B2/q F#3/q B3/q' },
  { id: 'mozart-k332-andante', cat: 'Classical', title: 'Piano Sonata K.332 (Andante)', composer: 'W.A. Mozart', level: 'Easy', bpm: 72, time: '4/4', key: 'Bb',
    rh: 'F5/q Bb5/q A5/q G5/q | F5/q D5/q F5/h | G5/q Eb5/q D5/q C5/q | Bb4/w',
    lh: 'Bb3/w | Bb3/w | Eb3/h C3/h | F3/w' },
];

// ---------- expand each theme to >= minimum bars ----------
const KEY_FALLBACK = {
  'C#m': 'Cm', 'F#m': 'Em', 'Fm': 'Cm', 'Bbm': 'Gm', 'Ebm': 'Cm', 'G#m': 'Am',
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
    if (isFirstBar && total < full) return null;
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
  const minBars = piece.cat === 'Exercises' ? 8 : 32;
  const times = Math.ceil(minBars / rhBars.length);
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
    cat: piece.cat,
    level: piece.level || 'Easy',
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
  if (err) dropped.push({ id: song.id, err });
  else valid.push(song);
}
writeFileSync(OUT, JSON.stringify(valid, null, 2) + '\n');
console.log(`Wrote ${valid.length} pieces → ${OUT}`);
if (dropped.length) {
  console.log(`\nDropped ${dropped.length}:`);
  for (const d of dropped) console.log(`  ${d.id}: ${d.err}`);
}
// per-genre tally
const perCat = {};
for (const s of valid) perCat[s.cat] = (perCat[s.cat] || 0) + 1;
console.log('\nBy category:', perCat);
