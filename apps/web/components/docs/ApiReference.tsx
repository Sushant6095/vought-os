'use client';

/**
 * ApiReference · Mintlify-style API reference for the Vought API.
 *
 * Three panes: a method-badge sidebar, the endpoint spec (title, method+URL
 * pill, params, headers, response schema), and a sticky code + response panel
 * with real syntax highlighting + line numbers. Clicking a sidebar entry
 * switches the active endpoint. Styled in the black/white/blue system.
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'WS';
type Param = { name: string; type: string; required?: boolean; desc: string };

type Endpoint = {
  id: string;
  group: string;
  method: Method;
  name: string;
  path: string;
  summary: string;
  pathParams?: Param[];
  headers?: Param[];
  body?: Param[];
  response: Param[];
  code: string;
  sample: string;
};

const METHOD_COLOR: Record<Method, string> = {
  GET: '#28c76f',
  POST: '#3358ff',
  PATCH: '#f59e0b',
  DELETE: '#f22f46',
  WS: '#a855f7',
};

const ENDPOINTS: Endpoint[] = [
  {
    id: 'create-session',
    group: 'Sessions',
    method: 'POST',
    name: 'Create session',
    path: '/v1/sessions',
    summary: 'Open a live whisper session bound to a persona and a cloned voice. Returns a session id and a short-lived WebSocket token.',
    headers: [{ name: 'Authorization', type: 'string', required: true, desc: 'Bearer <VOUGHT_API_KEY>.' }],
    body: [
      { name: 'persona', type: 'string', required: true, desc: 'Persona id — sets system prompt, tone, and whether playbook RAG is used.' },
      { name: 'voice_id', type: 'string', required: true, desc: 'ElevenLabs voice id to render whispers in. Usually the operator’s clone.' },
      { name: 'variables', type: 'object', desc: 'Prompt variables interpolated into the persona ($COMPANY$, $DEAL$…).' },
      { name: 'retention', type: 'enum', desc: '"none" (default) · "transcript" · "audio".' },
    ],
    response: [
      { name: 'session_id', type: 'string', desc: 'The live session resource id.' },
      { name: 'ws_url', type: 'string', desc: 'WebSocket to stream audio and receive events.' },
      { name: 'ws_token', type: 'string', desc: 'Short-lived token for the socket.' },
      { name: 'expires_in', type: 'integer', desc: 'Token lifetime in seconds.' },
    ],
    code: `import { Vought } from "@vought/sdk";

const client = new Vought({ apiKey: process.env.VOUGHT_API_KEY });

const session = await client.sessions.create({
  persona: "sales-discovery",
  voice_id: user.clonedVoiceId,
});`,
    sample: `{
  "session_id": "sess_9f2a3b",
  "ws_url": "wss://rt.vought.com/v1/sess_9f2a3b",
  "ws_token": "ey…",
  "expires_in": 120
}`,
  },
  {
    id: 'get-session',
    group: 'Sessions',
    method: 'GET',
    name: 'Get session',
    path: '/v1/sessions/:session_id',
    summary: 'Retrieve a session resource — its persona, voice, state, and live latency telemetry.',
    pathParams: [{ name: 'session_id', type: 'string', required: true, desc: 'The session id (accepts sess_ prefix).' }],
    headers: [{ name: 'Authorization', type: 'string', required: true, desc: 'Bearer <VOUGHT_API_KEY>.' }],
    response: [
      { name: 'session_id', type: 'string', desc: 'The session resource id.' },
      { name: 'persona', type: 'string', desc: 'Persona bound to the session.' },
      { name: 'voice_id', type: 'string', desc: 'ElevenLabs voice rendering whispers.' },
      { name: 'state', type: 'enum', desc: '"listening" · "thinking" · "whispering" · "ended".' },
      { name: 'latency_ms', type: 'object', desc: 'Per-stage latency: eot, llm_ttft, tts_ttfb, total.' },
    ],
    code: `import { Vought } from "@vought/sdk";

const client = new Vought({ apiKey: process.env.VOUGHT_API_KEY });

const session = await client.sessions.get("sess_9f2a3b");`,
    sample: `{
  "session_id": "sess_9f2a3b",
  "persona": "sales-discovery",
  "voice_id": "vx_3b8c1d",
  "state": "listening",
  "latency_ms": { "eot": 312, "llm_ttft": 238, "tts_ttfb": 142, "total": 412 }
}`,
  },
  {
    id: 'stream-events',
    group: 'Sessions',
    method: 'WS',
    name: 'Stream events',
    path: '/v1/:session_id',
    summary: 'A duplex socket. Send 16kHz PCM; receive transcripts, speaker labels, thinking state, and whisper audio as they happen.',
    pathParams: [{ name: 'session_id', type: 'string', required: true, desc: 'The session id from Create session.' }],
    response: [
      { name: 'type', type: 'string', desc: '"transcript" · "speaker_label" · "state" · "whisper".' },
      { name: 'text', type: 'string', desc: 'Transcript or whisper text.' },
      { name: 'source', type: 'string', desc: 'Whisper attribution — playbook + chunk + version.' },
      { name: 'audio', type: 'string', desc: 'Base64 PCM for whisper events (cloned voice).' },
    ],
    code: `const ws = client.sessions.stream("sess_9f2a3b");

ws.on("whisper", ({ text, audio }) => earbud.play(audio));

mic.pipeTo(ws.audioIn); // 16kHz PCM`,
    sample: `{ "type": "transcript", "speaker": "them", "text": "…not sure we need another system." }
{ "type": "speaker_label", "isSelf": false, "confidence": 0.94 }
{ "type": "state", "value": "thinking" }
{ "type": "whisper", "text": "Totally hear you on stack fatigue…",
  "source": "Playbook · Salesforce objection v3", "audio": "<base64>" }`,
  },
  {
    id: 'clone-voice',
    group: 'Voices',
    method: 'POST',
    name: 'Clone voice',
    path: '/v1/voices',
    summary: 'Clone a voice from ~30 seconds of audio. The model is private to the user; raw audio is discarded after processing.',
    headers: [{ name: 'Authorization', type: 'string', required: true, desc: 'Bearer <VOUGHT_API_KEY>.' }],
    body: [
      { name: 'name', type: 'string', required: true, desc: 'Label for the voice.' },
      { name: 'consent', type: 'boolean', required: true, desc: 'Must be true — explicit voice-clone consent.' },
      { name: 'sample', type: 'file', required: true, desc: '≥30s mono WAV/MP3 of the operator’s voice.' },
    ],
    response: [
      { name: 'voice_id', type: 'string', desc: 'The cloned ElevenLabs voice id.' },
      { name: 'status', type: 'enum', desc: '"processing" · "ready".' },
    ],
    code: `import fs from "node:fs";

const voice = await client.voices.clone({
  name: "Sushant",
  consent: true,
  sample: fs.createReadStream("voice-30s.wav"),
});`,
    sample: `{
  "voice_id": "vx_3b8c1d",
  "status": "ready"
}`,
  },
  {
    id: 'delete-voice',
    group: 'Voices',
    method: 'DELETE',
    name: 'Delete voice',
    path: '/v1/voices/:voice_id',
    summary: 'Delete the clone from ElevenLabs and clear the mapping. Verified by a follow-up read returning 404.',
    pathParams: [{ name: 'voice_id', type: 'string', required: true, desc: 'The cloned voice id.' }],
    headers: [{ name: 'Authorization', type: 'string', required: true, desc: 'Bearer <VOUGHT_API_KEY>.' }],
    response: [{ name: 'deleted', type: 'boolean', desc: 'True when the voice is gone.' }],
    code: `await client.voices.delete("vx_3b8c1d");`,
    sample: `{
  "deleted": true
}`,
  },
  {
    id: 'speaker-labels',
    group: 'Diarization',
    method: 'WS',
    name: 'Speaker labels',
    path: '/v1/diarization/:session_id',
    summary: 'A diart sidecar separates speakers on a single mic. The first dominant speaker in the 5s enrollment window locks as is_self; the engine only whispers about the other party.',
    pathParams: [{ name: 'session_id', type: 'string', required: true, desc: 'The session id.' }],
    response: [
      { name: 'isSelf', type: 'boolean', desc: 'True when the segment is the operator’s own voice.' },
      { name: 'speakerId', type: 'string', desc: 'Stable per-session speaker id.' },
      { name: 'confidence', type: 'number', desc: '0–1 segment confidence.' },
      { name: 'tEnd', type: 'number', desc: 'Segment end, seconds into the session.' },
    ],
    code: `const labels = client.diarization.stream("sess_9f2a3b");

labels.on("label", (l) => engine.gate(l.isSelf));`,
    sample: `{
  "sessionId": "sess_9f2a3b",
  "isSelf": false,
  "speakerId": "speaker_0",
  "confidence": 0.94,
  "tEnd": 14.8
}`,
  },
  {
    id: 'webhooks',
    group: 'Webhooks',
    method: 'POST',
    name: 'Call events',
    path: 'https://your-app.com/webhooks/vought',
    summary: 'Subscribe to post-call events. Payloads are signed with an HMAC header you verify against your signing secret.',
    headers: [{ name: 'X-Vought-Signature', type: 'string', required: true, desc: 'HMAC-SHA256 of the raw body.' }],
    response: [
      { name: 'event', type: 'string', desc: '"call.completed" · "voice.ready" · "session.expired".' },
      { name: 'accept_rate', type: 'number', desc: 'Share of whispers accepted on the call.' },
      { name: 'outcome', type: 'string', desc: 'Disposition — advanced, closed, no-show…' },
    ],
    code: `app.post("/webhooks/vought", verifySignature, (req, res) => {
  const { event, session_id } = req.body;
  res.sendStatus(200);
});`,
    sample: `{
  "event": "call.completed",
  "session_id": "sess_9f2a3b",
  "duration_s": 612,
  "accept_rate": 0.73,
  "outcome": "advanced"
}`,
  },
];

const GROUPS = ['Sessions', 'Voices', 'Diarization', 'Webhooks'];

function Badge({ m, small }: { m: Method; small?: boolean }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded font-bold tracking-wide ${small ? 'px-1.5 py-[3px] text-[9px]' : 'px-2.5 py-1 text-[11px]'}`}
      style={{ background: `${METHOD_COLOR[m]}26`, color: METHOD_COLOR[m] }}
    >
      {m === 'DELETE' ? 'DEL' : m}
    </span>
  );
}

const HL_STYLE: React.CSSProperties = {
  margin: 0,
  background: 'transparent',
  padding: '16px 18px',
  fontSize: '12.5px',
  lineHeight: '1.7',
};
const HL_CODE = { fontFamily: 'var(--font-mono), ui-monospace, monospace' } as React.CSSProperties;
const LN_STYLE: React.CSSProperties = { color: 'rgba(255,255,255,0.22)', minWidth: '2.4em', paddingRight: '1em', userSelect: 'none' };

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  return (
    <SyntaxHighlighter
      language={lang}
      style={oneDark}
      showLineNumbers
      wrapLongLines={false}
      customStyle={HL_STYLE}
      codeTagProps={{ style: HL_CODE }}
      lineNumberStyle={LN_STYLE}
    >
      {code}
    </SyntaxHighlighter>
  );
}

function PathPill({ method, path }: { method: Method; path: string }) {
  const segs = path.split(/(:[a-z_]+)/g);
  const isUrl = path.startsWith('/');
  return (
    <div className="flex items-center gap-2 overflow-x-auto rounded-xl border border-white/10 px-2 py-2" style={{ background: 'rgba(10,12,18,0.8)' }}>
      <Badge m={method} />
      <code className="whitespace-nowrap font-[var(--font-mono)] text-[13px]">
        {isUrl && <span className="text-white/35">https://api.vought.com</span>}
        {segs.map((s, i) =>
          s.startsWith(':') ? (
            <span key={i} style={{ color: 'var(--ob-blue-soft)' }}>{s}</span>
          ) : (
            <span key={i} className="text-white/85">{s}</span>
          ),
        )}
      </code>
    </div>
  );
}

function ParamRows({ rows }: { rows: Param[] }) {
  return (
    <div className="divide-y divide-white/[0.06]">
      {rows.map((p) => (
        <div key={p.name} className="py-3.5">
          <div className="flex flex-wrap items-baseline gap-2">
            <code className="font-[var(--font-mono)] text-[13px] font-semibold text-white">{p.name}</code>
            <span className="font-[var(--font-mono)] text-[11px] text-white/40">{p.type}</span>
            {p.required && <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#f22f46' }}>Required</span>}
          </div>
          <p className="mt-1 text-[13px] leading-relaxed text-white/50">{p.desc}</p>
        </div>
      ))}
    </div>
  );
}

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M10.5 5.5V4A1.5 1.5 0 0 0 9 2.5H4A1.5 1.5 0 0 0 2.5 4v5A1.5 1.5 0 0 0 4 10.5h1.5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function ApiReference() {
  const [active, setActive] = useState(ENDPOINTS[0].id);
  const ep = useMemo(() => ENDPOINTS.find((e) => e.id === active)!, [active]);

  return (
    <div className="grid gap-10 lg:grid-cols-[224px_minmax(0,1fr)_minmax(0,460px)]">
      {/* Sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-28 space-y-6">
          {GROUPS.map((g) => (
            <div key={g}>
              <p className="ob-eyebrow mb-2.5">{g}</p>
              <ul className="space-y-0.5">
                {ENDPOINTS.filter((e) => e.group === g).map((e) => (
                  <li key={e.id}>
                    <button
                      type="button"
                      onClick={() => setActive(e.id)}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-[13px] transition-colors ${
                        active === e.id ? 'bg-white/[0.06] text-white' : 'text-white/55 hover:bg-white/[0.03] hover:text-white'
                      }`}
                    >
                      <Badge m={e.method} small />
                      {e.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </aside>

      {/* Center — spec */}
      <div className="min-w-0">
        <div className="mb-2 flex items-center gap-1.5 font-[var(--font-mono)] text-[11px] text-white/35">
          <span>Vought API</span><span>›</span><span className="text-white/55">{ep.group}</span>
        </div>
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="ob-serif text-[42px] leading-[1.05] text-white">{ep.name}</h2>
          <button type="button" className="mt-2 inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/12 px-3 py-1.5 text-[12px] text-white/60 transition-colors hover:border-white/25 hover:text-white">
            <CopyIcon /> Copy page
          </button>
        </div>
        <div className="mb-7"><PathPill method={ep.method} path={ep.path} /></div>
        <p className="mb-9 leading-relaxed text-white/60">{ep.summary}</p>

        {ep.pathParams && <Section title="Path parameters"><ParamRows rows={ep.pathParams} /></Section>}
        {ep.headers && <Section title="Headers"><ParamRows rows={ep.headers} /></Section>}
        {ep.body && <Section title="Body"><ParamRows rows={ep.body} /></Section>}
        <Section title="Response"><ParamRows rows={ep.response} /></Section>
      </div>

      {/* Right — code + response */}
      <div className="min-w-0">
        <div className="sticky top-28 space-y-4">
          {/* Code card */}
          <div className="overflow-hidden rounded-2xl border border-white/10" style={{ background: '#0a0c12' }}>
            <div className="flex items-center justify-between border-b border-white/10 px-3.5 py-2.5">
              <div className="flex items-center gap-2 overflow-hidden">
                <Badge m={ep.method} small />
                <code className="truncate font-[var(--font-mono)] text-[11px] text-white/50">{ep.path}</code>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-[11px] text-white/60">
                  TypeScript
                  <svg width="9" height="9" viewBox="0 0 12 12" fill="none" aria-hidden><path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                <button type="button" className="text-white/40 transition-colors hover:text-white" aria-label="Copy code"><CopyIcon /></button>
              </div>
            </div>
            <CodeBlock code={ep.code} lang="typescript" />
            <div className="border-t border-white/10 px-3.5 py-2.5">
              <Link href="/demo" className="ob-btn-lime block w-full rounded-lg py-2 text-center text-[12px] font-semibold">▶ Try it</Link>
            </div>
          </div>

          {/* Response card */}
          <div className="overflow-hidden rounded-2xl border border-white/10" style={{ background: '#0a0c12' }}>
            <div className="flex items-center gap-2 border-b border-white/10 px-3.5 py-2.5">
              <span className="rounded px-2 py-0.5 text-[11px] font-bold" style={{ background: '#28c76f26', color: '#28c76f' }}>200</span>
              <span className="text-[12px] text-white/50">Retrieved</span>
            </div>
            <CodeBlock code={ep.sample} lang="json" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-9 border-t border-white/[0.06] pt-6">
      <h3 className="mb-2 text-[17px] font-semibold text-white">{title}</h3>
      {children}
    </div>
  );
}
