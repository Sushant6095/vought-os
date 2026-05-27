/**
 * build-audio.mjs — assemble the master VO track from vo-*.mp3 + gaps,
 * timed to match captions.srt (lines laid down sequentially with a 0.35s gap,
 * 0.2s lead-in). Output: output/master-vo.wav (48k stereo).
 *
 * Optionally mixes a CC0 bed if output/music.wav exists (ducked to -18dB).
 *
 * Usage: node scripts/video/lib/build-audio.mjs
 */

import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SHOTS = resolve(ROOT, 'output/shots');
const OUT = resolve(ROOT, 'output');
const FFMPEG = process.env.FFMPEG || '/opt/homebrew/bin/ffmpeg';

const plan = JSON.parse(readFileSync(resolve(OUT, 'plan.json'), 'utf8'));
const order = ['vo-1', 'vo-2a', 'vo-2b', 'vo-2c', 'vo-3', 'vo-outro'];
const files = order.map((n) => resolve(SHOTS, `${n}.mp3`));
for (const f of files) {
  if (!existsSync(f)) {
    console.error('FATAL: missing VO clip', f);
    process.exit(1);
  }
}

// Each VO line starts at plan.voSequence[i].start (seconds). Build a filter
// graph that delays each clip to its start and mixes them onto a common bed.
const inputs = [];
files.forEach((f) => inputs.push('-i', f));

const totalMs = Math.ceil(plan.total * 1000) + 200;
const delays = plan.voSequence.map((v) => Math.round(v.start * 1000));

let filter = '';
const labels = [];
files.forEach((_, i) => {
  const d = delays[i] ?? 0;
  filter += `[${i}:a]aresample=48000,aformat=channel_layouts=stereo,adelay=${d}|${d}[a${i}];`;
  labels.push(`[a${i}]`);
});
filter += `${labels.join('')}amix=inputs=${files.length}:normalize=0:dropout_transition=0[vo];`;
// Pad/trim VO bed to total length, gentle limiter so peaks stay under ~-2dB.
filter += `[vo]apad=whole_dur=${(totalMs / 1000).toFixed(3)},atrim=0:${(totalMs / 1000).toFixed(3)},alimiter=limit=0.79[voout]`;

const voOut = resolve(OUT, 'master-vo.wav');
execFileSync(
  FFMPEG,
  ['-y', ...inputs, '-filter_complex', filter, '-map', '[voout]', '-ar', '48000', '-ac', '2', voOut],
  { stdio: 'inherit' },
);

// ── Optional CC0 music bed ──
const music = resolve(OUT, 'music.wav');
const finalOut = resolve(OUT, 'master-audio.wav');
if (existsSync(music)) {
  // Duck the bed under VO via sidechain; bed sits ~-18dB.
  const mix =
    `[1:a]aresample=48000,aformat=channel_layouts=stereo,volume=0.13[bed];` +
    `[0:a]aresample=48000,aformat=channel_layouts=stereo[vo];` +
    `[bed][vo]sidechaincompress=threshold=0.03:ratio=12:attack=8:release=320[bedduck];` +
    `[vo][bedduck]amix=inputs=2:normalize=0[mix];` +
    `[mix]apad=whole_dur=${(totalMs / 1000).toFixed(3)},atrim=0:${(totalMs / 1000).toFixed(3)},alimiter=limit=0.79[out]`;
  execFileSync(
    FFMPEG,
    ['-y', '-i', voOut, '-i', music, '-filter_complex', mix, '-map', '[out]', '-ar', '48000', '-ac', '2', finalOut],
    { stdio: 'inherit' },
  );
  console.log('✓ master-audio.wav (VO + ducked CC0 bed)');
} else {
  execFileSync(FFMPEG, ['-y', '-i', voOut, '-c:a', 'pcm_s16le', finalOut], { stdio: 'inherit' });
  console.log('✓ master-audio.wav (VO only — no music bed present)');
}
