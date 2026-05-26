/**
 * Vox playbook RAG.
 *
 * For Vox personas (`useRag: true`), look up the top-k most relevant chunks
 * from the org's uploaded playbooks and inject them into the LLM prompt.
 *
 * - Embeddings: OpenAI `text-embedding-3-small` (1536 dims).
 * - Index:      pgvector, IVFFLAT, L2 distance.
 * - Schema:     `playbook_chunks(id, playbook_id, content, embedding, metadata)`
 *
 * The metadata column is JSONB and conventionally carries
 * `{ "persona": "<personaId>", "section": "...", "source": "..." }`. The
 * persona filter is essential — we never want a discovery playbook leaking
 * into a support call.
 *
 * Soft-fails everywhere: if embeddings or the DB are unreachable, returns
 * null and the caller skips playbook context.
 */

import { Pool, type PoolClient } from "pg";
import OpenAI from "openai";
import type { PersonaId } from "./personas/index.js";
import { logger } from "./log.js";

const EMBED_MODEL = "text-embedding-3-small";
const EMBED_TIMEOUT_MS = 400;
const QUERY_TIMEOUT_MS = 250;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

let pool: Pool | null = null;

function getPool(): Pool | null {
  if (pool) return pool;
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  try {
    pool = new Pool({
      connectionString: url,
      max: 4,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 2_000,
    });
    pool.on("error", (err) => {
      logger.warn({ err: err.message }, "rag: pg pool error");
    });
    return pool;
  } catch (err) {
    logger.warn({ err: (err as Error).message }, "rag: pg pool init failed");
    return null;
  }
}

export interface PlaybookChunk {
  content: string;
  metadata: Record<string, unknown>;
}

/**
 * Returns top-k chunks with metadata, or `null` if RAG is unavailable.
 */
export async function fetchPlaybookChunks(
  personaId: PersonaId,
  query: string,
  k = 3,
): Promise<PlaybookChunk[] | null> {
  const db = getPool();
  if (!db) return null;

  const embedding = await embed(query);
  if (!embedding) return null;

  let client: PoolClient | null = null;
  try {
    client = await db.connect();
    const { rows } = await Promise.race([
      client.query<PlaybookChunk>(
        `
        SELECT content, metadata
        FROM playbook_chunks
        WHERE metadata->>'persona' = $1
        ORDER BY embedding <-> $2::vector
        LIMIT $3
        `,
        [personaId, toVectorLiteral(embedding), k],
      ),
      timeoutPromise<{ rows: PlaybookChunk[] }>(QUERY_TIMEOUT_MS, "rag.query"),
    ]);

    if (rows.length === 0) {
      logger.debug({ personaId, stage: "rag_miss" }, "rag: no chunks");
      return [];
    }

    logger.debug({ personaId, count: rows.length, stage: "rag_hit" }, "rag: chunks");
    return rows;
  } catch (err) {
    logger.warn({ err: (err as Error).message, personaId }, "rag: query failed");
    return null;
  } finally {
    client?.release();
  }
}

/**
 * Convenience: format chunks into a prompt-ready block. Returns `null` when
 * RAG returned nothing useful.
 */
export async function fetchPlaybookContext(
  personaId: PersonaId,
  query: string,
  k = 3,
): Promise<string | null> {
  const chunks = await fetchPlaybookChunks(personaId, query, k);
  if (!chunks || chunks.length === 0) return null;
  return chunks
    .map((c, i) => {
      const section =
        typeof c.metadata?.section === "string" ? ` · ${c.metadata.section}` : "";
      return `[chunk ${i + 1}${section}]\n${c.content}`;
    })
    .join("\n\n");
}

async function embed(text: string): Promise<number[] | null> {
  if (!process.env.OPENAI_API_KEY) return null;
  try {
    const res = await Promise.race([
      openai.embeddings.create({ model: EMBED_MODEL, input: text }),
      timeoutPromise<never>(EMBED_TIMEOUT_MS, "rag.embed"),
    ]);
    return res.data[0]?.embedding ?? null;
  } catch (err) {
    logger.warn({ err: (err as Error).message }, "rag: embedding failed");
    return null;
  }
}

function toVectorLiteral(vec: number[]): string {
  // pgvector accepts `'[0.1,0.2,...]'::vector` — JSON.stringify produces the
  // right shape and is faster than manual join+map for 1536 floats.
  return JSON.stringify(vec);
}

function timeoutPromise<T>(ms: number, tag: string): Promise<T> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`${tag}: timeout after ${ms}ms`)), ms);
  });
}
