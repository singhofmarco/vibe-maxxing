"use client";

import { Calendar, Mail, CheckSquare, ChevronRight, Inbox } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, query, where, orderBy, limit, onSnapshot, Timestamp } from "firebase/firestore";
import { getFirebaseFirestore } from "@/lib/firebase";
import { useAuth } from "@/context/auth-context";
import type { Action, ActionType, ActionStatus } from "@/lib/types";
import Link from "next/link";

type DisplayType = "calendar" | "email" | "task";

const iconMap: Record<DisplayType, typeof Calendar> = {
  calendar: Calendar,
  email: Mail,
  task: CheckSquare,
};

const colorMap: Record<DisplayType, string> = {
  calendar: "bg-primary/10 text-primary",
  email: "bg-accent/10 text-accent",
  task: "bg-amber-500/10 text-amber-500",
};

const statusMap: Record<ActionStatus, string> = {
  completed: "bg-accent/20 text-accent",
  pending: "bg-amber-500/20 text-amber-500",
  scheduled: "bg-primary/20 text-primary",
  sent: "bg-accent/20 text-accent",
  failed: "bg-red-500/20 text-red-500",
};

function mapActionTypeToDisplay(type: ActionType): DisplayType {
  switch (type) {
    case "calendar_event":
      return "calendar";
    case "email":
      return "email";
    case "task":
      return "task";
  }
}

function formatTimeAgo(timestamp: Timestamp): string {
  const now = new Date();
  const date = timestamp.toDate();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

export function ActionLog() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [actions, setActions] = useState<Action[]>([]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const db = getFirebaseFirestore();
    if (!db) {
      setLoading(false);
      return;
    }

    const actionsRef = collection(db, "actions");
    const q = query(
      actionsRef,
      where("userId", "==", user.uid),
      orderBy("timestamp", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedActions: Action[] = [];
        snapshot.forEach((docSnap) => {
          fetchedActions.push({
            id: docSnap.id,
            ...docSnap.data(),
          } as Action);
        });
        setActions(fetchedActions);
      },
      (error) => {
        console.error("Error fetching actions:", error);
      }
    );
    setLoading(false);

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold text-foreground">Action Log</h3>
        <Link
          href="/actions"
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          View all
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="divide-y divide-border">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4 px-5 py-4">
              <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                <div className="h-3 w-48 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))
        ) : actions.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
              <Inbox className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">No actions yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Start a voice session to create actions
            </p>
          </div>
        ) : (
          // Actions list
          actions.map((action) => {
            const displayType = mapActionTypeToDisplay(action.type);
            const Icon = iconMap[displayType];
            return (
              <div
                key={action.id}
                className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-secondary/50"
              >
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${colorMap[displayType]}`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-foreground">
                      {action.title}
                    </p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusMap[action.status]}`}
                    >
                      {action.status}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {action.description}
                  </p>
                </div>

                <span className="flex-shrink-0 text-xs text-muted-foreground">
                  {formatTimeAgo(action.timestamp)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
