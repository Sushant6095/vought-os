/**
 * Prompt orchestrator.
 *
 * Pure functions. No I/O, no network. Given the persona, the conversation
 * memory, the optional RAG context, and the latest transcript, returns an
 * OpenAI/Anthropic-ready message array.
 *
 * Keeping this stage pure makes it cheap to unit test the prompt shape
 * without spinning up Redis, Postgres, or ElevenLabs.
 */

import type { Persona } from "./personas/index.js";
import type { TurnMessage } from "./memory.js";

export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface AssembleArgs {
  persona: Persona;
  memory: TurnMessage[];
  transcript: TurnMessage[];
  playbookContext?: string | null;
  /**
   * Free-form persona variable substitutions (e.g. $ROLE_CONTEXT$,
   * $TARGET_COMP$). Unknown placeholders are stripped to avoid leaking
   * "$TOKEN$" into the LLM prompt.
   */
  variables?: Record<string, string>;
}

export interface AssembledPrompt {
  system: string;
  messages: ChatMessage[];
  /**
   * `messages` without the system message — Anthropic's API takes the
   * system prompt as a top-level field.
   */
  userMessages: ChatMessage[];
}

const PLACEHOLDER_RE = /\$([A-Z_]+)\$/g;

/**
 * Build a system prompt that includes the persona instructions, tone
 * profile, and (if Vox) the playbook RAG chunks.
 */
export function buildSystemPrompt(args: {
  persona: Persona;
  playbookContext?: string | null;
  variables?: Record<string, string>;
}): string {
  const { persona, playbookContext, variables } = args;

  const toneLine = formatToneLine(persona);
  const baseSystem = substituteVariables(persona.systemPrompt, variables ?? {});

  const sections: string[] = [baseSystem, "", toneLine];

  if (persona.useRag && playbookContext && playbookContext.trim().length > 0) {
    sections.push(
      "",
      "---",
      "Relevant playbook excerpts (use these phrasings when applicable):",
      playbookContext,
      "---",
    );
  }

  return sections.join("\n");
}

/**
 * Assemble the full message array for the LLM call.
 */
export function assemblePrompt(args: AssembleArgs): AssembledPrompt {
  const { persona, memory, transcript, playbookContext, variables } = args;

  const system = buildSystemPrompt({ persona, playbookContext, variables });

  const memoryMessages: ChatMessage[] = memory.map(toChatMessage);
  const transcriptMessages: ChatMessage[] = transcript.map(toChatMessage);

  const messages: ChatMessage[] = [
    { role: "system", content: system },
    ...memoryMessages,
    ...transcriptMessages,
  ];

  return {
    system,
    messages,
    userMessages: messages.filter((m) => m.role !== "system"),
  };
}

function toChatMessage(turn: TurnMessage): ChatMessage {
  return {
    role: turn.role === "agent" ? "assistant" : "user",
    content: turn.content,
  };
}

function formatToneLine(persona: Persona): string {
  const { warmth, formality, length } = persona.tone;
  return [
    `Tone profile: warmth ${pct(warmth)}, formality ${pct(formality)}, length ${pct(length)}.`,
    "Match these dials. Keep the response to one or two sentences regardless.",
  ].join(" ");
}

function pct(n: number): string {
  return `${Math.round(Math.max(0, Math.min(1, n)) * 100)}%`;
}

function substituteVariables(template: string, vars: Record<string, string>): string {
  return template.replace(PLACEHOLDER_RE, (match, key: string) => {
    if (Object.prototype.hasOwnProperty.call(vars, key)) {
      return vars[key];
    }
    // Strip unknown placeholders rather than leaking "$KEY$" to the model.
    return "(unspecified)";
  });
}
