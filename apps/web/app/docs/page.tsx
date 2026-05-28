/**
 * /docs · Vought API reference — ElevenLabs/Mintlify-style three-pane layout
 * (method-badge sidebar · endpoint spec · code + response), built on the
 * realtime voice loop powered by the ElevenLabs Speech Engine.
 */

import type { Metadata } from 'next';
// ApiReference carries react-syntax-highlighter — lazy-load for faster initial paint.
import { ApiReference } from '@/components/docs/ApiReferenceLazy';

export function generateMetadata(): Metadata {
  return {
    title: 'API reference · Vought voice API on ElevenLabs Speech Engine',
    description:
      'Sessions, streaming events, voice cloning, and speaker diarization — the Vought API for sub-second whisper experiences on the ElevenLabs Speech Engine.',
    alternates: { canonical: 'https://vought.com/docs' },
    openGraph: {
      title: 'Vought API reference',
      description: 'Sessions, events, voice cloning, diarization. Sub-second latency on the ElevenLabs Speech Engine.',
      url: 'https://vought.com/docs',
      type: 'website',
      siteName: 'Vought',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Vought API reference',
      description: 'Sessions, events, voice cloning, diarization. Sub-second latency on the ElevenLabs Speech Engine.',
    },
  };
}

export default function DocsPage() {
  return (
    <div className="bg-black text-white">
      <div className="mx-auto max-w-[1320px] px-6 pb-28 pt-36">
        <header className="mb-12 border-b border-white/8 pb-8">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-md px-2 py-1 text-[10px] font-bold tracking-[0.12em] text-white" style={{ background: 'var(--ob-blue)' }}>Reference</span>
            <span className="text-xs text-white/40">3 surfaces · Vought app · ElevenLabs SDK · diart sidecar</span>
          </div>
          <h1 className="ob-serif mb-4 text-[clamp(40px,5vw,68px)] leading-[1.02] text-white">
            The Vought <span className="ob-accent italic">voice API</span>
          </h1>
          <p className="max-w-[64ch] text-lg leading-relaxed text-white/60">
            One connection gives you a live, diarized, sub-second whisper loop in a
            cloned voice — built directly on the{' '}
            <span className="text-white">ElevenLabs Speech Engine</span> for streaming
            STT and TTS, with diarization and streaming LLM orchestration in between.
          </p>
        </header>

        <ApiReference />
      </div>
    </div>
  );
}
