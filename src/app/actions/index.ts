"use server";

import { getAnthropicClient } from "@/lib/anthropic";
import { extractActionItems } from "@/lib/action-extraction";
import { randomUUID } from "crypto";
import type { ConversationMessage } from "@/lib/conversation";
import { ASSISTANT_SYSTEM_PROMPT } from "@/lib/conversation";
import { createChatCompletion } from "@/lib/openai";
import type { OpenAIChatMessage } from "@/lib/openai";
import { transcribeAudio, synthesizeSpeech } from "@/lib/elevenlabs";
import { VOICE_RECORDING_FORM_KEY } from "@/lib/voice";

/**
 * Example server action using OpenAI for conversational AI.
 */
export async function exampleOpenAIAction(prompt: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const reply = await createChatCompletion(
      [
        { role: "system", content: "You are a helpful executive assistant. Reply briefly." },
        { role: "user", content: prompt },
      ],
      { max_tokens: 512 }
    );
    return { success: true, message: reply || "No response." };
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

/**
 * Get the next assistant reply in a conversation. Pass the full message history
 * (user + assistant turns); OpenAI is used for conversational reasoning.
 */
export async function getAssistantReply(
  messages: ConversationMessage[]
): Promise<{ success: boolean; reply?: string; error?: string }> {
  try {
    if (messages.length === 0) {
      return { success: false, error: "No messages" };
    }
    const apiMessages: OpenAIChatMessage[] = [
      { role: "system", content: ASSISTANT_SYSTEM_PROMPT },
      ...messages.map((m) => ({
        role: m.role === "user" ? ("user" as const) : ("assistant" as const),
        content: m.content,
      })),
    ];
    const reply = await createChatCompletion(apiMessages, { max_tokens: 1024 });
    return { success: true, reply: reply ?? "" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Assistant error";
    return { success: false, error: message };
  }
}

/**
 * Synthesize assistant reply as speech (ElevenLabs TTS). Returns base64 audio for playback.
 */
export async function synthesizeAssistantSpeech(text: string): Promise<{
  success: boolean;
  audioBase64?: string;
  error?: string;
}> {
  try {
    if (!text?.trim()) {
      return { success: false, error: "No text to synthesize" };
    }
    const buffer = await synthesizeSpeech(text);
    const base64 = Buffer.from(buffer).toString("base64");
    return { success: true, audioBase64: base64 };
  } catch (err) {
    const message = err instanceof Error ? err.message : "TTS failed";
    return { success: false, error: message };
  }
}

/**
 * Transcribe voice recording via ElevenLabs Speech-to-Text.
 * Expects FormData with a single file under key VOICE_RECORDING_FORM_KEY (e.g. "audio").
 */
export async function transcribeVoiceRecording(formData: FormData): Promise<{
  success: boolean;
  transcript?: string;
  error?: string;
}> {
  try {
    const file = formData.get(VOICE_RECORDING_FORM_KEY);
    if (!file || !(file instanceof Blob)) {
      return { success: false, error: "No audio file in request" };
    }
    if (file.size === 0) {
      return { success: false, error: "Audio file is empty" };
    }

    const result = await transcribeAudio(file, {
      modelId: "scribe_v2",
      tagAudioEvents: true,
    });

    return {
      success: true,
      transcript: result.text?.trim() ?? "",
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Transcription failed";
    return { success: false, error: message };
  }
}
