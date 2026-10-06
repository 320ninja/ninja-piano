# Ninja Piano song format

Each `songs/<category>.json` file is a JSON array of songs:

```json
{
  "id": "twinkle-twinkle",
  "title": "Twinkle Twinkle Little Star",
  "composer": "Traditional",
  "cat": "Kids",
  "level": "Easy",
  "bpm": 100,
  "time": "4/4",
  "key": "C",
  "rh": "C4/q C4/q G4/q G4/q | A4/q A4/q G4/h",
  "lh": "C3/w | F3/h C3/h"
}
```

- `cat`: one of Kids, Classical, Pop, Folk, Holiday, Hymns, Exercises, Jazz, Blues, Rock, EDM
- `level`: Easy, Medium or Hard
- `key`: a major key (C G D A E F Bb Eb Ab) or a minor key (Am Em Bm Dm Gm Cm)
- `time`: 2/4, 3/4, 4/4 or 6/8
- `rh` is the treble clef (right hand), `lh` is the bass clef (left hand). Bars are separated by `|`, and both hands must have the same number of bars.
- Note: `<pitch><octave>/<duration>`, e.g. `C4/q`, `F#4/8`, `Bb3/h`. Always write the real pitch, sharps and flats included, even when the key signature implies them.
- Durations: `w` `h` `q` `8` `16`. Add `d` for dotted: `hd` `qd` `8d`.
- Rest: `r/q`. Chord: `(C3 E3 G3)/h`.
- Every bar must add up exactly to the time signature, except a pickup bar (anacrusis) as the very first bar, which may be shorter in both hands as long as both hands match.
- Right-hand range is A3–C6. Left-hand range is C2–E4.
- Only use music in the public domain: traditional, folk, or composers who died before 1955.

Run `node tools/validate.mjs` to check every file.

## Length
Songs must be the FULL song, not an excerpt: every verse, chorus, bridge and section, with repeats, first/second endings and D.C./D.S. written out in full. The minimum is 32 bars (8 for Exercises); most songs should be 48–128 bars. Classical pieces include the whole piece, or the whole movement section a learner would play (e.g. Für Elise: A–B–A–C–A).
