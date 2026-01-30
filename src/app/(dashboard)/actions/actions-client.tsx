"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Mail,
  CheckSquare,
  Play,
  Trash2,
  Edit2,
  ChevronDown,
  Check,
} from "lucide-react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { getFirebaseFirestore } from "@/lib/firebase";
import { updateActionStatus, deleteAction } from "@/lib/firebase-actions";
import { useAuth } from "@/context/auth-context";
import type { Action, ActionType } from "@/lib/types";

interface ActionItem {
  id: string;
  type: "calendar" | "email" | "task";
  title: string;
  description: string;
  status: "pending" | "ready" | "completed";
  canAutomate: boolean;
  details?: string;
}

function firestoreTypeToUi(type: ActionType): ActionItem["type"] {
  if (type === "calendar_event") return "calendar";
  return type;
}

function firestoreStatusToUi(status: Action["status"]): ActionItem["status"] {
  if (status === "completed") return "completed";
  if (status === "scheduled") return "ready";
  return "pending";
}

const iconMap = {
  calendar: Calendar,
  email: Mail,
  task: CheckSquare,
};

const colorMap = {
  calendar: "bg-primary/10 text-primary",
  email: "bg-accent/10 text-accent",
  task: "bg-amber-500/10 text-amber-500",
};

const statusColors = {
  pending: "bg-muted text-muted-foreground",
  ready: "bg-primary/20 text-primary",
  completed: "bg-accent/20 text-accent",
};

export function ActionsClient() {
  const { user } = useAuth();
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "calendar" | "email" | "task">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: ActionItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Action;
          items.push({
            id: docSnap.id,
            type: firestoreTypeToUi(data.type),
            title: data.title,
            description: data.description ?? "",
            status: firestoreStatusToUi(data.status),
            canAutomate: true,
            details: (data.payload as { details?: string })?.details,
          });
        });
        setActions(items);
      },
      (error) => {
        console.error("Error fetching actions:", error);
      }
    );
    setLoading(false);

    return () => unsubscribe();
  }, [user]);

  const filteredActions =
    filter === "all" ? actions : actions.filter((a) => a.type === filter);

  const executeAction = async (id: string) => {
    const db = getFirebaseFirestore();
    if (!db) return;
    try {
      await updateActionStatus(db, id, "completed");
    } catch (err) {
      console.error("Failed to complete action:", err);
    }
  };

  const removeAction = async (id: string) => {
    const db = getFirebaseFirestore();
    if (!db) return;
    try {
      await deleteAction(db, id);
    } catch (err) {
      console.error("Failed to delete action:", err);
    }
  };

  const pendingCount = actions.filter((a) => a.status !== "completed").length;
  const automateableCount = actions.filter(
    (a) => a.canAutomate && a.status !== "completed"
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Actions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {loading ? "Loading..." : `${pendingCount} pending actions, ${automateableCount} can be automated`}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {(["all", "calendar", "email", "task"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === type
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-5 animate-pulse"
            >
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 rounded bg-muted" />
                  <div className="h-3 w-64 rounded bg-muted" />
                </div>
              </div>
            </div>
          ))
        ) : (
          filteredActions.map((action) => {
            const Icon = iconMap[action.type];
            const isExpanded = expandedId === action.id;
            const isCompleted = action.status === "completed";

            return (
              <div
                key={action.id}
                className={`rounded-xl border border-border bg-card transition-all ${
                  isCompleted ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start gap-4 p-5">
                  <div
                    className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg ${colorMap[action.type]}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <h3
                        className={`text-base font-medium ${
                          isCompleted
                            ? "text-muted-foreground line-through"
                            : "text-foreground"
                        }`}
                      >
                        {action.title}
                      </h3>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[action.status]}`}
                      >
                        {action.status}
                      </span>
                      {action.canAutomate && !isCompleted && (
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                          Automatable
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {action.description}
                    </p>

                    {action.details && isExpanded && (
                      <div className="mt-4 rounded-lg bg-muted p-4">
                        <p className="text-sm text-muted-foreground">
                          {action.details}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-shrink-0 items-center gap-2">
                    {!isCompleted && (
                      <>
                        {action.canAutomate && (
                          <button
                            onClick={() => executeAction(action.id)}
                            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                          >
                            <Play className="h-4 w-4" />
                            Execute
                          </button>
                        )}
                        <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                          <Edit2 className="h-4 w-4" />
                        </button>
                      </>
                    )}

                    {isCompleted && (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/20">
                        <Check className="h-5 w-5 text-accent" />
                      </div>
                    )}

                    <button
                      onClick={() => removeAction(action.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    {action.details && (
                      <button
                        onClick={() =>
                          setExpandedId(isExpanded ? null : action.id)
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      >
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {!loading && filteredActions.length === 0 && (
          <div className="rounded-xl border border-border bg-card py-12 text-center">
            <p className="text-muted-foreground">No actions found</p>
          </div>
        )}
      </div>
    </div>
  );
}
