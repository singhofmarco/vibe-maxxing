"use client";

import { VoiceInput } from "@/components/voice-input";
import { AssistantControls } from "@/components/assistant-controls";
import { ActionLog } from "@/components/action-log";
import { SummaryCards } from "@/components/summary-cards";
import { DailyAgenda } from "@/components/daily-agenda";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back. Here is your daily summary.
        </p>
      </div>

      {/* Summary Cards */}
      <SummaryCards />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Voice Input Section */}
        <div className="space-y-6 xl:col-span-2">
          {/* Controls */}
          <AssistantControls />

          {/* Voice Input */}
          <div className="rounded-xl border border-border bg-card p-8">
            <VoiceInput />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <DailyAgenda />
          <ActionLog />
        </div>
      </div>
    </div>
  );
}
