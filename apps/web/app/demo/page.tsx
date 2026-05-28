/**
 * /demo · launches the live product. The marketing site (vought.com) and the
 * product app (app.vought.com / localhost:3002) are separate Next apps, so
 * the demo CTA hands off into the product's voice-clone → live-call flow.
 *
 * Rather than a bare server redirect (empty body, no fallback if the app is
 * unreachable), this renders a branded interstitial that auto-redirects on the
 * client and always exposes a manual link. Override the target with
 * NEXT_PUBLIC_APP_URL in production.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { DemoRedirect } from './DemoRedirect';

export const metadata: Metadata = {
  title: 'Launching Vought',
  robots: { index: false, follow: false },
};

// Prefer the configured app origin. If it's unset we must NOT fall back to
// localhost in production (that strands real visitors), so production defaults
// to the known app deployment; only local dev points at localhost.
//
// vought-os-app2 is the working app project — it has ELEVENLABS_API_KEY and
// SPEECH_ENGINE_ID set, so the live call actually authenticates. vought-os-app
// (the prettier name) has no env vars and is effectively a UI shell, so do not
// fall back to it.
const PROD_APP_URL = 'https://vought-os-app2.vercel.app';
const DEV_APP_URL = 'http://localhost:3002';

export default function DemoPage() {
  const app =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.NODE_ENV === 'production' ? PROD_APP_URL : DEV_APP_URL);
  const target = `${app}/onboarding/voice`;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <DemoRedirect target={target} />

      <div className="flex items-center gap-2 text-accent-amber">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-amber" />
        <span className="label-small">Launching the live demo</span>
      </div>

      <p className="max-w-md text-text-secondary-dark">
        Taking you to Vought. You&rsquo;ll set up your voice, then drop into a
        live call with the AI whispering in your ear.
      </p>

      <a
        href={target}
        className="pill-cta inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-marketing-ink"
      >
        Continue to Vought
      </a>

      <Link
        href="/"
        className="text-sm text-text-muted-dark transition-colors duration-quick ease-quick hover:text-text-secondary-dark"
      >
        Back to vought.com
      </Link>
    </main>
  );
}
