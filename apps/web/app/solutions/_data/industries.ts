/**
 * Industry solution data · the source of truth for /solutions/[slug].
 *
 * Every industry tells its own story: the vignette is a real-feeling
 * scenario, the earbud line is the physical integration, the elevenLabs
 * line names the ElevenLabs capability that lands hardest in that vertical,
 * and the capabilities are the four concrete things the operator gets.
 *
 * Slugs are stable — they appear in URLs and the nav menu. Don't rename
 * without redirecting.
 */

export interface Capability {
  title: string;
  body: string;
}

export interface IndustryEntry {
  slug: string;
  name: string;
  eyebrow: string;
  headline: string;
  subhead: string;
  vignette: {
    quote: string;
    attribution: string;
  };
  earbud: string;
  elevenLabs: string;
  capabilities: Capability[];
  /** Product this industry leans on most. Drives the CTA copy. */
  primaryProduct: 'copilot' | 'receptionist';
}

export const INDUSTRIES: IndustryEntry[] = [
  {
    slug: 'sales',
    name: 'Sales & Revenue',
    eyebrow: 'For revenue teams',
    headline: 'Close the deal in the call you’re on.',
    subhead:
      'Live whisper coaching that drops the right objection-handler, the right pricing answer, the right close — into your ear, in your own cloned voice.',
    vignette: {
      quote:
        'Second pricing call. The prospect says “we’re evaluating Gong.” Before I can answer, Vought has surfaced the comparison line that won the Acme deal last quarter. I say it. I sound like myself — because I am.',
      attribution: 'Account Executive · enterprise SaaS',
    },
    earbud:
      'AirPods Pro · invisible · the prospect never knows the AI is in the room.',
    elevenLabs:
      'Your cloned voice means the close doesn’t sound coached. The customer hears the rep they’ve been talking to all month — not a robot reading a script.',
    capabilities: [
      {
        title: 'Live objection handling',
        body: 'The objection is detected, the answer surfaces, you deliver it. End-to-end under 700 ms.',
      },
      {
        title: 'Pricing at the speed of thought',
        body: 'Discount approvals, term comparisons, edge-case pricing — referenced live without flipping to a tab.',
      },
      {
        title: 'Competitor positioning from your playbook',
        body: 'Vault your sharpest competitive lines once. They surface forever, in the words you wrote.',
      },
      {
        title: 'Auto-logged deals',
        body: 'Every call is summarized into the moments that mattered, pushed to your CRM, ready for the forecast review.',
      },
    ],
    primaryProduct: 'copilot',
  },
  {
    slug: 'customer-support',
    name: 'Customer Support',
    eyebrow: 'For support teams',
    headline: 'Every agent’s tier-2 brain, in their ear.',
    subhead:
      'Vought turns every tier-1 agent into a senior. The right escalation path, the right knowledge-base answer, surfaced live — in the agent’s own voice.',
    vignette: {
      quote:
        'The caller is on hold for a billing dispute that touches three systems. Before I finish reading the ticket, Vought has the refund policy clause, the prior resolution attempt, and the exact phrasing my lead used last week. I read it back like it was already in my head.',
      attribution: 'Tier-1 Support Agent · fintech',
    },
    earbud:
      'Plantronics-class headset · works inside your existing telephony stack (Twilio, Genesys, Five9, RingCentral).',
    elevenLabs:
      'Sub-300 ms TTS means the whisper arrives before the caller notices a pause. Zero-retention by default — transcripts vanish at session end. The agent stays in control.',
    capabilities: [
      {
        title: 'Live policy and KB lookup',
        body: 'The agent asks a follow-up, Vought has already pulled the relevant policy clause and the canonical answer.',
      },
      {
        title: 'Tone-of-voice coaching',
        body: 'The angry caller gets the calm-script line. The confused caller gets the simplified one. Same agent, right register.',
      },
      {
        title: 'Real-time escalation triggers',
        body: 'Vought flags the moment a call needs a supervisor — before the customer asks for one.',
      },
      {
        title: 'Automatic post-call summary',
        body: 'Disposition, resolution, follow-ups — written into the ticket the moment the call ends.',
      },
    ],
    primaryProduct: 'copilot',
  },
  {
    slug: 'healthcare',
    name: 'Healthcare',
    eyebrow: 'For clinicians',
    headline: 'The second opinion the clinician didn’t have to ask for.',
    subhead:
      'Whispered drug interactions, dosing reminders, and patient-history surfacing — without breaking eye contact with the patient.',
    vignette: {
      quote:
        'On rounds. The attending mentions a new prescription. Before I can flag it, Vought has surfaced the interaction note and the patient’s documented adverse reaction from 2024. I say “we should hold off on that new script” — without ever looking away from the patient.',
      attribution: 'Internal Medicine Resident · academic medical center',
    },
    earbud:
      'Discreet surgical-grade earbud · over-the-ear medical headset · works under PPE.',
    elevenLabs:
      'HIPAA-aligned: ElevenLabs retains nothing by default. We opted into retention_days = -1 at engine creation. The voice the clinician hears is their own — which matters when they’re relaying it to staff.',
    capabilities: [
      {
        title: 'Drug interaction live-check',
        body: 'Pulled from the moment a medication is named, cross-referenced against the patient’s active prescriptions and allergies.',
      },
      {
        title: 'Patient history surfacing',
        body: 'Last six months of relevant notes, lab trends, and adverse events — on demand, by voice.',
      },
      {
        title: 'Dictation while you talk',
        body: 'The conversation becomes the chart. Sign-off is review, not transcription.',
      },
      {
        title: 'On-call decision support',
        body: 'Whispered triage flowcharts and evidence summaries the moment the resident pages you.',
      },
    ],
    primaryProduct: 'copilot',
  },
  {
    slug: 'legal',
    name: 'Legal',
    eyebrow: 'For litigators and counsel',
    headline: 'Cite the case while you make the argument.',
    subhead:
      'For attorneys on depositions, hearings, and client calls — Vought whispers the precedent, the contract clause, the prior testimony.',
    vignette: {
      quote:
        'Mid-deposition. Opposing counsel hands the witness a 2019 email. I don’t remember the chain. Vought has already located it, identified the relevant excerpt, and whispered the line that contradicts the witness’s current statement. I ask the next question with confidence.',
      attribution: 'Litigation Associate · AmLaw 100 firm',
    },
    earbud:
      'Discreet attorney earbud · hidden under hair · battery rated for full-day proceedings.',
    elevenLabs:
      'Precision diction matters. ElevenLabs’ voice quality means case names and statutory citations come through unmangled. Zero-retention is the privilege-preserving default.',
    capabilities: [
      {
        title: 'Live case-law citation',
        body: 'A precedent is referenced; the holding and the cite appear in your ear before opposing counsel finishes the sentence.',
      },
      {
        title: 'Contract clause lookup',
        body: 'Section, sub-section, redline history — surfaced from your matter file in under a second.',
      },
      {
        title: 'Prior testimony cross-reference',
        body: 'Whatever the witness said in their deposition appears the moment they contradict it.',
      },
      {
        title: 'Time-sensitive objection support',
        body: 'Hearsay, leading, foundation — Vought flags the basis, you stand up and say it.',
      },
    ],
    primaryProduct: 'copilot',
  },
  {
    slug: 'real-estate',
    name: 'Real Estate',
    eyebrow: 'For agents and brokers',
    headline: 'Every comp, every objection, on the showing.',
    subhead:
      'Agents at the walk-through get the comparable sale, the school-district number, the property-tax history — whispered the moment the buyer asks.',
    vignette: {
      quote:
        'The buyer walks into the kitchen and says “this is tighter than the place on Oak.” Before I answer, Vought has the square-footage delta, the price-per-square-foot comp, and a line about the 2023 renovation. I say “actually, the layout works differently here — and the renovation is reflected in the price.” The buyer nods.',
      attribution: 'Listing Agent · luxury residential',
    },
    earbud:
      'AirPods Pro · mobile · works on the deck, in the garage, on the porch, in the car between showings.',
    elevenLabs:
      'Outdoor STT robustness handles wind, traffic, and the buyer’s kids. The cloned voice means the answer sounds like the agent the buyer has been touring with — not a real-estate chatbot.',
    capabilities: [
      {
        title: 'Live comparable sales lookup',
        body: 'MLS-grade comps surfaced by neighborhood, square footage, and time window — at the moment of the question.',
      },
      {
        title: 'School + tax data on demand',
        body: 'District ratings, recent tax history, HOA notes — the answers buyers ask in the hallway.',
      },
      {
        title: 'Renovation and permit history',
        body: 'What was done, when, by whom — surfaced by address. Inspections move faster.',
      },
      {
        title: 'Objection handler',
        body: 'The buyer pushes back on price; the rebuttal lands in your ear in the rep’s own voice.',
      },
    ],
    primaryProduct: 'copilot',
  },
  {
    slug: 'financial-services',
    name: 'Financial Services',
    eyebrow: 'For advisors and bankers',
    headline: 'Wealth conversations with the full book in your ear.',
    subhead:
      'Advisors get every position, every cost basis, every prior conversation surfaced live — without breaking the personal connection.',
    vignette: {
      quote:
        'A client calls about her late mother’s brokerage. She’s telling a story about the family. Vought has scanned the account, identified three concentration risks and one wash-sale window, and whispers the most important talking point. I listen, nod, and bring it up at the right moment — empathetically.',
      attribution: 'Senior Wealth Advisor · independent RIA',
    },
    earbud:
      'Discreet earbud · works in the office, at the country club, on the trading floor.',
    elevenLabs:
      'The cloned voice projects the calm, deliberate tone advisors are trained to use. Zero-retention keeps the conversation compliance-friendly by default.',
    capabilities: [
      {
        title: 'Position-level account surfacing',
        body: 'Holdings, allocations, concentration risks — pulled the second a security or account is named.',
      },
      {
        title: 'Tax-lot and cost-basis reference',
        body: 'The right lot, the right basis, the right wash-sale window — surfaced before the client asks.',
      },
      {
        title: 'Prior conversation recall',
        body: 'What you promised in March, what they pushed back on in July — in your ear as you reach for it.',
      },
      {
        title: 'Compliance prompts',
        body: 'Suitability language, required disclosures, fiduciary cues — whispered at the moments that matter.',
      },
    ],
    primaryProduct: 'copilot',
  },
  {
    slug: 'home-services',
    name: 'Home Services',
    eyebrow: 'For trades and field services',
    headline: 'Quote the job on site, every time.',
    subhead:
      'Contractors, plumbers, HVAC techs — get the right scope, the right parts list, the right price, whispered while the customer walks through the problem.',
    vignette: {
      quote:
        'I’m kneeling under the sink. The homeowner asks about replacing the disposal AND fixing the leak. Vought has the parts list, the labor estimate, and the upsell line about the dishwasher hose right next to me. I stand up, look the customer in the eye, and quote the whole job in 90 seconds. I get the deposit before I leave.',
      attribution: 'Master Plumber · regional services company',
    },
    earbud:
      'Rugged workplace headset · noise-canceling · works under sinks, in attics, on roofs.',
    elevenLabs:
      'Noisy-environment STT keeps working through power tools and HVAC hum. The cloned voice means a junior tech sounds as confident as the owner — because the script came from the owner.',
    capabilities: [
      {
        title: 'Live job scoping',
        body: 'The customer describes the issue, Vought outlines the scope — labor, parts, time.',
      },
      {
        title: 'Real-time pricing reference',
        body: 'Your pricebook, your margins, your discount tiers — whispered as you walk the job.',
      },
      {
        title: 'Upsell prompts',
        body: 'When adjacent work is detected — old fixtures, dated wiring, due-for-service equipment — the upsell line surfaces in your voice.',
      },
      {
        title: 'Quote-to-deposit in one visit',
        body: 'Auto-generate the proposal as you talk; collect the deposit on the truck tablet before the next stop.',
      },
    ],
    primaryProduct: 'receptionist',
  },
];

export const INDUSTRY_SLUGS = INDUSTRIES.map((i) => i.slug);

export function getIndustry(slug: string): IndustryEntry | undefined {
  return INDUSTRIES.find((i) => i.slug === slug);
}
