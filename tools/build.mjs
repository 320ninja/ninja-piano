// Copies the web app into www/ for Capacitor (iOS / Android builds).
import { cpSync, rmSync, mkdirSync, existsSync } from 'node:fs';
rmSync('www', { recursive: true, force: true });
mkdirSync('www');
for (const p of ['index.html', 'privacy.html', 'manifest.webmanifest', 'sw.js', 'assets', 'js', 'songs', 'vendor', 'icons']) cpSync(p, `www/${p}`, { recursive: true });
// Ensure config.js exists in www/js (gitignored, must be present for build)
if (!existsSync('js/config.js')) { console.warn('⚠ js/config.js missing — copy js/config.example.js and fill in keys'); }
rmSync('www/songs/FORMAT.md', { force: true });
console.log('Built www/');
