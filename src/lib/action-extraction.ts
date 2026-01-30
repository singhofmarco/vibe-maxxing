import { getAnthropicClient } from "@/lib/anthropic";

/**
 * Input-agnostic action extraction.
 * Accepts raw text from any source (textbox, voice transcript, etc.)
 * so the UI can stay decoupled from the LLM (Anthropic today, Minimax or others later).
 */

export type ExtractedActionType = "calendar" | "email" | "task";

export interface ExtractedAction {
  type: ExtractedActionType;
  title: string;
  description: string;
  canAutomate: boolean;
  details?: string;
}

const EXTRACTION_SYSTEM = `You are an executive assistant. Extract action items from the user's raw thoughts or brain dump.

Return a JSON array of actions. Each action must have:
- type: one of "calendar", "email", "task"
- title: short action title
- description: one line describing what to do (e.g. "Tomorrow at 2pm with marketing@company.com", "Re: Project update to client@example.com")
- canAutomate: true if we can create a calendar event, send an email, or create a task; false for manual-only items
- details: optional extra context (e.g. draft subject line, suggested time)

Be concise. Only output valid JSON, no markdown or extra text.`;

export async function extractActionItems(
  rawInput: string
): Promise<ExtractedAction[]> {
  if (!rawInput?.trim()) return [];

  const anthropic = getAnthropicClient();
  const message = await anthropic.messages.create({
    model: "MiniMax-M2.1",
    max_tokens: 1024,
    system: EXTRACTION_SYSTEM,
    messages: [
      {
        role: "user",
        content: `Extract action items from this:\n\n${rawInput.trim()}`,
      },
    ],
  });

  // Iterate content blocks: log thinking, collect text (same pattern as Python)
  let text = "";
  for (const block of message.content ?? []) {
    if (block.type === "thinking" && "thinking" in block) {
      console.log("[action-extraction] Thinking:\n", block.thinking);
    } else if (block.type === "text" && "text" in block) {
      text += block.text;
    }
  }

  // Debug: log raw model output (shows in server terminal)
  console.log("[action-extraction] raw model output:", JSON.stringify(text));
  console.log("[action-extraction] raw length:", text?.length ?? 0);

  const json = text.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();

  // Try to extract JSON array if response has extra text (e.g. markdown or prose)
  let jsonToParse = json;
  const arrayMatch = json.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    jsonToParse = arrayMatch[0];
  }

  if (!jsonToParse) {
    console.warn("[action-extraction] no content to parse, raw:", text);
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonToParse);
  } catch (err) {
    console.error("[action-extraction] JSON parse error:", err);
    console.error("[action-extraction] attempted to parse:", jsonToParse);
    return [];
  }

  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter(
      (item: unknown): item is ExtractedAction =>
        typeof item === "object" &&
        item !== null &&
        "type" in item &&
        "title" in item &&
        "description" in item &&
        ["calendar", "email", "task"].includes((item as ExtractedAction).type)
    )
    .map((item) => ({
      type: item.type as ExtractedActionType,
      title: String(item.title ?? ""),
      description: String(item.description ?? ""),
      canAutomate: Boolean(item.canAutomate ?? true),
      details: item.details != null ? String(item.details) : undefined,
    }));
}
