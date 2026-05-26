-- ───────────────────────────────────────────────────────────────────────
-- Vought · Postgres schema
-- ───────────────────────────────────────────────────────────────────────
-- Run with:  psql $DATABASE_URL -f schema.sql
-- Requires:  Postgres 15+ with pgvector extension installed
-- ───────────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- ─── Tenancy (multi-org for Vox) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS orgs (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  plan       TEXT NOT NULL DEFAULT 'consumer',  -- consumer | team | enterprise
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Users ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id          UUID REFERENCES orgs(id) ON DELETE CASCADE,
  email           TEXT NOT NULL UNIQUE,
  display_name    TEXT,
  voice_id        TEXT,                                -- ElevenLabs voice_id
  voice_status    TEXT DEFAULT 'none',                 -- none | processing | ready
  role            TEXT DEFAULT 'member',               -- member | admin | manager
  product         TEXT DEFAULT 'cyrano',               -- cyrano | vox
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS users_org_idx ON users(org_id);

-- ─── Personas (built-in + custom) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS personas (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id        UUID REFERENCES orgs(id) ON DELETE CASCADE,
  key           TEXT NOT NULL,                         -- "first-date", "sales-discovery"
  name          TEXT NOT NULL,
  description   TEXT,
  system_prompt TEXT NOT NULL,
  tone          JSONB NOT NULL DEFAULT '{}',
  use_rag       BOOLEAN NOT NULL DEFAULT FALSE,
  built_in      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS personas_key_idx ON personas(key);

-- ─── Playbooks (Vox) ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS playbooks (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id         UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  source_url     TEXT,
  persona_key    TEXT,                                 -- ties to persona
  version        INT NOT NULL DEFAULT 1,
  uploaded_by    UUID REFERENCES users(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS playbooks_org_idx ON playbooks(org_id);

CREATE TABLE IF NOT EXISTS playbook_chunks (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playbook_id  UUID NOT NULL REFERENCES playbooks(id) ON DELETE CASCADE,
  content      TEXT NOT NULL,
  embedding    VECTOR(1536) NOT NULL,
  metadata     JSONB NOT NULL DEFAULT '{}',            -- { persona, section, ... }
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- IVFFLAT index for fast similarity search (rebuild after large inserts)
CREATE INDEX IF NOT EXISTS playbook_chunks_embed_idx
  ON playbook_chunks USING ivfflat (embedding vector_l2_ops)
  WITH (lists = 100);

-- ─── Sessions ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  persona_key   TEXT NOT NULL,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at      TIMESTAMPTZ,
  duration_sec  INT,
  retained      BOOLEAN NOT NULL DEFAULT FALSE,        -- false = no transcript stored
  metadata      JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id);

-- ─── Transcripts (opt-in only) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transcripts (
  session_id   UUID PRIMARY KEY REFERENCES sessions(id) ON DELETE CASCADE,
  turns        JSONB NOT NULL,                         -- [{role, speaker, text, t}]
  commentary   JSONB,                                  -- Cyrano notes per turn
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Vox-only: call analytics ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS call_metrics (
  session_id        UUID PRIMARY KEY REFERENCES sessions(id) ON DELETE CASCADE,
  talk_ratio_self   NUMERIC(4,2),                      -- 0.00 - 1.00
  suggestion_count  INT DEFAULT 0,
  suggestion_used   INT DEFAULT 0,
  objections        JSONB DEFAULT '[]',
  sentiment_trend   NUMERIC(4,2),                      -- -1.00 to 1.00
  outcome           TEXT,                              -- won | lost | next_step_set
  deal_value_cents  BIGINT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Integrations (Vox) ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS integrations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id      UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  kind        TEXT NOT NULL,                          -- salesforce | hubspot | zoom | slack
  config      JSONB NOT NULL,                         -- credentials, settings
  enabled     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Audit log (for compliance + manager visibility) ──────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id          BIGSERIAL PRIMARY KEY,
  org_id      UUID REFERENCES orgs(id),
  user_id     UUID REFERENCES users(id),
  action      TEXT NOT NULL,                          -- session.start | transcript.read | playbook.update
  target      TEXT,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS audit_log_org_time_idx ON audit_log(org_id, created_at DESC);

-- ─── Seed: built-in personas ──────────────────────────────────────────
INSERT INTO personas (key, name, description, system_prompt, use_rag, built_in) VALUES
  ('first-date',         'First Date',         'Warm, curious, playful',          'See echo-engine/src/personas/index.ts', false, true),
  ('job-interview',      'Job Interview',      'Confident, structured, succinct', 'See echo-engine/src/personas/index.ts', false, true),
  ('hard-conversation',  'Hard Conversation',  'Steady, empathetic, calm',        'See echo-engine/src/personas/index.ts', false, true),
  ('salary-negotiation', 'Salary Negotiation', 'Firm, anchored, friendly',        'See echo-engine/src/personas/index.ts', false, true),
  ('medical-visit',      'Medical Visit',      'Decodes jargon, advocates',       'See echo-engine/src/personas/index.ts', false, true),
  ('sales-discovery',    'Sales · Discovery',  'Open-ended, pain discovery',      'See echo-engine/src/personas/index.ts', true,  true),
  ('sales-objection',    'Sales · Objection',  'Acknowledge, reframe, ask',       'See echo-engine/src/personas/index.ts', true,  true)
ON CONFLICT DO NOTHING;
