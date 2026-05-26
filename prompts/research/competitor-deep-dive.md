---
title: Competitor Deep Dive Prompt
audience: research subagent
inputs: competitor_name, competitor_url
intent: Produce a thorough competitive intelligence brief for a single competitor
---

Produce a competitive intelligence brief on $competitor_name (URL: $competitor_url).

Cover, with sources:
1. Product surface — what they actually ship, by surface (web, mobile, integrations)
2. Pricing — exact tiers, with annotation on what's in/out of each
3. Customers — named, with industry and seat counts where public
4. Funding + revenue — Crunchbase, public filings, leaked numbers, ARR estimates
5. Team — size, key roles, notable hires/departures
6. Tech stack — public job postings, engineering blog
7. GTM motion — sales-led vs PLG, channels, content strategy
8. The wedge — what is the ONE thing they do best
9. The gap — where they are weakest, what they refuse to build
10. Direct comparison to Vought — what we win, what they win

End with a recommendation: do we attack them head-on, position differently, or ignore?

Length: 1200-1800 words. Every claim cited.

Save the brief to vault/50 · Competitors/$competitor_name.md.
