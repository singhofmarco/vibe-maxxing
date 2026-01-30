"use client";

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  Timestamp,
  type Firestore,
} from "firebase/firestore";
import type { ActionType, ActionStatus } from "@/lib/types";

/** Map conversation action type to Firestore ActionType */
export function toFirestoreActionType(
  type: "calendar" | "email" | "task" | "agenda"
): ActionType {
  if (type === "calendar" || type === "agenda") return "calendar_event";
  return type;
}

/** Parse time string like "2:00 PM" to Date (today at that time). */
export function parseTimeToDate(timeStr: string): Date {
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!match) return date;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export interface SaveActionInput {
  type: "calendar" | "email" | "task" | "agenda";
  title: string;
  description: string;
  status?: string;
}

export async function saveAction(
  db: Firestore,
  userId: string,
  input: SaveActionInput
): Promise<string> {
  const ref = collection(db, "actions");
  const status = (input.status ?? "pending") as ActionStatus;
  const docRef = await addDoc(ref, {
    sessionId: "voice",
    userId,
    type: toFirestoreActionType(input.type),
    title: input.title,
    description: input.description ?? "",
    payload: {},
    status:
      status === "scheduled" || status === "completed" ? status : "pending",
    timestamp: Timestamp.now(),
  });
  return docRef.id;
}

export interface SaveAgendaItemInput {
  time: string;
  title: string;
  type: "meeting" | "call" | "review" | "focus";
  duration: string;
}

export async function saveAgendaItem(
  db: Firestore,
  userId: string,
  input: SaveAgendaItemInput
): Promise<string> {
  const ref = collection(db, "agenda");
  const date = parseTimeToDate(input.time);
  const docRef = await addDoc(ref, {
    userId,
    time: input.time,
    title: input.title,
    type: input.type,
    duration: input.duration ?? "30 min",
    date: Timestamp.fromDate(date),
  });
  return docRef.id;
}

export async function updateActionStatus(
  db: Firestore,
  actionId: string,
  status: ActionStatus
): Promise<void> {
  const ref = doc(db, "actions", actionId);
  await updateDoc(ref, { status });
}

export async function deleteAction(
  db: Firestore,
  actionId: string
): Promise<void> {
  const ref = doc(db, "actions", actionId);
  await deleteDoc(ref);
}
