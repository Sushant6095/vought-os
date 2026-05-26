/**
 * Scene 7 · Customer story
 *
 * One named customer (TripleByte) beats ten anonymous logos.
 * Quote card on the left, three metric tiles on the right.
 * Metric numerals are mono and animate up on intersection.
 */

import Link from 'next/link';
import { Container, Grid, GridItem } from '@vought/ui';
import { ArrowRight } from '@/components/ui/Icon';
import { CountUp } from '@/components/ui/CountUp';

export function CustomerStory() {
  return (
    <section
      aria-labelledby="customer-story-heading"
      className="px-6 py-32"
    >
      <Container width="marketing" padX={0}>
        <div className="reveal label-small mb-5 text-center text-accent-amber">
          Customer story
        </div>
        <h2
          id="customer-story-heading"
          className="reveal display-xl mb-20 text-center text-white"
          style={{ transitionDelay: '80ms' }}
        >
          How TripleByte closed $1.4M more last quarter.
        </h2>

        <Grid columns={12} gutter={32}>
          {/* Quote */}
          <GridItem
            span={12}
            className="reveal lg:!col-span-8"
            style={{ transitionDelay: '240ms' }}
          >
            <div className="rounded-3xl border border-white/[0.08] bg-surface-dark p-10">
              <div className="mb-8 flex items-center gap-3">
                <div className="mono text-2xl text-white/40">{'{tripleByte}'}</div>
                <div aria-hidden className="h-6 w-px bg-white/10" />
                <div className="text-xs text-white/40">
                  Series C · 240 employees · NYC
                </div>
              </div>
              <blockquote className="mb-8 text-2xl font-medium leading-snug tracking-tight text-white">
                “We tried Cresta two years ago. Reps hated the desktop overlay
                — they were glued to a screen instead of the customer. Vought
                puts the same intelligence in their AirPods, in their own
                voice. Acceptance rate tripled.”
              </blockquote>
              <div className="flex items-center gap-3">
                <div
                  aria-hidden
                  className="h-11 w-11 rounded-full bg-white/10"
                />
                <div>
                  <div className="text-sm font-bold text-white">Jenna Cole</div>
                  <div className="text-xs text-white/50">
                    VP RevOps · TripleByte
                  </div>
                </div>
                <Link
                  href="/customers/triplebyte"
                  className="ml-auto inline-flex items-center gap-1.5 text-sm font-bold text-accent-amber"
                >
                  Read the story
                  <ArrowRight size={14} className="text-accent-amber" />
                </Link>
              </div>
            </div>
          </GridItem>

          {/* Metric tiles */}
          <GridItem
            span={12}
            className="reveal flex flex-col gap-5 lg:!col-span-4"
            style={{ transitionDelay: '360ms' }}
          >
            <MetricTile
              value={
                <>
                  <CountUp target={1.4} prefix="$" suffix="M" decimals={1} />
                </>
              }
              label="incremental revenue, Q1 vs Q4"
            />
            <MetricTile
              value={
                <>
                  <CountUp target={3} suffix="×" />
                </>
              }
              label="suggestion acceptance vs prior tool"
            />
            <MetricTile
              value={
                <>
                  <CountUp target={12} />
                  <span className="text-2xl text-white/60"> days</span>
                </>
              }
              label="from onboarding to first ROI-positive month"
            />
          </GridItem>
        </Grid>
      </Container>
    </section>
  );
}

interface MetricTileProps {
  value: React.ReactNode;
  label: string;
}

function MetricTile({ value, label }: MetricTileProps) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-surface-dark p-6">
      <div className="mono mb-1 text-4xl font-bold text-white">{value}</div>
      <div className="text-xs text-white/50">{label}</div>
    </div>
  );
}
