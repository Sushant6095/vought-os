'use client';

/**
 * VoiceWaveform · a live, mirrored frequency chart of the operator's mic.
 *
 * Taps the microphone via a Web Audio AnalyserNode and renders a symmetric
 * bar spectrum that reacts to real speech. Colour tracks the agent state
 * (emerald while listening, amber while thinking/whispering). DPR-aware,
 * cleans up its stream + context on unmount, flat line under reduced motion
 * or when the mic is unavailable.
 */

import { useEffect, useRef } from 'react';
import { useRealtimeSession, type AgentState } from '../_hooks/useRealtimeSession';

const COLOR: Record<AgentState, string> = {
  idle: 'rgba(255,255,255,0.3)',
  connecting: 'rgba(255,255,255,0.3)',
  listening: '#10B981',
  thinking: '#F5A524',
  whispering: '#F5A524',
  paused: 'rgba(255,255,255,0.22)',
};

const BARS = 56;

export function VoiceWaveform() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const agentState = useRealtimeSession((s) => s.agentState);
  const stateRef = useRef<AgentState>(agentState);
  stateRef.current = agentState;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, raf = 0, running = true;
    let stream: MediaStream | null = null;
    let audioCtx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let data: Uint8Array | null = null;

    const resize = () => {
      const p = canvas.parentElement;
      if (!p) return;
      w = p.clientWidth; h = p.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const drawBars = (amp: (i: number) => number) => {
      ctx.clearRect(0, 0, w, h);
      const mid = h / 2;
      const color = COLOR[stateRef.current] ?? COLOR.idle;
      const gap = 2;
      const bw = Math.max(1.5, w / 2 / BARS - gap);
      for (let i = 0; i < BARS; i++) {
        const v = amp(i);
        const bh = Math.max(2, v * mid * 1.7);
        ctx.globalAlpha = 0.2 + v * 0.8;
        ctx.fillStyle = color;
        const xR = w / 2 + i * (bw + gap);
        const xL = w / 2 - (i + 1) * (bw + gap);
        ctx.fillRect(xR, mid - bh / 2, bw, bh);
        ctx.fillRect(xL, mid - bh / 2, bw, bh);
      }
      ctx.globalAlpha = 1;
    };

    const loop = () => {
      if (analyser && data) {
        analyser.getByteFrequencyData(data);
        drawBars((i) => {
          const idx = Math.floor((i / BARS) * (data!.length * 0.7));
          return (data![idx] / 255) ** 1.4;
        });
      }
      if (running && !reduce) raf = requestAnimationFrame(loop);
    };

    const idleFrame = () => drawBars((i) => 0.04 + 0.02 * Math.sin(i * 0.6));

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioCtx = new AudioContext();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.82;
        audioCtx.createMediaStreamSource(stream).connect(analyser);
        data = new Uint8Array(analyser.frequencyBinCount);
        if (reduce) loop();
        else raf = requestAnimationFrame(loop);
      } catch {
        idleFrame();
      }
    };
    void start();

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      stream?.getTracks().forEach((t) => t.stop());
      void audioCtx?.close();
    };
  }, []);

  const label =
    agentState === 'whispering' ? 'Whispering'
      : agentState === 'thinking' ? 'Thinking'
        : agentState === 'paused' ? 'Paused'
          : 'Live input';

  return (
    <div className="rounded-2xl border border-hairline-dark bg-surface-dark/60 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-muted-dark">Voice</span>
        <span className="font-mono text-[10px] text-text-secondary-dark">{label}</span>
      </div>
      <div className="relative h-16 w-full">
        <canvas ref={canvasRef} aria-hidden className="h-full w-full" />
      </div>
    </div>
  );
}
