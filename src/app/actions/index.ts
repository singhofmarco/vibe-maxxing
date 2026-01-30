"use server";

import { getAnthropicClient } from "@/lib/anthropic";
import { extractActionItems } from "@/lib/action-extraction";
import { randomUUID } from "crypto";
import type { ConversationMessage } from "@/lib/conversation";
import { ASSISTANT_SYSTEM_PROMPT } from "@/lib/conversation";
import type { ConversationStructuredOutput } from "@/lib/dashboard-types";
import { transcribeAudio, synthesizeSpeech } from "@/lib/elevenlabs";
import { VOICE_RECORDING_FORM_KEY } from "@/lib/voice";

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

/** Shape of actions array in ConversationStructuredOutput (dashboard). */
type ConversationAction = NonNullable<ConversationStructuredOutput["actions"]>[number];

/**
 * Extract action items from full conversation text (voice fallback).
 * Use when the assistant reply did not include a JSON block; runs extraction on the conversation.
 */
export async function extractActionsFromConversation(
  messages: ConversationMessage[]
): Promise<{
  success: boolean;
  actions?: ConversationAction[];
  error?: string;
}> {
  try {
    if (messages.length === 0) return { success: true, actions: [] };
    const text = messages
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n\n");
    const extracted = await extractActionItems(text);
    const actions: ConversationAction[] = extracted.map((item) => ({
      type: item.type as ConversationAction["type"],
      title: item.title,
      description: item.description,
      status: "pending" as const,
    }));
    return { success: true, actions };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Extraction failed";
    return { success: false, error: message };
  }
}

/**
 * Get the next assistant reply in a conversation. Pass the full message history
 * (user + assistant turns). Uses Anthropic (Minimax) for conversational reasoning.
 */
export async function getAssistantReply(
  messages: ConversationMessage[]
): Promise<{ success: boolean; reply?: string; error?: string }> {
  try {
    if (messages.length === 0) {
      return { success: false, error: "No messages" };
    }
    const anthropic = getAnthropicClient();
    const apiMessages = messages.map((m) => ({
      role: m.role === "user" ? ("user" as const) : ("assistant" as const),
      content: m.content,
    }));
    const response = await anthropic.messages.create({
      model: "MiniMax-M2.1",
      max_tokens: 1024,
      system: ASSISTANT_SYSTEM_PROMPT,
      messages: apiMessages,
    });
    let text = "";
    for (const block of response.content ?? []) {
      if (block.type === "text" && "text" in block) {
        text += block.text;
      }
    }
    return { success: true, reply: text.trim() || "" };
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

/**
 * Transcribe voice recording and extract action items from the transcript
 * using the existing extraction logic (Anthropic/Minimax). One round-trip for voice → transcript + actions.
 */
export async function transcribeAndExtractActions(formData: FormData): Promise<{
  success: boolean;
  transcript?: string;
  actions?: ActionItem[];
  error?: string;
}> {
  try {
    const transcribeResult = await transcribeVoiceRecording(formData);
    if (!transcribeResult.success || transcribeResult.transcript === undefined) {
      return {
        success: false,
        error: transcribeResult.error ?? "Transcription failed",
      };
    }
    const transcript = transcribeResult.transcript.trim();
    if (!transcript) {
      return {
        success: true,
        transcript: "",
        actions: [],
      };
    }
    const extracted = await extractActionItems(transcript);
    const actionList: ActionItem[] = extracted.map((item) => ({
      id: randomUUID(),
      type: item.type,
      title: item.title,
      description: item.description,
      status: "pending" as const,
      canAutomate: item.canAutomate,
      details: item.details,
    }));
    return { success: true, transcript, actions: actionList };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Transcribe and extract failed";
    return { success: false, error: message };
  }
}
