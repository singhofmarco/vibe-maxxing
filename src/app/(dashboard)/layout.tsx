import { Sidebar } from "@/components/sidebar";
import { AuthGuard } from "@/components/auth-guard";
import { DashboardLayoutClient } from "./dashboard-layout-client";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="ml-64 min-h-screen p-8">
          <DashboardLayoutClient>{children}</DashboardLayoutClient>
        </main>
      </div>
    </AuthGuard>
  );
}
