'use client';

import { useEffect } from 'react';

interface DemoRedirectProps {
  target: string;
}

/**
 * Client-side hop to the product app. The marketing site and the app are
 * separate origins, so this is a window.location replace rather than a
 * Next router push. Runs once on mount; the server-rendered fallback link
 * covers no-JS and app-unreachable cases.
 */
export function DemoRedirect({ target }: DemoRedirectProps) {
  useEffect(() => {
    window.location.replace(target);
  }, [target]);

  return null;
}
