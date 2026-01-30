import { Sidebar } from "@/components/sidebar";
import { AuthGuard } from "@/components/auth-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="ml-64 min-h-screen p-8">{children}</main>
      </div>
    </AuthGuard>
  );
}
