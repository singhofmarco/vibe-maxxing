"use client";

import { useRouter, usePathname } from "next/navigation";
import { ThoughtInput } from "@/components/thought-input";
import { PendingActionsProvider, usePendingActions } from "./pending-actions-context";
import type { ActionItem } from "@/app/actions";
import { useCallback } from "react";

function ThoughtInputWithNavigate() {
  const router = useRouter();
  const pathname = usePathname();
  const { setPendingActions } = usePendingActions();

  const handleActionsExtracted = useCallback(
    (actions: ActionItem[]) => {
      setPendingActions(actions);
      if (pathname !== "/actions") {
        router.push("/actions");
      }
    },
    [pathname, router, setPendingActions]
  );

  return <ThoughtInput onActionsExtracted={handleActionsExtracted} />;
}

export function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showThoughtInput = pathname !== "/settings";

  return (
    <PendingActionsProvider>
      {showThoughtInput && (
        <div className="mb-6">
          <ThoughtInputWithNavigate />
        </div>
      )}
      {children}
    </PendingActionsProvider>
  );
}
