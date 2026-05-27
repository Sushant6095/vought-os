#!/usr/bin/env bash
#
# compose.sh — assemble the Vought submission video from captured shots + VO.
#
# Prereqs (run first):
#   node scripts/video/voiceover.mjs   # generates output/shots/vo-*.mp3
#   node scripts/video/capture.mjs     # generates output/shots/*.webm
#
# Pipeline:
#   1. plan.mjs            — measure VO, compute durations + captions.srt
#   2. build-segments.mjs  — normalized 1920x1080/30fps MP4 per segment
#   3. concat              — join segments (re-encoded, consistent timebase)
#   4. build-audio.mjs     — VO track (+ optional ducked CC0 bed)
#   5. mux + burn captions — vought-90sec-16x9.mp4
#   6. derivative cuts     — 1:1 (60s) + 9:16 (30s)
#   7. thumbnail
#
set -euo pipefail
cd "$(dirname "$0")"

FFMPEG="${FFMPEG:-/opt/homebrew/bin/ffmpeg}"
FFPROBE="${FFPROBE:-/opt/homebrew/bin/ffprobe}"
export FFMPEG FFPROBE

OUT="output"
mkdir -p "$OUT"

echo "── 1. Plan timeline from VO durations ──"
node lib/plan.mjs

echo "── 2. Build normalized segments ──"
node lib/build-segments.mjs

echo "── 3. Concat video segments ──"
# Re-encode on concat (sources already normalized, but this guarantees a
# single clean timebase across all inputs).
"$FFMPEG" -y -f concat -safe 0 -i "$OUT/concat.txt" \
  -c:v libx264 -crf 19 -preset slow -pix_fmt yuv420p -r 30 \
  -an "$OUT/master-video.mp4"

echo "── 4. Build audio track ──"
node lib/build-audio.mjs

echo "── 5. Mux + burn captions ──"
# Inter is not a guaranteed system font; use Helvetica (verified) for captions.
SUBSTYLE="Fontname=Helvetica,Fontsize=15,Bold=1,PrimaryColour=&H00FFFFFF,OutlineColour=&H99000000,BorderStyle=1,Outline=2,Shadow=0,Alignment=2,MarginV=64"
"$FFMPEG" -y -i "$OUT/master-video.mp4" -i "$OUT/master-audio.wav" \
  -vf "subtitles=captions.srt:force_style='${SUBSTYLE}'" \
  -c:v libx264 -crf 20 -preset slow -pix_fmt yuv420p \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart -shortest \
  "$OUT/vought-90sec-16x9.mp4"

echo "── 6. Derivative cuts ──"
# 1:1 square — center crop, 60s preview from the start.
"$FFMPEG" -y -i "$OUT/vought-90sec-16x9.mp4" -t 60 \
  -vf "crop=1080:1080:(in_w-1080)/2:(in_h-1080)/2,scale=1080:1080,setsar=1" \
  -c:v libx264 -crf 23 -preset slow -pix_fmt yuv420p \
  -c:a aac -b:a 160k -movflags +faststart \
  "$OUT/vought-60sec-1x1.mp4"

# 9:16 vertical — center crop to 608x1080 then scale, 30s teaser.
"$FFMPEG" -y -i "$OUT/vought-90sec-16x9.mp4" -t 30 \
  -vf "crop=608:1080:(in_w-608)/2:0,scale=1080:1920,setsar=1" \
  -c:v libx264 -crf 23 -preset slow -pix_fmt yuv420p \
  -c:a aac -b:a 160k -movflags +faststart \
  "$OUT/vought-30sec-9x16.mp4"

echo "── 7. Thumbnail ──"
# Grab a frame from the live-bloom region (~16s in).
"$FFMPEG" -y -ss 16 -i "$OUT/vought-90sec-16x9.mp4" -vframes 1 "$OUT/thumbnail-16x9.png"

echo ""
echo "✓ Production complete:"
for f in vought-90sec-16x9.mp4 vought-60sec-1x1.mp4 vought-30sec-9x16.mp4 thumbnail-16x9.png; do
  if [ -f "$OUT/$f" ]; then
    SIZE=$(du -h "$OUT/$f" | cut -f1)
    DUR=$("$FFPROBE" -v error -show_entries format=duration -of csv=p=0 "$OUT/$f" 2>/dev/null || echo "n/a")
    printf "  %-26s %6s  %ss\n" "$f" "$SIZE" "$DUR"
  fi
done
