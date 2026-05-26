/**
 * Conversation memory.
 *
 * Sliding window of the last N turns per session, stored in Redis with a
 * one-hour TTL. Falls back to an in-process Map when Redis is unreachable
 * (dev convenience — single-instance only, do not use in prod).
 *
 * Public surface (per Echo Engine spec):
 *   - appendTurn(sessionId, turn)
 *   - getRecentTurns(sessionId, n=20)
 *   - clearSession(sessionId)
 *
 * Legacy aliases `rememberTurn`, `recallMemory`, `clearMemory` are kept so
 * existing callers (server.ts) do not break during the cutover.
 */

import Redis from "ioredis";
import { logger } from "./log.js";

export type TurnRole = "user" | "agent";

export interface TurnMessage {
  role: TurnRole;
  content: string;
  /** Unix epoch ms — set automatically by appendTurn if missing. */
  t?: number;
}

const DEFAULT_WINDOW = 20;
const TTL_SECONDS = 60 * 60; // 1 hour
const KEY_PREFIX = "echo:memory:";

let redis: Redis | null = null;
let redisHealthy = true;
const fallback = new Map<string, TurnMessage[]>();

function getRedis(): Redis | null {
  if (!redisHealthy) return null;
  if (redis !== null) return redis;
  const url = process.env.REDIS_URL;
  if (!url) return null;
  try {
    redis = new Redis(url, {
      maxRetriesPerRequest: 1,
      lazyConnect: false,
      enableOfflineQueue: false,
    });
    redis.on("error", (err) => {
      if (redisHealthy) {
        logger.warn({ err: err.message }, "memory: redis unavailable, in-memory fallback");
        redisHealthy = false;
      }
    });
    redis.on("ready", () => {
      redisHealthy = true;
      logger.info("memory: redis connected");
    });
    return redis;
  } catch (err) {
    logger.warn({ err: (err as Error).message }, "memory: redis init failed");
    return null;
  }
}

function keyFor(sessionId: string): string {
  return `${KEY_PREFIX}${sessionId}`;
}

/**
 * Read the most recent `n` turns for a session (chronological order).
 */
export async function getRecentTurns(
  sessionId: string,
  n: number = DEFAULT_WINDOW,
): Promise<TurnMessage[]> {
  const r = getRedis();
  if (r && redisHealthy) {
    try {
      const raw = await r.get(keyFor(sessionId));
      const parsed = raw ? (JSON.parse(raw) as TurnMessage[]) : [];
      return parsed.slice(-n);
    } catch (err) {
      logger.warn({ err: (err as Error).message }, "memory: redis read failed");
    }
  }
  const local = fallback.get(sessionId) ?? [];
  return local.slice(-n);
}

/**
 * Append a turn to the sliding window. TTL is refreshed on every write.
 */
export async function appendTurn(
  sessionId: string,
  turn: TurnMessage,
  windowSize: number = DEFAULT_WINDOW,
): Promise<void> {
  const stamped: TurnMessage = { ...turn, t: turn.t ?? Date.now() };
  const prior = await getRecentTurns(sessionId, windowSize);
  const next = [...prior, stamped].slice(-windowSize);

  const r = getRedis();
  if (r && redisHealthy) {
    try {
      await r.setex(keyFor(sessionId), TTL_SECONDS, JSON.stringify(next));
      return;
    } catch (err) {
      logger.warn({ err: (err as Error).message }, "memory: redis write failed");
    }
  }
  fallback.set(sessionId, next);
}

/**
 * Drop all memory for a session (e.g. on close).
 */
export async function clearSession(sessionId: string): Promise<void> {
  const r = getRedis();
  if (r && redisHealthy) {
    try {
      await r.del(keyFor(sessionId));
    } catch (err) {
      logger.warn({ err: (err as Error).message }, "memory: redis delete failed");
    }
  }
  fallback.delete(sessionId);
}

// ─── Legacy aliases (do not use in new code) ─────────────────────────────
export const recallMemory = getRecentTurns;
export const rememberTurn = appendTurn;
export const clearMemory = clearSession;
