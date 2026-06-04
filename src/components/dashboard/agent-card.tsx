"use client";

import { useState } from "react";
import {
  Newspaper,
  Zap,
  Mail,
  Video,
  Flame,
  Camera,
  MessageCircle,
  BarChart3,
  Briefcase,
  Play,
  Pause,
  RotateCcw,
  Loader2,
  Globe,
  Shield,
  Volume2,
  Film,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { AgentStatus } from "@/lib/data";

const iconMap: Record<string, LucideIcon> = {
  Newspaper,
  Zap,
  Mail,
  Video,
  Flame,
  Camera,
  MessageCircle,
  BarChart3,
  Briefcase,
  Globe,
  Shield,
  Volume2,
  Film,
};

const statusConfig: Record<AgentStatus, { color: string; bg: string; label: string }> = {
  running: { color: "text-success", bg: "bg-success", label: "Running" },
  idle: { color: "text-muted-foreground", bg: "bg-muted-foreground", label: "Idle" },
  error: { color: "text-destructive", bg: "bg-destructive", label: "Error" },
  scheduled: { color: "text-info", bg: "bg-info", label: "Scheduled" },
};

interface AgentProps {
  id: string;
  name: string;
  label?: string;
  description: string;
  status: AgentStatus;
  pid?: number | null;
  exitCode?: number | null;
  lastRun: string;
  nextRun: string | null;
  schedule: string;
  successRate: number;
  category: string;
  icon: string;
  script?: string;
  logFile?: string | null;
  lastLog?: string[];
}

export function AgentCard({ agent }: { agent: AgentProps }) {
  const [currentStatus, setCurrentStatus] = useState<AgentStatus>(agent.status);
  const [loading, setLoading] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  const Icon = iconMap[agent.icon] || Zap;
  const status = statusConfig[currentStatus];

  async function handleRunPause() {
    const label = agent.label || agent.id;
    const action = currentStatus === "running" ? "stop" : "start";

    setLoading(true);
    try {
      const res = await fetch("/api/agents/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, action }),
      });
      const data = await res.json();

      if (data.success) {
        const newStatus = action === "start" ? "running" : "idle";
        setCurrentStatus(newStatus);
        toast.success(`${agent.name} — ${action === "start" ? "started" : "stopped"}`, {
          description: data.action === "already_running"
            ? "Agent was already running"
            : data.action === "already_stopped"
              ? "Agent was already stopped"
              : `launchctl ${action === "start" ? "kickstart" : "kill"} executed`,
        });
      } else {
        toast.error(`Failed to ${action} ${agent.name}`, {
          description: data.error || "Unknown error",
        });
      }
    } catch (err) {
      toast.error(`Failed to ${action} ${agent.name}`, {
        description: String(err),
      });
    }
    setLoading(false);
  }

  const realLogs = agent.lastLog && agent.lastLog.length > 0;

  return (
    <div className="glass group rounded-xl p-5 transition-all duration-300 hover:border-gold/20 hover:shadow-[0_0_30px_rgba(196,162,90,0.08)]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 text-gold">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{agent.name}</h3>
            <p className="text-xs text-muted-foreground">{agent.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {agent.pid && agent.pid > 0 && (
            <span className="text-[10px] font-mono text-muted-foreground mr-1">PID {agent.pid}</span>
          )}
          <div
            className={cn(
              "h-2 w-2 rounded-full",
              status.bg,
              currentStatus === "running" && "animate-pulse-live"
            )}
          />
          <span className={cn("text-xs font-medium", status.color)}>{status.label}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Last Activity</p>
          <p className="text-xs font-medium text-foreground">{agent.lastRun}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Schedule</p>
          <p className="text-xs font-medium text-foreground">{agent.schedule}</p>
        </div>
      </div>

      {/* Script path */}
      {agent.script && (
        <div className="mt-2">
          <p className="text-[10px] font-mono text-muted-foreground truncate" title={agent.script}>
            {agent.script}
          </p>
        </div>
      )}

      {/* Exit code warning */}
      {agent.exitCode !== undefined && agent.exitCode !== null && agent.exitCode !== 0 && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-destructive">
          <span className="font-mono">exit {agent.exitCode}</span>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={handleRunPause}
          disabled={loading}
          className={cn(
            "flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-medium transition-colors disabled:opacity-50",
            currentStatus === "running"
              ? "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
              : "bg-gold/10 text-gold hover:bg-gold/20"
          )}
        >
          {loading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : currentStatus === "running" ? (
            <Pause className="h-3 w-3" />
          ) : (
            <Play className="h-3 w-3" />
          )}
          {currentStatus === "running" ? "Stop" : "Run Now"}
        </button>
        <button
          onClick={() => setShowLogs(!showLogs)}
          className={cn(
            "flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-medium transition-colors",
            showLogs
              ? "bg-gold/10 text-gold"
              : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
          )}
        >
          <RotateCcw className="h-3 w-3" /> Logs {realLogs && <span className="text-[9px] text-gold">LIVE</span>}
        </button>
      </div>

      {/* Real Logs Panel */}
      {showLogs && (
        <div className="mt-3 rounded-lg bg-black/30 p-3 font-mono text-[11px] text-muted-foreground space-y-0.5 border border-border max-h-40 overflow-y-auto">
          {realLogs ? (
            agent.lastLog!.map((line, i) => (
              <p
                key={i}
                className={cn(
                  line.toLowerCase().includes("error") && "text-destructive",
                  line.toLowerCase().includes("uploaded") && "text-success",
                  line.toLowerCase().includes("done") && "text-gold",
                  line.toLowerCase().includes("complete") && "text-gold",
                )}
              >
                {line}
              </p>
            ))
          ) : (
            <p className="text-muted-foreground/50">
              {agent.logFile ? `No recent output in ${agent.logFile}` : "No log file configured"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
