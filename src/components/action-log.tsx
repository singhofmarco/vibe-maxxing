"use client";

import { Calendar, Mail, CheckSquare, Clock, ChevronRight } from "lucide-react";

interface ActionItem {
  id: string;
  type: "calendar" | "email" | "task" | "agenda";
  title: string;
  description: string;
  time: string;
  status: "completed" | "pending" | "scheduled";
}

const mockActions: ActionItem[] = [
  {
    id: "1",
    type: "calendar",
    title: "Marketing Team Sync",
    description: "Scheduled for tomorrow at 2:00 PM",
    time: "2 min ago",
    status: "completed",
  },
  {
    id: "2",
    type: "email",
    title: "Client Follow-up Drafted",
    description: "Re: Project Timeline Update",
    time: "5 min ago",
    status: "pending",
  },
  {
    id: "3",
    type: "task",
    title: "Review Q4 Reports",
    description: "Added to your task list",
    time: "10 min ago",
    status: "completed",
  },
  {
    id: "4",
    type: "agenda",
    title: "Daily Standup",
    description: "In 30 minutes",
    time: "Today",
    status: "scheduled",
  },
];

const iconMap = {
  calendar: Calendar,
  email: Mail,
  task: CheckSquare,
  agenda: Clock,
};

const colorMap = {
  calendar: "bg-primary/10 text-primary",
  email: "bg-accent/10 text-accent",
  task: "bg-amber-500/10 text-amber-500",
  agenda: "bg-violet-500/10 text-violet-500",
};

const statusMap = {
  completed: "bg-accent/20 text-accent",
  pending: "bg-amber-500/20 text-amber-500",
  scheduled: "bg-primary/20 text-primary",
};

export function ActionLog() {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold text-foreground">Action Log</h3>
        <button className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
          View all
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>

      <div className="divide-y divide-border">
        {mockActions.map((action) => {
          const Icon = iconMap[action.type];
          return (
            <div
              key={action.id}
              className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-secondary/50"
            >
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${colorMap[action.type]}`}
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
                {action.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
