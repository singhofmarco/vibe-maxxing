/**
 * Server-side Minimax client for chat completion (OpenAI-compatible API).
 * Use only in server components and server actions.
 * Requires MINIMAX_API_KEY in environment.
 * @see https://platform.minimax.io/docs/api-reference/text-openai-api
 */

const MINIMAX_CHAT_URL = "https://api.minimax.io/v1/chat/completions";

export type MinimaxChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

function getApiKey(): string {
  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) {
    throw new Error("MINIMAX_API_KEY is not set");
  }
  return apiKey;
}

/**
 * Call Minimax chat completion (OpenAI-compatible). Supports multi-turn via messages.
 */
export async function createChatCompletion(
  messages: MinimaxChatMessage[],
  options?: {
    model?: string;
    max_tokens?: number;
    temperature?: number;
  }
): Promise<string> {
  const apiKey = getApiKey();
  const model = options?.model ?? "MiniMax-M2";
  const max_tokens = options?.max_tokens ?? 1024;
  const temperature = options?.temperature ?? 0.7;

  const response = await fetch(MINIMAX_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens,
      temperature: Math.min(1, Math.max(0.01, temperature)),
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    let message = `Minimax API error: ${response.status}`;
    try {
      const parsed = JSON.parse(errBody);
      if (parsed.error?.message) message = parsed.error.message;
      else if (parsed.message) message = parsed.message;
    } catch {
      if (errBody) message += ` ${errBody.slice(0, 200)}`;
    }
    throw new Error(message);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content ?? "";
  return text.trim();
}
