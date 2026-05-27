/**
 * Scene 1 · Hero
 *
 * Two-column layout:
 *   - Left: state pill, h1, sub, primary + secondary CTA, three metric tiles.
 *   - Right: the floating dashboard preview — the only place on the
 *     marketing page where the live whisper experience is rendered as a card.
 *
 * The hero shows the brand callsign latency string in mono with the
 * amber dot prefix once. Other reuses (Architecture, Live Demo) match.
 */

import Link from 'next/link';
import { Container, Grid, GridItem, Stack } from '@vought/ui';
import { ArrowRight, Play } from '@/components/ui/Icon';
import { CountUp } from '@/components/ui/CountUp';

export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative px-6 pb-32 pt-44"
    >
      <Container width="marketing" padX={0}>
        <Grid columns={12} gutter={32} className="items-center">
          {/* Left column */}
          <GridItem span={12} className="lg:!col-span-7">
            <Stack gap={0}>
              <div className="reveal mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5">
                <span className="pulse-emerald h-1.5 w-1.5 rounded-full bg-live-emerald" />
                <span className="text-xs font-medium text-white/70">
                  Live in your AirPods · sub-second latency
                </span>
              </div>

              <h1
                id="hero-heading"
                className="reveal display-3xl mb-7 text-white"
                style={{ transitionDelay: '80ms' }}
              >
                Intelligence<br />for live<br />conversations.
              </h1>

              <p
                className="reveal mb-10 max-w-xl text-xl leading-relaxed text-white/60"
                style={{ transitionDelay: '240ms' }}
              >
                Vought listens to your live conversations and privately whispers
                what to say next — in your own cloned voice. Built on ElevenLabs
                Speech Engine. Sub-second latency.
              </p>

              <div
                className="reveal mb-12 flex flex-wrap items-center gap-4"
                style={{ transitionDelay: '360ms' }}
              >
                <Link
                  href="/demo"
                  className="pill-cta inline-flex items-center gap-2 rounded-full bg-accent-amber px-7 py-4 text-sm font-bold text-marketing-ink hover:opacity-90"
                >
                  Book your demo
                  <ArrowRight size={14} className="text-marketing-ink" />
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20">
                    <Play size={10} className="text-white" />
                  </span>
                  Watch the 90-second tour
                </Link>
              </div>

              <div
                className="reveal flex flex-wrap items-center gap-10 text-xs text-white/40"
                style={{ transitionDelay: '640ms' }}
              >
                <div>
                  <div className="mb-1 text-3xl font-medium text-white">
                    <CountUp target={2.3} prefix="$" suffix="B" decimals={1} />
                  </div>
                  <div>revenue influenced</div>
                </div>
                <div aria-hidden className="h-12 w-px bg-white/10" />
                <div>
                  <div className="mb-1 text-3xl font-medium text-white">
                    <CountUp target={412} suffix="ms" />
                  </div>
                  <div>whisper latency</div>
                </div>
                <div aria-hidden className="h-12 w-px bg-white/10" />
                <div>
                  <div className="mb-1 text-3xl font-medium text-white">
                    <CountUp target={73} suffix="%" />
                  </div>
                  <div>suggestion accept</div>
                </div>
              </div>
            </Stack>
          </GridItem>

          {/* Right column — floating dashboard preview */}
          <GridItem span={12} className="relative lg:!col-span-4 lg:!col-start-9">
            <HeroDashboardPreview />
          </GridItem>
        </Grid>
      </Container>
    </section>
  );
}

function HeroDashboardPreview() {
  return (
    <div className="relative">
      <div
        className="float-anim relative"
        style={{ transformOrigin: 'center' }}
      >
        {/* State pill (above the card) */}
        <div className="absolute -left-3 -top-5 z-raised">
          <div className="pulse-amber inline-flex items-center gap-2 rounded-full bg-accent-amber px-4 py-1.5 text-marketing-ink">
            <span className="h-1.5 w-1.5 rounded-full bg-marketing-ink" />
            <span className="label-tiny text-marketing-ink">Whispering</span>
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl border border-white/[0.08] bg-surface-dark p-5"
          style={{
            boxShadow:
              '0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset',
          }}
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="label-tiny text-white/40">Live · 14:22</div>
            <span className="mono text-[10px] text-accent-amber">· 412ms</span>
          </div>

          <div className="label-tiny mb-1.5 text-white/40">They just said</div>
          <p className="mb-4 text-xs italic leading-relaxed text-white/50">
            “…we already pay for Salesforce, not sure we need another system in
            the stack.”
          </p>

          {/* Suggestion card · whisper bloom */}
          <div className="bloom mb-4 rounded-xl bg-accent-amber p-4">
            <div className="label-tiny mb-2 text-marketing-ink/60">Say next</div>
            <p className="mb-2 text-base font-semibold leading-snug text-marketing-ink">
              “Totally hear you on stack fatigue. What’s the thing your reps
              spend most of their day actually doing in Salesforce?”
            </p>
            <p className="text-[10px] text-marketing-ink/50">
              → then: ask about logging
            </p>
          </div>

          <div className="mb-3 flex items-center justify-between text-[10px] text-white/40">
            <span>Playbook · Salesforce objection v3</span>
            <span className="text-live-emerald">2.3× close</span>
          </div>

          {/* Idle waveform */}
          <div className="flex h-5 items-end gap-0.5" aria-hidden>
            {WAVE_BARS.map((bar, i) => (
              <span
                key={i}
                className="wave-bar w-1 rounded"
                style={{
                  height: `${bar.height}%`,
                  animationDelay: `${i * 80}ms`,
                  background: bar.amber,
                }}
              />
            ))}
          </div>
        </div>

        {/* Secondary floating card */}
        <div
          className="absolute -bottom-8 -right-6 w-44 rounded-xl border border-white/[0.08] bg-elevated-dark p-3 shadow-xl"
          style={{ transform: 'rotate(-2deg)' }}
        >
          <div className="label-tiny mb-1 text-white/40">Buying signal</div>
          <div className="mb-1 text-xs font-semibold text-white">
            ↑ 3 mentions of “logging”
          </div>
          <div className="text-[10px] text-white/40">Strong pain point</div>
        </div>
      </div>
    </div>
  );
}

const WAVE_BARS: { height: number; amber: string }[] = [
  { height: 30, amber: 'rgba(245,165,36,0.6)' },
  { height: 60, amber: 'rgba(245,165,36,0.8)' },
  { height: 90, amber: 'rgba(245,165,36,1)' },
  { height: 70, amber: 'rgba(245,165,36,1)' },
  { height: 100, amber: 'rgba(245,165,36,1)' },
  { height: 60, amber: 'rgba(245,165,36,1)' },
  { height: 80, amber: 'rgba(245,165,36,0.8)' },
  { height: 50, amber: 'rgba(245,165,36,0.6)' },
  { height: 40, amber: 'rgba(245,165,36,0.4)' },
  { height: 30, amber: 'rgba(245,165,36,0.3)' },
  { height: 55, amber: 'rgba(245,165,36,0.5)' },
  { height: 75, amber: 'rgba(245,165,36,0.7)' },
  { height: 90, amber: 'rgba(245,165,36,1)' },
  { height: 65, amber: 'rgba(245,165,36,0.8)' },
  { height: 45, amber: 'rgba(245,165,36,0.6)' },
];
