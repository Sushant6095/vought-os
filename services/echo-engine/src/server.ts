/**
 * Echo Engine — Speech Engine Server
 *
 * One WebSocket per conversation. ElevenLabs handles STT + TTS + turn
 * detection. Our job:
 *
 *   1. Receive a transcript from ElevenLabs.
 *   2. Ask the diarization sidecar whether the OTHER person just spoke.
 *      (If self, do nothing.)
 *   3. Pull conversation memory from Redis.
 *   4. For Vox personas, pull the top-k playbook chunks from pgvector.
 *   5. Assemble the prompt (orchestrator.ts).
 *   6. Stream the LLM with the AbortSignal threaded through so an
 *      interruption cancels everything cleanly.
 *   7. Forward the token stream to ElevenLabs TTS via session.sendResponse.
 *   8. Persist the new turn to memory.
 *
 * Run with:  pnpm dev --filter=echo-engine
 * Requires:  ELEVENLABS_API_KEY, SPEECH_ENGINE_ID, OPENAI_API_KEY in .env
 */

import "dotenv/config";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

import { logger } from "./log.js";
import {
  getPersona,
  listPersonas,
  validatePersonas,
  type PersonaId,
} from "./personas/index.js";
import {
  appendTurn,
  clearSession,
  getRecentTurns,
  type TurnMessage,
} from "./memory.js";
import { fetchPlaybookContext } from "./rag.js";
import { assemblePrompt } from "./orchestrator.js";
import { SpeakerGate } from "./speaker-gate.js";
import { getUserVoice } from "./voice-clone.js";

// ─── Boot-time validation ────────────────────────────────────────────────
validatePersonas();

const SPEECH_ENGINE_ID = mustGet("SPEECH_ENGINE_ID");
const PORT = Number(process.env.PORT ?? 3001);
const LLM_PROVIDER = (process.env.LLM_PROVIDER ?? "openai") as "openai" | "anthropic";
const LLM_MODEL =
  process.env.LLM_MODEL ?? (LLM_PROVIDER === "anthropic" ? "claude-3-5-haiku-latest" : "gpt-4o-mini");
const MAX_TOKENS = Number(process.env.LLM_MAX_TOKENS ?? 200);
const TEMPERATURE = Number(process.env.LLM_TEMPERATURE ?? 0.7);

const elevenlabs = new ElevenLabsClient({ apiKey: mustGet("ELEVENLABS_API_KEY") });
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // Optional OpenAI-compatible base URL (Cerebras, Groq, OpenRouter, …).
  baseURL: process.env.OPENAI_BASE_URL || undefined,
});
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Speaker gate (diart sidecar subscription) ───────────────────────────
const speakerGate = new SpeakerGate();
speakerGate.start();

// ─── HTTP routes (health + introspection) ────────────────────────────────
const httpServer = createServer((req: IncomingMessage, res: ServerResponse) => {
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        ok: true,
        engineId: SPEECH_ENGINE_ID,
        provider: LLM_PROVIDER,
        model: LLM_MODEL,
        diarConnected: speakerGate.isConnected(),
        personas: listPersonas().length,
      }),
    );
    return;
  }
  if (req.method === "GET" && req.url === "/personas") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify(listPersonas()));
    return;
  }
  res.writeHead(404);
  res.end();
});

// ─── Speech Engine attach ────────────────────────────────────────────────
await elevenlabs.speechEngine.attach(SPEECH_ENGINE_ID, httpServer, "/ws", {
  debug: process.env.NODE_ENV !== "production",

  onInit(conversationId: string) {
    logger.info({ sessionId: conversationId, stage: "session_open" }, "session open");
  },

  async onTranscript(transcript, signal, session) {
    const t0 = Date.now();
    const sessionId = session.conversationId;
    const latest = transcript[transcript.length - 1];

    if (!latest) {
      logger.debug({ sessionId }, "transcript empty, skip");
      return;
    }

    const meta = (session as unknown as { metadata?: Record<string, unknown> }).metadata ?? {};
    const personaId = pickPersonaId(meta);
    const persona = getPersona(personaId);

    logger.info(
      {
        sessionId,
        personaId,
        stage: "transcript_received",
        textPreview: latest.content.slice(0, 80),
        turns: transcript.length,
      },
      "transcript",
    );

    // ── Speaker gate ────────────────────────────────────────────────
    if (!speakerGate.lastSpeakerWasOther(sessionId)) {
      logger.info({ sessionId, stage: "speaker_gate_skip" }, "skip · last speaker was self");
      return;
    }
    logger.debug({ sessionId, stage: "speaker_gate_pass" }, "gate pass");

    // ── Memory + RAG in parallel ────────────────────────────────────
    const [memory, playbookContext] = await Promise.all([
      getRecentTurns(sessionId, 20),
      persona.useRag ? fetchPlaybookContext(personaId, latest.content) : Promise.resolve(null),
    ]);

    // ── Prompt assembly ─────────────────────────────────────────────
    const { system, messages, userMessages } = assemblePrompt({
      persona,
      memory,
      transcript: transcript as TurnMessage[],
      playbookContext,
      variables: extractPromptVariables(meta),
    });

    logger.info(
      {
        sessionId,
        personaId,
        stage: "llm_fire",
        provider: LLM_PROVIDER,
        model: LLM_MODEL,
        promptTurns: messages.length,
        ragInjected: Boolean(playbookContext),
        prepMs: Date.now() - t0,
      },
      "llm fire",
    );

    const firedAt = Date.now();

    try {
      if (LLM_PROVIDER === "anthropic") {
        await streamAnthropic({
          sessionId,
          system,
          messages: userMessages,
          signal,
          send: session.sendResponse.bind(session),
          firedAt,
        });
      } else {
        await streamOpenAI({
          sessionId,
          messages,
          signal,
          send: session.sendResponse.bind(session),
          firedAt,
        });
      }
    } catch (err) {
      if (isAbort(err)) {
        logger.info({ sessionId, stage: "llm_abort" }, "llm aborted");
        return;
      }
      logger.error(
        { sessionId, stage: "error", err: (err as Error).message },
        "llm error",
      );
      return;
    }

    // ── Persist the user turn so future turns have it in memory ─────
    try {
      await appendTurn(sessionId, {
        role: latest.role === "agent" ? "agent" : "user",
        content: latest.content,
      });
    } catch (err) {
      logger.warn(
        { sessionId, err: (err as Error).message },
        "memory: append failed",
      );
    }

    logger.info(
      {
        sessionId,
        personaId,
        stage: "llm_done",
        totalMs: Date.now() - t0,
      },
      "turn complete",
    );
  },

  onClose(session) {
    logger.info({ sessionId: session.conversationId, stage: "session_close" }, "session close");
    speakerGate.forgetSession(session.conversationId);
    void clearSession(session.conversationId);
  },

  onDisconnect(session) {
    logger.warn(
      { sessionId: session.conversationId, stage: "session_disconnect" },
      "disconnected",
    );
  },

  onError(err) {
    logger.error({ stage: "speech_engine_error", err: err?.message ?? String(err) }, "se error");
  },
});

httpServer.listen(PORT, () => {
  logger.info(
    {
      port: PORT,
      engineId: SPEECH_ENGINE_ID,
      provider: LLM_PROVIDER,
      model: LLM_MODEL,
      publicWs: process.env.PUBLIC_WS_URL ?? "(unset)",
    },
    "echo-engine listening",
  );
});

// ─── Graceful shutdown ───────────────────────────────────────────────────
for (const sig of ["SIGINT", "SIGTERM"] as const) {
  process.on(sig, () => {
    logger.info({ sig }, "shutting down");
    speakerGate.stop();
    httpServer.close(() => process.exit(0));
    // hard exit after 3s if anything is still hanging
    setTimeout(() => process.exit(1), 3000).unref();
  });
}

// ─── LLM streaming helpers ───────────────────────────────────────────────

type SendResponse = (stream: unknown) => Promise<void>;

interface StreamArgs {
  sessionId: string;
  signal: AbortSignal;
  send: SendResponse;
  firedAt: number;
}

async function streamOpenAI(
  args: StreamArgs & { messages: { role: "system" | "user" | "assistant"; content: string }[] },
): Promise<void> {
  const { sessionId, messages, signal, send, firedAt } = args;
  const stream = await openai.chat.completions.create(
    {
      model: LLM_MODEL,
      messages,
      stream: true,
      max_tokens: MAX_TOKENS,
      temperature: TEMPERATURE,
    },
    { signal },
  );

  const instrumented = instrumentStream(stream, sessionId, firedAt);
  await send(instrumented);
}

async function streamAnthropic(
  args: StreamArgs & {
    system: string;
    messages: { role: "user" | "assistant"; content: string }[];
  },
): Promise<void> {
  const { sessionId, system, messages, signal, send, firedAt } = args;
  const stream = anthropic.messages.stream(
    {
      model: LLM_MODEL,
      max_tokens: MAX_TOKENS,
      system,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    },
    { signal },
  );

  const instrumented = instrumentStream(stream, sessionId, firedAt);
  await send(instrumented);
}

/**
 * Logs first-token latency once and is otherwise transparent. Returns the
 * original async-iterable so the ElevenLabs SDK can consume it.
 */
function instrumentStream<T extends AsyncIterable<unknown>>(
  stream: T,
  sessionId: string,
  firedAt: number,
): T {
  let firstSeen = false;
  const proxy: AsyncIterable<unknown> = {
    [Symbol.asyncIterator]() {
      const iter = (stream as AsyncIterable<unknown>)[Symbol.asyncIterator]();
      return {
        async next() {
          const r = await iter.next();
          if (!firstSeen && !r.done) {
            firstSeen = true;
            logger.info(
              {
                sessionId,
                stage: "llm_first_token",
                latencyMs: Date.now() - firedAt,
              },
              "first token",
            );
          }
          return r;
        },
        async return(value) {
          return iter.return ? iter.return(value) : { value, done: true };
        },
        async throw(err) {
          return iter.throw ? iter.throw(err) : Promise.reject(err);
        },
      };
    },
  };
  return proxy as T;
}

// ─── Utilities ───────────────────────────────────────────────────────────

function pickPersonaId(meta: Record<string, unknown>): PersonaId {
  const raw = typeof meta.personaId === "string" ? meta.personaId : "first-date";
  // Defensive: getPersona will throw if invalid, but we want a default.
  try {
    getPersona(raw as PersonaId);
    return raw as PersonaId;
  } catch {
    return "first-date";
  }
}

function extractPromptVariables(meta: Record<string, unknown>): Record<string, string> {
  const vars = meta.variables;
  if (!vars || typeof vars !== "object") return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(vars as Record<string, unknown>)) {
    if (typeof v === "string") out[k] = v;
  }
  // userId → voice lookup so live calls render in the user's cloned voice
  if (typeof meta.userId === "string") {
    const vid = getUserVoice(meta.userId);
    if (vid) out.VOICE_ID = vid;
  }
  return out;
}

function isAbort(err: unknown): boolean {
  if (!err) return false;
  const e = err as { name?: string; message?: string };
  return e.name === "AbortError" || /aborted|cancel/i.test(e.message ?? "");
}

function mustGet(key: string): string {
  const v = process.env[key];
  if (!v) {
    logger.fatal({ key }, "missing required env var");
    throw new Error(`Missing required env var: ${key}`);
  }
  return v;
}
