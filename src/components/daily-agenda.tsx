"use client";

import { Clock, Video, Users, FileText } from "lucide-react";

interface AgendaItem {
  id: string;
  time: string;
  title: string;
  type: "meeting" | "call" | "review" | "focus";
  duration: string;
}

const agendaItems: AgendaItem[] = [
  {
    id: "1",
    time: "9:00 AM",
    title: "Daily Standup",
    type: "call",
    duration: "15 min",
  },
  {
    id: "2",
    time: "10:30 AM",
    title: "Client Presentation",
    type: "meeting",
    duration: "1 hr",
  },
  {
    id: "3",
    time: "1:00 PM",
    title: "Lunch & Deep Work",
    type: "focus",
    duration: "2 hrs",
  },
  {
    id: "4",
    time: "3:00 PM",
    title: "Q4 Report Review",
    type: "review",
    duration: "45 min",
  },
  {
    id: "5",
    time: "4:30 PM",
    title: "Team Retrospective",
    type: "meeting",
    duration: "30 min",
  },
];

const iconMap = {
  meeting: Users,
  call: Video,
  review: FileText,
  focus: Clock,
};

const colorMap = {
  meeting: "border-l-primary",
  call: "border-l-accent",
  review: "border-l-amber-500",
  focus: "border-l-violet-500",
};

export function DailyAgenda() {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold text-foreground">Daily Agenda</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{dateStr}</p>
      </div>

      <div className="divide-y divide-border">
        {agendaItems.map((item) => {
          const Icon = iconMap[item.type];
          return (
            <div
              key={item.id}
              className={`flex items-center gap-4 border-l-2 px-5 py-3 transition-colors hover:bg-secondary/50 ${colorMap[item.type]}`}
            >
              <div className="w-16 flex-shrink-0">
                <p className="text-sm font-medium text-foreground">{item.time}</p>
              </div>

              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {item.title}
                </p>
              </div>

              <span className="flex-shrink-0 text-xs text-muted-foreground">
                {item.duration}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
