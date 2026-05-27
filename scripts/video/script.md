# Vought · 90-Second Submission Video · Script

> ElevenLabs hackathon submission. Three-act narrative (`vault/10 · Strategy/Three-Act Narrative.md`).
> Every spoken line and overlay is brand-voice compliant (`vault/10 · Strategy/Brand Voice.md`):
> declarative, brief, specific, dry, quiet. No "AI-powered". No exclamation marks. Numbers in mono.
> Latency rendered as the brand callsign `· 412ms`.

## Voice

- **Voiceover voice_id:** `VU16byTywsWv5JpI8rbc` ("Ash — Calm, Soothing, Magnetic Narrative Male"), an ElevenLabs preset.
- **Known deviation:** the agent spec calls for the user's own cloned voice. No cloned voice exists in the account (premade + 2 library voices only). The user explicitly approved a preset. The product narrative still says "in your own cloned voice" — the preset narrates *about* the product; it does not claim to be the user's clone.
- Model: `eleven_multilingual_v2` (offline render, quality over latency). stability 0.55, similarity_boost 0.85.

---

## ACT 1 · The problem (0:00 – 0:14)

Dark canvas `#0A0A0B`. White display type, breath-paced, one line at a time. No UI.

**VO (act 1):**
> "Every important conversation in your life happens once. You don't get to rehearse."

Overlays:
- `Every important conversation happens once.`
- `You don't get to rehearse.`

---

## ACT 2 · The reveal (0:14 – 1:02)

Cut to the live call screen — the real product, canonical amber / canvas-dark.

**VO (act 2a) — over the bloom:**
> "Vought listens to your live conversation. It separates every speaker, understands the moment, and whispers the next line into your ear."

Visual: state pill `Listening` (emerald) → `Thinking` → blooms to `Whispering in your ear` (amber). Suggestion card blooms. Word stream renders the prospect's line. Speaker timeline shows two-color segments.

**VO (act 2b) — on the latency callsign:**
> "In under four hundred milliseconds. Built on the ElevenLabs Speech Engine."

Visual: tighten to the suggestion card and the `· 412ms` callsign in mono amber.

**VO (act 2c) — on the onboarding screen:**
> "Thirty seconds of recording. The voice you hear in your ear is yours."

Visual: `/onboarding/voice` — the brand passage, the armed record button, "Step 2 of 4".

---

## ACT 3 · The transformation (1:02 – 1:22)

Montage. Real marketing surfaces, canonical amber / canvas-dark.

**VO (act 3):**
> "TripleByte closed one point four million more last quarter. Suggestion acceptance tripled. The conversation goes the way it was always supposed to."

Visual:
- `/customers` hero + `· 412ms` callsign.
- TripleByte customer story (quote + metric tiles).
- Numbers card: `$1.4M · 3× · · 412ms`.

---

## OUTRO · The card (1:22 – 1:30)

Full-bleed canvas-dark. Wordmark center, tagline beneath, URL in mono amber. Holds ≥ 6 seconds.

**VO (outro):**
> "Vought. Intelligence for live conversations."

```
        V O U G H T

   Intelligence for live conversations.

            vought.com
```

---

## Full voiceover, verbatim (in order)

1. Every important conversation in your life happens once. You don't get to rehearse.
2. Vought listens to your live conversation. It separates every speaker, understands the moment, and whispers the next line into your ear.
3. In under four hundred milliseconds. Built on the ElevenLabs Speech Engine.
4. Thirty seconds of recording. The voice you hear in your ear is yours.
5. TripleByte closed one point four million more last quarter. Suggestion acceptance tripled. The conversation goes the way it was always supposed to.
6. Vought. Intelligence for live conversations.

Target runtime: 88–92 seconds. Each video shot is trimmed to its measured VO clip length plus breath hold (see `shotlist.md`).
