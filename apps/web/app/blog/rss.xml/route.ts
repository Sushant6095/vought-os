/**
 * /blog/rss.xml · RSS 2.0 feed for the Vought blog.
 * Served as a Next route handler so the "Subscribe via RSS" link resolves.
 */

const SITE = 'https://vought.com';

const POSTS = [
  { title: 'How we shipped sub-second whisper latency on the ElevenLabs Speech Engine', slug: 'sub-second-whisper-latency', date: 'Tue, 20 May 2026 09:00:00 GMT' },
  { title: 'TripleByte’s revenue lift after switching to Vought', slug: 'triplebyte-revenue-lift', date: 'Thu, 08 May 2026 09:00:00 GMT' },
  { title: 'The voice clone consent flow we built — and why', slug: 'voice-clone-consent-flow', date: 'Wed, 30 Apr 2026 09:00:00 GMT' },
  { title: 'Real-time speaker diarization on a single mic, explained', slug: 'single-mic-diarization', date: 'Mon, 21 Apr 2026 09:00:00 GMT' },
  { title: 'Why we chose ElevenLabs over building our own TTS', slug: 'why-elevenlabs', date: 'Fri, 11 Apr 2026 09:00:00 GMT' },
  { title: 'Our brand voice rules and why “AI-powered” is banned', slug: 'brand-voice-rules', date: 'Tue, 01 Apr 2026 09:00:00 GMT' },
];

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function GET() {
  const items = POSTS.map(
    (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${SITE}/blog/${p.slug}</link>
      <guid>${SITE}/blog/${p.slug}</guid>
      <pubDate>${p.date}</pubDate>
    </item>`,
  ).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>The Vought blog</title>
    <link>${SITE}/blog</link>
    <description>Notes from the conversation — engineering and customer stories from Vought.</description>
    <language>en-us</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
