"use client";

import { useCallback } from "react";
import { VoiceInput } from "@/components/voice-input";
import { AssistantControls } from "@/components/assistant-controls";
import { ActionLog } from "@/components/action-log";
import { SummaryCards } from "@/components/summary-cards";
import { DailyAgenda } from "@/components/daily-agenda";
import type { ConversationStructuredOutput } from "@/lib/dashboard-types";
import { getFirebaseFirestore } from "@/lib/firebase";
import { saveAction, saveAgendaItem } from "@/lib/firebase-actions";
import { useAuth } from "@/context/auth-context";

export function DashboardClient() {
  const { user } = useAuth();

  const onConversationActions = useCallback(
    async (data: ConversationStructuredOutput) => {
      const db = getFirebaseFirestore();
      if (!db || !user) return;

      if (data.actions?.length) {
        for (const a of data.actions) {
          try {
            await saveAction(db, user.uid, {
              type: a.type,
              title: a.title,
              description: a.description ?? "",
              status: a.status,
            });
          } catch (err) {
            console.error("Failed to save action:", err);
          }
        }
      }
      if (data.agendaItems?.length) {
        for (const a of data.agendaItems) {
          try {
            await saveAgendaItem(db, user.uid, {
              time: a.time,
              title: a.title,
              type: a.type,
              duration: a.duration ?? "30 min",
            });
          } catch (err) {
            console.error("Failed to save agenda item:", err);
          }
        }
      }
    },
    [user]
  );

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
          <DailyAgenda />
          <ActionLog />
        </div>
      </div>
    </div>
  );
}
