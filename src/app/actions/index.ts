"use server";

import { getAnthropicClient } from "@/lib/anthropic";

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
