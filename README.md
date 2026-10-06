# Ninja Piano

Learn piano step by step. Real sheet music (treble and bass clef) with the note name under every note, a playable keyboard, play-along and guided practice. It works offline on iPhone, Android and desktop.

The theme and colours come from the Real Estate / Travel apps, plus a default "Ninja Violet" theme. There are 16 themes and light, dark and auto modes.

## Features
- **Library**: songs in 11 categories (Kids, Classical, Pop, Folk, Holiday, Hymns, Jazz, Blues, Rock, EDM, Exercises). You can search, filter by category and level, save favourites, and page through results.
- **Song player**: grand-staff sheet music drawn by VexFlow, with note names. While a song plays, the current note is highlighted on the sheet and on the keyboard. It has loop, metronome, speed (0.5x–1.25x), right/left/both hands, a draggable progress bar, and tap-a-note-to-jump.
- **Practice mode**: the next note glows on the keyboard. Play it to move on. A wrong note shows what you played and what you should have played. Includes a progress ring, Listen, Previous/Next, and right/left/both hands.
- **Results**: accuracy, number of notes, time taken, 1–3 stars and confetti. Your best score and a day streak are saved.
- **Input**: on-screen touch keys (multi-touch), the computer keyboard (`A W S E D F T G Y H U J K…` = C4 upward), or a **USB/Bluetooth MIDI piano** (Web MIDI, in Chrome/Android).
- **Note names**: Letters (C D E), Solfège (Do Re Mi) or Sargam (Sa Re Ga).
- **Sounds**: Grand, Bright, Electric, Soft and Synth, all synthesised so no downloads are needed.

## Run locally
```bash
npm run dev
```
Then open http://localhost:5180.

## Songs
Songs are stored in `songs/*.json`. The format is described in `songs/FORMAT.md`. After adding songs, run:
```bash
npm run validate
```
Every song must be public domain (traditional, or by a composer who died before 1955) or an original composition. Rock and EDM pieces are originals written in those styles.

## Publish
- **Web / PWA**: upload these files as a static site (Hostinger, or Cloudflare Pages for a demo link): `index.html`, `manifest.webmanifest`, `sw.js`, `assets/`, `js/`, `songs/`, `vendor/`, `icons/`. No Node slot is needed. To install it on a phone, use Add to Home Screen.
- **App Store / Play Store** (Capacitor):
  ```bash
  npm install
  npx cap add ios && npx cap add android
  npm run ios      # opens Xcode
  npm run android  # opens Android Studio
  ```
