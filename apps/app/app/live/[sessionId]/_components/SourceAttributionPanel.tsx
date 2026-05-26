/**
 * SourceAttributionPanel · Blueprint §5.5
 *
 * Right rail. Above the (future) coaching cards. The source of the
 * current suggestion + the latency callsign. Teams only.
 *
 * Latency callsign (Blueprint §5.3.9):
 *   small amber-dot prefix + mono digits + ms suffix
 *   examples: · 412ms, · 287ms
 */

'use client';

import type { ReactNode } from 'react';

interface SourceAttributionPanelProps {
  source?: {
    label: string;
    metric?: string;
    author?: string;
  };
  latencyMs?: number | null;
  collapsed?: boolean;
}

export function SourceAttributionPanel({
  source,
  latencyMs,
  collapsed,
}: SourceAttributionPanelProps) {
  if (collapsed) return null;

  return (
    <aside className="w-full space-y-3" aria-label="Source attribution">
      <SectionHeader>Source</SectionHeader>

      <Tile>
        {source ? (
          <>
            <div className="text-xs font-medium text-text-primary-dark">
              {source.label}
            </div>
            {source.metric ? (
              <div className="mt-1.5 text-label-sm text-live-emerald">
                {source.metric}
              </div>
            ) : null}
            {source.author ? (
              <div className="mt-1 text-label-sm text-text-muted-dark">
                by {source.author}
              </div>
            ) : null}
          </>
        ) : (
          <div className="text-label-sm text-text-muted-dark italic">
            No playbook linked.
          </div>
        )}
      </Tile>

      <Tile>
        <Eyebrow>Latency</Eyebrow>
        <LatencyCallsign latencyMs={latencyMs} />
      </Tile>
    </aside>
  );
}

interface LatencyCallsignProps {
  latencyMs: number | null | undefined;
}

/**
 * The brand callsign — small amber dot + mono digits + ms suffix.
 * Used here in the right rail and again in the disclosure footer for
 * Personal users. This is intentionally one component so the visual
 * pattern is identical across surfaces.
 */
export function LatencyCallsign({ latencyMs }: LatencyCallsignProps) {
  const value = typeof latencyMs === 'number' ? Math.round(latencyMs) : null;

  return (
    <div className="inline-flex items-center gap-1.5">
      <span
        aria-hidden
        className="w-1.5 h-1.5 rounded-full bg-accent-amber"
      />
      <span className="font-mono text-text-xs text-text-primary-dark">
        {value !== null ? `${value}ms` : '—'}
      </span>
    </div>
  );
}

function SectionHeader({ children }: { children: ReactNode }) {
  return (
    <div className="text-label-xs text-text-muted-dark mb-2">
      {children}
    </div>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="text-label-xs text-text-muted-dark mb-1">
      {children}
    </div>
  );
}

function Tile({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-hairline-dark bg-white/[0.02] p-3">
      {children}
    </div>
  );
}
