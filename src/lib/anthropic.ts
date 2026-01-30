import Anthropic from "@anthropic-ai/sdk";

/**
 * Server-side Anthropic client. Use only in server components and server actions.
 * Requires MINIMAX_API_KEY in environment.
 * Configured to use Minimax API endpoint.
 */
export function getAnthropicClient(): Anthropic {
  const apiKey = process.env.MINIMAX_API_KEY;
  const baseURL = process.env.ANTHROPIC_BASE_URL;
  if (!apiKey) {
    throw new Error("MINIMAX_API_KEY is not set");
  }
  return new Anthropic({ 
    apiKey,
    baseURL
  });
}
