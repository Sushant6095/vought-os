/**
 * Scene 6 · Architecture
 *
 * Six nodes connected by animated wires; three latency stages below.
 * The wires share a single keyframe (`wire-active`) with staggered
 * `animation-delay`s so the loop reads left-to-right.
 */

import { Container } from '@vought/ui';
import { Mic, Waves, Brain, Doc, Bars } from '@/components/ui/Icon';

interface Node {
  label: string;
  icon: React.ReactNode;
  emphasis: boolean;
}

const NODES: Node[] = [
  { label: 'Mic', icon: <Mic size={20} className="text-white" />, emphasis: false },
  {
    label: 'ElevenLabs STT',
    icon: <Waves size={20} color="#F5A524" />,
    emphasis: true,
  },
  { label: 'Echo Engine', icon: <Brain size={20} color="#FFFFFF" />, emphasis: false },
  { label: 'LLM', icon: <Doc size={20} color="#F5A524" />, emphasis: true },
  { label: 'ElevenLabs TTS', icon: <Bars size={20} color="#F5A524" />, emphasis: true },
];

interface LatencyStage {
  label: string;
  ms: string;
  note: string;
}

const STAGES: LatencyStage[] = [
  {
    label: 'End-of-turn detection',
    ms: '· 312ms',
    note: 'Diart + VAD confirm',
  },
  {
    label: 'LLM time-to-first-token',
    ms: '· 287ms',
    note: 'gpt-4o-mini streaming',
  },
  {
    label: 'TTS first audio byte',
    ms: '· 138ms',
    note: 'Flash v2 · cloned voice',
  },
];

export function ArchitectureDiagram() {
  return (
    <section
      aria-labelledby="architecture-heading"
      className="border-y border-white/5 px-6 py-32"
      style={{ background: '#0C0C0E' }}
    >
      <Container width="marketing" padX={0}>
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <div className="reveal label-small mb-5 text-accent-amber">
            Under the hood
          </div>
          <h2
            id="architecture-heading"
            className="reveal display-xl mb-5 text-white"
            style={{ transitionDelay: '80ms' }}
          >
            Vought is the brain.<br />
            ElevenLabs is the voice.
          </h2>
          <p
            className="reveal text-lg text-white/60"
            style={{ transitionDelay: '240ms' }}
          >
            Six components. One sub-second loop. Built on ElevenLabs Speech
            Engine for real-time audio.
          </p>
        </div>

        <div
          className="reveal relative mb-12 rounded-2xl border border-white/[0.08] bg-surface-dark p-8"
          style={{ transitionDelay: '360ms' }}
        >
          <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-[auto_1fr_auto_1fr_auto_1fr_auto_1fr_auto]">
            {NODES.map((node, i) => (
              <NodeAndWire
                key={node.label}
                node={node}
                isLast={i === NODES.length - 1}
                wireDelayMs={i * 240}
              />
            ))}
          </div>

          {/* Latency stages */}
          <div className="mt-12 grid grid-cols-1 gap-6 border-t border-white/5 pt-8 md:grid-cols-3">
            {STAGES.map((stage) => (
              <div key={stage.label}>
                <div className="label-tiny mb-1 text-white/40">{stage.label}</div>
                <div className="mono text-2xl text-accent-amber">{stage.ms}</div>
                <div className="mt-1 text-xs text-white/50">{stage.note}</div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

function NodeAndWire({
  node,
  isLast,
  wireDelayMs,
}: {
  node: Node;
  isLast: boolean;
  wireDelayMs: number;
}) {
  return (
    <>
      <div className="flex flex-col items-center">
        <div
          className={[
            'mb-2 flex h-14 w-14 items-center justify-center rounded-xl border',
            node.emphasis
              ? 'border-accent-amber/30 bg-accent-amber/[0.15]'
              : 'border-white/10 bg-white/5',
          ].join(' ')}
        >
          {node.icon}
        </div>
        <div className="text-center text-[10px] font-medium text-white/60">
          {node.label}
        </div>
      </div>
      {!isLast && (
        <svg
          className="hidden md:block"
          height={2}
          viewBox="0 0 60 2"
          aria-hidden
        >
          <line
            x1="0"
            y1="1"
            x2="60"
            y2="1"
            stroke="#F5A524"
            strokeWidth={1.5}
            className="wire-active"
            style={{ animationDelay: `${wireDelayMs}ms` }}
          />
        </svg>
      )}
    </>
  );
}
