"use client";

import { useFetch } from "@/lib/hooks";
import { useState } from "react";
import { Camera, MessageCircle, Briefcase, Loader2, ExternalLink, Film } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AgentData {
  agents: Array<{
    id: string;
    name: string;
    label: string;
    status: string;
    lastRun: string;
    schedule: string;
    category: string;
    lastLog: string[];
  }>;
}

interface PipelineData {
  channels: Array<{
    id: string; name: string; platform: string;
    uploadedCount: number; avgDuration: number;
    recentVideos: Array<{ date: string; title: string; duration: number; uploaded: boolean; url: string }>;
  }>;
}

const platformConfig = [
  {
    name: "Instagram (@aibyflo)",
    icon: Camera,
    agentIds: ["com.aibyflo.comment-monitor", "com.aibyflo.daily-content", "com.aibyflo.auto-carousel", "com.aibyflo.newsletter", "com.aibyflo.telegram-bot", "com.aibyflo.research-agents", "com.aibyflo.welcome-sequence"],
    triggerAgent: "com.aibyflo.daily-content",
  },
  {
    name: "X (@wizard_flo)",
    icon: MessageCircle,
    agentIds: ["com.franz.x-daily-post", "com.franz.x-weekly-blog"],
    triggerAgent: "com.franz.x-daily-post",
  },
  {
    name: "YouTube (Viral Channels)",
    icon: Film,
    agentIds: ["com.viral.llmempire", "com.viral.ruleofwealth", "com.viral.glowup", "com.viral.pawdrama"],
    triggerAgent: "com.viral.llmempire",
  },
  {
    name: "Discord",
    icon: MessageCircle,
    agentIds: ["com.viral.discord-bot", "com.viral.discord-news"],
    triggerAgent: "com.viral.discord-bot",
  },
];

export default function SocialPage() {
  const { data: agentData, loading: aLoading } = useFetch<AgentData>("/api/agents", 15000);
  const { data: pipeData, loading: pLoading } = useFetch<PipelineData>("/api/pipelines", 60000);
  const [triggering, setTriggering] = useState<string | null>(null);

  if (aLoading || pLoading || !agentData) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-gold" />
          <span className="text-sm">Loading social data...</span>
        </div>
      </div>
    );
  }

  async function triggerAgent(label: string, displayName: string) {
    setTriggering(label);
    try {
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
    } catch (err) {
      toast.error("Failed", { description: String(err) });
    }
    setTriggering(null);
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Social Command Center</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Live agent status for all social platforms
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {platformConfig.map((platform) => {
          const agents = agentData.agents.filter((a) => platform.agentIds.includes(a.id));
          const runningCount = agents.filter((a) => a.status === "running").length;
          const errorCount = agents.filter((a) => a.status === "error").length;
          const channel = pipeData?.channels.find((c) =>
            platform.agentIds.some((id) => id.includes(c.id))
          );

          return (
            <div key={platform.name} className="glass rounded-xl p-5 space-y-4">
              {/* Platform Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 text-gold">
                    <platform.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{platform.name}</h3>
                    <p className="text-xs text-muted-foreground">{agents.length} agents configured</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={cn(
                    "h-2 w-2 rounded-full",
                    runningCount > 0 ? "bg-success animate-pulse-live" : errorCount > 0 ? "bg-destructive" : "bg-muted-foreground"
                  )} />
                  <span className={cn("text-xs font-medium",
                    runningCount > 0 ? "text-success" : errorCount > 0 ? "text-destructive" : "text-muted-foreground"
                  )}>
                    {runningCount > 0 ? `${runningCount} running` : errorCount > 0 ? `${errorCount} errors` : "Idle"}
                  </span>
                </div>
              </div>

              {/* Agent List */}
              <div className="space-y-1.5">
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        agent.status === "running" ? "bg-success" : agent.status === "error" ? "bg-destructive" : "bg-muted-foreground"
                      )} />
                      <span className="text-xs text-foreground">{agent.name}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{agent.schedule}</span>
                  </div>
                ))}
              </div>

              {/* Channel stats if YouTube */}
              {channel && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Videos</p>
                    <p className="text-sm font-semibold text-foreground">{channel.uploadedCount}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Avg Duration</p>
                    <p className="text-sm font-semibold text-foreground">{channel.avgDuration}s</p>
                  </div>
                </div>
              )}

              {/* Recent videos */}
              {channel && channel.recentVideos.length > 0 && (
                <div className="space-y-1">
                  {channel.recentVideos.slice(0, 3).map((v, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", v.uploaded ? "bg-success" : "bg-warning")} />
                      <span className="text-foreground/80 truncate flex-1">{v.title}</span>
                      {v.url && (
                        <a href={v.url} target="_blank" rel="noopener noreferrer" className="text-gold/60 hover:text-gold shrink-0">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Trigger Button */}
              <button
                onClick={() => triggerAgent(platform.triggerAgent, platform.name)}
                disabled={triggering === platform.triggerAgent}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold/10 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold/20 active:scale-[0.98] disabled:opacity-50"
              >
                {triggering === platform.triggerAgent ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                {triggering === platform.triggerAgent ? "Triggering..." : "Trigger Now"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
