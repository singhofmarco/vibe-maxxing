"use server";

import { getAnthropicClient } from "@/lib/anthropic";
import { extractActionItems } from "@/lib/action-extraction";
import { randomUUID } from "crypto";

/**
 * Example server action using Anthropic SDK.
 * Replace with real personal-assistant logic when implementing features.
 */
export async function exampleAnthropicAction(prompt: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const anthropic = getAnthropicClient();
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });
    const text =
      message.content?.[0]?.type === "text"
        ? message.content[0].text
        : "No text response.";
    return { success: true, message: text };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

/** Action shape used by the actions page (matches UI state). */
export interface ActionItem {
  id: string;
  type: "calendar" | "email" | "task";
  title: string;
  description: string;
  status: "pending" | "ready" | "completed";
  canAutomate: boolean;
  details?: string;
}

/**
 * Extract action items from raw text (brain dump).
 * Input-agnostic: same API for textbox input or future voice transcript.
 */
export async function extractActionsFromInput(rawInput: string): Promise<{
  success: boolean;
  actions?: ActionItem[];
  error?: string;
}> {
  try {
    const extracted = await extractActionItems(rawInput);
    const actions: ActionItem[] = extracted.map((item) => ({
      id: randomUUID(),
      type: item.type,
      title: item.title,
      description: item.description,
      status: "pending" as const,
      canAutomate: item.canAutomate,
      details: item.details,
    }));
    return { success: true, actions };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}
