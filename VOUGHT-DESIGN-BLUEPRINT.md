# Vought — Master Product & Design Blueprint
*v2.0 · canonical reference for Claude Code implementation agents*

*Intelligence for live conversations.*

This document is the master reference for the entire Vought product surface — brand, marketing site, product pages, dashboard, live call screen, mobile, motion, asset direction, and a phased implementation roadmap for AI coding agents. It is structured as the *Texura Pipeline* — a five-phase strategic framework — followed by ten production deliverables and a seven-phase implementation roadmap.

It does not contain code. It contains decisions, references, timings, motion specs, copy direction, and constraints precise enough that an implementation agent can build any single page in isolation and have it match the others when assembled.

The final product should feel like *Observe.ai redesigned by Apple for the future of AI voice systems.*

---

## Contents

**Overture.** What we are building. The north star.

**Part I — The Texura Pipeline (Strategy)**
- Phase 1 · Strategy
- Phase 2 · Reference Analysis
- Phase 3 · Visual Language
- Phase 4 · Motion System
- Phase 5 · Asset Direction

**Part II — The Ten Deliverables**
1. Brand Strategy
2. Information Architecture
3. Landing Page Storyboard
4. Page-by-Page UX Breakdown (Public + Dashboard)
5. Live Call Screen Design — *the hero*
6. Motion Design System
7. Visual System
8. Mobile Experience
9. Differentiation Strategy
10. Implementation Roadmap for AI Agents

**Appendix.** Glossary · Performance budget · Asset references · Forbidden patterns.

---

## Overture

**What we are building.** Vought is a realtime AI voice intelligence platform. It listens to live human conversations and, in under one second, whispers what to say next — privately, into the operator's earbud, rendered in the operator's own cloned voice. Two products: **Vought Copilot** (live coaching for sales, support, negotiations, interviews) and **Vought Receptionist** (autonomous AI handling inbound calls for businesses).

**What it is not.** Not a chatbot interface. Not a transcription tool. Not a CRM. Not a feature dashboard. The moment any screen starts feeling like one of those, we have failed.

**What it is.** *Mission control for human conversation.* A cockpit-grade information architecture for the manager. A ceremonial, focused, single-line surface for the operator. A presence — not a panel — when the AI is doing work.

**The two emotional tests.**
- The operator test: *"This is calm enough that I can use it in front of a customer."*
- The manager test: *"This is dense enough that I can see my whole team at a glance."*

If a screen passes both tests, ship it. If not, redesign until it does.

---

# Part I — The Texura Pipeline

A five-phase strategic framework. Phases 1-2 happen before any visual work. Phases 3-5 produce the design system that every page is built from. Skipping a phase shows up later as a brand identity crisis.

## Phase 1 · Strategy

### 1.1 Emotional positioning

Vought lives at the intersection of three emotional registers that no competitor occupies simultaneously:

**Composure.** The kind of quiet confidence a Patek Philippe brochure communicates. The product never raises its voice. There are no notifications fighting for attention, no celebratory animations, no toast messages. The aesthetic suggests *we have done this before; we know what we are doing.*

**Co-presence.** The feeling that someone competent and discreet is in the room with you. Not a chatbot in a side panel — a presence in the ambient layer of the interface. The breath animation. The waveform that listens. The amber dot that appears only when something is genuinely happening.

**Precision.** Numbers in mono. Hairline borders. Spacing on a 4px grid. Every detail signals that this is operating equipment, not consumer software. Compare to a Bloomberg terminal or an avionics display, not a Slack app.

### 1.2 Cinematic product narrative

The product narrative is a three-act story we tell in marketing, onboarding, and the product itself.

**Act 1 — The problem.** *Every important conversation happens once.* Job interviews. First dates. Customer escalations. Salary negotiations. People walk into these moments with the same brain they use to order pizza, and they freeze. They forget the question they wanted to ask. They miss the moment to say the right thing.

**Act 2 — The reveal.** *The AI is already in the room with you.* Vought listens. It understands what is happening. And in under a second — fast enough that no one across from you notices — it whispers the next line into your earbud, in your own voice. You hear yourself, then you say it.

**Act 3 — The transformation.** *The conversation goes differently.* Deals close. Interviews land. Hard conversations resolve. The user does not become someone else — they become a faster, calmer, more articulate version of themselves.

This three-act structure shows up everywhere: in the landing hero (problem in the headline, reveal in the dashboard preview, transformation in the metrics), in the onboarding flow (you, your voice, your first call), in the demo video (silent failure, AI emerges, deal closed).

### 1.3 Audience psychology

We design for two operators with very different cognitive states:

**The individual operator** (Vought Personal — $19/mo). About to walk into a moment that matters. Anxious. Hopeful. The product must lower their cortisol, not raise it. Onboarding is short (under four minutes). The persona picker is reassuring ("Hard Conversation"). The live screen is sparse — one suggestion at a time. No analytics until after the conversation. The brand voice is steady and never glib.

**The team operator** (Vought for Teams — $99/seat/mo). A sales rep mid-quarter, a support agent under SLA pressure, a manager evaluating their pipeline. Pragmatic. Time-constrained. The product must respect their existing workflow and slot into it. The CRM context appears beside the suggestion without the user asking. The manager dashboard is dense by design. Coaching is offered, never imposed.

**The buyer.** Sales managers, VPs of revenue, Heads of CX. They evaluate enterprise software at speed and with cynicism. The page must establish credibility in seven seconds (customer logos, real metrics, an architecture diagram, security trust signals). If we don't earn the demo click in fifteen seconds, we lose them.

### 1.4 Trust architecture

Trust is communicated in fifteen specific places. Every one of them must be present:

1. The product name in the metadata title and the favicon, consistently.
2. Customer logos high on the page, in customer typefaces, neutral grey.
3. Real metrics (latency in milliseconds, customer ARR influenced, suggestion acceptance %).
4. A named case study with avatar, title, and company.
5. A security page linked from the footer and the nav.
6. SOC 2 / HIPAA / GDPR badges where applicable, with real status (in-progress is fine; vague is not).
7. A specific architecture diagram. Engineers will pause on it. Make it accurate.
8. A clear "no audio retained" disclosure on the live screen.
9. Voice clone consent flow — explicit, never buried.
10. Founder names in the About page, with the Twitter and LinkedIn that exist.
11. A real San Francisco office address in the footer.
12. A working contact email and a 24-hour response promise.
13. A public changelog. Frequent updates signal a real engineering org.
14. A bug-bounty / security email on the Security page.
15. A privacy policy that reads like it was written by a human, not a legal generator.

### 1.5 Conversion structure

The marketing site has exactly two conversion goals — `book_demo` (team buyers) and `start_trial` (individual users). Every page is auditable against these two outcomes.

Hero → exposure → social proof → product reveal → metrics → architecture → customer story → security → CTA strip. This is the Cresta/Observe.ai story shape, refined for our latency-as-product positioning.

**Conversion micro-rules:**
- The primary CTA appears within the first 600px of every page.
- Secondary CTA never competes for color with primary.
- No "Learn more" buttons. Use specific verbs: *Book your demo, Open the live demo, Read the case study, See pricing.*
- Every section that doesn't move the conversion forward must be removed.

---

## Phase 2 · Reference Analysis

We learn from specific products in specific ways. The goal is not to clone any of them.

**Observe.ai** — the closest enterprise analog. From them we learn:
- Dark-canvas storytelling with subtle blue gradients we will replace with amber.
- Sticky long-form section transitions with parallax-like layering of UI screenshots.
- Big metric numbers that count up on scroll.
- A "platform" page that earns engineering trust through diagrams, not promises.

**Cresta** — the direct competitor in B2B revenue. From them we learn:
- The mega menu structure (Platform left, three product columns right).
- The customer-story format with a single oversized quote and metric tiles.
- Pricing trust signals built into the page architecture, not stuffed in a footer.

**Linear** — the design hero. From them we learn:
- Information density that doesn't feel cramped because of generous spacing and hairline borders.
- Keyboard-first command palette as the application's central nervous system.
- A changelog page that is itself a brand artifact.

**Cursor** — the AI-native interface hero. From them we learn:
- How to make AI feel co-present without anthropomorphizing it.
- The visual grammar of streaming, generating, and accepting.
- The aesthetic of "your hands stay on the keyboard."

**Granola** — the conversation-as-canvas hero. From them we learn:
- That a transcript can be a rich, annotated canvas, not a chat log.
- Split-screen post-call review (notes left, AI commentary right).
- "Ask Granola" as a retrospective interaction. Ours is "Ask Vought."

**Vercel** — the developer-facing premium hero. From them we learn:
- Aggressive yet elegant gradients used sparingly to mark *the* hero moment.
- Section reveals on scroll with crisp, deliberate timing.
- A footer that telegraphs "we are an institution."

**Stripe** — the trust-architecture hero. From them we learn:
- Customer logos that punch above their weight through typographic restraint.
- The art of the long-form product page with sub-headers, side-by-side compare cards, and code snippets that are actually informative.
- Pricing pages that don't feel like a stick-up.

**Retell / Vapi** — the realtime voice infra heroes. From them we learn:
- How to communicate "low latency" visually.
- The grammar of WebRTC connection states.
- The aesthetic of voice agent dashboards.

**Awwwards / Dribbble / Behance / Pinterest references** — searched specifically for:
- Dark AI dashboard interfaces (Linear Insights, Mercury Treasury, Plaid)
- Sticky storytelling sections (Apple AirPods Pro, Stripe Atlas, Vercel /home)
- Cinematic hero treatments (Anthropic Claude, OpenAI o1, Linear Method)
- Animated typography reveals (Vercel Ship 2024, Cursor 1.0)
- Realtime system aesthetics (Linear sync, Figma multiplayer, Anduril Lattice)

The Anduril Lattice aesthetic is a particularly useful reference — it carries the defense-tech "operating equipment" feel without becoming cold. Vought borrows the *register* (composed, technical, slightly classified) without borrowing the *iconography* (military lines, sharp angles).

---

## Phase 3 · Visual Language

(Full visual system specified in Deliverable 7 below.) At this strategic phase we lock the *operating principles* of the visual language:

**One canvas, one accent.** Dark (#0A0A0B) for the product, warm cream (#FAF8F3) for marketing. Single accent color: amber (#F5A524), reserved for the AI active state. Never used decoratively. Never paired with a second accent.

**Glassmorphism rules.** Used exactly once per product surface, on the *one* most important floating overlay. Never on multiple panels at once. Glass loses its meaning when it's everywhere.

**Waveform as visual identity.** The horizontal bar-waveform appears in five canonical places: the live state pill, the suggestion card, the speaker timeline, the loading animation, and the favicon. Treated as a brand asset, not a UI widget.

**Realtime indicators are typographic.** The state pill, the latency badge, the streaming cursor — all rendered in mono, all calibrated to the same vertical rhythm. The numerics *are* the brand.

## Phase 4 · Motion System

(Full motion system specified in Deliverable 6 below.) At this strategic phase we lock the *motion philosophy*:

**Motion has a budget.** Every animation must justify itself against the budget. Default duration: 240ms. Maximum allowed without signed-off justification: 640ms. The single exception is the breath (2000ms ambient).

**Four signature motions, no more.** The breath, the whisper bloom, the word stream, the thinking dots. New signature motions require principal designer signoff. Decorative motion is forbidden.

**Motion communicates state, not personality.** Animation tells the user *what is happening* — the AI is thinking, the user just accepted, the suggestion is arriving. Animation never expresses brand personality or "delight." Slack-style confetti, Stripe-style spring confetti, Linear-style focus animations — none of these are appropriate for Vought.

## Phase 5 · Asset Direction

The asset stack for Vought is unusual. We do not use stock illustrations, mascot characters, or sales-y dashboard screenshots. Instead:

**3D/abstract direction.** A small set of bespoke 3D assets, rendered in a consistent style: matte material, soft directional lighting from upper-left, charcoal-on-charcoal palette with a single amber emission point. References: Linear's product imagery, Vercel's Ship visuals, Anthropic's pattern work. Render in Three.js for in-product or pre-render to WebP for marketing.

**Holographic waveform systems.** The signature visual asset. A long-form animated waveform that loops as a hero background. Built once in After Effects or Three.js, exported as a video loop and a static fallback. Used as the landing hero's ambient layer at 40% opacity. Not gratuitous — it is the visual proof of the product.

**Customer logos.** Always in customer typefaces, monochromatic grey at 50% opacity. Spec: 32px tall, never exceeding 1/8 of the container width. Hand-crop and re-set if needed.

**Founder/team photography.** If used, shot against the canvas color, soft directional light from upper-left, charcoal wardrobe. Never against a window. Never with a forced smile. The team page is more interesting when the photographs are quiet.

**Cinematic loops.** Short looping video clips (3-6s) for hero backgrounds and product page openers. Reference: the Anthropic homepage loop, the Apple AirPods Pro 2 loop. These should feel ambient, not narrative. Always paired with a fallback static image.

**AI-generated visuals.** Used sparingly — we do not want the brand to look "AI generated." When used (e.g., for blog illustrations), Midjourney/Sora prompts must include the brand palette and the matte-material reference. Output is curated, never raw.

**Forbidden assets.** Stock photography. Cartoon illustrations. Emoji. Photo-realistic AI portraits. Memes. Trade-show booth aesthetics.

---

# Part II — The Ten Deliverables

# 1. Brand Strategy

## 1.1 Emotional positioning

*Calm precision. Quiet authority. The competent person in the room who never needs to remind you they are competent.*

Vought is positioned at the intersection of **operating equipment** (avionics, Bloomberg terminals, defense-tech consoles) and **luxury restraint** (Patek Philippe, Loro Piana, A24). Neither register dominates; they amplify each other. The operating-equipment side communicates that the product is *for real work*. The luxury-restraint side communicates that *we know better than to look like we are trying*.

## 1.2 Brand personality

If Vought were a person:
- They speak in declarative sentences.
- They do not say "AI-powered" or "supercharge" or "revolutionize."
- They notice things others miss.
- They are quiet until they have something useful to say.
- They wear neutral tones and have impeccable shoes.
- They have done this many times before.

If Vought were a place:
- The cockpit of a long-range business jet, lights dimmed.
- A late-night surgical suite.
- The control room of an observatory.
- A trading floor at 4 AM in Tokyo.
- A Yves Béhar studio at twilight.

If Vought were a sound:
- The soft breath of a high-end HVAC.
- The click of a Leica shutter.
- The rustle of a paper map being folded.

## 1.3 Trust language

The brand earns trust by what it *refuses to do*:
- It refuses to promise outcomes ("close more deals" → no; "the line your top closer would have said" → yes).
- It refuses to use the word "AI" as an adjective.
- It refuses to celebrate itself ("loved by sales teams everywhere" → no; specific customer name, specific metric → yes).
- It refuses to hide pricing.
- It refuses to manufacture urgency ("limited time" → never).
- It refuses generic stock photography.
- It refuses to talk down to the operator.

Trust is communicated through specifics: a single named customer, a single quoted statistic, a single architecture diagram, a single privacy statement. Each is more specific than its category demands. Specificity is the brand's signature.

## 1.4 Futuristic identity

The product is futuristic without being *science-fiction-y*. Three rules:

1. **No retro-futurism.** No grid-line aesthetics from 80s sci-fi. No CRT scanlines. No Tron-glow. The future Vought represents is the *near* future — six months from now, not 2099.
2. **No anthropomorphism.** No AI avatar. No "Vought says hello." No chatbot personality. The AI is a presence, not a character.
3. **No magic.** The product does not "magically" produce results. It explains what it is doing (the state pill, the source attribution in the suggestion card, the latency badge). Magic erodes trust the moment it fails. Visible mechanism builds trust each time it works.

## 1.5 AI behavioral philosophy

Five rules govern how the AI behaves visually and interactionally in the product:

1. **The AI speaks only when invited.** No proactive suggestions during human-to-human conversation. The default mode is push-to-summon (AirPods stem squeeze). Continuous auto-suggest is an opt-in advanced setting.
2. **The AI cites its sources.** Every suggestion in the live screen has a small source attribution beneath it ("Playbook · Salesforce objection v3"). The user knows *why* the AI suggested this.
3. **The AI gracefully shuts up.** If the user starts speaking mid-whisper, the AI cancels mid-sentence within 200ms. Never stutters, never overlaps the user's voice.
4. **The AI tells you when it is uncertain.** Confidence scoring is visible in the live screen as a thin amber bar beneath the suggestion. Low confidence — the suggestion is presented in white text on canvas (subdued) rather than black text on amber (assertive).
5. **The AI does not pretend to be human.** The cloned voice is the user's own — there is no third-party "AI persona." The AI never says "I think" or "I would say." It just gives the line.

## 1.6 What users feel

The first time:
- A flutter of disbelief during the voice clone. *That actually sounds like me.*
- Mild adrenaline in the first live session. *Can it really keep up?*
- Surprise at the first whisper. *That's exactly what I would have said if I'd been calmer.*

The second time:
- Calm preparation before the session. *Vought is ready. I am ready.*
- A trust feeling that they have a co-pilot. *I am not doing this alone.*

The hundredth time:
- Vought has disappeared into the workflow. They notice it only when it isn't there.

The team manager:
- *I can see my whole team's performance in a glance.*
- *I know which rep needs coaching this week before they do.*
- *I have proof that coaching changes outcomes.*

---

# 2. Information Architecture

## 2.1 Marketing site (vought.com)

```
/                                Landing
/copilot                         Vought Copilot product
/receptionist                    Vought Receptionist product
/platform                        Echo Engine, integrations, security overview
/customers                       Logo wall + case study grid
/customers/[slug]                Single case study (long-form)
/security                        Trust page — SOC 2, HIPAA, GDPR, data residency
/pricing
/docs                            Public developer documentation
/docs/api                        API reference
/docs/sdk                        SDK guides per language
/changelog                       Versioned release notes (RSS)
/blog
/blog/[slug]
/careers
/careers/[role]
/about
/contact
/legal/privacy
/legal/terms
/legal/dpa                       Data processing agreement
/legal/security
```

## 2.2 Application (app.vought.com)

```
/                                Dashboard overview
/live/[sessionId]                Live conversation — the hero
/calls                           Call history
/calls/[id]                      Single call review with annotations
/personas                        Persona library
/personas/[id]                   Single persona configuration
/playbooks                       Playbook library
/playbooks/[id]                  Single playbook with chunks + analytics
/voices                          Voice profile management (clone, re-record, delete)
/analytics                       Analytics + AI Analyst
/memory                          Memory / RAG system (per-user knowledge base)
/integrations
/integrations/[provider]         Per-integration config
/team                            Team roster (Teams plan)
/team/[memberId]                 Individual rep view (manager only)
/settings                        Personal settings (profile, voice, notifications)
/settings/privacy                Per-session retention defaults
/admin                           Org admin (admin only)
/admin/billing
/admin/seats
/admin/security                  SSO / SCIM / audit log
/admin/data-residency            Regional storage controls
```

## 2.3 Auth

```
/signup
/login
/forgot-password
/sso-callback
/invite/[code]                   Accept team invitation
```

## 2.4 Onboarding (one-time, gated)

```
/onboarding                      Entry — branches by signup origin
/onboarding/role                 Personal / Teams
/onboarding/voice                Voice clone capture
/onboarding/persona              Default persona pick
/onboarding/integrations         Teams only — Salesforce, Slack, Zoom
/onboarding/first-call           Start your first live session (practice or real)
```

## 2.5 Navigation systems

**Marketing nav.** Floating white pill at top center, 1180px max width. Logo + wordmark left, five primary items center (Products with mega menu, Solutions, Customers, Resources, Company), "Get a demo" CTA right. Sticky on scroll, compresses 56→48 height past 800px. Mega menu opens on hover (120ms delay), closes on outside click. Mobile: hamburger opens full-screen sheet.

**Application sidebar.** 240px wide, dark surface. Top: V monogram + wordmark, org switcher (if multi-org), search field. Primary sections: Dashboard, Calls, Live, Playbooks, Personas, Voices, Memory, Analytics. Divider. Team, Integrations, Settings. Bottom: user avatar with status. Collapses to 56px icon-only below 1280px viewport. Toggle: Cmd+\.

**In-app top bar.** 56px tall, dark surface, hairline bottom. Left: breadcrumb. Right: ⌘K command palette trigger, notifications (single amber dot for unread), help (?). Intentionally sparse.

**Command palette (⌘K).** Linear-style. Centered, 640px wide, glass background. Type to search: navigate (jump anywhere), action (start call, upload playbook, invite teammate), content (search calls by transcript). Three rows default. Keyboard nav with arrows + enter. Esc to close.

## 2.6 Interaction hierarchy

Six levels of interaction priority govern every page:

1. **Primary action** — one per screen. The CTA the user came here to perform. Amber pill on dark, ink pill on light.
2. **Secondary action** — outline or ghost. Never competes with primary.
3. **Tertiary navigation** — links, in-text references. Always understated.
4. **Ambient state** — the state pill, the live indicators. Visible but not interactive.
5. **Background information** — meta data, timestamps. Available but visually deprioritized.
6. **Latent interactions** — keyboard shortcuts, gestures. Never visible without invocation.

## 2.7 User journeys

**Journey A — Individual user from cold (4-minute target).**
1. Lands on / from a Twitter/LinkedIn post (2s)
2. Scrolls through hero, sees live demo block, scrolls through customer story (90s)
3. Clicks "Start trial" on the CTA strip (1s)
4. Lands on /signup, signs up with Google or Apple (15s)
5. /onboarding/role — selects "For myself" (3s)
6. /onboarding/voice — records 30 seconds of voice (45s)
7. /onboarding/persona — picks "Hard Conversation" (5s)
8. /onboarding/first-call — starts a practice call (5s)
9. First live whisper plays in their ear (1s)

**Journey B — Team buyer from sales engagement (10-day target).**
1. Lands on /copilot from a Google search for "Cresta alternative" (3s)
2. Scrolls through the pinned five-step loop section (45s)
3. Books a demo via the CTA strip (90s including form)
4. Receives confirmation email, calendar invite (instant)
5. Demo call — 20 minutes, voice cloned live on the call (20m)
6. Receives follow-up with proposal, demo recording, security one-pager (24h)
7. Internal security review at customer (3-7 days)
8. Customer signs MSA, kicks off onboarding (24h)
9. /onboarding for admin: voice clone, integrations, playbook upload, seat invites (1-2h)
10. First rep takes their first coached call (1h)

**Journey C — Daily operator (sub-90-second target).**
1. Login → /app dashboard (3s)
2. Scans Zone A (live now), Zone B (metrics), Zone C (recent calls) (45s)
3. Drills into one call for review, or jumps to /live to take a new call (10s)
4. Uses ⌘K for any other navigation (3s)

## 2.8 Onboarding flow detail

Onboarding is the product working immediately. We use real screens with real interactions, not a tour-overlay system.

**Step 1 — /onboarding/role.** Two cards. *For myself* (Personal). *For my team* (Teams). Tertiary link: *I'm here from a demo invite.* Choice sets the user's plan default but is reversible from settings.

**Step 2 — /onboarding/voice.** Per Live Call & Voice Profile spec. Cannot be skipped (voice clone is the product's promise).

**Step 3 — /onboarding/persona.** Horizontal scrolling card deck. User picks one default. Changeable any time.

**Step 4 (Teams only) — /onboarding/integrations.** Three primary integrations highlighted (Salesforce, Slack, Zoom). One can be skipped to unblock the flow.

**Step 5 — /onboarding/first-call.** Two options: *Start a practice call* (Vought roleplays as a difficult prospect for 5 minutes) or *Start a real call* (begin the user's actual workflow). Both go to /live.

**Time budget.** Personal: under 4 minutes. Teams: under 8 minutes.

---

# 3. Landing Page Storyboard

The landing page is the single most important artifact in the company. Twelve scenes. Each is described as a *scene* — what appears, how it animates, scroll behavior, transition, emotional goal, typography scale, lighting mood, CTA strategy, and animation pacing.

Total page length: ~1180vh. Target time-to-first-meaningful-paint under 800ms even on 4G. JS budget under 100KB. CSS under 30KB. Fonts under 200KB subsetted.

## Scene 0 — Pre-load (0-400ms)

**Visual composition.** Canvas in place (warm cream #FAF8F3). Nav pill subtly translucent. Headline and wordmark blurred (8px backdrop-blur) at 70% opacity.

**Motion behavior.** At t=400ms, the blur lifts in one motion (cubic-bezier(0.16, 1, 0.3, 1), 320ms). Headline lands.

**Emotional goal.** The page *focuses*, like a camera lens. The user understands subliminally that this is a designed experience.

**Lighting mood.** Warm, daytime. Light cream canvas.

**Animation pacing.** Single deliberate gesture. No staggering.

## Scene 1 — Hero (0-100vh)

**Visual composition.** 7-column / 5-column split (12-col grid, 24px gutter). Left column: tiny amber-dot status pill (*Vought 2.0 · Live in your AirPods*), hero headline in `display/3xl` (88pt, weight 800, tracking -0.045em) — *"The voice that closes the deal."* Subhead in 24pt — *"Vought listens to your live conversations and whispers the right line in your ear, in your own cloned voice. Sub-second latency. Built on ElevenLabs Speech Engine."* CTAs: primary "Get a demo" (filled black pill), secondary "Watch the tour" (text-only with play glyph). Three metric tiles below ($2.3B, 412ms, 73%).

Right column: a *living* dashboard preview, 320×420, dark UI, tilted 3deg, floating with 6000ms vertical drift. Inside: speaker timeline animating, suggestion card blooming on a 4-second loop, "live · 14:22" pill.

**Motion behavior.** Headline reveals line-by-line, 240ms each, staggered 120ms, with 12px upward translation and opacity 0→1. CTAs fade at t=720ms. Metric tiles count up to value over 1400ms (eased cubic). Dashboard preview enters with 96→100% scale and a soft ambient shadow grow over 600ms, starting t=400ms.

**Scroll behavior.** No scroll interaction in the hero. Static until user scrolls past.

**Transition style.** None — this is the first scene.

**Emotional goal.** *Real product. Real numbers. Real time.* The hero does not promise — it shows.

**Typography scale.** `display/3xl` headline. 24pt subhead. 14pt button text. Mono for metrics.

**Lighting mood.** Daytime cream. Subtle radial gradient behind dashboard preview, warm amber-tinted.

**CTA strategy.** Primary CTA at center-left, above the fold. Secondary always two clicks from primary in distance.

**Animation pacing.** First-time visitor reads the headline before the dashboard preview reaches steady state. Returning visitor sees both arrive in sync.

## Scene 2 — Customer logos (100-130vh)

**Visual composition.** 11pt uppercase tracked eyebrow ("TRUSTED BY THE REVENUE TEAMS SCALING FASTEST"), centered, 60% opacity. Six customer wordmarks in a single row, all 50% neutral grey, hand-set in their own typefaces.

**Motion behavior.** Logos fade in left-to-right with 80ms stagger, total 480ms. No further animation.

**Scroll behavior.** Reveals on viewport entry (40% threshold).

**Emotional goal.** *Other serious teams trust this.*

**Lighting mood.** Same cream canvas.

**Typography scale.** Logos in their own typography. Eyebrow in `label/sm` (11pt uppercase).

**Animation pacing.** Crisp, no embellishment. Logos earn their place by being recognizable, not by animation.

## Scene 3 — The promise (130-220vh)

**Visual composition.** Centered text block, max-width 720px. Amber eyebrow (*ONE PRODUCT · THREE SURFACES*), `display/2xl` headline (*"Every conversation, guided by Vought."*), single 35-word lead paragraph in 20pt.

**Motion behavior.** Section reveals on entry: headline fades and translates up 16px (360ms), paragraph follows at 120ms offset.

**Scroll behavior.** Standard scroll-triggered reveal.

**Emotional goal.** *This is a platform, not a feature.*

**Typography scale.** `display/2xl` (64/1.0/800/-0.04em), 20pt subhead.

**Animation pacing.** Two-beat reveal — bold statement, then context.

## Scene 4 — Three pillar cards (220-380vh)

**Visual composition.** Three cards, equal width, 32px gutter. Receptionist (white), **Copilot (dark, flagship)**, Insights (white). Each card 460px tall, 16px corner radius, 32px padding. Icon, name, description, three-bullet feature list, CTA arrow.

The Copilot card is the visual anchor: dark canvas, amber accents, slightly larger (104% scale), small "FLAGSHIP" pill top-right.

**Motion behavior.** Cards appear in sequence, 160ms stagger, 12px upward translation, 0→1 opacity. Cards lift on hover (translateY -4px, ambient shadow grows, 200ms).

**Scroll behavior.** Standard reveal.

**Emotional goal.** *Three products, but one is the hero.* The eye lands on the dark Copilot card.

**Typography scale.** Card titles `display/md` (32pt). Descriptions 14pt at 1.6 line-height.

**Lighting mood.** Cream canvas with one inverted card creating visual hierarchy.

**CTA strategy.** Each card has its own arrow CTA. The Copilot card's CTA is amber; others are ink.

**Animation pacing.** Equal stagger across three cards — no one card is favored in animation timing, only in design.

## Scene 5 — The live demo block (380-560vh) · *Hero conversion moment*

**Visual composition.** Full-screen, two-column. Left: vertical narrative — eyebrow (*WATCH IT WORK · LIVE*), headline (*"This actually happens in 412 milliseconds."*), five-line description of the loop. Primary CTA *Open the live demo.*

Right: a *playable* live-call simulator. Pre-recorded 90-second mock sales call audio. As audio plays, the right panel renders the full Vought live screen — speaker timeline animating, transcript word-streaming, suggestion card blooming on every "other" turn. User can pause, scrub, restart.

**Motion behavior.** Simulator auto-starts when 60% in viewport, audio muted by default with "Tap to hear" overlay. Suggestion bloom (Signature 2) and word stream (Signature 3) drive the eye.

**Scroll behavior.** Sticky for the section duration — the simulator stays anchored to viewport while user reads the left column.

**Transition style.** Enters with a 240ms fade-in. Exits with the user's natural scroll.

**Emotional goal.** *This is the actual product. No mockup. No video.* This is the section that converts.

**Typography scale.** `display/xl` (48pt) headline. 18pt body.

**Lighting mood.** Cream canvas with the dark simulator panel as visual anchor.

**CTA strategy.** Two CTAs in this section. The primary text CTA. The implicit "Tap to hear" interaction as a secondary engagement.

**Animation pacing.** The simulator paces the section. The user finishes reading the left column at about the same moment the first suggestion blooms on the right.

## Scene 6 — Architecture diagram (560-700vh)

**Visual composition.** Simplified 2D version of the n8n-style architecture flow, rebuilt for marketing — fewer nodes, more whitespace. The voice loop: User mic → ElevenLabs Speech Engine → Echo Engine → LLM → ElevenLabs TTS → AirPods. Hairline nodes, amber dots when active. Wires pulse amber every 2000ms left-to-right.

Above: explanatory paragraph (*"Vought is the brain. ElevenLabs is the voice."*) Below: three latency-stage numbers in mono (end-of-turn detection, LLM TTFT, TTS first byte).

**Motion behavior.** Nodes fade in left-to-right (200ms stagger). Wire-pulse animation always-on once visible.

**Scroll behavior.** Standard reveal.

**Emotional goal.** *This is technically credible.* Engineers pause here.

**Typography scale.** Section headline `display/xl` (48pt). Node labels in `text/sm` (14pt). Latency in mono large (24pt).

**Lighting mood.** Cream canvas. Diagram in monochrome with amber pulse — the only animation in the scene.

**Animation pacing.** Wire pulse is the heartbeat of the section. Even when the user is not actively looking at it, they feel the rhythm.

## Scene 7 — Customer story (700-820vh)

**Visual composition.** Two-column case study. Left (7 cols): card with customer wordmark, oversized blockquote, attribution (avatar + name + title + company). Right (5 cols): three vertical metric tiles ($1.4M incremental, 3× acceptance, 12 days to first ROI).

**Motion behavior.** Quote text fades in word-by-word with 80ms stagger — echoing the live word-stream signature. Metric tiles count up.

**Scroll behavior.** Sticky-like: the metric tiles can stick to viewport while the quote reads, then unstick.

**Transition style.** Standard reveal.

**Emotional goal.** *Someone like me bought this and it worked.*

**Typography scale.** Quote 30pt weight 500, line-height 1.2. Attribution 14pt.

**Lighting mood.** Cream canvas with subtle vignette.

**CTA strategy.** Soft CTA — *"Read the case study"* on the left card, ink color, ghost.

**Animation pacing.** Word-stream connects the marketing to the in-product experience. Subliminal continuity.

## Scene 8 — Three rotating shorter stories (820-880vh)

**Visual composition.** Compressed horizontal carousel. Three additional case study cards. Auto-rotates every 8s. Pause on hover. Manual dot navigation.

**Motion behavior.** Cross-fade between cards (360ms cubic).

**Scroll behavior.** Standard reveal.

**Emotional goal.** *This was not a one-off.*

**Typography scale.** Card headlines `display/md` (32pt), quotes 16pt.

**Animation pacing.** 8s rotation respects reading pace. Manual override always available.

## Scene 9 — Security and trust (880-1000vh)

**Visual composition.** Section header (*"Built for the conversations that can't leak."*) Below: 4-column grid of trust signals — SOC 2 Type II, HIPAA, GDPR, Zero-retention mode. Each is a card with cert logo, one-line description, link to /security. Below grid: one sentence — *"Vought processes ephemerally by default. No audio is stored unless you turn it on."*

**Motion behavior.** Cards reveal on entry, 80ms stagger.

**Scroll behavior.** Standard reveal.

**Emotional goal.** *Compliance handled.*

**Typography scale.** Section headline `display/xl`. Cards 14pt.

**Lighting mood.** Cream canvas. Hairline borders on every card.

**CTA strategy.** Tertiary text link to /security.

**Animation pacing.** Crisp. This is hygiene, not theatre.

## Scene 10 — Pricing tease (1000-1100vh)

**Visual composition.** Three pricing cards — Personal $19, Teams $99, Enterprise (custom). Each card shows tier name, price, one-line description, three-line feature highlight, CTA.

**Motion behavior.** Cards reveal on entry. Hover lifts (translateY -4px).

**Scroll behavior.** Standard reveal.

**Emotional goal.** *Pricing is transparent. There is a tier for me.*

**Typography scale.** Tier name `display/md`. Price `display/xl` in mono (48pt). Description 14pt.

**Lighting mood.** Cream canvas.

**CTA strategy.** Each card has CTA — *Start trial / Book demo / Talk to sales*. The middle (Teams) card is the visual anchor with subtle amber border.

**Animation pacing.** Pricing reveals quickly. The user already knows the page is wrapping up.

## Scene 11 — CTA strip (1100-1180vh)

**Visual composition.** Dark strip (canvas inverts to near-black for this section). Two-column. Left: *"See Vought in your own voice."* Right: primary "Book your demo" (amber pill, ink text), secondary "Talk to sales" (outlined ghost). Below: small line — *"20-minute demo. We'll clone your voice on the call and coach you live."*

**Motion behavior.** Section enters with *canvas-color shift* — background sweeps cream to near-black over 480ms as section scrolls into view. Light-to-dark is the page's strongest visual moment.

**Scroll behavior.** Pinned for the duration of the transition.

**Transition style.** Canvas shift. Outlines and text contrast invert smoothly.

**Emotional goal.** *The page has earned the right to ask for the demo.*

**Typography scale.** `display/2xl` headline. 14pt small print.

**Lighting mood.** Dark, intimate. End of the day. Time to commit.

**CTA strategy.** Two CTAs, primary amber, secondary outline. This is the final ask.

**Animation pacing.** Slow, deliberate. The canvas shift takes longer than any other animation on the page — because this is the moment.

## Scene 12 — Footer (1180-1240vh)

**Visual composition.** Light canvas resumes. Four-column layout. Logo + tagline + social left. Products / Solutions / Company / Resources columns. Bottom row: copyright + legal + San Francisco mention.

**Motion behavior.** None.

**Scroll behavior.** Final scroll target.

**Emotional goal.** *Reliable company. Real address. Real links.*

**Typography scale.** Footer headers in `label/sm` (11pt uppercase). Links in 14pt.

---

# 4. Page-by-Page UX Breakdown

## 4.1 Public website pages

### /landing

See Section 3 storyboard above.

### /copilot

**Purpose.** Convert team buyers evaluating real-time coaching solutions.

**Length.** 8 sections, ~1400vh.

**Hero.** Copilot-specific headline (*"The whisper that closes."*). Right-side preview: live screen mockup animating Copilot UI specifically. Metric tiles: call coaching adoption, suggestion acceptance, deal velocity.

**Section 2 — Use case strip.** 4 horizontal cards: Sales discovery, Objection handling, Customer support de-escalation, Negotiation. Each card clickable, scrolls to dedicated section.

**Section 3 — Pinned five-step loop.** *Signature interaction of the page.* Apple-style horizontal scroll-jacked section. Five steps revealed as user scrolls:
1. *They talk.* (Speaker timeline animates azure segment)
2. *We listen.* (Word-stream animation begins)
3. *We separate.* (Diarization label appears)
4. *We think.* (Amber dot becomes thinking dots)
5. *We whisper.* (Suggestion card blooms)

Each step: 90-character explanation, animated detail. Total scroll-through ~6 seconds at natural pace.

**Section 4 — Voice clone deep-dive.** Browser-based 5-second voice clone demo. Privacy disclosure beside the recorder. Highest-converting interaction on the page.

**Section 5 — Playbook RAG.** Visual explanation of company playbook → chunks → contextual suggestions. Sample PDF upload, visualization of indexing, suggestion that quotes back from playbook.

**Section 6 — Integrations.** Salesforce, HubSpot, Zoom, RingCentral, Aircall, Slack, Calendar. Hover expands with 200-char description.

**Section 7 — Customer quotes.** Three short Copilot-specific quotes from sales managers.

**Section 8 — Pricing pointer + CTA.** *$99/seat/month. Volume discount above 50 seats.* CTA chain: See pricing → Book demo.

**Emotional goal.** *Cresta with the form factor and the voice cloning Cresta cannot ship.*

### /receptionist

**Purpose.** Convert SMB owners / ops managers buying autonomous inbound phone AI.

**Length.** 8 sections.

**Hero.** *"Answer every call. Even at 2am."* Right preview: incoming call animation, AI greeting, appointment landing in calendar.

**Section 2 — Industries.** 6-card grid: Dental, Legal, Real Estate, Beauty, Home Services, Medical. Each with 60-word vignette.

**Section 3 — Live phone call demo.** *Most aggressive interaction in the product.* A real published phone number. User calls from their phone, has real conversation with the AI, watches transcript and appointment-booking happen in browser (linked via on-screen session code).

**Section 4 — Setup in 10 minutes.** 4-step illustrated explainer: pick number, configure hours, upload FAQ, go live.

**Section 5 — Integrations.** Calendly, Google Calendar, Square, Stripe Billing, Twilio. Industry-specific tools (Dentrix for dental, Clio for legal).

**Section 6 — Pricing.** Receptionist-specific table: $0.20/min + $99/month minimum.

**Section 7 — Customer story.** 60-second video case study, dental office.

**Section 8 — CTA.** *"Get your phone number today."* Form: business name + ZIP + email → provisions a number within 60 seconds, replaces demo number with user's new one.

**Emotional goal.** *I can set this up before my next coffee.*

### /platform

**Purpose.** Establish engineering / security buyer credibility. Convert partners and developers.

**Length.** 6 sections, more technical density.

**Hero.** *"The engine behind every Vought conversation."* Right-side: interactive 3D version of architecture diagram (Three.js, lightweight).

**Section 2 — Echo Engine deep-dive.** Diagram + text on the stack: ElevenLabs Speech Engine + diart sidecar + LLM streaming + voice cloning. Latency budget table.

**Section 3 — Integrations.** 16-logo grid. Each integration deep-links to its own page.

**Section 4 — Responsible AI.** Point of view on consent, recording laws, voice cloning ethics. Calmly written. Signed by founders.

**Section 5 — Developer docs preview.** Embedded code snippets (Python, TypeScript, cURL). Copy buttons. Links to /docs.

**Section 6 — CTA.** *"Build on Vought."* CTAs: Read the docs / Talk to platform team.

### /security

**Purpose.** Buyer's confidence builder. Enterprise security review gate.

**Layout.** Single long-form page. Sections:
1. Executive statement (200 words) on data handling philosophy.
2. Certifications grid (SOC 2 Type II, HIPAA, GDPR, ISO 27001 — real or in-progress).
3. Architecture diagram with explicit data-flow annotations.
4. Sub-processor list.
5. Data residency options (US, EU, India).
6. Public security email + bug bounty.
7. Trust center deep links (separate Drata or Vanta portal).

### /pricing

Per Scene 10 storyboard + below-fold comparison table (30 rows, honest "no" marks for missing features) + Receptionist-specific pricing block.

### /about

**Layout.** Single narrative page.
1. Hero: aesthetic studio shot (empty room or voice waveform).
2. Founding story (~1200 words). Explicit point of view on voice AI ethics.
3. Team grid: photo + name + one-line bio.
4. Investor logos bottom.

### /blog

Single-column long-form template. Reverse-chronological list with featured image. Categories: Engineering, Customer Stories, Voice AI, Company. Search. RSS.

### /careers

Two sections: hiring philosophy (200 words), open roles as text rows (no thumbnails). Click → individual JD page.

### /contact

Three cards: Book a demo (primary), Email sales, Email support. Not a long form.

---

## 4.2 Dashboard pages

### /app (Overview)

Three-zone vertical layout per Live Call & Dashboard spec. Personal vs Teams content varies by plan.

**Zone A — Up next / Live now.** Personal: next prepared session. Teams: row of currently-live reps.

**Zone B — Metric strip.** Four tiles, plan-conditional metrics.

**Zone C — Operational tables.** Personal: recent sessions. Teams: rep performance table + top objections + AI Analyst prompt.

### /live/[sessionId]

See Deliverable 5 below. The hero.

### /calls

Reverse-chronological table of all sessions. Filter by persona, date range, outcome, rep (Teams). Each row: persona, duration, outcome, suggestion acceptance %.

### /calls/[id]

Three-column post-call review. Left: transcript with speaker labels. Center: annotated transcript with margin notes. Right: Best Moment / Missed Opportunity / Practice Next cards. Audio scrubber sticky at top. "Ask Vought" chat at bottom for retrospective questions.

Coaching workflows (Teams): assign drill, private comment, mark as exemplary, escalate to 1:1 review.

### /analytics

Top: AI Analyst input — *"Ask anything about your calls…"* with sample queries. On submit: rendered result (chart, table, or quoted transcripts).

Below: 8 pre-built dashboards in grid — Win rate by persona, Talk ratio trends, Top objections, Suggestion acceptance, Time-to-first-objection, Sentiment trajectory, Stage progression rate, Coaching impact.

Right rail: AI-discovered insights feed.

### /integrations

Logo grid grouped by category: CRM, Phone, Calendar, Communication, Identity. Click → detail page with per-integration config.

### /personas

Persona library. Built-in + custom. Click into one → configuration:
- System prompt editor
- Tone profile (warmth, formality, length sliders)
- Knowledge / RAG sources
- Voice override (optional)
- Test playground

### /memory (RAG system)

Per-user knowledge base. Upload documents, see chunks, see how they get retrieved during live sessions. Memory inspector — see what the AI remembers from past sessions.

### /voices

Voice profile management. Current voice clone + waveform sample + age + Re-record button. Privacy disclosure. Destructive Delete action with typed confirmation.

If no voice cloned: guided flow — 30s passage, waveform input, processing state, sample playback, accept/re-record.

### /team

Roster view. Three modes: grid (avatars + role + status), table (dense with metrics), live-now (only active reps). Drill into rep → call history + performance + coaching.

### /settings

Sectioned page. Sections: Profile, Voice, Notifications, Privacy, Personas (saved custom), Sessions (active and recent). Full-width sections with hairline dividers, never tabs.

---

# 5. Live Call Screen Design — *the hero*

This is the single most important screen in the entire product. Vought exists to make this screen feel right.

## 5.1 Context

The user is in a live call (phone or in-person) with another human. They have one earbud in. They glance at their phone or laptop occasionally. Cognitive load is high — they are listening to a real person while glancing at our UI for help. Every element must be readable in 0.4 seconds. Everything must be subtractive.

## 5.2 Layout — desktop

Single-column, max-width 720px, centered in a 1180px container with two optional flanking panels for Teams users.

```
┌────────────────────────────────────────────────────────────────┐
│   ┌─ DEAL CONTEXT  ─┐ ┌─ HERO COLUMN ─────────┐ ┌─ SOURCE ──┐ │
│   │  (Teams only)   │ │                       │ │ ATTRIB.   │ │
│   │                 │ │  STATE PILL · 14:22   │ │ (Teams)   │ │
│   │  TripleByte     │ │                       │ │           │ │
│   │  Series C       │ │  THEIR last utt.      │ │ Playbook  │ │
│   │  240 employees  │ │  (dim, italic, 14pt)  │ │ Salesforce│ │
│   │                 │ │                       │ │ objection │ │
│   │  Last touch:    │ │  SAY NEXT eyebrow     │ │ v3 (2.3×) │ │
│   │  Email 3d ago   │ │                       │ │           │ │
│   │                 │ │  ┌──────────────┐    │ │ Manager   │ │
│   │  Buying signal: │ │  │ SUGGESTION   │    │ │ notes...  │ │
│   │  ↑ 3 mentions   │ │  │              │    │ │           │ │
│   │  of "logging"   │ │  │ Amber card   │    │ │ Confidence│ │
│   │                 │ │  │ 28pt text    │    │ │ ████░ 87% │ │
│   │  Sentiment:     │ │  │              │    │ │           │ │
│   │  ↑ warming      │ │  │ ✓ Used  ↺ ⤬ │    │ │ Latency   │ │
│   │                 │ │  └──────────────┘    │ │ · 412ms   │ │
│   │                 │ │                       │ │           │ │
│   │                 │ │  SPEAKER TIMELINE     │ │           │ │
│   │                 │ │  ▂▃▅▇▅▃ ─ ▃▅▇█▇      │ │           │ │
│   │                 │ │                       │ │           │ │
│   │                 │ │  [End session]        │ │           │ │
│   └─────────────────┘ └───────────────────────┘ └───────────┘ │
│                                                                 │
│   Persistent footer: · No audio recorded · zero retention      │
└────────────────────────────────────────────────────────────────┘
```

For Personal users, the flanking panels are hidden — only the hero column appears.

## 5.3 The components

### 5.3.1 The State Pill

Top of every conversation screen. Five states, distinct visual variants:

| State | Visual | Animation |
|---|---|---|
| Idle | neutral grey dot, "Idle" label | none |
| Listening | emerald dot, "Listening" label | 1.5s pulse on the dot |
| Thinking | amber dot, "Thinking…" label | three-dot pulse staggered 200ms |
| Whispering | full amber background pill, black text, "Whispering in your ear" | single soft outward pulse every 1.8s |
| Paused | neutral grey dot, "Paused" label | none |

The pill is the user's only anchor for AI state. Everything else flows from it.

### 5.3.2 Their Last Utterance

Shown directly under the state pill in dim italic 14pt. Maximum two lines, truncated with ellipsis. Fades to 60% opacity once a new utterance arrives.

### 5.3.3 The Suggestion Card

The hero unit of the entire product. Amber background `#F5A524`, black text, 20px corner radius, 24px padding, no border, no shadow.

Inside:
- 10pt uppercase amber-on-black eyebrow ("SAY NEXT")
- 28pt suggestion line at 1.2 line-height, weight 600, tracking -0.005em
- 14pt follow-up hint in 70% opacity black ("then: ___")
- Three buttons at the bottom: Used / Skip / Different (each 12pt tile, 12px corner radius, 8px padding)

Beneath the card, three keyboard hints in mono small grey: `← cycle  ↺ regenerate  ⏎ accept`.

### 5.3.4 Speaker Timeline

Horizontal strip showing last 60 seconds of audio segmented by speaker. Two colors: you (amber-50, low saturation) and them (azure-50). Each segment is a soft-edged horizontal bar. Tooltip on hover shows the transcript for that segment.

This is the visual proof that diarization works.

### 5.3.5 Realtime Waveform

When the state pill is in "Whispering" state, a 24-bar amber waveform appears between the suggestion card and the speaker timeline, animating to actual audio amplitude at 60fps. Idle waveform sits at ~10% height with a 1200ms ease-in-out gentle wave — like still water.

### 5.3.6 Confidence Indicator (Teams)

Thin horizontal bar beneath the suggestion card. Amber fill width = confidence percentage. When confidence < 60%, the suggestion text shifts to white-on-canvas instead of black-on-amber, indicating the AI is *less certain* about this one.

### 5.3.7 Emotion Indicator

Small chip in the upper-right of the hero column: a horizontal bar with two segments showing prospect sentiment (warming / cool / hostile) and speech intensity (calm / engaged / heated). Updates every 5 seconds. This is V2 — not in MVP.

### 5.3.8 Interruption Detection

When the user starts speaking mid-whisper:
- AbortSignal fires immediately
- LLM stream cancels
- Audio playback stops within 200ms
- Suggestion card fades to 60% opacity over 200ms
- State pill flips to "Listening" with no animation lag
- Transcript continues word-streaming for the user's own audio

### 5.3.9 Latency Indicator

Brand callsign: small amber-dot prefix + mono digits + ms suffix. Examples: `· 412ms`, `· 287ms`. Always visible on the source attribution panel (Teams) or as a tiny footer element (Personal). The user learns to associate this glyph pattern with the brand.

### 5.3.10 Contextual Coaching Cards (Teams)

Right rail. Above source attribution: a small "Coaching card" that appears when the AI detects a pattern worth flagging mid-call:
- *"You've talked for 87 seconds straight. Consider a question."*
- *"The prospect just mentioned a buying signal."*
- *"Acknowledge the objection before pivoting."*

Cards dismiss with one click. Coaching cards are deliberately rare — at most one per 3 minutes — so the user doesn't habituate.

## 5.4 Deal Context Panel (Teams)

Left rail. Vertical stack of context tiles pulled from CRM at session start:
- Company tile: name, employee count, funding stage, industry.
- Last touch tile: type of last interaction + timestamp.
- Buying signals tile: AI-detected patterns from this and previous calls.
- Sentiment tile: directional indicator.

Each tile is dismissible. Panel collapses with Cmd+. for focus mode.

## 5.5 Source Attribution Panel (Teams)

Right rail. Above the coaching cards: the source of the current suggestion.
- Playbook reference (which uploaded document, which chunk, which version)
- Performance metric ("2.3× higher close rate when used")
- Author + last updated by manager

This panel makes the suggestion auditable. Managers can trace any whisper back to its origin in the company's knowledge base.

## 5.6 Persistent Privacy Footer

Tiny shield glyph + "No audio recorded · zero retention mode." Always visible at the bottom of the screen.

## 5.7 The states in motion

Walk-through of one turn:

```
T+0.000s  Other speaker stops talking. Audio frames continue arriving.
T+0.250s  Diart confirms end-of-turn. ElevenLabs sends transcript.
T+0.260s  State pill flips to "Thinking…" with amber three-dot pulse.
T+0.300s  Orchestration assembles prompt. LLM call begins.
T+0.580s  First LLM token arrives. State pill stays in "Thinking…" until
          first audio byte returns from TTS.
T+0.620s  TTS audio first byte received. State pill blooms to "Whispering."
T+0.640s  Suggestion card blooms (96→100% scale, opacity rise, amber lock-in).
          Word stream begins rendering the suggestion text at speech cadence.
          Waveform appears at the bottom of the hero column, pulses to audio.
T+0.840s  Audio reaches the user's AirPod.
T+3.100s  Audio playback completes. Waveform fades. State pill returns to
          "Listening" (emerald pulse).
T+3.300s  Suggestion card remains on screen at full opacity, ready for the
          user to accept, dismiss, or cycle.
```

If the user interrupts (starts speaking) at any moment between T+0.260s and T+3.100s, the cancellation cascade fires within 200ms. The suggestion card fades to 60%, the audio cuts, the state pill flips back to "Listening."

This sequence is the entire promise of the product. Every other screen exists to set this one up.

---

# 6. Motion Design System

## 6.1 Animation philosophy

Motion is not decoration. It is the primary medium through which the product communicates aliveness, intelligence, and pace.

Five rules:

1. **Every animation has a state purpose.** It communicates *what just happened* or *what is currently happening.* Decorative animation is forbidden.
2. **Default to fast.** 240ms is the standard. 80ms for direct manipulation. Going slower than 360ms requires justification.
3. **One signature motion per moment.** When the suggestion card blooms, nothing else animates. When the state pill changes, the suggestion card holds still. Choreography is achieved by sequencing, not by simultaneous motion.
4. **Motion respects reduced motion.** `prefers-reduced-motion: reduce` removes the breath, replaces the bloom with a fade, replaces the word stream with a single appearance. Tested on every screen.
5. **Motion costs frames.** Every signature animation must hold 60fps even on a 5-year-old MacBook. We use `transform` and `opacity` (GPU-accelerated). We never animate `width`, `height`, `top`, or `left` outside of layout-shift contexts.

## 6.2 Transition timing table

| Token | Duration | Easing | Use |
|---|---|---|---|
| `motion/instant` | 80ms | ease-out | Button press, toggle, hover ink |
| `motion/quick` | 150ms | cubic-bezier(0.4, 0, 0.2, 1) | Hover state, focus ring |
| `motion/standard` | 240ms | cubic-bezier(0.4, 0, 0.2, 1) | Card transition, dropdown, panel expand |
| `motion/deliberate` | 360ms | cubic-bezier(0.32, 0.72, 0, 1) | Section reveal, modal open |
| `motion/cinematic` | 640ms | cubic-bezier(0.16, 1, 0.3, 1) | Scene change, dashboard ↔ marketing transition |
| `motion/breath` | 2000ms | cubic-bezier(0.45, 0.05, 0.55, 0.95) | Ambient idle pulse |
| `motion/wave` | 4000ms | cubic-bezier(0.45, 0.05, 0.55, 0.95) | Slow waveform when AI is idle |

## 6.3 Hover behavior

Hover exists on desktop only. The hover state uses *one* of three signals, never combined:
- 20% lighter border (containers)
- 4px rightward translation of trailing arrow (CTAs)
- 6% lighter background fill (table rows)

Hover transitions are 150ms ease-out. Slow hover signals an underpowered product.

## 6.4 AI response animations

The four signature motions:

**Signature 1 — The breath.** A 2000ms canvas brightness shift in listening state. Every surface in the live screen pulses in phase. Implemented as a CSS variable on `:root` driven by one shared requestAnimationFrame loop. Always-on during live sessions. Disabled in `prefers-reduced-motion`.

**Signature 2 — The whisper bloom.** The suggestion card's appearance. Starts at 96% scale, 0.3 opacity. Expands to 100% scale, full opacity over 320ms with slight overshoot (cubic-bezier hits 1.02 before settling). Amber background animates from 0 to full saturation 80ms after the card appears — text is briefly readable on a pale background before amber locks in. Effect: the suggestion feels *spoken into existence.*

**Signature 3 — The word stream.** Live transcript renders word-by-word. Each word fades in over 80ms with a 2px upward translation. Cadence: 180-220 WPM, calibrated to actual ASR token rate. Words older than 8 seconds drop to 75% opacity, fading into the background rather than scrolling away.

**Signature 4 — The thinking dots.** Three amber dots under the state pill. Staggered pulse: dot 1 from 40% → 100% at t=0, dot 2 at t=140ms, dot 3 at t=280ms. All return to 40% by t=600ms. Loops until first LLM token arrives. This is the *only* loading animation in the entire product. We never use spinners.

## 6.5 Waveform movement logic

Waveform behavior changes by state:
- **Idle.** 24 vertical bars at ~10% height. 1200ms ease-in-out gentle horizontal wave traveling left-to-right at 1 bar per 50ms. Like still water.
- **Listening.** Bars respond to actual audio amplitude at 60fps. No latency. Looks like the user's audio.
- **Whispering.** Bars respond to TTS audio amplitude. Amber saturation amplifies (vs the muted amber of idle).
- **Paused.** Bars freeze at last amplitude, then fade to 40% opacity over 400ms.

The waveform never "stops" — even in idle it has the gentle traveling wave. This is the visual heartbeat.

## 6.6 Realtime pulse systems

Two ambient pulses run continuously when the product is in a live state:

**Pulse 1 — Canvas breath.** Per Signature 1.

**Pulse 2 — Dot pulse.** State pill dot pulses every 1500ms (listening state) or 1800ms (whispering state). Synchronized with the canvas breath — they share a parent timer.

These pulses are visible but not consciously noticed. They create the feeling that the product is *alive*.

## 6.7 Section reveal choreography

On the marketing site, sections reveal as they enter the viewport. Choreography rules:

1. **Threshold: 30%** — section starts animating when 30% of its height enters the viewport.
2. **Default reveal:** elements fade in (opacity 0→1, 360ms) and translate up 16px (cubic-bezier(0.16, 1, 0.3, 1)).
3. **Stagger:** when multiple elements reveal in the same section, they stagger 80-160ms based on density. Headlines first, body second, CTAs last.
4. **Reveal once.** Sections don't re-animate when scrolled back into view. Use IntersectionObserver with `unobserve` on first reveal.

## 6.8 Cinematic scroll pacing

The landing page has no scroll-snap and no scroll-jacking *except* for one section: the pinned five-step loop on /copilot (Apple-style horizontal pin). Everywhere else, scroll is uninterrupted. The user's hands stay on the trackpad.

Scroll speed expectations:
- Standard reader takes ~5 seconds to scroll through one full-screen section.
- Hero reveal happens within the first 2 seconds of arrival.
- Most scenes (Sections 4-9) reveal completely in 1.5 seconds of viewport entry.

## 6.9 Loading and skeleton states

**Skeletons.** `#1A1A1E` rectangles with a 2000ms left-to-right shimmer (linear gradient at 70% opacity). Shimmer is the *only* skeleton animation. Skeletons match exact dimensions of content they replace — never generic blocks.

**Inline loading.** LLM streaming uses a cursor-tail pattern: 2px-wide amber vertical line blinking at 1.4s, follows last character. Fades over 200ms when stream ends.

**Empty states.** Hairline glyph above a single sentence prompt and a primary CTA. Never an illustration with a sad cloud. The brand at its most disciplined.

---

# 7. Visual System

## 7.1 Typography hierarchy

**Type families:**
- **Display** — Söhne (paid license) or Inter Display fallback
- **UI** — Inter (variable, weights 400 / 500 / 600 / 700)
- **Mono** — JetBrains Mono (timings, IDs, code only)

**Type scale (modular at ~1.333):**

| Token | Size / line / weight / tracking | Use |
|---|---|---|
| `display/3xl` | 88 / 0.95 / 800 / -0.045em | Landing hero |
| `display/2xl` | 64 / 1.0 / 800 / -0.04em | Section opener |
| `display/xl` | 48 / 1.05 / 700 / -0.03em | Sub-section opener |
| `display/lg` | 40 / 1.1 / 700 / -0.025em | Page title |
| `display/md` | 32 / 1.15 / 700 / -0.02em | Card title |
| `text/xl` | 24 / 1.3 / 500 / -0.005em | Lead paragraph |
| `text/lg` | 20 / 1.4 / 500 / -0.005em | Subhead, suggestion card |
| `text/base` | 16 / 1.5 / 400 / 0 | Body |
| `text/sm` | 14 / 1.5 / 400 / 0 | Secondary body, dense UI |
| `text/xs` | 12 / 1.5 / 500 / 0 | Captions, helper text |
| `label/sm` | 11 / 1.4 / 600 / +0.12em uppercase | Section labels, eyebrows |
| `label/xs` | 10 / 1.3 / 700 / +0.15em uppercase | Pills, badges, dashboard headers |
| `mono/lg` | 24 / 1.0 / 500 / -0.01em | Metric numbers |
| `mono/sm` | 13 / 1.4 / 400 / 0 | Latency, IDs |

**Rules:**
- Body text on dark canvas: 95% white (#F5F5F7). Pure white is harsh and dates the design.
- Mono reserved for *facts* — latency, durations, IDs. Never for prose.
- Italics are used in marketing prose at most twice per page. Never in product UI.

## 7.2 Spacing rhythm

Base unit: 4px. Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128, 160.

Marketing section padding: 96-128px top/bottom (large) or 64-80px (compressed). Application section padding: 24-40px.

Container max: 1180px marketing, fluid up to 1680px application.

Grid: 12 columns, 24px gutter. Spans of 4 / 6 / 8 / 12 common. 5 / 7 / 11 forbidden.

## 7.3 Color palette

| Token | Hex | Use |
|---|---|---|
| `canvas/dark` | `#0A0A0B` | App page canvas |
| `surface/dark` | `#131316` | App container surface |
| `elevated/dark` | `#1A1A1E` | Cards, dropdowns, modals |
| `hairline/dark` | `#25252A` | Border, divider |
| `glass/dark` | `rgba(20, 20, 24, 0.72)` | Floating overlays |
| `canvas/light` | `#FAF8F3` | Marketing page canvas (warm cream) |
| `surface/light` | `#FFFFFF` | Marketing cards, nav pill |
| `hairline/light` | `#E8E5DC` | Marketing border |
| `text/primary-dark` | `#F5F5F7` | Body on dark |
| `text/primary-light` | `#0A0A0B` | Body on light |
| `text/secondary-dark` | `#9B9BA3` | Labels on dark |
| `text/secondary-light` | `#5C5C66` | Labels on light |
| `text/muted-dark` | `#5C5C66` | Disabled on dark |
| `accent/amber` | `#F5A524` | AI signal · CTAs in product |
| `accent/amber-soft` | `rgba(245, 165, 36, 0.14)` | Active state backgrounds |
| `live/emerald` | `#10B981` | Live, connected, recording |
| `risk/coral` | `#F26D5B` | Risk flag, missed objection |
| `info/azure` | `#5B8FF9` | Info badge, marketing link |
| `marketing/ink` | `#0A0A0B` | Marketing primary CTA on light |

**Rules:**
- No screen displays more than three of {amber, emerald, coral, azure} simultaneously.
- Amber is reserved for AI state. Using it decoratively dilutes the signal.
- Emerald is for *temporal* live states only. Never for "success."
- Coral is rare. A dashboard with 30 metrics shows coral on at most 1-2.

## 7.4 Card systems

**Marketing card.** Light surface, hairline border, 16px corner radius, 32px padding. Hover: border-color +20% lightness, CTA arrow translates +4px right, 200ms ease-out.

**Dashboard table row.** Bottom hairline only. Hover: row background `rgba(255,255,255,0.02)` instant. Click: jumps to detail.

**Suggestion card.** Amber background, black text, 20px corner radius, 24px padding, no border, no shadow. (Full spec in 5.3.3.)

**Glass panel.** `rgba(20, 20, 24, 0.72)` over 24px backdrop blur. Hairline border `rgba(255, 255, 255, 0.06)`. 20px corner radius. Used for floating overlays only.

**Metric tile.** 1px hairline border, 20px padding, 16px corner radius. Stack: label (11pt uppercase tracked), value (large mono or display), delta (12pt with arrow).

## 7.5 Dashboard panels

Sidebar: 240px wide, dark surface `#131316`, hairline right border.

Top bar: 56px tall, dark surface, hairline bottom border.

Main content area: dark canvas `#0A0A0B`, 32px padding.

Panel internal structure:
- 24px padding inside panels
- 20px gap between panels in vertical stacks
- 32px gap between major sections within a panel

## 7.6 Border treatments

- 1px hairline. Never thicker.
- Border-color follows surface tier (canvas borders are `#25252A`, surface-level borders are `#2A2A30` etc.).
- Top-of-card colored stripe (3px) used to category-code cards in dashboards (purple for AE, blue for SE, etc.). Used sparingly.

## 7.7 Shadows

- Dark mode: no shadows. Depth is communicated by surface-color shift.
- Light mode marketing: `0 30px 80px rgba(0,0,0,0.06)` for elevated cards. Large, diffuse, never visible as a literal shadow — reads as "this card is closer."

## 7.8 Gradients

Used sparingly. Three legitimate uses:
- Hero background ambient gradient (radial, very soft).
- Glass-panel inner gradient (subtle vertical fade for depth).
- CTA-strip canvas shift (cream → near-black for the "land moment" on the landing page).

Forbidden: gradient text, gradient buttons, "shiny" gradients.

## 7.9 Graph styles

**Data visualization rules:**
- Hairline (1px) lines, never thicker.
- Two colors max per chart (you / them; us / market; this period / last period).
- Numbers in mono, always.
- Annotations (callouts) in italic text, low opacity.
- No 3D effects, no shadows on chart elements, no gradient fills.
- Animations on load: lines draw left-to-right over 800ms.

**Chart types in use:**
- Line chart (talk ratio trends, sentiment over time).
- Sparklines (per-row in tables).
- Bar chart (rare — only for categorical comparisons).
- Donut chart (only for win/loss outcome distributions).
- Heatmap (rep × week activity).

No pie charts. No 3D charts. No exotic chart types.

## 7.10 Iconography

Custom hairline icon family. 16/20/24px optical sizes. 1.5px stroke, rounded line caps, never filled (except status dots).

Lucide as foundation. Replace any icon that looks generic with a custom variant.

Signature icons (custom-drawn):
- **The whisper** — soft chevron-shaped wave from a single point.
- **The ear** — minimal circle with single inward tick.
- **The voice** — V monogram with two ambient ticks above suggesting sound waves.

---

# 8. Mobile Experience

## 8.1 Mobile UX philosophy

Mobile is *not* a scaled-down desktop. It is a parallel product designed for phone in pocket, AirPods in ear, glance use.

Five rules:

1. **One screen, one task.** No bottom-tab navigation that switches context mid-call. The live screen owns the entire viewport.
2. **Thumb-zone CTAs.** All primary actions in the bottom 30% of the screen.
3. **Larger type than desktop.** Body 16pt minimum. Suggestion text 28pt. Arm's-length reading distance.
4. **Native gestures.** Swipe left = next suggestion. Swipe down = dismiss. Long press = tone modifier. Three-finger tap = pause Vought.
5. **No keyboard ever in live mode.** The user should never need to type during a live call.

## 8.2 Mobile dashboard logic

Compressed three-zone layout. Same architecture as desktop but vertical-only:
- Hero card top: "Up next" or "Live now."
- Metric strip: 2×2 grid instead of 4-row.
- Recent sessions: vertical list, not table.
- Analytics: hidden on mobile (V1 — managers do that on desktop).
- Settings: standard iOS-style sectioned list.

## 8.3 Live mobile call screen

Full-screen, edge-to-edge. Vertical stack:
- State pill at very top (small).
- Their last utterance (dim, 14pt italic).
- Suggestion card (occupies middle 50% of screen, 28pt suggestion text).
- Speaker timeline at bottom.
- End button below speaker timeline.

Background: subtle radial gradient from canvas to slightly warmer amber-tinted black, breathing at the 2000ms signature rhythm.

iOS status bar stays visible. We don't hide system chrome.

## 8.4 AirPods choreography

OS-level AirPods integration:

| Gesture | Action |
|---|---|
| Single tap | Summon a suggestion (push-to-summon mode) |
| Double tap | Accept current suggestion (marks "Used") |
| Triple tap | Skip current suggestion / generate another |
| Long press (hold) | Pause Vought. Release to resume. |

Configurable in Settings. Hints shown as small icon glyphs at top of live screen.

## 8.5 Realtime mobile whisper UX

Audio routing rules — these matter more than visual design on mobile:

- Vought audio never plays through phone speaker. If AirPods disconnect mid-session, audio mutes and a banner appears: *"AirPods disconnected — text only."*
- Independent volume control via custom Control Center widget.
- Default routing: left AirPod only. Whisper plays in the left ear, leaving the right ear for the human conversation. This is the most important detail in the entire mobile experience.
- Stereo mode available in Settings for users who prefer both ears.

## 8.6 Compact conversation interface

Two compact modes:

**Glance mode.** Phone locked, screen off, watch shows current suggestion in a complication. Tap the watch to acknowledge. Available for Apple Watch + Wear OS.

**Lock-screen mode.** Live activity / Dynamic Island on iOS shows current state pill and a one-line preview of the latest suggestion. Expandable on tap.

## 8.7 Adaptive layouts

Breakpoints:
- Mobile: ≤ 640px — single column, full-bleed UI.
- Tablet: 641-1024px — single column with margin, sidebar collapsed.
- Desktop: ≥ 1025px — full layout.

The breakpoint behavior is *layout migration*, not just scaling. Elements move, hide, or merge.

## 8.8 Mobile gesture system

| Gesture | Live screen | Dashboard |
|---|---|---|
| Swipe left | Cycle to next suggestion | Open next call in list |
| Swipe right | Re-show previous suggestion | Open previous call |
| Swipe down | Dismiss current suggestion | Refresh data |
| Long press | Tone modifier menu | Multi-select for batch ops |
| Three-finger tap | Pause Vought | n/a |
| Pinch | n/a | Zoom waveform timeline |

---

# 9. Differentiation Strategy

How Vought visually and strategically differs from each competitor. Each section identifies the competitor's identity, then describes our deliberate opposition.

## 9.1 vs Observe.ai

**Their identity.** Enterprise-soft. Blue-gradient backgrounds, friendly illustrations, prosumer-quality typography. "Trust us, we're friendly."

**Our opposition.** Enterprise-serious. Near-black canvas, mono numerics, no illustrations, display typography. "Trust us, we're operating."

**Strategic move.** We out-elevate Observe.ai by treating the product as *operating equipment* rather than B2B SaaS. Their aesthetic is comforting; ours is composed.

## 9.2 vs Gong

**Their identity.** Revenue-tech. Heavy data visualizations, sales-funnel iconography, Salesforce-adjacent design language. The brand is conversion analytics.

**Our opposition.** Voice-AI-first. Every visual rooted in waveforms, listening states, conversation timelines. Analytics is an *output* of the conversation product, not the other way around.

**Strategic move.** We are not competing with Gong on dashboards. We are reframing the category — the conversation is the product, the analytics are downstream.

## 9.3 vs Cresta

**Their identity.** Corporate enterprise. Blue CTAs, two-tier nav with utility bar, clean but generic SaaS layout.

**Our opposition.** Architected. Single floating nav pill, amber-only accent, deliberate cinematic transition from marketing to product.

**Strategic move.** Cresta is competent. We are category-defining. The visual difference signals the strategic difference — Cresta is a tool, Vought is a platform.

## 9.4 vs Bland AI / Retell AI / Vapi

**Their identity.** Developer tools. API-first landing pages, code snippets above the fold, terminal-style aesthetics.

**Our opposition.** Product-first. The API lives on /docs. The home page shows the human-facing product. Vought is a *product company* that happens to expose an API.

**Strategic move.** We monetize the product surface (Copilot, Receptionist). They monetize the infrastructure. Different market position, different design.

## 9.5 vs Cluely / Final Round AI

**Their identity.** Provocative consumer. "Cheat on everything" energy, screen-overlay aesthetics, edge-of-controversy branding.

**Our opposition.** Professional serious. Language is operational ("close the deal," "guide the conversation") not adversarial ("cheat the system"). We never go near the cheat framing.

**Strategic move.** Cluely's brand poisoned the enterprise channel. We are positioned to win the enterprise revenue Cluely cannot touch.

## 9.6 Design-hero credit

We learn from Linear, Cursor, Granola, Stripe — but Vought's signature *waveform-and-amber-on-near-black* visual identity is ours alone. The breath animation, the suggestion bloom, the word stream, and the speaker timeline together constitute a visual language no other product owns.

## 9.7 The futuristic differentiation

Why will Vought feel more futuristic than every competitor?

**1. The product is invisible.** No chatbot, no AI avatar, no persistent panel. The AI shows up *only when it has something to say*. Every other product in the category puts the AI in a sidebar. We put it in the ambient layer.

**2. The interface listens, not reads.** Most products in the category are dashboards reading data. Our product hears speech and renders it word-by-word in real time. The visual grammar of the entire UI is built around the listening act.

**3. The numerics are the brand.** Latency in mono. Times in mono. Counts in mono. When the user sees `· 412ms`, they know it's Vought. No other product makes its latency a visual signature.

**4. The motion is restrained.** Everyone else animates everything. We animate four things, signature-grade. The restraint *is* the futurism — the future is calm.

**5. The product is operating equipment.** It does not look like SaaS. It looks like what a sales rep at OpenAI Inference Lab would use. The aesthetic borrows from the bridge of a starship, not the marketing site of a marketing tool.

## 9.8 The emotional differentiation

Why will Vought feel more emotionally intelligent than every competitor?

**1. We acknowledge the operator's vulnerability.** First-time users are anxious. Our onboarding is short, calm, and never asks them to perform. Compare to Cluely's onboarding, which assumes the user is performing a heist.

**2. We trust the user.** We don't gamify. We don't show streaks. We don't push notifications. The user is a professional. We treat them as one.

**3. We make the AI a co-pilot, not a hero.** Vought never says "great suggestion!" or celebrates itself. The user is the hero. The AI is the room.

**4. We are transparent about limits.** The confidence indicator shows when the AI is uncertain. The source attribution shows where the suggestion came from. Vulnerability builds trust.

**5. We respect silence.** During quiet moments in a conversation, the AI stays quiet. It is the *only* AI product in the category designed to know when to shut up.

---

# 10. Implementation Roadmap for AI Agents

This roadmap is the canonical execution plan for Claude Code implementation agents. It is structured as seven phases, executed in order. Each phase has explicit goals, visual priorities, interaction goals, complexity rating, and dependencies. Skip a phase and the next one breaks.

## Phase 1 — Design system foundation (2 days)

**Goals.**
- Implement design tokens (color, type, spacing, motion) as a shared library.
- Set up Tailwind config + custom CSS variables for runtime theming.
- Establish the font loading strategy (Söhne or Inter Display, subsetted).
- Build foundational layout primitives: container, grid, stack, cluster.
- Set up the breath animation as a shared timer.

**Visual priorities.**
- Pixel-perfect typography scale across every weight and size.
- Color tokens accessible via CSS variables.
- Spacing primitives that compose into 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128.

**Interaction goals.**
- Focus ring tokens.
- Hover transition tokens.
- Press scale (transform: scale(0.96), 80ms).

**Complexity.** Low. But every later phase depends on this being right.

**Dependencies.** None.

**Acceptance criteria.**
- Storybook (or similar) renders every typography token in both light and dark canvas.
- Every color token has an automated contrast check against WCAG AA on the canvas it sits on.
- Breath animation phase-syncs across multiple components rendered in the same view.

**Deliverables.**
- `tokens.css` or `theme.ts` — single source of truth for tokens
- `tailwind.config.ts` — extends with the token system
- `primitives/` — Container, Grid, Stack, Cluster, Spacer
- `motion.ts` — exports timing constants and signature animation hooks

---

## Phase 2 — Landing page (3 days)

**Goals.**
- Build the public landing page (`/`) per Section 3 storyboard.
- All twelve scenes shipped, scroll choreography wired.
- Mobile responsive at every breakpoint.
- Performance budget: under 100KB JS, under 30KB CSS, LCP < 1.2s on 4G.

**Visual priorities.**
- Hero dashboard preview animation must drive the page's "wow."
- Cresta-style nav pill, exact spacing per spec.
- Customer logo strip pixel-aligned.
- Three pillar cards with the dark Copilot card as visual anchor.
- The canvas-shift CTA strip must be the page's strongest visual moment.

**Interaction goals.**
- Mega menu opens on hover with 120ms delay.
- Section reveals on viewport entry (IntersectionObserver, threshold 30%, fire once).
- Live demo block plays muted with "Tap to hear" overlay.
- All CTAs at 96% scale on press.

**Complexity.** Medium. Twelve sections, each with bespoke choreography.

**Dependencies.** Phase 1 complete.

**Acceptance criteria.**
- Lighthouse Performance score ≥ 95.
- All twelve scenes verified at 1440px, 1280px, 768px, 375px breakpoints.
- Reduced-motion fallback works: no breath, no bloom, no word-stream.
- Mega menu accessible via keyboard.

**Deliverables.**
- `app/page.tsx` (or equivalent) — full landing
- `components/marketing/` — Hero, Pillars, LiveDemo, Architecture, CustomerStory, Trust, CTAStrip, Footer
- `components/motion/` — RevealOnScroll, CountUp, WordStream (marketing variant)

---

## Phase 3 — Product pages (3 days)

**Goals.**
- Build /copilot, /receptionist, /platform per Section 4 specs.
- Build /pricing, /security, /about, /customers per spec.
- Build /blog index + /blog/[slug] template.
- Build /careers, /contact, /changelog.

**Visual priorities.**
- Copilot's pinned five-step loop section — Apple-style horizontal scroll-jacking. This is the signature interaction of the page.
- Receptionist's live phone-call demo — published phone number, real call demo.
- Platform's interactive architecture diagram.
- Pricing's comparison table with honest "no" marks.
- Security's trust certifications grid.

**Interaction goals.**
- /copilot pinned section: scroll position drives horizontal scroll inside section. Falls back to vertical on mobile.
- /receptionist: real phone integration via Twilio. Session code on screen syncs with browser via WebSocket.
- /platform: Three.js architecture diagram lazy-loaded after fold.
- /pricing: monthly/annual toggle animates with amber underline migration.

**Complexity.** Medium-high. The Copilot scroll-jacked section is the technical challenge.

**Dependencies.** Phases 1-2.

**Acceptance criteria.**
- Each product page Lighthouse ≥ 90.
- Copilot scroll-jacked section works on Safari, Chrome, Firefox.
- /receptionist demo number actually works.
- /platform diagram is keyboard navigable.

**Deliverables.**
- All product / marketing pages
- Reusable components: ProductHero, FeatureGrid, PinnedScrollLoop, PhoneDemo, PricingTable, SecurityGrid

---

## Phase 4 — Dashboard framework (2 days)

**Goals.**
- Build the app shell: sidebar, top bar, content area.
- Build /app overview page.
- Build /calls list page.
- Wire up authentication, route protection.
- Implement command palette (⌘K).

**Visual priorities.**
- Sidebar collapses to icon-only below 1280px viewport.
- Top bar is sparse — breadcrumb + ⌘K + notifications + help.
- Dashboard three-zone layout per spec.
- Metric tiles count up on load.

**Interaction goals.**
- ⌘K opens command palette from anywhere in app.
- Cmd+\ toggles sidebar.
- All table rows are keyboard-navigable.
- Row hover state: 6% lighter background, instant.

**Complexity.** Medium.

**Dependencies.** Phases 1-3.

**Acceptance criteria.**
- Command palette searches across navigation, actions, and content.
- Sidebar state persists across navigations.
- Dashboard renders under 200ms first paint after authentication.

**Deliverables.**
- `app/(app)/layout.tsx` — app shell
- `components/app/Sidebar.tsx`, `TopBar.tsx`, `CommandPalette.tsx`
- `app/(app)/page.tsx` — overview
- `app/(app)/calls/page.tsx` — list

---

## Phase 5 — Realtime interfaces (4 days)

**Goals.**
- Build the live conversation screen (`/live/[sessionId]`) — *the hero*.
- Wire up ElevenLabs Speech Engine WebRTC.
- Wire up diart sidecar WebSocket parallel stream.
- Implement state pill, suggestion card, speaker timeline, word stream.
- Build /calls/[id] post-call review.

**Visual priorities.**
- Suggestion card bloom (Signature 2) — pixel-perfect overshoot curve.
- Word stream (Signature 3) — paced to actual ASR cadence, never faked.
- State pill transitions — five states, distinct visuals, no flicker.
- Speaker timeline — accurate to diart's emitted labels.
- Confidence indicator (Teams) — animated fill that updates smoothly.

**Interaction goals.**
- Keyboard: ← cycles to next suggestion, ↺ regenerates, ⏎ accepts.
- Cmd+. toggles focus mode (hide flanking panels).
- Long-press / hold opens tone modifier menu.
- Interruption: user starts speaking → AbortSignal → suggestion fades to 60% in 200ms.

**Complexity.** High. This is the technical centerpiece of the entire product.

**Dependencies.** Phases 1-4 plus backend (Echo Engine, diart, Speech Engine wired).

**Acceptance criteria.**
- End-to-end latency from end-of-turn to first audio byte in ear: ≤ 1200ms at p50, ≤ 1800ms at p95.
- Interruption cancellation: ≤ 200ms from user-speaking-detected to suggestion-faded.
- 60fps maintained on the live screen even with the breath, waveform, and word-stream running simultaneously.
- Reduced-motion mode disables all signature animations.

**Deliverables.**
- `app/(app)/live/[sessionId]/page.tsx` — the live screen
- `components/live/StatePill.tsx`, `SuggestionCard.tsx`, `SpeakerTimeline.tsx`, `WordStream.tsx`, `ConfidenceBar.tsx`, `DealContextPanel.tsx`, `SourceAttribution.tsx`
- `lib/elevenlabs.ts` — Speech Engine client wrapper
- `lib/diart.ts` — diarization sidecar client
- `lib/realtime-state.ts` — zustand or jotai store for session state

---

## Phase 6 — Animations and motion polish (2 days)

**Goals.**
- Layer in the four signature motions per spec.
- Polish all section reveals on marketing.
- Audit all transitions for timing consistency.
- Add ambient pulses (breath, dot pulse) across live screens.

**Visual priorities.**
- The breath must phase-sync across every surface in the live view.
- The whisper bloom must hit its overshoot peak exactly at 96% of the animation duration.
- The thinking dots must stagger precisely.
- The word stream cadence must match the ASR token rate ± 50ms.

**Interaction goals.**
- Every interactive element responds to hover within 150ms.
- Every press scales to 96% within 80ms.
- Scroll on marketing is never jacked except the Copilot pinned section.

**Complexity.** Medium. The work is QA-heavy.

**Dependencies.** Phases 1-5.

**Acceptance criteria.**
- Frame rate audit: every animated element holds 60fps on a 2020 MacBook Air.
- `prefers-reduced-motion` fallback verified on every screen.
- No animation is faster than 80ms or slower than 640ms outside of signature animations.

**Deliverables.**
- `lib/motion/breath.ts` — shared timer
- `lib/motion/bloom.ts` — suggestion card animation
- `lib/motion/word-stream.ts` — transcript renderer
- `lib/motion/thinking-dots.tsx` — loading indicator
- Motion QA report (manual + Lighthouse)

---

## Phase 7 — Optimization and polish (2 days)

**Goals.**
- Performance budget enforcement — every page within budget.
- Accessibility audit — WCAG 2.2 AA across every page.
- SEO baseline — sitemap, robots, meta tags, OG images.
- Final visual QA — pixel comparison against design spec.
- Pre-launch checklist.

**Visual priorities.**
- Every page hits LCP < 1.2s, CLS < 0.1, INP < 200ms.
- OG images render the product's signature visual identity for every marketing page.
- Favicon + app icon + Apple touch icon — V monogram in three sizes.

**Interaction goals.**
- Keyboard navigation complete across the entire product.
- Screen reader announces live transcript via aria-live="polite".
- Focus order on live screen: state pill → suggestion → cycle button → regenerate button → end session.

**Complexity.** Low individually, but breadth-heavy.

**Dependencies.** Phases 1-6.

**Acceptance criteria.**
- Lighthouse 95+ on every marketing page (Performance, Accessibility, Best Practices, SEO).
- axe-core / pa11y reports zero serious accessibility issues.
- All 404 / 500 / network-error states designed and rendered.
- Production deployment to staging environment.

**Deliverables.**
- Performance report (Lighthouse + WebPageTest)
- Accessibility report (axe + manual screen reader test)
- OG image generation pipeline
- 404 / 500 / loading state pages
- Pre-launch checklist completed

---

## Roadmap summary

Total estimated implementation: **18 days** at the spec quality described.

| Phase | Days | Complexity | Outcome |
|---|---|---|---|
| 1 — Design system | 2 | Low | Tokens, primitives, motion lib |
| 2 — Landing | 3 | Medium | The single most important marketing artifact |
| 3 — Product pages | 3 | Medium-high | Conversion surface |
| 4 — Dashboard framework | 2 | Medium | App shell + Overview + Calls |
| 5 — Realtime interfaces | 4 | High | The hero — live conversation |
| 6 — Animations | 2 | Medium | Motion polish |
| 7 — Optimization | 2 | Low (broad) | Production-ready |

Critical path: **1 → 2 → 4 → 5**. Phases 3, 6, 7 can parallelize with limited risk.

---

# Appendix

## A. Glossary

**Bloom** — the signature suggestion-card appearance animation (overshoot scale + opacity rise + amber lock-in).

**Breath** — the ambient 2000ms canvas brightness pulse on listening state.

**Echo Engine** — Vought's internal name for the backend orchestration layer.

**Speaker timeline** — the horizontal strip showing the last 60s of audio segmented by speaker.

**State pill** — the top-of-screen indicator for AI state (Idle / Listening / Thinking / Whispering / Paused).

**Suggestion card** — the amber hero unit displaying the AI's next-line suggestion.

**Voice clone** — the user's own voice rendered by ElevenLabs' cloning API, used as the TTS voice.

**Whisper** — the act of the AI speaking a suggestion into the user's earbud.

**Word stream** — the signature transcript animation where each word fades in at the cadence of speech.

## B. Performance budget

| Page type | JS | CSS | Fonts | LCP target | CLS target |
|---|---|---|---|---|---|
| Marketing | 100KB | 30KB | 200KB subsetted | 1.2s on 4G | < 0.1 |
| App shell | 240KB | 50KB | 200KB | 1.6s on 4G | < 0.1 |
| Live screen | + 80KB (lazy) | + 20KB | (cached) | 2s cold, 0.4s warm | < 0.05 |

End-to-end latency targets in product:
- p50 turn-to-whisper: ≤ 900ms
- p95 turn-to-whisper: ≤ 1400ms
- Interruption cancellation: ≤ 200ms

## C. Asset references

Hero loops (sourced or commissioned):
- Anthropic homepage loop (composition reference)
- Apple AirPods Pro 2 loop (motion reference)
- Anduril Lattice product video (mood reference)

3D / abstract assets:
- Spline or Three.js source files for the platform architecture diagram
- Rendered fallback WebP at 1× / 2× / 3×
- Static PNG fallback for `prefers-reduced-motion`

Customer logos:
- Hand-set in customer typeface
- Stored as inline SVG in `assets/customers/`
- Always rendered monochrome at 50% opacity

## D. Forbidden patterns

We never:
- Use stock photography or stock illustrations
- Use emojis in product UI (in marketing copy only at most twice per page, never in headlines)
- Show toast notifications celebrating user actions
- Display loading spinners (we use thinking dots, cursor tails, or shimmers)
- Use scroll-jacking outside the one Copilot pinned section
- Use drop shadows in dark mode UI (depth is communicated by surface color)
- Use a second accent color beyond amber
- Use "AI-powered" as an adjective in marketing copy
- Use the word "supercharge," "revolutionize," "10x," or "game-changer"
- Show recording / capture controls without explicit user invocation
- Render AI personas as avatars or characters
- Use 3D-effect charts, pie charts, or exotic data visualizations
- Use generic component library default styles (shadcn / Radix base styles) without restyling

---

## End

This document is the constitution. Every decision in implementation traces back to the seven principles, the four signature motions, the single accent color, and the two emotional tests. When in doubt, return to the test:

*Would a principal designer at Apple, a design lead at Stripe, a founding designer at Cursor, and a realtime AI systems architect all defend this choice in a review?*

If yes, ship it. If any one says no, redesign until they would.
