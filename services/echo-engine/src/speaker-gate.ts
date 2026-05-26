/**
 * Speaker gate.
 *
 * Opens a WebSocket to the Python diarization sidecar at
 * `ws://localhost:8000/labels` and maintains an in-memory map of the most
 * recent speaker label per session. Exposes a single synchronous predicate
 * for the hot path: `lastSpeakerWasOther(sessionId)`.
 *
 * Failure modes:
 *  - Sidecar down → predicate returns `true` (degraded mode: fire LLM on
 *    every transcript). This is the safe default for the demo.
 *  - Bad label payload → log and drop; do not crash the process.
 *  - Reconnect with backoff if the socket drops.
 */

import { WebSocket } from "ws";
import { logger } from "./log.js";

export interface SpeakerLabel {
  sessionId: string;
  /** Seconds since session start. */
  tEnd: number;
  speakerId: string;
  isSelf: boolean;
  confidence: number;
}

const RECONNECT_INITIAL_MS = 500;
const RECONNECT_MAX_MS = 8000;
const LABELS_PER_SESSION = 30;
const STALE_LABEL_AGE_MS = 5_000;

interface CachedLabel extends SpeakerLabel {
  receivedAt: number;
}

export class SpeakerGate {
  private readonly url: string;
  private readonly labels = new Map<string, CachedLabel[]>();
  private socket: WebSocket | null = null;
  private reconnectMs = RECONNECT_INITIAL_MS;
  private closed = false;
  private connected = false;

  constructor(url?: string) {
    this.url = url ?? process.env.DIARIZATION_WS_URL ?? "ws://localhost:8000/labels";
  }

  start(): void {
    this.closed = false;
    this.connect();
  }

  stop(): void {
    this.closed = true;
    this.socket?.close();
    this.socket = null;
  }

  /**
   * Returns true when the most recent label for this session is `isSelf:
   * false` (the OTHER person spoke last). Also returns true if no label has
   * ever been seen — degraded mode means we keep coaching.
   *
   * Returns false (suppress the LLM) only when there is a fresh, high-
   * confidence label saying the user themselves just spoke.
   */
  lastSpeakerWasOther(sessionId: string): boolean {
    const labels = this.labels.get(sessionId);
    if (!labels || labels.length === 0) return true;
    const latest = labels[labels.length - 1];

    // Stale labels are ignored — better to fire than to wedge.
    if (Date.now() - latest.receivedAt > STALE_LABEL_AGE_MS) return true;

    return latest.isSelf === false;
  }

  /** For tests and metrics. */
  isConnected(): boolean {
    return this.connected;
  }

  /** For tests — clear a session's labels on close. */
  forgetSession(sessionId: string): void {
    this.labels.delete(sessionId);
  }

  /** For tests — inject a label without going over the wire. */
  injectLabel(label: SpeakerLabel): void {
    this.recordLabel(label);
  }

  private connect(): void {
    if (this.closed) return;

    logger.info({ url: this.url }, "speaker-gate: connecting");
    this.socket = new WebSocket(this.url);

    this.socket.on("open", () => {
      this.connected = true;
      this.reconnectMs = RECONNECT_INITIAL_MS;
      logger.info({ url: this.url }, "speaker-gate: connected");
    });

    this.socket.on("message", (raw) => {
      this.handleMessage(raw.toString());
    });

    this.socket.on("close", () => {
      this.connected = false;
      if (this.closed) return;
      logger.warn({ retryMs: this.reconnectMs }, "speaker-gate: disconnected");
      setTimeout(() => this.connect(), this.reconnectMs);
      this.reconnectMs = Math.min(this.reconnectMs * 2, RECONNECT_MAX_MS);
    });

    this.socket.on("error", (err) => {
      logger.warn({ err: err.message }, "speaker-gate: socket error");
    });
  }

  private handleMessage(raw: string): void {
    let label: SpeakerLabel;
    try {
      label = JSON.parse(raw) as SpeakerLabel;
    } catch (err) {
      logger.warn({ err: (err as Error).message }, "speaker-gate: bad label payload");
      return;
    }
    if (typeof label.sessionId !== "string" || typeof label.isSelf !== "boolean") {
      logger.warn({ label }, "speaker-gate: malformed label");
      return;
    }
    this.recordLabel(label);
  }

  private recordLabel(label: SpeakerLabel): void {
    const arr = this.labels.get(label.sessionId) ?? [];
    const next = [...arr, { ...label, receivedAt: Date.now() }].slice(
      -LABELS_PER_SESSION,
    );
    this.labels.set(label.sessionId, next);
  }
}
