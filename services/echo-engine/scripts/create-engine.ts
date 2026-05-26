/**
 * One-time script: create a Speech Engine resource on ElevenLabs.
 *
 * Run with:  npm run create-engine
 *
 * Copy the returned `seng_…` ID into your .env as SPEECH_ENGINE_ID.
 * You only need to run this once per environment (dev, staging, prod).
 *
 * If you need to change settings (voice, turn timeout, language), edit
 * the engine via the dashboard or use elevenlabs.speechEngine.update().
 */

import "dotenv/config";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const PUBLIC_WS_URL = process.env.PUBLIC_WS_URL;
if (!PUBLIC_WS_URL) {
  console.error("\n  ✗ Missing PUBLIC_WS_URL in .env");
  console.error("    Start ngrok first:  ngrok http 3001");
  console.error("    Then set PUBLIC_WS_URL=wss://your-ngrok-id.ngrok-free.app/ws\n");
  process.exit(1);
}

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY!,
});

console.log("\n  Creating Speech Engine resource…\n");

const engine = await elevenlabs.speechEngine.create({
  name: "Vought · Dev",
  speechEngine: {
    wsUrl: PUBLIC_WS_URL,
  },
  asr: {
    quality: "high",
    userInputAudioFormat: "pcm_16000",
    // Pre-seed common names/terms to bias transcription accuracy.
    // For Vox: load from the customer's CRM at session start.
    keywords: [],
  },
  tts: {
    modelId: "eleven_flash_v2",
    // Default voice (Adam). For Cyrano, this gets overridden per user at
    // session start with the user's cloned voice ID.
    voiceId: "pNInz6obpgDQGcFmaJgB",
    agentOutputAudioFormat: "pcm_16000",
    optimizeStreamingLatency: 3,
    stability: 0.5,
    similarityBoost: 0.8,
    speed: 1,
  },
  turn: {
    turnTimeout: 2,           // 2s silence → end-of-turn (default is 7, too slow)
    silenceEndCallTimeout: -1, // never auto-end
    turnEagerness: "normal",
    mode: "turn",
  },
  conversation: {
    maxDurationSeconds: 3600, // 1 hour max session
    clientEvents: ["audio", "interruption", "agent_response", "user_transcript"],
  },
  privacy: {
    recordVoice: false,
    retentionDays: 0,
    deleteTranscriptAndPii: true,
    deleteAudio: true,
    zeroRetentionMode: true,
  },
  callLimits: {
    agentConcurrencyLimit: -1,
    dailyLimit: 100000,
    burstingEnabled: true,
  },
  language: "en",
  tags: ["dev", "vought"],
  overrides: {
    firstMessage: false, // Cyrano never speaks first. The user does.
  },
});

console.log("  ✓ Engine created!\n");
console.log(`    SPEECH_ENGINE_ID=${engine.speechEngineId}\n`);
console.log("  Copy that line into your .env file.\n");
