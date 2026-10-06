// Copies the web app into www/ for Capacitor (iOS / Android builds).
import { cpSync, rmSync, mkdirSync } from 'node:fs';
rmSync('www', { recursive: true, force: true });
mkdirSync('www');
for (const p of ['index.html', 'manifest.webmanifest', 'sw.js', 'assets', 'js', 'songs', 'vendor', 'icons']) cpSync(p, `www/${p}`, { recursive: true });
rmSync('www/songs/FORMAT.md', { force: true });
console.log('Built www/');
