/**
 * apps/web · landing page (vought.com)
 *
 * Cinematic 12-scene storyboard per `VOUGHT-DESIGN-BLUEPRINT.md` §6.
 * Each scene is a self-contained component in `components/marketing/`.
 *
 * The page itself stays declarative — order matters but no orchestration
 * logic lives here. Section components own their own state.
 */

import type { Metadata } from 'next';
import { Hero } from '@/components/marketing/Hero';
import { CustomerLogos } from '@/components/marketing/CustomerLogos';
import { PromiseSection } from '@/components/marketing/PromiseSection';
import { PillarCards } from '@/components/marketing/PillarCards';
import { LiveDemoBlock } from '@/components/marketing/LiveDemoBlock';
import { ArchitectureDiagram } from '@/components/marketing/ArchitectureDiagram';
import { CustomerStory } from '@/components/marketing/CustomerStory';
import { TrustGrid } from '@/components/marketing/TrustGrid';
import { PricingTease } from '@/components/marketing/PricingTease';
import { CTAStrip } from '@/components/marketing/CTAStrip';

export function generateMetadata(): Metadata {
  return {
    title: 'Vought · Intelligence for live conversations.',
    description:
      'Vought listens to your live conversations and privately whispers what to say next — in your own cloned voice. Built on ElevenLabs Speech Engine. Sub-second latency.',
    alternates: { canonical: 'https://vought.com/' },
    openGraph: {
      title: 'Vought · Intelligence for live conversations.',
      description:
        'Real-time voice intelligence for revenue teams and individuals. Whispers in your own cloned voice. Sub-second latency.',
      url: 'https://vought.com/',
      type: 'website',
    },
  };
}

export default function LandingPage() {
  return (
    <>
      <Hero />
      <CustomerLogos />
      <PromiseSection />
      <PillarCards />
      <LiveDemoBlock />
      <ArchitectureDiagram />
      <CustomerStory />
      <TrustGrid />
      <PricingTease />
      <CTAStrip />
    </>
  );
}
