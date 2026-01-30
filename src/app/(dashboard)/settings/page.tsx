"use client";

import { useState } from "react";
import {
  Bell,
  Volume2,
  Zap,
  Shield,
  Link,
  ChevronRight,
  Check,
} from "lucide-react";

interface SettingToggle {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export default function SettingsPage() {
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [notifications, setNotifications] = useState<SettingToggle[]>([
    {
      id: "email-confirm",
      label: "Email Confirmations",
      description: "Get notified before emails are sent",
      enabled: true,
    },
    {
      id: "calendar-confirm",
      label: "Calendar Confirmations",
      description: "Get notified before events are created",
      enabled: true,
    },
    {
      id: "daily-summary",
      label: "Daily Summary",
      description: "Receive a morning briefing",
      enabled: false,
    },
  ]);

  const [automations, setAutomations] = useState<SettingToggle[]>([
    {
      id: "auto-email",
      label: "Auto-send Emails",
      description: "Automatically send approved email drafts",
      enabled: false,
    },
    {
      id: "auto-calendar",
      label: "Auto-schedule Events",
      description: "Automatically create calendar events",
      enabled: true,
    },
    {
      id: "smart-suggest",
      label: "Smart Suggestions",
      description: "AI-powered task recommendations",
      enabled: true,
    },
  ]);

  const toggleNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n))
    );
  };

  const toggleAutomation = (id: string) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  const connectedServices = [
    { name: "Google Calendar", status: "connected" },
    { name: "Gmail", status: "connected" },
    { name: "Slack", status: "not connected" },
    { name: "Notion", status: "not connected" },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure your assistant preferences
        </p>
      </div>

      {/* Voice Settings */}
      <section className="rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border px-6 py-4">
          <Volume2 className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground">Voice Settings</h2>
        </div>
        <div className="p-6">
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Playback Speed
              </label>
              <span className="text-sm text-muted-foreground">{voiceSpeed}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={voiceSpeed}
              onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
              className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
            />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>0.5x</span>
              <span>1.0x</span>
              <span>1.5x</span>
              <span>2.0x</span>
            </div>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border px-6 py-4">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground">Notifications</h2>
        </div>
        <div className="divide-y divide-border">
          {notifications.map((setting) => (
            <div
              key={setting.id}
              className="flex items-center justify-between px-6 py-4"
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  {setting.label}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {setting.description}
                </p>
              </div>
              <button
                onClick={() => toggleNotification(setting.id)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  setting.enabled ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    setting.enabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Automation */}
      <section className="rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border px-6 py-4">
          <Zap className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground">Automation</h2>
        </div>
        <div className="divide-y divide-border">
          {automations.map((setting) => (
            <div
              key={setting.id}
              className="flex items-center justify-between px-6 py-4"
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  {setting.label}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {setting.description}
                </p>
              </div>
              <button
                onClick={() => toggleAutomation(setting.id)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  setting.enabled ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    setting.enabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Connected Services */}
      <section className="rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border px-6 py-4">
          <Link className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground">
            Connected Services
          </h2>
        </div>
        <div className="divide-y divide-border">
          {connectedServices.map((service) => (
            <div
              key={service.name}
              className="flex items-center justify-between px-6 py-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {service.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {service.status === "connected" ? "Connected" : "Not connected"}
                  </p>
                </div>
              </div>
              {service.status === "connected" ? (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20">
                  <Check className="h-4 w-4 text-accent" />
                </div>
              ) : (
                <button className="flex items-center gap-1 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
                  Connect
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Privacy */}
      <section className="rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border px-6 py-4">
          <Shield className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground">Privacy</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your voice recordings are processed securely and deleted after
            transcription. We never share your data with third parties. All actions
            require your explicit approval unless auto-mode is enabled.
          </p>
          <button className="mt-4 text-sm font-medium text-primary hover:underline">
            View Privacy Policy
          </button>
        </div>
      </section>
    </div>
  );
}
