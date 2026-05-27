/**
 * Live Call Screen · Blueprint §5
 *
 * The single most important screen in the product. Everything else
 * exists to set this one up.
 *
 * Flow per Blueprint §5.7:
 *   T+0.000  Other speaker stops talking.
 *   T+0.250  Diart confirms end-of-turn. ElevenLabs sends transcript.
 *   T+0.260  State pill → "Thinking" (amber dot pulse).
 *   T+0.580  First LLM token. Pill holds in Thinking.
 *   T+0.620  TTS first byte. Pill blooms to "Whispering".
 *   T+0.640  Suggestion card blooms. Word stream begins.
 *   T+0.840  Audio reaches AirPod.
 *   T+3.100  Audio playback ends → pill returns to "Listening".
 *
 * Interruption (Blueprint §5.3.8): if the operator starts speaking
 * mid-whisper, the AbortSignal fires within 200ms. Suggestion card
 * fades to 60% opacity, audio cuts, pill flips to "Listening".
 *
 * Output device gate (Blueprint §5.3): we only play whispers through
 * headphones. On speakers, audio is muted and a banner asks the user
 * to plug in.
 *
 * Keyboard shortcuts (Blueprint §5.3.3):
 *   ←  cycle to previous suggestion alternative
 *   →  cycle to next suggestion alternative
 *   R  regenerate the active suggestion
 *   ⏎  accept (mark "Used")
 *   Cmd+.  toggle focus mode (hides flanking panels)
 *   Esc  end the session
 */

'use client';

import { useConversation } from '@elevenlabs/react';
import { useRouter } from 'next/navigation';
import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Container } from '@vought/ui';

import {
  selectActiveSuggestion,
  useRealtimeSession,
} from './_hooks/useRealtimeSession';
import { StatePill } from './_components/StatePill';
import { SuggestionCard } from './_components/SuggestionCard';
import { WordStreamTranscript } from './_components/WordStreamTranscript';
import { SpeakerTimeline } from './_components/SpeakerTimeline';
import { VoiceWaveform } from './_components/VoiceWaveform';
import { ReplyPipeline } from './_components/ReplyPipeline';
import { ConfidenceIndicator } from './_components/ConfidenceIndicator';
import {
  DealContextPanel,
  type DealContext,
} from './_components/DealContextPanel';
import { SourceAttributionPanel } from './_components/SourceAttributionPanel';
import { DisclosureFooter } from './_components/DisclosureFooter';

interface LivePageProps {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

type Variant = 'personal' | 'teams';

interface TokenResponse {
  token: string;
  sessionId: string;
  personaId: string;
  userId: string;
}

const ENROLLMENT_WINDOW_MS = 5_000;

export default function LiveCallPage(props: LivePageProps) {
  const params = use(props.params);
  const searchParams = use(props.searchParams);
  const router = useRouter();

  const personaParam =
    typeof searchParams.persona === 'string' ? searchParams.persona : 'first-date';
  const variant: Variant =
    searchParams.variant === 'teams' ? 'teams' : 'personal';

  // ── Store wiring ────────────────────────────────────────────
  const agentState = useRealtimeSession((s) => s.agentState);
  const pauseReason = useRealtimeSession((s) => s.pauseReason);
  const enrollmentReady = useRealtimeSession((s) => s.enrollmentReady);
  const outputDevice = useRealtimeSession((s) => s.outputDevice);
  const lastOtherUtterance = useRealtimeSession((s) => s.lastOtherUtterance);
  const segments = useRealtimeSession((s) => s.segments);
  const lastLatencyMs = useRealtimeSession((s) => s.lastLatencyMs);
  const activeSuggestion = useRealtimeSession(selectActiveSuggestion);

  const setSession = useRealtimeSession((s) => s.setSession);
  const setAgentState = useRealtimeSession((s) => s.setAgentState);
  const setEnrollmentReady = useRealtimeSession((s) => s.setEnrollmentReady);
  const setOutputDevice = useRealtimeSession((s) => s.setOutputDevice);
  const setLastLatencyMs = useRealtimeSession((s) => s.setLastLatencyMs);
  const addSuggestion = useRealtimeSession((s) => s.addSuggestion);
  const setLastOtherUtterance = useRealtimeSession((s) => s.setLastOtherUtterance);
  const cycleSuggestion = useRealtimeSession((s) => s.cycleSuggestion);
  const markSuggestionUsed = useRealtimeSession((s) => s.markSuggestionUsed);
  const fadeActiveSuggestion = useRealtimeSession((s) => s.fadeActiveSuggestion);
  const regenerateActive = useRealtimeSession((s) => s.regenerateActive);
  const upsertSegment = useRealtimeSession((s) => s.upsertSegment);
  const resetSession = useRealtimeSession((s) => s.reset);

  // ── Local refs (no re-render) ───────────────────────────────
  const diarizationWsRef = useRef<WebSocket | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionStartRef = useRef<number>(0);
  const thinkingStartRef = useRef<number>(0);
  /** Guards the auto-start effect against StrictMode's double-invocation. */
  const sessionStartedRef = useRef<boolean>(false);
  /** Deferred-teardown handle so a StrictMode remount can cancel cleanup. */
  const teardownTimerRef = useRef<number | null>(null);
  /** Timer that flips pill back to listening after a whisper completes. */
  const whisperReturnTimerRef = useRef<number | null>(null);

  // ── Focus mode (Cmd+.) ──────────────────────────────────────
  const [focusMode, setFocusMode] = useState<boolean>(false);

  // ── ElevenLabs Speech Engine conversation ──────────────────
  const conversation = useConversation({
    onConnect: () => {
      // Stay in "connecting" visually until first transcript / first
      // tts byte. The pill flips to "listening" once enrollment is
      // ready (handled by the diart enrollment timer below).
      setAgentState('listening');
    },
    onDisconnect: () => {
      setAgentState('idle');
    },
    onMessage: (message: { source?: string; message?: string }) => {
      const text = message.message ?? '';
      if (!text) return;

      if (message.source === 'user' || message.source === 'other') {
        // The other speaker's transcript.
        setLastOtherUtterance(text);
        // The instant we have a complete user turn, the pill flips
        // to "thinking" — the LLM is being assembled.
        if (agentState === 'listening' || agentState === 'whispering') {
          thinkingStartRef.current = performance.now();
          setAgentState('thinking');
        }
        return;
      }

      if (message.source === 'agent') {
        // Suggestion arrived. Render it via the bloom and play TTS
        // (the SDK handles audio routing on its own). Compute the
        // latency callsign — first-byte to ear.
        const latencyMs = performance.now() - thinkingStartRef.current;
        if (Number.isFinite(latencyMs) && latencyMs > 0) {
          setLastLatencyMs(latencyMs);
        }

        const id = `s-${Date.now().toString(36)}-${Math.random()
          .toString(36)
          .slice(2, 6)}`;
        const { primary, followUp } = parseSuggestionText(text);

        addSuggestion({
          id,
          text: primary,
          followUp,
          // Personal builds don't carry confidence; Teams will hydrate
          // this from a side-channel once that wire format is finalized.
          confidence: variant === 'teams' ? 0.86 : undefined,
          source:
            variant === 'teams'
              ? {
                  label: 'Playbook · Salesforce objection v3',
                  metric: '2.3× close',
                }
              : undefined,
        });

        setAgentState('whispering');

        // Auto-return to listening after the whisper finishes. We
        // approximate based on text length; a tighter signal will
        // come from ElevenLabs' `onAudioEnd` once that surface
        // stabilizes in the SDK.
        const estimatedDurationMs = Math.max(2_000, primary.length * 55);
        if (whisperReturnTimerRef.current !== null) {
          window.clearTimeout(whisperReturnTimerRef.current);
        }
        whisperReturnTimerRef.current = window.setTimeout(() => {
          setAgentState('listening');
        }, estimatedDurationMs);
      }
    },
    onError: (message: string, context?: unknown) => {
      // eslint-disable-next-line no-console
      console.error('[live] speech engine error', message, context);
    },
  });

  // ── Output-device watchdog ──────────────────────────────────
  // Audio plays only on headphones. Update on plug events.
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      return;
    }

    const detect = async (): Promise<void> => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const outputs = devices.filter((d) => d.kind === 'audiooutput');
        const headphones = outputs.find((d) =>
          /headphone|airpod|earpods|earbud|bluetooth/i.test(d.label),
        );
        if (headphones) {
          setOutputDevice('headphones');
        } else if (outputs.length > 0) {
          setOutputDevice('speakers');
        } else {
          setOutputDevice('unknown');
        }
      } catch {
        setOutputDevice('unknown');
      }
    };

    void detect();
    navigator.mediaDevices.addEventListener('devicechange', detect);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', detect);
    };
  }, [setOutputDevice]);

  // ── Mute audio when on speakers ─────────────────────────────
  // The ElevenLabs SDK doesn't expose direct output routing, so we
  // mute via the SDK's volume API and surface a banner. When the
  // operator plugs in, we restore.
  useEffect(() => {
    if (outputDevice === 'speakers' && agentState !== 'paused') {
      try {
        conversation.setVolume({ volume: 0 });
      } catch {
        // SDK shape drift — soft-fail.
      }
      setAgentState('paused', 'connect headphones');
    } else if (outputDevice === 'headphones' && agentState === 'paused') {
      try {
        conversation.setVolume({ volume: 1 });
      } catch {
        // SDK shape drift — soft-fail.
      }
      setAgentState('listening');
    }
  }, [outputDevice, agentState, conversation, setAgentState]);

  // ── Start session (mic + token + diarization sidechannel) ──
  const startSession = useCallback(async (): Promise<void> => {
    setAgentState('connecting');
    sessionStartRef.current = performance.now();

    try {
      // 1. Mic.
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      // 2. Token + sessionId from our API route.
      const resp = await fetch('/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaId: personaParam,
          userId: 'demo-user',
        }),
      });
      if (!resp.ok) throw new Error(`Token failed: ${resp.status}`);
      const payload = (await resp.json()) as TokenResponse;

      setSession(payload.sessionId, payload.personaId);

      // 3. Speech Engine. Metadata mirrors what the Echo Engine's
      // orchestrator reads (personaId, userId, variables).
      await conversation.startSession({
        conversationToken: payload.token,
        // The SDK forwards metadata into session.metadata which the
        // Echo Engine reads at attach time.
        metadata: {
          personaId: payload.personaId,
          userId: payload.userId,
          variables: {},
        },
      } as Parameters<typeof conversation.startSession>[0]);

      // 4. Diarization sidechannel — open in parallel with the
      // Speech Engine session.
      openDiarizationChannel(payload.sessionId, stream);

      // 5. Enrollment window: hold "listening (calibrating)" for 5s.
      window.setTimeout(() => {
        setEnrollmentReady(true);
      }, ENROLLMENT_WINDOW_MS);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[live] failed to start session', err);
      setAgentState('idle');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personaParam]);

  // Diart channel — open after mic and token are ready.
  //
  // Two sockets:
  //   1. /audio/{sessionId} — outbound only, PCM frames at 16kHz mono.
  //   2. /labels             — read-only mirror of the same labels the
  //      Echo Engine consumes. We use it to paint the speaker timeline.
  //
  // If the labels socket isn't reachable (production may route this
  // server-side only), the timeline degrades to "calibrating".
  function openDiarizationChannel(sessionId: string, stream: MediaStream): void {
    const audioBase =
      process.env.NEXT_PUBLIC_DIARIZATION_WS_URL ?? 'ws://localhost:8000/audio';
    const audioUrl = `${audioBase}/${sessionId}`;

    let audioWs: WebSocket;
    try {
      audioWs = new WebSocket(audioUrl);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[live] diart sidecar unreachable, degraded mode', err);
      return;
    }
    diarizationWsRef.current = audioWs;

    audioWs.onopen = () => {
      // Pipe raw 16kHz PCM frames.
      const ctx = new AudioContext({ sampleRate: 16_000 });
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const processor = ctx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e: AudioProcessingEvent) => {
        if (audioWs.readyState !== WebSocket.OPEN) return;
        const float32 = e.inputBuffer.getChannelData(0);
        const int16 = new Int16Array(float32.length);
        for (let i = 0; i < float32.length; i += 1) {
          const s = Math.max(-1, Math.min(1, float32[i]));
          int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }
        audioWs.send(int16.buffer);
      };
      source.connect(processor);
      processor.connect(ctx.destination);
    };

    audioWs.onerror = () => {
      // Degraded mode — Echo Engine fires LLM unconditionally.
    };

    // ── Labels socket — read-only mirror for the timeline ──────
    try {
      const labelsBase = audioBase.replace(/\/audio$/, '/labels');
      const labelsWs = new WebSocket(labelsBase);
      labelsWs.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(
            typeof event.data === 'string' ? event.data : '{}',
          );
          if (data?.type === 'ping') return;
          if (data?.sessionId !== sessionId) return;
          if (
            typeof data?.tStart === 'number' &&
            typeof data?.tEnd === 'number' &&
            typeof data?.isSelf === 'boolean'
          ) {
            // Sidecar sends seconds-from-session-start. We map onto
            // wall-clock so the timeline can age segments out.
            const baseEpoch = Date.now() - data.tEnd * 1000;
            upsertSegment({
              id: `seg-${data.speakerId ?? (data.isSelf ? 'self' : 'other')}-${data.tStart.toFixed(3)}`,
              tStart: baseEpoch + (data.tStart - data.tEnd) * 1000,
              tEnd: Date.now(),
              isSelf: data.isSelf,
            });
          }
        } catch {
          // Soft-fail.
        }
      };
      labelsWs.onerror = () => undefined;
    } catch {
      // No labels surface in this environment — degraded but the
      // suggestion path still works because Echo Engine reads labels
      // server-side.
    }
  }

  // ── Stop session ────────────────────────────────────────────
  const stopSession = useCallback(async (): Promise<void> => {
    try {
      await conversation.endSession();
    } catch {
      // ignore
    }
    diarizationWsRef.current?.close();
    diarizationWsRef.current = null;

    processorRef.current?.disconnect();
    processorRef.current = null;

    audioContextRef.current?.close().catch(() => undefined);
    audioContextRef.current = null;

    audioStreamRef.current?.getTracks().forEach((t) => t.stop());
    audioStreamRef.current = null;

    if (whisperReturnTimerRef.current !== null) {
      window.clearTimeout(whisperReturnTimerRef.current);
      whisperReturnTimerRef.current = null;
    }

    resetSession();
    router.push('/');
  }, [conversation, resetSession, router]);

  // ── Demo seed (capture / screenshot only) ──────────────────
  // Gated to `?demo=1` AND development. Seeds the store with a
  // realistic whispering state so the hero bloom, word stream,
  // speaker timeline, and latency callsign render deterministically
  // for the demo-video capture pipeline — without a live mic or
  // backend. This drives the REAL components through their REAL
  // animations; only the input event is synthetic. Production
  // builds never reach this branch.
  const demoMode = searchParams.demo === '1';
  useEffect(() => {
    if (!demoMode || process.env.NODE_ENV === 'production') return;

    const store = useRealtimeSession;
    // Expose for programmatic capture drivers (Playwright).
    (window as unknown as { __voughtLive?: typeof store }).__voughtLive = store;

    const t0 = window.setTimeout(() => {
      store.getState().setSession('demo-session', personaParam);
      store.getState().setOutputDevice('headphones');
      store.getState().setEnrollmentReady(true);
      store.getState().setAgentState('listening');
      const now = Date.now();
      store.getState().upsertSegment({
        id: 'seg-other-1',
        tStart: now - 9000,
        tEnd: now - 5400,
        isSelf: false,
      });
      store.getState().upsertSegment({
        id: 'seg-self-1',
        tStart: now - 5200,
        tEnd: now - 3800,
        isSelf: true,
      });
      store.getState().upsertSegment({
        id: 'seg-other-2',
        tStart: now - 3600,
        tEnd: now - 600,
        isSelf: false,
      });
      store
        .getState()
        .setLastOtherUtterance(
          'We already pay for Salesforce — not sure we need another system.',
        );
    }, 600);

    const t1 = window.setTimeout(() => {
      store.getState().setAgentState('thinking');
    }, 2200);

    const t2 = window.setTimeout(() => {
      store.getState().setLastLatencyMs(412);
      store.getState().addSuggestion({
        id: 'demo-suggestion-1',
        text: 'Totally hear you on stack fatigue. What do your reps actually spend their day doing inside Salesforce?',
        followUp: 'If they say logging — that is exactly the gap we close.',
      });
      store.getState().setAgentState('whispering');
    }, 3000);

    return () => {
      window.clearTimeout(t0);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoMode]);

  // ── Auto-start on mount ─────────────────────────────────────
  // React 18 StrictMode runs effects mount→unmount→remount in dev. A naive
  // start-on-mount / end-on-cleanup would open the ElevenLabs socket and tear
  // it down mid-connect ("Websocket got closed during a (re)connection
  // attempt"). We start exactly once and defer teardown a tick so the
  // StrictMode remount can cancel it; a real unmount has no remount, so the
  // session ends cleanly.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (demoMode && process.env.NODE_ENV !== 'production') return; // demo seeds the store; skip live session

    if (teardownTimerRef.current !== null) {
      clearTimeout(teardownTimerRef.current);
      teardownTimerRef.current = null;
    }
    if (!sessionStartedRef.current) {
      sessionStartedRef.current = true;
      void startSession();
    }

    return () => {
      teardownTimerRef.current = window.setTimeout(() => {
        sessionStartedRef.current = false;
        teardownTimerRef.current = null;
        void (async () => {
          try {
            await conversation.endSession();
          } catch {
            // ignore
          }
        })();
        diarizationWsRef.current?.close();
        processorRef.current?.disconnect();
        audioContextRef.current?.close().catch(() => undefined);
        audioStreamRef.current?.getTracks().forEach((t) => t.stop());
      }, 60);
    };
  }, []);

  // ── Keyboard shortcuts ──────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      // Cmd+. → focus mode toggle
      if (e.metaKey && e.key === '.') {
        e.preventDefault();
        setFocusMode((f) => !f);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        void stopSession();
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        cycleSuggestion(-1);
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        cycleSuggestion(1);
        return;
      }
      if (e.key === 'Enter') {
        if (activeSuggestion) {
          e.preventDefault();
          markSuggestionUsed(activeSuggestion.id);
        }
        return;
      }
      if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        regenerateActive();
        return;
      }
    }

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [
    activeSuggestion,
    cycleSuggestion,
    markSuggestionUsed,
    regenerateActive,
    stopSession,
  ]);

  // ── Interruption detection ──────────────────────────────────
  // When the operator starts speaking mid-whisper, fade the
  // suggestion to 60% per Blueprint §5.3.8.
  useEffect(() => {
    if (agentState !== 'whispering' || !activeSuggestion) return;

    // The latest segment from "self" appearing while in whispering
    // is our interruption signal.
    const lastSelfSeg = [...segments]
      .reverse()
      .find((s) => s.isSelf);
    if (
      lastSelfSeg &&
      Date.now() - lastSelfSeg.tStart < 600 &&
      !activeSuggestion.interrupted
    ) {
      fadeActiveSuggestion();
      try {
        conversation.setVolume({ volume: 0 });
      } catch {
        // ignore
      }
      setAgentState('listening');
    }
  }, [
    agentState,
    segments,
    activeSuggestion,
    fadeActiveSuggestion,
    conversation,
    setAgentState,
  ]);

  // ── Memoized props ──────────────────────────────────────────
  const personaLabel = useMemo(
    () => prettyPersona(personaParam),
    [personaParam],
  );

  const dealContext: DealContext | null = useMemo(
    () =>
      variant === 'teams'
        ? {
            company: {
              name: 'TripleByte',
              employees: 240,
              stage: 'Series C',
              industry: 'Devtools',
            },
            lastTouch: { kind: 'Email', when: '3 days ago' },
            buyingSignals: [
              { id: 'b1', label: '3 mentions of "logging"', direction: 'up' },
            ],
            sentiment: { direction: 'warming', note: 'tone lifting' },
          }
        : null,
    [variant],
  );

  return (
    <Container as="main" width="app" padX={32} style={{ minHeight: '100vh', paddingBlock: 32 }}>
      <h1 className="sr-only">Live call · {personaLabel}</h1>
      {/* Three-column grid for Teams; single column for Personal.
          The center column maxes at 720px per Blueprint §5.2. */}
      <div
        className={
          variant === 'teams' && !focusMode
            ? 'grid grid-cols-[240px_minmax(0,720px)_240px] gap-12 items-start'
            : 'flex justify-center'
        }
      >
        {/* ── Left rail · Deal Context (Teams) ── */}
        {variant === 'teams' && !focusMode ? (
          <DealContextPanel context={dealContext} collapsed={focusMode} />
        ) : null}

        {/* ── Hero column ── */}
        <section
          aria-label="Live conversation hero"
          className="w-full max-w-[720px] flex flex-col gap-6"
        >
          <header className="flex items-center justify-between gap-4">
            <StatePill
              state={agentState}
              personaLabel={personaLabel}
              pauseReason={pauseReason}
            />
            <SessionClock startMs={sessionStartRef.current} />
          </header>

          {/* Live voice chart — real mic spectrum. */}
          <VoiceWaveform />

          {/* The "they just said" panel. Word stream pulls in only
              when there's actual content. */}
          <WordStreamTranscript text={lastOtherUtterance} />

          {/* The hero — suggestion card. Bloom plays on every
              suggestion (keyed by id inside the card). */}
          <div className="min-h-[200px]" aria-live="polite">
            <AnimatePresence mode="wait">
              {activeSuggestion ? (
                <motion.div
                  key={activeSuggestion.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
                >
                  <SuggestionCard
                    suggestion={activeSuggestion}
                    variant={variant}
                    onAccept={() => markSuggestionUsed(activeSuggestion.id)}
                    onSkip={() => cycleSuggestion(1)}
                    onDifferent={regenerateActive}
                  />

                  {variant === 'teams' &&
                  typeof activeSuggestion.confidence === 'number' ? (
                    <div className="mt-3">
                      <ConfidenceIndicator
                        confidence={activeSuggestion.confidence}
                      />
                    </div>
                  ) : null}
                </motion.div>
              ) : (
                <ListeningPlaceholder enrollmentReady={enrollmentReady} />
              )}
            </AnimatePresence>
          </div>

          {/* Speaker timeline — visible proof diarization works. */}
          <SpeakerTimeline segments={segments} />

          {/* Reply pipeline graph — how the whisper is produced + latency. */}
          <ReplyPipeline />

          {/* End session — secondary CTA. */}
          <button
            type="button"
            onClick={() => void stopSession()}
            className="self-start min-h-[44px] text-text-xs font-medium text-text-secondary-dark hover:text-text-primary-dark transition-colors duration-quick ease-quick"
          >
            End session <span className="font-mono text-text-muted-dark">esc</span>
          </button>

          <DisclosureFooter variant={variant} latencyMs={lastLatencyMs} />
        </section>

        {/* ── Right rail · Source Attribution (Teams) ── */}
        {variant === 'teams' && !focusMode ? (
          <SourceAttributionPanel
            source={activeSuggestion?.source}
            latencyMs={lastLatencyMs}
          />
        ) : null}
      </div>

      {/* Banner — no headphones connected. */}
      {outputDevice === 'speakers' ? (
        <div
          role="alert"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 max-w-md w-[90vw] rounded-md bg-accent-amber text-canvas-dark text-xs font-medium px-4 py-2 shadow-card"
        >
          Connect headphones to hear Vought · audio muted on speakers
        </div>
      ) : null}

      {/* Session id — small monospaced hash in the corner for support. */}
      <div className="fixed top-4 right-4 text-label-xs font-mono text-text-muted-dark">
        {params.sessionId.slice(0, 8)}
      </div>
    </Container>
  );
}

// ──────────────────────────────────────────────────────────────
// Small subviews / utilities
// ──────────────────────────────────────────────────────────────

interface SessionClockProps {
  startMs: number;
}

function SessionClock({ startMs }: SessionClockProps) {
  const [, force] = useState<number>(0);
  useEffect(() => {
    const id = window.setInterval(() => force((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, []);
  const elapsed = startMs > 0 ? Math.max(0, performance.now() - startMs) : 0;
  return (
    <span
      className="font-mono text-label-sm text-text-muted-dark"
      aria-label="session duration"
    >
      {formatClock(elapsed)}
    </span>
  );
}

function formatClock(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60)
    .toString()
    .padStart(2, '0');
  const s = (total % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

interface ListeningPlaceholderProps {
  enrollmentReady: boolean;
}

function ListeningPlaceholder({ enrollmentReady }: ListeningPlaceholderProps) {
  return (
    <motion.div
      key="placeholder"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.24 }}
      aria-live="polite"
      className="rounded-xl border border-hairline-dark bg-white/[0.02] p-6 text-text-secondary-dark"
    >
      <div className="text-label-xs text-text-muted-dark mb-2">
        Vought is {enrollmentReady ? 'listening' : 'calibrating'}
      </div>
      <p className="text-sm leading-relaxed">
        {enrollmentReady
          ? 'When the other person speaks, a suggestion will appear here.'
          : 'Speak normally for a few seconds so Vought can learn your voice.'}
      </p>
    </motion.div>
  );
}

function prettyPersona(id: string): string {
  return id
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Suggestions sometimes arrive with an inline follow-up after a
 * dedicated separator ("…  → then: …"). Pull that out cleanly so the
 * card can render both lines.
 */
function parseSuggestionText(raw: string): {
  primary: string;
  followUp?: string;
} {
  const sepMatch = raw.match(/(.*?)\s*(?:→\s*then:|then:)\s*(.+)$/is);
  if (sepMatch) {
    return { primary: sepMatch[1].trim(), followUp: sepMatch[2].trim() };
  }
  return { primary: raw.trim() };
}

