/**
 * /platform · Echo Engine + the voice stack. Observe-style direction.
 */

import type { Metadata } from 'next';
import Link from 'next/link';

export function generateMetadata(): Metadata {
  return {
    title: 'Platform · The engine behind every Vought conversation',
    description:
      'The Echo Engine: ElevenLabs Speech Engine for STT + TTS, diart diarization, streaming LLM orchestration, and voice cloning — wired for sub-second whisper latency.',
    alternates: { canonical: 'https://vought.com/platform' },
    openGraph: {
      title: 'Vought Platform · The Echo Engine',
      description:
        'ElevenLabs Speech Engine + diarization + streaming LLM + voice cloning, tuned for sub-second latency.',
      url: 'https://vought.com/platform',
      type: 'website',
      siteName: 'Vought',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Vought Platform · The Echo Engine',
      description: 'ElevenLabs Speech Engine + diarization + streaming LLM + voice cloning, tuned for sub-second latency.',
    },
  };
}

const STAGES = [
  { node: 'Your mic', tag: 'WEBRTC', detail: '16kHz mono PCM streamed to the browser edge.' },
  { node: 'ElevenLabs STT', tag: 'SPEECH ENGINE', detail: 'Streaming transcription with end-of-turn detection.' },
  { node: 'diart sidecar', tag: 'DIARIZATION', detail: 'Separates you from them on a single mic in real time.' },
  { node: 'Echo Engine', tag: 'ORCHESTRATION', detail: 'Persona + playbook RAG + memory assembled into the prompt.' },
  { node: 'Streaming LLM', tag: 'GPT-4o / CLAUDE', detail: 'First token in ~250ms, cancelled on interruption.' },
  { node: 'ElevenLabs TTS', tag: 'CLONED VOICE', detail: 'Your voice, first audio byte in ~200ms, into your earbud.' },
];

const BUDGET = [
  { stage: 'End-of-turn detection', ms: '≤ 350ms' },
  { stage: 'LLM first token', ms: '≤ 250ms' },
  { stage: 'TTS first byte', ms: '≤ 200ms' },
  { stage: 'Network + buffer', ms: '≤ 100ms' },
];

const SNIPPETS: Record<string, string> = {
  TypeScript: `import { Vought } from "@vought/sdk";

const session = await Vought.connect({
  persona: "sales-discovery",
  voiceId: user.clonedVoiceId,
  onWhisper: (line) => earbud.play(line.audio),
});`,
  Python: `from vought import Vought

session = Vought.connect(
    persona="sales-discovery",
    voice_id=user.cloned_voice_id,
)
for whisper in session.stream():
    earbud.play(whisper.audio)`,
  cURL: `curl -N https://api.vought.com/v1/sessions \\
  -H "Authorization: Bearer $VOUGHT_KEY" \\
  -d persona=sales-discovery \\
  -d voice_id=$VOICE_ID`,
};

export default function PlatformPage() {
  return (
    <div className="bg-black text-white">
      {/* Hero */}
      <section className="ob-hero-bg px-6 pb-20 pt-44 text-center">
        <p className="ob-eyebrow mb-6">The Echo Engine</p>
        <h1 className="ob-serif ob-h1 mx-auto max-w-[15ch] text-white">
          The engine behind every <span className="ob-accent italic">conversation</span>
        </h1>
        <p className="mx-auto mt-7 max-w-[58ch] text-lg leading-relaxed text-white/60 md:text-xl">
          Vought is the brain. ElevenLabs is the voice. Between them sits the
          Echo Engine — diarization, orchestration, retrieval, and streaming —
          tuned end-to-end for sub-second whispers.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link href="/contact" className="ob-btn-lime px-8 py-4 text-[15px]">Talk to the platform team</Link>
          <Link href="/copilot" className="ob-btn-ghost px-8 py-4 text-[15px] font-medium">See it in a call</Link>
        </div>
      </section>

      {/* The voice loop */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-[1100px]">
          <h2 className="ob-serif ob-h2 mb-3 text-white">The voice loop</h2>
          <p className="mb-12 max-w-[60ch] text-white/55">
            Every leg is streamed, never batched. The line is moving toward your
            ear before the other person finishes their sentence.
          </p>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {STAGES.map((s, i) => (
              <div key={s.node} className="ob-card ob-card-hover flex flex-col gap-3 p-6">
                <div className="flex items-center justify-between">
                  <span className="font-[var(--font-mono)] text-xs text-white/35">0{i + 1}</span>
                  <span className="rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.12em]" style={{ background: 'var(--ob-card-3)', color: 'var(--ob-lime)' }}>
                    {s.tag}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white">{s.node}</h3>
                <p className="text-sm leading-relaxed text-white/50">{s.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latency budget */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-[1100px] grid gap-4 lg:grid-cols-2">
          <div className="ob-card p-8">
            <p className="ob-eyebrow mb-4">Latency budget</p>
            <h2 className="ob-serif ob-h3 mb-6 text-white">Under one second, every turn</h2>
            <div className="divide-y divide-white/8">
              {BUDGET.map((b) => (
                <div key={b.stage} className="flex items-center justify-between py-4">
                  <span className="text-white/60">{b.stage}</span>
                  <span className="font-[var(--font-mono)] ob-accent">{b.ms}</span>
                </div>
              ))}
              <div className="flex items-center justify-between py-4">
                <span className="font-semibold text-white">Median end-to-end</span>
                <span className="font-[var(--font-mono)] text-lg ob-accent">· 412ms</span>
              </div>
            </div>
          </div>

          <div className="ob-card p-8">
            <p className="ob-eyebrow mb-4">Responsible by default</p>
            <h2 className="ob-serif ob-h3 mb-6 text-white">Built for conversations that can&rsquo;t leak</h2>
            <ul className="space-y-4 text-white/60">
              {[
                'Zero-retention mode on by default — no audio stored unless you turn it on.',
                'Explicit, revocable voice-clone consent. The clone is yours alone.',
                'The AI cancels mid-sentence within 200ms when you start to speak.',
                'Every whisper cites its source — playbook, chunk, and version.',
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

      {/* Developer preview */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-[1100px]">
          <p className="ob-eyebrow mb-4">Build on Vought</p>
          <h2 className="ob-serif ob-h2 mb-10 max-w-[18ch] text-white">
            One session call. Your voice on the line.
          </h2>
          <div className="grid gap-3 lg:grid-cols-3">
            {Object.entries(SNIPPETS).map(([lang, code]) => (
              <div key={lang} className="ob-card overflow-hidden p-0">
                <div className="flex items-center justify-between border-b border-white/8 px-5 py-3">
                  <span className="text-sm font-medium text-white/70">{lang}</span>
                  <span className="ob-eyebrow !tracking-[0.12em]">copy</span>
                </div>
                <pre className="overflow-x-auto p-5 text-[12.5px] leading-relaxed text-white/70" style={{ fontFamily: 'var(--font-mono)' }}>
                  {code}
                </pre>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="ob-hero-bg px-6 py-24 text-center">
        <h2 className="ob-serif ob-h2 mx-auto max-w-[16ch] text-white">
          Build on the <span className="ob-accent italic">voice stack</span>
        </h2>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/docs" className="ob-btn-lime px-8 py-4 text-[15px]">Read the docs</Link>
          <Link href="/contact" className="ob-btn-ghost px-8 py-4 text-[15px] font-medium">Talk to the platform team</Link>
        </div>
      </section>
    </div>
  );
}
