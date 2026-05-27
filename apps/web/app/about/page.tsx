/**
 * apps/web · /about — the Vought × ElevenLabs "engine room".
 *
 * A mission-control lab page showcasing how the ElevenLabs Speech Engine
 * powers the realtime whisper loop: a 3D engine core, the architecture
 * pipeline (React Flow), latency telemetry, the live engine config, and the
 * advanced use cases it unlocks. Folds in a short company note + CTA.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
// Both are Three.js heavy and well below the fold — lazy-load to keep initial bundle tight.
import { EngineCore3DLazy as EngineCore3D } from '@/components/fx/EngineCore3DLazy';
import { SpeechEnginePipelineLazy as SpeechEnginePipeline } from '@/components/fx/SpeechEnginePipelineLazy';

export function generateMetadata(): Metadata {
  return {
    title: 'The engine room · Vought × ElevenLabs Speech Engine',
    description:
      'How Vought builds sub-second voice intelligence on the ElevenLabs Speech Engine — streaming STT with end-of-turn detection, Flash v2 TTS in a cloned voice, and a 412ms median whisper loop.',
    alternates: { canonical: 'https://vought.com/about' },
    openGraph: {
      title: 'Vought × ElevenLabs · The engine room',
      description: 'Sub-second realtime voice intelligence on the ElevenLabs Speech Engine.',
      url: 'https://vought.com/about',
      type: 'website',
      siteName: 'Vought',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Vought × ElevenLabs · The engine room',
      description: 'Sub-second realtime voice intelligence on the ElevenLabs Speech Engine.',
    },
  };
}

const GRID: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
  backgroundSize: '48px 48px',
};

const TELEMETRY = [
  { k: 'STT END-OF-TURN', v: '≤350ms' },
  { k: 'LLM FIRST TOKEN', v: '≤250ms' },
  { k: 'TTS FIRST BYTE', v: '≤200ms' },
  { k: 'LOOP MEDIAN', v: '412ms' },
  { k: 'INTERRUPT CANCEL', v: '<200ms' },
  { k: 'AUDIO RETENTION', v: '0 bytes' },
];

const CONFIG: [string, string][] = [
  ['model_id', '"eleven_flash_v2"'],
  ['turn_timeout', '2'],
  ['optimize_streaming_latency', '3'],
  ['privacy.zero_retention_mode', 'true'],
  ['overrides.first_message', 'false'],
  ['voice_id', '<operator clone>'],
];

const USE_CASES = [
  { t: 'Live whisper coaching', d: 'The next line streamed into the rep’s ear mid-call — rendered in their own cloned voice, before the moment passes.' },
  { t: 'Sub-200ms interruption', d: 'When the operator starts speaking, the LLM stream and TTS cancel within 200ms via AbortSignal. Never talks over a human.' },
  { t: 'Single-mic diarization', d: 'A diart sidecar separates speakers on one microphone and gates the engine so it only ever whispers about the other party.' },
  { t: '30-second voice clone', d: 'A private ElevenLabs voice model from 30s of audio, hot-swapped into the TTS resource per session. Raw audio discarded after.' },
  { t: 'Autonomous reception', d: 'The same engine answers inbound calls end-to-end — greet, qualify, book — on Flash v2 latency.' },
  { t: 'Zero-retention by default', d: 'Ephemeral processing. No audio stored unless explicitly enabled. SOC 2 / HIPAA / GDPR posture.' },
];

export default function AboutPage() {
  return (
    <div className="text-white">
      {/* Mission header */}
      <section className="relative overflow-hidden px-6 pt-44 pb-10" style={GRID}>
        <div className="mx-auto max-w-[1100px] text-center">
          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full" style={{ background: '#22c55e', opacity: 0.6 }} />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: '#22c55e' }} />
            </span>
            <span className="ob-eyebrow !tracking-[0.18em] text-white/70">Research · Speech Engine · System nominal</span>
          </div>
          <h1 className="ob-serif ob-h1 mx-auto max-w-[15ch] text-white">
            The <span className="ob-accent italic">engine room</span>
          </h1>
          <p className="mx-auto mt-7 max-w-[62ch] text-lg leading-relaxed text-white/60 md:text-xl">
            Vought turns a live conversation into a whisper in under a second. The
            instrument that makes it possible is the{' '}
            <span className="text-white">ElevenLabs Speech Engine</span> — streaming
            speech-to-text with end-of-turn detection on the way in, Flash v2
            text-to-speech in the operator’s own cloned voice on the way out.
          </p>
        </div>
      </section>

      {/* 3D engine core chamber */}
      <section className="px-6 pb-8">
        <div className="relative mx-auto max-w-[1100px]">
          <div className="relative h-[480px] overflow-hidden rounded-[28px] border border-white/10" style={{ background: 'radial-gradient(circle at 50% 45%, rgba(51,88,255,0.07), transparent 70%)' }}>
            <EngineCore3D />
            {/* corner ticks */}
            {[
              'left-4 top-4 border-l border-t',
              'right-4 top-4 border-r border-t',
              'left-4 bottom-4 border-l border-b',
              'right-4 bottom-4 border-r border-b',
            ].map((c) => (
              <span key={c} className={`absolute h-6 w-6 border-white/25 ${c}`} />
            ))}
            <div className="absolute left-6 top-6 font-[var(--font-mono)] text-[11px] text-white/40">VOUGHT · ECHO ENGINE</div>
            <div className="absolute right-6 top-6 font-[var(--font-mono)] text-[11px]" style={{ color: 'var(--ob-blue-soft)' }}>CORE · ONLINE</div>
            <div className="absolute bottom-6 left-6 font-[var(--font-mono)] text-[11px] text-white/40">REALTIME · 60FPS</div>
            <div className="absolute bottom-6 right-6 font-[var(--font-mono)] text-[11px] text-white/40">· 412ms LOOP</div>
          </div>
        </div>
      </section>

      {/* Telemetry strip */}
      <section className="px-6 pb-16">
        <div className="mx-auto grid max-w-[1100px] grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 md:grid-cols-6" style={{ background: 'var(--ob-line)' }}>
          {TELEMETRY.map((m) => (
            <div key={m.k} className="bg-[#0c0e14] p-4 text-center">
              <div className="font-[var(--font-mono)] text-[9px] tracking-[0.12em] text-white/35">{m.k}</div>
              <div className="mt-1 font-[var(--font-mono)] text-lg" style={{ color: 'var(--ob-blue-soft)' }}>{m.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture pipeline */}
      <section className="px-6 py-12" style={GRID}>
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-8 text-center">
            <p className="ob-eyebrow mb-4">Signal path</p>
            <h2 className="ob-serif ob-h2 mx-auto max-w-[20ch] text-white">
              Seven stages. <span className="ob-accent italic">One second.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-[58ch] text-white/55">
              Every leg streams — nothing is batched. The ElevenLabs Speech Engine
              bookends the loop; the Echo Engine orchestrates the middle.
            </p>
          </div>
          <SpeechEnginePipeline />
        </div>
      </section>

      {/* Engine config control panel */}
      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-[1100px] gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="ob-card p-8">
            <p className="ob-eyebrow mb-4">Engine config · live</p>
            <h3 className="ob-serif ob-h3 mb-6 text-white">Tuned for latency, not defaults</h3>
            <div className="rounded-2xl border border-white/8 p-5" style={{ background: '#0a0c12' }}>
              <pre className="overflow-x-auto font-[var(--font-mono)] text-[12.5px] leading-relaxed">
{CONFIG.map(([k, v]) => `${k.padEnd(28)} ${v}`).join('\n')}
              </pre>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/50">
              <span className="text-white">turn_timeout: 2</span> cuts end-of-turn
              waiting from the default 7s; <span className="text-white">optimize_streaming_latency: 3</span> and
              Flash v2 push first audio byte under 200ms; zero-retention keeps the
              call ephemeral.
            </p>
          </div>

          <div className="ob-card p-8">
            <p className="ob-eyebrow mb-4">Why it matters</p>
            <h3 className="ob-serif ob-h3 mb-6 text-white">The whisper has to beat the pause</h3>
            <ul className="space-y-4 text-white/60">
              {[
                'Humans notice a reply gap past ~1s. The entire loop holds a 412ms median — the operator hears the line before the silence gets awkward.',
                'STT end-of-turn detection fires the engine the instant the other party stops — no fixed timer waiting.',
                'TTS streams the cloned voice byte-by-byte, so playback starts before the sentence finishes generating.',
                'Interruptions cancel the whole chain in <200ms, so Vought never overlaps a real voice.',
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <span className="ob-accent">—</span>
                  <span className="leading-relaxed">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-10 text-center">
            <p className="ob-eyebrow mb-4">What the engine unlocks</p>
            <h2 className="ob-serif ob-h2 mx-auto max-w-[20ch] text-white">
              Advanced use cases, <span className="ob-accent italic">live</span>
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {USE_CASES.map((u) => (
              <div key={u.t} className="ob-card ob-card-hover p-7">
                <h3 className="ob-serif text-[24px] leading-tight text-white">{u.t}</h3>
                <p className="mt-3 leading-relaxed text-white/55">{u.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company note + CTA */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-[820px] text-center">
          <p className="ob-eyebrow mb-4">The team</p>
          <p className="text-xl leading-relaxed text-white/70">
            Vought is a small team building the calm, precise voice layer for
            high-stakes conversations — from San Francisco and Bangalore. We chose
            ElevenLabs because the voice has to be indistinguishable from the
            operator’s own, and fast enough to land inside a live call.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href="/contact" className="ob-btn-lime px-8 py-4 text-[15px]">Get a demo</Link>
            <Link href="/platform" className="ob-btn-ghost px-8 py-4 text-[15px] font-medium">Read the platform</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
