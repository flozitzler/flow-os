"use client";

import { useState } from "react";
import {
  Zap,
  Video,
  Newspaper,
  RefreshCw,
  Terminal,
  BarChart3,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface ActionConfig {
  icon: typeof Zap;
  label: string;
  handler: () => Promise<void>;
}

export function QuickActions() {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function kickstartAgent(label: string, displayName: string) {
    const res = await fetch("/api/agents/control", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, action: "start" }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success(`${displayName} triggered`, { description: `launchctl kickstart ${label}` });
    } else {
      toast.error(`Failed to start ${displayName}`, { description: data.error });
    }
  }

  const actions: ActionConfig[] = [
    {
      icon: Newspaper,
      label: "Force Morning Brief",
      handler: async () => {
        await kickstartAgent("com.exventure.morningbrief", "Morning Brief");
      },
    },
    {
      icon: Zap,
      label: "Run News Scanner",
      handler: async () => {
        await kickstartAgent("com.flo.morningnews", "Morning News Agent");
      },
    },
    {
      icon: Video,
      label: "Run AI Empire",
      handler: async () => {
        await kickstartAgent("com.viral.llmempire", "AI Empire Pipeline");
      },
    },
    {
      icon: BarChart3,
      label: "Run Viral Analytics",
      handler: async () => {
        await kickstartAgent("com.viral.analytics", "Viral Analytics");
      },
    },
    {
      icon: RefreshCw,
      label: "Refresh Dashboard",
      handler: async () => {
        // Force refresh all API data by reloading
        window.location.reload();
      },
    },
    {
      icon: Terminal,
      label: "Open Project Dir",
      handler: async () => {
        // Open Finder to the viral channels dir
        try {
          await fetch("/api/agents/control", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ label: "finder", action: "open" }),
          });
        } catch {
          // fallback — at least inform the user
        }
        toast.info("Projects directory", {
          description: "~/projects/viral-channels/",
        });
      },
    },
  ];

  async function handleAction(action: ActionConfig) {
    setLoadingId(action.label);
    try {
      await action.handler();
    } catch (err) {
      toast.error("Action failed", { description: String(err) });
    }
    setLoadingId(null);
  }

  return (
    <div className="glass rounded-xl p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => {
          const isLoading = loadingId === action.label;
          return (
            <button
              key={action.label}
              onClick={() => handleAction(action)}
              disabled={isLoading}
              className="group flex items-center gap-2.5 rounded-lg border border-border bg-white/[0.02] p-3 text-left transition-all duration-200 hover:border-gold/20 hover:bg-white/[0.05] active:scale-[0.97] disabled:opacity-60"
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-opacity group-hover:opacity-100"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(196,162,90,0.15), rgba(196,162,90,0.05))",
                }}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 text-gold animate-spin" />
                ) : (
                  <action.icon className="h-4 w-4 text-gold" />
                )}
              </div>
              <span className="text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
