"use client";

import { useState } from "react";
import { Mic, MicOff, Play, Pause, Volume2 } from "lucide-react";

interface VoiceInputProps {
  onTranscriptChange?: (transcript: string) => void;
}

export function VoiceInput({ onTranscriptChange }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [assistantResponse, setAssistantResponse] = useState("");

  const toggleRecording = () => {
    if (!isRecording) {
      // Simulate starting recording
      setIsRecording(true);
      setTranscript("");
      setAssistantResponse("");
      
      // Simulate transcript appearing
      setTimeout(() => {
        const mockTranscript = "Schedule a meeting with the marketing team tomorrow at 2pm and send a follow-up email to the client about the project timeline.";
        setTranscript(mockTranscript);
        onTranscriptChange?.(mockTranscript);
      }, 2000);

      setTimeout(() => {
        setAssistantResponse("I've identified 2 actions from your request: scheduling a meeting with marketing for tomorrow at 2pm, and drafting a follow-up email about project timelines. Would you like me to proceed with both?");
      }, 3500);

      setTimeout(() => {
        setIsRecording(false);
      }, 4000);
    } else {
      setIsRecording(false);
    }
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      setTimeout(() => setIsPlaying(false), 3000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Main Microphone Button */}
      <button
        onClick={toggleRecording}
        className={`group relative flex h-32 w-32 items-center justify-center rounded-full transition-all duration-300 ${
          isRecording
            ? "bg-destructive shadow-[0_0_60px_rgba(239,68,68,0.4)]"
            : "bg-primary shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:shadow-[0_0_60px_rgba(59,130,246,0.5)]"
        }`}
      >
        {isRecording ? (
          <MicOff className="h-12 w-12 text-destructive-foreground" />
        ) : (
          <Mic className="h-12 w-12 text-primary-foreground transition-transform group-hover:scale-110" />
        )}
        
        {/* Pulse animation when recording */}
        {isRecording && (
          <>
            <span className="absolute inset-0 animate-ping rounded-full bg-destructive opacity-25" />
            <span className="absolute inset-0 animate-pulse rounded-full bg-destructive opacity-20" />
          </>
        )}
      </button>

      <p className="text-sm text-muted-foreground">
        {isRecording ? "Listening..." : "Tap to speak"}
      </p>

      {/* Transcript View */}
      {transcript && (
        <div className="w-full max-w-2xl rounded-xl border border-border bg-card p-6">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-accent" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Your Request
            </span>
          </div>
          <p className="text-foreground leading-relaxed">{transcript}</p>
        </div>
      )}

      {/* Assistant Response */}
      {assistantResponse && (
        <div className="w-full max-w-2xl rounded-xl border border-border bg-card p-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Assistant Response
              </span>
            </div>
            <button
              onClick={togglePlayback}
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
          </div>
          <p className="text-foreground leading-relaxed">{assistantResponse}</p>
        </div>
      )}
    </div>
  );
}
