'use client';

/**
 * Lazy wrapper for EngineCore3D.
 * The component imports Three.js — code-splitting keeps it out of the initial bundle.
 */

import dynamic from 'next/dynamic';

const EngineCore3DDynamic = dynamic(
  () =>
    import('@/components/fx/EngineCore3D').then((m) => ({
      default: m.EngineCore3D,
    })),
  {
    ssr: false,
    loading: () => (
      <div
        style={{ height: 400, width: '100%' }}
        aria-hidden
        role="presentation"
      />
    ),
  }
);

export function EngineCore3DLazy() {
  return <EngineCore3DDynamic />;
}
