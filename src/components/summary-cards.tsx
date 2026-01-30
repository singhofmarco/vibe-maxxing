"use client";

import { Calendar, Mail, CheckSquare, Mic, LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { getFirebaseFirestore } from "@/lib/firebase";
import { useAuth } from "@/context/auth-context";
import type { Action } from "@/lib/types";

interface SummaryItem {
  label: string;
  value: number;
  change: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

export function SummaryCards() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    sessions: 0,
    emails: 0,
    events: 0,
    tasks: 0,
    pendingEmails: 0,
    completedTasks: 0,
  });

  useEffect(() => {
    async function fetchCounts() {
      if (!user) {
        setLoading(false);
        return;
      }

      const db = getFirebaseFirestore();
      if (!db) {
        setLoading(false);
        return;
      }

      try {
        // Get start of today
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startTimestamp = Timestamp.fromDate(startOfDay);

        // Query actions for today
        const actionsRef = collection(db, "actions");
        const q = query(
          actionsRef,
          where("userId", "==", user.uid),
          where("timestamp", ">=", startTimestamp)
        );

        const snapshot = await getDocs(q);
        
        let sessions = 0;
        let emails = 0;
        let events = 0;
        let tasks = 0;
        let pendingEmails = 0;
        let completedTasks = 0;

        snapshot.forEach((doc) => {
          const action = doc.data() as Action;
          switch (action.type) {
            case "email":
              emails++;
              if (action.status === "pending") pendingEmails++;
              break;
            case "calendar_event":
              events++;
              break;
            case "task":
              tasks++;
              if (action.status === "completed") completedTasks++;
              break;
          }
        });

        // Count sessions separately
        const sessionsRef = collection(db, "sessions");
        const sessionsQuery = query(
          sessionsRef,
          where("userId", "==", user.uid),
          where("createdAt", ">=", startTimestamp)
        );
        const sessionsSnapshot = await getDocs(sessionsQuery);
        sessions = sessionsSnapshot.size;

        setCounts({
          sessions,
          emails,
          events,
          tasks,
          pendingEmails,
          completedTasks,
        });
      } catch (error) {
        console.error("Error fetching summary counts:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCounts();
  }, [user]);

  const summaryData: SummaryItem[] = [
    {
      label: "Sessions Today",
      value: counts.sessions,
      change: counts.sessions === 0 ? "No sessions yet" : `${counts.sessions} session${counts.sessions !== 1 ? "s" : ""} today`,
      icon: Mic,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Emails Sent",
      value: counts.emails,
      change: counts.pendingEmails > 0 ? `${counts.pendingEmails} pending review` : "All sent",
      icon: Mail,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Events Created",
      value: counts.events,
      change: counts.events === 0 ? "No events yet" : `${counts.events} event${counts.events !== 1 ? "s" : ""} created`,
      icon: Calendar,
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
    },
    {
      label: "Tasks Generated",
      value: counts.tasks,
      change: counts.completedTasks > 0 ? `${counts.completedTasks} completed` : "None completed yet",
      icon: CheckSquare,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
  ];

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
            {loading ? (
              <div className="h-8 w-8 animate-pulse rounded bg-muted" />
            ) : (
              <span className="text-2xl font-semibold text-foreground">
                {item.value}
              </span>
            )}
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-foreground">{item.label}</p>
            {loading ? (
              <div className="mt-1 h-3 w-24 animate-pulse rounded bg-muted" />
            ) : (
              <p className="mt-0.5 text-xs text-muted-foreground">{item.change}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
