"use client";

import { useState, useEffect } from "react";
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
import { usePendingActions } from "@/app/(dashboard)/pending-actions-context";

interface Action {
  id: string;
  type: "calendar" | "email" | "task";
  title: string;
  description: string;
  status: "pending" | "ready" | "completed";
  canAutomate: boolean;
  details?: string;
}

const initialActions: Action[] = [
  {
    id: "1",
    type: "calendar",
    title: "Schedule Marketing Team Sync",
    description: "Tomorrow at 2:00 PM with marketing@company.com",
    status: "ready",
    canAutomate: true,
    details: "Google Calendar event with video conferencing link",
  },
  {
    id: "2",
    type: "email",
    title: "Send Client Follow-up Email",
    description: "Re: Project Timeline Update to client@example.com",
    status: "pending",
    canAutomate: true,
    details:
      "Draft email ready for review. Subject: Project Timeline Update - Q1 Deliverables",
  },
  {
    id: "3",
    type: "task",
    title: "Review Q4 Financial Reports",
    description: "High priority - Due by end of week",
    status: "pending",
    canAutomate: false,
  },
  {
    id: "4",
    type: "email",
    title: "Send Weekly Newsletter",
    description: "To team@company.com with project updates",
    status: "ready",
    canAutomate: true,
    details: "Newsletter content generated from this week's activity",
  },
  {
    id: "5",
    type: "calendar",
    title: "Block Focus Time",
    description: "Friday 1:00 PM - 4:00 PM",
    status: "pending",
    canAutomate: true,
  },
  {
    id: "6",
    type: "task",
    title: "Prepare Board Presentation",
    description: "Slides needed for Monday meeting",
    status: "pending",
    canAutomate: false,
  },
];

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

export default function ActionsPage() {
  const [actions, setActions] = useState<Action[]>(initialActions);
  const [filter, setFilter] = useState<"all" | "calendar" | "email" | "task">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { pendingActions, setPendingActions } = usePendingActions();

  // Merge actions from layout ThoughtInput (dashboard or any page)
  useEffect(() => {
    if (pendingActions.length === 0) return;
    setActions((prev) => [...pendingActions, ...prev]);
    setPendingActions([]);
  }, [pendingActions, setPendingActions]);

  const filteredActions =
    filter === "all" ? actions : actions.filter((a) => a.type === filter);

  const executeAction = (id: string) => {
    setActions((prev) =>
      prev.map((action) =>
        action.id === id ? { ...action, status: "completed" as const } : action
      )
    );
  };

  const deleteAction = (id: string) => {
    setActions((prev) => prev.filter((action) => action.id !== id));
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
          {pendingCount} pending actions, {automateableCount} can be automated
        </p>
      </div>

      {/* Filters */}
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
            {type === "all"
              ? "All"
              : type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Actions List */}
      <div className="space-y-3">
        {filteredActions.map((action) => {
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
                    onClick={() => deleteAction(action.id)}
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
        })}

        {filteredActions.length === 0 && (
          <div className="rounded-xl border border-border bg-card py-12 text-center">
            <p className="text-muted-foreground">No actions found</p>
          </div>
        )}
      </div>
    </div>
  );
}
