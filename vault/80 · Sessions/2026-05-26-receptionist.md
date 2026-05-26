# 2026-05-26 · Wave 5 · /receptionist

**Agent.** marketing-page-builder (Wave 5 follow-up to Wave 2 landing).

**Scope.** Build the Vought Receptionist product page per
`VOUGHT-DESIGN-BLUEPRINT.md` §4.1 (/receptionist).

## What was done

Single file added:

- `apps/web/app/receptionist/page.tsx` — composed inline per the same
  architecture as the sibling `/copilot` page. Server-rendered, zero
  client state (`'use client'` is not needed — all motion is CSS).

No other files were touched. The nav already lists `/receptionist`.

## Sections shipped (in blueprint order)

1. **Hero** — *"Answer every call. Even at 2am."* with state pill,
   subhead, two CTAs (`Get your phone number` → `#cta-form`,
   `Call the demo line` → `#live-demo`), three metric tiles (42%
   recovered after-hours bookings, 620ms median answer, 10 min from
   signup to live). Right column: `PhoneCallMockup` — incoming call ring
   (CSS keyframe `vought-ring-out`), four-line transcript, appointment
   slot landing in calendar with emerald glow (`slot-land` keyframe),
   amber waveform, secondary "SMS to owner" card.

2. **Industries grid** — six cards (Dental, Legal, Real Estate, Beauty,
   Home Services, Medical). Each: vertical label, ~60-word vignette,
   amber mono metric in the corner. Hover: amber border lift.

3. **Live phone call demo** — left column has the published demo line
   (`(555) 010-VOUGHT`, `tel:+15550108686`) inside an amber-edged card
   matching the flagship variant lineage. Right column: `SampleCallTranscript`
   with 5-turn dialog and a 3-stat summary row (Outcome / Length /
   Median latency `620ms`).

4. **Setup in 10 minutes** — four vertical step cards matching the
   `/copilot` `FiveStepLoop` pattern (left text · right mini illustration).
   Steps: Pick a number (number picker with one amber-highlighted row) →
   Configure hours (week calendar bars with open/after-hours legend) →
   Upload your FAQ (three file rows with emerald check) → Go live
   (live-status card).

5. **Integrations** — core row of 5 chips (Calendly, Google Calendar,
   Square, Stripe Billing, Twilio) and three vertical-specific cards
   (Dental → Dentrix / Open Dental, Legal → Clio / MyCase, Real Estate →
   Follow Up Boss / Sierra Interactive).

6. **Pricing** — wide flagship card with `$0.20 / minute` in mono, the
   `$99/mo minimum` callout, six included-feature pills, and a primary
   CTA. Right side has a "practical math" tile that shows the 340-min
   monthly calculation.

7. **Customer story** — Lakeshore Dental dental-office vignette (60 days,
   92 patients, 38% booked after-hours, $1.6K vs $4.8K). Mirrors the
   landing's `CustomerStory` quote-plus-three-metrics layout.

8. **CTA** — *"Get your phone number today."* Two-column. Left: copy +
   three checkmarks. Right: `SignupForm` (business name / ZIP / email)
   posting to a future `/api/receptionist/signup` server action. Form
   honors the same amber primary button styling and includes a consent
   line on two-party recording laws.

## Tokens and motion compliance

- All colors / spacing / typography pulled through tailwind tokens
  (`bg-surface-dark`, `bg-elevated-dark`, `text-accent-amber`,
  `text-live-emerald`, `text-info-azure`, `text-marketing-ink`,
  `display-xl`, `label-tiny`, `mono`).
- Motion uses existing utility classes: `.reveal`, `.pulse-amber`,
  `.pulse-emerald`, `.wave-bar`, `.float-anim`, `.bloom`,
  `.pill-cta`.
- Two scoped page-only keyframes added inline (`vought-ring-out` for the
  incoming-call ring, `vought-slot-land` for the appointment confirmation
  glow). Both reference `var(--motion-wave)` / `var(--easing-breath)` /
  `var(--easing-cinematic)` — no raw timing values.
- Latency / numeric values rendered in JetBrains Mono via `.mono`. The
  brand callsign treatment (`· 620ms` with amber + mono) appears in the
  hero mockup, the sample-call summary row, and the signup form's
  provisioning badge.

## Brand voice compliance

- Declarative sentences throughout. No "AI-powered", "supercharge", "10x".
- The AI is referenced as "Vought" the agent, never as a chatbot.
- Single named customer (Lakeshore Dental, Dr. Camila Mendez) — no
  anonymous logo wall on this page.
- Pricing prose: *"Pay for calls answered. Not for seats unused."* —
  positioned as honest meter, not a tease.

## Forbidden patterns avoided

- No stock imagery, no emojis in copy, no confetti, no toast, no generic
  spinners, no drop shadows, no second accent color, no scroll-jacking.
- No raw `transition: ... 240ms` outside CSS-variable-driven utilities.

## Type-check

`tsc --noEmit` reports only pre-existing errors in `components/ui/CountUp.tsx`,
`packages/design-system/tailwind.config.ts`, and `packages/ui/src/primitives/*`
— none in `app/receptionist/page.tsx`. Confirmed by Wave 2 baseline that
these errors predate Wave 5.

## Open questions / what is next

- The `tel:+15550108686` demo line resolves to a Twilio number we have
  not yet provisioned. Hackathon scope: render only. V2 wires the real
  IVR webhook and live transcript stream (WebSocket) per Blueprint §11
  hackathon-Day-2.
- `/api/receptionist/signup` route is referenced as the form action but
  is out of Wave 5 scope. Stub or implement before public launch.
- Customer story page `/customers/lakeshore-dental` is linked from the
  quote card; create a stub if QA flags the dead link.
- Consider promoting the small page-scoped `<style>` block (ring pulse
  + slot-land keyframes) into `packages/motion` if a second product page
  ever reuses the phone-ring motion.
