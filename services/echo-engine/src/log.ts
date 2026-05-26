/**
 * Structured logger. Pino in production, pretty-printed in dev.
 *
 * Every important stage in the voice pipeline gets a log line with a
 * consistent shape so we can grep for it later and graph latency.
 *
 * Field conventions:
 *   - `sessionId`   conversation id from the Speech Engine
 *   - `personaId`   the selected persona
 *   - `stage`       one of: transcript_received | speaker_gate | llm_fire |
 *                   llm_token | llm_done | tts_send | aborted | error
 *   - `latencyMs`   milliseconds since the stage's anchor event
 */

import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";

export const logger = pino(
  {
    level: process.env.LOG_LEVEL ?? (isDev ? "debug" : "info"),
    base: { service: "echo-engine" },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  isDev
    ? pino.transport({
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss.l",
          ignore: "pid,hostname,service",
        },
      })
    : pino.destination(1),
);

export type Stage =
  | "transcript_received"
  | "speaker_gate_skip"
  | "speaker_gate_pass"
  | "llm_fire"
  | "llm_first_token"
  | "llm_done"
  | "llm_abort"
  | "tts_send"
  | "memory_write"
  | "rag_hit"
  | "rag_miss"
  | "voice_clone_start"
  | "voice_clone_done"
  | "error";
