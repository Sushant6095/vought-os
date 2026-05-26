/**
 * useRealtimeSession · zustand store
 *
 * Single source of truth for the live screen. Owns:
 *   - connection state (token, sessionId, persona)
 *   - agent state pill (idle | listening | thinking | whispering | paused)
 *   - rolling suggestion history (so ← / → can cycle alternatives)
 *   - transcript word log
 *   - last 60s of speaker segments (for the timeline)
 *   - audio output device (AirPods-only gate)
 *   - latency callsigns
 *
 * All mutations are immutable (spread, no in-place writes). No I/O
 * lives here — the live page wires conversation events into these
 * actions.
 *
 * Reference: Blueprint §5.3 (the components).
 */

'use client';

import { create } from 'zustand';

export type AgentState =
  | 'idle'
  | 'connecting'
  | 'listening'
  | 'thinking'
  | 'whispering'
  | 'paused';

export interface Suggestion {
  /** Stable identifier — for keyed transitions and "Used" marking. */
  id: string;
  /** The whisper line — what to say. */
  text: string;
  /** Optional follow-up hint ("then: …"). */
  followUp?: string;
  /** Confidence 0..1 — drives the amber bar (Teams). */
  confidence?: number;
  /** Source attribution (Teams). */
  source?: {
    label: string;
    metric?: string;
    author?: string;
  };
  /** Time received, for sorting. */
  receivedAt: number;
  /** Was this suggestion marked Used by the operator? */
  used?: boolean;
  /** Was this suggestion interrupted mid-whisper? */
  interrupted?: boolean;
}

export interface SpeakerSegment {
  /** unique id per segment */
  id: string;
  /** start time (epoch ms) */
  tStart: number;
  /** end time (epoch ms) — segments grow while a speaker holds the floor */
  tEnd: number;
  /** Was this the operator (the "self" voice)? */
  isSelf: boolean;
}

export interface TranscriptWord {
  text: string;
  /** "agent" → AI whisper text. "user" → operator. "other" → the prospect/date/etc. */
  source: 'agent' | 'user' | 'other';
  receivedAt: number;
}

/**
 * Output device. We only play Vought audio through headphones — speakers
 * are muted with a banner per Blueprint §5.3.8 (interruption hygiene).
 */
export type OutputDevice = 'headphones' | 'speakers' | 'unknown';

interface RealtimeState {
  // ── connection ───────────────────────────────────────────────
  sessionId: string | null;
  personaId: string;

  // ── agent state ──────────────────────────────────────────────
  agentState: AgentState;
  /** Reason the AI is paused, if any (e.g. "no headphones"). */
  pauseReason?: string;
  /** Timestamp of the most recent state pill transition (for latency math). */
  lastStateChangeAt: number;

  // ── suggestions ──────────────────────────────────────────────
  suggestions: Suggestion[];
  activeSuggestionId: string | null;

  // ── transcript ───────────────────────────────────────────────
  transcript: TranscriptWord[];
  /** The most recent utterance from the *other* speaker, for the
   *  "They just said" panel above the suggestion card. */
  lastOtherUtterance: string | null;

  // ── diarization ──────────────────────────────────────────────
  segments: SpeakerSegment[];
  /** Five-second enrollment window — keep state pill in "Listening
   *  (calibrating)" until this elapses. */
  enrollmentReady: boolean;

  // ── audio device ─────────────────────────────────────────────
  outputDevice: OutputDevice;

  // ── latency callsign ─────────────────────────────────────────
  lastLatencyMs: number | null;

  // ── actions ──────────────────────────────────────────────────
  setSession: (sessionId: string, personaId: string) => void;
  setAgentState: (next: AgentState, pauseReason?: string) => void;
  setEnrollmentReady: (ready: boolean) => void;
  setOutputDevice: (device: OutputDevice) => void;
  setLastLatencyMs: (ms: number) => void;

  addSuggestion: (s: Omit<Suggestion, 'receivedAt'>) => void;
  appendSuggestionText: (id: string, chunk: string) => void;
  fadeActiveSuggestion: () => void;
  cycleSuggestion: (direction: -1 | 1) => void;
  markSuggestionUsed: (id: string) => void;
  regenerateActive: () => void;

  appendTranscriptWords: (
    source: TranscriptWord['source'],
    words: string,
  ) => void;
  setLastOtherUtterance: (text: string) => void;

  upsertSegment: (segment: SpeakerSegment) => void;
  pruneSegments: (windowMs?: number) => void;

  reset: () => void;
}

const SEGMENT_WINDOW_MS = 60_000;

export const useRealtimeSession = create<RealtimeState>((set) => ({
  sessionId: null,
  personaId: 'first-date',

  agentState: 'idle',
  pauseReason: undefined,
  lastStateChangeAt: 0,

  suggestions: [],
  activeSuggestionId: null,

  transcript: [],
  lastOtherUtterance: null,

  segments: [],
  enrollmentReady: false,

  outputDevice: 'unknown',

  lastLatencyMs: null,

  setSession: (sessionId, personaId) =>
    set({ sessionId, personaId }),

  setAgentState: (next, pauseReason) =>
    set({
      agentState: next,
      pauseReason: next === 'paused' ? pauseReason : undefined,
      lastStateChangeAt: Date.now(),
    }),

  setEnrollmentReady: (ready) => set({ enrollmentReady: ready }),

  setOutputDevice: (device) => set({ outputDevice: device }),

  setLastLatencyMs: (ms) => set({ lastLatencyMs: ms }),

  addSuggestion: (s) =>
    set((state) => {
      const suggestion: Suggestion = { ...s, receivedAt: Date.now() };
      return {
        suggestions: [...state.suggestions, suggestion],
        activeSuggestionId: suggestion.id,
      };
    }),

  appendSuggestionText: (id, chunk) =>
    set((state) => ({
      suggestions: state.suggestions.map((s) =>
        s.id === id ? { ...s, text: s.text + chunk } : s,
      ),
    })),

  fadeActiveSuggestion: () =>
    set((state) => {
      if (!state.activeSuggestionId) return {};
      return {
        suggestions: state.suggestions.map((s) =>
          s.id === state.activeSuggestionId ? { ...s, interrupted: true } : s,
        ),
      };
    }),

  cycleSuggestion: (direction) =>
    set((state) => {
      if (state.suggestions.length === 0) return {};
      const idx = state.suggestions.findIndex(
        (s) => s.id === state.activeSuggestionId,
      );
      const nextIdx =
        (idx + direction + state.suggestions.length) % state.suggestions.length;
      return { activeSuggestionId: state.suggestions[nextIdx].id };
    }),

  markSuggestionUsed: (id) =>
    set((state) => ({
      suggestions: state.suggestions.map((s) =>
        s.id === id ? { ...s, used: true } : s,
      ),
    })),

  regenerateActive: () => {
    // No-op at the store level — the page hooks this to a custom
    // event the orchestrator can pick up (or simply re-fires the LLM
    // via the Speech Engine on the next user turn). We surface the
    // signal in lastStateChangeAt so the UI can flash the pill.
    set({ lastStateChangeAt: Date.now() });
  },

  appendTranscriptWords: (source, words) =>
    set((state) => {
      // Tokenize the new chunk (whitespace preserved).
      const tokens = words.split(/(\s+)/).filter((w) => w.length > 0);
      const now = Date.now();
      const next: TranscriptWord[] = tokens.map((text) => ({
        text,
        source,
        receivedAt: now,
      }));
      return { transcript: [...state.transcript, ...next] };
    }),

  setLastOtherUtterance: (text) => set({ lastOtherUtterance: text }),

  upsertSegment: (segment) =>
    set((state) => {
      const existing = state.segments.findIndex((s) => s.id === segment.id);
      const next =
        existing === -1
          ? [...state.segments, segment]
          : state.segments.map((s, i) => (i === existing ? segment : s));
      // Prune anything outside the rolling window.
      const cutoff = Date.now() - SEGMENT_WINDOW_MS;
      return { segments: next.filter((s) => s.tEnd >= cutoff) };
    }),

  pruneSegments: (windowMs = SEGMENT_WINDOW_MS) =>
    set((state) => {
      const cutoff = Date.now() - windowMs;
      return { segments: state.segments.filter((s) => s.tEnd >= cutoff) };
    }),

  reset: () =>
    set({
      sessionId: null,
      agentState: 'idle',
      pauseReason: undefined,
      lastStateChangeAt: 0,
      suggestions: [],
      activeSuggestionId: null,
      transcript: [],
      lastOtherUtterance: null,
      segments: [],
      enrollmentReady: false,
      lastLatencyMs: null,
    }),
}));

/** Selector: the currently active suggestion, if any. */
export function selectActiveSuggestion(s: RealtimeState): Suggestion | null {
  if (!s.activeSuggestionId) return null;
  return s.suggestions.find((x) => x.id === s.activeSuggestionId) ?? null;
}
