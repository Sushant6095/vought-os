/**
 * render.mjs — self-contained final assembly for the Vought submission video.
 *
 * Why this exists: the local ffmpeg (homebrew 8.1.1) was built WITHOUT
 * libfreetype/libass, so `drawtext` and `subtitles` filters are unavailable.
 * This script renders every text element (cards + captions) as PNGs via
 * Playwright/Chromium (real type, brand-styled) and composites with only the
 * core ffmpeg filters that ARE present (scale, crop, fade, overlay, concat).
 *
 * Pipeline:
 *   1. Render 4 brand cards (opaque) + 10 caption strips (transparent) -> PNG
 *   2. Build one normalized 1920x1080/30fps MP4 per timeline segment
 *   3. Concat -> master-video.mp4 (silent)
 *   4. Build VO audio: each clip delayed to its cue time, mixed onto silence
 *   5. Overlay caption PNGs (time-windowed) + mux audio -> vought-90sec-16x9.mp4
 *   6. Derivative cuts (1:1 / 9:16) + thumbnail
 *
 * Prereq: voiceover.mjs + capture.mjs already ran (output/shots populated).
 * Usage: node scripts/video/render.mjs
 */

import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, 'output');
const SHOTS = resolve(OUT, 'shots');
const SEG = resolve(OUT, 'seg');
const PNG = resolve(OUT, 'png');
for (const d of [SEG, PNG]) mkdirSync(d, { recursive: true });

const FFMPEG = process.env.FFMPEG || '/opt/homebrew/bin/ffmpeg';
const FFPROBE = process.env.FFPROBE || '/opt/homebrew/bin/ffprobe';
const W = 1920, H = 1080, FPS = 30;

const C = { canvas: '#0A0A0B', white: '#F5F5F7', muted: '#9B9BA3', amber: '#F5A524' };
const ff = (args) => execFileSync(FFMPEG, args, { stdio: ['ignore', 'ignore', 'inherit'] });
const probe = (f) =>
  parseFloat(execFileSync(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString().trim());

// ── Timeline ───────────────────────────────────────────────────────
// Durations chosen to run ~89s on narration alone (no padding/music).
const SEGMENTS = [
  { id: 'type1',          kind: 'card',  card: 'type1',  dur: 6.0 },
  { id: 'type2',          kind: 'card',  card: 'type2',  dur: 3.0 },
  { id: 'live-bloom',     kind: 'video', src: 'live-bloom.webm',       dur: 20.0 },
  { id: 'live-teams',     kind: 'video', src: 'live-teams.webm',       dur: 9.0 },
  { id: 'onboarding',     kind: 'video', src: 'onboarding-voice.webm', dur: 12.0 },
  { id: 'customers-hero', kind: 'video', src: 'customers-hero.webm',   dur: 12.0 },
  { id: 'customers-story',kind: 'video', src: 'customers-story.webm',  dur: 11.5 },
  { id: 'numbers',        kind: 'card',  card: 'numbers', dur: 6.0 },
  { id: 'outro',          kind: 'card',  card: 'outro',   dur: 9.5 },
];
const TOTAL = SEGMENTS.reduce((s, x) => s + x.dur, 0); // 89.0

// VO cues — each clip starts at `at` (s); caption shows over its spoken window.
const VO = [
  { file: 'vo-01.mp3', at: 0.3,  cap: "Every important conversation happens once.\nYou don't get to rehearse." },
  { file: 'vo-02.mp3', at: 6.3,  cap: 'Vought changes that.' },
  { file: 'vo-03.mp3', at: 9.3,  cap: 'It listens, separates every speaker,\nand understands the moment.' },
  { file: 'vo-04.mp3', at: 16.5, cap: 'Then it whispers the next line —\nprivately, into your ear.' },
  { file: 'vo-05.mp3', at: 29.3, cap: 'In under 412 milliseconds.\nBuilt on the ElevenLabs Speech Engine.' },
  { file: 'vo-06.mp3', at: 38.3, cap: 'A voice you trained yourself.\nThirty seconds — and it is your own.' },
  { file: 'vo-07.mp3', at: 50.3, cap: 'A copilot that closes.\nA receptionist that never misses a call.' },
  { file: 'vo-08.mp3', at: 62.3, cap: 'TripleByte closed $1.4M more last quarter.\nSuggestion acceptance tripled.' },
  { file: 'vo-09.mp3', at: 73.8, cap: 'The conversation goes the way\nit was always supposed to.' },
  { file: 'vo-outro.mp3', at: 80.0, cap: 'Vought. Intelligence for live conversations.' },
];

// ── 1. Render PNGs via Playwright ───────────────────────────────────
const FONT_SANS = `'Helvetica Neue', Helvetica, -apple-system, Arial, sans-serif`;
const FONT_MONO = `'SF Mono', Menlo, monospace`;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '<br>');

function cardHTML(card) {
  const base = `margin:0;width:${W}px;height:${H}px;background:${C.canvas};display:flex;align-items:center;justify-content:center;font-family:${FONT_SANS};`;
  if (card === 'type1')
    return `<body style="${base}"><div style="max-width:1400px;text-align:center;font-size:62px;font-weight:600;letter-spacing:-0.02em;line-height:1.25;color:${C.white}">Every important conversation<br>happens once.</div></body>`;
  if (card === 'type2')
    return `<body style="${base}"><div style="text-align:center;font-size:88px;font-weight:700;letter-spacing:-0.03em;color:${C.white}">You don't get to rehearse.</div></body>`;
  if (card === 'numbers')
    return `<body style="${base}"><div style="text-align:center;font-family:${FONT_MONO};font-size:84px;font-weight:600;letter-spacing:0.02em;color:${C.amber}">$1.4M&nbsp;&nbsp;·&nbsp;&nbsp;3×&nbsp;&nbsp;·&nbsp;&nbsp;· 412ms</div></body>`;
  // outro
  return `<body style="${base}"><div style="text-align:center">
    <div style="font-size:150px;font-weight:800;letter-spacing:0.04em;color:${C.white}">VOUGHT</div>
    <div style="margin-top:28px;font-size:38px;font-weight:400;color:${C.muted}">Intelligence for live conversations.</div>
    <div style="margin-top:44px;font-family:${FONT_MONO};font-size:28px;color:${C.amber}">vought.com</div>
  </div></body>`;
}

function captionHTML(text) {
  // Full-frame transparent; caption pinned to lower third.
  return `<body style="margin:0;width:${W}px;height:${H}px;background:transparent;font-family:${FONT_SANS}">
    <div style="position:absolute;left:50%;bottom:88px;transform:translateX(-50%);max-width:1320px;text-align:center;
      font-size:40px;font-weight:700;line-height:1.3;color:#ffffff;
      text-shadow:0 2px 10px rgba(0,0,0,0.85),0 0 2px rgba(0,0,0,0.9)">${esc(text)}</div></body>`;
}

console.log('1/6 Rendering text PNGs …');
{
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  for (const card of ['type1', 'type2', 'numbers', 'outro']) {
    await page.setContent(cardHTML(card), { waitUntil: 'load' });
    await page.screenshot({ path: resolve(PNG, `card-${card}.png`), clip: { x: 0, y: 0, width: W, height: H } });
  }
  for (let i = 0; i < VO.length; i++) {
    await page.setContent(captionHTML(VO[i].cap), { waitUntil: 'load' });
    await page.screenshot({ path: resolve(PNG, `cap-${i}.png`), omitBackground: true, clip: { x: 0, y: 0, width: W, height: H } });
  }
  await browser.close();
  console.log('   ✓ 4 cards + ' + VO.length + ' captions');
}

// ── 2. Build normalized segments ────────────────────────────────────
console.log('2/6 Building segments …');
const NORM = `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1,fps=${FPS},format=yuv420p`;
const X264 = ['-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-r', String(FPS)];
const concatLines = [];
for (const seg of SEGMENTS) {
  const dest = resolve(SEG, `${seg.id}.mp4`);
  const d = seg.dur.toFixed(3);
  if (seg.kind === 'card') {
    const png = resolve(PNG, `card-${seg.card}.png`);
    const fade = `fade=t=in:st=0:d=0.4,fade=t=out:st=${(seg.dur - 0.4).toFixed(2)}:d=0.4`;
    ff(['-y', '-loop', '1', '-t', d, '-i', png, '-vf', `${fade},format=yuv420p`, ...X264, '-an', dest]);
  } else {
    const src = resolve(SHOTS, seg.src);
    if (!existsSync(src)) throw new Error(`missing capture: ${seg.src}`);
    // -ss 0.4 skips the reveal settle; trim to aligned duration.
    ff(['-y', '-ss', '0.4', '-i', src, '-t', d, '-vf', NORM, ...X264, '-an', dest]);
  }
  concatLines.push(`file 'seg/${seg.id}.mp4'`);
  process.stdout.write(`   ✓ ${seg.id} (${seg.dur}s)\n`);
}
writeFileSync(resolve(OUT, 'concat.txt'), concatLines.join('\n') + '\n');

// ── 3. Concat -> master video (silent) ──────────────────────────────
console.log('3/6 Concat …');
ff(['-y', '-f', 'concat', '-safe', '0', '-i', resolve(OUT, 'concat.txt'),
  '-c:v', 'libx264', '-crf', '19', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-r', String(FPS),
  '-an', resolve(OUT, 'master-video.mp4')]);

// ── 4. Build VO audio track (clips delayed to cue times) ────────────
console.log('4/6 Audio …');
{
  const inputs = ['-f', 'lavfi', '-t', TOTAL.toFixed(3), '-i', `anullsrc=r=44100:cl=stereo`];
  const filters = [];
  const labels = ['[0:a]'];
  VO.forEach((v, i) => {
    inputs.push('-i', resolve(SHOTS, v.file));
    const ms = Math.round(v.at * 1000);
    filters.push(`[${i + 1}:a]adelay=${ms}|${ms},apad[a${i}]`);
    labels.push(`[a${i}]`);
  });
  filters.push(`${labels.join('')}amix=inputs=${labels.length}:normalize=0:duration=first[mix]`);
  ff(['-y', ...inputs, '-filter_complex', filters.join(';'),
    '-map', '[mix]', '-t', TOTAL.toFixed(3), '-ar', '48000', '-c:a', 'aac', '-b:a', '192k',
    resolve(OUT, 'master-audio.m4a')]);
}

// ── 5. Overlay captions (time-windowed) + mux audio ─────────────────
console.log('5/6 Captions + mux …');
{
  const inputs = ['-i', resolve(OUT, 'master-video.mp4')];
  VO.forEach((v, i) => inputs.push('-i', resolve(PNG, `cap-${i}.png`)));
  inputs.push('-i', resolve(OUT, 'master-audio.m4a'));
  const audioIdx = VO.length + 1;
  const chain = [];
  let cur = '[0:v]';
  VO.forEach((v, i) => {
    const dur = probe(resolve(SHOTS, v.file));
    const s = v.at.toFixed(2);
    const e = Math.min(v.at + dur + 0.4, TOTAL).toFixed(2);
    const out = i === VO.length - 1 ? '[v]' : `[v${i}]`;
    chain.push(`${cur}[${i + 1}:v]overlay=0:0:enable='between(t,${s},${e})'${out}`);
    cur = `[v${i}]`;
  });
  ff(['-y', ...inputs, '-filter_complex', chain.join(';'),
    '-map', '[v]', '-map', `${audioIdx}:a`,
    '-c:v', 'libx264', '-crf', '20', '-preset', 'slow', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-shortest',
    resolve(OUT, 'vought-90sec-16x9.mp4')]);
}

// ── 6. Derivative cuts + thumbnail ──────────────────────────────────
console.log('6/6 Cuts + thumbnail …');
const MASTER = resolve(OUT, 'vought-90sec-16x9.mp4');
ff(['-y', '-i', MASTER, '-t', '60',
  '-vf', 'crop=1080:1080:(in_w-1080)/2:(in_h-1080)/2,scale=1080:1080,setsar=1',
  '-c:v', 'libx264', '-crf', '23', '-preset', 'slow', '-pix_fmt', 'yuv420p',
  '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', resolve(OUT, 'vought-60sec-1x1.mp4')]);
ff(['-y', '-i', MASTER, '-t', '30',
  '-vf', 'crop=608:1080:(in_w-608)/2:0,scale=1080:1920,setsar=1',
  '-c:v', 'libx264', '-crf', '23', '-preset', 'slow', '-pix_fmt', 'yuv420p',
  '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', resolve(OUT, 'vought-30sec-9x16.mp4')]);
ff(['-y', '-ss', '12', '-i', MASTER, '-vframes', '1', resolve(OUT, 'thumbnail-16x9.png')]);

// ── Report ──────────────────────────────────────────────────────────
console.log('\n✓ Render complete:');
for (const f of ['vought-90sec-16x9.mp4', 'vought-60sec-1x1.mp4', 'vought-30sec-9x16.mp4', 'thumbnail-16x9.png']) {
  const p = resolve(OUT, f);
  if (existsSync(p)) {
    const dur = f.endsWith('.png') ? '—' : probe(p).toFixed(2) + 's';
    const mb = (execFileSync('stat', ['-f%z', p]).toString().trim() / 1e6).toFixed(2);
    console.log(`   ${f.padEnd(26)} ${String(dur).padStart(8)}  ${mb} MB`);
  }
}
rmSync(SEG, { recursive: true, force: true });
console.log('\nDone.');
