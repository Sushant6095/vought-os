'use client';

/**
 * ReplyPipeline · live graph of how the whisper is produced.
 *
 * A four-stage tracker — Hear (STT) → Separate (diarization) → Think (LLM) →
 * Speak (TTS) — that lights and advances a beam with the live agent state,
 * plus per-stage latency budgets and a rolling latency history chart fed by
 * `lastLatencyMs`. Reads the realtime store directly. Amber app theme.
 */

import { useEffect, useRef, useState } from 'react';
import { useRealtimeSession, type AgentState } from '../_hooks/useRealtimeSession';

const STAGES = [
  { label: 'Hear', sub: 'STT', budget: '≤350ms' },
  { label: 'Separate', sub: 'diarize', budget: 'gate' },
  { label: 'Think', sub: 'LLM', budget: '≤250ms' },
  { label: 'Speak', sub: 'TTS', budget: '≤200ms' },
];

function activeIndex(s: AgentState): number {
  return s === 'listening' ? 0 : s === 'thinking' ? 2 : s === 'whispering' ? 3 : -1;
}

const MAX_MS = 1200;

export function ReplyPipeline() {
  const agentState = useRealtimeSession((s) => s.agentState);
  const lastLatencyMs = useRealtimeSession((s) => s.lastLatencyMs);
  const [history, setHistory] = useState<number[]>([]);
  const lastSeen = useRef<number | null>(null);

  useEffect(() => {
    if (typeof lastLatencyMs === 'number' && lastLatencyMs !== lastSeen.current) {
      lastSeen.current = lastLatencyMs;
      setHistory((h) => [...h.slice(-13), lastLatencyMs]);
    }
  }, [lastLatencyMs]);

  const idx = activeIndex(agentState);
  const fillPct = idx < 0 ? 0 : (idx / (STAGES.length - 1)) * 100;

  return (
    <div className="rounded-2xl border border-hairline-dark bg-surface-dark/60 p-4">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-muted-dark">Reply pipeline</span>
        <span className="font-mono text-[11px] text-accent-amber">
          {typeof lastLatencyMs === 'number' ? `· ${lastLatencyMs}ms` : '· —'}
        </span>
      </div>

      {/* Stage tracker + beam */}
      <div className="relative mb-5">
        <div className="absolute left-0 right-0 top-[11px] h-px bg-white/10" />
        <div
          className="absolute left-0 top-[11px] h-px bg-accent-amber transition-[width] duration-[360ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ width: `${fillPct}%`, boxShadow: '0 0 8px rgba(245,165,36,0.7)' }}
        />
        <div className="relative flex justify-between">
          {STAGES.map((s, i) => {
            const state = i === idx ? 'active' : idx > i && idx >= 0 ? 'done' : 'idle';
            return (
              <div key={s.label} className="flex flex-col items-center gap-2" style={{ width: 64 }}>
                <span
                  className="h-[22px] w-[22px] rounded-full border transition-all duration-quick"
                  style={{
                    background: state === 'idle' ? 'transparent' : 'var(--color-accent-amber, #F5A524)',
                    borderColor: state === 'idle' ? 'rgba(255,255,255,0.2)' : 'transparent',
                    boxShadow: state === 'active' ? '0 0 14px rgba(245,165,36,0.9)' : 'none',
                    opacity: state === 'done' ? 0.5 : 1,
                    transform: state === 'active' ? 'scale(1.15)' : 'scale(1)',
                  }}
                />
                <div className="text-center">
                  <div className={`text-[11px] font-semibold ${state === 'idle' ? 'text-text-muted-dark' : 'text-text-primary-dark'}`}>{s.label}</div>
                  <div className="font-mono text-[9px] text-text-muted-dark">{s.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Latency budgets */}
      <div className="mb-4 grid grid-cols-4 gap-2">
        {STAGES.map((s) => (
          <div key={s.label} className="rounded-lg bg-elevated-dark/60 px-2 py-1.5 text-center">
            <div className="font-mono text-[8px] uppercase tracking-wide text-text-muted-dark">{s.label}</div>
            <div className="font-mono text-[11px] text-text-secondary-dark">{s.budget}</div>
          </div>
        ))}
      </div>

      {/* Latency history chart */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-text-muted-dark">Latency · last {Math.max(history.length, 0)} turns</span>
          <span className="font-mono text-[9px] text-text-muted-dark">target &lt; 900ms</span>
        </div>
        <svg viewBox="0 0 280 48" preserveAspectRatio="none" className="h-12 w-full" aria-hidden>
          {/* target line at 900ms */}
          <line x1="0" y1={48 - (900 / MAX_MS) * 48} x2="280" y2={48 - (900 / MAX_MS) * 48} stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="3 3" />
          {history.length === 0 ? (
            <text x="140" y="28" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="9" fontFamily="monospace">awaiting first turn</text>
          ) : (
            history.map((ms, i) => {
              const bw = 280 / 14 - 4;
              const x = i * (280 / 14) + 2;
              const bh = Math.min(48, (ms / MAX_MS) * 48);
              const last = i === history.length - 1;
              const over = ms > 900;
              return (
                <rect
                  key={i}
                  x={x}
                  y={48 - bh}
                  width={bw}
                  height={bh}
                  rx={1.5}
                  fill={over ? '#F26D5B' : '#F5A524'}
                  opacity={last ? 1 : 0.45}
                />
              );
            })
          )}
        </svg>
      </div>
    </div>
  );
}
