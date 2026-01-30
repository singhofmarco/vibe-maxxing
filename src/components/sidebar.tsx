"use client";

import { LayoutDashboard, Zap, Settings, Mic, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import Image from "next/image";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Actions", href: "/actions", icon: Zap },
  { name: "Settings", href: "/settings", icon: Settings },
];

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-card">
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Mic className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-semibold text-foreground">Vibe Maxxing</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          {user?.photoURL ? (
            <Image
              src={user.photoURL}
              alt={user.displayName || "User"}
              width={36}
              height={36}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-medium text-foreground">
              {getInitials(user?.displayName)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {user?.displayName || "Guest"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.email || "Not signed in"}
            </p>
          </div>
          <button
            onClick={logout}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
