/**
 * Voice cloning CLI.
 *
 * Captures ~30s of audio from the terminal's default mic (via `sox`), pipes
 * it through `node-record-lpcm16`, uploads to ElevenLabs voice cloning, and
 * prints the new `voice_id` so you can paste it into your app config or
 * .env.
 *
 * Run with:
 *
 *   pnpm --filter=echo-engine clone-voice -- --name "Sushant"
 *
 * Requires `sox` on PATH. macOS: `brew install sox`. Ubuntu: `apt install sox`.
 *
 * If you want to upload an existing file instead of recording, pass
 * `--file path/to/sample.wav` and recording is skipped.
 */

import "dotenv/config";
import { promises as fs } from "node:fs";
import path from "node:path";
import { cloneVoice } from "../src/voice-clone.js";
import { logger } from "../src/log.js";

interface CliArgs {
  name: string;
  durationSec: number;
  file?: string;
  description?: string;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    name: `Vought voice ${new Date().toISOString().slice(0, 10)}`,
    durationSec: 30,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = argv[i + 1];
    if (a === "--name" && next) {
      args.name = next;
      i++;
    } else if (a === "--duration" && next) {
      args.durationSec = Math.max(5, Math.min(120, Number(next)));
      i++;
    } else if (a === "--file" && next) {
      args.file = next;
      i++;
    } else if (a === "--description" && next) {
      args.description = next;
      i++;
    } else if (a === "--help" || a === "-h") {
      printHelp();
      process.exit(0);
    }
  }
  return args;
}

function printHelp(): void {
  process.stdout.write(
    [
      "",
      "  clone-voice — record + upload a voice clone to ElevenLabs",
      "",
      "  Usage:",
      "    pnpm clone-voice [--name <name>] [--duration <sec>] [--file <path>]",
      "",
      "  Options:",
      "    --name <name>          Voice display name (default: today's date)",
      "    --duration <sec>       Recording length in seconds (default: 30)",
      "    --file <path>          Skip recording, upload an existing audio file",
      "    --description <text>   Voice description for ElevenLabs",
      "",
    ].join("\n"),
  );
}

async function recordFromMic(durationSec: number): Promise<Buffer> {
  // Lazy-load so users who pass --file don't need sox installed.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const record = (await import("node-record-lpcm16")) as unknown as {
    default?: { record: (opts: unknown) => { stream(): NodeJS.ReadableStream; stop(): void } };
    record?: (opts: unknown) => { stream(): NodeJS.ReadableStream; stop(): void };
  };
  const recorder = record.default ?? record;
  if (!recorder.record) {
    throw new Error("node-record-lpcm16 missing .record — is the package installed?");
  }

  process.stdout.write(
    [
      "",
      `  Recording ${durationSec}s of your voice.`,
      "  Read the paragraph in your normal voice. Avoid background noise.",
      "  Starting in 2 seconds…",
      "",
    ].join("\n"),
  );
  await sleep(2000);
  process.stdout.write("  [recording]\n");

  const rec = recorder.record({
    sampleRateHertz: 22050,
    channels: 1,
    threshold: 0,
    recorder: "sox",
    silence: "60.0",
    audioType: "wav",
  });

  const chunks: Buffer[] = [];
  const stream = rec.stream();
  stream.on("data", (c: Buffer) => chunks.push(c));

  await sleep(durationSec * 1000);
  rec.stop();
  // Give the stream a beat to flush its tail buffer.
  await sleep(150);

  process.stdout.write("  [done]\n\n");
  return Buffer.concat(chunks);
}

async function main(): Promise<void> {
  if (!process.env.ELEVENLABS_API_KEY) {
    process.stderr.write("\n  ✗ Missing ELEVENLABS_API_KEY in .env\n\n");
    process.exit(1);
  }

  const args = parseArgs(process.argv.slice(2));

  let audio: Buffer;
  let filename = "sample.wav";
  let mimeType = "audio/wav";

  if (args.file) {
    const abs = path.resolve(args.file);
    audio = await fs.readFile(abs);
    filename = path.basename(abs);
    mimeType = guessMime(filename);
    process.stdout.write(`  Uploading ${filename} (${audio.length} bytes)…\n`);
  } else {
    audio = await recordFromMic(args.durationSec);
    process.stdout.write(`  Uploading ${audio.length} bytes to ElevenLabs…\n`);
  }

  const result = await cloneVoice({
    name: args.name,
    audio,
    mimeType,
    filename,
    description: args.description,
    labels: { source: "vought-cli" },
  });

  process.stdout.write(
    [
      "",
      "  ✓ Voice clone uploaded!",
      "",
      `    voice_id = ${result.voiceId}`,
      result.requiresVerification ? "    (requires verification before TTS use)" : "",
      "",
      "  Use this voice_id in session metadata to render whispers in",
      "  the user's cloned voice.",
      "",
    ]
      .filter(Boolean)
      .join("\n"),
  );
}

function guessMime(name: string): string {
  const ext = name.toLowerCase().split(".").pop();
  switch (ext) {
    case "wav":
      return "audio/wav";
    case "mp3":
      return "audio/mpeg";
    case "m4a":
      return "audio/mp4";
    case "webm":
      return "audio/webm";
    case "ogg":
      return "audio/ogg";
    default:
      return "application/octet-stream";
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

main().catch((err) => {
  logger.error({ err: err.message }, "clone-voice failed");
  process.stderr.write(`\n  ✗ ${err.message}\n\n`);
  process.exit(1);
});
