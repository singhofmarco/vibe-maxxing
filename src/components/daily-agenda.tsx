"use client";

import { Clock, Video, Users, FileText, CalendarOff } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";
import { getFirebaseFirestore } from "@/lib/firebase";
import { useAuth } from "@/context/auth-context";
import type { AgendaItem, AgendaType } from "@/lib/types";

const iconMap: Record<AgendaType, typeof Clock> = {
  meeting: Users,
  call: Video,
  review: FileText,
  focus: Clock,
};

const colorMap: Record<AgendaType, string> = {
  meeting: "border-l-primary",
  call: "border-l-accent",
  review: "border-l-amber-500",
  focus: "border-l-violet-500",
};

export function DailyAgenda() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    async function fetchAgenda() {
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
        // Get start and end of today
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const startTimestamp = Timestamp.fromDate(startOfDay);
        const endTimestamp = Timestamp.fromDate(endOfDay);

        const agendaRef = collection(db, "agenda");
        const q = query(
          agendaRef,
          where("userId", "==", user.uid),
          where("date", ">=", startTimestamp),
          where("date", "<", endTimestamp),
          orderBy("date", "asc")
        );

        const snapshot = await getDocs(q);
        const items: AgendaItem[] = [];

        snapshot.forEach((doc) => {
          items.push({
            id: doc.id,
            ...doc.data(),
          } as AgendaItem);
        });

        // Sort by time string (assuming format like "9:00 AM")
        items.sort((a, b) => {
          const timeA = parseTimeToMinutes(a.time);
          const timeB = parseTimeToMinutes(b.time);
          return timeA - timeB;
        });

        setAgendaItems(items);
      } catch (error) {
        console.error("Error fetching agenda:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAgenda();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold text-foreground">Daily Agenda</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{dateStr}</p>
      </div>

      <div className="divide-y divide-border">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-l-2 border-l-muted px-5 py-3">
              <div className="h-4 w-16 animate-pulse rounded bg-muted" />
              <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
              <div className="h-4 flex-1 animate-pulse rounded bg-muted" />
            </div>
          ))
        ) : agendaItems.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
              <CalendarOff className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">No agenda items</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Your daily schedule will appear here
            </p>
          </div>
        ) : (
          // Agenda items
          agendaItems.map((item) => {
            const Icon = iconMap[item.type] || Clock;
            const borderColor = colorMap[item.type] || "border-l-muted";
            return (
              <div
                key={item.id}
                className={`flex items-center gap-4 border-l-2 px-5 py-3 transition-colors hover:bg-secondary/50 ${borderColor}`}
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
          })
        )}
      </div>
    </div>
  );
}

function parseTimeToMinutes(timeStr: string): number {
  // Parse time like "9:00 AM" or "2:30 PM"
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return 0;
  
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  
  return hours * 60 + minutes;
}
