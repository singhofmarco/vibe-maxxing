"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, MicOff, Play, Pause, Volume2, Loader2, RotateCcw } from "lucide-react";
import { transcribeVoiceRecording, getAssistantReply, synthesizeAssistantSpeech } from "@/app/actions";
import type { ConversationMessage } from "@/lib/conversation";
import type { ConversationStructuredOutput } from "@/lib/dashboard-types";
import { parseStructuredOutput } from "@/lib/dashboard-types";
import { VOICE_RECORDING_FORM_KEY } from "@/lib/voice";

interface VoiceInputProps {
  onTranscriptChange?: (transcript: string) => void;
  onConversationActions?: (data: ConversationStructuredOutput) => void;
}

export function VoiceInput({ onTranscriptChange, onConversationActions }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGettingReply, setIsGettingReply] = useState(false);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioUrlRef = useRef<string | null>(null);

  const startRecording = useCallback(async () => {
    setTranscriptError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start(200);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not access microphone";
      setTranscriptError(message);
    }
  }, []);

  const stopRecordingAndTranscribe = useCallback(async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      setIsRecording(false);
      return;
    }

    recorder.stop();
    mediaRecorderRef.current = null;
    setIsRecording(false);
    setIsTranscribing(true);
    setTranscriptError(null);

    try {
      const chunks = chunksRef.current;
      if (chunks.length === 0) {
        setTranscriptError("No audio recorded");
        setIsTranscribing(false);
        return;
      }

      const blob = new Blob(chunks, { type: "audio/webm" });
      const formData = new FormData();
      formData.append(VOICE_RECORDING_FORM_KEY, blob, "recording.webm");

      const result = await transcribeVoiceRecording(formData);
      setIsTranscribing(false);

      if (!result.success || result.transcript === undefined) {
        setTranscriptError(result.error ?? "Transcription failed");
        return;
      }
      if (!result.transcript.trim()) {
        setTranscriptError("No speech detected. Try again.");
        return;
      }

      const userMessage: ConversationMessage = {
        role: "user",
        content: result.transcript,
      };
      onTranscriptChange?.(result.transcript);

      const newMessages: ConversationMessage[] = [
        ...conversation,
        userMessage,
      ];
      setConversation(newMessages);

      setIsGettingReply(true);
      setTranscriptError(null);

      const replyResult = await getAssistantReply(newMessages);
      setIsGettingReply(false);

      if (replyResult.success && replyResult.reply !== undefined) {
        const rawReply = replyResult.reply ?? "";
        const { replyText, output } = parseStructuredOutput(rawReply);
        setConversation((prev) => [
          ...prev,
          { role: "assistant", content: replyText || rawReply },
        ]);

        if (output) {
          onConversationActions?.(output);
        }

        const textForTTS = replyText.trim() || rawReply.trim();
        if (textForTTS) {
          try {
            const ttsResult = await synthesizeAssistantSpeech(textForTTS);
            if (ttsResult.success && ttsResult.audioBase64) {
              const binary = atob(ttsResult.audioBase64);
              const bytes = new Uint8Array(binary.length);
              for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
              const blob = new Blob([bytes], { type: "audio/mpeg" });
              if (currentAudioUrlRef.current) {
                URL.revokeObjectURL(currentAudioUrlRef.current);
              }
              const url = URL.createObjectURL(blob);
              currentAudioUrlRef.current = url;
              setIsPlaying(true);
              const audio = new Audio(url);
              audioRef.current = audio;
              audio.onended = () => {
                setIsPlaying(false);
                audioRef.current = null;
              };
              audio.onerror = () => {
                setIsPlaying(false);
                audioRef.current = null;
              };
              await audio.play();
            }
          } catch {
            // TTS failed; text is still shown, just no auto-play
          }
        }
      } else {
        const err = replyResult.error ?? "Could not get assistant reply";
        const isBalanceError =
          /insufficient balance|insufficient_quota|1008/i.test(err);
        setTranscriptError(
          isBalanceError
            ? "Assistant API has insufficient balance or quota. Check your API key and account."
            : err
        );
      }
    } catch (err) {
      setIsTranscribing(false);
      setIsGettingReply(false);
      const message =
        err instanceof Error ? err.message : "Transcription failed";
      setTranscriptError(message);
    }
  }, [conversation, onTranscriptChange, onConversationActions]);

  const toggleRecording = () => {
    if (isRecording) {
      stopRecordingAndTranscribe();
    } else {
      startRecording();
    }
  };

  const playLatestAssistantAudio = useCallback(async () => {
    const url = currentAudioUrlRef.current;
    if (url) {
      setIsPlaying(true);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        setIsPlaying(false);
        audioRef.current = null;
      };
      audio.onerror = () => {
        setIsPlaying(false);
        audioRef.current = null;
      };
      await audio.play();
    }
  }, []);

  useEffect(() => {
    return () => {
      if (currentAudioUrlRef.current) {
        URL.revokeObjectURL(currentAudioUrlRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const isLoading = isTranscribing || isGettingReply;

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Main Microphone Button */}
      <button
        type="button"
        onClick={toggleRecording}
        disabled={isLoading}
        className={`group relative flex h-32 w-32 items-center justify-center rounded-full transition-all duration-300 ${
          isRecording
            ? "bg-destructive shadow-[0_0_60px_rgba(239,68,68,0.4)]"
            : "bg-primary shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:shadow-[0_0_60px_rgba(59,130,246,0.5)] disabled:opacity-70 disabled:cursor-not-allowed"
        }`}
      >
        {isLoading ? (
          <Loader2 className="h-12 w-12 text-primary-foreground animate-spin" />
        ) : isRecording ? (
          <MicOff className="h-12 w-12 text-destructive-foreground" />
        ) : (
          <Mic className="h-12 w-12 text-primary-foreground transition-transform group-hover:scale-110" />
        )}

        {isRecording && (
          <>
            <span className="absolute inset-0 animate-ping rounded-full bg-destructive opacity-25" />
            <span className="absolute inset-0 animate-pulse rounded-full bg-destructive opacity-20" />
          </>
        )}
      </button>

      <p className="text-sm text-muted-foreground">
        {isTranscribing
          ? "Transcribing..."
          : isGettingReply
            ? "Assistant is thinking..."
            : isRecording
              ? "Listening... Tap again to stop"
              : "Tap to speak — we can go back and forth"}
      </p>

      {transcriptError && (
        <p className="text-sm text-destructive max-w-md text-center">
          {transcriptError}
        </p>
      )}

      {/* Conversation thread */}
      {conversation.length > 0 && (
        <div className="w-full max-w-2xl space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setConversation([]);
                if (currentAudioUrlRef.current) {
                  URL.revokeObjectURL(currentAudioUrlRef.current);
                  currentAudioUrlRef.current = null;
                }
                if (audioRef.current) {
                  audioRef.current.pause();
                  audioRef.current = null;
                }
                setIsPlaying(false);
              }}
              disabled={isLoading || isRecording}
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              <RotateCcw className="h-3 w-3" />
              New conversation
            </button>
          </div>
          {conversation.map((msg, i) => (
            <div
              key={i}
              className={`rounded-xl border border-border bg-card p-6 ${
                msg.role === "user"
                  ? "border-accent/50"
                  : "border-primary/20"
              }`}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      msg.role === "user" ? "bg-accent" : "bg-primary"
                    }`}
                  />
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {msg.role === "user" ? "You" : "Assistant"}
                  </span>
                </div>
                {msg.role === "assistant" && (
                  <button
                    type="button"
                    onClick={() => {
                      if (isPlaying && audioRef.current) {
                        audioRef.current.pause();
                        audioRef.current = null;
                        setIsPlaying(false);
                      } else {
                        playLatestAssistantAudio();
                      }
                    }}
                    className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    {isPlaying ? (
                      <Pause className="h-3 w-3" />
                    ) : (
                      <Play className="h-3 w-3" />
                    )}
                    <Volume2 className="h-3 w-3" />
                    {isPlaying ? "Playing..." : "Play"}
                  </button>
                )}
              </div>
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
