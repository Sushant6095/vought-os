/**
 * build-segments.mjs — produce one normalized MP4 per timeline segment.
 *
 * Every output is EXACTLY 1920x1080, 30fps, yuv420p, H.264, SAR 1:1, with a
 * consistent timebase — so the concat demuxer joins them cleanly.
 *
 *   - canvas segments (type1/type2/numbers/outro): ffmpeg drawtext on #0A0A0B.
 *   - video segments: WebM capture -> scaled/padded/trimmed. If a capture is
 *     missing, substitute an on-brand canvas card (never a fake screenshot).
 *
 * Output: output/seg/<id>.mp4  +  output/concat.txt
 *
 * Usage: node scripts/video/lib/build-segments.mjs
 */

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT = resolve(ROOT, 'output');
const SHOTS = resolve(OUT, 'shots');
const SEG = resolve(OUT, 'seg');
const TEXT = resolve(ROOT, 'text');
mkdirSync(SEG, { recursive: true });

const FFMPEG = process.env.FFMPEG || '/opt/homebrew/bin/ffmpeg';

// Verified fonts (pre-flight confirmed these exist).
const F_DISPLAY = '/System/Library/Fonts/Helvetica.ttc';
const F_MONO = '/System/Library/Fonts/Menlo.ttc';

const CANVAS = '#0A0A0B';
const TEXT_WHITE = '#F5F5F7';
const TEXT_MUTED = '#9B9BA3';
const AMBER = '#F5A524';

const plan = JSON.parse(readFileSync(resolve(OUT, 'plan.json'), 'utf8'));
const W = plan.width, H = plan.height, FPS = plan.fps;

const run = (args) => execFileSync(FFMPEG, args, { stdio: ['ignore', 'ignore', 'inherit'] });

// Common normalize tail for any video source.
const NORMALIZE_VF =
  `scale=${W}:${H}:force_original_aspect_ratio=increase,` +
  `crop=${W}:${H},setsar=1,fps=${FPS},format=yuv420p`;

const X264 = ['-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-r', String(FPS)];

function canvasBase(seconds) {
  return ['-f', 'lavfi', '-i', `color=c=${CANVAS}:s=${W}x${H}:d=${seconds.toFixed(3)}:r=${FPS}`];
}

function drawTextfile(file, opts) {
  // opts: { font, size, color, x, y, fade }
  const parts = [
    `drawtext=fontfile=${opts.font}`,
    `textfile=${file}`,
    `fontsize=${opts.size}`,
    `fontcolor=${opts.color}`,
    `x=${opts.x}`,
    `y=${opts.y}`,
  ];
  if (opts.fade) {
    // Fade text in over 0.6s, out over last 0.5s.
    parts.push(`alpha='if(lt(t,0.6),t/0.6,if(gt(t,${opts.fade}-0.5),(${opts.fade}-t)/0.5,1))'`);
  }
  return parts.join(':');
}

function buildCanvas(seg) {
  const dest = resolve(SEG, `${seg.id}.mp4`);
  const d = seg.seconds;
  let vf = '';

  if (seg.id === 'type1') {
    vf = drawTextfile(`${TEXT}/line1.txt`, {
      font: F_DISPLAY, size: 64, color: TEXT_WHITE,
      x: '(w-text_w)/2', y: '(h-text_h)/2', fade: d,
    });
  } else if (seg.id === 'type2') {
    vf = drawTextfile(`${TEXT}/line2.txt`, {
      font: F_DISPLAY, size: 80, color: TEXT_WHITE,
      x: '(w-text_w)/2', y: '(h-text_h)/2', fade: d,
    });
  } else if (seg.id === 'numbers') {
    vf = drawTextfile(`${TEXT}/numbers.txt`, {
      font: F_MONO, size: 92, color: AMBER,
      x: '(w-text_w)/2', y: '(h-text_h)/2', fade: d,
    });
  } else if (seg.id === 'outro') {
    vf = [
      drawTextfile(`${TEXT}/wordmark.txt`, {
        font: F_DISPLAY, size: 150, color: TEXT_WHITE,
        x: '(w-text_w)/2', y: '(h-text_h)/2-110', fade: d,
      }),
      drawTextfile(`${TEXT}/tagline.txt`, {
        font: F_DISPLAY, size: 40, color: TEXT_MUTED,
        x: '(w-text_w)/2', y: '(h-text_h)/2+40', fade: d,
      }),
      drawTextfile(`${TEXT}/url.txt`, {
        font: F_MONO, size: 30, color: AMBER,
        x: '(w-text_w)/2', y: '(h-text_h)/2+120', fade: d,
      }),
    ].join(',');
  }

  run(['-y', ...canvasBase(d), '-vf', vf, '-t', d.toFixed(3), ...X264, '-an', dest]);
  return dest;
}

function buildVideo(seg) {
  const dest = resolve(SEG, `${seg.id}.mp4`);
  const src = resolve(SHOTS, seg.src);
  const d = seg.seconds;

  if (!existsSync(src)) {
    // Substitute an on-brand canvas card so the timeline stays intact.
    console.warn(`  ! capture missing for ${seg.id} — substituting canvas card`);
    const label = `${TEXT}/missing-${seg.id}.txt`;
    writeFileSync(label, 'Vought', 'utf8');
    const vf = drawTextfile(label, {
      font: F_DISPLAY, size: 96, color: TEXT_MUTED,
      x: '(w-text_w)/2', y: '(h-text_h)/2', fade: d,
    });
    run(['-y', ...canvasBase(d), '-vf', vf, '-t', d.toFixed(3), ...X264, '-an', dest]);
    return { dest, substituted: true };
  }

  // Overlay for onboarding shot only.
  let vf = NORMALIZE_VF;
  if (seg.id === 'onboarding-voice') {
    vf +=
      `,drawtext=fontfile=${F_DISPLAY}:textfile=${TEXT}/onboarding-overlay.txt:` +
      `fontsize=44:fontcolor=${TEXT_WHITE}:x=(w-text_w)/2:y=h-150:` +
      `box=1:boxcolor=0x0A0A0B@0.55:boxborderw=24:` +
      `alpha='if(lt(t,0.5),t/0.5,if(gt(t,${d}-0.5),(${d}-t)/0.5,1))'`;
  }

  // Trim to aligned duration; -ss 0.3 skips the first frames (reveal settle).
  run([
    '-y', '-ss', '0.3', '-i', src,
    '-vf', vf, '-t', d.toFixed(3),
    ...X264, '-an', dest,
  ]);
  return { dest, substituted: false };
}

const concat = [];
const substituted = [];
for (const seg of plan.segments) {
  process.stdout.write(`Building ${seg.id} (${seg.seconds}s) … `);
  if (seg.type === 'canvas') {
    buildCanvas(seg);
  } else {
    const r = buildVideo(seg);
    if (r.substituted) substituted.push(seg.id);
  }
  concat.push(`file 'seg/${seg.id}.mp4'`);
  console.log('ok');
}

writeFileSync(resolve(OUT, 'concat.txt'), concat.join('\n') + '\n', 'utf8');
writeFileSync(resolve(OUT, 'substituted.json'), JSON.stringify(substituted), 'utf8');
console.log('✓ segments built. Substituted:', substituted.length ? substituted.join(', ') : 'none');
