// Synthesia-style falling notes renderer.
import { isBlack } from './music.js';
import { analyzeSteps, FUNCTION_COLOR } from './chordai.js';

const HIT_Y = 0.82;
const LOOK_AHEAD = 4.0;
const PERFECT_WIN = 0.10;
const GOOD_WIN    = 0.26;

// ── Main export ───────────────────────────────────────────────────────────────
export function createFalling(host, { steps, low, high, bpm, speed, keyPc = 0, isMinor = false, onJudge, setTargets, flashKey, autoPlay }) {
  low  = Math.max(21, low  - (low  % 12));
  high = Math.min(108, high + ((11 - (high % 12)) % 12));

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;touch-action:none;';
  host.innerHTML = '';
  host.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let whiteCount = 0;
  const keyInfo = new Map();
  for (let m = low; m <= high; m++) {
    if (!isBlack(m)) keyInfo.set(m, { black: false, whiteIdx: whiteCount++ });
  }
  for (let m = low; m <= high; m++) {
    if (isBlack(m)) {
      let n = m - 1; while (n >= low && isBlack(n)) n--;
      const info = keyInfo.get(n);
      keyInfo.set(m, { black: true, whiteIdx: info ? info.whiteIdx : 0 });
    }
  }

  const W = () => canvas.offsetWidth;
  const H = () => canvas.offsetHeight;
  const ww = () => W() / whiteCount;
  const xOf = (m) => {
    const info = keyInfo.get(m);
    if (!info) return 0;
    if (info.black) return (info.whiteIdx + 0.5) * ww() + ww() * 0.19;
    return info.whiteIdx * ww() + ww() * 0.07;
  };
  const wOf = (m) => isBlack(m) ? ww() * 0.58 : ww() * 0.86;

  const NOTE_COLOR = { rh: ['#4f8ef7', '#91bcff'], lh: ['#f7a24f', '#ffd0a0'] };
  // Per-pitch-class colors matching the colorizeScore system
  const PC_COLOR = ['#ef4444','#f43f5e','#f97316','#fb923c','#eab308','#22c55e','#16a34a','#06b6d4','#3b82f6','#3b82f6','#8b5cf6','#8b5cf6'];
  const noteColor = (midi) => PC_COLOR[midi % 12];

  let startTime = null;
  let raf = 0;
  let running = false;
  let pausedAt = null; // wall-clock ms when paused
  const secPerBeat = () => 60 / (bpm * speed);

  const state = steps.map(() => ({ pressed: false, result: null, t: null, played: false }));
  let currentIdx = 0;
  let lastTargets = [];

  // Pre-compute chord analysis (chords, progression, scale)
  const analysis = analyzeSteps(steps, keyPc, isMinor);
  const chordLabels = analysis.chords; // { beat, endBeat, chord, fn, roman, color }
  const progName = analysis.progression?.name || null;
  const scaleName = analysis.scale?.name || null;

  const hitLine = () => H() * HIT_Y;
  const pxPerSec = () => hitLine() / LOOK_AHEAD;

  const noteY = (beatTime, now) => {
    const wallTime = startTime / 1000 + beatTime * secPerBeat();
    return hitLine() - (wallTime - now) * pxPerSec();
  };
  const noteH = (beats) => Math.max(12, beats * secPerBeat() * pxPerSec() - 4);

  function draw(now) {
    const dpr = devicePixelRatio || 1;
    const cw = canvas.offsetWidth, ch = canvas.offsetHeight;
    if (!cw || !ch) return;
    if (canvas.width !== Math.round(cw * dpr) || canvas.height !== Math.round(ch * dpr)) {
      canvas.width  = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    ctx.clearRect(0, 0, cw, ch);

    // Background lanes
    for (let m = low; m <= high; m++) {
      if (isBlack(m)) continue;
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.fillRect(xOf(m), 0, wOf(m), ch);
    }

    // Hit line
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, hitLine()); ctx.lineTo(cw, hitLine()); ctx.stroke();

    if (startTime === null) return;

    // Chord section highlights — color by harmonic function
    for (const lbl of chordLabels) {
      const y1 = noteY(lbl.beat, now);
      const y2 = noteY(lbl.endBeat, now);
      if (y2 < -40 || y1 > ch + 40) continue;
      const col = lbl.color || '#ef4444';
      // Tinted band
      ctx.fillStyle = col + '18';
      ctx.fillRect(0, y2, cw, y1 - y2);
      // Left accent line (harmonic function color)
      ctx.fillStyle = col + 'bb';
      ctx.fillRect(0, y2, 3, y1 - y2);
    }

    const fontSize = Math.max(8, Math.min(13, ww() * 0.55));
    ctx.font = `bold ${fontSize}px system-ui`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // Note blocks
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const st = state[i];
      const beats = step.events[0]?.beats || 0.5;
      const y = noteY(step.start, now);
      const h = noteH(beats);
      if (y + h < -20 || y > ch + 20) continue;

      step.events.forEach((e) => {
        e.midis.forEach((m, mi) => {
          if (m == null) return;
          const hand = e.hand || 'rh';
          const [, light] = NOTE_COLOR[hand] || NOTE_COLOR.rh;
          const base = noteColor(m);
          const x = xOf(m), w = wOf(m);
          const rx = 4;

          let fillColor = base, alpha = 1;
          if (st.result === 'miss') { fillColor = '#555'; alpha = 0.35; }
          else if (st.result === 'perfect' || st.result === 'good') fillColor = '#22c55e';

          ctx.globalAlpha = alpha;
          ctx.fillStyle = fillColor;
          ctx.beginPath(); ctx.roundRect(x, y, w, h, rx); ctx.fill();

          if (st.result !== 'miss') {
            ctx.fillStyle = (st.result === 'perfect' || st.result === 'good') ? '#86efac' : base + 'cc';
            ctx.beginPath(); ctx.roundRect(x + 1, y + 1, w - 2, Math.min(6, h - 2), [rx, rx, 0, 0]); ctx.fill();
          }

          ctx.save();
          ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
          const name = e.names?.[mi] || e.names?.[0];
          if (name) {
            ctx.fillStyle = st.result === 'miss' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.95)';
            ctx.fillText(name.replace(/\d+$/, ''), x + w / 2, y + Math.min(fontSize + 2, h * 0.65));
          }
          // order number (1=next, 2=after, …) on upcoming steps only
          const orderNum = i - currentIdx + 1;
          if (orderNum >= 1 && orderNum <= 5 && st.result == null) {
            const numSize = Math.max(9, Math.min(14, ww() * 0.6));
            ctx.font = `900 ${numSize}px system-ui`;
            ctx.fillStyle = '#ef4444';
            ctx.textBaseline = 'top';
            ctx.fillText(orderNum, x + w / 2, y + 2);
            ctx.font = `bold ${fontSize}px system-ui`;
            ctx.textBaseline = 'top';
          }
          ctx.restore();
          ctx.globalAlpha = 1;
        });
      });
    }

    // ── Right side: chord name + roman numeral ──────────────────────────────
    ctx.font = 'bold 10px system-ui';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'right';
    const labelX = cw - 6;
    const seen = new Set();
    for (const lbl of chordLabels) {
      const y = noteY(lbl.beat, now);
      if (y < -20 || y > ch + 20) continue;
      const key = lbl.chord.fullName + Math.round(y / 20);
      if (seen.has(key)) continue;
      seen.add(key);

      const col = lbl.color || '#ef4444';
      const line1 = lbl.chord.fullName;                     // e.g. Gadd9/D
      const line2 = lbl.roman + (lbl.chord.invLabel ? ' ' + lbl.chord.invLabel : ''); // e.g. I add9 1st inv

      const pad = 5;
      const w1 = ctx.measureText(line1).width + pad * 2;
      const w2 = ctx.measureText(line2).width + pad * 2;
      const pw = Math.max(w1, w2);
      const totalH = 30, fy = y - totalH / 2;

      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.beginPath(); ctx.roundRect(labelX - pw, fy, pw, totalH, 6); ctx.fill();

      // Colored left border on pill
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.roundRect(labelX - pw, fy, 3, totalH, [6,0,0,6]); ctx.fill();

      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 10px system-ui';
      ctx.fillText(line1, labelX - pad, y - 7);

      ctx.fillStyle = col;
      ctx.font = '8px system-ui';
      ctx.fillText(line2, labelX - pad, y + 8);

      // Dashed line to section end
      const y2 = noteY(lbl.endBeat, now);
      if (y2 > y + 4 && y2 < ch) {
        ctx.strokeStyle = col + '55';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(labelX - pw / 2, fy + totalH);
        ctx.lineTo(labelX - pw / 2, y2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // ── Left side: progression strip ─────────────────────────────────────────
    const stripW = 36;
    // Show visible chord sequence on left as stacked labels
    const visible = chordLabels.filter(l => {
      const y = noteY(l.beat, now);
      return y >= -20 && y <= ch + 20;
    });
    visible.forEach((lbl) => {
      const y = noteY(lbl.beat, now);
      const col = lbl.color || '#ef4444';
      const roman = lbl.roman;

      ctx.fillStyle = col + 'cc';
      ctx.beginPath(); ctx.roundRect(2, y - 10, stripW, 20, 4); ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(roman, 2 + stripW / 2, y);
    });

    // Scale + progression name at top-left (static overlay)
    if (scaleName || progName) {
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      let ty = 6;
      if (scaleName) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(4, ty - 1, ctx.measureText(scaleName).width + 10, 14);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '9px system-ui';
        ctx.fillText(scaleName, 8, ty);
        ty += 16;
      }
      if (progName) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(4, ty - 1, ctx.measureText(progName).width + 10, 14);
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 9px system-ui';
        ctx.fillText(progName, 8, ty);
      }
    }

    // Judgement labels
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'center';
    for (let i = 0; i < steps.length; i++) {
      const st = state[i];
      if (!st.result || !st.t) continue;
      const age = now - st.t;
      if (age > 0.8) continue;
      const op = 1 - age / 0.8;
      const m = steps[i].events[0]?.midis[0];
      if (m == null) continue;
      const x = xOf(m) + wOf(m) / 2;
      const y = hitLine() - 20 - age * 60;
      ctx.globalAlpha = op;
      ctx.fillStyle = st.result === 'perfect' ? '#86efac' : st.result === 'good' ? '#fde68a' : '#f87171';
      ctx.font = 'bold 13px system-ui';
      ctx.fillText(st.result === 'perfect' ? 'Perfect!' : st.result === 'good' ? 'Good' : 'Miss', x, y);
      ctx.globalAlpha = 1;
    }

    // Keyboard hint for upcoming step
    const upcoming = [];
    for (let i = currentIdx; i < Math.min(currentIdx + 1, steps.length); i++) {
      if (!state[i].pressed) steps[i].midis.forEach((m) => upcoming.push(m));
    }
    const key = upcoming.join(',');
    if (key !== lastTargets.join(',')) {
      lastTargets = upcoming;
      setTargets?.(upcoming);
    }
  }

  function loop() {
    if (!running) return;
    const now = performance.now() / 1000;
    draw(now);

    if (startTime !== null) {
      if (autoPlay) {
        for (let i = 0; i < steps.length; i++) {
          if (state[i].played) continue;
          const wallHit = startTime / 1000 + steps[i].start * secPerBeat();
          if (now >= wallHit) {
            state[i].played = true;
            steps[i].events.forEach((e) => e.midis.forEach((m) => autoPlay(m)));
          }
        }
      }
      while (currentIdx < steps.length) {
        const step = steps[currentIdx];
        const wallHit = startTime / 1000 + step.start * secPerBeat();
        if (now > wallHit + GOOD_WIN && !state[currentIdx].pressed) {
          state[currentIdx].result = 'miss';
          state[currentIdx].t = now;
          onJudge(currentIdx, 0);
          currentIdx++;
        } else break;
      }
      if (currentIdx >= steps.length) {
        const lastWall = startTime / 1000 + steps[steps.length - 1].start * secPerBeat();
        if (now > lastWall + 1) { running = false; return; }
      }
    }
    raf = requestAnimationFrame(loop);
  }

  return {
    start(wallMs) {
      startTime = wallMs;
      currentIdx = 0;
      state.forEach((s) => { s.pressed = false; s.result = null; s.t = null; s.played = false; });
      running = true;
      raf = requestAnimationFrame(loop);
    },
    stop() {
      running = false;
      pausedAt = null;
      cancelAnimationFrame(raf);
      setTargets?.([]);
    },
    pause() {
      if (!running) return;
      running = false;
      pausedAt = performance.now();
      cancelAnimationFrame(raf);
    },
    resume() {
      if (running || startTime === null || pausedAt === null) return;
      startTime += performance.now() - pausedAt;
      pausedAt = null;
      running = true;
      raf = requestAnimationFrame(loop);
    },
    get paused() { return !running && pausedAt !== null; },
    getUpcomingSteps(n = 5) {
      const result = [];
      for (let i = currentIdx; i < Math.min(steps.length, currentIdx + n); i++) {
        const midis = [];
        steps[i].events.forEach(e => e.midis.forEach(m => { if (m != null) midis.push(m); }));
        if (midis.length) result.push({ order: result.length + 1, midis });
      }
      return result;
    },
    press(midi, nowSec) {
      if (startTime === null) return null;
      let best = null, bestDiff = Infinity;
      for (let i = Math.max(0, currentIdx - 1); i < Math.min(steps.length, currentIdx + 6); i++) {
        if (state[i].pressed) continue;
        if (!steps[i].midis.includes(midi)) continue;
        const wallHit = startTime / 1000 + steps[i].start * secPerBeat();
        const diff = Math.abs(nowSec - wallHit);
        if (diff < bestDiff && diff < GOOD_WIN) { best = i; bestDiff = diff; }
      }
      if (best === null) return null;
      state[best].pressed = true;
      state[best].t = nowSec;
      const result = bestDiff <= PERFECT_WIN ? 'perfect' : 'good';
      state[best].result = result;
      flashKey?.(midi, 'correct', 300);
      onJudge(best, result === 'perfect' ? 1 : 0.7);
      if (best === currentIdx) currentIdx++;
      return result;
    },
    resize() {},
  };
}
