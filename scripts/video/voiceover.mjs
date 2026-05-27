/**
 * voiceover.mjs — ElevenLabs TTS voiceover for the Vought demo video.
 *
 * Reads ELEVENLABS_API_KEY from apps/app/.env.local (never printed).
 * Voice: VU16byTywsWv5JpI8rbc ("Ash"), an ElevenLabs preset — the account has
 * no cloned voice. User explicitly approved the preset. See script.md.
 *
 * Output: output/shots/vo-<n>.mp3 (mp3_44100_128).
 *
 * Usage: node scripts/video/voiceover.mjs
 */

// Calls the ElevenLabs REST API directly via fetch — no SDK dependency, so
// the script runs from scripts/video/ without workspace module resolution.
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, 'output/shots');
mkdirSync(OUT, { recursive: true });

// ── Load ELEVENLABS_API_KEY from apps/app/.env.local ──────────────
const ENV_PATH = resolve(__dirname, '../../apps/app/.env.local');
function loadEnv(path) {
  if (!existsSync(path)) return {};
  const out = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    out[m[1]] = v;
  }
  return out;
}

const env = loadEnv(ENV_PATH);
const API_KEY = process.env.ELEVENLABS_API_KEY || env.ELEVENLABS_API_KEY;
if (!API_KEY) {
  console.error('FATAL: ELEVENLABS_API_KEY not found in env or', ENV_PATH);
  process.exit(1);
}

// "Brian — Deep, Resonant and Comforting" — an ElevenLabs PREMADE preset.
// The account is free-tier: library/professional voices ("Ash") return HTTP 402,
// and no cloned voice exists. User approved a preset; Brian is the closest fit to
// the brand's restrained, intimate tone. Swap if a clone is created later.
const VOICE_ID = process.env.VO_VOICE_ID || 'nPczCjzI2devNBz1zQrb';
const MODEL_ID = process.env.VO_MODEL || 'eleven_multilingual_v2';

// Expanded, VO-driven script (~10 lines) so the cut runs the full ~89s on
// narration alone — no dead-air padding, no background music needed.
// Original Vought brand copy. Numbers spelled out for clean TTS.
const VO_LINES = [
  { name: 'vo-01', text: "Every important conversation in your life happens once. You don't get to rehearse." },
  { name: 'vo-02', text: 'Vought changes that.' },
  { name: 'vo-03', text: 'It listens to your live conversation, separates every speaker, and understands what is happening in the moment.' },
  { name: 'vo-04', text: 'Then it whispers the next line. Privately. Into your ear.' },
  { name: 'vo-05', text: 'In under four hundred milliseconds. Built on the ElevenLabs Speech Engine.' },
  { name: 'vo-06', text: 'And it speaks in a voice you trained yourself. Thirty seconds of recording, and the voice you hear is your own.' },
  { name: 'vo-07', text: 'On a sales call, a copilot that closes. At the front desk, a receptionist that never misses a call.' },
  { name: 'vo-08', text: 'TripleByte closed one point four million dollars more last quarter. Suggestion acceptance tripled.' },
  { name: 'vo-09', text: 'The conversation goes the way it was always supposed to.' },
  { name: 'vo-outro', text: 'Vought. Intelligence for live conversations.' },
];

const ENDPOINT = (voiceId) =>
  `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`;

for (const line of VO_LINES) {
  process.stdout.write(`Generating ${line.name} … `);
  try {
    const res = await fetch(ENDPOINT(VOICE_ID), {
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text: line.text,
        model_id: MODEL_ID,
        voice_settings: {
          stability: 0.55,
          similarity_boost: 0.85,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
      signal: AbortSignal.timeout(60000),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} ${detail.slice(0, 200)}`);
    }
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(resolve(OUT, `${line.name}.mp3`), buf);
    console.log(`ok (${(buf.length / 1024).toFixed(0)} KB)`);
  } catch (err) {
    console.log('FAILED');
    console.error(`  ${line.name}: ${err?.message ?? err}`);
    process.exit(2);
  }
}

console.log('\n✓ All VO segments saved to', OUT);
