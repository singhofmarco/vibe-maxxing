import { Timestamp } from "firebase/firestore";

export interface UserProfile {
  id: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  automationMode: "manual" | "automatic";
  createdAt: Timestamp;
}

export interface Session {
  id: string;
  userId: string;
  status: "active" | "completed";
  createdAt: Timestamp;
}

export type ActionType = "calendar_event" | "email" | "task";
export type ActionStatus = "scheduled" | "sent" | "pending" | "failed" | "completed";

export interface Action {
  id: string;
  sessionId: string;
  userId: string;
  type: ActionType;
  title: string;
  description: string;
  payload: Record<string, unknown>;
  status: ActionStatus;
  confidenceLevel?: number;
  timestamp: Timestamp;
}

export type AgendaType = "meeting" | "call" | "review" | "focus";

export interface AgendaItem {
  id: string;
  userId: string;
  time: string;
  title: string;
  type: AgendaType;
  duration: string;
  date: Timestamp;
}

