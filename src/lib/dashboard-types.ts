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

const JSON_BLOCK_REGEX = /```(?:json)?\s*([\s\S]*?)```\s*$/;

/**
 * Strip a trailing ```json ... ``` block from the assistant reply and parse it.
 * Returns { replyText: message without the block, output: parsed structured data or null }.
 */
export function parseStructuredOutput(reply: string): {
  replyText: string;
  output: ConversationStructuredOutput | null;
} {
  const match = reply.trim().match(JSON_BLOCK_REGEX);
  if (!match) {
    return { replyText: reply.trim(), output: null };
  }
  const jsonStr = match[1].trim();
  const replyText = reply.slice(0, match.index).trim();
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
