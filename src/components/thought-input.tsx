"use client";

import { useState, useCallback } from "react";
import { Send, Loader2, Mic } from "lucide-react";
import { extractActionsFromInput, type ActionItem } from "@/app/actions";

interface ThoughtInputProps {
  /** Called when actions are extracted so the parent can add them (e.g. to the actions list). */
  onActionsExtracted?: (actions: ActionItem[]) => void;
  placeholder?: string;
  className?: string;
}

export function ThoughtInput({
  onActionsExtracted,
  placeholder = "Dump your thoughts here… meetings to schedule, emails to send, tasks to do…",
  className = "",
}: ThoughtInputProps) {
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;

    setIsLoading(true);
    setError(null);
    try {
      const result = await extractActionsFromInput(trimmed);
      if (result.success && result.actions?.length) {
        onActionsExtracted?.(result.actions);
        setValue("");
      } else if (!result.success && result.error) {
        setError(result.error);
      } else if (result.success && (!result.actions || result.actions.length === 0)) {
        setError("No action items found. Try being more specific.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [value, isLoading, onActionsExtracted]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex min-h-[52px] items-stretch gap-0 overflow-hidden rounded-lg border border-border/80 bg-muted/30 transition-colors focus-within:border-border focus-within:bg-muted/50 focus-within:ring-1 focus-within:ring-border">
        {/* Mic button — visual only for now */}
        <button
          type="button"
          className="flex shrink-0 items-center justify-center px-4 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          aria-label="Voice input (coming soon)"
        >
          <Mic className="h-5 w-5" />
        </button>

        <div className="h-px w-px self-stretch bg-border/80" aria-hidden />

        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          rows={2}
          className="min-h-[50px] flex-1 resize-none border-0 bg-transparent px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 disabled:opacity-60"
          aria-label="Thoughts / brain dump"
        />

        <div className="h-px w-px self-stretch bg-border/80" aria-hidden />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!value.trim() || isLoading}
          className="flex shrink-0 items-center justify-center px-4 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
          aria-label="Extract action items"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </div>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <p className="text-xs text-muted-foreground/80">
        Cmd+Enter or Ctrl+Enter to extract actions
      </p>
    </div>
  );
}
