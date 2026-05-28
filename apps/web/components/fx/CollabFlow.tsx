/**
 * CollabFlow · the Vought × ElevenLabs data-flow diagram on /customers.
 *
 * A static React Flow canvas with five nodes laid out as a radial pipeline
 * around the ElevenLabs Speech Engine. Brand-aligned styling: ElevenLabs in
 * white, Vought components in the amber accent.
 *
 * Interaction is intentionally locked — this is a diagram, not a graph editor.
 */

'use client';

import { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Handle,
  Position,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// ─── Custom node components ─────────────────────────────────────────────

interface PipeNodeData {
  label: string;
  sub?: string;
  kind: 'eleven' | 'vought' | 'io';
  // React Flow's Node<Data> generic requires Data extends Record<string,unknown>.
  // The known keys keep their narrow types; this just lets the object satisfy
  // the structural constraint without forcing us to use generics directly.
  [key: string]: unknown;
}

// React Flow's NodeProps generic shape shifts between minor versions; we
// declare a minimal shape so this component stays portable.
interface PipeNodeProps {
  data: PipeNodeData;
}

function PipeNodeView({ data }: PipeNodeProps) {
  const isEleven = data.kind === 'eleven';
  const isIo = data.kind === 'io';

  const surface = isEleven
    ? 'bg-white text-marketing-ink border-white'
    : isIo
      ? 'bg-elevated-dark text-text-secondary-dark border-hairline-dark'
      : 'bg-elevated-dark text-text-primary-dark border-accent-amber/60';

  const eyebrowColor = isEleven
    ? 'text-marketing-ink/60'
    : isIo
      ? 'text-text-muted-dark'
      : 'text-accent-amber';

  const eyebrow = isEleven ? 'ELEVENLABS' : isIo ? 'I/O' : 'VOUGHT';

  return (
    <div
      className={`rounded-2xl border px-5 py-4 shadow-lg ${surface}`}
      style={{ minWidth: 200 }}
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />

      <div className={`text-[10px] font-bold uppercase tracking-[0.18em] ${eyebrowColor}`}>
        {eyebrow}
      </div>
      <div className="mt-1.5 text-sm font-semibold leading-tight">
        {data.label}
      </div>
      {data.sub ? (
        <div
          className={`mt-1 text-xs leading-snug ${
            isEleven ? 'text-marketing-ink/60' : 'text-text-muted-dark'
          }`}
        >
          {data.sub}
        </div>
      ) : null}
    </div>
  );
}

// ─── Graph definition ───────────────────────────────────────────────────

const NODE_TYPES = { pipe: PipeNodeView } as const;

const NODES: Node[] = [
  {
    id: 'mic',
    type: 'pipe',
    position: { x: 0, y: 60 },
    data: { label: 'Operator mic', sub: 'WebRTC, 16 kHz PCM', kind: 'io' },
  },
  {
    id: 'diart',
    type: 'pipe',
    position: { x: 0, y: 260 },
    data: {
      label: 'Diart sidecar',
      sub: 'self vs. other gate',
      kind: 'vought',
    },
  },
  {
    id: 'engine',
    type: 'pipe',
    position: { x: 320, y: 160 },
    data: {
      label: 'Speech Engine',
      sub: 'STT · TTS · turn detection',
      kind: 'eleven',
    },
  },
  {
    id: 'echo',
    type: 'pipe',
    position: { x: 640, y: 60 },
    data: {
      label: 'Echo Engine',
      sub: 'LLM stream, AbortSignal',
      kind: 'vought',
    },
  },
  {
    id: 'voice',
    type: 'pipe',
    position: { x: 640, y: 260 },
    data: {
      label: 'Cloned voice',
      sub: 'eleven_flash_v2 · 412ms',
      kind: 'eleven',
    },
  },
];

const EDGES: Edge[] = [
  {
    id: 'mic->engine',
    source: 'mic',
    target: 'engine',
    label: 'audio',
    animated: true,
    style: { stroke: '#797979', strokeWidth: 1.4 },
    labelStyle: { fill: '#9b9ba3', fontSize: 10, fontWeight: 600 },
    labelBgStyle: { fill: '#131316' },
  },
  {
    id: 'engine->diart',
    source: 'engine',
    target: 'diart',
    label: 'PCM mirror',
    style: { stroke: '#797979', strokeWidth: 1.4 },
    labelStyle: { fill: '#9b9ba3', fontSize: 10, fontWeight: 600 },
    labelBgStyle: { fill: '#131316' },
  },
  {
    id: 'diart->echo',
    source: 'diart',
    target: 'echo',
    label: 'labels',
    style: { stroke: '#797979', strokeWidth: 1.4 },
    labelStyle: { fill: '#9b9ba3', fontSize: 10, fontWeight: 600 },
    labelBgStyle: { fill: '#131316' },
  },
  {
    id: 'engine->echo',
    source: 'engine',
    target: 'echo',
    label: 'transcript',
    animated: true,
    style: { stroke: '#f5a524', strokeWidth: 1.6 },
    labelStyle: { fill: '#f5a524', fontSize: 10, fontWeight: 700 },
    labelBgStyle: { fill: '#131316' },
  },
  {
    id: 'echo->engine',
    source: 'echo',
    target: 'engine',
    label: 'LLM stream',
    animated: true,
    style: { stroke: '#f5a524', strokeWidth: 1.6 },
    labelStyle: { fill: '#f5a524', fontSize: 10, fontWeight: 700 },
    labelBgStyle: { fill: '#131316' },
  },
  {
    id: 'engine->voice',
    source: 'engine',
    target: 'voice',
    label: 'TTS · your voice',
    animated: true,
    style: { stroke: '#ffffff', strokeWidth: 1.6 },
    labelStyle: { fill: '#f5f5f7', fontSize: 10, fontWeight: 700 },
    labelBgStyle: { fill: '#131316' },
  },
];

// ─── Component ──────────────────────────────────────────────────────────

export function CollabFlow() {
  // Memoize so React Flow doesn't recompute layout on every render.
  const nodes = useMemo(() => NODES, []);
  const edges = useMemo(() => EDGES, []);

  return (
    <div
      className="relative h-[440px] w-full overflow-hidden rounded-2xl border border-hairline-dark/60 bg-surface-dark"
      role="img"
      aria-label="Diagram: operator mic and diart sidecar feed audio and speaker labels into the ElevenLabs Speech Engine, which streams transcripts to the Vought Echo Engine; the Echo Engine streams LLM tokens back through Speech Engine TTS in the operator's cloned voice."
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        panOnScroll={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        minZoom={0.5}
        maxZoom={1.2}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="#25252a"
        />
      </ReactFlow>
    </div>
  );
}
