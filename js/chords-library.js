// Chords Library — popular songs with chord data
export const CHORDS_LIBRARY = [
  // ── POP ────────────────────────────────────────────────────────────────────
  {
    id: 'shape-of-you',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    year: 2017, genre: 'Pop', key: 'C#m', tempo: '96 BPM', difficulty: 'Easy',
    chords: ['C#m', 'F#m', 'A', 'B'],
    sections: [
      { name: 'Verse', chords: ['C#m', 'F#m', 'A', 'B'] },
      { name: 'Pre-Chorus', chords: ['C#m', 'F#m', 'A', 'B'] },
      { name: 'Chorus', chords: ['C#m', 'F#m', 'A', 'B'] },
    ],
  },
  {
    id: 'blinding-lights',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    year: 2019, genre: 'Pop', key: 'Am', tempo: '171 BPM', difficulty: 'Easy',
    chords: ['Am', 'F', 'C', 'G'],
    sections: [
      { name: 'Verse', chords: ['Am', 'F', 'C', 'G'] },
      { name: 'Chorus', chords: ['Am', 'F', 'C', 'G'] },
    ],
  },
  {
    id: 'someone-like-you',
    title: 'Someone Like You',
    artist: 'Adele',
    year: 2011, genre: 'Pop', key: 'A', tempo: '68 BPM', difficulty: 'Easy',
    chords: ['A', 'E', 'F#m', 'D'],
    sections: [
      { name: 'Verse', chords: ['A', 'E', 'F#m', 'D'] },
      { name: 'Chorus', chords: ['A', 'E', 'F#m', 'D'] },
    ],
  },
  {
    id: 'rolling-in-the-deep',
    title: 'Rolling in the Deep',
    artist: 'Adele',
    year: 2010, genre: 'Pop', key: 'Am', tempo: '105 BPM', difficulty: 'Easy',
    chords: ['Am', 'G', 'F', 'E'],
    sections: [
      { name: 'Verse', chords: ['Am', 'G'] },
      { name: 'Chorus', chords: ['Am', 'G', 'F', 'E'] },
    ],
  },
  {
    id: 'thinking-out-loud',
    title: 'Thinking Out Loud',
    artist: 'Ed Sheeran',
    year: 2014, genre: 'Pop', key: 'D', tempo: '79 BPM', difficulty: 'Easy',
    chords: ['D', 'G', 'A', 'Bm'],
    sections: [
      { name: 'Verse', chords: ['D', 'G', 'A', 'Bm'] },
      { name: 'Chorus', chords: ['D', 'G', 'A', 'Bm'] },
    ],
  },
  {
    id: 'perfect',
    title: 'Perfect',
    artist: 'Ed Sheeran',
    year: 2017, genre: 'Pop', key: 'G', tempo: '95 BPM', difficulty: 'Easy',
    chords: ['G', 'Em', 'C', 'D'],
    sections: [
      { name: 'Verse', chords: ['G', 'Em', 'C', 'D'] },
      { name: 'Chorus', chords: ['G', 'Em', 'C', 'D'] },
    ],
  },
  {
    id: 'stay-with-me',
    title: 'Stay With Me',
    artist: 'Sam Smith',
    year: 2014, genre: 'Pop', key: 'C', tempo: '84 BPM', difficulty: 'Easy',
    chords: ['Am', 'F', 'C', 'G'],
    sections: [
      { name: 'Verse', chords: ['Am', 'F', 'C'] },
      { name: 'Chorus', chords: ['Am', 'F', 'C', 'G'] },
    ],
  },
  {
    id: 'shallow',
    title: 'Shallow',
    artist: 'Lady Gaga & Bradley Cooper',
    year: 2018, genre: 'Pop', key: 'G', tempo: '96 BPM', difficulty: 'Medium',
    chords: ['Em', 'D', 'G', 'C', 'Am'],
    sections: [
      { name: 'Verse', chords: ['Em', 'D', 'G', 'C'] },
      { name: 'Chorus', chords: ['Am', 'D', 'G', 'Em'] },
    ],
  },
  {
    id: 'drivers-license',
    title: "Driver's License",
    artist: 'Olivia Rodrigo',
    year: 2021, genre: 'Pop', key: 'G', tempo: '76 BPM', difficulty: 'Easy',
    chords: ['G', 'D', 'Em', 'C'],
    sections: [
      { name: 'Verse', chords: ['G', 'D', 'Em', 'C'] },
      { name: 'Chorus', chords: ['G', 'D', 'Em', 'C'] },
    ],
  },
  {
    id: 'levitating',
    title: 'Levitating',
    artist: 'Dua Lipa',
    year: 2020, genre: 'Pop', key: 'F', tempo: '103 BPM', difficulty: 'Easy',
    chords: ['Dm', 'Am', 'Bb', 'F'],
    sections: [
      { name: 'Verse', chords: ['Dm', 'Am', 'Bb', 'F'] },
      { name: 'Chorus', chords: ['Dm', 'Am', 'Bb', 'F'] },
    ],
  },
  {
    id: 'as-it-was',
    title: 'As It Was',
    artist: 'Harry Styles',
    year: 2022, genre: 'Pop', key: 'F#m', tempo: '174 BPM', difficulty: 'Easy',
    chords: ['F#m', 'A', 'E', 'D'],
    sections: [
      { name: 'Verse', chords: ['F#m', 'A', 'E', 'D'] },
      { name: 'Chorus', chords: ['F#m', 'A', 'E', 'D'] },
    ],
  },
  {
    id: 'anti-hero',
    title: 'Anti-Hero',
    artist: 'Taylor Swift',
    year: 2022, genre: 'Pop', key: 'C', tempo: '97 BPM', difficulty: 'Easy',
    chords: ['C', 'G', 'Am', 'F'],
    sections: [
      { name: 'Verse', chords: ['C', 'G', 'Am'] },
      { name: 'Chorus', chords: ['C', 'G', 'Am', 'F'] },
    ],
  },
  {
    id: 'flowers',
    title: 'Flowers',
    artist: 'Miley Cyrus',
    year: 2023, genre: 'Pop', key: 'Bm', tempo: '119 BPM', difficulty: 'Easy',
    chords: ['Bm', 'D', 'A', 'E'],
    sections: [
      { name: 'Verse', chords: ['Bm', 'D', 'A', 'E'] },
      { name: 'Chorus', chords: ['Bm', 'D', 'A', 'E'] },
    ],
  },
  {
    id: 'happy',
    title: 'Happy',
    artist: 'Pharrell Williams',
    year: 2013, genre: 'Pop', key: 'F', tempo: '160 BPM', difficulty: 'Easy',
    chords: ['F', 'Bb', 'Dm', 'Eb'],
    sections: [
      { name: 'Verse', chords: ['F', 'Bb', 'Dm', 'Eb'] },
      { name: 'Chorus', chords: ['F', 'Bb', 'Dm', 'Eb'] },
    ],
  },
  {
    id: 'uptown-funk',
    title: 'Uptown Funk',
    artist: 'Bruno Mars',
    year: 2014, genre: 'Pop', key: 'Dm', tempo: '115 BPM', difficulty: 'Easy',
    chords: ['Dm', 'G', 'Dm', 'G'],
    sections: [
      { name: 'Verse', chords: ['Dm', 'G'] },
      { name: 'Chorus', chords: ['Dm', 'G'] },
    ],
  },

  // ── ROCK ───────────────────────────────────────────────────────────────────
  {
    id: 'let-it-be',
    title: 'Let It Be',
    artist: 'The Beatles',
    year: 1970, genre: 'Rock', key: 'C', tempo: '73 BPM', difficulty: 'Easy',
    chords: ['C', 'G', 'Am', 'F'],
    sections: [
      { name: 'Verse', chords: ['C', 'G', 'Am', 'F'] },
      { name: 'Chorus', chords: ['C', 'G', 'F', 'C'] },
    ],
  },
  {
    id: 'hotel-california',
    title: 'Hotel California',
    artist: 'Eagles',
    year: 1977, genre: 'Rock', key: 'Am', tempo: '75 BPM', difficulty: 'Hard',
    chords: ['Am', 'E7', 'G', 'D', 'F', 'C', 'Dm', 'E'],
    sections: [
      { name: 'Verse', chords: ['Am', 'E7', 'G', 'D', 'F', 'C', 'Dm', 'E'] },
      { name: 'Chorus', chords: ['F', 'C', 'E', 'Am'] },
    ],
  },
  {
    id: 'sweet-home-alabama',
    title: 'Sweet Home Alabama',
    artist: 'Lynyrd Skynyrd',
    year: 1974, genre: 'Rock', key: 'D', tempo: '97 BPM', difficulty: 'Easy',
    chords: ['D', 'C', 'G'],
    sections: [
      { name: 'Main Riff', chords: ['D', 'C', 'G'] },
      { name: 'Chorus', chords: ['D', 'C', 'G'] },
    ],
  },
  {
    id: 'knockin-on-heavens-door',
    title: "Knockin' on Heaven's Door",
    artist: 'Bob Dylan',
    year: 1973, genre: 'Rock', key: 'G', tempo: '72 BPM', difficulty: 'Easy',
    chords: ['G', 'D', 'Am', 'C'],
    sections: [
      { name: 'Verse', chords: ['G', 'D', 'Am'] },
      { name: 'Alt Verse', chords: ['G', 'D', 'C'] },
    ],
  },
  {
    id: 'wonderwall',
    title: 'Wonderwall',
    artist: 'Oasis',
    year: 1995, genre: 'Rock', key: 'Em', tempo: '87 BPM', difficulty: 'Easy',
    chords: ['Em7', 'G', 'Dsus4', 'A7sus4'],
    sections: [
      { name: 'Verse', chords: ['Em7', 'G', 'Dsus4', 'A7sus4'] },
      { name: 'Chorus', chords: ['C', 'Em7', 'G', 'Em7'] },
    ],
  },
  {
    id: 'with-or-without-you',
    title: 'With or Without You',
    artist: 'U2',
    year: 1987, genre: 'Rock', key: 'D', tempo: '110 BPM', difficulty: 'Easy',
    chords: ['D', 'A', 'Bm', 'G'],
    sections: [
      { name: 'Verse', chords: ['D', 'A', 'Bm', 'G'] },
      { name: 'Chorus', chords: ['D', 'A', 'Bm', 'G'] },
    ],
  },
  {
    id: 'house-rising-sun',
    title: 'House of the Rising Sun',
    artist: 'The Animals',
    year: 1964, genre: 'Rock', key: 'Am', tempo: '80 BPM', difficulty: 'Medium',
    chords: ['Am', 'C', 'D', 'F', 'E'],
    sections: [
      { name: 'Verse', chords: ['Am', 'C', 'D', 'F', 'Am', 'E'] },
    ],
  },
  {
    id: 'come-as-you-are',
    title: 'Come as You Are',
    artist: 'Nirvana',
    year: 1991, genre: 'Rock', key: 'Em', tempo: '120 BPM', difficulty: 'Easy',
    chords: ['Em', 'G', 'Am', 'C'],
    sections: [
      { name: 'Verse', chords: ['Em', 'G'] },
      { name: 'Chorus', chords: ['Am', 'C', 'G', 'Em'] },
    ],
  },
  {
    id: 'yesterday',
    title: 'Yesterday',
    artist: 'The Beatles',
    year: 1965, genre: 'Rock', key: 'F', tempo: '96 BPM', difficulty: 'Medium',
    chords: ['F', 'Em7', 'A7', 'Dm', 'Bb', 'C7'],
    sections: [
      { name: 'Verse', chords: ['F', 'Em7', 'A7', 'Dm'] },
      { name: 'Bridge', chords: ['Bb', 'C7', 'F'] },
    ],
  },
  {
    id: 'free-fallin',
    title: "Free Fallin'",
    artist: 'Tom Petty',
    year: 1989, genre: 'Rock', key: 'F', tempo: '84 BPM', difficulty: 'Easy',
    chords: ['F', 'Bb', 'C'],
    sections: [
      { name: 'Verse', chords: ['F', 'Bb', 'F', 'Bb'] },
      { name: 'Chorus', chords: ['F', 'Bb', 'C', 'Bb'] },
    ],
  },

  // ── R&B / SOUL ─────────────────────────────────────────────────────────────
  {
    id: 'no-one',
    title: 'No One',
    artist: 'Alicia Keys',
    year: 2007, genre: 'R&B', key: 'Ab', tempo: '75 BPM', difficulty: 'Easy',
    chords: ['Ab', 'Eb', 'Fm', 'Db'],
    sections: [
      { name: 'Verse', chords: ['Ab', 'Eb', 'Fm', 'Db'] },
      { name: 'Chorus', chords: ['Ab', 'Eb', 'Fm', 'Db'] },
    ],
  },
  {
    id: 'halo',
    title: 'Halo',
    artist: 'Beyoncé',
    year: 2008, genre: 'R&B', key: 'Ab', tempo: '85 BPM', difficulty: 'Easy',
    chords: ['Ab', 'Eb', 'Fm', 'Db'],
    sections: [
      { name: 'Verse', chords: ['Ab', 'Eb', 'Fm', 'Db'] },
      { name: 'Chorus', chords: ['Ab', 'Eb', 'Fm', 'Db'] },
    ],
  },
  {
    id: 'i-will-always-love-you',
    title: 'I Will Always Love You',
    artist: 'Whitney Houston',
    year: 1992, genre: 'R&B', key: 'Db', tempo: '68 BPM', difficulty: 'Medium',
    chords: ['Db', 'Ab', 'Bbm', 'Gb'],
    sections: [
      { name: 'Verse', chords: ['Db', 'Ab', 'Bbm', 'Gb'] },
      { name: 'Chorus', chords: ['Db', 'Ab', 'Bbm', 'Gb'] },
    ],
  },
  {
    id: 'isnt-she-lovely',
    title: "Isn't She Lovely",
    artist: 'Stevie Wonder',
    year: 1976, genre: 'R&B', key: 'F#', tempo: '124 BPM', difficulty: 'Medium',
    chords: ['F#', 'B', 'C#', 'D#m'],
    sections: [
      { name: 'Main', chords: ['F#', 'B', 'C#', 'F#'] },
    ],
  },
  {
    id: 'kiss',
    title: 'Kiss',
    artist: 'Prince',
    year: 1986, genre: 'R&B', key: 'A', tempo: '112 BPM', difficulty: 'Easy',
    chords: ['A7', 'D7', 'E7'],
    sections: [
      { name: 'Verse', chords: ['A7'] },
      { name: 'Chorus', chords: ['A7', 'D7', 'E7'] },
    ],
  },

  // ── JAZZ ───────────────────────────────────────────────────────────────────
  {
    id: 'autumn-leaves',
    title: 'Autumn Leaves',
    artist: 'Jazz Standard',
    year: 1945, genre: 'Jazz', key: 'Gm', tempo: '120 BPM', difficulty: 'Medium',
    chords: ['Cm7', 'F7', 'Bbmaj7', 'Ebmaj7', 'Am7b5', 'D7', 'Gm'],
    sections: [
      { name: 'A Section', chords: ['Cm7', 'F7', 'Bbmaj7', 'Ebmaj7'] },
      { name: 'B Section', chords: ['Am7b5', 'D7', 'Gm', 'Gm'] },
    ],
  },
  {
    id: 'fly-me-to-the-moon',
    title: 'Fly Me to the Moon',
    artist: 'Frank Sinatra',
    year: 1954, genre: 'Jazz', key: 'C', tempo: '130 BPM', difficulty: 'Medium',
    chords: ['Am7', 'Dm7', 'G7', 'Cmaj7', 'Fmaj7', 'Bm7b5', 'E7'],
    sections: [
      { name: 'Verse', chords: ['Am7', 'Dm7', 'G7', 'Cmaj7'] },
      { name: 'Bridge', chords: ['Fmaj7', 'Bm7b5', 'E7', 'Am7'] },
    ],
  },
  {
    id: 'blue-bossa',
    title: 'Blue Bossa',
    artist: 'Kenny Dorham',
    year: 1963, genre: 'Jazz', key: 'Cm', tempo: '140 BPM', difficulty: 'Medium',
    chords: ['Cm7', 'F7', 'Bbmaj7', 'Ebmaj7', 'Am7b5', 'D7', 'Gm7'],
    sections: [
      { name: 'A Section', chords: ['Cm7', 'Cm7', 'Fm7', 'Fm7'] },
      { name: 'B Section', chords: ['Dm7b5', 'G7', 'Cm7', 'Cm7'] },
      { name: 'Bridge', chords: ['Ebm7', 'Ab7', 'Dbmaj7', 'Dm7b5', 'G7'] },
    ],
  },
  {
    id: 'all-things-you-are',
    title: 'All the Things You Are',
    artist: 'Jerome Kern',
    year: 1939, genre: 'Jazz', key: 'Ab', tempo: '120 BPM', difficulty: 'Hard',
    chords: ['Fm7', 'Bbm7', 'Eb7', 'Abmaj7', 'Dbmaj7', 'G7', 'Cmaj7', 'Cm7', 'F7', 'Bbmaj7', 'Eb7', 'Am7', 'D7', 'Gmaj7'],
    sections: [
      { name: 'A1', chords: ['Fm7', 'Bbm7', 'Eb7', 'Abmaj7'] },
      { name: 'A2', chords: ['Dbmaj7', 'G7', 'Cmaj7'] },
      { name: 'B', chords: ['Cm7', 'F7', 'Bbmaj7', 'Eb7'] },
      { name: 'A3', chords: ['Am7', 'D7', 'Gmaj7'] },
    ],
  },
  {
    id: 'misty',
    title: 'Misty',
    artist: 'Erroll Garner',
    year: 1954, genre: 'Jazz', key: 'Eb', tempo: '72 BPM', difficulty: 'Medium',
    chords: ['Ebmaj7', 'Bbm7', 'Eb7', 'Abmaj7', 'Abm7', 'Db7', 'Ebmaj7', 'Cm7', 'Fm7', 'Bb7'],
    sections: [
      { name: 'Head', chords: ['Ebmaj7', 'Bbm7', 'Eb7', 'Abmaj7'] },
      { name: 'Bridge', chords: ['Abm7', 'Db7', 'Ebmaj7', 'Cm7', 'Fm7', 'Bb7'] },
    ],
  },

  // ── COUNTRY ────────────────────────────────────────────────────────────────
  {
    id: 'wagon-wheel',
    title: 'Wagon Wheel',
    artist: 'Old Crow Medicine Show',
    year: 2004, genre: 'Country', key: 'G', tempo: '92 BPM', difficulty: 'Easy',
    chords: ['G', 'D', 'Em', 'C'],
    sections: [
      { name: 'Verse', chords: ['G', 'D', 'Em', 'C'] },
      { name: 'Chorus', chords: ['G', 'D', 'Em', 'C'] },
    ],
  },
  {
    id: 'country-roads',
    title: 'Take Me Home, Country Roads',
    artist: 'John Denver',
    year: 1971, genre: 'Country', key: 'G', tempo: '82 BPM', difficulty: 'Easy',
    chords: ['G', 'Em', 'C', 'D'],
    sections: [
      { name: 'Verse', chords: ['G', 'Em', 'C', 'D'] },
      { name: 'Chorus', chords: ['G', 'D', 'Em', 'C'] },
    ],
  },
  {
    id: 'jolene',
    title: 'Jolene',
    artist: 'Dolly Parton',
    year: 1973, genre: 'Country', key: 'Am', tempo: '104 BPM', difficulty: 'Easy',
    chords: ['Am', 'C', 'G', 'Am'],
    sections: [
      { name: 'Verse', chords: ['Am', 'C', 'G', 'Am'] },
      { name: 'Chorus', chords: ['Am', 'C', 'G', 'Am'] },
    ],
  },
  {
    id: 'ring-of-fire',
    title: 'Ring of Fire',
    artist: 'Johnny Cash',
    year: 1963, genre: 'Country', key: 'G', tempo: '111 BPM', difficulty: 'Easy',
    chords: ['G', 'C', 'D'],
    sections: [
      { name: 'Verse', chords: ['G', 'C', 'G'] },
      { name: 'Chorus', chords: ['G', 'C', 'D', 'G'] },
    ],
  },
  {
    id: 'friends-low-places',
    title: 'Friends in Low Places',
    artist: 'Garth Brooks',
    year: 1990, genre: 'Country', key: 'G', tempo: '88 BPM', difficulty: 'Easy',
    chords: ['G', 'A', 'D'],
    sections: [
      { name: 'Verse', chords: ['G', 'A'] },
      { name: 'Chorus', chords: ['G', 'A', 'D'] },
    ],
  },
  {
    id: 'old-town-road',
    title: 'Old Town Road',
    artist: 'Lil Nas X',
    year: 2019, genre: 'Country', key: 'G', tempo: '136 BPM', difficulty: 'Easy',
    chords: ['G', 'Bm', 'D', 'A'],
    sections: [
      { name: 'Verse', chords: ['G', 'Bm', 'D', 'A'] },
      { name: 'Chorus', chords: ['G', 'Bm', 'D', 'A'] },
    ],
  },

  // ── LATIN ──────────────────────────────────────────────────────────────────
  {
    id: 'la-bamba',
    title: 'La Bamba',
    artist: 'Ritchie Valens',
    year: 1958, genre: 'Latin', key: 'C', tempo: '182 BPM', difficulty: 'Easy',
    chords: ['C', 'F', 'G'],
    sections: [
      { name: 'Main', chords: ['C', 'F', 'G'] },
    ],
  },
  {
    id: 'oye-como-va',
    title: 'Oye Como Va',
    artist: 'Santana',
    year: 1971, genre: 'Latin', key: 'Am', tempo: '130 BPM', difficulty: 'Easy',
    chords: ['Am7', 'D9'],
    sections: [
      { name: 'Main', chords: ['Am7', 'D9'] },
    ],
  },
  {
    id: 'besame-mucho',
    title: 'Bésame Mucho',
    artist: 'Consuelo Velázquez',
    year: 1940, genre: 'Latin', key: 'Dm', tempo: '100 BPM', difficulty: 'Medium',
    chords: ['Dm', 'E7', 'Am', 'Gm', 'A7'],
    sections: [
      { name: 'Verse', chords: ['Dm', 'E7', 'Am'] },
      { name: 'Bridge', chords: ['Gm', 'A7', 'Dm'] },
    ],
  },
  {
    id: 'despacito',
    title: 'Despacito',
    artist: 'Luis Fonsi',
    year: 2017, genre: 'Latin', key: 'Bm', tempo: '89 BPM', difficulty: 'Easy',
    chords: ['Bm', 'G', 'D', 'A'],
    sections: [
      { name: 'Verse', chords: ['Bm', 'G', 'D', 'A'] },
      { name: 'Chorus', chords: ['Bm', 'G', 'D', 'A'] },
    ],
  },

  // ── CLASSIC ────────────────────────────────────────────────────────────────
  {
    id: 'what-wonderful-world',
    title: 'What a Wonderful World',
    artist: 'Louis Armstrong',
    year: 1967, genre: 'Classic', key: 'F', tempo: '62 BPM', difficulty: 'Easy',
    chords: ['F', 'Am', 'Bb', 'C7', 'Dm', 'Gm'],
    sections: [
      { name: 'Verse', chords: ['F', 'Am', 'Bb', 'Am'] },
      { name: 'Bridge', chords: ['Dm', 'Gm', 'C7', 'F'] },
    ],
  },
  {
    id: 'stand-by-me',
    title: 'Stand by Me',
    artist: 'Ben E. King',
    year: 1961, genre: 'Classic', key: 'A', tempo: '120 BPM', difficulty: 'Easy',
    chords: ['A', 'F#m', 'D', 'E'],
    sections: [
      { name: 'Main', chords: ['A', 'F#m', 'D', 'E'] },
    ],
  },
  {
    id: 'cant-help-falling-in-love',
    title: "Can't Help Falling in Love",
    artist: 'Elvis Presley',
    year: 1961, genre: 'Classic', key: 'G', tempo: '60 BPM', difficulty: 'Medium',
    chords: ['G', 'Em', 'Am', 'D7', 'Bm', 'C'],
    sections: [
      { name: 'Verse', chords: ['G', 'Em', 'Am', 'D7'] },
      { name: 'Bridge', chords: ['Bm', 'Em', 'C', 'D7', 'G'] },
    ],
  },
  {
    id: 'hallelujah',
    title: 'Hallelujah',
    artist: 'Leonard Cohen',
    year: 1984, genre: 'Classic', key: 'C', tempo: '64 BPM', difficulty: 'Medium',
    chords: ['C', 'Am', 'F', 'G', 'E7'],
    sections: [
      { name: 'Verse', chords: ['C', 'Am', 'C', 'Am'] },
      { name: 'Chorus', chords: ['F', 'G', 'Am', 'E7', 'Am'] },
    ],
  },
  {
    id: 'scarborough-fair',
    title: 'Scarborough Fair',
    artist: 'Simon & Garfunkel',
    year: 1966, genre: 'Classic', key: 'Dm', tempo: '76 BPM', difficulty: 'Easy',
    chords: ['Dm', 'C', 'F', 'G', 'A'],
    sections: [
      { name: 'Verse', chords: ['Dm', 'C', 'Dm', 'F', 'C', 'Dm'] },
    ],
  },
  {
    id: 'yesterday-beatles',
    title: 'Hey Jude',
    artist: 'The Beatles',
    year: 1968, genre: 'Classic', key: 'F', tempo: '75 BPM', difficulty: 'Easy',
    chords: ['F', 'C', 'Bb', 'F'],
    sections: [
      { name: 'Verse', chords: ['F', 'C', 'Bb', 'F'] },
      { name: 'Chorus', chords: ['Bb', 'F', 'C', 'F'] },
    ],
  },

  // ── GOSPEL / WORSHIP ───────────────────────────────────────────────────────
  {
    id: 'amazing-grace',
    title: 'Amazing Grace',
    artist: 'Traditional',
    year: 1779, genre: 'Gospel', key: 'G', tempo: '75 BPM', difficulty: 'Easy',
    chords: ['G', 'C', 'D'],
    sections: [
      { name: 'Verse', chords: ['G', 'G', 'C', 'G', 'D'] },
      { name: 'Chorus', chords: ['G', 'C', 'G', 'D', 'G'] },
    ],
  },
  {
    id: 'how-great-is-our-god',
    title: 'How Great Is Our God',
    artist: 'Chris Tomlin',
    year: 2004, genre: 'Gospel', key: 'G', tempo: '78 BPM', difficulty: 'Easy',
    chords: ['G', 'Em', 'C', 'D'],
    sections: [
      { name: 'Verse', chords: ['G', 'Em', 'C'] },
      { name: 'Chorus', chords: ['G', 'Em', 'C', 'D'] },
    ],
  },
  {
    id: 'oceans',
    title: 'Oceans (Where Feet May Fail)',
    artist: 'Hillsong United',
    year: 2013, genre: 'Gospel', key: 'Bb', tempo: '71 BPM', difficulty: 'Easy',
    chords: ['Bb', 'F', 'Gm', 'Eb'],
    sections: [
      { name: 'Verse', chords: ['Bb', 'F', 'Gm', 'Eb'] },
      { name: 'Chorus', chords: ['Bb', 'F', 'Gm', 'Eb'] },
    ],
  },

  // ── BLUES ──────────────────────────────────────────────────────────────────
  {
    id: 'twelve-bar-blues',
    title: '12-Bar Blues (E)',
    artist: 'Traditional',
    year: 1900, genre: 'Blues', key: 'E', tempo: '100 BPM', difficulty: 'Easy',
    chords: ['E7', 'A7', 'B7'],
    sections: [
      { name: '12 Bars', chords: ['E7', 'E7', 'E7', 'E7', 'A7', 'A7', 'E7', 'E7', 'B7', 'A7', 'E7', 'B7'] },
    ],
  },
  {
    id: 'the-thrill-is-gone',
    title: 'The Thrill Is Gone',
    artist: 'B.B. King',
    year: 1969, genre: 'Blues', key: 'Bm', tempo: '80 BPM', difficulty: 'Medium',
    chords: ['Bm', 'Em', 'Gmaj7', 'F#7'],
    sections: [
      { name: 'Verse', chords: ['Bm', 'Bm', 'Em', 'Bm'] },
      { name: 'Outro', chords: ['Gmaj7', 'F#7', 'Bm'] },
    ],
  },
  {
    id: 'pride-joy',
    title: 'Pride and Joy',
    artist: 'Stevie Ray Vaughan',
    year: 1983, genre: 'Blues', key: 'E', tempo: '121 BPM', difficulty: 'Medium',
    chords: ['E7', 'A7', 'B7'],
    sections: [
      { name: '12 Bars', chords: ['E7', 'E7', 'E7', 'E7', 'A7', 'A7', 'E7', 'E7', 'B7', 'A7', 'E7', 'B7'] },
    ],
  },

  // ── CLASSICAL ──────────────────────────────────────────────────────────────
  {
    id: 'moonlight-sonata',
    title: 'Moonlight Sonata',
    artist: 'Beethoven',
    year: 1801, genre: 'Classical', key: 'C#m', tempo: '50 BPM', difficulty: 'Hard',
    chords: ['C#m', 'G#m', 'E', 'B7', 'Bdim', 'Am', 'A7'],
    sections: [
      { name: 'Main Theme', chords: ['C#m', 'G#m', 'C#m', 'G#m', 'C#m', 'E', 'B7'] },
    ],
  },
  {
    id: 'pachelbel-canon',
    title: 'Canon in D',
    artist: 'Pachelbel',
    year: 1680, genre: 'Classical', key: 'D', tempo: '72 BPM', difficulty: 'Easy',
    chords: ['D', 'A', 'Bm', 'F#m', 'G', 'D', 'G', 'A'],
    sections: [
      { name: 'Ground Bass', chords: ['D', 'A', 'Bm', 'F#m', 'G', 'D', 'G', 'A'] },
    ],
  },

  // ── FILM / TV ──────────────────────────────────────────────────────────────
  {
    id: 'game-of-thrones',
    title: 'Game of Thrones Theme',
    artist: 'Ramin Djawadi',
    year: 2011, genre: 'Film/TV', key: 'Cm', tempo: '137 BPM', difficulty: 'Medium',
    chords: ['Cm', 'Fm', 'G', 'Ab'],
    sections: [
      { name: 'Main Theme', chords: ['Cm', 'Fm', 'Cm', 'Fm'] },
      { name: 'Bridge', chords: ['G', 'Ab', 'Cm'] },
    ],
  },
  {
    id: 'titanic-theme',
    title: 'My Heart Will Go On',
    artist: 'Celine Dion',
    year: 1997, genre: 'Film/TV', key: 'E', tempo: '76 BPM', difficulty: 'Easy',
    chords: ['E', 'B', 'C#m', 'A'],
    sections: [
      { name: 'Verse', chords: ['E', 'B', 'C#m', 'A'] },
      { name: 'Chorus', chords: ['E', 'B', 'A', 'B'] },
    ],
  },
  {
    id: 'bohemian-rhapsody',
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    year: 1975, genre: 'Rock', key: 'Bb', tempo: '72 BPM', difficulty: 'Hard',
    chords: ['Bb', 'Gm', 'Cm', 'F', 'Eb', 'Ab', 'Db', 'A'],
    sections: [
      { name: 'Intro/Ballad', chords: ['Bb', 'Gm', 'Cm', 'F'] },
      { name: 'Opera', chords: ['Eb', 'Ab', 'Db', 'A'] },
      { name: 'Rock', chords: ['Bb', 'Eb', 'Bb', 'F'] },
    ],
  },
  {
    id: 'africa',
    title: 'Africa',
    artist: 'Toto',
    year: 1982, genre: 'Rock', key: 'F#m', tempo: '93 BPM', difficulty: 'Medium',
    chords: ['F#m', 'D', 'A', 'E'],
    sections: [
      { name: 'Verse', chords: ['F#m', 'D', 'A', 'E'] },
      { name: 'Chorus', chords: ['F#m', 'D', 'A', 'E'] },
    ],
  },
  {
    id: 'dont-stop-believin',
    title: "Don't Stop Believin'",
    artist: 'Journey',
    year: 1981, genre: 'Rock', key: 'E', tempo: '120 BPM', difficulty: 'Easy',
    chords: ['E', 'B', 'C#m', 'A'],
    sections: [
      { name: 'Main', chords: ['E', 'B', 'C#m', 'A'] },
    ],
  },
];

export const CL_GENRES = ['All', 'Pop', 'Rock', 'R&B', 'Jazz', 'Country', 'Latin', 'Classic', 'Gospel', 'Blues', 'Classical', 'Film/TV'];
