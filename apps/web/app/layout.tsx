/**
 * Marketing app · root layout
 *
 * Mounts:
 *   - Google Fonts (Inter, JetBrains Mono) via next/font for self-hosted
 *     subsetting and zero FOIT.
 *   - The shared breath timer + reveal observer via <MarketingRoot>.
 *   - Sticky <NavPill> + <Footer> as part of every marketing route.
 *
 * Söhne is not licensed in this repo. Inter is the display fallback —
 * see `vault/80 · Sessions/2026-05-26-wave-1-summary.md` (open question).
 */

import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { NavPill } from '@/components/nav/NavPill';
import { Footer } from '@/components/marketing/Footer';
import { MarketingRoot } from '@/components/ui/MarketingRoot';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://vought.com'),
  title: {
    default: 'Vought · Intelligence for live conversations.',
    template: '%s · Vought',
  },
  description:
    'Vought listens to your live conversations and privately whispers what to say next — in your own cloned voice. Built on ElevenLabs Speech Engine. Sub-second latency.',
  openGraph: {
    type: 'website',
    title: 'Vought · Intelligence for live conversations.',
    description:
      'Real-time voice intelligence for revenue teams and individuals. Whispers in your own cloned voice. Sub-second latency.',
    siteName: 'Vought',
    url: 'https://vought.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vought · Intelligence for live conversations.',
    description:
      'Real-time voice intelligence for revenue teams and individuals. Whispers in your own cloned voice. Sub-second latency.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#0A0A0B',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="grid-texture">
        <MarketingRoot>
          {/* Ambient orbs · Blueprint §6 */}
          <div
            aria-hidden
            className="orb orb-amber"
            style={{ width: 800, height: 800, top: -200, right: -200 }}
          />
          <div
            aria-hidden
            className="orb orb-amber"
            style={{ width: 600, height: 600, top: 600, left: -200, opacity: 0.6 }}
          />

          <NavPill />
          <main>{children}</main>
          <Footer />
        </MarketingRoot>
      </body>
    </html>
  );
}
