'use client';

/**
 * Lazy wrapper for SpeechEnginePipeline.
 * The component imports Three.js — code-splitting keeps it out of the initial bundle.
 */

import dynamic from 'next/dynamic';

const SpeechEnginePipelineDynamic = dynamic(
  () =>
    import('@/components/fx/SpeechEnginePipeline').then((m) => ({
      default: m.SpeechEnginePipeline,
    })),
  {
    ssr: false,
    loading: () => (
      <div
        style={{ height: 320, width: '100%' }}
        aria-hidden
        role="presentation"
      />
    ),
  }
);

export function SpeechEnginePipelineLazy() {
  return <SpeechEnginePipelineDynamic />;
}
