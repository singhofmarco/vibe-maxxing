import Anthropic from "@anthropic-ai/sdk";

/**
 * Server-side Anthropic client. Use only in server components and server actions.
 * Requires ANTHROPIC_API_KEY in environment.
 * Configured to use Minimax API endpoint.
 */
export function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  return new Anthropic({ 
    apiKey,
    baseURL: "https://api.minimax.io/v1"
  });
}
