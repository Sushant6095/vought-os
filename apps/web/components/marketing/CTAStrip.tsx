/**
 * Scene 11 · CTA strip
 *
 * The canvas-shift moment. As the strip enters the viewport the body
 * background shifts from the cream/dark canvas down to a near-black
 * over 480ms, focusing the eye on a single declarative ask: book a
 * demo. The strip itself is overlaid with an amber orb to land the
 * brand color one last time before the footer.
 *
 * Implementation: an IntersectionObserver toggles a data attribute on
 * <body>; CSS handles the transition. We use a 480ms duration which
 * matches Blueprint §6 (between deliberate-360 and cinematic-640 it
 * is intentionally calibrated as a single declarative move).
 *
 * Note: 480ms is the brand "canvas-shift" duration. It is not in the
 * seven canonical motion tokens — it is the exception explicitly
 * called out for this moment in the blueprint (§6 Scene 11). The QA
 * audit allowlist covers this one occurrence.
 */

'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { Container, Grid, GridItem } from '@vought/ui';
import { ArrowRight } from '@/components/ui/Icon';

export function CTAStrip() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof window === 'undefined') return;

    // Inject the canvas-shift transition once on the body.
    document.body.style.transition = 'background-color 480ms cubic-bezier(0.16, 1, 0.3, 1)';

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            document.body.dataset.canvasShift = 'dark';
          } else {
            delete document.body.dataset.canvasShift;
          }
        });
      },
      { threshold: 0.4 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      delete document.body.dataset.canvasShift;
      document.body.style.transition = '';
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="cta-heading"
      className="relative overflow-hidden px-6 py-32"
    >
      {/* Canvas-shift target style — applies when the body has data-canvas-shift="dark" */}
      <style>{`
        body[data-canvas-shift='dark'] {
          background-color: #050507 !important;
        }
      `}</style>

      <div
        aria-hidden
        className="orb orb-amber"
        style={{
          width: 700,
          height: 700,
          bottom: -300,
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: 0.3,
        }}
      />

      <Container width="marketing" padX={0} className="relative">
        <Grid columns={12} gutter={32} className="items-center">
          <GridItem span={12} className="reveal lg:!col-span-7">
            <h2
              id="cta-heading"
              className="display-2xl mb-4 leading-tight text-white"
            >
              See Vought<br />in your own voice.
            </h2>
            <p className="max-w-lg text-lg text-white/60">
              20-minute demo. We’ll clone your voice on the call and coach you
              live.
            </p>
          </GridItem>
          <GridItem
            span={12}
            className="reveal flex flex-wrap justify-start gap-3 lg:!col-span-5 lg:justify-end"
            style={{ transitionDelay: '80ms' }}
          >
            <Link
              href="/demo"
              className="pill-cta inline-flex items-center gap-2 rounded-full bg-accent-amber px-7 py-4 text-sm font-bold text-marketing-ink hover:opacity-90"
            >
              Book your demo
              <ArrowRight size={14} className="text-marketing-ink" />
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-white/15 px-7 py-4 text-sm font-semibold text-white transition-colors duration-quick ease-quick hover:border-white/30"
            >
              Talk to sales
            </Link>
          </GridItem>
        </Grid>
      </Container>
    </section>
  );
}
