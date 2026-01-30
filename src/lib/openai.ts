/**
 * Server-side OpenAI client for chat completion.
 * Use only in server components and server actions.
 * Requires OPENAI_API_KEY in environment.
 * @see https://platform.openai.com/docs/api-reference/chat/create
 */

const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";

export type OpenAIChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

function getApiKey(): string {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  return apiKey;
}

/**
 * Call OpenAI chat completion. Supports multi-turn via messages.
 */
export async function createChatCompletion(
  messages: OpenAIChatMessage[],
  options?: {
    model?: string;
    max_tokens?: number;
    temperature?: number;
  }
): Promise<string> {
  const apiKey = getApiKey();
  const model = options?.model ?? "gpt-4o-mini";
  const max_tokens = options?.max_tokens ?? 1024;
  const temperature = options?.temperature ?? 0.7;

  const response = await fetch(OPENAI_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens,
      temperature: Math.min(2, Math.max(0, temperature)),
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    let message = `OpenAI API error: ${response.status}`;
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
