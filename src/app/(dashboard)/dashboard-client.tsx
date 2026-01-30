"use client";

import { useState, useCallback } from "react";
import { VoiceInput } from "@/components/voice-input";
import { AssistantControls } from "@/components/assistant-controls";
import { ActionLog } from "@/components/action-log";
import { SummaryCards } from "@/components/summary-cards";
import { DailyAgenda } from "@/components/daily-agenda";
import type {
  AgendaItem,
  ActionItem,
  ConversationStructuredOutput,
} from "@/lib/dashboard-types";

function nextId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function DashboardClient() {
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);

  const onConversationActions = useCallback((data: ConversationStructuredOutput) => {
    if (data.actions?.length) {
      const newActions: ActionItem[] = data.actions.map((a) => ({
        id: nextId("action"),
        type: a.type,
        title: a.title,
        description: a.description ?? "",
        time: "just now",
        status: (a.status as ActionItem["status"]) ?? "scheduled",
      }));
      setActionItems((prev) => [...newActions, ...prev]);
    }
    if (data.agendaItems?.length) {
      const newAgenda: AgendaItem[] = data.agendaItems.map((a) => ({
        id: nextId("agenda"),
        time: a.time,
        title: a.title,
        type: a.type,
        duration: a.duration ?? "30 min",
      }));
      setAgendaItems((prev) => [...newAgenda, ...prev]);
    }
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back. Here is your daily summary.
        </p>
      </div>
      <SummaryCards />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <AssistantControls />
          <div className="rounded-xl border border-border bg-card p-8">
            <VoiceInput onConversationActions={onConversationActions} />
          </div>
        </div>
        <div className="space-y-6">
          <DailyAgenda items={agendaItems} />
          <ActionLog items={actionItems} />
        </div>
      </div>
    </div>
  );
}
