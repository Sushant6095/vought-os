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

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'WS' | 'SDK';
type Param = { name: string; type: string; required?: boolean; desc: string };

type Endpoint = {
  id: string;
  group: string;
  method: Method;
  name: string;
  path: string;
  /**
   * Override for the URL prefix in the PathPill. Default is the Vought app
   * origin. Empty string suppresses the prefix entirely — used for SDK
   * method-call entries that aren't HTTP paths.
   */
  baseUrl?: string;
  summary: string;
  pathParams?: Param[];
  headers?: Param[];
  body?: Param[];
  response: Param[];
  code: string;
  codeLang?: 'typescript' | 'python' | 'tsx' | 'bash';
  sample: string;
  sampleLang?: 'json' | 'text';
};

const VOUGHT_BASE = 'https://vought-os-app.vercel.app';
const ELEVENLABS_BASE = 'https://api.elevenlabs.io';
const DIART_BASE = 'wss://diart.vought.internal';

const METHOD_COLOR: Record<Method, string> = {
  GET: '#28c76f',
  POST: '#3358ff',
  PATCH: '#f59e0b',
  DELETE: '#f22f46',
  WS: '#a855f7',
  SDK: '#ff5cb0',
};

const LANG_LABEL: Record<NonNullable<Endpoint['codeLang']>, string> = {
  typescript: 'TypeScript',
  tsx: 'TSX',
  python: 'Python',
  bash: 'cURL',
};

const ENDPOINTS: Endpoint[] = [
  // ─── Vought API · the surfaces we actually ship ─────────────────────
  {
    id: 'token-mint',
    group: 'Vought API',
    method: 'POST',
    name: 'Mint conversation token',
    path: '/api/token',
    baseUrl: VOUGHT_BASE,
    summary:
      'The app’s only auth-bearing endpoint. Mints a short-lived ElevenLabs conversationToken and a session id, then the browser hands those to the ElevenLabs SDK to open the live socket. Persona, userId, and prompt variables ride along as metadata into the Echo Engine.',
    headers: [
      {
        name: 'Content-Type',
        type: 'string',
        required: true,
        desc: 'application/json.',
      },
    ],
    body: [
      {
        name: 'personaId',
        type: 'string',
        required: true,
        desc: 'Persona key — e.g. "first-date", "sales-discovery". Loaded server-side from services/echo-engine/src/personas.',
      },
      {
        name: 'userId',
        type: 'string',
        required: true,
        desc: 'Stable user id. Used to look up the cloned voice id so whispers render in the operator’s voice.',
      },
      {
        name: 'variables',
        type: 'object',
        desc: 'Prompt variables interpolated into the persona ($COMPANY$, $DEAL$…).',
      },
    ],
    response: [
      {
        name: 'token',
        type: 'string',
        desc: 'ElevenLabs conversationToken (JWT). Pass to conversation.startSession.',
      },
      {
        name: 'sessionId',
        type: 'string',
        desc: 'Stable id used for diarization correlation and Redis memory.',
      },
      {
        name: 'personaId',
        type: 'string',
        desc: 'The persona resolved server-side.',
      },
      {
        name: 'userId',
        type: 'string',
        desc: 'Echo of the userId for downstream voice lookup.',
      },
    ],
    code: `// apps/app — client side
const res = await fetch('/api/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    personaId: 'first-date',
    userId: 'demo-user',
    variables: {},
  }),
});
const { token, sessionId, personaId, userId } = await res.json();`,
    codeLang: 'typescript',
    sample: `{
  "token": "eyJhbGciOiJIUzI1NiJ9…",
  "sessionId": "sess_9f2a3b",
  "personaId": "first-date",
  "userId": "demo-user"
}`,
    sampleLang: 'json',
  },
  {
    id: 'echo-health',
    group: 'Vought API',
    method: 'GET',
    name: 'Echo Engine health',
    path: '/health',
    baseUrl: 'https://echo-engine.vought.internal',
    summary:
      'Liveness + diagnostics for the Node Echo Engine. Reports which LLM provider is bound, whether the diart sidecar is connected, and how many personas are loaded. Useful for ngrok-bridge smoke tests during local dev.',
    response: [
      { name: 'ok', type: 'boolean', desc: 'True if the process is up.' },
      {
        name: 'engineId',
        type: 'string',
        desc: 'ElevenLabs Speech Engine id this process is attached to.',
      },
      {
        name: 'provider',
        type: 'enum',
        desc: '"openai" or "anthropic" — which LLM client is firing.',
      },
      {
        name: 'model',
        type: 'string',
        desc: 'Model id — e.g. "llama3.1-8b" via Cerebras, "claude-3-5-haiku-latest".',
      },
      {
        name: 'diarConnected',
        type: 'boolean',
        desc: 'Whether the diart sidecar WebSocket is live.',
      },
      {
        name: 'personas',
        type: 'integer',
        desc: 'Count of personas loaded from services/echo-engine/src/personas.',
      },
    ],
    code: `curl https://echo-engine.vought.internal/health`,
    codeLang: 'bash',
    sample: `{
  "ok": true,
  "engineId": "seng_6001ksmjtj2aep9ahqth9b5g9220",
  "provider": "openai",
  "model": "llama3.1-8b",
  "diarConnected": true,
  "personas": 5
}`,
    sampleLang: 'json',
  },
  {
    id: 'echo-personas',
    group: 'Vought API',
    method: 'GET',
    name: 'List personas',
    path: '/personas',
    baseUrl: 'https://echo-engine.vought.internal',
    summary:
      'Returns the persona registry the orchestrator can bind to a session — system prompts, RAG opt-ins, and prompt-variable schemas. Read-only.',
    response: [
      { name: 'id', type: 'string', desc: 'Persona key.' },
      { name: 'label', type: 'string', desc: 'Human label.' },
      {
        name: 'useRag',
        type: 'boolean',
        desc: 'Whether this persona pulls playbook chunks from pgvector.',
      },
      {
        name: 'variables',
        type: 'string[]',
        desc: 'Variable keys the persona expects ($COMPANY$, $DEAL$…).',
      },
    ],
    code: `curl https://echo-engine.vought.internal/personas`,
    codeLang: 'bash',
    sample: `[
  { "id": "first-date", "label": "First date", "useRag": false, "variables": ["NAME"] },
  { "id": "sales-discovery", "label": "Sales discovery", "useRag": true, "variables": ["COMPANY","DEAL"] },
  { "id": "interview", "label": "Interview", "useRag": true, "variables": ["ROLE"] }
]`,
    sampleLang: 'json',
  },

  // ─── ElevenLabs Integration · the SDK surface we use ─────────────────
  {
    id: 'el-engine-create',
    group: 'ElevenLabs Integration',
    method: 'SDK',
    name: 'Speech Engine · provision',
    path: 'elevenlabs.speechEngine.create()',
    baseUrl: '',
    summary:
      'Provision an ElevenLabs Speech Engine resource. We use eleven_flash_v2 for sub-300 ms TTS first-byte and opt into zero retention with retentionDays = -1, so neither audio nor transcripts persist server-side after the session ends.',
    body: [
      {
        name: 'name',
        type: 'string',
        required: true,
        desc: 'Human label for the engine resource.',
      },
      {
        name: 'mode',
        type: 'enum',
        required: true,
        desc: '"conversational" for full-duplex agents.',
      },
      {
        name: 'ttsModel',
        type: 'string',
        desc: '"eleven_flash_v2" for the fastest path to first byte.',
      },
      {
        name: 'turnTimeout',
        type: 'integer',
        desc: 'Silence in seconds before end-of-turn fires (we use 2).',
      },
      {
        name: 'retentionDays',
        type: 'integer',
        desc: '-1 enables zero-retention mode (no audio or transcripts kept).',
      },
    ],
    response: [
      {
        name: 'speechEngineId',
        type: 'string',
        desc: 'The engine id used by speechEngine.attach.',
      },
    ],
    code: `// services/echo-engine/scripts/create-engine.ts
const engine = await elevenlabs.speechEngine.create({
  name: 'Vought · Echo',
  mode: 'conversational',
  ttsModel: 'eleven_flash_v2',
  turnTimeout: 2,
  optimizeStreamingLatency: 3,
  zeroRetentionMode: true,
  retentionDays: -1, // required when zero retention is on
});

console.log('SPEECH_ENGINE_ID=' + engine.speechEngineId);`,
    codeLang: 'typescript',
    sample: `seng_6001ksmjtj2aep9ahqth9b5g9220`,
    sampleLang: 'text',
  },
  {
    id: 'el-engine-attach',
    group: 'ElevenLabs Integration',
    method: 'SDK',
    name: 'Speech Engine · attach bridge',
    path: 'elevenlabs.speechEngine.attach()',
    baseUrl: '',
    summary:
      'The single most important call in the codebase. One method hangs ElevenLabs’ STT + TTS + turn-detection onto our Node HTTP server. The onTranscript callback receives every finished turn with an AbortSignal threaded through, so an interruption cancels the LLM and TTS together in one motion.',
    body: [
      {
        name: 'engineId',
        type: 'string',
        required: true,
        desc: 'The Speech Engine id from speechEngine.create.',
      },
      {
        name: 'server',
        type: 'http.Server',
        required: true,
        desc: 'Node HTTP server to attach the /ws upgrade onto.',
      },
      {
        name: 'path',
        type: 'string',
        required: true,
        desc: 'Mount path for the WebSocket upgrade. We use /ws.',
      },
      {
        name: 'onTranscript',
        type: 'function',
        required: true,
        desc: 'Called per finished turn. Receives (transcript, signal, session).',
      },
      {
        name: 'onInit/onClose/onDisconnect/onError',
        type: 'function',
        desc: 'Lifecycle hooks for session telemetry.',
      },
    ],
    response: [
      {
        name: 'session.sendResponse',
        type: 'function',
        desc: 'Pipe an LLM token stream into TTS in the operator’s cloned voice.',
      },
      {
        name: 'signal',
        type: 'AbortSignal',
        desc: 'Fires when the operator interrupts — cancels LLM + TTS together.',
      },
    ],
    code: `// services/echo-engine/src/server.ts
await elevenlabs.speechEngine.attach(SPEECH_ENGINE_ID, httpServer, '/ws', {
  onInit(conversationId) { /* session open */ },

  async onTranscript(transcript, signal, session) {
    if (!speakerGate.lastSpeakerWasOther(session.conversationId)) return;

    const { messages } = assemblePrompt({ persona, memory, transcript });
    const stream = await openai.chat.completions.create(
      { model, messages, stream: true },
      { signal },          // ← interruption-aware
    );

    await session.sendResponse(stream);  // STT → LLM → TTS, one socket
  },
});`,
    codeLang: 'typescript',
    sample: `// no payload — bridge runs for the life of the process`,
    sampleLang: 'text',
  },
  {
    id: 'el-voice-clone',
    group: 'ElevenLabs Integration',
    method: 'SDK',
    name: 'Voice · clone in 30s',
    path: 'elevenlabs.voices.add()',
    baseUrl: '',
    summary:
      'The wow moment. The onboarding screen captures ~30 seconds of the operator’s voice and posts the WAV to elevenlabs.voices.add. ElevenLabs returns a voice_id that we hot-swap into the Speech Engine TTS config — every subsequent whisper plays in the user’s own voice.',
    body: [
      {
        name: 'name',
        type: 'string',
        required: true,
        desc: 'Label for the clone (we use the user’s display name).',
      },
      {
        name: 'files',
        type: 'File[]',
        required: true,
        desc: '≥30s mono WAV. Recorded in-browser, never written to disk.',
      },
      {
        name: 'description',
        type: 'string',
        desc: 'Optional. We pass "Vought operator · userId=…" for traceability.',
      },
    ],
    response: [
      {
        name: 'voice_id',
        type: 'string',
        desc: 'Pass to speechEngine sessions to render TTS in this voice.',
      },
      { name: 'name', type: 'string', desc: 'Echo of the label.' },
    ],
    code: `// apps/app/app/onboarding/voice — server route
const voice = await elevenlabs.voices.add({
  name: \`Vought · \${user.displayName}\`,
  files: [wavBlob],          // 30s mono, in-memory
  description: \`Vought operator · userId=\${user.id}\`,
});

await db.users.update(user.id, { clonedVoiceId: voice.voice_id });
// Next session's TTS automatically renders in this voice.`,
    codeLang: 'typescript',
    sample: `{
  "voice_id": "vx_3b8c1d",
  "name": "Vought · Sushant"
}`,
    sampleLang: 'json',
  },
  {
    id: 'el-react-hook',
    group: 'ElevenLabs Integration',
    method: 'SDK',
    name: 'React · useConversation',
    path: '@elevenlabs/react :: useConversation()',
    baseUrl: '',
    summary:
      'Client-side bridge. The live-call screen wires four callbacks — onConnect, onDisconnect, onMessage, onError — into the same store the suggestion bloom and the speaker timeline read from. One hook owns the entire client-side lifecycle.',
    body: [
      {
        name: 'onConnect',
        type: 'function',
        desc: 'Fires when the WebSocket is open. We flip the state pill to "listening".',
      },
      {
        name: 'onMessage',
        type: 'function',
        desc: 'Receives { source, message } per turn. source = "agent" | "user" | "other".',
      },
      {
        name: 'onDisconnect',
        type: 'function',
        desc: 'Fires on session end. We reset the realtime store.',
      },
    ],
    response: [
      {
        name: 'conversation.startSession',
        type: 'function',
        desc: 'Open the session with a conversationToken and metadata.',
      },
      {
        name: 'conversation.setVolume / endSession',
        type: 'function',
        desc: 'Output-device gate and clean teardown.',
      },
    ],
    code: `// apps/app/app/live/[sessionId]/page.tsx
const conversation = useConversation({
  onConnect: () => setAgentState('listening'),
  onMessage: ({ source, message }) => {
    if (source === 'agent') addSuggestion({ text: message });
    if (source === 'user' || source === 'other') {
      setAgentState('thinking');
    }
  },
  onDisconnect: () => setAgentState('idle'),
});`,
    codeLang: 'tsx',
    sample: `// returns a stable conversation object — see the next entry`,
    sampleLang: 'text',
  },
  {
    id: 'el-start-session',
    group: 'ElevenLabs Integration',
    method: 'SDK',
    name: 'Conversation · startSession',
    path: 'conversation.startSession()',
    baseUrl: '',
    summary:
      'The single client-side call that wires the browser into the Speech Engine. Metadata (personaId, userId, prompt variables) is forwarded by the SDK into session.metadata server-side, which the Echo Engine reads at attach time to pick the right persona and the operator’s cloned voice.',
    body: [
      {
        name: 'conversationToken',
        type: 'string',
        required: true,
        desc: 'The JWT minted by POST /api/token.',
      },
      {
        name: 'metadata',
        type: 'object',
        desc: 'personaId, userId, variables — forwarded to the server-side onTranscript callback.',
      },
    ],
    response: [
      {
        name: 'conversationId',
        type: 'string',
        desc: 'Session id assigned by ElevenLabs. Matches sessionId from /api/token.',
      },
    ],
    code: `await conversation.startSession({
  conversationToken: payload.token,
  metadata: {
    personaId: payload.personaId,
    userId: payload.userId,
    variables: {},
  },
});`,
    codeLang: 'typescript',
    sample: `// returns the conversationId once the WebSocket is open`,
    sampleLang: 'text',
  },

  // ─── Diarization sidecar · the Python service ────────────────────────
  {
    id: 'diart-audio',
    group: 'Diarization Sidecar',
    method: 'WS',
    name: 'PCM ingest',
    path: '/audio/{session_id}',
    baseUrl: DIART_BASE,
    summary:
      'The browser mirrors 16 kHz mono PCM frames to the Python diart sidecar in parallel with the ElevenLabs upload. Diart locks the first dominant speaker in the 5-second enrollment window as is_self; every subsequent label is a verdict on whether the engine should whisper.',
    pathParams: [
      {
        name: 'session_id',
        type: 'string',
        required: true,
        desc: 'Stable session id from POST /api/token.',
      },
    ],
    body: [
      {
        name: '<binary frames>',
        type: 'Int16Array',
        desc: 'Raw 16 kHz mono PCM, 4096-sample chunks, sent as binary WebSocket frames.',
      },
    ],
    response: [
      {
        name: '(no body)',
        type: 'void',
        desc: 'Ingest-only socket. Labels are broadcast on /labels.',
      },
    ],
    code: `// apps/app — browser, after getUserMedia + 16 kHz AudioContext
const audioWs = new WebSocket(\`wss://.../audio/\${sessionId}\`);
processor.onaudioprocess = (e) => {
  if (audioWs.readyState !== WebSocket.OPEN) return;
  const float32 = e.inputBuffer.getChannelData(0);
  const int16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  audioWs.send(int16.buffer);
};`,
    codeLang: 'typescript',
    sample: `// no JSON response — see /labels for the broadcast feed`,
    sampleLang: 'text',
  },
  {
    id: 'diart-labels',
    group: 'Diarization Sidecar',
    method: 'WS',
    name: 'Speaker labels broadcast',
    path: '/labels',
    baseUrl: DIART_BASE,
    summary:
      'Read-only broadcast of every label diart emits. The Echo Engine consumes this server-side to decide whether to fire the LLM at all; the live-call screen mirrors it to paint the speaker timeline.',
    response: [
      {
        name: 'sessionId',
        type: 'string',
        desc: 'Session the label belongs to.',
      },
      {
        name: 'speakerId',
        type: 'string',
        desc: 'Stable per-session diart speaker id.',
      },
      {
        name: 'isSelf',
        type: 'boolean',
        desc: 'True when the segment matches the enrollment voice. Suppresses whispers.',
      },
      {
        name: 'confidence',
        type: 'number',
        desc: '0–1. Below 0.6 the speaker gate fails open and lets the LLM fire.',
      },
      {
        name: 'tStart / tEnd',
        type: 'number',
        desc: 'Seconds from session start. Used to age out the speaker timeline.',
      },
    ],
    code: `const labelsWs = new WebSocket('wss://.../labels');
labelsWs.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.sessionId !== sessionId) return;
  upsertSegment({
    id: \`seg-\${data.speakerId}-\${data.tStart.toFixed(3)}\`,
    tStart: data.tStart,
    tEnd: data.tEnd,
    isSelf: data.isSelf,
  });
};`,
    codeLang: 'typescript',
    sample: `{
  "sessionId": "sess_9f2a3b",
  "speakerId": "speaker_0",
  "isSelf": false,
  "confidence": 0.94,
  "tStart": 14.32,
  "tEnd": 14.81
}`,
    sampleLang: 'json',
  },
  {
    id: 'diart-health',
    group: 'Diarization Sidecar',
    method: 'GET',
    name: 'Sidecar health',
    path: '/health',
    baseUrl: 'https://diart.vought.internal',
    summary:
      'Python FastAPI liveness. Reports which pyannote model is loaded and how many active sessions are diarizing right now.',
    response: [
      { name: 'ok', type: 'boolean', desc: 'Service is up.' },
      {
        name: 'model',
        type: 'string',
        desc: 'pyannote model in use — e.g. "pyannote/segmentation-3.0".',
      },
      {
        name: 'sessions',
        type: 'integer',
        desc: 'Number of active /audio/{session_id} streams.',
      },
    ],
    code: `curl https://diart.vought.internal/health`,
    codeLang: 'bash',
    sample: `{
  "ok": true,
  "model": "pyannote/segmentation-3.0",
  "sessions": 3
}`,
    sampleLang: 'json',
  },
];

const GROUPS = ['Vought API', 'ElevenLabs Integration', 'Diarization Sidecar'];

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

function PathPill({
  method,
  path,
  baseUrl,
}: {
  method: Method;
  path: string;
  baseUrl?: string;
}) {
  // Split on both :param and {param} so we colorize both styles.
  const segs = path.split(/(:[a-z_]+|\{[a-z_]+\})/g);
  const showBase = baseUrl !== undefined && baseUrl !== '';
  return (
    <div
      className="flex items-center gap-2 overflow-x-auto rounded-xl border border-white/10 px-2 py-2"
      style={{ background: 'rgba(10,12,18,0.8)' }}
    >
      <Badge m={method} />
      <code className="whitespace-nowrap font-[var(--font-mono)] text-[13px]">
        {showBase && <span className="text-white/35">{baseUrl}</span>}
        {segs.map((s, i) =>
          s.startsWith(':') || (s.startsWith('{') && s.endsWith('}')) ? (
            <span key={i} style={{ color: 'var(--ob-blue-soft)' }}>
              {s}
            </span>
          ) : (
            <span key={i} className="text-white/85">
              {s}
            </span>
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
        <div className="mb-7">
          <PathPill method={ep.method} path={ep.path} baseUrl={ep.baseUrl} />
        </div>
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
                  {LANG_LABEL[ep.codeLang ?? 'typescript']}
                  <svg width="9" height="9" viewBox="0 0 12 12" fill="none" aria-hidden><path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                <button type="button" className="text-white/40 transition-colors hover:text-white" aria-label="Copy code"><CopyIcon /></button>
              </div>
            </div>
            <CodeBlock code={ep.code} lang={ep.codeLang ?? 'typescript'} />
            <div className="border-t border-white/10 px-3.5 py-2.5">
              <Link href="/demo" className="ob-btn-lime block w-full rounded-lg py-2 text-center text-[12px] font-semibold">▶ Try it</Link>
            </div>
          </div>

          {/* Response card */}
          <div className="overflow-hidden rounded-2xl border border-white/10" style={{ background: '#0a0c12' }}>
            <div className="flex items-center gap-2 border-b border-white/10 px-3.5 py-2.5">
              <span
                className="rounded px-2 py-0.5 text-[11px] font-bold"
                style={{
                  background: ep.method === 'SDK' ? '#ff5cb026' : '#28c76f26',
                  color: ep.method === 'SDK' ? '#ff5cb0' : '#28c76f',
                }}
              >
                {ep.method === 'SDK' ? 'SDK' : '200'}
              </span>
              <span className="text-[12px] text-white/50">
                {ep.method === 'SDK' ? 'Returns' : 'Retrieved'}
              </span>
            </div>
            <CodeBlock code={ep.sample} lang={ep.sampleLang ?? 'json'} />
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
