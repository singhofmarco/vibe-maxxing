"use client";

import { useState } from "react";
import { ChevronDown, Zap, Hand } from "lucide-react";

const toneOptions = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "concise", label: "Concise" },
  { value: "detailed", label: "Detailed" },
];

export function AssistantControls() {
  const [tone, setTone] = useState("professional");
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const selectedTone = toneOptions.find((t) => t.value === tone);

  return (
    <div className="flex items-center justify-center gap-6">
      {/* Tone Selection Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <span className="text-muted-foreground">Tone:</span>
          <span>{selectedTone?.label}</span>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isDropdownOpen && (
          <div className="absolute left-0 top-full z-50 mt-2 w-48 rounded-lg border border-border bg-card py-1 shadow-xl">
            {toneOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setTone(option.value);
                  setIsDropdownOpen(false);
                }}
                className={`flex w-full items-center px-4 py-2.5 text-sm transition-colors ${
                  tone === option.value
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Automation Mode Toggle */}
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-2">
        <button
          onClick={() => setIsAutoMode(false)}
          className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            !isAutoMode
              ? "bg-secondary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Hand className="h-4 w-4" />
          Manual
        </button>
        <button
          onClick={() => setIsAutoMode(true)}
          className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            isAutoMode
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Zap className="h-4 w-4" />
          Auto
        </button>
      </div>
    </div>
  );
}
