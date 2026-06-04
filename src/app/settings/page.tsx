"use client";

import { useState, useEffect } from "react";
import { Settings, Bell, Shield, Database, Palette, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useFetch } from "@/lib/hooks";

interface ToggleProps {
  settingKey: string;
  label: string;
  description: string;
  value: boolean;
  onToggle: (key: string, value: boolean) => void;
}

function Toggle({ settingKey, label, description, value, onToggle }: ToggleProps) {
  return (
    <div className="flex items-center justify-between rounded-lg p-3 hover:bg-white/[0.02] transition-colors">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        onClick={() => onToggle(settingKey, !value)}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          value ? "bg-gold" : "bg-white/10"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            value ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { data: settings, loading } = useFetch<Record<string, boolean>>("/api/settings");
  const [localSettings, setLocalSettings] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (settings) setLocalSettings(settings);
  }, [settings]);

  async function handleToggle(key: string, value: boolean) {
    // Optimistic update
    setLocalSettings((prev) => ({ ...prev, [key]: value }));

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${key.replace(/-/g, " ")} ${value ? "enabled" : "disabled"}`, {
          description: "Saved to ~/.ai-os-settings.json",
        });
      }
    } catch {
      // Revert on failure
      setLocalSettings((prev) => ({ ...prev, [key]: !value }));
      toast.error("Failed to save setting");
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-gold" />
          <span className="text-sm">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Settings className="h-5 w-5 text-gold" /> Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Persisted to <code className="text-gold/70 text-xs">~/.ai-os-settings.json</code>
        </p>
      </div>

      {/* Notifications */}
      <div className="glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Bell className="h-4 w-4 text-gold" /> Notifications
        </h3>
        <div className="space-y-1">
          <Toggle settingKey="slack-notifications" label="Slack Notifications" description="Send agent updates to Slack" value={localSettings["slack-notifications"] ?? true} onToggle={handleToggle} />
          <Toggle settingKey="email-digest" label="Email Digest" description="Daily summary email at 17:00 WITA" value={localSettings["email-digest"] ?? true} onToggle={handleToggle} />
          <Toggle settingKey="error-alerts" label="Error Alerts" description="Instant alerts on agent failures" value={localSettings["error-alerts"] ?? true} onToggle={handleToggle} />
          <Toggle settingKey="browser-notifications" label="Browser Notifications" description="Push notifications in browser" value={localSettings["browser-notifications"] ?? false} onToggle={handleToggle} />
        </div>
      </div>

      {/* Agents */}
      <div className="glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Shield className="h-4 w-4 text-gold" /> Agent Controls
        </h3>
        <div className="space-y-1">
          <Toggle settingKey="auto-recovery" label="Auto-Recovery" description="Automatically restart failed agents" value={localSettings["auto-recovery"] ?? true} onToggle={handleToggle} />
          <Toggle settingKey="rate-limiting" label="Rate Limiting" description="Enforce API call limits (HeyGen 1/day)" value={localSettings["rate-limiting"] ?? true} onToggle={handleToggle} />
          <Toggle settingKey="debug-mode" label="Debug Mode" description="Verbose logging for all agents" value={localSettings["debug-mode"] ?? false} onToggle={handleToggle} />
          <Toggle settingKey="dry-run-mode" label="Dry Run Mode" description="Simulate actions without executing" value={localSettings["dry-run-mode"] ?? false} onToggle={handleToggle} />
        </div>
      </div>

      {/* Data */}
      <div className="glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Database className="h-4 w-4 text-gold" /> Data & Storage
        </h3>
        <div className="space-y-1">
          <Toggle settingKey="log-retention" label="Log Retention" description="Keep agent logs for 30 days" value={localSettings["log-retention"] ?? true} onToggle={handleToggle} />
          <Toggle settingKey="auto-backup" label="Auto-Backup" description="Backup Second Brain daily" value={localSettings["auto-backup"] ?? true} onToggle={handleToggle} />
          <Toggle settingKey="analytics-tracking" label="Analytics Tracking" description="Track agent performance metrics" value={localSettings["analytics-tracking"] ?? true} onToggle={handleToggle} />
        </div>
      </div>

      {/* Appearance */}
      <div className="glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Palette className="h-4 w-4 text-gold" /> Appearance
        </h3>
        <div className="space-y-1">
          <Toggle settingKey="glassmorphism" label="Glassmorphism Effects" description="Frosted glass card backgrounds" value={localSettings["glassmorphism"] ?? true} onToggle={handleToggle} />
          <Toggle settingKey="animations" label="Animations" description="Smooth transitions and pulse effects" value={localSettings["animations"] ?? true} onToggle={handleToggle} />
          <Toggle settingKey="compact-mode" label="Compact Mode" description="Reduce padding and spacing" value={localSettings["compact-mode"] ?? false} onToggle={handleToggle} />
        </div>
      </div>
    </div>
  );
}
