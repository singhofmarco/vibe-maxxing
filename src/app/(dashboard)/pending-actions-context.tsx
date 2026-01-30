"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { ActionItem } from "@/app/actions";

interface PendingActionsContextValue {
  pendingActions: ActionItem[];
  setPendingActions: (actions: ActionItem[]) => void;
}

const PendingActionsContext = createContext<PendingActionsContextValue | null>(
  null
);

export function usePendingActions(): PendingActionsContextValue {
  const ctx = useContext(PendingActionsContext);
  if (!ctx) {
    throw new Error("usePendingActions must be used within PendingActionsProvider");
  }
  return ctx;
}

export function PendingActionsProvider({ children }: { children: ReactNode }) {
  const [pendingActions, setPendingActions] = useState<ActionItem[]>([]);
  return (
    <PendingActionsContext.Provider
      value={{ pendingActions, setPendingActions }}
    >
      {children}
    </PendingActionsContext.Provider>
  );
}
