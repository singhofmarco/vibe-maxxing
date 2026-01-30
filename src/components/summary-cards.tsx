"use client";

import { Calendar, Mail, CheckSquare, Mic } from "lucide-react";

const summaryData = [
  {
    label: "Sessions Today",
    value: "4",
    change: "+2 from yesterday",
    icon: Mic,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    label: "Emails Sent",
    value: "7",
    change: "3 pending review",
    icon: Mail,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    label: "Events Created",
    value: "3",
    change: "2 for tomorrow",
    icon: Calendar,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
  },
  {
    label: "Tasks Generated",
    value: "12",
    change: "5 completed",
    icon: CheckSquare,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
];

export function SummaryCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {summaryData.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-border bg-card p-5 transition-colors hover:bg-secondary/50"
        >
          <div className="flex items-center justify-between">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.bgColor}`}
            >
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </div>
            <span className="text-2xl font-semibold text-foreground">
              {item.value}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-foreground">{item.label}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{item.change}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
