/** Single item in the Daily Agenda. */
export interface AgendaItem {
  id: string;
  time: string;
  title: string;
  type: "meeting" | "call" | "review" | "focus";
  duration: string;
}

/** Single item in the Action Log. */
export interface ActionItem {
  id: string;
  type: "calendar" | "email" | "task" | "agenda";
  title: string;
  description: string;
  time: string;
  status: "completed" | "pending" | "scheduled";
}

/** Parsed structured output from the assistant (when it creates actions/agenda). */
export interface ConversationStructuredOutput {
  actions?: Array<{
    type: ActionItem["type"];
    title: string;
    description: string;
    status?: ActionItem["status"];
  }>;
  agendaItems?: Array<{
    time: string;
    title: string;
    type: AgendaItem["type"];
    duration: string;
  }>;
}

const JSON_BLOCK_REGEX = /```(?:json)?\s*([\s\S]*?)```/g;

/**
 * Strip a ```json ... ``` block from the assistant reply and parse it.
 * Looks for the last such block so trailing text (e.g. newlines) doesn't break parsing.
 * Returns { replyText: message without the block, output: parsed structured data or null }.
 */
export function parseStructuredOutput(reply: string): {
  replyText: string;
  output: ConversationStructuredOutput | null;
} {
  const trimmed = reply.trim();
  let lastMatch: RegExpExecArray | null = null;
  let m: RegExpExecArray | null;
  while ((m = JSON_BLOCK_REGEX.exec(trimmed)) !== null) {
    lastMatch = m;
  }
  if (!lastMatch) {
    return { replyText: trimmed, output: null };
  }
  const jsonStr = lastMatch[1].trim();
  const replyText = trimmed.slice(0, lastMatch.index).trim();
  try {
    const parsed = JSON.parse(jsonStr) as ConversationStructuredOutput;
    if (parsed && typeof parsed === "object") {
      return { replyText, output: parsed };
    }
  } catch {
    // ignore invalid JSON
  }
  return { replyText, output: null };
}
