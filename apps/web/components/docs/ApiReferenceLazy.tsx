'use client';

/**
 * Lazy wrapper for ApiReference.
 * Carries react-syntax-highlighter — lazy-load to keep docs page initial paint fast.
 */

import dynamic from 'next/dynamic';

export const ApiReference = dynamic(
  () => import('@/components/docs/ApiReference').then((m) => ({ default: m.ApiReference })),
  {
    ssr: false,
    loading: () => (
      <div
        style={{ minHeight: 600, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', fontSize: 14 }}
        role="status"
        aria-label="Loading API reference..."
      >
        Loading...
      </div>
    ),
  }
);
