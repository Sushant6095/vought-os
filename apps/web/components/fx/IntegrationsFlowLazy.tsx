'use client';

/**
 * Lazy wrapper for IntegrationsFlow.
 *
 * IntegrationsFlow loads Three.js + simple-icons and is rendered well below
 * the fold on the landing page. Splitting it into a client component that is
 * dynamically imported keeps it out of the initial JS bundle.
 */

import dynamic from 'next/dynamic';

const IntegrationsFlowDynamic = dynamic(
  () =>
    import('@/components/fx/IntegrationsFlow').then((m) => ({
      default: m.IntegrationsFlow,
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

export function IntegrationsFlowLazy() {
  return <IntegrationsFlowDynamic />;
}
